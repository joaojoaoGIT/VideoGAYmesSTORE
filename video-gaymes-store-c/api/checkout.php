<?php
/* Finaliza o pedido NO SERVIDOR: confere preços/estoque no banco, aplica o cupom, cobra no cartão (simulado)
   e grava pedidos, pedido_itens, pagamentos, pedido_cupons e o contador de usos do cupom — tudo em uma transação.
   O CVV nunca chega aqui. */
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/loja_lib.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método não permitido.', 405);
$me = exigeLogin(); $uid = (int)$me['id']; $db = pdo(); $b = body();
garantirTabelaCartoes($db);   // antes da transação (ALTER TABLE encerra transações)

try {
    $db->beginTransaction();

    // 1) itens (preço e estoque vêm do banco, nunca do navegador)
    $carrinho = carregarItens($db, is_array($b['itens'] ?? null) ? $b['itens'] : [], true);
    $subtotal = $carrinho['subtotal'];
    $frete = calcularFrete($subtotal);

    // 2) endereço de entrega (precisa ser do próprio cliente)
    $st = $db->prepare('SELECT * FROM enderecos WHERE id = ? AND usuario_id = ?');
    $st->execute([(int)($b['endereco_id'] ?? 0), $uid]);
    $end = $st->fetch();
    if (!$end) { $db->rollBack(); fail('Escolha ou cadastre um endereço de entrega.', 422); }

    // 3) cupom (opcional)
    $desconto = 0.0; $cupom = null;
    $codigoCupom = trim((string)($b['cupom'] ?? ''));
    if ($codigoCupom !== '') {
        try { $r = calcularCupom($db, $codigoCupom, $subtotal, $frete, true); }
        catch (RuntimeException $e) { $db->rollBack(); fail($e->getMessage(), 422); }
        $cupom = $r['cupom']; $desconto = $r['desconto'] + $r['frete_desconto'];
        $frete = max(0.0, $frete - $r['frete_desconto']);
        $descontoItens = $r['desconto'];
    } else { $descontoItens = 0.0; }
    $total = dinheiro($subtotal - $descontoItens + $frete);
    if ($total < 0) $total = 0.0;

    // 4) cartão: salvo (do próprio cliente, dentro da validade) OU novo (opcionalmente salvo)
    if (!empty($b['cartao_id'])) {
        $st = $db->prepare('SELECT * FROM cartoes WHERE id = ? AND usuario_id = ?');
        $st->execute([(int)$b['cartao_id'], $uid]);
        $cartao = $st->fetch();
        if (!$cartao) { $db->rollBack(); fail('Cartão não encontrado.', 422); }
        if (cartaoVencido((string)$cartao['validade'])) { $db->rollBack(); fail('Este cartão está vencido. Escolha outro ou cadastre um novo.', 422); }
        $bandeira = $cartao['bandeira']; $final = $cartao['ultimos_digitos'];
    } elseif (is_array($b['novo_cartao'] ?? null)) {
        $c = validarCartaoNovo($b['novo_cartao']);   // fail() dentro daqui: a transação é desfeita no fim do script
        if (!empty($b['novo_cartao']['salvar'])) guardarCartao($db, $uid, $c);
        $bandeira = $c['bandeira']; $final = $c['ultimos_digitos'];
    } else { $db->rollBack(); fail('Escolha um cartão para pagar.', 422); }

    // 5) pedido
    $codigo = 'VG-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 4));
    $db->prepare('INSERT INTO pedidos (usuario_id, endereco_id, codigo, endereco_entrega, subtotal, frete, desconto, total, status) VALUES (?,?,?,?,?,?,?,?,?)')
       ->execute([$uid, (int)$end['id'], $codigo, enderecoTexto($end), $subtotal, $frete, $desconto, $total, 'pago']);
    $pid = (int)$db->lastInsertId();

    // 6) itens + baixa de estoque (a condição estoque >= qtd impede venda acima do estoque)
    $ins = $db->prepare('INSERT INTO pedido_itens (pedido_id, produto_id, nome_produto, quantidade, preco_unitario) VALUES (?,?,?,?,?)');
    $baixa = $db->prepare('UPDATE produtos SET estoque = estoque - ? WHERE id = ? AND estoque >= ?');
    foreach ($carrinho['itens'] as $i) {
        $ins->execute([$pid, $i['id'], $i['nome'], $i['qtd'], $i['preco']]);
        $baixa->execute([$i['qtd'], $i['id'], $i['qtd']]);
        if (!$baixa->rowCount()) throw new RuntimeException('Estoque insuficiente para ' . $i['nome'] . '.');
    }

    // 7) pagamento com o valor JÁ com desconto
    $db->prepare('INSERT INTO pagamentos (pedido_id, metodo, status, valor, transacao_id, bandeira, ultimos_digitos, parcelas) VALUES (?,?,?,?,?,?,?,1)')
       ->execute([$pid, 'cartao', 'aprovado', $total, 'DEMO-' . substr($codigo, -4), $bandeira, $final]);

    // 8) cupom: vínculo com o pedido + contador de usos (a condição protege o limite de usos)
    if ($cupom) {
        $db->prepare('INSERT INTO pedido_cupons (pedido_id, cupom_id, desconto_aplicado) VALUES (?,?,?)')->execute([$pid, (int)$cupom['id'], $desconto]);
        $up = $db->prepare('UPDATE cupons SET usos_atuais = usos_atuais + 1 WHERE id = ? AND (usos_maximos IS NULL OR usos_maximos = 0 OR usos_atuais < usos_maximos)');
        $up->execute([(int)$cupom['id']]);
        if (!$up->rowCount()) throw new RuntimeException('Este cupom atingiu o limite de usos.');
    }

    $db->commit();
    out(['ok' => true, 'pedido' => ['id' => $pid, 'codigo' => $codigo, 'subtotal' => $subtotal, 'desconto' => $desconto, 'frete' => $frete, 'total' => $total]]);
} catch (Throwable $e) {
    if ($db->inTransaction()) $db->rollBack();
    fail($e instanceof PDOException ? 'Não foi possível concluir o pedido: ' . $e->getMessage() : $e->getMessage(), 500);
}

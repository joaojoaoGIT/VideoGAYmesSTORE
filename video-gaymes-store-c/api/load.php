<?php
require __DIR__ . '/bootstrap.php';
$db = pdo();
$me = usuarioSessao();
$admin = $me && $me['tipo'] === 'admin';
$uid = $me ? (int)$me['id'] : 0;

// O que cada visitante pode enxergar: admin vê tudo; cliente vê o catálogo e só os próprios dados.
// cupons NÃO são públicos (senão qualquer um listaria os códigos); o cliente valida cupom por api/cupom.php
$publicas = ['categorias', 'plataformas', 'produtos', 'avaliacoes'];
$proprias = [ // tabela => condição SQL (sempre filtrada pelo usuário logado)
    'enderecos'      => 'usuario_id = :u',
    'carrinhos'      => 'usuario_id = :u',
    'cartoes'        => 'usuario_id = :u',
    'lista_desejos'  => 'usuario_id = :u',
    'pedidos'        => 'usuario_id = :u',
    'carrinho_itens' => 'carrinho_id IN (SELECT id FROM carrinhos WHERE usuario_id = :u)',
    'pedido_itens'   => 'pedido_id IN (SELECT id FROM pedidos WHERE usuario_id = :u)',
    'pagamentos'     => 'pedido_id IN (SELECT id FROM pedidos WHERE usuario_id = :u)',
    'pedido_cupons'  => 'pedido_id IN (SELECT id FROM pedidos WHERE usuario_id = :u)',
];
$adultoOk = maior18();

function converter(array $rows, string $t): array {
    $meta = colunas($t);
    foreach ($rows as &$r) {
        foreach ($r as $k => $v) {
            $tipo = strtolower($meta[$k]['Type'] ?? '');
            if ($v === null) { if (preg_match('/char|text|enum|date|timestamp/', $tipo)) $r[$k] = ''; continue; }
            if (preg_match('/^(tinyint|smallint|int|bigint)/', $tipo)) $r[$k] = (int)$v;
            elseif (preg_match('/^(decimal|float|double)/', $tipo)) $r[$k] = (float)$v;
            elseif (str_starts_with($tipo, 'timestamp') || str_starts_with($tipo, 'datetime')) $r[$k] = substr((string)$v, 0, 10);
            elseif (str_starts_with($tipo, 'json')) $r[$k] = json_decode((string)$v, true);
        }
    }
    unset($r);
    return $rows;
}

$dados = [];
foreach (array_keys(TABELAS) as $t) {
    if ($t === 'usuarios') {
        if ($admin) $rows = $db->query('SELECT id, nome, email, cpf, telefone, data_nascimento, tipo, ativo FROM usuarios')->fetchAll();
        else { // clientes só precisam do nome dos outros (para exibir avaliações)
            $rows = $db->query("SELECT id, nome, '' AS email, 'cliente' AS tipo, ativo FROM usuarios WHERE tipo = 'cliente'")->fetchAll();
            if ($me) foreach ($rows as &$r) if ((int)$r['id'] === $uid) $r['email'] = $me['email'];
            unset($r);
        }
        $dados[$t] = converter($rows, $t);
        continue;
    }
    if ($t === 'produtos' && !$admin) { // jogos +18 só saem do servidor depois da confirmação de idade
        $rows = $db->query('SELECT * FROM produtos' . ($adultoOk ? '' : ' WHERE adulto = 0'))->fetchAll();
    }
    elseif ($t === 'pedido_cupons' && !$admin && $uid) { // traz o código do cupom para exibir no pedido
        $st = $db->prepare('SELECT pc.*, c.codigo FROM pedido_cupons pc JOIN cupons c ON c.id = pc.cupom_id WHERE pc.pedido_id IN (SELECT id FROM pedidos WHERE usuario_id = :u)');
        $st->execute([':u' => $uid]); $rows = $st->fetchAll();
    }
    elseif ($admin || in_array($t, $publicas, true)) $rows = $db->query("SELECT * FROM `$t`")->fetchAll();
    elseif ($uid && isset($proprias[$t])) { $st = $db->prepare("SELECT * FROM `$t` WHERE {$proprias[$t]}"); $st->execute([':u' => $uid]); $rows = $st->fetchAll(); }
    else $rows = [];
    $dados[$t] = converter($rows, $t);
}
$next = [];
foreach ($db->query("SELECT TABLE_NAME AS t, AUTO_INCREMENT AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()") as $r) $next[$r['t']] = (int)($r['n'] ?? 1);
$dados['_next'] = $next;
$dados['_usuario_id'] = $me ? $uid : null;
$dados['_adulto_ok'] = $adultoOk;
out($dados);

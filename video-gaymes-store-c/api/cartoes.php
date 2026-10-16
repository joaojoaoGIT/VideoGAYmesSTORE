<?php
/* Cartões do cliente logado. Guarda SÓ: apelido, titular, bandeira, 4 últimos dígitos e validade (AAAA-MM).
   O número completo e o CVV chegam aqui (no máximo o número) apenas para validar e são descartados. */
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/loja_lib.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método não permitido.', 405);
$me = exigeLogin(); $uid = (int)$me['id']; $db = pdo();
$b = body(); $acao = (string)($b['acao'] ?? '');
garantirTabelaCartoes($db);   // corrige bancos de versões antigas (senão o INSERT falha e o cartão não salva)

try {
    if ($acao === 'salvar') {
        $c = validarCartaoNovo($b);
        $id = guardarCartao($db, $uid, $c);
        out(['ok' => true, 'id' => $id, 'cartoes' => cartoesDoUsuario($db, $uid)]);
    }
    if ($acao === 'excluir') {
        $id = (int)($b['id'] ?? 0);
        $st = $db->prepare('DELETE FROM cartoes WHERE id = ? AND usuario_id = ?'); $st->execute([$id, $uid]);
        if (!$st->rowCount()) fail('Cartão não encontrado.', 404);
        out(['ok' => true, 'cartoes' => cartoesDoUsuario($db, $uid)]);
    }
} catch (PDOException $e) {
    fail('Não foi possível gravar o cartão no banco: ' . $e->getMessage() . ' — se persistir, abra install.php?recriar=1.', 500);
}
fail('Ação desconhecida.');

<?php
/* CRUD dos endereços do cliente logado (tabela `enderecos`). Tudo com prepared statements. */
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/loja_lib.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método não permitido.', 405);
$me = exigeLogin(); $uid = (int)$me['id']; $db = pdo();
$b = body(); $acao = (string)($b['acao'] ?? '');

try {
    if ($acao === 'salvar') {
        $e = validarEndereco($b);
        $id = (int)($b['id'] ?? 0);
        $db->beginTransaction();
        $total = $db->prepare('SELECT COUNT(*) FROM enderecos WHERE usuario_id = ?'); $total->execute([$uid]);
        $principal = !empty($b['principal']) || (int)$total->fetchColumn() === 0 ? 1 : 0;   // o primeiro endereço é sempre o principal
        if ($id > 0) {
            $chk = $db->prepare('SELECT principal FROM enderecos WHERE id = ? AND usuario_id = ?'); $chk->execute([$id, $uid]);
            $atual = $chk->fetchColumn();
            if ($atual === false) { $db->rollBack(); fail('Endereço não encontrado.', 404); }
            if ((int)$atual === 1) $principal = 1;   // para trocar o principal, marque outro como principal
            if ($principal) $db->prepare('UPDATE enderecos SET principal = 0 WHERE usuario_id = ?')->execute([$uid]);
            $db->prepare('UPDATE enderecos SET apelido=?, cep=?, logradouro=?, numero=?, complemento=?, bairro=?, cidade=?, estado=?, principal=? WHERE id=? AND usuario_id=?')
               ->execute([$e['apelido'] ?: null, $e['cep'], $e['logradouro'], $e['numero'], $e['complemento'] ?: null, $e['bairro'], $e['cidade'], $e['estado'], $principal, $id, $uid]);
        } else {
            if ($principal) $db->prepare('UPDATE enderecos SET principal = 0 WHERE usuario_id = ?')->execute([$uid]);
            $db->prepare('INSERT INTO enderecos (usuario_id, apelido, cep, logradouro, numero, complemento, bairro, cidade, estado, principal) VALUES (?,?,?,?,?,?,?,?,?,?)')
               ->execute([$uid, $e['apelido'] ?: null, $e['cep'], $e['logradouro'], $e['numero'], $e['complemento'] ?: null, $e['bairro'], $e['cidade'], $e['estado'], $principal]);
            $id = (int)$db->lastInsertId();
        }
        $db->commit();
        out(['ok' => true, 'id' => $id, 'enderecos' => enderecosDoUsuario($db, $uid)]);
    }

    if ($acao === 'principal') {
        $id = (int)($b['id'] ?? 0);
        $db->beginTransaction();
        $chk = $db->prepare('SELECT 1 FROM enderecos WHERE id = ? AND usuario_id = ?'); $chk->execute([$id, $uid]);
        if (!$chk->fetchColumn()) { $db->rollBack(); fail('Endereço não encontrado.', 404); }
        $db->prepare('UPDATE enderecos SET principal = 0 WHERE usuario_id = ?')->execute([$uid]);
        $db->prepare('UPDATE enderecos SET principal = 1 WHERE id = ? AND usuario_id = ?')->execute([$id, $uid]);
        $db->commit();
        out(['ok' => true, 'enderecos' => enderecosDoUsuario($db, $uid)]);
    }

    if ($acao === 'excluir') {
        $id = (int)($b['id'] ?? 0);
        $db->beginTransaction();
        $chk = $db->prepare('SELECT principal FROM enderecos WHERE id = ? AND usuario_id = ?'); $chk->execute([$id, $uid]);
        $eraPrincipal = $chk->fetchColumn();
        if ($eraPrincipal === false) { $db->rollBack(); fail('Endereço não encontrado.', 404); }
        $db->prepare('DELETE FROM enderecos WHERE id = ? AND usuario_id = ?')->execute([$id, $uid]);   // pedidos antigos mantêm o texto do endereço
        if ((int)$eraPrincipal === 1) $db->prepare('UPDATE enderecos SET principal = 1 WHERE usuario_id = ? ORDER BY id LIMIT 1')->execute([$uid]);
        $db->commit();
        out(['ok' => true, 'enderecos' => enderecosDoUsuario($db, $uid)]);
    }
} catch (PDOException $e) {
    if ($db->inTransaction()) $db->rollBack();
    fail('Não foi possível gravar o endereço no banco: ' . $e->getMessage(), 500);
}
fail('Ação desconhecida.');

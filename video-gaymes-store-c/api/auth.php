<?php
require __DIR__ . '/bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método não permitido.', 405);
$b = body();
$acao = $b['acao'] ?? '';
$db = pdo();

function publico(array $u): array {
    return ['id' => (int)$u['id'], 'nome' => $u['nome'], 'email' => $u['email'], 'tipo' => $u['tipo']];
}

if ($acao === 'login') {
    $email = strtolower(trim((string)($b['email'] ?? '')));
    $st = $db->prepare('SELECT * FROM usuarios WHERE email = ? AND ativo = 1');
    $st->execute([$email]);
    $u = $st->fetch();
    if (!$u || !password_verify((string)($b['senha'] ?? ''), $u['senha_hash'])) fail('E-mail ou senha incorretos.', 401);
    if (!empty($b['admin']) && $u['tipo'] !== 'admin') fail('E-mail ou senha incorretos.', 401);
    session_regenerate_id(true);
    $_SESSION['uid'] = (int)$u['id'];
    out(['usuario' => publico($u)]);
}

if ($acao === 'register') {
    $nome = trim((string)($b['nome'] ?? ''));
    $email = strtolower(trim((string)($b['email'] ?? '')));
    $senha = (string)($b['senha'] ?? '');
    if (mb_strlen($nome) < 3) fail('Informe seu nome.');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('E-mail inválido.');
    if (strlen($senha) < 6) fail('Senha com no mínimo 6 caracteres.');
    $st = $db->prepare('SELECT 1 FROM usuarios WHERE email = ?');
    $st->execute([$email]);
    if ($st->fetch()) fail('Esse e-mail já tem conta.', 409);
    $db->prepare("INSERT INTO usuarios (nome, email, senha_hash, tipo, ativo) VALUES (?, ?, ?, 'cliente', 1)")
       ->execute([$nome, $email, password_hash($senha, PASSWORD_DEFAULT)]);
    session_regenerate_id(true);
    $_SESSION['uid'] = (int)$db->lastInsertId();
    out(['usuario' => ['id' => $_SESSION['uid'], 'nome' => $nome, 'email' => $email, 'tipo' => 'cliente']]);
}

if ($acao === 'logout') {
    $_SESSION = [];
    session_destroy();
    out(['ok' => true]);
}

fail('Ação desconhecida.');

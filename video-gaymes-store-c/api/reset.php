<?php
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/seed.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método não permitido.', 405);
$me = usuarioSessao();
if (!$me || $me['tipo'] !== 'admin') fail('Apenas administradores.', 403);
try { $msg = vg_instalar(require __DIR__ . '/config.php', true); }
catch (Throwable $e) { fail('Falha ao restaurar: ' . $e->getMessage(), 500); }
$_SESSION = []; session_destroy();
out(['ok' => true, 'mensagem' => $msg]);

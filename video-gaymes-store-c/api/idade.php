<?php
/* Confirmação de maioridade para o Catálogo Secreto (+18). Fica na sessão PHP; o servidor só envia os jogos +18 depois disso. */
require __DIR__ . '/bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método não permitido.', 405);
$b = body();
if (($b['acao'] ?? '') === 'confirmar' && !usuarioSessao()) fail('Entre na sua conta para acessar o Catálogo +18.', 401);
if (($b['acao'] ?? '') === 'confirmar' && !empty($b['maior18'])) { $_SESSION['maior18'] = true; out(['ok' => true]); }
if (($b['acao'] ?? '') === 'sair') { unset($_SESSION['maior18']); out(['ok' => true]); }
fail('Ação desconhecida.');

<?php
// Abra uma vez em http://localhost/video-gaymes-store-c/install.php
// Para APAGAR e recriar o banco do zero (necessário ao atualizar de uma versão antiga): install.php?recriar=1
require __DIR__ . '/api/seed.php';
header('Content-Type: text/html; charset=utf-8');
$c = require __DIR__ . '/api/config.php';
try { $msg = vg_instalar($c, !empty($_GET['recriar'])); $ok = true; }
catch (Throwable $e) { $msg = $e->getMessage(); $ok = false; }
?><!DOCTYPE html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Instalação — VG Store</title>
<link rel="icon" type="image/png" href="img/logo.png"><link rel="icon" href="favicon.ico">
<style>
:root{--bg:#141414;--card:#26153f;--fg:#f3ecff;--muted:#b9a6d8;--green:#8cff4d;--violet:#a259ff;--border:#43285f}
body{font-family:'Segoe UI',Arial,sans-serif;background:var(--bg);color:var(--fg);max-width:640px;margin:60px auto;padding:0 20px;line-height:1.6}
a{color:var(--green)} code{background:var(--card);padding:2px 6px;border-radius:4px}
img{display:block;margin-bottom:8px} .box{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px 18px}
small{color:var(--muted)}
</style>
<body>
<img src="img/logo.png" alt="VG Store" width="72" height="72">
<h1><?= $ok ? '✅ Tudo certo' : '❌ Algo deu errado' ?></h1>
<p><?= htmlspecialchars($msg) ?></p>
<?php if ($ok): ?>
<p>Banco: <b><?= htmlspecialchars($c['dbname']) ?></b> (veja no <a href="http://localhost/phpmyadmin/index.php?route=/database/structure&db=<?= urlencode($c['dbname']) ?>">phpMyAdmin</a>)</p>
<p><a href="index.html">Abrir a loja →</a> · <a href="admin.html">Painel admin →</a></p>
<div class="box"><small>Admin: admin@gmail.com / admin · Cliente: lucas@example.com / demo123<br>
Cartão para testar: <code>4111 1111 1111 1111</code> (qualquer validade futura, qualquer CVV)<br>
Cupons: BEMVINDO10 (primeira compra), VERAO20, FRETEGRATIS, PLAY10, BEMVINDO</small></div>
<p><small>Atualizou de uma versão antiga? Use <a href="?recriar=1">install.php?recriar=1</a> para recriar o banco com o novo esquema (apaga os dados atuais).</small></p>
<?php else: ?>
<p>Confira se o <b>MySQL</b> está iniciado no painel do XAMPP e se usuário/senha em <code>api/config.php</code> estão certos.<br>
Se o erro fala de coluna ou tabela que não existe, é o banco antigo: abra <a href="?recriar=1">install.php?recriar=1</a>.</p>
<?php endif; ?></body></html>

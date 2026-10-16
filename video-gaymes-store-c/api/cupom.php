<?php
/* Valida um cupom para o carrinho atual e devolve o desconto. NÃO consome o cupom (isso é feito no checkout). */
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/loja_lib.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método não permitido.', 405);
exigeLogin();
$db = pdo(); $b = body();
$carrinho = carregarItens($db, is_array($b['itens'] ?? null) ? $b['itens'] : []);
$frete = calcularFrete($carrinho['subtotal']);
try { $r = calcularCupom($db, (string)($b['codigo'] ?? ''), $carrinho['subtotal'], $frete); }
catch (RuntimeException $e) { fail($e->getMessage(), 422); }
$c = $r['cupom'];
$freteFinal = max(0.0, $frete - $r['frete_desconto']);
out([
    'ok' => true,
    'codigo' => $c['codigo'], 'tipo' => $c['tipo'], 'valor' => (float)$c['valor'],
    'desconto' => $r['desconto'], 'frete_desconto' => $r['frete_desconto'],
    'subtotal' => $carrinho['subtotal'], 'frete' => $freteFinal,
    'total' => dinheiro($carrinho['subtotal'] - $r['desconto'] + $freteFinal),
]);

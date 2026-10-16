<?php
function vg_inserir(PDO $db, string $t, array $row, array $meta): void {
    $cols = []; $vals = [];
    foreach ($meta as $nome => $c) {
        if (str_contains($c['Extra'], 'GENERATED') || ($t === 'pedido_itens' && $nome === 'subtotal') || !array_key_exists($nome, $row)) continue;
        $v = $row[$nome];
        if (is_array($v)) $v = json_encode($v, JSON_UNESCAPED_UNICODE);
        if ($v === '' || $v === null) { if ($c['Null'] === 'YES') $v = null; else continue; }
        $cols[] = "`$nome`"; $vals[] = $v;
    }
    $db->prepare("INSERT INTO `$t` (" . implode(',', $cols) . ') VALUES (' . implode(',', array_fill(0, count($cols), '?')) . ')')->execute($vals);
}

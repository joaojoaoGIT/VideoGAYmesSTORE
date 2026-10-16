<?php
// Cria o banco (se faltar) e importa o data.json. Usado por install.php e reset.php.
function vg_instalar(array $c, bool $zerar): string {
    $raiz = dirname(__DIR__);
    $srv = new PDO("mysql:host={$c['host']};port={$c['port']};charset=utf8mb4", $c['user'], $c['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $srv->exec("CREATE DATABASE IF NOT EXISTS `{$c['dbname']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $db = new PDO("mysql:host={$c['host']};port={$c['port']};dbname={$c['dbname']};charset=utf8mb4", $c['user'], $c['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // 1) esquema: executa cada comando do database.sql (ignora CREATE DATABASE/USE)
    $sql = file_get_contents($raiz . '/database.sql');
    $sql = preg_replace('/^\s*--.*$/m', '', $sql);
    if ($zerar) {
        $db->exec('SET FOREIGN_KEY_CHECKS = 0');
        foreach ($db->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN) as $t) $db->exec("DROP TABLE IF EXISTS `$t`");
        $db->exec('SET FOREIGN_KEY_CHECKS = 1');
    }
    foreach (array_filter(array_map('trim', explode(';', $sql))) as $cmd) {
        if (preg_match('/^(CREATE DATABASE|USE)\b/i', $cmd)) continue;
        $db->exec($cmd);
    }

    // 2) dados: só importa se o banco ainda estiver vazio
    if ((int)$db->query('SELECT COUNT(*) FROM produtos')->fetchColumn() > 0) return 'Banco já tinha dados; nada foi sobrescrito.';
    $d = json_decode(file_get_contents($raiz . '/data.json'), true);
    if (!is_array($d)) throw new RuntimeException('data.json inválido.');

    foreach ($d['usuarios'] as &$u) { $u['senha_hash'] = password_hash($u['senha'], PASSWORD_DEFAULT); unset($u['senha']); }
    unset($u);

    require_once __DIR__ . '/bootstrap_lib.php';
    $db->exec('SET FOREIGN_KEY_CHECKS = 0');
    $n = 0;
    foreach (['categorias', 'plataformas', 'usuarios', 'enderecos', 'produtos', 'carrinhos', 'carrinho_itens', 'cartoes', 'pedidos', 'pedido_itens', 'pagamentos', 'avaliacoes', 'cupons', 'pedido_cupons', 'lista_desejos'] as $t) {
        $meta = [];
        foreach ($db->query("SHOW COLUMNS FROM `$t`") as $col) $meta[$col['Field']] = $col;
        foreach ($d[$t] ?? [] as $row) { vg_inserir($db, $t, $row, $meta); $n++; }
    }
    $db->exec('SET FOREIGN_KEY_CHECKS = 1');
    return "Banco criado e populado ($n registros).";
}

<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

date_default_timezone_set('America/Sao_Paulo');
session_name('vgstore');
session_start(['cookie_httponly' => true, 'cookie_samesite' => 'Lax']);

function out($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
function fail(string $msg, int $code = 400): void { out(['erro' => $msg], $code); }

function pdo(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    $c = require __DIR__ . '/config.php';
    try {
        $pdo = new PDO("mysql:host={$c['host']};port={$c['port']};dbname={$c['dbname']};charset=utf8mb4", $c['user'], $c['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        fail('Sem conexão com o MySQL. Abra o XAMPP, inicie o MySQL e acesse install.php uma vez. (' . $e->getMessage() . ')', 500);
    }
    return $pdo;
}

/** Corpo JSON da requisição. */
function body(): array {
    $d = json_decode(file_get_contents('php://input') ?: '', true);
    return is_array($d) ? $d : [];
}

/** Ordem importa: pais antes dos filhos. pk = chave primária. */
const TABELAS = [
    'categorias'     => ['id'],
    'plataformas'    => ['id'],
    'usuarios'       => ['id'],
    'enderecos'      => ['id'],
    'produtos'       => ['id'],
    'carrinhos'      => ['id'],
    'carrinho_itens' => ['id'],
    'cartoes'        => ['id'],
    'pedidos'        => ['id'],
    'pedido_itens'   => ['id'],
    'pagamentos'     => ['id'],
    'avaliacoes'     => ['id'],
    'cupons'         => ['id'],
    'pedido_cupons'  => ['pedido_id', 'cupom_id'],
    'lista_desejos'  => ['id'],
];

/** Colunas filhas -> tabela pai (usado para limpar órfãos depois de exclusões). */
const FKS = [
    ['enderecos', 'usuario_id', 'usuarios'], ['carrinhos', 'usuario_id', 'usuarios'],
    ['carrinho_itens', 'carrinho_id', 'carrinhos'], ['carrinho_itens', 'produto_id', 'produtos'],
    ['cartoes', 'usuario_id', 'usuarios'], ['pedidos', 'usuario_id', 'usuarios'],
    ['pedido_itens', 'pedido_id', 'pedidos'], ['pagamentos', 'pedido_id', 'pedidos'],
    ['avaliacoes', 'produto_id', 'produtos'], ['avaliacoes', 'usuario_id', 'usuarios'],
    ['pedido_cupons', 'pedido_id', 'pedidos'], ['pedido_cupons', 'cupom_id', 'cupons'], ['lista_desejos', 'usuario_id', 'usuarios'],
    ['lista_desejos', 'produto_id', 'produtos'],
];

function colunas(string $t): array {
    static $cache = [];
    if (isset($cache[$t])) return $cache[$t];
    $m = [];
    foreach (pdo()->query("SHOW COLUMNS FROM `$t`") as $c) $m[$c['Field']] = $c;
    return $cache[$t] = $m;
}

function usuarioSessao(): ?array {
    if (empty($_SESSION['uid'])) return null;
    $st = pdo()->prepare('SELECT id, nome, email, tipo, ativo FROM usuarios WHERE id = ?');
    $st->execute([$_SESSION['uid']]);
    $u = $st->fetch();
    return ($u && (int)$u['ativo'] === 1) ? $u : null;
}

/** Exige cliente logado; devolve o usuário. */
function exigeLogin(): array {
    $me = usuarioSessao();
    if (!$me) fail('Entre na sua conta para continuar.', 401);
    return $me;
}
/** O visitante confirmou "tenho 18 anos ou mais" nesta sessão? */
function maior18(): bool { return !empty($_SESSION['maior18']); }

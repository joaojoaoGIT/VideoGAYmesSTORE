<?php
require __DIR__ . '/bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método não permitido.', 405);
$db = pdo();
$me = usuarioSessao();
if (!$me) out(['ok' => true, 'ignorado' => 'sem login']); // visitante não grava nada
$admin = $me['tipo'] === 'admin';
$uid = (int)$me['id'];
$dados = body();

const PULAR = "\0pular";

/** Converte o valor vindo do JS para o tipo da coluna ('' vira NULL quando faz sentido). */
function norm($v, array $c) {
    $tipo = strtolower($c['Type']);
    $anulavel = $c['Null'] === 'YES';
    if (is_bool($v)) $v = (int)$v;
    if (is_array($v)) $v = json_encode($v, JSON_UNESCAPED_UNICODE);
    if ($v === null || $v === '') {
        if ($anulavel || preg_match('/int|decimal|float|double|date|time/', $tipo)) return $anulavel ? null : PULAR;
        return $v === null ? PULAR : '';
    }
    if (str_starts_with($tipo, 'date') && !str_starts_with($tipo, 'datetime')) return substr((string)$v, 0, 10);
    return $v;
}

function gravar(PDO $db, string $t, array $row, ?array $apenas = null): void {
    $cols = []; $vals = [];
    foreach (colunas($t) as $nome => $c) {
        if (str_contains($c['Extra'], 'GENERATED') || ($t === 'pedido_itens' && $nome === 'subtotal')) continue;
        if (in_array($nome, ['criado_em', 'atualizado_em'], true) && $t !== 'pedidos') continue;
        if ($apenas !== null && !in_array($nome, $apenas, true)) continue;
        if (!array_key_exists($nome, $row)) continue;
        $v = norm($row[$nome], $c);
        if ($v === PULAR) continue;
        $cols[] = $nome; $vals[] = $v;
    }
    if (!$cols) return;
    $lista = implode(',', array_map(fn($c) => "`$c`", $cols));
    $marc = implode(',', array_fill(0, count($cols), '?'));
    $upd = implode(',', array_map(fn($c) => "`$c`=VALUES(`$c`)", $cols));
    $db->prepare("INSERT INTO `$t` ($lista) VALUES ($marc) ON DUPLICATE KEY UPDATE $upd")->execute($vals);
}

/** true se já existe uma linha com esse id pertencente a OUTRO usuário. */
function deOutro(PDO $db, string $t, $id, int $uid): bool {
    if ($id === null || $id === '') return false;
    $sql = in_array($t, ['pedido_itens', 'pagamentos'], true)
        ? "SELECT p.usuario_id FROM `$t` x JOIN pedidos p ON p.id = x.pedido_id WHERE x.id = ?"
        : "SELECT usuario_id FROM `$t` WHERE id = ?";
    $st = $db->prepare($sql); $st->execute([$id]);
    $dono = $st->fetchColumn();
    return $dono !== false && (int)$dono !== $uid;
}

function chave(array $row, array $pk): string { return implode('|', array_map(fn($k) => (string)($row[$k] ?? ''), $pk)); }

try {
    $db->exec('SET FOREIGN_KEY_CHECKS = 0');
    $db->beginTransaction();

    if ($admin) {
        // Admin: o painel envia o banco completo; o que sumiu do JSON é excluído.
        foreach (TABELAS as $t => $pk) {
            $rows = is_array($dados[$t] ?? null) ? $dados[$t] : [];
            if ($t === 'usuarios') {
                foreach ($rows as &$r) {
                    if (!empty($r['senha'])) $r['senha_hash'] = password_hash((string)$r['senha'], PASSWORD_DEFAULT);
                    unset($r['senha']);
                    if (isset($r['email'])) $r['email'] = strtolower(trim($r['email']));
                    if (!isset($r['senha_hash']) && !(int)$db->query('SELECT COUNT(*) FROM usuarios WHERE id = ' . (int)($r['id'] ?? 0))->fetchColumn()) {
                        throw new RuntimeException('Informe uma senha para o novo usuário ' . ($r['nome'] ?? '') . '.');
                    }
                }
                unset($r);
            }
            $manter = [];
            foreach ($rows as $r) { gravar($db, $t, $r); $manter[chave($r, $pk)] = true; }
            $existentes = $db->query('SELECT ' . implode(',', array_map(fn($k) => "`$k`", $pk)) . " FROM `$t`")->fetchAll();
            foreach ($existentes as $e) {
                if (isset($manter[chave($e, $pk)])) continue;
                $where = implode(' AND ', array_map(fn($k) => "`$k` = ?", $pk));
                $db->prepare("DELETE FROM `$t` WHERE $where")->execute(array_map(fn($k) => $e[$k], $pk));
            }
        }
        // Sem as FKs ativas, a exclusão em cascata não acontece: limpamos órfãos aqui.
        for ($i = 0; $i < 3; $i++) foreach (FKS as [$filha, $col, $pai]) {
            $db->exec("DELETE FROM `$filha` WHERE `$col` NOT IN (SELECT id FROM `$pai`)");
        }
        $db->exec('UPDATE produtos SET categoria_id = NULL WHERE categoria_id IS NOT NULL AND categoria_id NOT IN (SELECT id FROM categorias)');
        $db->exec('UPDATE produtos SET plataforma_id = NULL WHERE plataforma_id IS NOT NULL AND plataforma_id NOT IN (SELECT id FROM plataformas)');
    } else {
        // Cliente: só grava os próprios dados e nunca exclui nada (exceto a própria lista de desejos).
        // Endereços, cartões e pedidos NÃO passam mais por aqui: têm endpoints próprios que validam no servidor
        // (api/enderecos.php, api/cartoes.php, api/checkout.php). Assim o navegador não consegue gravar número de
        // cartão, nem preço/total/estoque adulterados.
        $meus = fn(array $r) => (int)($r['usuario_id'] ?? 0) === $uid;
        foreach (['carrinhos', 'lista_desejos', 'avaliacoes'] as $t) {
            foreach (($dados[$t] ?? []) as $r) if ($meus($r)) {
                if (deOutro($db, $t, $r['id'] ?? null, $uid)) throw new RuntimeException('Conflito de registro em ' . $t . '. Recarregue a página.');
                if ($t === 'avaliacoes') { $r['nota'] = max(1, min(5, (int)($r['nota'] ?? 0))); $r['comentario'] = mb_substr((string)($r['comentario'] ?? ''), 0, 300); }
                gravar($db, $t, $r);
            }
        }
        // lista de desejos: o que o cliente removeu também sai do banco
        $ficam = array_map(fn($r) => (int)$r['produto_id'], array_filter($dados['lista_desejos'] ?? [], $meus));
        $st = $db->prepare('SELECT id, produto_id FROM lista_desejos WHERE usuario_id = ?'); $st->execute([$uid]);
        foreach ($st->fetchAll() as $w) if (!in_array((int)$w['produto_id'], $ficam, true)) $db->prepare('DELETE FROM lista_desejos WHERE id = ?')->execute([$w['id']]);
        // Simulação de "avançar etapa" do pedido: só pedido PRÓPRIO e só um passo para frente.
        $ordem = ['pago', 'em_separacao', 'enviado', 'entregue'];
        $st = $db->prepare('SELECT id, status, codigo_rastreio FROM pedidos WHERE usuario_id = ?'); $st->execute([$uid]);
        $atuais = []; foreach ($st->fetchAll() as $p) $atuais[(int)$p['id']] = $p;
        foreach (($dados['pedidos'] ?? []) as $r) {
            $id = (int)($r['id'] ?? 0);
            if (!isset($atuais[$id])) continue;
            $de = array_search($atuais[$id]['status'], $ordem, true); $para = array_search($r['status'] ?? '', $ordem, true);
            if ($de === false || $para === false || $para !== $de + 1) continue;
            $rastreio = ($ordem[$para] === 'enviado' && $atuais[$id]['codigo_rastreio'] === null) ? mb_substr((string)($r['codigo_rastreio'] ?? ''), 0, 50) : $atuais[$id]['codigo_rastreio'];
            $db->prepare('UPDATE pedidos SET status = ?, codigo_rastreio = ? WHERE id = ? AND usuario_id = ?')->execute([$ordem[$para], $rastreio ?: null, $id, $uid]);
        }
    }

    $db->commit();
    $db->exec('SET FOREIGN_KEY_CHECKS = 1');
    out(['ok' => true]);
} catch (Throwable $e) {
    if ($db->inTransaction()) $db->rollBack();
    $db->exec('SET FOREIGN_KEY_CHECKS = 1');
    fail('Não foi possível salvar no banco: ' . $e->getMessage(), 500);
}

<?php
/* Regras de negócio da loja, sempre validadas NO SERVIDOR (o front só ajuda o usuário). */

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const FRETE_GRATIS_A_PARTIR_DE = 299.00;
const FRETE_PADRAO = 19.90;

function dinheiro($v): float { return round((float)$v, 2); }

function calcularFrete(float $subtotal): float {
    return ($subtotal <= 0 || $subtotal >= FRETE_GRATIS_A_PARTIR_DE) ? 0.0 : FRETE_PADRAO;
}

/* ---------------- endereço ---------------- */
function validarEndereco(array $b): array {
    $cep = preg_replace('/\\D/', '', (string)($b['cep'] ?? ''));
    $log = trim((string)($b['logradouro'] ?? ''));
    $num = trim((string)($b['numero'] ?? ''));
    $comp = trim((string)($b['complemento'] ?? ''));
    $bai = trim((string)($b['bairro'] ?? ''));
    $cid = trim((string)($b['cidade'] ?? ''));
    $uf = strtoupper(trim((string)($b['estado'] ?? '')));
    $ap = trim((string)($b['apelido'] ?? ''));
    if (strlen($cep) !== 8) fail('CEP inválido: informe 8 números.');
    if (mb_strlen($log) < 3 || mb_strlen($log) > 150) fail('Informe a rua/avenida (3 a 150 caracteres).');
    if ($num === '' || mb_strlen($num) > 10) fail('Informe o número (até 10 caracteres, ou S/N).');
    if (mb_strlen($comp) > 100) fail('Complemento muito longo (máx. 100).');
    if (mb_strlen($bai) < 2 || mb_strlen($bai) > 100) fail('Informe o bairro.');
    if (mb_strlen($cid) < 2 || mb_strlen($cid) > 100) fail('Informe a cidade.');
    if (!in_array($uf, UFS, true)) fail('Estado (UF) inválido.');
    if (mb_strlen($ap) > 50) fail('Apelido muito longo (máx. 50).');
    return ['apelido' => $ap, 'cep' => $cep, 'logradouro' => $log, 'numero' => $num, 'complemento' => $comp, 'bairro' => $bai, 'cidade' => $cid, 'estado' => $uf];
}

function enderecoTexto(array $e): string {
    $cep = substr($e['cep'], 0, 5) . '-' . substr($e['cep'], 5);
    return $e['logradouro'] . ', ' . $e['numero'] . ($e['complemento'] !== '' && $e['complemento'] !== null ? ' (' . $e['complemento'] . ')' : '')
        . ' - ' . $e['bairro'] . ', ' . $e['cidade'] . '/' . $e['estado'] . ' - CEP ' . $cep;
}

function enderecosDoUsuario(PDO $db, int $uid): array {
    $st = $db->prepare('SELECT * FROM enderecos WHERE usuario_id = ? ORDER BY principal DESC, id');
    $st->execute([$uid]);
    $rows = $st->fetchAll();
    foreach ($rows as &$r) { $r['id'] = (int)$r['id']; $r['usuario_id'] = (int)$r['usuario_id']; $r['principal'] = (int)$r['principal']; $r['apelido'] = (string)($r['apelido'] ?? ''); $r['complemento'] = (string)($r['complemento'] ?? ''); }
    return $rows;
}

/* ---------------- cartão (nunca guardamos número completo nem CVV) ---------------- */
function luhnOk(string $n): bool {
    $sum = 0; $alt = false;
    for ($i = strlen($n) - 1; $i >= 0; $i--) {
        $d = (int)$n[$i];
        if ($alt) { $d *= 2; if ($d > 9) $d -= 9; }
        $sum += $d; $alt = !$alt;
    }
    return $sum % 10 === 0;
}

function bandeiraDoNumero(string $n): string {
    if (preg_match('/^(636368|438935|504175|451416|636297|5067|4576|4011|506699)/', $n)) return 'Elo';
    if (preg_match('/^(606282|3841)/', $n)) return 'Hipercard';
    if (preg_match('/^3[47]/', $n)) return 'American Express';
    if (preg_match('/^4/', $n)) return 'Visa';
    if (preg_match('/^(5[1-5]|222[1-9]|22[3-9]\\d|2[3-6]\\d\\d|27[01]\\d|2720)/', $n)) return 'Mastercard';
    return 'Cartão';
}

/** Aceita 'AAAA-MM' (input month) ou 'MM/AA'; devolve 'AAAA-MM' ou null. */
function normalizarValidade(string $v): ?string {
    $v = trim($v);
    if (preg_match('/^(\\d{4})-(\\d{2})$/', $v, $m)) { $a = (int)$m[1]; $mes = (int)$m[2]; }
    elseif (preg_match('/^(\\d{2})\\/(\\d{2})$/', $v, $m)) { $mes = (int)$m[1]; $a = 2000 + (int)$m[2]; }
    else return null;
    if ($mes < 1 || $mes > 12) return null;
    return sprintf('%04d-%02d', $a, $mes);
}
function cartaoVencido(string $aaaamm): bool { return $aaaamm < date('Y-m'); }  // vale até o fim do mês de validade

/** Bancos criados por versões antigas podem ter a tabela `cartoes` com outro esquema (colunas obrigatórias que o
 *  formulário nunca envia, como numero/cvv). Aí todo INSERT falhava e o cartão "não salvava". Esta função ajusta a
 *  tabela sem apagar nada: cria o que falta e torna opcional qualquer coluna extra. Chamar ANTES de beginTransaction(). */
function garantirTabelaCartoes(PDO $db): void {
    static $feito = false; if ($feito) return; $feito = true;
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS cartoes (
            id INT AUTO_INCREMENT PRIMARY KEY, usuario_id INT NOT NULL, apelido VARCHAR(50), titular VARCHAR(100) NOT NULL,
            bandeira VARCHAR(30) NOT NULL DEFAULT 'Cartão', ultimos_digitos CHAR(4) NOT NULL, validade CHAR(7) NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_usuario (usuario_id)) ENGINE=InnoDB");
        $cols = [];
        foreach ($db->query('SHOW COLUMNS FROM cartoes') as $c) $cols[$c['Field']] = $c;
        $esperadas = [
            'apelido'         => 'VARCHAR(50) NULL',
            'titular'         => "VARCHAR(100) NOT NULL DEFAULT ''",
            'bandeira'        => "VARCHAR(30) NOT NULL DEFAULT 'Cartão'",
            'ultimos_digitos' => "CHAR(4) NOT NULL DEFAULT ''",
            'validade'        => "CHAR(7) NOT NULL DEFAULT ''",
        ];
        foreach ($esperadas as $nome => $def) if (!isset($cols[$nome])) $db->exec("ALTER TABLE cartoes ADD COLUMN `$nome` $def");
        // validade precisa caber 'AAAA-MM' e ultimos_digitos 4 caracteres (versões antigas usavam DATE / CHAR(2))
        if (isset($cols['validade']) && !preg_match('/^(char|varchar)\((\d+)\)/i', $cols['validade']['Type'], $m)) {
            $db->exec("ALTER TABLE cartoes MODIFY validade CHAR(7) NOT NULL DEFAULT ''");
        } elseif (isset($cols['validade']) && (int)$m[2] < 7) {
            $db->exec("ALTER TABLE cartoes MODIFY validade CHAR(7) NOT NULL DEFAULT ''");
        }
        if (isset($cols['ultimos_digitos']) && preg_match('/\((\d+)\)/', $cols['ultimos_digitos']['Type'], $m) && (int)$m[1] < 4) {
            $db->exec("ALTER TABLE cartoes MODIFY ultimos_digitos CHAR(4) NOT NULL DEFAULT ''");
        }
        $conhecidas = array_merge(['id', 'usuario_id', 'criado_em'], array_keys($esperadas));
        foreach ($cols as $nome => $c) {
            if (in_array($nome, $conhecidas, true) || $c['Null'] === 'YES' || $c['Default'] !== null || str_contains($c['Extra'], 'auto_increment') || str_contains($c['Extra'], 'GENERATED')) continue;
            $db->exec("ALTER TABLE cartoes MODIFY `$nome` {$c['Type']} NULL DEFAULT NULL");
        }
    } catch (Throwable $e) { /* se não der para ajustar, o erro real aparece no INSERT, com a mensagem do MySQL */ }
}

/** Valida o que veio do formulário. Retorna só o que PODE ser guardado + o que é usado na hora. */
function validarCartaoNovo(array $b): array {
    $num = preg_replace('/\\D/', '', (string)($b['numero'] ?? ''));
    $tit = trim((string)($b['titular'] ?? ''));
    $ap = trim((string)($b['apelido'] ?? ''));
    $val = normalizarValidade((string)($b['validade'] ?? ''));
    if (strlen($num) < 13 || strlen($num) > 19) fail('Número do cartão inválido (13 a 19 dígitos).');
    if (mb_strlen($tit) < 3 || mb_strlen($tit) > 100) fail('Informe o nome do titular como está no cartão.');
    if ($val === null) fail('Validade inválida. Use mês/ano, por exemplo 08/29.');
    if (cartaoVencido($val)) fail('Cartão vencido. Informe um cartão dentro da validade.');
    if (mb_strlen($ap) > 50) fail('Apelido muito longo (máx. 50).');
    return ['apelido' => $ap, 'titular' => mb_strtoupper($tit), 'bandeira' => bandeiraDoNumero($num), 'ultimos_digitos' => substr($num, -4), 'validade' => $val];
}

function cartoesDoUsuario(PDO $db, int $uid): array {
    $st = $db->prepare('SELECT id, usuario_id, apelido, titular, bandeira, ultimos_digitos, validade FROM cartoes WHERE usuario_id = ? ORDER BY id');
    $st->execute([$uid]);
    $rows = $st->fetchAll();
    foreach ($rows as &$r) { $r['id'] = (int)$r['id']; $r['usuario_id'] = (int)$r['usuario_id']; $r['apelido'] = (string)($r['apelido'] ?? ''); }
    return $rows;
}

/** Insere o cartão (sem duplicar) e devolve o id. */
function guardarCartao(PDO $db, int $uid, array $c): int {
    $st = $db->prepare('SELECT id FROM cartoes WHERE usuario_id = ? AND ultimos_digitos = ? AND bandeira = ? AND validade = ?');
    $st->execute([$uid, $c['ultimos_digitos'], $c['bandeira'], $c['validade']]);
    $id = $st->fetchColumn();
    if ($id) return (int)$id;
    $db->prepare('INSERT INTO cartoes (usuario_id, apelido, titular, bandeira, ultimos_digitos, validade) VALUES (?, ?, ?, ?, ?, ?)')
       ->execute([$uid, $c['apelido'] !== '' ? $c['apelido'] : $c['bandeira'], $c['titular'], $c['bandeira'], $c['ultimos_digitos'], $c['validade']]);
    return (int)$db->lastInsertId();
}

/* ---------------- cupom ---------------- */
/**
 * Valida o cupom e calcula o desconto. Lança RuntimeException com mensagem clara se não puder usar.
 * $trava = true dentro da transação do checkout (SELECT ... FOR UPDATE, evita estourar o limite de usos).
 * Retorna ['cupom' => linha, 'desconto' => float (sobre os itens), 'frete_desconto' => float]
 */
function calcularCupom(PDO $db, string $codigo, float $subtotal, float $frete, bool $trava = false): array {
    $codigo = strtoupper(trim($codigo));
    if ($codigo === '') throw new RuntimeException('Digite o código do cupom.');
    if (!preg_match('/^[A-Z0-9_-]{2,30}$/', $codigo)) throw new RuntimeException('Cupom inválido. Confira o código digitado.');
    $st = $db->prepare('SELECT * FROM cupons WHERE codigo = ?' . ($trava ? ' FOR UPDATE' : ''));
    $st->execute([$codigo]);
    $c = $st->fetch();
    if (!$c) throw new RuntimeException('Cupom inválido: esse código não existe.');
    if (!(int)$c['ativo']) throw new RuntimeException('Este cupom está desativado.');
    if (!empty($c['validade']) && $c['validade'] < date('Y-m-d')) throw new RuntimeException('Este cupom expirou em ' . date('d/m/Y', strtotime($c['validade'])) . '.');
    $max = (int)($c['usos_maximos'] ?? 0);  // vazio ou 0 = ilimitado
    if ($max > 0 && (int)$c['usos_atuais'] >= $max) throw new RuntimeException('Este cupom atingiu o limite de usos.');
    $min = (float)($c['valor_minimo'] ?? 0);
    if ($min > 0 && $subtotal + 0.0001 < $min) throw new RuntimeException('Este cupom exige compras a partir de R$ ' . number_format($min, 2, ',', '.') . '.');
    $desc = 0.0; $fd = 0.0;
    if ($c['tipo'] === 'percentual') $desc = dinheiro($subtotal * min(100.0, (float)$c['valor']) / 100);
    elseif ($c['tipo'] === 'fixo') $desc = dinheiro(min($subtotal, (float)$c['valor']));
    elseif ($c['tipo'] === 'frete_gratis') {
        if ($frete <= 0) throw new RuntimeException('Seu pedido já tem frete grátis; este cupom não é necessário.');
        $fd = $frete;
    }
    return ['cupom' => $c, 'desconto' => $desc, 'frete_desconto' => $fd];
}

/* ---------------- itens do carrinho (preço e estoque sempre do banco) ---------------- */
function carregarItens(PDO $db, array $itens, bool $trava = false): array {
    $out = []; $subtotal = 0.0; $vistos = [];
    foreach ($itens as $i) {
        $id = (int)($i['id'] ?? 0); $q = (int)($i['qtd'] ?? 0);
        if ($id <= 0 || $q <= 0 || $q > 99) fail('Carrinho inválido.');
        if (isset($vistos[$id])) fail('Carrinho inválido (produto repetido).');
        $vistos[$id] = true;
        $st = $db->prepare('SELECT id, nome, preco, preco_promocional, estoque, ativo, adulto FROM produtos WHERE id = ?' . ($trava ? ' FOR UPDATE' : ''));
        $st->execute([$id]);
        $p = $st->fetch();
        if (!$p || !(int)$p['ativo']) fail('Um dos jogos do carrinho não está mais disponível.');
        if ((int)$p['adulto'] === 1 && !maior18()) fail('Confirme sua idade no Catálogo Secreto para comprar este item.', 403);
        if ((int)$p['estoque'] < $q) fail('Estoque insuficiente para ' . $p['nome'] . ' (restam ' . (int)$p['estoque'] . ').', 409);
        $preco = (float)$p['preco_promocional'] > 0 ? (float)$p['preco_promocional'] : (float)$p['preco'];
        $subtotal += $preco * $q;
        $out[] = ['id' => (int)$p['id'], 'nome' => $p['nome'], 'qtd' => $q, 'preco' => dinheiro($preco)];
    }
    if (!$out) fail('Seu carrinho está vazio.');
    return ['itens' => $out, 'subtotal' => dinheiro($subtotal)];
}

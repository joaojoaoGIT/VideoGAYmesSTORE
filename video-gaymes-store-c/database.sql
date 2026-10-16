-- Video Gay(mes) Store — esquema do banco (MySQL/MariaDB do XAMPP)
-- Pode ser importado pelo phpMyAdmin (aba "Importar") ou criado automaticamente pelo install.php.

CREATE DATABASE IF NOT EXISTS game_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE game_store;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  telefone VARCHAR(20),
  data_nascimento DATE,
  tipo ENUM('cliente','admin') DEFAULT 'cliente',
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS enderecos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  apelido VARCHAR(50),
  cep VARCHAR(10) NOT NULL,
  logradouro VARCHAR(150) NOT NULL,
  numero VARCHAR(10) NOT NULL,
  complemento VARCHAR(100),
  bairro VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado CHAR(2) NOT NULL,
  principal BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(80) NOT NULL UNIQUE,
  descricao TEXT,
  slug VARCHAR(80) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS plataformas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) UNIQUE,
  fabricante VARCHAR(50)
) ENGINE=InnoDB;

-- produtos.adulto = 1 -> jogo +18: só aparece no Catálogo Secreto (nunca na loja/busca). tags = lista separada por vírgula.
CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  slug VARCHAR(200),
  descricao TEXT,
  sinopse TEXT,
  desenvolvedora VARCHAR(100),
  publicadora VARCHAR(100),
  categoria_id INT,
  plataforma_id INT,
  preco DECIMAL(10,2) NOT NULL,
  preco_promocional DECIMAL(10,2),
  estoque INT DEFAULT 0,
  sku VARCHAR(50) UNIQUE,
  imagem_url VARCHAR(500),
  hero_url VARCHAR(500),
  trailer_url VARCHAR(500),
  cor1 VARCHAR(9) DEFAULT '#222222',
  cor2 VARCHAR(9) DEFAULT '#555555',
  classificacao_indicativa TINYINT UNSIGNED DEFAULT 0,
  nota_critica TINYINT UNSIGNED,
  data_lancamento DATE,
  ativo BOOLEAN DEFAULT TRUE,
  destaque BOOLEAN DEFAULT FALSE,
  adulto BOOLEAN NOT NULL DEFAULT FALSE,
  tags VARCHAR(255),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
  FOREIGN KEY (plataforma_id) REFERENCES plataformas(id) ON DELETE SET NULL,
  INDEX idx_categoria (categoria_id),
  INDEX idx_plataforma (plataforma_id),
  INDEX idx_nome (nome),
  INDEX idx_adulto (adulto)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS carrinhos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY uk_usuario (usuario_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS carrinho_itens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  carrinho_id INT NOT NULL,
  produto_id INT NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (carrinho_id) REFERENCES carrinhos(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  UNIQUE KEY uk_carrinho_produto (carrinho_id, produto_id)
) ENGINE=InnoDB;

-- Cartões do cliente. POR SEGURANÇA nunca se guarda o número completo nem o CVV:
-- só os 4 últimos dígitos, a bandeira, o titular e a validade (formato AAAA-MM).
CREATE TABLE IF NOT EXISTS cartoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  apelido VARCHAR(50),
  titular VARCHAR(100) NOT NULL,
  bandeira VARCHAR(30) NOT NULL DEFAULT 'Cartão',
  ultimos_digitos CHAR(4) NOT NULL,
  validade CHAR(7) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  endereco_id INT,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  endereco_entrega VARCHAR(255),
  subtotal DECIMAL(10,2) NOT NULL,
  frete DECIMAL(10,2) DEFAULT 0,
  desconto DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('aguardando_pagamento','pago','em_separacao','enviado','entregue','cancelado','reembolsado') DEFAULT 'aguardando_pagamento',
  codigo_rastreio VARCHAR(50),
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (endereco_id) REFERENCES enderecos(id) ON DELETE SET NULL,
  INDEX idx_usuario (usuario_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pedido_itens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  produto_id INT NOT NULL,
  nome_produto VARCHAR(200),
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id),
  INDEX idx_pedido (pedido_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pagamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  metodo ENUM('pix','cartao','cartao_credito','cartao_debito','boleto') NOT NULL,
  status ENUM('pendente','aprovado','recusado','estornado') DEFAULT 'pendente',
  valor DECIMAL(10,2) NOT NULL,
  transacao_id VARCHAR(100),
  bandeira VARCHAR(30),
  ultimos_digitos CHAR(4),
  parcelas INT DEFAULT 1,
  payload_resposta JSON NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  INDEX idx_pedido (pedido_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS avaliacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produto_id INT NOT NULL,
  usuario_id INT NOT NULL,
  pedido_id INT,
  nota TINYINT NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE SET NULL,
  UNIQUE KEY uk_usuario_produto (usuario_id, produto_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  tipo ENUM('percentual','fixo','frete_gratis') NOT NULL,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_minimo DECIMAL(10,2) DEFAULT 0,
  usos_maximos INT,
  usos_atuais INT DEFAULT 0,
  validade DATE,
  ativo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pedido_cupons (
  pedido_id INT NOT NULL,
  cupom_id INT NOT NULL,
  desconto_aplicado DECIMAL(10,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (pedido_id, cupom_id),
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (cupom_id) REFERENCES cupons(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lista_desejos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  produto_id INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  UNIQUE KEY uk_usuario_produto (usuario_id, produto_id)
) ENGINE=InnoDB;

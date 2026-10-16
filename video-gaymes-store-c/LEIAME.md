# Video Gay(mes) Store — versão PHP + MySQL (XAMPP)

## Como rodar
1. Copie esta pasta (`video-gaymes-store-c`) para `C:\xampp\htdocs\`.
2. No painel do XAMPP, inicie **Apache** e **MySQL**.
3. Abra **http://localhost/video-gaymes-store-c/install.php**. Ele cria o banco `game_store`, as tabelas (`database.sql`) e importa os dados do `data.json`.
   - **Atualizando de uma versão antiga?** O esquema mudou. Abra **install.php?recriar=1** (apaga e recria o banco do zero).
4. Use a loja em **http://localhost/video-gaymes-store-c/** (não abra o .html por duplo clique).

## Logins e dados de teste
- Admin (`admin.html`): `admin@gmail.com` / `admin` · Clientes: `lucas@example.com` etc., senha `demo123`
- Cartão de teste: qualquer número de 13 a 19 dígitos, validade futura (ex.: 12/30), CVV qualquer
- Cupons: `BEMVINDO10` (10%, **cupom de primeira compra**), `VERAO20` (20%, mín. R$ 200), `FRETEGRATIS` (mín. R$ 100), `PLAY10`, `BEMVINDO` (R$ 20, mín. R$ 150), `EXPIRADO10` (expirado) e `DESATIVADO15` (desativado), estes dois para testar as mensagens de erro.

## Novidades
1. **Endereços** (`api/enderecos.php`): antes não existia nenhuma tela que gravasse em `enderecos` (o checkout só tinha um campo de texto). Agora há a aba *Endereços* na conta (adicionar, editar, excluir, principal, CEP com preenchimento automático via ViaCEP) e a escolha do endereço no checkout.
2. **Cupons** (`api/cupom.php`, `api/checkout.php`): campo no carrinho e no checkout; valida existência, ativo, validade, limite de usos e valor mínimo; mostra subtotal/desconto/frete/total; ao pagar grava `pedido_cupons`, soma `usos_atuais` e salva o total com desconto em `pedidos` e `pagamentos`. Tipos: percentual, valor fixo e frete grátis. Admin: criar, editar, ativar/desativar e excluir. `usos_maximos` vazio/0 = ilimitado.
3. **Cartões** (`api/cartoes.php`): tabela `cartoes` agora guarda **só** apelido, titular, bandeira, 4 últimos dígitos e validade. Número completo e CVV nunca são gravados (o CVV nem sai do navegador). Cartões salvos aparecem no pagamento; dá para usar outro cartão com a opção "Salvar este cartão"; gerenciamento na aba *Cartões* da conta.
4. **Validade** com máscara automática MM/AA (a barra entra sozinha), recusa cartão vencido e guarda como `AAAA-MM`.
5. **Catálogo**: +34 jogos reais (PS5, Xbox, Switch, PC). Notas e datas são aproximadas. Capas via Steam; jogos exclusivos Nintendo/PlayStation sem capa Steam usam o gradiente com o título.
6. **Catálogo Secreto +18**: o botão discreto "+18" (quase invisível) no rodapé abre a confirmação de idade e depois a página. Jogos têm `produtos.adulto = 1`; o servidor só os envia depois da confirmação (sessão PHP), então não aparecem na loja, busca ou favoritos. Compra e admin funcionam normalmente. Preços são fictícios.
7. **Visual**: a loja mantém o tema original (verde e preto); o roxo (com verde de destaque) aparece só no Catálogo Secreto +18 (variáveis em `.secret-page` no `style.css`).
8. **Logo**: usa o seu `img/logo.png` (PNG transparente) e o `favicon.ico` gerado dele.
9. **Menu "Git"** no rodapé com os 5 criadores (fecha com clique fora ou ESC; no celular vira painel na base).

## Segurança
- Todo SQL novo usa PDO com prepared statements; validação de endereço, cartão (Luhn, validade), cupom e estoque é feita no servidor.
- O pedido é calculado no servidor (`api/checkout.php`): preço, estoque e desconto vêm do banco, não do navegador.
- Clientes não recebem mais a lista de cupons nem gravam cartões/pedidos pelo `save.php` genérico.

## Estrutura
`api/load.php` lê · `api/save.php` grava (admin; cliente só favoritos/avaliações/avanço de etapa) · `api/auth.php` login · `api/enderecos.php`, `cartoes.php`, `cupom.php`, `checkout.php`, `idade.php` · `api/loja_lib.php` regras de negócio.

## Correções recentes
- **Capas**: cada jogo tenta a URL do banco, depois outros servidores da Steam e, por fim, a capa oficial da Wikipédia (buscada pelo navegador e guardada em `localStorage`). Vale para os da Nintendo, Gran Turismo 7 e o Catálogo +18. Se nenhuma fonte tiver a capa, aparece o gradiente com o título. Para forçar uma capa específica, cole a URL em *URL da imagem* no admin.
- **Cartão não salvava**: `api/cartoes.php` e `api/checkout.php` agora ajustam sozinhos a tabela `cartoes` de bancos antigos (`garantirTabelaCartoes()` em `loja_lib.php`), e o erro aparece escrito dentro do formulário (antes era só um aviso rápido).
- **Cupom de primeira compra** (`BEMVINDO10`): faixa na página inicial, aviso na barra do topo e caixa "Primeira compra?" com botão *Usar cupom* no carrinho e no pagamento (some depois do primeiro pedido). O servidor ainda não bloqueia o reuso do cupom em compras seguintes.

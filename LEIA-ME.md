# 📱 Controle de Gastos — Guia de Instalação

## O que está nesta pasta

| Arquivo | Para quê |
|---|---|
| `index.html` | O webapp completo |
| `manifest.json` | Permite instalar como app no celular |
| `netlify.toml` | Configuração do Netlify |
| `icons/` | Ícones do app |
| `GOOGLE_APPS_SCRIPT.js` | Ponte entre o webapp e o Google Sheets |

---

## PASSO 1 — Preparar a planilha

1. Abra sua planilha `controle_gastos_2026.xlsx` no **Google Sheets**
   (faça upload em drive.google.com → botão + Novo → Upload de arquivo)
2. Adicione uma coluna **J** na aba `Registros` com o título: `ID Interno`
   (ela ficará oculta e serve para o app identificar cada gasto)

---

## PASSO 2 — Criar o Google Apps Script

1. Na planilha aberta, clique em **Extensões → Apps Script**
2. Delete todo o código que aparecer
3. Cole o conteúdo do arquivo `GOOGLE_APPS_SCRIPT.js`
4. Clique em 💾 **Salvar** (ícone de disquete) e dê um nome: `GastosApp`
5. Clique em **Implantar → Nova implantação**
6. Em "Tipo": selecione **App da Web**
7. Em "Executar como": **Eu (seu e-mail)**
8. Em "Quem tem acesso": **Qualquer pessoa**
9. Clique em **Implantar**
10. Autorize o acesso quando solicitado
11. **Copie a URL** que aparecer — você vai precisar dela no Passo 4

---

## PASSO 3 — Publicar no Netlify

1. Acesse **github.com** e crie um repositório novo chamado `gastos-app`
   (deixe como Público, sem README)
2. Na tela do repositório, clique em **uploading an existing file**
3. Arraste todos os arquivos desta pasta (incluindo a pasta `icons`)
4. Clique em **Commit changes**
5. Acesse **netlify.com** → **Add new site → Import an existing project**
6. Escolha **GitHub** e selecione o repositório `gastos-app`
7. Clique em **Deploy site**
8. Aguarde ~1 minuto — seu site estará no ar com um endereço tipo `nome-aleatorio.netlify.app`

---

## PASSO 4 — Conectar o webapp ao Google Sheets

1. Acesse seu webapp pelo endereço do Netlify
2. Toque na aba **⚙️ Config** (menu inferior)
3. Cole a **URL do Apps Script** que você copiou no Passo 2
4. Toque em **Salvar configuração**
5. Pronto! Agora cada gasto registrado no app aparece automaticamente na planilha

---

## PASSO 5 — Instalar como app no celular

### No iPhone (Safari):
1. Abra o endereço do Netlify no Safari
2. Toque no ícone de compartilhar (□↑)
3. Role para baixo e toque em **Adicionar à Tela de Início**
4. Confirme — o ícone aparecerá na sua tela inicial

### No Android (Chrome):
1. Abra o endereço no Chrome
2. Toque nos 3 pontinhos (⋮) no canto superior direito
3. Toque em **Adicionar à tela inicial**
4. Confirme — o ícone aparecerá na sua tela inicial

---

## ❓ Dúvidas comuns

**"Salvou localmente mas não foi pro Sheets"**
→ Verifique se a URL do Apps Script está correta na aba Config.
→ A URL começa com `https://script.google.com/macros/s/...`

**"Erro de autorização no Apps Script"**
→ Refaça a implantação e certifique-se de que "Quem tem acesso" está como "Qualquer pessoa".

**Os dados ficam salvos mesmo sem internet?**
→ Sim! O app salva tudo localmente no celular. Quando a internet voltar, os próximos gastos serão sincronizados. Gastos offline não são sincronizados retroativamente automaticamente.

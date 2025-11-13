# 🤖 BotInsta Dashboard

Dashboard moderno para buscar produtos da Amazon, gerar stories personalizadas com sua tag de afiliado e gerenciar tudo localmente.

## ⚡ Features

- ✅ **Busca de Produtos** - SerpAPI integrado para buscar produtos Amazon em tempo real
- ✅ **Gerador de Stories** - Cria imagens 1080x1920 com design profissional
- ✅ **Salvamento Local** - Stories salvas no navegador (localStorage), sem servidor necessário
- ✅ **Gerenciador de Stories** - Baixe e exclua stories do seu "carrinho"
- ✅ **Mascote Customizável** - Use o robô padrão ou envie o seu
- ✅ **Links de Afiliado** - Seu link é inserido automaticamente em todas as stories
- ✅ **Responsivo** - Funciona em desktop, tablet e mobile

## 🚀 Quick Start

### Windows (Recomendado)
1. Abra a pasta do projeto
2. **Clique duplo em `iniciar.bat`**
3. Pronto! O navegador abrirá automaticamente

### PowerShell/Terminal
```bash
cd C:\Users\jpgui\OneDrive\Documents\botinsta2
$env:SERPAPI_KEY='bc254ec4fcb8adb93066f1df7a9536a2cc70a1ca52cdab243e626518cdbbec5d'
npm start
```

Depois, abra: `http://localhost:3000`

## 📋 Como Usar

### 1️⃣ Buscar Produtos
```
Digite um termo na barra de busca
Clique em BUSCAR
Veja os produtos encontrados
```

### 2️⃣ Gerar Story
```
Clique em um produto
Clique em "Gerar Story"
A imagem aparecerá em uma nova aba
```

### 3️⃣ Salvar Story
```
Clique em "Baixar Imagem"
A story é salva em seu carrinho
```

### 4️⃣ Gerenciar Stories
```
Clique na aba "Meus Stories"
Veja todas as suas stories salvas
Baixe novamente ou exclua
```

## 🎨 Layout da Story

Cada story gerada contém:
- 📍 **Fundo azul** com gradiente (#0066cc)
- 📍 **Stripe roxo** no topo (#667eea)  
- 📍 **Cartão branco** centralizado
- 📍 **Imagem do produto** (centralizada)
- 📍 **Mascote** no canto inferior direito
- 📍 **Dados do produto** (título, preço, link de afiliado)

## 💾 Dados Locais

Tudo é salvo no **localStorage do navegador**:
- ✅ Stories geradas
- ✅ Template customizado
- ✅ Histórico de stories

**Nada é enviado para servidores - tudo é local no seu navegador!**

### Comportamento de Duplicatas (v2.0+)

- ✅ Cada produto tem apenas **UMA story** salva
- ✅ Ao gerar um novo story do mesmo produto, a versão antiga é **automaticamente removida**
- ✅ Histórico limpo e organizado

## 🎯 Personalização

### Tag de Afiliado
Na seção superior, altere sua tag de afiliado. Padrão: `jotape012d-20`

### Mascote
Clique em "Mascote" e faça upload de uma imagem (PNG, JPG, SVG)

## 📦 Estrutura

```
botinsta2/
├── public/
│   ├── index.html          # Interface principal
│   ├── app.js              # Lógica (localStorage)
│   ├── style.css           # Estilos modernos
│   └── mascot.svg          # Robô padrão
├── src/
│   ├── serpapi.js          # Integração SerpAPI
│   ├── scraper.js          # Fallback scraper
│   └── db.js               # Database simples
├── server.js               # Express server
├── package.json
├── iniciar.bat             # Atalho Windows
└── README.md
```

## 🔧 Stack Técnico

**Backend:**
- Node.js + Express
- SerpAPI (busca)
- lowdb (DB simples)

**Frontend:**
- HTML5 + CSS3  
- Vanilla JavaScript
- Canvas API (geração de imagens)
- localStorage (salvamento)
## 🚀 Deploy para Produção

### Heroku (Recomendado - Gratuito com limitações)

1. **Instale Heroku CLI:**
   - Windows: https://devcenter.heroku.com/articles/heroku-cli

2. **Faça login:**
   ```bash
   heroku login
   ```

3. **Crie um novo app:**
   ```bash
   heroku create seu-app-name
   ```

4. **Configure a chave SerpAPI:**
   ```bash
   heroku config:set SERPAPI_KEY=sua_chave_aqui
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

6. **Acesse:**
   ```bash
   heroku open
   ```

### Render.com (Melhor opção GRATUITA e estável)

1. **Fork no GitHub** ou faz upload do projeto

2. **Acesse** https://render.com e crie conta

3. **Novo Web Service:**
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`

4. **Environment Variables:**
   - `SERPAPI_KEY=sua_chave_aqui`

5. **Deploy automático!** ✅

### Railway.app (Alternativa GRATUITA)

1. Acesse https://railway.app
2. Clique em "New Project" → "Deploy from Github"
3. Configure `SERPAPI_KEY` no painel
4. Pronto! Seu app está online

### Seu Servidor VPS

```bash
# SSH no servidor
ssh seu-servidor.com

# Clone o repo
git clone seu-repo
cd botinsta2

# Instale dependências
npm install

# Use PM2 para manter rodando
npm install -g pm2
pm2 start server.js --name "botinsta2"
pm2 startup
pm2 save

# Configure Nginx/Apache como reverse proxy
```

---

### Seu Servidor

## 🛠 Troubleshooting

### "Porta 3000 já está em uso"
```powershell
Get-Process -Name node | Stop-Process -Force
```

### "Erro ao buscar produtos"
- Verifique internet
- Chave SerpAPI pode ter atingido limite

### "Stories não salvam"
- Limpe cache do navegador (Ctrl+Shift+Del)
- Verifique se localStorage está habilitado

## 📞 Suporte

Abra DevTools (F12) → Console para ver erros detalhados.

---

**Desenvolvido com ❤️**
# 🤖 BotInsta Dashboard - Guia de Uso

## ✅ Como Usar

### Opção 1: Usar o Arquivo .BAT (Recomendado para Windows)
1. Abra a pasta `C:\Users\jpgui\OneDrive\Documents\botinsta2`
2. **Clique duplo em `iniciar.bat`**
3. O navegador abrirá automaticamente em `http://localhost:3000`

### Opção 2: Usar PowerShell
```powershell
cd "C:\Users\jpgui\OneDrive\Documents\botinsta2"
$env:SERPAPI_KEY='bc254ec4fcb8adb93066f1df7a9536a2cc70a1ca52cdab243e626518cdbbec5d'
npm start
```

Depois, abra o navegador em: `http://localhost:3000`

---

## 📋 Funcionalidades

### 1. **Buscar Produtos**
- Digite o termo de busca (ex: "notebooks em promoção")
- Clique em **BUSCAR**
- Veja os produtos encontrados na Amazon

### 2. **Gerar Story**
- Clique em um produto
- Clique em **"Gerar Story"**
- A story será criada com:
  - 📷 Imagem do produto (centralizada)
  - 🤖 Mascote no canto inferior direito
  - 🎨 Design profissional com gradiente
  - 🔗 Link de afiliado automático

### 3. **Salvar Stories**
- Ao gerar uma story, clique em **"Baixar Imagem"**
- A story é salva automaticamente em **"Meus Stories"**
- As stories ficam salvas **mesmo após refresh** da página

### 4. **Gerenciar Stories Salvas**
- Clique na aba **"Meus Stories"**
- Veja todas as stories geradas
- **Opções por story:**
  - ✅ **Baixar** - Salva a imagem PNG no seu computador
  - ❌ **Excluir** - Remove a story do carrinho

### 5. **Personalizar Tag de Afiliado**
- No topo da página, altere a **"Tag de afiliado"**
- Padrão: `jotape012d-20`
- Suas novas stories usarão a tag personalizada

### 6. **Upload de Mascote Personalizado**
- Clique em **"Mascote"** (input de arquivo)
- Selecione uma imagem do seu computador
- Próximas stories usarão o novo mascote

---

## 💾 Dados Locais

Tudo é salvo no seu navegador (localStorage):
- ✅ Tag de afiliado
- ✅ Stories geradas
- ✅ Mascote customizado

**Nada é enviado para servidor - tudo é local!**

---

## 🚀 Hospedagem Futura

Para hospedar este projeto:

### Opção A: Vercel (Recomendado)
```bash
npm install -g vercel
vercel --prod
```

### Opção B: Heroku
```bash
heroku create seu-app-name
git push heroku main
```

### Opção C: seu próprio servidor
- Copie os arquivos para o servidor
- Instale `Node.js`
- Execute: `npm install && npm start`

---

## 📝 Estrutura do Projeto

```
botinsta2/
├── public/
│   ├── index.html          # Página principal
│   ├── app.js              # Lógica do app (localStorage)
│   ├── style.css           # Estilos
│   └── mascot.svg          # Mascote padrão (robô)
├── src/
│   ├── db.js               # Database (lowdb)
│   ├── serpapi.js          # Integração SerpAPI
│   └── scraper.js          # Fallback scraper
├── server.js               # Express server
├── package.json            # Dependências
├── iniciar.bat             # Atalho para abrir (Windows)
└── README.md               # Este arquivo
```

---

## 🔧 Troubleshooting

### "Porta 3000 já está em uso"
```powershell
Get-Process -Name node | Stop-Process -Force
```

### "Erro ao buscar produtos"
- Verifique sua conexão internet
- Chave SerpAPI pode estar sem quota

### "Stories não salvam"
- Limpe o cache do navegador (Ctrl+Shift+Del)
- Verifique se localStorage está habilitado

### "Mascote não aparece"
- Tente fazer upload de uma nova imagem
- Formatos: PNG, JPG, SVG

---

## 📞 Suporte

Para erros ou dúvidas:
1. Abra o DevTools (F12)
2. Vá em "Console"
3. Procure por mensagens de erro (vermelho)
4. Copie e compartilhe a mensagem

---

**Desenvolvido com ❤️ por BotInsta**

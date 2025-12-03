# ⚙️ Configuração do Supabase

## 1. Criar Tabela no Supabase

1. Acesse seu projeto no Supabase: https://app.supabase.com
2. Vá para **SQL Editor**
3. Copie e execute o SQL do arquivo `/sql/init-supabase.sql`

Ou execute este SQL diretamente:

```sql
CREATE TABLE stories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  price TEXT,
  image TEXT,
  canvasData LONGTEXT NOT NULL,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_stories_title ON stories(title);
CREATE INDEX idx_stories_created_at ON stories(created_at DESC);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON stories
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON stories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete" ON stories
  FOR DELETE USING (true);
```

## 2. Verificar Credenciais

As credenciais já estão no arquivo `.env`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 3. Testar

1. Inicie o servidor: `npm start`
2. Acesse http://localhost:3000
3. Gere uma story
4. Verifique se está salva em "Meus Stories"
5. A story agora será sincronizada com Supabase! 🎉

## 4. Comportamento

- ✅ Stories são salvas no Supabase automaticamente
- ✅ Ao gerar story do mesmo produto, a versão antiga é **substituída**
- ✅ Dados persistem mesmo após recarregar a página
- ✅ Dados sincronizam entre dispositivos (mesma conta)
- ✅ Fallback para localStorage se Supabase falhar

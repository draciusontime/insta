-- Execute este SQL no Supabase SQL Editor para criar a tabela de stories

CREATE TABLE stories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  price TEXT,
  image TEXT,
  canvas_data TEXT NOT NULL,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para queries mais rápidas
CREATE INDEX idx_stories_title ON stories(title);
CREATE INDEX idx_stories_created_at ON stories(created_at DESC);

-- Permitir acesso público (anon role) para leitura e escrita
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON stories
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON stories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete" ON stories
  FOR DELETE USING (true);

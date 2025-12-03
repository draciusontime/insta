const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para inicializar o banco de dados (criar tabela se não existir)
async function initDatabase() {
  try {
    // Testa conexão
    const { data, error } = await supabase.from('stories').select('count', { count: 'exact' }).limit(0);
    
    if (error && error.code === 'PGRST116') {
      // Tabela não existe, vamos criar
      console.log('📊 Tabela "stories" não encontrada. Crie manualmente no Supabase SQL Editor:');
      console.log(`
        CREATE TABLE stories (
          id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          title TEXT NOT NULL,
          price TEXT,
          image TEXT,
          canvas_data TEXT NOT NULL,
          link TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      return false;
    }
    
    console.log('✅ Supabase conectado com sucesso!');
    return true;
  } catch (err) {
    console.error('❌ Erro ao conectar Supabase:', err.message);
    return false;
  }
}

module.exports = { supabase, initDatabase };

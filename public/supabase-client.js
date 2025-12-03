// Cliente Supabase para o frontend
// Usa o endpoint da API do backend para operações de stories

const SUPABASE_API = '/api/stories';

// Salvar story no Supabase (via backend)
async function savStoryToSupabase(storyData) {
  try {
    // Converte camelCase para snake_case
    const dbData = {
      title: storyData.title,
      price: storyData.price,
      image: storyData.image,
      canvas_data: storyData.canvasData,
      link: storyData.link
    };
    
    const response = await fetch(SUPABASE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbData)
    });

    if (!response.ok) {
      throw new Error(`Erro ao salvar: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Story salva no Supabase:', result);
    return result.data;
  } catch (err) {
    console.error('❌ Erro ao salvar story:', err.message);
    throw err;
  }
}

// Carregar todas as stories
async function loadStoriesFromSupabase() {
  try {
    const response = await fetch(SUPABASE_API);
    
    if (!response.ok) {
      throw new Error(`Erro ao carregar: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ ${data.length} stories carregadas do Supabase`);
    return data;
  } catch (err) {
    console.error('❌ Erro ao carregar stories:', err.message);
    return [];
  }
}

// Deletar story
async function deleteStoryFromSupabase(storyId) {
  try {
    const response = await fetch(`${SUPABASE_API}/${storyId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar: ${response.status}`);
    }

    console.log('✅ Story deletada do Supabase');
    return true;
  } catch (err) {
    console.error('❌ Erro ao deletar story:', err.message);
    throw err;
  }
}

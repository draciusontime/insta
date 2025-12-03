// ==================== CONFIGURAÇÕES ====================
const STORAGE_KEY_SAVED_STORIES = 'botinsta_saved_stories';
const STORAGE_KEY_TEMPLATE = 'storyTemplate';

let currentProduct = null;
let currentStoryProduct = null; // Armazena dados do produto enquanto a story está aberta
let templateImage = null; // Imagem do template da story
let savedStories = [];

// ==================== DOM ELEMENTS ====================
// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Modals
const modal = document.getElementById('modal');
const modalBg = document.getElementById('modal-bg');
const storyModal = document.getElementById('storyModal');
const storyModalBg = document.getElementById('story-modal-bg');

// Main Modal Elements
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalPrice = document.getElementById('modal-price');
const modalLink = document.getElementById('modal-link');
const closeBtn = document.getElementById('close');
const generateBtn = document.getElementById('generate');
const saveBtn = document.getElementById('saveProduct');

// Story Modal Elements
const closeStoryBtn = document.getElementById('close-story');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('download');
const storyTitle = document.getElementById('story-product-title');
const storyPrice = document.getElementById('story-product-price');
const storyLink = document.getElementById('story-product-link');

// Search & Config
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const suggestionsContainer = document.getElementById('suggestions');

// Saved Stories
const savedStoriesContainer = document.getElementById('saved-stories');
const savedCountBadge = document.getElementById('saved-count');

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  loadDefaultTemplate();
  setupEventListeners();
  setupTabs();
  loadSavedStories();
  loadDefaultSuggestions();
});

// ==================== TAB SYSTEM ====================
function setupTabs() {
  console.log('setupTabs() called');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      console.log('Tab clicked:', tabName);
      
      // Remove active from all tabs
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      
      // Add active to clicked tab
      btn.classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.add('active');
      console.log('Tab switched to:', tabName);
      
      if (tabName === 'saved') {
        console.log('Calling renderSavedStories()');
        renderSavedStories();
      }
    });
  });
}

// ==================== TEMPLATE ====================
function loadDefaultTemplate() {
  // Tenta carregar template da pasta public
  fetch('/Modelo Storys.jpg')
    .then(r => {
      if (r.ok) {
        return r.blob();
      }
      throw new Error('Template não encontrado');
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      templateImage = new Image();
      templateImage.src = url;
      console.log('Template padrão carregado');
    })
    .catch(err => {
      console.log('Nenhum template padrão encontrado, usando gerador padrão');
      templateImage = null;
    });
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  closeBtn.addEventListener('click', closeModal);
  modalBg.addEventListener('click', closeModal);
  closeStoryBtn.addEventListener('click', closeStoryModal);
  storyModalBg.addEventListener('click', closeStoryModal);
  generateBtn.addEventListener('click', generateStory);
  saveBtn.addEventListener('click', saveProduct);
  downloadBtn.addEventListener('click', downloadImage);

  // Event listeners para modal de visualização de story salva
  const closeSavedStoryViewBtn = document.getElementById('close-saved-story-view');
  const savedStoryViewBg = document.getElementById('saved-story-view-bg');
  const downloadSavedFromViewBtn = document.getElementById('download-saved-from-view');
  const deleteSavedFromViewBtn = document.getElementById('delete-saved-from-view');

  closeSavedStoryViewBtn.addEventListener('click', closeSavedStoryView);
  savedStoryViewBg.addEventListener('click', closeSavedStoryView);
  downloadSavedFromViewBtn.addEventListener('click', () => {
    if (currentViewedStory) {
      downloadSavedStory(currentViewedStory);
    }
  });
  deleteSavedFromViewBtn.addEventListener('click', () => {
    if (currentViewedStory) {
      deleteStory(currentViewedStory.id);
      closeSavedStoryView();
    }
  });
}

// ==================== SEARCH & SUGGESTIONS ====================
async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  searchBtn.disabled = true;
  searchBtn.textContent = 'Buscando...';

  try {
    const results = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then(r => r.json());
    renderGrid(results);
  } catch (err) {
    console.error('Erro:', err);
    suggestionsContainer.innerHTML = '<p style="color: red; padding: 20px;">Erro na busca</p>';
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = 'BUSCAR';
  }
}

async function loadDefaultSuggestions() {
  try {
    const suggestions = await fetch('/api/suggestions').then(r => r.json());
    if (suggestions && Array.isArray(suggestions) && suggestions.length > 0) {
      renderGrid(suggestions);
    }
  } catch (err) {
    console.error('Erro ao carregar sugestões:', err);
  }
}

function renderGrid(items) {
  suggestionsContainer.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${useProxy(item.image)}" alt="${item.title}" class="product-card-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2214%22 fill=%22%23999%22%3ESem imagem%3C/text%3E%3C/svg%3E'" />
      <div class="product-card-body">
        <h3 class="product-card-title">${item.title || 'Sem título'}</h3>
        <p class="product-card-price">${item.price || 'Preço não disponível'}</p>
        <button class="product-card-button">Ver Detalhes</button>
      </div>
    `;
    card.querySelector('.product-card-button').addEventListener('click', () => openModal(item));
    suggestionsContainer.appendChild(card);
  });
}

function useProxy(url) {
  if (!url) return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3C/svg%3E';
  if (url.startsWith('data:')) return url;
  if (url.startsWith('http://localhost')) return url;
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

// ==================== PRODUCT MODAL ====================
function openModal(item) {
  currentProduct = item;
  modalImage.src = useProxy(item.image);
  modalTitle.textContent = item.title || 'Sem título';
  modalPrice.textContent = item.price || '';

  // Extrai ASIN
  // Extrai ASIN do link ou usa valores alternativos
  let asin = '';
  let link = '';
  
  if (item.link) {
    // Tenta extrair ASIN do link
    const dpMatch = item.link.match(/\/dp\/([A-Z0-9]+)/);
    if (dpMatch && dpMatch[1]) {
      asin = dpMatch[1];
      link = `https://www.amazon.com.br/dp/${asin}`;
    } else {
      // Se o link já é completo, use diretamente
      link = item.link.startsWith('http') ? item.link : `https://www.amazon.com.br${item.link}`;
    }
  } else if (item.asin) {
    asin = item.asin;
    link = `https://www.amazon.com.br/dp/${asin}`;
  } else if (item.id) {
    asin = item.id;
    link = `https://www.amazon.com.br/dp/${asin}`;
  } else {
    // Fallback com ID genérico
    link = 'https://www.amazon.com.br';
  }

  modalLink.href = link;
  modalLink.textContent = link;

  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
  currentProduct = null;
}

// ==================== STORY GENERATION ====================
async function generateStory() {
  if (!currentProduct) {
    alert('Selecione um produto primeiro');
    return;
  }

  // Salva os dados do produto ANTES de chamar closeModal que zera currentProduct
  currentStoryProduct = {
    title: currentProduct.title,
    price: currentProduct.price,
    link: currentProduct.link,
    asin: currentProduct.asin,
    id: currentProduct.id,
    image: currentProduct.image
  };

  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    closeModal();
    
    // Limpa canvas
    ctx.clearRect(0, 0, 1080, 1920);

    // Se tem template, desenha ele primeiro
    if (templateImage && templateImage.complete && templateImage.naturalWidth > 0) {
      // Desenha o template em tela cheia
      ctx.drawImage(templateImage, 0, 0, 1080, 1920);
    } else {
      // Usa o design padrão como fallback
      // Fundo azul
      ctx.fillStyle = '#0066cc';
      ctx.fillRect(0, 0, 1080, 1920);

      // Stripe roxo no topo
      ctx.fillStyle = '#667eea';
      ctx.fillRect(0, 0, 1080, 180);

      // Cartão branco arredondado
      roundRectFill(ctx, 60, 280, 960, 1000, 30, '#ffffff');
    }

    // Centraliza imagem no cartão/espaço branco
    // Define as dimensões EXATAS do espaço branco no seu template
    // Quadrado branco deve estar aproximadamente nesta área
    const productArea = {
      x: 90,           // Posição X do começo do quadrado branco
      y: 200,          // Posição Y do começo do quadrado branco (topo) - ajustado mais para cima
      width: 900,      // Largura total do quadrado branco
      height: 900      // Altura total do quadrado branco
    };

    // Padding interno: espaço mínimo das bordas
    // Margem de segurança para garantir que imagem NÃO ultrapasse os limites
    const padding = 60;
    const availableWidth = productArea.width - (padding * 2);
    const availableHeight = productArea.height - (padding * 2);

    // Redimensiona a imagem proporcionalmente para caber no espaço
    let imgWidth = img.width;
    let imgHeight = img.height;
    const aspectRatio = imgWidth / imgHeight;

    // Calcula o tamanho máximo respeitando a proporção
    let finalWidth, finalHeight;
    if (aspectRatio > 1) {
      // Imagem é mais larga (paisagem)
      finalWidth = Math.min(availableWidth, availableHeight * aspectRatio);
      finalHeight = finalWidth / aspectRatio;
    } else {
      // Imagem é mais alta (retrato)
      finalHeight = Math.min(availableHeight, availableWidth / aspectRatio);
      finalWidth = finalHeight * aspectRatio;
    }
    
    // Aplica escala de segurança de 95% para garantir que não toque nas bordas
    finalWidth *= 0.95;
    finalHeight *= 0.95;

    // Garante tamanho mínimo (não fica muito pequeno)
    const minSize = 100;
    if (finalWidth < minSize || finalHeight < minSize) {
      if (aspectRatio > 1) {
        finalWidth = minSize;
        finalHeight = minSize / aspectRatio;
      } else {
        finalHeight = minSize;
        finalWidth = minSize * aspectRatio;
      }
    }

    // CENTRALIZA PERFEITAMENTE NO MEIO DO QUADRADO BRANCO
    const centerX = productArea.x + (productArea.width / 2);
    const centerY = productArea.y + (productArea.height / 2);
    const x = centerX - (finalWidth / 2);
    const y = centerY - (finalHeight / 2);

    // DEBUG: Log das dimensões para ajuste fino
    console.log(`📐 Imagem final: ${Math.round(finalWidth)}x${Math.round(finalHeight)}px`);
    console.log(`📍 Posição: X=${Math.round(x)}, Y=${Math.round(y)}`);
    console.log(`📦 Área do quadrado: ${productArea.width}x${productArea.height}px`);
    console.log(`🎯 Espaço disponível: ${Math.round(availableWidth)}x${Math.round(availableHeight)}px`);

    // Desenha a imagem CENTRALIZADA no quadrado branco
    ctx.drawImage(img, x, y, finalWidth, finalHeight);

    // Abre modal com a story - USANDO currentStoryProduct
    storyTitle.textContent = currentStoryProduct.title || '';
    storyPrice.textContent = currentStoryProduct.price || '';
    
    // Extrai ASIN do link ou usa valores alternativos
    let asin = '';
    let productLink = '';
    
    if (currentStoryProduct.link) {
      const dpMatch = currentStoryProduct.link.match(/\/dp\/([A-Z0-9]+)/);
      if (dpMatch && dpMatch[1]) {
        asin = dpMatch[1];
        productLink = `https://www.amazon.com.br/dp/${asin}`;
      } else {
        productLink = currentStoryProduct.link.startsWith('http') ? currentStoryProduct.link : `https://www.amazon.com.br${currentStoryProduct.link}`;
      }
    } else if (currentStoryProduct.asin) {
      asin = currentStoryProduct.asin;
      productLink = `https://www.amazon.com.br/dp/${asin}`;
    } else if (currentStoryProduct.id) {
      asin = currentStoryProduct.id;
      productLink = `https://www.amazon.com.br/dp/${asin}`;
    } else {
      productLink = 'https://www.amazon.com.br';
    }
    
    storyLink.href = productLink;
    storyLink.textContent = productLink;

    storyModal.classList.remove('hidden');
    
    // 🎉 SALVA A STORY AUTOMATICAMENTE AO GERAR
    saveStory();
  };

  img.onerror = () => {
    alert('Erro ao carregar imagem do produto');
  };

  img.src = useProxy(currentStoryProduct.image);
}

function roundRectFill(ctx, x, y, width, height, radius, fillColor) {
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

function closeStoryModal() {
  storyModal.classList.add('hidden');
}

// ==================== DOWNLOAD & SAVE ====================
function downloadImage() {
  console.log('downloadImage() called');
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `story-${currentStoryProduct.title.slice(0, 20).replace(/\s+/g, '_')}-${Date.now()}.png`;
  console.log('Clicking download link');
  link.click();
  console.log('✅ Download iniciado - Story já foi salva automaticamente ao gerar');
}

function saveStory() {
  console.log('saveStory() called');
  console.log('currentStoryProduct:', currentStoryProduct);
  console.log('storyLink.href:', storyLink.href);
  
  if (!currentStoryProduct) {
    console.log('Erro: currentStoryProduct is null');
    return;
  }

  const storyData = {
    title: currentStoryProduct.title,
    price: currentStoryProduct.price,
    image: currentStoryProduct.image,
    canvasData: canvas.toDataURL('image/png'),
    link: storyLink.href
  };

  console.log('storyData:', storyData);
  
  // Salva no Supabase
  savStoryToSupabase(storyData)
    .then(() => {
      // Recarrega as stories
      loadSavedStories();
      renderSavedStories();
      console.log('✅ Story salva com sucesso!');
    })
    .catch((err) => {
      console.error('❌ Erro ao salvar story:', err);
      alert('Erro ao salvar story: ' + err.message);
    });
}

async function saveProduct() {
  if (!currentProduct) return;

  // Extrai ASIN do link ou usa valores alternativos
  let asin = '';
  let productLink = '';
  
  if (currentProduct.link) {
    const dpMatch = currentProduct.link.match(/\/dp\/([A-Z0-9]+)/);
    if (dpMatch && dpMatch[1]) {
      asin = dpMatch[1];
      productLink = `https://www.amazon.com.br/dp/${asin}`;
    } else {
      productLink = currentProduct.link.startsWith('http') ? currentProduct.link : `https://www.amazon.com.br${currentProduct.link}`;
    }
  } else if (currentProduct.asin) {
    asin = currentProduct.asin;
    productLink = `https://www.amazon.com.br/dp/${asin}`;
  } else if (currentProduct.id) {
    asin = currentProduct.id;
    productLink = `https://www.amazon.com.br/dp/${asin}`;
  } else {
    productLink = 'https://www.amazon.com.br';
  }

  try {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: currentProduct.title,
        image: currentProduct.image,
        price: currentProduct.price,
        productLink: productLink
      })
    });

    if (res.ok) {
      alert('Produto salvo com sucesso!');
      closeModal();
    } else {
      alert('Erro ao salvar');
    }
  } catch (err) {
    console.error('Erro:', err);
    alert('Erro ao salvar produto');
  }
}

// ==================== SAVED STORIES ====================
async function loadSavedStories() {
  console.log('loadSavedStories() called');
  try {
    savedStories = await loadStoriesFromSupabase();
    console.log('savedStories loaded from Supabase:', savedStories);
  } catch (err) {
    console.error('Erro ao carregar stories do Supabase:', err);
    // Fallback para localStorage se Supabase falhar
    const stored = localStorage.getItem(STORAGE_KEY_SAVED_STORIES);
    savedStories = stored ? JSON.parse(stored) : [];
  }
  updateSavedCount();
}

function updateSavedCount() {
  console.log('updateSavedCount() called, count:', savedStories.length);
  savedCountBadge.textContent = savedStories.length;
}

function renderSavedStories() {
  console.log('renderSavedStories() called');
  console.log('savedStories:', savedStories);
  console.log('savedStories.length:', savedStories.length);
  
  savedStoriesContainer.innerHTML = '';

  if (savedStories.length === 0) {
    console.log('No stories saved, showing empty state');
    savedStoriesContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">📷</div>
        <p>Nenhuma story salva ainda!</p>
        <p style="font-size: 12px; margin-top: 8px;">Gere uma story de um produto para salvá-la aqui.</p>
      </div>
    `;
    return;
  }

  console.log('Rendering', savedStories.length, 'stories');
  savedStories.forEach(story => {
    const card = document.createElement('div');
    card.className = 'saved-story-card';

    // Usa canvas_data (do Supabase) ou canvasData (fallback para localStorage)
    const imageData = story.canvas_data || story.canvasData;

    card.innerHTML = `
      <div class="saved-story-card-preview">
        <img src="${imageData}" alt="story preview" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2214%22 fill=%22%23999%22%3EImagem indisponível%3C/text%3E%3C/svg%3E'" />
      </div>
      <div class="saved-story-card-info">
        <h3 class="saved-story-card-title">${story.title}</h3>
        <p class="saved-story-card-price">${story.price}</p>
        <div class="saved-story-actions">
          <button class="btn-download-saved" data-id="${story.id}">Baixar</button>
          <button class="btn-delete-saved" data-id="${story.id}">Excluir</button>
        </div>
      </div>
    `;

    const previewDiv = card.querySelector('.saved-story-card-preview');
    const downloadBtn = card.querySelector('.btn-download-saved');
    const deleteBtn = card.querySelector('.btn-delete-saved');

    // Clique na imagem abre a modal de visualização
    previewDiv.addEventListener('click', () => openSavedStoryView(story));
    
    // Botões funcionam normalmente
    downloadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadSavedStory(story);
    });
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteStory(story.id);
    });

    savedStoriesContainer.appendChild(card);
  });
}

function downloadSavedStory(story) {
  const link = document.createElement('a');
  // Usa canvas_data (do Supabase) ou canvasData (fallback para localStorage)
  const imageData = story.canvas_data || story.canvasData;
  link.href = imageData;
  link.download = `story-${story.title.slice(0, 20).replace(/\s+/g, '_')}-${story.id}.png`;
  link.click();
}

function deleteStory(storyId) {
  if (!confirm('Tem certeza que deseja excluir esta story?')) return;

  // Deleta do Supabase
  deleteStoryFromSupabase(storyId)
    .then(() => {
      // Recarrega as stories
      loadSavedStories();
      renderSavedStories();
      console.log('✅ Story deletada com sucesso!');
    })
    .catch((err) => {
      console.error('❌ Erro ao deletar story:', err);
      alert('Erro ao deletar story: ' + err.message);
    });
}

// ==================== SAVED STORY VIEW MODAL ====================
let currentViewedStory = null;

function openSavedStoryView(story) {
  console.log('openSavedStoryView() called for:', story.title);
  currentViewedStory = story;

  const savedStoryViewModal = document.getElementById('savedStoryViewModal');
  const savedStoryViewImage = document.getElementById('saved-story-view-image');
  const savedStoryViewTitle = document.getElementById('saved-story-view-title');
  const savedStoryViewPrice = document.getElementById('saved-story-view-price');
  const savedStoryViewLink = document.getElementById('saved-story-view-link');

  // Usa canvas_data (do Supabase) ou canvasData (fallback para localStorage)
  const imageData = story.canvas_data || story.canvasData;
  
  savedStoryViewImage.src = imageData;
  savedStoryViewTitle.textContent = story.title;
  savedStoryViewPrice.textContent = story.price;
  savedStoryViewLink.href = story.link;
  savedStoryViewLink.textContent = story.link;

  savedStoryViewModal.classList.remove('hidden');
}

function closeSavedStoryView() {
  const savedStoryViewModal = document.getElementById('savedStoryViewModal');
  savedStoryViewModal.classList.add('hidden');
  currentViewedStory = null;
}

// ==================== INITIAL LOAD ====================
loadDefaultSuggestions();

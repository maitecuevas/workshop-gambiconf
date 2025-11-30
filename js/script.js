document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('messages-container');
    const searchInput = document.getElementById('search-input');
    const dailyGambiarraSection = document.getElementById('daily-gambiarra-section');
    let colorPalette = [];
    let allMessages = [];

    // ==================== Date-Based Seeding ====================
    
    /**
     * Gera um valor seed consistente baseado na data do dia
     * Mesma data sempre gera o mesmo valor seed
     * @returns {number} Valor seed baseado na data no formato YYYYMMDD (ex: 20251130 para 30/11/2025)
     */
    function generateDayBasedIndex() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const day = today.getDate();
        
        // Combina data em um número para seed
        const dayNumber = year * 10000 + (month + 1) * 100 + day;
        return dayNumber;
    }

    /**
     * Calcula um índice determinístico para a gambiarra do dia
     * @param {number} messagesCount - Quantidade total de mensagens
     * @returns {number} Índice da gambiarra do dia (0 a messagesCount-1)
     */
    function getDailyGambiarraIndex(messagesCount) {
        if (messagesCount === 0) return -1;
        const seed = generateDayBasedIndex();
        return seed % messagesCount;
    }

    /**
     * Seleciona a gambiarra do dia baseada na data
     * @param {Array} messages - Array de mensagens
     * @returns {Object|null} Mensagem da gambiarra do dia ou null
     */
    function selectDailyGambiarra(messages) {
        if (!Array.isArray(messages) || messages.length === 0) {
            return null;
        }
        const index = getDailyGambiarraIndex(messages.length);
        return messages[index];
    }

    // ==================== Daily Gambiarra Card Creation ====================

    /**
     * Cria o elemento HTML do badge "⭐ Gambiarra do Dia"
     * @returns {HTMLElement} Elemento do badge
     */
    function createDailyBadge() {
        const badge = document.createElement('div');
        badge.className = 'daily-badge';
        badge.textContent = '⭐ Gambiarra do Dia';
        badge.setAttribute('aria-label', 'Badge de Gambiarra do Dia');
        return badge;
    }

    /**
     * Cria o conteúdo da gambiarra do dia
     * @param {string} message - Texto da mensagem
     * @returns {HTMLElement} Parágrafo com o conteúdo
     */
    function createDailyContent(message) {
        const content = document.createElement('p');
        content.className = 'daily-gambiarra-content';
        content.textContent = `"${message}"`;
        return content;
    }

    /**
     * Cria o footer com autor e data
     * @param {string} author - Nome do autor
     * @param {string} date - Data da gambiarra
     * @returns {HTMLElement} Div com informações do autor e data
     */
    function createDailyFooter(author, date) {
        const footer = document.createElement('div');
        footer.className = 'daily-gambiarra-footer';

        const authorSpan = document.createElement('span');
        authorSpan.className = 'daily-gambiarra-author';
        authorSpan.textContent = `- ${author}`;

        const dateSpan = document.createElement('span');
        dateSpan.className = 'daily-gambiarra-date';
        try {
            const dateObj = new Date(date);
            dateSpan.textContent = dateObj.toLocaleDateString('pt-BR');
        } catch (e) {
            dateSpan.textContent = date;
        }

        footer.appendChild(authorSpan);
        footer.appendChild(dateSpan);
        return footer;
    }

    /**
     * Cria o card completo da Gambiarra do Dia
     * @param {Object} gambiarra - Objeto com message, name, date
     * @returns {HTMLElement} Card da gambiarra do dia
     */
    function createDailyGambiarraCard(gambiarra) {
        const container = document.createElement('div');
        container.className = 'daily-gambiarra-container';

        const badge = createDailyBadge();
        container.appendChild(badge);

        const card = document.createElement('div');
        card.className = 'daily-gambiarra-card';

        const content = createDailyContent(gambiarra.message);
        card.appendChild(content);

        const footer = createDailyFooter(gambiarra.name, gambiarra.date);
        card.appendChild(footer);

        container.appendChild(card);
        return container;
    }

    /**
     * Renderiza a Gambiarra do Dia
     * @param {Array} messages - Array de mensagens
     */
    function renderDailyGambiarra(messages) {
        const gambiarra = selectDailyGambiarra(messages);

        if (!gambiarra) {
            dailyGambiarraSection.style.display = 'none';
            return;
        }

        dailyGambiarraSection.innerHTML = '';
        const card = createDailyGambiarraCard(gambiarra);
        dailyGambiarraSection.appendChild(card);
        dailyGambiarraSection.style.display = 'flex';
    }

    // ==================== Existing Functions ====================
    function extractColorsFromImage(imagePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;
                const colorMap = {};

                // Amostragem de pixels (a cada 10 pixels para melhor performance)
                for (let i = 0; i < pixels.length; i += 40) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    const a = pixels[i + 3];

                    // Ignora pixels transparentes ou muito claros/escuros
                    if (a < 125 || (r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) {
                        continue;
                    }

                    // Agrupa cores similares (reduz precisão)
                    const rBucket = Math.round(r / 30) * 30;
                    const gBucket = Math.round(g / 30) * 30;
                    const bBucket = Math.round(b / 30) * 30;
                    const colorKey = `${rBucket},${gBucket},${bBucket}`;

                    colorMap[colorKey] = (colorMap[colorKey] || 0) + 1;
                }

                // Ordena por frequência e pega as cores mais comuns
                const sortedColors = Object.entries(colorMap)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([color]) => {
                        const [r, g, b] = color.split(',');
                        return `rgb(${r}, ${g}, ${b})`;
                    });

                resolve(sortedColors);
            };
            img.onerror = reject;
            img.src = imagePath;
        });
    }

    // Função para carregar paleta de cores das imagens
    async function loadColorPalette() {
        const images = ['imgs/logo.png', 'imgs/favicon.png'];
        const allColors = [];

        for (const imagePath of images) {
            try {
                const colors = await extractColorsFromImage(imagePath);
                allColors.push(...colors);
            } catch (error) {
                console.warn(`Não foi possível extrair cores de ${imagePath}:`, error);
            }
        }

        // Remove duplicatas e mantém apenas cores únicas
        colorPalette = [...new Set(allColors)];
        
        // Se não conseguiu extrair cores, usa cores padrão
        if (colorPalette.length === 0) {
            colorPalette = ['#ff7b72', '#d2a8ff', '#79c0ff', '#ffa657', '#2dba4e', '#6e5494'];
        }

        console.log('Paleta de cores extraída:', colorPalette);
    }

    // Função para carregar as mensagens
    async function loadMessages() {
        try {
            const response = await fetch('data/messages.json');
            if (!response.ok) {
                throw new Error('Não foi possível carregar as mensagens');
            }
            const messages = await response.json();
            allMessages = Array.isArray(messages) ? messages : [];
            renderMessages(allMessages);
        } catch (error) {
            console.error('Erro:', error);
            messagesContainer.innerHTML = '<p class="error">Ops! Ocorreu um erro ao carregar os recados.</p>';
        }
    }

    // Função para renderizar as mensagens na tela
    function renderMessages(messages) {
        messagesContainer.innerHTML = ''; // Limpa o container (remove o loading)

        // Renderiza a Gambiarra do Dia (sempre que renderizar mensagens)
        renderDailyGambiarra(messages);

        // Inverte a ordem para mostrar os mais recentes primeiro (opcional, dependendo de como o JSON é mantido)
        // Vamos assumir que novos são adicionados no final do array, então invertemos para mostrar no topo
        const reversedMessages = [...messages].reverse();

        reversedMessages.forEach((msg, index) => {
            const card = createMessageCard(msg, index);
            messagesContainer.appendChild(card);
        });
    }

    // Função para criar o elemento HTML de um card
    function createMessageCard(msg, index) {
        const card = document.createElement('div');
        card.className = 'message-card';
        
        // Usa uma cor da paleta extraída das imagens
        const colorIndex = index % colorPalette.length;
        const borderColor = colorPalette[colorIndex];
        card.style.borderTopColor = borderColor;

        const content = document.createElement('p');
        content.className = 'message-content';
        content.textContent = `"${msg.message}"`;

        const footer = document.createElement('div');
        footer.className = 'message-author';
        
        const authorName = document.createElement('span');
        authorName.textContent = `- ${msg.name}`;

        const dateSpan = document.createElement('span');
        dateSpan.className = 'message-date';
        // Formata a data se possível
        try {
            const dateObj = new Date(msg.date);
            dateSpan.textContent = dateObj.toLocaleDateString('pt-BR');
        } catch (e) {
            dateSpan.textContent = msg.date;
        }

        footer.appendChild(authorName);
        footer.appendChild(dateSpan);

        card.appendChild(content);
        card.appendChild(footer);

        return card;
    }

    // Inicia o carregamento - primeiro carrega a paleta, depois as mensagens
    async function init() {
        await loadColorPalette();
        await loadMessages();
        setupSearch();
    }

    init();

    // Configura busca em tempo real
    function setupSearch() {
        if (!searchInput) return;

        const debounce = (fn, delay = 200) => {
            let t;
            return (...args) => {
                clearTimeout(t);
                t = setTimeout(() => fn(...args), delay);
            };
        };

        const handleSearch = () => {
            const q = (searchInput.value || '').trim().toLowerCase();
            if (!q) {
                renderMessages(allMessages);
                return;
            }

            const filtered = allMessages.filter(m => {
                const msgText = (m.message || '').toLowerCase();
                const author = (m.name || '').toLowerCase();
                const date = (m.date || '').toLowerCase();
                return (
                    msgText.includes(q) ||
                    author.includes(q) ||
                    date.includes(q)
                );
            });

            renderMessages(filtered);
        };

        searchInput.addEventListener('input', debounce(handleSearch, 150));
    }
});

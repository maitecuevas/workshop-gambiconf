document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('messages-container');
    const searchInput = document.getElementById('search-input');
    const dailyGambiarraSection = document.getElementById('daily-gambiarra-section');

    const themeToggle = document.getElementById('theme-toggle');
    const randomBtn = document.getElementById('random-highlight-btn');
    const addGifBtn = document.getElementById('add-gif-btn');
    const gifOverlay = document.getElementById('gif-overlay');
    let colorPalette = [];
    let allMessages = [];
    let statsChart = null;

    // ============ DARK MODE ============
    // Inicializa o tema baseado na preferência salva ou preferência do sistema
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

        if (isDark) {
            document.body.classList.add('dark-mode');
            updateThemeIcon(true);
        } else {
            document.body.classList.remove('dark-mode');
            updateThemeIcon(false);
        }
    }

    // Atualiza o ícone do botão
    function updateThemeIcon(isDark) {
        if (themeToggle) {
            themeToggle.innerHTML = isDark ? '☀️' : '🌙';
            themeToggle.title = isDark ? 'Light Mode' : 'Dark Mode';
        }
    }

    // Toggle do tema
    function toggleTheme() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
    }

    // Event listener do botão
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Inicializa o tema
    initTheme();

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
            if (dailyGambiarraSection) dailyGambiarraSection.style.display = 'none';
            return;
        }

        if (!dailyGambiarraSection) return;
        dailyGambiarraSection.innerHTML = '';
        const card = createDailyGambiarraCard(gambiarra);
        dailyGambiarraSection.appendChild(card);
        dailyGambiarraSection.style.display = 'flex';
    }

    // Função para extrair cores dominantes de uma imagem
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
            renderStats(allMessages); // Atualiza as estatísticas ao carregar
            buildStats(allMessages);
        } catch (error) {
            console.error('Erro:', error);
            messagesContainer.innerHTML = '<p class="error">Ops! Ocorreu um erro ao carregar os recados.</p>';
        }
    }

    function getLikes(msgId) {
        const likes = localStorage.getItem(`like_${msgId}`);
        return likes ? parseInt(likes, 10) : 0;
    }

    function setLikes(msgId, count) {
        localStorage.setItem(`like_${msgId}`, count.toString());
    }

    function hasUserLiked(msgId) {
        return localStorage.getItem(`user_liked_${msgId}`) === 'true';
    }

    function setUserLiked(msgId, liked) {
        localStorage.setItem(`user_liked_${msgId}`, liked.toString());
    }

    function createHeartIcon(filled = false) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', filled ? '#ff7b00' : 'none');
        svg.setAttribute('stroke', '#ff7b00');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z');
        svg.appendChild(path);
        
        return svg;
    }

    // Função para renderizar as mensagens na tela
    function renderMessages(messages) {
        messagesContainer.innerHTML = ''; // Limpa o container (remove o loading)

        // Renderiza a Gambiarra do Dia (sempre que renderizar mensagens)
        renderDailyGambiarra(allMessages);

        // Inverte a ordem para mostrar os mais recentes primeiro (opcional, dependendo de como o JSON é mantido)
        // Vamos assumir que novos são adicionados no final do array, então invertemos para mostrar no topo
        const reversedMessages = [...messages].reverse();

        reversedMessages.forEach((msg, index) => {
            const card = createMessageCard(msg, index);
            messagesContainer.appendChild(card);
        });
        // Atualiza o gráfico quando a lista exibida muda (por exemplo, pela busca)
        renderStats(messages);
    }

    // ---------- Estatísticas e gráfico ----------
    function aggregateByDate(messages) {
        const counts = {};
        messages.forEach(m => {
            if (!m || !m.date) return;
            // Normaliza para formato YYYY-MM-DD
            try {
                const d = new Date(m.date);
                if (isNaN(d.getTime())) return;
                const key = d.toISOString().slice(0,10);
                counts[key] = (counts[key] || 0) + 1;
            } catch (e) {
                // se falhar, ignora
            }
        });
        return counts;
    }

    function prepareChartData(counts) {
        const entries = Object.entries(counts)
            .sort((a,b) => new Date(a[0]) - new Date(b[0]));
        const labels = entries.map(e => e[0]);
        const data = entries.map(e => e[1]);
        return { labels, data };
    }

    function renderStats(messages) {
        const chartCanvas = document.getElementById('gambiarra-stats-chart');
        const chartTypeSelect = document.getElementById('chart-type-select');
        if (!chartCanvas) return; // nada a fazer

        const counts = aggregateByDate(messages);
        const { labels, data } = prepareChartData(counts);

        // Dataset e cor
        const color = colorPalette.length ? colorPalette[0] : '#ff7b72';

        const ctx = chartCanvas.getContext('2d');

        // Se Chart.js não estiver disponível (ex.: CDN bloqueado), mostra mensagem
        if (typeof Chart === 'undefined') {
            chartCanvas.parentElement.innerHTML = '<p class="error">Gráfico indisponível (Chart.js não carregado)</p>';
            return;
        }

        const requestedType = chartTypeSelect ? chartTypeSelect.value : 'bar';

        if (statsChart) {
            // atualiza dados existentes
            statsChart.config.type = requestedType;
            statsChart.data.labels = labels;
            statsChart.data.datasets[0].data = data;
            statsChart.update();
        } else {
            // se não há dados (labels vazios), desenha um pequeno placeholder no canvas
            if (!labels.length) {
                ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
                ctx.font = '14px Inter, sans-serif';
                ctx.fillStyle = '#666';
                ctx.textAlign = 'center';
                ctx.fillText('Nenhuma gambiarra com data encontrada', chartCanvas.width / 2, chartCanvas.height / 2);
                return;
            }
            statsChart = new Chart(ctx, {
                type: requestedType,
                data: {
                    labels,
                    datasets: [{
                        label: 'Gambiarras por data',
                        data,
                        backgroundColor: color,
                        borderColor: color,
                        borderWidth: 1,
                        fill: requestedType === 'line' ? false : true,
                        tension: 0.2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            ticks: { maxRotation: 0, autoSkip: true },
                            grid: { display: false }
                        },
                        y: {
                            beginAtZero: true,
                            precision: 0
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: { mode: 'index', intersect: false }
                    }
                }
            });
        }

        // evento para mudar tipo do gráfico
        if (chartTypeSelect) {
            chartTypeSelect.onchange = () => {
                if (!statsChart) return;
                const newType = chartTypeSelect.value;
                statsChart.config.type = newType;
                // Corrige o fill para line/bar
                statsChart.data.datasets.forEach(ds => ds.fill = newType === 'line' ? false : true);
                statsChart.update();
            };
        }
    }

    // Função para copiar texto para a área de transferência
    async function copyToClipboard(text, button) {
        try {
            await navigator.clipboard.writeText(text);
            showCopyFeedback(button);
        } catch (error) {
            console.error('Erro ao copiar para a área de transferência:', error);
            handleCopyError(button, error);
        }
    }

    // Função para mostrar feedback visual de sucesso
    function showCopyFeedback(button) {
        const originalText = button.textContent;
        button.textContent = '✓ Copiado!';
        button.classList.add('copied');

        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }

    // Função para tratar erros de cópia
    function handleCopyError(button, error) {
        const originalText = button.textContent;
        button.textContent = '✗ Erro';
        button.classList.add('copy-error');

        // Fallback: tenta usar execCommand como alternativa
        if (error.name === 'NotAllowedError') {
            console.warn('Clipboard API não disponível, tentando fallback');
            tryFallbackCopy(button);
            return;
        }

        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copy-error');
        }, 2000);
    }

    // Função fallback para copiar (para navegadores antigos)
    function tryFallbackCopy(button) {
        const textarea = document.createElement('textarea');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);

        textarea.value = button.dataset.textToCopy;
        textarea.select();

        try {
            document.execCommand('copy');
            showCopyFeedback(button);
        } catch (e) {
            console.error('Fallback de cópia também falhou:', e);
        } finally {
            document.body.removeChild(textarea);
        }
    }

    // Função para criar o botão de copiar
    function createCopyButton(messageText) {
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.textContent = '📋 Copiar';
        button.setAttribute('aria-label', 'Copiar gambiarra para a área de transferência');
        button.dataset.textToCopy = messageText;

        button.addEventListener('click', (e) => {
            e.preventDefault();
            copyToClipboard(messageText, button);
        });

        return button;
    }


    // ==================== QR Code Sharing ====================

    /**
     * Gera a URL que será codificada no QR (aponta para a página com hash)
     * @param {string} message - Texto da gambiarra
     * @returns {string} URL completa para compartilhar
     */
    function buildShareUrl(message) {
        const base = `${location.origin}${location.pathname}`;
        // Usamos hash para filtrar a mensagem; o app pode ler location.hash se quisermos
        const hash = `gambiarra=${encodeURIComponent(message)}`;
        return `${base}#${hash}`;
    }

    /**
     * Cria o botão que abre o modal com QR code
     * @param {string} messageText
     * @returns {HTMLElement}
     */
    function createQRButton(messageText) {
        const btn = document.createElement('button');
        btn.className = 'qr-button';
        btn.textContent = '🔗 QR';
        btn.setAttribute('aria-label', 'Mostrar QR code para compartilhar');

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const shareUrl = buildShareUrl(messageText);
            showQRModal(shareUrl);
        });

        return btn;
    }

    // Modal helpers
    const qrModal = document.getElementById('qr-modal');
    const qrImage = document.getElementById('qr-image');
    const qrUrlText = document.getElementById('qr-url');

    function showQRModal(shareUrl) {
        if (!qrModal || !qrImage) return;

        // Usamos Google Chart API para gerar o QR (simples e sem dependências)
        const qrSrc = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(shareUrl)}`;
        qrImage.src = qrSrc;
        qrUrlText.textContent = shareUrl;
        qrModal.style.display = 'flex';
        qrModal.setAttribute('aria-hidden', 'false');

        // Escutar ESC para fechar
        document.addEventListener('keydown', handleEscClose);
    }

    function hideQRModal() {
        if (!qrModal || !qrImage) return;
        qrModal.style.display = 'none';
        qrModal.setAttribute('aria-hidden', 'true');
        qrImage.src = '';
        qrUrlText.textContent = '';
        document.removeEventListener('keydown', handleEscClose);
    }

    function handleEscClose(e) {
        if (e.key === 'Escape') hideQRModal();
    }

    // Close via overlay/button delegation
    if (qrModal) {
        qrModal.addEventListener('click', (e) => {
            const action = e.target && e.target.dataset && e.target.dataset.action;
            if (action === 'close-qr' || e.target.classList.contains('qr-overlay')) {
                hideQRModal();
            }
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

        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';
        cardHeader.appendChild(content);

        cardHeader.appendChild(createCopyButton(msg.message));

        const controls = document.createElement('div');
        controls.className = 'card-controls';
        controls.appendChild(createCopyButton(msg.message));
        controls.appendChild(createQRButton(msg.message));

        cardHeader.appendChild(controls);

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

        // Criar botão de like com ícone SVG
        const msgId = msg.id || `msg-${index}`;
        const liked = hasUserLiked(msgId);
        const count = getLikes(msgId);

        const likeButton = document.createElement('button');
        likeButton.className = `like-button ${liked ? 'liked' : ''}`;
        likeButton.setAttribute('aria-label', `Curtir - ${count} curtidas`);
        
        // Adicionar ícone SVG
        likeButton.appendChild(createHeartIcon(liked));

        // Adicionar contador
        const countSpan = document.createElement('span');
        countSpan.className = 'like-count';
        countSpan.textContent = count > 0 ? count : '';
        likeButton.appendChild(countSpan);

        // Event listener para curtir/descurtir
        likeButton.addEventListener('click', (e) => {
            e.preventDefault();
            const isLiked = hasUserLiked(msgId);
            const currentCount = getLikes(msgId);
            const newCount = isLiked ? currentCount - 1 : currentCount + 1;
            
            setUserLiked(msgId, !isLiked);
            setLikes(msgId, newCount);

            // Atualizar visual do botão
            likeButton.className = `like-button ${!isLiked ? 'liked' : ''}`;
            likeButton.innerHTML = '';
            likeButton.appendChild(createHeartIcon(!isLiked));
            countSpan.textContent = newCount > 0 ? newCount : '';
            likeButton.appendChild(countSpan);
            likeButton.setAttribute('aria-label', `Curtir - ${newCount} curtidas`);
        });

        footer.appendChild(authorName);
        footer.appendChild(likeButton);
        footer.appendChild(dateSpan);

        card.appendChild(cardHeader);
        card.appendChild(footer);

        return card;
    }

    // Inicia o carregamento - primeiro carrega a paleta, depois as mensagens
    async function init() {
        await loadColorPalette();
        await loadMessages();
        setupSearch();
        setupRandomHighlight();
        setupRandomGif();
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

    // Configura destaque aleatório e scroll
    function setupRandomHighlight() {
        if (!randomBtn) return;

        randomBtn.addEventListener('click', () => {
            const cards = messagesContainer.querySelectorAll('.message-card');
            if (!cards.length) return;

            // Remove destaque anterior
            messagesContainer.querySelectorAll('.message-card.highlight')
                .forEach(el => el.classList.remove('highlight'));

            // Escolhe um card aleatório visível
            const idx = Math.floor(Math.random() * cards.length);
            const chosen = cards[idx];
            chosen.classList.add('highlight');

            // Role suavemente até o card
            chosen.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Breve foco visual (opcional) para acessibilidade
            chosen.setAttribute('tabindex', '-1');
            chosen.focus({ preventScroll: true });
        });
    }

    // ===== GIF aleatório =====
    // Fonte pública sem chave: cataas.com (Cat as a Service)
    // Para usar Giphy/Tenor com API key, trocar por uma chamada fetch
    function setupRandomGif() {
        if (!addGifBtn || !gifOverlay) return;

        const randomBetween = (min, max) => {
            if (max <= min) return min;
            return Math.random() * (max - min) + min;
        };

        addGifBtn.addEventListener('click', () => {
            const img = document.createElement('img');
            img.className = 'gif-item';

            // Tamanho aleatório
            const width = Math.round(randomBetween(140, 280));
            img.style.width = width + 'px';

            // Escolhe uma fonte aleatória: cataas random gif
            // Usamos um param random para evitar cache
            img.src = `https://cataas.com/cat/gif?${Date.now()}_${Math.floor(Math.random()*100000)}`;

            // Quando carregar, posiciona em um ponto aleatório da viewport
            img.onload = () => {
                const overlayRect = gifOverlay.getBoundingClientRect();
                const h = img.naturalHeight * (width / img.naturalWidth);
                const maxLeft = Math.max(0, overlayRect.width - width);
                const maxTop = Math.max(0, overlayRect.height - h);

                const left = Math.round(randomBetween(0, maxLeft));
                const top = Math.round(randomBetween(0, maxTop));
                const rotate = Math.round(randomBetween(-12, 12));

                img.style.left = left + 'px';
                img.style.top = top + 'px';
                img.style.transform = `rotate(${rotate}deg)`;
            };

            gifOverlay.appendChild(img);
        });
    }

    // ===== Estatísticas =====
    function buildStats(messages) {
        const statsGrid = document.getElementById('stats-grid');
        if (!statsGrid) return;

        if (!messages || messages.length === 0) {
            statsGrid.innerHTML = '<div class="stat-card">Nenhuma gambiarra ainda 😢</div>';
            return;
        }

        // Total de cards
        const total = messages.length;

        // Contagem de contribuições por autor (reduce) - case insensitive
        const contributorMap = messages.reduce((acc, m) => {
            const rawName = (m.name || 'Anônimo').trim();
            const key = rawName.toLowerCase();
            if (!acc[key]) {
                acc[key] = { name: rawName, count: 0 };
            }
            acc[key].count += 1;
            return acc;
        }, {});

        // Converte em array e ordena (sort)
        const contributorArray = Object.values(contributorMap)
            .sort((a, b) => b.count - a.count);

        const topContributor = contributorArray[0];
        const topOthers = contributorArray.slice(1, 4);

        // Gambiarra com maior texto (reduce)
        const longestMessage = messages.reduce((longest, m) => {
            return (m.message && m.message.length > (longest.message || '').length) ? m : longest;
        }, { message: '' });

        const longestLength = (longestMessage.message || '').length;
        const snippet = (longestMessage.message || '').slice(0, 180) + (longestLength > 180 ? '…' : '');

        // Monta HTML dos cards
        const totalCard = `
            <div class="stat-card" role="figure" aria-label="Total de gambiarras">
                <div class="stat-header">TOTAL</div>
                <div class="stat-value">🧮 ${total}</div>
                <div class="stat-detail">Quantidade de gambiarras compartilhadas.</div>
            </div>
        `;

        const topCard = `
            <div class="stat-card" role="figure" aria-label="Contribuidor mais ativo (case-insensitive)">
                <div class="stat-header">MAIS ATIVO</div>
                <div class="stat-value">🏆 ${topContributor.name}</div>
                <div class="stat-detail">${topContributor.count} contribuições${topOthers.length ? '<br><small>Outros: ' + topOthers.map(o => `${o.name} (${o.count})`).join(', ') + '</small>' : ''}</div>
            </div>
        `;

        const longestCard = `
            <div class="stat-card longest" role="figure" aria-label="Gambiarra com texto mais longo">
                <div class="stat-header">MAIOR TEXTO</div>
                <div class="stat-value">📝 ${longestLength} chars</div>
                <div class="stat-detail">Autor: <strong>${(longestMessage.name || 'Anônimo')}</strong></div>
                <div class="stat-snippet" title="Trecho da gambiarra mais longa">"${snippet}"</div>
            </div>
        `;

        statsGrid.innerHTML = totalCard + topCard + longestCard;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('messages-container');
    const searchInput = document.getElementById('search-input');
    let colorPalette = [];
    let allMessages = [];

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
        } catch (error) {
            console.error('Erro:', error);
            messagesContainer.innerHTML = '<p class="error">Ops! Ocorreu um erro ao carregar os recados.</p>';
        }
    }

    // Função para renderizar as mensagens na tela
    function renderMessages(messages) {
        messagesContainer.innerHTML = ''; // Limpa o container (remove o loading)

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

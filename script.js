document.addEventListener('DOMContentLoaded', () => {
    // Canvas setup
    const canvas = document.getElementById('spaceCanvas');
    const ctx = canvas.getContext('2d');
    
    // Criar camadas de post-processamento
    const postProcessCanvas = document.createElement('canvas');
    const postProcessCtx = postProcessCanvas.getContext('2d');
    
    // Referências para elementos HTML
    const exploreText = document.getElementById('exploreText');
    const portfolioContainer = document.getElementById('portfolio');
    const spaceEnvironment = document.getElementById('spaceEnvironment');
    
    // Variável para controlar se a animação deve continuar
    let animationActive = true;
    let animationFrameId = null;
    
    // Criar elemento de transição hiperespacial
    const hyperspaceTransition = document.createElement('div');
    hyperspaceTransition.className = 'hyperspace-transition';
    const hyperspaceStars = document.createElement('div');
    hyperspaceStars.className = 'hyperspace-stars';
    hyperspaceTransition.appendChild(hyperspaceStars);
    document.body.appendChild(hyperspaceTransition);
    
    // Estado da sequência de transição
    let sequenceState = {
        portfolioShown: false,
        returnedToBlackHole: false,
        transitionComplete: false
    };
    
    // Mostrar o texto EXPLORE após um pequeno delay
    setTimeout(() => {
        exploreText.classList.add('visible');
        
        // Remover o texto após 3 segundos
        setTimeout(() => {
            exploreText.classList.add('fading');
            
            // Remover a classe após a animação de fade-out
            setTimeout(() => {
                exploreText.classList.remove('visible');
                exploreText.classList.remove('fading');
            }, 1000);
        }, 3000);
    }, 500);
    
    function resizePostProcessCanvas() {
        postProcessCanvas.width = window.innerWidth * window.devicePixelRatio;
        postProcessCanvas.height = window.innerHeight * window.devicePixelRatio;
        postProcessCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    
    resizePostProcessCanvas();
    window.addEventListener('resize', resizePostProcessCanvas);
    
    // Configuração de resolução do canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        centerX = window.innerWidth / 2;
        centerY = window.innerHeight / 2;
    }
    
    let centerX = window.innerWidth / 2;
    let centerY = window.innerHeight / 2;
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles(); // Reinicializar partículas no redimensionamento
    });
    resizeCanvas();
    
    // Rastreamento do mouse
    const mouse = {
        x: centerX,
        y: centerY,
        targetX: centerX,
        targetY: centerY
    };
    
    // Controle de zoom
    const zoom = {
        current: 0.6,
        target: 0.6,
        min: 0.5,
        max: 15, // Aumentado para permitir zoom mais profundo
        step: 0.15,
        smoothing: 0.05
    };
    
    window.addEventListener('mousemove', (e) => {
        mouse.targetX = e.clientX;
        mouse.targetY = e.clientY;
    });
    
    // Event listener para scroll
    window.addEventListener('wheel', (e) => {
        // Determinar a direção do scroll (positivo = scroll para baixo, negativo = scroll para cima)
        const scrollDirection = Math.sign(e.deltaY);
        
        // Ajustar o zoom alvo com base na direção do scroll
        zoom.target = Math.max(zoom.min, Math.min(zoom.max, zoom.target + (scrollDirection * zoom.step)));
        
        // Gerar novas partículas em camadas profundas quando o zoom aumenta
        if (scrollDirection > 0) {
            // Calcular quantas camadas deveríamos ter baseado no zoom atual
            const targetDeepLayers = Math.min(
                config.maxDeepLayers, 
                Math.floor((zoom.target - 2) / 0.8) + 1
            );
            
            // Adicionar camadas necessárias
            while (deepLayers.length < targetDeepLayers) {
                addDeepLayer();
            }
        }
        
        // Prevenir o comportamento padrão de scroll da página
        e.preventDefault();
    }, { passive: false });
    
    // Configuração do ambiente espacial
    const config = {
        // Camadas normais (sempre visíveis)
        layers: 4,
        particlesPerLayer: [400, 200, 350, 120],
        maxSize: [1, 1.5, 2, 3],
        
        // Novas configurações para camadas profundas (visíveis apenas com zoom)
        maxDeepLayers: 12, // Aumentado para mais camadas profundas
        deepLayerParticleCount: [100, 400, 500, 600, 700, 800, 600, 500, 700, 800, 800, 800], // Mais partículas por camada profunda
        deepLayerSizeRange: [0.3, 0.8],
        deepLayerVisibilityThreshold: 2.5,
        
        // Configurações gerais
        baseRotationSpeed: 0.05,
        rotationSpeedByLayer: [1, 1.5, 2, 2.5], // Multiplicador para camadas normais
        deepRotationFactor: 1, // Rotação mais lenta para camadas profundas
        
        galaxyRadius: [1.95, 1.8, 1.7, 0.6], // Raio para camadas normais
        deepGalaxyRadiusRange: [0.5, 1], // Raio para camadas profundas (mais distantes)
        
        spiralFactor: 0.3,
        spiralArmCount: 4,
        armDensity: 0.7,
        parallaxStrength: [0.02, 0.04, 0.07, 0.1],
        parallaxSmoothing: 0.5,
        
        // Configurações visuais para camadas profundas
        depthFadeStart: 2.5, // Zoom onde começamos a mostrar camadas profundas (reduzido)
        depthFadeEnd: 5.5,   // Zoom onde as camadas profundas estão totalmente visíveis
        
        colors: {
            background: ['#000000', '#030311', '#000000'],
            stars: [
                '#ffffff', // Branco
                '#f0f8ff', // Azul Aliceblue
                '#fffacd', // Amarelo limão
                '#e6e6fa', // Lavanda
                '#dda0dd', // Violeta claro
                '#add8e6'  // Azul claro
            ],
            // Cores especiais para estrelas distantes (mais avermelhadas, representando estrelas mais antigas)
            deepStars: [
                '#ffcccc', // Vermelho muito claro
                '#ffd700', // Dourado
                '#ff8c69', // Salmão claro
                '#ff7f50', // Coral
                '#fa8072', // Salmão
                '#ffb6c1'  // Rosa claro
            ]
        },
        
        // Configurações do buraco negro
        blackHole: {
            radius: 10,            // Raio visual do buraco negro (reduzido de 50 para 25)
            eventHorizonRadius: 205, // Raio do horizonte de eventos (reduzido de 80 para 45)
            accretionDiskRadius: 1, // Raio do disco de acreção (reduzido de 150 para 80)
            accretionDiskWidth: 1,  // Largura do disco de acreção (reduzido de 60 para 35)
            pullStrength: 0.1,     // Força de atração do buraco negro mantida igual
            rotationSpeed: 0.001,   // Velocidade de rotação do disco de acreção mantida igual
            glowColor: '#4286f4',   // Cor do brilho do buraco negro mantida igual
            accretionColor1: '#ff7b00', // Cor interna do disco de acreção mantida igual
            accretionColor2: '#ffcf00',  // Cor externa do disco de acreção mantida igual
            
            // Efeito de proximidade
            proximityEffect: {
                blurStart: 8,        // Zoom onde o efeito de blur começa
                blurMax: 12,         // Zoom onde o blur atinge o máximo
                maxBlurAmount: 10,   // Quantidade máxima de blur (em px)
                darknessStart: 9,    // Zoom onde o escurecimento começa
                darknessMax: 14,     // Zoom onde a tela fica totalmente preta
                pulseSpeed: 0.5,     // Velocidade da pulsação visual
                pulseIntensity: 0.2, // Intensidade da pulsação
                vignetteIntensity: 0.7 // Intensidade do efeito vinheta
            }
        },
        
    };
    
    // Arrays de partículas
    const layers = []; // Camadas normais (sempre visíveis)
    const deepLayers = []; // Camadas profundas (visíveis apenas com zoom)
    
    // Classe da partícula
    class Particle {
        constructor(layerIndex, isDeep = false, deepIndex = 0) {
            this.layerIndex = layerIndex;
            this.isDeep = isDeep;
            this.deepIndex = deepIndex; // Usado apenas para camadas profundas
            
            // Profundidade normalizada (1 = mais longe, 0 = mais perto)
            if (isDeep) {
                // Para camadas profundas, a profundidade é ainda maior
                this.depth = 1 - (layerIndex / (config.layers - 1)) * 0.3; // Base depth
                this.actualDepth = this.depth + (deepIndex * 0.1); // Incremento por camada profunda
            } else {
                this.depth = 1 - layerIndex / (config.layers - 1);
                this.actualDepth = this.depth;
            }
            
            // Propriedades de tamanho e velocidade
            if (isDeep) {
                // Partículas em camadas profundas são menores
                this.maxSize = config.deepLayerSizeRange[0] + 
                    (config.deepLayerSizeRange[1] - config.deepLayerSizeRange[0]) * 
                    (1 - deepIndex / config.maxDeepLayers);
                
                // E giram mais devagar
                this.rotationSpeed = config.baseRotationSpeed * 
                    config.rotationSpeedByLayer[0] * config.deepRotationFactor * 
                    (1 - deepIndex / (config.maxDeepLayers * 2));
            } else {
                this.maxSize = config.maxSize[layerIndex];
                this.rotationSpeed = config.baseRotationSpeed * config.rotationSpeedByLayer[layerIndex];
            }
            
            this.parallaxStrength = isDeep ? 
                config.parallaxStrength[0] * 0.5 : // Menor efeito parallax para camadas profundas
                config.parallaxStrength[layerIndex];
            
            // Posicionamento inicial na galáxia
            this.initPosition();
            
            // Propriedades visuais
            this.size = (0.3 + Math.random() * 0.7) * this.maxSize;
            
            // Cores diferentes para camadas profundas
            const colorArray = isDeep ? config.colors.deepStars : config.colors.stars;
            this.color = colorArray[Math.floor(Math.random() * colorArray.length)];
            
            this.twinkleSpeed = 0.002 + Math.random() * 0.005;
            this.twinkleOffset = Math.random() * Math.PI * 2;
            
            // Partículas em camadas profundas começam com menor opacidade
            this.baseOpacity = isDeep ? 0.2 + Math.random() * 0.4 : 0.3 + Math.random() * 0.7;
            this.opacity = this.baseOpacity;
            
            // Propriedades específicas para interação com o buraco negro
            this.isBeingPulled = false;
            this.pullFactor = 0;
            this.originalDistance = 0;
            this.isDead = false;
        }
        
        initPosition() {
            // Determinar se a partícula está em um braço espiral ou não
            const inArm = Math.random() < config.armDensity;
            
            // Raio da galáxia baseado na camada
            let galaxyRadius;
            if (this.isDeep) {
                // Camadas profundas têm raios maiores (mais distantes)
                const minRadius = config.deepGalaxyRadiusRange[0];
                const maxRadius = config.deepGalaxyRadiusRange[1];
                galaxyRadius = minRadius + (maxRadius - minRadius) * (this.deepIndex / config.maxDeepLayers);
            } else {
                galaxyRadius = config.galaxyRadius[this.layerIndex];
            }
            
            // Distância do centro (distribuição não uniforme - mais densa no centro)
            this.baseDistance = Math.pow(Math.random(), 0.5) * galaxyRadius * 
                            Math.min(window.innerWidth, window.innerHeight) / 2;
            
            // Ângulo baseado nos braços espirais ou aleatório
            if (inArm) {
                // Escolher um braço espiral aleatório
                const arm = Math.floor(Math.random() * config.spiralArmCount);
                const armAngle = (Math.PI * 2 / config.spiralArmCount) * arm;
                
                // Ângulo baseado na distância do centro (cria a espiral)
                this.baseAngle = armAngle + 
                              (this.baseDistance / (galaxyRadius * 
                                Math.min(window.innerWidth, window.innerHeight) / 2)) * 
                              config.spiralFactor * Math.PI * 5;
                
                // Adicionar alguma variação ao ângulo
                this.baseAngle += (Math.random() - 0.5) * 0.3;
                
                // Adicionar alguma variação à distância
                this.baseDistance *= 0.85 + Math.random() * 0.3;
            } else {
                // Distribuição uniforme para partículas fora dos braços
                this.baseAngle = Math.random() * Math.PI * 2;
            }
            
            // Posição inicial é a mesma da base (será modificada pelo parallax)
            this.angle = this.baseAngle;
            this.distance = this.baseDistance;
            
            // Converter para coordenadas cartesianas
            this.updateCartesianPosition();
        }
        
        updateCartesianPosition() {
            this.x = centerX + this.distance * Math.cos(this.angle);
            this.y = centerY + this.distance * Math.sin(this.angle);
        }
        
        update(time) {
            // Pular a atualização se a partícula já foi "consumida" pelo buraco negro
            if (this.isDead) return;
            
            // Atualizar a visibilidade com base no zoom para camadas profundas
            if (this.isDeep) {
                // Calcular a opacidade com base no zoom atual
                // Quanto mais zoom, mais visíveis ficam as camadas profundas
                const fadeStart = config.depthFadeStart + (this.deepIndex * 0.5);
                const fadeEnd = config.depthFadeEnd + (this.deepIndex * 0.5);
                
                // Normalizar o valor entre 0 e 1 com base no zoom
                let visibilityFactor = 0;
                if (zoom.current > fadeStart) {
                    visibilityFactor = Math.min(1, (zoom.current - fadeStart) / (fadeEnd - fadeStart));
                }
                
                this.opacity = this.baseOpacity * visibilityFactor;
                
                // Se a opacidade for muito baixa, podemos pular atualizações posteriores
                if (this.opacity < 0.01) {
                    return;
                }
            }
            
            // Atualizar ângulo com base na rotação
            this.angle = this.baseAngle + time * this.rotationSpeed;
            
            // Cálculo base da distância considerando o zoom
            let zoomedDistance = this.baseDistance * zoom.current;
            
            // Verificar interação com o buraco negro
            const distanceToCenter = Math.sqrt(
                Math.pow(this.x - centerX, 2) + 
                Math.pow(this.y - centerY, 2)
            );
            
            // Salvar a distância original quando a partícula começa a ser afetada
            if (!this.isBeingPulled && distanceToCenter < config.blackHole.eventHorizonRadius * zoom.current) {
                this.isBeingPulled = true;
                this.originalDistance = distanceToCenter;
                this.pullStartAngle = this.angle;
            }
            
            // Aplicar efeito de atração do buraco negro
            if (this.isBeingPulled) {
                // Aumentar fator de atração ao longo do tempo
                this.pullFactor += config.blackHole.pullStrength * (1 / distanceToCenter) * (distanceToCenter < 200 ? 2 : 1);
                
                // Aplicar uma aceleração angular conforme se aproxima do centro (efeito de órbita)
                const angularAcceleration = (1 - (distanceToCenter / this.originalDistance)) * 0.1;
                this.angle += angularAcceleration;
                
                // Reduzir a distância em direção ao centro
                zoomedDistance = zoomedDistance * (1 - this.pullFactor);
                
                // Se a partícula chegou ao raio do buraco negro, marcá-la como "morta"
                if (distanceToCenter < config.blackHole.radius * zoom.current) {
                    this.isDead = true;
                    return;
                }
            }
            
            // Aplicar o efeito de parallax baseado na posição do mouse
            if (mouse.x !== centerX || mouse.y !== centerY) {
                // Atualizar suavemente a posição do mouse
                mouse.x += (mouse.targetX - mouse.x) * config.parallaxSmoothing;
                mouse.y += (mouse.targetY - mouse.y) * config.parallaxSmoothing;
                
                // Calcular deslocamento do mouse em relação ao centro
                const mouseOffsetX = (mouse.x - centerX) / centerX;
                const mouseOffsetY = (mouse.y - centerY) / centerY;
                
                // Aplicar o deslocamento do parallax
                this.x = centerX + zoomedDistance * Math.cos(this.angle) - mouseOffsetX * centerX * this.parallaxStrength;
                this.y = centerY + zoomedDistance * Math.sin(this.angle) - mouseOffsetY * centerY * this.parallaxStrength;
            } else {
                // Sem parallax, apenas atualizar a posição com base no ângulo e zoom
                this.x = centerX + zoomedDistance * Math.cos(this.angle);
                this.y = centerY + zoomedDistance * Math.sin(this.angle);
            }
            
            // Efeito de brilho (twinkle)
            const twinkle = Math.sin(time * this.twinkleSpeed + this.twinkleOffset);
            this.currentOpacity = this.opacity * (0.7 + twinkle * 0.3);
            
            // Tamanho afetado pelo zoom e pelo twinkle
            this.currentSize = this.size * (0.85 + twinkle * 0.15) * zoom.current;
            
            // Modificar a aparência se estiver sendo puxada pelo buraco negro
            if (this.isBeingPulled) {
                // Alongar a partícula na direção tangencial (efeito de esticamento)
                this.isStretched = true;
                this.stretchFactor = Math.min(3, 1 + this.pullFactor * 5);
                this.stretchAngle = this.angle + Math.PI/2;
                
                // Aumentar o brilho conforme se aproxima do centro
                this.currentOpacity = Math.min(1, this.currentOpacity * (1 + this.pullFactor * 3));
                
                // Mudar a cor para mais avermelhada quanto mais próxima do buraco negro
                const distanceRatio = distanceToCenter / (config.blackHole.eventHorizonRadius * zoom.current);
                if (distanceRatio < 0.7) {
                    this.currentColor = lerpColor(this.color, "#ff0000", 1 - distanceRatio);
                } else {
                    this.currentColor = this.color;
                }
            } else {
                this.isStretched = false;
                this.currentColor = this.color;
            }
        }
        
        draw() {
            // Não desenhar se a partícula foi "consumida" pelo buraco negro
            if (this.isDead) return;
            
            // Verificar se a partícula é visível (opacidade mínima)
            if (this.isDeep && this.opacity < 0.01) {
                return;
            }
            
            // Verificar se está fora da tela (com margem)
            if (this.x < -50 || this.x > window.innerWidth + 50 ||
                this.y < -50 || this.y > window.innerHeight + 50) {
                return;
            }
            
            if (this.isBeingPulled) {
                // Em vez de desenhar uma linha esticada, vamos desenhar um gradiente circular
                // que se torna mais alongado conforme a partícula se aproxima do buraco negro
                
                // Desenhar o brilho externo (glow) com um gradiente que se estende na direção do buraco negro
                const glowSize = this.currentSize * 2;
                
                // Criar um gradiente radial mas ligeiramente deslocado na direção do centro
                const directionX = centerX - this.x;
                const directionY = centerY - this.y;
                const distance = Math.sqrt(directionX * directionX + directionY * directionY);
                
                if (distance > 0) {
                    const normalizedDirX = directionX / distance;
                    const normalizedDirY = directionY / distance;
                    
                    // Criar um ponto para o gradiente na direção do buraco negro
                    const offsetFactor = this.pullFactor * this.currentSize * 2;
                    const gradientEndX = this.x + normalizedDirX * offsetFactor;
                    const gradientEndY = this.y + normalizedDirY * offsetFactor;
                    
                    const gradient = ctx.createRadialGradient(
                        this.x, this.y, 0,
                        gradientEndX, gradientEndY, glowSize * (1 + this.pullFactor)
                    );
                    
                    gradient.addColorStop(0, this.currentColor);
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    
                    ctx.beginPath();
                    ctx.fillStyle = gradient;
                    ctx.globalAlpha = this.currentOpacity * 0.7;
                    ctx.arc(this.x, this.y, glowSize * (1 + this.pullFactor), 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Desenhar o núcleo da estrela
                    ctx.beginPath();
                    ctx.fillStyle = this.currentColor;
                    ctx.globalAlpha = this.currentOpacity;
                    // Núcleo ligeiramente alongado na direção do buraco negro
                    const stretchFactor = 1 + this.pullFactor * 0.8;
                    ctx.arc(this.x, this.y, this.currentSize * stretchFactor * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Fallback para caso a partícula esteja exatamente no centro
                    const gradient = ctx.createRadialGradient(
                        this.x, this.y, 0,
                        this.x, this.y, glowSize
                    );
                    
                    gradient.addColorStop(0, this.currentColor);
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    
                    ctx.beginPath();
                    ctx.fillStyle = gradient;
                    ctx.globalAlpha = this.currentOpacity * 0.5;
                    ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Núcleo
                    ctx.beginPath();
                    ctx.fillStyle = this.currentColor;
                    ctx.globalAlpha = this.currentOpacity;
                    ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                // Desenho normal da partícula
                // Desenhar o brilho externo (glow)
                const glowSize = this.currentSize * 2;
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, glowSize
                );
                
                gradient.addColorStop(0, this.currentColor || this.color);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.beginPath();
                ctx.fillStyle = gradient;
                ctx.globalAlpha = this.currentOpacity * 0.5;
                ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Desenhar o núcleo da estrela
                ctx.beginPath();
                ctx.fillStyle = this.currentColor || this.color;
                ctx.globalAlpha = this.currentOpacity;
                ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Restaurar alpha
            ctx.globalAlpha = 1;
        }
    }
    
    // Função para adicionar uma nova camada profunda
    function addDeepLayer() {
        const deepIndex = deepLayers.length;
        const newLayer = [];
        
        // Determinar a quantidade de partículas para esta camada
        const particleCount = config.deepLayerParticleCount[Math.min(deepIndex, config.deepLayerParticleCount.length - 1)];
        
        // Gerar partículas para a nova camada profunda
        for (let i = 0; i < particleCount; i++) {
            newLayer.push(new Particle(0, true, deepIndex));
        }
        
        deepLayers.push(newLayer);
        console.log(`Camada profunda ${deepIndex + 1} adicionada. Total: ${deepLayers.length} com ${particleCount} partículas`);
    }
    
    // Inicializar partículas
    function initParticles() {
        // Limpar camadas existentes
        layers.length = 0;
        deepLayers.length = 0;
        
        // Criar camadas normais
        for (let l = 0; l < config.layers; l++) {
            const layer = [];
            
            for (let i = 0; i < config.particlesPerLayer[l]; i++) {
                layer.push(new Particle(l));
            }
            
            layers.push(layer);
        }
        
        // Inicializar primeira camada profunda
        addDeepLayer();
    }
    
    // Função para interpolar cores (útil para o efeito do buraco negro)
    function lerpColor(color1, color2, factor) {
        // Função auxiliar para converter hex para rgb
        function hexToRgb(hex) {
            const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
            
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : {r: 0, g: 0, b: 0};
        }
        
        // Converter para RGB
        const c1 = hexToRgb(color1);
        const c2 = hexToRgb(color2);
        
        // Interpolar cada componente
        const r = Math.round(c1.r + factor * (c2.r - c1.r));
        const g = Math.round(c1.g + factor * (c2.g - c1.g));
        const b = Math.round(c1.b + factor * (c2.b - c1.b));
        
        // Converter de volta para hex
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    // Função para desenhar o buraco negro
    function drawBlackHole() {
        const bhRadius = config.blackHole.radius * zoom.current;
        const accRadius = config.blackHole.accretionDiskRadius * zoom.current;
        const accWidth = config.blackHole.accretionDiskWidth * zoom.current;
        
        // Disco de acreção (anel ao redor do buraco negro)
        const gradient = ctx.createRadialGradient(
            centerX, centerY, bhRadius,
            centerX, centerY, accRadius + accWidth
        );
        
        gradient.addColorStop(0, config.blackHole.accretionColor1);
        gradient.addColorStop(0.7, config.blackHole.accretionColor2);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.7;
        ctx.arc(centerX, centerY, accRadius + accWidth, 0, Math.PI * 2);
        ctx.fill();
        
        // Buraco negro (círculo central)
        const bhGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, bhRadius
        );
        
        bhGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        bhGradient.addColorStop(0.8, 'rgba(0, 0, 0, 1)');
        bhGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        
        ctx.beginPath();
        ctx.fillStyle = bhGradient;
        ctx.globalAlpha = 1;
        ctx.arc(centerX, centerY, bhRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Efeito de distorção da luz (horizonte de eventos)
        const glowGradient = ctx.createRadialGradient(
            centerX, centerY, bhRadius * 0.8,
            centerX, centerY, bhRadius * 1.2
        );
        
        glowGradient.addColorStop(0, config.blackHole.glowColor);
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.beginPath();
        ctx.fillStyle = glowGradient;
        ctx.globalAlpha = 0.3;
        ctx.arc(centerX, centerY, bhRadius * 1.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
    }
    
    // Loop de animação
    function animate(timestamp) {
        // Se a animação não estiver ativa, não prosseguir
        if (!animationActive) {
            return;
        }
        
        const time = Date.now() * 0.001; // Tempo em segundos
        
        // Atualizar o zoom atual com transição suave
        zoom.current += (zoom.target - zoom.current) * zoom.smoothing;
        
        // Limpar o canvas com gradiente
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        
        config.colors.background.forEach((color, index) => {
            gradient.addColorStop(index / (config.colors.background.length - 1), color);
        });
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Atualizar e desenhar todas as partículas em ordem de profundidade
        
        // Primeiro as camadas profundas (mais distantes)
        for (let l = deepLayers.length - 1; l >= 0; l--) {
            for (const particle of deepLayers[l]) {
                particle.update(time);
                particle.draw();
            }
        }
        
        // Depois as camadas normais (mais próximas)
        for (let l = 0; l < layers.length; l++) {
            for (const particle of layers[l]) {
                particle.update(time);
                particle.draw();
            }
        }
        
        // Desenhar o buraco negro por cima de tudo
        drawBlackHole();
        
        // Aplicar os efeitos de proximidade (blur e escurecimento)
        applyProximityEffects(time);
        
        // Solicitar próximo frame apenas se a animação ainda estiver ativa
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // Função para aplicar efeitos visuais conforme se aproxima do buraco negro
    function applyProximityEffects(time) {
        const pe = config.blackHole.proximityEffect;
        
        // Verificar se o zoom atual está na faixa onde os efeitos devem ser aplicados
        if (zoom.current > pe.blurStart) {
            // Copiar o canvas principal para o canvas de pós-processamento
            postProcessCtx.clearRect(0, 0, postProcessCanvas.width, postProcessCanvas.height);
            postProcessCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
            
            // 1. Aplicar efeito de blur (embaçamento)
            let blurAmount = 0;
            if (zoom.current > pe.blurStart && zoom.current < pe.blurMax) {
                // Calcular quantidade de blur com base no zoom (0 a maxBlurAmount)
                blurAmount = ((zoom.current - pe.blurStart) / (pe.blurMax - pe.blurStart)) * pe.maxBlurAmount;
            } else if (zoom.current >= pe.blurMax) {
                blurAmount = pe.maxBlurAmount;
            }
            
            if (blurAmount > 0) {
                // Aplicar filtro de blur ao canvas
                ctx.filter = `blur(${blurAmount}px)`;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(postProcessCanvas, 0, 0, canvas.width, canvas.height);
                ctx.filter = 'none';
            }
            
            // 2. Aplicar efeito de escurecimento progressivo
            let darknessAmount = 0;
            if (zoom.current > pe.darknessStart && zoom.current < pe.darknessMax) {
                // Calcular a opacidade do overlay escuro (0 a 1)
                darknessAmount = (zoom.current - pe.darknessStart) / (pe.darknessMax - pe.darknessStart);
            } else if (zoom.current >= pe.darknessMax) {
                darknessAmount = 1; // Totalmente preto
            }
            
            if (darknessAmount > 0) {
                // Adicionar pulsação ao efeito de escurecimento
                const pulse = Math.sin(time * pe.pulseSpeed) * pe.pulseIntensity;
                darknessAmount = Math.max(0, Math.min(1, darknessAmount + pulse * darknessAmount));
                
                // Criar efeito de vinheta (mais escuro nas bordas)
                const innerRadius = Math.min(canvas.width, canvas.height) * 0.25 * (1 - darknessAmount * 0.5);
                const outerRadius = Math.min(canvas.width, canvas.height) * 0.75 * (1 - darknessAmount * 0.3);
                
                const vignette = ctx.createRadialGradient(
                    centerX, centerY, innerRadius,
                    centerX, centerY, outerRadius
                );
                
                vignette.addColorStop(0, `rgba(0, 0, 0, ${darknessAmount * 0.3})`);
                vignette.addColorStop(1, `rgba(0, 0, 0, ${darknessAmount * pe.vignetteIntensity})`);
                
                ctx.fillStyle = vignette;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Se estamos quase no máximo de escurecimento, mostrar o portfólio HTML
                if (darknessAmount > 0.7) {
                    const finalDarkness = (darknessAmount - 0.7) / 0.3; // 0 a 1
                    ctx.fillStyle = `rgba(0, 0, 0, ${finalDarkness * 0.95})`;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Quando a tela estiver quase preta, mostrar o portfólio
                    if (finalDarkness > 0.9 && !portfolioVisible && !sequenceState.portfolioShown) {
                        // Mostrar o portfólio HTML
                        portfolioContainer.classList.add('visible');
                        portfolioVisible = true;
                        sequenceState.portfolioShown = true;
                        
                        // Adicionar callback para continuar a sequência
                        if (!hasAddedEventListeners) {
                            window.addEventListener('click', startTransitionSequence);
                            window.addEventListener('keydown', startTransitionSequence);
                            hasAddedEventListeners = true;
                        }
                    }
                } else if (portfolioVisible) {
                    // Esconder o portfólio quando o usuário estiver saindo do buraco negro
                    portfolioContainer.classList.remove('visible');
                    portfolioVisible = false;
                }
            }
        }
    }
    
    // Variável para controlar a visibilidade do portfólio
    let portfolioVisible = false;
    
    // Variável para controlar se os event listeners já foram adicionados
    let hasAddedEventListeners = false;
    
    // Função para iniciar a sequência de transição
    function startTransitionSequence(event) {
        // Remover event listeners para evitar múltiplas chamadas
        window.removeEventListener('click', startTransitionSequence);
        window.removeEventListener('keydown', startTransitionSequence);
        hasAddedEventListeners = false;
        
        // Esconder o portfólio
        portfolioContainer.classList.remove('visible');
        portfolioVisible = false;
        
        // Retornar para o buraco negro com zoom reduzido
        zoom.target = 3; // Valor intermediário para visualizar o buraco negro
        
        // Após ver o buraco negro novamente, iniciar a transição para a nova tela
        setTimeout(() => {
            sequenceState.returnedToBlackHole = true;
            
            // Ativar a transição hiperespacial
            hyperspaceTransition.classList.add('active');
            
            // Aguardar a animação de transição e então redirecionar para a página de portfólio
            setTimeout(() => {
                // Redirecionar para a página de portfólio separada
                window.location.href = 'portfolio.html';
            }, 2000); // Tempo suficiente para a animação de hyperspace
        }, 3000); // Tempo para apreciar o buraco negro
    }
    
    // Inicializar e começar a animação
    initParticles();
    animate();
});
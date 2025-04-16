// Portfolio JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Configurar efeito de parallax para os cards de projeto
    setupParallax();
    
    // Configurar animação para os cards de projeto
    setupProjectCards();
    
    // Configurar navegação suave
    setupSmoothScroll();
    
    // Adicionar efeito de entrada para seções quando visíveis
    setupSectionReveal();
    
    // Configurar a navegação fixa que aparece ao rolar
    setupFixedNavigation();
});

// Configura o efeito de parallax para elementos com atributo data-depth
function setupParallax() {
    const container = document.querySelector('.minimal-content');
    const elements = document.querySelectorAll('[data-depth]');
    
    container.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        elements.forEach(element => {
            const depth = parseFloat(element.getAttribute('data-depth')) || 0.1;
            const moveX = (clientX - centerX) * depth;
            const moveY = (clientY - centerY) * depth;
            
            element.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });
    
    container.addEventListener('mouseleave', () => {
        elements.forEach(element => {
            element.style.transform = 'translate(0, 0)';
            element.style.transition = 'transform 0.5s ease-out';
        });
    });
}

// Configura as animações para os cards de projeto
function setupProjectCards() {
    const cards = document.querySelectorAll('.project-card');
    
    // Atribuir ordem de animação aos cards
    cards.forEach((card, index) => {
        card.style.setProperty('--order', index + 1);
        
        // Adicionar efeito de hover
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.3)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
        });
    });
}

// Configura a navegação suave para links de âncora
function setupSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-item');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Calcular a posição de destino considerando o header
                const headerOffset = 80; // Ajuste conforme necessário
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                // Rolar suavemente para o destino
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Realçar o link ativo
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
}

// Revelar seções conforme o usuário rola a página
function setupSectionReveal() {
    const sections = document.querySelectorAll('.portfolio-section');
    
    // Função que verifica se um elemento está visível
    function isElementVisible(el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return (
            rect.top <= windowHeight * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    // Verificar seções visíveis no carregamento inicial
    sections.forEach(section => {
        if (isElementVisible(section)) {
            section.classList.add('visible');
        }
    });
    
    // Verificar seções visíveis durante a rolagem
    window.addEventListener('scroll', () => {
        sections.forEach(section => {
            if (isElementVisible(section) && !section.classList.contains('visible')) {
                section.classList.add('visible');
            }
        });
    });
    
    // Criar partículas no fundo
    createBackgroundParticles();
}

// Criar partículas no background
function createBackgroundParticles() {
    const background = document.querySelector('.minimal-background');
    const particlesCount = window.innerWidth > 768 ? 50 : 30;
    
    for (let i = 0; i < particlesCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('bg-particle');
        
        // Posições e tamanhos aleatórios
        const size = Math.random() * 2 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const animationDuration = Math.random() * 50 + 30;
        const opacity = Math.random() * 0.5 + 0.1;
        
        // Aplicar estilos
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.animationDuration = `${animationDuration}s`;
        particle.style.opacity = opacity;
        
        background.appendChild(particle);
    }
}

// Configurar a navegação fixa que aparece ao rolar
function setupFixedNavigation() {
    const fixedNav = document.querySelector('.fixed-nav');
    const headerHeight = document.querySelector('.minimal-header').offsetHeight;
    
    // Atualizar classe ativa no menu fixo baseado na seção visível
    const navLinks = document.querySelectorAll('.fixed-nav-links .nav-item');
    const sections = document.querySelectorAll('.portfolio-section');
    
    window.addEventListener('scroll', () => {
        // Mostrar/esconder navegação fixa baseado na posição de scroll
        if (window.scrollY > headerHeight) {
            fixedNav.classList.add('visible');
        } else {
            fixedNav.classList.remove('visible');
        }
        
        // Atualizar link ativo baseado na seção visível
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });
}

// Detectar quando a página é carregada completamente
window.addEventListener('load', () => {
    // Remover overlay de loading
    const loader = document.querySelector('.page-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
    
    // Animar entrada dos elementos
    document.body.classList.add('loaded');
});
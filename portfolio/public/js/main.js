// main.js - Interaktive Funktionen für das Portfolio

// ========== DARK/LIGHT MODE ==========
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle?.querySelector('i');

// Theme laden
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeIcon) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
}

themeToggle?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }
});

// ========== MOBILE MENU ==========
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger?.addEventListener('click', () => {
    navMenu?.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu?.classList.remove('active');
    });
});

// ========== ACTIVE NAVIGATION ON SCROLL ==========
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ========== TYPING EFFECT ==========
document.addEventListener('DOMContentLoaded', function() {
    const roles = ['Webentwickler', 'KI-Enthusiast', 'Full-Stack Developer', 'Problem Solver'];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typedTextSpan = document.getElementById('typed-text');
    
    if (!typedTextSpan) return;
    
    function typeEffect() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            typedTextSpan.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typedTextSpan.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }
        
        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            setTimeout(typeEffect, 2000);
            return;
        }
        
        if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            setTimeout(typeEffect, 500);
            return;
        }
        
        const speed = isDeleting ? 100 : 150;
        setTimeout(typeEffect, speed);
    }
    
    typeEffect();
});

// ========== LIVE-SCHALTER - Wähle deine 3 Live-Projekte ==========
const LIVE_PROJECTS = [
    '📚 StudySnap AI',
    '🧠 KopfArena',
    '🔮 PersonalityAnalyzer'
];

// ========== HELPER FUNCTIONS ==========
function getProjectIcon(name) {
    if (name.includes('Voxify')) return 'fa-microphone-alt';
    if (name.includes('EmotionsChat')) return 'fa-comment-dots';
    if (name.includes('StudySnap')) return 'fa-graduation-cap';
    if (name.includes('KopfArena')) return 'fa-brain';
    if (name.includes('PersonalityAnalyzer')) return 'fa-chart-line';
    return 'fa-code';
}

// ========== PROJEKTE-DATEN ==========
const projects = [
    {
        name: '🎙️ Voxify',
        description: 'Wandelt jedes Skript in einen professionellen Podcast um. Text-to-Speech mit KI-Stimmen, Sound-Effekte und Export als MP3.',
        tags: ['Node.js', 'OpenAI TTS', 'FFmpeg', 'Express'],
        github: 'https://github.com/onurkara/voxify',
        demo: 'https://voxify.onurkara.dev'
    },
    {
        name: '💬 EmotionsChat',
        description: 'KI-gestütztes Stimmungstagebuch. Schreib wie du dich fühlst – die KI gibt Tipps und trackt deine Stimmung über Wochen.',
        tags: ['Node.js', 'OpenRouter', 'Chart.js', 'PostgreSQL'],
        github: 'https://github.com/onurkara/emotionschat',
        demo: 'https://emotionschat.onurkara.dev'
    },
    {
        name: '📚 StudySnap AI',
        description: 'Lern-App: PDFs hochladen → KI generiert Zusammenfassungen, Quizfragen, Chat mit Dokument und erkennt Prüfungsrelevanz.',
        tags: ['Node.js', 'OpenRouter', 'PostgreSQL', 'Vanilla JS'],
        github: 'https://github.com/onurkara/studysnap-ai',
        demo: 'https://studysnap.onurkara.dev'
    },
    {
        name: '🧠 KopfArena',
        description: 'Gehirn-Training mit 10+ Spielen: Memory, Konzentration, Reaktion, Logik, Mathe, Wortspiele gegen KI. Lokale Highscores.',
        tags: ['Vanilla JS', 'HTML5 Canvas', 'LocalStorage', 'CSS3'],
        github: 'https://github.com/onurkara/kopfarena',
        demo: 'https://kopfarena.onurkara.dev'
    },
    {
        name: '🔮 PersonalityAnalyzer',
        description: 'Analysiert deine Texte (Tagebuch, Gedanken, Simulation) und erstellt ein Big Five Persönlichkeitsprofil (OCEAN-Modell).',
        tags: ['Node.js', 'OpenRouter', 'Chart.js', 'Express'],
        github: 'https://github.com/onurkara/personalityanalyzer',
        demo: 'https://personalityanalyzer.onurkara.dev'
    }
];

// Projekte rendern
const projectsGrid = document.getElementById('projects-grid');
if (projectsGrid) {
    projectsGrid.innerHTML = projects.map(project => {
        const isLive = LIVE_PROJECTS.includes(project.name);
        return `
            <div class="project-card">
                <div class="project-icon">
                    <i class="fas ${getProjectIcon(project.name)}"></i>
                </div>
                <div class="project-content">
                    <h3>${project.name}</h3>
                    <p>${project.description}</p>
                    <div class="project-tags">
                        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="project-links">
                        <a href="${project.github}" target="_blank"><i class="fab fa-github"></i> Code</a>
                        ${isLive ? `<a href="${project.demo}" target="_blank"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ========== SKILLS-DATEN ==========
const skills = [
    { name: 'JavaScript', icon: 'fab fa-js', level: 'Fortgeschritten' },
    { name: 'Node.js', icon: 'fab fa-node-js', level: 'Fortgeschritten' },
    { name: 'Express', icon: 'fas fa-server', level: 'Fortgeschritten' },
    { name: 'PostgreSQL', icon: 'fas fa-database', level: 'Mittel' },
    { name: 'HTML5/CSS3', icon: 'fab fa-html5', level: 'Fortgeschritten' },
    { name: 'Git/GitHub', icon: 'fab fa-git-alt', level: 'Fortgeschritten' },
    { name: 'REST APIs', icon: 'fas fa-plug', level: 'Fortgeschritten' },
    { name: 'KI-Integration', icon: 'fas fa-brain', level: 'Mittel' }
];

const skillsGrid = document.getElementById('skills-grid');
if (skillsGrid) {
    skillsGrid.innerHTML = skills.map(skill => `
        <div class="skill-card">
            <i class="${skill.icon}"></i>
            <h4>${skill.name}</h4>
            <div class="skill-level">${skill.level}</div>
        </div>
    `).join('');
}

// ========== KONTAKTFORMULAR ==========
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    const honeypot = document.getElementById('honeypot').value;
    
    // Basic validation
    if (!name || !email || !message) {
        formMessage.innerHTML = '<div class="error">Bitte alle Felder ausfüllen</div>';
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        formMessage.innerHTML = '<div class="error">Bitte eine gültige E-Mail-Adresse eingeben</div>';
        return;
    }
    
    formMessage.innerHTML = '<div class="success">Sende Nachricht...</div>';
    
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message, honeypot })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            formMessage.innerHTML = '<div class="success">✅ Nachricht gesendet! Ich melde mich bald.</div>';
            contactForm.reset();
        } else {
            formMessage.innerHTML = `<div class="error">❌ ${data.error || 'Fehler beim Senden'}</div>`;
        }
    } catch (error) {
        formMessage.innerHTML = '<div class="error">❌ Fehler beim Senden. Bitte versuch es später.</div>';
    }
});

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ========== PERSÖNLICHE DATEN AUS .env LADEN (via API) ==========
async function loadProfileData() {
    try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        
        // Kontakt-Info aktualisieren
        const contactEmail = document.getElementById('contact-email');
        if (contactEmail && data.email) {
            contactEmail.textContent = data.email;
        }
        
        // Social Links aktualisieren
        const socialLinks = document.querySelector('.social-links');
        if (socialLinks) {
            const githubLink = socialLinks.querySelector('a[aria-label="GitHub"]');
            const linkedinLink = socialLinks.querySelector('a[aria-label="LinkedIn"]');
            const xLink = socialLinks.querySelector('a[aria-label="X"]');
            
            if (githubLink && data.githubUsername) {
                githubLink.href = `https://github.com/${data.githubUsername}`;
            }
            if (linkedinLink && data.linkedin) {
                linkedinLink.href = data.linkedin;
            }
            if (xLink && data.x) {
                xLink.href = data.x;
            }
        }
        
        // Lebenslauf Download Link aktualisieren
        const cvButton = document.querySelector('.btn-secondary[download]');
        if (cvButton && data.cvUrl) {
            cvButton.href = data.cvUrl;
        }
        
        return data;
    } catch (error) {
        console.error('Fehler beim Laden der Profil-Daten:', error);
    }
}

// GitHub Repos laden (optional)
async function loadGitHubRepos() {
    try {
        const response = await fetch('/api/profile/github-repos');
        const repos = await response.json();
        console.log('GitHub Repos:', repos);
        return repos;
    } catch (error) {
        console.error('Fehler beim Laden der Repos:', error);
    }
}

// Beim Laden der Seite ausführen
document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
    loadGitHubRepos();
});

console.log('🌟 Portfolio ready!');
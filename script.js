// Dil Sistemi - KESİN ÇALIŞAN SON HAL
class LanguageManager {
    constructor() {
        this.currentLang = 'de';
        this.translations = window.translations || {};
    }
    
    init() {
        console.log('LanguageManager init started');
        
        // LocalStorage'dan dil kontrolü
        const savedLang = localStorage.getItem('globalex_lang');
        
        // Varsayılan: Almanca (DE)
        this.currentLang = savedLang || 'de';
        console.log('Current language:', this.currentLang);
        
        // HTML lang attribute ayarla
        document.documentElement.lang = this.currentLang;
        
        // Dil seçiciyi güncelle
        this.updateLanguageSelector(this.currentLang);
        
        // Tüm metinleri çevir
        this.translateAll();
        
        // Loader text'ini güncelle
        this.updateLoaderText();
        
        // Event listener'ları kur
        this.setupEventListeners();
        
        // Loader'ı kaldır
        setTimeout(() => this.hideLoader(), 800);
        
        console.log('Language system initialized successfully');
    }
    
    changeLanguage(lang) {
        if (lang === this.currentLang) return;
        
        console.log('Changing language to:', lang);
        
        // Mevcut dili güncelle
        this.currentLang = lang;
        
        // LocalStorage'a kaydet
        localStorage.setItem('globalex_lang', lang);
        
        // HTML lang attribute güncelle
        document.documentElement.lang = lang;
        
        // Dil seçiciyi güncelle
        this.updateLanguageSelector(lang);
        
        // Tüm metinleri çevir
        this.translateAll();
        
        // Loader text'ini güncelle
        this.updateLoaderText();
        
        // Dropdown'u kapat
        this.closeDropdowns();
        
        // Sayfa başlığını güncelle
        this.updatePageTitle();
    }
    
    updateLanguageSelector(lang) {
        const flags = {
            'de': '🇩🇪',
            'en': '🇬🇧', 
            'tr': '🇹🇷',
            'ru': '🇷🇺'
        };
        
        const currentLangBtn = document.getElementById('currentLang');
        if (currentLangBtn) {
            const flagSpan = currentLangBtn.querySelector('.flag');
            const textSpan = currentLangBtn.querySelectorAll('span')[1];
            
            if (flagSpan) flagSpan.textContent = flags[lang] || '🏴';
            if (textSpan) textSpan.textContent = lang.toUpperCase();
        }
        
        // Dropdown'taki aktif dili güncelle
        document.querySelectorAll('.dropdown button').forEach(button => {
            const btnLang = button.getAttribute('data-lang');
            if (btnLang === lang) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
    
    updatePageTitle() {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        const titles = {
            'de': {
                'index.html': 'GLOBALEX | Sovereign Digital Architecture',
                'services.html': 'Leistungen | GLOBALEX Digital',
                'portfolio.html': 'Portfolio | GLOBALEX Digital',
                'blog.html': 'Blog | GLOBALEX Digital',
                'about.html': 'Über uns | GLOBALEX Digital',
                'contact.html': 'Kontakt | GLOBALEX Digital'
            },
            'en': {
                'index.html': 'GLOBALEX | Sovereign Digital Architecture',
                'services.html': 'Services | GLOBALEX Digital',
                'portfolio.html': 'Portfolio | GLOBALEX Digital',
                'blog.html': 'Blog | GLOBALEX Digital',
                'about.html': 'About | GLOBALEX Digital',
                'contact.html': 'Contact | GLOBALEX Digital'
            },
            'tr': {
                'index.html': 'GLOBALEX | Sovereign Digital Architecture',
                'services.html': 'Hizmetler | GLOBALEX Digital',
                'portfolio.html': 'Portfolyo | GLOBALEX Digital',
                'blog.html': 'Blog | GLOBALEX Digital',
                'about.html': 'Hakkımızda | GLOBALEX Digital',
                'contact.html': 'İletişim | GLOBALEX Digital'
            },
            'ru': {
                'index.html': 'GLOBALEX | Sovereign Digital Architecture',
                'services.html': 'Услуги | GLOBALEX Digital',
                'portfolio.html': 'Портфолио | GLOBALEX Digital',
                'blog.html': 'Блог | GLOBALEX Digital',
                'about.html': 'О нас | GLOBALEX Digital',
                'contact.html': 'Контакты | GLOBALEX Digital'
            }
        };
        
        if (titles[this.currentLang] && titles[this.currentLang][page]) {
            document.title = titles[this.currentLang][page];
        }
    }
    
    translateAll() {
        const elements = document.querySelectorAll('[data-key]');
        console.log(`Translating ${elements.length} elements`);
        
        elements.forEach(element => {
            const key = element.getAttribute('data-key');
            const translation = this.getTranslation(key);
            
            if (translation && translation !== key) {
                // Element tipine göre işlem yap
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else if (element.tagName === 'IMG' && element.hasAttribute('alt')) {
                    element.alt = translation;
                } else {
                    // HTML içeriği kontrol et
                    if (translation.includes('<') || translation.includes('&')) {
                        element.innerHTML = translation;
                    } else {
                        element.textContent = translation;
                    }
                }
            }
        });
        
        // Sayfa başlığını güncelle
        this.updatePageTitle();
    }
    
    getTranslation(key) {
        if (!this.translations[this.currentLang]) {
            console.warn(`No translations for language: ${this.currentLang}`);
            return key;
        }
        
        const translation = this.translations[this.currentLang][key];
        if (!translation) {
            console.warn(`No translation for key: ${key} in language: ${this.currentLang}`);
        }
        return translation || key;
    }
    
    updateLoaderText() {
        const loaderText = document.querySelector('.loader-text');
        if (loaderText) {
            const texts = {
                'de': 'Initialisiere...',
                'en': 'Initializing...',
                'tr': 'Başlatılıyor...',
                'ru': 'Инициализация...'
            };
            loaderText.textContent = texts[this.currentLang] || 'Loading...';
        }
    }
    
    setupEventListeners() {
        // Dil seçici dropdown toggle
        const currentLangBtn = document.getElementById('currentLang');
        if (currentLangBtn) {
            currentLangBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const dropdown = currentLangBtn.nextElementSibling;
                if (dropdown && dropdown.classList.contains('dropdown')) {
                    dropdown.classList.toggle('show');
                }
            });
        }
        
        // Dil değiştirme butonları
        document.querySelectorAll('.dropdown button[data-lang]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const lang = e.currentTarget.getAttribute('data-lang');
                this.changeLanguage(lang);
            });
        });
        
        // Sayfa dışına tıklayınca dropdown'u kapat
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-selector')) {
                this.closeDropdowns();
            }
        });
        
        // Escape tuşu ile kapat
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDropdowns();
            }
        });
    }
    
    closeDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }
    
    hideLoader() {
        const loader = document.querySelector('.language-loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.pointerEvents = 'none';
            
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.style.display = 'none';
                }
            }, 500);
        }
        
        // Sayfa yüklendi olarak işaretle
        document.body.classList.add('loaded');
    }
}

// UI İşlevleri
class UI {
    static init() {
        this.setupMobileMenu();
        this.setupSmoothScroll();
        this.setupFormValidation();
    }
    
    static setupMobileMenu() {
        const toggle = document.querySelector('.menu-toggle');
        const menu = document.querySelector('.nav-menu');
        
        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                menu.classList.toggle('active');
                toggle.classList.toggle('active');
                
                // Mobilde açıkken dil dropdown'u kapat
                if (menu.classList.contains('active')) {
                    const dropdowns = document.querySelectorAll('.dropdown');
                    dropdowns.forEach(d => d.classList.remove('show'));
                }
            });
            
            // Menü dışına tıklayınca kapat
            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                    menu.classList.remove('active');
                    toggle.classList.remove('active');
                }
            });
        }
    }
    
    static setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href.startsWith('#') && document.querySelector(href)) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    const headerHeight = document.querySelector('.main-nav').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Mobil menüyü kapat
                    const menu = document.querySelector('.nav-menu');
                    const toggle = document.querySelector('.menu-toggle');
                    if (menu) menu.classList.remove('active');
                    if (toggle) toggle.classList.remove('active');
                }
            });
        });
    }
    
    static setupFormValidation() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Basit form validation
                let isValid = true;
                const requiredFields = this.querySelectorAll('[required]');
                
                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.style.borderColor = '#ff6b6b';
                    } else {
                        field.style.borderColor = '';
                    }
                });
                
                if (isValid) {
                    alert('Thank you for your message! We will contact you soon.');
                    this.reset();
                } else {
                    alert('Please fill in all required fields.');
                }
            });
        }
    }
}

// Başlatma
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    try {
        // Translations kontrolü
        if (!window.translations) {
            console.error('Translations not loaded! Using empty translations.');
            window.translations = { de: {}, en: {}, tr: {}, ru: {} };
        }
        
        // Dil yöneticisini oluştur ve başlat
        window.languageManager = new LanguageManager();
        window.languageManager.init();
        
        // UI'yı başlat
        UI.init();
        
        console.log('GLOBALEX Site fully loaded');
    } catch (error) {
        console.error('Initialization error:', error);
        // Hata durumunda loader'ı kaldır
        const loader = document.querySelector('.language-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
});

// Global erişim için
window.LanguageManager = LanguageManager;
window.UI = UI;
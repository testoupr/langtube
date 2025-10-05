// Language Dropdown Functionality
document.addEventListener('DOMContentLoaded', function() {
    const dropdownBtn = document.getElementById('language-dropdown-btn');
    const dropdownMenu = document.getElementById('language-dropdown-menu');
    const currentLanguage = document.getElementById('current-language');
    
    if (!dropdownBtn || !dropdownMenu || !currentLanguage) {
        console.log('Language dropdown elements not found');
        return;
    }
    
    // Language mapping for current page detection
    const languageMap = {
        'index.html': { flag: '🇺🇸', name: 'English', code: 'en' },
        'spanish.html': { flag: '🇪🇸', name: 'Español', code: 'es' },
        'french.html': { flag: '🇫🇷', name: 'Français', code: 'fr' },
        'german.html': { flag: '🇩🇪', name: 'Deutsch', code: 'de' },
        'chinese.html': { flag: '🇨🇳', name: '中文', code: 'zh' },
        'japanese.html': { flag: '🇯🇵', name: '日本語', code: 'ja' },
        'korean.html': { flag: '🇰🇷', name: '한국어', code: 'ko' },
        'arabic.html': { flag: '🇸🇦', name: 'العربية', code: 'ar' },
        'hindi.html': { flag: '🇮🇳', name: 'हिन्दी', code: 'hi' },
        'portuguese.html': { flag: '🇵🇹', name: 'Português', code: 'pt' },
        'russian.html': { flag: '🇷🇺', name: 'Русский', code: 'ru' },
        'italian.html': { flag: '🇮🇹', name: 'Italiano', code: 'it' },
        'languages.html': { flag: '🌍', name: 'All Languages', code: 'en' }
    };
    
    // Set current language based on current page
    const currentPage = window.location.pathname.split('/').pop();
    const currentLang = languageMap[currentPage];
    
    if (currentLang) {
        currentLanguage.textContent = `${currentLang.flag} ${currentLang.name}`;
        dropdownBtn.classList.add('active');
        
        // Set native language in global state if it exists
        if (typeof state !== 'undefined' && currentLang.code) {
            state.nativeLanguage = currentLang.code;
            console.log('Native language set on page load to:', currentLang.code);
        }
    }
    
    // Toggle dropdown
    dropdownBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
        dropdownBtn.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show');
            dropdownBtn.classList.remove('active');
        }
    });
    
    // Handle language selection
    dropdownMenu.addEventListener('click', function(e) {
        const option = e.target.closest('.language-option');
        if (option) {
            const href = option.getAttribute('href');
            const langCode = option.getAttribute('data-lang');
            
            // Set native language in global state if it exists
            if (typeof state !== 'undefined' && langCode) {
                state.nativeLanguage = langCode;
                console.log('Native language set to:', langCode);
            }
            
            if (href && href !== window.location.pathname.split('/').pop()) {
                // Add a small delay for visual feedback
                option.style.background = 'var(--primary-color)';
                option.style.color = 'white';
                
                setTimeout(() => {
                    window.location.href = href;
                }, 150);
            }
        }
    });
    
    // Keyboard navigation
    dropdownBtn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            dropdownMenu.classList.toggle('show');
            dropdownBtn.classList.toggle('active');
        } else if (e.key === 'Escape') {
            dropdownMenu.classList.remove('show');
            dropdownBtn.classList.remove('active');
        }
    });
    
    // Arrow key navigation in dropdown
    let currentIndex = -1;
    const options = dropdownMenu.querySelectorAll('.language-option');
    
    dropdownMenu.addEventListener('keydown', function(e) {
        if (!dropdownMenu.classList.contains('show')) return;
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                currentIndex = Math.min(currentIndex + 1, options.length - 1);
                options[currentIndex]?.focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                currentIndex = Math.max(currentIndex - 1, 0);
                options[currentIndex]?.focus();
                break;
            case 'Enter':
                e.preventDefault();
                options[currentIndex]?.click();
                break;
            case 'Escape':
                dropdownMenu.classList.remove('show');
                dropdownBtn.classList.remove('active');
                dropdownBtn.focus();
                break;
        }
    });
    
    // Make options focusable
    options.forEach(option => {
        option.setAttribute('tabindex', '0');
    });
});

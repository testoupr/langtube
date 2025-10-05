// Script to add navigation to all language pages
const fs = require('fs');
const path = require('path');

// Language configurations with navigation text
const languages = {
    '../languages/french.html': {
        navTitle: 'Choisissez Votre Langue / Choose Your Language / 选择您的语言',
        activeLink: '../languages/french.html'
    },
    '../languages/german.html': {
        navTitle: 'Wählen Sie Ihre Sprache / Choose Your Language / 选择您的语言',
        activeLink: '../languages/german.html'
    },
    '../languages/chinese.html': {
        navTitle: '选择您的语言 / Choose Your Language / Choisissez Votre Langue',
        activeLink: '../languages/chinese.html'
    },
    '../languages/japanese.html': {
        navTitle: '言語を選択 / Choose Your Language / 选择您的语言',
        activeLink: '../languages/japanese.html'
    },
    '../languages/korean.html': {
        navTitle: '언어를 선택하세요 / Choose Your Language / 选择您的语言',
        activeLink: '../languages/korean.html'
    },
    '../languages/arabic.html': {
        navTitle: 'اختر لغتك / Choose Your Language / 选择您的语言',
        activeLink: '../languages/arabic.html'
    },
    '../languages/hindi.html': {
        navTitle: 'अपनी भाषा चुनें / Choose Your Language / 选择您的语言',
        activeLink: '../languages/hindi.html'
    },
    '../languages/portuguese.html': {
        navTitle: 'Escolha Seu Idioma / Choose Your Language / 选择您的语言',
        activeLink: '../languages/portuguese.html'
    },
    '../languages/russian.html': {
        navTitle: 'Выберите Язык / Choose Your Language / 选择您的语言',
        activeLink: '../languages/russian.html'
    },
    '../languages/italian.html': {
        navTitle: 'Scegli La Tua Lingua / Choose Your Language / 选择您的语言',
        activeLink: '../languages/italian.html'
    }
};

// Navigation HTML template
function generateNavigation(activeFile) {
    const navTitle = languages[activeFile]?.navTitle || 'Choose Your Language / Choisissez Votre Langue / 选择您的语言';
    
    return `            <!-- Language Navigation -->
            <div class="language-nav">
                <h3>${navTitle}</h3>
                <div class="language-grid">
                    <a href="../index.html" class="lang-link">🇺🇸 English</a>
                    <a href="../languages/spanish.html" class="lang-link">🇪🇸 Español</a>
                    <a href="../languages/french.html" class="lang-link">🇫🇷 Français</a>
                    <a href="../languages/german.html" class="lang-link">🇩🇪 Deutsch</a>
                    <a href="../languages/chinese.html" class="lang-link">🇨🇳 中文</a>
                    <a href="../languages/japanese.html" class="lang-link">🇯🇵 日本語</a>
                    <a href="../languages/korean.html" class="lang-link">🇰🇷 한국어</a>
                    <a href="../languages/arabic.html" class="lang-link">🇸🇦 العربية</a>
                    <a href="../languages/hindi.html" class="lang-link">🇮🇳 हिन्दी</a>
                    <a href="../languages/portuguese.html" class="lang-link">🇵🇹 Português</a>
                    <a href="../languages/russian.html" class="lang-link">🇷🇺 Русский</a>
                    <a href="../languages/italian.html" class="lang-link">🇮🇹 Italiano</a>
                </div>
            </div>`;
}

// Function to add navigation to a file
function addNavigationToFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if navigation already exists
        if (content.includes('language-nav')) {
            console.log(`Navigation already exists in ${filePath}`);
            return;
        }
        
        // Find the header section and add navigation
        const headerPattern = /(<header class="header">[\s\S]*?<p class="tagline">[^<]*<\/p>)\s*(<\/header>)/;
        const match = content.match(headerPattern);
        
        if (match) {
            const navigation = generateNavigation(path.basename(filePath));
            const newContent = content.replace(headerPattern, `$1\n            \n${navigation}\n        $2`);
            
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Added navigation to ${filePath}`);
        } else {
            console.log(`Could not find header pattern in ${filePath}`);
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

// Add navigation to all language files
const languageFiles = [
    '../languages/french.html',
    '../languages/german.html', 
    '../languages/chinese.html',
    '../languages/japanese.html',
    '../languages/korean.html',
    '../languages/arabic.html',
    '../languages/hindi.html',
    '../languages/portuguese.html',
    '../languages/russian.html',
    '../languages/italian.html'
];

languageFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        addNavigationToFile(filePath);
    } else {
        console.log(`File ${file} does not exist, skipping...`);
    }
});

console.log('Navigation addition completed!');

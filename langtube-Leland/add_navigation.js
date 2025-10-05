// Script to add navigation to all language pages
const fs = require('fs');
const path = require('path');

// Language configurations with navigation text
const languages = {
    'french.html': {
        navTitle: 'Choisissez Votre Langue / Choose Your Language / 选择您的语言',
        activeLink: 'french.html'
    },
    'german.html': {
        navTitle: 'Wählen Sie Ihre Sprache / Choose Your Language / 选择您的语言',
        activeLink: 'german.html'
    },
    'chinese.html': {
        navTitle: '选择您的语言 / Choose Your Language / Choisissez Votre Langue',
        activeLink: 'chinese.html'
    },
    'japanese.html': {
        navTitle: '言語を選択 / Choose Your Language / 选择您的语言',
        activeLink: 'japanese.html'
    },
    'korean.html': {
        navTitle: '언어를 선택하세요 / Choose Your Language / 选择您的语言',
        activeLink: 'korean.html'
    },
    'arabic.html': {
        navTitle: 'اختر لغتك / Choose Your Language / 选择您的语言',
        activeLink: 'arabic.html'
    },
    'hindi.html': {
        navTitle: 'अपनी भाषा चुनें / Choose Your Language / 选择您的语言',
        activeLink: 'hindi.html'
    },
    'portuguese.html': {
        navTitle: 'Escolha Seu Idioma / Choose Your Language / 选择您的语言',
        activeLink: 'portuguese.html'
    },
    'russian.html': {
        navTitle: 'Выберите Язык / Choose Your Language / 选择您的语言',
        activeLink: 'russian.html'
    },
    'italian.html': {
        navTitle: 'Scegli La Tua Lingua / Choose Your Language / 选择您的语言',
        activeLink: 'italian.html'
    }
};

// Navigation HTML template
function generateNavigation(activeFile) {
    const navTitle = languages[activeFile]?.navTitle || 'Choose Your Language / Choisissez Votre Langue / 选择您的语言';
    
    return `            <!-- Language Navigation -->
            <div class="language-nav">
                <h3>${navTitle}</h3>
                <div class="language-grid">
                    <a href="index.html" class="lang-link">🇺🇸 English</a>
                    <a href="spanish.html" class="lang-link">🇪🇸 Español</a>
                    <a href="french.html" class="lang-link">🇫🇷 Français</a>
                    <a href="german.html" class="lang-link">🇩🇪 Deutsch</a>
                    <a href="chinese.html" class="lang-link">🇨🇳 中文</a>
                    <a href="japanese.html" class="lang-link">🇯🇵 日本語</a>
                    <a href="korean.html" class="lang-link">🇰🇷 한국어</a>
                    <a href="arabic.html" class="lang-link">🇸🇦 العربية</a>
                    <a href="hindi.html" class="lang-link">🇮🇳 हिन्दी</a>
                    <a href="portuguese.html" class="lang-link">🇵🇹 Português</a>
                    <a href="russian.html" class="lang-link">🇷🇺 Русский</a>
                    <a href="italian.html" class="lang-link">🇮🇹 Italiano</a>
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
    'french.html',
    'german.html', 
    'chinese.html',
    'japanese.html',
    'korean.html',
    'arabic.html',
    'hindi.html',
    'portuguese.html',
    'russian.html',
    'italian.html'
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

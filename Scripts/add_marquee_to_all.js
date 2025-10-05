// Script to add language marquee to all language pages
const fs = require('fs');
const path = require('path');

// Marquee HTML template
const marqueeHTML = `        <!-- Language Marquee -->
        <div class="language-marquee">
            <div class="marquee-content">
                <div class="language-item">
                    <span class="language-flag">🇺🇸</span>
                    <span class="language-name">English</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇪🇸</span>
                    <span class="language-name">Español</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇫🇷</span>
                    <span class="language-name">Français</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇩🇪</span>
                    <span class="language-name">Deutsch</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇨🇳</span>
                    <span class="language-name">中文</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇯🇵</span>
                    <span class="language-name">日本語</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇰🇷</span>
                    <span class="language-name">한국어</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇸🇦</span>
                    <span class="language-name">العربية</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇮🇳</span>
                    <span class="language-name">हिन्दी</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇵🇹</span>
                    <span class="language-name">Português</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇷🇺</span>
                    <span class="language-name">Русский</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇮🇹</span>
                    <span class="language-name">Italiano</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇳🇱</span>
                    <span class="language-name">Nederlands</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇸🇪</span>
                    <span class="language-name">Svenska</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇳🇴</span>
                    <span class="language-name">Norsk</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇩🇰</span>
                    <span class="language-name">Dansk</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇫🇮</span>
                    <span class="language-name">Suomi</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇵🇱</span>
                    <span class="language-name">Polski</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇨🇿</span>
                    <span class="language-name">Čeština</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇭🇺</span>
                    <span class="language-name">Magyar</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇷🇴</span>
                    <span class="language-name">Română</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇧🇬</span>
                    <span class="language-name">Български</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇭🇷</span>
                    <span class="language-name">Hrvatski</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇷🇸</span>
                    <span class="language-name">Српски</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇸🇰</span>
                    <span class="language-name">Slovenčina</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇸🇮</span>
                    <span class="language-name">Slovenščina</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇱🇹</span>
                    <span class="language-name">Lietuvių</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇱🇻</span>
                    <span class="language-name">Latviešu</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇪🇪</span>
                    <span class="language-name">Eesti</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇬🇷</span>
                    <span class="language-name">Ελληνικά</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇮🇱</span>
                    <span class="language-name">עברית</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇹🇷</span>
                    <span class="language-name">Türkçe</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇮🇩</span>
                    <span class="language-name">Bahasa Indonesia</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇹🇭</span>
                    <span class="language-name">ไทย</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇻🇳</span>
                    <span class="language-name">Tiếng Việt</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇰🇪</span>
                    <span class="language-name">Kiswahili</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇧🇩</span>
                    <span class="language-name">বাংলা</span>
                </div>
                <div class="language-item">
                    <span class="language-flag">🇺🇦</span>
                    <span class="language-name">Українська</span>
                </div>
            </div>
        </div>`;

// Function to add marquee to a file
function addMarqueeToFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if marquee already exists
        if (content.includes('language-marquee')) {
            console.log(`Marquee already exists in ${filePath}`);
            return;
        }
        
        // Find the header section and add marquee after it
        const headerPattern = /(<\/header>)\s*(<main class="main">)/;
        const match = content.match(headerPattern);
        
        if (match) {
            const newContent = content.replace(headerPattern, `$1\n\n${marqueeHTML}\n\n$2`);
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Added marquee to ${filePath}`);
        } else {
            console.log(`Could not find insertion point in ${filePath}`);
        }
        
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

// List of all language files
const languageFiles = [
    '../languages/spanish.html',
    '../languages/french.html',
    '../languages/german.html',
    '../languages/chinese.html',
    '../languages/japanese.html',
    '../languages/korean.html',
    '../languages/arabic.html',
    '../languages/hindi.html',
    '../languages/portuguese.html',
    '../languages/russian.html',
    '../languages/italian.html',
    '../languages/languages.html'
];

// Add marquee to all language files
languageFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        addMarqueeToFile(filePath);
    } else {
        console.log(`File ${file} does not exist, skipping...`);
    }
});

console.log('Marquee addition completed!');

// Script to update all language pages with dropdown navigation
const fs = require('fs');
const path = require('path');

// Language configurations
const languages = {
    '../languages/arabic.html': { currentText: '🇸🇦 العربية' },
    '../languages/hindi.html': { currentText: '🇮🇳 हिन्दी' },
    '../languages/portuguese.html': { currentText: '🇵🇹 Português' },
    '../languages/russian.html': { currentText: '🇷🇺 Русский' },
    '../languages/italian.html': { currentText: '🇮🇹 Italiano' }
};

// Dropdown HTML template
function generateDropdown(currentText) {
    return `            <!-- Language Dropdown -->
            <div class="language-dropdown">
                <button class="language-dropdown-btn" id="language-dropdown-btn">
                    <span class="current-language" id="current-language">${currentText}</span>
                    <span class="dropdown-arrow">▼</span>
                </button>
                <div class="language-dropdown-menu" id="language-dropdown-menu">
                    <a href="../index.html" class="language-option" data-lang="en">🇺🇸 English</a>
                    <a href="../languages/spanish.html" class="language-option" data-lang="es">🇪🇸 Español</a>
                    <a href="../languages/french.html" class="language-option" data-lang="fr">🇫🇷 Français</a>
                    <a href="../languages/german.html" class="language-option" data-lang="de">🇩🇪 Deutsch</a>
                    <a href="../languages/chinese.html" class="language-option" data-lang="zh">🇨🇳 中文</a>
                    <a href="../languages/japanese.html" class="language-option" data-lang="ja">🇯🇵 日本語</a>
                    <a href="../languages/korean.html" class="language-option" data-lang="ko">🇰🇷 한국어</a>
                    <a href="../languages/arabic.html" class="language-option" data-lang="ar">🇸🇦 العربية</a>
                    <a href="../languages/hindi.html" class="language-option" data-lang="hi">🇮🇳 हिन्दी</a>
                    <a href="../languages/portuguese.html" class="language-option" data-lang="pt">🇵🇹 Português</a>
                    <a href="../languages/russian.html" class="language-option" data-lang="ru">🇷🇺 Русский</a>
                    <a href="../languages/italian.html" class="language-option" data-lang="it">🇮🇹 Italiano</a>
                    <a href="../languages/languages.html" class="language-option all-languages">🌍 All Languages</a>
                </div>
            </div>`;
}

// Function to update a file with dropdown
function updateFileWithDropdown(filePath, currentText) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if dropdown already exists
        if (content.includes('language-dropdown')) {
            console.log(`Dropdown already exists in ${filePath}`);
            return;
        }
        
        // Replace old navigation with dropdown
        const oldNavPattern = /<!-- Language Navigation -->[\s\S]*?<\/div>\s*<\/div>/;
        const dropdown = generateDropdown(currentText);
        
        if (content.match(oldNavPattern)) {
            // Replace existing navigation
            content = content.replace(oldNavPattern, dropdown);
        } else {
            // Add dropdown after tagline
            const taglinePattern = /(<p class="tagline">[^<]*<\/p>)\s*(<\/header>)/;
            if (content.match(taglinePattern)) {
                content = content.replace(taglinePattern, `$1\n            \n${dropdown}\n        $2`);
            } else {
                console.log(`Could not find insertion point in ${filePath}`);
                return;
            }
        }
        
        // Add JavaScript file if not present
        if (!content.includes('../language-dropdown.js')) {
            const scriptPattern = /(<script src="app\.js"><\/script>)/;
            content = content.replace(scriptPattern, `$1\n    <script src="../language-dropdown.js"></script>`);
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath} with dropdown`);
        
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

// Update all language files
Object.entries(languages).forEach(([file, config]) => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        updateFileWithDropdown(filePath, config.currentText);
    } else {
        console.log(`File ${file} does not exist, skipping...`);
    }
});

console.log('Dropdown update completed!');

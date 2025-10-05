// Script to add language dropdown to all language pages
const fs = require('fs');
const path = require('path');

// Language configurations with dropdown text
const languages = {
    '../languages/spanish.html': {
        currentText: '🇪🇸 Español'
    },
    '../languages/french.html': {
        currentText: '🇫🇷 Français'
    },
    '../languages/german.html': {
        currentText: '🇩🇪 Deutsch'
    },
    '../languages/chinese.html': {
        currentText: '🇨🇳 中文'
    },
    '../languages/japanese.html': {
        currentText: '🇯🇵 日本語'
    },
    '../languages/korean.html': {
        currentText: '🇰🇷 한국어'
    },
    '../languages/arabic.html': {
        currentText: '🇸🇦 العربية'
    },
    '../languages/hindi.html': {
        currentText: '🇮🇳 हिन्दी'
    },
    '../languages/portuguese.html': {
        currentText: '🇵🇹 Português'
    },
    '../languages/russian.html': {
        currentText: '🇷🇺 Русский'
    },
    '../languages/italian.html': {
        currentText: '🇮🇹 Italiano'
    }
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

// Function to add dropdown to a file
function addDropdownToFile(filePath, currentText) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if dropdown already exists
        if (content.includes('language-dropdown')) {
            console.log(`Dropdown already exists in ${filePath}`);
            return;
        }
        
        // Find the header section and add dropdown
        const headerPattern = /(<header class="header">[\s\S]*?<p class="tagline">[^<]*<\/p>)\s*(<\/header>)/;
        const match = content.match(headerPattern);
        
        if (match) {
            const dropdown = generateDropdown(currentText);
            const newContent = content.replace(headerPattern, `$1\n            \n${dropdown}\n        $2`);
            
            // Also add the JavaScript file if not present
            if (!content.includes('../language-dropdown.js')) {
                const scriptPattern = /(<script src="app\.js"><\/script>)/;
                const newContentWithScript = newContent.replace(scriptPattern, `$1\n    <script src="../language-dropdown.js"></script>`);
                fs.writeFileSync(filePath, newContentWithScript, 'utf8');
            } else {
                fs.writeFileSync(filePath, newContent, 'utf8');
            }
            
            console.log(`Added dropdown to ${filePath}`);
        } else {
            console.log(`Could not find header pattern in ${filePath}`);
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

// Add dropdown to all language files
Object.entries(languages).forEach(([file, config]) => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        addDropdownToFile(filePath, config.currentText);
    } else {
        console.log(`File ${file} does not exist, skipping...`);
    }
});

console.log('Dropdown addition completed!');

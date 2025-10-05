// Script to add language dropdown to all language pages
const fs = require('fs');
const path = require('path');

// Language configurations with dropdown text
const languages = {
    'spanish.html': {
        currentText: '🇪🇸 Español'
    },
    'french.html': {
        currentText: '🇫🇷 Français'
    },
    'german.html': {
        currentText: '🇩🇪 Deutsch'
    },
    'chinese.html': {
        currentText: '🇨🇳 中文'
    },
    'japanese.html': {
        currentText: '🇯🇵 日本語'
    },
    'korean.html': {
        currentText: '🇰🇷 한국어'
    },
    'arabic.html': {
        currentText: '🇸🇦 العربية'
    },
    'hindi.html': {
        currentText: '🇮🇳 हिन्दी'
    },
    'portuguese.html': {
        currentText: '🇵🇹 Português'
    },
    'russian.html': {
        currentText: '🇷🇺 Русский'
    },
    'italian.html': {
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
                    <a href="index.html" class="language-option" data-lang="en">🇺🇸 English</a>
                    <a href="spanish.html" class="language-option" data-lang="es">🇪🇸 Español</a>
                    <a href="french.html" class="language-option" data-lang="fr">🇫🇷 Français</a>
                    <a href="german.html" class="language-option" data-lang="de">🇩🇪 Deutsch</a>
                    <a href="chinese.html" class="language-option" data-lang="zh">🇨🇳 中文</a>
                    <a href="japanese.html" class="language-option" data-lang="ja">🇯🇵 日本語</a>
                    <a href="korean.html" class="language-option" data-lang="ko">🇰🇷 한국어</a>
                    <a href="arabic.html" class="language-option" data-lang="ar">🇸🇦 العربية</a>
                    <a href="hindi.html" class="language-option" data-lang="hi">🇮🇳 हिन्दी</a>
                    <a href="portuguese.html" class="language-option" data-lang="pt">🇵🇹 Português</a>
                    <a href="russian.html" class="language-option" data-lang="ru">🇷🇺 Русский</a>
                    <a href="italian.html" class="language-option" data-lang="it">🇮🇹 Italiano</a>
                    <a href="languages.html" class="language-option all-languages">🌍 All Languages</a>
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
            if (!content.includes('language-dropdown.js')) {
                const scriptPattern = /(<script src="app\.js"><\/script>)/;
                const newContentWithScript = newContent.replace(scriptPattern, `$1\n    <script src="language-dropdown.js"></script>`);
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

// Script to fix marquee animation and structural inconsistencies
const fs = require('fs');
const path = require('path');

// Function to fix marquee in a file
function fixMarqueeInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Fix indentation issues in marquee comment
        content = content.replace(/^\s*<!-- Language Marquee -->/gm, '        <!-- Language Marquee -->');
        
        // Ensure proper structure around marquee
        const marqueePattern = /(\s*)<!-- Language Marquee -->\s*<div class="language-marquee">/;
        const match = content.match(marqueePattern);
        
        if (match) {
            // Fix indentation to match the standard
            const fixedMarquee = content.replace(marqueePattern, '        <!-- Language Marquee -->\n        <div class="language-marquee">');
            content = fixedMarquee;
        }
        
        // Ensure proper spacing around marquee
        content = content.replace(/(<\/header>)\s*(\s*<!-- Language Marquee -->)/, '$1\n\n$2');
        content = content.replace(/(<\/div>\s*<\/div>\s*)(<main class="main">)/, '$1\n\n$2');
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed structure in ${filePath}`);
        
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

// List of all language files
const languageFiles = [
    'spanish.html',
    'french.html',
    'german.html',
    'chinese.html',
    'japanese.html',
    'korean.html',
    'arabic.html',
    'hindi.html',
    'portuguese.html',
    'russian.html',
    'italian.html',
    'languages.html'
];

// Fix structure in all language files
languageFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        fixMarqueeInFile(filePath);
    } else {
        console.log(`File ${file} does not exist, skipping...`);
    }
});

console.log('Structure fixes completed!');

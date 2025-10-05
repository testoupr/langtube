// Script to fix all structural inconsistencies across all language pages
const fs = require('fs');
const path = require('path');

// Function to fix structure in a file
function fixStructureInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Fix extra blank lines between marquee and main
        content = content.replace(/(<\/div>\s*<\/div>\s*)\n\s*\n\s*(<main class="main">)/, '$1\n\n$2');
        
        // Fix extra closing div tags
        content = content.replace(/(<\/div>\s*<\/div>\s*<\/div>\s*)(<main class="main">)/, '$1\n\n$2');
        
        // Fix indentation issues
        content = content.replace(/^\s*<!-- Language Marquee -->/gm, '        <!-- Language Marquee -->');
        
        // Ensure proper spacing around marquee
        content = content.replace(/(<\/header>)\s*(\s*<!-- Language Marquee -->)/, '$1\n\n$2');
        
        // Fix any extra blank lines
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        // Ensure consistent spacing before main
        content = content.replace(/(<\/div>\s*<\/div>\s*)\n\s*(<main class="main">)/, '$1\n\n$2');
        
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
        fixStructureInFile(filePath);
    } else {
        console.log(`File ${file} does not exist, skipping...`);
    }
});

console.log('All structure fixes completed!');

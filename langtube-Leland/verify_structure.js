// Script to verify and fix any remaining structural inconsistencies
const fs = require('fs');
const path = require('path');

// Function to ensure consistent structure
function ensureConsistentStructure(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Fix main tag indentation
        if (content.includes('<main class="main">') && !content.includes('        <main class="main">')) {
            content = content.replace(/<main class="main">/g, '        <main class="main">');
            modified = true;
        }
        
        // Fix marquee comment indentation
        if (content.includes('<!-- Language Marquee -->') && !content.includes('        <!-- Language Marquee -->')) {
            content = content.replace(/^\s*<!-- Language Marquee -->/gm, '        <!-- Language Marquee -->');
            modified = true;
        }
        
        // Fix extra blank lines
        const originalContent = content;
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        if (content !== originalContent) {
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed structure in ${filePath}`);
        } else {
            console.log(`No changes needed in ${filePath}`);
        }
        
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

// List of all language files
const languageFiles = [
    'index.html',
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

// Verify structure in all language files
languageFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        ensureConsistentStructure(filePath);
    } else {
        console.log(`File ${file} does not exist, skipping...`);
    }
});

console.log('Structure verification completed!');

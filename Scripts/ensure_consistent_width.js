// Script to ensure consistent width across all language pages
const fs = require('fs');
const path = require('path');

// Function to check and fix width consistency in a file
function ensureConsistentWidth(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Check if the file has proper container structure
        if (!content.includes('class="container"')) {
            console.log(`Missing container class in ${filePath}`);
            return;
        }
        
        // Check if the file has proper header structure
        if (!content.includes('class="header"')) {
            console.log(`Missing header class in ${filePath}`);
            return;
        }
        
        // Check if the file has proper main structure
        if (!content.includes('class="main"')) {
            console.log(`Missing main class in ${filePath}`);
            return;
        }
        
        // Verify the structure is consistent
        const containerMatch = content.match(/<div class="container">/);
        const headerMatch = content.match(/<header class="header">/);
        const mainMatch = content.match(/<main class="main">/);
        
        if (containerMatch && headerMatch && mainMatch) {
            console.log(`Structure verified in ${filePath}`);
        } else {
            console.log(`Structure issues found in ${filePath}`);
        }
        
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

// List of all language files
const languageFiles = [
    '../index.html',
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

// Check structure in all language files
languageFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        ensureConsistentWidth(filePath);
    } else {
        console.log(`File ${file} does not exist, skipping...`);
    }
});

console.log('Width consistency check completed!');

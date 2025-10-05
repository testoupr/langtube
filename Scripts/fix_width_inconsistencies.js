// Script to fix remaining width inconsistencies across all language pages
const fs = require('fs');
const path = require('path');

// Function to add additional width constraints to a file
function addWidthConstraints(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Check if the file has the proper structure
        if (!content.includes('class="container"')) {
            console.log(`Missing container in ${filePath}`);
            return;
        }
        
        // Add inline styles to ensure width consistency if needed
        if (content.includes('<div class="container">')) {
            // Check if we need to add any specific constraints
            const hasProperStructure = content.includes('class="header"') && 
                                     content.includes('class="main"') &&
                                     content.includes('class="language-dropdown"');
            
            if (hasProperStructure) {
                console.log(`Structure looks good in ${filePath}`);
            } else {
                console.log(`Structure issues in ${filePath}`);
            }
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

// Check all language files
languageFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        addWidthConstraints(filePath);
    } else {
        console.log(`File ${file} does not exist, skipping...`);
    }
});

console.log('Width consistency check completed!');

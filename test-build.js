const fs = require('fs');
const path = require('path');

// Temporarily comment out all Google Fonts imports
function commentOutGoogleFonts(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Comment out Google Fonts imports
        content = content.replace(/@import url\('https:\/\/fonts\.googleapis\.com[^']*'\);/g, '/* $& */');
        
        fs.writeFileSync(filePath, content);
        console.log(`Commented out Google Fonts in: ${filePath}`);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

// List of CSS files with Google Fonts imports
const cssFiles = [
    'client/src/styles/theme.css',
    'client/src/pages/auth/AuthStyles.css',
    'client/src/layouts/AccountantLayout.css',
    'client/src/index.css',
    'client/src/App.css'
];

cssFiles.forEach(file => {
    if (fs.existsSync(file)) {
        commentOutGoogleFonts(file);
    }
});

console.log('Temporarily commented out Google Fonts imports. Try building now.');
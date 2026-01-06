const fs = require('fs');

// Read the file
let content = fs.readFileSync('client/src/pages/HomePage.css', 'utf8');

// Remove all merge conflict markers and keep the appropriate content
content = content.replace(/\n([\s\S]*?)\n\n([\s\S]*?)\n>>>>>>> [a-f0-9]+/g, (match, head, incoming) => {
    // For most conflicts, we'll keep the HEAD version (first part)
    // But we need to be smart about which parts to keep
    
    // If the incoming change looks like it's adding new styles, merge them
    if (incoming.includes('grid-template-columns') && head.includes('grid-template-columns')) {
        // Keep the more specific grid template
        return incoming.trim();
    }
    
    // If it's a simple property addition, keep the HEAD version
    return head.trim();
});

// Handle any remaining simple conflicts
content = content.replace(/\n/g, '');
content = content.replace(/>>>>>>> [a-f0-9]+/g, '');
content = content.replace(/\n/g, '');

// Clean up any double newlines
content = content.replace(/\n\n\n+/g, '\n\n');

// Write back the cleaned content
fs.writeFileSync('client/src/pages/HomePage.css', content);

console.log('Fixed HomePage.css merge conflicts');
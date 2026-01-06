const fs = require('fs');

let content = fs.readFileSync('client/src/pages/HomePage.css', 'utf8');

// Replace all merge conflict blocks with clean resolution
content = content.replace(/\n([\s\S]*?)\n\n([\s\S]*?)\n>>>>>>> [a-f0-9]+/g, (match, head, incoming) => {
    // Clean up both sections
    const headClean = head.trim();
    const incomingClean = incoming.trim();
    
    // If one is empty, use the other
    if (!headClean) return incomingClean;
    if (!incomingClean) return headClean;
    
    // For grid template columns, use the larger minmax value
    if (headClean.includes('minmax(280px') && incomingClean.includes('minmax(300px')) {
        return incomingClean; // Use 300px version
    }
    
    // For padding values, use the more specific one
    if (headClean.includes('padding: 2.5rem;') && incomingClean.includes('padding: 2.5rem 2rem;')) {
        return incomingClean; // Use more specific padding
    }
    
    // For border-radius, use the smaller value for consistency
    if (headClean.includes('border-radius: 20px') && incomingClean.includes('border-radius: 12px')) {
        return incomingClean; // Use 12px for consistency
    }
    
    // Default to HEAD version
    return headClean;
});

// Clean up any remaining markers
content = content.replace(/\n/g, '');
content = content.replace(/>>>>>>> [a-f0-9]+/g, '');
content = content.replace(/\n/g, '');

// Remove excessive whitespace
content = content.replace(/\n\n\n+/g, '\n\n');

fs.writeFileSync('client/src/pages/HomePage.css', content);
console.log('Fixed HomePage.css conflicts');
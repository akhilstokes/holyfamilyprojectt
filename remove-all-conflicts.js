const fs = require('fs');
const path = require('path');

function removeConflictMarkers(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let hasConflicts = false;
        
        // Check if file has conflict markers
        if (content.includes('<<<<<<<') || content.includes('') || content.includes('>>>>>>>')) {
            hasConflicts = true;
            
            // Remove conflict markers and resolve conflicts
            content = content.replace(/\n([\s\S]*?)\n\n([\s\S]*?)\n>>>>>>> [a-f0-9]+/g, (match, head, incoming) => {
                // For most cases, prefer the HEAD version (current branch)
                return head.trim();
            });
            
            // Clean up any remaining markers
            content = content.replace(/\n?/g, '');
            content = content.replace(/\n?/g, '');
            content = content.replace(/>>>>>>> [a-f0-9]+\n?/g, '');
            
            // Clean up excessive newlines
            content = content.replace(/\n\n\n+/g, '\n\n');
            
            fs.writeFileSync(filePath, content);
            console.log(`✓ Fixed: ${filePath}`);
        }
        
        return hasConflicts;
    } catch (error) {
        console.error(`✗ Error fixing ${filePath}:`, error.message);
        return false;
    }
}

function findAndFixConflicts(dir) {
    const files = fs.readdirSync(dir);
    let fixedCount = 0;
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Skip node_modules and .git directories
            if (file !== 'node_modules' && file !== '.git' && file !== 'build' && file !== 'dist') {
                fixedCount += findAndFixConflicts(filePath);
            }
        } else if (file.endsWith('.css') || file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
            if (removeConflictMarkers(filePath)) {
                fixedCount++;
            }
        }
    }
    
    return fixedCount;
}

console.log('Scanning for merge conflicts...\n');
const fixedCount = findAndFixConflicts('.');
console.log(`\n🎉 Fixed merge conflicts in ${fixedCount} files.`);
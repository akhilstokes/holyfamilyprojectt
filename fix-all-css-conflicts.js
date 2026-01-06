const fs = require('fs');
const path = require('path');

function fixMergeConflicts(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Remove all merge conflict markers and resolve conflicts
        content = content.replace(/\n([\s\S]*?)\n\n([\s\S]*?)\n>>>>>>> [a-f0-9]+/g, (match, head, incoming) => {
            // For CSS files, we generally want to keep the more complete/newer styles
            // If both sections have content, try to merge intelligently
            
            const headLines = head.trim().split('\n');
            const incomingLines = incoming.trim().split('\n');
            
            // If one section is empty, use the other
            if (!head.trim()) return incoming.trim();
            if (!incoming.trim()) return head.trim();
            
            // If they're similar lengths and both have CSS rules, prefer HEAD (current branch)
            return head.trim();
        });
        
        // Clean up any remaining conflict markers
        content = content.replace(/\n/g, '');
        content = content.replace(/>>>>>>> [a-f0-9]+/g, '');
        content = content.replace(/\n/g, '');
        
        // Clean up excessive newlines
        content = content.replace(/\n\n\n+/g, '\n\n');
        
        fs.writeFileSync(filePath, content);
        console.log(`Fixed conflicts in: ${filePath}`);
        return true;
    } catch (error) {
        console.error(`Error fixing ${filePath}:`, error.message);
        return false;
    }
}

// List of CSS files with conflicts
const cssFiles = [
    'client/src/pages/HomePage.css',
    'client/src/pages/user_dashboard/Notifications.css',
    'client/src/pages/user_dashboard/UserRateHistory.css',
    'client/src/pages/manager/PendingLeaves.css',
    'client/src/pages/user_dashboard/MenuPage.css'
];

let fixedCount = 0;
cssFiles.forEach(file => {
    if (fs.existsSync(file)) {
        if (fixMergeConflicts(file)) {
            fixedCount++;
        }
    } else {
        console.log(`File not found: ${file}`);
    }
});

console.log(`\nFixed merge conflicts in ${fixedCount} CSS files.`);
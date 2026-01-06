const fs = require('fs');
const path = require('path');

function fixMergeConflicts(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      fixMergeConflicts(filePath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes('') || content.includes('') || content.includes('>>>>>>> ')) {
        console.log(`Fixing conflicts in: ${filePath}`);
        
        // Remove merge conflict markers and keep HEAD version
        // First, handle the pattern:  ...  ... >>>>>>> hash
        content = content.replace(/\r?\n([\s\S]*?)\r?\n[\s\S]*?>>>>>>> [^\r\n]*\r?\n?/g, '$1\n');
        
        // Handle remaining orphaned markers
        content = content.replace(/^\r?\n/gm, '');
        content = content.replace(/^>>>>>>> [^\r\n]*\r?\n?/gm, '');
        content = content.replace(/^\r?\n/gm, '');
        
        fs.writeFileSync(filePath, content);
      }
    }
  }
}

fixMergeConflicts('./server');
console.log('All merge conflicts fixed!');
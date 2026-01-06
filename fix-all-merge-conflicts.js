const fs = require('fs');
const path = require('path');

// Files with merge conflicts that need fixing
const filesToFix = [
    'client/src/components/common/UserModule.js',
    'client/src/pages/GalleryPage.js', 
    'client/src/pages/HomePage.js',
    'client/src/pages/accountant/AccountantDashboard.js',
    'client/src/pages/accountant/AccountantWages.js',
    'client/src/pages/admin/AdminHome.js',
    'client/src/pages/auth/ForgotPasswordPage.js',
    'client/src/pages/auth/LoginPage.js',
    'client/src/pages/auth/RegisterPage.js',
    'client/src/pages/delivery/DeliveryDashboard.jsx',
    'client/src/pages/lab/LabDashboard.js',
    'client/src/pages/manager/ManagerDashboard.js',
    'client/src/pages/manager/ManagerHome.js',
    'client/src/pages/user_dashboard/StaffDashboard.js',
    'client/src/components/common/Navbar.css',
    'client/src/layouts/AdminDashboardLayout.css',
    'client/src/layouts/DashboardLayout.css',
    'client/src/pages/ContactPage.css',
    'client/src/pages/HistoryPage.css',
    'client/src/pages/UserLiveRate.css'
];

function fixMergeConflicts(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if file has merge conflicts
        if (!content.includes('')) {
            console.log(`No merge conflicts in: ${filePath}`);
            return;
        }

        console.log(`Fixing merge conflicts in: ${filePath}`);
        
        // Remove merge conflict markers and keep HEAD version (current branch)
        // This regex matches the entire conflict block and keeps only the HEAD section
        content = content.replace(/\n([\s\S]*?)\n\n[\s\S]*?\n>>>>>>> [a-f0-9]+/g, '$1');
        
        // Clean up any remaining conflict markers
        content = content.replace(/\n?/g, '');
        content = content.replace(/\n?/g, '');
        content = content.replace(/>>>>>>> [a-f0-9]+\n?/g, '');
        
        // Write the fixed content back
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Fixed: ${filePath}`);
        
    } catch (error) {
        console.error(`Error fixing ${filePath}:`, error.message);
    }
}

// Fix all files
console.log('Starting merge conflict resolution...\n');

filesToFix.forEach(filePath => {
    fixMergeConflicts(filePath);
});

console.log('\nMerge conflict resolution completed!');
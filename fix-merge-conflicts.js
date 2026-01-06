const fs = require('fs');
const path = require('path');

// List of files with merge conflicts based on the error messages
const conflictFiles = [
  'client/src/components/common/Navbar.js',
  'client/src/layouts/AdminDashboardLayout.js',
  'client/src/layouts/DashboardLayout.js',
  'client/src/layouts/DeliveryDashboardLayout.js',
  'client/src/layouts/LabDashboardLayout.js',
  'client/src/layouts/ManagerDashboardLayout.js',
  'client/src/layouts/StaffDashboardLayout.js',
  'client/src/pages/ContactPage.js',
  'client/src/pages/GalleryPage.js',
  'client/src/pages/HistoryPage.js',
  'client/src/pages/HomePage.js',
  'client/src/pages/UserLiveRate.jsx',
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
  'client/src/App.css',
  'client/src/index.css',
  'client/src/pages/AboutPage.css',
  'client/src/pages/auth/AuthStyles.css',
  'client/src/pages/user_dashboard/Profile.css'
];

function fixMergeConflicts(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove Git merge conflict markers and keep HEAD content
    content = content.replace(/\n([\s\S]*?)\n\n([\s\S]*?)\n>>>>>>> [a-f0-9]+/g, '$1');
    
    // Handle cases where there's no content between markers
    content = content.replace(/\n\n([\s\S]*?)\n>>>>>>> [a-f0-9]+/g, '');
    
    // Handle cases with only HEAD marker
    content = content.replace(/\n/g, '');
    content = content.replace(/\n/g, '');
    content = content.replace(/>>>>>>> [a-f0-9]+/g, '');
    
    // Clean up any remaining conflict markers
    content = content.replace(//g, '');
    content = content.replace(//g, '');
    content = content.replace(/>>>>>>> [a-f0-9]+/g, '');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed merge conflicts in: ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Fix all conflict files
conflictFiles.forEach(fixMergeConflicts);

console.log('Merge conflict resolution completed!');
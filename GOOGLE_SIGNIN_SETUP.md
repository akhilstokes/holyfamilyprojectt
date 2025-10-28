# Google Sign-In Setup Guide

## Issue: "The given origin is not allowed for the given client ID"

This error occurs because your Google OAuth Client ID needs to be configured to allow requests from `http://localhost:3000`.

## Quick Fix Steps:

### 1. Open Google Cloud Console
- Go to: https://console.cloud.google.com/apis/credentials
- Sign in with your Google account (the one that created the OAuth Client ID)

### 2. Find Your OAuth Client
- Look for the OAuth 2.0 Client ID: `484477736924-4gt8ieqt7pgs931f4i8g91ig1q2ipc3a`
- Click on it to edit

### 3. Add Authorized JavaScript Origins
In the "Authorized JavaScript origins" section, add:
```
http://localhost:3000
```

**Important:** Do NOT include a trailing slash (/) at the end

### 4. Add Authorized Redirect URIs (if needed)
In the "Authorized redirect URIs" section, you can also add:
```
http://localhost:3000
```

### 5. Click "SAVE"

### 6. Restart Your React Development Server
```bash
cd "G:\holy-family-polymers (2)\holy-family-polymers\client"
npm start
```

## Verification

After making these changes:
1. Wait 1-2 minutes for Google to propagate the changes
2. Refresh your browser (`Ctrl + Shift + R` for hard refresh)
3. Try Google Sign-In again

## Current Status

✅ Backend Server: Running on port 5000
✅ Google Client ID: Configured (484477736924-4gt8ieqt7pgs931f4i8g91ig1q2ipc3a)
✅ Default Users Created:
   - Admin: admin@xyz.com / Admin@123
   - Manager: manager@xyz.com / Manager@123
   - Accountant: accountant@xyz.com / Accountant@123
   - Delivery: delivery@xyz.com / Delivery@123
   - Lab Staff: labstaff@xyz.com / Labstaff@123

⚠️ Needed: Configure `http://localhost:3000` in Google Cloud Console

## Alternative: Use Email/Password Login

While you configure Google Sign-In, you can use these credentials to test the application:

- **Admin Dashboard:** admin@xyz.com / Admin@123
- **Manager Dashboard:** manager@xyz.com / Manager@123


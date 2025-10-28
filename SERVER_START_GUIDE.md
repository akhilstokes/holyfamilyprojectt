# How to Start the Backend Server

## Problem
The backend server is not running, which is why Google Sign-In shows `ERR_CONNECTION_REFUSED`.

## Solution: Start the Server

### Option 1: Using NPM Start (Recommended)

1. Open a new terminal/command prompt
2. Navigate to the server directory:
   ```powershell
   cd "G:\holy-family-polymers (2)\holy-family-polymers\server"
   ```

3. Start the server:
   ```powershell
   npm start
   ```

You should see:
```
MongoDB Connected...
Server running in development mode on port 5000
```

### Option 2: Using Node Directly

1. Navigate to the server directory:
   ```powershell
   cd "G:\holy-family-polymers (2)\holy-family-polymers\server"
   ```

2. Start the server:
   ```powershell
   node server.js
   ```

## Verification

Once started, you should see in the terminal:
- `MongoDB Connected...`
- Server listening on port 5000

Then try Google Sign-In again in your browser.

## Default Login Credentials

If Google Sign-In still doesn't work, use these credentials:

- **Admin:** `admin@xyz.com` / `Admin@123`
- **Manager:** `manager@xyz.com` / `Manager@123`
- **Accountant:** `accountant@xyz.com` / `Accountant@123`
- **Delivery Staff:** `delivery@xyz.com` / `Delivery@123`
- **Lab Staff:** `labstaff@xyz.com` / `Labstaff@123`

## Quick Check

After starting the server, verify it's running:
```powershell
netstat -an | findstr :5000
```

You should see something like:
```
TCP    0.0.0.0:5000          0.0.0.0:0              LISTENING
```


# Restart Server Instructions

## To Fix 429 Rate Limiting Errors

The rate limiter has been temporarily disabled for the wages and salary notification endpoints.

### Steps to Restart Server:

1. **Stop the current server** (if running):
   - Press `Ctrl+C` in the terminal where server is running

2. **Navigate to server directory**:
   ```powershell
   cd holy-family-polymers\server
   ```

3. **Start the server**:
   ```powershell
   npm start
   ```

### Or Use the Development Mode:

```powershell
cd holy-family-polymers\server
npm run dev
```

### Changes Made:

1. **Increased rate limits** in `enhancedAuth.js`:
   - Development: 5000 requests per 30 seconds (was 1000 per 60 seconds)

2. **Temporarily disabled rate limiting** for wages routes:
   - Commented out rate limiter in `wagesRoutes.js`
   - This prevents 429 errors during development

3. **Temporarily disabled rate limiting** for salary notifications:
   - Commented out rate limiter in `salaryNotificationRoutes.js`

### To Re-enable Rate Limiting Later:

1. Uncomment the rate limiter lines in:
   - `server/routes/wagesRoutes.js`
   - `server/routes/salaryNotificationRoutes.js`

2. Or adjust the limits to be more lenient for your use case.

### Testing:

After restart, test the wages page and verify:
- No 429 errors
- Lab staff can be selected
- Salary calculations work
- Notifications are sent


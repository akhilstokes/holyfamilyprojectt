// Simple script to clear rate limit cache
const { clearRateLimitCache } = require('./middleware/enhancedAuth');

console.log('Clearing rate limit cache...');
clearRateLimitCache();
console.log('Rate limit cache cleared successfully!');

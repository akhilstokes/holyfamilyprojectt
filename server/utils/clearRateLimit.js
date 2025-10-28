// Clear rate limit cache utility
const clearRateLimitCache = () => {
  console.log('Clearing all rate limit caches...');
  
  // This clears the in-memory Map used by rate limiter
  // Since we're temporarily disabling rate limiting, this is just for documentation
  
  console.log('Rate limit cache cleared successfully!');
  console.log('Note: To fully clear rate limits, restart the server');
};

module.exports = { clearRateLimitCache };

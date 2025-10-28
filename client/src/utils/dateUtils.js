/**
 * Centralized date formatting utilities
 * Provides consistent date formatting across the application
 */

/**
 * Format date and time with consistent format: DD/MM/YYYY, HH:MM:SS AM/PM
 * @param {string|Date} dateInput - Date string or Date object
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDateTime = (dateInput, options = {}) => {
  if (!dateInput) return '-';
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';
    
    const defaultOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    return date.toLocaleString('en-GB', formatOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Format date only: DD/MM/YYYY
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '-';
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Format time only: HH:MM:SS AM/PM
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted time string
 */
export const formatTime = (dateInput) => {
  if (!dateInput) return '-';
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '-';
  }
};

/**
 * Format date for display in tables: DD/MM/YYYY, HH:MM AM/PM
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string for tables
 */
export const formatTableDateTime = (dateInput) => {
  if (!dateInput) return '-';
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting table date:', error);
    return '-';
  }
};

/**
 * Format date for file names: YYYY-MM-DD_HH-MM-SS
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string for file names
 */
export const formatFileNameDateTime = (dateInput) => {
  if (!dateInput) return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    
    return date.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  } catch (error) {
    console.error('Error formatting file name date:', error);
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  }
};

/**
 * Get relative time (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateInput) => {
  if (!dateInput) return '-';
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  } catch (error) {
    console.error('Error getting relative time:', error);
    return '-';
  }
};

/**
 * Check if date is today
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {boolean} True if date is today
 */
export const isToday = (dateInput) => {
  if (!dateInput) return false;
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return false;
    
    const today = new Date();
    return date.toDateString() === today.toDateString();
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
};

/**
 * Check if date is yesterday
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {boolean} True if date is yesterday
 */
export const isYesterday = (dateInput) => {
  if (!dateInput) return false;
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return false;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  } catch (error) {
    console.error('Error checking if date is yesterday:', error);
    return false;
  }
};

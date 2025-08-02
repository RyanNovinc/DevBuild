// src/utils/helpers.js

/**
 * Format currency amounts
 * @param {number} amount - The amount to format
 * @param {boolean} showCents - Whether to show cents
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showCents = false) => {
  if (amount === null || amount === undefined) return '$0';
  
  // Format for large numbers (e.g., $1.2M instead of $1,200,000)
  if (Math.abs(amount) >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  
  // Regular formatting
  return showCents 
    ? `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` 
    : `$${Math.round(amount).toLocaleString()}`;
};

/**
 * Format a date
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type ('short', 'medium', 'long')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'medium') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if valid date
  if (isNaN(dateObj.getTime())) return '';
  
  // Today and tomorrow recognition
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = dateObj.toDateString() === today.toDateString();
  const isTomorrow = dateObj.toDateString() === tomorrow.toDateString();
  
  if (isToday && format !== 'long') {
    return 'Today';
  } else if (isTomorrow && format !== 'long') {
    return 'Tomorrow';
  }
  
  // Format based on requested style
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric' 
      });
    case 'long':
      return dateObj.toLocaleDateString(undefined, { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    case 'time':
      return dateObj.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    case 'datetime':
      return `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit'
      })}`;
    case 'medium':
    default:
      return dateObj.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
  }
};

/**
 * Format time (e.g., "9:00 AM")
 * @param {string|Date} time - Time to format
 * @returns {string} Formatted time string
 */
export const formatTime = (time) => {
  if (!time) return '';
  
  const timeObj = typeof time === 'string' ? new Date(time) : time;
  
  // Check if valid date
  if (isNaN(timeObj.getTime())) return '';
  
  return timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Calculate time difference in a human readable format
 * @param {string|Date} startTime - Start time
 * @param {string|Date} endTime - End time
 * @returns {string} Time difference
 */
export const getTimeDifference = (startTime, endTime) => {
  if (!startTime || !endTime) return '';
  
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  
  // Check if valid dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
  
  // Get difference in minutes
  const diffMs = end - start;
  const diffMinutes = Math.floor(diffMs / 60000);
  
  if (diffMinutes < 60) {
    return `${diffMinutes} min`;
  } else {
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
  }
};

/**
 * Get a unique color for a string
 * @param {string} str - String to generate color for
 * @returns {string} Hex color code
 */
export const getColorFromString = (str) => {
  if (!str) return '#4CAF50'; // Default color
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Create a hue between 0 and 360
  const hue = Math.abs(hash % 360);
  
  // Use a high saturation (80%) and lightness (60%) for vibrant colors
  return `hsl(${hue}, 80%, 60%)`;
};

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @param {number} limit - Maximum number of initials
 * @returns {string} Initials
 */
export const getInitials = (name, limit = 2) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .filter(initial => initial.match(/[A-Za-z]/)) // Only use letters
    .slice(0, limit)
    .join('')
    .toUpperCase();
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  const percentage = (value / total) * 100;
  return Math.min(Math.max(Math.round(percentage), 0), 100); // Clamp between 0-100
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Generate a random ID
 * @returns {string} Random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Check if a date is in the future
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the future
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  return dateObj > now;
};

/**
 * Check if a date is in the past
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  return dateObj < now;
};

/**
 * Get days left until a date
 * @param {string|Date} date - Target date
 * @returns {number} Days left (negative if in the past)
 */
export const getDaysLeft = (date) => {
  if (!date) return 0;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  // Set both dates to midnight for accurate day calculation
  const targetDate = new Date(dateObj);
  targetDate.setHours(0, 0, 0, 0);
  
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  // Calculate difference in days
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Get relative time expression (e.g., "in 2 days", "3 days ago")
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time expression
 */
export const getRelativeTimeExpression = (date) => {
  if (!date) return '';
  
  const daysLeft = getDaysLeft(date);
  
  if (daysLeft === 0) {
    return 'Today';
  } else if (daysLeft === 1) {
    return 'Tomorrow';
  } else if (daysLeft === -1) {
    return 'Yesterday';
  } else if (daysLeft > 0) {
    return `in ${daysLeft} days`;
  } else {
    return `${Math.abs(daysLeft)} days ago`;
  }
};

/**
 * Get month name
 * @param {number} month - Month index (0-11)
 * @param {boolean} short - Whether to return short month name
 * @returns {string} Month name
 */
export const getMonthName = (month, short = false) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const shortMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  if (month < 0 || month > 11) return '';
  
  return short ? shortMonths[month] : months[month];
};

/**
 * Get day name
 * @param {number} day - Day index (0-6)
 * @param {boolean} short - Whether to return short day name
 * @returns {string} Day name
 */
export const getDayName = (day, short = false) => {
  const days = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
    'Thursday', 'Friday', 'Saturday'
  ];
  
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  if (day < 0 || day > 6) return '';
  
  return short ? shortDays[day] : days[day];
};

/**
 * Get an array of dates for a week
 * @param {Date} date - Date within the week
 * @returns {Array} Array of date objects
 */
export const getWeekDates = (date = new Date()) => {
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  const diff = date.getDate() - day;
  
  const weekDates = [];
  
  for (let i = 0; i < 7; i++) {
    const newDate = new Date(date);
    newDate.setDate(diff + i);
    weekDates.push(newDate);
  }
  
  return weekDates;
};

/**
 * Get an array of dates for a month
 * @param {number} year - Year
 * @param {number} month - Month index (0-11)
 * @returns {Array} Array of date objects
 */
export const getMonthDates = (year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthDates = [];
  
  for (let i = 1; i <= daysInMonth; i++) {
    monthDates.push(new Date(year, month, i));
  }
  
  return monthDates;
};
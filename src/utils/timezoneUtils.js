// src/utils/timezoneUtils.js
// Utility functions for timezone handling and country-specific date formatting

/**
 * Get user's timezone offset in hours
 * @returns {number} Timezone offset in hours
 */
export const getUserTimezoneOffset = () => {
  return -(new Date().getTimezoneOffset() / 60);
};

/**
 * Get timezone offset string (e.g., "+10:00")
 * @param {number} offsetHours - Timezone offset in hours
 * @returns {string} Formatted timezone offset string
 */
export const getTimezoneOffsetString = (offsetHours = null) => {
  const offset = offsetHours !== null ? offsetHours : getUserTimezoneOffset();
  
  const sign = offset >= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset).toString().padStart(2, '0');
  const minutes = Math.round((absOffset % 1) * 60).toString().padStart(2, '0');
  
  return `${sign}${hours}:${minutes}`;
};

/**
 * Country to primary timezone mapping
 * Maps country codes to their primary timezone IANA identifiers
 */
const COUNTRY_TIMEZONE_MAP = {
  'australia': 'Australia/Sydney',
  'usa': 'America/New_York',
  'canada': 'America/Toronto', 
  'uk': 'Europe/London',
  'newzealand': 'Pacific/Auckland',
  'ireland': 'Europe/Dublin',
  'singapore': 'Asia/Singapore',
  'southafrica': 'Africa/Johannesburg',
  'india': 'Asia/Kolkata',
  'malaysia': 'Asia/Kuala_Lumpur',
  'philippines': 'Asia/Manila',
  'nigeria': 'Africa/Lagos',
  'other': null // Use device timezone
};

/**
 * Country to date format mapping
 * Maps country codes to their common date format patterns
 */
const COUNTRY_DATE_FORMAT_MAP = {
  'australia': 'DD/MM/YYYY',
  'usa': 'MM/DD/YYYY',
  'canada': 'YYYY-MM-DD',
  'uk': 'DD/MM/YYYY',
  'newzealand': 'DD/MM/YYYY',
  'ireland': 'DD/MM/YYYY',
  'singapore': 'DD/MM/YYYY',
  'southafrica': 'YYYY/MM/DD',
  'india': 'DD/MM/YYYY',
  'malaysia': 'DD/MM/YYYY',
  'philippines': 'MM/DD/YYYY',
  'nigeria': 'DD/MM/YYYY',
  'other': 'YYYY-MM-DD'
};

/**
 * Get primary timezone for a country
 * @param {string} countryCode - Country code
 * @returns {string|null} IANA timezone identifier or null for device timezone
 */
export const getCountryTimezone = (countryCode) => {
  return COUNTRY_TIMEZONE_MAP[countryCode] || null;
};

/**
 * Get date format pattern for a country
 * @param {string} countryCode - Country code
 * @returns {string} Date format pattern
 */
export const getCountryDateFormat = (countryCode) => {
  return COUNTRY_DATE_FORMAT_MAP[countryCode] || 'YYYY-MM-DD';
};

/**
 * Format date according to country's common date format
 * @param {Date} date - Date to format
 * @param {string} countryCode - Country code
 * @returns {string} Formatted date string
 */
export const formatDateForCountry = (date, countryCode) => {
  if (!date || !(date instanceof Date)) {
    date = new Date();
  }
  
  const format = getCountryDateFormat(countryCode);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`;
    case 'YYYY-MM-DD':
    default:
      return `${year}-${month}-${day}`;
  }
};

/**
 * Get today's date formatted for the user's country
 * @param {string} countryCode - User's country code
 * @returns {string} Today's date formatted according to country conventions
 */
export const getTodaysDateForCountry = (countryCode) => {
  const today = new Date();
  return formatDateForCountry(today, countryCode);
};

/**
 * Get today's date with timezone information for display
 * @param {string} countryCode - User's country code
 * @returns {string} Today's date with timezone context
 */
export const getTodaysDateWithTimezone = (countryCode) => {
  const todayFormatted = getTodaysDateForCountry(countryCode);
  const userOffset = getTimezoneOffsetString();
  
  // Use device's actual timezone instead of trying to map from country
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZoneName: 'short'
    });
    const parts = formatter.formatToParts(date);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value;
    
    if (timeZoneName) {
      return `${todayFormatted} (${timeZoneName})`;
    }
  } catch (error) {
    console.warn('Error getting device timezone name:', error);
  }
  
  // Fallback to offset
  return `${todayFormatted} (UTC${userOffset})`;
};

export default {
  getUserTimezoneOffset,
  getTimezoneOffsetString,
  getCountryTimezone,
  getCountryDateFormat,
  formatDateForCountry,
  getTodaysDateForCountry,
  getTodaysDateWithTimezone
};
// src/utils/countryToCurrency.js

/**
 * Country to Currency Mapping Utility
 * Maps country codes to their respective currency symbols and codes
 */

export const COUNTRY_CURRENCY_MAP = {
  'australia': {
    symbol: 'A$',
    code: 'AUD',
    name: 'Australian Dollar'
  },
  'canada': {
    symbol: 'C$',
    code: 'CAD', 
    name: 'Canadian Dollar'
  },
  'uk': {
    symbol: '£',
    code: 'GBP',
    name: 'British Pound'
  },
  'usa': {
    symbol: '$',
    code: 'USD',
    name: 'US Dollar'
  }
};

/**
 * Get currency information for a given country
 * @param {string} countryCode - The country code (e.g., 'australia', 'usa')
 * @returns {object} Currency information with symbol, code, and name
 */
export const getCurrencyForCountry = (countryCode) => {
  if (!countryCode) {
    // Default to USD if no country provided
    return COUNTRY_CURRENCY_MAP.usa;
  }
  
  const currency = COUNTRY_CURRENCY_MAP[countryCode.toLowerCase()];
  
  if (!currency) {
    console.warn(`No currency mapping found for country: ${countryCode}, defaulting to USD`);
    return COUNTRY_CURRENCY_MAP.usa;
  }
  
  return currency;
};

/**
 * Get currency symbol for a given country
 * @param {string} countryCode - The country code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (countryCode) => {
  const currency = getCurrencyForCountry(countryCode);
  return currency.symbol;
};

/**
 * Get currency code for a given country
 * @param {string} countryCode - The country code
 * @returns {string} Currency code (e.g., 'USD', 'AUD')
 */
export const getCurrencyCode = (countryCode) => {
  const currency = getCurrencyForCountry(countryCode);
  return currency.code;
};

/**
 * Get all available currencies
 * @returns {array} Array of all currency objects
 */
export const getAllCurrencies = () => {
  return Object.values(COUNTRY_CURRENCY_MAP);
};

/**
 * Check if a country has a currency mapping
 * @param {string} countryCode - The country code
 * @returns {boolean} True if mapping exists
 */
export const hasCurrencyMapping = (countryCode) => {
  return countryCode && COUNTRY_CURRENCY_MAP[countryCode.toLowerCase()] !== undefined;
};
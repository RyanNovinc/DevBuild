// src/screens/Onboarding/data/countryDataLoader.js
// Dynamic loader for country-specific onboarding data

// Import country-specific data files
import { DOMAIN_DEFINITIONS as AustraliaData } from './countries/australia';
import { DOMAIN_DEFINITIONS as CanadaData } from './countries/canada';
import { DOMAIN_DEFINITIONS as UKData } from './countries/uk';
import { DOMAIN_DEFINITIONS as USAData } from './countries/usa';

// For now, we'll use the original data as fallback
import { DOMAIN_DEFINITIONS as DefaultData } from './onboardingData';

/**
 * Get domain definitions based on selected country
 * @param {string} countryCode - Country code (australia, canada, uk, usa)
 * @returns {Array} Domain definitions array for the specified country
 */
export const getCountryData = (countryCode) => {
  console.log(`Loading data for country: ${countryCode}`);
  
  switch (countryCode) {
    case 'australia':
      console.log('Loading Australian-specific data');
      return AustraliaData;
      
    case 'canada':
      console.log('Loading Canadian-specific data');
      return CanadaData;
      
    case 'uk':
      console.log('Loading UK-specific data');
      return UKData;
      
    case 'usa':
      console.log('Loading USA-specific data');
      return USAData;
      
    default:
      console.log(`Unknown country code: ${countryCode}, using Australian data as fallback`);
      return AustraliaData;
  }
};

/**
 * Get available countries list
 * @returns {Array} Array of available country objects
 */
export const getAvailableCountries = () => {
  return [
    { code: 'australia', name: 'Australia', flag: '🇦🇺', dataAvailable: true },
    { code: 'canada', name: 'Canada', flag: '🇨🇦', dataAvailable: true }, // Canadian-specific data
    { code: 'uk', name: 'United Kingdom', flag: '🇬🇧', dataAvailable: true }, // UK-specific data
    { code: 'usa', name: 'United States', flag: '🇺🇸', dataAvailable: true }, // USA-specific data
  ];
};

/**
 * Check if country-specific data is available
 * @param {string} countryCode - Country code to check
 * @returns {boolean} True if country-specific data is available
 */
export const isCountryDataAvailable = (countryCode) => {
  const countries = getAvailableCountries();
  const country = countries.find(c => c.code === countryCode);
  return country ? country.dataAvailable : false;
};

export default {
  getCountryData,
  getAvailableCountries,
  isCountryDataAvailable
};
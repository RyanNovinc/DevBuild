// src/screens/Onboarding/data/countryDataLoader.js
// Dynamic loader for country-specific onboarding data

// Import country-specific data files
import { DOMAIN_DEFINITIONS as AustraliaData } from './countries/australia';
import { DOMAIN_DEFINITIONS as CanadaData } from './countries/canada';
import { DOMAIN_DEFINITIONS as IndiaData } from './countries/india';
import { DOMAIN_DEFINITIONS as IrelandData } from './countries/ireland';
import { DOMAIN_DEFINITIONS as MalaysiaData } from './countries/malaysia';
import { DOMAIN_DEFINITIONS as NewZealandData } from './countries/newzealand';
import { DOMAIN_DEFINITIONS as NigeriaData } from './countries/nigeria';
import { DOMAIN_DEFINITIONS as PhilippinesData } from './countries/philippines';
import { DOMAIN_DEFINITIONS as SingaporeData } from './countries/singapore';
import { DOMAIN_DEFINITIONS as SouthAfricaData } from './countries/southafrica';
import { DOMAIN_DEFINITIONS as UKData } from './countries/uk';
import { DOMAIN_DEFINITIONS as USAData } from './countries/usa';

// For now, we'll use the original data as fallback
import { DOMAIN_DEFINITIONS as DefaultData } from './onboardingData';

/**
 * Get domain definitions based on selected country
 * @param {string} countryCode - Country code (australia, canada, india, uk, usa)
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
      
    case 'india':
      console.log('Loading Indian-specific data');
      return IndiaData;
      
    case 'ireland':
      console.log('Loading Irish-specific data');
      return IrelandData;
      
    case 'malaysia':
      console.log('Loading Malaysian-specific data');
      return MalaysiaData;
      
    case 'newzealand':
      console.log('Loading New Zealand-specific data');
      return NewZealandData;
      
    case 'nigeria':
      console.log('Loading Nigerian-specific data');
      return NigeriaData;
      
    case 'philippines':
      console.log('Loading Philippines-specific data');
      return PhilippinesData;
      
    case 'singapore':
      console.log('Loading Singapore-specific data');
      return SingaporeData;
      
    case 'southafrica':
      console.log('Loading South African-specific data');
      return SouthAfricaData;
      
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
    { code: 'india', name: 'India', flag: '🇮🇳', dataAvailable: true }, // Indian-specific data
    { code: 'ireland', name: 'Ireland', flag: '🇮🇪', dataAvailable: true }, // Irish-specific data
    { code: 'malaysia', name: 'Malaysia', flag: '🇲🇾', dataAvailable: true }, // Malaysian-specific data
    { code: 'newzealand', name: 'New Zealand', flag: '🇳🇿', dataAvailable: true }, // New Zealand-specific data
    { code: 'nigeria', name: 'Nigeria', flag: '🇳🇬', dataAvailable: true }, // Nigerian-specific data
    { code: 'philippines', name: 'Philippines', flag: '🇵🇭', dataAvailable: true }, // Philippines-specific data
    { code: 'singapore', name: 'Singapore', flag: '🇸🇬', dataAvailable: true }, // Singapore-specific data
    { code: 'southafrica', name: 'South Africa', flag: '🇿🇦', dataAvailable: true }, // South African-specific data
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
// src/screens/ProfileScreen/FinancialTracker/CurrencyService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class CurrencyService {
  static exchangeRates = null;
  static lastFetchDate = null;
  
  // Map of currency codes to symbols
  static currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'AUD': 'A$',
    'CAD': 'C$',
    'INR': '₹',
    'RUB': '₽',
    'CHF': '₣',
    'KRW': '₩',
    'TRY': '₺'
  };
  
  // Map of currency symbols to codes
  static symbolToCurrency = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
    'A$': 'AUD',
    'C$': 'CAD',
    '₹': 'INR',
    '₽': 'RUB',
    '₣': 'CHF',
    '₩': 'KRW',
    '₺': 'TRY'
  };
  
  // Get currency name from symbol
  static getCurrencyName(symbol) {
    const currencyCode = this.symbolToCurrency[symbol] || 'USD';
    switch(currencyCode) {
      case 'USD': return 'US Dollar';
      case 'EUR': return 'Euro';
      case 'GBP': return 'British Pound';
      case 'JPY': return 'Japanese Yen';
      case 'AUD': return 'Australian Dollar';
      case 'CAD': return 'Canadian Dollar';
      case 'INR': return 'Indian Rupee';
      case 'RUB': return 'Russian Ruble';
      case 'CHF': return 'Swiss Franc';
      case 'KRW': return 'South Korean Won';
      case 'TRY': return 'Turkish Lira';
      default: return 'Currency';
    }
  };
  
  // Fetch current exchange rates
  static async getExchangeRates() {
    try {
      // Check if we have cached rates less than 24 hours old
      const cachedData = await AsyncStorage.getItem('currencyExchangeRates');
      if (cachedData) {
        const { rates, timestamp } = JSON.parse(cachedData);
        const isRecent = (Date.now() - timestamp) < (24 * 60 * 60 * 1000); // 24 hours
        
        if (isRecent) {
          this.exchangeRates = rates;
          this.lastFetchDate = new Date(timestamp);
          return rates;
        }
      }
      
      // Free API for exchange rates (no API key required)
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();
      
      if (data && data.rates) {
        this.exchangeRates = data.rates;
        this.lastFetchDate = new Date();
        
        // Cache the rates
        await AsyncStorage.setItem('currencyExchangeRates', JSON.stringify({
          rates: data.rates,
          timestamp: Date.now()
        }));
        
        return data.rates;
      }
      
      // If API fails, return fallback rates
      return this.getFallbackRates();
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      return this.getFallbackRates();
    }
  }
  
  // Convert amount from USD to target currency
  static async convertFromUSD(amount, targetCurrencySymbol) {
    if (!amount) return 0;
    
    // Default to USD if invalid currency
    const targetCurrencyCode = this.symbolToCurrency[targetCurrencySymbol] || 'USD';
    
    // No conversion needed for USD
    if (targetCurrencyCode === 'USD') return amount;
    
    // Ensure we have exchange rates
    if (!this.exchangeRates) {
      await this.getExchangeRates();
    }
    
    if (!this.exchangeRates || !this.exchangeRates[targetCurrencyCode]) {
      return amount; // Fall back to original amount
    }
    
    return amount * this.exchangeRates[targetCurrencyCode];
  }
  
  // Convert amount from any currency to USD
  static async convertToUSD(amount, sourceCurrencySymbol) {
    if (!amount) return 0;
    
    // Default to USD if invalid currency
    const sourceCurrencyCode = this.symbolToCurrency[sourceCurrencySymbol] || 'USD';
    
    // No conversion needed for USD
    if (sourceCurrencyCode === 'USD') return amount;
    
    // Ensure we have exchange rates
    if (!this.exchangeRates) {
      await this.getExchangeRates();
    }
    
    if (!this.exchangeRates || !this.exchangeRates[sourceCurrencyCode]) {
      return amount; // Fall back to original amount
    }
    
    return amount / this.exchangeRates[sourceCurrencyCode];
  }
  
  // Format amount with proper currency symbol
  // FIXED: Properly handles multi-character currency symbols like "A$"
  static formatCurrency(amount, currencySymbol = '$') {
    if (amount === undefined || amount === null) return `${currencySymbol}0`;
    
    // Handle negative numbers
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    
    // Format with commas
    const formattedAmount = absAmount.toLocaleString(undefined, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    
    // For multi-character currency symbols (like A$), ensure we don't create a space
    return `${isNegative ? '-' : ''}${currencySymbol}${formattedAmount}`;
  }
  
  // Get fallback rates in case API fails
  static getFallbackRates() {
    return {
      USD: 1,
      EUR: 0.85,
      GBP: 0.75,
      JPY: 110.0,
      AUD: 1.35,
      CAD: 1.25,
      INR: 75.0,
      RUB: 75.0,
      CHF: 0.9,
      KRW: 1150.0,
      TRY: 8.5
    };
  }
}
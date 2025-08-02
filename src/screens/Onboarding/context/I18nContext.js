// src/screens/Onboarding/context/I18nContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import translations from '../translations';

// Create Context
const I18nContext = createContext();

// Default language
const DEFAULT_LANGUAGE = 'en';

export const I18nProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE);
  const [isRTL, setIsRTL] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize language settings
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Get saved language from storage
        const savedLanguage = await AsyncStorage.getItem('userLanguage');
        
        if (savedLanguage) {
          // Set the saved language
          setCurrentLanguage(savedLanguage);
          
          // Check if language is RTL
          const rtlLanguages = ['ar', 'he', 'ur']; // Add more RTL languages as needed
          setIsRTL(rtlLanguages.includes(savedLanguage));
          
          // Set RTL for the app if necessary
          if (rtlLanguages.includes(savedLanguage) !== I18nManager.isRTL) {
            I18nManager.forceRTL(rtlLanguages.includes(savedLanguage));
            // Note: App might need to restart for RTL changes to take effect
          }
        }
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Error initializing language:', error);
        setIsLoaded(true);
      }
    };

    initializeLanguage();
  }, []);

  // Change language function
  const changeLanguage = async (languageCode) => {
    try {
      // Save to storage
      await AsyncStorage.setItem('userLanguage', languageCode);
      
      // Update state
      setCurrentLanguage(languageCode);
      
      // Check if language is RTL
      const rtlLanguages = ['ar', 'he', 'ur']; // Add more RTL languages as needed
      const shouldBeRTL = rtlLanguages.includes(languageCode);
      
      // Set RTL state
      setIsRTL(shouldBeRTL);
      
      // Set RTL for the app if necessary
      if (shouldBeRTL !== I18nManager.isRTL) {
        I18nManager.forceRTL(shouldBeRTL);
        // Note: App might need to restart for RTL changes to take effect
      }
      
      return true;
    } catch (error) {
      console.error('Error changing language:', error);
      return false;
    }
  };

  // Translation function
  const t = (key, namespace = 'common', params = {}) => {
    // Get the translations for the current language
    const languageTranslations = translations[currentLanguage] || translations[DEFAULT_LANGUAGE];
    
    // Get the namespace
    const namespaceTranslations = languageTranslations[namespace] || {};
    
    // Get the translation
    let translation = namespaceTranslations[key] || languageTranslations.common?.[key] || key;
    
    // Replace parameters in the translation
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{{${param}}}`, params[param]);
    });
    
    return translation;
  };

  // Context value
  const contextValue = {
    currentLanguage,
    isRTL,
    isLoaded,
    t,
    changeLanguage,
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

// Custom hook to use the i18n context
export const useI18n = () => {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  
  return context;
};

export default I18nContext;
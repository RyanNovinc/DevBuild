// src/screens/Onboarding/utils/i18n.js
import { I18nManager } from 'react-native';

// Check if RTL is enabled
export const isRTL = I18nManager.isRTL;

// Create a simple translations object
export const translations = {
  en: {
    // General UI
    continue: 'Continue',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    done: 'Done',
    loading: 'Loading...',
    
    // Onboarding specific
    welcomeTitle: 'Welcome to LifeCompass',
    welcomeSubtitle: 'Build systems that actually work',
    framework: 'Strategic Framework',
    frameworkSubtitle: 'How we help you achieve more',
    focusSelection: 'What\'s your strategic direction?',
    focusSelectionSubtitle: 'Choose the focus that will guide your goals and decisions',
    systemHierarchy: 'Your Achievement System',
    systemHierarchySubtitle: 'A complete framework for strategic success',
    whyItWorks: 'Why It Works',
    whyItWorksSubtitle: 'Research-backed methodologies',
    
    // Achievement badge
    achievement: 'ACHIEVEMENT UNLOCKED',
    strategicPlanner: 'Strategic Planner',
    badgeDescription: 'You\'ve established your strategic framework to turn vision into achievable goals',
    claimTokens: 'Claim 100 AI Tokens',
    
    // Other sections
    aiSignup: 'Unlock Premium AI',
    tutorialTitle: 'System Overview',
    tutorialSubtitle: 'Your achievement framework is ready',
  },
  es: {
    // Spanish translations
    continue: 'Continuar',
    back: 'Atrás',
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    done: 'Listo',
    loading: 'Cargando...',
    
    welcomeTitle: 'Bienvenido a LifeCompass',
    welcomeSubtitle: 'Construye sistemas que realmente funcionan',
    // Add more translations as needed
  },
  // Add more languages as needed
};

// Get current locale (simplified implementation)
export const getLocale = () => {
  // In a real app, you'd get this from device settings or user preference
  return 'en';
};

// Translation function
export const t = (key) => {
  const locale = getLocale();
  return translations[locale]?.[key] || translations['en'][key] || key;
};
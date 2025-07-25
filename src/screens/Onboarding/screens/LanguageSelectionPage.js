// src/screens/Onboarding/screens/LanguageSelectionPage.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ResponsiveText from '../components/ResponsiveText';
import TypingAnimation from '../components/TypingAnimation';
import NavigationHeader from '../components/NavigationHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useI18n } from '../context/I18nContext';

const LanguageSelectionPage = ({ onContinue, onBack }) => {
  // Get translation function and current language
  const { t, currentLanguage, changeLanguage } = useI18n();
  
  // State
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage || 'en');
  const [messageComplete, setMessageComplete] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [containerAnimationComplete, setContainerAnimationComplete] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const optionsFade = useRef(new Animated.Value(0)).current;
  const aiMessageOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;
  
  // Refs for typing animations
  const typingRef = useRef(null);
  
  // Available languages
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  ];
  
  // Start animations when component mounts
  useEffect(() => {
    console.log("Starting initial animations");
    // Fade in whole screen
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Fade in content
    Animated.timing(contentFade, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Staggered animations for elements
    Animated.sequence([
      // Language options fade in first
      Animated.timing(optionsFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // AI message fades in last
      Animated.timing(aiMessageOpacity, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Set container animation complete to trigger typing animation
      setContainerAnimationComplete(true);
    });
    
    // Start continuous pulse animation for the sparkle icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(iconPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);
  
  // Show continue button after message is complete
  useEffect(() => {
    if (messageComplete && !showContinueButton) {
      console.log("Message complete, showing continue button");
      setShowContinueButton(true);
      
      // Animate button in
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }).start();
    }
  }, [messageComplete]);
  
  // Update selectedLanguage when context language changes
  useEffect(() => {
    if (currentLanguage && currentLanguage !== selectedLanguage) {
      setSelectedLanguage(currentLanguage);
    }
  }, [currentLanguage]);
  
  // Get message based on selected language
  const getMessage = () => {
    if (selectedLanguage === 'ja') {
      return "お好みの言語を選んでください。";
    }
    return "Choose your preferred language.";
  };
  
  // Handle message completion
  const handleMessageComplete = () => {
    console.log("Message complete");
    setMessageComplete(true);
  };
  
  // Handle screen tap to skip typing
  const handleScreenTap = () => {
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // If message is still typing, complete it immediately
    if (!messageComplete && typingRef.current) {
      console.log("Completing typing animation");
      typingRef.current.complete();
      return;
    }
    
    // If message is complete, handle continue
    if (messageComplete) {
      handleContinue();
    }
  };
  
  // Handle language selection
  const handleSelectLanguage = (langCode) => {
    if (langCode === selectedLanguage) return;
    
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    console.log(`Language selected: ${langCode}`);
    
    // Update selected language
    setSelectedLanguage(langCode);
    
    // Change language in the context
    if (changeLanguage) {
      changeLanguage(langCode);
    }
    
    // Reset message state for new language, but don't hide continue button
    setMessageComplete(false);
    
    // Save language preference
    AsyncStorage.setItem('userLanguage', langCode)
      .catch(error => console.log('Error saving language preference:', error));
  };
  
  // Handle continue button press
  const handleContinue = () => {
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // Continue to next screen
    if (onContinue) {
      onContinue();
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Use NavigationHeader component */}
      <NavigationHeader 
        title={t('title', 'language')} 
        onBack={onBack}
      />
      
      {/* Adopting the Welcome page approach - wrap main content in a TouchableOpacity */}
      <TouchableOpacity 
        style={styles.mainContainer}
        activeOpacity={1}
        onPress={handleScreenTap}
      >
        <Animated.View style={[styles.content, { opacity: contentFade }]}>
          {/* Large prominent language options */}
          <Animated.View style={[styles.languagesContainer, { opacity: optionsFade }]}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  selectedLanguage === language.code && styles.selectedLanguageOption
                ]}
                onPress={() => handleSelectLanguage(language.code)}
                activeOpacity={0.7}
              >
                <View style={styles.languageContent}>
                  <Text style={styles.flagText}>{language.flag}</Text>
                  <View style={styles.languageTextContainer}>
                    <Text style={styles.languageName}>
                      {language.code === 'en' ? t('english', 'language') : t('japanese', 'language')}
                    </Text>
                    <Text style={styles.languageNativeName}>
                      {language.nativeName}
                    </Text>
                  </View>
                </View>
                
                {selectedLanguage === language.code && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark" size={22} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
          
          {/* AI Message below options as supportive content */}
          <Animated.View style={[styles.messageSection, { opacity: aiMessageOpacity }]}>
            <View style={styles.aiMessageContainer}>
              <View style={styles.iconContainer}>
                <Animated.View 
                  style={[
                    styles.iconCircle,
                    { transform: [{ scale: iconPulse }] }
                  ]}
                >
                  <Ionicons name="sparkles" size={16} color="#FFD700" />
                </Animated.View>
              </View>
              <View style={styles.messageTextContainer}>
                {/* Only show typing animation after container animation is complete */}
                {containerAnimationComplete ? (
                  <TypingAnimation
                    ref={typingRef}
                    key={`message-${selectedLanguage}`}
                    text={getMessage()}
                    typingSpeed={30}
                    onComplete={handleMessageComplete}
                    style={styles.messageText}
                  />
                ) : (
                  <Text style={[styles.messageText, { opacity: 0 }]}>
                    {/* Placeholder to maintain layout */}
                    {getMessage()}
                  </Text>
                )}
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
      
      {/* Sticky continue button at bottom - only shown after AI has finished speaking once */}
      <Animated.View 
        style={[
          styles.buttonContainer, 
          { 
            opacity: buttonOpacity,
            // Hide button completely when opacity is 0 to prevent touches
            display: showContinueButton ? 'flex' : 'none'
          }
        ]}
      >
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            {t('continue', 'common')}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c1425',
  },
  mainContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 90, // Space for the button
    paddingTop: 20, // Adjusted because we now have the navigation header
  },
  languagesContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20, // Add space at the top
    marginBottom: 40,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  selectedLanguageOption: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagText: {
    fontSize: 26,
    marginRight: 18,
  },
  languageTextContainer: {
    justifyContent: 'center',
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  languageNativeName: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  selectedIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageSection: {
    width: '100%',
    alignItems: 'center',
  },
  aiMessageContainer: {
    backgroundColor: 'rgba(20, 20, 30, 0.6)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(59, 130, 246, 0.5)',
    width: '100%',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageTextContainer: {
    flex: 1,
  },
  messageText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: 'rgba(12, 20, 37, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(8px)',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonIcon: {
    marginLeft: 8,
  }
});

export default LanguageSelectionPage;
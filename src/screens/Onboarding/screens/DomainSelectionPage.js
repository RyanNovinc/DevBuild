// Clean DomainSelectionPage - Simple and Reliable
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ResponsiveText from '../components/ResponsiveText';
import DomainWheel from '../components/DomainWheel';
import DomainInfoModal from '../components/DomainInfoModal';
import { getAvailableCountries } from '../data/countryDataLoader';

const { width, height } = Dimensions.get('window');

const DomainSelectionPage = ({ 
  domains, 
  onDomainSelected, 
  onDomainPreview,
  onResetPreview,
  onBack,
  isNavigating = false,
  segmentsRevealed = false,
  onSegmentsRevealed,
  selectedCountry,
  onCountrySelected,
  onSkipOnboarding
}) => {
  // State management following reference implementation
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [showDomainInfo, setShowDomainInfo] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  
  // Progressive reveal state
  const [revealInProgress, setRevealInProgress] = useState(false);
  const [revealedSegments, setRevealedSegments] = useState([]);
  const [textRevealed, setTextRevealed] = useState(false);
  
  // Animation refs
  const infoCardOpacity = useRef(new Animated.Value(0)).current;
  const infoCardY = useRef(new Animated.Value(50)).current;
  const continueButtonOpacity = useRef(new Animated.Value(0)).current;
  const continueButtonScale = useRef(new Animated.Value(0.9)).current;
  const wheelScale = useRef(new Animated.Value(1)).current;
  const countryShakeAnim = useRef(new Animated.Value(0)).current;
  
  // Temporary button text state
  const [showTemporaryButtonText, setShowTemporaryButtonText] = useState(false);

  // Progressive reveal of domain segments
  const revealSegmentsSequentially = () => {
    if (revealInProgress || segmentsRevealed) return;
    
    setRevealInProgress(true);
    setRevealedSegments([]);
    
    // Reveal segments one by one with staggered timing
    domains.forEach((domain, index) => {
      setTimeout(() => {
        setRevealedSegments(prev => [...prev, index]);
        
        // After last segment is revealed
        if (index === domains.length - 1) {
          setTimeout(() => {
            onSegmentsRevealed(true);
            setRevealInProgress(false);
            
            // Trigger text reveal after a short delay
            setTimeout(() => {
              setTextRevealed(true);
            }, 300); // Small delay before text appears
          }, 200); // Small delay after last segment
        }
      }, index * 150); // 150ms delay between each segment
    });
  };
  
  // Handle centre button press
  const handleCenterButtonPress = () => {
    // Don't allow interaction during animations
    if (revealInProgress) return;

    // If segments haven't been revealed yet, start the progressive reveal
    if (!segmentsRevealed) {
      revealSegmentsSequentially();
      return;
    }
    
    // Always reset any domain selection
    if (selectedDomain) {
      // Hide the info card with animation
      Animated.parallel([
        Animated.timing(infoCardOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(infoCardY, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(continueButtonOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start(() => {
        setSelectedDomain(null);
        setShowDomainInfo(false);
      });
    }
    
    // Reset domain preview when centre button is pressed
    if (onResetPreview) {
      onResetPreview();
    }
  };

  // Handle domain selection
  const handleDomainSelect = (domain) => {
    // Don't allow domain selection until segments are revealed
    if (!segmentsRevealed) return;
    
    // If user clicks the same domain again, toggle selection (deselect it)
    if (selectedDomain && selectedDomain.name === domain.name) {
      // Hide the info card with animation
      Animated.parallel([
        Animated.timing(infoCardOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(infoCardY, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(continueButtonOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start(() => {
        // Reset selected domain and hide info
        setSelectedDomain(null);
        setShowDomainInfo(false);
        
        // Reset domain preview
        if (onResetPreview) {
          onResetPreview();
        }
      });
    } else {
      // Select the new domain
      setSelectedDomain(domain);
      
      // Update preview domain for real-time color changes
      if (onDomainPreview) {
        onDomainPreview(domain);
      }
    }
  };
  
  // Show info card when domain is selected with enhanced animations
  useEffect(() => {
    if (selectedDomain && !showDomainInfo) {
      setShowDomainInfo(true);
      
      // Animate in the info card with enhanced motion
      Animated.parallel([
        // Card slides up with a spring motion
        Animated.spring(infoCardY, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true
        }),
        // Card fades in
        Animated.timing(infoCardOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        // Delay the button animation slightly for a sequential feel
        Animated.sequence([
          Animated.delay(150),
          Animated.parallel([
            // Button fades in
            Animated.timing(continueButtonOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true
            }),
            // Button scales up with a bounce
            Animated.spring(continueButtonScale, {
              toValue: 1,
              friction: 6,
              tension: 50,
              useNativeDriver: true
            })
          ])
        ])
      ]).start();
    }
  }, [selectedDomain]);

  // Handle continue button press with animation
  const handleContinue = () => {
    // Apply haptic feedback
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // Add a tactile feedback animation on button press
    Animated.sequence([
      // Quick scale down
      Animated.timing(continueButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      // Quick scale up
      Animated.timing(continueButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start(() => {
      if (selectedDomain) {
        onDomainSelected(selectedDomain);
      }
    });
  };

  // Shake animation for country button
  const triggerCountryShake = () => {
    Animated.sequence([
      Animated.timing(countryShakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(countryShakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(countryShakeAnim, { toValue: 0, duration: 100, useNativeDriver: true })
    ]).start();
    
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };
  
  // Handle continue button press with country validation
  const handleContinueWithValidation = () => {
    // Check if country is selected
    if (!selectedCountry) {
      triggerCountryShake();
      
      // Show temporary button text
      setShowTemporaryButtonText(true);
      
      // Reset back to original text after 1.5 seconds
      setTimeout(() => {
        setShowTemporaryButtonText(false);
      }, 1500);
      
      return;
    }

    handleContinue();
  };
  
  // Get all domain colors for celebration effects
  const allDomainColors = domains.map(domain => domain.color);
  
  // Get domain explanation text based on the selected domain
  const getDomainExplanation = (domain) => {
    if (!domain) return "";
    
    switch (domain.name) {
      case "Career & Work":
        return "Focusing on your professional development, workplace satisfaction, and career progression.";
      case "Health & Wellness":
        return "Prioritizing physical fitness, nutrition, sleep quality, and overall mental well-being.";
      case "Relationships":
        return "Strengthening connections with family, friends, romantic partners, and building meaningful social bonds.";
      case "Personal Growth":
        return "Developing new skills, expanding knowledge, and fostering character development.";
      case "Financial Security":
        return "Managing money effectively, building savings, making smart investments, and working toward financial freedom and security.";
      case "Recreation & Leisure":
        return "Making time for hobbies, fun activities, relaxation, and travel that bring joy and balance.";
      case "Purpose & Meaning":
        return "Exploring spirituality, contributing to causes you care about, and aligning actions with your values.";
      case "Community & Environment":
        return "Building community connections, improving your environment, and organising your spaces for wellbeing.";
      default:
        return domain.description || "Focus on key areas that will help you achieve meaningful progress.";
    }
  };

  return (
    <View style={styles.container}>
      {/* Only show UI elements after segments are revealed */}
      {segmentsRevealed && (
        <>
          {/* Info Button - Top Left */}
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={() => setShowInfoModal(true)}
          >
            <Ionicons name="information-circle-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Country Button - Top Right */}
          <Animated.View style={[styles.countryButtonContainer, { transform: [{ translateX: countryShakeAnim }] }]}>
            <TouchableOpacity
              style={[
                styles.countryButton,
                !selectedCountry && styles.countryButtonRequired
              ]}
              onPress={() => setShowCountryModal(true)}
              activeOpacity={0.7}
            >
              {selectedCountry ? (
                <>
                  <Text style={styles.countryFlag}>
                    {getAvailableCountries().find(c => c.code === selectedCountry)?.flag || '🌍'}
                  </Text>
                  <ResponsiveText style={styles.countryText}>
                    {getAvailableCountries().find(c => c.code === selectedCountry)?.name || selectedCountry}
                  </ResponsiveText>
                </>
              ) : (
                <>
                  <Ionicons name="globe" size={16} color="#FFFFFF" />
                  <ResponsiveText style={styles.countryText}>Select Country</ResponsiveText>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Skip Button - Top Right, above country */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkipOnboarding}
          >
            <ResponsiveText style={styles.skipText}>Skip</ResponsiveText>
          </TouchableOpacity>
        </>
      )}

      {/* Domain Wheel */}
      <View style={styles.wheelContainer}>
        <DomainWheel
          domains={domains}
          onDomainSelected={handleDomainSelect}
          selectedDomain={selectedDomain}
          onCenterButtonPress={handleCenterButtonPress}
          guidedMode={false}
          segmentsRevealed={segmentsRevealed}
          revealedSegments={revealedSegments}
          textRevealed={textRevealed}
          wheelScale={wheelScale}
        />
      </View>

      {/* Sticky Domain Info and Continue Button - similar to goal screen */}
      {showDomainInfo && selectedDomain && (
        <Animated.View 
          style={[
            styles.stickyBottomContainer,
            {
              opacity: infoCardOpacity,
              transform: [{ translateY: infoCardY.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 100]
              }) }]
            }
          ]}
        >
          {/* Domain Info */}
          <View 
            style={[
              styles.domainInfoContainer,
              { borderColor: selectedDomain.color }
            ]}
          >
            <View style={styles.domainInfoHeader}>
              <Animated.View 
                style={[
                  styles.domainIconContainer,
                  { 
                    backgroundColor: selectedDomain.color,
                    transform: [{ scale: infoCardOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 1]
                    })}]
                  }
                ]}
              >
                <Ionicons name={selectedDomain.icon} size={24} color="#FFFFFF" />
              </Animated.View>
              
              <View style={styles.domainHeaderTextContainer}>
                <ResponsiveText style={styles.domainInfoTitle}>
                  {selectedDomain.name}
                </ResponsiveText>
              </View>
            </View>
            
            <ResponsiveText style={styles.domainInfoText}>
              {getDomainExplanation(selectedDomain)}
            </ResponsiveText>
          </View>
          
          {/* Continue Button */}
          <Animated.View style={{ 
            opacity: continueButtonOpacity,
            transform: [{ scale: continueButtonScale }]
          }}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                { backgroundColor: selectedDomain.color }
              ]}
              onPress={handleContinueWithValidation}
              activeOpacity={0.8}
            >
              <ResponsiveText style={styles.continueButtonText}>
                {showTemporaryButtonText ? 'Please select your country' : `Continue with ${selectedDomain.name}`}
              </ResponsiveText>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}


      {/* Simple Country Selection Modal */}
      {showCountryModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            onPress={() => setShowCountryModal(false)}
            activeOpacity={1}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Your Region</Text>
              <Text style={styles.modalSubtitle}>
                Get personalized content for your location
              </Text>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.countriesGrid}>
                {getAvailableCountries().map((country) => (
                  <TouchableOpacity
                    key={country.code}
                    style={[
                      styles.countryCard,
                      selectedCountry === country.code && styles.countryCardSelected
                    ]}
                    onPress={() => {
                      onCountrySelected(country.code);
                      setShowCountryModal(false);
                      
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch (error) {
                        console.log('Haptics not available:', error);
                      }
                    }}
                  >
                    <Text style={styles.countryEmoji}>{country.flag}</Text>
                    <Text 
                      style={[
                        styles.countryLabel,
                        selectedCountry === country.code && styles.countryLabelSelected
                      ]} 
                      numberOfLines={1}
                    >
                      {country.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Domain Info Modal */}
      <DomainInfoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c1425',
  },
  
  // UI Elements
  infoButton: {
    position: 'absolute',
    top: 140,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  
  countryButtonContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
  },
  
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    maxWidth: 160,
    minHeight: 36,
  },
  
  countryButtonRequired: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderColor: '#EF4444',
    borderWidth: 3,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 8,
  },
  
  countryFlag: {
    fontSize: 16,
    marginRight: 6,
  },
  
  countryText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 100,
  },
  
  skipText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  
  // Wheel - moved up to avoid popup overlap
  wheelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 80,
  },
  
  // Sticky Bottom Container
  stickyBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: 'rgba(12, 20, 37, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  
  domainInfoContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  
  domainInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  domainIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  domainHeaderTextContainer: {
    flex: 1,
  },
  
  domainInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  
  domainInfoText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
    zIndex: 2000,
  },
  
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  modalContainer: {
    backgroundColor: '#1a2332',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.75,
    minHeight: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  countriesGrid: {
    paddingVertical: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  countryCard: {
    width: (width - 48) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  countryCardSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
  },
  
  countryEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  
  countryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  
  countryLabelSelected: {
    color: '#60A5FA',
    fontWeight: '700',
  },
});

export default DomainSelectionPage;
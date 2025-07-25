// src/screens/Onboarding/components/screens/FocusSelectionScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  TextInput,
  Animated,
  ScrollView,
  Dimensions,
  Keyboard,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { scale } from '../../styles/onboardingStyles';
import ProgressIndicator from '../ui/ProgressIndicator';
import AIMessage from '../ui/AIMessage';
import ResponsiveText from '../ResponsiveText';
import { getAccessibilityProps, getListItemAccessibilityProps } from '../../utils/accessibility';
import { isLowEndDevice, useOrientation } from '../../utils/deviceUtils';

const { width } = Dimensions.get('window');

/**
 * FocusSelectionScreen - Completely rebuilt to avoid infinite update loops
 */
const FocusSelectionScreen = ({ 
  currentScreen,
  onBack,
  onContinue,
  focusInput,
  setFocusInput,
  lifeDirection,
  setLifeDirection,
  generateLifeDirection,
  typingText,
  fullText
}) => {
  // Get orientation for responsive layout
  const { orientation } = useOrientation();
  
  // Detect if device is low-end for performance optimizations
  const isLowEnd = isLowEndDevice();
  
  // States with careful initialization
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showAIMessage, setShowAIMessage] = useState(false);
  const [aiMessageComplete, setAiMessageComplete] = useState(false);
  const [showEditDirection, setShowEditDirection] = useState(false);
  const [currentEditedDirection, setCurrentEditedDirection] = useState('');
  
  // Using useRef instead of useState for the AIMessage reference
  const aiMessageRef = useRef(null);
  
  // Input field ref
  const directionInputRef = useRef(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  
  // Life direction options - enhanced with accessibility information
  const LIFE_DIRECTION_OPTIONS = [
    {
      id: 'Wealth',
      icon: 'trending-up',
      description: 'Build your empire through strategic investments and ventures',
      direction: 'I am building significant wealth and financial freedom through strategic business opportunities and investments.',
      color: '#0b6e4f', // Forest green (wealth, growth)
      gradient: ['#0b6e4f', '#0f9b69'],
      lightColor: 'rgba(11, 110, 79, 0.15)',
      accessibilityHint: 'Focus on building wealth and financial freedom'
    },
    {
      id: 'Mastery',
      icon: 'trophy',
      description: 'Master your craft and dominate your industry',
      direction: 'I am mastering my skills and expertise to become a recognized leader and authority in my field.',
      color: '#1d3557', // Dark blue (trust, expertise)
      gradient: ['#1d3557', '#2c5282'],
      lightColor: 'rgba(29, 53, 87, 0.15)',
      accessibilityHint: 'Focus on becoming a leader in your field'
    },
    {
      id: 'Impact',
      icon: 'people',
      description: 'Scale your influence and create lasting change',
      direction: 'I am creating significant impact and positive change by scaling solutions to meaningful problems.',
      color: '#e63946', // Bold red (passion, energy)
      gradient: ['#e63946', '#f25d69'],
      lightColor: 'rgba(230, 57, 70, 0.15)',
      accessibilityHint: 'Focus on creating positive change in the world'
    },
    {
      id: 'Freedom',
      icon: 'compass',
      description: 'Design your lifestyle with complete autonomy',
      direction: 'I am building systems that provide me with the freedom to work when, where, and how I want with complete autonomy.',
      color: '#457b9d', // Medium blue (freedom, possibilities)
      gradient: ['#457b9d', '#5a98be'],
      lightColor: 'rgba(69, 123, 157, 0.15)',
      accessibilityHint: 'Focus on creating a lifestyle with complete autonomy'
    },
    {
      id: 'Growth',
      icon: 'analytics',
      description: 'Expand your potential through continuous improvement',
      direction: 'I am committed to continuous growth, learning, and improvement in all areas of my life and business.',
      color: '#5a189a', // Deep purple (wisdom, ambition)
      gradient: ['#5a189a', '#7425c0'],
      lightColor: 'rgba(90, 24, 154, 0.15)',
      accessibilityHint: 'Focus on continuous learning and improvement'
    }
  ];
  
  // Skip AI message typing if not yet complete
  const skipAIMessageTyping = () => {
    if (aiMessageRef.current) {
      aiMessageRef.current.completeTypingImmediately();
    }
  };
  
  // Custom AI messages based on selection
  const getAIMessage = () => {
    if (!focusInput) return "Select a strategic direction to begin your journey.";
    
    const direction = LIFE_DIRECTION_OPTIONS.find(option => option.id === focusInput);
    if (direction) {
      return `${direction.id} is an excellent focus! I'll help you build a system to ${direction.description.toLowerCase()}.`;
    }
    
    return `${focusInput} focus will help build your strategic system.`;
  };
  
  // Handle animation for press effect
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  
  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Initial fade-in animation
  useEffect(() => {
    // Optimize for low-end devices
    if (isLowEnd) {
      // Simple fade in for low-end devices
      fadeAnim.setValue(1);
    } else {
      // Full animation for modern devices
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
    
    // Start pulse animation for cards
    startPulseAnimation();
  }, [isLowEnd]);
  
  // Show AI message when focus is selected - runs only when focusInput changes
  useEffect(() => {
    if (focusInput) {
      setShowAIMessage(true);
      
      // Update the strategic direction based on selection
      const selected = LIFE_DIRECTION_OPTIONS.find(option => option.id === focusInput);
      if (selected) {
        setLifeDirection(selected.direction);
        setCurrentEditedDirection(selected.direction);
      }
    }
  }, [focusInput]);
  
  // Pulse animation for the cards - optimized for performance
  const startPulseAnimation = () => {
    // Skip pulse animation on low-end devices
    if (isLowEnd) return;
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ]), 
      { iterations: -1 }
    ).start();
  };
  
  // Handle AI message completion callback
  const handleTypingComplete = () => {
    setAiMessageComplete(true);
  };
  
  // Handle direction selection
  const handleDirectionSelect = (option) => {
    setFocusInput(option.id);
    setLifeDirection(option.direction);
    setCurrentEditedDirection(option.direction);
    
    // Skip any AI message typing in progress
    skipAIMessageTyping();
  };
  
  // Toggle direction editing
  const toggleDirectionEditing = () => {
    if (!showEditDirection) {
      setCurrentEditedDirection(lifeDirection || '');
      
      // Focus the input field after a short delay to ensure it's visible
      setTimeout(() => {
        if (directionInputRef.current) {
          directionInputRef.current.focus();
        }
      }, 100);
    }
    setShowEditDirection(!showEditDirection);
  };
  
  // Save edited direction
  const saveEditedDirection = () => {
    if (currentEditedDirection.trim()) {
      setLifeDirection(currentEditedDirection.trim());
    }
    setShowEditDirection(false);
    Keyboard.dismiss();
  };

  // Simple Card component for the direction cards
  const DirectionCard = ({ item, isSelected, onPress }) => {
    return (
      <Animated.View 
        style={{ transform: [{ scale: isSelected ? pulseAnimation : 1 }] }}
      >
        <TouchableOpacity
          style={[
            styles.directionCard,
            {
              borderColor: isSelected ? item.color : 'transparent',
              borderWidth: isSelected ? 2 : 0,
              backgroundColor: item.color
            }
          ]}
          onPress={() => onPress(item)}
          activeOpacity={0.8}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          {...getAccessibilityProps({
            label: item.id,
            hint: item.accessibilityHint,
            role: "button",
            isSelected: isSelected
          })}
        >
          <View style={styles.cardContent}>
            <Ionicons 
              name={item.icon} 
              size={28} 
              color="#FFFFFF" 
              accessibilityLabel={`${item.id} icon`}
            />
            <ResponsiveText style={styles.cardTitle}>
              {item.id}
            </ResponsiveText>
            <ResponsiveText 
              style={styles.cardDescription}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.description}
            </ResponsiveText>
            
            {isSelected && (
              <View 
                style={styles.selectedBadge}
                accessibilityLabel="Selected"
              >
                <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView 
      style={[
        styles.safeArea,
        orientation === 'landscape' && styles.safeAreaLandscape
      ]}
      accessible={true}
      accessibilityLabel="Focus Selection Screen"
      accessibilityRole="none"
    >
      <Animated.View 
        style={[
          styles.container, 
          { opacity: fadeAnim },
          orientation === 'landscape' && styles.containerLandscape
        ]}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            keyboardVisible && styles.scrollContentKeyboardOpen,
            orientation === 'landscape' && styles.scrollContentLandscape
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Progress indicator */}
          <View style={styles.progressWrapper}>
            <ProgressIndicator currentScreen={currentScreen} totalScreens={5} />
          </View>
          
          {/* Page title */}
          <View 
            style={styles.titleContainer}
            accessible={true}
            accessibilityRole="header"
          >
            <ResponsiveText style={styles.pageTitle}>
              What's your strategic direction?
            </ResponsiveText>
            <ResponsiveText style={styles.pageSubtitle}>
              Choose the focus that will guide your goals and decisions
            </ResponsiveText>
          </View>
          
          {/* Life Direction cards in horizontal scrolling layout */}
          <View 
            style={[
              styles.cardListContainer,
              orientation === 'landscape' && styles.cardListContainerLandscape
            ]}
            accessible={true}
            accessibilityLabel="Direction options"
            accessibilityHint="Swipe to see all options and tap to select one"
            accessibilityRole="scrollbar"
          >
            <FlatList
              data={LIFE_DIRECTION_OPTIONS}
              renderItem={({ item, index }) => (
                <DirectionCard 
                  item={item}
                  isSelected={focusInput === item.id}
                  onPress={handleDirectionSelect}
                  {...getListItemAccessibilityProps(index, LIFE_DIRECTION_OPTIONS.length)}
                />
              )}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.cardListContent,
                orientation === 'landscape' && styles.cardListContentLandscape
              ]}
              snapToInterval={orientation === 'landscape' ? width / 2 - 40 : width - 64}
              decelerationRate="fast"
              snapToAlignment="center"
              pagingEnabled
              accessible={true}
            />
          </View>
          
          {/* AI Message - Only shown after selection */}
          {showAIMessage && focusInput && (
            <View 
              style={styles.aiSectionContainer}
              accessible={true}
              accessibilityLabel="AI Assistant message"
              accessibilityRole="text"
            >
              <AIMessage 
                ref={aiMessageRef}
                fullText={getAIMessage()}
                initialDelay={500}
                onTypingComplete={handleTypingComplete}
              />
            </View>
          )}
          
          {/* Direction Statement - Only shown after AI message completes */}
          {focusInput && aiMessageComplete && (
            <View
              style={styles.directionStatementContainer}
              accessible={true}
              accessibilityLabel="Your Strategic Direction"
              accessibilityRole="text"
            >
              <LinearGradient
                colors={['rgba(37, 99, 235, 0.05)', 'rgba(59, 130, 246, 0.1)']}
                style={styles.directionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              
              <View style={styles.directionLabelRow}>
                <Ionicons name="navigate" size={18} color="#2563eb" />
                <ResponsiveText style={styles.directionLabel}>
                  Your Strategic Direction
                </ResponsiveText>
              </View>
              
              {showEditDirection ? (
                <View style={styles.editContainer}>
                  <TextInput
                    ref={directionInputRef}
                    style={styles.directionInput}
                    value={currentEditedDirection}
                    onChangeText={setCurrentEditedDirection}
                    multiline
                    numberOfLines={3}
                    placeholder="Edit your strategic direction statement..."
                    placeholderTextColor="#666666"
                    maxLength={200} // Add character limit
                    accessibilityLabel="Edit your strategic direction"
                    accessibilityHint="Enter your personal strategic direction statement"
                  />
                  
                  <View style={styles.editButtonsRow}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={toggleDirectionEditing}
                      {...getAccessibilityProps({
                        label: "Cancel",
                        hint: "Discard changes and return to view mode",
                        role: "button"
                      })}
                    >
                      <ResponsiveText style={styles.cancelButtonText}>
                        Cancel
                      </ResponsiveText>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.saveButton}
                      onPress={saveEditedDirection}
                      {...getAccessibilityProps({
                        label: "Save",
                        hint: "Save your edited strategic direction",
                        role: "button"
                      })}
                    >
                      <ResponsiveText style={styles.saveButtonText}>
                        Save
                      </ResponsiveText>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.directionDisplayContainer}>
                  <ResponsiveText 
                    style={styles.directionText}
                    numberOfLines={4}
                    ellipsizeMode="tail"
                  >
                    {lifeDirection || (focusInput && LIFE_DIRECTION_OPTIONS.find(opt => opt.id === focusInput)?.direction)}
                  </ResponsiveText>
                  
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={toggleDirectionEditing}
                    {...getAccessibilityProps({
                      label: "Customize",
                      hint: "Edit your strategic direction statement",
                      role: "button"
                    })}
                  >
                    <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                    <ResponsiveText style={styles.editButtonText}>
                      Customize
                    </ResponsiveText>
                  </TouchableOpacity>
                </View>
              )}
              
              <View 
                style={styles.directionTips}
                accessible={true}
                accessibilityLabel="Tips about your strategic direction"
                accessibilityRole="text"
              >
                <View style={styles.directionTip}>
                  <Ionicons name="information-circle" size={14} color="#777777" />
                  <ResponsiveText style={styles.tipText}>
                    This will guide all your goals and projects in the system.
                  </ResponsiveText>
                </View>
                
                <View style={styles.directionTip}>
                  <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                  <ResponsiveText style={styles.tipText}>
                    Don't worry if it isn't perfect—you can always refine it later.
                  </ResponsiveText>
                </View>
              </View>
            </View>
          )}
          
          {/* Add spacing when keyboard is visible */}
          {keyboardVisible && <View style={styles.keyboardSpacer} />}
        </ScrollView>
        
        {/* Action Buttons - Only shown after selection */}
        {focusInput && aiMessageComplete && (
          <View 
            style={[
              styles.actionContainer,
              orientation === 'landscape' && styles.actionContainerLandscape
            ]}
          >
            {/* Back button on left */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={onBack}
              {...getAccessibilityProps({
                label: "Back",
                hint: "Return to the previous screen",
                role: "button"
              })}
            >
              <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
              <ResponsiveText style={styles.backButtonText}>
                Back
              </ResponsiveText>
            </TouchableOpacity>
            
            {/* Continue button on right */}
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={onContinue}
              activeOpacity={0.9}
              {...getAccessibilityProps({
                label: "Continue",
                hint: "Proceed to the next step",
                role: "button"
              })}
            >
              <ResponsiveText style={styles.primaryButtonText}>
                Continue
              </ResponsiveText>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0c1425',
  },
  safeAreaLandscape: {
    flexDirection: 'row',
  },
  container: {
    flex: 1,
    backgroundColor: '#0c1425',
  },
  containerLandscape: {
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  scrollContentKeyboardOpen: {
    paddingBottom: 200, // Extra padding when keyboard is open
  },
  scrollContentLandscape: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  progressWrapper: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  titleContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: scale(28, 0.2),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: scale(16, 0.3),
    color: '#AAAAAA',
    textAlign: 'center',
    maxWidth: '90%',
  },
  
  // Card list container
  cardListContainer: {
    height: 220,
    marginBottom: 30,
  },
  cardListContainerLandscape: {
    height: 220,
    width: '100%',
  },
  cardListContent: {
    paddingHorizontal: 16,
  },
  cardListContentLandscape: {
    justifyContent: 'center',
  },
  
  // Direction card styles
  directionCard: {
    width: width - 80,
    height: 200,
    borderRadius: 16,
    marginHorizontal: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginHorizontal: 'auto',
    paddingHorizontal: 4,
  },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  
  aiSectionContainer: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
    minHeight: 100,
  },
  
  // Direction statement container
  directionStatementContainer: {
    backgroundColor: 'rgba(20, 20, 30, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
    overflow: 'hidden',
    position: 'relative',
  },
  directionGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 16,
  },
  directionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  directionLabel: {
    fontSize: scale(14, 0.3),
    color: '#FFFFFF',
    marginLeft: 8,
  },
  directionDisplayContainer: {
    marginBottom: 12,
  },
  directionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 6,
  },
  
  // Edit container
  editContainer: {
    marginBottom: 16,
  },
  directionInput: {
    backgroundColor: 'rgba(30, 30, 40, 0.6)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
  },
  editButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  
  // Tip section
  directionTip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  directionTips: {
    marginTop: 6,
    gap: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#777777',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  
  // Bottom action container
  keyboardSpacer: {
    height: 120,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(12, 20, 37, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionContainerLandscape: {
    paddingHorizontal: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: scale(14, 0.3),
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: scale(16, 0.2),
    fontWeight: '600',
    marginRight: 8,
  },
});

export default FocusSelectionScreen;
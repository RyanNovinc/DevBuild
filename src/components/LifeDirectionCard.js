// src/components/LifeDirectionCard.js
import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  StatusBar,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Research-backed life direction options for entrepreneurial men aged 25-34
const LIFE_DIRECTION_OPTIONS = [
  {
    id: 'Wealth',
    icon: 'trending-up',
    description: 'Build your empire through strategic investments and ventures',
    direction: 'I am building significant wealth and financial freedom through strategic business opportunities and investments.',
    color: '#0b6e4f', // Forest green (wealth, growth)
    gradient: ['#0b6e4f', '#0f9b69'],
    lightColor: 'rgba(11, 110, 79, 0.15)'
  },
  {
    id: 'Mastery',
    icon: 'trophy',
    description: 'Master your craft and dominate your industry',
    direction: 'I am mastering my skills and expertise to become a recognized leader and authority in my field.',
    color: '#1d3557', // Dark blue (trust, expertise)
    gradient: ['#1d3557', '#2c5282'],
    lightColor: 'rgba(29, 53, 87, 0.15)'
  },
  {
    id: 'Impact',
    icon: 'people',
    description: 'Scale your influence and create lasting change',
    direction: 'I am creating significant impact and positive change by scaling solutions to meaningful problems.',
    color: '#e63946', // Bold red (passion, energy)
    gradient: ['#e63946', '#f25d69'],
    lightColor: 'rgba(230, 57, 70, 0.15)'
  },
  {
    id: 'Freedom',
    icon: 'compass',
    description: 'Design your lifestyle with complete autonomy',
    direction: 'I am building systems that provide me with the freedom to work when, where, and how I want with complete autonomy.',
    color: '#457b9d', // Medium blue (freedom, possibilities)
    gradient: ['#457b9d', '#5a98be'],
    lightColor: 'rgba(69, 123, 157, 0.15)'
  },
  {
    id: 'Growth',
    icon: 'analytics',
    description: 'Expand your potential through continuous improvement',
    direction: 'I am committed to continuous growth, learning, and improvement in all areas of my life and business.',
    color: '#5a189a', // Deep purple (wisdom, ambition)
    gradient: ['#5a189a', '#7425c0'],
    lightColor: 'rgba(90, 24, 154, 0.15)'
  }
];

// Simple component for direction cards to ensure proper layout
const DirectionCard = ({ item, isSelected, onPress, pulseAnimation }) => {
  return (
    <Animated.View style={{ transform: [{ scale: isSelected ? pulseAnimation : 1 }] }}>
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
      >
        <View style={styles.cardContent}>
          <Ionicons name={item.icon} size={28} color="#FFFFFF" />
          <Text style={styles.cardTitle}>{item.id}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
          
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const LifeDirectionCard = forwardRef(({ lifeDirection, onSave, navigation }, ref) => {
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [editedDirection, setEditedDirection] = useState(lifeDirection || '');
  const [primaryDirection, setPrimaryDirection] = useState(null);
  const [supportingDirections, setSupportingDirections] = useState([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [isDirectEditMode, setIsDirectEditMode] = useState(false); // New state for direct edit mode
  
  // Animation for press effect
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Check if using dark mode for better contrast
  const isDarkMode = theme.background === '#000000' || theme.dark;

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    openEditor: () => {
      handleEdit();
    }
  }));

  // Set initial selections based on current direction
  useEffect(() => {
    if (lifeDirection) {
      const match = LIFE_DIRECTION_OPTIONS.find(option => 
        option.direction.toLowerCase() === lifeDirection.toLowerCase()
      );
      
      if (match) {
        setPrimaryDirection(match.id);
        setEditedDirection(match.direction);
      } else {
        setPrimaryDirection(null);
        setEditedDirection(lifeDirection);
        setIsCustomizing(true);
      }
    } else {
      // Default to Wealth as primary direction based on research
      setPrimaryDirection('Wealth');
      setEditedDirection(LIFE_DIRECTION_OPTIONS[0].direction);
    }
  }, [lifeDirection]);
  
  // Animate elements when modal opens
  useEffect(() => {
    if (showModal) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      ]).start();
      
      // Start pulse animation for cards
      startPulseAnimation();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(0);
      // Reset direct edit mode when modal closes
      setIsDirectEditMode(false);
    }
  }, [showModal]);
  
  // Pulse animation for the cards
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ]), 
      { iterations: -1 }
    ).start();
  };
  
  // Handle press animation
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
  
  // Open modal with current life direction
  const handleEdit = () => {
    // If user already has a direction, go directly to edit mode
    if (lifeDirection) {
      setIsDirectEditMode(true);
      setCurrentStep(0);
    } else {
      // If no direction exists, start at the beginning of the wizard
      setIsDirectEditMode(false);
      setCurrentStep(0);
    }
    setShowModal(true);
  };
  
  // Start the guided wizard flow
  const startGuidedAssistance = () => {
    setIsDirectEditMode(false);
    setCurrentStep(0);
  };
  
  // Save the edited life direction
  const handleSave = () => {
    if (onSave) {
      const finalDirection = isCustomizing || isDirectEditMode ? editedDirection.trim() : generateCustomDirection();
      onSave(finalDirection);
    }
    setShowModal(false);
  };
  
  // Handle selecting a primary direction
  const handleSelectPrimary = (option) => {
    // If already in supporting directions, remove it
    if (supportingDirections.includes(option.id)) {
      setSupportingDirections(supportingDirections.filter(id => id !== option.id));
    }
    
    setPrimaryDirection(option.id);
    setEditedDirection(option.direction);
    setIsCustomizing(false);
    
    // No longer auto-advancing to the next step
  };
  
  // Handle selecting a supporting direction
  const handleSelectSupporting = (option) => {
    // Can't be both primary and supporting
    if (primaryDirection === option.id) return;
    
    // Toggle selection
    if (supportingDirections.includes(option.id)) {
      setSupportingDirections(supportingDirections.filter(id => id !== option.id));
    } else {
      // Limit to 2 supporting directions per research
      if (supportingDirections.length < 2) {
        setSupportingDirections([...supportingDirections, option.id]);
      }
    }
  };
  
  // Navigate between steps
  const goToNextStep = () => {
    // Animate transition
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(currentStep + 1);
      slideAnim.setValue(0);
      
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    });
  };
  
  const goToPreviousStep = () => {
    // Animate transition
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(currentStep - 1);
      slideAnim.setValue(0);
      
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    });
  };
  
  // Start customizing from scratch - skip directly to last step
  const handleStartCustomizing = () => {
    setIsCustomizing(true);
    setCurrentStep(2); // Jump directly to the final step
    
    // Reset animation for smooth transition
    slideAnim.setValue(0);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };
  
  // Custom direction from selected directions
  const generateCustomDirection = () => {
    if (!primaryDirection) return '';
    
    const primary = LIFE_DIRECTION_OPTIONS.find(option => option.id === primaryDirection);
    if (!primary) return '';
    
    let direction = primary.direction;
    
    // If there are supporting directions, incorporate them
    if (supportingDirections.length > 0) {
      // Extract key phrases from supporting directions
      const supporting = supportingDirections.map(id => 
        LIFE_DIRECTION_OPTIONS.find(option => option.id === id)
      ).filter(Boolean);
      
      // Create a customized direction statement
      const primaryPhrase = primary.direction.replace('I am ', '').split(' and ')[0];
      
      if (supporting.length === 1) {
        const supportingPhrase = supporting[0].direction.toLowerCase().replace('i am ', '');
        direction = `I am ${primaryPhrase} while ${supportingPhrase}`;
      } else if (supporting.length === 2) {
        const supportingPhrase1 = supporting[0].direction.toLowerCase().replace('i am ', '');
        const supportingPhrase2 = supporting[1].direction.toLowerCase().replace('i am ', '');
        direction = `I am ${primaryPhrase} while ${supportingPhrase1} and ${supportingPhrase2}`;
      }
    }
    
    return direction;
  };
  
  // Get primary direction object
  const getPrimaryDirectionObject = () => {
    return LIFE_DIRECTION_OPTIONS.find(option => option.id === primaryDirection) || LIFE_DIRECTION_OPTIONS[0];
  };

  // Get primary color based on selected direction or theme
  const getPrimaryColor = () => {
    if (primaryDirection) {
      const primary = LIFE_DIRECTION_OPTIONS.find(option => option.id === primaryDirection);
      return primary ? primary.color : theme.primary;
    }
    return theme.primary;
  };
  
  // Render card content based on having a direction or not
  const renderCardContent = () => {
    if (lifeDirection) {
      return (
        <View style={styles.contentContainer}>
          <Text style={[styles.directionText, { color: theme.text }]}>
            {lifeDirection}
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="navigate-circle-outline" 
            size={44} 
            color={theme.primary} 
            style={styles.emptyIcon}
          />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Define Your Direction
          </Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Set your strategic compass to guide all your goals and decisions
          </Text>
          <View style={styles.emptyButtonContainer}>
            <TouchableOpacity 
              style={[styles.addButton, { 
                backgroundColor: theme.primary,
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
              }]}
            >
              <Text style={[styles.addButtonText, {
                color: isDarkMode ? '#000000' : '#FFFFFF'
              }]}>Tap to Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };
  
  // Render direct edit screen
  const renderDirectEditScreen = () => {
    const primary = getPrimaryDirectionObject();
    
    return (
      <Animated.View 
        style={[
          styles.stepContainer,
          {
            opacity: slideAnim,
            transform: [{ 
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              }) 
            }]
          }
        ]}
      >
        <Text style={[styles.stepTitle, { color: theme.text }]}>
          Edit Your Direction
        </Text>
        <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
          Update your strategic direction statement below:
        </Text>
        
        <View style={[styles.directionPreviewContainer, {
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          borderColor: theme.border
        }]}>
          <TextInput
            style={[
              styles.directionInput, 
              { 
                color: theme.text,
                backgroundColor: 'transparent',
              }
            ]}
            value={editedDirection}
            onChangeText={setEditedDirection}
            placeholder="e.g., I am building significant wealth while creating meaningful impact..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.tipContainer}>
          <Ionicons name="information-circle" size={16} color={theme.primary} />
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
            Pro tip: Start with "I am" and use present tense, action-oriented language for maximum impact.
          </Text>
        </View>
        
        {/* Guided Assistance Button */}
        <TouchableOpacity 
          style={[styles.guidedAssistanceButton, { 
            backgroundColor: theme.primary + '15',
            borderColor: theme.primary
          }]}
          onPress={startGuidedAssistance}
        >
          <Ionicons name="compass" size={20} color={theme.primary} />
          <Text style={[styles.guidedAssistanceText, { color: theme.primary }]}>
            Use Guided Assistance
          </Text>
        </TouchableOpacity>
        
        <View style={[styles.stepButtonsContainer, { marginTop: 20 }]}>
          <TouchableOpacity 
            style={[styles.backButton, {
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            }]}
            onPress={() => setShowModal(false)}
          >
            <Ionicons name="close" size={18} color={theme.text} />
            <Text style={[styles.backButtonText, { color: theme.text }]}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.nextButton, { 
              backgroundColor: theme.primary,
              flex: 2,
              opacity: !editedDirection.trim() ? 0.5 : 1
            }]}
            onPress={handleSave}
            disabled={!editedDirection.trim()}
          >
            <Text style={styles.nextButtonText}>Save Direction</Text>
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };
  
  // Render different steps in the modal
  const renderStep = () => {
    // If in direct edit mode, show the direct edit screen
    if (isDirectEditMode) {
      return renderDirectEditScreen();
    }
    
    const primary = getPrimaryDirectionObject();
    
    switch (currentStep) {
      case 0: // Select primary direction
        return (
          <Animated.View 
            style={[
              styles.stepContainer,
              {
                opacity: slideAnim,
                transform: [{ 
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  }) 
                }]
              }
            ]}
          >
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              What drives you?
            </Text>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              Select your primary motivation - the core driver that will guide your goals and decisions.
            </Text>
            
            <View style={styles.directionsListContainer}>
              <FlatList
                data={LIFE_DIRECTION_OPTIONS}
                renderItem={({ item }) => (
                  <DirectionCard 
                    item={item}
                    isSelected={primaryDirection === item.id}
                    onPress={handleSelectPrimary}
                    pulseAnimation={pulseAnim}
                  />
                )}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.directionsListContent}
                snapToInterval={width - 64}
                decelerationRate="fast"
                snapToAlignment="center"
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.nextButton, { 
                backgroundColor: primaryDirection ? primary.color : theme.primary,
                opacity: primaryDirection ? 1 : 0.5
              }]}
              onPress={goToNextStep}
              disabled={!primaryDirection}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleStartCustomizing}
            >
              <Text style={[styles.skipButtonText, { color: theme.textSecondary }]}>
                Write my own
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
        
      case 1: // Select supporting directions
        return (
          <Animated.View 
            style={[
              styles.stepContainer,
              {
                opacity: slideAnim,
                transform: [{ 
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  }) 
                }]
              }
            ]}
          >
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              Supporting Directions
            </Text>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              Select up to 2 supporting elements that complement your primary focus (optional).
            </Text>
            
            <View style={styles.selectedPrimaryContainer}>
              <LinearGradient
                colors={primary.gradient}
                style={styles.selectedPrimaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name={primary.icon} size={22} color="#FFFFFF" />
                <Text style={styles.selectedPrimaryText}>{primary.id}</Text>
              </LinearGradient>
              <Text style={[styles.primaryLabel, { color: primary.color }]}>
                PRIMARY FOCUS
              </Text>
            </View>
            
            <View style={styles.supportingChipsContainer}>
              {LIFE_DIRECTION_OPTIONS
                .filter(option => option.id !== primaryDirection)
                .map(option => renderSupportingChip(option))}
            </View>
            
            <View style={styles.stepButtonsContainer}>
              <TouchableOpacity 
                style={[styles.backButton, {
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }]}
                onPress={goToPreviousStep}
              >
                <Ionicons name="arrow-back" size={18} color={theme.text} />
                <Text style={[styles.backButtonText, { color: theme.text }]}>Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.nextButton, { 
                  backgroundColor: primary.color,
                  flex: 2
                }]}
                onPress={goToNextStep}
              >
                <Text style={styles.nextButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleStartCustomizing}
            >
              <Text style={[styles.skipButtonText, { color: theme.textSecondary }]}>
                Write my own
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
        
      case 2: // Review and customize
        return (
          <Animated.View 
            style={[
              styles.stepContainer,
              {
                opacity: slideAnim,
                transform: [{ 
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  }) 
                }]
              }
            ]}
          >
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              Your Direction Statement
            </Text>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              {isCustomizing ? 
                "Craft your custom direction statement:" :
                "Review your direction statement or customize it:"}
            </Text>
            
            <View style={[styles.directionPreviewContainer, {
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderColor: theme.border
            }]}>
              {isCustomizing ? (
                <TextInput
                  style={[
                    styles.directionInput, 
                    { 
                      color: theme.text,
                      backgroundColor: 'transparent',
                    }
                  ]}
                  value={editedDirection}
                  onChangeText={setEditedDirection}
                  placeholder="e.g., I am building significant wealth while creating meaningful impact..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              ) : (
                <>
                  <Text style={[styles.directionPreviewText, { color: theme.text }]}>
                    {generateCustomDirection()}
                  </Text>
                  <TouchableOpacity 
                    style={[styles.customizeButtonSmall, { backgroundColor: primary.color }]}
                    onPress={handleStartCustomizing}
                  >
                    <Ionicons name="create-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.customizeButtonText}>Customize</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
            
            <View style={styles.tipContainer}>
              <Ionicons name="information-circle" size={16} color={primary.color} />
              <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                Pro tip: Start with "I am" and use present tense, action-oriented language for maximum impact.
              </Text>
            </View>
            
            <View style={styles.stepButtonsContainer}>
              <TouchableOpacity 
                style={[styles.backButton, {
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }]}
                onPress={goToPreviousStep}
              >
                <Ionicons name="arrow-back" size={18} color={theme.text} />
                <Text style={[styles.backButtonText, { color: theme.text }]}>Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.nextButton, { 
                  backgroundColor: primary.color,
                  flex: 2,
                  opacity: isCustomizing && !editedDirection.trim() ? 0.5 : 1
                }]}
                onPress={handleSave}
                disabled={isCustomizing && !editedDirection.trim()}
              >
                <Text style={styles.nextButtonText}>Set Direction</Text>
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
        
      default:
        return null;
    }
  };
  
  // Render a chip for supporting direction selection
  const renderSupportingChip = (option) => {
    const isSelected = supportingDirections.includes(option.id);
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.supportingChip,
          {
            backgroundColor: isSelected ? option.color : isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          }
        ]}
        onPress={() => handleSelectSupporting(option)}
      >
        <Ionicons 
          name={option.icon} 
          size={16} 
          color={isSelected ? '#FFFFFF' : theme.textSecondary} 
          style={{ marginRight: 6 }}
        />
        <Text style={[
          styles.supportingChipText,
          { color: isSelected ? '#FFFFFF' : theme.text }
        ]}>
          {option.id}
        </Text>
        
        {isSelected && (
          <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
        )}
      </TouchableOpacity>
    );
  };
  
  // Render AI info panel at the very bottom of the modal
  const renderAIInfoPanel = () => {
    if ((currentStep === 2 && !isDirectEditMode) || isDirectEditMode) {
      const primary = getPrimaryDirectionObject();
      
      return (
        <Animated.View style={[
          styles.aiInfoContainerWrapper,
          {
            opacity: slideAnim,
            transform: [{ 
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0]
              }) 
            }]
          }
        ]}>
          <View style={styles.aiInfoContainer}>
            <View style={[styles.aiIconContainer, { backgroundColor: isDirectEditMode ? theme.primary : primary.color }]}>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.aiInfoText, { color: theme.textSecondary }]}>
              LifeCompassAI will analyze your direction statement to provide personalized guidance for goals, projects, tasks, and time management that aligns with your core motivation.
            </Text>
          </View>
        </Animated.View>
      );
    }
    return null;
  };

  // Create a background gradient based on selected direction or theme
  const getCardGradient = () => {
    const baseColor = getPrimaryColor();
    
    // Create a very subtle gradient for the background
    return [
      `${baseColor}08`, // 8% opacity
      `${baseColor}15`  // 15% opacity
    ];
  };
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleEdit}
        style={({ pressed }) => [
          styles.cardContainer,
          { 
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 16,
            overflow: 'hidden' // Ensure gradient stays within the container
          }
        ]}
      >
        {/* Subtle Gradient Background */}
        <LinearGradient
          colors={getCardGradient()}
          style={styles.cardGradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Card Header - Centered */}
          <View style={styles.cardHeader}>
            <Ionicons 
              name="navigate" 
              size={24} 
              color={theme.primary} 
              style={styles.headerIcon} 
            />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Strategic Direction
            </Text>
          </View>

          {/* Subtle divider */}
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          
          {/* Main Card Content */}
          {renderCardContent()}
        </LinearGradient>
      </Pressable>
      
      {/* Full-screen direction selection modal */}
      <Modal
        visible={showModal}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
        statusBarTranslucent={true}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent={true}
        />
        
        <View style={styles.modalContainer}>
          <Animated.View style={[
            styles.modalHeader,
            { opacity: fadeAnim }
          ]}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            {!isDirectEditMode && (
              <View style={styles.progressIndicator}>
                {[0, 1, 2].map(step => (
                  <View 
                    key={step}
                    style={[
                      styles.progressDot,
                      {
                        backgroundColor: step <= currentStep ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                        width: step === currentStep ? 16 : 8
                      }
                    ]}
                  />
                ))}
              </View>
            )}
          </Animated.View>
          
          {renderStep()}
          {renderAIInfoPanel()}
        </View>
      </Modal>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  // Main card container
  cardContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 180, // Ensure consistent height
  },
  cardGradientBackground: {
    flex: 1,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginBottom: 16,
    width: '100%',
    opacity: 0.5,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 16,
  },
  directionText: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '400',
  },
  
  // Empty state styles
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyButtonContainer: {
    marginTop: 8,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Direction card styles - COMPLETELY REWRITTEN
  directionCard: {
    width: width - 80,
    height: 200,
    borderRadius: 16,
    marginHorizontal: 4,
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
  
  // Modal styles - Full screen redesign
  modalContainer: {
    flex: 1,
    paddingTop: 40, // Account for status bar
    backgroundColor: '#121212',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  
  // Step container
  stepContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 80, // Allow space for header
    justifyContent: 'flex-start',
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  
  // Direction card list
  directionsListContainer: {
    height: 220,
    marginBottom: 30,
  },
  directionsListContent: {
    paddingHorizontal: 12,
  },
  
  // Selected primary display
  selectedPrimaryContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  selectedPrimaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    minWidth: 150,
    justifyContent: 'center',
  },
  selectedPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  primaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 1,
  },
  
  // Supporting chips
  supportingChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
  },
  supportingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 25,
    margin: 6,
  },
  supportingChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Direction preview and input
  directionPreviewContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    minHeight: 140,
  },
  directionPreviewText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  customizeButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  customizeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  directionInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 100,
    padding: 0,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingHorizontal: 12,
  },
  tipText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  
  // Guided Assistance Button - NEW
  guidedAssistanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  guidedAssistanceText: {
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  
  // Bottom buttons
  stepButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
  },
  backButtonText: {
    fontWeight: '500',
    marginLeft: 6,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 14,
  },
  
  // AI Info styles
  aiInfoContainerWrapper: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  aiInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 12,
  },
  aiIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  aiInfoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default LifeDirectionCard;
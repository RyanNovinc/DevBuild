// src/screens/Onboarding/screens/GoalSelectionPage.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Easing,
  Platform,
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ResponsiveText from '../components/ResponsiveText';
import TypingAnimation from '../components/TypingAnimation';
import NavigationHeader from '../components/NavigationHeader';
import { useI18n } from '../context/I18nContext';
import { 
  getTranslatedDomainName, 
  getTranslatedGoalName, 
  getTranslatedGoalExplanation 
} from '../data/domainTranslations';

const { width, height } = Dimensions.get('window');

const GoalSelectionPage = ({ domain, onGoalSelected, onBack, isNavigating = false }) => {
  // Get translation function and current language
  const { t, currentLanguage } = useI18n();
  
  // State
  const [messageStep, setMessageStep] = useState(1);
  const [messageComplete, setMessageComplete] = useState(false);
  const [goalsVisible, setGoalsVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showInfoMessage, setShowInfoMessage] = useState(true);
  
  // Get 3 goals from the domain
  const goals = domain.goals.slice(0, 3);
  
  // Reference to the TypingAnimation component
  const typingRef = useRef(null);
  
  // Card animation refs
  const cardScales = useRef(goals.map(() => new Animated.Value(1))).current;
  const cardRotations = useRef(goals.map(() => new Animated.Value(0))).current;
  
  // Track checkmark animations for each card separately
  const checkmarkScales = useRef(goals.map(() => new Animated.Value(0))).current;
  const checkmarkRotations = useRef(goals.map(() => new Animated.Value(-1))).current;
  
  // Style state for JS-driven properties that can't use native driver
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  
  // Animations
  const messageOpacity = useRef(new Animated.Value(1)).current;
  const messageTextOpacity = useRef(new Animated.Value(1)).current;
  const tapPromptOpacity = useRef(new Animated.Value(0)).current;
  const goalsContainerOpacity = useRef(new Animated.Value(0)).current;
  const goalAnimations = useRef(goals.map(() => new Animated.Value(0))).current;
  const confirmationOpacity = useRef(new Animated.Value(0)).current;
  const confirmationY = useRef(new Animated.Value(50)).current;
  const infoMessageOpacity = useRef(new Animated.Value(1)).current;

  // Icon animations - for the sparkle icon
  const iconPulse = useRef(new Animated.Value(1)).current;

  // Get current message based on step
  const getCurrentMessage = () => {
    const translatedDomainName = getTranslatedDomainName(domain.name, currentLanguage);
    
    switch(messageStep) {
      case 1:
        return "Great choice!";
      case 2:
        return `Now select a specific goal within ${translatedDomainName} that you would like to achieve.`;
      default:
        return "";
    }
  };

  // Helper function to get a short goal description based on language
  const getShortGoalDescription = (goalName) => {
    if (currentLanguage === 'ja') {
      const fullExplanation = getTranslatedGoalExplanation(goalName, 'ja');
      
      if (!fullExplanation) {
        // Fallback if no explanation found
        const translatedGoalName = getTranslatedGoalName(goalName, 'ja');
        const translatedDomainName = getTranslatedDomainName(domain.name, 'ja');
        return `${translatedGoalName}に焦点を当てて${translatedDomainName}を向上させる`;
      }
      
      // Try to get first sentence, but ensure we have something meaningful
      const sentences = fullExplanation.split('。');
      if (sentences.length > 0 && sentences[0].length > 5) {
        // Add back the period and return
        return sentences[0] + '。';
      } else {
        // Return first 50 chars as fallback
        return fullExplanation.substring(0, 50) + '...';
      }
    } else {
      // For English, we'll use the default approach or provide short descriptions
      switch(goalName) {
        case "Career Advancement":
          return "Focus on promotion and growth opportunities";
        case "Work-Life Balance":
          return "Create boundaries for sustainable career success";
        case "Skill Development":
          return "Enhance your professional capabilities";
        case "Regular Exercise":
          return "Build consistent physical activity habits";
        case "Improved Nutrition":
          return "Develop healthier eating patterns";
        case "Better Sleep Habits":
          return "Optimize your sleep quality and routine";
        case "Quality Time":
          return "Deepen connections with important people";
        case "Improved Communication":
          return "Enhance how you express and understand others";
        case "Building New Connections":
          return "Expand your social and professional network";
        case "Learning New Skills":
          return "Acquire abilities beyond your profession";
        case "Reading More":
          return "Make reading a regular part of your life";
        case "Mindfulness Practice":
          return "Develop presence and reduce stress";
        case "Emergency Fund":
          return "Build financial safety and peace of mind";
        case "Debt Reduction":
          return "Decrease financial burdens systematically";
        case "Retirement Planning":
          return "Secure your long-term financial future";
        case "New Hobby":
          return "Find fulfilling recreational activities";
        case "Travel":
          return "Plan meaningful experiences in new places";
        case "Creative Expression":
          return "Develop outlets for creativity and imagination";
        case "Spiritual Practice":
          return "Connect with something greater than yourself";
        case "Service to Others":
          return "Make a difference through helping others";
        case "Finding Life Purpose":
          return "Align your actions with your deepest values";
        case "Home Organization":
          return "Create order and reduce stress in your spaces";
        case "Daily Routines":
          return "Optimize your daily patterns for productivity";
        case "Creating Peaceful Spaces":
          return "Design environments that promote wellbeing";
        default:
          // Generic fallback
          const translatedGoalName = getTranslatedGoalName(goalName, currentLanguage);
          const translatedDomainName = getTranslatedDomainName(domain.name, currentLanguage);
          return `Focus on ${translatedGoalName.toLowerCase()} to improve ${translatedDomainName.toLowerCase()}`;
      }
    }
  };
  
  // Start continuous pulse animation for the sparkle icon
  useEffect(() => {
    // Create and start the continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        Animated.timing(iconPulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);
  
  // Show tap prompt after message completes
  useEffect(() => {
    if (messageComplete && !goalsVisible) {
      Animated.timing(tapPromptOpacity, {
        toValue: 1,
        duration: 300,
        delay: 200,
        useNativeDriver: true
      }).start();
    } else {
      tapPromptOpacity.setValue(0);
    }
  }, [messageComplete, goalsVisible]);
  
  // Handle message completion
  const handleMessageComplete = () => {
    setMessageComplete(true);
  };
  
  // Handle screen tap - this is the key function
  const handleScreenTap = () => {
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // If message is still typing, complete it immediately
    if (!messageComplete && typingRef.current) {
      typingRef.current.complete();
      return;
    }
    
    // If message is complete, proceed to next step
    if (messageComplete) {
      // Hide tap prompt
      Animated.timing(tapPromptOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }).start();
      
      if (messageStep === 1) {
        // Transition to second message
        Animated.timing(messageTextOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }).start(() => {
          setMessageStep(2);
          setMessageComplete(false);
          Animated.timing(messageTextOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true
          }).start();
        });
      } else if (messageStep === 2) {
        // Show goals after second message
        Animated.timing(messageOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start(() => {
          setGoalsVisible(true);
          
          // Fade in container
          Animated.timing(goalsContainerOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true
          }).start();
          
          // Staggered animation for each goal
          Animated.stagger(
            150,
            goalAnimations.map(anim =>
              Animated.spring(anim, {
                toValue: 1,
                friction: 8,
                tension: 50,
                useNativeDriver: true
              })
            )
          ).start();
        });
      }
    }
  };
  
  // Show confirmation when goal is selected
  useEffect(() => {
    if (selectedGoal && !showConfirmation) {
      setShowConfirmation(true);
      
      // Animate in the confirmation
      Animated.parallel([
        Animated.timing(confirmationOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.timing(confirmationY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true
        })
      ]).start();
      
      // Hide the info message when a goal is selected
      Animated.timing(infoMessageOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        setShowInfoMessage(false);
      });
    } else if (!selectedGoal && showConfirmation) {
      // Hide confirmation when goal is deselected
      Animated.parallel([
        Animated.timing(confirmationOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(confirmationY, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true
        })
      ]).start(() => {
        setShowConfirmation(false);
        
        // Show the info message again when no goal is selected
        setShowInfoMessage(true);
        Animated.timing(infoMessageOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }).start();
      });
    }
  }, [selectedGoal]);
  
  // Handle goal selection
  const handleGoalSelect = (goal, index) => {
    // Check if the goal is already selected - if so, deselect it
    if (selectedGoal && selectedGoal.name === goal.name) {
      // Deselecting logic
      try {
        // Provide deselection haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
      
      // Animate checkmark disappearing
      Animated.timing(checkmarkScales[index], {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
      
      // Reset the card animation
      Animated.parallel([
        Animated.timing(cardScales[index], {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(cardRotations[index], {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
      
      // Reset all cards to normal state
      goals.forEach((_, i) => {
        Animated.timing(goalAnimations[i], {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }).start();
      });
      
      // Clear the selection
      setSelectedCardIndex(null);
      setSelectedGoal(null);
      return;
    }
    
    // Selection logic - this goal is being newly selected
    try {
      // Provide selection haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // Update selected card index for styling
    setSelectedCardIndex(index);
    
    // Reset all card animations first
    resetCardAnimations();
    
    // Animate the selected card
    Animated.sequence([
      // First: Quick pulse and rotate animation
      Animated.parallel([
        // Scale up quickly
        Animated.timing(cardScales[index], {
          toValue: 1.05,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
        // Slight rotation
        Animated.timing(cardRotations[index], {
          toValue: 0.015, // Very subtle rotation (about 0.86 degrees)
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        })
      ]),
      
      // Then: Settle back with subtle bounce
      Animated.parallel([
        Animated.spring(cardScales[index], {
          toValue: 1.02,
          friction: 5,
          tension: 40,
          useNativeDriver: true
        }),
        Animated.spring(cardRotations[index], {
          toValue: 0,
          friction: 5,
          tension: 40,
          useNativeDriver: true
        })
      ])
    ]).start();
    
    // Reset all checkmark animations
    goals.forEach((_, i) => {
      if (i !== index) {
        checkmarkScales[i].setValue(0);
        checkmarkRotations[i].setValue(-1);
      }
    });
    
    // Animate checkmark appearing for the selected card
    checkmarkScales[index].setValue(0);
    checkmarkRotations[index].setValue(-1);
    
    Animated.parallel([
      Animated.spring(checkmarkScales[index], {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true
      }),
      Animated.timing(checkmarkRotations[index], {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true
      })
    ]).start();
    
    // Animate non-selected cards
    goals.forEach((_, i) => {
      if (i !== index) {
        // Slightly fade and move down non-selected cards
        Animated.timing(goalAnimations[i], {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true
        }).start();
      } else {
        // Ensure the selected card is fully opaque
        Animated.timing(goalAnimations[i], {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }).start();
      }
    });
    
    // Update selected goal
    setSelectedGoal(goal);
  };
  
  // Reset card animations
  const resetCardAnimations = () => {
    goals.forEach((_, i) => {
      cardScales[i].setValue(1);
      cardRotations[i].setValue(0);
    });
  };
  
  // Handle confirm button press
  const handleConfirm = () => {
    if (selectedGoal) {
      try {
        // Provide selection haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
      
      onGoalSelected(selectedGoal);
    }
  };
  
  // Get personalized confirmation message based on goal
  const getGoalConfirmationMessage = (goal, domainName) => {
    if (!goal) return "";
    
    // In Japanese mode, we should use different messages
    if (currentLanguage === 'ja') {
      // For Japanese, we will use more generic messages based on the goal explanation
      const goalExplanation = getTranslatedGoalExplanation(goal.name, 'ja');
      if (goalExplanation) {
        // Return the first sentence of the goal explanation as the confirmation message
        const firstSentence = goalExplanation.split('。')[0] + '。';
        return firstSentence;
      }
      
      // Fallback for Japanese if no explanation found
      return `「${getTranslatedGoalName(goal.name, 'ja')}」を選択することで、${getTranslatedDomainName(domainName, 'ja')}の分野での進歩を加速させることができます。`;
    }
    
    // English messages - using the original implementation
    // First check by domain and goal name
    const key = `${domainName}-${goal.name}`;
    
    switch (key) {
      // Career & Work Domain
      case "Career & Work-Career Advancement":
        return "Great choice! Focusing on career advancement will help you identify promotion opportunities and develop the skills needed to reach your professional potential.";
      case "Career & Work-Work-Life Balance":
        return "Excellent decision! Establishing better work-life balance will reduce burnout and increase your overall productivity and satisfaction both at work and home.";
      case "Career & Work-Skill Development":
        return "Perfect! Deliberately developing new skills will make you more valuable in your career and open doors to exciting opportunities you haven't even considered yet.";
      
      // Health & Wellness Domain
      case "Health & Wellness-Regular Exercise":
        return "Great choice! Establishing a consistent exercise routine will boost your energy levels, improve your mood, and significantly enhance your overall health.";
      case "Health & Wellness-Improved Nutrition":
        return "Excellent decision! Better nutrition will fuel your body properly, leading to increased energy, better concentration, and long-term health benefits.";
      case "Health & Wellness-Better Sleep Habits":
        return "Perfect! Improving your sleep quality will enhance your mental clarity, emotional resilience, and physical recovery - affecting every aspect of your life positively.";
      
      // Relationships Domain
      case "Relationships-Quality Time":
        return "Great choice! Dedicating quality time to important relationships will deepen your connections and create meaningful memories that last a lifetime.";
      case "Relationships-Improved Communication":
        return "Excellent decision! Enhancing your communication skills will help resolve conflicts more effectively and create more authentic, satisfying relationships.";
      case "Relationships-Building New Connections":
        return "Perfect! Expanding your social circle will introduce you to diverse perspectives and potentially create valuable relationships that enrich your life.";
      
      // Personal Growth Domain
      case "Personal Growth-Learning New Skills":
        return "Great choice! Learning new skills outside your profession will expand your capabilities and bring a sense of accomplishment that carries over to all areas of life.";
      case "Personal Growth-Reading More":
        return "Excellent decision! Regular reading will expand your knowledge, improve your vocabulary, and give you valuable insights that can transform your thinking.";
      case "Personal Growth-Mindfulness Practice":
        return "Perfect! Developing a mindfulness practice will help you stay present, reduce stress, and respond more thoughtfully to life's challenges rather than reacting automatically.";
      
      // Financial Security Domain
      case "Financial Security-Emergency Fund":
        return "Great choice! Building an emergency fund will provide peace of mind and protect you from unexpected financial setbacks that could derail your progress.";
      case "Financial Security-Debt Reduction":
        return "Excellent decision! Systematically reducing debt will free up your resources and create more options for your future financial decisions.";
      case "Financial Security-Retirement Planning":
        return "Perfect! Taking retirement planning seriously now will compound over time, potentially giving you more freedom and security in your later years.";
      
      // Recreation & Leisure Domain
      case "Recreation & Leisure-New Hobby":
        return "Great choice! Developing a new hobby will bring joy, creative fulfillment, and a refreshing break from your daily responsibilities.";
      case "Recreation & Leisure-Travel":
        return "Excellent decision! Planning travel experiences will broaden your perspective, create lasting memories, and give you something exciting to look forward to.";
      case "Recreation & Leisure-Creative Expression":
        return "Perfect! Making time for creative expression will tap into different parts of your brain, reduce stress, and provide a meaningful outlet for self-expression.";
      
      // Purpose & Meaning Domain
      case "Purpose & Meaning-Spiritual Practice":
        return "Great choice! Developing a spiritual practice will help you connect with something larger than yourself and find deeper meaning in everyday experiences.";
      case "Purpose & Meaning-Service to Others":
        return "Excellent decision! Serving others creates a sense of purpose and perspective while making a tangible difference in the world around you.";
      case "Purpose & Meaning-Finding Life Purpose":
        return "Perfect! Clarifying your life purpose will help align your daily actions with your core values, bringing a greater sense of fulfillment and direction.";
      
      // Environment & Organization Domain
      case "Environment & Organization-Home Organization":
        return "Great choice! Organizing your living spaces will reduce daily stress, save you time looking for things, and create a more peaceful environment.";
      case "Environment & Organization-Daily Routines":
        return "Excellent decision! Optimizing your daily routines will help you use your time more effectively and create space for what truly matters to you.";
      case "Environment & Organization-Creating Peaceful Spaces":
        return "Perfect! Designing more peaceful surroundings will reduce mental clutter and provide the right environment for you to thrive in all areas of life.";
      
      // Fallback for any goals not explicitly covered
      default:
        // Look for partial matches by goal name only as fallback
        if (goal.name.includes("Career Advancement")) {
          return "Great choice! Focusing on career advancement will help you identify promotion opportunities and develop the skills needed to reach your professional potential.";
        } else if (goal.name.includes("Work-Life Balance")) {
          return "Excellent decision! Establishing better work-life balance will reduce burnout and increase your overall productivity and satisfaction both at work and home.";
        } else if (goal.name.includes("Exercise")) {
          return "Great choice! Establishing a consistent exercise routine will boost your energy levels, improve your mood, and significantly enhance your overall health.";
        } else if (goal.name.includes("Nutrition")) {
          return "Excellent decision! Better nutrition will fuel your body properly, leading to increased energy, better concentration, and long-term health benefits.";
        } else if (goal.name.includes("Communication")) {
          return "Excellent decision! Enhancing your communication skills will help resolve conflicts more effectively and create more authentic, satisfying relationships.";
        } else if (goal.name.includes("Learning")) {
          return "Great choice! Learning new skills will expand your capabilities and bring a sense of accomplishment that carries over to all areas of life.";
        }
        
        // Generic fallback that still sounds personal
        return `Great choice! Focusing on ${goal.name.toLowerCase()} will help you make meaningful progress in your ${domainName.toLowerCase()} and create positive momentum.`;
    }
  };
  
  // Get the title for the navigation header with proper translation
  const getHeaderTitle = () => {
    const translatedDomain = getTranslatedDomainName(domain.name, currentLanguage);
    return t('title', 'goal', { domain: translatedDomain });
  };
  
  return (
    <View style={styles.container}>
      <NavigationHeader 
        title={getHeaderTitle()} 
        onBack={onBack} 
        iconName={domain.icon}
        iconColor={domain.color}
      />
      
      {/* Full-screen touchable overlay - Modified to fix back button issues */}
      {!goalsVisible && (
        <TouchableOpacity
          style={styles.fullScreenTouchable}
          activeOpacity={1}
          onPress={handleScreenTap}
          // This is the key change - allow touches to pass through to components beneath
          pointerEvents="box-none"
        >
          {/* This touchable covers the entire screen except the header */}
        </TouchableOpacity>
      )}
      
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          showConfirmation && { paddingBottom: 200 } // Increased bottom padding
        ]}
        showsVerticalScrollIndicator={false}
        pointerEvents={!goalsVisible ? "none" : "auto"} // Make ScrollView non-interactive during messages
      >
        {/* AI Message - Single container that changes content */}
        {!goalsVisible && (
          <Animated.View style={[styles.messageContainer, { opacity: messageOpacity }]}>
            <View style={styles.iconContainer}>
              <Animated.View 
                style={[
                  styles.iconCircle,
                  { transform: [{ scale: iconPulse }] }
                ]}
              >
                <Ionicons name="sparkles" size={18} color="#FFD700" />
              </Animated.View>
            </View>
            <Animated.View style={[styles.messageTextContainer, { opacity: messageTextOpacity }]}>
              <TypingAnimation
                ref={typingRef}
                key={messageStep} // Force re-render when step changes
                text={getCurrentMessage()}
                typingSpeed={30}
                onComplete={handleMessageComplete}
              />
            </Animated.View>
          </Animated.View>
        )}
        
        {/* Goal Cards */}
        {goalsVisible && (
          <Animated.View style={[styles.goalsContainer, { opacity: goalsContainerOpacity }]}>
            {goals.map((goal, index) => {
              // Check if this is the selected card
              const isSelected = selectedCardIndex === index;
              const translatedGoalName = getTranslatedGoalName(goal.name, currentLanguage);
              
              return (
                <Animated.View 
                  key={goal.name}
                  style={[
                    styles.goalCardWrapper,
                    { 
                      opacity: goalAnimations[index],
                      transform: [
                        { 
                          translateY: goalAnimations[index].interpolate({
                            inputRange: [0, 0.9, 1],
                            outputRange: [20, 5, 0]
                          })
                        },
                        { scale: cardScales[index] },
                        { 
                          rotateZ: cardRotations[index].interpolate({
                            inputRange: [-1, 0, 1],
                            outputRange: ['-10deg', '0deg', '10deg']
                          })
                        }
                      ]
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.goalCard,
                      isSelected && {
                        backgroundColor: `${domain.color}15`,
                        borderColor: domain.color
                      }
                    ]}
                    onPress={() => handleGoalSelect(goal, index)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.goalCardContent}>
                      <View style={styles.goalIconRow}>
                        <View 
                          style={[
                            styles.goalIconContainer,
                            { backgroundColor: domain.color }
                          ]}
                        >
                          <Ionicons 
                            name={goal.icon || "flag-outline"} 
                            size={24} 
                            color="#FFFFFF" 
                          />
                        </View>
                        
                        {/* Checkmark - now using per-card animations */}
                        <Animated.View 
                          style={[
                            styles.selectedCheckmark,
                            {
                              opacity: checkmarkScales[index],
                              transform: [
                                { scale: checkmarkScales[index] },
                                { 
                                  rotate: checkmarkRotations[index].interpolate({
                                    inputRange: [-1, 0],
                                    outputRange: ['-45deg', '0deg']
                                  })
                                }
                              ]
                            }
                          ]}
                        >
                          <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
                        </Animated.View>
                      </View>
                      
                      <ResponsiveText style={styles.goalName}>
                        {translatedGoalName}
                      </ResponsiveText>
                      
                      {/* Description - Fixed to properly handle Japanese */}
                      {currentLanguage === 'ja' ? (
                        <Text style={styles.goalDescription}>
                          {getShortGoalDescription(goal.name)}
                        </Text>
                      ) : (
                        <ResponsiveText style={styles.goalDescription}>
                          {goal.description || getShortGoalDescription(goal.name)}
                        </ResponsiveText>
                      )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.View>
        )}
      </ScrollView>
      
      {/* Central Tap to Continue Prompt */}
      {!goalsVisible && messageComplete && (
        <Animated.View 
          style={[
            styles.centralTapPrompt,
            { opacity: tapPromptOpacity }
          ]}
          pointerEvents="none"
        >
          <ResponsiveText style={styles.tapPromptText}>
            {t('tapToContinue', 'common')}
          </ResponsiveText>
          <Ionicons 
            name="chevron-down" 
            size={24} 
            color="rgba(255,255,255,0.7)" 
            style={styles.tapPromptIcon} 
          />
        </Animated.View>
      )}
      
      {/* Info Message at Bottom */}
      {goalsVisible && showInfoMessage && (
        <Animated.View 
          style={[
            styles.infoMessageContainer,
            { opacity: infoMessageOpacity }
          ]}
        >
          <Ionicons 
            name="information-circle-outline" 
            size={18} 
            color="rgba(255,255,255,0.6)" 
            style={styles.infoIcon} 
          />
          <ResponsiveText style={styles.infoMessageText}>
  {currentLanguage === 'ja' 
    ? "このガイドは用意された目標を使用してアプリの機能を紹介します。後で完全にカスタマイズされた目標を作成できます。"
    : "This walkthrough uses preset goals to show you how the app works. You'll have full freedom to create your own goals later."
  }
</ResponsiveText>
        </Animated.View>
      )}
      
      {/* Sticky Bottom Bar with Confirmation Message and CTA Button */}
      {showConfirmation && selectedGoal && (
        <Animated.View 
          style={[
            styles.stickyBottomContainer,
            {
              opacity: confirmationOpacity,
              transform: [{ translateY: confirmationY.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 100]
              }) }]
            }
          ]}
        >
          {/* Confirmation Message */}
          <View 
            style={[
              styles.confirmationContainer,
              { borderColor: domain.color }
            ]}
          >
            <ResponsiveText style={styles.confirmationText}>
              {getGoalConfirmationMessage(selectedGoal, domain.name)}
            </ResponsiveText>
          </View>
          
          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              { backgroundColor: domain.color }
            ]}
            onPress={handleConfirm}
            disabled={isNavigating}
          >
            <ResponsiveText style={styles.confirmButtonText}>
              {t('continueWith', 'common', { item: t('goal', 'common') })}
            </ResponsiveText>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c1425',
  },
  fullScreenTouchable: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10, // Ensure it's below the NavigationHeader which has zIndex 20
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'ios' ? 90 : 70, // Add top padding to avoid overlap with header
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 15,
  },
  messageContainer: {
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    marginTop: 10,
    flexDirection: 'row',
    borderLeftWidth: 2,
    borderLeftColor: '#3b82f6',
    zIndex: 5, // Lower than the touchable but higher than other elements
  },
  iconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  messageTextContainer: {
    flex: 1,
  },
  centralTapPrompt: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9, // Lower than the touchable but visible
  },
  tapPromptText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  tapPromptIcon: {
    marginTop: -4,
  },
  goalsContainer: {
    marginBottom: 20,
    marginTop: 5,
  },
  goalCardWrapper: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  goalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  goalIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
  },
  goalCardContent: {
    padding: 20,
  },
  stickyBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24, // More padding at bottom for iOS safe area
    backgroundColor: 'rgba(12, 20, 37, 0.98)', // Slightly transparent background that matches the app background
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  confirmationContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  confirmationText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  infoMessageContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoMessageText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  }
});

export default GoalSelectionPage;
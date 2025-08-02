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
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [selectedClarification, setSelectedClarification] = useState(null);
  
  // Get 3 goals from the domain
  const goals = domain.goals.slice(0, 3);
  
  // Helper function to convert goal name to proper sentence form
  const convertGoalToSentence = (goalName) => {
    // Convert goal names to proper sentence form for grammar
    const conversions = {
      'Learn Practical Life Skill': 'Learning a practical life skill',
      'Build Better Relationship': 'Building a better relationship',
      'Start Regular Exercise': 'Starting regular exercise',
      'Develop New Career Skill': 'Developing a new career skill',
      'Create Financial Plan': 'Creating a financial plan',
      'Learn New Creative Hobby': 'Learning a new creative hobby',
      'Improve Time Management': 'Improving time management',
      'Start Meditation Practice': 'Starting a meditation practice',
      'Learn Programming Language': 'Learning a programming language',
      'Build Professional Network': 'Building a professional network',
      'Develop Leadership Skills': 'Developing leadership skills',
      'Start Side Business': 'Starting a side business',
      'Improve Health Habits': 'Improving health habits',
      'Learn Musical Instrument': 'Learning a musical instrument',
      'Build Emergency Fund': 'Building an emergency fund',
      'Develop Public Speaking': 'Developing public speaking skills',
      'Start Investment Portfolio': 'Starting an investment portfolio',
      'Learn Foreign Language': 'Learning a foreign language',
      'Improve Work-Life Balance': 'Improving work-life balance',
      'Build Home Organization': 'Building better home organization',
      'Live Sustainably/Zero-Waste': 'Living sustainably and reducing waste',
      'Master Work-Life Balance': 'Mastering work-life balance',
      'Build Career-Advancing Skills': 'Building career-advancing skills',
      'Find Purpose-Driven Work': 'Finding purpose-driven work',
      'Master In-Demand Tech Skills': 'Mastering in-demand tech skills',
      'Achieve 3.5%+ Salary Increase': 'Achieving a 3.5%+ salary increase',
      'Secure Flexible Work Arrangement': 'Securing flexible work arrangements',
      'Get Significant Salary Increase': 'Getting a significant salary increase',
      'Build High-Value Digital Skills': 'Building high-value digital skills',
      'Secure Flexible Work with New Skills': 'Securing flexible work with new skills',
      'Move into Management Role': 'Moving into a management role',
      'Switch to Tech Career': 'Switching to a tech career',
      'Master Quality Sleep': 'Mastering quality sleep',
      'Build Fitness Routine': 'Building a fitness routine',
      'Get Regular Mental Health Support': 'Getting regular mental health support',
      'Develop Sustainable Mental Health Practices': 'Developing sustainable mental health practices',
      'Build Functional Strength and Mobility': 'Building functional strength and mobility',
      'Establish Preventive Health Optimization': 'Establishing preventive health optimization',
      'Complete First 5K Run': 'Completing your first 5K run',
      'Reduce Alcohol Consumption': 'Reducing alcohol consumption',
      'Exercise for Mental Health': 'Exercising for mental health',
      'Prevent Chronic Disease': 'Preventing chronic disease',
      'Build Strong Friendships': 'Building strong friendships',
      'Find Long-Term Partner': 'Finding a long-term partner',
      'Strengthen Family Relationships': 'Strengthening family relationships',
      'Master Textual Chemistry': 'Mastering textual chemistry',
      'Build Budget-Friendly Romance': 'Building budget-friendly romance',
      'Beat the Loneliness Epidemic': 'Beating the loneliness epidemic',
      'Move in with Partner': 'Moving in with your partner',
      'Find Quality Romantic Connection': 'Finding a quality romantic connection',
      'Build Strong Social Circle': 'Building a strong social circle',
      'Strengthen Romantic Relationship': 'Strengthening your romantic relationship'
    };
    
    return conversions[goalName] || goalName.toLowerCase();
  };
  
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
  
  // Modal animations
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;
  const modalOptionsAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0), 
    new Animated.Value(0)
  ]).current;

  // Icon animations - for the sparkle icon
  const iconPulse = useRef(new Animated.Value(1)).current;

  // Get current message based on step
  const getCurrentMessage = () => {
    const translatedDomainName = getTranslatedDomainName(domain.name, currentLanguage);
    
    switch(messageStep) {
      case 1:
        return t('initialMessage', 'goal', { domain: translatedDomainName });
      case 2:
        return t('dontWorry', 'goal');
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
      
      // If clarification modal is open, close it
      if (showClarificationModal) {
        setShowClarificationModal(false);
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
      setSelectedClarification(null);
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
    
    // Don't automatically open clarification modal anymore
    // Let the user see the personalized message first, then click the button to choose focus area
  };
  
  // Reset card animations
  const resetCardAnimations = () => {
    goals.forEach((_, i) => {
      cardScales[i].setValue(1);
      cardRotations[i].setValue(0);
    });
  };

  // Show clarification modal
  const openClarificationModal = () => {
    setShowClarificationModal(true);
    
    // Reset modal option animations
    modalOptionsAnimations.forEach(anim => anim.setValue(0));
    
    // Animate modal in
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.spring(modalScale, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true
      })
    ]).start(() => {
      // Stagger animate option cards
      Animated.stagger(
        100,
        modalOptionsAnimations.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true
          })
        )
      ).start();
    });
  };

  // Close clarification modal
  const closeClarificationModal = () => {
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(modalScale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      setShowClarificationModal(false);
      setSelectedClarification(null);
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
      
      // Check if goal needs clarification and no focus area is selected
      if (selectedGoal.needsClarification && !selectedClarification) {
        // Show clarification modal if not already shown
        if (!showClarificationModal) {
          openClarificationModal();
        }
        return;
      }
      
      // If we have a clarification selected, update the goal with specific projects/tasks
      const goalToPass = selectedClarification 
        ? { 
            ...selectedGoal, 
            name: selectedClarification.name, 
            originalName: selectedGoal.name, // Keep reference to original for fallback
            projects: selectedClarification.projects || selectedGoal.projects, // Use clarification-specific projects if available
            selectedClarification 
          }
        : selectedGoal;
      
      onGoalSelected(goalToPass);
    }
  };
  
  // Get highly specific and relevant icons for each focus area
  const getIconForFocusArea = (focusAreaName) => {
    const name = focusAreaName.toLowerCase();
    
    // Very specific technology/security focus areas
    if (name.includes('cybersecurity') || name.includes('security') || name.includes('protection') || name.includes('privacy')) return 'shield-checkmark';
    if (name.includes('software development') || name.includes('app development') || name.includes('programming')) return 'construct';
    if (name.includes('digital marketing') || name.includes('analytics') || name.includes('data analysis')) return 'analytics';
    if (name.includes('artificial intelligence') || name.includes('ai') || name.includes('machine learning')) return 'hardware-chip';
    if (name.includes('web development') || name.includes('website') || name.includes('frontend')) return 'globe';
    if (name.includes('database') || name.includes('data management') || name.includes('sql')) return 'server';
    if (name.includes('cloud') || name.includes('aws') || name.includes('azure')) return 'cloud';
    if (name.includes('mobile') || name.includes('ios') || name.includes('android')) return 'phone-portrait';
    if (name.includes('blockchain') || name.includes('crypto') || name.includes('bitcoin')) return 'link';
    if (name.includes('ui/ux') || name.includes('user experience') || name.includes('interface')) return 'desktop';
    
    // Career advancement with specific icons
    if (name.includes('leadership') || name.includes('management') || name.includes('team lead')) return 'people';
    if (name.includes('entrepreneurship') || name.includes('startup') || name.includes('business owner')) return 'rocket';
    if (name.includes('sales') || name.includes('business development') || name.includes('client')) return 'trending-up';
    if (name.includes('project management') || name.includes('scrum') || name.includes('agile')) return 'list';
    if (name.includes('consulting') || name.includes('advisory') || name.includes('strategy')) return 'bulb';
    if (name.includes('networking') || name.includes('professional network')) return 'people-circle';
    if (name.includes('public speaking') || name.includes('presentation') || name.includes('conference')) return 'mic';
    
    // Exercise with specific activities
    if (name.includes('weightlifting') || name.includes('strength training') || name.includes('powerlifting')) return 'barbell';
    if (name.includes('running') || name.includes('marathon') || name.includes('cardio')) return 'bicycle';
    if (name.includes('yoga') || name.includes('pilates') || name.includes('flexibility')) return 'leaf';
    if (name.includes('swimming') || name.includes('pool') || name.includes('water')) return 'water';
    if (name.includes('hiking') || name.includes('climbing') || name.includes('mountains')) return 'trail-sign';
    if (name.includes('boxing') || name.includes('martial arts') || name.includes('fighting')) return 'fitness';
    if (name.includes('cycling') || name.includes('biking') || name.includes('bike')) return 'bicycle';
    if (name.includes('team sports') || name.includes('basketball') || name.includes('soccer')) return 'football';
    
    // Learning with specific subjects
    if (name.includes('language learning') || name.includes('spanish') || name.includes('french') || name.includes('foreign language')) return 'chatbubble';
    if (name.includes('music') || name.includes('guitar') || name.includes('piano') || name.includes('instrument')) return 'musical-note';
    if (name.includes('photography') || name.includes('photo') || name.includes('camera')) return 'camera';
    if (name.includes('cooking') || name.includes('culinary') || name.includes('chef') || name.includes('baking')) return 'restaurant';
    if (name.includes('writing') || name.includes('creative writing') || name.includes('author')) return 'create';
    if (name.includes('art') || name.includes('painting') || name.includes('drawing') || name.includes('creative')) return 'brush';
    if (name.includes('dance') || name.includes('dancing') || name.includes('choreography')) return 'musical-notes';
    if (name.includes('investing') || name.includes('stock market') || name.includes('trading')) return 'trending-up';
    if (name.includes('real estate') || name.includes('property') || name.includes('housing')) return 'home';
    
    // Reading with specific genres
    if (name.includes('fiction') || name.includes('novels') || name.includes('fantasy') || name.includes('sci-fi')) return 'library';
    if (name.includes('biography') || name.includes('history') || name.includes('non-fiction')) return 'book';
    if (name.includes('self-help') || name.includes('personal development') || name.includes('motivation')) return 'trending-up';
    if (name.includes('business books') || name.includes('professional') || name.includes('industry')) return 'briefcase';
    if (name.includes('technical') || name.includes('manual') || name.includes('documentation')) return 'document-text';
    
    // Health and wellness specific
    if (name.includes('nutrition') || name.includes('diet') || name.includes('healthy eating')) return 'nutrition';
    if (name.includes('mental health') || name.includes('therapy') || name.includes('counseling')) return 'heart';
    if (name.includes('meditation') || name.includes('mindfulness') || name.includes('zen')) return 'leaf';
    if (name.includes('sleep') || name.includes('rest') || name.includes('recovery')) return 'bed';
    
    // Financial specific
    if (name.includes('budgeting') || name.includes('expense tracking') || name.includes('money management')) return 'calculator';
    if (name.includes('saving') || name.includes('emergency fund') || name.includes('savings')) return 'wallet';
    if (name.includes('debt') || name.includes('loans') || name.includes('credit')) return 'card';
    if (name.includes('retirement') || name.includes('401k') || name.includes('pension')) return 'time';
    
    // Relationship specific
    if (name.includes('dating') || name.includes('romantic') || name.includes('partner')) return 'heart';
    if (name.includes('family') || name.includes('parenting') || name.includes('children')) return 'home';
    if (name.includes('friendship') || name.includes('social') || name.includes('community')) return 'people';
    
    // Travel specific
    if (name.includes('international') || name.includes('abroad') || name.includes('countries')) return 'airplane';
    if (name.includes('adventure') || name.includes('backpacking') || name.includes('exploration')) return 'compass';
    if (name.includes('road trip') || name.includes('driving') || name.includes('car travel')) return 'car';
    
    // Creative and hobbies
    if (name.includes('gardening') || name.includes('plants') || name.includes('flowers')) return 'flower';
    if (name.includes('woodworking') || name.includes('carpentry') || name.includes('building')) return 'hammer';
    if (name.includes('knitting') || name.includes('sewing') || name.includes('crafts')) return 'cut';
    if (name.includes('gaming') || name.includes('video games') || name.includes('esports')) return 'game-controller';
    
    // Generic fallbacks (broader categories)
    if (name.includes('technology') || name.includes('tech') || name.includes('digital')) return 'laptop';
    if (name.includes('health') || name.includes('wellness') || name.includes('medical')) return 'medical';
    if (name.includes('work') || name.includes('job') || name.includes('office') || name.includes('career')) return 'briefcase';
    if (name.includes('education') || name.includes('learning') || name.includes('study')) return 'school';
    if (name.includes('communication') || name.includes('speaking') || name.includes('talking')) return 'chatbubble';
    if (name.includes('creativity') || name.includes('artistic') || name.includes('creative')) return 'color-palette';
    if (name.includes('productivity') || name.includes('organization') || name.includes('efficiency')) return 'checkmark-circle';
    if (name.includes('spiritual') || name.includes('religion') || name.includes('faith')) return 'flower';
    
    // Default fallback
    return 'star';
  };

  // Handle focus area selection
  const handleFocusAreaSelect = (clarificationOption) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    setSelectedClarification(clarificationOption);
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
      case "Career & Work-Master Work-Life Balance":
        return "Excellent goal! Mastering work-life balance will reduce stress, improve relationships, and create sustainable success in both personal and professional areas.";
      case "Career & Work-Build Career-Advancing Skills":
        return "Smart choice! Building career-advancing skills will increase your value in the job market, open new opportunities, and accelerate your professional growth.";
      case "Career & Work-Find Purpose-Driven Work":
        return "Inspiring decision! Finding purpose-driven work will increase job satisfaction, align your career with your values, and create more meaningful daily experiences.";
      case "Career & Work-Master In-Demand Tech Skills":
        return "Excellent choice! Mastering in-demand tech skills will future-proof your career, increase earning potential, and open doors to exciting opportunities.";
      case "Career & Work-Achieve 3.5%+ Salary Increase":
        return "Smart goal! Achieving a significant salary increase will improve your financial security, validate your professional growth, and boost confidence.";
      case "Career & Work-Secure Flexible Work Arrangement":
        return "Great decision! Securing flexible work arrangements will improve work-life balance, reduce commuting stress, and increase overall job satisfaction.";
      case "Career & Work-Get Significant Salary Increase":
        return "Excellent goal! Getting a significant salary increase will improve your financial situation, reflect your increased value, and motivate continued growth.";
      case "Career & Work-Build High-Value Digital Skills":
        return "Wise choice! Building high-value digital skills will make you indispensable, increase earning potential, and prepare you for the future economy.";
      case "Career & Work-Secure Flexible Work with New Skills":
        return "Smart goal! Securing flexible work through new skills will combine career advancement with lifestyle improvement for optimal work-life integration.";
      case "Career & Work-Move into Management Role":
        return "Excellent decision! Moving into management will develop leadership skills, increase earning potential, and expand your career opportunities significantly.";
      case "Career & Work-Switch to Tech Career":
        return "Bold choice! Switching to a tech career will open high-paying opportunities, provide job security, and position you in a growing industry.";
      
      // Health & Wellness Domain
      case "Health & Wellness-Regular Exercise":
        return "Great choice! Establishing a consistent exercise routine will boost your energy levels, improve your mood, and significantly enhance your overall health.";
      case "Health & Wellness-Improved Nutrition":
        return "Excellent decision! Better nutrition will fuel your body properly, leading to increased energy, better concentration, and long-term health benefits.";
      case "Health & Wellness-Better Sleep Habits":
        return "Perfect! Improving your sleep quality will enhance your mental clarity, emotional resilience, and physical recovery - affecting every aspect of your life positively.";
      case "Health & Wellness-Master Quality Sleep":
        return "Excellent choice! Mastering quality sleep will improve cognitive function, boost immune system, and enhance physical recovery for better overall performance.";
      case "Health & Wellness-Build Fitness Routine":
        return "Great decision! Building a fitness routine will increase energy, improve mood, strengthen your body, and create a foundation for long-term health.";
      case "Health & Wellness-Get Regular Mental Health Support":
        return "Wise choice! Getting regular mental health support will improve emotional resilience, provide coping strategies, and enhance your overall quality of life.";
      case "Health & Wellness-Develop Sustainable Mental Health Practices":
        return "Important goal! Developing sustainable mental health practices will build emotional resilience, reduce stress, and improve your ability to handle life's challenges.";
      case "Health & Wellness-Build Functional Strength and Mobility":
        return "Smart choice! Building functional strength and mobility will improve daily activities, prevent injuries, and maintain independence as you age.";
      case "Health & Wellness-Establish Preventive Health Optimization":
        return "Excellent decision! Establishing preventive health optimization will catch issues early, reduce future healthcare costs, and maintain long-term wellness.";
      case "Health & Wellness-Complete First 5K Run":
        return "Fantastic goal! Completing your first 5K run will build cardiovascular fitness, boost confidence, and provide a sense of accomplishment.";
      case "Health & Wellness-Reduce Alcohol Consumption":
        return "Great choice! Reducing alcohol consumption will improve sleep quality, increase energy, support liver health, and enhance overall wellbeing.";
      case "Health & Wellness-Exercise for Mental Health":
        return "Excellent decision! Exercising for mental health will reduce anxiety and depression, boost mood, and provide natural stress relief.";
      case "Health & Wellness-Prevent Chronic Disease":
        return "Smart goal! Focusing on chronic disease prevention will improve long-term health outcomes, reduce healthcare costs, and increase quality of life.";
      
      // Relationships Domain
      case "Relationships-Quality Time":
        return "Great choice! Dedicating quality time to important relationships will deepen your connections and create meaningful memories that last a lifetime.";
      case "Relationships-Improved Communication":
        return "Excellent decision! Enhancing your communication skills will help resolve conflicts more effectively and create more authentic, satisfying relationships.";
      case "Relationships-Building New Connections":
        return "Perfect! Expanding your social circle will introduce you to diverse perspectives and potentially create valuable relationships that enrich your life.";
      case "Relationships-Build Strong Friendships":
        return "Wonderful choice! Building strong friendships will provide emotional support, increase happiness, and create a reliable network of people who care about you.";
      case "Relationships-Find Long-Term Partner":
        return "Great goal! Finding a long-term partner will bring companionship, emotional support, and the joy of building a life together with someone special.";
      case "Relationships-Strengthen Family Relationships":
        return "Excellent decision! Strengthening family relationships will create deeper bonds, improve communication, and build a stronger support system for life's challenges.";
      case "Relationships-Master Textual Chemistry":
        return "Smart choice! Mastering textual chemistry will improve your dating success, enhance digital communication skills, and help you build better connections online.";
      case "Relationships-Build Budget-Friendly Romance":
        return "Wise goal! Building budget-friendly romance will show that meaningful connections don't require expensive gestures and will develop creativity in relationships.";
      case "Relationships-Beat the Loneliness Epidemic":
        return "Important choice! Beating loneliness will improve mental health, increase life satisfaction, and help you build the social connections essential for wellbeing.";
      case "Relationships-Move in with Partner":
        return "Exciting decision! Moving in with your partner will deepen your relationship, share life experiences more intimately, and take an important step toward commitment.";
      case "Relationships-Find Quality Romantic Connection":
        return "Excellent goal! Finding a quality romantic connection will bring love, companionship, and emotional fulfillment while enriching your life experience.";
      case "Relationships-Build Strong Social Circle":
        return "Great choice! Building a strong social circle will provide emotional support, increase opportunities, and create a sense of belonging and community.";
      case "Relationships-Strengthen Romantic Relationship":
        return "Wonderful decision! Strengthening your romantic relationship will increase intimacy, improve communication, and build a stronger foundation for your future together.";
      
      // Personal Growth Domain
      case "Personal Growth-Learning New Skills":
        return "Great choice! Learning new skills outside your profession will expand your capabilities and bring a sense of accomplishment that carries over to all areas of life.";
      case "Personal Growth-Reading More":
        return "Excellent decision! Regular reading will expand your knowledge, improve your vocabulary, and give you valuable insights that can transform your thinking.";
      case "Personal Growth-Mindfulness Practice":
        return "Perfect! Developing a mindfulness practice will help you stay present, reduce stress, and respond more thoughtfully to life's challenges rather than reacting automatically.";
      case "Personal Growth-Learn Data Analytics":
        return "Excellent choice! Learning data analytics will make you more valuable in the job market, improve decision-making skills, and open doors to high-paying career opportunities.";
      case "Personal Growth-Start Creative Side Hustle":
        return "Fantastic goal! Starting a creative side hustle will provide additional income, develop entrepreneurial skills, and give you a fulfilling outlet for creativity.";
      case "Personal Growth-Learn AI/Machine Learning":
        return "Smart decision! Learning AI and machine learning will position you at the forefront of technology, increase your earning potential, and future-proof your career.";
      case "Personal Growth-Master Digital Literacy and AI Tools":
        return "Wise choice! Mastering digital literacy and AI tools will make you more efficient, increase your value in the workplace, and prepare you for the future economy.";
      case "Personal Growth-Achieve French Language Proficiency":
        return "Excellent goal! Achieving French proficiency will open cultural and career opportunities, improve cognitive function, and enhance your connection to Canadian culture.";
      case "Personal Growth-Obtain Professional Certifications":
        return "Smart choice! Obtaining professional certifications will validate your skills, increase earning potential, and demonstrate commitment to career advancement.";
      case "Personal Growth-Learn New Language":
        return "Wonderful decision! Learning a new language will enhance cognitive function, open cultural opportunities, and make you more valuable in the global marketplace.";
      case "Personal Growth-Master Public Speaking":
        return "Excellent choice! Mastering public speaking will boost confidence, advance your career, and help you communicate ideas more effectively in all areas of life.";
      case "Personal Growth-Build Financial Knowledge":
        return "Smart goal! Building financial knowledge will help you make better money decisions, build wealth more effectively, and achieve financial independence faster.";
      case "Personal Growth-Earn Professional Certification":
        return "Great decision! Earning professional certification will validate your expertise, increase earning potential, and demonstrate your commitment to excellence.";
      case "Personal Growth-Launch Creative Project":
        return "Inspiring choice! Launching a creative project will provide a fulfilling outlet for self-expression, potentially generate income, and build valuable skills.";
      case "Personal Growth-Learn Practical Life Skill":
        return "Excellent decision! Learning practical life skills will increase self-reliance, save money, and give you confidence to handle various life situations independently.";
      
      // Financial Security Domain
      case "Financial Security-Emergency Fund":
        return "Great choice! Building an emergency fund will provide peace of mind and protect you from unexpected financial setbacks that could derail your progress.";
      case "Financial Security-Debt Reduction":
        return "Excellent decision! Systematically reducing debt will free up your resources and create more options for your future financial decisions.";
      case "Financial Security-Retirement Planning":
        return "Perfect! Taking retirement planning seriously now will compound over time, potentially giving you more freedom and security in your later years.";
      case "Financial Security-Build 6-Month Emergency Fund":
        return "Excellent goal! Building a 6-month emergency fund will provide substantial financial security, reduce stress, and give you confidence to take calculated risks.";
      case "Financial Security-Pay Off High-Interest Debt":
        return "Smart choice! Paying off high-interest debt will save you significant money over time, improve your credit score, and free up cash flow for other goals.";
      case "Financial Security-Start Long-Term Investing":
        return "Wise decision! Starting long-term investing will harness the power of compound growth and build wealth for your future financial independence.";
      case "Financial Security-Build $15,000 Emergency Fund":
        return "Fantastic goal! Building a $15,000 emergency fund will provide substantial financial security and peace of mind for major unexpected expenses.";
      case "Financial Security-Save $25,000 Down Payment for Home":
        return "Excellent choice! Saving for a home down payment will build discipline, reduce future mortgage costs, and move you closer to homeownership.";
      case "Financial Security-Pay Off $10,000 Student Debt":
        return "Great decision! Paying off student debt will eliminate monthly payments, reduce financial stress, and free up money for other important goals.";
      case "Financial Security-Save for House Deposit":
        return "Smart goal! Saving for a house deposit will require discipline but will significantly reduce your future mortgage burden and interest payments.";
      case "Financial Security-Build Emergency Fund":
        return "Wise choice! Building an emergency fund will provide financial security, reduce stress about unexpected expenses, and prevent debt accumulation.";
      case "Financial Security-Maximize ISA Savings":
        return "Excellent decision! Maximizing ISA savings will help you save tax-efficiently while building wealth and taking advantage of government incentives.";
      case "Financial Security-Start Profitable Side Hustle":
        return "Fantastic choice! Starting a profitable side hustle will diversify your income, develop new skills, and accelerate your path to financial independence.";
      case "Financial Security-Plan Path to Homeownership":
        return "Smart goal! Planning your path to homeownership will help you make informed decisions, avoid mistakes, and achieve this major financial milestone efficiently.";
      
      // Recreation & Leisure Domain
      case "Recreation & Leisure-New Hobby":
        return "Great choice! Developing a new hobby will bring joy, creative fulfillment, and a refreshing break from your daily responsibilities.";
      case "Recreation & Leisure-Travel":
        return "Excellent decision! Planning travel experiences will broaden your perspective, create lasting memories, and give you something exciting to look forward to.";
      case "Recreation & Leisure-Creative Expression":
        return "Perfect! Making time for creative expression will tap into different parts of your brain, reduce stress, and provide a meaningful outlet for self-expression.";
      case "Recreation & Leisure-Plan Solo Adventure Travel":
        return "Exciting choice! Planning solo adventure travel will build confidence, create unforgettable memories, and give you the freedom to explore at your own pace.";
      case "Recreation & Leisure-Explore Wellness Activities":
        return "Wonderful decision! Exploring wellness activities will improve your physical and mental health while helping you discover new passions and stress-relief methods.";
      case "Recreation & Leisure-Explore Local Culture":
        return "Great choice! Exploring local culture will deepen your connection to your community, discover hidden gems, and gain new appreciation for your surroundings.";
      case "Recreation & Leisure-Explore Canada Through Epic Adventures":
        return "Amazing goal! Exploring Canada through epic adventures will create incredible memories, build confidence, and help you discover the beauty of your home country.";
      case "Recreation & Leisure-Master Four-Season Outdoor Activities":
        return "Fantastic choice! Mastering four-season outdoor activities will keep you active year-round, build resilience, and help you embrace Canada's unique climate.";
      case "Recreation & Leisure-Create Through Hobby Renaissance":
        return "Inspiring decision! Creating through a hobby renaissance will reignite your creativity, provide stress relief, and give you multiple outlets for self-expression.";
      case "Recreation & Leisure-Complete Active Challenge Events":
        return "Excellent goal! Completing active challenge events will push your physical limits, build mental toughness, and create a sense of accomplishment and community.";
      case "Recreation & Leisure-Explore UK Heritage Sites":
        return "Wonderful choice! Exploring UK heritage sites will deepen your cultural knowledge, create memorable experiences, and connect you with your country's rich history.";
      case "Recreation & Leisure-Develop Creative Hobby":
        return "Great decision! Developing a creative hobby will provide stress relief, enhance problem-solving skills, and give you a fulfilling outlet for self-expression.";
      case "Recreation & Leisure-Explore Australian Nature":
        return "Amazing choice! Exploring Australian nature will connect you with incredible landscapes, build appreciation for the environment, and create unforgettable adventures.";
      case "Recreation & Leisure-Travel Around Australia":
        return "Fantastic goal! Traveling around Australia will broaden your perspective, create lifelong memories, and help you discover the diverse beauty of your home country.";
      case "Recreation & Leisure-Develop New Hobby":
        return "Excellent choice! Developing a new hobby will bring joy to your routine, help you meet like-minded people, and provide a creative outlet outside of work.";
      
      // Purpose & Meaning Domain
      case "Purpose & Meaning-Spiritual Practice":
        return "Great choice! Developing a spiritual practice will help you connect with something larger than yourself and find deeper meaning in everyday experiences.";
      case "Purpose & Meaning-Service to Others":
        return "Excellent decision! Serving others creates a sense of purpose and perspective while making a tangible difference in the world around you.";
      case "Purpose & Meaning-Finding Life Purpose":
        return "Perfect! Clarifying your life purpose will help align your daily actions with your core values, bringing a greater sense of fulfillment and direction.";
      case "Purpose & Meaning-Volunteer in Community":
        return "Wonderful choice! Volunteering in your community will create meaningful connections, develop new skills, and make a positive impact while enriching your own life.";
      case "Purpose & Meaning-Align Work with Values":
        return "Excellent decision! Aligning your work with your values will increase job satisfaction, reduce internal conflict, and create a more fulfilling career path.";
      case "Purpose & Meaning-Live More Sustainably":
        return "Great choice! Living more sustainably will align your daily actions with environmental values while often saving money and improving your health.";
      case "Purpose & Meaning-Lead Climate Action Initiative":
        return "Inspiring goal! Leading climate action will create meaningful environmental impact while developing leadership skills and connecting you with like-minded individuals.";
      case "Purpose & Meaning-Build Purpose-Driven Side Business":
        return "Fantastic choice! Building a purpose-driven side business will combine financial goals with meaningful impact while developing entrepreneurial skills.";
      case "Purpose & Meaning-Use Skills for Community Volunteering":
        return "Perfect decision! Using your professional skills for volunteering will maximize your impact, advance your career, and create a sense of meaningful contribution.";
      case "Purpose & Meaning-Volunteer Using Professional Skills":
        return "Excellent choice! Volunteering with your professional skills will amplify your impact, build your network, and add meaningful purpose to your career development.";
      case "Purpose & Meaning-Reduce Environmental Impact":
        return "Great decision! Reducing your environmental impact will align your lifestyle with your values while often saving money and improving your health.";
      case "Purpose & Meaning-Take Community Leadership Role":
        return "Wonderful goal! Taking a community leadership role will develop your leadership skills, create positive change, and build valuable networks and relationships.";
      case "Purpose & Meaning-Find Purpose-Driven Work":
        return "Inspiring choice! Finding purpose-driven work will increase job satisfaction, create meaningful impact, and align your career with your deepest values.";
      case "Purpose & Meaning-Get Involved in Local Community":
        return "Excellent decision! Getting involved in your local community will create meaningful connections, develop new skills, and make a positive impact where you live.";
      
      // Environment & Organization Domain
      case "Environment & Organization-Home Organization":
        return "Great choice! Organizing your living spaces will reduce daily stress, save you time looking for things, and create a more peaceful environment.";
      case "Environment & Organization-Daily Routines":
        return "Excellent decision! Optimizing your daily routines will help you use your time more effectively and create space for what truly matters to you.";
      case "Environment & Organization-Creating Peaceful Spaces":
        return "Perfect! Designing more peaceful surroundings will reduce mental clutter and provide the right environment for you to thrive in all areas of life.";
      case "Environment & Organization-Live Sustainably/Zero-Waste":
        return "Excellent choice! Living sustainably and reducing waste will help you align your daily actions with your environmental values while creating a healthier planet for future generations.";
      case "Environment & Organization-Buy First Home":
        return "Fantastic goal! Buying your first home will build equity, provide stability, and give you a space to truly call your own while establishing a foundation for long-term wealth.";
      case "Environment & Organization-Organize Living Space":
        return "Great choice! Organizing your living space will improve your daily efficiency, reduce stress, and create a more peaceful environment for relaxation and productivity.";
      case "Environment & Organization-Create Eco-Friendly Home":
        return "Excellent decision! Creating an eco-friendly home will reduce your environmental impact, lower utility costs, and provide a healthier living environment for you and your family.";
      case "Environment & Organization-Create Affordable Home Office Space":
        return "Smart choice! Setting up an affordable home office will boost your productivity, improve work-life boundaries, and potentially increase your earning potential.";
      case "Environment & Organization-Navigate Path to Homeownership":
        return "Wise goal! Learning about homeownership will help you make informed decisions, avoid costly mistakes, and build a clear roadmap to achieving this major milestone.";
      case "Environment & Organization-Build Eco-Conscious Living Space":
        return "Perfect choice! Building an eco-conscious living space will align your environment with your values while creating a healthier, more sustainable lifestyle.";
      case "Environment & Organization-Create Home Office Setup":
        return "Excellent decision! Creating a proper home office setup will increase your productivity, improve your professional presence, and enhance your work-from-home experience.";
      case "Environment & Organization-Improve Home Energy Efficiency":
        return "Smart goal! Improving your home's energy efficiency will reduce utility bills, increase property value, and minimize your environmental footprint.";
      case "Environment & Organization-Live Zero-Waste Lifestyle":
        return "Inspiring choice! Living a zero-waste lifestyle will dramatically reduce your environmental impact while often saving money and creating mindful consumption habits.";
      case "Environment & Organization-Find Quality Shared Housing":
        return "Practical choice! Finding quality shared housing will help you save money, build social connections, and live in a better location while maintaining financial flexibility.";
      case "Environment & Organization-Create Organized Living Space":
        return "Great decision! Creating an organized living space will save you time daily, reduce stress, and create a more peaceful environment that supports your other goals.";
      
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
        
        // Generic fallback with proper grammar
        const goalSentence = convertGoalToSentence(goal.name);
        return `Great choice! ${goalSentence.charAt(0).toUpperCase() + goalSentence.slice(1)} will help you make meaningful progress in your ${domainName.toLowerCase()} journey and create positive momentum.`;
    }
  };
  
  // Get the title for the navigation header with proper translation and abbreviation for long names
  const getHeaderTitle = () => {
    let translatedDomain = getTranslatedDomainName(domain.name, currentLanguage);
    
    // Abbreviate long domain names for header display to prevent overlap with icon
    if (currentLanguage === 'en') {
      if (translatedDomain === 'Environment & Organization') {
        translatedDomain = 'Environment & Org';
      } else if (translatedDomain === 'Financial Security') {
        translatedDomain = 'Financial';
      } else if (translatedDomain === 'Recreation & Leisure') {
        translatedDomain = 'Recreation';
      }
    } else if (currentLanguage === 'ja') {
      // Keep Japanese translations as is since they're typically shorter
      // Could add specific abbreviations here if needed
    }
    
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
          
          {/* Continue Button - show for all selected goals */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              { backgroundColor: domain.color }
            ]}
            onPress={selectedGoal?.needsClarification ? openClarificationModal : handleConfirm}
            disabled={isNavigating}
          >
            <ResponsiveText style={styles.confirmButtonText}>
              {selectedGoal?.needsClarification 
                ? 'Choose Focus Area'
                : t('continueWith', 'common', { item: t('goal', 'common') })
              }
            </ResponsiveText>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {/* Enhanced Clarification Modal */}
      {showClarificationModal && selectedGoal && selectedGoal.clarificationOptions && (
        <Animated.View 
          style={[
            styles.clarificationModalContainer,
            { opacity: modalOpacity }
          ]}
        >
          <Animated.View 
            style={[
              styles.clarificationModal,
              { 
                transform: [{ scale: modalScale }],
                borderColor: domain.color
              }
            ]}
          >
            {/* Modal Header */}
            <View style={styles.clarificationHeader}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={closeClarificationModal}
              >
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <View style={styles.headerContent}>
                <View style={[styles.modalIconContainer, { backgroundColor: domain.color }]}>
                  <Ionicons 
                    name={selectedGoal.icon || "flag-outline"} 
                    size={20} 
                    color="#FFFFFF" 
                  />
                </View>
                <ResponsiveText style={styles.clarificationTitle}>
                  {selectedGoal.name}
                </ResponsiveText>
              </View>
            </View>
            
            {/* Subtitle */}
            <ResponsiveText style={styles.clarificationSubtitle}>
              {convertGoalToSentence(selectedGoal.name)} can mean different things. Which area would you like to focus on?
            </ResponsiveText>
            
            {/* Options */}
            <ScrollView 
              style={styles.clarificationScrollView}
              showsVerticalScrollIndicator={false}
            >
              {selectedGoal.clarificationOptions.map((option, index) => (
                <Animated.View
                  key={option.id}
                  style={[
                    styles.optionWrapper,
                    {
                      opacity: modalOptionsAnimations[index],
                      transform: [
                        {
                          translateY: modalOptionsAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0]
                          })
                        }
                      ]
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.clarificationOption,
                      selectedClarification?.id === option.id && [
                        styles.clarificationOptionSelected,
                        { 
                          borderColor: domain.color,
                          backgroundColor: `${domain.color}15`
                        }
                      ]
                    ]}
                    onPress={() => handleFocusAreaSelect(option)}
                    activeOpacity={0.8}
                  >
                    {/* Icon */}
                    <View style={[
                      styles.optionIconContainer,
                      { 
                        backgroundColor: selectedClarification?.id === option.id 
                          ? domain.color 
                          : 'rgba(255, 255, 255, 0.15)'
                      }
                    ]}>
                      <Ionicons 
                        name={getIconForFocusArea(option.name)} 
                        size={20} 
                        color={selectedClarification?.id === option.id ? "#FFFFFF" : "#CCCCCC"} 
                      />
                    </View>
                    
                    {/* Content */}
                    <View style={styles.clarificationOptionContent}>
                      <Text style={[
                        styles.clarificationOptionName,
                        selectedClarification?.id === option.id && { color: domain.color }
                      ]}>
                        {option.name}
                      </Text>
                      <Text style={styles.clarificationOptionDescription}>
                        {option.description}
                      </Text>
                    </View>
                    
                    {/* Selected indicator */}
                    {selectedClarification?.id === option.id && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons name="checkmark-circle" size={24} color={domain.color} />
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
            
            {/* Confirm Button */}
            <TouchableOpacity
              style={[
                styles.clarificationConfirmButton,
                { backgroundColor: domain.color },
                !selectedClarification && { opacity: 0.5 }
              ]}
              onPress={() => {
                if (selectedClarification) {
                  closeClarificationModal();
                  // Small delay to let modal close before proceeding
                  setTimeout(() => handleConfirm(), 200);
                }
              }}
              disabled={!selectedClarification || isNavigating}
            >
              <ResponsiveText style={styles.clarificationConfirmButtonText}>
                Continue with Focus Area
              </ResponsiveText>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
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
  },
  clarificationModalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  clarificationModal: {
    backgroundColor: '#0c1425',
    borderRadius: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  clarificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  clarificationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  clarificationSubtitle: {
    fontSize: 16,
    color: '#999999',
    padding: 20,
    paddingTop: 15,
    paddingBottom: 15,
    lineHeight: 22,
  },
  clarificationScrollView: {
    maxHeight: 300,
    paddingHorizontal: 20,
  },
  clarificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  clarificationOptionSelected: {
    borderWidth: 2,
  },
  clarificationOptionContent: {
    flex: 1,
  },
  clarificationOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  clarificationOptionDescription: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
  },
  clarificationConfirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    margin: 20,
    marginTop: 15,
  },
  clarificationConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  // Enhanced Modal Styles
  clarificationModalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  clarificationModal: {
    backgroundColor: '#0c1425',
    borderRadius: 20,
    margin: 20,
    maxHeight: '90%',
    minHeight: '70%',
    width: '90%',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  clarificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clarificationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  clarificationSubtitle: {
    fontSize: 16,
    color: '#E5E5E5',
    padding: 20,
    paddingTop: 15,
    paddingBottom: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  clarificationScrollView: {
    maxHeight: 400,
    paddingHorizontal: 20,
    flex: 1,
  },
  optionWrapper: {
    marginBottom: 12,
  },
  clarificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  clarificationOptionSelected: {
    borderWidth: 2,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clarificationOptionContent: {
    flex: 1,
  },
  clarificationOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  clarificationOptionDescription: {
    fontSize: 14,
    color: '#BBBBBB',
    lineHeight: 20,
  },
  selectedIndicator: {
    marginLeft: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clarificationConfirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    margin: 20,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  clarificationConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
});

export default GoalSelectionPage;
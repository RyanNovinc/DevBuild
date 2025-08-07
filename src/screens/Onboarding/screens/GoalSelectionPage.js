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
  
  // Helper function to get specific clarification message for each goal
  const getClarificationMessage = (goalName) => {
    const clarificationMessages = {
      // Australia
      'Switch to Tech Career': 'Technology careers span many specializations. Which area interests you most?',
      'Learn Practical Life Skill': 'There are many valuable life skills to master. Which would make the biggest impact for you?',
      'Develop New Hobby': 'Hobbies can be creative, social, or active. What type of hobby appeals to you?',
      'Find Purpose-Driven Work': 'Purpose-driven work takes many forms. Which area aligns with your values?',
      
      // USA
      'Build Career-Advancing Skills': 'Career advancement requires different skills depending on your path. Which area would benefit you most?',
      'Start Creative Side Hustle': 'Creative side hustles can take many forms. What type of creative work interests you?',
      'Learn AI/Machine Learning': 'AI and machine learning have many applications. Which area would you like to focus on?',
      
      // Canada
      'Master In-Demand Tech Skills': 'Canada\'s tech sector offers many growth areas. Which skills would advance your career?',
      'Achieve French Language Proficiency': 'French proficiency can be developed in different ways. What\'s your learning style preference?',
      'Obtain Professional Certifications': 'Professional certifications vary by industry and career stage. Which area would benefit you most?',
      'Master Four-Season Outdoor Activities': 'Canada offers incredible outdoor opportunities year-round. Which activities would you like to master?',
      'Build Purpose-Driven Side Business': 'Purpose-driven businesses can create impact in many ways. Which area matters most to you?',
      
      // UK  
      'Build High-Value Digital Skills': 'Digital skills are essential across industries. Which area would advance your career most?',
      'Learn New Language': 'Language learning opens many doors. Which language and approach suits your goals?',
      'Develop Creative Hobby': 'Creative pursuits offer many paths for expression and growth. What type of creativity appeals to you?',
      'Reduce Environmental Impact': 'Environmental action can take many forms. Which approach fits your lifestyle and values?',
      
      // India
      'Move into Management Role': 'Management positions require different skills and focus areas. Which leadership path interests you most?',
      
      // Multi-country goals (South Africa, Nigeria, Malaysia, New Zealand)
      'Increase Income Streams': 'Multiple income sources can be developed in different ways. Which approach fits your skills and situation best?',
      'Learn New Skill': 'There are many valuable skills to develop. Which area would create the most impact for your goals?',
      'Pursue Creative Hobby': 'Creative pursuits offer many paths for expression and growth. What type of creativity appeals to you?'
    };
    
    return clarificationMessages[goalName] || `${goalName} has several approaches. Which area would you like to focus on?`;
  };
  
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
      'Strengthen Romantic Relationship': 'Strengthening your romantic relationship',
      // Financial Goals
      'Build 6-Month Emergency Fund': 'Building a 6-month emergency fund',
      'Build $15,000 Emergency Fund': 'Building a $15,000 emergency fund',
      'Pay Off High-Interest Debt': 'Paying off high-interest debt',
      'Start Long-Term Investing': 'Starting long-term investing',
      // Personal Growth Goals
      'Earn Professional Certification': 'Earning professional certification',
      'Master Digital Literacy and AI Tools': 'Mastering digital literacy and AI tools',
      'Achieve French Language Proficiency': 'Achieving French language proficiency',
      'Obtain Professional Certifications': 'Obtaining professional certifications',
      'Learn High-Value Skill': 'Learning a high-value skill',
      'Master Public Speaking': 'Mastering public speaking',
      // Recreation & Travel Goals
      'Explore Australian Nature': 'Exploring Australian nature',
      'Travel Around Australia': 'Traveling around Australia',
      'Develop New Hobby': 'Developing a new hobby',
      'Plan Solo Adventure Travel': 'Planning solo adventure travel',
      'Explore Wellness Activities': 'Exploring wellness activities',
      'Explore Local Culture': 'Exploring local culture',
      'Master Four-Season Outdoor Activities': 'Mastering four-season outdoor activities',
      'Create Through Hobby Renaissance': 'Creating through hobby renaissance',
      'Explore Canada Through Epic Adventures': 'Exploring Canada through epic adventures',
      'Travel More': 'Traveling more',
      'Plan Dream Wedding': 'Planning your dream wedding',
      // Environment & Organization Goals
      'Find Quality Shared Housing': 'Finding quality shared housing',
      'Create Organized Living Space': 'Creating an organized living space',
      'Buy First Home': 'Buying your first home',
      'Organize Living Space': 'Organizing your living space',
      'Create Eco-Friendly Home': 'Creating an eco-friendly home',
      'Create Affordable Home Office Space': 'Creating an affordable home office space',
      'Plan Path to Homeownership': 'Planning a path to homeownership',
      'Navigate Path to Homeownership': 'Navigating a path to homeownership',
      'Build Eco-Conscious Living Space': 'Building an eco-conscious living space',
      // Purpose & Meaning Goals
      'Volunteer Using Professional Skills': 'Volunteering using professional skills',
      'Get Involved in Local Community': 'Getting involved in local community',
      'Lead Climate Action Initiative': 'Leading a climate action initiative',
      'Build Purpose-Driven Side Business': 'Building a purpose-driven side business',
      'Use Skills for Community Volunteering': 'Using skills for community volunteering',
      'Volunteer in Community': 'Volunteering in community',
      'Align Work with Values': 'Aligning work with values',
      'Live More Sustainably': 'Living more sustainably',
      'Give Back to Community': 'Giving back to community',
      // Additional Goals
      'Start Profitable Side Hustle': 'Starting a profitable side hustle',
      'Explore Nigerian Culture': 'Exploring Nigerian culture'
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
        // Show goals after first message - skip second message
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
      case "Career & Work-Start Profitable Side Business":
        return "Entrepreneurial spirit! Starting a profitable side business will create additional income streams, build business skills, and provide financial security through diversification.";
      case "Career & Work-Advance to Management Role":
        return "Leadership potential! Advancing to management will increase your earning power, develop valuable leadership skills, and position you for executive opportunities.";
      
      // Health & Wellness Domain
      case "Health & Wellness-Regular Exercise":
        return "Great choice! Establishing a consistent exercise routine will boost your energy levels, improve your mood, and significantly enhance your overall health.";
      case "Health & Wellness-Build Fitness Routine":
        return "Smart goal! Building a fitness routine will increase your energy, improve professional performance, and provide essential stress relief during challenging times.";
      case "Health & Wellness-Improve Mental Health":
        return "Wise choice! Improving mental health will enhance your decision-making, increase resilience, and provide the emotional strength needed for career and life success.";
      case "Health & Wellness-Optimize Nutrition":
        return "Excellent decision! Optimizing nutrition will boost your energy levels, improve mental clarity, and support peak performance in all areas of life.";
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
      case "Relationships-Build Strong Social Circle":
        return "Smart choice! Building a strong social circle will provide emotional support, create professional opportunities, and enrich your life with meaningful connections.";
      case "Relationships-Strengthen Family Bonds":
        return "Beautiful goal! Strengthening family bonds honors cultural values while creating the emotional foundation and practical support essential for life success.";
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
      case "Financial Security-Build Emergency Fund":
        return "Smart decision! Building an emergency fund with both naira and dollar components will protect you against economic uncertainty and currency volatility.";
      case "Financial Security-Start Investment Portfolio":
        return "Excellent choice! Starting an investment portfolio will help you build long-term wealth, protect against inflation, and create additional income streams.";
      case "Financial Security-Increase Income Streams":
        return "Strategic thinking! Developing multiple income streams will provide financial security, reduce risk, and accelerate your wealth-building goals.";
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
      
      // Indian specific messages
      case "Career & Work-Switch to Tech Career":
        return "Excellent choice! Tech careers in India offer exceptional growth opportunities with companies like TCS, Infosys, and thousands of startups creating high demand for skilled professionals.";
      case "Career & Work-Secure Flexible Work Agreement":
        return "Smart decision! Flexible work arrangements are becoming standard in Indian IT companies, offering better work-life balance while maintaining strong career growth potential.";
      case "Career & Work-Advance to Management Role":
        return "Great leadership goal! Management roles in India offer significant salary premiums and advancement opportunities in the rapidly growing corporate sector.";
      case "Financial Security-Build Emergency Fund":
        return "Wise financial choice! Emergency funds provide essential security and peace of mind, especially important given economic uncertainty and career transitions in India.";
      case "Financial Security-Start Investment Portfolio":
        return "Excellent wealth-building strategy! Investment portfolios help beat inflation and build long-term wealth through the power of compound growth in Indian equity markets.";
      case "Financial Security-Increase Income Streams":
        return "Smart diversification! Multiple income streams provide financial security and accelerate wealth building through freelancing, consulting, or business ventures alongside your main career.";
      case "Health & Wellness-Build Fitness Routine":
        return "Perfect health investment! Regular fitness routines provide energy, stress relief, and improved health outcomes that enhance both personal and professional performance.";
      case "Health & Wellness-Improve Mental Health":
        return "Important wellness priority! Mental health practices like meditation and stress management are essential for maintaining well-being in demanding professional environments.";
      case "Health & Wellness-Optimize Nutrition":
        return "Great health foundation! Proper nutrition provides sustained energy, better health outcomes, and improved physical and mental performance using traditional Indian foods.";
      case "Relationships-Plan Dream Wedding":
        return "Beautiful life milestone! Wedding planning involves balancing family expectations, cultural traditions, and personal preferences to create a memorable celebration.";
      case "Relationships-Strengthen Family Relationships":
        return "Meaningful relationship goal! Strong family relationships provide emotional support and stability while modern family structures allow for independence and personal growth.";
      case "Relationships-Improve Romantic Relationship":
        return "Important relationship investment! Strong romantic relationships require consistent effort, open communication, and quality time to maintain deep connection and mutual support.";
      case "Personal Growth-Master Public Speaking":
        return "Valuable skill development! Public speaking skills enhance professional presence and career advancement opportunities while building confidence in all communication scenarios.";
      case "Personal Growth-Learn New Skill":
        return "Excellent growth mindset! Continuous learning and skill development keep you competitive in the job market while providing personal satisfaction and fulfillment.";
      case "Personal Growth-Read More Books":
        return "Great intellectual investment! Regular reading expands knowledge, improves vocabulary and communication skills, and provides relaxation and mental stimulation.";
      case "Recreation & Leisure-Travel More":
        return "Wonderful life enrichment! Travel provides cultural exposure, personal growth, and memorable experiences while offering opportunities to relax and recharge from work demands.";
      case "Recreation & Leisure-Pursue Creative Hobby":
        return "Perfect stress relief! Creative hobbies offer personal fulfillment, artistic expression, and healthy outlets for creativity outside of professional responsibilities.";
      case "Recreation & Leisure-Enjoy Recreation Time":
        return "Essential life balance! Regular recreation time is crucial for mental health, stress relief, and maintaining overall life balance and personal happiness.";
      case "Purpose & Meaning-Give Back to Community":
        return "Noble purpose! Community involvement provides meaning and impact while making positive differences for others and strengthening social connections.";
      case "Purpose & Meaning-Find Life Purpose":
        return "Deep personal journey! Understanding your life purpose provides direction for major decisions and creates motivation for pursuing meaningful goals.";
      case "Purpose & Meaning-Practice Mindfulness":
        return "Wise wellness practice! Mindfulness reduces stress, improves focus, and enhances emotional well-being through greater awareness of thoughts and feelings.";
      case "Environment & Organization-Organize Living Space":
        return "Practical life improvement! An organized living space reduces daily stress, improves efficiency, and creates a peaceful environment that supports well-being.";
      case "Environment & Organization-Reduce Environmental Impact":
        return "Responsible environmental choice! Eco-friendly practices help protect the planet while often saving money through reduced consumption and waste.";
      case "Environment & Organization-Declutter and Simplify":
        return "Liberating lifestyle change! Decluttering creates more space, reduces stress, and helps focus on what truly matters by removing excess possessions.";
      
      // Irish specific messages
      case "Career & Work-Switch to Tech Career":
        return "Brilliant choice! Ireland's tech sector offers exceptional opportunities with Dublin hosting Google, Facebook, Microsoft, and hundreds of innovative startups creating high-demand career paths.";
      case "Career & Work-Start Profitable Side Business":
        return "Entrepreneurial excellence! Ireland provides €50K startup grants and seamless EU market access to 500+ million customers, making side business success highly achievable.";
      case "Career & Work-Advance to Management Role":
        return "Leadership potential! Irish companies strongly prefer internal promotions with management roles offering 45% salary premiums and accelerated career advancement opportunities.";
      case "Financial Security-Build Emergency Fund":
        return "Smart financial foundation! Emergency funds provide crucial stability in Ireland's economy, with 5% savings rates and EU deposit protection supporting your financial security.";
      case "Financial Security-Start Investment Portfolio":
        return "Wealth-building wisdom! Irish and European markets deliver 8% annual returns with favorable tax treatment, making systematic investing ideal for long-term prosperity.";
      case "Financial Security-Increase Income Streams":
        return "Strategic diversification! Irish professionals with multiple income streams earn €65K versus €45K average, with freelancing and EU business access creating excellent opportunities.";
      case "Health & Wellness-Build Fitness Routine":
        return "Health investment! Regular exercise boosts work productivity by 68% for Irish professionals while reducing healthcare costs through Ireland's excellent indoor fitness infrastructure.";
      case "Health & Wellness-Improve Mental Health":
        return "Essential wellness priority! Irish professionals show 72% stress reduction through mental health practices, with 89% of employers now offering comprehensive support programs.";
      case "Health & Wellness-Optimize Nutrition":
        return "Energy foundation! Irish professionals report 62% higher energy through structured nutrition, with exceptional local food quality supporting optimal health and performance.";
      case "Relationships-Plan Dream Wedding":
        return "Wonderful milestone! Wedding planning in Ireland balances rich cultural traditions with personal preferences to create meaningful celebrations that honor both heritage and individuality.";
      case "Relationships-Strengthen Family Relationships":
        return "Important connection! Strong family bonds provide emotional support and stability while allowing for personal growth and independence in modern Irish family structures.";
      case "Relationships-Improve Romantic Relationship":
        return "Relationship investment! Strong partnerships require consistent effort and communication, with Ireland's excellent work-life balance (#2 in Europe) supporting quality relationship time.";
      case "Personal Growth-Master Public Speaking":
        return "Career enhancement! Communication skills are crucial in Ireland's relationship-focused business culture, with strong speaking abilities opening leadership and advancement opportunities.";
      case "Personal Growth-Learn New Skill":
        return "Growth mindset! Continuous learning keeps you competitive in Ireland's dynamic economy while providing personal satisfaction and expanded career possibilities.";
      case "Personal Growth-Read More Books":
        return "Intellectual enrichment! Regular reading expands knowledge and communication skills while providing relaxation and mental stimulation for well-rounded personal development.";
      case "Recreation & Leisure-Travel More":
        return "Adventure awaits! Ireland's EU membership provides seamless access to European destinations while Dublin ranks among top 3 European city break searches for excellent travel opportunities.";
      case "Recreation & Leisure-Pursue Creative Hobby":
        return "Creative fulfillment! Ireland's Creative Ireland Programme demonstrates that creative activities provide wellbeing benefits equivalent to employment while offering stress relief and self-expression.";
      case "Recreation & Leisure-Enjoy Recreation Time":
        return "Life balance essential! Regular recreation time supports mental health and personal happiness, with Ireland's €14 million investment in outdoor recreation providing excellent activity infrastructure.";
      case "Purpose & Meaning-Give Back to Community":
        return "Meaningful impact! Ireland has 700,000+ active volunteers making real differences in their communities, with volunteer work providing purpose and stronger community connections.";
      case "Purpose & Meaning-Find Life Purpose":
        return "Personal journey! Understanding your deeper values and life mission provides direction for important decisions and creates motivation for pursuing truly meaningful goals.";
      case "Purpose & Meaning-Practice Mindfulness":
        return "Wellness foundation! Mindfulness practices reduce stress, improve focus, and enhance emotional well-being through greater awareness and present-moment living.";
      case "Environment & Organization-Organize Living Space":
        return "Life improvement! An organized home reduces daily stress, improves efficiency, and creates a peaceful environment supporting overall well-being and productivity.";
      case "Environment & Organization-Reduce Environmental Impact":
        return "Responsible choice! Ireland's growing sustainability movement shows 64% of consumers purchase eco-friendly products, making environmental responsibility both impactful and socially supported.";
      case "Environment & Organization-Declutter and Simplify":
        return "Liberating lifestyle! Decluttering creates more space, reduces stress, and helps focus on what matters most by removing excess while embracing intentional, simpler living.";
      
      // Nigerian specific messages
      case "Career & Work-Switch to Tech Career":
        return "Exceptional opportunity! Nigeria's tech sector contributes ₦8.5 trillion to the economy with Lagos hosting 2,000+ startups, creating abundant high-paying opportunities for skilled professionals.";
      case "Career & Work-Start Profitable Side Business":
        return "Entrepreneurial excellence! Nigeria leads Africa with 22.5% of startup funding success, while 75% of employed professionals successfully run additional businesses alongside their careers.";
      case "Career & Work-Advance to Management Role":
        return "Leadership potential! Nigerian managers earn 60% salary premiums with corporate expansion creating 25% annual growth in management positions for professionals with leadership capabilities.";
      case "Financial Security-Build Emergency Fund":
        return "Financial wisdom! Emergency funds provide crucial stability during currency volatility, with Nigerian professionals achieving 70% better financial resilience through strategic savings approaches.";
      case "Financial Security-Start Investment Portfolio":
        return "Wealth-building strategy! The NSE delivers 45% annual returns for patient investors, with fintech platforms enabling portfolio building from just ₦5,000 minimum investments.";
      case "Financial Security-Increase Income Streams":
        return "Strategic diversification! Nigerian professionals with multiple income streams earn 180% more, with freelancers commanding $15-25/hour on international platforms while maintaining cost advantages.";
      case "Health & Wellness-Build Fitness Routine":
        return "Productivity investment! Regular exercise increases Nigerian professional productivity by 65% while providing 80% better stress management than sedentary approaches during economic challenges.";
      case "Health & Wellness-Improve Mental Health":
        return "Essential wellness priority! Mental health investment improves career performance by 85% for Nigerian professionals while building resilience essential for thriving during economic transformation.";
      case "Health & Wellness-Optimize Nutrition":
        return "Energy foundation! Strategic nutrition using traditional Nigerian ingredients provides 60% better value per naira while saving ₦50,000 monthly through structured meal planning approaches.";
      
      // Malaysian specific messages
      case "Career & Work-Switch to Tech Career":
        return "Tech hub advantage! Malaysia's digital economy contributes 24.3% to GDP with MSC hosting 3,000+ tech companies, offering RM320K average salaries and international career opportunities.";
      case "Career & Work-Start Profitable Side Business":
        return "Entrepreneurial success! Malaysian SMEs generate RM50 billion through e-commerce with 24% of adults successfully operating side businesses generating RM8K-25K monthly additional income.";
      case "Career & Work-Advance to Management Role":
        return "Leadership advancement! Malaysian managers earn 55% premiums with companies expanding management by 30% annually, creating abundant promotion opportunities for capable professionals.";
      case "Financial Security-Build Emergency Fund":
        return "Financial stability! Malaysian professionals maintain 90% purchasing power through strategic savings, with digital banks offering 5.5% interest rates providing inflation protection and growth.";
      case "Financial Security-Start Investment Portfolio":
        return "Investment success! Bursa Malaysia delivers 12% annual returns with robo-advisors enabling RM100 minimum investing, democratizing access to diversified wealth-building portfolios.";
      case "Financial Security-Increase Income Streams":
        return "Income diversification! Malaysian professionals with multiple streams earn 160% more, with freelancers commanding RM80-150/hour internationally while leveraging cost-of-living advantages.";
      case "Health & Wellness-Build Fitness Routine":
        return "Performance enhancement! Regular fitness increases Malaysian professional productivity by 70% with year-round climate enabling 85% higher exercise consistency and community support.";
      case "Health & Wellness-Improve Mental Health":
        return "Wellness investment! Stress management improves Malaysian professional performance by 80% with diverse cultural support networks providing 75% better stress reduction outcomes.";
      case "Health & Wellness-Optimize Nutrition":
        return "Nutritional advantage! Traditional Malaysian ingredients provide 65% better nutrition value per ringgit, with structured meal planning saving RM800 monthly while improving health outcomes.";
      
      // Philippine specific messages  
      case "Career & Work-Switch to Tech Career":
        return "Growth opportunity! Philippine IT-BPM contributes ₱2.18 trillion to GDP with 85% remote work availability, enabling international client access and premium USD compensation.";
      case "Career & Work-Start Profitable Side Business":
        return "Entrepreneurial spirit! Filipino professionals demonstrate exceptional business capability with 24% operating successful side businesses, leveraging bayanihan community support for sustainable growth.";
      case "Career & Work-Advance to Management Role":
        return "Leadership success! Philippine managers earn 50% premiums with companies expanding leadership by 35% annually, creating advancement opportunities in the growing economy.";
      case "Financial Security-Build Emergency Fund":
        return "Financial resilience! Philippine professionals with emergency funds show 75% better stability with digital banks offering 8% interest while peso-dollar strategies provide purchasing power protection.";
      case "Financial Security-Start Investment Portfolio":
        return "Wealth building! The PSE delivers 15% annual returns with fintech platforms enabling ₱1,000 minimum investing, making systematic wealth building accessible to all professionals.";
      case "Financial Security-Increase Income Streams":
        return "Income acceleration! Philippine professionals with multiple streams earn 180% more, with freelancers earning $12-25/hour internationally while maintaining Philippine cost advantages.";
      case "Health & Wellness-Build Fitness Routine":
        return "Productivity boost! Regular fitness increases Philippine professional productivity by 70% with tropical climate enabling 90% exercise consistency and strong community fitness culture.";
      case "Health & Wellness-Improve Mental Health":
        return "Wellness priority! Mental health investment improves Philippine professional performance by 85% with strong family support networks providing 80% stress reduction benefits.";
      case "Health & Wellness-Optimize Nutrition":
        return "Health foundation! Traditional Philippine foods provide 70% better nutrition per peso with structured planning saving ₱12,000 monthly while optimizing health outcomes.";
      
      // Singapore specific messages
      case "Career & Work-Switch to Tech Career":
        return "Hub excellence! Singapore's digital economy contributes S$106 billion with 90% of tech professionals accessing international opportunities and 45% salary premiums in the region.";
      case "Career & Work-Start Profitable Side Business":
        return "Startup success! Singapore hosts the highest density of unicorns per capita in Southeast Asia with government grants up to S$1 million and #2 global ease of doing business.";
      case "Career & Work-Advance to Management Role":
        return "Regional leadership! Singapore managers earn 55% premiums with regional headquarters expanding management by 40% annually, creating Asia-Pacific advancement opportunities.";
      case "Financial Security-Build Emergency Fund":
        return "Financial stability! Singapore professionals with emergency funds show 85% better crisis resilience with 4.5% savings rates and multi-currency strategies providing purchasing power protection.";
      case "Financial Security-Start Investment Portfolio":
        return "Investment access! Singapore's STI delivers 10% annual returns with robo-advisors enabling S$100 minimum investing and CPF voluntary contributions providing 30% higher retirement savings.";
      case "Financial Security-Increase Income Streams":
        return "Premium earnings! Singapore professionals with multiple streams earn 170% more, commanding S$150-300/hour consulting rates while REIT portfolios generate S$2K+ monthly passive income.";
      case "Health & Wellness-Build Fitness Routine":
        return "Performance optimization! Regular fitness increases Singapore professional productivity by 80% with world-class 350km park connector network enabling 95% exercise consistency.";
      case "Health & Wellness-Improve Mental Health":
        return "Wellness excellence! Mental health prioritization improves Singapore professional performance by 90% with multicultural support networks reducing stress by 75% in diverse environments.";
      case "Health & Wellness-Optimize Nutrition":
        return "Nutritional diversity! Singapore's multicultural cuisine provides 80% better nutrition variety per dollar with structured planning saving S$800 monthly while optimizing health performance.";
      
      // South African specific messages
      case "Career & Work-Switch to Tech Career":
        return "Growth potential! South Africa's ICT sector contributes R204 billion with 80% remote work access enabling international USD/EUR compensation while maintaining cost advantages.";
      case "Career & Work-Start Profitable Side Business":
        return "Ubuntu entrepreneurship! South African SMMEs contribute R2.3 trillion to GDP with community-based businesses achieving 85% higher success rates through collaborative Ubuntu principles.";
      case "Career & Work-Advance to Management Role":
        return "Leadership opportunity! South African managers earn 70% premiums with corporate transformation creating 45% annual management position growth for capable professionals.";
      case "Financial Security-Build Emergency Fund":
        return "Financial resilience! South African professionals with emergency funds show 90% better crisis management with 11% savings rates and currency diversification providing purchasing power protection.";
      case "Financial Security-Start Investment Portfolio":
        return "Wealth creation! The JSE delivers 18% annual returns with platforms enabling R500 minimum investing and TFSA strategies providing 35% higher after-tax wealth accumulation.";
      case "Financial Security-Increase Income Streams":
        return "Income multiplication! South African professionals with multiple streams earn 200% more, with freelancers earning $20-45/hour internationally while leveraging favorable exchange rates.";
      case "Health & Wellness-Build Fitness Routine":
        return "Performance enhancement! Regular fitness increases South African professional productivity by 85% with year-round climate enabling 100% exercise consistency and strong community culture.";
      case "Health & Wellness-Improve Mental Health":
        return "Wellness foundation! Mental health investment improves South African professional performance by 95% with Ubuntu community support reducing stress by 85% through interconnected networks.";
      case "Health & Wellness-Optimize Nutrition":
        return "Health optimization! Indigenous South African foods provide 75% better nutrition per rand with structured planning saving R2,500 monthly while supporting local food systems.";
      
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
              {getClarificationMessage(selectedGoal.name)}
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
    bottom: '20%',
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
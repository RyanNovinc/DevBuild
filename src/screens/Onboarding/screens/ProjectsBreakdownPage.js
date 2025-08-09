// src/screens/Onboarding/screens/ProjectsBreakdownPage.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Easing,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ResponsiveText from '../components/ResponsiveText';
import TypingAnimation from '../components/TypingAnimation';
import NavigationHeader from '../components/NavigationHeader';
import AnimatedConfetti from '../components/AnimatedConfetti';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from '../context/I18nContext';

const { width, height } = Dimensions.get('window');

/**
 * ProjectsBreakdownPage - New streamlined onboarding experience
 */
const ProjectsBreakdownPage = ({ domain, goal, onContinue, onBack, onConfettiStart, isNavigating = false }) => {
  // Get translation function from I18n context
  const { t, currentLanguage } = useI18n();
  
  // Log the current language for debugging
  console.log("Current language:", currentLanguage);
  
  // Helper function for more readable translation calls
  const translate = (namespace, key, params = {}) => {
    const result = t(key, namespace, params);
    console.log(`Translation lookup: ${namespace}.${key} => ${result}`);
    return result;
  };
  
  // Create title for projects page - handle long goal names with line breaks
  const getProjectsTitle = () => {
    if (!goal || !goal.name) {
      return currentLanguage === 'ja' ? 'プロジェクトとタスク' : 'Breakdown';
    }
    
    // For very long goal names, format them nicely for 2-line display
    let goalName = goal.name;
    
    // Remove bracketed descriptions from goal names
    goalName = goalName.replace(/\s*\([^)]*\)/g, '');
    
    // Shorten some common long goal names for better display
    const abbreviations = {
      'Community & Environment': 'Community & Environment',
      'Build 6-Month Emergency Fund': 'Emergency Fund',
      'Pay Off High-Interest Debt': 'Pay Off Debt',
      'Save $25,000 Down Payment for Home': 'Save for Home',
      'Develop Sustainable Mental Health Practices': 'Mental Health Practices',
      'Master Digital Literacy and AI Tools': 'Digital Literacy & AI',
      'Achieve French Language Proficiency': 'French Proficiency',
      'Build Functional Strength and Mobility': 'Strength & Mobility',
      'Explore Canada Through Epic Adventures': 'Epic Adventures',
      'Master Four-Season Outdoor Activities': 'Outdoor Activities',
      'Complete Active Challenge Events': 'Challenge Events',
      'Volunteer Using Professional Skills': 'Professional Volunteering',
      'Create Affordable Home Office Space': 'Home Office Setup',
      'Improve Home Energy Efficiency': 'Energy Efficiency',
      'Live Zero-Waste Lifestyle': 'Zero-Waste Life',
      'Find Quality Shared Housing': 'Quality Housing'
    };
    
    // Use abbreviation if available
    if (abbreviations[goalName]) {
      goalName = abbreviations[goalName];
    }
    
    // Format for display
    if (currentLanguage === 'ja') {
      return `${goalName}\nプロジェクトとタスク`;
    } else {
      return `${goalName}\nBreakdown`;
    }
  };
  
  // Core state
  const [messageStep, setMessageStep] = useState(1);
  const [messageComplete, setMessageComplete] = useState(false);
  const [showTapToContinue, setShowTapToContinue] = useState(false);
  const [hierarchyVisible, setHierarchyVisible] = useState(false);
  const [readyForHierarchy, setReadyForHierarchy] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Confetti state (separate from core functionality)
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Ref for typing animation
  const typingRef = useRef(null);
  
  // Core animations
  const messageOpacity = useRef(new Animated.Value(1)).current;
  const messageTextOpacity = useRef(new Animated.Value(1)).current;
  const tapPromptOpacity = useRef(new Animated.Value(0)).current;
  const hierarchyOpacity = useRef(new Animated.Value(0)).current;
  const explanationCardOpacity = useRef(new Animated.Value(0)).current;
  const explanationCardY = useRef(new Animated.Value(50)).current;
  
  // Hierarchy animation values
  const hierarchyAnimValues = {
    goal: useRef(new Animated.Value(0)).current,
    projects: useRef([
      new Animated.Value(0),
      new Animated.Value(0)
    ]).current,
    tasks: useRef([
      new Animated.Value(0),
      new Animated.Value(0),
      new Animated.Value(0),
      new Animated.Value(0)
    ]).current,
    lines: {
      goalToProjects: useRef(new Animated.Value(0)).current,
      projectsToTasks: useRef([
        new Animated.Value(0),
        new Animated.Value(0)
      ]).current
    }
  };
  
  // Pulse animations for highlighting
  const highlightPulse = useRef(new Animated.Value(1)).current;
  
  // Icon animation for sparkle icon
  const iconPulse = useRef(new Animated.Value(1)).current;
  
  // Gesture state to track if user has seen the animation
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Start pulse animation when hierarchy is visible
  useEffect(() => {
    if (hierarchyVisible) {
      startPulseAnimation();
    }
  }, [hierarchyVisible]);
  
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
  
  // Create pulse animation loop
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(highlightPulse, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true
        }),
        Animated.timing(highlightPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true
        })
      ])
    ).start();
  };
  
  // Show tap prompt after message completes
  useEffect(() => {
    if (messageComplete) {
      setShowTapToContinue(true);
      
      // Animate in the tap prompt
      Animated.timing(tapPromptOpacity, {
        toValue: 1,
        duration: 300,
        delay: 200,
        useNativeDriver: true
      }).start();
    }
  }, [messageComplete]);
  
  // Show hierarchy after readyForHierarchy is set to true
  useEffect(() => {
    if (readyForHierarchy) {
      setHierarchyVisible(true);
      
      // Hide message
      Animated.timing(messageOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
      
      // Fade in hierarchy container with delay
      Animated.timing(hierarchyOpacity, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true
      }).start(() => {
        // Start animated hierarchy
        animateHierarchy();
        
        // Trigger confetti after hierarchy animation starts
        setTimeout(() => {
          setShowConfetti(true);
          if (onConfettiStart) {
            onConfettiStart(); // Trigger 100% progress
          }
        }, 500);
      });
    }
  }, [readyForHierarchy]);
  
  // Animate hierarchy items sequentially
  const animateHierarchy = () => {
    if (hasAnimated) return;
    
    // Animate goal
    Animated.timing(hierarchyAnimValues.goal, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start(() => {
      // Animate connection line from goal to projects
      Animated.timing(hierarchyAnimValues.lines.goalToProjects, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }).start(() => {
        // Animate projects with stagger
        Animated.stagger(
          300,
          hierarchyAnimValues.projects.map(anim =>
            Animated.spring(anim, {
              toValue: 1,
              friction: 8,
              tension: 40,
              useNativeDriver: true
            })
          )
        ).start(() => {
          // Animate connection lines from projects to tasks
          Animated.stagger(
            150,
            hierarchyAnimValues.lines.projectsToTasks.map(anim =>
              Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true
              })
            )
          ).start(() => {
            // Animate tasks with stagger
            Animated.stagger(
              150,
              hierarchyAnimValues.tasks.map(anim =>
                Animated.spring(anim, {
                  toValue: 1,
                  friction: 8,
                  tension: 40,
                  useNativeDriver: true
                })
              )
            ).start(() => {
              setHasAnimated(true);
            });
          });
        });
      });
    });
  };
  
  // Get current message based on step
  const getCurrentMessage = () => {
    switch(messageStep) {
      case 1:
        return t('message1', 'projects');
      case 2:
        return t('message2', 'projects');
      default:
        return "";
    }
  };
  
  // Handle screen tap to skip typing animation or continue to next step
  const handleScreenTap = () => {
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // If typing is still in progress, complete it immediately
    if (!messageComplete && typingRef.current) {
      typingRef.current.complete();
      return;
    }
    
    // If message is complete, proceed to next message
    if (messageComplete) {
      // Hide tap prompt
      Animated.timing(tapPromptOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }).start();
      
      if (messageStep === 1) {
        // If first message is complete, proceed directly to hierarchy view
        // Hide tap prompt
        Animated.timing(tapPromptOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true
        }).start();
        
        // Set ready for hierarchy
        setReadyForHierarchy(true);
      }
    }
  };
  
  // Handle selecting a hierarchy item (goal, project, or task)
  const handleSelectHierarchyItem = (item, type) => {
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // Store the selected item and its type
    setSelectedItem({
      ...item,
      type
    });
    
    // Show the explanation
    setShowExplanation(true);
    
    // Animate in the explanation card
    Animated.parallel([
      Animated.timing(explanationCardOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.spring(explanationCardY, {
        toValue: 0,
        friction: 7,
        tension: 50,
        useNativeDriver: true
      })
    ]).start();
  };
  
  // Close the explanation modal
  const handleCloseExplanation = () => {
    // Animate out the explanation card
    Animated.parallel([
      Animated.timing(explanationCardOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      }),
      Animated.timing(explanationCardY, {
        toValue: 50,
        duration: 250,
        useNativeDriver: true
      })
    ]).start(() => {
      setShowExplanation(false);
      setSelectedItem(null);
      setIsExpanded(false); // Reset expanded state when closing
    });
  };
  
  // Toggle expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  // UPDATED: Helper functions for expanded content
  // First check if the item has benefits or implementationTips fields (from translations)
  // If not, fall back to hardcoded English
  const getBenefitsForGoal = (goalObj, domainName) => {
    // First check if the goal object has the benefits field (added in translations)
    if (goalObj && goalObj.benefits) {
      return goalObj.benefits;
    }
    
    // Otherwise use the original hardcoded content
    const goalName = goalObj ? goalObj.name : '';
    const key = `${domainName}-${goalName}`;
    
    switch (key) {
      case "Personal Growth-Reading More":
        return "Reading regularly improves vocabulary, reduces stress by up to 68%, and expands your knowledge base. It's also linked to improved empathy, better sleep when done before bed, and stronger analytical thinking skills.";
      case "Personal Growth-Learning New Skills":
        return "Learning new skills creates new neural pathways, keeps your mind sharp as you age, and builds confidence that transfers to other areas of life. It also provides a sense of accomplishment outside your professional identity.";
      case "Personal Growth-Mindfulness Practice":
        return "Regular mindfulness practice is linked to reduced stress, improved focus, better emotional regulation, and enhanced immunity. It can help break negative thought patterns and increase your enjoyment of everyday experiences.";
      case "Health & Wellness-Regular Exercise":
        return "Beyond weight management, consistent exercise improves mood through endorphin release, enhances sleep quality, boosts immunity, and significantly reduces risk of chronic diseases like heart disease and diabetes.";
      // Add more cases as needed
      default:
        // Generic response based on domain
        if (domainName === "Career & Work") {
          return "This goal will help you find more satisfaction and success in your professional life. Progress here often leads to greater financial rewards, improved workplace relationships, and a stronger sense of accomplishment.";
        } else if (domainName === "Health & Wellness") {
          return "Investing in this aspect of health creates a foundation for everything else in your life. The benefits include increased energy, improved mood, greater resilience to stress, and reduced risk of illness.";
        } else if (domainName === "Relationships") {
          return "Strong relationships are consistently linked to happiness, longevity, and resilience. This goal helps you build deeper connections that provide support during challenges and enhance your enjoyment of life's positive moments.";
        } else if (domainName === "Financial Security") {
          return "Progress in this area reduces stress and increases your options in all other areas of life. Financial security provides both peace of mind and the resources to pursue other important goals.";
        } else {
          return "This goal addresses a fundamental aspect of your wellbeing and life satisfaction. Consistent progress here will create positive ripple effects in other areas of your life.";
        }
    }
  };
  
  const getTipsForGoal = (goalObj, domainName) => {
    // First check if the goal object has the implementationTips field (added in translations)
    if (goalObj && goalObj.implementationTips) {
      return goalObj.implementationTips;
    }
    
    // Otherwise use the original hardcoded content
    const goalName = goalObj ? goalObj.name : '';
    const key = `${domainName}-${goalName}`;
    
    switch (key) {
      case "Personal Growth-Reading More":
        return "Start with just 10 minutes daily to build the habit. Keep books visible in your home as reminders. Try different genres to find what truly engages you. Consider audiobooks for commutes or exercise time.";
      case "Personal Growth-Learning New Skills":
        return "Focus on one skill at a time rather than multiple. Practice consistently for short periods rather than occasional long sessions. Find ways to make the learning social through classes or online communities.";
      case "Health & Wellness-Regular Exercise":
        return "Choose activities you genuinely enjoy rather than what you think you 'should' do. Start with shorter sessions (even 10-15 minutes) to build consistency before increasing duration. Schedule workouts like important appointments.";
      // Add more cases as needed
      default:
        return "Break this goal into very small initial steps to build momentum. Track your progress visually to stay motivated. Tell others about your goal to create accountability. Celebrate small wins along the way.";
    }
  };
  
  const getProjectApproachInfo = (projectObj, domainName) => {
    // First check if the project object has the approachInfo field (added in translations)
    if (projectObj && projectObj.approachInfo) {
      return projectObj.approachInfo;
    }
    
    // Otherwise use the original hardcoded content
    const projectName = projectObj ? projectObj.name : '';
    const key = `${domainName}-${projectName}`;
    
    // Check for specific domain-project combinations first
    switch (key) {
      case "Health & Wellness-Sustainable Workout Routine":
        return "Sustainability is key for fitness success. This approach focuses on creating an exercise plan you'll actually maintain long-term, rather than a perfect but unsustainable regimen that leads to burnout or injury.";
      
      case "Personal Growth-Reading Habit Formation":
        return "Reading becomes transformative when it's consistent. This approach focuses on integrating reading naturally into your existing routines, which research shows is far more effective than sporadic reading attempts based on willpower alone.";
      
      case "Financial Security-Savings Automation":
        return "Automated saving removes the psychological friction of manual transfers. This approach leverages behavioral economics principles to help you save without requiring constant decisions, dramatically increasing your success rate.";
      
      case "Relationships-Meaningful Interaction Enhancement":
        return "Not all time together creates the same level of connection. This approach focuses on the quality of interactions rather than quantity, using research-backed techniques to deepen bonds through more meaningful engagement.";
        
      case "Career & Work-Professional Development Plan":
        return "Structured career growth requires intention, not hope. This approach creates a clear roadmap for your professional advancement, ensuring you develop the specific skills and visibility needed for your desired career trajectory.";
    }
    
    // If no specific match, fall back to project type patterns with domain context
    if (projectName.includes("Habit") || projectName.includes("Routine")) {
      if (domainName === "Health & Wellness") {
        return "Consistent health habits overcome the limitations of motivation. This approach establishes automatic healthy behaviors that persist even when life gets busy or willpower is low.";
      } else if (domainName === "Personal Growth") {
        return "Personal development thrives on consistency rather than intensity. This approach integrates growth practices into your existing life, creating sustainable progress without requiring major lifestyle overhauls.";
      } else {
        return "Habit formation is the foundation of lasting change. This structured approach helps you move beyond motivation to automatic behaviors that don't require constant decision-making.";
      }
    } else if (projectName.includes("System") || projectName.includes("Automation")) {
      if (domainName === "Financial Security") {
        return "Financial systems reduce the mental load of money management. This approach creates reliable structures that optimize your finances even when you're not actively thinking about them.";
      } else if (domainName === "Community & Environment") {
        return "Community and environmental systems create lasting positive impact. This approach builds connections and sustainable practices that benefit both personal wellbeing and collective good.";
      } else {
        return "Systems eliminate the need for repeated decision-making. This approach creates reliable processes that produce consistent results even when motivation fluctuates.";
      }
    } else if (projectName.includes("Plan")) {
      if (domainName === "Career & Work") {
        return "Strategic career planning prevents stagnation and aimless drift. This approach provides clear direction for your professional growth, helping you make decisions that build toward meaningful advancement.";
      } else if (domainName === "Financial Security") {
        return "Financial planning transforms vague hopes into achievable targets. This approach creates concrete steps toward financial goals, removing the uncertainty that often leads to financial avoidance.";
      } else {
        return "Planning transforms vague intentions into concrete actions. This approach bridges the gap between knowing what you want and actually achieving it through clear next steps.";
      }
    } else if (projectName.includes("Environment") || projectName.includes("Space")) {
      if (domainName === "Health & Wellness") {
        return "Your physical environment dramatically impacts health behaviors. This approach focuses on designing spaces that make healthy choices easier and unhealthy choices harder, reducing reliance on willpower.";
      } else if (domainName === "Community & Environment") {
        return "Community-centered environmental design shapes daily experiences and behaviors. This approach creates spaces and connections that naturally support your goals and collective wellbeing.";
      } else {
        return "Your environment shapes your behavior more than willpower alone. This approach focuses on designing your surroundings to naturally encourage desired actions and discourage unwanted ones.";
      }
    } else {
      // Generic fallback based on domain
      if (domainName === "Career & Work") {
        return "This project uses proven professional development strategies to advance your career goals. The focused approach targets key aspects of workplace success that often yield the highest returns.";
      } else if (domainName === "Health & Wellness") {
        return "This project applies evidence-based health improvement techniques that create sustainable results. The approach focuses on practical changes that fit into real life rather than idealized regimens.";
      } else if (domainName === "Relationships") {
        return "This project uses relationship psychology principles to strengthen meaningful connections. The approach targets specific aspects of interaction that research shows most impact relationship quality.";
      } else if (domainName === "Personal Growth") {
        return "This project applies effective personal development strategies that create lasting growth. The approach balances aspiration with practicality to ensure consistent progress.";
      } else {
        return "This project uses a proven approach that breaks down your goal into manageable steps. By focusing on this specific aspect first, you'll build momentum that carries over to other areas.";
      }
    }
  };
  
  const getProjectStartInfo = (projectObj, domainName) => {
    // First check if the project object has the startInfo field (added in translations)
    if (projectObj && projectObj.startInfo) {
      return projectObj.startInfo;
    }
    
    // Otherwise use the original hardcoded content
    const projectName = projectObj ? projectObj.name : '';
    const key = `${domainName}-${projectName}`;
    
    // Check for specific domain-project combinations first
    switch (key) {
      case "Health & Wellness-Sustainable Workout Routine":
        return "Start with just 10-15 minutes of activity 2-3 times per week. Choose exercises you genuinely enjoy rather than what's trendy. Schedule workouts at the same time on the same days to build consistency before increasing duration or intensity.";
      
      case "Financial Security-Savings Automation":
        return "Begin with a very small automatic transfer amount that you won't notice—even $5-10 per paycheck is fine. Set up a separate account that's slightly harder to access than your checking account. Gradually increase the amount as you adjust to living with less available cash.";
      
      case "Relationships-Meaningful Interaction Enhancement":
        return "Start by identifying one conversation partner and one specific time each week for a deeper conversation. Turn off notifications during this time. Prepare 2-3 open-ended questions that go beyond daily logistics to discuss during this time.";
      
      case "Personal Growth-Reading Habit Formation":
        return "Place a book where you'll see it during a daily transition moment (by your coffee maker, on your pillow, etc.). Start with just 5-10 minutes of reading at the same time each day. Consider beginning with shorter, engaging books rather than challenging classics to build the habit first.";
    }
    
    // If no specific match, fall back to project type patterns with domain context
    if (projectName.includes("Habit") || projectName.includes("Routine")) {
      if (domainName === "Health & Wellness") {
        return "Start with a health habit so small it feels almost too easy (like a 5-minute walk or adding one vegetable). Link it to an existing daily activity as a trigger. Track your consistency visually with a simple calendar or app.";
      } else if (domainName === "Personal Growth") {
        return "Begin with a tiny learning or reflection practice of 5 minutes or less. Attach it to an existing daily ritual like your morning coffee. Focus entirely on consistency for the first month, not results or duration.";
      } else {
        return "Start with a tiny version of the habit that takes less than 2 minutes. Attach it to an existing habit as a trigger. Track your consistency with a simple calendar or app. Focus on the starting ritual rather than the duration.";
      }
    } else if (projectName.includes("System") || projectName.includes("Automation")) {
      if (domainName === "Financial Security") {
        return "Begin by automating just one financial action (like a small recurring transfer to savings). Document your current bill payment schedule and due dates. Consider using account alerts to stay informed without constant checking.";
      } else if (domainName === "Community & Environment") {
        return "Start by identifying one area where you can create positive community impact or environmental change. Begin with simple actions in your immediate space that can inspire others and create ripple effects.";
      } else {
        return "Begin by documenting your current approach or routine. Identify the biggest friction points or inefficiencies. Test small changes one at a time rather than overhauling everything at once.";
      }
    } else if (projectName.includes("Plan")) {
      if (domainName === "Career & Work") {
        return "Start by identifying 2-3 people who currently have the role or skills you aspire to. Research their career paths and skill sets. Schedule a conversation with your manager about your career interests and potential growth opportunities.";
      } else if (domainName === "Financial Security") {
        return "Begin by tracking all expenses for just one week to establish a baseline. Identify your three largest spending categories. Create one specific, measurable goal related to your highest priority financial concern.";
      } else {
        return "Start with the end in mind by clearly defining what success looks like. Work backward to identify key milestones. Keep your initial plan simple with room to adapt as you learn.";
      }
    } else {
      return "Begin by completing the first task in this project. Schedule a specific time to work on it. Consider who might be able to provide guidance or support as you get started.";
    }
  };
  
  // Get projects and tasks
  const projects = goal.projects || [];
  
  // Generate domain color shades for gradients
  const getDomainColorShades = () => {
    // Convert hex to RGB
    const hexToRgb = (hex) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    const rgb = hexToRgb(domain.color);
    if (!rgb) return [domain.color, domain.color];
    
    // Create darker shade
    const darker = `rgba(${Math.max(0, rgb.r - 40)}, ${Math.max(0, rgb.g - 40)}, ${Math.max(0, rgb.b - 40)}, 1)`;
    
    // Create lighter shade
    const lighter = `rgba(${Math.min(255, rgb.r + 40)}, ${Math.min(255, rgb.g + 40)}, ${Math.min(255, rgb.b + 40)}, 1)`;
    
    return [darker, domain.color, lighter];
  };
  
  const domainColorShades = getDomainColorShades();

  // Helper function to shorten task name for display (fallback only)
  const getShortenedTaskName = (taskName) => {
    if (!taskName) return "";
    
    // Allow more characters since we want cleaner display
    if (taskName.length <= 60) return taskName;
    
    // Otherwise, truncate and add ellipsis
    return taskName.substring(0, 57) + "...";
  };
  
  return (
    <View style={styles.container}>
      <NavigationHeader 
        title={getProjectsTitle()}
        onBack={onBack} 
        iconName={domain.icon}
        iconColor={domain.color}
        titleOffset={16}
      />
      
      {/* Animated Confetti */}
      <AnimatedConfetti 
        visible={showConfetti}
        colors={domainColorShades}
        duration={3000}
        pieces={50}
        density={0.7}
      />
      
      {/* Full-screen touchable overlay - only visible before hierarchy appears */}
      {!hierarchyVisible && (
        <TouchableOpacity
          style={styles.fullScreenTouchable}
          activeOpacity={1}
          onPress={handleScreenTap}
          // This is the key change - allow touches to pass through to components beneath
          pointerEvents="box-none"
        />
      )}
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        pointerEvents={hierarchyVisible ? "auto" : "none"} // Make ScrollView non-interactive until hierarchy is visible
      >
        {/* AI Message - Single container that changes content */}
        {!hierarchyVisible && (
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
                onComplete={() => setMessageComplete(true)}
              />
            </Animated.View>
          </Animated.View>
        )}
        
        {/* Hierarchy Visualization */}
        {hierarchyVisible && (
          <Animated.View style={[styles.hierarchyContainer, { opacity: hierarchyOpacity }]}>
            {/* Reassurance Message */}
            <View style={styles.reassuranceContainer}>
              <View style={styles.reassuranceIcon}>
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
              </View>
              <View style={styles.reassuranceTextContainer}>
                <ResponsiveText style={styles.reassuranceTitle}>
                  {translate('domain', 'justStartingPoint')}
                </ResponsiveText>
                <ResponsiveText style={styles.reassuranceText}>
                  {translate('domain', 'frameworkHelp')}
                </ResponsiveText>
              </View>
            </View>
            
            {/* Goal */}
            <Animated.View 
              style={[
                styles.hierarchyGoal,
                { 
                  opacity: hierarchyAnimValues.goal,
                  transform: [
                    { 
                      translateY: hierarchyAnimValues.goal.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0]
                      })
                    },
                    { scale: highlightPulse }
                  ]
                }
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleSelectHierarchyItem(goal, 'goal')}
                style={styles.goalTouchable}
              >
                <LinearGradient
                  colors={[domainColorShades[0], domainColorShades[1]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.hierarchyGoalInner}
                >
                  <View style={styles.hierarchyIconContainer}>
                    <Ionicons name="flag" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.hierarchyTextContainer}>
                    <ResponsiveText style={styles.hierarchyGoalText}>
                      {goal.name}
                    </ResponsiveText>
                    <ResponsiveText style={styles.hierarchyItemType}>
                      {translate('common', 'goal').toUpperCase()}
                    </ResponsiveText>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
            
            {/* Connection Line from Goal to Projects */}
            <Animated.View style={[
              styles.connectionLineContainer,
              {
                opacity: hierarchyAnimValues.lines.goalToProjects
              }
            ]}>
              <View style={styles.connectionLine} />
              <View style={styles.connectionLineDot} />
            </Animated.View>
            
            {/* Projects */}
            <View style={styles.projectsRow}>
              {projects.slice(0, 2).map((project, index) => (
                <Animated.View
                  key={`project-${index}`}
                  style={[
                    styles.hierarchyProject,
                    { 
                      opacity: hierarchyAnimValues.projects[index],
                      transform: [
                        { 
                          translateY: hierarchyAnimValues.projects[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0]
                          })
                        }
                      ]
                    }
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleSelectHierarchyItem(project, 'project')}
                    style={styles.projectTouchable}
                  >
                    <LinearGradient
                      colors={['#1f2b4a', '#2d3a5a']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.hierarchyProjectInner,
                        { borderColor: domain.color }
                      ]}
                    >
                      <View 
                        style={[
                          styles.hierarchyIconContainer,
                          { backgroundColor: domain.color }
                        ]}
                      >
                        <Ionicons name="document-text" size={20} color="#FFFFFF" />
                      </View>
                      <View style={styles.hierarchyTextContainer}>
                        <ResponsiveText style={styles.hierarchyProjectText}>
                          {project.name}
                        </ResponsiveText>
                        <ResponsiveText style={styles.hierarchyItemType}>
                          {translate('common', 'project').toUpperCase()}
                        </ResponsiveText>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  {/* Connection Line from Project to Tasks */}
                  <Animated.View style={[
                    styles.projectConnectionLineContainer,
                    {
                      opacity: hierarchyAnimValues.lines.projectsToTasks[index]
                    }
                  ]}>
                    <View style={styles.projectConnectionLine} />
                    <View style={styles.connectionLineDot} />
                  </Animated.View>
                </Animated.View>
              ))}
            </View>
            
            {/* Tasks Rows */}
            <View style={styles.tasksContainer}>
              {projects.slice(0, 2).map((project, projectIndex) => (
                <View key={`tasks-${projectIndex}`} style={styles.taskRow}>
                  {project.tasks.slice(0, 2).map((task, taskIndex) => {
                    const animIndex = projectIndex * 2 + taskIndex;
                    
                    return (
                      <Animated.View
                        key={`task-${projectIndex}-${taskIndex}`}
                        style={[
                          styles.hierarchyTask,
                          { 
                            opacity: hierarchyAnimValues.tasks[animIndex],
                            transform: [
                              { 
                                translateY: hierarchyAnimValues.tasks[animIndex].interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [-20, 0]
                                })
                              }
                            ]
                          }
                        ]}
                      >
                        <TouchableOpacity
                          activeOpacity={0.9}
                          onPress={() => handleSelectHierarchyItem(task, 'task')}
                          style={styles.taskTouchable}
                        >
                          <LinearGradient
                            colors={['#1c2335', '#262e42']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.hierarchyTaskInner}
                          >
                            <View style={styles.taskIconContainer}>
                              <Ionicons name="checkmark-circle" size={18} color={domain.color} />
                            </View>
                            <View style={styles.taskTextContainer}>
                              <ResponsiveText style={styles.hierarchyTaskText}>
                                {task.summary || getShortenedTaskName(task.name)}
                              </ResponsiveText>
                              <ResponsiveText style={styles.hierarchyItemType}>
                                {translate('common', 'task').toUpperCase()}
                              </ResponsiveText>
                            </View>
                          </LinearGradient>
                        </TouchableOpacity>
                      </Animated.View>
                    );
                  })}
                </View>
              ))}
            </View>
          </Animated.View>
        )}
        </ScrollView>
      
      {/* Continue Button - Now outside ScrollView to make it sticky */}
      {hasAnimated && (
        <View style={styles.continueButtonContainer}>
          <LinearGradient
            colors={[domainColorShades[0], domainColorShades[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButtonGradient}
          >
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onContinue}
              activeOpacity={0.9}
              disabled={isNavigating}
            >
              <ResponsiveText style={styles.continueButtonText}>
                Create in My App
              </ResponsiveText>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
      
      {/* Explanation Modal */}
      {showExplanation && selectedItem && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={handleCloseExplanation}
          />
          
          <Animated.View 
            style={[
              styles.explanationCard,
              { 
                opacity: explanationCardOpacity,
                transform: [{ translateY: explanationCardY }],
                borderColor: selectedItem.type === 'goal' ? domain.color : 
                             selectedItem.type === 'project' ? '#4dabf7' :
                             '#8D96A8'
              }
            ]}
          >
            <LinearGradient
              colors={['#162040', '#10172e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.explanationCardGradient}
            >
              <View style={styles.explanationHeader}>
                <View 
                  style={[
                    styles.explanationIconContainer,
                    { 
                      backgroundColor: selectedItem.type === 'goal' ? domain.color : 
                                      selectedItem.type === 'project' ? '#4dabf7' :
                                      '#8D96A8'
                    }
                  ]}
                >
                  <Ionicons 
                    name={
                      selectedItem.type === 'goal' ? 'flag' : 
                      selectedItem.type === 'project' ? 'document-text' : 
                      'checkmark-circle'
                    } 
                    size={selectedItem.type === 'task' ? 18 : 24} 
                    color="#FFFFFF" 
                  />
                </View>
                
                <View style={styles.explanationTitleContainer}>
                  <ResponsiveText style={styles.explanationTitle}>
                    {selectedItem.name}
                  </ResponsiveText>
                  <ResponsiveText style={styles.explanationType}>
                    {selectedItem.type === 'goal' ? translate('common', 'goal') : 
                     selectedItem.type === 'project' ? translate('common', 'project') : 
                     translate('common', 'task')}
                  </ResponsiveText>
                </View>
                
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={handleCloseExplanation}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={styles.explanationContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Basic explanation */}
                <ResponsiveText style={styles.explanationText}>
                  {selectedItem.type === 'task' ? 
                    translate('common', 'taskExplanation', {}) || "This task breaks down your project into a specific, actionable step you can complete. Tasks are concrete actions that move you toward your goals." : 
                    selectedItem.explanation || `${
                      selectedItem.type === 'goal' ? 'This goal helps you focus on a specific aspect of the ' + domain.name + ' domain.' :
                      'This project helps break down your goal into manageable pieces.'
                    }`}
                </ResponsiveText>
                
                {/* Show more/less button - only for goals and projects */}
                {selectedItem.type !== 'task' && (
                  <TouchableOpacity 
                    style={styles.expandButton}
                    onPress={toggleExpanded}
                    activeOpacity={0.7}
                  >
                    <ResponsiveText style={styles.expandButtonText}>
                      {isExpanded ? translate('common', 'showLess') : translate('common', 'learnMore')}
                    </ResponsiveText>
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color="#FFFFFF" 
                    />
                  </TouchableOpacity>
                )}
                
                {/* Expanded content - only visible when expanded */}
                {isExpanded && selectedItem.type !== 'task' && (
                  <View style={styles.expandedContent}>
                    <View style={[
                      styles.divider,
                      { backgroundColor: selectedItem.type === 'goal' ? `${domain.color}40` : 'rgba(77, 171, 247, 0.25)' }
                    ]} />
                    
                    {selectedItem.type === 'goal' ? (
                      <>
                        <View style={[styles.expandedSectionTitleContainer, { borderLeftColor: domain.color }]}>
                          <ResponsiveText style={styles.expandedSectionTitle}>
                            {translate('common', 'benefits')}
                          </ResponsiveText>
                        </View>
                        <ResponsiveText style={styles.expandedText}>
                          {getBenefitsForGoal(selectedItem, domain.name)}
                        </ResponsiveText>
                        
                        <View style={[styles.expandedSectionTitleContainer, { borderLeftColor: domain.color }]}>
                          <ResponsiveText style={styles.expandedSectionTitle}>
                            {translate('common', 'implementationTips')}
                          </ResponsiveText>
                        </View>
                        <ResponsiveText style={styles.expandedText}>
                          {getTipsForGoal(selectedItem, domain.name)}
                        </ResponsiveText>
                      </>
                    ) : (
                      <>
                        <View style={[styles.expandedSectionTitleContainer, { borderLeftColor: '#4dabf7' }]}>
                          <ResponsiveText style={styles.expandedSectionTitle}>
                            {translate('common', 'whyThisApproachWorks')}
                          </ResponsiveText>
                        </View>
                        <ResponsiveText style={styles.expandedText}>
                          {getProjectApproachInfo(selectedItem, domain.name)}
                        </ResponsiveText>
                        
                        <View style={[styles.expandedSectionTitleContainer, { borderLeftColor: '#4dabf7' }]}>
                          <ResponsiveText style={styles.expandedSectionTitle}>
                            {translate('common', 'gettingStarted')}
                          </ResponsiveText>
                        </View>
                        <ResponsiveText style={styles.expandedText}>
                          {getProjectStartInfo(selectedItem, domain.name)}
                        </ResponsiveText>
                      </>
                    )}
                  </View>
                )}
                
                {/* Editability note */}
                <View style={styles.editabilityNote}>
                  <Ionicons name="information-circle" size={16} color="rgba(255, 255, 255, 0.7)" style={styles.editabilityIcon} />
                  <ResponsiveText style={styles.editabilityText}>
                    {translate('common', 'editabilityNote', { itemType: selectedItem.type })}
                  </ResponsiveText>
                </View>
              </ScrollView>
            </LinearGradient>
          </Animated.View>
        </View>
      )}
      
      {/* Central Tap to Continue Prompt */}
      {messageComplete && !hierarchyVisible && (
        <Animated.View 
          style={[
            styles.centralTapPrompt,
            { opacity: tapPromptOpacity }
          ]}
          pointerEvents="none"
        >
          <ResponsiveText style={styles.tapPromptText}>
            {translate('common', 'tapToContinue')}
          </ResponsiveText>
          <Ionicons 
            name="chevron-down" 
            size={24} 
            color="rgba(255,255,255,0.7)" 
            style={styles.tapPromptIcon} 
          />
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra padding for content to be visible above the sticky button
    paddingTop: 15,
  },
  fullScreenTouchable: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10, // Ensure it's below the NavigationHeader which has zIndex 20
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'ios' ? 90 : 70, // Add top padding to avoid overlap with header
  },
  messageContainer: {
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
    marginTop: 20,
    flexDirection: 'row',
    borderLeftWidth: 2,
    borderLeftColor: '#3b82f6',
    zIndex: 5,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
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
  hierarchyContainer: {
    marginTop: 10,
    marginBottom: 30,
    alignItems: 'center',
    zIndex: 5,
    position: 'relative',
  },
  hierarchyHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  hierarchyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  hierarchySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  // Reassurance message styles
  reassuranceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 2,
    borderLeftColor: '#3b82f6',
  },
  reassuranceIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  reassuranceTextContainer: {
    flex: 1,
  },
  reassuranceTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  reassuranceText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  hierarchyGoal: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 5,
  },
  goalTouchable: {
    width: '90%',
    maxWidth: 320,
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 10,
  },
  hierarchyGoalInner: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
  },
  hierarchyIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  hierarchyTextContainer: {
    flex: 1,
  },
  hierarchyGoalText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  hierarchyItemType: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
  },
  connectionLineContainer: {
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    marginBottom: 10,
  },
  connectionLine: {
    width: 2,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  connectionLineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginTop: -3,
  },
  projectsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  hierarchyProject: {
    width: '48%',
    maxWidth: 200,
    height: 100, // Increased height to match with tasks
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative', // Ensure position for connection lines
    marginBottom: 40, // Add space for connection lines
  },
  projectTouchable: {
    width: '100%',
    height: '100%', // Fill the parent container
    borderRadius: 14,
    overflow: 'hidden',
    zIndex: 10,
  },
  hierarchyProjectInner: {
    padding: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    height: '100%', // Fill the container height
  },
  hierarchyProjectText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  projectConnectionLineContainer: {
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    marginTop: 6,
    position: 'absolute', // Make sure it's absolutely positioned
    bottom: -30, // Position below the project
    left: 0,
    right: 0,
    zIndex: 1, // Ensure it's visible
  },
  projectConnectionLine: {
    width: 2,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tasksContainer: {
    width: '100%',
    marginTop: 0,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    width: '100%',
  },
  hierarchyTask: {
    width: '48%',
    maxWidth: 190,
    height: 100, // Increased height to fit more text
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  taskTouchable: {
    width: '100%',
    height: '100%', // Fill the parent container
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 10,
  },
  hierarchyTaskInner: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center', // Center items vertically
    borderRadius: 12,
    height: '100%', // Fill the container height
  },
  taskIconContainer: {
    marginRight: 10,
    width: 20,
    alignSelf: 'center', // Center icon vertically
    justifyContent: 'center',
  },
  taskTextContainer: {
    flex: 1,
    flexShrink: 1,
    justifyContent: 'center', // Center content vertically
    overflow: 'hidden', // Hide overflow
    alignSelf: 'center', // Center the container itself
  },
  hierarchyTaskText: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  hierarchyLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendItemExample: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  continueButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 15, // Ensure it's above other elements
  },
  continueButtonGradient: {
    borderRadius: 14,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  explanationCard: {
    borderRadius: 18,
    borderWidth: 1,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  explanationCardGradient: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  explanationIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  explanationTitleContainer: {
    flex: 1,
  },
  explanationTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  explanationType: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  explanationContent: {
    padding: 18,
    maxHeight: 300,
  },
  explanationText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 10,
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  expandedContent: {
    marginTop: 4,
  },
  expandedSectionTitleContainer: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginTop: 18,
    marginBottom: 10,
  },
  expandedSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  expandedText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    paddingLeft: 15,
  },
  // Editability note styles
  editabilityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginTop: 16,
  },
  editabilityIcon: {
    marginRight: 8,
  },
  editabilityText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  }
});

export default ProjectsBreakdownPage;
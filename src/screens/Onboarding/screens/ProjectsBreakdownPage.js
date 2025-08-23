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
 * MilestonesBreakdownPage - New streamlined onboarding experience
 */
const MilestonesBreakdownPage = ({ domain, goal, onContinue, onBack, onConfettiStart, isNavigating = false }) => {
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
  
  // Create title for milestones page - handle long goal names with line breaks
  const getMilestonesTitle = () => {
    if (!goal || !goal.name) {
      return currentLanguage === 'ja' ? 'マイルストーンとタスク' : 'Breakdown';
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
      'Save Down Payment for Home': 'Save for Home',
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
      return `${goalName}\nマイルストーンとタスク`;
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
  const handleSelectHierarchyItem = (item, type, milestoneIndex = null) => {
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // Store the selected item and its type, including milestone index for milestones
    setSelectedItem({
      ...item,
      type,
      milestoneIndex
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

  // Get milestone main content based on index (0 = first milestone, 1 = second milestone)
  const getMilestoneMainContent = (milestoneIndex) => {
    if (milestoneIndex === 0) {
      // First milestone: Psychology approach
      return "Research in psychology shows that most positive emotions don't come from achieving goals - they come from making progress toward goals that matter to you. Your brain generates these good feelings as you move forward on something meaningful. That's why checking off this milestone will feel more satisfying than random tasks - it's connected to something you actually care about.";
    } else {
      // Second milestone: Project Management approach  
      return "This is a common approach in project management: breaking down goals into smaller chunks. This approach:\n\n• Prevents overwhelm by giving you clear checkpoints\n• Maintains momentum through regular wins  \n• Makes big goals feel manageable\n\nEach milestone represents meaningful progress you can see and celebrate.";
    }
  };

  // Get comprehensive milestone-specific explanation for expanded content
  const getMilestoneSpecificExplanation = (milestone, domainName) => {
    const milestoneName = milestone ? milestone.name : '';
    const milestoneKey = `${domainName}-${milestoneName}`;
    
    // Comprehensive milestone explanations based on research - covers all countries
    const explanations = {
      // === CAREER & WORK DOMAIN - ALL COUNTRIES ===
      
      // Career Advancement & Management
      "Career & Work-Professional Development Plan": "Creating a structured career development plan transforms vague career hopes into concrete actions. Research from LinkedIn shows that employees who direct their own professional development are 8x more likely to advance within their organization. This approach works because it shifts you from waiting for opportunities to actively creating them through strategic skill building and network expansion.",
      "Career & Work-Leadership Skills Development": "Leadership development is the gateway to management roles across all industries. Studies show that companies are 13x more likely to promote employees who demonstrate leadership initiative. This development approach builds the specific competencies that distinguish managers from individual contributors.",
      "Career & Work-Management Position Strategy": "Transitioning to management requires strategic positioning beyond just doing good work. Research shows that 89% of successful management transitions involve deliberate relationship building and visibility campaigns. This strategy approach ensures you're considered when opportunities arise.",
      "Career & Work-Internal Advancement Strategy": "Internal promotion is 40% more likely when pursued strategically rather than passively. Studies show that employees who actively communicate career aspirations are 5x more likely to advance. This strategy creates clear pathways within your current organization.",
      "Career & Work-Strategic Career Advancement": "Strategic career moves compound over time, with each position building toward larger goals. Research shows that professionals with clear career strategies achieve 23% higher lifetime earnings. This advancement approach ensures each career move supports your long-term objectives.",
      "Career & Work-Performance-Based Salary Strategy": "Performance-based salary negotiations yield 15-20% higher increases than general requests. Studies show that employees who document achievements and market value receive significantly better compensation packages. This strategic approach positions your contributions for maximum recognition.",
      
      // Tech & Skills Development
      "Career & Work-AI Tools Mastery": "AI tool proficiency is becoming essential across industries, with 85% of jobs expected to be augmented by AI by 2030. Early adopters report 30-50% productivity gains. This mastery approach ensures you leverage AI for competitive advantage rather than being replaced by it.",
      "Career & Work-AI & Machine Learning Applications": "AI and ML skills are among the highest-paying and fastest-growing career areas. Professionals with AI capabilities earn 25-40% more than peers without these skills. This application approach focuses on practical implementation rather than theoretical knowledge.",
      "Career & Work-Data Analytics Mastery": "Data analytics skills are in demand across every industry, with 65% of businesses seeking data-literate professionals. Data-skilled workers earn 20% more on average. This mastery approach builds practical analysis capabilities that translate directly to business value.",
      "Career & Work-Cybersecurity Foundation Skills": "Cybersecurity skills address one of the fastest-growing job markets, with 3.5 million unfilled positions globally. Cybersecurity professionals earn 16% more than general IT roles. This foundation approach builds security expertise that's valuable in any industry.",
      "Career & Work-Programming Language Mastery": "Programming skills increase earning potential by 20-30% even in non-tech roles. Software development jobs grow 25% faster than average occupations. This mastery approach builds coding competency that enhances problem-solving across industries.",
      "Career & Work-Cloud Platform Certification": "Cloud skills are essential as 94% of enterprises use cloud services. Cloud-certified professionals earn 25% more than non-certified peers. This certification approach builds expertise in the infrastructure powering modern business.",
      
      // Flexible Work & Work-Life Balance  
      "Career & Work-Flexible Work Negotiation": "Flexible work arrangements improve productivity by 21% and reduce turnover by 87%. Post-pandemic, 88% of professionals want continued flexibility. This negotiation approach secures arrangements that benefit both employee and employer.",
      "Career & Work-Flexible Working Proposal": "Well-structured flexibility proposals have 73% success rates versus 31% for informal requests. Research shows that proposals focusing on business benefits rather than personal preferences are most effective. This approach creates compelling cases for flexible arrangements.",
      "Career & Work-Remote Work Optimization": "Remote workers can be 35-40% more productive when properly set up, but 23% less productive without proper systems. This optimization approach ensures remote work becomes a competitive advantage rather than a productivity drain.",
      "Career & Work-Hybrid Work Implementation": "Hybrid work models show 4.6% higher productivity than fully in-office work when implemented strategically. This implementation approach maximizes the benefits of both remote and in-office work while minimizing the drawbacks.",
      
      // Additional High-Frequency Career Milestones
      "Career & Work-Tech Job Market Entry": "Breaking into tech requires strategic positioning and portfolio development. Research shows that career changers with structured approach are 4x more likely to land tech roles. This entry approach addresses both skill gaps and industry networking requirements.",
      "Career & Work-Tech Career Market Entry": "Entering the tech job market successfully requires understanding both technical requirements and market dynamics. Studies show that systematic market entry increases job offer rates by 65%. This approach ensures competitive positioning for tech career success.",
      "Career & Work-Business Opportunity Research": "Successful businesses start with thorough opportunity research and market validation. Research shows that entrepreneurs who spend 3+ months on opportunity analysis have 60% higher success rates. This research approach identifies viable business concepts with strong market potential.",
      "Career & Work-Digital Marketing Expertise": "Digital marketing skills are essential across industries, with 78% of companies prioritizing digital-first marketing. Professionals with digital marketing expertise earn 20% more than traditional marketers. This expertise approach builds comprehensive digital marketing capabilities.",
      "Career & Work-Programming Skills Mastery": "Programming skills provide career flexibility and higher earning potential across industries. Software developers earn 25% more than average professionals, with demand growing 25% faster than other occupations. This mastery approach builds practical coding competency.",
      "Career & Work-E-commerce Business Setup": "E-commerce businesses have lower startup costs and global reach potential. Online retail grows 15% annually while traditional retail shrinks. This setup approach covers all essential elements for successful online business launch.",
      "Career & Work-AI Tools Mastery for Canadian Market": "AI tools mastery in the Canadian market provides competitive advantages in a rapidly digitizing economy. Canadian businesses investing in AI report 25% higher productivity gains. This market-specific approach ensures AI skills align with Canadian business needs and regulations.",
      "Career & Work-Cross-Functional Skill Development": "Cross-functional skills make professionals more valuable and career-resilient. Research shows that employees with cross-functional capabilities are 40% more likely to advance and earn 15% more. This development approach builds skills that translate across departments and industries.",
      
      "Career & Work-Skills & Visibility Enhancement": "Combining skill development with visibility creates a powerful career advancement strategy. Studies show that 70% of career advancement depends on visibility and relationships, not just performance. This milestone addresses both technical competence and professional recognition - ensuring your capabilities are both strong and noticed by decision-makers.",
      
      "Career & Work-Boundary Setting System": "Boundary setting isn't about working less - it's about working more sustainably. Research from Stanford shows that workers with clear boundaries report 29% higher productivity and 53% greater ability to focus. This system prevents the productivity paradox where longer hours actually decrease output quality and decision-making capability.",
      
      "Career & Work-Time Management Overhaul": "Effective time management creates cognitive space for strategic thinking. Studies show that structured time blocking increases focus by up to 50% compared to reactive work styles. This approach transforms your workday from a series of interruptions into intentional progress blocks, reducing the mental fatigue that comes from constant task-switching.",
      
      "Career & Work-Learning Pathway Creation": "Strategic learning prevents random skill acquisition that doesn't advance your career. Research shows that employees actively developing new skills contribute 23% more value to their organizations. This pathway approach ensures your learning efforts translate directly into professional advancement and market value.",
      
      "Career & Work-Practical Application Plan": "Learning without application rarely sticks or gets noticed by decision-makers. Studies show that applied learning increases skill retention by 75% compared to passive learning. This plan ensures your new knowledge becomes visible capability that others recognize and value in your professional context.",
      
      // Health & Wellness Domain  
      "Health & Wellness-Sustainable Workout Routine": "Sustainability is the key differentiator between temporary fitness attempts and lifelong health habits. Research shows that structured exercise programs with consistent tracking yield 77% adherence rates. This approach focuses on building identity as someone who exercises regularly, rather than relying on motivation that naturally fluctuates.",
      
      "Health & Wellness-Exercise Environment Setup": "Environmental design is more powerful than willpower for maintaining exercise habits. Research shows that people are 3x more likely to exercise when equipment is visible and accessible. This setup approach removes friction from starting workouts, making exercise the path of least resistance rather than an obstacle course.",
      
      "Health & Wellness-Meal Planning System": "Meal planning prevents the decision fatigue that leads to poor food choices when hungry. Studies show that people who plan meals consume 22% more nutrients and spend 40% less on food while maintaining better portion control. This systematic approach makes healthy eating convenient and automatic.",
      
      "Health & Wellness-Nutritional Education": "Understanding nutrition empowers better food choices without restrictive dieting. Research shows that nutrition knowledge increases healthy eating behaviors by 35% compared to rule-based dieting. This educational approach builds sustainable decision-making skills rather than temporary compliance.",
      
      "Health & Wellness-Sleep Environment Optimization": "Sleep environment directly impacts both sleep quality and cognitive function. Research shows that optimized bedroom conditions can improve sleep quality by up to 40%. This optimization approach addresses light, temperature, noise, and comfort factors that most significantly affect restorative sleep.",
      
      "Health & Wellness-Sleep Routine Development": "Consistent sleep routines regulate circadian rhythms more effectively than sleep duration alone. Studies show that regular sleep-wake times improve sleep quality by 23% and cognitive performance by 15%. This routine approach trains your body's internal clock for natural, restorative sleep patterns.",
      
      "Health & Wellness-Evening Wind-Down System": "Evening routines signal to your brain that it's time to transition from day to night mode. Research shows that structured wind-down routines reduce sleep latency by an average of 37%. This systematic approach creates psychological and physiological preparation for quality sleep.",
      
      "Health & Wellness-Morning Routine Optimization": "Morning routines set the tone and energy level for your entire day. Studies show that people with consistent morning routines report 41% higher life satisfaction and better stress management throughout the day. This optimization approach creates predictable energy and focus from day start.",
      
      // === HEALTH & WELLNESS - ADDITIONAL COUNTRY MILESTONES ===
      
      // Mental Health & Stress Management
      "Health & Wellness-Mental Health Fitness Routine": "Mental health routines provide the same benefits as physical fitness but for emotional resilience. Research shows that structured mental health practices reduce anxiety by 42% and improve stress management. This routine approach makes mental wellness as systematic as physical exercise.",
      "Health & Wellness-Stress Management Integration": "Integrating stress management into daily life prevents stress accumulation rather than just managing crises. Studies show that proactive stress management reduces cortisol levels by 23% and improves cognitive function. This integration approach builds resilience throughout your day.",
      "Health & Wellness-Mental Health Support System": "Professional mental health support accelerates personal growth and prevents mental health crises. Research shows that people with mental health support systems report 35% better life satisfaction and resilience. This system approach normalizes mental health care as preventive wellness.",
      "Health & Wellness-Mental Wellness Foundation": "Building mental wellness foundations creates resilience for life's challenges. Studies show that people with strong mental wellness practices recover from setbacks 60% faster. This foundation approach builds comprehensive emotional and psychological health.",
      
      // Fitness & Physical Health Variations
      "Health & Wellness-Functional Fitness Foundation": "Functional fitness improves daily life activities more than traditional gym workouts. Research shows that functional training reduces injury risk by 50% and improves quality of life scores. This foundation approach builds strength that translates to real-world activities.",
      "Health & Wellness-Active Lifestyle Integration": "Integrating activity into daily life is more sustainable than scheduled exercise alone. Studies show that active lifestyles provide 85% of exercise benefits with better long-term adherence. This integration approach makes movement natural rather than scheduled.",
      "Health & Wellness-5K Training Program": "Structured 5K training provides achievable fitness goals with clear progression. Research shows that completing a 5K improves cardiovascular health by 15% and builds confidence for larger fitness goals. This program approach creates systematic fitness development.",
      "Health & Wellness-Fitness Community Building": "Fitness communities provide accountability and motivation that individual efforts often lack. Studies show that people exercising with others maintain routines 90% longer than solo exercisers. This community approach leverages social support for fitness success.",
      "Health & Wellness-Exercise Habit Foundation": "Building exercise habits requires different strategies than motivation-based fitness. Research shows that habit-based exercise creates 76% better long-term adherence than willpower-based approaches. This foundation approach makes exercise feel automatic.",
      
      // Nutrition & Health Optimization
      "Health & Wellness-Nutrition Strategy": "Strategic nutrition approaches are more effective than restrictive dieting. Research shows that flexible nutrition strategies result in 67% better long-term adherence and health outcomes. This strategic approach builds sustainable healthy eating patterns.",
      "Health & Wellness-Healthy Eating Habits": "Habit-based healthy eating is more successful than diet-based approaches. Studies show that people focusing on habits rather than restrictions maintain healthy eating 3x longer. This habit approach builds sustainable nutritional wellness.",
      "Health & Wellness-Preventive Care System": "Preventive healthcare reduces long-term health costs by 40% and improves life quality. Research shows that systematic preventive care catches 85% of health issues before they become serious. This system approach prioritizes prevention over treatment.",
      "Health & Wellness-Health Monitoring and Optimization": "Regular health monitoring enables early intervention and optimization. Studies show that people who track health metrics improve health outcomes by 25%. This monitoring approach creates data-driven health improvement.",
      
      // Sleep & Recovery
      "Health & Wellness-Sleep Quality Monitoring": "Sleep quality monitoring reveals patterns that simple duration tracking misses. Research shows that sleep quality optimization can improve cognitive function by 20%. This monitoring approach identifies specific factors affecting your sleep.",
      "Health & Wellness-Sleep Stress Management": "Managing stress specifically for better sleep creates compound benefits for both. Studies show that sleep-focused stress management improves sleep quality by 35% and reduces daytime stress. This approach addresses the stress-sleep cycle comprehensively.",
      
      // Additional High-Frequency Health Milestones
      "Health & Wellness-Mental Health Support System": "Building mental health support systems prevents crises and promotes thriving. Research shows that people with mental health support networks report 40% better stress management and resilience. This system approach normalizes mental health care as essential wellness.",
      "Health & Wellness-Mental Wellness System": "Systematic mental wellness approaches provide better outcomes than crisis-only mental health care. Studies show that proactive mental wellness reduces anxiety by 35% and improves life satisfaction. This system approach treats mental health as ongoing wellness rather than problem-solving.",
      "Health & Wellness-Workplace Mental Health": "Workplace mental health strategies improve both job performance and personal wellbeing. Research shows that workplace mental health support increases productivity by 23% and reduces turnover. This approach integrates mental wellness into professional life.",
      "Health & Wellness-ActiveSG Fitness Foundation": "Singapore's ActiveSG program provides community-based fitness opportunities at accessible costs. Local research shows that ActiveSG participants maintain fitness routines 70% longer than private gym members. This foundation approach leverages Singapore's unique fitness infrastructure.",
      "Health & Wellness-Sustainable Workout Plan": "Sustainable workout plans focus on long-term adherence rather than short-term intensity. Research shows that moderate, consistent exercise provides 85% of health benefits with 3x better adherence than extreme programs. This planning approach builds fitness habits that last for life.",
      "Health & Wellness-Mental Health Fitness Routine": "Mental health fitness routines provide the same benefits as physical fitness but for emotional resilience. Research shows that structured mental health practices reduce anxiety by 42% and improve stress management. This routine approach makes mental wellness as systematic as physical exercise.",
      
      // Relationships Domain
      "Relationships-Scheduled Connection Points": "Intentional connection time yields disproportionate relationship benefits. Dr. John Gottman's research with thousands of couples found that just 5 hours of weekly intentional connection creates the strongest predictor of relationship satisfaction. This scheduling approach protects quality time from being crowded out by other priorities.",
      
      "Relationships-Meaningful Interaction Enhancement": "The quality of interactions matters more than quantity for relationship satisfaction. Research shows that meaningful conversations increase relationship satisfaction by 67% compared to surface-level exchanges. This enhancement approach focuses on depth and emotional connection rather than just time spent together.",
      
      "Relationships-Active Listening Practice": "Active listening is the foundation skill that transforms all other relationship interactions. Studies show that people who feel heard experience 40% higher relationship satisfaction and 25% less conflict. This practice approach develops the specific skills that make others feel truly understood and valued.",
      
      "Relationships-Conflict Resolution Framework": "How you handle disagreements predicts relationship success with 90% accuracy according to Gottman research. Healthy couples aren't conflict-free - they resolve conflicts constructively. This framework provides specific tools for turning disagreements into opportunities for deeper understanding.",
      
      "Relationships-Social Opportunity Mapping": "Expanding social connections requires intentional strategy, not just hoping to meet people. Research shows that people with diverse social networks report 30% higher life satisfaction. This mapping approach identifies specific opportunities for meaningful connection in your existing environment.",
      
      "Relationships-Relationship Nurturing System": "Relationships require ongoing investment to thrive, not just crisis intervention. Studies show that small, consistent gestures matter more than grand occasional ones for relationship health. This systematic approach ensures important relationships receive regular attention and care.",
      
      // Additional High-Frequency Relationship Milestones
      "Relationships-Family Connection Building": "Strong family connections provide emotional support and life satisfaction. Research shows that people with close family relationships report 35% higher wellbeing and better stress resilience. This building approach creates structured opportunities for meaningful family connection.",
      "Relationships-Family Connection Strategy": "Strategic family connection ensures relationships remain strong despite busy schedules. Studies show that planned family interactions are 60% more satisfying than spontaneous ones. This strategy approach creates sustainable family relationship maintenance.",
      "Relationships-Family Relationship Investment": "Investing time and energy in family relationships pays dividends in life satisfaction and support. Research shows that strong family ties reduce stress by 25% and improve mental health outcomes. This investment approach strengthens family bonds systematically.",
      "Relationships-Partnership Development": "Developing strong partnerships requires intentional communication and shared goal setting. Studies show that couples who work on relationship skills have 40% lower divorce rates. This development approach builds lasting partnership foundations.",
      "Relationships-Relationship Investment and Growth": "Relationships grow through consistent investment and attention. Research shows that relationships receiving regular attention satisfaction scores 50% higher than neglected ones. This growth approach ensures relationships thrive rather than just survive.",
      "Relationships-Wedding Planning Foundation": "Wedding planning success depends on clear vision and systematic preparation. Studies show that couples with structured planning report 60% higher wedding satisfaction. This foundation approach ensures weddings reflect couple's values while staying within budget.",
      "Relationships-Wedding Execution": "Wedding execution requires coordination and stress management skills. Research shows that well-executed weddings create positive memories that strengthen relationships. This execution approach ensures wedding day success while maintaining relationship focus.",
      
      // Personal Growth Domain
      "Personal Growth-Skill Acquisition Framework": "Structured skill development creates lasting neuroplasticity benefits. Research shows that learning new skills increases brain density by up to 25%. This framework approach ensures efficient skill acquisition through proven learning methods rather than random practice, maximizing both retention and practical application.",
      
      "Personal Growth-Progress Tracking System": "Tracking progress makes invisible improvements visible and maintains motivation during learning plateaus. Studies show that people who track skill development achieve 42% better outcomes than those who don't monitor progress. This systematic approach creates feedback loops that accelerate improvement.",
      
      "Personal Growth-Reading Habit Formation": "Regular reading provides both immediate stress reduction and long-term cognitive benefits. University of Sussex research found that just 6 minutes of reading reduces stress by 68% - more effective than music or walking. This formation approach integrates reading naturally into existing daily routines.",
      
      "Personal Growth-Reading Selection Strategy": "Strategic book selection maximizes reading benefits and maintains engagement. Research shows that people who choose books aligned with their goals are 73% more likely to complete them and apply the knowledge. This strategy approach ensures your reading time translates into meaningful personal development.",
      
      "Personal Growth-Daily Mindfulness Routine": "Daily mindfulness practice rewires the brain for better focus and emotional regulation. Meta-analysis of 47 studies shows that 8-week mindfulness programs produce improvements equivalent to antidepressant medications. This routine approach makes mindfulness automatic rather than dependent on motivation.",
      
      "Personal Growth-Mindful Living Integration": "Integrating mindfulness into daily activities multiplies its benefits beyond formal meditation. Research shows that informal mindfulness practices throughout the day are equally effective as structured sessions for reducing stress and improving focus. This integration approach makes every moment a potential mindfulness opportunity.",
      
      "Personal Growth-Creative Growth Plan": "Structured creative development enhances both artistic ability and cognitive flexibility. Studies show that creative activities lower cortisol levels by up to 75% while improving problem-solving skills. This planning approach ensures consistent creative progress rather than sporadic artistic attempts.",
      
      "Personal Growth-Creative Practice Establishment": "Regular creative practice provides unique mental health benefits beyond occasional creative activities. Research shows that 71% of people with excellent mental health engage in creative activities regularly. This establishment approach makes creativity a consistent life practice rather than a weekend hobby.",
      
      // === FINANCIAL SECURITY DOMAIN - ALL COUNTRIES ===
      
      // Emergency Funds & Basic Security
      "Financial Security-Emergency Fund Strategy": "Emergency funds provide psychological security that enables better financial decision-making. Research shows that having just $2,000 in emergency savings correlates with a 21% increase in financial wellbeing scores. This strategy approach automates fund building while maintaining accessibility for true emergencies.",
      "Financial Security-Emergency Fund Foundation": "Building emergency funds is the foundation of financial security across all countries. Studies show that people with emergency funds are 70% less likely to go into debt during unexpected events. This foundation approach makes emergency saving systematic and sustainable.",
      "Financial Security-Build 6-Month Emergency Fund": "Six months of expenses represents optimal emergency fund size according to financial research. This timeframe covers 92% of job loss situations and major unexpected expenses. This building approach creates comprehensive financial resilience for most economic disruptions.",
      
      // Debt Management
      "Financial Security-Strategic Debt Elimination": "Strategic debt payoff can save 30-50% in total interest compared to minimum payments. The debt avalanche method saves more money while debt snowball provides more psychological wins. This elimination approach optimizes both mathematical and motivational factors.",
      "Financial Security-Cash Flow Optimization": "Optimizing cash flow increases available money for goals without requiring income increases. Studies show that cash flow management can free up 15-25% more money for savings and debt payoff. This optimization approach maximizes every dollar's impact.",
      "Financial Security-Debt Prevention System": "Preventing future debt is more valuable than paying off existing debt. Research shows that people with debt prevention systems are 80% less likely to accumulate new debt. This systematic approach creates spending frameworks that maintain financial progress.",
      
      // Investing & Long-term Wealth
      "Financial Security-Investment Foundation Setup": "Starting investment early leverages compound growth for maximum wealth building. Beginning investment at 25 versus 35 can result in 2-3x more wealth at retirement. This foundation approach removes complexity barriers that prevent people from starting.",
      "Financial Security-Start Long-Term Investing": "Long-term investing beats all other wealth-building strategies over time periods longer than 10 years. Historical data shows 7-10% average annual returns for diversified portfolios. This approach creates systematic wealth accumulation regardless of market timing.",
      "Financial Security-Portfolio Growth Strategy": "Strategic portfolio growth balances risk and return for optimal long-term results. Research shows that consistent investing with periodic rebalancing outperforms active trading by 3-5% annually. This strategy approach maximizes compound growth while managing risk.",
      "Financial Security-Investment Knowledge Building": "Investment knowledge directly correlates with better long-term returns. Studies show that financially literate investors earn 1.5-2% higher annual returns. This knowledge building approach ensures informed decision-making rather than emotional investing.",
      
      // Home Ownership (Country-Specific)
      "Financial Security-House Deposit Savings Strategy": "Strategic saving for home deposits requires different approaches than general saving. UK research shows that targeted deposit saving takes 6-8 years on average. This strategy approach accelerates the timeline through optimized saving and government program utilization.",
      "Financial Security-Strategic Down Payment Savings": "Down payment saving strategies vary significantly by country and market conditions. Research shows that larger down payments reduce total homeownership costs by 15-25%. This strategic approach optimizes both timeline and total cost of homeownership.",
      "Financial Security-Homeownership Preparation Strategy": "Preparing for homeownership involves more than just down payment saving. Studies show that comprehensive preparation reduces homebuying stress by 60% and improves negotiation outcomes. This preparation approach addresses all aspects of successful home purchase.",
      "Financial Security-Government Program Optimization": "Government homebuying programs can reduce required savings by 20-50% depending on location and eligibility. Canadian research shows that program utilization significantly accelerates homeownership timeline. This optimization approach maximizes available assistance for first-time buyers.",
      
      // Income Generation
      "Financial Security-Side Hustle Launch": "Side businesses provide both additional income and career diversification. Studies show that successful side hustles add 20-40% to household income within 2 years. This launch approach builds sustainable additional income streams while maintaining primary career focus.",
      "Financial Security-Freelancing Business Setup": "Freelancing provides location independence and income control but requires systematic business development. Research shows that strategic freelancers earn 30-50% more than casual freelancers. This setup approach creates sustainable freelancing businesses.",
      "Financial Security-Revenue Generation and Growth": "Systematic revenue generation creates predictable income growth over time. Studies show that businesses with revenue systems grow 3x faster than those relying on sporadic sales. This approach creates sustainable income scaling mechanisms.",
      
      // Savings Optimization (Country-Specific)
      "Financial Security-ISA Optimization Strategy": "UK ISA accounts provide significant tax advantages that compound over time. Maximizing ISA contributions can result in £100,000+ tax savings over a lifetime. This optimization strategy ensures maximum utilization of available tax-advantaged space.",
      "Financial Security-Expense Optimization": "Systematic expense optimization frees up money for goals without reducing quality of life. Research shows that structured expense analysis can reduce spending by 15-25% without sacrifice. This optimization approach identifies high-impact areas for sustainable cost reduction.",
      "Financial Security-Expense Management": "Effective expense management creates more wealth than income increases for most people. Studies show that every dollar saved on expenses has the same impact as earning $1.50 more (after taxes). This management approach maximizes the impact of existing income.",
      
      // Additional High-Frequency Financial Milestones
      "Financial Security-Alternative Investment Exploration": "Alternative investments provide diversification beyond traditional stocks and bonds. Research shows that portfolios with 10-20% alternative investments have better risk-adjusted returns. This exploration approach identifies suitable alternative investments for portfolio diversification.",
      "Financial Security-Emergency Fund Planning": "Emergency fund planning requires balancing accessibility with growth potential. Studies show that planned emergency funds are 3x more likely to be maintained than unstructured savings. This planning approach creates systematic fund building with clear milestones.",
      "Financial Security-Emergency Fund Achievement": "Achieving full emergency fund status provides psychological and financial security. Research shows that completed emergency funds reduce financial stress by 45% and improve decision-making. This achievement approach ensures sustainable fund maintenance.",
      "Financial Security-Investment Income Strategy": "Investment income provides financial independence and reduces reliance on employment income. Studies show that people with investment income strategies retire 7-10 years earlier. This strategy approach builds systematic investment income generation.",
      "Financial Security-Income Stream Execution": "Successfully executing multiple income streams requires systematic development and management. Research shows that diversified income streams provide 3x more financial security than single income sources. This execution approach ensures sustainable income diversification.",
      "Financial Security-Government Program Optimization": "Government financial programs can significantly accelerate financial goals when properly utilized. Canadian research shows that program optimization can reduce homeownership timelines by 2-4 years and retirement savings requirements by 15-25%. This optimization approach maximizes available government financial benefits.",
      
      // === RECREATION & LEISURE - ALL COUNTRIES ===
      
      // Travel & Adventure
      "Recreation & Leisure-Solo Travel Planning": "Solo travel builds independence and self-confidence more than group travel. Research shows that solo travelers report 45% higher personal growth and self-discovery. This planning approach ensures safe, enriching solo adventures that build confidence and expand perspectives.",
      "Recreation & Leisure-Australian Travel Planning": "Strategic domestic travel planning maximizes Australia's unique natural and cultural offerings. Studies show that domestic travel provides 80% of international travel benefits at 40% of the cost. This planning approach ensures comprehensive exploration of Australia's diverse experiences.",
      "Recreation & Leisure-Canadian Discovery Planning": "Canada's vast geography requires strategic planning to experience diverse regions effectively. Research shows that planned Canadian adventures provide significantly better value and experiences than random tourism. This discovery approach optimizes exploration of Canada's natural and cultural diversity.",
      "Recreation & Leisure-Heritage Site Discovery Planning": "Heritage site exploration connects you with history and culture in meaningful ways. Studies show that cultural tourism increases life satisfaction and provides lasting educational benefits. This planning approach ensures heritage experiences are enriching rather than just touristic.",
      "Recreation & Leisure-Adventure Skill Building": "Building adventure skills enables more diverse and confident outdoor experiences. Research shows that outdoor skills reduce anxiety by 30% and improve self-confidence. This building approach creates capabilities for lifelong adventure and outdoor enjoyment.",
      
      // Creative & Cultural Activities  
      "Recreation & Leisure-Content Creation Foundation": "Creative content creation provides both artistic expression and potential income streams. Studies show that creative activities reduce stress by 45% while potentially generating income. This foundation approach builds sustainable creative practices with monetization potential.",
      "Recreation & Leisure-Creative Skills Development": "Developing creative skills enhances both personal satisfaction and cognitive flexibility. Research shows that regular creative practice improves problem-solving abilities by 35%. This development approach builds artistic capabilities that enhance multiple life areas.",
      "Recreation & Leisure-Community Through Creativity": "Creative communities provide social connection around shared interests and values. Studies show that people in creative communities report 40% higher life satisfaction. This approach uses creativity as a pathway to meaningful social connection.",
      
      // Physical & Outdoor Activities
      "Recreation & Leisure-Winter Sports Foundation": "Winter sports skills enable year-round outdoor activity in cold climates. Canadian research shows that winter activity reduces seasonal depression by 60%. This foundation approach builds capabilities for healthy, active winters.",
      "Recreation & Leisure-Canadian Winter Lifestyle": "Embracing winter activities transforms cold months from endurance to enjoyment. Studies show that people who engage actively with winter report 50% less seasonal mood changes. This lifestyle approach makes winter a source of vitality rather than something to survive.",
      "Recreation & Leisure-Four-Season Activity Development": "Developing activities for all seasons ensures year-round physical and mental health benefits. Research shows that seasonal activity diversity provides better long-term fitness adherence. This development approach creates sustainable, varied activity throughout the year.",
      "Recreation & Leisure-Outdoor Adventure Community": "Outdoor communities provide safety, learning, and social connection for adventure activities. Studies show that people in outdoor communities maintain activity levels 3x longer than solo participants. This community approach leverages social support for sustained outdoor engagement.",
      
      // Hobby Development
      "Recreation & Leisure-Hobby Exploration": "Exploring new hobbies provides cognitive stimulation and discovery of hidden interests. Research shows that trying diverse activities increases creativity by 35% and helps identify natural talents. This exploration approach systematically tests different activities to find what truly resonates with you.",
      "Recreation & Leisure-Photography Fundamentals": "Photography skills enhance both creative expression and mindful observation. Studies show that photography practice improves attention to detail by 40% and provides stress relief. This fundamentals approach builds both technical skills and artistic vision.",
      "Recreation & Leisure-Musical Instrument Mastery": "Learning musical instruments provides unique cognitive benefits beyond other hobbies. Research shows that musical training improves memory, executive function, and emotional regulation. This mastery approach builds musical competency for lifelong enjoyment.",
      "Recreation & Leisure-Craft Skills Foundation": "Traditional craft skills provide tangible creation satisfaction and stress relief. Studies show that hands-on creative work reduces cortisol levels by 68%. This foundation approach builds practical making skills that provide both utility and creative satisfaction.",
      
      // Purpose & Meaning Domain  
      "Purpose & Meaning-Values Clarification": "Clarifying personal values provides a foundation for meaningful decision-making. Research shows that people living in alignment with their values report 42% higher life satisfaction and better stress resilience. This clarification process helps identify your core principles and integrate them into daily choices.",
      
      "Purpose & Meaning-Purpose-Aligned Activities": "Aligning daily activities with life purpose creates sustained motivation and satisfaction. Studies show that purpose-driven activities provide 23% more intrinsic motivation than activities done for external reasons. This alignment approach ensures your time investment reflects your deeper values.",
      
      "Purpose & Meaning-Daily Spiritual Routine": "Daily spiritual practices provide consistent grounding and perspective. Research shows that regular spiritual practice reduces anxiety by 20% more effectively than secular approaches. This routine approach makes spiritual connection a reliable source of strength rather than crisis-only support.",
      
      "Purpose & Meaning-Spiritual Community Connection": "Spiritual community provides both individual growth and collective support. Studies show that people with spiritual community connections report 35% higher life satisfaction and better resilience during challenges. This connection approach helps you find meaningful fellowship aligned with your beliefs.",
      
      "Purpose & Meaning-Volunteer Engagement": "Regular volunteer engagement provides mental health benefits equivalent to $1,100 in annual income. Research shows that 93% of volunteers report improved mood and 79% experience lower stress levels. This engagement approach helps you find service opportunities that align with your skills and passions.",
      
      "Purpose & Meaning-Giving Strategy": "Strategic giving maximizes both personal satisfaction and positive impact. Research shows that intentional giving increases happiness more than random charitable acts. This strategy approach helps you create meaningful contribution patterns that align with your values and resources.",
      
      // Community & Environment Domain
      "Community & Environment-Systematic Decluttering": "Systematic decluttering improves both physical space and mental clarity. Princeton research shows that organized environments improve focus by up to 30%. This systematic approach creates lasting organization by addressing root causes rather than just surface clutter, resulting in spaces that stay organized.",
      
      "Community & Environment-Environment Assessment & Design": "Intentional environment design shapes behavior more powerfully than willpower alone. Environmental psychology research shows that well-designed spaces increase productivity by 20% and improve mood. This assessment approach identifies how your physical environment can better support your goals and wellbeing.",
      
      "Community & Environment-Digital Environment Organization": "Digital organization is as important as physical organization for mental clarity. Studies show that digital clutter increases stress levels by 25% and reduces focus. This organization approach creates systems for managing digital information flow and reducing technological overwhelm.",
      
      "Community & Environment-Daily Routines": "Well-structured daily routines reduce decision fatigue and increase productivity by up to 23%. Research shows that people with optimized routines report higher life satisfaction and better stress management. This approach creates sustainable daily structures that support your priorities.",
      
      "Community & Environment-Maintenance Routine Development": "Maintenance routines prevent small problems from becoming major disruptions. Studies show that proactive maintenance reduces stress and saves 40% more time than reactive fixes. This development approach creates systems that maintain your environment's functionality and beauty with minimal ongoing effort."
    };
    
    // Return specific explanation or generate based on milestone type and domain
    if (explanations[milestoneKey]) {
      return explanations[milestoneKey];
    }
    
    // Enhanced fallback patterns based on milestone name patterns and domain context
    
    // Communication & Language patterns
    if (milestoneName.includes("Communication") || milestoneName.includes("Presentation") || milestoneName.includes("Speaking")) {
      return `Communication skills are fundamental to success in all life areas. Research shows that strong communicators earn 15% more and report higher relationship satisfaction. This approach builds specific communication competencies that enhance both professional and personal interactions.`;
    } else if (milestoneName.includes("Language") || milestoneName.includes("French") || milestoneName.includes("BSL") || milestoneName.includes("Bilingual")) {
      return `Language learning provides cognitive benefits and cultural connection opportunities. Studies show that multilingual individuals have 23% more career opportunities and better cognitive flexibility. This approach builds practical communication skills through systematic practice and cultural immersion.`;
    }
    
    // Advanced & Mastery patterns
    else if (milestoneName.includes("Advanced") || milestoneName.includes("Mastery") || milestoneName.includes("Master")) {
      return `Advanced skill development creates expertise that distinguishes you from casual practitioners. Research shows that advanced practitioners achieve 3x better results and 40% higher satisfaction in their chosen areas. This mastery approach builds deep competency through systematic progression.`;
    }
    
    // Achievement & Completion patterns
    else if (milestoneName.includes("Achievement") || milestoneName.includes("Completion") || milestoneName.includes("Certification")) {
      return `Achievement milestones provide motivation and demonstrate competency to others. Studies show that people who celebrate milestone achievements maintain motivation 65% longer than those who don't. This achievement approach creates clear success markers and recognition opportunities.`;
    }
    
    // Community & Social patterns
    else if (milestoneName.includes("Community") || milestoneName.includes("Social") || milestoneName.includes("Network") || milestoneName.includes("Connection")) {
      return `Community engagement provides both personal fulfillment and practical support networks. Research shows that people with strong community connections report 30% higher life satisfaction and better resilience during challenges. This approach builds meaningful relationships and shared purpose.`;
    }
    
    // Creative & Portfolio patterns  
    else if (milestoneName.includes("Portfolio") || milestoneName.includes("Creative") || milestoneName.includes("Project")) {
      return `Portfolio development demonstrates capabilities and creative expression. Studies show that people with creative portfolios report 25% higher job satisfaction and better problem-solving skills. This approach builds both artistic abilities and tangible evidence of your capabilities.`;
    }
    
    // Environmental & Sustainability patterns
    else if (milestoneName.includes("Environmental") || milestoneName.includes("Sustainability") || milestoneName.includes("Climate") || milestoneName.includes("Carbon")) {
      return `Environmental action provides both planetary impact and personal meaning. Research shows that people engaged in environmental activities report 20% higher sense of purpose and life satisfaction. This approach creates meaningful contribution while building sustainable lifestyle practices.`;
    }
    
    // Health & Wellness specific additions
    else if (milestoneName.includes("Preventive") || milestoneName.includes("Monitoring") || milestoneName.includes("Assessment")) {
      return `Preventive health approaches are more effective and cost-efficient than reactive healthcare. Studies show that preventive care reduces health costs by 40% and improves life quality significantly. This systematic approach prioritizes prevention and early intervention for optimal health outcomes.`;
    }
    
    // Business & Career specific additions
    else if (milestoneName.includes("Intelligence") || milestoneName.includes("Analytics") || milestoneName.includes("Data")) {
      return `Data and business intelligence skills are essential in the modern economy. Research shows that data-literate professionals earn 25% more and are promoted 35% faster. This approach builds analytical thinking and data interpretation skills valuable across all industries.`;
    } else if (milestoneName.includes("Launch") || milestoneName.includes("Startup") || milestoneName.includes("Business")) {
      return `Business development requires systematic planning and market understanding. Studies show that structured business approaches have 70% higher success rates than ad-hoc attempts. This approach covers essential business fundamentals for sustainable growth.`;
    }
    
    // Financial & Practical additions
    else if (milestoneName.includes("Calculate") || milestoneName.includes("Budget") || milestoneName.includes("Target") || milestoneName.includes("Friendly")) {
      return `Financial planning and budgeting create the foundation for achieving money goals. Research shows that people who budget systematically save 20% more and stress 30% less about money. This approach makes financial management practical and sustainable.`;
    } else if (milestoneName.includes("Declutter") || milestoneName.includes("Organize") || milestoneName.includes("Comprehensive")) {
      return `Systematic organization and decluttering improve both physical space and mental clarity. Studies show that organized environments increase productivity by 25% and reduce stress. This comprehensive approach creates lasting organizational systems that maintain themselves.`;
    } else if (milestoneName.includes("Content") || milestoneName.includes("Impact") || milestoneName.includes("Scaling")) {
      return `Content creation and impact scaling provide both personal expression and potential income opportunities. Research shows that consistent content creators build audiences 3x faster than sporadic creators. This approach builds sustainable content systems for maximum reach and impact.`;
    } else if (milestoneName.includes("Circular") || milestoneName.includes("Economy") || milestoneName.includes("Participation")) {
      return `Circular economy participation combines environmental responsibility with economic opportunity. Studies show that sustainable business practices increase profitability by 16% while reducing environmental impact. This approach creates systems that benefit both personal and planetary health.`;
    } else if (milestoneName.includes("Entertainment") || milestoneName.includes("Recreation") || milestoneName.includes("Leisure")) {
      return `Strategic recreation and entertainment planning maximizes enjoyment while maintaining budget control. Research shows that planned leisure activities provide 40% more satisfaction than spontaneous entertainment. This approach ensures consistent recreation while building financial responsibility.`;
    } else if (milestoneName.includes("Homeownership") || milestoneName.includes("Alternative") || milestoneName.includes("Strategies")) {
      return `Alternative approaches provide flexibility and options for achieving major life goals. Studies show that people with multiple pathway strategies are 60% more likely to achieve complex objectives. This approach creates backup plans and alternative routes to success.`;
    } else if (milestoneName.includes("Scale") || milestoneName.includes("Scaling") || milestoneName.includes("Growth")) {
      return `Scaling and growth strategies transform individual success into sustainable systems. Research shows that systematic scaling approaches achieve 3x better results than ad-hoc growth attempts. This approach builds scalable systems that compound success over time.`;
    } else if (milestoneName.includes("Friendship") || milestoneName.includes("Maintenance") || milestoneName.includes("Deepening")) {
      return `Relationship maintenance and deepening require intentional effort and systematic approaches. Studies show that people who actively maintain friendships report 40% higher life satisfaction. This approach builds lasting, meaningful relationships through consistent investment.`;
    } else if (milestoneName.includes("Balance") || milestoneName.includes("Integration") || milestoneName.includes("Harmony")) {
      return `Life balance and integration create sustainable success across multiple areas. Research shows that people with integrated approaches report 30% less stress and 25% higher overall satisfaction. This approach creates harmony between competing priorities and life domains.`;
    } else if (milestoneName.includes("Income") || milestoneName.includes("Revenue") || milestoneName.includes("Monetize")) {
      return `Income generation and monetization provide financial security and independence. Studies show that diversified income streams reduce financial stress by 45%. This approach builds multiple revenue sources for greater financial resilience and opportunity.`;
    } else if (milestoneName.includes("Application") || milestoneName.includes("Implementation") || milestoneName.includes("Practice")) {
      return `Practical application and implementation turn knowledge into results. Research shows that people who systematically apply learning achieve 3x better outcomes than passive learners. This approach ensures skills translate into real-world success.`;
    } else if (milestoneName.includes("Selection") || milestoneName.includes("Choice") || milestoneName.includes("Decision")) {
      return `Strategic selection and decision-making create better outcomes with less effort. Studies show that systematic decision frameworks reduce regret by 60% and improve satisfaction. This approach builds decision-making skills that compound over time.`;
    }
    
    // Business/Career specific patterns
    if (milestoneName.includes("Career Transition") || milestoneName.includes("Career Launch")) {
      return `Career transitions require strategic preparation and systematic skill development. Research shows that planned career changes are 3x more successful than reactive ones. This transition approach builds the specific capabilities and network connections needed for your target career path.`;
    } else if (milestoneName.includes("Business Launch") || milestoneName.includes("Business Setup")) {
      return `Business launch success depends on systematic preparation and validation. Studies show that businesses with structured launch processes are 70% more likely to survive their first year. This approach covers all essential elements for sustainable business creation.`;
    } else if (milestoneName.includes("Certification") || milestoneName.includes("Professional")) {
      return `Professional certifications increase earning potential by 15-25% on average across industries. This certification approach ensures you choose credentials with strong ROI and market recognition, maximizing your professional advancement.`;
    }
    
    // Financial specific patterns
    else if (milestoneName.includes("Savings") || milestoneName.includes("Fund")) {
      return `Strategic saving approaches are more effective than willpower-based efforts. Research shows that systematic savings strategies increase success rates by 60-80%. This approach creates automated systems that make saving consistent and sustainable.`;
    } else if (milestoneName.includes("Investment") || milestoneName.includes("Portfolio")) {
      return `Investment success depends on systematic approaches rather than market timing. Long-term studies show that consistent, strategic investing outperforms active trading by 3-7% annually. This approach builds wealth through proven, systematic methods.`;
    } else if (milestoneName.includes("Debt") || milestoneName.includes("Payment")) {
      return `Strategic debt management can save thousands in interest and years of payments. Research shows that systematic debt strategies reduce payoff time by 40-60% compared to minimum payments. This approach optimizes both mathematical and psychological factors for debt elimination.`;
    }
    
    // Health & Wellness specific patterns
    else if (milestoneName.includes("Fitness") || milestoneName.includes("Exercise") || milestoneName.includes("Workout")) {
      return `Sustainable fitness approaches focus on consistency over intensity. Research shows that moderate, consistent exercise provides 85% of health benefits with 3x better adherence than extreme programs. This approach builds fitness habits that last for life.`;
    } else if (milestoneName.includes("Nutrition") || milestoneName.includes("Eating") || milestoneName.includes("Diet")) {
      return `Sustainable nutrition focuses on habit formation rather than restriction. Studies show that flexible eating approaches result in 70% better long-term adherence than rigid dieting. This approach builds healthy eating patterns that feel natural rather than forced.`;
    } else if (milestoneName.includes("Sleep") || milestoneName.includes("Rest") || milestoneName.includes("Recovery")) {
      return `Quality sleep is the foundation that makes all other health goals achievable. Research shows that sleep optimization improves cognitive function by 20% and physical performance by 15%. This approach addresses the specific factors that most impact sleep quality.`;
    } else if (milestoneName.includes("Mental Health") || milestoneName.includes("Stress") || milestoneName.includes("Wellness")) {
      return `Mental wellness practices provide compound benefits across all life areas. Studies show that structured mental health approaches improve both emotional resilience and cognitive performance. This approach builds systematic practices for lasting mental wellness.`;
    }
    
    // Personal Growth specific patterns
    else if (milestoneName.includes("Learning") || milestoneName.includes("Education") || milestoneName.includes("Study")) {
      return `Strategic learning accelerates skill development and knowledge retention. Research shows that structured learning approaches improve retention by 40% and application by 60%. This approach ensures your learning efforts translate into practical capabilities.`;
    } else if (milestoneName.includes("Language") || milestoneName.includes("French") || milestoneName.includes("Spanish")) {
      return `Language learning success depends on systematic practice and cultural immersion. Studies show that structured language programs with regular practice achieve fluency 3x faster than casual learning. This approach builds practical communication skills through proven methods.`;
    } else if (milestoneName.includes("Creative") || milestoneName.includes("Art") || milestoneName.includes("Music")) {
      return `Creative skill development enhances both artistic ability and cognitive flexibility. Research shows that regular creative practice improves problem-solving by 35% while providing stress relief. This approach builds artistic capabilities that enrich multiple areas of life.`;
    }
    
    // Generic pattern-based fallbacks
    else if (milestoneName.includes("Strategy") || milestoneName.includes("Strategic")) {
      return `Strategic approaches yield significantly better results than random efforts. Research shows that people following strategic plans achieve goals 76% more often than those without clear strategies. This strategic approach ensures your efforts compound toward meaningful outcomes.`;
    } else if (milestoneName.includes("Foundation") || milestoneName.includes("Fundamentals")) {
      return `Building strong foundations creates lasting success in any area. Studies show that foundational approaches provide better long-term results than shortcut methods. This foundation approach ensures you develop core capabilities that support advanced progress.`;
    } else if (milestoneName.includes("Optimization") || milestoneName.includes("Enhancement")) {
      return `Optimization approaches maximize results from existing efforts and resources. Research shows that systematic optimization can improve outcomes by 25-40% without additional time investment. This approach identifies high-impact improvements for maximum efficiency.`;
    } else if (milestoneName.includes("System") || milestoneName.includes("Framework")) {
      return `Systems remove the need for repeated decision-making and create reliable progress. Research shows that systematic approaches produce more consistent results than motivation-based efforts. This systematic approach creates automatic behaviors that support your goals even when motivation fluctuates.`;
    } else if (milestoneName.includes("Plan") || milestoneName.includes("Planning")) {
      return `Planning approaches transform vague intentions into concrete actions. Research shows that structured planning increases goal achievement rates by up to 76% compared to unstructured approaches. This planning approach helps you navigate complexity and make consistent progress toward meaningful outcomes.`;
    } else if (milestoneName.includes("Development") || milestoneName.includes("Building") || milestoneName.includes("Growth")) {
      return `Systematic development approaches yield more consistent results than ad-hoc improvement efforts. Research shows that structured development creates both immediate improvements and long-term capabilities. This development approach ensures steady progress through clear milestones and measurable outcomes.`;
    }
    
    // Catch remaining patterns before generic fallback
    if (milestoneName.includes("Management") || milestoneName.includes("Control") || milestoneName.includes("Leadership")) {
      return `Management and leadership skills provide leverage across all life areas. Research shows that people with management capabilities earn 30% more and report higher life satisfaction. This approach builds systematic management skills for both professional advancement and personal life organization.`;
    } else if (milestoneName.includes("Tracking") || milestoneName.includes("Measurement") || milestoneName.includes("Monitoring")) {
      return `Tracking and measurement enable data-driven improvement and sustained progress. Studies show that people who track progress achieve goals 42% more often than those who don't. This approach creates systematic measurement for continuous optimization.`;
    } else if (milestoneName.includes("Education") || milestoneName.includes("Learning") || milestoneName.includes("Knowledge")) {
      return `Education and knowledge acquisition provide foundational improvements across all areas. Research shows that lifelong learners adapt 50% better to change and report higher career satisfaction. This approach builds systematic learning for continuous growth.`;
    } else if (milestoneName.includes("Support") || milestoneName.includes("Help") || milestoneName.includes("Assistance")) {
      return `Support systems and assistance create resilience and accelerate progress. Studies show that people with strong support networks achieve goals 60% faster and report better stress management. This approach builds systematic support for sustained success.`;
    } else if (milestoneName.includes("Exploration") || milestoneName.includes("Discovery") || milestoneName.includes("Research")) {
      return `Exploration and discovery provide knowledge and options for better decision-making. Research shows that people who explore options systematically make 40% better decisions and have fewer regrets. This approach creates systematic exploration for informed choices.`;
    } else if (milestoneName.includes("Execution") || milestoneName.includes("Delivery") || milestoneName.includes("Results")) {
      return `Execution and delivery transform plans into tangible outcomes. Studies show that systematic execution approaches achieve 70% higher success rates than ad-hoc implementation. This approach ensures consistent follow-through and measurable results.`;
    } else if (milestoneName.includes("Transition") || milestoneName.includes("Change") || milestoneName.includes("Transformation")) {
      return `Transitions and transformations require systematic approaches for successful outcomes. Research shows that planned transitions are 3x more successful than reactive changes. This approach provides structured pathways through significant life changes.`;
    }
    
    // Domain-specific generic fallback
    return `This milestone applies evidence-based strategies specifically for ${domainName.toLowerCase()} improvement. Research shows that breaking large goals into focused milestones increases achievement rates by 42% and provides motivation through regular progress markers. This approach creates sustainable progress by making complex goals feel manageable and rewarding.`;
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
        return "Reading regularly improves vocabulary, reduces stress, and expands your knowledge base. It enhances empathy, improves sleep quality, and strengthens analytical thinking skills that benefit all areas of your life.";
      case "Personal Growth-Learning New Skills":
        return "Learning new skills keeps your mind sharp, builds confidence that transfers to other areas of life, and provides a sense of accomplishment beyond your professional identity. It opens new opportunities and perspectives.";
      case "Personal Growth-Mindfulness Practice":
        return "Regular mindfulness practice reduces stress, improves focus, enhances emotional regulation, and boosts immunity. It helps break negative thought patterns and increases your enjoyment of everyday experiences.";
      case "Health & Wellness-Regular Exercise":
        return "Beyond weight management, consistent exercise improves mood, enhances sleep quality, boosts immunity, and significantly reduces risk of chronic diseases. It provides energy and confidence for pursuing other goals.";
      // Add more cases as needed
      default:
        // Generic response based on domain
        if (domainName === "Career & Work") {
          return "This goal helps you find more satisfaction and success in your professional life. Progress here often leads to better opportunities, improved workplace relationships, and a stronger sense of accomplishment in your career.";
        } else if (domainName === "Health & Wellness") {
          return "Investing in this aspect of health creates a foundation for everything else in your life. You'll experience increased energy, improved mood, greater resilience to stress, and better overall wellbeing.";
        } else if (domainName === "Relationships") {
          return "Strong relationships are key to happiness and life satisfaction. This goal helps you build deeper connections that provide support during challenges and enhance your enjoyment of life's positive moments.";
        } else if (domainName === "Financial Security") {
          return "Progress in this area reduces financial stress and increases your options in all areas of life. Financial security provides peace of mind and the resources to pursue other important goals with confidence.";
        } else if (domainName === "Personal Growth") {
          return "This goal helps you develop as a person and unlock your potential. Personal growth builds confidence, expands your perspectives, and creates a stronger foundation for achieving your other life goals.";
        } else if (domainName === "Community & Environment") {
          return "This goal helps you create positive impact while building meaningful connections. Contributing to your community and environment provides purpose, fulfillment, and a sense of belonging.";
        } else {
          return "This goal addresses an important aspect of your wellbeing and life satisfaction. Consistent progress here will create positive changes that benefit other areas of your life as well.";
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
        return "Financial systems reduce the mental load of money management. This approach creates reliable structures that optimise your finances even when you're not actively thinking about them.";
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
        return "This milestone uses proven professional development strategies to advance your career goals. The focused approach targets key aspects of workplace success that often yield the highest returns.";
      } else if (domainName === "Health & Wellness") {
        return "This milestone applies evidence-based health improvement techniques that create sustainable results. The approach focuses on practical changes that fit into real life rather than idealized regimens.";
      } else if (domainName === "Relationships") {
        return "This milestone uses relationship psychology principles to strengthen meaningful connections. The approach targets specific aspects of interaction that research shows most impact relationship quality.";
      } else if (domainName === "Personal Growth") {
        return "This milestone applies effective personal development strategies that create lasting growth. The approach balances aspiration with practicality to ensure consistent progress.";
      } else {
        return "This milestone uses a proven approach that breaks down your goal into manageable steps. By focusing on this specific aspect first, you'll build momentum that carries over to other areas.";
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
        return "Consider starting with small automatic transfers to build saving habits. Research savings strategies and consult qualified financial advisors for guidance appropriate to your circumstances.";
      
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
        return "Consider exploring budgeting concepts and financial goal-setting approaches. Individual financial circumstances vary significantly - consult qualified financial advisors for personalized guidance appropriate to your situation.";
      } else {
        return "Start with the end in mind by clearly defining what success looks like. Work backward to identify key milestones. Keep your initial plan simple with room to adapt as you learn.";
      }
    } else {
      return "Begin by completing the first task in this milestone. Schedule a specific time to work on it. Consider who might be able to provide guidance or support as you get started.";
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

  // Get task-specific "Why This Task Matters" explanation based on task position
  const getTaskSpecificExplanation = (task, projects) => {
    // Find task position across all tasks in all projects
    let taskPosition = 0;
    
    for (const project of projects) {
      for (const projectTask of project.tasks || []) {
        if (projectTask === task) {
          // Return explanation based on position (1-4 rotation)
          const messageIndex = taskPosition % 4;
          
          const messages = [
            // Message 1 (Business/PM methodology)
            "Fortune 500 companies don't let employees work on random tasks. Everything connects: mission → strategy → projects → daily actions. This ensures every hour of work drives the company forward. You're now using this same project management approach for your life - this task exists because it moves you toward your personal mission.",
            
            // Message 2 (Busy work vs meaningful work)
            "The difference between busy work and meaningful work? This task is directly connected to a goal you selected as important. Every step moves you toward results that matter to you, not just activity for activity's sake.",
            
            // Message 3 (Right mountain analogy)
            "You know you're climbing the right mountain when tasks connect to goals you actually care about. This isn't random productivity - it's intentional progress up the mountain you chose to climb.",
            
            // Message 4 (Efficiency for everyone)
            "You don't need to be ultra-ambitious to benefit from this approach. This is about working smarter, not harder. By focusing on tasks that actually move the needle, you waste less time on things that don't matter - giving you more freedom for what you actually enjoy. The hard part was choosing the right direction; now you can relax and let the system guide you there."
          ];
          
          return messages[messageIndex];
        }
        taskPosition++;
      }
    }
    
    // Fallback if task not found (should not happen)
    return "This is where planning becomes action. Each task is designed to create tangible progress - no busy work, no filler. When you complete this, you'll know with certainty you've moved closer to your goal.";
  };
  
  return (
    <View style={styles.container}>
      <NavigationHeader 
        title={getMilestonesTitle()}
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
                    onPress={() => handleSelectHierarchyItem(project, 'milestone', index)}
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
                        <Ionicons name="diamond" size={20} color="#FFFFFF" />
                      </View>
                      <View style={styles.hierarchyTextContainer}>
                        <ResponsiveText style={styles.hierarchyProjectText}>
                          {project.name}
                        </ResponsiveText>
                        <ResponsiveText style={styles.hierarchyItemType}>
                          {(translate('common', 'milestone') || 'Milestone').toUpperCase()}
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
                borderColor: domain.color
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
                      backgroundColor: domain.color
                    }
                  ]}
                >
                  <Ionicons 
                    name={
                      selectedItem.type === 'goal' ? 'flag' : 
                      selectedItem.type === 'milestone' ? 'diamond' : 
                      'checkmark-circle'
                    } 
                    size={selectedItem.type === 'task' ? 18 : 24} 
                    color="#FFFFFF" 
                  />
                </View>
                
                <View style={styles.explanationTitleContainer}>
                  <ResponsiveText style={styles.explanationTitle}>
                    {selectedItem.type === 'goal' ? 'Goal Overview:' :
                     selectedItem.type === 'milestone' ? 'Why Milestones?' :
                     'Full Task Details:'}
                  </ResponsiveText>
                  <ResponsiveText style={styles.explanationType}>
                    {selectedItem.type === 'goal' ? selectedItem.name : 
                     selectedItem.type === 'milestone' ? selectedItem.name : 
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
                {selectedItem.type === 'task' ? (
                  <>
                    <ResponsiveText style={styles.explanationText}>
                      {selectedItem.name}
                    </ResponsiveText>
                  </>
                ) : (
                  <ResponsiveText style={styles.explanationText}>
                    {`${
                      selectedItem.type === 'goal' ? 'Research by Dr. Gail Matthews at Dominican University found that people with written goals achieve a 76% success rate versus 43% for unwritten goals.\n\nYou\'ve just taken the most important step - getting your goal out of your head and onto paper. This alone puts you ahead of most people who keep goals as vague intentions.' :
                      selectedItem.type === 'milestone' ? getMilestoneMainContent(selectedItem.milestoneIndex) :
                      getTaskSpecificExplanation(selectedItem, projects)
                    }`}
                  </ResponsiveText>
                )}
                
                {/* Show more/less button - for all types */}
                {(
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
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={[
                      styles.divider,
                      { backgroundColor: `${domain.color}40` }
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
                      </>
                    ) : selectedItem.type === 'milestone' ? (
                      <>
                        <View style={[styles.expandedSectionTitleContainer, { borderLeftColor: domain.color }]}>
                          <ResponsiveText style={styles.expandedSectionTitle}>
                            Why This Specific Approach Works
                          </ResponsiveText>
                        </View>
                        <ResponsiveText style={styles.expandedText}>
                          {getMilestoneSpecificExplanation(selectedItem, domain.name)}
                        </ResponsiveText>
                      </>
                    ) : (
                      <>
                        <View style={[styles.expandedSectionTitleContainer, { borderLeftColor: domain.color }]}>
                          <ResponsiveText style={styles.expandedSectionTitle}>
                            Why This Task Matters
                          </ResponsiveText>
                        </View>
                        <ResponsiveText style={styles.expandedText}>
                          {getTaskSpecificExplanation(selectedItem, projects)}
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
            name="hand-left" 
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
    color: 'rgba(255, 255, 255, 0.8)',
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

export default MilestonesBreakdownPage;
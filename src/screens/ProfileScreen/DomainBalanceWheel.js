// src/screens/ProfileScreen/DomainBalanceWheel.js
import React, { useState, useEffect, useRef } from 'react';
import FeatureExplorerTracker from '../../services/FeatureExplorerTracker';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  Vibration,
  Platform,
  AccessibilityInfo,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import SectionHeader from './SectionHeader';
import Svg, { 
  Path, 
  G, 
  Circle, 
  Text as SvgText
} from 'react-native-svg';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Define domain data to match DomainSelectionPage
// Only include domains you want to appear in the wheel
const WHEEL_DOMAINS = [
  {
    name: "Career & Work",
    icon: "briefcase",
    color: "#4f46e5", // Indigo
    description: "Focusing on your professional development, workplace satisfaction, and career progression."
  },
  {
    name: "Health & Wellness",
    icon: "fitness",
    color: "#06b6d4", // Cyan
    description: "Prioritizing physical fitness, nutrition, sleep quality, and overall mental well-being."
  },
  {
    name: "Relationships",
    icon: "people",
    color: "#ec4899", // Pink
    description: "Strengthening connections with family, friends, romantic partners, and building meaningful social bonds."
  },
  {
    name: "Personal Growth",
    icon: "school",
    color: "#8b5cf6", // Violet
    description: "Developing new skills, expanding knowledge, and fostering character development."
  },
  {
    name: "Financial Security",
    icon: "cash",
    color: "#10b981", // Emerald
    description: "Managing money effectively, building savings, making smart investments, and working toward financial freedom."
  },
  {
    name: "Recreation & Leisure",
    icon: "bicycle",
    color: "#f59e0b", // Amber
    description: "Making time for hobbies, fun activities, relaxation, and travel that bring joy and balance."
  },
  {
    name: "Purpose & Meaning",
    icon: "compass",
    color: "#ef4444", // Red
    description: "Exploring spirituality, contributing to causes you care about, and aligning actions with your values."
  },
  {
    name: "Community & Environment",
    icon: "home",
    color: "#6366f1", // Indigo/purple
    description: "Building community connections, improving your environment, and organizing your spaces for wellbeing."
  }
  // Note: "Other" domain is not included in the wheel but still available for goal creation
];

// Main component
const DomainBalanceWheel = ({ theme, navigation }) => {
  // Get screen dimensions and insets
  const { width, height } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  
  // Calculate responsive dimensions
  const WHEEL_SIZE = Math.min(width * 0.85, 340);
  const SVG_CONTAINER_SIZE = WHEEL_SIZE * 1.2;
  const WHEEL_STROKE_WIDTH = 0.5;
  const ACTIVE_STROKE_WIDTH = 2;
  const CENTER_RADIUS = WHEEL_SIZE * 0.12;
  const DOMAIN_LABEL_RADIUS = WHEEL_SIZE * 0.5 + 25;
  const ICON_SIZE = 24;
  const ICON_RADIUS = WHEEL_SIZE * 0.35; // 35% from center to edge
  
  // Minimum slice percentage for visibility
  const MIN_SLICE_PERCENTAGE = 3;
  
  // State
  const [domains, setDomains] = useState([]);
  const [activeOnlyDomains, setActiveOnlyDomains] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [balanceView, setBalanceView] = useState(true); // Equal Domain Balance is the default view
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedDomain, setHighlightedDomain] = useState(null);
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [showLabels, setShowLabels] = useState(true); // Toggle for domain labels visibility
  
  // Animation
  const wheelRotation = useRef(new Animated.Value(0)).current;
  const [fadingOutDomain, setFadingOutDomain] = useState(null);
  const fadeOutProgress = useRef(new Animated.Value(0)).current;
  
  // Theme detection
  const isDarkMode = theme.background === '#000000';

  // Get app context
  const { 
    goals = [], 
    mainGoals = [], 
    refreshDomains 
  } = useAppContext();

  // Get unique domain names from WHEEL_DOMAINS array
  const uniqueDomainNames = WHEEL_DOMAINS.map(domain => domain.name);
  
  // Helper functions for creating wheel slices
  // Create a circle path (for single domain case)
  const createCirclePath = () => {
    const radius = (WHEEL_SIZE - WHEEL_STROKE_WIDTH * 2) / 2;
    return `M 0, -${radius} 
            A ${radius}, ${radius} 0 1 1 0, ${radius} 
            A ${radius}, ${radius} 0 1 1 0, -${radius}
            L 0, -${CENTER_RADIUS}
            A ${CENTER_RADIUS}, ${CENTER_RADIUS} 0 1 0 0, ${CENTER_RADIUS}
            A ${CENTER_RADIUS}, ${CENTER_RADIUS} 0 1 0 0, -${CENTER_RADIUS}
            Z`;
  };

  // Create a path for a slice
  const createSlicePath = (startAngle, endAngle) => {
    const startAngleRad = (startAngle - 90) * Math.PI / 180;
    const endAngleRad = (endAngle - 90) * Math.PI / 180;
    
    const outerRadius = WHEEL_SIZE / 2 - WHEEL_STROKE_WIDTH;
    const innerRadius = CENTER_RADIUS;
    
    const startOuterX = outerRadius * Math.cos(startAngleRad);
    const startOuterY = outerRadius * Math.sin(startAngleRad);
    const endOuterX = outerRadius * Math.cos(endAngleRad);
    const endOuterY = outerRadius * Math.sin(endAngleRad);
    
    const startInnerX = innerRadius * Math.cos(startAngleRad);
    const startInnerY = innerRadius * Math.sin(startAngleRad);
    const endInnerX = innerRadius * Math.cos(endAngleRad);
    const endInnerY = innerRadius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `
      M ${startOuterX} ${startOuterY}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}
      L ${endInnerX} ${endInnerY}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInnerX} ${startInnerY}
      Z
    `;
  };

  // Calculate centroid position
  const calculateCentroid = (angle, radius) => {
    const angleRad = (angle - 90) * Math.PI / 180;
    const x = radius * Math.cos(angleRad);
    const y = radius * Math.sin(angleRad);
    return [x, y];
  };
  
  // Check if screen reader is enabled for accessibility adjustments
  useEffect(() => {
    let isMounted = true;
    
    const checkScreenReader = async () => {
      try {
        const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
        if (isMounted) {
          setIsScreenReaderEnabled(screenReaderEnabled);
        }
      } catch (error) {
        console.error('Error checking screen reader:', error);
      }
    };
    
    checkScreenReader();
    
    // Subscribe to screen reader changes
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => {
        if (isMounted) {
          setIsScreenReaderEnabled(enabled);
        }
      }
    );
    
    return () => {
      isMounted = false;
      // Clean up subscription
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  // Process goals to calculate domain distributions
  useEffect(() => {
    if (!goals || !mainGoals) return;
    
    const calculateDomains = () => {
      setIsLoading(true);
      
      try {
        // Calculate domains from goals
        const domainMap = {};
        
        // Initialize domain map with only wheel domains
        WHEEL_DOMAINS.forEach(domain => {
          domainMap[domain.name] = {
            id: domain.name,
            name: domain.name,
            icon: domain.icon,
            color: domain.color,
            goalCount: 0,
            completedGoalCount: 0,
            activeGoalCount: 0,
            upcomingDeadlines: 0,
            inactiveForDays: 0,
            description: domain.description || ''
          };
        });
        
        const now = new Date();
        const goalsToUse = Array.isArray(mainGoals) && mainGoals.length > 0 ? mainGoals : goals;
        
        // Process each goal
        goalsToUse.forEach(goal => {
          if (!goal) return;
          
          let domainName = null;
          
          // Check for explicit domain
          if (goal.domain) {
            // Find matching wheel domain (case-insensitive)
            const matchingDomain = uniqueDomainNames.find(
              name => name.toLowerCase() === goal.domain.toLowerCase()
            );
            
            if (matchingDomain) {
              domainName = matchingDomain;
            }
          }
          
          // If no domain name found, check icon
          if (!domainName && goal.icon) {
            const foundDomain = WHEEL_DOMAINS.find(d => d.icon === goal.icon);
            if (foundDomain) {
              domainName = foundDomain.name;
            }
          }
          
          // Only process goals that match our wheel domains
          if (domainName && domainMap[domainName]) {
            const isCompleted = goal.completed === true;
            
            // Check for upcoming deadlines (within 7 days)
            if (goal.targetDate && !isCompleted) {
              const daysUntilDeadline = Math.floor((new Date(goal.targetDate) - now) / (1000 * 60 * 60 * 24));
              if (daysUntilDeadline >= 0 && daysUntilDeadline <= 7) {
                domainMap[domainName].upcomingDeadlines++;
              }
            }
            
            // Check for inactivity (no updates in 30+ days)
            if (goal.updatedAt && !isCompleted) {
              const daysSinceUpdate = Math.floor((now - new Date(goal.updatedAt)) / (1000 * 60 * 60 * 24));
              if (daysSinceUpdate > 30) {
                domainMap[domainName].inactiveForDays = Math.max(domainMap[domainName].inactiveForDays, daysSinceUpdate);
              }
            }
            
            domainMap[domainName].goalCount++;
            if (isCompleted) {
              domainMap[domainName].completedGoalCount++;
            } else {
              domainMap[domainName].activeGoalCount++;
            }
          }
        });
        
        const calculatedDomains = Object.values(domainMap);
        const totalGoals = calculatedDomains.reduce((sum, domain) => sum + domain.goalCount, 0);
        const domainsWithPercentages = ensureMinimumVisibility(calculatedDomains, totalGoals);
        
        setDomains(domainsWithPercentages);
        
        // Now calculate domains with active goals only
        const activeOnlyDomainMap = {};
        
        // Initialize with wheel domains
        WHEEL_DOMAINS.forEach(domain => {
          activeOnlyDomainMap[domain.name] = {
            id: domain.name,
            name: domain.name,
            icon: domain.icon,
            color: domain.color,
            goalCount: 0,
            completedGoalCount: 0,
            activeGoalCount: 0,
            upcomingDeadlines: 0,
            inactiveForDays: 0,
            description: domain.description || ''
          };
        });
        
        // Process only active goals
        goalsToUse.forEach(goal => {
          if (!goal || goal.completed === true) return;
          
          let domainName = null;
          
          // Check for explicit domain
          if (goal.domain) {
            const matchingDomain = uniqueDomainNames.find(
              name => name.toLowerCase() === goal.domain.toLowerCase()
            );
            
            if (matchingDomain) {
              domainName = matchingDomain;
            }
          }
          
          // If no domain name found, check icon
          if (!domainName && goal.icon) {
            const foundDomain = WHEEL_DOMAINS.find(d => d.icon === goal.icon);
            if (foundDomain) {
              domainName = foundDomain.name;
            }
          }
          
          // Only process goals that match our wheel domains
          if (domainName && activeOnlyDomainMap[domainName]) {
            // Check for upcoming deadlines (within 7 days)
            if (goal.targetDate) {
              const daysUntilDeadline = Math.floor((new Date(goal.targetDate) - now) / (1000 * 60 * 60 * 24));
              if (daysUntilDeadline >= 0 && daysUntilDeadline <= 7) {
                activeOnlyDomainMap[domainName].upcomingDeadlines++;
              }
            }
            
            // Check for inactivity (no updates in 30+ days)
            if (goal.updatedAt) {
              const daysSinceUpdate = Math.floor((now - new Date(goal.updatedAt)) / (1000 * 60 * 60 * 24));
              if (daysSinceUpdate > 30) {
                activeOnlyDomainMap[domainName].inactiveForDays = Math.max(activeOnlyDomainMap[domainName].inactiveForDays, daysSinceUpdate);
              }
            }
            
            activeOnlyDomainMap[domainName].goalCount++;
            activeOnlyDomainMap[domainName].activeGoalCount++;
          }
        });
        
        const activeOnlyCalculatedDomains = Object.values(activeOnlyDomainMap);
        const activeOnlyTotalGoals = activeOnlyCalculatedDomains.reduce((sum, domain) => sum + domain.goalCount, 0);
        const activeOnlyDomainsWithPercentages = ensureMinimumVisibility(activeOnlyCalculatedDomains, activeOnlyTotalGoals);
        
        setActiveOnlyDomains(activeOnlyDomainsWithPercentages);
      } catch (error) {
        console.error('Error calculating domains:', error);
        setDomains([]);
        setActiveOnlyDomains([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    calculateDomains();
  }, [goals, mainGoals, refreshDomains]);

  // Ensure minimum visibility for all segments
  const ensureMinimumVisibility = (calculatedDomains, totalGoals) => {
    if (totalGoals === 0) {
      return WHEEL_DOMAINS.map(domain => {
        return {
          id: domain.name,
          name: domain.name,
          icon: domain.icon,
          color: domain.color,
          goalCount: 0,
          completedGoalCount: 0,
          activeGoalCount: 0,
          percentage: 0,
          isEmpty: true,
          upcomingDeadlines: 0,
          inactiveForDays: 0,
          description: domain.description || ''
        };
      });
    }
    
    // Filter out non-standard domains in balanceView mode
    let filteredDomains = calculatedDomains;
    if (balanceView) {
      filteredDomains = calculatedDomains.filter(domain => 
        uniqueDomainNames.includes(domain.name)
      );
    }
    
    const nonEmptyDomains = filteredDomains.filter(d => d.goalCount > 0);
    
    if (nonEmptyDomains.length === 0) {
      return filteredDomains;
    }
    
    let domainsWithPercentages = filteredDomains.map(domain => ({
      ...domain,
      percentage: (domain.goalCount / totalGoals) * 100,
      isEmpty: domain.goalCount === 0
    }));
    
    const smallDomains = domainsWithPercentages.filter(d => d.percentage > 0 && d.percentage < MIN_SLICE_PERCENTAGE);
    const adjustmentNeeded = smallDomains.reduce((sum, d) => sum + (MIN_SLICE_PERCENTAGE - d.percentage), 0);
    
    if (adjustmentNeeded > 0 && smallDomains.length > 0) {
      const largeDomains = domainsWithPercentages.filter(d => d.percentage >= MIN_SLICE_PERCENTAGE * 2);
      
      if (largeDomains.length > 0) {
        const totalLargePercentage = largeDomains.reduce((sum, d) => sum + d.percentage, 0);
        const reductionFactor = adjustmentNeeded / totalLargePercentage;
        
        domainsWithPercentages = domainsWithPercentages.map(domain => {
          if (domain.percentage > 0 && domain.percentage < MIN_SLICE_PERCENTAGE) {
            return { ...domain, percentage: MIN_SLICE_PERCENTAGE };
          } else if (domain.percentage >= MIN_SLICE_PERCENTAGE * 2) {
            const reduction = domain.percentage * reductionFactor;
            return { ...domain, percentage: domain.percentage - reduction };
          }
          return domain;
        });
      }
    }
    
    // Ensure all wheel domains are included
    const existingDomainNames = domainsWithPercentages.map(d => d.name);
    const missingDomains = uniqueDomainNames.filter(name => !existingDomainNames.includes(name));
    
    missingDomains.forEach(domainName => {
      const wheelDomain = WHEEL_DOMAINS.find(d => d.name === domainName);
      
      if (wheelDomain) {
        domainsWithPercentages.push({
          id: domainName,
          name: domainName,
          icon: wheelDomain.icon,
          color: wheelDomain.color,
          goalCount: 0,
          completedGoalCount: 0,
          activeGoalCount: 0,
          percentage: 0,
          isEmpty: true,
          upcomingDeadlines: 0,
          inactiveForDays: 0,
          description: wheelDomain.description || ''
        });
      }
    });
    
    return domainsWithPercentages;
  };

  // Create pie slices for the wheel
  const createPieSlices = () => {
    let activeDomainsToUse;
    
    if (balanceView) {
      // EQUAL DOMAIN BALANCE MODE - all wheel domains get equal shares
      activeDomainsToUse = WHEEL_DOMAINS.map(domain => {
        const existingDomain = domains.find(d => d.name === domain.name);
        
        if (existingDomain) {
          // Use existing domain but override percentage to be equal
          return {
            ...existingDomain,
            percentage: 100 / WHEEL_DOMAINS.length
          };
        }
        
        // Create placeholder domain with equal percentage
        return {
          id: domain.name,
          name: domain.name,
          icon: domain.icon,
          color: domain.color,
          goalCount: 0,
          completedGoalCount: 0,
          activeGoalCount: 0,
          percentage: 100 / WHEEL_DOMAINS.length,
          isEmpty: true,
          upcomingDeadlines: 0,
          inactiveForDays: 0,
          description: domain.description || ''
        };
      });
    } else {
      // ACTIVE FOCUS AREAS MODE - Modified to show all domains but highlight only those with goals
      activeDomainsToUse = WHEEL_DOMAINS.map(domain => {
        // Find if this domain exists in activeOnlyDomains (which has the actual goal data)
        const existingDomain = activeOnlyDomains.find(d => d.name === domain.name);
        
        if (existingDomain) {
          // Use existing domain data
          return existingDomain;
        }
        
        // Create a placeholder domain with zero goals (will be darkened)
        return {
          id: domain.name,
          name: domain.name,
          icon: domain.icon,
          color: domain.color,
          goalCount: 0,
          completedGoalCount: 0,
          activeGoalCount: 0,
          percentage: 100 / WHEEL_DOMAINS.length, // Equal size slices
          isEmpty: true,
          upcomingDeadlines: 0,
          inactiveForDays: 0,
          description: domain.description || ''
        };
      });
    }
    
    // Create equal slices for all domains
    const sliceAngle = 360 / activeDomainsToUse.length;
    let startAngle = 0;
    
    const result = activeDomainsToUse.map((domain, index) => {
      const endAngle = startAngle + sliceAngle;
      const path = createSlicePath(startAngle, endAngle);
      const midAngle = startAngle + sliceAngle / 2;
      
      // Calculate positions
      const centroid = calculateCentroid(midAngle, DOMAIN_LABEL_RADIUS);
      
      // Calculate icon position (closer to outer edge)
      const iconX = ICON_RADIUS * Math.cos((midAngle - 90) * Math.PI / 180);
      const iconY = ICON_RADIUS * Math.sin((midAngle - 90) * Math.PI / 180);
      
      const slice = {
        domain,
        path,
        centroid,
        angle: sliceAngle,
        startAngle,
        endAngle,
        midAngle,
        iconX,
        iconY,
        isBottomHalf: midAngle > 90 && midAngle < 270
      };
      
      startAngle = endAngle;
      return slice;
    });
    
    return result;
  };

  // Handle press on a domain slice
  const handleDomainPress = (domain) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Vibration.vibrate(10);
    }
    
    setHighlightedDomain(domain.id);
    setSelectedDomain(domain);
    setShowDetailModal(true);
  };

  // Handle long press for quick add
  const handleDomainLongPress = (domain) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Vibration.vibrate(20);
    }
    
    navigation.navigate('GoalDetails', { 
      mode: 'create',
      initialDomain: domain.name
    });
  };

  // Toggle between proportional and balanced views
  const toggleBalanceView = () => {
    animateWheelRotation();
    const newBalanceView = !balanceView;
    setBalanceView(newBalanceView);
    
    // Track achievement when switching from Equal Domain Balance (true) to Active Focus Area (false)
    if (balanceView === true && newBalanceView === false) {
      try {
        FeatureExplorerTracker.trackDomainFocusView();
      } catch (error) {
        console.error('Error tracking domain focus view:', error);
      }
    }
  };

  // Toggle label visibility
  const toggleLabelVisibility = () => {
    setShowLabels(!showLabels);
  };

  // Simple pulse animation when modal closes
  const animateFadeOut = (domainName) => {
    setFadingOutDomain(domainName);
    fadeOutProgress.setValue(1);
    
    // Simple fade from normal to slightly dimmed and back
    Animated.sequence([
      Animated.timing(fadeOutProgress, {
        toValue: 0.3,
        duration: 400,
        useNativeDriver: false
      }),
      Animated.timing(fadeOutProgress, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false
      })
    ]).start(() => {
      setFadingOutDomain(null);
      fadeOutProgress.setValue(1);
    });
  };

  // Animate wheel rotation
  const animateWheelRotation = () => {
    Animated.sequence([
      Animated.timing(wheelRotation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(wheelRotation, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
  };


  // Handle view goals for a domain
  const handleViewDomainGoals = () => {
    if (selectedDomain) {
      setShowDetailModal(false);
      navigation.navigate('GoalsTab', { 
        screen: 'Goals',
        params: { filterDomain: selectedDomain.name }
      });
    }
  };

  // Create a new goal in this domain
  const handleCreateGoalInDomain = () => {
    if (selectedDomain) {
      setShowDetailModal(false);
      navigation.navigate('GoalDetails', { 
        mode: 'create',
        initialDomain: selectedDomain.name
      });
    }
  };

  // Get domain completion percentage
  const getDomainCompletionPercentage = (domain) => {
    if (!domain || domain.goalCount === 0) return 0;
    return Math.round((domain.completedGoalCount / domain.goalCount) * 100);
  };

  // Get domain active goal count
  const getDomainActiveGoalCount = (domain) => {
    if (!domain) return 0;
    return domain.activeGoalCount !== undefined ? 
      domain.activeGoalCount : 
      (domain.goalCount - domain.completedGoalCount);
  };
  
  // Count totals
  const domainsToCount = activeOnlyDomains;
  const totalGoals = domainsToCount.reduce((sum, domain) => sum + domain.goalCount, 0);
  const completedGoals = domainsToCount.reduce((sum, domain) => sum + domain.completedGoalCount, 0);
  const activeGoals = domainsToCount.reduce((sum, domain) => sum + getDomainActiveGoalCount(domain), 0);
  const activeDomains = domainsToCount.filter(domain => getDomainActiveGoalCount(domain) > 0).length;
  
  // Create accessibility text for screen readers
  const getWheelAccessibilityLabel = () => {
    if (activeDomains === 0) {
      return 'Domain balance wheel. No active domains.';
    }
    
    let label = `Domain balance wheel. ${activeDomains} active domain${activeDomains === 1 ? '' : 's'}. `;
    
    // Add info about each active domain
    activeOnlyDomains
      .filter(d => getDomainActiveGoalCount(d) > 0)
      .forEach(domain => {
        const activeCount = getDomainActiveGoalCount(domain);
        label += `${domain.name}: ${activeCount} active goal${activeCount === 1 ? '' : 's'}. `;
      });
    
    return label;
  };
  
  // Create accessibility hints for domains
  const getDomainAccessibilityHint = (domain) => {
    const activeCount = getDomainActiveGoalCount(domain);
    if (activeCount === 0) {
      return `${domain.name} domain has no active goals. Double tap to view details, double tap and hold to create a goal in this domain.`;
    }
    
    return `${domain.name} domain has ${activeCount} active goal${activeCount === 1 ? '' : 's'}. Double tap to view details, double tap and hold to create a goal in this domain.`;
  };

  // Check if device is in landscape mode
  const isLandscape = width > height;

  // Create wheel slices
  const wheelSlices = createPieSlices();
  
  // Render the component
  return (
    <View 
      style={[
        styles.container, 
        isLandscape && styles.containerLandscape
      ]}
    >
      {/* Section Header */}
      <SectionHeader
        title={balanceView ? "Domain Overview" : "Current Focus"}
        icon="compass-outline"
        theme={theme}
        onActionPress={toggleLabelVisibility}
        actionIcon={showLabels ? "eye" : "eye-off"}
      />
      
      {/* Main Wheel Visualization */}
      <View style={[
        styles.wheelContainer,
        isLandscape && styles.wheelContainerLandscape
      ]}>
        <Animated.View 
          style={[
            styles.wheel,
            {
              transform: [
                { 
                  rotate: wheelRotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }
              ]
            }
          ]}
          accessible={true}
          accessibilityRole="image"
          accessibilityLabel={getWheelAccessibilityLabel()}
          accessibilityHint="Tap on a domain to view details or tap the center to toggle between actual and balanced views."
        >
          <Svg
            width={SVG_CONTAINER_SIZE}
            height={SVG_CONTAINER_SIZE}
            viewBox={`${-SVG_CONTAINER_SIZE/2} ${-SVG_CONTAINER_SIZE/2} ${SVG_CONTAINER_SIZE} ${SVG_CONTAINER_SIZE}`}
          >
            {/* Domain slices */}
            <G>
              {wheelSlices.map((slice, index) => {
                // Calculate label position with adjusted radius
                const labelRadius = WHEEL_SIZE / 2 + (slice.isBottomHalf ? 30 : 25);
                const labelX = labelRadius * Math.cos((slice.midAngle - 90) * Math.PI / 180);
                const labelY = labelRadius * Math.sin((slice.midAngle - 90) * Math.PI / 180);
                
                // Determine selection and fade states
                const isCurrentlySelected = selectedDomain?.name === slice.domain.name;
                const isFadingOut = fadingOutDomain === slice.domain.name;
                const isSelected = isCurrentlySelected;
                
                // Calculate circle size
                const circleRadius = isSelected ? 26 : 24;
                
                // Determine if this domain should be darkened in Active Focus Areas view
                const hasActiveGoals = getDomainActiveGoalCount(slice.domain) > 0;
                const shouldDarken = !balanceView && !hasActiveGoals;
                const baseOpacity = shouldDarken ? 0.2 : (isSelected ? 1 : 0.7);
                
                // Skip accessibility properties if screen reader is enabled (handled by parent)
                const sliceAccessibilityProps = isScreenReaderEnabled ? {} : {
                  accessible: true,
                  accessibilityRole: "button",
                  accessibilityLabel: `${slice.domain.name} domain`,
                  accessibilityHint: getDomainAccessibilityHint(slice.domain)
                };
                
                return (
                  <G key={`slice-${index}`} opacity={isFadingOut ? fadeOutProgress : 1}>
                    {/* Main slice with solid color fill */}
                    <Path
                      d={slice.path}
                      fill={slice.domain.color}
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth={0.5}
                      opacity={baseOpacity}
                      onPress={() => handleDomainPress(slice.domain)}
                      onLongPress={() => handleDomainLongPress(slice.domain)}
                      delayLongPress={500}
                      {...sliceAccessibilityProps}
                    />
                    
                    {/* Domain label outside wheel - only show if labels are enabled */}
                    {showLabels && (
                      <G>
                        {/* Add a small line from segment to label */}
                        <Path
                          d={`M ${(WHEEL_SIZE/2 - 5) * Math.cos((slice.midAngle - 90) * Math.PI / 180)} ${(WHEEL_SIZE/2 - 5) * Math.sin((slice.midAngle - 90) * Math.PI / 180)} 
                              L ${(WHEEL_SIZE/2 + 10) * Math.cos((slice.midAngle - 90) * Math.PI / 180)} ${(WHEEL_SIZE/2 + 10) * Math.sin((slice.midAngle - 90) * Math.PI / 180)}`}
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth={1}
                          opacity={shouldDarken ? 0.2 : 1}
                        />
                        
                        {/* Position text radially outward - but adjust rotation for bottom labels */}
                        <SvgText
                          x={labelX}
                          y={labelY}
                          textAnchor="middle"
                          fontSize={12}
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          fill={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.8)'}
                          rotation={slice.isBottomHalf ? slice.midAngle + 180 : slice.midAngle}
                          origin={`${labelX},${labelY}`}
                          opacity={shouldDarken ? 0.2 : 1}
                        >
                          {slice.domain.name === 'Personal Growth' ? 'Growth' : slice.domain.name.split(' ')[0]}
                        </SvgText>
                      </G>
                    )}
                    
                    {/* Circle background for icon */}
                    <Circle
                      cx={slice.iconX}
                      cy={slice.iconY}
                      r={circleRadius}
                      fill={isSelected ? slice.domain.color : 'rgba(255,255,255,0.15)'}
                      stroke={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.3)'}
                      strokeWidth={isSelected ? 2 : 1}
                      opacity={shouldDarken ? 0.2 : 1}
                      onPress={() => handleDomainPress(slice.domain)}
                    />
                    
                    {/* Goal count indicator - show if active goals > 0 */}
                    {getDomainActiveGoalCount(slice.domain) > 0 && (
                      <Circle
                        cx={slice.iconX + 14}
                        cy={slice.iconY - 14}
                        r={10}
                        fill="#FFFFFF"
                        stroke={slice.domain.color}
                        strokeWidth={1}
                      />
                    )}
                    
                    {getDomainActiveGoalCount(slice.domain) > 0 && (
                      <SvgText
                        x={slice.iconX + 14}
                        y={slice.iconY - 10}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight="bold"
                        fill={slice.domain.color}
                      >
                        {getDomainActiveGoalCount(slice.domain)}
                      </SvgText>
                    )}
                  </G>
                );
              })}
            </G>
            
            {/* Center circle - Now a touchable button */}
            <G onPress={toggleBalanceView}>
              <Circle
                cx="0"
                cy="0"
                r={CENTER_RADIUS}
                fill="#1e3a8a"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1}
                onPress={toggleBalanceView}
                opacity={0.9}
              />
              
              {/* Center content - Always show active domains count */}
              <SvgText
                x="0"
                y="-8"
                textAnchor="middle"
                fontSize="18"
                fontWeight="bold"
                fill="#FFFFFF"
                onPress={toggleBalanceView}
              >
                {activeDomains}
              </SvgText>
              <SvgText
                x="0"
                y="6"
                textAnchor="middle"
                fontSize="9"
                fill="rgba(255,255,255,0.8)"
                onPress={toggleBalanceView}
              >
                Active
              </SvgText>
              <SvgText
                x="0"
                y="18"
                textAnchor="middle"
                fontSize="9"
                fill="rgba(255,255,255,0.8)"
                onPress={toggleBalanceView}
              >
                {activeDomains === 1 ? "Domain" : "Domains"}
              </SvgText>
            </G>
          </Svg>
          
          {/* Position icons using manual calculation */}
          <View style={styles.iconsOverlay} pointerEvents="none">
            {wheelSlices.map((slice, index) => {
              const hasActiveGoals = getDomainActiveGoalCount(slice.domain) > 0;
              const shouldDarken = !balanceView && !hasActiveGoals;
              
              // Calculate the absolute position based on the SVG viewBox and center
              const centerX = SVG_CONTAINER_SIZE / 2;
              const centerY = SVG_CONTAINER_SIZE / 2;
              
              // Adjust icon position to be centered exactly in the middle of the slice
              const iconX = centerX + slice.iconX - ICON_SIZE / 2;
              const iconY = centerY + slice.iconY - ICON_SIZE / 2;
              
              return (
                <TouchableOpacity
                  key={`icon-${index}`}
                  style={[
                    styles.iconButton,
                    {
                      left: iconX,
                      top: iconY,
                      width: ICON_SIZE,
                      height: ICON_SIZE,
                      zIndex: 10,
                      opacity: shouldDarken ? 0.2 : 1
                    }
                  ]}
                  onPress={() => handleDomainPress(slice.domain)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={slice.domain.icon} 
                    size={ICON_SIZE} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Add overlay touch areas */}
          <View style={styles.touchOverlay}>
            {wheelSlices.map((slice, index) => {
              // Calculate the absolute position based on the SVG viewBox and center
              const centerX = SVG_CONTAINER_SIZE / 2;
              const centerY = SVG_CONTAINER_SIZE / 2;
              
              // Position and size for the touch area
              const touchRadius = 32; // Bigger than the visible circle for easier touch
              const touchX = centerX + slice.iconX - touchRadius / 2;
              const touchY = centerY + slice.iconY - touchRadius / 2;
              
              return (
                <TouchableOpacity
                  key={`touch-${index}`}
                  style={[
                    styles.touchCircle,
                    {
                      left: touchX,
                      top: touchY,
                      width: touchRadius,
                      height: touchRadius,
                    }
                  ]}
                  onPress={() => handleDomainPress(slice.domain)}
                />
              );
            })}
            
            {/* Center button touch area - larger for easier tapping */}
            <TouchableOpacity
              style={[
                styles.centerButton,
                {
                  left: SVG_CONTAINER_SIZE / 2 - CENTER_RADIUS - 10,
                  top: SVG_CONTAINER_SIZE / 2 - CENTER_RADIUS - 10,
                  width: CENTER_RADIUS * 2 + 20,
                  height: CENTER_RADIUS * 2 + 20,
                }
              ]}
              onPress={toggleBalanceView}
              activeOpacity={0.7}
            />
          </View>
        </Animated.View>
      </View>
      
      {/* Domain Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          if (selectedDomain) {
            animateFadeOut(selectedDomain.name);
          }
          setShowDetailModal(false);
          setSelectedDomain(null);
          setHighlightedDomain(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {
            backgroundColor: isDarkMode ? '#121214' : '#F5F5F7',
            borderColor: selectedDomain?.color || theme.border,
            maxHeight: isLandscape ? '85%' : '75%',
            width: isLandscape ? '80%' : '90%',
            maxWidth: width > 600 ? 500 : 400,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 0
          }]}>
            <ExpoLinearGradient
              colors={[
                selectedDomain ? `${selectedDomain.color}80` : (isDarkMode ? 'rgba(30, 58, 138, 0.6)' : 'rgba(59, 130, 246, 0.4)'), 
                selectedDomain ? `${selectedDomain.color}40` : (isDarkMode ? 'rgba(30, 64, 175, 0.8)' : 'rgba(96, 165, 250, 0.6)')
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBackground}
            />
            
            {selectedDomain && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalIconContainer, {
                    backgroundColor: selectedDomain.color
                  }]}>
                    <Ionicons 
                      name={selectedDomain.icon || "compass-outline"} 
                      size={28} 
                      color={getContrastColor(selectedDomain.color)} 
                    />
                  </View>
                  <Text 
                    style={[styles.modalTitle, { 
                      color: isDarkMode ? '#FFFFFF' : '#000000',
                      flex: 1,
                      marginRight: 10 
                    }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {selectedDomain.name}
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      if (selectedDomain) {
                        animateFadeOut(selectedDomain.name);
                      }
                      setShowDetailModal(false);
                      setSelectedDomain(null);
                      setHighlightedDomain(null);
                    }}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Close domain details"
                    accessibilityHint="Closes the domain details modal"
                    hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
                  >
                    <Ionicons name="close" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView 
                  style={styles.modalBody}
                  contentContainerStyle={{
                    paddingBottom: 20 // Extra bottom padding for scrolling
                  }}
                >
                  {/* Domain description */}
                  {selectedDomain.description && (
                    <Text 
                      style={[styles.domainDescription, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }]}
                      maxFontSizeMultiplier={1.5}
                    >
                      {selectedDomain.description}
                    </Text>
                  )}
                  
                  {/* Quick stats with visual indicators */}
                  <View style={[
                    styles.statRow,
                    isLandscape && { flexDirection: width > 600 ? 'row' : 'column' }
                  ]}>
                    <View style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                      <Ionicons name="flag" size={20} color={selectedDomain.color} />
                      <Text 
                        style={[styles.statValue, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {getDomainActiveGoalCount(selectedDomain)}
                      </Text>
                      <Text 
                        style={[styles.statLabel, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }]}
                        maxFontSizeMultiplier={1.5}
                      >
                        Active
                      </Text>
                    </View>
                    
                    <View style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                      <Ionicons name="checkmark-circle" size={20} color={selectedDomain.color} />
                      <Text 
                        style={[styles.statValue, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {selectedDomain.completedGoalCount}
                      </Text>
                      <Text 
                        style={[styles.statLabel, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }]}
                        maxFontSizeMultiplier={1.5}
                      >
                        Completed
                      </Text>
                    </View>
                    
                    <View style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                      <Ionicons name="pie-chart" size={20} color={selectedDomain.color} />
                      <Text 
                        style={[styles.statValue, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {totalGoals > 0 ? Math.round((selectedDomain.goalCount / totalGoals) * 100) : 0}%
                      </Text>
                      <Text 
                        style={[styles.statLabel, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }]}
                        maxFontSizeMultiplier={1.5}
                      >
                        of Total
                      </Text>
                    </View>
                  </View>
                  
                  {/* Progress visualization */}
                  {selectedDomain.goalCount > 0 && (
                    <View style={styles.progressSection}>
                      <Text 
                        style={[styles.progressLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        Domain Progress
                      </Text>
                      
                      <View 
                        style={[styles.modalProgressTrack, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                        accessible={true}
                        accessibilityRole="progressbar"
                        accessibilityLabel={`Domain completion: ${getDomainCompletionPercentage(selectedDomain)}%`}
                        accessibilityValue={{
                          min: 0,
                          max: 100,
                          now: getDomainCompletionPercentage(selectedDomain)
                        }}
                      >
                        <View 
                          style={[
                            styles.modalProgressFill, 
                            { 
                              width: `${getDomainCompletionPercentage(selectedDomain)}%`,
                              backgroundColor: selectedDomain.color 
                            }
                          ]} 
                        />
                        
                        {/* Milestone markers */}
                        {[25, 50, 75].map(milestone => (
                          <View
                            key={milestone}
                            style={[
                              styles.progressMilestone,
                              { left: `${milestone}%` }
                            ]}
                          />
                        ))}
                      </View>
                      
                      <Text 
                        style={[styles.progressPercentage, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }]}
                        maxFontSizeMultiplier={1.5}
                      >
                        {getDomainCompletionPercentage(selectedDomain)}% Complete
                      </Text>
                    </View>
                  )}
                  
                  {/* Alerts and insights */}
                  {selectedDomain.upcomingDeadlines > 0 && (
                    <View 
                      style={[styles.alert, styles.alertWarning]}
                      accessible={true}
                      accessibilityRole="text"
                      accessibilityLabel={`Warning: ${selectedDomain.upcomingDeadlines} goal${selectedDomain.upcomingDeadlines > 1 ? 's' : ''} due within 7 days`}
                    >
                      <Ionicons name="time-outline" size={16} color="#FF9800" />
                      <Text 
                        style={styles.alertText}
                        maxFontSizeMultiplier={1.5}
                      >
                        {selectedDomain.upcomingDeadlines} goal{selectedDomain.upcomingDeadlines > 1 ? 's' : ''} due within 7 days
                      </Text>
                    </View>
                  )}
                  
                  {selectedDomain.inactiveForDays > 30 && (
                    <View 
                      style={[styles.alert, styles.alertInfo]}
                      accessible={true}
                      accessibilityRole="text"
                      accessibilityLabel={`Info: Some goals haven't been updated in ${selectedDomain.inactiveForDays} days`}
                    >
                      <Ionicons name="information-circle-outline" size={16} color="#2196F3" />
                      <Text 
                        style={styles.alertText}
                        maxFontSizeMultiplier={1.5}
                      >
                        Some goals haven't been updated in {selectedDomain.inactiveForDays} days
                      </Text>
                    </View>
                  )}
                  
                  {/* Action buttons */}
                  <View style={styles.actionButtonsContainer}>
                    {selectedDomain.goalCount > 0 && (
                      <TouchableOpacity
                        style={[
                          styles.actionButton, 
                          { 
                            backgroundColor: selectedDomain.color,
                            marginRight: 8,
                            flex: 1
                          }
                        ]}
                        onPress={handleViewDomainGoals}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="View Goals"
                        accessibilityHint={`View all goals in the ${selectedDomain.name} domain`}
                      >
                        <Text 
                          style={[styles.actionButtonText, { color: getContrastColor(selectedDomain.color) }]}
                          maxFontSizeMultiplier={1.3}
                        >
                          View Goals
                        </Text>
                        <Ionicons 
                          name="arrow-forward"
                          size={16} 
                          color={getContrastColor(selectedDomain.color)} 
                        />
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                      style={[
                        styles.actionButton, 
                        { 
                          backgroundColor: selectedDomain.color,
                          marginLeft: selectedDomain.goalCount > 0 ? 8 : 0,
                          flex: 1
                        }
                      ]}
                      onPress={handleCreateGoalInDomain}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Create Goal"
                      accessibilityHint={`Create a new goal in the ${selectedDomain.name} domain`}
                    >
                      <Text 
                        style={[styles.actionButtonText, { color: getContrastColor(selectedDomain.color) }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        Create Goal
                      </Text>
                      <Ionicons 
                        name="add"
                        size={16} 
                        color={getContrastColor(selectedDomain.color)} 
                      />
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Helper function to determine text color based on background
const getContrastColor = (hexColor) => {
  if (!hexColor) return '#FFFFFF';
  
  const r = parseInt(hexColor.substring(1, 3), 16);
  const g = parseInt(hexColor.substring(3, 5), 16);
  const b = parseInt(hexColor.substring(5, 7), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 16,
  },
  containerLandscape: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    position: 'relative',
  },
  wheelContainerLandscape: {
    marginVertical: 8,
    marginTop: 0,
  },
  wheel: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20, // Negative margin to shift wheel up
    position: 'relative',
  },
  iconsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  touchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  touchCircle: {
    position: 'absolute',
    borderRadius: 32, // Make it circular
    backgroundColor: 'transparent', // Invisible but touchable
  },
  centerButton: {
    position: 'absolute',
    borderRadius: 50, // Make it circular
    backgroundColor: 'transparent', // Invisible but touchable
    zIndex: 20,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 0,
    borderWidth: 2,
    overflow: 'hidden',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed from 'center' to 'flex-start' for better alignment with multi-line text
    padding: 20,
    paddingBottom: 15,
    minHeight: 70, // Add minimum height to ensure enough space for multi-line titles
  },
  modalIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    flexShrink: 0, // Prevent icon from shrinking
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 26, // Add line height for better multi-line appearance
  },
  closeButton: {
    padding: 5,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -5, // Slight negative margin to align with title
    flexShrink: 0, // Prevent button from shrinking
  },
  modalBody: {
    padding: 20,
    paddingTop: 0,
  },
  domainDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '30%',
    minWidth: 90,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 11,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalProgressTrack: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  modalProgressFill: {
    height: 12,
    borderRadius: 6,
  },
  progressMilestone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  alertWarning: {
    backgroundColor: '#FF980020',
  },
  alertInfo: {
    backgroundColor: '#2196F320',
  },
  alertText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    minHeight: 44, // Minimum touch target height
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default DomainBalanceWheel;
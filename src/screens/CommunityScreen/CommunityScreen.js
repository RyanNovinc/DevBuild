// src/screens/CommunityScreen/CommunityScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Animated,
  Clipboard,
  Alert,
  ActivityIndicator,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import founderCodeService from '../../services/founderCodeService';
import responsive from '../../utils/responsive';
import { useTheme } from '../../context/ThemeContext';

// Discord brand color
const DISCORD_BLUE = "#5865F2";

// FounderSpotsBanner Component
const FounderSpotsBanner = ({ 
  spotsRemaining, 
  totalSpots = 1000,
  theme,
  style = {}
}) => {
  // Calculate spots claimed and percentage
  const spotsClaimed = totalSpots - spotsRemaining;
  const percentClaimed = Math.floor((spotsClaimed / totalSpots) * 100);
  
  // Animated value for progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Animation for pulse effect on low availability
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Set up animations on mount and when spots change
  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: percentClaimed / 100,
      duration: 1000,
      useNativeDriver: false
    }).start();
    
    // Only add pulse animation when spots are low (less than 200)
    if (spotsRemaining < 200) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: false
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false
          })
        ])
      ).start();
    }
  }, [spotsRemaining]);
  
  // Determine background color based on availability
  const getProgressColor = () => {
    if (spotsRemaining < 100) return '#FF3B30'; // Red for urgent
    if (spotsRemaining < 200) return '#FF9500'; // Orange for very limited
    if (spotsRemaining < 500) return '#FFD700'; // Gold for limited
    return '#3F51B5'; // Primary blue for available
  };
  
  // Get message based on threshold
  const getMessage = () => {
    if (spotsRemaining < 100) {
      return `URGENT: Only ${spotsRemaining} founder spots remaining!`;
    } else if (spotsRemaining < 200) {
      return `Almost gone! Only ${spotsRemaining} founder spots left`;
    } else if (spotsRemaining < 500) {
      return `Founder spots going fast - ${percentClaimed}% already claimed!`;
    } else if (spotsRemaining < 800) {
      return `Join our growing founder community - ${percentClaimed}% claimed!`;
    } else {
      return `Be one of our founding members! Limited to 1,000 spots.`;
    }
  };
  
  // Get appropriate icon based on availability
  const getIcon = () => {
    if (spotsRemaining < 200) return "timer-outline";
    if (spotsRemaining < 500) return "people-outline";
    return "star-outline";
  };
  
  // Get banner background color based on urgency
  const getBannerColor = () => {
    if (spotsRemaining < 100) return 'rgba(255, 59, 48, 0.1)'; // Red bg for urgent
    if (spotsRemaining < 200) return 'rgba(255, 149, 0, 0.1)'; // Orange bg for very limited
    if (spotsRemaining < 500) return 'rgba(255, 215, 0, 0.1)'; // Gold bg for limited
    return 'rgba(63, 81, 181, 0.07)'; // Blue bg for available
  };
  
  // Scale badge size based on urgency
  const badgeScale = pulseAnim.interpolate({
    inputRange: [1, 1.1],
    outputRange: [1, 1.1]
  });
  
  // Background color for the badge (more dramatic when fewer spots)
  const badgeColor = spotsRemaining < 100 ? '#FF3B30' : 
                    spotsRemaining < 200 ? '#FF9500' : 
                    spotsRemaining < 500 ? '#FFD700' : '#3F51B5';
  
  return (
    <Animated.View 
      style={[
        bannerStyles.container, 
        { 
          backgroundColor: getBannerColor(),
          borderColor: getProgressColor(),
          transform: [{ scale: spotsRemaining < 200 ? pulseAnim : 1 }]
        },
        style
      ]}
    >
      <View style={bannerStyles.content}>
        {/* Icon and message */}
        <View style={bannerStyles.messageRow}>
          <Animated.View 
            style={[
              bannerStyles.iconBadge,
              { 
                backgroundColor: badgeColor,
                transform: [{ scale: badgeScale }] 
              }
            ]}
          >
            <Ionicons name={getIcon()} size={22} color="#FFFFFF" />
          </Animated.View>
          <Text style={[
            bannerStyles.message, 
            { 
              color: theme?.text || '#000000',
              fontWeight: spotsRemaining < 200 ? '700' : '600'
            }
          ]}>
            {getMessage()}
          </Text>
        </View>
        
        {/* Progress bar */}
        <View style={bannerStyles.progressContainer}>
          <Animated.View 
            style={[
              bannerStyles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                }),
                backgroundColor: getProgressColor()
              }
            ]}
          />
          <View style={bannerStyles.progressOverlay}>
            <Text style={bannerStyles.progressText}>
              {spotsClaimed} of {totalSpots} claimed
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

// Test Mode Panel Component
const TestModePanel = ({ 
  theme, 
  serviceMode, 
  setServiceMode, 
  testScenario, 
  setTestScenario, 
  onClearData 
}) => {
  return (
    <View style={[styles.testModePanel, { 
      backgroundColor: 'rgba(255, 0, 0, 0.05)',
      borderColor: 'rgba(255, 0, 0, 0.3)',
    }]}>
      <View style={styles.testModeHeader}>
        <Ionicons name="construct" size={20} color="#FF3B30" />
        <Text style={[styles.testModeTitle, { color: theme.text }]}>
          DEVELOPER TEST MODE
        </Text>
      </View>
      
      <View style={styles.testModeOption}>
        <Text style={[styles.testModeLabel, { color: theme.text }]}>Service Mode:</Text>
        <View style={styles.testModeSegment}>
          {Object.values(founderCodeService.constants.MODES).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.testModeSegmentButton,
                { 
                  backgroundColor: serviceMode === mode ? theme.primary : 'transparent',
                  borderColor: theme.border,
                }
              ]}
              onPress={() => setServiceMode(mode)}
            >
              <Text style={[
                styles.testModeSegmentText,
                { color: serviceMode === mode ? '#FFFFFF' : theme.textSecondary }
              ]}>
                {mode}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {serviceMode === founderCodeService.constants.MODES.MOCK && (
        <View style={styles.testModeOption}>
          <Text style={[styles.testModeLabel, { color: theme.text }]}>Test Scenario:</Text>
          <View style={styles.testModeSegment}>
            {['success', 'already_assigned', 'no_spots', 'error'].map((scenario) => (
              <TouchableOpacity
                key={scenario}
                style={[
                  styles.testModeSegmentButton,
                  { 
                    backgroundColor: testScenario === scenario ? theme.primary : 'transparent',
                    borderColor: theme.border,
                  }
                ]}
                onPress={() => setTestScenario(scenario)}
              >
                <Text style={[
                  styles.testModeSegmentText,
                  { color: testScenario === scenario ? '#FFFFFF' : theme.textSecondary }
                ]}>
                  {scenario.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.testModeButton, { backgroundColor: '#FF3B30' }]}
        onPress={onClearData}
      >
        <Text style={styles.testModeButtonText}>Clear Founder Data</Text>
      </TouchableOpacity>
      
      <Text style={[styles.testModeNote, { color: theme.textSecondary }]}>
        This panel is only visible in development builds.
      </Text>
    </View>
  );
};

// Status Log Component
const StatusLog = ({ logs, theme }) => {
  // Get the ScrollView ref to auto-scroll to bottom on updates
  const scrollViewRef = useRef(null);
  
  // Auto-scroll to bottom when logs change
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [logs]);
  
  if (logs.length === 0) return null;
  
  return (
    <View style={[styles.statusLogContainer, { 
      backgroundColor: theme.isDark ? '#1A1A1A' : '#F0F0F0',
      borderColor: theme.border,
    }]}>
      <View style={styles.statusLogHeader}>
        <Ionicons name="terminal-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.statusLogTitle, { color: theme.textSecondary }]}>
          Status Log
        </Text>
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.statusLogContent}
        contentContainerStyle={styles.statusLogItems}
      >
        {logs.map((log, index) => (
          <Text key={index} style={[
            styles.statusLogItem,
            { 
              color: log.type === 'error' ? '#FF3B30' : 
                    log.type === 'success' ? '#4CD964' : 
                    log.type === 'info' ? theme.text : 
                    theme.textSecondary 
            }
          ]}>
            {log.message}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const CommunityScreen = ({ navigation, route }) => {
  // Get theme from context instead of props
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [founderCode, setFounderCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState(null);
  
  // For founder spots banner - start with a default that will be updated
  const [founderSpotsRemaining, setFounderSpotsRemaining] = useState(237);
  
  // For test mode
  const [showTestMode, setShowTestMode] = useState(__DEV__);
  const [serviceMode, setServiceMode] = useState(founderCodeService.constants.MODES.MOCK);
  const [testScenario, setTestScenario] = useState('success');
  const [statusLogs, setStatusLogs] = useState([]);
  
  // Animation values
  const codeScale = useRef(new Animated.Value(1)).current;
  
  // Function to add a log entry
  const addLog = (message, type = 'info') => {
    setStatusLogs(prev => [...prev, { message, type, timestamp: new Date() }]);
  };
  
  // Function to clear logs
  const clearLogs = () => {
    setStatusLogs([]);
  };
  
  // Function to set service mode
  const handleSetServiceMode = async (mode) => {
    await founderCodeService.setServiceMode(mode);
    setServiceMode(mode);
    addLog(`Switched to ${mode} mode`, 'info');
  };
  
  // Function to clear founder data
  const handleClearFounderData = async () => {
    const success = await founderCodeService.clearFounderData();
    if (success) {
      setFounderCode(null);
      setIsVerified(false);
      addLog('Founder data cleared', 'success');
    } else {
      addLog('Failed to clear founder data', 'error');
    }
  };
  
  // Function to fetch the latest count of available founder spots
  const fetchFounderSpotsRemaining = async () => {
    try {
      addLog('Fetching founder spots remaining...', 'info');
      
      // Using your actual API Gateway endpoint
      const response = await fetch('https://8uucuqeys9.execute-api.ap-southeast-2.amazonaws.com/prod/available-spots');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if the response has the expected structure
      if (data && data.success && typeof data.availableSpots === 'number') {
        addLog(`Founder spots: ${data.availableSpots} remaining`, 'success');
        setFounderSpotsRemaining(data.availableSpots);
        
        // Store in AsyncStorage for offline access
        await AsyncStorage.setItem('founderSpotsRemaining', data.availableSpots.toString());
        
        // We could also store the total, assigned, and verified spots for more detailed displays
        if (typeof data.totalSpots === 'number') {
          await AsyncStorage.setItem('founderTotalSpots', data.totalSpots.toString());
        }
        if (typeof data.assignedSpots === 'number') {
          await AsyncStorage.setItem('founderAssignedSpots', data.assignedSpots.toString());
        }
        if (typeof data.verifiedSpots === 'number') {
          await AsyncStorage.setItem('founderVerifiedSpots', data.verifiedSpots.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching founder spots:', error);
      addLog(`Error fetching spots: ${error.message}`, 'error');
      // If fetch fails, we'll rely on the cached value from AsyncStorage (already loaded in initial effect)
    }
  };
  
  // Fetch the founder code and check verification status on component mount
  useEffect(() => {
    const initializeScreen = async () => {
      try {
        clearLogs();
        addLog('Initializing community screen...', 'info');
        
        // Get the current service mode
        const mode = await founderCodeService.getServiceMode();
        setServiceMode(mode);
        addLog(`Service mode: ${mode}`, 'info');
        
        // Get initial spots remaining from AsyncStorage (if available)
        const remainingSpots = await AsyncStorage.getItem('founderSpotsRemaining');
        if (remainingSpots) {
          setFounderSpotsRemaining(parseInt(remainingSpots));
          addLog(`Loaded cached spots: ${remainingSpots}`, 'info');
        }
        
        // Fetch the latest data
        await fetchFounderSpotsRemaining();
        
        // Fetch founder code and check verification status
        await fetchFounderCode();
        await checkVerificationStatus();
        
        addLog('Screen initialization complete', 'success');
      } catch (error) {
        console.error('Error initializing community screen:', error);
        addLog(`Initialization error: ${error.message}`, 'error');
        setError('Unable to initialize screen');
        setIsLoading(false);
      }
    };
    
    initializeScreen();
    
    // Set up a refresh interval to periodically update the count
    const refreshInterval = setInterval(fetchFounderSpotsRemaining, 60000); // Refresh every minute
    
    return () => {
      clearInterval(refreshInterval); // Clean up the interval when component unmounts
    };
  }, []);
  
  // Animation when code is copied
  useEffect(() => {
    if (isCopied) {
      Animated.sequence([
        Animated.timing(codeScale, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(codeScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Reset the copied state after 2 seconds
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isCopied, codeScale]);
  
  const fetchFounderCode = async () => {
    try {
      setIsLoading(true);
      addLog('Checking for existing founder code...', 'info');
      
      // First check if we already have a code stored
      const existingCode = await founderCodeService.getFounderCode();
      
      if (existingCode) {
        addLog(`Found existing code: ${existingCode}`, 'success');
        setFounderCode(existingCode);
        setIsLoading(false);
        return;
      }
      
      addLog('No existing code found', 'info');
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching founder code:', error);
      addLog(`Error fetching code: ${error.message}`, 'error');
      setError('Unable to load founder status');
      setIsLoading(false);
    }
  };
  
  const checkVerificationStatus = async () => {
    try {
      addLog('Checking verification status...', 'info');
      const verified = await founderCodeService.isVerified();
      setIsVerified(verified);
      addLog(`Verification status: ${verified ? 'Verified' : 'Not verified'}`, 'info');
    } catch (error) {
      console.error('Error checking verification status:', error);
      addLog(`Error checking verification: ${error.message}`, 'error');
    }
  };
  
  const handleAssignCode = async () => {
    try {
      setIsAssigning(true);
      setError(null);
      addLog('Assigning founder code...', 'info');
      
      // Options for different service modes
      const options = {
        testScenario: testScenario,
        isTestMode: true
      };
      
      // Call the appropriate method based on mode
      const result = await founderCodeService.assignFounderCode(options);
      
      if (result.success) {
        setFounderCode(result.code);
        addLog(`Assigned code: ${result.code}`, 'success');
        
        if (result.alreadyAssigned) {
          addLog('Code was already assigned', 'info');
          Alert.alert(
            "Code Retrieved",
            "We've retrieved your existing founder code.",
            [{ text: "OK" }]
          );
        } else {
          // Show congratulations for new founder code
          addLog('New code assigned successfully', 'success');
          Alert.alert(
            "Congratulations!",
            "You're now one of the exclusive 1,000 LifeCompass Founders! Use your code to verify in our Discord community.",
            [{ text: "Awesome!" }]
          );
          
          // Update the founder spots count if a new code was assigned
          const newSpotsRemaining = founderSpotsRemaining - 1;
          setFounderSpotsRemaining(newSpotsRemaining);
          await AsyncStorage.setItem('founderSpotsRemaining', newSpotsRemaining.toString());
          addLog(`Updated spots remaining: ${newSpotsRemaining}`, 'info');
        }
      } else {
        setError(result.error || "Unable to assign founder code");
        addLog(`Assignment failed: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error assigning founder code:', error);
      addLog(`Assignment error: ${error.message}`, 'error');
      setError('Network error or service unavailable');
    } finally {
      setIsAssigning(false);
    }
  };
  
  const copyToClipboard = () => {
    if (founderCode) {
      Clipboard.setString(founderCode);
      setIsCopied(true);
      addLog('Code copied to clipboard', 'success');
    }
  };
  
  const openDiscord = () => {
    addLog('Opening Discord...', 'info');
    Linking.openURL('https://discord.gg/HstGurfC');
  };
  
  return (
    <View style={[styles.container, { 
      backgroundColor: theme.background,
      paddingTop: insets.top,
      paddingBottom: insets.bottom || 20,
      paddingLeft: insets.left || 20,
      paddingRight: insets.right || 20,
    }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessible={true}
          accessibilityLabel="Back button"
          accessibilityHint="Returns to the previous screen"
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Join Our Community
        </Text>
        <View style={styles.placeholderRight} />
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Test Mode Banner - Only visible in __DEV__ */}
        {__DEV__ && (
          <View style={styles.devBanner}>
            <Ionicons name="warning" size={18} color="#FFFFFF" />
            <Text style={styles.devBannerText}>DEVELOPMENT MODE</Text>
          </View>
        )}
        
        {/* Discord Logo */}
        <View style={styles.discordLogoContainer}>
          <View style={styles.discordLogo}>
            <Ionicons name="logo-discord" size={80} color="#FFFFFF" />
          </View>
          <Text style={styles.discordText}>LifeCompass Discord</Text>
        </View>
        
        {/* Test Mode Panel - Only visible in __DEV__ when expanded */}
        {__DEV__ && showTestMode && (
          <TestModePanel
            theme={theme}
            serviceMode={serviceMode}
            setServiceMode={handleSetServiceMode}
            testScenario={testScenario}
            setTestScenario={setTestScenario}
            onClearData={handleClearFounderData}
          />
        )}
        
        {/* Toggle Test Mode - Only visible in __DEV__ */}
        {__DEV__ && (
          <TouchableOpacity 
            style={[styles.testModeToggle, { borderColor: theme.border }]}
            onPress={() => setShowTestMode(!showTestMode)}
          >
            <Text style={[styles.testModeToggleText, { color: theme.textSecondary }]}>
              {showTestMode ? 'Hide' : 'Show'} Test Options
            </Text>
            <Ionicons 
              name={showTestMode ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color={theme.textSecondary} 
            />
          </TouchableOpacity>
        )}
        
        {/* Status Log - Only visible in __DEV__ */}
        {__DEV__ && statusLogs.length > 0 && (
          <StatusLog logs={statusLogs} theme={theme} />
        )}
        
        {/* Founder Spots Banner */}
        <FounderSpotsBanner
          spotsRemaining={founderSpotsRemaining}
          totalSpots={1000}
          theme={theme}
          style={{ marginBottom: 16 }}
        />
        
        {/* Founder Status Card */}
        <View style={[styles.founderCard, { 
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        }]}>
          <View style={styles.founderCardHeader}>
            <Ionicons name="star" size={24} color="#FFD700" />
            <Text style={[styles.founderCardTitle, { color: theme.text }]}>
              LifeCompass Founder
            </Text>
          </View>
          
          <View style={styles.founderCardBody}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                  Checking founder status...
                </Text>
              </View>
            ) : founderCode ? (
              <>
                <Text style={[styles.codeLabel, { color: theme.textSecondary }]}>
                  Your exclusive founder code:
                </Text>
                <TouchableOpacity
                  style={[styles.codeContainer, { 
                    // Using darker background for better contrast
                    backgroundColor: theme.isDark ? '#2A2A2A' : '#E8E8E8',
                    borderColor: theme.border,
                    borderWidth: 1,
                  }]}
                  onPress={copyToClipboard}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityLabel="Copy founder code"
                  accessibilityHint="Double tap to copy your founder code to clipboard"
                >
                  <Animated.Text
                    style={[
                      styles.codeText,
                      { 
                        // Using high contrast colors for the code
                        color: theme.isDark ? '#FFFFFF' : '#000000',
                        transform: [{ scale: codeScale }] 
                      }
                    ]}
                  >
                    {founderCode}
                  </Animated.Text>
                  
                  <View style={styles.copyIconContainer}>
                    <Ionicons
                      name={isCopied ? "checkmark-circle" : "copy-outline"}
                      size={20}
                      color={isCopied ? "#4CAF50" : theme.textSecondary}
                    />
                  </View>
                </TouchableOpacity>
                
                {isVerified ? (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                    <Text style={styles.verifiedText}>Verified in Discord</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.verifyButton, { backgroundColor: DISCORD_BLUE }]}
                    onPress={openDiscord}
                  >
                    <Ionicons name="logo-discord" size={20} color="#FFFFFF" />
                    <Text style={styles.verifyButtonText}>Verify in Discord</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.noCodeContainer}>
                <Text style={[styles.noCodeText, { color: theme.text }]}>
                  Become one of our exclusive founding members by purchasing the app!
                </Text>
                
                {error && (
                  <Text style={styles.errorText}>{error}</Text>
                )}
                
                {/* Regular purchase button (normal mode) */}
                {!__DEV__ && (
                  <TouchableOpacity
                    style={[styles.assignButton, { backgroundColor: theme.primary }]}
                    onPress={handleAssignCode}
                    disabled={isAssigning}
                  >
                    {isAssigning ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.assignButtonText}>
                        {error ? "Try Again" : "Check My Status"}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
                
                {/* Mock purchase button (dev mode) */}
                {__DEV__ && (
                  <TouchableOpacity
                    style={[styles.mockPurchaseButton, { backgroundColor: '#FF9500' }]}
                    onPress={handleAssignCode}
                    disabled={isAssigning}
                  >
                    {isAssigning ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <View style={styles.mockPurchaseContent}>
                        <Ionicons name="flask" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.mockPurchaseText}>
                          SIMULATE APP PURCHASE (DEV ONLY)
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
        
        {/* Discord Benefits */}
        <View style={[styles.benefitsCard, { 
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        }]}>
          <Text style={[styles.benefitsTitle, { color: theme.text }]}>
            Founder Benefits
          </Text>
          
          <View style={styles.benefitItem}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.primary} />
            <View style={styles.benefitContent}>
              <Text style={[styles.benefitTitle, { color: theme.text }]}>
                Private Discord Access
              </Text>
              <Text style={[styles.benefitDescription, { color: theme.textSecondary }]}>
                Join our exclusive founder-only channels
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="sparkles-outline" size={24} color={theme.primary} />
            <View style={styles.benefitContent}>
              <Text style={[styles.benefitTitle, { color: theme.text }]}>
                Early Feature Access
              </Text>
              <Text style={[styles.benefitDescription, { color: theme.textSecondary }]}>
                Be the first to try new features
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="people-outline" size={24} color={theme.primary} />
            <View style={styles.benefitContent}>
              <Text style={[styles.benefitTitle, { color: theme.text }]}>
                Direct Developer Access
              </Text>
              <Text style={[styles.benefitDescription, { color: theme.textSecondary }]}>
                Share feedback directly with our team
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="gift-outline" size={24} color={theme.primary} />
            <View style={styles.benefitContent}>
              <Text style={[styles.benefitTitle, { color: theme.text }]}>
                Exclusive Rewards
              </Text>
              <Text style={[styles.benefitDescription, { color: theme.textSecondary }]}>
                Special perks only for our founders
              </Text>
            </View>
          </View>
        </View>
        
        {/* Instructions - UPDATED VERIFICATION STEPS - ALWAYS VISIBLE FOR TESTING */}
        {true && (
          <View style={[styles.instructionsCard, { 
            backgroundColor: theme.card,
            borderColor: theme.border,
            shadowColor: theme.shadow,
          }]}>
            <View style={styles.verificationHeaderContainer}>
              <Ionicons name="shield-checkmark" size={24} color={theme.primary} style={{marginRight: 8}} />
              <Text style={[styles.instructionsTitle, { color: theme.text }]}>
                LIFECOMPASS FOUNDER VERIFICATION
              </Text>
            </View>
            
            <Text style={[styles.instructionsSubtitle, { color: theme.textSecondary }]}>
              Follow these steps to verify your founder status and access exclusive founder channels:
            </Text>
            
            {/* Step 1 */}
            <View style={styles.verificationStep}>
              <View style={[styles.stepNumber, { backgroundColor: DISCORD_BLUE }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Ionicons name="log-in-outline" size={18} color={DISCORD_BLUE} style={{marginRight: 6}} />
                  <Text style={[styles.stepTitle, { color: theme.text }]}>
                    Join our Discord server
                  </Text>
                </View>
                <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                  Tap the "Join Discord & Verify" button below
                </Text>
                <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                  Accept the server invitation
                </Text>
              </View>
            </View>
            
            {/* Step 2 */}
            <View style={styles.verificationStep}>
              <View style={[styles.stepNumber, { backgroundColor: DISCORD_BLUE }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Ionicons name="navigate-outline" size={18} color={DISCORD_BLUE} style={{marginRight: 6}} />
                  <Text style={[styles.stepTitle, { color: theme.text }]}>
                    Navigate to verification channel
                  </Text>
                </View>
                <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                  Find the #verify-your-founder-status channel in the server
                </Text>
              </View>
            </View>
            
            {/* Step 3 */}
            <View style={styles.verificationStep}>
              <View style={[styles.stepNumber, { backgroundColor: DISCORD_BLUE }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Ionicons name="copy-outline" size={18} color={DISCORD_BLUE} style={{marginRight: 6}} />
                  <Text style={[styles.stepTitle, { color: theme.text }]}>
                    Copy your unique founder code
                  </Text>
                </View>
                <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                  Your code is displayed above - tap it to copy to clipboard
                </Text>
                
                {/* Code highlight box for emphasis */}
                {founderCode && (
                  <View style={[styles.codeHighlight, {
                    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  }]}>
                    <Text style={[styles.codeHighlightText, { color: theme.text }]}>
                      {founderCode}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Step 4 */}
            <View style={styles.verificationStep}>
              <View style={[styles.stepNumber, { backgroundColor: DISCORD_BLUE }]}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Ionicons name="chatbox-outline" size={18} color={DISCORD_BLUE} style={{marginRight: 6}} />
                  <Text style={[styles.stepTitle, { color: theme.text }]}>
                    Type the verification command
                  </Text>
                </View>
                <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                  In the verification channel, type the following command:
                </Text>
                
                {/* Command box */}
                <View style={[styles.commandContainer, {
                  backgroundColor: theme.isDark ? '#2A2A2A' : '#F0F0F0',
                  borderColor: theme.border
                }]}>
                  <Text style={[styles.commandText, { color: theme.isDark ? '#FFFFFF' : '#000000' }]}>
                    !verify {founderCode || 'YOUR-FOUNDER-CODE'} YourDiscordUsername
                  </Text>
                  <Text style={[styles.commandExample, { color: theme.textSecondary }]}>
                    Example: !verify {founderCode || 'LC-1234'} JohnDoe#1234
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Step 5 */}
            <View style={styles.verificationStep}>
              <View style={[styles.stepNumber, { backgroundColor: DISCORD_BLUE }]}>
                <Text style={styles.stepNumberText}>5</Text>
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Ionicons name="checkmark-circle-outline" size={18} color={DISCORD_BLUE} style={{marginRight: 6}} />
                  <Text style={[styles.stepTitle, { color: theme.text }]}>
                    Verification complete
                  </Text>
                </View>
                <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                  Once verified, you'll automatically receive the Founder role
                </Text>
                <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                  This gives you access to exclusive #founders-corner channels
                </Text>
              </View>
            </View>
            
            {/* Help note */}
            <View style={styles.helpContainer}>
              <Ionicons name="help-circle-outline" size={22} color={theme.primary} />
              <Text style={[styles.helpText, { color: theme.textSecondary }]}>
                Need help? Type <Text style={{fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'}}>!help</Text> in the verification channel or contact an admin in Discord.
              </Text>
            </View>
            
            {/* Important note */}
            <View style={styles.noteContainer}>
              <Ionicons name="information-circle-outline" size={20} color={theme.textSecondary} />
              <Text style={[styles.noteText, { color: theme.textSecondary }]}>
                Each code can only be verified once and is linked to your Discord account.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
      
      {/* Discord Button */}
      {founderCode && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={[styles.discordButton, { 
              backgroundColor: DISCORD_BLUE,
              shadowColor: "#000",
            }]}
            onPress={openDiscord}
          >
            <Ionicons name="logo-discord" size={24} color="#FFFFFF" />
            <Text style={styles.discordButtonText}>
              {isVerified ? "Open Discord Community" : "Join Discord & Verify"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const bannerStyles = StyleSheet.create({
  container: {
    marginVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    alignSelf: 'center',
  },
  content: {
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  message: {
    fontSize: 16,
    flex: 1,
  },
  progressContainer: {
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 12,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholderRight: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 120,
  },
  discordLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  discordLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: DISCORD_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  discordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DISCORD_BLUE,
    marginTop: 8,
  },
  
  // Dev Mode Banner
  devBanner: {
    backgroundColor: '#FF3B30',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  devBannerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 6,
  },
  
  // Test Mode Panel
  testModePanel: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  testModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testModeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  testModeOption: {
    marginBottom: 12,
  },
  testModeLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  testModeSegment: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    flexWrap: 'wrap',
  },
  testModeSegmentButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  testModeSegmentText: {
    fontSize: 12,
  },
  testModeButton: {
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  testModeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  testModeNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
  },
  testModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  testModeToggleText: {
    fontSize: 12,
    marginRight: 4,
  },
  
  // Status Log
  statusLogContainer: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    maxHeight: 150,
  },
  statusLogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusLogTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  statusLogContent: {
    maxHeight: 120,
  },
  statusLogItems: {
    padding: 8,
  },
  statusLogItem: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  
  // Founder Card
  founderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  founderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  founderCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  founderCardBody: {
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  codeLabel: {
    fontSize: 14,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  codeText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  copyIconContainer: {
    padding: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 10,
  },
  verifiedText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DISCORD_BLUE,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  noCodeContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noCodeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  errorText: {
    color: '#F44336',
    marginBottom: 16,
    textAlign: 'center',
  },
  assignButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  mockPurchaseButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  mockPurchaseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockPurchaseText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Benefits Card
  benefitsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitContent: {
    marginLeft: 12,
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  benefitDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  
  // Instructions Card
  instructionsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  verificationHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  instructionsSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  verificationStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  codeHighlight: {
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  codeHighlightText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    fontWeight: '500',
  },
  commandContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  commandText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '500',
  },
  commandExample: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  helpContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(63, 81, 181, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  helpText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  noteContainer: {
    flexDirection: 'row',
    marginTop: 12,
    padding: 8,
    alignItems: 'center',
  },
  noteText: {
    fontSize: 13,
    marginLeft: 6,
    fontStyle: 'italic',
    flex: 1,
  },
  
  // Bottom Button
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'transparent',
  },
  discordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  discordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default CommunityScreen;
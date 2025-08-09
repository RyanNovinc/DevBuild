// src/screens/Onboarding/screens/CompletionPage.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Linking,
  Modal,
  SafeAreaView,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import ResponsiveText from '../components/ResponsiveText';
import NavigationHeader from '../components/NavigationHeader';
import { getRelevantStats } from '../utils/getLanguageStats';
import { getAustralianRelevantStats } from '../data/australianGoalStats';
import { getUKRelevantStats } from '../data/ukGoalStats';
import { getUSARelevantStats } from '../data/usaGoalStats';
import { getCanadaRelevantStats } from '../data/canadaGoalStats';
import { getIndiaRelevantStats } from '../data/indiaGoalStats';
import { getIrelandRelevantStats } from '../data/irelandGoalStats';
import { getMalaysiaRelevantStats } from '../data/malaysiaGoalStats';
import { getNewZealandRelevantStats } from '../data/newzealandGoalStats';
import { getNigeriaRelevantStats } from '../data/nigeriaGoalStats';
import { getPhilippinesRelevantStats } from '../data/philippinesGoalStats';
import { getSingaporeRelevantStats } from '../data/singaporeGoalStats';
import { getSouthAfricaRelevantStats } from '../data/southafricaGoalStats';
import { getOtherRelevantStats } from '../data/otherGoalStats';
// Import useI18n hook
import { useI18n } from '../context/I18nContext';

const { width, height } = Dimensions.get('window');

const CompletionPage = ({ onComplete, onBack, isNavigating, domain, goal, country = 'australia' }) => {
  // Get translation function from I18n context
  const { t, currentLanguage } = useI18n();
  
  // Helper function for more readable translation calls
  const translate = (key, namespace = 'completion', params = {}) => {
    return t(key, namespace, params);
  };

  // Core state - simplified without AI messaging
  const [allMessagesComplete, setAllMessagesComplete] = useState(true); // Skip AI messages
  const [isTransitioning, setIsTransitioning] = useState(false); // Prevent rapid taps
  const [hasCompleted, setHasCompleted] = useState(false); // Prevent multiple completion calls
  
  // State for statistics
  const [statsList, setStatsList] = useState([]);
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Animation values for modals
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;
  
  
  // Core animations
  const messageOpacity = useRef(new Animated.Value(1)).current;
  const messageTextOpacity = useRef(new Animated.Value(1)).current;
  const tapPromptOpacity = useRef(new Animated.Value(0)).current;
  const congratsOpacity = useRef(new Animated.Value(0)).current;
  const congratsScale = useRef(new Animated.Value(0.8)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const statCardOpacity = useRef(new Animated.Value(0)).current;
  const statCardFadeAnim = useRef(new Animated.Value(1)).current;
  
  // Icon animation for sparkle icon
  const iconPulse = useRef(new Animated.Value(1)).current;
  
  // Fallback domain and goal data
  const defaultDomain = {
    name: "Personal Growth",
    color: "#3b82f6",
    icon: "trending-up"
  };
  
  const defaultGoal = {
    name: "Learning New Skills"
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
  
  // Load statistics when component mounts or when domain/goal changes
  useEffect(() => {
    const domainName = domain?.name || defaultDomain.name;
    const goalName = goal?.name || defaultGoal.name;
    
    // Debug logging
    console.log('CompletionPage - Loading stats for:', {
      domainName,
      goalName,
      country,
      domain: domain?.name,
      goal: goal?.name
    });
    
    try {
      // Clear any existing stats and reset index when domain or goal changes
      setStatsList([]);
      setCurrentStatIndex(0);
      
      let statsResult;
      
      // Use country-specific statistics if available
      if (country === 'australia') {
        statsResult = getAustralianRelevantStats(domainName, goalName);
      } else if (country === 'uk') {
        statsResult = getUKRelevantStats(domainName, goalName);
      } else if (country === 'usa') {
        statsResult = getUSARelevantStats(domainName, goalName);
      } else if (country === 'canada') {
        statsResult = getCanadaRelevantStats(domainName, goalName);
      } else if (country === 'india') {
        statsResult = getIndiaRelevantStats(domainName, goalName);
      } else if (country === 'ireland') {
        statsResult = getIrelandRelevantStats(domainName, goalName);
      } else if (country === 'malaysia') {
        statsResult = getMalaysiaRelevantStats(domainName, goalName);
      } else if (country === 'newzealand') {
        statsResult = getNewZealandRelevantStats(domainName, goalName);
      } else if (country === 'nigeria') {
        statsResult = getNigeriaRelevantStats(domainName, goalName);
      } else if (country === 'philippines') {
        statsResult = getPhilippinesRelevantStats(domainName, goalName);
      } else if (country === 'singapore') {
        statsResult = getSingaporeRelevantStats(domainName, goalName);
      } else if (country === 'southafrica') {
        statsResult = getSouthAfricaRelevantStats(domainName, goalName);
      } else if (country === 'other') {
        statsResult = getOtherRelevantStats(domainName, goalName);
      } else {
        // Fall back to general stats for other countries
        statsResult = getRelevantStats(domainName, goalName, currentLanguage);
      }
      
      console.log('Stats result:', statsResult);
      
      if (statsResult?.all && statsResult.all.length > 0) {
        setStatsList(statsResult.all);
      } else {
        // Fallback statistic if none are found
        setStatsList([{
          title: "Written Goals Success Rate",
          figure: "42%",
          description: "People who write down their goals are 42% more likely to achieve them compared to those who only think about them.",
          source: "Dominican University of California",
          link: "https://www.dominican.edu/sites/default/files/2020-02/gailmatthews-harvard-goals-researchsummary.pdf",
          details: {
            title: "The Power of Writing Down Goals",
            publication: "Study at Dominican University of California",
            authors: "Dr. Gail Matthews",
            date: "2015",
            description: "This landmark study involved 267 participants across multiple countries and definitively proved that writing goals down significantly increases achievement rates.",
            link: "https://www.dominican.edu/sites/default/files/2020-02/gailmatthews-harvard-goals-researchsummary.pdf"
          }
        }]);
      }
    } catch (error) {
      console.log('Error loading stats:', error);
      // Set a fallback statistic
      setStatsList([{
        title: "Written Goals Success Rate",
        figure: "42%",
        description: "People who write down their goals are 42% more likely to achieve them compared to those who only think about them.",
        source: "Dominican University of California",
        link: "https://www.dominican.edu/sites/default/files/2020-02/gailmatthews-harvard-goals-researchsummary.pdf",
        details: {
          title: "The Power of Writing Down Goals",
          publication: "Study at Dominican University of California",
          authors: "Dr. Gail Matthews",
          date: "2015",
          description: "This landmark study involved 267 participants across multiple countries and definitively proved that writing goals down significantly increases achievement rates.",
          link: "https://www.dominican.edu/sites/default/files/2020-02/gailmatthews-harvard-goals-researchsummary.pdf"
        }
      }]);
    }
  }, [domain, goal, country, currentLanguage]); // Make sure this effect reruns when domain, goal, or country changes
  
  // Removed message handling - skip AI prompts
  
  // Show congrats animation after all messages are complete
  useEffect(() => {
    if (allMessagesComplete) {
      Animated.parallel([
        Animated.timing(congratsOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true
        }),
        Animated.spring(congratsScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true
        }),
        Animated.timing(statCardOpacity, {
          toValue: 1,
          duration: 800,
          delay: 600,
          useNativeDriver: true
        }),
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 800,
          delay: 1000,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [allMessagesComplete]);
  
  // Get current message based on step
  const getCurrentMessage = () => {
    switch(messageStep) {
      case 1:
        return translate('message1');
      case 2:
        return translate('message2');
      case 3:
        return translate('message3');
      case 4:
        return translate('message4');
      default:
        return "";
    }
  };
  
  // Handle screen tap to skip typing animation or continue to next step
  const handleScreenTap = () => {
    // Prevent rapid taps that cause race conditions
    if (isTransitioning) {
      return;
    }

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
    
    // If current message is complete, proceed to next message or finish
    if (messageComplete) {
      // Set transitioning state to prevent rapid taps
      setIsTransitioning(true);
      
      // Hide tap prompt
      Animated.timing(tapPromptOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }).start();
      
      if (messageStep < 4) {
        // Transition to next message
        Animated.timing(messageTextOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }).start(() => {
          setMessageStep(messageStep + 1);
          setMessageComplete(false);
          setShowTapToContinue(false);
          
          Animated.timing(messageTextOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true
          }).start(() => {
            // Reset transitioning state after animation completes
            setIsTransitioning(false);
          });
        });
      } else if (messageStep === 4) {
        // All messages complete, show congratulations
        Animated.timing(messageOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start(() => {
          setAllMessagesComplete(true);
          // Reset transitioning state after final animation
          setIsTransitioning(false);
        });
      }
    }
  };
  
  // Handle navigation between statistics
  const navigateStats = (direction) => {
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // Animate card transition
    Animated.sequence([
      Animated.timing(statCardFadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(statCardFadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true
      })
    ]).start();
    
    // Calculate new index
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentStatIndex + 1) % statsList.length;
    } else {
      newIndex = (currentStatIndex - 1 + statsList.length) % statsList.length;
    }
    
    // Update index after fade out
    setTimeout(() => {
      setCurrentStatIndex(newIndex);
    }, 150);
  };
  
  // Handle showing details modal
  const handleShowDetails = () => {
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // Reset animations
    modalFadeAnim.setValue(0);
    modalScaleAnim.setValue(0.9);
    
    // Show modal
    setShowDetailsModal(true);
    
    // Animate modal entrance
    Animated.parallel([
      Animated.timing(modalFadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true
      }),
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        tension: 65,
        friction: 7,
        useNativeDriver: true
      })
    ]).start();
  };
  
  // Handle closing details modal
  const handleCloseDetails = () => {
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // Animate modal exit
    Animated.parallel([
      Animated.timing(modalFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(modalScaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      setShowDetailsModal(false);
    });
  };
  
  // Handle source link press
  const handleSourcePress = async (url) => {
    if (!url) return;
    
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    try {
      // Check if the URL can be opened
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.warn(`Cannot open URL: ${url}`);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  // Handle completion with protection against multiple calls
  const handleComplete = () => {
    // Prevent multiple completion calls
    if (hasCompleted || isNavigating) {
      return;
    }

    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available:', error);
    }

    // Set completion state to prevent further calls
    setHasCompleted(true);
    
    // Call the parent's onComplete function
    if (onComplete) {
      onComplete();
    }
  };
  
  // Get the current statistic
  const currentStat = statsList[currentStatIndex];
  
  return (
    <View style={styles.container}>
      {/* Removed full-screen touchable - not needed */}
      
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          // Increased padding to avoid overlap with button
          { paddingBottom: 100 }
        ]}
        showsVerticalScrollIndicator={false}
        pointerEvents="auto"
      >
        {/* AI Message - Single container that changes content */}
        {!allMessagesComplete && (
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
              <ResponsiveText style={styles.messageText}>
                🎉 Congratulations! Your personalized life compass is ready.
              </ResponsiveText>
            </Animated.View>
          </Animated.View>
        )}
        
        {/* Congratulations Animation */}
        {allMessagesComplete && (
          <Animated.View 
            style={[
              styles.congratsContainer, 
              { 
                opacity: congratsOpacity,
                transform: [{ scale: congratsScale }]
              }
            ]}
          >
            <View style={styles.congratsIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#4ade80" />
            </View>
            <ResponsiveText style={styles.congratsTitle}>
              {translate('allSet')}
            </ResponsiveText>
            <ResponsiveText style={styles.congratsText}>
              {translate('goalCreated')}
            </ResponsiveText>
          </Animated.View>
        )}
        
        {/* Research Insights Card - Directly displayed */}
        {allMessagesComplete && currentStat && (
          <Animated.View 
            style={[
              styles.researchCard,
              { opacity: statCardOpacity }
            ]}
            accessibilityLabel={translate('researchInsights')}
            accessibilityRole="text"
          >
            <LinearGradient
              colors={['rgba(30, 58, 138, 0.6)', 'rgba(30, 64, 175, 0.8)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBackground}
            />
            
            <View style={styles.researchHeader}>
              <ResponsiveText style={styles.researchTitle}>
                {translate('researchInsights')}
              </ResponsiveText>
              <ResponsiveText style={styles.researchSubtitle}>
                {translate('evidenceBased')}
              </ResponsiveText>
            </View>
            
            {/* Navigation arrows and dot indicators */}
            {statsList.length > 1 && (
              <View style={styles.navigationControls}>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => navigateStats('prev')}
                  accessibilityLabel="Previous statistic"
                  accessibilityRole="button"
                >
                  <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                
                {/* Dot indicators replacing the numeric counter */}
                <View style={styles.dotsContainer}>
                  {statsList.map((_, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.dot, 
                        { backgroundColor: index === currentStatIndex ? '#3b82f6' : 'rgba(255,255,255,0.3)' }
                      ]}
                    />
                  ))}
                </View>
                
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => navigateStats('next')}
                  accessibilityLabel="Next statistic"
                  accessibilityRole="button"
                >
                  <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
            
            <Animated.View style={[styles.statContainer, { opacity: statCardFadeAnim }]}>
              <View style={styles.statIconContainer}>
                <Ionicons 
                  name={domain?.icon || "stats-chart"} 
                  size={20} 
                  color="#FFFFFF" 
                />
              </View>
              
              <ResponsiveText style={styles.statTitle}>
                {currentStat.title}
              </ResponsiveText>
              
              <View style={styles.figureContainer}>
                <ResponsiveText style={styles.figureText}>
                  {currentStat.figure}
                </ResponsiveText>
              </View>
              
              <View style={styles.statFooter}>
                <TouchableOpacity
                  style={styles.moreInfoButton}
                  onPress={handleShowDetails}
                  accessibilityLabel={translate('moreInfo')}
                  accessibilityRole="button"
                  accessibilityHint="View detailed information about this research"
                >
                  <ResponsiveText style={styles.moreInfoButtonText}>
                    {translate('moreInfo')}
                  </ResponsiveText>
                  <Ionicons name="information-circle-outline" size={16} color="#3b82f6" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        )}
      </ScrollView>
      
      {/* Removed tap to continue prompt - not needed */}
      
      {/* Start Using App Button - Now outside ScrollView to make it sticky */}
      {allMessagesComplete && (
        <SafeAreaView style={styles.buttonSafeArea}>
          <Animated.View style={[styles.startButtonContainer, { opacity: buttonOpacity }]}>
            <TouchableOpacity
              style={[
                styles.startButton,
                (isNavigating || hasCompleted) && styles.disabledButton
              ]}
              onPress={handleComplete}
              disabled={isNavigating || hasCompleted}
              accessibilityLabel={translate('startUsing', 'common')}
              accessibilityRole="button"
            >
              {isNavigating ? (
                <View style={styles.loadingContainer}>
                  <ResponsiveText style={styles.startButtonText}>
                    {translate('loading', 'common')}
                  </ResponsiveText>
                </View>
              ) : (
                <>
                  <ResponsiveText style={styles.startButtonText}>
                    {translate('startUsing', 'common')}
                  </ResponsiveText>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      )}
      
      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseDetails}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.detailsModalContent,
              {
                opacity: modalFadeAnim,
                transform: [{ scale: modalScaleAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(30, 58, 138, 0.6)', 'rgba(30, 64, 175, 0.8)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBackground}
            />
            
            <ResponsiveText style={styles.detailsTitle}>
              {currentStat?.details?.title || currentStat?.title || translate('studyDetailsTitle')}
            </ResponsiveText>
            
            <ScrollView style={styles.detailsScroll}>
              <View style={styles.detailsSection}>
                <ResponsiveText style={styles.detailsSectionTitle}>
                  Research Summary
                </ResponsiveText>
                <ResponsiveText style={styles.detailsText}>
                  {currentStat?.description || "No summary available."}
                </ResponsiveText>
              </View>
              
              <View style={styles.detailsSection}>
                <ResponsiveText style={styles.detailsSectionTitle}>
                  {translate('publicationTitle')}
                </ResponsiveText>
                <ResponsiveText style={styles.detailsText}>
                  {currentStat?.details?.publication || "Not specified"}
                </ResponsiveText>
              </View>
              
              <View style={styles.detailsSection}>
                <ResponsiveText style={styles.detailsSectionTitle}>
                  {translate('authorsTitle')}
                </ResponsiveText>
                <ResponsiveText style={styles.detailsText}>
                  {currentStat?.details?.authors || "Not specified"}
                </ResponsiveText>
              </View>
              
              <View style={styles.detailsSection}>
                <ResponsiveText style={styles.detailsSectionTitle}>
                  {translate('dateTitle')}
                </ResponsiveText>
                <ResponsiveText style={styles.detailsText}>
                  {currentStat?.details?.date || "Not specified"}
                </ResponsiveText>
              </View>
              
              <View style={styles.detailsSection}>
                <ResponsiveText style={styles.detailsSectionTitle}>
                  {translate('studyDetailsTitle')}
                </ResponsiveText>
                <ResponsiveText style={styles.detailsText}>
                  {currentStat?.details?.description || "No additional details available."}
                </ResponsiveText>
              </View>
              
              {currentStat?.link && (
                <TouchableOpacity
                  style={styles.sourceButton}
                  onPress={() => handleSourcePress(currentStat.link)}
                >
                  <ResponsiveText style={styles.sourceButtonText}>
                    {translate('visitSource')}
                  </ResponsiveText>
                  <Ionicons name="open-outline" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseDetails}
            >
              <ResponsiveText style={styles.closeButtonText}>
                {translate('close', 'common')}
              </ResponsiveText>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
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
    zIndex: 10, // Ensure it's above everything else
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60, // Add top padding to compensate for removed NavigationHeader
    flexGrow: 1,
  },
  messageContainer: {
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
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
  congratsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 24,
    padding: 10,
  },
  congratsIconContainer: {
    marginBottom: 20,
  },
  congratsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  congratsText: {
    fontSize: 16,
    color: '#BBBBBB',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
    marginBottom: 8,
  },
  researchCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#121214',
    borderWidth: 2,
    borderColor: '#3b82f6',
    // Adding a max height to ensure it doesn't get too large
    maxHeight: height * 0.5,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.4,
  },
  researchHeader: {
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  researchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  researchSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // New styles for dot indicators
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statContainer: {
    padding: 14,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  figureContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  figureText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statDescription: {
    fontSize: 14,
    color: '#DDDDDD',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  statFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
    paddingBottom: 8,
  },
  sourceText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8, // Add space between source and button
    lineHeight: 16, // Better line height for readability
  },
  moreInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  moreInfoButtonText: {
    fontSize: 12,
    color: '#3b82f6',
  },
  buttonSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  startButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: 'transparent', // Transparent background for floating effect
  },
  startButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, // Increased shadow for better visibility
    shadowOpacity: 0.4, // Stronger shadow
    shadowRadius: 12, // Larger shadow radius
    elevation: 10, // Higher elevation for Android
  },
  disabledButton: {
    opacity: 0.7,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailsModalContent: {
    backgroundColor: '#121214',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    maxHeight: '75%',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  detailsScroll: {
    marginBottom: 20,
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailsSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 6,
  },
  detailsText: {
    fontSize: 14,
    color: '#DDDDDD',
    lineHeight: 20,
  },
  sourceButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  sourceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  }
});

export default CompletionPage;
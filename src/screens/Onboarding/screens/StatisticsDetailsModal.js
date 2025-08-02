// src/screens/Onboarding/screens/StatisticsDetailsModal.js
import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import ResponsiveText from '../components/ResponsiveText';
import { getRelevantStats, getFeaturedStat } from '../utils/getLanguageStats';
import { isLowEndDevice, useOrientation } from '../utils/deviceUtils';
import { useI18n } from '../context/I18nContext';

// Get initial dimensions for static styles
const INITIAL_WINDOW = Dimensions.get('window');

/**
 * StatisticsDetailsModal - Modal displaying research statistics relevant to the user's domain and goal
 * Provides evidence-based motivation and credibility for the user's chosen path
 * 
 * @param {boolean} visible - Whether the modal is visible
 * @param {string} domainName - The user's selected domain (e.g., "Career & Work")
 * @param {string} goalName - The user's selected goal (e.g., "Work-Life Balance")
 * @param {object} domainData - The domain object with color and icon information
 * @param {function} onClose - Function to close the modal
 * @param {function} onSourcePress - Function to open source URL (optional, will use internal handler if not provided)
 */
const StatisticsDetailsModal = ({ 
  visible, 
  domainName = "Personal Growth",
  goalName = "Learning New Skills",
  domainData = { color: "#3b82f6", icon: "trending-up" },
  onClose,
  onSourcePress
}) => {
  // Get translation function and current language
  const { t, currentLanguage } = useI18n();
  
  // Local state
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const [statsList, setStatsList] = useState([]);
  const [featuredStat, setFeaturedStat] = useState(null);
  const [activeTab, setActiveTab] = useState('featured'); // 'featured', 'goal', 'domain', 'general'
  
  // Get orientation for responsive layout
  const { orientation, dimensions } = useOrientation();
  
  // Check if device is low-end
  const isLowEnd = isLowEndDevice();
  
  // Get current dimensions for responsive sizing
  const { width, height } = dimensions || INITIAL_WINDOW;
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const cardFadeAnim = useRef(new Animated.Value(1)).current;
  
  // Tab indicator animation
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  
  // Load statistics when the modal becomes visible
  useEffect(() => {
    if (visible) {
      try {
        // Get stats relevant to the user's selections with current language
        const { general, domainSpecific, goalSpecific, all } = getRelevantStats(domainName, goalName, currentLanguage);
        
        // Set the featured stat
        const featured = getFeaturedStat(domainName, goalName, currentLanguage);
        setFeaturedStat(featured);
        
        // Set the full stats list - ensure we have at least one item
        setStatsList(all.length > 0 ? all : [featured]);
        
        // Reset UI state
        setCurrentStatIndex(0);
        setActiveTab('featured');
      } catch (error) {
        console.log('Error loading stats:', error);
        // Fallback to a default stat if there's an error
        const defaultStat = {
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
        };
        setFeaturedStat(defaultStat);
        setStatsList([defaultStat]);
      }
    }
  }, [visible, domainName, goalName, currentLanguage]);
  
  // Dynamic styles based on current dimensions
  const dynamicStyles = {
    statDetailsContent: {
      backgroundColor: '#121214',
      borderRadius: 20,
      padding: 20,
      width: Math.min(width * 0.85, 400),
      maxHeight: height * 0.75,
      borderWidth: 2,
      borderColor: domainData?.color || '#2563eb',
    },
    statDetailsContentLandscape: {
      width: Math.min(width * 0.65, 500),
      maxHeight: height * 0.85,
    }
  };
  
  // Tab positions for animation
  const tabPositions = {
    featured: 0,
    goal: 1,
    domain: 2,
    general: 3
  };
  
  // Run entrance animation when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      
      // Optimize animations for low-end devices
      if (isLowEnd) {
        // Simplified animation for low-end devices
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true
          })
        ]).start();
      } else {
        // Full animation for modern devices
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 65,
            friction: 7,
            useNativeDriver: true
          })
        ]).start();
      }
    }
  }, [visible, isLowEnd]);
  
  // Handle tab changes
  useEffect(() => {
    // Animate tab indicator position
    Animated.spring(tabIndicatorPosition, {
      toValue: tabPositions[activeTab],
      tension: 60,
      friction: 7,
      useNativeDriver: true,
    }).start();
    
    // Filter stats based on selected tab
    if (visible) {
      try {
        const { general, domainSpecific, goalSpecific, all } = getRelevantStats(domainName, goalName, currentLanguage);
        
        switch (activeTab) {
          case 'featured':
            setStatsList([getFeaturedStat(domainName, goalName, currentLanguage)]);
            break;
          case 'goal':
            setStatsList(goalSpecific.length > 0 ? goalSpecific : [getFeaturedStat(domainName, goalName, currentLanguage)]);
            break;
          case 'domain':
            setStatsList(domainSpecific.length > 0 ? domainSpecific : [getFeaturedStat(domainName, goalName, currentLanguage)]);
            break;
          case 'general':
            setStatsList(general.length > 0 ? general : [getFeaturedStat(domainName, goalName, currentLanguage)]);
            break;
          default:
            setStatsList(all.length > 0 ? all : [getFeaturedStat(domainName, goalName, currentLanguage)]);
        }
        
        // Reset current index
        setCurrentStatIndex(0);
      } catch (error) {
        console.log('Error filtering stats:', error);
      }
    }
  }, [activeTab, visible, domainName, goalName, currentLanguage]);
  
  // Handle closing animation
  const handleClose = () => {
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // Optimize animations for low-end devices
    if (isLowEnd) {
      // Simplified animation for low-end devices
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true
        })
      ]).start(() => {
        if (onClose) onClose();
      });
    } else {
      // Full animation for modern devices
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true
        })
      ]).start(() => {
        if (onClose) onClose();
      });
    }
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
    
    // If external handler is provided, use it
    if (onSourcePress) {
      onSourcePress(url);
      return;
    }
    
    // Otherwise handle internally
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
      Animated.timing(cardFadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(cardFadeAnim, {
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
  
  // Handle tab selection
  const handleTabPress = (tab) => {
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    setActiveTab(tab);
  };
  
  // Process text to add explanations for acronyms
  const processText = (text) => {
    if (!text) return '';
    
    if (text.includes("OKRs") && !text.includes("OKRs (Objectives and Key Results)")) {
      return text.replace("OKRs", "OKRs (Objectives and Key Results)");
    }
    return text;
  };
  
  // Get the current statistic to display
  const currentStat = statsList && statsList.length > 0 ? 
    statsList[currentStatIndex] : 
    featuredStat;
  
  // Make sure we have a stat to display, otherwise don't render the modal
  if (!visible || !currentStat) {
    // If visible but no currentStat, we need to show a fallback
    if (visible) {
      const fallbackStat = {
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
      };
      
      // Update state with fallback
      if (!currentStat) {
        setFeaturedStat(fallbackStat);
        setStatsList([fallbackStat]);
        return null; // Return null for this render cycle, next cycle will have the fallback
      }
    } else {
      return null;
    }
  }
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
      accessibilityViewIsModal={true}
    >
      <Animated.View 
        style={[
          styles.modalContainer,
          { opacity: fadeAnim }
        ]}
        accessibilityLabel={t('researchInsightsModal', 'statistics')}
        accessibilityRole="dialog"
      >
        <Animated.View 
          style={[
            dynamicStyles.statDetailsContent,
            orientation === 'landscape' && dynamicStyles.statDetailsContentLandscape,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(30, 58, 138, 0.6)', 'rgba(30, 64, 175, 0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          />
          
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleContainer}>
              <ResponsiveText 
                style={styles.modalTitle}
                accessibilityRole="header"
              >
                {t('researchInsights', 'statistics')}
              </ResponsiveText>
              <ResponsiveText style={styles.modalSubtitle}>
                {t('evidenceBasedStats', 'statistics')}
              </ResponsiveText>
            </View>
          </View>
          
          {/* Tab Navigation */}
          <View 
            style={styles.tabContainer}
            accessibilityLabel={t('categoryTabs', 'statistics')}
            accessibilityRole="tablist"
          >
            <Animated.View 
              style={[
                styles.tabIndicator, 
                {
                  transform: [{ 
                    translateX: tabIndicatorPosition.interpolate({
                      inputRange: [0, 3],
                      outputRange: [0, 240] // Width of tabContainer divided by number of tabs
                    })
                  }]
                }
              ]}
            />
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'featured' && styles.activeTab]} 
              onPress={() => handleTabPress('featured')}
              accessibilityLabel={t('featuredTab', 'statistics')}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'featured' }}
            >
              <Ionicons name="star" size={16} color={activeTab === 'featured' ? domainData?.color || '#3b82f6' : '#FFFFFF'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'goal' && styles.activeTab]} 
              onPress={() => handleTabPress('goal')}
              accessibilityLabel={t('goalTab', 'statistics')}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'goal' }}
            >
              <Ionicons name="flag" size={16} color={activeTab === 'goal' ? domainData?.color || '#3b82f6' : '#FFFFFF'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'domain' && styles.activeTab]} 
              onPress={() => handleTabPress('domain')}
              accessibilityLabel={t('domainTab', 'statistics')}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'domain' }}
            >
              <Ionicons name={domainData?.icon || 'grid'} size={16} color={activeTab === 'domain' ? domainData?.color || '#3b82f6' : '#FFFFFF'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'general' && styles.activeTab]} 
              onPress={() => handleTabPress('general')}
              accessibilityLabel={t('generalTab', 'statistics')}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'general' }}
            >
              <Ionicons name="stats-chart" size={16} color={activeTab === 'general' ? domainData?.color || '#3b82f6' : '#FFFFFF'} />
            </TouchableOpacity>
          </View>
          
          {/* Stat Card */}
          <Animated.View 
            style={[styles.statCard, { opacity: cardFadeAnim }]}
            accessibilityLabel={t('statisticInformation', 'statistics')}
            accessibilityRole="text"
          >
            <View style={styles.statHeader}>
              <View 
                style={[
                  styles.statIconContainer,
                  { backgroundColor: domainData?.color || '#3b82f6' }
                ]}
              >
                <Ionicons 
                  name={activeTab === 'goal' ? 'flag' : activeTab === 'domain' ? (domainData?.icon || 'grid') : 'stats-chart'} 
                  size={20} 
                  color="#FFFFFF" 
                />
              </View>
              {statsList.length > 1 && (
                <View style={styles.statCountContainer}>
                  <ResponsiveText style={styles.statCountText}>
                    {currentStatIndex + 1}/{statsList.length}
                  </ResponsiveText>
                </View>
              )}
            </View>
            
            <ScrollView 
              style={styles.statContentScroll}
              contentContainerStyle={styles.statContentContainer}
              showsVerticalScrollIndicator={true}
            >
              <ResponsiveText style={styles.statTitle}>
                {processText(currentStat.title)}
              </ResponsiveText>
              
              <View style={styles.statFigureContainer}>
                <ResponsiveText style={styles.statFigure}>
                  {currentStat.figure}
                </ResponsiveText>
              </View>
              
              <ResponsiveText style={styles.statDescription}>
                {processText(currentStat.description)}
              </ResponsiveText>
              
              {/* Details Sections */}
              <View style={styles.detailsSection}>
                <ResponsiveText style={styles.detailsSectionTitle}>
                  {t('publication', 'statistics')}
                </ResponsiveText>
                <ResponsiveText style={styles.detailsText}>
                  {currentStat.details?.publication || t('notSpecified', 'statistics')}
                </ResponsiveText>
              </View>
              
              <View style={styles.detailsSection}>
                <ResponsiveText style={styles.detailsSectionTitle}>
                  {t('authors', 'statistics')}
                </ResponsiveText>
                <ResponsiveText style={styles.detailsText}>
                  {currentStat.details?.authors || t('notSpecified', 'statistics')}
                </ResponsiveText>
              </View>
              
              <View style={styles.detailsSection}>
                <ResponsiveText style={styles.detailsSectionTitle}>
                  {t('date', 'statistics')}
                </ResponsiveText>
                <ResponsiveText style={styles.detailsText}>
                  {currentStat.details?.date || t('notSpecified', 'statistics')}
                </ResponsiveText>
              </View>
              
              <View style={styles.detailsSection}>
                <ResponsiveText style={styles.detailsSectionTitle}>
                  {t('studyDetails', 'statistics')}
                </ResponsiveText>
                <ResponsiveText style={styles.detailsText}>
                  {processText(currentStat.details?.description || t('noDetailsAvailable', 'statistics'))}
                </ResponsiveText>
              </View>
              
              {/* Source Button */}
              {currentStat.link && (
                <TouchableOpacity
                  style={styles.sourceButton}
                  onPress={() => handleSourcePress(currentStat.link)}
                  accessibilityLabel={t('visitSource', 'statistics')}
                  accessibilityRole="link"
                  accessibilityHint={t('opensSourceWebsite', 'statistics')}
                >
                  <ResponsiveText style={styles.sourceButtonText}>
                    {t('visitSource', 'statistics')}
                  </ResponsiveText>
                  <Ionicons name="open-outline" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              )}
            </ScrollView>
          </Animated.View>
          
          {/* Navigation Controls */}
          {statsList.length > 1 && (
            <View 
              style={styles.navigationControls}
              accessibilityLabel={t('navigationControls', 'statistics')}
              accessibilityRole="toolbar"
            >
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigateStats('prev')}
                accessibilityLabel={t('previousStatistic', 'statistics')}
                accessibilityRole="button"
              >
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigateStats('next')}
                accessibilityLabel={t('nextStatistic', 'statistics')}
                accessibilityRole="button"
              >
                <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityLabel={t('close', 'common')}
            accessibilityRole="button"
            accessibilityHint={t('closeDetailsView', 'statistics')}
          >
            <ResponsiveText style={styles.closeButtonText}>
              {t('close', 'common')}
            </ResponsiveText>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.4,
    borderRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
    padding: 4,
    position: 'relative',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    zIndex: 1,
  },
  activeTab: {
    backgroundColor: 'transparent',
  },
  tabIndicator: {
    position: 'absolute',
    width: '25%', // 1/4 of the width since there are 4 tabs
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    zIndex: 0,
  },
  statCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCountContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statCountText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statContentScroll: {
    flex: 1,
  },
  statContentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  statFigureContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  statFigure: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statDescription: {
    fontSize: 16,
    color: '#DDDDDD',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  sourceButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sourceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: '600',
  }
});

export default StatisticsDetailsModal;
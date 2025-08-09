// src/screens/ProfileScreen/ResearchStats.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  Animated,
  Linking,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../../context/AppContext';

// Import country-specific research data
import { getAustralianRelevantStats } from '../Onboarding/data/australianGoalStats';
import { getUKRelevantStats } from '../Onboarding/data/ukGoalStats';
import { getUSARelevantStats } from '../Onboarding/data/usaGoalStats';
import { getCanadaRelevantStats } from '../Onboarding/data/canadaGoalStats';
import { getIndiaRelevantStats } from '../Onboarding/data/indiaGoalStats';
import { getIrelandRelevantStats } from '../Onboarding/data/irelandGoalStats';
import { getMalaysiaRelevantStats } from '../Onboarding/data/malaysiaGoalStats';
import { getNewZealandRelevantStats } from '../Onboarding/data/newzealandGoalStats';
import { getNigeriaRelevantStats } from '../Onboarding/data/nigeriaGoalStats';
import { getPhilippinesRelevantStats } from '../Onboarding/data/philippinesGoalStats';
import { getSingaporeRelevantStats } from '../Onboarding/data/singaporeGoalStats';
import { getSouthAfricaRelevantStats } from '../Onboarding/data/southafricaGoalStats';
import { getOtherRelevantStats } from '../Onboarding/data/otherGoalStats';


// Fallback general research (subset of original for mixed content)
const GENERAL_RESEARCH_STATS = [
  {
    id: 'habit-formation',
    title: "Forming a habit takes an average of 66 days of consistent practice",
    figure: "66 days",
    description: "A systematic review and meta-analysis of 20 studies involving 2,601 participants found that health behavior habit formation takes a median of 59-66 days, with means ranging from 106-154 days.",
    source: "Healthcare journal, University of South Australia",
    link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11641623/",
    domain: "Personal Growth",
    details: {
      title: "The Science of Habit Formation",
      publication: "Healthcare journal, University of South Australia",
      authors: "Multiple researchers, systematic review",
      date: "2024",
      description: "A systematic review and meta-analysis of 20 studies involving 2,601 participants found that health behavior habit formation takes a median of 59-66 days, with means ranging from 106-154 days. Individual variation was substantial (4-335 days), debunking the popular 21-day myth.",
      link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11641623/"
    }
  },
  {
    id: 'career-learning',
    title: "Learners who set career goals engage with learning content four times more than those without goals",
    figure: "4x",
    description: "LinkedIn's survey of 937 L&D professionals found that career-driven learning creates significantly higher engagement. Organizations with mature career development programs show 42% higher likelihood of being AI frontrunners.",
    source: "LinkedIn Learning 2025 Workplace Learning Report",
    link: "https://learning.linkedin.com/resources/workplace-learning-report",
    domain: "Career & Work",
    details: {
      title: "Career Development Drives Learning Engagement",
      publication: "LinkedIn Learning 2025 Workplace Learning Report",
      authors: "LinkedIn Learning",
      date: "2025",
      description: "LinkedIn's survey of 937 L&D professionals found that career-driven learning creates significantly higher engagement. Organizations with mature career development programs (40% of companies) show 42% higher likelihood of being AI frontrunners and better business outcomes across profitability and talent retention.",
      link: "https://learning.linkedin.com/resources/workplace-learning-report"
    }
  },
  {
    id: 'exercise-longevity',
    title: "Higher exercise doses significantly reduce all-cause mortality by 26-31% compared to minimum guidelines",
    figure: "26-31%",
    description: "A major study of 116,221 adults tracked over 30 years found that people performing 2-4 times above recommended moderate physical activity had 26-31% lower all-cause mortality.",
    source: "American Medical Association, University researchers",
    link: "https://www.ama-assn.org/delivering-care/public-health/massive-study-uncovers-how-much-exercise-needed-live-longer",
    domain: "Health & Wellness",
    details: {
      title: "Exercise Dose for Longevity",
      publication: "Circulation journal, AMA study analysis",
      authors: "American Medical Association, University researchers",
      date: "2024",
      description: "A major study of 116,221 adults tracked over 30 years found that people performing 2-4 times above recommended moderate physical activity (300-599 minutes/week) had 26-31% lower all-cause mortality, 28-38% lower cardiovascular disease mortality, and 25-27% lower non-cardiovascular disease mortality.",
      link: "https://www.ama-assn.org/delivering-care/public-health/massive-study-uncovers-how-much-exercise-needed-live-longer"
    }
  },
  {
    id: 'relationship-ratio',
    title: "Successful couples maintain at least 5 positive interactions for every 1 negative interaction",
    figure: "5:1",
    description: "Gottman's research found that successful couples maintain at least 5 positive interactions for every 1 negative interaction. In seriously compromised marriages, the 'turn-towards' rate was only 33%, while in the healthiest marriages it was 87% or higher.",
    source: "Dr. John Gottman research",
    link: "https://brainfodder.org/gottman-ratio/",
    domain: "Relationships",
    details: {
      title: "Magic Ratio for Successful Relationships",
      publication: "Multiple Gottman Institute studies",
      authors: "Dr. John Gottman research",
      date: "1990s-present",
      description: "Gottman's research found that successful couples maintain at least 5 positive interactions for every 1 negative interaction. In seriously compromised marriages, the 'turn-towards' rate was only 33%, while in the healthiest marriages it was 87% or higher.",
      link: "https://brainfodder.org/gottman-ratio/"
    }
  }
];

const SETTINGS_STORAGE_KEY = '@research_insights_settings';
const DEFAULT_SETTINGS = {
  selectedCountries: ['australia'],
  selectedDomains: ['Career & Work', 'Health & Wellness', 'Relationships', 'Personal Growth', 'Financial Security', 'Recreation & Leisure', 'Purpose & Meaning', 'Community & Environment'],
  researchScope: 'domain_wide',
  includeGeneralStats: true
};

const ResearchStats = ({ theme }) => {
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const [availableStats, setAvailableStats] = useState([]);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get AppContext to access onboarding country selection
  const appContext = useAppContext();
  const onboardingCountry = appContext?.userCountry;
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;
  
  const isDarkMode = theme.background === '#000000';

  // Load settings and build statistics on component mount and when onboarding country changes
  useEffect(() => {
    loadSettingsAndBuildStats();
  }, [onboardingCountry]);

  const loadSettingsAndBuildStats = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      let currentSettings = DEFAULT_SETTINGS;
      
      if (savedSettings) {
        currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
      }
      
      // Use onboarding country if available and no custom country was set, OR if no country is detected
      if (currentSettings.selectedCountries.includes('australia') && currentSettings.selectedCountries.length === 1) {
        // Map unknown countries to 'other'
        const validCountries = ['australia', 'uk', 'usa', 'canada', 'india', 'ireland', 'malaysia', 'newzealand', 'nigeria', 'philippines', 'singapore', 'southafrica', 'other'];
        let mappedCountry = 'other'; // Default to 'other'
        
        if (onboardingCountry && validCountries.includes(onboardingCountry)) {
          mappedCountry = onboardingCountry;
        }
        
        currentSettings = {
          ...currentSettings,
          selectedCountries: [mappedCountry]
        };
      }
      
      setSettings(currentSettings);
      buildAvailableStats(currentSettings);
    } catch (error) {
      console.error('Error loading research insights settings:', error);
      buildAvailableStats(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  const buildAvailableStats = (currentSettings) => {
    console.log('Building research stats for settings:', currentSettings);
    let allStats = [];

    // Get country-specific statistics
    if (currentSettings.selectedCountries.includes('all') || currentSettings.selectedCountries.length === 0) {
      // Include all countries
      ['australia', 'uk', 'usa', 'canada', 'india', 'ireland', 'malaysia', 'newzealand', 'nigeria', 'philippines', 'singapore', 'southafrica', 'other'].forEach(country => {
        const countryStats = getCountryStats(country, currentSettings);
        console.log(`Stats for ${country}:`, countryStats.length);
        allStats = [...allStats, ...countryStats];
      });
    } else {
      // Include only selected countries
      currentSettings.selectedCountries.forEach(country => {
        if (country !== 'all') {
          const countryStats = getCountryStats(country, currentSettings);
          console.log(`Stats for selected country ${country}:`, countryStats.length);
          allStats = [...allStats, ...countryStats];
        }
      });
    }

    // Add general statistics if enabled
    if (currentSettings.includeGeneralStats) {
      const filteredGeneralStats = GENERAL_RESEARCH_STATS.filter(stat =>
        currentSettings.selectedDomains.includes(stat.domain)
      );
      console.log('General stats added:', filteredGeneralStats.length);
      allStats = [...allStats, ...filteredGeneralStats];
    }

    // Remove duplicates based on title
    const uniqueStats = allStats.filter((stat, index, self) =>
      index === self.findIndex(s => s.title === stat.title)
    );

    // Shuffle the stats for variety
    const shuffledStats = shuffleArray(uniqueStats);
    
    console.log('Final available stats:', shuffledStats.length);
    setAvailableStats(shuffledStats);
    setCurrentStatIndex(0);
  };

  const getCountryStats = (country, currentSettings) => {
    let countryStats = [];

    // For each selected domain, get relevant stats
    currentSettings.selectedDomains.forEach(domain => {
      let domainStats = [];
      
      switch (country) {
        case 'australia':
          domainStats = getAustralianRelevantStats(domain, null)?.all || [];
          break;
        case 'uk':
          domainStats = getUKRelevantStats(domain, null)?.all || [];
          break;
        case 'usa':
          domainStats = getUSARelevantStats(domain, null)?.all || [];
          break;
        case 'canada':
          domainStats = getCanadaRelevantStats(domain, null)?.all || [];
          break;
        case 'india':
          domainStats = getIndiaRelevantStats(domain, null)?.all || [];
          break;
        case 'ireland':
          domainStats = getIrelandRelevantStats(domain, null)?.all || [];
          break;
        case 'malaysia':
          domainStats = getMalaysiaRelevantStats(domain, null)?.all || [];
          break;
        case 'newzealand':
          domainStats = getNewZealandRelevantStats(domain, null)?.all || [];
          break;
        case 'nigeria':
          domainStats = getNigeriaRelevantStats(domain, null)?.all || [];
          break;
        case 'philippines':
          domainStats = getPhilippinesRelevantStats(domain, null)?.all || [];
          break;
        case 'singapore':
          domainStats = getSingaporeRelevantStats(domain, null)?.all || [];
          break;
        case 'southafrica':
          domainStats = getSouthAfricaRelevantStats(domain, null)?.all || [];
          break;
        case 'other':
          domainStats = getOtherRelevantStats(domain, null)?.all || [];
          break;
        default:
          // Fallback to 'other' stats for any unknown country
          domainStats = getOtherRelevantStats(domain, null)?.all || [];
          break;
      }

      countryStats = [...countryStats, ...domainStats];
    });

    return countryStats;
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleSettingsChange = async (newSettings) => {
    try {
      // Save settings to AsyncStorage
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      buildAvailableStats(newSettings);
    } catch (error) {
      console.error('Error saving research insights settings:', error);
    }
  };

  // Change stat with animation
  const changeStatWithAnimation = () => {
    if (availableStats.length === 0) return;

    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      // Change stat
      setCurrentStatIndex((prevIndex) => 
        (prevIndex + 1) % availableStats.length
      );
      
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    });
  };

  // Handle showing details modal
  const handleShowDetails = () => {
    // Reset animations
    modalFadeAnim.setValue(0);
    modalScaleAnim.setValue(0.9);
    
    // Show modal
    setDetailsModalVisible(true);
    
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
      setDetailsModalVisible(false);
    });
  };

  // Open source URL
  const handleSourcePress = async (url) => {
    if (!url) return;
    
    try {
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading research insights...
        </Text>
      </View>
    );
  }

  if (availableStats.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyCard, {
          backgroundColor: theme.card,
          borderColor: theme.border
        }]}>
          <Ionicons name="book-outline" size={48} color={theme.primary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Research Insights Loading
          </Text>
          <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
            Loading research data for your selected preferences
          </Text>
        </View>
      </View>
    );
  }

  const currentStat = availableStats[currentStatIndex];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Research Insights
        </Text>
      </View>

      {/* Research Card */}
      <View style={[styles.researchCard, {
        backgroundColor: theme.card,
        borderColor: theme.primary
      }]}>
        <LinearGradient
          colors={[
            isDarkMode ? 'rgba(30, 58, 138, 0.6)' : 'rgba(59, 130, 246, 0.4)', 
            isDarkMode ? 'rgba(30, 64, 175, 0.8)' : 'rgba(96, 165, 250, 0.6)'
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        />

        {/* Navigation Controls */}
        {availableStats.length > 1 && (
          <View style={styles.navigationControls}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => {
                setCurrentStatIndex((prev) => 
                  prev === 0 ? availableStats.length - 1 : prev - 1
                );
              }}
            >
              <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.statsCounter}>
              <Text style={styles.statsCounterText}>
                {currentStatIndex + 1} of {availableStats.length}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.navButton}
              onPress={changeStatWithAnimation}
            >
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        <Animated.View style={[styles.statContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.statContent}
            onPress={handleShowDetails}
            activeOpacity={0.8}
          >
            <Text style={styles.statTitle}>{currentStat.title}</Text>
            
            <View style={styles.figureContainer}>
              <Text style={styles.figureText}>{currentStat.figure}</Text>
            </View>
            
            <Text style={styles.statDescription}>
              {currentStat.description}
            </Text>
            
            <View style={styles.statFooter}>
              <Text style={styles.sourceText}>
                Source: {currentStat.source}
              </Text>
              
              <View style={styles.moreInfoButton}>
                <Text style={styles.moreInfoButtonText}>More Info</Text>
                <Ionicons name="information-circle-outline" size={14} color="#3b82f6" />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Details Modal */}
      <Modal
        visible={detailsModalVisible}
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
              colors={[
                isDarkMode ? 'rgba(30, 58, 138, 0.6)' : 'rgba(59, 130, 246, 0.4)', 
                isDarkMode ? 'rgba(30, 64, 175, 0.8)' : 'rgba(96, 165, 250, 0.6)'
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBackground}
            />
            
            <Text style={[styles.detailsTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              {currentStat?.details?.title || currentStat?.title || 'Study Details'}
            </Text>
            
            <ScrollView style={styles.detailsScroll}>
              <View style={styles.detailsSection}>
                <Text style={[styles.detailsSectionTitle, { color: theme.primary }]}>
                  Publication
                </Text>
                <Text style={[styles.detailsText, { color: isDarkMode ? '#DDDDDD' : '#333333' }]}>
                  {currentStat?.details?.publication || 'Not specified'}
                </Text>
              </View>
              
              <View style={styles.detailsSection}>
                <Text style={[styles.detailsSectionTitle, { color: theme.primary }]}>
                  Authors
                </Text>
                <Text style={[styles.detailsText, { color: isDarkMode ? '#DDDDDD' : '#333333' }]}>
                  {currentStat?.details?.authors || 'Not specified'}
                </Text>
              </View>
              
              <View style={styles.detailsSection}>
                <Text style={[styles.detailsSectionTitle, { color: theme.primary }]}>
                  Date
                </Text>
                <Text style={[styles.detailsText, { color: isDarkMode ? '#DDDDDD' : '#333333' }]}>
                  {currentStat?.details?.date || 'Not specified'}
                </Text>
              </View>
              
              <View style={styles.detailsSection}>
                <Text style={[styles.detailsSectionTitle, { color: theme.primary }]}>
                  Study Details
                </Text>
                <Text style={[styles.detailsText, { color: isDarkMode ? '#DDDDDD' : '#333333' }]}>
                  {currentStat?.details?.description || 'No additional details available.'}
                </Text>
              </View>
              
              {currentStat?.link && (
                <TouchableOpacity
                  style={[styles.sourceButton, { backgroundColor: theme.primary }]}
                  onPress={() => handleSourcePress(currentStat.link)}
                >
                  <Text style={styles.sourceButtonText}>Visit Source</Text>
                  <Ionicons name="open-outline" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.closeButton, { 
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)' 
              }]}
              onPress={handleCloseDetails}
            >
              <Text style={[styles.closeButtonText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                Close
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  header: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  researchCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    backgroundColor: '#121214',
    minHeight: 200,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.4,
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCounter: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  statsCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statContainer: {
    padding: 16,
  },
  statContent: {
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  figureContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  figureText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statDescription: {
    fontSize: 14,
    color: '#DDDDDD',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  statFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
    width: '100%',
  },
  sourceText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    flex: 1,
  },
  moreInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moreInfoButtonText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
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
    width: '90%',
    maxWidth: 400,
    maxHeight: '75%',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    marginBottom: 6,
  },
  detailsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  sourceButton: {
    flexDirection: 'row',
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
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  }
});

export default ResearchStats;
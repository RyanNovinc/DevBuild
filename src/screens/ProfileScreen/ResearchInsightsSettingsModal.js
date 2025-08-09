// src/screens/ProfileScreen/ResearchInsightsSettingsModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COUNTRIES = [
  { id: 'australia', name: 'Australia', flag: '🇦🇺' },
  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
  { id: 'usa', name: 'United States', flag: '🇺🇸' },
  { id: 'canada', name: 'Canada', flag: '🇨🇦' },
  { id: 'all', name: 'All Countries', flag: '🌍' }
];

const DOMAINS = [
  { id: 'Career & Work', name: 'Career & Work', icon: 'briefcase-outline' },
  { id: 'Health & Wellness', name: 'Health & Wellness', icon: 'fitness-outline' },
  { id: 'Relationships', name: 'Relationships', icon: 'heart-outline' },
  { id: 'Personal Growth', name: 'Personal Growth', icon: 'trending-up-outline' },
  { id: 'Financial Security', name: 'Financial Security', icon: 'wallet-outline' },
  { id: 'Recreation & Leisure', name: 'Recreation & Leisure', icon: 'game-controller-outline' },
  { id: 'Purpose & Meaning', name: 'Purpose & Meaning', icon: 'compass-outline' },
  { id: 'Community & Environment', name: 'Community & Environment', icon: 'home-outline' }
];

const RESEARCH_SCOPE_OPTIONS = [
  { id: 'goal_specific', name: 'Goal-Specific Research', description: 'Research based on your selected goals' },
  { id: 'domain_wide', name: 'Domain-Wide Research', description: 'Research from selected domains' },
  { id: 'all_research', name: 'All Available Research', description: 'All research from selected countries' }
];

const SETTINGS_STORAGE_KEY = '@research_insights_settings';

const ResearchInsightsSettingsModal = ({ visible, onClose, onSettingsChange, theme }) => {
  const [selectedCountries, setSelectedCountries] = useState(['australia']);
  const [selectedDomains, setSelectedDomains] = useState(DOMAINS.map(d => d.id));
  const [researchScope, setResearchScope] = useState('domain_wide');
  const [includeGeneralStats, setIncludeGeneralStats] = useState(true);
  
  const isDarkMode = theme.background === '#000000';

  // Load settings when modal opens
  useEffect(() => {
    if (visible) {
      console.log('Modal opened, loading settings...');
      console.log('Selected countries:', selectedCountries);
      console.log('Selected domains:', selectedDomains);
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setSelectedCountries(settings.selectedCountries || ['australia']);
        setSelectedDomains(settings.selectedDomains || DOMAINS.map(d => d.id));
        setResearchScope(settings.researchScope || 'domain_wide');
        setIncludeGeneralStats(settings.includeGeneralStats !== false);
      }
    } catch (error) {
      console.error('Error loading research insights settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        selectedCountries,
        selectedDomains,
        researchScope,
        includeGeneralStats
      };
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      onSettingsChange(settings);
    } catch (error) {
      console.error('Error saving research insights settings:', error);
    }
  };

  const handleCountryToggle = (countryId) => {
    if (countryId === 'all') {
      setSelectedCountries(['all']);
    } else {
      setSelectedCountries(prev => {
        const filtered = prev.filter(id => id !== 'all');
        if (filtered.includes(countryId)) {
          return filtered.filter(id => id !== countryId);
        } else {
          return [...filtered, countryId];
        }
      });
    }
  };

  const handleDomainToggle = (domainId) => {
    setSelectedDomains(prev => {
      if (prev.includes(domainId)) {
        return prev.filter(id => id !== domainId);
      } else {
        return [...prev, domainId];
      }
    });
  };

  const handleSelectAllDomains = () => {
    if (selectedDomains.length === DOMAINS.length) {
      setSelectedDomains([]);
    } else {
      setSelectedDomains(DOMAINS.map(d => d.id));
    }
  };

  const handleSaveAndClose = () => {
    saveSettings();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalContainer}>
        <View style={[
          styles.modalContent,
          {
            backgroundColor: isDarkMode ? '#121214' : '#F5F5F7',
            borderColor: theme.primary,
          }
        ]}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              Research Insights Settings
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeIconButton}>
              <Ionicons name="close" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Country Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                Research Location
              </Text>
              <Text style={[styles.sectionDescription, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>
                Choose which countries' research to include
              </Text>
              
              <View style={styles.optionsContainer}>
                {COUNTRIES.map((country) => (
                  <TouchableOpacity
                    key={country.id}
                    style={[
                      styles.countryOption,
                      {
                        backgroundColor: selectedCountries.includes(country.id) 
                          ? `${theme.primary}20` 
                          : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                        borderColor: selectedCountries.includes(country.id) 
                          ? theme.primary 
                          : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')
                      }
                    ]}
                    onPress={() => handleCountryToggle(country.id)}
                  >
                    <Text style={styles.countryFlag}>{country.flag}</Text>
                    <Text style={[
                      styles.countryName,
                      { color: isDarkMode ? '#FFFFFF' : '#000000' }
                    ]}>
                      {country.name}
                    </Text>
                    {selectedCountries.includes(country.id) && (
                      <Ionicons name="checkmark" size={18} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Domain Selection */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                  Life Domains
                </Text>
                <TouchableOpacity onPress={handleSelectAllDomains}>
                  <Text style={[styles.selectAllButton, { color: theme.primary }]}>
                    {selectedDomains.length === DOMAINS.length ? 'Deselect All' : 'Select All'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.sectionDescription, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>
                Choose which life domains to include in research
              </Text>
              
              <View style={styles.domainsGrid}>
                {DOMAINS.map((domain) => (
                  <TouchableOpacity
                    key={domain.id}
                    style={[
                      styles.domainOption,
                      {
                        backgroundColor: selectedDomains.includes(domain.id) 
                          ? `${theme.primary}20` 
                          : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                        borderColor: selectedDomains.includes(domain.id) 
                          ? theme.primary 
                          : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')
                      }
                    ]}
                    onPress={() => handleDomainToggle(domain.id)}
                  >
                    <Ionicons 
                      name={domain.icon} 
                      size={20} 
                      color={selectedDomains.includes(domain.id) ? theme.primary : (isDarkMode ? '#BBBBBB' : '#666666')} 
                    />
                    <Text style={[
                      styles.domainName,
                      { 
                        color: selectedDomains.includes(domain.id) 
                          ? (isDarkMode ? '#FFFFFF' : '#000000')
                          : (isDarkMode ? '#BBBBBB' : '#666666')
                      }
                    ]}>
                      {domain.name}
                    </Text>
                    {selectedDomains.includes(domain.id) && (
                      <Ionicons name="checkmark" size={16} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Research Scope */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                Research Scope
              </Text>
              <Text style={[styles.sectionDescription, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>
                Choose how research is selected for you
              </Text>
              
              <View style={styles.optionsContainer}>
                {RESEARCH_SCOPE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.scopeOption,
                      {
                        backgroundColor: researchScope === option.id 
                          ? `${theme.primary}20` 
                          : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                        borderColor: researchScope === option.id 
                          ? theme.primary 
                          : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')
                      }
                    ]}
                    onPress={() => setResearchScope(option.id)}
                  >
                    <View style={styles.scopeOptionContent}>
                      <Text style={[
                        styles.scopeOptionName,
                        { color: isDarkMode ? '#FFFFFF' : '#000000' }
                      ]}>
                        {option.name}
                      </Text>
                      <Text style={[
                        styles.scopeOptionDescription,
                        { color: isDarkMode ? '#BBBBBB' : '#666666' }
                      ]}>
                        {option.description}
                      </Text>
                    </View>
                    {researchScope === option.id && (
                      <Ionicons name="radio-button-on" size={20} color={theme.primary} />
                    )}
                    {researchScope !== option.id && (
                      <Ionicons name="radio-button-off" size={20} color={isDarkMode ? '#666666' : '#BBBBBB'} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Include General Statistics */}
            <View style={styles.section}>
              <View style={[
                styles.switchOption,
                {
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }
              ]}>
                <View style={styles.switchContent}>
                  <Text style={[styles.switchTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    Include General Research
                  </Text>
                  <Text style={[styles.switchDescription, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>
                    Mix in general motivation research with country-specific data
                  </Text>
                </View>
                <Switch
                  value={includeGeneralStats}
                  onValueChange={setIncludeGeneralStats}
                  trackColor={{ false: isDarkMode ? '#333' : '#DDD', true: `${theme.primary}50` }}
                  thumbColor={includeGeneralStats ? theme.primary : (isDarkMode ? '#666' : '#FFF')}
                  ios_backgroundColor={isDarkMode ? '#333' : '#DDD'}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.cancelButton, { 
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' 
              }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={handleSaveAndClose}
            >
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.4,
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    zIndex: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeIconButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    zIndex: 5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  section: {
    marginBottom: 24,
    zIndex: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectAllButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionDescription: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  optionsContainer: {
    gap: 8,
    zIndex: 10,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  domainsGrid: {
    gap: 8,
  },
  domainOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  domainName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
  },
  scopeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  scopeOptionContent: {
    flex: 1,
  },
  scopeOptionName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  scopeOptionDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  switchOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  switchContent: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ResearchInsightsSettingsModal;
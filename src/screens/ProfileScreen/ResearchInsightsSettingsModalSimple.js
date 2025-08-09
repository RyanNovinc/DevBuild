// src/screens/ProfileScreen/ResearchInsightsSettingsModalSimple.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ResearchInsightsSettingsModalSimple = ({ visible, onClose, onSettingsChange, theme, currentSettings }) => {
  const [selectedCountry, setSelectedCountry] = useState(currentSettings?.selectedCountries?.[0] || 'australia');
  const isDarkMode = theme.background === '#000000';

  const countries = [
    { id: 'australia', name: 'Australia', flag: '🇦🇺' },
    { id: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
    { id: 'usa', name: 'United States', flag: '🇺🇸' },
    { id: 'canada', name: 'Canada', flag: '🇨🇦' }
  ];

  // Update selected country when settings change
  useEffect(() => {
    if (currentSettings?.selectedCountries?.[0]) {
      setSelectedCountry(currentSettings.selectedCountries[0]);
    }
  }, [currentSettings]);

  const handleSave = () => {
    // Create new settings with the selected country
    const newSettings = {
      selectedCountries: [selectedCountry],
      selectedDomains: currentSettings?.selectedDomains || ['Career & Work', 'Health & Wellness', 'Relationships', 'Personal Growth', 'Financial Security', 'Recreation & Leisure', 'Purpose & Meaning', 'Community & Environment'],
      researchScope: currentSettings?.researchScope || 'domain_wide',
      includeGeneralStats: currentSettings?.includeGeneralStats !== false
    };
    
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[
          styles.modalContent,
          {
            backgroundColor: isDarkMode ? '#121214' : '#FFFFFF',
            borderColor: theme.primary,
          }
        ]}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              Research Settings
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={[styles.sectionTitle, { color: theme.primary }]}>
              Choose Your Country
            </Text>
            
            {countries.map((country) => (
              <TouchableOpacity
                key={country.id}
                style={[
                  styles.countryOption,
                  {
                    backgroundColor: selectedCountry === country.id 
                      ? `${theme.primary}20` 
                      : (isDarkMode ? '#333' : '#F0F0F0'),
                    borderColor: selectedCountry === country.id ? theme.primary : 'transparent'
                  }
                ]}
                onPress={() => setSelectedCountry(country.id)}
              >
                <Text style={styles.flag}>{country.flag}</Text>
                <Text style={[styles.countryName, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                  {country.name}
                </Text>
                {selectedCountry === country.id && (
                  <Ionicons name="checkmark" size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { 
                backgroundColor: isDarkMode ? '#333' : '#E0E0E0' 
              }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                Save
              </Text>
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
    width: '90%',
    maxWidth: 500,
    height: '70%',
    borderRadius: 16,
    borderWidth: 2,
    flex: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    minHeight: 56,
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 70,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResearchInsightsSettingsModalSimple;
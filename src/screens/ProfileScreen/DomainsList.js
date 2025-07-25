// src/screens/ProfileScreen/DomainsList.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from './SectionHeader'; // Import the new component

const DomainsList = ({ theme, domains, onDomainPress, onRefresh, navigation }) => {
  // Determine icon color based on background color for proper contrast
  const getIconColor = (bgColor) => {
    // For black or very dark colors, use white
    if (bgColor === '#000000') return '#FFFFFF';
    // For white, use black
    if (bgColor === '#FFFFFF') return '#000000';
    
    // For other colors, use a contrast calculation
    // This is a simple version - more sophisticated methods exist
    // Convert hex to RGB
    const r = parseInt(bgColor.substring(1, 3), 16);
    const g = parseInt(bgColor.substring(3, 5), 16);
    const b = parseInt(bgColor.substring(5, 7), 16);
    
    // Calculate luminance (perceived brightness)
    // Using the formula: 0.299*R + 0.587*G + 0.114*B
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // If luminance is high (light color), use black; otherwise use white
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  // IMPROVED CONTRAST: Ensure domain icons have proper contrast
  const domainIconStyle = (color) => ({
    backgroundColor: color || theme.primary,
    borderWidth: 1,
    borderColor: theme.background === '#000000' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)',
  });

  return (
    <View style={styles.sectionContainer}>
      {/* Replace the header row with our new consistent SectionHeader component */}
      <SectionHeader
        title="Life Domains"
        icon="layers-outline"
        theme={theme}
      />
      
      {domains && domains.length > 0 ? (
        domains.map(domain => (
          <TouchableOpacity 
            key={domain.id || domain.name}
            style={[styles.domainItem, { 
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border 
            }]}
            onPress={() => onDomainPress(domain)}
          >
            <View 
              style={[
                styles.domainIcon, 
                domainIconStyle(domain.color)
              ]}
            >
              <Ionicons 
                name={domain.icon || 'layers-outline'} 
                size={20} 
                color={getIconColor(domain.color || theme.primary)}
              />
            </View>
            <View style={styles.domainInfo}>
              <Text style={[styles.domainTitle, { color: theme.text }]}>
                {domain.name}
              </Text>
              
              {/* MODIFIED: Show goal completion counts instead of progress percentage */}
              <Text style={[styles.domainStats, { color: theme.textSecondary }]}>
                {domain.completedGoalCount || 0} of {domain.goalCount || 0} {domain.goalCount === 1 ? 'goal' : 'goals'} completed
              </Text>
            </View>
            <Ionicons name="color-palette-outline" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        ))
      ) : (
        <View style={[styles.emptyStateCard, { 
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border 
        }]}>
          <Ionicons name="layers-outline" size={32} color={theme.textSecondary} />
          <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
            No life domains added yet
          </Text>
          <TouchableOpacity 
            style={[styles.emptyStateButton, { 
              backgroundColor: theme.primary,
              borderWidth: 1,
              borderColor: theme.background === '#000000' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
            }]}
            onPress={() => navigation.navigate('GoalsTab')}
          >
            <Text style={[styles.emptyStateButtonText, { 
              color: theme.background === '#000000' ? "#000000" : "#FFFFFF"
            }]}>
              Add Goals
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  domainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    height: 80, // Fixed height for predictable layout
  },
  domainIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  domainInfo: {
    flex: 1,
  },
  domainTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  domainStats: {
    fontSize: 12,
  },
  
  // Empty State
  emptyStateCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    marginBottom: 8,
    height: 160, // Fixed height for predictable layout
  },
  emptyStateText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  emptyStateButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyStateButtonText: {
    fontWeight: '500',
  },
});

export default DomainsList;
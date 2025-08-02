// src/screens/PricingScreen/components/FounderContextBanner.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * A banner that explains the authentic reason for the founder spots limitation
 * This component enhances trust by providing transparent context for scarcity
 */
const FounderContextBanner = ({ theme, style = {} }) => {
  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: theme.cardElevated,
        borderLeftColor: '#3F51B5',
      },
      style
    ]}>
      <View style={styles.headerRow}>
        <Ionicons name="information-circle" size={20} color="#3F51B5" />
        <Text style={[
          styles.headerText,
          { color: theme.text }
        ]}>
          Why we're limiting founder access
        </Text>
      </View>
      
      <Text style={[
        styles.descriptionText,
        { color: theme.textSecondary }
      ]}>
        We're offering special founder pricing to our first 1,000 users who join before our full launch. This helps us gather focused feedback and build the best possible experience while rewarding early adopters who believe in our vision.
      </Text>
      
      <View style={styles.bulletPoints}>
        <View style={styles.bulletRow}>
          <View style={styles.bulletPoint} />
          <Text style={[styles.bulletText, { color: theme.textSecondary }]}>
            Founders receive permanent lifetime access to premium features
          </Text>
        </View>
        
        <View style={styles.bulletRow}>
          <View style={styles.bulletPoint} />
          <Text style={[styles.bulletText, { color: theme.textSecondary }]}>
            Early feedback from founders directly shapes our development
          </Text>
        </View>
        
        <View style={styles.bulletRow}>
          <View style={styles.bulletPoint} />
          <Text style={[styles.bulletText, { color: theme.textSecondary }]}>
            After 1,000 spots are claimed, premium features will only be available via subscription
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  bulletPoints: {
    marginTop: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  bulletPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3F51B5',
    marginRight: 8,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  }
});

export default FounderContextBanner;
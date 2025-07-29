// src/screens/PricingScreen/components/PricingFootnote.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PricingFootnote = ({ theme }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.footnoteText, { color: theme.textSecondary }]}>
        *AI Light provides approximately 600 interactions per month, AI Standard provides approximately 1,500 interactions per month, and AI Max provides approximately 5,000+ interactions per month.
      </Text>
      
      <Text style={[styles.footnoteText, { color: theme.textSecondary, marginTop: 6 }]}>
        Actual interactions vary based on usage patterns. With context features enabled, interactions may use more credits.
      </Text>
      
      <Text style={[styles.footnoteText, { color: theme.textSecondary, marginTop: 6 }]}>
        All plans include unlimited credit rollover. Your unused credits never expire and are always available to use.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  footnoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
    textAlign: 'center',
  }
});

export default PricingFootnote;
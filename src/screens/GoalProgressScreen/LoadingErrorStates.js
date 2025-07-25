// src/screens/GoalProgressScreen/LoadingErrorStates.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const LoadingState = ({ theme, goalColor }) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={goalColor} />
      <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
        Loading your progress data...
      </Text>
    </View>
  );
};

export const ErrorState = ({ theme, error }) => {
  return (
    <View style={[styles.errorContainer, { backgroundColor: theme.card }]}>
      <Ionicons name="analytics-outline" size={60} color={theme.textSecondary} />
      <Text style={[styles.errorText, { color: theme.text }]}>
        {error}
      </Text>
      <Text style={[styles.errorSubText, { color: theme.textSecondary }]}>
        Complete projects to see your progress over time.
      </Text>
    </View>
  );
};

export const InfoBox = ({ theme, goalColor }) => {
  return (
    <View style={[styles.infoBox, { backgroundColor: `${goalColor}10` }]}>
      <Ionicons name="information-circle-outline" size={20} color={goalColor} />
      <Text style={[styles.infoText, { color: theme.textSecondary }]}>
        Tap on data points to see milestone details
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  errorContainer: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    marginLeft: 8,
  },
});

export default { LoadingState, ErrorState, InfoBox };
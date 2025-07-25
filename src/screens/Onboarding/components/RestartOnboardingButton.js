// src/screens/Onboarding/components/RestartOnboardingButton.js
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../../../context/AppContext';

/**
 * RestartOnboardingButton - Component to allow users to restart the onboarding process
 * @param {object} theme - Current theme settings
 */
const RestartOnboardingButton = ({ theme }) => {
  const navigation = useNavigation();
  const { updateAppSetting } = useAppContext();
  
  const handleRestartOnboarding = () => {
    Alert.alert(
      'Restart Onboarding',
      'Would you like to go through the onboarding process again? Your data will be preserved.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Restart',
          onPress: async () => {
            try {
              // Set onboarding as not completed in AsyncStorage
              await AsyncStorage.setItem('onboardingCompleted', 'false');
              
              // Update app context
              if (updateAppSetting) {
                await updateAppSetting('onboardingCompleted', false);
              }
              
              // Navigate to onboarding with restart param
              navigation.navigate('Onboarding', { restart: true });
            } catch (error) {
              console.error('Error restarting onboarding:', error);
              Alert.alert('Error', 'Failed to restart onboarding. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card }]}
      onPress={handleRestartOnboarding}
    >
      <Ionicons name="refresh-circle-outline" size={22} color={theme.primary} />
      <Text style={[styles.text, { color: theme.text }]}>Restart Onboarding</Text>
      <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  text: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  }
});

export default RestartOnboardingButton;
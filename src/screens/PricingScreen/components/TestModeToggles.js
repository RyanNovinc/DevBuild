// src/screens/PricingScreen/components/TestModeToggles.js
import React from 'react';
import { View, Text, Switch } from 'react-native';
import styles from '../styles';

const TestModeToggles = ({ 
  theme, 
  showTestModeToggles, 
  isLifetimeMember, 
  handleToggleLifetimeMember 
}) => {
  if (!showTestModeToggles) return null;
  
  return (
    <View style={[{
      backgroundColor: 'rgba(255, 0, 0, 0.03)',
      borderColor: 'rgba(255, 0, 0, 0.1)',
      borderWidth: 1,
      marginHorizontal: 16,
      marginVertical: 10,
      borderRadius: 8,
      padding: 10,
    }]}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Text style={{
          color: theme.textSecondary,
          fontSize: 12,
          fontWeight: '500',
        }}>
          Test as Lifetime Member
        </Text>
        <Switch
          value={isLifetimeMember}
          onValueChange={handleToggleLifetimeMember}
          trackColor={{ false: theme.border, true: `#3F51B580` }}
          thumbColor={isLifetimeMember ? '#3F51B5' : '#f4f3f4'}
        />
      </View>
    </View>
  );
};

export default TestModeToggles;
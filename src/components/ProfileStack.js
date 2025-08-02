// src/components/ProfileStack.js - Updated to handle AuthContext properly
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';  // Only import useAuth, not AuthProvider

// Import screens and components
import ProfileFadeWrapper from './ProfileFadeWrapper';
import EditProfileScreen from '../screens/EditProfileScreen';
import GoalDetailsScreen from '../screens/GoalDetailsScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import AdminFeedbackScreen from '../screens/AdminFeedbackScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';

const Stack = createStackNavigator();

// Create a wrapper component that will ensure we only render the profile content
// when we have valid auth context
const AuthProtectedProfileFadeWrapper = (props) => {
  // This will throw the error if not inside AuthProvider, which is what we want
  // to fail fast and provide a clear error message
  const auth = useAuth();

  // If there's no auth yet (still loading), show a simple loading placeholder
  if (!auth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <Text style={{ color: '#FFFFFF' }}>Loading profile...</Text>
      </View>
    );
  }

  // Auth is available, render the actual content
  return <ProfileFadeWrapper {...props} />;
};

/**
 * ProfileStack with enhanced fade-in effect from black
 * This stack navigator uses ProfileFadeWrapper to create a smooth
 * transition from the loading screen
 */
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000000' }, // Set black background for screens
        // Disable transitions between screens in this stack to avoid flashing
        cardStyleInterpolator: () => ({
          cardStyle: {
            opacity: 1, // No opacity animation between screens
          },
        }),
      }}
    >
      <Stack.Screen 
        name="Profile" 
        component={AuthProtectedProfileFadeWrapper}  // Use our auth-protected wrapper
        options={{ 
          unmountOnBlur: false,
        }} 
      />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="GoalDetails" component={GoalDetailsScreen} />
      <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
      <Stack.Screen name="AdminFeedbackScreen" component={AdminFeedbackScreen} />
      <Stack.Screen name="AIAssistant" component={AIAssistantScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStack;
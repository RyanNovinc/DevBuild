// src/screens/Onboarding/components/ui/ProgressIndicator.js
import React from 'react';
import { View, StyleSheet, Animated, Dimensions, AccessibilityInfo } from 'react-native';
import { scale } from '../../styles/onboardingStyles';
import { getAccessibilityProps } from '../../utils/accessibility';
import { isLowEndDevice } from '../../utils/deviceUtils';

/**
 * ProgressIndicator - Shows the user's progress through the onboarding process
 * Enhanced with accessibility and responsive design
 * 
 * @param {number} currentScreen - The current screen index (0-based)
 * @param {number} totalScreens - Total number of screens (defaults to 4)
 */
const ProgressIndicator = ({ currentScreen, totalScreens = 4 }) => {
  // Check if device is low-end
  const isLowEnd = isLowEndDevice();
  
  // Get screen width for responsive dot spacing
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 360;
  
  // Create an array of the appropriate length
  const screens = Array.from({ length: totalScreens }, (_, i) => i);
  
  // Adjust currentScreen to handle the welcome screen
  // When used in the app:
  // - Welcome screen (currentScreen=0) - progress indicator not shown
  // - Framework screen (currentScreen=1) - should show as step 1 of 4
  // - Focus Selection (currentScreen=2) - should show as step 2 of 4
  // - System Hierarchy (currentScreen=3) - should show as step 3 of 4
  // - Why It Works (currentScreen=4) - should show as step 4 of 4
  
  // Adjust currentScreen to be 0-indexed within our 4-step process
  const adjustedCurrentScreen = currentScreen - 1;
  
  // Create a human-readable progress description for screen readers
  const progressDescription = `Step ${adjustedCurrentScreen + 1} of ${totalScreens}`;
  
  return (
    <View 
      style={[
        styles.progressContainer,
        isSmallScreen && styles.progressContainerSmall
      ]}
      accessible={true}
      accessibilityLabel={progressDescription}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: totalScreens - 1,
        now: adjustedCurrentScreen >= 0 ? adjustedCurrentScreen : 0
      }}
    >
      {screens.map((screen, index) => (
        <React.Fragment key={index}>
          {/* Dot */}
          <View 
            style={[
              styles.progressDot, 
              adjustedCurrentScreen >= screen ? styles.activeDot : {},
              isSmallScreen && styles.progressDotSmall,
              adjustedCurrentScreen >= screen && isSmallScreen && styles.activeDotSmall
            ]} 
            accessible={false}
            importantForAccessibility="no"
          />
          
          {/* Line (don't render after the last dot) */}
          {index < totalScreens - 1 && (
            <View 
              style={[
                styles.progressLine,
                adjustedCurrentScreen > screen ? styles.activeLine : {},
                isSmallScreen && styles.progressLineSmall
              ]} 
              accessible={false}
              importantForAccessibility="no"
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  progressContainerSmall: {
    marginBottom: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#555555',
  },
  progressDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    backgroundColor: '#2563eb',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activeDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressLine: {
    width: 16,
    height: 2,
    backgroundColor: '#555555',
    marginHorizontal: 3,
  },
  progressLineSmall: {
    width: 12,
    marginHorizontal: 2,
  },
  activeLine: {
    backgroundColor: '#2563eb',
  },
});

export default ProgressIndicator;
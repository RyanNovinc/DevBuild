// src/screens/Onboarding/utils/deviceUtils.js
import { Dimensions, Platform } from 'react-native';
import { useState, useEffect } from 'react';

/**
 * Detect if the device is a small screen device
 * @returns {boolean} - Whether the device has a small screen
 */
export const isSmallDevice = () => {
  const dimensions = Dimensions.get('window');
  return Math.min(dimensions.width, dimensions.height) < 375;
};

/**
 * Detect if the device is a tablet
 * @returns {boolean} - Whether the device is likely a tablet
 */
export const isTablet = () => {
  const dimensions = Dimensions.get('window');
  return Math.min(dimensions.width, dimensions.height) >= 600;
};

/**
 * Detect if the device is a low-end device that might need performance optimizations
 * @returns {boolean} - Whether the device is likely a low-end device
 */
export const isLowEndDevice = () => {
  // iOS devices older than iPhone 8 might be considered low-end
  // Android devices with OS version below 8.0 (API 26) might be considered low-end
  if (Platform.OS === 'ios') {
    const majorVersionString = Platform.Version.toString().split('.')[0];
    const majorVersion = parseInt(majorVersionString, 10);
    return majorVersion < 12; // iOS 12 is where iPhone 5s/6 stopped receiving updates
  } else if (Platform.OS === 'android') {
    return Platform.Version < 26; // Android 8.0 (API 26)
  }
  return false;
};

/**
 * Hook to detect and respond to orientation changes
 * @returns {Object} with orientation ('portrait' or 'landscape') and dimensions
 */
export const useOrientation = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [orientation, setOrientation] = useState(
    dimensions.width > dimensions.height ? 'landscape' : 'portrait'
  );

  useEffect(() => {
    const onChange = ({ window }) => {
      const newOrientation = window.width > window.height ? 'landscape' : 'portrait';
      setOrientation(newOrientation);
      setDimensions(window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    
    return () => {
      if (typeof subscription?.remove === 'function') {
        subscription.remove();
      } else {
        // Fallback for older React Native versions
        Dimensions.removeEventListener('change', onChange);
      }
    };
  }, []);

  return { orientation, dimensions };
};
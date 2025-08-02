// src/components/widgets/WidgetLockOverlay.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

/**
 * Overlay component to show on premium widgets in free mode
 * @param {Object} props
 * @param {Object} props.theme - Theme colors
 * @param {boolean} props.dashboardMode - If true, shows minimal overlay for dashboard view
 * @param {Function} props.onUpgrade - Optional function to call when upgrade button is pressed
 */
const WidgetLockOverlay = ({ theme, dashboardMode = false, onUpgrade }) => {
  const navigation = useNavigation();

  const handleUpgrade = () => {
    if (typeof onUpgrade === 'function') {
      onUpgrade();
    } else {
      navigation.navigate('PricingScreen');
    }
  };

  // In dashboard mode, just show a small lock icon in the corner
  if (dashboardMode) {
    return (
      <View style={styles.miniLockContainer}>
        <View style={[styles.miniLockBadge, { backgroundColor: theme.primary }]}>
          <Ionicons name="lock-closed" size={10} color="#FFFFFF" />
        </View>
      </View>
    );
  }

  // In full mode, show an overlay with lock icon and upgrade button
  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
      <View style={styles.lockContent}>
        <View style={[styles.lockIconContainer, { backgroundColor: theme.primary }]}>
          <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
        </View>
        
        <Text style={styles.lockTitle} maxFontSizeMultiplier={1.3}>
          Lifetime Members Only
        </Text>
        
        <Text style={styles.lockMessage} maxFontSizeMultiplier={1.5}>
          This premium feature is available with a one-time purchase.
        </Text>
        
        <TouchableOpacity
          style={[styles.upgradeButton, { backgroundColor: theme.primary }]}
          onPress={handleUpgrade}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Upgrade to Pro"
          accessibilityHint="Opens the pricing screen to upgrade your subscription"
        >
          <Text style={styles.upgradeButtonText} maxFontSizeMultiplier={1.3}>
            Upgrade to Pro
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderRadius: 12,
  },
  lockContent: {
    width: '80%',
    alignItems: 'center',
    padding: 20,
  },
  lockIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  lockTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  lockMessage: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.9,
  },
  upgradeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Mini lock for dashboard view
  miniLockContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  miniLockBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default WidgetLockOverlay;
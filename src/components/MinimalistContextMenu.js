// src/components/MinimalistContextMenu.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
// import { BlurView } from 'expo-blur'; // Not used in current implementation
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
} from '../utils/responsive';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MinimalistContextMenu = ({
  visible,
  onClose,
  title,
  subtitle,
  options = [],
  position = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 }
}) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 30,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleOptionPress = (option) => {
    onClose();
    // Small delay to allow close animation
    setTimeout(() => {
      option.onPress();
    }, 100);
  };

  const getIconForAction = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('edit')) return 'create-outline';
    if (lowerText.includes('delete')) return 'trash-outline';
    if (lowerText.includes('complete')) return 'checkmark-circle-outline';
    if (lowerText.includes('cancel')) return 'close-outline';
    if (lowerText.includes('reactivate')) return 'refresh-outline';
    return 'ellipsis-horizontal-outline';
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: fadeAnim,
              },
            ]}
          />
          
          <Animated.View
            style={[
              styles.menuContainer,
              {
                backgroundColor: theme.card || theme.background,
                borderColor: theme.border,
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideAnim },
                ],
                opacity: fadeAnim,
                // Position the menu near the touch point but ensure it stays on screen
                left: Math.min(
                  Math.max(position.x - 120, spacing.m), 
                  SCREEN_WIDTH - 240 - spacing.m
                ),
                top: Math.min(
                  Math.max(position.y - 50, spacing.xl), 
                  SCREEN_HEIGHT - (options.length * 60 + 120)
                ),
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text 
                style={[
                  styles.title, 
                  { color: theme.text }
                ]}
                numberOfLines={1}
              >
                {title}
              </Text>
              {subtitle && (
                <Text 
                  style={[
                    styles.subtitle, 
                    { color: theme.textSecondary }
                  ]}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              )}
            </View>

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Options */}
            <View style={styles.optionsContainer}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.option,
                    { borderBottomColor: theme.border },
                    index === options.length - 1 && styles.lastOption,
                  ]}
                  onPress={() => handleOptionPress(option)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <Ionicons
                      name={getIconForAction(option.text)}
                      size={scaleWidth(20)}
                      color={
                        option.style === 'destructive' 
                          ? '#FF5252' 
                          : option.style === 'cancel'
                          ? theme.textSecondary
                          : theme.primary
                      }
                      style={styles.optionIcon}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: option.style === 'destructive' 
                            ? '#FF5252' 
                            : option.style === 'cancel'
                            ? theme.textSecondary
                            : theme.text,
                          fontWeight: option.style === 'destructive' ? '600' : '500',
                        },
                      ]}
                    >
                      {option.text}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: 'relative',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  menuContainer: {
    position: 'absolute',
    width: scaleWidth(240),
    borderRadius: scaleWidth(16),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.l,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xxxs,
  },
  subtitle: {
    fontSize: fontSizes.s,
    fontWeight: '500',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.m,
  },
  optionsContainer: {
    paddingVertical: spacing.xs,
  },
  option: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: spacing.m,
    width: scaleWidth(24),
    textAlign: 'center',
  },
  optionText: {
    fontSize: fontSizes.m,
    flex: 1,
  },
});

export default MinimalistContextMenu;
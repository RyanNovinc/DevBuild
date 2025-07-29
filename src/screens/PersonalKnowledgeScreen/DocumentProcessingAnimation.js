// src/screens/PersonalKnowledgeScreen/DocumentProcessingAnimation.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

/**
 * A modern, subtle document processing animation
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the animation is visible
 * @param {Object} props.theme - Theme object for styling
 * @returns {React.ReactElement} - The animation component
 */
const DocumentProcessingAnimation = ({ visible, theme }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      // Reset animations when becoming visible
      fadeAnim.setValue(0);
      slideAnim.setValue(-20);
      
      // Fade in and slide up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        })
      ]).start();
      
      // Start pulse animation
      startPulseAnimation();
    } else {
      // Fade out and slide down
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 20,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);
  
  // Create the pulsing dots animation
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.sin,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.sin,
          useNativeDriver: true
        })
      ])
    ).start();
  };
  
  // Animation interpolations for dots
  const dot1Opacity = pulseAnim.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [0.3, 1, 0.3, 0.3]
  });
  
  const dot2Opacity = pulseAnim.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [0.3, 0.3, 1, 0.3]
  });
  
  const dot3Opacity = pulseAnim.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [0.3, 0.3, 0.3, 1]
  });
  
  if (!visible) return null;
  
  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: theme.card
        }
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
          <View style={styles.documentIcon}>
            <View style={[styles.docIconTop, { backgroundColor: theme.primary }]} />
            <View style={[styles.docIconBody, { backgroundColor: theme.primary }]} />
          </View>
        </View>
        
        <View style={styles.textContainer}>
          <Text 
            style={[styles.processingText, { color: theme.text }]}
            numberOfLines={1}
          >
            Processing Document
          </Text>
          
          <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, { opacity: dot1Opacity, backgroundColor: theme.primary }]} />
            <Animated.View style={[styles.dot, { opacity: dot2Opacity, backgroundColor: theme.primary }]} />
            <Animated.View style={[styles.dot, { opacity: dot3Opacity, backgroundColor: theme.primary }]} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentIcon: {
    width: 20,
    height: 24,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  docIconTop: {
    width: 20,
    height: 6,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  docIconBody: {
    width: 20,
    height: 18,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  textContainer: {
    flex: 1,
  },
  processingText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 4,
  }
});

export default DocumentProcessingAnimation;
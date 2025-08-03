// src/components/OnboardingTransitionScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ResponsiveText from '../screens/Onboarding/components/ResponsiveText';
import { ONBOARDING_STATES } from '../hooks/useOnboardingCompletion';

const { width, height } = Dimensions.get('window');

const OnboardingTransitionScreen = ({ 
  state = ONBOARDING_STATES.PROCESSING, 
  progress = 0, 
  error = null 
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Start animations on mount
  useEffect(() => {
    // Initial entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      })
    ]).start();

    // Continuous icon rotation
    const rotationLoop = Animated.loop(
      Animated.timing(iconRotation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Pulse animation for loading state
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        })
      ])
    );

    if (state !== ONBOARDING_STATES.ERROR) {
      rotationLoop.start();
      pulseLoop.start();
    }

    return () => {
      rotationLoop.stop();
      pulseLoop.stop();
    };
  }, [state]);

  // Update progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress / 100,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Get state-specific content
  const getStateContent = () => {
    switch (state) {
      case ONBOARDING_STATES.CREATING_DATA:
        return {
          icon: 'create-outline',
          title: 'Creating Your Goals',
          subtitle: 'Setting up your personalized goal structure...'
        };
      case ONBOARDING_STATES.UPDATING_SETTINGS:
        return {
          icon: 'settings-outline',
          title: 'Configuring Settings',
          subtitle: 'Updating your preferences and settings...'
        };
      case ONBOARDING_STATES.REFRESHING_CONTEXT:
        return {
          icon: 'refresh-outline',
          title: 'Preparing Data',
          subtitle: 'Getting everything ready for you...'
        };
      case ONBOARDING_STATES.PREPARING_APP:
        return {
          icon: 'rocket-outline',
          title: 'Almost Done!',
          subtitle: 'Finalizing your LifeCompass experience...'
        };
      case ONBOARDING_STATES.ERROR:
        return {
          icon: 'alert-circle-outline',
          title: 'Something Went Wrong',
          subtitle: 'Please try again or contact support if this continues.'
        };
      default:
        return {
          icon: 'hourglass-outline',
          title: 'Getting Started',
          subtitle: 'Setting up your LifeCompass experience...'
        };
    }
  };

  const content = getStateContent();
  const isError = state === ONBOARDING_STATES.ERROR;

  const iconRotationStyle = {
    transform: [{
      rotate: iconRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
      })
    }]
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0c1425" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0c1425', '#1e3a8a', '#0c1425']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Icon Container */}
        <Animated.View 
          style={[
            styles.iconContainer,
            isError ? styles.errorIconContainer : styles.loadingIconContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <Animated.View style={!isError ? iconRotationStyle : {}}>
            <Ionicons 
              name={content.icon} 
              size={60} 
              color={isError ? '#ef4444' : '#3b82f6'} 
            />
          </Animated.View>
        </Animated.View>

        {/* Title */}
        <ResponsiveText style={[styles.title, isError && styles.errorTitle]}>
          {content.title}
        </ResponsiveText>

        {/* Subtitle */}
        <ResponsiveText style={styles.subtitle}>
          {content.subtitle}
        </ResponsiveText>

        {/* Progress Bar (only show if not error and progress > 0) */}
        {!isError && progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View 
                style={[
                  styles.progressBarFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
            </View>
            <ResponsiveText style={styles.progressText}>
              {Math.round(progress)}%
            </ResponsiveText>
          </View>
        )}

        {/* Error message */}
        {isError && error && (
          <View style={styles.errorContainer}>
            <ResponsiveText style={styles.errorMessage}>
              {error.message || 'An unexpected error occurred'}
            </ResponsiveText>
          </View>
        )}
      </Animated.View>

      {/* Loading dots animation */}
      {!isError && (
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <LoadingDot key={index} index={index} />
          ))}
        </View>
      )}
    </View>
  );
};

// Individual loading dot component
const LoadingDot = ({ index }) => {
  const dotAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(index * 200),
        Animated.timing(dotAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        })
      ])
    );

    animateLoop.start();

    return () => animateLoop.stop();
  }, [index]);

  return (
    <Animated.View 
      style={[
        styles.dot,
        { opacity: dotAnim }
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c1425',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    maxWidth: width * 0.8,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  loadingIconContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  errorIconContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorTitle: {
    color: '#ef4444',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBarBackground: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorMessage: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    lineHeight: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginHorizontal: 4,
  },
});

export default OnboardingTransitionScreen;
// src/components/AddSelectionModal.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { scaleWidth, scaleHeight, fontSizes, spacing, accessibility } from '../utils/responsive';

const { width, height } = Dimensions.get('window');

const AddSelectionModal = ({ visible, onClose, onSelectOption }) => {
  const { theme } = useTheme();
  
  // State to track modal status
  const [isClosing, setIsClosing] = useState(false);
  
  // Animation values
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const optionAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;

  // Animation sequence when modal opens
  useEffect(() => {
    if (visible && !isClosing) {
      // Stop any existing animations and reset to initial state
      backgroundOpacity.stopAnimation();
      scaleAnim.stopAnimation();
      optionAnimations.forEach(anim => anim.stopAnimation());
      
      // Reset animations to initial values
      backgroundOpacity.setValue(0);
      scaleAnim.setValue(0);
      optionAnimations.forEach(anim => anim.setValue(0));
      
      // Reset closing state
      setIsClosing(false);

      // Small delay to ensure reset is complete, then start animation sequence
      setTimeout(() => {
        Animated.sequence([
          // Fade in background
          Animated.timing(backgroundOpacity, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease)
          }),
          // Scale in center circle
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
            easing: Easing.back(1.2)
          }),
          // Stagger in the option buttons
          Animated.stagger(60, optionAnimations.map(anim =>
            Animated.spring(anim, {
              toValue: 1,
              useNativeDriver: true,
              tension: 120,
              friction: 7
            })
          ))
        ]).start();
      }, 10);
    } else if (!visible) {
      // When modal closes, stop all animations and reset closing state
      backgroundOpacity.stopAnimation();
      scaleAnim.stopAnimation();
      optionAnimations.forEach(anim => anim.stopAnimation());
      setIsClosing(false);
    }
  }, [visible, isClosing]);

  // Close animation
  const handleClose = () => {
    if (isClosing) return; // Prevent multiple close calls
    
    setIsClosing(true);
    
    Animated.sequence([
      // Scale out options
      Animated.parallel(optionAnimations.map(anim =>
        Animated.timing(anim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true
        })
      )),
      // Scale out center
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true
      }),
      // Fade out background more gradually
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      })
    ]).start(() => {
      // Ensure all animations are fully reset after close
      backgroundOpacity.setValue(0);
      scaleAnim.setValue(0);
      optionAnimations.forEach(anim => anim.setValue(0));
      setIsClosing(false);
      onClose();
    });
  };

  // Handle option selection
  const handleSelectOption = (option) => {
    // Quick scale animation for feedback
    const selectedIndex = ['goal', 'task', 'milestone'].indexOf(option);
    if (selectedIndex >= 0) {
      Animated.sequence([
        Animated.timing(optionAnimations[selectedIndex], {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(optionAnimations[selectedIndex], {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    }

    // Immediately close modal with full animation, then call selection handler
    setTimeout(() => {
      handleClose(); // Use the proper close animation
      // Call selection handler after a short delay to ensure modal is closed
      setTimeout(() => {
        onSelectOption(option);
      }, 300); // Wait for close animation to complete
    }, 150);
  };

  const options = [
    {
      key: 'goal',
      title: 'Goal',
      icon: 'flag-outline',
      color: theme.primary,
      description: 'Create a new life goal'
    },
    {
      key: 'task',
      title: 'Task',
      icon: 'checkmark-done-outline',
      color: theme.primary,
      description: 'Create a new task'
    },
    {
      key: 'milestone',
      title: 'Milestone',
      icon: 'diamond-outline',
      color: theme.primary,
      description: 'Add a project milestone'
    }
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: backgroundOpacity
          }
        ]}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>

        {/* Center circle with + icon */}
        <Animated.View
          style={[
            styles.centerCircle,
            {
              backgroundColor: '#000000',
              borderColor: '#333333',
              borderWidth: 1,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Ionicons name="add" size={scaleWidth(24)} color="#FFFFFF" />
        </Animated.View>

        {/* Option buttons arranged in a circle */}
        {options.map((option, index) => {
          // Calculate position in a circle around the center
          const angle = (index * 120) - 90; // Start from top, 120 degrees apart
          const radius = scaleWidth(100);
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <Animated.View
              key={option.key}
              style={[
                styles.optionButton,
                {
                  backgroundColor: '#000000',
                  borderColor: '#333333',
                  borderWidth: 1,
                  transform: [
                    { translateX: x },
                    { translateY: y },
                    { scale: optionAnimations[index] }
                  ]
                }
              ]}
            >
              <TouchableOpacity
                style={styles.optionTouchable}
                onPress={() => handleSelectOption(option.key)}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Create ${option.title}`}
                accessibilityHint={option.description}
              >
                <Ionicons 
                  name={option.icon} 
                  size={scaleWidth(20)} 
                  color="#FFFFFF" 
                />
                <Text style={[styles.optionText, { color: "#FFFFFF" }]}>{option.title}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  centerCircle: {
    position: 'absolute',
    width: scaleWidth(56),
    height: scaleWidth(56),
    borderRadius: scaleWidth(28),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionButton: {
    position: 'absolute',
    width: scaleWidth(72),
    height: scaleWidth(72),
    borderRadius: scaleWidth(36),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  optionTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scaleWidth(36),
  },
  optionText: {
    fontSize: fontSizes.xs,
    fontWeight: '500',
    marginTop: spacing.xxs,
    textAlign: 'center',
  },
});

export default AddSelectionModal;
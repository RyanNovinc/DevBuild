// src/screens/AchievementsScreen/components/AchievementToast.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const AchievementToast = ({ 
  visible, 
  achievement, 
  onHide,
  duration = 3000,
  theme 
}) => {
  const navigation = useNavigation();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    let hideTimeout;
    
    if (visible && achievement) {
      // Show the toast
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
      
      // Hide after duration
      hideTimeout = setTimeout(() => {
        handleHide();
      }, duration);
    }
    
    return () => {
      clearTimeout(hideTimeout);
    };
  }, [visible, achievement]);
  
  const handleHide = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      if (onHide) onHide();
    });
  };
  
  const handlePress = () => {
    handleHide();
    // Navigate to achievements screen
    navigation.navigate('AchievementsScreen');
  };
  
  if (!visible || !achievement) return null;
  
  // Default theme fallback
  const defaultTheme = {
    primary: '#3F51B5',
    background: '#FFFFFF',
    text: '#000000',
    textSecondary: '#757575'
  };
  
  const currentTheme = theme || defaultTheme;
  
  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: currentTheme.background,
          borderColor: currentTheme.primary
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.content}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={[
          styles.iconContainer,
          { backgroundColor: `${currentTheme.primary}20` }
        ]}>
          <Ionicons 
            name={achievement.icon || 'trophy'} 
            size={20} 
            color={currentTheme.primary} 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: currentTheme.text }]}>
            Achievement Unlocked!
          </Text>
          <Text style={[styles.subtitle, { color: currentTheme.textSecondary }]}>
            {achievement.title}
          </Text>
        </View>
        
        <View style={styles.pointsContainer}>
          <Text style={[styles.points, { color: currentTheme.primary }]}>
            +{achievement.points || 1}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
  },
  pointsContainer: {
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.1)',
  },
  points: {
    fontSize: 15,
    fontWeight: 'bold',
  }
});

export default AchievementToast;
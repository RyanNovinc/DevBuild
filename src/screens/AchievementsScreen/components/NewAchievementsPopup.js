// src/screens/AchievementsScreen/components/NewAchievementsPopup.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const NewAchievementsPopup = ({
  visible,
  newAchievements = [],
  achievements, // ACHIEVEMENTS object
  categories, // CATEGORIES array
  onClose,
  theme
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Track current achievement for celebration animation
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Animate popup entrance
  useEffect(() => {
    if (visible) {
      // Play haptic feedback when popup opens
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true
        })
      ]).start();
    } else {
      // Reset animation values
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
      slideAnim.setValue(50);
      setCurrentIndex(0);
    }
  }, [visible]);
  
  // Get category color for an achievement
  const getCategoryColor = (achievement) => {
    if (!achievement) return '#3b82f6';
    
    const category = categories.find(c => c.id === achievement.category);
    return category?.color || '#3b82f6';
  };
  
  // Handle next achievement
  const handleNextAchievement = () => {
    if (currentIndex < newAchievements.length - 1) {
      // Play haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      // Animate out current achievement
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }).start(() => {
        // Move to next achievement
        setCurrentIndex(currentIndex + 1);
        
        // Animate in next achievement
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true
        }).start();
      });
    } else {
      // All achievements viewed
      onClose();
    }
  };
  
  // Get current achievement to display
  const currentAchievementId = newAchievements[currentIndex]?.id;
  const currentAchievement = currentAchievementId ? achievements[currentAchievementId] : null;
    
  if (!currentAchievement) return null;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop */}
        <TouchableOpacity 
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        {/* Main Content */}
        <Animated.View 
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.background,
              borderColor: getCategoryColor(currentAchievement),
              opacity: opacityAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          {/* Header */}
          <LinearGradient
            colors={['#3b82f6', '#1d4ed8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Text style={styles.headerText}>Achievement Unlocked!</Text>
            
            {/* Progress Indicator */}
            {newAchievements.length > 1 && (
              <View style={styles.progressIndicator}>
                {newAchievements.map((_, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.progressDot,
                      currentIndex === index ? styles.progressDotActive : {}
                    ]} 
                  />
                ))}
              </View>
            )}
          </LinearGradient>
          
          {/* Achievement Content */}
          <View style={styles.achievementContainer}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: `${getCategoryColor(currentAchievement)}20` }
            ]}>
              <Ionicons 
                name={currentAchievement.icon || 'trophy'} 
                size={48} 
                color={getCategoryColor(currentAchievement)} 
              />
            </View>
            
            <Text 
              style={[styles.achievementTitle, { color: theme.text }]}
              numberOfLines={2}
            >
              {currentAchievement.title}
            </Text>
            
            <Text 
              style={[styles.achievementDescription, { color: theme.textSecondary }]}
              numberOfLines={3}
            >
              {currentAchievement.description}
            </Text>
            
            {/* Points Badge */}
            <View style={styles.pointsBadgeContainer}>
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.pointsBadge}
              >
                <Text style={styles.pointsText}>
                  +{currentAchievement.points || 1} POINTS
                </Text>
              </LinearGradient>
            </View>
            
            {/* Category Badge */}
            <View style={styles.categoryBadgeContainer}>
              <View style={[
                styles.categoryBadge,
                { backgroundColor: `${getCategoryColor(currentAchievement)}20` }
              ]}>
                <Text style={[
                  styles.categoryText,
                  { color: getCategoryColor(currentAchievement) }
                ]}>
                  {categories.find(c => c.id === currentAchievement.category)?.title || 'Achievement'}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: getCategoryColor(currentAchievement) }
              ]}
              onPress={handleNextAchievement}
            >
              <Text style={styles.buttonText}>
                {currentIndex < newAchievements.length - 1 ? 'Next' : 'Done'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: width * 0.85,
    maxWidth: 350,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  progressIndicator: {
    flexDirection: 'row',
    marginTop: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#FFFFFF',
    width: 20,
  },
  achievementContainer: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementDescription: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  pointsBadgeContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  pointsBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  categoryBadgeContainer: {
    marginTop: 8,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontWeight: '600',
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NewAchievementsPopup;
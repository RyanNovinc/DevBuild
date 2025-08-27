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
  
  // Celebration animations
  const [fallingTrophies, setFallingTrophies] = useState([]);
  const [fireworks, setFireworks] = useState([]);
  
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
          duration: 150, // Faster animation
          useNativeDriver: true
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true
        })
      ]).start(() => {
        // Start celebration effects after popup is visible
        createCelebrationEffects();
      });
    } else {
      // Reset animation values
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
      slideAnim.setValue(50);
      setCurrentIndex(0);
      setFallingTrophies([]);
      setFireworks([]);
    }
  }, [visible]);
  
  // Get category color for an achievement
  const getCategoryColor = (achievement) => {
    if (!achievement) return '#3b82f6';
    
    const category = categories.find(c => c.id === achievement.category);
    return category?.color || '#3b82f6';
  };
  
  // Create celebration effects
  const createCelebrationEffects = () => {
    // Create falling trophies
    const newTrophies = [];
    for (let i = 0; i < 6; i++) {
      newTrophies.push({
        id: Date.now() + i,
        x: Math.random() * width,
        animValue: new Animated.Value(-50),
        rotation: new Animated.Value(0),
        delay: Math.random() * 500
      });
    }
    
    // Create fireworks
    const newFireworks = [];
    for (let i = 0; i < 4; i++) {
      newFireworks.push({
        id: Date.now() + 100 + i,
        x: Math.random() * width * 0.8 + width * 0.1,
        y: Math.random() * 200 + 100,
        scaleAnim: new Animated.Value(0),
        opacityAnim: new Animated.Value(1),
        delay: Math.random() * 300
      });
    }
    
    setFallingTrophies(newTrophies);
    setFireworks(newFireworks);
    
    // Animate falling trophies
    newTrophies.forEach(trophy => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(trophy.animValue, {
            toValue: 800,
            duration: 2000,
            useNativeDriver: true
          }),
          Animated.loop(
            Animated.timing(trophy.rotation, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true
            })
          )
        ]).start();
      }, trophy.delay);
    });
    
    // Animate fireworks
    newFireworks.forEach(firework => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(firework.scaleAnim, {
            toValue: 1.5,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.timing(firework.opacityAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true
          })
        ]).start();
      }, firework.delay);
    });
    
    // Clear effects after animation
    setTimeout(() => {
      setFallingTrophies([]);
      setFireworks([]);
    }, 3000);
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
        
        {/* Falling Trophy Effects */}
        {fallingTrophies.map(trophy => (
          <Animated.View
            key={trophy.id}
            style={[
              styles.fallingTrophy,
              {
                left: trophy.x,
                transform: [
                  { 
                    translateY: trophy.animValue 
                  },
                  { 
                    rotate: trophy.rotation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })
                  }
                ]
              }
            ]}
          >
            <Ionicons name="trophy" size={30} color="#FFD700" />
          </Animated.View>
        ))}
        
        {/* Fireworks Effects */}
        {fireworks.map(firework => (
          <Animated.View
            key={firework.id}
            style={[
              styles.firework,
              {
                left: firework.x,
                top: firework.y,
                opacity: firework.opacityAnim,
                transform: [
                  { scale: firework.scaleAnim }
                ]
              }
            ]}
          >
            <Text style={styles.fireworkText}>✨</Text>
          </Animated.View>
        ))}
        
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
            colors={theme.background === '#000000' ? ['#1a1a1a', '#2d2d2d'] : ['#3b82f6', '#1d4ed8']}
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
  fallingTrophy: {
    position: 'absolute',
    zIndex: 5,
  },
  firework: {
    position: 'absolute',
    zIndex: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireworkText: {
    fontSize: 24,
    color: '#FFD700',
  },
});

export default NewAchievementsPopup;
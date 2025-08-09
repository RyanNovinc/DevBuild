// src/screens/PricingScreen/components/BenefitsCarousel.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  PanGestureHandler,
  State
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const BenefitsCarousel = ({ theme, benefits = [], autoPlay = true }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const autoPlayRef = useRef(null);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && benefits.length > 1) {
      autoPlayRef.current = setInterval(() => {
        goToNext();
      }, 3000); // Change every 3 seconds
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [currentIndex, benefits.length, autoPlay]);

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % benefits.length;
    setCurrentIndex(nextIndex);
    animateToIndex(nextIndex);
  };

  const goToPrevious = () => {
    const prevIndex = currentIndex === 0 ? benefits.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    animateToIndex(prevIndex);
  };

  const animateToIndex = (index) => {
    Animated.timing(slideAnim, {
      toValue: index,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleDotPress = (index) => {
    setCurrentIndex(index);
    animateToIndex(index);
    
    // Reset auto-play timer
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = setInterval(() => {
        goToNext();
      }, 3000);
    }
  };

  if (!benefits || benefits.length === 0) return null;

  return (
    <View style={{
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 20,
      marginTop: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      {/* Header */}
      <Text style={{
        fontSize: 16,
        fontWeight: '600',
        color: theme.text,
        textAlign: 'center',
        marginBottom: 12
      }}>
        What's Included:
      </Text>

      {/* Carousel Content */}
      <View style={{
        height: 60,
        overflow: 'hidden',
        justifyContent: 'center'
      }}>
        <Animated.View
          style={{
            flexDirection: 'row',
            width: width * benefits.length,
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [0, benefits.length - 1],
                outputRange: [0, -(width - 40) * (benefits.length - 1)],
              })
            }]
          }}
        >
          {benefits.map((benefit, index) => (
            <View
              key={index}
              style={{
                width: width - 40,
                paddingHorizontal: 20,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons
                  name={benefit.icon}
                  size={20}
                  color={theme.primary}
                  style={{ marginRight: 8 }}
                />
                <Text style={{
                  fontSize: 14,
                  color: theme.text,
                  textAlign: 'center',
                  flex: 1,
                  fontWeight: '500'
                }}>
                  {benefit.text}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Navigation Arrows */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12
      }}>
        <TouchableOpacity
          onPress={goToPrevious}
          style={{
            padding: 8,
            opacity: benefits.length > 1 ? 1 : 0.3
          }}
          disabled={benefits.length <= 1}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        {/* Dots Indicator */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          {benefits.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleDotPress(index)}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                marginHorizontal: 3,
                backgroundColor: index === currentIndex ? theme.primary : theme.textSecondary,
                opacity: index === currentIndex ? 1 : 0.3
              }}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={goToNext}
          style={{
            padding: 8,
            opacity: benefits.length > 1 ? 1 : 0.3
          }}
          disabled={benefits.length <= 1}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BenefitsCarousel;
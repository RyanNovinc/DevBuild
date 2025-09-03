// Fixes for src/components/Confetti.js to make it work with the StreamlinedOnboardingScreen
import React, { useState, useLayoutEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MAX_PARTICLES = 70; // Increased for more visible effect
const MAX_FIREWORK_PARTICLES = 100; // Increased for more impressive fireworks

const Confetti = ({ 
  active = false, 
  colors = ['#FFD700', '#FFC125', '#FFDF00', '#F0E68C', '#DAA520'], // Default to golden colors
  duration = 4000, 
  onComplete,
  type = 'confetti', // 'confetti' or 'fireworks'
  count = null // Optional particle count override
}) => {
  const [particles, setParticles] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  // Create stable Animated.Value instances that persist across re-renders
  const animationValuesRef = useRef(null);
  
  // Initialize the effect when activated - simplified dependencies
  useLayoutEffect(() => {
    if (!active || isInitialized || isRunning) {
      return;
    } 
    
    setIsInitialized(true);
    setIsRunning(true);
    
    console.log(`${type} effect activated!`);
    
    if (type === 'fireworks') {
      createFireworksEffect();
    } else {
      createConfettiEffect();
    }
  }, [active, type]); // Removed problematic dependencies
  
  const createConfettiEffect = () => {
    // Create confetti particles (falling from top)
    const particleCount = count || MAX_PARTICLES;
    
    // Create or reuse stable animation values
    if (!animationValuesRef.current) {
      animationValuesRef.current = Array(MAX_PARTICLES).fill().map(() => ({
        yAnimation: new Animated.Value(0),
        xAnimation: new Animated.Value(0),
        rotationAnimation: new Animated.Value(0),
        opacityAnimation: new Animated.Value(1),
      }));
    }
    
    // Reset animation values to initial state
    animationValuesRef.current.forEach(animValues => {
      animValues.yAnimation.setValue(0);
      animValues.xAnimation.setValue(0);
      animValues.rotationAnimation.setValue(0);
      animValues.opacityAnimation.setValue(1);
    });
    
    const newParticles = Array(particleCount).fill().map((_, index) => {
      return {
        id: `particle-${index}`,
        x: Math.random() * SCREEN_WIDTH,
        y: -150 - Math.random() * 200, // Much higher starting position (off-screen)
        size: 5 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        type: 'confetti',
        // Use stable animation values
        yAnimation: animationValuesRef.current[index].yAnimation,
        xAnimation: animationValuesRef.current[index].xAnimation,
        rotationAnimation: animationValuesRef.current[index].rotationAnimation,
        opacityAnimation: animationValuesRef.current[index].opacityAnimation,
      };
    });
    
    setParticles(newParticles);
    
    // Create individual animations for each particle with staggered start times
    console.log(`🎊 Starting confetti with ${particleCount} particles, duration ${duration}ms`);
    
    newParticles.forEach((particle, index) => {
      // Stagger start times - particles drop over a longer period (2 seconds)
      const delayTime = (index / particleCount) * 2000; // Spread release over 2 seconds
      
      console.log(`🎊 Particle ${index} scheduled to start in ${delayTime}ms`);
      
      // Start each particle animation independently
      setTimeout(() => {
        console.log(`🎊 Particle ${index} STARTING animation at ${Date.now()}`);
        
        Animated.parallel([
          // Fall down with slight horizontal drift
          Animated.timing(particle.yAnimation, {
            toValue: 1,
            duration: duration, // Back to normal duration
            easing: Easing.ease,
            useNativeDriver: true
          }),
          // Slight horizontal drift
          Animated.timing(particle.xAnimation, {
            toValue: (Math.random() - 0.5) * 300,
            duration: duration,
            easing: Easing.ease,
            useNativeDriver: true
          }),
          // Rotate
          Animated.timing(particle.rotationAnimation, {
            toValue: 1,
            duration: duration,
            easing: Easing.linear,
            useNativeDriver: true
          })
        ]).start((result) => {
          console.log(`🎊 Particle ${index} animation FINISHED at ${Date.now()}, finished: ${result.finished}`);
        });
      }, delayTime);
    });
    
    // Clean up after all particles should be done (stagger time + animation duration + buffer)
    const totalTime = 2000 + duration + 500; // 2 seconds stagger + 4 seconds animation + 0.5 second buffer
    console.log(`🎊 Cleanup scheduled for ${totalTime}ms from now`);
    
    setTimeout(() => {
      console.log(`🎊 CLEANUP EXECUTING - removing ${particles.length} particles at ${Date.now()}`);
      setParticles([]);
      setIsInitialized(false);
      setIsRunning(false);
      if (onComplete) onComplete();
    }, totalTime);
  };

  const createFireworksEffect = () => {
    // Create multiple firework bursts
    const fireworkCenters = [
      { x: SCREEN_WIDTH * 0.3, y: SCREEN_HEIGHT * 0.3 },
      { x: SCREEN_WIDTH * 0.7, y: SCREEN_HEIGHT * 0.4 },
      { x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.25 },
      { x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT * 0.5 },
      { x: SCREEN_WIDTH * 0.8, y: SCREEN_HEIGHT * 0.35 }
    ];

    const allParticles = [];
    
    // Ensure we have colors to work with
    const availableColors = colors && colors.length > 0 ? colors : ['#FFD700', '#FFC125', '#FFDF00', '#F0E68C', '#DAA520'];
    
    fireworkCenters.forEach((center, burstIndex) => {
      const particlesPerBurst = Math.floor(MAX_FIREWORK_PARTICLES / fireworkCenters.length);
      
      for (let i = 0; i < particlesPerBurst; i++) {
        const angle = (Math.PI * 2 * i) / particlesPerBurst + Math.random() * 0.5;
        const velocity = 50 + Math.random() * 100;
        const size = 3 + Math.random() * 8;
        
        // Weighted color selection: 60% chance for primary colors (first 3), 40% for accent colors
        let selectedColor;
        if (availableColors.length >= 3 && Math.random() < 0.6) {
          // Use primary goal colors more frequently
          selectedColor = availableColors[Math.floor(Math.random() * Math.min(3, availableColors.length))];
        } else {
          // Use any available color
          selectedColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        }
        
        allParticles.push({
          id: `firework-${burstIndex}-${i}`,
          centerX: center.x,
          centerY: center.y,
          angle: angle,
          velocity: velocity,
          size: size,
          color: selectedColor,
          type: 'firework',
          burstIndex: burstIndex,
          // Animation values
          radiusAnimation: new Animated.Value(0),
          opacityAnimation: new Animated.Value(1),
          scaleAnimation: new Animated.Value(0),
        });
      }
    });
    
    setParticles(allParticles);
    
    // FIXED: Start animations immediately
    const particleAnimations = allParticles.map((particle, index) => {
      const burstDelay = particle.burstIndex * 100; // Reduced delay for faster bursts
      
      return Animated.parallel([
        // Expand outward from center
        Animated.timing(particle.radiusAnimation, {
          toValue: 1,
          duration: duration * 0.8,
          delay: burstDelay,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        }),
        // Scale up then down
        Animated.sequence([
          Animated.timing(particle.scaleAnimation, {
            toValue: 1,
            duration: 100,
            delay: burstDelay,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true
          }),
          Animated.timing(particle.scaleAnimation, {
            toValue: 0.3,
            duration: duration * 0.7,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true
          })
        ]),
        // Fade out
        Animated.timing(particle.opacityAnimation, {
          toValue: 0,
          duration: duration * 0.6,
          delay: burstDelay + duration * 0.2,
          easing: Easing.ease,
          useNativeDriver: true
        })
      ]);
    });
    
    const animationGroup = Animated.parallel(particleAnimations);
    
    animationGroup.start(() => {
      console.log("Fireworks animation complete");
      setParticles([]);
      setIsInitialized(false);
      setIsRunning(false);
      if (onComplete) onComplete();
    });
  };
  
  // Only show particles if we have them and animation is running
  if (!isRunning || particles.length === 0) {
    console.log(`🎊 RENDER: Not showing particles. isRunning: ${isRunning}, particles.length: ${particles.length}`);
    return null;
  }
  
  console.log(`🎊 RENDER: Showing ${particles.length} particles`);
  
  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map(particle => {
        if (particle.type === 'confetti') {
          return (
            <Animated.View
              key={particle.id}
              style={[
                styles.confettiParticle,
                {
                  width: particle.size,
                  height: particle.size * 3,
                  backgroundColor: particle.color,
                  left: particle.x,
                  transform: [
                    {
                      translateY: particle.yAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [particle.y, SCREEN_HEIGHT + 300] // Extended fall distance
                      })
                    },
                    {
                      translateX: particle.xAnimation
                    },
                    {
                      rotate: particle.rotationAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [`${particle.rotation}deg`, `${particle.rotation + 360}deg`]
                      })
                    }
                  ],
                  opacity: particle.opacityAnimation
                }
              ]}
            />
          );
        } else if (particle.type === 'firework') {
          return (
            <Animated.View
              key={particle.id}
              style={[
                styles.fireworkParticle,
                {
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  left: particle.centerX,
                  top: particle.centerY,
                  transform: [
                    {
                      translateX: particle.radiusAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.cos(particle.angle) * particle.velocity]
                      })
                    },
                    {
                      translateY: particle.radiusAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.sin(particle.angle) * particle.velocity]
                      })
                    },
                    {
                      scale: particle.scaleAnimation
                    }
                  ],
                  opacity: particle.opacityAnimation
                }
              ]}
            />
          );
        }
        return null;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  confettiParticle: {
    position: 'absolute',
    borderRadius: 2,
    // FIXED: Add shadow for more visibility
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  fireworkParticle: {
    position: 'absolute',
    borderRadius: 50, // Make firework particles circular
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  }
});

export default Confetti;
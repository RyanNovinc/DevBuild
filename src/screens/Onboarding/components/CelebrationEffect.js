// src/screens/Onboarding/components/CelebrationEffect.js
import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Enhanced celebration effect component with more dramatic animations
 * @param {Object} props
 * @param {boolean} props.visible - Whether the celebration should be visible
 * @param {string} props.type - Type of celebration ('confetti', 'fireworks', 'sparkles', 'starburst', 'shimmer')
 * @param {Array} props.colors - Array of colors to use for the celebration
 * @param {function} props.onComplete - Callback when animation completes
 */
const CelebrationEffect = ({ visible, type = 'confetti', colors = [], onComplete }) => {
  // Set up state for particles
  const [particles, setParticles] = useState([]);
  
  // Animation reference for cleanup
  const animationsRef = useRef([]);
  
  // Generate new particles when the effect becomes visible
  useEffect(() => {
    if (visible) {
      generateParticles();
      
      // Auto-hide after animation duration - allow extra time for particles to fall off screen
      let duration = 2000; // Base duration
      
      // Add extra time for falling animations to complete
      if (type === 'confetti' || type === 'shimmer') {
        duration = 5000; // Allow confetti/shimmer to fully fall off screen
      } else if (type === 'fireworks') {
        duration = 3000; // Fireworks need a bit more time
      }
      
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, duration);
      
      return () => {
        clearTimeout(timer);
        // Clean up any ongoing animations
        animationsRef.current.forEach(anim => anim.stop());
        animationsRef.current = [];
      };
    } else {
      // Ensure we clean up animations even when not visible
      animationsRef.current.forEach(anim => anim.stop());
      animationsRef.current = [];
      setParticles([]);
    }
  }, [visible, type]);

  // Generate particles based on the celebration type
  const generateParticles = () => {
    let particleCount;
    let particleShapes;
    
    // Configure particles based on type - REDUCED COUNTS to prevent performance issues
    switch (type) {
      case 'confetti':
        particleCount = 50; // Reduced from 100
        particleShapes = ['square', 'circle', 'rect', 'square'];
        break;
      case 'fireworks':
        particleCount = 40; // Reduced from 80
        particleShapes = ['circle', 'circle'];
        break;
      case 'sparkles':
        particleCount = 30; // Reduced from 60
        particleShapes = ['circle', 'circle'];
        break;
      case 'starburst':
        particleCount = 40; // Reduced from 80
        particleShapes = ['circle', 'circle'];
        break;
      case 'shimmer':
        particleCount = 50; // Reduced from 120
        particleShapes = ['circle', 'circle'];
        break;
      default:
        particleCount = 40;
        particleShapes = ['circle', 'square'];
    }
    
    // Use provided colors or defaults if empty
    const particleColors = colors.length > 0 ? colors : [
      '#3b82f6', // blue
      '#10b981', // green
      '#ec4899', // pink
      '#f59e0b', // amber
      '#6366f1', // indigo
      '#ef4444', // red
      '#8b5cf6', // violet
      '#0ea5e9'  // sky blue
    ];
    
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const randomColor = particleColors[Math.floor(Math.random() * particleColors.length)];
      const randomShape = particleShapes[Math.floor(Math.random() * particleShapes.length)];
      
      // Pre-calculate rotation values to avoid expensive interpolations
      const rotationDegrees = (Math.random() - 0.5) * 720; // -360 to 360 degrees
      
      // Basic particle properties
      const particle = {
        id: i,
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        scale: new Animated.Value(0),
        alpha: new Animated.Value(1),
        rotation: new Animated.Value(0), // Keep for animation
        rotationDegrees, // Store pre-calculated value
        color: randomColor,
        shape: randomShape,
      };
      
      // Configure initial positions and sizes based on celebration type
      switch (type) {
        case 'confetti':
          // Distribute confetti across the top of the screen
          particle.initialX = Math.random() * SCREEN_WIDTH;
          particle.initialY = -20; // Start above the screen
          particle.size = 8 + Math.random() * 8; // Varied sizes
          break;
        
        case 'fireworks':
          // Multiple firework burst origins
          const burstCount = 3;
          const burstIndex = i % burstCount;
          const burstX = SCREEN_WIDTH * (0.25 + (burstIndex * 0.25));
          const burstY = SCREEN_HEIGHT * 0.6;
          
          particle.initialX = burstX;
          particle.initialY = burstY;
          particle.size = 6 + Math.random() * 8;
          break;
        
        case 'sparkles':
          // Sparkles distributed across the whole screen
          particle.initialX = Math.random() * SCREEN_WIDTH;
          particle.initialY = Math.random() * SCREEN_HEIGHT * 0.8;
          particle.size = 4 + Math.random() * 8;
          break;
        
        case 'starburst':
          // Central burst
          particle.initialX = SCREEN_WIDTH / 2;
          particle.initialY = SCREEN_HEIGHT / 2;
          particle.size = 5 + Math.random() * 15;
          break;
        
        case 'shimmer':
          // Rain of shimmer from top
          particle.initialX = Math.random() * SCREEN_WIDTH;
          particle.initialY = Math.random() * SCREEN_HEIGHT * 0.3;
          particle.size = 3 + Math.random() * 5;
          break;
          
        default:
          particle.initialX = SCREEN_WIDTH / 2;
          particle.initialY = SCREEN_HEIGHT / 2;
          particle.size = 5 + Math.random() * 10;
      }
      
      newParticles.push(particle);
    }
    
    setParticles(newParticles);
    animateParticles(newParticles);
  };
  
  // Animate all particles
  const animateParticles = (particlesToAnimate) => {
    const animations = [];
    
    particlesToAnimate.forEach((particle, index) => {
      let animationSet;
      
      // Create different animation patterns based on celebration type
      switch (type) {
        case 'confetti':
          animationSet = animateConfetti(particle, index);
          break;
        case 'fireworks':
          animationSet = animateFireworks(particle, index);
          break;
        case 'sparkles':
          animationSet = animateSparkles(particle, index);
          break;
        case 'starburst':
          animationSet = animateStarburst(particle, index);
          break;
        case 'shimmer':
          animationSet = animateShimmer(particle, index);
          break;
        default:
          animationSet = animateConfetti(particle, index);
      }
      
      animations.push(...animationSet);
    });
    
    // Run all animations
    const compositeAnimation = Animated.parallel(animations);
    compositeAnimation.start();
    animationsRef.current.push(compositeAnimation);
  };
  
  // Confetti animation - more realistic falling pattern
  const animateConfetti = (particle, index) => {
    const animations = [];
    
    // Random horizontal movement with swaying
    const targetX = (Math.random() - 0.5) * SCREEN_WIDTH * 1.5;
    // Fall all the way down the screen
    const targetY = SCREEN_HEIGHT + 50 + Math.random() * 100;
    // Varied duration for natural effect
    const duration = 2000 + Math.random() * 2000;
    // Delay the start of some particles
    const delay = Math.random() * 500;
    
    // Horizontal movement with swaying
    animations.push(
      Animated.timing(particle.x, {
        toValue: targetX,
        duration,
        delay,
        easing: Easing.ease,
        useNativeDriver: true
      })
    );
    
    // Vertical falling
    animations.push(
      Animated.timing(particle.y, {
        toValue: targetY,
        duration,
        delay,
        easing: Easing.ease,
        useNativeDriver: true
      })
    );
    
    // Spinning rotation - more rotation for realism
    animations.push(
      Animated.timing(particle.rotation, {
        toValue: (Math.random() - 0.5) * 20, // More rotation
        duration,
        delay,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );
    
    // Scale up quickly then slowly fade out
    animations.push(
      Animated.sequence([
        Animated.timing(particle.scale, {
          toValue: 1,
          duration: 200,
          delay,
          useNativeDriver: true
        }),
        Animated.timing(particle.scale, {
          toValue: 0,
          duration: duration - 200,
          delay: duration * 0.6,
          useNativeDriver: true
        })
      ])
    );
    
    return animations;
  };
  
  // Fireworks animation - more dramatic
  const animateFireworks = (particle, index) => {
    const animations = [];
    
    // Group particles into bursts
    const burstCount = 3;
    const burstIndex = index % burstCount;
    
    // Create exponential launch timing for impressive effect
    const burstDelay = burstIndex * 300;
    
    // Calculate burst pattern - each particle flies in a different direction
    const angle = (index / 20) * Math.PI * 2; // Divide by a fixed number
    const distance = 100 + Math.random() * 200; // Larger distance for more dramatic effect
    
    const targetX = Math.cos(angle) * distance;
    const targetY = -Math.sin(angle) * distance;
    
    // Duration based on distance for natural effect
    const duration = 1200 + Math.random() * 800;
    
    // Explosive movement
    animations.push(
      Animated.timing(particle.x, {
        toValue: targetX,
        duration,
        delay: burstDelay,
        easing: Easing.ease,
        useNativeDriver: true
      })
    );
    
    animations.push(
      Animated.timing(particle.y, {
        toValue: targetY,
        duration,
        delay: burstDelay,
        easing: Easing.ease,
        useNativeDriver: true
      })
    );
    
    // Scaling and fade
    animations.push(
      Animated.sequence([
        // Quick scale up
        Animated.timing(particle.scale, {
          toValue: 1 + Math.random() * 0.5,
          duration: 200,
          delay: burstDelay,
          useNativeDriver: true
        }),
        // Gradual fade out
        Animated.timing(particle.scale, {
          toValue: 0,
          duration: duration - 200,
          easing: Easing.ease,
          useNativeDriver: true
        })
      ])
    );
    
    // Trailing effect with opacity
    animations.push(
      Animated.timing(particle.alpha, {
        toValue: 0,
        duration: duration,
        delay: burstDelay + duration * 0.3,
        useNativeDriver: true
      })
    );
    
    // Simpler rotation for some particles
    if (index % 3 === 0) {
      animations.push(
        Animated.timing(particle.rotation, {
          toValue: Math.random() * 4 - 2,
          duration: duration,
          delay: burstDelay,
          useNativeDriver: true
        })
      );
    }
    
    return animations;
  };
  
  // Sparkles animation - more vibrant
  const animateSparkles = (particle, index) => {
    const animations = [];
    
    // Subtle movement
    const targetX = (Math.random() - 0.5) * 30;
    const targetY = (Math.random() - 0.5) * 30;
    const duration = 1000 + Math.random() * 1000;
    const delay = Math.random() * 500;
    
    // Subtle drift
    animations.push(
      Animated.timing(particle.x, {
        toValue: targetX,
        duration,
        delay,
        useNativeDriver: true
      })
    );
    
    animations.push(
      Animated.timing(particle.y, {
        toValue: targetY,
        duration,
        delay,
        useNativeDriver: true
      })
    );
    
    // Pulsating effect
    animations.push(
      Animated.sequence([
        // Quickly appear
        Animated.timing(particle.scale, {
          toValue: 1 + Math.random() * 0.8,
          duration: 300,
          delay,
          useNativeDriver: true
        }),
        // Hold
        Animated.timing(particle.scale, {
          toValue: 0.8 + Math.random() * 0.4,
          duration: duration * 0.4,
          useNativeDriver: true
        }),
        // Fade out
        Animated.timing(particle.scale, {
          toValue: 0,
          duration: duration * 0.3,
          useNativeDriver: true
        })
      ])
    );
    
    // Twinkle effect with opacity
    animations.push(
      Animated.sequence([
        Animated.timing(particle.alpha, {
          toValue: 0.7,
          duration: duration * 0.3,
          delay,
          useNativeDriver: true
        }),
        Animated.timing(particle.alpha, {
          toValue: 1,
          duration: duration * 0.2,
          useNativeDriver: true
        }),
        Animated.timing(particle.alpha, {
          toValue: 0,
          duration: duration * 0.5,
          useNativeDriver: true
        })
      ])
    );
    
    return animations;
  };
  
  // Starburst animation - dramatic outward explosion
  const animateStarburst = (particle, index) => {
    const animations = [];
    
    // Exponential outward movement
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 250; // Longer distance
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance;
    const duration = 1200 + Math.random() * 300;
    
    // Explosive movement
    animations.push(
      Animated.timing(particle.x, {
        toValue: targetX,
        duration,
        easing: Easing.ease,
        useNativeDriver: true
      })
    );
    
    animations.push(
      Animated.timing(particle.y, {
        toValue: targetY,
        duration,
        easing: Easing.ease,
        useNativeDriver: true
      })
    );
    
    // Quick scale up then fade
    animations.push(
      Animated.sequence([
        Animated.timing(particle.scale, {
          toValue: 1.5,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(particle.scale, {
          toValue: 0,
          duration: duration - 200,
          delay: duration * 0.3,
          easing: Easing.ease,
          useNativeDriver: true
        })
      ])
    );
    
    // Simpler rotation for some particles
    if (index % 2 === 0) {
      animations.push(
        Animated.timing(particle.rotation, {
          toValue: Math.random() * 4 - 2,
          duration,
          useNativeDriver: true
        })
      );
    }
    
    return animations;
  };
  
  // Shimmer animation - elegant flowing sparkles
  const animateShimmer = (particle, index) => {
    const animations = [];
    
    // Wave-like movement
    const waveAmplitude = 30 + Math.random() * 30;
    const waveFrequency = 0.005 + Math.random() * 0.01;
    const targetX = (Math.sin(index * waveFrequency) * waveAmplitude) + (Math.random() - 0.5) * 50;
    const targetY = SCREEN_HEIGHT + 100;
    const duration = 1500 + Math.random() * 1000;
    const delay = Math.random() * 1000;
    
    // Gentle flowing motion
    animations.push(
      Animated.timing(particle.x, {
        toValue: targetX,
        duration,
        delay,
        useNativeDriver: true
      })
    );
    
    animations.push(
      Animated.timing(particle.y, {
        toValue: targetY,
        duration,
        delay,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );
    
    // Gentle pulsing scale
    animations.push(
      Animated.sequence([
        Animated.timing(particle.scale, {
          toValue: 0.7 + Math.random() * 0.6,
          duration: 400,
          delay,
          useNativeDriver: true
        }),
        Animated.timing(particle.scale, {
          toValue: 0.5 + Math.random() * 0.5,
          duration: duration * 0.5,
          useNativeDriver: true
        }),
        Animated.timing(particle.scale, {
          toValue: 0,
          duration: duration * 0.3,
          useNativeDriver: true
        })
      ])
    );
    
    // Shimmer opacity effect
    animations.push(
      Animated.sequence([
        Animated.timing(particle.alpha, {
          toValue: 0.7 + Math.random() * 0.3,
          duration: 300,
          delay,
          useNativeDriver: true
        }),
        Animated.timing(particle.alpha, {
          toValue: 0.3 + Math.random() * 0.5,
          duration: duration * 0.4,
          useNativeDriver: true
        }),
        Animated.timing(particle.alpha, {
          toValue: 0,
          duration: duration * 0.4,
          useNativeDriver: true
        })
      ])
    );
    
    // Slow rotation
    animations.push(
      Animated.timing(particle.rotation, {
        toValue: Math.random() * 2 - 1,
        duration: duration,
        delay,
        easing: Easing.ease,
        useNativeDriver: true
      })
    );
    
    return animations;
  };
  
  if (!visible) return null;
  
  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => {
        const baseStyle = {
          width: particle.size,
          height: particle.shape === 'rect' ? particle.size * 1.5 : particle.size,
          backgroundColor: particle.color,
          borderRadius: particle.shape === 'circle' ? particle.size / 2 : 2,
          left: particle.initialX,
          top: particle.initialY,
          opacity: particle.alpha,
        };
        
        // Apply transforms - OPTIMIZED to avoid stack overflow
        let transformArray = [
          { translateX: particle.x },
          { translateY: particle.y },
          { scale: particle.scale }
        ];
        
        // Fixed rotation for non-circles instead of interpolation
        if (particle.shape !== 'circle') {
          transformArray.push({ 
            rotate: `${particle.rotationDegrees}deg` // Use pre-calculated rotation
          });
        }
        
        return (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              baseStyle,
              { transform: transformArray }
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
  }
});

export default CelebrationEffect;
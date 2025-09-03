import React, { createContext, useContext, useState } from 'react';

const GlobalAnimationContext = createContext();

export const useGlobalAnimation = () => {
  const context = useContext(GlobalAnimationContext);
  if (!context) {
    throw new Error('useGlobalAnimation must be used within a GlobalAnimationProvider');
  }
  return context;
};

export const GlobalAnimationProvider = ({ children }) => {
  const [activeAnimations, setActiveAnimations] = useState([]);

  const triggerAnimation = (animationType, options = {}) => {
    const animationId = `${animationType}_${Date.now()}_${Math.random()}`;
    const animation = {
      id: animationId,
      type: animationType,
      ...options,
      active: true
    };

    setActiveAnimations(prev => [...prev, animation]);

    // Auto-remove after duration
    const duration = options.duration || 4000;
    // For confetti, account for stagger time (2000ms) + duration + buffer
    const cleanupDelay = animationType === 'confetti' ? 2000 + duration + 1000 : duration + 1000;
    setTimeout(() => {
      setActiveAnimations(prev => prev.filter(anim => anim.id !== animationId));
    }, cleanupDelay);

    return animationId;
  };

  const removeAnimation = (animationId) => {
    setActiveAnimations(prev => prev.filter(anim => anim.id !== animationId));
  };

  const clearAllAnimations = () => {
    setActiveAnimations([]);
  };

  const value = {
    activeAnimations,
    triggerAnimation,
    removeAnimation,
    clearAllAnimations,
    // Convenience methods
    triggerFireworks: (colors, duration = 5000) => 
      triggerAnimation('fireworks', { colors, duration }),
    triggerConfetti: (colors, duration = 4000) => 
      triggerAnimation('confetti', { colors, duration })
  };

  return (
    <GlobalAnimationContext.Provider value={value}>
      {children}
    </GlobalAnimationContext.Provider>
  );
};
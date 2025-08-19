import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGlobalAnimation } from '../context/GlobalAnimationContext';
import Confetti from './Confetti';

const GlobalAnimationRenderer = () => {
  const { activeAnimations, removeAnimation } = useGlobalAnimation();

  if (activeAnimations.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {activeAnimations.map((animation) => (
        <Confetti
          key={animation.id}
          active={animation.active}
          colors={animation.colors}
          duration={animation.duration}
          type={animation.type}
          count={animation.count}
          onComplete={() => removeAnimation(animation.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000, // Above everything else
    pointerEvents: 'none',
  },
});

export default GlobalAnimationRenderer;
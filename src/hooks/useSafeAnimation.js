// src/hooks/useSafeAnimation.js
import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';

/**
 * Custom hook for safe animation handling
 * Prevents "cannot add property" errors in strict mode/frozen objects
 */
export const useSafeAnimation = (initialValue = 0) => {
  const animatedValue = useRef(null);

  // Initialize animated value safely
  if (!animatedValue.current) {
    try {
      animatedValue.current = new Animated.Value(initialValue);
    } catch (error) {
      console.warn('Failed to create Animated.Value, using fallback');
      // Create a safe fallback object
      animatedValue.current = {
        setValue: () => {},
        interpolate: () => initialValue,
        stopAnimation: () => {},
        addListener: () => ({ remove: () => {} }),
        removeListener: () => {},
        removeAllListeners: () => {},
        _value: initialValue
      };
    }
  }

  // Safe setValue wrapper
  const setValue = useCallback((value) => {
    try {
      if (animatedValue.current && typeof animatedValue.current.setValue === 'function') {
        animatedValue.current.setValue(value);
      }
    } catch (error) {
      // Silently ignore frozen object errors
      if (!error.message.includes('frozen') && !error.message.includes('immutable') && !error.message.includes('cannot add')) {
        console.warn('Animation setValue error:', error.message);
      }
    }
  }, []);

  // Safe interpolate wrapper
  const interpolate = useCallback((config) => {
    try {
      if (animatedValue.current && typeof animatedValue.current.interpolate === 'function') {
        return animatedValue.current.interpolate(config);
      }
    } catch (error) {
      // Silently ignore frozen object errors
      if (!error.message.includes('frozen') && !error.message.includes('immutable') && !error.message.includes('cannot add')) {
        console.warn('Animation interpolate error:', error.message);
      }
    }
    // Return fallback value
    return initialValue;
  }, [initialValue]);

  // Safe animation timing wrapper
  const timing = useCallback((config) => {
    try {
      if (animatedValue.current) {
        return Animated.timing(animatedValue.current, config);
      }
    } catch (error) {
      // Silently ignore frozen object errors
      if (!error.message.includes('frozen') && !error.message.includes('immutable') && !error.message.includes('cannot add')) {
        console.warn('Animation timing error:', error.message);
      }
    }
    // Return a mock animation that does nothing
    return {
      start: (callback) => callback && callback(),
      stop: () => {},
      reset: () => {}
    };
  }, []);

  // Safe spring animation wrapper
  const spring = useCallback((config) => {
    try {
      if (animatedValue.current) {
        return Animated.spring(animatedValue.current, config);
      }
    } catch (error) {
      // Silently ignore frozen object errors
      if (!error.message.includes('frozen') && !error.message.includes('immutable') && !error.message.includes('cannot add')) {
        console.warn('Animation spring error:', error.message);
      }
    }
    // Return a mock animation that does nothing
    return {
      start: (callback) => callback && callback(),
      stop: () => {},
      reset: () => {}
    };
  }, []);

  return {
    value: animatedValue.current,
    setValue,
    interpolate,
    timing,
    spring
  };
};

/**
 * Safe wrapper for any Animated.Value operation
 */
export const safeAnimatedCall = (animatedValue, operation, ...args) => {
  try {
    if (animatedValue && typeof animatedValue[operation] === 'function') {
      return animatedValue[operation](...args);
    }
  } catch (error) {
    // Silently ignore frozen object errors
    if (!error.message.includes('frozen') && !error.message.includes('immutable') && !error.message.includes('cannot add')) {
      console.warn(`Animation ${operation} error:`, error.message);
    }
  }
  return null;
};

/**
 * Safe Animated.Value creator
 */
export const createSafeAnimatedValue = (initialValue = 0) => {
  try {
    return new Animated.Value(initialValue);
  } catch (error) {
    console.warn('Failed to create Animated.Value, using fallback');
    return {
      setValue: () => {},
      interpolate: () => initialValue,
      stopAnimation: () => {},
      addListener: () => ({ remove: () => {} }),
      removeListener: () => {},
      removeAllListeners: () => {},
      _value: initialValue
    };
  }
};

export default useSafeAnimation;
// PlatformFix.js
// Combined file that handles both Platform initialization and floating-point precision fixes

/**
 * Handle Platform initialization for Hermes JavaScript engine
 * 
 * This is a workaround for the "Property 'Platform' doesn't exist" error
 * that can occur with the Hermes JavaScript engine in React Native/Expo.
 */

// Import Platform safely with a try-catch to handle potential errors
let RNPlatform;
try {
  const ReactNative = require('react-native');
  RNPlatform = ReactNative.Platform;
  
  // Make Platform available globally for components that expect it
  if (global.Platform === undefined) {
    global.Platform = RNPlatform;
    console.log('✅ Platform initialized globally');
  }
} catch (error) {
  console.warn('⚠️ Error initializing Platform:', error);
  
  // Create a dummy Platform object as fallback
  global.Platform = global.Platform || {
    OS: 'unknown',
    Version: 0,
    isPad: false,
    isTV: false,
    isTesting: false,
    select: (obj) => obj.default || null
  };
}

// Now that Platform is initialized, we can use it for precision fixes
const Platform = global.Platform;

// ----- PRECISION FIXES -----

// Fix for Animated values to prevent precision errors
if (global.Animated && global.Animated.Value) {
  // Store original interpolate method
  const originalInterpolate = global.Animated.Value.prototype.interpolate;
  
  // Replace with version that rounds output values
  global.Animated.Value.prototype.interpolate = function(config) {
    // If outputRange exists in config, ensure we round the values 
    // when they're used (this happens via the interpolation function)
    if (config && config.outputRange) {
      const origInterpolation = originalInterpolate.call(this, config);
      
      // Wrap the __getValue method to round results
      const originalGetValue = origInterpolation.__getValue;
      origInterpolation.__getValue = function() {
        const value = originalGetValue.call(this);
        // Round to 2 decimal places to avoid floating point errors
        // while preserving reasonable precision for animations
        return Math.round(value * 100) / 100;
      };
      
      return origInterpolation;
    }
    
    // Fall back to original behavior if no outputRange
    return originalInterpolate.call(this, config);
  };
  
  console.log('✅ Animated.Value.interpolate patched for precision safety');
}

// Fix React Native style processing to round position values
if (global.__DEV__ && Platform.OS === 'ios') {
  try {
    // This is a development-only safety check
    console.log('💡 Platform fix applied for React Native precision issues');
    
    // Add global Math.roundPrecise helper
    if (!global.Math.roundPrecise) {
      global.Math.roundPrecise = function(value) {
        if (typeof value !== 'number') return value;
        return Math.round(value * 100) / 100;
      };
    }
  } catch (e) {
    console.warn('⚠️ Error applying platform fix:', e);
  }
}

// Add safety patch for StyleSheet transforms
if (global.ReactNative && global.ReactNative.StyleSheet) {
  const { StyleSheet } = global.ReactNative;
  
  // Try to safely monkey-patch the internal style processor if available
  if (StyleSheet && StyleSheet.__processTransform) {
    const originalProcessTransform = StyleSheet.__processTransform;
    
    StyleSheet.__processTransform = function(transform) {
      // Process the transform array to round values
      if (Array.isArray(transform)) {
        return transform.map(transformItem => {
          const result = {...transformItem};
          
          // Round all numeric properties in the transform
          Object.keys(result).forEach(key => {
            if (typeof result[key] === 'number') {
              result[key] = Math.round(result[key] * 100) / 100;
            }
          });
          
          return result;
        });
      }
      
      // Fall back to original if not an array
      return originalProcessTransform(transform);
    };
    
    console.log('✅ StyleSheet transform processing patched for precision safety');
  }
}

// Fix potential issues with React Native's implementation of width and position calculations
if (global.ReactNative) {
  try {
    // Try to intercept layout calculations if available through NativeModules
    const { UIManager } = global.ReactNative.NativeModules || {};
    
    if (UIManager && UIManager.updateView) {
      const originalUpdateView = UIManager.updateView;
      UIManager.updateView = function(tag, className, props) {
        // Process props to round values before they reach native code
        if (props) {
          // Handle layout props
          ['left', 'top', 'right', 'bottom', 'width', 'height'].forEach(prop => {
            if (props[prop] !== undefined && typeof props[prop] === 'number') {
              props[prop] = Math.round(props[prop] * 100) / 100;
            }
          });
          
          // Handle transform props
          if (props.transform) {
            props.transform = props.transform.map(t => {
              const result = {...t};
              Object.keys(result).forEach(key => {
                if (typeof result[key] === 'number') {
                  result[key] = Math.round(result[key] * 100) / 100;
                }
              });
              return result;
            });
          }
        }
        
        return originalUpdateView.apply(this, arguments);
      };
      
      console.log('✅ UIManager.updateView patched for precision safety');
    }
  } catch (e) {
    console.warn('⚠️ Error applying UIManager patch:', e);
  }
}

// Export an explicit rounding function that can be used in the app
export const roundForNative = (value) => {
  if (typeof value !== 'number') return value;
  return Math.round(value * 100) / 100;
};

// Export Platform for direct imports
export default Platform;

// Safety check log to confirm the file loaded
console.log('📱 PlatformFix loaded - initialization and precision safety measures applied');
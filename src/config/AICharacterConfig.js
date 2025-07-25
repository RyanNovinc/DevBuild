// src/config/AICharacterConfig.js
// Character avatar configuration for different AI styles

// Map style IDs from MotivationalStyleSelector to the AIAssistantScreen style IDs
export const styleIdMapping = {
  'default': 'default',
  'direct': 'highEnergy',
  'strategic': 'strategic',
  'mindful': 'philosophical',
  'challenger': 'analytical',
};

// Define colors for each character type
const characterColors = {
  default: '#4CAF50',      // Green
  highEnergy: '#FF5722',   // Orange/Red
  strategic: '#2196F3',    // Blue
  philosophical: '#9C27B0', // Purple
  analytical: '#FFC107',   // Amber/Yellow
  practical: '#795548'     // Brown
};

// Use icon-based avatars instead of PNG images
export const characterAvatars = {
  // Default style - uses icons instead of images
  default: {
    // No image assets needed
    description: 'Balanced, encouraging assistant',
    icon: 'sparkles-outline',
    color: characterColors.default
  },
  
  // High-Energy Coach style (Direct Motivator)
  highEnergy: {
    // No image assets needed
    description: 'Direct, high-energy, action-focused coach',
    icon: 'flash-outline',
    color: characterColors.highEnergy
  },
  
  // Strategic Advisor style (Strategic Coach)
  strategic: {
    // No image assets needed
    description: 'Strategic, power-focused, historical perspective',
    icon: 'trending-up-outline',
    color: characterColors.strategic
  },
  
  // Philosophical Guide style (Mindful Guide)
  philosophical: {
    // No image assets needed
    description: 'Philosophical, growth-oriented, balanced guide',
    icon: 'leaf-outline',
    color: characterColors.philosophical
  },
  
  // Analytical Expert style (Challenger)
  analytical: {
    // No image assets needed
    description: 'Challenges your thinking, pushes your boundaries',
    icon: 'bulb-outline',  // Swapped from 'fitness-outline' to 'bulb-outline'
    color: characterColors.analytical
  },
  
  // Legacy style for backward compatibility
  practical: {
    // No image assets needed
    description: 'Practical, warm, action-oriented motivator',
    icon: 'fitness-outline',  // Swapped from 'bulb-outline' to 'fitness-outline'
    color: characterColors.practical
  }
};

// Helper function to render avatar element (can be used in place of image)
export const renderAvatar = (type, state = 'normal', size = 40) => {
  const character = characterAvatars[type] || characterAvatars.default;
  const iconName = character.icon;
  const backgroundColor = character.color;
  
  // For thinking state, add slight opacity or alternative styling
  const opacity = state === 'thinking' ? 0.7 : 1;
  
  // Return styling properties to be used directly in a View component
  return {
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
      opacity
    },
    icon: {
      name: iconName,
      size: size * 0.6,
      color: '#FFFFFF'
    }
  };
};

// Export character colors for use elsewhere in the app
export { characterColors };
// src/data/LevelProfilePictures.js

/**
 * Level-based profile picture system
 * Each level unlocks epic profile pictures that match the level's prestige
 */

// Epic color schemes for each level - gets more impressive as levels increase
export const LEVEL_COLOR_SCHEMES = {
  1: { // Beginner
    primary: '#4A90E2',
    secondary: '#357ABD',
    accent: '#2E6BA8',
    name: 'Beginner Blue'
  },
  2: { // Intermediate  
    primary: '#7ED321',
    secondary: '#5FA91A',
    accent: '#4A8014',
    name: 'Growth Green'
  },
  3: { // Professional
    primary: '#F5A623',
    secondary: '#D4841C',
    accent: '#B86F15',
    name: 'Professional Gold'
  },
  4: { // Expert
    primary: '#BD10E0',
    secondary: '#9B0EC0',
    accent: '#7A0B9A',
    name: 'Expert Purple'
  },
  5: { // Master
    primary: '#B8E986',
    secondary: '#A3D470',
    accent: '#8FBF5A',
    name: 'Master Emerald'
  },
  6: { // Grand Master
    primary: '#50E3C2',
    secondary: '#42C4A5',
    accent: '#349688',
    name: 'Grand Master Teal'
  },
  7: { // Champion
    primary: '#E94B3C',
    secondary: '#C73E32',
    accent: '#A53228',
    name: 'Champion Crimson'
  },
  8: { // Legend (Custom Photo Level)
    primary: '#FF6B6B',
    secondary: '#FF5252',
    accent: '#E53935',
    name: 'Legendary Flame'
  },
  9: { // Hero
    primary: '#4ECDC4',
    secondary: '#45B7B8',
    accent: '#3C9A9B',
    name: 'Heroic Aqua'
  },
  10: { // Immortal
    primary: '#FFE66D',
    secondary: '#FFD93D',
    accent: '#FFCC02',
    name: 'Immortal Radiance'
  },
  11: { // Ascendant
    primary: '#FF6B9D',
    secondary: '#FF4081',
    accent: '#E91E63',
    name: 'Ascendant Rose'
  },
  12: { // Eternal
    primary: '#C44CF0',
    secondary: '#B73CE6',
    accent: '#9C27B0',
    name: 'Eternal Mystic'
  }
};

// Profile picture options - ONE per level
export const LEVEL_PROFILE_PICTURES = {
  1: { // Beginner - Simple but clean
    requiredLevel: 1,
    title: 'Beginner',
    picture: {
      id: 'beginner_compass',
      name: 'Explorer\'s Compass',
      icon: 'compass-outline',
      colorScheme: LEVEL_COLOR_SCHEMES[1],
      description: 'Level 1: Start your journey with direction'
    }
  },
  
  2: { // Intermediate - Getting more sophisticated + Custom Photos
    requiredLevel: 2,
    title: 'Intermediate',
    picture: {
      id: 'intermediate_target',
      name: 'Goal Seeker',
      icon: 'flag-outline',
      colorScheme: LEVEL_COLOR_SCHEMES[2],
      description: 'Level 2: Focused on goals + Custom photo upload unlocked!'
    }
  },
  
  3: { // Professional - Business-like elegance
    requiredLevel: 3,
    title: 'Professional', 
    picture: {
      id: 'professional_briefcase',
      name: 'Strategic Mind',
      icon: 'briefcase-outline',
      colorScheme: LEVEL_COLOR_SCHEMES[3],
      description: 'Level 3: Professional approach to life planning'
    }
  },
  
  4: { // Expert - More sophisticated and unique
    requiredLevel: 4,
    title: 'Expert',
    picture: {
      id: 'expert_diamond',
      name: 'Brilliant Expert',
      icon: 'diamond-outline',
      colorScheme: LEVEL_COLOR_SCHEMES[4],
      description: 'Level 4: Rare and valuable mindset'
    }
  },
  
  5: { // Master - Commanding presence
    requiredLevel: 5,
    title: 'Master',
    picture: {
      id: 'master_shield',
      name: 'Guardian of Goals',
      icon: 'shield-outline',
      colorScheme: LEVEL_COLOR_SCHEMES[5],
      description: 'Level 5: Protecting what matters most'
    }
  },
  
  6: { // Grand Master - Mystical and powerful
    requiredLevel: 6,
    title: 'Grand Master',
    picture: {
      id: 'grandmaster_flame',
      name: 'Eternal Flame',
      icon: 'flame-outline',
      colorScheme: LEVEL_COLOR_SCHEMES[6],
      description: 'Level 6: Burning bright with passion'
    }
  },
  
  7: { // Champion - Battle-tested excellence
    requiredLevel: 7,
    title: 'Champion',
    picture: {
      id: 'champion_medal',
      name: 'Victory Medallion',
      icon: 'medal-outline',
      colorScheme: LEVEL_COLOR_SCHEMES[7],
      description: 'Level 7: Proven champion of consistency'
    }
  },
  
  8: { // Legend - Legendary Status
    requiredLevel: 8,
    title: 'Legend',
    picture: {
      id: 'legend_flame',
      name: 'Personal Legend',
      icon: 'flame-outline',
      colorScheme: LEVEL_COLOR_SCHEMES[8],
      description: 'Level 8: Achieved legendary status in life mastery'
    }
  },
  
  9: { // Hero - Truly heroic presence
    requiredLevel: 9,
    title: 'Hero',
    picture: {
      id: 'hero_planet',
      name: 'World Shaper',
      icon: 'planet-outline',
      colorScheme: LEVEL_COLOR_SCHEMES[9],
      description: 'Level 9: Influencing the world around you'
    }
  },
  
  10: { // Immortal - Transcendent and eternal
    requiredLevel: 10,
    title: 'Immortal',
    picture: {
      id: 'immortal_sun',
      name: 'Solar Immortal',
      icon: 'sunny-outline',
      colorScheme: LEVEL_COLOR_SCHEMES[10],
      description: 'Level 10: Radiating immortal brilliance'
    }
  },
  
  11: { // Ascendant - Beyond mortal limits
    requiredLevel: 11,
    title: 'Ascendant',
    picture: {
      id: 'ascendant_wings',
      name: 'Ascending Wings',
      icon: 'airplane-outline',
      colorScheme: LEVEL_COLOR_SCHEMES[11],
      description: 'Level 11: Rising above all limitations'
    }
  },
  
  12: { // Eternal - The ultimate achievement
    requiredLevel: 12,
    title: 'Eternal',
    picture: {
      id: 'eternal_cosmos',
      name: 'Cosmic Eternal',
      icon: 'globe-outline',
      colorScheme: LEVEL_COLOR_SCHEMES[12],
      description: 'Level 12: Master of infinite dimensions'
    }
  }
};

// Function to get available profile pictures for a user's current level
export const getAvailableProfilePictures = (userLevel) => {
  const available = [];
  
  // Add pictures from levels 1 through user's current level (one per level)
  for (let level = 1; level <= userLevel && level <= 12; level++) {
    if (LEVEL_PROFILE_PICTURES[level] && LEVEL_PROFILE_PICTURES[level].picture) {
      available.push({
        ...LEVEL_PROFILE_PICTURES[level].picture,
        requiredLevel: level
      });
    }
  }
  
  return available;
};

// Function to get locked profile pictures (for curiosity building)
export const getLockedProfilePictures = (userLevel) => {
  const locked = [];
  
  // Add pictures from levels above user's current level (one per level)
  for (let level = userLevel + 1; level <= 12; level++) {
    if (LEVEL_PROFILE_PICTURES[level] && LEVEL_PROFILE_PICTURES[level].picture) {
      locked.push({
        ...LEVEL_PROFILE_PICTURES[level].picture,
        isLocked: true,
        requiredLevel: level
      });
    }
  }
  
  return locked;
};

// Function to check if user can use custom photos
export const canUseCustomPhotos = (userLevel) => {
  return userLevel >= 2; // Intermediate level (when custom photo feature is unlocked)
};

// Function to get the next unlock level for motivation
export const getNextUnlockInfo = (userLevel) => {
  const nextLevel = userLevel + 1;
  if (nextLevel <= 12 && LEVEL_PROFILE_PICTURES[nextLevel]) {
    return {
      level: nextLevel,
      title: LEVEL_PROFILE_PICTURES[nextLevel].title,
      picture: LEVEL_PROFILE_PICTURES[nextLevel].picture
    };
  }
  return null;
};
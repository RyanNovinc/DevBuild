// src/screens/ProfileScreen/constants.js
// Optimized color palette for 8 life domains based on color psychology research

export const DOMAIN_COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#FFC107', // Amber
  '#9C27B0', // Purple
  '#F44336', // Red
  '#FF9800', // Orange
  '#795548', // Brown
  '#607D8B', // Blue-Grey
];

// Theme colors for app customization
export const THEME_COLORS = [
  '#4CAF50', // Green (default)
  '#2196F3', // Blue
  '#FF9800', // Orange
  '#E91E63', // Pink
  '#9C27B0', // Purple
  '#F44336', // Red
  '#3F51B5', // Indigo
  '#009688', // Teal
  '#607D8B', // Blue Gray
  '#795548'  // Brown
];

/**
 * OPTIMIZED LIFE DOMAINS FOR SYSTEM-DRIVEN ACHIEVERS
 * 
 * This palette is based on extensive research on color psychology
 * for productivity apps targeting 28-45 year old professionals.
 * Each color is selected to evoke specific psychological responses
 * while maintaining visual harmony in the Domain Balance Wheel.
 */
export const STANDARD_DOMAINS = {
  // Domain 1: Career & Professional Growth
  'briefcase': {
    name: 'Career & Work',
    icon: 'briefcase',
    color: '#3B82F6', // Medium Blue - matches Domain Balance Wheel
    description: 'Professional goals, business ventures, leadership, skills development'
  },
  'business': { name: 'Career & Work', icon: 'briefcase', color: '#3B82F6', description: 'Professional goals, business ventures, leadership, skills development' },
  'trophy': { name: 'Career & Work', icon: 'briefcase', color: '#3B82F6', description: 'Professional goals, business ventures, leadership, skills development' },
  'podium': { name: 'Career & Work', icon: 'briefcase', color: '#3B82F6', description: 'Professional goals, business ventures, leadership, skills development' },
  'trending-up': { name: 'Career & Work', icon: 'briefcase', color: '#3B82F6', description: 'Professional goals, business ventures, leadership, skills development' },
  
  // Domain 2: Financial Security & Wealth
  'cash': {
    name: 'Financial Security',
    icon: 'cash',
    color: '#EAB308', // Medium Gold - matches Domain Balance Wheel
    description: 'Money management, investments, financial independence, wealth building'
  },
  'wallet': { name: 'Financial Security', icon: 'cash', color: '#EAB308', description: 'Money management, investments, financial independence, wealth building' },
  'card': { name: 'Financial Security', icon: 'cash', color: '#EAB308', description: 'Money management, investments, financial independence, wealth building' },
  'calculator': { name: 'Financial Security', icon: 'cash', color: '#EAB308', description: 'Money management, investments, financial independence, wealth building' },
  'stats-chart': { name: 'Financial Security', icon: 'cash', color: '#EAB308', description: 'Money management, investments, financial independence, wealth building' },
  
  // Domain 3: Health & Wellness
  'fitness': {
    name: 'Health & Wellness',
    icon: 'fitness',
    color: '#22C55E', // Medium Green - matches Domain Balance Wheel
    description: 'Physical wellbeing, nutrition, exercise, sleep, energy management'
  },
  'pulse': { name: 'Health & Wellness', icon: 'fitness', color: '#22C55E', description: 'Physical wellbeing, nutrition, exercise, sleep, energy management' },
  'bicycle': { name: 'Recreation & Leisure', icon: 'bicycle', color: '#8B5CF6', description: 'Hobbies, travel, leisure, entertainment, relaxation, stress prevention' },
  'nutrition': { name: 'Health & Wellness', icon: 'fitness', color: '#22C55E', description: 'Physical wellbeing, nutrition, exercise, sleep, energy management' },
  'medkit': { name: 'Health & Wellness', icon: 'fitness', color: '#22C55E', description: 'Physical wellbeing, nutrition, exercise, sleep, energy management' },
  
  // Domain 4: Relationships
  'people': {
    name: 'Relationships',
    icon: 'people',
    color: '#EC4899', // Medium Pink - matches Domain Balance Wheel
    description: 'Family, friendships, romantic partnerships, social networks, community'
  },
  'heart': { name: 'Relationships', icon: 'people', color: '#EC4899', description: 'Family, friendships, romantic partnerships, social networks, community' },
  'chatbubbles': { name: 'Relationships', icon: 'people', color: '#EC4899', description: 'Family, friendships, romantic partnerships, social networks, community' },
  'person': { name: 'Relationships', icon: 'people', color: '#EC4899', description: 'Family, friendships, romantic partnerships, social networks, community' },
  'people-circle': { name: 'Relationships', icon: 'people', color: '#EC4899', description: 'Family, friendships, romantic partnerships, social networks, community' },
  
  // Domain 5: Personal Growth
  'school': {
    name: 'Personal Growth',
    icon: 'school',
    color: '#F97316', // Medium Orange - matches Domain Balance Wheel
    description: 'Education, skill development, intellectual curiosity, personal development'
  },
  'book': { name: 'Personal Growth', icon: 'school', color: '#F97316', description: 'Education, skill development, intellectual curiosity, personal development' },
  'library': { name: 'Personal Growth', icon: 'school', color: '#F97316', description: 'Education, skill development, intellectual curiosity, personal development' },
  'bulb': { name: 'Personal Growth', icon: 'school', color: '#F97316', description: 'Education, skill development, intellectual curiosity, personal development' },
  'create': { name: 'Personal Growth', icon: 'school', color: '#F97316', description: 'Education, skill development, intellectual curiosity, personal development' },
  
  // Domain 6: Purpose & Meaning
  'compass': {
    name: 'Purpose & Meaning',
    icon: 'compass',
    color: '#EF4444', // Medium Red - matches Domain Balance Wheel
    description: 'Values alignment, contribution, meaning, legacy, social impact'
  },
  'earth': { name: 'Purpose & Meaning', icon: 'compass', color: '#EF4444', description: 'Values alignment, contribution, meaning, legacy, social impact' },
  'globe': { name: 'Purpose & Meaning', icon: 'compass', color: '#EF4444', description: 'Values alignment, contribution, meaning, legacy, social impact' },
  'leaf': { name: 'Purpose & Meaning', icon: 'compass', color: '#EF4444', description: 'Values alignment, contribution, meaning, legacy, social impact' },
  'hand-left': { name: 'Purpose & Meaning', icon: 'compass', color: '#EF4444', description: 'Values alignment, contribution, meaning, legacy, social impact' },
  'megaphone': { name: 'Purpose & Meaning', icon: 'compass', color: '#EF4444', description: 'Values alignment, contribution, meaning, legacy, social impact' },
  
  // Domain 7: Community & Environment
  'home': {
    name: 'Community & Environment',
    icon: 'home',
    color: '#06B6D4', // Medium Teal - matches Domain Balance Wheel
    description: 'Living spaces, neighborhood quality, civic engagement, environmental sustainability'
  },
  'laptop': { name: 'Community & Environment', icon: 'home', color: '#06B6D4', description: 'Living spaces, neighborhood quality, civic engagement, environmental sustainability' },
  'desktop': { name: 'Community & Environment', icon: 'home', color: '#06B6D4', description: 'Living spaces, neighborhood quality, civic engagement, environmental sustainability' },
  'phone-portrait': { name: 'Community & Environment', icon: 'home', color: '#06B6D4', description: 'Living spaces, neighborhood quality, civic engagement, environmental sustainability' },
  'code': { name: 'Community & Environment', icon: 'home', color: '#06B6D4', description: 'Living spaces, neighborhood quality, civic engagement, environmental sustainability' },
  'analytics': { name: 'Community & Environment', icon: 'home', color: '#06B6D4', description: 'Living spaces, neighborhood quality, civic engagement, environmental sustainability' },
  
  // Domain 8: Recreation & Leisure
  'bicycle': {
    name: 'Recreation & Leisure',
    icon: 'bicycle',
    color: '#8B5CF6', // Medium Purple - matches Domain Balance Wheel
    description: 'Hobbies, travel, leisure, entertainment, relaxation, stress prevention'
  },
  'happy': { name: 'Recreation & Leisure', icon: 'bicycle', color: '#8B5CF6', description: 'Hobbies, travel, leisure, entertainment, relaxation, stress prevention' },
  'airplane': { name: 'Recreation & Leisure', icon: 'bicycle', color: '#8B5CF6', description: 'Hobbies, travel, leisure, entertainment, relaxation, stress prevention' },
  'restaurant': { name: 'Recreation & Leisure', icon: 'bicycle', color: '#8B5CF6', description: 'Hobbies, travel, leisure, entertainment, relaxation, stress prevention' },
  'musical-note': { name: 'Recreation & Leisure', icon: 'bicycle', color: '#8B5CF6', description: 'Hobbies, travel, leisure, entertainment, relaxation, stress prevention' },
  'game-controller': { name: 'Recreation & Leisure', icon: 'bicycle', color: '#8B5CF6', description: 'Hobbies, travel, leisure, entertainment, relaxation, stress prevention' },
  
  // Custom domain as fallback
  'star': {
    name: 'Custom',
    icon: 'star',
    color: '#6B7280', // Neutral Gray
    description: 'Custom goals that don\'t fit other categories'
  }
};

// Get all unique domain names
export const getUniqueDomainNames = () => {
  const uniqueDomains = new Set();
  
  Object.values(STANDARD_DOMAINS).forEach(domain => {
    uniqueDomains.add(domain.name);
  });
  
  return Array.from(uniqueDomains);
};

// Get domain by name
export const getDomainByName = (name) => {
  if (!name) return null;
  
  // Find the first domain object that matches the name
  for (const key in STANDARD_DOMAINS) {
    if (STANDARD_DOMAINS[key].name.toLowerCase() === name.toLowerCase()) {
      return STANDARD_DOMAINS[key];
    }
  }
  
  return null;
};

// Get domain by icon
export const getDomainByIcon = (icon) => {
  if (!icon) return 'Custom';
  
  const domain = STANDARD_DOMAINS[icon.toLowerCase()];
  return domain ? domain.name : 'Custom';
};

// Get domain color by name
export const getDomainColor = (name) => {
  const domain = getDomainByName(name);
  return domain ? domain.color : '#6B7280'; // Default gray
};

// Get domain icon by name
export const getDomainIcon = (name) => {
  const domain = getDomainByName(name);
  return domain ? domain.icon : 'star'; // Default star
};

// Color psychology rationale for each domain
export const DOMAIN_COLOR_RATIONALE = {
  'Career & Work': 'Blue (#3B82F6) evokes trust, reliability and professionalism. Research shows blue improves concentration and productivity, making it ideal for career-focused goals. For System-Driven Achievers, this creates mental clarity and focus.',
  
  'Financial Security': 'Gold (#EAB308) has strong associations with wealth, abundance, and prosperity. Studies show gold reduces anxiety around financial decisions while promoting feelings of security and stability.',
  
  'Health & Wellness': 'Green (#22C55E) stimulates growth, vitality and well-being. This energetic color promotes feelings of health and renewal, making it perfect for fitness goals and wellness tracking. The vibrant green motivates healthy lifestyle choices.',
  
  'Relationships': 'Pink (#EC4899) represents compassion, nurturing and emotional connection. This color encourages empathy and openness in relationships. Research shows pink reduces aggression and promotes cooperative behavior.',
  
  'Personal Growth': 'Orange (#F97316) traditionally symbolizes creativity, enthusiasm and transformation. Studies show orange stimulates problem-solving and creative thinking, making it ideal for intellectual pursuits and personal development.',
  
  'Purpose & Meaning': 'Red (#EF4444) evokes passion, purpose and determination. This powerful color creates feelings of drive and conviction, perfect for goals related to contribution, meaning and values alignment.',
  
  'Community & Environment': 'Teal (#06B6D4) combines blue\'s trustworthiness with green\'s growth associations. This balanced color evokes clarity of purpose and sustainable impact, perfect for community and environmental goals.',
  
  'Recreation & Leisure': 'Purple (#8B5CF6) stimulates creativity, imagination and joy. Research shows purple encourages relaxation and creative expression, producing an energizing and rejuvenating effect ideal for leisure and recreational activities.'
};
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
    name: 'Career & Professional Growth',
    icon: 'briefcase',
    color: '#2563EB', // Bold Blue
    description: 'Professional goals, business ventures, leadership, skills development'
  },
  'business': { name: 'Career & Professional Growth', icon: 'briefcase', color: '#2563EB', description: 'Professional goals, business ventures, leadership, skills development' },
  'trophy': { name: 'Career & Professional Growth', icon: 'briefcase', color: '#2563EB', description: 'Professional goals, business ventures, leadership, skills development' },
  'podium': { name: 'Career & Professional Growth', icon: 'briefcase', color: '#2563EB', description: 'Professional goals, business ventures, leadership, skills development' },
  'trending-up': { name: 'Career & Professional Growth', icon: 'briefcase', color: '#2563EB', description: 'Professional goals, business ventures, leadership, skills development' },
  
  // Domain 2: Financial Security & Wealth
  'wallet': {
    name: 'Financial Security & Wealth',
    icon: 'wallet',
    color: '#10B981', // Emerald Green
    description: 'Money management, investments, financial independence, wealth building'
  },
  'cash': { name: 'Financial Security & Wealth', icon: 'wallet', color: '#10B981', description: 'Money management, investments, financial independence, wealth building' },
  'card': { name: 'Financial Security & Wealth', icon: 'wallet', color: '#10B981', description: 'Money management, investments, financial independence, wealth building' },
  'calculator': { name: 'Financial Security & Wealth', icon: 'wallet', color: '#10B981', description: 'Money management, investments, financial independence, wealth building' },
  'stats-chart': { name: 'Financial Security & Wealth', icon: 'wallet', color: '#10B981', description: 'Money management, investments, financial independence, wealth building' },
  
  // Domain 3: Health & Energy
  'fitness': {
    name: 'Health & Energy',
    icon: 'fitness',
    color: '#EF4444', // Energetic Red
    description: 'Physical wellbeing, nutrition, exercise, sleep, energy management'
  },
  'pulse': { name: 'Health & Energy', icon: 'fitness', color: '#EF4444', description: 'Physical wellbeing, nutrition, exercise, sleep, energy management' },
  'bicycle': { name: 'Health & Energy', icon: 'fitness', color: '#EF4444', description: 'Physical wellbeing, nutrition, exercise, sleep, energy management' },
  'nutrition': { name: 'Health & Energy', icon: 'fitness', color: '#EF4444', description: 'Physical wellbeing, nutrition, exercise, sleep, energy management' },
  'medkit': { name: 'Health & Energy', icon: 'fitness', color: '#EF4444', description: 'Physical wellbeing, nutrition, exercise, sleep, energy management' },
  
  // Domain 4: Relationships & Connection
  'people': {
    name: 'Relationships & Connection',
    icon: 'people',
    color: '#EC4899', // Vibrant Pink
    description: 'Family, friendships, romantic partnerships, social networks, community'
  },
  'heart': { name: 'Relationships & Connection', icon: 'people', color: '#EC4899', description: 'Family, friendships, romantic partnerships, social networks, community' },
  'chatbubbles': { name: 'Relationships & Connection', icon: 'people', color: '#EC4899', description: 'Family, friendships, romantic partnerships, social networks, community' },
  'person': { name: 'Relationships & Connection', icon: 'people', color: '#EC4899', description: 'Family, friendships, romantic partnerships, social networks, community' },
  'people-circle': { name: 'Relationships & Connection', icon: 'people', color: '#EC4899', description: 'Family, friendships, romantic partnerships, social networks, community' },
  
  // Domain 5: Learning & Growth
  'school': {
    name: 'Learning & Growth',
    icon: 'school',
    color: '#8B5CF6', // Rich Purple
    description: 'Education, skill development, intellectual curiosity, personal development'
  },
  'book': { name: 'Learning & Growth', icon: 'school', color: '#8B5CF6', description: 'Education, skill development, intellectual curiosity, personal development' },
  'library': { name: 'Learning & Growth', icon: 'school', color: '#8B5CF6', description: 'Education, skill development, intellectual curiosity, personal development' },
  'bulb': { name: 'Learning & Growth', icon: 'school', color: '#8B5CF6', description: 'Education, skill development, intellectual curiosity, personal development' },
  'create': { name: 'Learning & Growth', icon: 'school', color: '#8B5CF6', description: 'Education, skill development, intellectual curiosity, personal development' },
  
  // Domain 6: Purpose & Impact
  'earth': {
    name: 'Purpose & Impact',
    icon: 'earth',
    color: '#0D9488', // Deep Teal
    description: 'Values alignment, contribution, meaning, legacy, social impact'
  },
  'globe': { name: 'Purpose & Impact', icon: 'earth', color: '#0D9488', description: 'Values alignment, contribution, meaning, legacy, social impact' },
  'leaf': { name: 'Purpose & Impact', icon: 'earth', color: '#0D9488', description: 'Values alignment, contribution, meaning, legacy, social impact' },
  'hand-left': { name: 'Purpose & Impact', icon: 'earth', color: '#0D9488', description: 'Values alignment, contribution, meaning, legacy, social impact' },
  'megaphone': { name: 'Purpose & Impact', icon: 'earth', color: '#0D9488', description: 'Values alignment, contribution, meaning, legacy, social impact' },
  
  // Domain 7: Digital Wellbeing & Innovation
  'laptop': {
    name: 'Digital Wellbeing & Innovation',
    icon: 'laptop',
    color: '#3B82F6', // Bright Blue
    description: 'Technology boundaries, digital productivity, innovation adoption, AI tools'
  },
  'desktop': { name: 'Digital Wellbeing & Innovation', icon: 'laptop', color: '#3B82F6', description: 'Technology boundaries, digital productivity, innovation adoption, AI tools' },
  'phone-portrait': { name: 'Digital Wellbeing & Innovation', icon: 'laptop', color: '#3B82F6', description: 'Technology boundaries, digital productivity, innovation adoption, AI tools' },
  'code': { name: 'Digital Wellbeing & Innovation', icon: 'laptop', color: '#3B82F6', description: 'Technology boundaries, digital productivity, innovation adoption, AI tools' },
  'analytics': { name: 'Digital Wellbeing & Innovation', icon: 'laptop', color: '#3B82F6', description: 'Technology boundaries, digital productivity, innovation adoption, AI tools' },
  
  // Domain 8: Recreation & Renewal
  'happy': {
    name: 'Recreation & Renewal',
    icon: 'happy',
    color: '#F59E0B', // Warm Orange
    description: 'Hobbies, travel, leisure, entertainment, relaxation, stress prevention'
  },
  'airplane': { name: 'Recreation & Renewal', icon: 'happy', color: '#F59E0B', description: 'Hobbies, travel, leisure, entertainment, relaxation, stress prevention' },
  'restaurant': { name: 'Recreation & Renewal', icon: 'happy', color: '#F59E0B', description: 'Hobbies, travel, leisure, entertainment, relaxation, stress prevention' },
  'musical-note': { name: 'Recreation & Renewal', icon: 'happy', color: '#F59E0B', description: 'Hobbies, travel, leisure, entertainment, relaxation, stress prevention' },
  'game-controller': { name: 'Recreation & Renewal', icon: 'happy', color: '#F59E0B', description: 'Hobbies, travel, leisure, entertainment, relaxation, stress prevention' },
  
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
  'Career & Professional Growth': 'Blue (#2563EB) evokes trust, reliability and professionalism. Research shows blue improves concentration and productivity, making it ideal for career-focused goals. For System-Driven Achievers, this creates mental clarity and focus.',
  
  'Financial Security & Wealth': 'Green (#10B981) has strong associations with wealth, abundance, and growth. Studies show green reduces anxiety around financial decisions while promoting feelings of security and stability.',
  
  'Health & Energy': 'Red (#EF4444) stimulates energy and physical vitality. This energetic color increases heart rate and respiration, making it perfect for fitness goals and health tracking. The vibrant red motivates action and physical engagement.',
  
  'Relationships & Connection': 'Pink (#EC4899) represents compassion, nurturing and emotional connection. This color encourages empathy and openness in relationships. Research shows pink reduces aggression and promotes cooperative behavior.',
  
  'Learning & Growth': 'Purple (#8B5CF6) traditionally symbolizes wisdom, creativity and transformation. Studies show purple stimulates problem-solving and creative thinking, making it ideal for intellectual pursuits and personal development.',
  
  'Purpose & Impact': 'Teal (#0D9488) combines blue\'s trustworthiness with green\'s growth associations. This balanced color evokes clarity of purpose and sustainable impact, perfect for goals related to contribution and meaning.',
  
  'Digital Wellbeing & Innovation': 'Bright Blue (#3B82F6) represents technology, innovation and communication. This modern blue variation creates feelings of efficiency and forward-thinking while maintaining a sense of calm control around technology.',
  
  'Recreation & Renewal': 'Orange (#F59E0B) stimulates enthusiasm, creativity and joy. Research shows orange increases oxygen supply to the brain, producing an energizing and rejuvenating effect ideal for leisure and recreational activities.'
};
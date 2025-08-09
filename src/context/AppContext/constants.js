// src/context/AppContext/constants.js
// Extracted constants from AppContext.js

// Storage keys for app data
export const STORAGE_KEYS = {
  LIFE_DIRECTION: 'lifeDirection',
  GOALS: 'goals',
  PROJECTS: 'projects',
  TIME_BLOCKS: 'timeBlocks',
  DOMAINS: 'domains',
  SETTINGS: 'settings',
  TAGS: 'tags',
  NOTES: 'notes',
  FILTERS: 'filters',
  USER_PROFILE: 'userProfile',
  TASKS: 'tasks',
  // Todo storage keys
  TODOS: 'todos',
  TOMORROW_TODOS: 'tomorrowTodos',
  LATER_TODOS: 'laterTodos',
  // Additional keys
  PROJECT_GOAL_LINK_MAP: 'projectGoalLinkMap',
  USER_COUNTRY: 'userCountry'
};

// Default app settings
export const DEFAULT_SETTINGS = {
  onboardingCompleted: false,
  reminderEnabled: true,
  reminderTime: '09:00',
  darkMode: false,
  notificationsEnabled: true,
  userProfile: {
    name: '',
    email: '',
    bio: '',
    profileImage: null
  },
  lifeDirection: '',
  userCountry: null
};

// Domain color and icon mappings
export const DOMAIN_COLORS = {
  'health': '#4CAF50',
  'business': '#3F51B5',
  'finance': '#009688',
  'relationships': '#E91E63',
  'social': '#E91E63', // Added alias
  'education': '#673AB7',
  'knowledge': '#2196F3',
  'wellbeing': '#FF9800',
  'joy': '#FFC107',
  'home': '#795548',
  'travel': '#00BCD4',
  'achievement': '#F44336'
};

export const DOMAIN_ICONS = {
  'health': 'fitness',
  'business': 'business',
  'finance': 'wallet',
  'relationships': 'people',
  'social': 'people', // Added alias
  'education': 'school',
  'knowledge': 'book',
  'wellbeing': 'heart',
  'joy': 'happy',
  'home': 'home',
  'travel': 'earth',
  'achievement': 'trophy'
};

// Default domain color and icon
export const DEFAULT_DOMAIN_COLOR = '#607D8B';
export const DEFAULT_DOMAIN_ICON = 'star';
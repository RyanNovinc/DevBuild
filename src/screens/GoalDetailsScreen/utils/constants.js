// src/screens/GoalDetailsScreen/utils/constants.js

/**
 * Goal icons with labels for domains
 * Each icon represents a life domain
 */
export const goalIcons = [
  { name: 'business', label: 'Business' },
  { name: 'wallet', label: 'Finance' },
  { name: 'fitness', label: 'Health' },
  { name: 'people', label: 'Social' }, // Shortened from 'Relationships' to 'Social'
  { name: 'school', label: 'Education' },
  { name: 'book', label: 'Knowledge' },
  { name: 'heart', label: 'Wellbeing' },
  { name: 'happy', label: 'Joy' },
  { name: 'home', label: 'Home' },
  { name: 'earth', label: 'Travel' },
  { name: 'trophy', label: 'Achievement' },
  { name: 'star', label: 'Other' } // Moved to end and renamed
];

/**
 * Enhanced goal colors with black and white options
 * Organized by color families for better selection
 */
export const goalColors = [
  // Monochrome colors
  '#000000', // Black
  '#333333', // Dark Gray
  '#777777', // Medium Gray
  '#CCCCCC', // Light Gray
  '#FFFFFF', // White
  
  // Red & Pink family
  '#F44336', // Red
  '#E91E63', // Pink
  '#9C27B0', // Purple
  
  // Blue family
  '#673AB7', // Deep Purple
  '#3F51B5', // Indigo
  '#2196F3', // Blue
  '#03A9F4', // Light Blue
  '#00BCD4', // Cyan
  
  // Green family
  '#009688', // Teal
  '#4CAF50', // Green
  '#8BC34A', // Light Green
  '#CDDC39', // Lime
  
  // Yellow & Orange family
  '#FFEB3B', // Yellow
  '#FFC107', // Amber
  '#FF9800', // Orange
  '#FF5722', // Deep Orange
  
  // Brown & Gray family
  '#795548', // Brown
  '#607D8B'  // Blue Grey
];

/**
 * Notification preferences
 * Each preference has an ID, label, icon, and description
 */
export const notificationPreferences = [
  { 
    id: 'exact', 
    label: 'At start time', 
    icon: 'alarm-outline', 
    description: 'Get notified exactly at the scheduled start time' 
  },
  { 
    id: '15min', 
    label: '15 minutes before', 
    icon: 'time-outline', 
    description: 'Get notified 15 minutes before scheduled time' 
  },
  { 
    id: '30min', 
    label: '30 minutes before', 
    icon: 'time-outline', 
    description: 'Get notified 30 minutes before scheduled time' 
  },
  { 
    id: '1hour', 
    label: '1 hour before', 
    icon: 'alarm-outline', 
    description: 'Get notified 1 hour before scheduled time' 
  },
  { 
    id: '1day', 
    label: '1 day before', 
    icon: 'calendar-outline', 
    description: 'Get notified 1 day before scheduled time' 
  }
];

/**
 * Share formats for goal sharing
 */
export const shareFormats = [
  {
    id: 'simple',
    label: 'Simple',
    description: 'Basic goal details without task information'
  },
  {
    id: 'detailed',
    label: 'Detailed',
    description: 'Complete goal information including tasks'
  }
];

/**
 * Domain colors mapping
 * Maps domain names to their default colors
 */
export const domainColors = {
  'Business': '#3F51B5',
  'Finance': '#009688',
  'Health': '#4CAF50',
  'Social': '#E91E63',
  'Education': '#673AB7',
  'Knowledge': '#2196F3',
  'Wellbeing': '#FF9800',
  'Joy': '#FFC107',
  'Home': '#795548',
  'Travel': '#00BCD4',
  'Achievement': '#F44336',
  'General': '#607D8B',
  'Other': '#607D8B'
};
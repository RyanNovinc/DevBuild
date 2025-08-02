// src/context/ThemeContext/themes.js
// Enhanced theme definitions with responsive and accessibility values

import { 
  scaleFontSize, 
  scaleWidth, 
  scaleHeight, 
  isSmallDevice,
  isMediumDevice, 
  isLargeDevice, 
  isTablet,
  spacing as defaultSpacing,
  fontSizes as defaultFontSizes,
  getByDeviceSize,
  accessibility,
  getContrastRatio,
  meetsContrastRequirements
} from '../../utils/responsive';

/**
 * Responsive spacing scale that adapts to device size
 */
export const spacing = {
  ...defaultSpacing,
  // Additional specific spacing values
  xxs: scaleWidth(2),
  xxxs: scaleWidth(1),
  // Component-specific spacing
  gutter: isSmallDevice ? scaleWidth(12) : scaleWidth(16),
  screenPadding: getByDeviceSize({
    small: scaleWidth(12),
    medium: scaleWidth(16),
    large: scaleWidth(20),
    tablet: scaleWidth(24)
  })
};

/**
 * Responsive font sizes that adapt to device size
 */
export const fontSizes = {
  ...defaultFontSizes,
  // Component-specific font sizes
  button: {
    small: scaleFontSize(12),
    medium: scaleFontSize(14),
    large: scaleFontSize(16)
  },
  heading: {
    h1: scaleFontSize(28),
    h2: scaleFontSize(24),
    h3: scaleFontSize(20),
    h4: scaleFontSize(18)
  },
  // Accessible font sizes - sized larger for readability
  accessible: {
    small: scaleFontSize(14), // Minimum 14px for readable text
    medium: scaleFontSize(16),
    large: scaleFontSize(20),
    xlarge: scaleFontSize(24)
  }
};

/**
 * Responsive metrics for consistent component sizing
 */
export const metrics = {
  borderRadius: {
    xs: scaleWidth(4),
    s: scaleWidth(8),
    m: scaleWidth(12),
    l: scaleWidth(16),
    xl: scaleWidth(24),
    circular: 9999
  },
  iconSize: {
    xs: scaleWidth(14),
    s: scaleWidth(18),
    m: scaleWidth(22),
    l: scaleWidth(28),
    xl: scaleWidth(36)
  },
  component: {
    // Ensure buttons meet minimum touch target size of 44x44 for accessibility
    buttonHeight: {
      small: Math.max(scaleHeight(32), accessibility.minTouchTarget),
      medium: Math.max(scaleHeight(44), accessibility.minTouchTarget), // iOS standard
      large: Math.max(scaleHeight(54), accessibility.minTouchTarget)
    },
    buttonMinWidth: {
      small: Math.max(scaleWidth(60), accessibility.minTouchTarget),
      medium: Math.max(scaleWidth(80), accessibility.minTouchTarget),
      large: Math.max(scaleWidth(100), accessibility.minTouchTarget)
    },
    inputHeight: Math.max(scaleHeight(44), accessibility.minTouchTarget),
    headerHeight: scaleHeight(56),
    tabBarHeight: isSmallDevice ? scaleHeight(49) : scaleHeight(55),
    cardPadding: spacing.m,
    // Minimum touch target size for interactive elements (Apple HIG)
    minTouchTarget: accessibility.minTouchTarget
  }
};

// Accessibility color pairs - guaranteed to meet WCAG 2.1 AA contrast requirements (4.5:1)
const accessibleColorPairs = {
  black: {
    background: '#000000',
    text: '#FFFFFF', // White text on black background - ratio: 21:1
    accent: '#00E5FF' // Cyan accent on black - ratio: 7.5:1
  },
  white: {
    background: '#FFFFFF',
    text: '#000000', // Black text on white background - ratio: 21:1
    accent: '#0066CC' // Blue accent on white - ratio: 4.6:1
  },
  darkGray: {
    background: '#333333',
    text: '#FFFFFF', // White text on dark gray - ratio: 12.6:1
    accent: '#4ECDC4' // Teal accent on dark gray - ratio: 4.8:1
  },
  lightGray: {
    background: '#F5F5F5',
    text: '#121212', // Near black text on light gray - ratio: 16.5:1
    accent: '#0066CC' // Blue accent on light gray - ratio: 4.8:1
  }
};

/**
 * Light theme - minimalist black and white with better contrast
 * Enhanced with responsive values and accessibility considerations
 */
export const lightTheme = {
  // Original color values
  primary: '#000000',         // Black
  primaryDark: '#333333',     // Dark gray
  secondary: '#555555',       // Medium gray
  accent: '#777777',          // Light gray
  background: '#FFFFFF',      // White
  card: '#F8F8F8',            // Very light gray
  text: '#000000',            // Black
  textSecondary: '#555555',   // Medium gray
  border: '#DDDDDD',          // Slightly darker light gray border for better visibility
  error: '#D32F2F',           // Slightly darker red for better contrast
  success: '#000000',         // Black
  warning: '#333333',         // Dark gray
  info: '#555555',            // Medium gray
  
  // Text colors for elements on colored backgrounds
  primaryContrast: '#FFFFFF', // White text on black backgrounds
  errorLight: '#FFCDD2',      // Light red for error borders
  statusBar: '#000000',       // Status bar color
  
  // For certain components like profiles/cards that need text contrast
  cardElevated: '#F0F0F0',    // Slightly darker card for elevation

  // Domain colors - monochromatic with better contrast
  domains: {
    business: '#000000',      // Black
    finance: '#222222',       // Almost black
    health: '#333333',        // Dark gray
    relationships: '#444444', // Gray
    personalGrowth: '#555555', // Medium gray
    recreation: '#666666',    // Medium-light gray
    contribution: '#777777',  // Light gray
    spirituality: '#888888',  // Very light gray
  },
  
  // ===== ACCESSIBILITY ENHANCEMENTS =====
  
  // WCAG 2.1 AA compliant color pairs
  a11y: {
    ...accessibleColorPairs,
    // Function to get accessible text color for any background
    getTextColor: (backgroundColor) => {
      // Default options for text colors
      const blackText = '#000000';
      const whiteText = '#FFFFFF';
      
      // Calculate contrast ratios
      const blackContrast = getContrastRatio(backgroundColor, blackText);
      const whiteContrast = getContrastRatio(backgroundColor, whiteText);
      
      // Return the color with the highest contrast ratio
      return (blackContrast > whiteContrast) ? blackText : whiteText;
    },
    // Check if a color combination meets WCAG contrast guidelines
    meetsContrast: meetsContrastRequirements
  },
  
  // Responsive spacing scale
  spacing,
  
  // Responsive font sizes
  fontSize: fontSizes,
  
  // Responsive metrics
  metrics,
  
  // Responsive styles for specific components
  components: {
    button: {
      paddingVertical: spacing.s,
      paddingHorizontal: spacing.m,
      borderRadius: metrics.borderRadius.s,
      fontSize: fontSizes.m,
      // Minimum height for touch target accessibility
      minHeight: metrics.component.minTouchTarget,
      minWidth: metrics.component.minTouchTarget
    },
    card: {
      padding: spacing.m,
      borderRadius: metrics.borderRadius.m,
      marginBottom: spacing.m
    },
    input: {
      height: metrics.component.inputHeight,
      paddingHorizontal: spacing.m,
      borderRadius: metrics.borderRadius.s,
      fontSize: fontSizes.m
    },
    header: {
      height: metrics.component.headerHeight,
      paddingHorizontal: spacing.m
    },
    // Focus indicators for keyboard navigation
    focus: {
      borderColor: '#0066CC',
      borderWidth: 2,
      outlineWidth: 0
    }
  },
  
  // Helper responsive functions
  getScaledSize: (size) => scaleWidth(size),
  getScaledFontSize: (size) => scaleFontSize(size),
  getScaledHeight: (size) => scaleHeight(size)
};

/**
 * Dark theme - inverted color scheme with better contrast
 * Enhanced with responsive values and accessibility considerations
 */
export const darkTheme = {
  // Original color values
  primary: '#FFFFFF',         // White
  primaryDark: '#EEEEEE',     // Very light gray
  secondary: '#CCCCCC',       // Light gray
  accent: '#AAAAAA',          // Medium gray
  background: '#000000',      // Black
  card: '#1A1A1A',            // Slightly lighter than before for better visibility
  text: '#FFFFFF',            // White
  textSecondary: '#CCCCCC',   // Light gray
  border: '#333333',          // Slightly lighter dark gray border for better visibility
  error: '#FF5252',           // Red
  success: '#FFFFFF',         // White
  warning: '#EEEEEE',         // Very light gray
  info: '#CCCCCC',            // Light gray
  
  // Text colors for elements on colored backgrounds
  primaryContrast: '#000000', // Black text on white backgrounds 
  errorLight: '#660000',      // Dark red for error borders
  statusBar: '#000000',       // Status bar color
  
  // For certain components like profiles/cards that need text contrast
  cardElevated: '#2A2A2A',    // Slightly lighter card for elevation & better contrast

  // Domain colors - monochromatic with better contrast
  domains: {
    business: '#FFFFFF',      // White
    finance: '#EEEEEE',       // Very light gray
    health: '#DDDDDD',        // Light gray
    relationships: '#CCCCCC', // Gray
    personalGrowth: '#BBBBBB', // Medium-light gray
    recreation: '#AAAAAA',    // Medium gray
    contribution: '#999999',  // Darker gray
    spirituality: '#888888',  // Even darker gray
  },
  
  // ===== ACCESSIBILITY ENHANCEMENTS =====
  
  // WCAG 2.1 AA compliant color pairs
  a11y: {
    ...accessibleColorPairs,
    // Function to get accessible text color for any background
    getTextColor: (backgroundColor) => {
      // Default options for text colors
      const blackText = '#000000';
      const whiteText = '#FFFFFF';
      
      // Calculate contrast ratios
      const blackContrast = getContrastRatio(backgroundColor, blackText);
      const whiteContrast = getContrastRatio(backgroundColor, whiteText);
      
      // Return the color with the highest contrast ratio
      return (blackContrast > whiteContrast) ? blackText : whiteText;
    },
    // Check if a color combination meets WCAG contrast guidelines
    meetsContrast: meetsContrastRequirements
  },
  
  // Responsive spacing scale
  spacing,
  
  // Responsive font sizes
  fontSize: fontSizes,
  
  // Responsive metrics
  metrics,
  
  // Responsive styles for specific components
  components: {
    button: {
      paddingVertical: spacing.s,
      paddingHorizontal: spacing.m,
      borderRadius: metrics.borderRadius.s,
      fontSize: fontSizes.m,
      // Minimum height for touch target accessibility
      minHeight: metrics.component.minTouchTarget,
      minWidth: metrics.component.minTouchTarget
    },
    card: {
      padding: spacing.m,
      borderRadius: metrics.borderRadius.m,
      marginBottom: spacing.m
    },
    input: {
      height: metrics.component.inputHeight,
      paddingHorizontal: spacing.m,
      borderRadius: metrics.borderRadius.s,
      fontSize: fontSizes.m
    },
    header: {
      height: metrics.component.headerHeight,
      paddingHorizontal: spacing.m
    },
    // Focus indicators for keyboard navigation
    focus: {
      borderColor: '#66B2FF',
      borderWidth: 2,
      outlineWidth: 0
    }
  },
  
  // Helper responsive functions
  getScaledSize: (size) => scaleWidth(size),
  getScaledFontSize: (size) => scaleFontSize(size),
  getScaledHeight: (size) => scaleHeight(size)
};
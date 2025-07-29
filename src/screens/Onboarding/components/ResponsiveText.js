// src/screens/Onboarding/components/ResponsiveText.js
import React from 'react';
import { Text, useWindowDimensions } from 'react-native';

/**
 * ResponsiveText - A text component that scales based on device font settings
 */
const ResponsiveText = ({ 
  style, 
  children, 
  maxScaleFactor = 1.5, 
  minFontSize, 
  accessibilityRole = 'text',
  ...props 
}) => {
  const { fontScale } = useWindowDimensions();
  
  // Apply max font scaling to prevent extreme sizes
  const effectiveScale = Math.min(fontScale, maxScaleFactor);
  
  // Get base size from style or use default
  const baseSize = style?.fontSize || 14;
  const minSize = minFontSize || baseSize * 0.8; // Default min is 80% of base size
  
  // Calculate scaled size with minimum threshold
  const scaledSize = Math.max(baseSize * effectiveScale, minSize);
  
  // Apply scaling to fontSize and lineHeight
  const adjustedStyle = {
    ...style,
    fontSize: scaledSize,
    lineHeight: style?.lineHeight 
      ? Math.max(style.lineHeight * effectiveScale, scaledSize * 1.2) 
      : scaledSize * 1.3, // Default line height if none provided
  };
  
  return (
    <Text 
      style={adjustedStyle} 
      accessibilityRole={accessibilityRole}
      {...props}
    >
      {children}
    </Text>
  );
};

export default ResponsiveText;
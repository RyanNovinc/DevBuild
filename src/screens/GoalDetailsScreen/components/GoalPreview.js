// src/screens/GoalDetailsScreen/components/GoalPreview.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTextColorForBackground } from '../utils/colorUtils';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  accessibility
} from '../../../utils/responsive';

const GoalPreview = ({ 
  title, 
  selectedIcon, 
  selectedColor, 
  getTotalProgress, 
  navigateToProgressView, 
  isCreating, 
  theme 
}) => {
  // Calculate progress for display
  const progress = getTotalProgress();
  const displayTitle = title.trim() || 'Give your goal a title';
  
  // Use actual progress percentage instead of scroll-based animation
  const progressWidth = progress;
  
  // Get appropriate text color based on background
  const iconColor = selectedColor === '#FFFFFF' ? '#000000' : getTextColorForBackground(selectedColor);
  
  // Ensure accessible touch target size
  const minTouchHeight = Math.max(scaleHeight(44), accessibility.minTouchTarget);
  
  return (
    <View style={styles.previewSection}>
      <View 
        style={[
          styles.goalPreview, 
          { 
            backgroundColor: theme.backgroundSecondary || '#1A1A1A',
            borderColor: theme.border || '#333333'
          }
        ]}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel={`Goal: ${displayTitle}, Progress: ${progress}%`}
      >
        <View style={[
          styles.iconPreview, 
          { 
            backgroundColor: selectedColor,
            width: scaleWidth(80),
            height: scaleWidth(80),
            borderRadius: scaleWidth(40),
            // Add white border for black colors and black border for white colors
            borderWidth: selectedColor === '#000000' || selectedColor === '#FFFFFF' ? 2 : 0,
            borderColor: selectedColor === '#000000' ? 'rgba(255,255,255,0.5)' : 
                        selectedColor === '#FFFFFF' ? 'rgba(0,0,0,0.2)' : 'transparent'
          }
        ]}>
          <Ionicons 
            name={selectedIcon} 
            size={scaleWidth(34)} 
            color={iconColor} 
          />
        </View>
        <Text 
          style={[
            styles.previewTitle, 
            { 
              color: theme.text || '#FFFFFF',
              fontSize: fontSizes.xxl
            }
          ]}
          maxFontSizeMultiplier={1.8}
          accessibilityRole="text"
        >
          {displayTitle}
        </Text>
        
        {/* Progress Preview - Made clickable */}
        <TouchableOpacity 
          style={[styles.progressPreview, { minHeight: minTouchHeight }]}
          onPress={navigateToProgressView}
          disabled={isCreating}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Goal progress: ${progress}%. ${!isCreating ? "Double tap to view timeline." : ""}`}
          accessibilityHint={!isCreating ? "Shows detailed progress information" : ""}
          accessibilityState={{ disabled: isCreating }}
        >
          <View style={[
            styles.progressBar, 
            { backgroundColor: theme.backgroundTertiary || '#333333' }
          ]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progressWidth}%`,
                  backgroundColor: selectedColor
                }
              ]} 
              accessible={false}
            />
          </View>
          <View style={styles.progressTextRow}>
            <View style={styles.progressPercentage}>
              <Text 
                style={[
                  styles.progressText, 
                  { 
                    color: theme.text || '#FFFFFF', 
                    fontWeight: '700',
                    fontSize: fontSizes.m
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                {progress}%
              </Text>
              <Text 
                style={[
                  styles.progressLabel, 
                  { 
                    color: theme.textSecondary || '#BBBBBB',
                    fontSize: fontSizes.s
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Complete
              </Text>
            </View>
            
            {/* Added view timeline indicator */}
            {!isCreating && (
              <View style={styles.viewDetailIndicator}>
                <Text 
                  style={[
                    styles.viewDetailText, 
                    { 
                      color: selectedColor,
                      fontSize: fontSizes.s
                    }
                  ]}
                  maxFontSizeMultiplier={1.5}
                >
                  View Timeline
                </Text>
                <Ionicons 
                  name="chevron-forward" 
                  size={scaleWidth(14)} 
                  color={selectedColor} 
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  previewSection: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  goalPreview: {
    width: '100%',
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: scaleWidth(16),
    borderWidth: 1,
  },
  iconPreview: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  previewTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.l,
    textAlign: 'center',
  },
  progressPreview: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: scaleHeight(10),
    borderRadius: scaleWidth(5),
    marginBottom: spacing.s,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: scaleWidth(5),
  },
  progressTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: scaleHeight(20), // Fixed height for layout stability
  },
  progressPercentage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontWeight: '500',
    marginRight: spacing.xxs,
  },
  progressLabel: {
  },
  viewDetailIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailText: {
    fontWeight: '500',
    marginRight: spacing.xxxs,
  },
});

export default GoalPreview;
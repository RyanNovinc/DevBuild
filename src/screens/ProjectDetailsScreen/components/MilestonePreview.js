// src/screens/ProjectDetailsScreen/components/MilestonePreview.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  accessibility
} from '../../../utils/responsive';

const MilestonePreview = ({ 
  title, 
  selectedColor, 
  progress = 0,
  theme 
}) => {
  const displayTitle = title.trim() || 'Give your milestone a title';
  
  // Calculate progress width for display
  const progressWidth = Math.max(0, Math.min(100, progress));
  
  // Ensure accessible touch target size
  const minTouchHeight = Math.max(scaleHeight(44), accessibility.minTouchTarget);
  
  return (
    <View style={styles.previewSection}>
      <View 
        style={[
          styles.milestonePreview, 
          { 
            backgroundColor: theme.backgroundSecondary || theme.card,
            borderColor: theme.border
          }
        ]}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel={`Milestone: ${displayTitle}, Progress: ${progress}%`}
      >
        {/* Milestone Header */}
        <View style={styles.milestoneHeader}>
          <View style={styles.milestoneIconContainer}>
            <View 
              style={[
                styles.milestoneIcon,
                { backgroundColor: selectedColor }
              ]}
            >
              <Ionicons 
                name="flag" 
                size={scaleWidth(24)} 
                color="#FFFFFF" 
              />
            </View>
          </View>
          
          <View style={styles.milestoneTitleContainer}>
            <Text 
              style={[
                styles.milestoneTitle,
                { 
                  color: theme.text,
                  opacity: title.trim() ? 1.0 : 0.6
                }
              ]}
              numberOfLines={2}
              maxFontSizeMultiplier={1.3}
            >
              {displayTitle}
            </Text>
          </View>
          
          <View style={styles.milestoneProgressContainer}>
            <Text 
              style={[
                styles.progressPercentage,
                { color: theme.text }
              ]}
              maxFontSizeMultiplier={1.2}
            >
              {Math.round(progress)}%
            </Text>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View 
            style={[
              styles.progressTrack,
              { backgroundColor: theme.border }
            ]}
          >
            <View 
              style={[
                styles.progressBar,
                { 
                  backgroundColor: selectedColor,
                  width: `${progressWidth}%`
                }
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  previewSection: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  milestonePreview: {
    borderRadius: scaleWidth(16),
    padding: spacing.l,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scaleHeight(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: scaleWidth(4),
    elevation: 3,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  milestoneIconContainer: {
    marginRight: spacing.m,
  },
  milestoneIcon: {
    width: scaleWidth(48),
    height: scaleWidth(48),
    borderRadius: scaleWidth(24),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scaleHeight(2),
    },
    shadowOpacity: 0.2,
    shadowRadius: scaleWidth(3),
    elevation: 2,
  },
  milestoneTitleContainer: {
    flex: 1,
    marginRight: spacing.s,
  },
  milestoneTitle: {
    fontSize: fontSizes.l,
    fontWeight: '600',
    lineHeight: scaleHeight(28),
  },
  milestoneProgressContainer: {
    alignItems: 'flex-end',
  },
  progressPercentage: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: spacing.s,
  },
  progressTrack: {
    height: scaleHeight(8),
    borderRadius: scaleHeight(4),
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: scaleHeight(4),
    minWidth: scaleWidth(4),
  },
});

export default MilestonePreview;
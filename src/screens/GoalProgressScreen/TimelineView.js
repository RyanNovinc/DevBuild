// src/screens/GoalProgressScreen/TimelineView.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TimelineView = ({ 
  theme,
  goalColor,
  progressData,
  selectedPoint,
  handlePointSelection
}) => {
  return (
    <View style={styles.timeline}>
      {progressData.map((item, index) => (
        <TouchableOpacity 
          key={`timeline-${index}`}
          style={[
            styles.timelineItem,
            { 
              borderLeftColor: goalColor,
              backgroundColor: selectedPoint === item 
                ? `${goalColor}15` 
                : 'transparent',
            }
          ]}
          onPress={() => handlePointSelection(item)}
          activeOpacity={0.7}
        >
          <View 
            style={[
              styles.timelineDot,
              { 
                backgroundColor: item.isCreationPoint 
                  ? theme.textSecondary 
                  : goalColor 
              }
            ]}
          />
          
          <View style={styles.timelineContent}>
            <Text style={[styles.timelineItemTitle, { color: theme.text }]}>
              {item.projectTitle}
            </Text>
            
            <Text style={[styles.timelineItemDate, { color: theme.textSecondary }]}>
              {item.formattedDate}
            </Text>
            
            <View style={styles.timelineItemFooter}>
              <View 
                style={[
                  styles.progressBadge,
                  {
                    backgroundColor: item.isCreationPoint 
                      ? theme.textSecondary 
                      : goalColor
                  }
                ]}
              >
                <Text style={styles.progressValue}>
                  {item.progress}%
                </Text>
              </View>
              
              {item.completedProjects !== undefined && item.totalProjects !== undefined && (
                <Text style={[styles.progressDetails, { color: theme.textSecondary }]}>
                  {item.completedProjects}/{item.totalProjects} projects
                </Text>
              )}
              
              {index < progressData.length - 1 && (
                <Text style={[styles.progressGain, { color: theme.textSecondary }]}>
                  +{progressData[index + 1].progress - item.progress}%
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  timeline: {
    marginLeft: 8,
  },
  timelineItem: {
    position: 'relative',
    paddingVertical: 14,
    paddingLeft: 30,
    paddingRight: 16,
    borderLeftWidth: 2,
    marginBottom: 4,
    borderRadius: 8,
  },
  timelineDot: {
    position: 'absolute',
    left: -8,
    top: 16,
    width: 14,
    height: 14,
    borderRadius: 7,
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
  },
  timelineItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineItemDate: {
    fontSize: 13,
    marginBottom: 8,
  },
  timelineItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  progressBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
    marginRight: 8,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressDetails: {
    fontSize: 12,
    marginRight: 8,
  },
  progressGain: {
    fontSize: 12,
  },
});

export default TimelineView;
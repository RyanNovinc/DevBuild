// src/screens/GoalProgressScreen/TimelineViewContainer.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated
} from 'react-native';

import TimelineView from './TimelineView';

const TimelineViewContainer = ({ 
  theme,
  goalColor,
  listOpacity,
  activeTab,
  progressData,
  selectedPoint,
  handlePointSelection
}) => {
  return (
    <Animated.View 
      style={[
        styles.timelineContainer,
        {
          backgroundColor: theme.card,
          opacity: listOpacity,
          display: activeTab === 'timeline' ? 'flex' : 'none'
        }
      ]}
    >
      <Text style={[styles.timelineTitle, { color: theme.text }]}>
        Progress Timeline
      </Text>
      
      <TimelineView 
        theme={theme}
        goalColor={goalColor}
        progressData={progressData}
        selectedPoint={selectedPoint}
        handlePointSelection={handlePointSelection}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  timelineContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default TimelineViewContainer;
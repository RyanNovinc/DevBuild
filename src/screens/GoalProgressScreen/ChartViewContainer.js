// src/screens/GoalProgressScreen/ChartViewContainer.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated
} from 'react-native';

import ProgressChart from './ProgressChart';
import PointDetailCard from './PointDetailCard';
import { InfoBox } from './LoadingErrorStates';

const ChartViewContainer = ({ 
  theme,
  goalColor,
  chartOpacity,
  activeTab,
  isFullscreen,
  progressData,
  progressAnimation,
  selectedPoint,
  rippleAnim,
  selectedPointCoords,
  handlePointSelection,
  setSelectedPoint,
  getSecondaryColor
}) => {
  return (
    <Animated.View 
      style={[
        styles.chartContainer, 
        { 
          backgroundColor: theme.card,
          opacity: chartOpacity,
          display: activeTab === 'chart' ? 'flex' : 'none',
          ...(isFullscreen && {
            flex: 1,
            justifyContent: 'center',
            paddingVertical: 60,
            borderRadius: 0,
            marginHorizontal: 0,
          })
        }
      ]}
    >
      {!isFullscreen && (
        <View style={styles.chartHeaderContainer}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            Progress Timeline
          </Text>
          
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View 
                style={[
                  styles.legendMarker, 
                  { backgroundColor: goalColor }
                ]} 
              />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                Progress
              </Text>
            </View>
            
            <View style={styles.legendItem}>
              <View 
                style={[
                  styles.legendMarker, 
                  { 
                    backgroundColor: 'transparent',
                    borderColor: theme.textSecondary,
                    borderWidth: 2
                  }
                ]} 
              />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                Start Point
              </Text>
            </View>
          </View>
        </View>
      )}
      
      <ProgressChart 
        theme={theme}
        goalColor={goalColor}
        progressData={progressData}
        isFullscreen={isFullscreen}
        progressAnimation={progressAnimation}
        selectedPoint={selectedPoint}
        rippleAnim={rippleAnim}
        selectedPointCoords={selectedPointCoords}
        handlePointSelection={handlePointSelection}
        getSecondaryColor={getSecondaryColor}
      />
      
      {!isFullscreen && !selectedPoint && (
        <InfoBox theme={theme} goalColor={goalColor} />
      )}
      
      <PointDetailCard 
        theme={theme}
        goalColor={goalColor}
        selectedPoint={selectedPoint}
        rippleAnim={rippleAnim}
        setSelectedPoint={setSelectedPoint}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden', // Ensure content doesn't overflow
  },
  chartHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartLegend: {
    flexDirection: 'row',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  legendMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
  },
});

export default ChartViewContainer;
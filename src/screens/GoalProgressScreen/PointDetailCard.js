// src/screens/GoalProgressScreen/PointDetailCard.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PointDetailCard = ({ 
  theme,
  goalColor,
  selectedPoint,
  rippleAnim,
  setSelectedPoint
}) => {
  if (!selectedPoint) return null;
  
  return (
    <Animated.View 
      style={[
        styles.pointDetailCard,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.text,
          transform: [
            { 
              translateY: rippleAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [20, 0, 0]
              })
            }
          ],
          opacity: rippleAnim.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [0, 1, 1]
          })
        }
      ]}
    >
      <View style={styles.pointDetailHeader}>
        <Text style={[styles.pointDetailTitle, { color: theme.text }]}>
          {selectedPoint.projectTitle}
        </Text>
        <View 
          style={[
            styles.pointDetailProgress, 
            { backgroundColor: goalColor }
          ]}
        >
          <Text style={styles.pointDetailProgressText}>
            {selectedPoint.progress}%
          </Text>
        </View>
      </View>
      
      <Text style={[styles.pointDetailDate, { color: theme.textSecondary }]}>
        {selectedPoint.formattedDate}
      </Text>
      
      {selectedPoint.isCreationPoint ? (
        <Text style={[styles.pointDetailDescription, { color: theme.textSecondary }]}>
          This marks the beginning of your goal journey.
        </Text>
      ) : (
        <View>
          <Text style={[styles.pointDetailDescription, { color: theme.textSecondary }]}>
            Project completed successfully! 
          </Text>
          <Text style={[styles.pointDetailDescription, { color: theme.textSecondary, marginTop: 4 }]}>
            Progress: {selectedPoint.completedProjects} of {selectedPoint.totalProjects} projects completed ({selectedPoint.progress}%)
          </Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={[
          styles.pointDetailCloseBtn,
          { backgroundColor: `${theme.border}50` }
        ]}
        onPress={() => setSelectedPoint(null)}
      >
        <Ionicons name="close" size={16} color={theme.text} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pointDetailCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  pointDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  pointDetailProgress: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  pointDetailProgressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pointDetailDate: {
    fontSize: 13,
    marginBottom: 10,
  },
  pointDetailDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  pointDetailCloseBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PointDetailCard;
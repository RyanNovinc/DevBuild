// src/components/MetricItem.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const MetricItem = ({ 
  metric, 
  onUpdate, 
  onDelete, 
  onEdit,
  goalColor 
}) => {
  const { theme } = useTheme();
  
  // Animation for progress changes
  const [progressAnim] = useState(new Animated.Value(0));
  
  // Set initial progress
  useEffect(() => {
    const metricProgress = metric.target > 0 
      ? (metric.current / metric.target) * 100 
      : 0;
      
    Animated.timing(progressAnim, {
      toValue: metricProgress,
      duration: 500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false
    }).start();
  }, [metric.current, metric.target]);
  
  // Convert animated value to width percentage
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });
  
  // Calculate progress percentage
  const progressPercent = metric.target > 0 
    ? Math.min(100, Math.round((metric.current / metric.target) * 100)) 
    : 0;
  
  // Update metric current value
  const handleIncrementValue = (increment) => {
    const newValue = Math.max(0, Math.min(metric.target, metric.current + increment));
    
    if (newValue !== metric.current) {
      const updatedMetric = {
        ...metric,
        current: newValue
      };
      
      // Update animation
      const metricProgress = updatedMetric.target > 0 
        ? (updatedMetric.current / updatedMetric.target) * 100 
        : 0;
        
      Animated.timing(progressAnim, {
        toValue: metricProgress,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false
      }).start();
      
      // Notify parent
      onUpdate(updatedMetric);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.cardElevated }]}>
      {/* Metric Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          {metric.name}
        </Text>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onEdit(metric)}
          >
            <Ionicons name="create-outline" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onDelete(metric.id)}
          >
            <Ionicons name="trash-outline" size={18} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={[styles.targetText, { color: theme.textSecondary }]}>
            Target: {metric.target} {metric.unit}
          </Text>
          <Text style={[styles.percentText, { color: goalColor }]}>
            {progressPercent}%
          </Text>
        </View>
        
        <View style={[styles.progressBar, { backgroundColor: `${goalColor}20` }]}>
          <Animated.View 
            style={[
              styles.progressFill, 
              {
                width: progressWidth,
                backgroundColor: goalColor
              }
            ]}
          />
        </View>
      </View>
      
      {/* Value Controls */}
      <View style={styles.controlsSection}>
        <View style={styles.valueDisplay}>
          <Text style={[styles.currentValueText, { color: theme.text }]}>
            {metric.current}
          </Text>
          <Text style={[styles.unitText, { color: theme.textSecondary }]}>
            / {metric.target} {metric.unit}
          </Text>
        </View>
        
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: theme.background, borderColor: theme.border }]}
            onPress={() => handleIncrementValue(-1)}
          >
            <Ionicons name="remove" size={16} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: theme.background, borderColor: theme.border }]}
            onPress={() => handleIncrementValue(1)}
          >
            <Ionicons name="add" size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 5,
    marginLeft: 8,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  targetText: {
    fontSize: 13,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  controlsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currentValueText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  unitText: {
    fontSize: 14,
    marginLeft: 5,
  },
  controls: {
    flexDirection: 'row',
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default MetricItem;
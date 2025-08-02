// src/screens/TodoListScreen/components/TodoItem.js
import React, { useRef, useEffect, memo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Easing,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../TodoListStyles';

/**
 * TodoItem component for rendering individual todo items
 * Optimized with proper memoization and animations
 */
const TodoItem = memo(({ 
  item, 
  onToggle, 
  onDelete, 
  onLongPress, 
  theme, 
  style, 
  fillCheckbox = false,
  isNew = false,
  isSubtask = false,
  parentCompleted = false
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(isNew ? 0.8 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const checkmarkScale = useRef(new Animated.Value(item.completed ? 1 : 0)).current;
  
  // Entry animation for new items
  useEffect(() => {
    if (isNew) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isNew]);
  
  // Animate checkbox when completed state changes
  useEffect(() => {
    Animated.timing(checkmarkScale, {
      toValue: item.completed ? 1 : 0,
      duration: 150,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [item.completed]);
  
  // Handle toggle with optimized animation
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    }
  };
  
  // Handle delete with optimized animation
  const handleDelete = () => {
    // Animate out before deleting
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true
      })
    ]).start(() => {
      if (onDelete) {
        onDelete();
      }
    });
  };
  
  // Get appropriate background color based on completion state
  const getBackgroundColor = () => {
    if (item.completed) {
      return theme.cardElevated;
    }
    // For subtasks, use a very subtle background
    if (isSubtask) {
      return 'transparent';
    }
    return 'transparent';
  };
  
  // Get appropriate border color
  const getBorderColor = () => {
    if (item.completed) {
      return theme.border;
    }
    // Return a more subtle border for incomplete items
    return theme.border + '80'; // 50% opacity
  };
  
  // Special styling for subtasks
  const getSubtaskStyle = () => {
    if (!isSubtask) return {};
    
    return {
      marginLeft: 0,
      opacity: parentCompleted ? 0.7 : 1,
    };
  };

  return (
    <Animated.View 
      style={[
        styles.todoItem, 
        style,
        getSubtaskStyle(),
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.todoRow,
          localStyles.todoRow,
          { 
            backgroundColor: getBackgroundColor(),
            borderWidth: 1,
            borderColor: getBorderColor(),
            borderRadius: 12,
            padding: 12,
            paddingLeft: 10
          }
        ]}
        onPress={handleToggle}
        onLongPress={() => {
          onLongPress(item);
        }}
        delayLongPress={500}
        activeOpacity={0.7}
      >
        <View style={styles.todoLeft}>
          <View style={styles.checkboxContainer}>
            <View style={[
              styles.checkbox,
              { 
                borderColor: item.completed ? theme.primary : theme.textSecondary,
                backgroundColor: item.completed ? theme.primary : 'transparent' 
              }
            ]}>
              <Animated.View style={{
                opacity: checkmarkScale,
                transform: [{ scale: checkmarkScale }]
              }}>
                {item.completed && !fillCheckbox && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </Animated.View>
            </View>
          </View>
          
          <Text style={[
            styles.todoTitle,
            { color: theme.text },
            item.completed && styles.completedText
          ]}
          numberOfLines={2}
          >
            {item.title}
          </Text>
        </View>
        
        {item.completed && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color={theme.error || '#FF3B30'} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

// Local styles to enhance the component
const localStyles = StyleSheet.create({
  todoRow: {
    // Add enhanced shadow for better visual hierarchy
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default TodoItem;
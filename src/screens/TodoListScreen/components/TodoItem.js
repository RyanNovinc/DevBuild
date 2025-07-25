// src/screens/TodoListScreen/components/TodoItem.js
import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Easing 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../TodoListStyles';

/**
 * TodoItem component for rendering individual todo items
 * Modified to remove local confirmation handling to prevent double confirmation dialogs
 */
const TodoItem = ({ 
  item, 
  onToggle, 
  onDelete, 
  onLongPress, 
  theme, 
  style, 
  fillCheckbox = false,
  isNew = false
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(isNew ? 0.8 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  
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
  }, []);
  
  // Get appropriate background color based on completion state
  const getBackgroundColor = () => {
    if (item.completed) {
      return theme.cardElevated;
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

  return (
    <Animated.View 
      style={[
        styles.todoItem, 
        style,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.todoRow,
          { 
            backgroundColor: getBackgroundColor(),
            borderWidth: 1,
            borderColor: getBorderColor(),
            borderRadius: 12,
            padding: 12,
            paddingLeft: 10
          }
        ]}
        onPress={onToggle}
        onLongPress={() => {
          console.log('Long pressing todo item:', item.id, item.title);
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
              {item.completed && !fillCheckbox && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
          </View>
          
          <Text style={[
            styles.todoTitle,
            { color: theme.text },
            item.completed && styles.completedText
          ]}>
            {item.title}
          </Text>
        </View>
        
        {item.completed && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete} // Call onDelete directly without local confirmation
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color={theme.error || '#FF3B30'} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default React.memo(TodoItem);
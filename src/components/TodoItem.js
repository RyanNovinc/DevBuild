// src/components/TodoItem.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  accessibility,
  meetsContrastRequirements
} from '../utils/responsive';

const TodoItem = ({ 
  item, 
  onToggle, 
  onDelete, 
  onLongPress, 
  theme,
  style,
  fillCheckbox = true
}) => {
  // Ensure minimum touch target size
  const minTouchSize = Math.max(scaleWidth(44), accessibility.minTouchTarget);
  
  // Check primary color contrast
  const primaryColor = theme ? theme.primary : '#4CAF50';
  
  // Create accessibility labels
  const accessibilityLabel = `Todo: ${item.title}${item.completed ? ', Completed' : ', Not completed'}`;
  const checkboxAccessibilityLabel = `${item.completed ? 'Completed' : 'Not completed'} todo: ${item.title}`;
  const deleteAccessibilityLabel = `Delete todo: ${item.title}`;
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: theme ? theme.card : '#fff',
          shadowColor: theme ? theme.text : '#000',
          minHeight: minTouchSize
        },
        item.completed && styles.completedContainer,
        style
      ]}
      onPress={() => onToggle(item.id)}
      onLongPress={() => onLongPress && onLongPress()}
      delayLongPress={500}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Double tap to toggle completion, long press for more options"
      accessibilityState={{ checked: item.completed }}
    >
      <TouchableOpacity 
        style={[styles.checkbox, { minWidth: minTouchSize, minHeight: minTouchSize, justifyContent: 'center', alignItems: 'center' }]}
        onPress={() => onToggle(item.id)}
        accessible={true}
        accessibilityRole="checkbox"
        accessibilityLabel={checkboxAccessibilityLabel}
        accessibilityState={{ checked: item.completed }}
      >
        <View 
          style={[
            styles.checkboxInner, 
            item.completed && styles.checkedBox,
            { 
              borderColor: primaryColor,
              backgroundColor: item.completed ? primaryColor : 'transparent',
              width: scaleWidth(22),
              height: scaleWidth(22),
            }
          ]}
        >
          {/* Checkbox will just fill with color */}
        </View>
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text 
          style={[
            styles.title,
            item.completed && styles.completedTitle,
            { color: theme ? theme.text : '#333' }
          ]}
          maxFontSizeMultiplier={1.8}
          accessibilityRole="text"
        >
          {item.title}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.deleteButton, { minWidth: minTouchSize, minHeight: minTouchSize, justifyContent: 'center', alignItems: 'center' }]}
        onPress={() => onDelete(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={deleteAccessibilityLabel}
        accessibilityHint="Permanently removes this todo item"
      >
        <Ionicons 
          name="trash-outline" 
          size={scaleWidth(18)} 
          color={theme ? theme.error : '#F44336'} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: scaleWidth(10),
    padding: spacing.m,
    marginBottom: spacing.s,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedContainer: {
    opacity: 0.7,
  },
  checkbox: {
    marginRight: spacing.s,
  },
  checkboxInner: {
    borderRadius: scaleWidth(4),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    borderColor: '#4CAF50',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSizes.m,
    fontWeight: '500',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  deleteButton: {
    padding: spacing.xs,
  },
});

export default TodoItem;
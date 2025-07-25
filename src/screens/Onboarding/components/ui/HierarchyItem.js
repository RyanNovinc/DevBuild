// src/screens/Onboarding/components/ui/HierarchyItem.js
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import onboardingStyles from '../../styles/onboardingStyles';

/**
 * HierarchyItem - A collapsible item in the system hierarchy
 * @param {string} type - The type of hierarchy item ('direction', 'goal', 'project', 'tasks')
 * @param {string} title - The title to display in the header
 * @param {string} iconName - The Ionicons name for the icon
 * @param {boolean} isExpanded - Whether the item is expanded
 * @param {function} onToggle - Function to toggle expanded state
 * @param {object} animValue - Animated value for appearance animation
 * @param {object} content - Content data for the expanded section
 * @param {function} onSave - Function to handle saving changes
 * @param {boolean} showConnector - Whether to show a connector below this item
 * @param {object} extraProps - Additional props for specific item types
 */
const HierarchyItem = ({ 
  type,
  title,
  iconName,
  isExpanded,
  onToggle,
  animValue,
  content,
  onSave,
  showConnector = true,
  ...extraProps
}) => {
  const renderContent = () => {
    switch (type) {
      case 'direction':
        return (
          <View style={onboardingStyles.hierarchyContent}>
            <Text style={onboardingStyles.hierarchyText}>
              {content}
            </Text>
            
            <TouchableOpacity 
              style={onboardingStyles.confirmButton}
              onPress={() => onSave(type, content)}
            >
              <Text style={onboardingStyles.confirmButtonText}>Set as Life Direction</Text>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        );
        
      case 'goal':
      case 'project':
        return (
          <View style={onboardingStyles.hierarchyContent}>
            <TextInput
              style={onboardingStyles.hierarchyEditInput}
              value={content.title}
              multiline={false}
              placeholder={`Enter ${type} title...`}
              placeholderTextColor="#888888"
            />
            <TextInput
              style={[onboardingStyles.hierarchyEditInput, onboardingStyles.hierarchyEditInputSmall]}
              value={content.description}
              multiline={false}
              placeholder={`Enter ${type} description...`}
              placeholderTextColor="#888888"
            />
            
            <TouchableOpacity 
              style={onboardingStyles.confirmButton}
              onPress={() => onSave(type, content)}
            >
              <Text style={onboardingStyles.confirmButtonText}>{`Set as ${type.charAt(0).toUpperCase() + type.slice(1)}`}</Text>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        );
        
      case 'tasks':
        return (
          <View style={onboardingStyles.hierarchyContent}>
            <View style={onboardingStyles.tasksList}>
              {content.map((task, index) => (
                <View key={index} style={onboardingStyles.taskItemEditable}>
                  <Ionicons name="checkmark-circle-outline" size={14} color="#2563eb" />
                  <TextInput
                    style={onboardingStyles.taskTextInput}
                    value={task}
                    placeholder="Enter task..."
                    placeholderTextColor="#888888"
                  />
                </View>
              ))}
              <TouchableOpacity style={onboardingStyles.addTaskButton}>
                <Ionicons name="add-circle-outline" size={16} color="#2563eb" />
                <Text style={onboardingStyles.addTaskText}>Add Task</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={onboardingStyles.confirmButton}
              onPress={() => onSave(type, content)}
            >
              <Text style={onboardingStyles.confirmButtonText}>Save Tasks</Text>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Animated.View 
      style={[
        onboardingStyles.hierarchyItemCollapsible,
        {
          opacity: animValue,
          transform: [
            { 
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              }) 
            }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={onboardingStyles.hierarchyHeader}
        onPress={onToggle}
      >
        <View style={onboardingStyles.hierarchyIconSmall}>
          <Ionicons name={iconName} size={16} color="#FFFFFF" />
        </View>
        <Text style={onboardingStyles.hierarchyHeaderText}>{title}</Text>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={16} 
          color="#AAAAAA" 
        />
      </TouchableOpacity>
      
      {isExpanded && renderContent()}
      
      {showConnector && (
        <View style={onboardingStyles.hierarchyConnector}>
          <Ionicons name="arrow-down" size={16} color="#666666" />
        </View>
      )}
    </Animated.View>
  );
};

export default HierarchyItem;
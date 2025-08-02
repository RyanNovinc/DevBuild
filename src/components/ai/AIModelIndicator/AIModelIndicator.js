// src/components/ai/AIModelIndicator/AIModelIndicator.js
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';

/**
 * AIModelIndicator - Shows the current AI model tier
 */
const AIModelIndicator = ({ 
  tier = 'navigator', // Default to mid-tier
  onPress
}) => {
  const { theme } = useTheme();
  
  // Get model details based on tier
  const getModelDetails = (tier) => {
    const models = {
      guide: {
        name: 'Guide AI',
        role: 'Project Coordinator',
        icon: 'list',
        color: '#03A9F4',
      },
      navigator: {
        name: 'Navigator AI',
        role: 'Program Manager',
        icon: 'git-branch',
        color: '#3F51B5',
      },
      compass: {
        name: 'Compass AI',
        role: 'Chief Strategy Officer',
        icon: 'navigate',
        color: '#673AB7',
      }
    };
    
    return models[tier] || models.navigator;
  };
  
  const modelDetails = getModelDetails(tier);
  
  return (
    <View style={[styles.indicatorBar, { 
      backgroundColor: theme.background,
      borderBottomColor: theme.border,
      borderBottomWidth: 1
    }]}>
      <TouchableOpacity 
        style={[styles.indicator, { backgroundColor: `${modelDetails.color}15` }]}
        onPress={onPress}
      >
        <View style={[styles.iconContainer, { backgroundColor: modelDetails.color }]}>
          <Ionicons name={modelDetails.icon} size={12} color="#FFFFFF" />
        </View>
        <Text style={[styles.indicatorText, { color: modelDetails.color }]}>
          {modelDetails.name}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  indicatorBar: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  iconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  indicatorText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AIModelIndicator;
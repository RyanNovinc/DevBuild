// src/screens/ProjectDetailsScreen/components/ProjectTabs.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Tab = ({ title, icon, isActive, onPress, color, theme }) => {
  // Animation for active indicator
  const [scaleAnim] = React.useState(new Animated.Value(isActive ? 1 : 0));
  
  // Update animation when active state changes
  React.useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: true
    }).start();
  }, [isActive, scaleAnim]);
  
  return (
    <TouchableOpacity
      style={[
        styles.tab, 
        isActive && [styles.activeTab, { backgroundColor: `${color}15` }]
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={isActive ? color : theme.textSecondary} 
      />
      <Text 
        style={[
          styles.tabText, 
          { color: isActive ? color : theme.textSecondary }
        ]}
      >
        {title}
      </Text>
      
      {/* Animated indicator for active tab */}
      <Animated.View 
        style={[
          styles.activeIndicator, 
          { 
            backgroundColor: color,
            transform: [{ scaleX: scaleAnim }],
            opacity: scaleAnim
          }
        ]} 
      />
    </TouchableOpacity>
  );
};

const ProjectTabs = ({ activeTab, setActiveTab, theme, color }) => {
  return (
    <View style={[styles.tabsContainer, { backgroundColor: theme.backgroundSecondary }]}>
      <Tab 
        title="Details" 
        icon="information-circle-outline" 
        isActive={activeTab === 'details'}
        onPress={() => setActiveTab('details')}
        color={color}
        theme={theme}
      />
      
      <Tab 
        title="Tasks" 
        icon="list-outline" 
        isActive={activeTab === 'list'}
        onPress={() => setActiveTab('list')}
        color={color}
        theme={theme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    height: 50,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  activeTab: {
    
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});

export default ProjectTabs;
// src/screens/Referral/TabNavigation.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TabNavigation = ({ activeTab, onChangeTab, theme }) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'details' && styles.activeTab
        ]}
        onPress={() => onChangeTab('details')}
      >
        <Text
          style={[
            styles.tabText,
            { color: activeTab === 'details' ? '#4CAF50' : '#9E9E9E' },
            activeTab === 'details' && styles.activeTabText
          ]}
        >
          Share
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'stats' && styles.activeTab
        ]}
        onPress={() => onChangeTab('stats')}
      >
        <Text
          style={[
            styles.tabText,
            { color: activeTab === 'stats' ? '#4CAF50' : '#9E9E9E' },
            activeTab === 'stats' && styles.activeTabText
          ]}
        >
          Stats
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'info' && styles.activeTab
        ]}
        onPress={() => onChangeTab('info')}
      >
        <Text
          style={[
            styles.tabText,
            { color: activeTab === 'info' ? '#4CAF50' : '#9E9E9E' },
            activeTab === 'info' && styles.activeTabText
          ]}
        >
          How It Works
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    backgroundColor: '#121212',
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  }
});

export default TabNavigation;
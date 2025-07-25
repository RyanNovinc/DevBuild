// src/screens/TodoListScreen/components/TodoTabContent.js
import React from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { styles } from '../TodoListStyles';

// Import sub-components
import TodayTab from './tabs/TodayTab';
import TomorrowTab from './tabs/TomorrowTab';
import LaterTab from './tabs/LaterTab';

/**
 * TodoTabContent component renders the appropriate tab content
 * Updated to remove extra bottom padding
 */
const TodoTabContent = (props) => {
  const { activeTab, theme, setIsAddingSubtask } = props;
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={80}
    >
      <View style={[styles.tabContent, localStyles.tabContentContainer]}>
        {activeTab === 'today' && <TodayTab {...props} setIsAddingSubtask={setIsAddingSubtask} />}
        {activeTab === 'tomorrow' && <TomorrowTab {...props} setIsAddingSubtask={setIsAddingSubtask} />}
        {activeTab === 'later' && <LaterTab {...props} setIsAddingSubtask={setIsAddingSubtask} />}
      </View>
    </KeyboardAvoidingView>
  );
};

// Additional local styles to fix bottom padding
const localStyles = StyleSheet.create({
  tabContentContainer: {
    flex: 1,
    paddingBottom: 0, // Ensure no extra padding
  }
});

export default React.memo(TodoTabContent);
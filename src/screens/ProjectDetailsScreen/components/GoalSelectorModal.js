// src/screens/ProjectDetailsScreen/components/GoalSelectorModal.js
import React, { useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GoalSelectorModal = ({ 
  showGoalSelector, 
  setShowGoalSelector, 
  availableGoals, 
  selectedGoalId, 
  setSelectedGoalId,
  setColor,
  theme 
}) => {
  // Render goal item in selector
  const renderGoalItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={[
        styles.goalItem, 
        { 
          backgroundColor: theme.card,
          borderLeftWidth: 6,
          borderLeftColor: item.color || '#4CAF50'
        }
      ]}
      onPress={() => {
        setSelectedGoalId(item.id);
        setColor(item.color || '#4CAF50');
        setShowGoalSelector(false);
      }}
    >
      <View style={styles.goalItemContent}>
        <Ionicons 
          name={item.icon || 'star'} 
          size={22} 
          color={item.color || '#4CAF50'} 
          style={styles.goalIcon}
        />
        <View style={styles.goalTextContainer}>
          <Text style={[styles.goalTitle, { color: theme.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.goalProgress, { color: theme.textSecondary }]}>
            {item.progress}% complete
          </Text>
        </View>
      </View>
      
      {selectedGoalId === item.id && (
        <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
      )}
    </TouchableOpacity>
  ), [theme, selectedGoalId, setSelectedGoalId, setColor, setShowGoalSelector]);
  
  return (
    <Modal
      visible={showGoalSelector}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowGoalSelector(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Select a Goal</Text>
            <TouchableOpacity onPress={() => setShowGoalSelector(false)}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={availableGoals}
            renderItem={renderGoalItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.goalsList}
            ListEmptyComponent={
              <View style={styles.emptyGoalsContainer}>
                <Ionicons name="alert-circle-outline" size={42} color={theme.textSecondary} />
                <Text style={[styles.emptyGoalsText, { color: theme.textSecondary }]}>
                  No goals available. Create a goal first.
                </Text>
              </View>
            }
          />
          
          <TouchableOpacity 
            style={[styles.noGoalButton, { borderColor: theme.border }]}
            onPress={() => {
              setSelectedGoalId(null);
              setShowGoalSelector(false);
            }}
          >
            <Text style={[styles.noGoalButtonText, { color: theme.textSecondary }]}>
              No Goal (Independent Project)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.doneButton, { backgroundColor: theme.primary }]}
            onPress={() => setShowGoalSelector(false)}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  goalsList: {
    paddingVertical: 8,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  goalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalIcon: {
    marginRight: 12,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  goalProgress: {
    fontSize: 13,
  },
  emptyGoalsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyGoalsText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  noGoalButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  noGoalButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  doneButton: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoalSelectorModal;
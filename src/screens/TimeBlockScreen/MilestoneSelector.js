// src/screens/TimeBlockScreen/MilestoneSelector.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MilestoneSelector = ({ 
  visible, 
  onClose, 
  onSelectMilestone, 
  selectedMilestone,
  milestones,
  domainColor,
  theme,
  isDarkMode
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[
        styles.modalOverlay, 
        { backgroundColor: 'rgba(0,0,0,0.5)' }
      ]}>
        <View style={[
          styles.milestoneModalContainer, 
          { 
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: theme.border
          }
        ]}>
          <View style={styles.milestoneModalHeader}>
            <Text style={[styles.milestoneModalTitle, { color: theme.text }]}>
              Select Milestone
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.milestoneModalContent}>
            {/* Allow None option to clear selection */}
            <TouchableOpacity 
              style={[
                styles.milestoneItem,
                { 
                  backgroundColor: selectedMilestone === null 
                    ? `${domainColor}15` 
                    : theme.card,
                  borderWidth: 1,
                  borderColor: selectedMilestone === null
                    ? domainColor
                    : theme.border
                }
              ]}
              onPress={() => onSelectMilestone(null)}
            >
              <Ionicons 
                name="close-circle-outline" 
                size={20} 
                color={selectedMilestone === null ? domainColor : theme.textSecondary} 
              />
              <Text style={[
                styles.milestoneItemText, 
                { 
                  color: selectedMilestone === null 
                    ? domainColor 
                    : theme.text,
                  fontWeight: selectedMilestone === null ? 'bold' : 'normal'
                }
              ]}>
                None - No specific milestone
              </Text>
            </TouchableOpacity>
            
            {/* Milestones list */}
            {milestones.length > 0 ? (
              milestones.map(milestone => (
                <TouchableOpacity 
                  key={milestone.id}
                  style={[
                    styles.milestoneItem,
                    { 
                      backgroundColor: selectedMilestone?.id === milestone.id 
                        ? `${milestone.color || domainColor}15` 
                        : theme.card,
                      borderWidth: 1,
                      borderColor: selectedMilestone?.id === milestone.id
                        ? (milestone.color || domainColor)
                        : theme.border
                    }
                  ]}
                  onPress={() => onSelectMilestone(milestone)}
                >
                  <View style={[
                    styles.milestoneItemColor, 
                    { backgroundColor: milestone.color || domainColor }
                  ]} />
                  <Text style={[
                    styles.milestoneItemText, 
                    { 
                      color: selectedMilestone?.id === milestone.id 
                        ? (milestone.color || domainColor) 
                        : theme.text,
                      fontWeight: selectedMilestone?.id === milestone.id ? 'bold' : 'normal'
                    }
                  ]}>
                    {milestone.title}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={[styles.noMilestonesMessage, { borderColor: theme.border }]}>
                <Text style={[styles.noMilestonesText, { color: theme.textSecondary }]}>
                  No milestones available for this goal. You can create milestones in the Milestones tab.
                </Text>
              </View>
            )}
          </ScrollView>
          
          <TouchableOpacity 
            style={[
              styles.modalDoneButton, 
              { 
                backgroundColor: theme.primary,
                borderWidth: isDarkMode ? 1 : 0,
                borderColor: isDarkMode ? '#FFFFFF' : 'transparent'
              }
            ]}
            onPress={onClose}
          >
            <Text style={[
              styles.modalDoneButtonText, 
              { color: isDarkMode ? '#000000' : '#FFFFFF' }
            ]}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  milestoneModalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  milestoneModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E2E3',
  },
  milestoneModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  milestoneModalContent: {
    padding: 16,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E2E3',
    backgroundColor: '#F8F9FA',
  },
  milestoneItemColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  milestoneItemText: {
    fontSize: 16,
    color: '#333333',
  },
  noMilestonesMessage: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1E2E3',
    borderRadius: 8,
    marginBottom: 16,
  },
  noMilestonesText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
  modalDoneButton: {
    backgroundColor: '#4285F4',
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  modalDoneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default MilestoneSelector;
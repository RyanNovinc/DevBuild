// src/screens/TasksScreen/GoalRequiredModal.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GoalRequiredModal = ({ 
  visible, 
  onClose, 
  onNavigateToGoals,
  onNavigateToProjects,
  type = 'project', // 'project' or 'task'
  context = 'noGoals', // 'noGoals' or 'noProjects' 
  theme,
  isDarkMode
}) => {
  const isProjectType = type === 'project';
  
  const getTitle = () => {
    return isProjectType 
      ? 'Goals Required' 
      : 'Projects Required';
  };
  
  const getMessage = () => {
    if (isProjectType) {
      return 'You need to create a goal before you can add projects.';
    } else {
      // For tasks, check the context
      if (context === 'noGoals') {
        return 'You need to create a goal and project before you can add tasks.';
      } else {
        return 'You need to create a project before you can add tasks.';
      }
    }
  };
  
  const getActionText = () => {
    return isProjectType 
      ? 'Create Goal' 
      : 'Create Project';
  };
  
  const getIcon = () => {
    return isProjectType ? 'flag' : 'folder';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.container, 
          { 
            backgroundColor: theme.background,
            borderColor: theme.border,
          }
        ]}>
          {/* Icon */}
          <View style={[
            styles.iconContainer,
            { backgroundColor: `${theme.primary}15` }
          ]}>
            <Ionicons 
              name={getIcon()} 
              size={32} 
              color={theme.primary} 
            />
          </View>
          
          {/* Title */}
          <Text style={[
            styles.title, 
            { color: theme.text }
          ]}>
            {getTitle()}
          </Text>
          
          {/* Message */}
          <Text style={[
            styles.message, 
            { color: theme.textSecondary }
          ]}>
            {getMessage()}
          </Text>
          
          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.button,
                styles.secondaryButton,
                { 
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                }
              ]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.buttonText, 
                { color: theme.text }
              ]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button,
                styles.primaryButton,
                { backgroundColor: theme.primary }
              ]}
              onPress={() => {
                onClose();
                if (isProjectType) {
                  onNavigateToGoals?.();
                } else {
                  onNavigateToProjects?.();
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.buttonText, 
                { color: isDarkMode ? '#000000' : '#FFFFFF' }
              ]}>
                {getActionText()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default GoalRequiredModal;
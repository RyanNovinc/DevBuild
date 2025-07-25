// src/screens/TimeBlockScreen/ProjectSelector.js
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

const ProjectSelector = ({ 
  visible, 
  onClose, 
  onSelectProject, 
  selectedProject,
  projects,
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
          styles.projectModalContainer, 
          { 
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: theme.border
          }
        ]}>
          <View style={styles.projectModalHeader}>
            <Text style={[styles.projectModalTitle, { color: theme.text }]}>
              Select Project
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.projectModalContent}>
            {/* Allow None option to clear selection */}
            <TouchableOpacity 
              style={[
                styles.projectItem,
                { 
                  backgroundColor: selectedProject === null 
                    ? `${domainColor}15` 
                    : theme.card,
                  borderWidth: 1,
                  borderColor: selectedProject === null
                    ? domainColor
                    : theme.border
                }
              ]}
              onPress={() => onSelectProject(null)}
            >
              <Ionicons 
                name="close-circle-outline" 
                size={20} 
                color={selectedProject === null ? domainColor : theme.textSecondary} 
              />
              <Text style={[
                styles.projectItemText, 
                { 
                  color: selectedProject === null 
                    ? domainColor 
                    : theme.text,
                  fontWeight: selectedProject === null ? 'bold' : 'normal'
                }
              ]}>
                None - No specific project
              </Text>
            </TouchableOpacity>
            
            {/* Projects list */}
            {projects.length > 0 ? (
              projects.map(project => (
                <TouchableOpacity 
                  key={project.id}
                  style={[
                    styles.projectItem,
                    { 
                      backgroundColor: selectedProject?.id === project.id 
                        ? `${project.color || domainColor}15` 
                        : theme.card,
                      borderWidth: 1,
                      borderColor: selectedProject?.id === project.id
                        ? (project.color || domainColor)
                        : theme.border
                    }
                  ]}
                  onPress={() => onSelectProject(project)}
                >
                  <View style={[
                    styles.projectItemColor, 
                    { backgroundColor: project.color || domainColor }
                  ]} />
                  <Text style={[
                    styles.projectItemText, 
                    { 
                      color: selectedProject?.id === project.id 
                        ? (project.color || domainColor) 
                        : theme.text,
                      fontWeight: selectedProject?.id === project.id ? 'bold' : 'normal'
                    }
                  ]}>
                    {project.title}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={[styles.noProjectsMessage, { borderColor: theme.border }]}>
                <Text style={[styles.noProjectsText, { color: theme.textSecondary }]}>
                  No projects available for this goal. You can create projects in the Projects tab.
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
  projectModalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  projectModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E2E3',
  },
  projectModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  projectModalContent: {
    padding: 16,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E2E3',
    backgroundColor: '#F8F9FA',
  },
  projectItemColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  projectItemText: {
    fontSize: 16,
    color: '#333333',
  },
  noProjectsMessage: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1E2E3',
    borderRadius: 8,
    marginBottom: 16,
  },
  noProjectsText: {
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

export default ProjectSelector;
// src/components/ai/AIModals/AIModeInfoModal.js
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * AIModeInfoModal - Shows detailed information about the different AI tiers
 */
const AIModeInfoModal = ({ 
  visible = false, 
  aiTier = 'guide',
  theme = {}, // Accept theme as prop instead of using useTheme
  onClose
}) => {
  // Helper function to get mode-specific details
  const getModeDetails = () => {
    switch(aiTier) {
      case 'guide':
        return {
          name: 'Guide AI',
          icon: 'list',
          color: '#03A9F4',
          description: 'Essential AI assistance for everyday planning and quick questions.',
          features: [
            'Task organization and scheduling',
            'Basic goal tracking',
            'Quick questions and reminders',
            'Simple time blocking'
          ],
          useCases: [
            'Organize daily tasks',
            'Schedule reminders',
            'Create simple to-do lists',
            'Basic time management'
          ]
        };
      case 'navigator':
        return {
          name: 'Navigator AI',
          icon: 'git-branch',
          color: '#3F51B5',
          description: 'Enhanced AI capabilities for deeper analysis and strategic planning.',
          features: [
            'Advanced project management',
            'Goal alignment and tracking',
            'Deeper strategic insights',
            'Enhanced time management',
            'Multi-step planning'
          ],
          useCases: [
            'Develop project roadmaps',
            'Align daily work with goals',
            'Plan quarterly objectives',
            'Get strategic recommendations',
            'Manage complex schedules'
          ]
        };
      case 'compass':
        return {
          name: 'Compass AI',
          icon: 'navigate',
          color: '#673AB7',
          description: 'Premium AI experience for comprehensive insights and transformative guidance.',
          features: [
            'Life direction alignment',
            'Deep goal-value integration',
            'Transformative insights',
            'Holistic life planning',
            'Advanced strategic thinking',
            'Comprehensive context awareness'
          ],
          useCases: [
            'Develop comprehensive life plans',
            'Align goals with core values',
            'Identify breakthrough opportunities',
            'Overcome complex challenges',
            'Create transformative change',
            'Optimize systems across life domains'
          ]
        };
      default:
        return {
          name: 'AI Assistant',
          icon: 'sparkles',
          color: '#03A9F4',
          description: 'AI assistance for productivity and planning.',
          features: [
            'Task organization',
            'Goal tracking',
            'Time management'
          ],
          useCases: [
            'Organize tasks',
            'Track goals',
            'Manage time'
          ]
        };
    }
  };
  
  const modeDetails = getModeDetails();
  
  // Default background color and border color if theme is undefined
  const backgroundColor = theme?.cardElevated || theme?.card || '#1E1E1E';
  const borderColor = theme?.border || '#333333';
  const textColor = theme?.text || '#FFFFFF';
  const textSecondaryColor = theme?.textSecondary || '#AAAAAA';
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { 
          backgroundColor: backgroundColor,
          borderColor: borderColor
        }]}>
          <ScrollView style={{ width: '100%' }}>
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: modeDetails.color }]}>
                <Ionicons name={modeDetails.icon} size={30} color="#FFFFFF" />
              </View>
              
              <Text style={[styles.title, { color: textColor }]}>
                {modeDetails.name}
              </Text>
              
              <Text style={[styles.description, { color: textSecondaryColor }]}>
                {modeDetails.description}
              </Text>
            </View>
            
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Key Features
              </Text>
              
              <View style={styles.featureList}>
                {modeDetails.features.map((feature, index) => (
                  <View key={`feature-${index}`} style={styles.featureItem}>
                    <View style={[styles.bullet, { backgroundColor: modeDetails.color }]} />
                    <Text style={[styles.featureText, { color: textColor }]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Ideal Use Cases
              </Text>
              
              <View style={styles.featureList}>
                {modeDetails.useCases.map((useCase, index) => (
                  <View key={`usecase-${index}`} style={styles.featureItem}>
                    <View style={[styles.bullet, { backgroundColor: modeDetails.color }]} />
                    <Text style={[styles.featureText, { color: textColor }]}>
                      {useCase}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
          
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: modeDetails.color }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  section: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  featureList: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 16,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default AIModeInfoModal;
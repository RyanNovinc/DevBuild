// src/components/ai/AIModals/AIPersonalityModal.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  FlatList,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import CharacterAvatar from '../../CharacterAvatar';

// Function to get persona-specific color
const getPersonaColor = (persona, isDarkMode) => {
  switch(persona) {
    case 'default':
      return isDarkMode ? '#444444' : '#333333'; // Default dark gray
    case 'highEnergy':
      return isDarkMode ? '#F44336' : '#FF5722'; // Red/Orange
    case 'strategic':
      return isDarkMode ? '#2196F3' : '#1976D2'; // Blue shades
    case 'philosophical':
      return isDarkMode ? '#9C27B0' : '#673AB7'; // Purple shades
    case 'practical':
      return isDarkMode ? '#FF9800' : '#FFC107'; // Orange/Yellow
    case 'analytical':
      return isDarkMode ? '#607D8B' : '#455A64'; // Blue Grey
    default:
      return isDarkMode ? '#444444' : '#333333'; // Default to dark gray
  }
};

// Enhanced motivational styles data with more detailed descriptions
const motivationalStyles = [
  { 
    id: 'default', 
    name: 'Adaptive Guide', 
    description: 'Balanced support that adapts to your needs',
    details: 'Flexible approach that combines strategic thinking with practical guidance',
    iconName: 'sparkles'
  },
  { 
    id: 'highEnergy', 
    name: 'Execution Engine', 
    description: 'Direct, high-energy, results-driven acceleration',
    details: 'No-nonsense guidance focused on relentless implementation',
    iconName: 'fitness'
  },
  { 
    id: 'strategic', 
    name: 'Strategic Advisor', 
    description: 'Master strategic frameworks for ultimate leverage',
    details: 'Approaches challenges through power dynamics and positioning',
    iconName: 'analytics'
  },
  { 
    id: 'philosophical', 
    name: 'Growth Architect', 
    description: 'Build systems for sustainable long-term success',
    details: 'Balances ambition with wellbeing for sustainable growth',
    iconName: 'trending-up'
  },
  { 
    id: 'practical', 
    name: 'Innovation Catalyst', 
    description: 'Transform ideas into breakthrough opportunities',
    details: 'Helps identify emerging trends and market gaps',
    iconName: 'bulb'
  },
  { 
    id: 'analytical', 
    name: 'Systems Optimizer', 
    description: 'Data-driven performance enhancement',
    details: 'Uses analysis to identify bottlenecks and optimization points',
    iconName: 'calculator'
  }
];

/**
 * AIPersonalityModal - Modal for selecting AI personality style
 */
const AIPersonalityModal = ({ 
  visible = false, 
  selectedStyle = 'default',
  onSelect,
  onClose,
  onLearnMore
}) => {
  const { theme } = useTheme();
  const [tempSelectedStyle, setTempSelectedStyle] = useState(selectedStyle);
  
  // Determine if dark mode is active
  const isDarkMode = theme.background === '#000000' || theme.mode === 'dark';
  
  // Handle confirming selection
  const handleConfirmSelection = () => {
    if (tempSelectedStyle !== selectedStyle) {
      onSelect(tempSelectedStyle);
    } else {
      onClose();
    }
  };
  
  // Reset temp selection when modal opens
  React.useEffect(() => {
    if (visible) {
      setTempSelectedStyle(selectedStyle);
    }
  }, [visible, selectedStyle]);
  
  // Render a style option
  const renderStyleOption = ({ item }) => {
    const isSelected = tempSelectedStyle === item.id;
    const personaColor = getPersonaColor(item.id, isDarkMode);
    
    return (
      <TouchableOpacity 
        style={[
          styles.styleOption,
          {
            borderColor: isSelected ? personaColor : theme.border,
            backgroundColor: isSelected ? personaColor + '10' : theme.cardElevated || theme.card,
            borderLeftWidth: 4,
            borderLeftColor: personaColor
          }
        ]}
        onPress={() => setTempSelectedStyle(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.styleOptionContent}>
          <View style={styles.styleOptionHeader}>
            <CharacterAvatar
              styleId={item.id}
              size="small"
              style={{ marginRight: 10 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.styleOptionTitle, { 
                color: theme.text,
                fontWeight: isSelected ? 'bold' : 'normal'
              }]}>
                {item.name}
              </Text>
              <Text style={[styles.styleOptionDescription, { color: theme.textSecondary }]}>
                {item.description}
              </Text>
            </View>
          </View>
          
          {/* Add a more detailed description */}
          <Text style={[styles.styleOptionDetails, { color: theme.textSecondary }]}>
            {item.details}
          </Text>
        </View>
        
        {/* Selection indicator */}
        {isSelected && (
          <View style={[styles.checkmark, { backgroundColor: personaColor }]}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { 
          backgroundColor: theme.background,
          borderColor: theme.border,
          borderWidth: 1
        }]}>
          <View style={[styles.modalHeader, { 
            borderBottomWidth: 1,
            borderBottomColor: theme.border
          }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Choose AI Personality
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={motivationalStyles}
            keyExtractor={item => item.id}
            renderItem={renderStyleOption}
            contentContainerStyle={styles.stylesList}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={[styles.modalFooter, { 
            borderTopWidth: 1,
            borderTopColor: theme.border
          }]}>
            {/* Learn More button */}
            <TouchableOpacity
              style={[styles.learnMoreButton, { 
                backgroundColor: theme.background,
                borderColor: theme.primary,
                borderWidth: 1
              }]}
              onPress={onLearnMore}
            >
              <Ionicons name="information-circle-outline" size={20} color={theme.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.learnMoreButtonText, { color: theme.primary }]}>
                Learn More
              </Text>
            </TouchableOpacity>
            
            {/* Confirm button */}
            <TouchableOpacity
              style={[styles.confirmButton, { 
                backgroundColor: theme.primary,
                opacity: tempSelectedStyle !== selectedStyle ? 1 : 0.7
              }]}
              onPress={handleConfirmSelection}
            >
              <Text style={styles.confirmButtonText}>
                {tempSelectedStyle !== selectedStyle ? 'Confirm' : 'Close'}
              </Text>
            </TouchableOpacity>
          </View>
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
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  stylesList: {
    padding: 12,
  },
  styleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  styleOptionContent: {
    flex: 1,
    marginRight: 8,
  },
  styleOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  styleOptionTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  styleOptionDescription: {
    fontSize: 14,
  },
  styleOptionDetails: {
    fontSize: 12,
    opacity: 0.8,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    justifyContent: 'center'
  },
  learnMoreButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  }
});

export default AIPersonalityModal;
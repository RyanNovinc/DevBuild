// src/components/ai/AIModelSelector/AIModelSelector.js - Visual enhancement
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  TouchableWithoutFeedback,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';

/**
 * AIModelSelector - Modal for selecting AI model tier
 * Visually enhanced with minimalist premium design
 */
const AIModelSelector = ({ 
  visible = false, 
  selectedTier = 'navigator',
  onSelect,
  onClose
}) => {
  const { theme } = useTheme();
  const [localSelectedTier, setLocalSelectedTier] = useState(selectedTier);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Animation effects
  useEffect(() => {
    if (visible) {
      setLocalSelectedTier(selectedTier);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, selectedTier]);
  
  // Get model details based on tier
  const getModelDetails = (tier) => {
    const models = {
      guide: {
        name: 'Guide AI',
        description: 'Basic memory capacity\nQuick everyday assistance\nBest for simple interactions',
        icon: 'list',
        color: '#03A9F4'
      },
      navigator: {
        name: 'Navigator AI',
        description: 'Extended memory capacity\nDetailed planning abilities\nIdeal for project discussions',
        icon: 'git-branch',
        color: '#3F51B5'
      },
      compass: {
        name: 'Compass AI',
        description: 'Maximum memory capacity\nAdvanced reasoning power\nPerfect for in-depth planning',
        icon: 'navigate',
        color: '#673AB7'
      }
    };
    
    return models[tier] || models.navigator;
  };
  
  // Handle model selection
  const handleSelectModel = (tier) => {
    setLocalSelectedTier(tier);
  };
  
  // Apply the selected model and close
  const handleApplyModel = () => {
    onSelect(localSelectedTier);
  };
  
  // Render a single model option
  const renderModelOption = (tier) => {
    const details = getModelDetails(tier);
    const isSelected = localSelectedTier === tier;
    
    return (
      <TouchableOpacity 
        key={tier}
        style={[
          styles.modelOption,
          { backgroundColor: theme.background === '#000000' ? '#1A1A1A' : 'rgba(255,255,255,0.07)' },
          isSelected && { 
            backgroundColor: `${details.color}10`,
            borderColor: details.color,
            borderWidth: 1.5,
            shadowColor: details.color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4
          }
        ]}
        onPress={() => handleSelectModel(tier)}
        activeOpacity={0.7}
      >
        <View style={styles.modelOptionContent}>
          <View style={[styles.iconContainer, { backgroundColor: details.color }]}>
            <Ionicons name={details.icon} size={18} color="#FFFFFF" />
          </View>
          
          <View style={styles.modelDetails}>
            <Text style={[styles.modelName, { color: isSelected ? details.color : theme.text }]}>
              {details.name}
            </Text>
            <Text style={[styles.modelDescription, { color: theme.textSecondary }]}>
              {details.description}
            </Text>
          </View>
          
          {isSelected && (
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark-circle" size={22} color={details.color} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none" // Using custom animation
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[
          styles.modalOverlay,
          { opacity: fadeAnim }
        ]}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View style={[
              styles.modalContent, 
              { 
                backgroundColor: theme.background === '#000000' ? '#121212' : theme.background,
                borderColor: theme.border,
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1]
                  })
                }]
              }
            ]}>
              {/* Centered title */}
              <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Select AI Model</Text>
              </View>
              
              <View style={styles.modelOptionsContainer}>
                {/* Display in reverse order: Compass (premium) first */}
                {renderModelOption('compass')}
                {renderModelOption('navigator')}
                {renderModelOption('guide')}
              </View>
              
              <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: theme.border }]}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.applyButton, 
                    { 
                      backgroundColor: getModelDetails(localSelectedTier).color,
                      shadowColor: getModelDetails(localSelectedTier).color,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3
                    }
                  ]}
                  onPress={handleApplyModel}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backdropFilter: 'blur(8px)'
  },
  modalContent: {
    width: '92%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3
  },
  modelOptionsContainer: {
    padding: 20,
    paddingBottom: 12
  },
  modelOption: {
    marginBottom: 14,
    borderRadius: 16,
    borderWidth: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  modelOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2
  },
  modelDetails: {
    flex: 1,
  },
  modelName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 5,
    letterSpacing: 0.2
  },
  modelDescription: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.85,
    letterSpacing: 0.1
  },
  checkmarkContainer: {
    marginLeft: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3
  },
  applyButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.3
  }
});

export default AIModelSelector;
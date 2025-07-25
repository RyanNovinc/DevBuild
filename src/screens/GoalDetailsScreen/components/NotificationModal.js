// src/screens/GoalDetailsScreen/components/NotificationModal.js
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  Switch,
  Animated,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationPreferences } from '../utils/constants';
import { getTextColorForBackground } from '../utils/colorUtils';

const { height } = Dimensions.get('window');

const NotificationModal = ({
  visible,
  theme,
  selectedColor,
  notifPrefs,
  toggleNotificationPreference,
  onClose
}) => {
  // Animation for modal entrance
  const [slideAnim] = React.useState(new Animated.Value(height));
  
  // Update animation when visibility changes
  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 65,
        useNativeDriver: true
      }).start();
    } else {
      slideAnim.setValue(height);
    }
  }, [visible, slideAnim]);
  
  // Handle modal closing animation
  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true
    }).start(() => {
      onClose();
    });
  };
  
  // Get appropriate text color based on background
  const getButtonTextColor = () => {
    if (selectedColor === '#FFFFFF') return '#000000';
    return getTextColorForBackground(selectedColor);
  };
  
  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <Animated.View 
          style={[
            styles.modalContainer, 
            { 
              backgroundColor: theme.card,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={[
            styles.modalHeader, 
            { 
              borderBottomColor: theme.border
            }
          ]}>
            <View style={styles.headerContent}>
              <Ionicons 
                name="notifications-outline" 
                size={22} 
                color={selectedColor} 
                style={styles.headerIcon}
              />
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Notification Preferences
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Choose when to receive notifications for time blocks linked to this goal
            </Text>
            
            {notificationPreferences.map(pref => (
              <TouchableOpacity 
                key={pref.id} 
                style={[
                  styles.notificationPreferenceCard, 
                  notifPrefs[pref.id] ? 
                    { 
                      backgroundColor: `${selectedColor}15`, 
                      borderColor: selectedColor 
                    } : 
                    { 
                      backgroundColor: theme.backgroundSecondary, 
                      borderColor: theme.border 
                    }
                ]}
                onPress={() => toggleNotificationPreference(pref.id)}
                activeOpacity={0.7}
              >
                <View style={styles.notificationPreferenceContent}>
                  <View style={[
                    styles.notificationIconContainer, 
                    { 
                      backgroundColor: notifPrefs[pref.id] ? selectedColor : theme.backgroundTertiary,
                      // Add border for black or very dark colors in dark mode
                      borderWidth: (notifPrefs[pref.id] && selectedColor === '#000000' && theme.dark) ? 1 : 0,
                      borderColor: 'rgba(255,255,255,0.3)'
                    }
                  ]}>
                    <Ionicons 
                      name={pref.icon} 
                      size={22} 
                      // Use appropriate icon color based on background and selection state
                      color={notifPrefs[pref.id] ? 
                        (selectedColor === '#FFFFFF' ? '#000000' : getTextColorForBackground(selectedColor)) : 
                        theme.textSecondary
                      } 
                    />
                  </View>
                  <View style={styles.notificationTextContainer}>
                    <Text style={[
                      styles.notificationTitle,
                      { 
                        color: notifPrefs[pref.id] ? selectedColor : theme.text,
                        fontWeight: notifPrefs[pref.id] ? '600' : '500'
                      }
                    ]}>
                      {pref.label}
                    </Text>
                    <Text style={[styles.notificationDescription, { color: theme.textSecondary }]}>
                      {pref.description}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notifPrefs[pref.id]}
                  onValueChange={() => toggleNotificationPreference(pref.id)}
                  trackColor={{ false: theme.border, true: `${selectedColor}80` }}
                  thumbColor={notifPrefs[pref.id] ? selectedColor : '#f4f3f4'}
                />
              </TouchableOpacity>
            ))}
            
            <View style={[
              styles.infoBox, 
              { 
                backgroundColor: 'rgba(33, 150, 243, 0.08)',
                borderColor: 'rgba(33, 150, 243, 0.2)',
                borderWidth: 1
              }
            ]}>
              <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                Notifications will be sent for any time blocks that are linked to projects under this goal.
              </Text>
            </View>
          </ScrollView>
          
          <TouchableOpacity
            style={[
              styles.modalDoneButton, 
              { 
                backgroundColor: selectedColor,
                // Add border for black or very dark colors in dark mode
                borderWidth: (selectedColor === '#000000' && theme.dark) ? 1 : 0,
                borderColor: 'rgba(255,255,255,0.3)'
              }
            ]}
            onPress={handleClose}
          >
            <Text style={[
              styles.modalDoneButtonText, 
              { color: getButtonTextColor() }
            ]}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = {
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',  // Position at bottom
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    maxHeight: '80%',  // Take up to 80% of screen height
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    height: 60, // Fixed height for predictable layout
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
    maxHeight: '70%',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  notificationPreferenceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationPreferenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 13,
    lineHeight: 17,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    marginLeft: 10,
  },
  modalDoneButton: {
    marginTop: 10,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  modalDoneButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
};

export default NotificationModal;
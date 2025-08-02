// src/screens/GoalDetailsScreen/components/AdvancedSection.js
import React from 'react';
import { View, Text, TouchableOpacity, Switch, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTextColorForBackground } from '../utils/colorUtils';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  accessibility,
  meetsContrastRequirements
} from '../../../utils/responsive';

const AdvancedSection = ({
  theme,
  selectedColor,
  isCreating,
  navigateToProgressView,
  setNotificationsModal,
  expandedSection,
  setExpandedSection,
  getActiveNotificationCount,
  getLinkedProjects,
  projectsToShare,
  toggleProjectSharing,
  shareFormat,
  setShareFormat,
  copyToClipboard,
  handleShareGoal,
  getLinkedProjectsCount,
  handleDeleteConfirmation,
  isLoading
}) => {
  // Animation for section expansion
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  // Run animation when expanded section changes
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: expandedSection === 'share' ? 1 : 0,
      duration: 200,
      useNativeDriver: true
    }).start();
  }, [expandedSection, fadeAnim]);
  
  // Calculate minimum touch target size
  const minTouchSize = Math.max(scaleWidth(44), accessibility.minTouchTarget);
  
  // Check if the selected color has good contrast with white text
  const hasGoodTextContrast = meetsContrastRequirements('#FFFFFF', selectedColor);
  
  // Custom button component for consistency
  const ActionButton = ({ icon, label, onPress, disabled, destructive }) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        {
          minHeight: minTouchSize,
          minWidth: minTouchSize,
          paddingVertical: spacing.s
        },
        disabled && { opacity: 0.6 }
      ]}
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Ionicons 
        name={icon} 
        size={scaleWidth(22)} 
        color={destructive ? theme.error : selectedColor} 
      />
      <Text 
        style={[
          styles.actionButtonText, 
          { 
            color: destructive ? theme.error : theme.text,
            fontSize: fontSizes.s,
            marginTop: spacing.xs
          }
        ]}
        maxFontSizeMultiplier={1.5}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[
      styles.sectionContainer, 
      { 
        backgroundColor: theme.card,
        padding: spacing.l,
        borderRadius: scaleWidth(15)
      }
    ]}>
      <View style={styles.formGroup}>
        <Text 
          style={[
            styles.sectionLabel, 
            { 
              color: theme.text,
              fontSize: fontSizes.l
            }
          ]}
          maxFontSizeMultiplier={1.5}
          accessibilityRole="header"
        >
          Advanced Options
        </Text>
        
        {/* Goal Progress Section */}
        <View style={[
          styles.optionSection, 
          { 
            borderColor: theme.border,
            backgroundColor: theme.backgroundSecondary,
            borderWidth: 1,
            borderRadius: scaleWidth(12),
            marginBottom: spacing.m
          }
        ]}>
          <TouchableOpacity 
            style={[
              styles.optionHeader,
              {
                padding: spacing.m,
                minHeight: minTouchSize
              }
            ]}
            onPress={navigateToProgressView}
            disabled={isCreating}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Detailed Progress Timeline"
            accessibilityHint={isCreating ? "Available after saving goal" : "View detailed progress timeline"}
            accessibilityState={{ disabled: isCreating }}
          >
            <View style={styles.optionTitleRow}>
              <Ionicons 
                name="trending-up-outline" 
                size={scaleWidth(22)} 
                color={selectedColor} 
                style={{ marginRight: spacing.s }}
              />
              <Text 
                style={[
                  styles.optionTitle, 
                  { 
                    color: theme.text,
                    fontSize: fontSizes.m
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Detailed Progress Timeline
              </Text>
            </View>
            
            <View style={styles.optionStatusContainer}>
              <Text 
                style={[
                  styles.optionStatusText, 
                  { 
                    color: theme.textSecondary,
                    fontSize: fontSizes.s,
                    marginRight: spacing.xxs
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                {isCreating ? 'Available after save' : 'View'}
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={scaleWidth(18)} 
                color={theme.textSecondary}
                style={{ marginLeft: spacing.xxs }}
              />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Notification Preferences Section */}
        <View style={[
          styles.optionSection, 
          { 
            borderColor: theme.border,
            backgroundColor: theme.backgroundSecondary,
            borderWidth: 1,
            borderRadius: scaleWidth(12),
            marginBottom: spacing.m
          }
        ]}>
          <TouchableOpacity 
            style={[
              styles.optionHeader,
              {
                padding: spacing.m,
                minHeight: minTouchSize
              }
            ]}
            onPress={() => {
              if (isCreating) {
                alert('Please save your goal first to set notification preferences');
                return;
              }
              setNotificationsModal(true);
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Notification Preferences"
            accessibilityHint={isCreating ? "Available after saving goal" : `${getActiveNotificationCount() > 0 ? getActiveNotificationCount() + ' notifications set' : 'Set notification preferences'}`}
          >
            <View style={styles.optionTitleRow}>
              <Ionicons 
                name="notifications-outline" 
                size={scaleWidth(22)} 
                color={selectedColor} 
                style={{ marginRight: spacing.s }}
              />
              <Text 
                style={[
                  styles.optionTitle, 
                  { 
                    color: theme.text,
                    fontSize: fontSizes.m
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Notification Preferences
              </Text>
            </View>
            
            <View style={styles.optionStatusContainer}>
              {getActiveNotificationCount() > 0 ? (
                <View style={[
                  styles.notificationBadge, 
                  { 
                    backgroundColor: selectedColor,
                    // Add border for black color on dark theme
                    borderWidth: (selectedColor === '#000000' && theme.dark) ? 1 : 0,
                    borderColor: 'rgba(255,255,255,0.3)',
                    width: scaleWidth(24),
                    height: scaleWidth(24),
                    borderRadius: scaleWidth(12),
                    marginRight: spacing.xs
                  }
                ]}>
                  <Text style={[
                    styles.notificationBadgeText,
                    { 
                      color: selectedColor === '#FFFFFF' ? '#000000' : getTextColorForBackground(selectedColor),
                      fontSize: fontSizes.xs
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                  >
                    {getActiveNotificationCount()}
                  </Text>
                </View>
              ) : (
                <Text 
                  style={[
                    styles.optionStatusText, 
                    { 
                      color: theme.textSecondary,
                      fontSize: fontSizes.s,
                      marginRight: spacing.xxs
                    }
                  ]}
                  maxFontSizeMultiplier={1.5}
                >
                  {isCreating ? 'Available after save' : 'Not set'}
                </Text>
              )}
              <Ionicons 
                name="chevron-forward" 
                size={scaleWidth(18)} 
                color={theme.textSecondary} 
                style={{ marginLeft: spacing.xxs }}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Share Goal Section */}
        <View style={[
          styles.optionSection, 
          { 
            borderColor: theme.border,
            backgroundColor: theme.backgroundSecondary,
            borderWidth: 1,
            borderRadius: scaleWidth(12),
            marginBottom: spacing.m
          }
        ]}>
          <TouchableOpacity 
            style={[
              styles.optionHeader,
              {
                padding: spacing.m,
                minHeight: minTouchSize
              }
            ]}
            onPress={() => {
              if (isCreating) {
                alert('Please save your goal first to share it');
                return;
              }
              setExpandedSection(expandedSection === 'share' ? null : 'share');
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Share Goal"
            accessibilityHint={isCreating ? "Available after saving goal" : "Configure sharing options for your goal"}
            accessibilityState={{ expanded: expandedSection === 'share' }}
          >
            <View style={styles.optionTitleRow}>
              <Ionicons 
                name="share-social-outline" 
                size={scaleWidth(22)} 
                color={selectedColor} 
                style={{ marginRight: spacing.s }}
              />
              <Text 
                style={[
                  styles.optionTitle, 
                  { 
                    color: theme.text,
                    fontSize: fontSizes.m
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Share Goal
              </Text>
            </View>
            <Ionicons 
              name={expandedSection === 'share' ? 'chevron-up' : 'chevron-down'} 
              size={scaleWidth(20)} 
              color={theme.textSecondary} 
            />
          </TouchableOpacity>
          
          {/* Expandable Content */}
          {expandedSection === 'share' && !isCreating && (
            <Animated.View 
              style={[
                styles.expandableContent, 
                { 
                  borderTopColor: theme.border,
                  borderTopWidth: 1,
                  padding: spacing.m,
                  paddingTop: 0,
                  opacity: fadeAnim
                }
              ]}
            >
              <Text 
                style={[
                  styles.expandableSubtitle, 
                  { 
                    color: theme.textSecondary,
                    fontSize: fontSizes.s,
                    marginBottom: spacing.m,
                    lineHeight: scaleHeight(20)
                  }
                ]}
                maxFontSizeMultiplier={1.8}
              >
                Create a shareable version of your goal to send to others
              </Text>
              
              {/* Share Format Options */}
              <Text 
                style={[
                  styles.optionSubheader, 
                  { 
                    color: theme.text,
                    fontSize: fontSizes.m,
                    marginBottom: spacing.s
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Format:
              </Text>
              
              <View style={styles.shareFormatButtons}>
                <TouchableOpacity
                  style={[
                    styles.shareFormatButton,
                    {
                      flex: 1,
                      borderWidth: 1,
                      borderRadius: scaleWidth(8),
                      paddingVertical: spacing.s,
                      marginRight: spacing.s,
                      minHeight: minTouchSize,
                      alignItems: 'center',
                      justifyContent: 'center'
                    },
                    shareFormat === 'simple' ? 
                      { backgroundColor: `${selectedColor}20`, borderColor: selectedColor } : 
                      { backgroundColor: theme.backgroundTertiary, borderColor: theme.border }
                  ]}
                  onPress={() => setShareFormat('simple')}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityLabel="Simple format"
                  accessibilityState={{ checked: shareFormat === 'simple' }}
                >
                  <Text
                    style={[
                      styles.shareFormatButtonText,
                      { 
                        color: shareFormat === 'simple' ? selectedColor : theme.textSecondary,
                        fontWeight: '500',
                        fontSize: fontSizes.s
                      }
                    ]}
                    maxFontSizeMultiplier={1.5}
                  >
                    Simple
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.shareFormatButton,
                    {
                      flex: 1,
                      borderWidth: 1,
                      borderRadius: scaleWidth(8),
                      paddingVertical: spacing.s,
                      minHeight: minTouchSize,
                      alignItems: 'center',
                      justifyContent: 'center'
                    },
                    shareFormat === 'detailed' ? 
                      { backgroundColor: `${selectedColor}20`, borderColor: selectedColor } : 
                      { backgroundColor: theme.backgroundTertiary, borderColor: theme.border }
                  ]}
                  onPress={() => setShareFormat('detailed')}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityLabel="Detailed format"
                  accessibilityState={{ checked: shareFormat === 'detailed' }}
                >
                  <Text
                    style={[
                      styles.shareFormatButtonText,
                      { 
                        color: shareFormat === 'detailed' ? selectedColor : theme.textSecondary,
                        fontWeight: '500',
                        fontSize: fontSizes.s
                      }
                    ]}
                    maxFontSizeMultiplier={1.5}
                  >
                    Detailed
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Project selection for sharing */}
              <Text 
                style={[
                  styles.optionSubheader, 
                  { 
                    color: theme.text,
                    fontSize: fontSizes.m,
                    marginTop: spacing.l,
                    marginBottom: spacing.s
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Include Projects:
              </Text>
              
              {getLinkedProjects().length === 0 ? (
                <View style={[
                  styles.emptyProjectsContainer, 
                  { 
                    backgroundColor: theme.backgroundTertiary,
                    borderColor: theme.border,
                    borderWidth: 1,
                    borderRadius: scaleWidth(8),
                    padding: spacing.m,
                    minHeight: minTouchSize
                  }
                ]}>
                  <Ionicons name="folder-outline" size={scaleWidth(20)} color={theme.textSecondary} />
                  <Text 
                    style={[
                      styles.noProjectsText, 
                      { 
                        color: theme.textSecondary,
                        fontSize: fontSizes.s,
                        fontStyle: 'italic',
                        marginLeft: spacing.s
                      }
                    ]}
                    maxFontSizeMultiplier={1.5}
                  >
                    No projects linked to this goal
                  </Text>
                </View>
              ) : (
                <View style={[
                  styles.shareProjectsList,
                  { 
                    backgroundColor: theme.backgroundTertiary,
                    borderColor: theme.border,
                    borderWidth: 1,
                    borderRadius: scaleWidth(8)
                  }
                ]}>
                  {getLinkedProjects().map(project => (
                    <View 
                      key={project.id} 
                      style={[
                        styles.shareProjectItem, 
                        { 
                          borderBottomColor: theme.border,
                          borderBottomWidth: 1,
                          paddingVertical: spacing.s,
                          paddingHorizontal: spacing.m,
                          minHeight: minTouchSize
                        }
                      ]}
                    >
                      <Text 
                        style={[
                          styles.shareProjectTitle, 
                          { 
                            color: theme.text,
                            fontSize: fontSizes.m
                          }
                        ]}
                        maxFontSizeMultiplier={1.5}
                      >
                        {project.title}
                      </Text>
                      <Switch
                        value={projectsToShare[project.id] || false}
                        onValueChange={() => toggleProjectSharing(project.id)}
                        trackColor={{ false: theme.border, true: `${selectedColor}80` }}
                        thumbColor={projectsToShare[project.id] ? selectedColor : '#f4f3f4'}
                        accessible={true}
                        accessibilityLabel={`Include ${project.title} ${projectsToShare[project.id] ? 'on' : 'off'}`}
                        accessibilityRole="switch"
                        accessibilityState={{ checked: projectsToShare[project.id] || false }}
                      />
                    </View>
                  ))}
                </View>
              )}
              
              {/* Share buttons */}
              <View style={[
                styles.actionButtonsContainer, 
                { 
                  borderTopColor: theme.border,
                  borderTopWidth: 1,
                  paddingTop: spacing.m,
                  marginTop: spacing.l,
                  minHeight: scaleHeight(70)
                }
              ]}>
                <ActionButton 
                  icon="copy-outline" 
                  label="Copy Text" 
                  onPress={copyToClipboard} 
                />
                
                <ActionButton 
                  icon="share-social-outline" 
                  label="Share" 
                  onPress={handleShareGoal} 
                />
              </View>
            </Animated.View>
          )}
        </View>

        {/* Delete Button (only when editing) */}
        {!isCreating && (
          <View style={[
            styles.dangerZone, 
            { 
              borderColor: theme.errorLight,
              backgroundColor: theme.dark ? 'rgba(244, 67, 54, 0.08)' : 'rgba(244, 67, 54, 0.04)',
              marginTop: spacing.l,
              padding: spacing.m,
              borderRadius: scaleWidth(10),
              borderWidth: 1,
              borderStyle: 'dashed'
            }
          ]}>
            <Text 
              style={[
                styles.dangerZoneTitle, 
                { 
                  color: theme.error,
                  fontSize: fontSizes.m,
                  fontWeight: '600',
                  marginBottom: spacing.s
                }
              ]}
              maxFontSizeMultiplier={1.5}
              accessibilityRole="header"
            >
              Danger Zone
            </Text>
            
            <View style={{ marginBottom: spacing.m }}>
              {getLinkedProjectsCount() > 0 && (
                <Text 
                  style={[
                    styles.linkedProjectsWarningText, 
                    { 
                      color: theme.textSecondary,
                      fontSize: fontSizes.s,
                      lineHeight: scaleHeight(20)
                    }
                  ]}
                  maxFontSizeMultiplier={1.8}
                >
                  <Text style={{ fontWeight: 'bold' }}>Note:</Text> Deleting this goal will also delete all {getLinkedProjectsCount()} linked {getLinkedProjectsCount() === 1 ? 'project' : 'projects'} and their tasks.
                </Text>
              )}
            </View>
            
            <TouchableOpacity 
              style={[
                styles.deleteButton, 
                { 
                  backgroundColor: theme.errorLight,
                  borderRadius: scaleWidth(8),
                  paddingVertical: spacing.s,
                  minHeight: minTouchSize
                }
              ]} 
              onPress={handleDeleteConfirmation}
              disabled={isLoading}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Delete Goal"
              accessibilityHint={`Permanently removes this goal ${getLinkedProjectsCount() > 0 ? `and all ${getLinkedProjectsCount()} linked ${getLinkedProjectsCount() === 1 ? 'project' : 'projects'}` : ''}`}
              accessibilityState={{ disabled: isLoading }}
            >
              <Ionicons name="trash-outline" size={scaleWidth(20)} color={theme.error} />
              <Text 
                style={[
                  styles.deleteButtonText, 
                  { 
                    color: theme.error,
                    fontSize: fontSizes.m,
                    fontWeight: '500',
                    marginLeft: spacing.s
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Delete Goal
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = {
  sectionContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  formGroup: {
    marginBottom: spacing.l,
  },
  sectionLabel: {
    fontWeight: '600',
    marginBottom: spacing.m,
  },
  
  // Option sections
  optionSection: {
    overflow: 'hidden',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTitle: {
    fontWeight: '500',
  },
  optionStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontWeight: 'bold',
  },
  
  // Expandable content
  expandableContent: {
  },
  
  // Share section
  shareFormatButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  // Action buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Delete button
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default AdvancedSection;
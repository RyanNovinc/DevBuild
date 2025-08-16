// src/components/WipEducationModal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const WipEducationModal = ({ visible, onClose, theme, isDarkMode = true }) => {
  const insets = useSafeAreaInsets();
  const [showResearch, setShowResearch] = useState(false);
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.modalContainer,
          { 
            backgroundColor: theme.background || '#000000',
            borderColor: theme.border || 'rgba(255,255,255,0.2)',
            marginTop: insets.top + 20,
            marginBottom: insets.bottom + 20
          }
        ]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="speedometer" size={24} color="#2196F3" />
            </View>
            <Text style={[styles.title, { color: theme.text || '#FFFFFF' }]}>
              Work-in-Progress Limits
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close WIP education modal"
            >
              <Ionicons name="close" size={24} color={theme.textSecondary || 'rgba(255,255,255,0.7)'} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Main explanation - clean and direct */}
            <View style={styles.section}>
              <Text style={[styles.mainText, { color: theme.text || '#FFFFFF' }]}>
                Limit how many tasks you work on simultaneously to{' '}
                <Text style={styles.highlight}>stay focused and finish faster</Text>.
              </Text>
            </View>

            {/* Key benefits - minimal design */}
            <View style={styles.benefitsGrid}>
              <View style={styles.benefitCard}>
                <View style={[styles.benefitIcon, { backgroundColor: '#4CAF5015' }]}>
                  <Ionicons name="eye" size={20} color="#4CAF50" />
                </View>
                <Text style={[styles.benefitTitle, { color: theme.text || '#FFFFFF' }]}>
                  Better Focus
                </Text>
                <Text style={[styles.benefitText, { color: theme.textSecondary || 'rgba(255,255,255,0.7)' }]}>
                  Less task switching means deeper work
                </Text>
              </View>

              <View style={styles.benefitCard}>
                <View style={[styles.benefitIcon, { backgroundColor: '#2196F315' }]}>
                  <Ionicons name="flash" size={20} color="#2196F3" />
                </View>
                <Text style={[styles.benefitTitle, { color: theme.text || '#FFFFFF' }]}>
                  Faster Completion
                </Text>
                <Text style={[styles.benefitText, { color: theme.textSecondary || 'rgba(255,255,255,0.7)' }]}>
                  Finish tasks one by one instead of juggling many
                </Text>
              </View>

              <View style={styles.benefitCard}>
                <View style={[styles.benefitIcon, { backgroundColor: '#FF980015' }]}>
                  <Ionicons name="trending-up" size={20} color="#FF9800" />
                </View>
                <Text style={[styles.benefitTitle, { color: theme.text || '#FFFFFF' }]}>
                  Build Momentum
                </Text>
                <Text style={[styles.benefitText, { color: theme.textSecondary || 'rgba(255,255,255,0.7)' }]}>
                  Completing tasks creates positive energy
                </Text>
              </View>

              <View style={styles.benefitCard}>
                <View style={[styles.benefitIcon, { backgroundColor: '#9C27B015' }]}>
                  <Ionicons name="heart" size={20} color="#9C27B0" />
                </View>
                <Text style={[styles.benefitTitle, { color: theme.text || '#FFFFFF' }]}>
                  Less Stress
                </Text>
                <Text style={[styles.benefitText, { color: theme.textSecondary || 'rgba(255,255,255,0.7)' }]}>
                  Fewer active commitments reduce overwhelm
                </Text>
              </View>
            </View>

            {/* How to adjust - simple guidance */}
            <View style={[styles.adjustmentCard, { 
              backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.08)' : 'rgba(33, 150, 243, 0.05)',
              borderColor: 'rgba(33, 150, 243, 0.2)'
            }]}>
              <Text style={[styles.adjustmentTitle, { color: theme.text || '#FFFFFF' }]}>
                Finding Your Sweet Spot
              </Text>
              <Text style={[styles.adjustmentText, { color: theme.textSecondary || 'rgba(255,255,255,0.8)' }]}>
                Start with 3 tasks. Feel overwhelmed? Go lower. Finishing too quickly? Go higher.{' '}
                <Text style={styles.highlight}>Use the +/- buttons</Text> to adjust anytime.
              </Text>
            </View>

            {/* Research button */}
            <TouchableOpacity 
              style={[styles.socialProofButton, {
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,255,255,0.1)'
              }]}
              onPress={() => setShowResearch(true)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="See the research behind WIP limits"
            >
              <View style={styles.socialProofContent}>
                <View style={styles.socialProofIcon}>
                  <Ionicons name="school" size={18} color="#4CAF50" />
                </View>
                <Text style={[styles.socialProofText, { color: theme.textSecondary || 'rgba(255,255,255,0.8)' }]}>
                  See the research behind this method
                </Text>
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.gotItButton, { backgroundColor: theme.primary || '#2196F3' }]}
              onPress={onClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close and apply WIP limit knowledge"
            >
              <Text style={[styles.gotItText, { color: '#FFFFFF' }]}>
                Got it!
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Research Modal */}
      <Modal
        visible={showResearch}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResearch(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.overlay}>
          <View style={[
            styles.researchModalContainer,
            { 
              backgroundColor: theme.background || '#000000',
              borderColor: theme.border || 'rgba(255,255,255,0.2)',
              marginTop: insets.top + 40,
              marginBottom: insets.bottom + 40
            }
          ]}>
            {/* Research Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setShowResearch(false)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Go back to WIP guide"
              >
                <Ionicons name="arrow-back" size={24} color={theme.textSecondary || 'rgba(255,255,255,0.7)'} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: theme.text || '#FFFFFF' }]}>
                Research & Evidence
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close all modals"
              >
                <Ionicons name="close" size={24} color={theme.textSecondary || 'rgba(255,255,255,0.7)'} />
              </TouchableOpacity>
            </View>

            {/* Research Content */}
            <ScrollView 
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Research validation introduction */}
              <View style={styles.section}>
                <Text style={[styles.researchTitle, { color: theme.text || '#FFFFFF' }]}>
                  The Science Behind These Benefits
                </Text>
                <Text style={[styles.researchText, { color: theme.textSecondary || 'rgba(255,255,255,0.8)' }]}>
                  The personal benefits you just read aren't just theory - they're backed by research from major organizations using WIP limits.
                </Text>
              </View>

              {/* Research studies */}
              <View style={styles.studiesContainer}>
                <TouchableOpacity 
                  style={[styles.studyCard, { borderColor: 'rgba(255,255,255,0.1)' }]}
                  onPress={() => Linking.openURL('https://www.atlassian.com/agile/kanban/wip-limits')}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Open Atlassian research on WIP limits"
                >
                  <View style={styles.studyHeader}>
                    <View style={[styles.studyIcon, { backgroundColor: '#0052CC15' }]}>
                      <Ionicons name="document-text" size={20} color="#0052CC" />
                    </View>
                    <View style={styles.studyInfo}>
                      <Text style={[styles.studyTitle, { color: theme.text || '#FFFFFF' }]}>
                        Atlassian: WIP Limits Guide
                      </Text>
                      <Text style={[styles.studySource, { color: theme.textSecondary || 'rgba(255,255,255,0.6)' }]}>
                        Official Atlassian Documentation
                      </Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color="rgba(255,255,255,0.4)" />
                  </View>
                  <Text style={[styles.studyDescription, { color: theme.textSecondary || 'rgba(255,255,255,0.7)' }]}>
                    Comprehensive guide on how WIP limits reduce multitasking and encourage team focus.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.studyCard, { borderColor: 'rgba(255,255,255,0.1)' }]}
                  onPress={() => Linking.openURL('https://teachingagile.com/kanban/introduction/kanban-wip-limits')}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Open Teaching Agile guide to WIP limits"
                >
                  <View style={styles.studyHeader}>
                    <View style={[styles.studyIcon, { backgroundColor: '#FF6B3515' }]}>
                      <Ionicons name="analytics" size={20} color="#FF6B35" />
                    </View>
                    <View style={styles.studyInfo}>
                      <Text style={[styles.studyTitle, { color: theme.text || '#FFFFFF' }]}>
                        WIP Limits in Kanban
                      </Text>
                      <Text style={[styles.studySource, { color: theme.textSecondary || 'rgba(255,255,255,0.6)' }]}>
                        Teaching Agile
                      </Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color="rgba(255,255,255,0.4)" />
                  </View>
                  <Text style={[styles.studyDescription, { color: theme.textSecondary || 'rgba(255,255,255,0.7)' }]}>
                    Educational guide on optimizing flow and boosting team throughput through WIP limit implementation.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.studyCard, { borderColor: 'rgba(255,255,255,0.1)' }]}
                  onPress={() => Linking.openURL('https://teamhood.com/kanban-resources/kanban-wip-limits/')}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Open Teamhood guide to WIP limits best practices"
                >
                  <View style={styles.studyHeader}>
                    <View style={[styles.studyIcon, { backgroundColor: '#4CAF5015' }]}>
                      <Ionicons name="school" size={20} color="#4CAF50" />
                    </View>
                    <View style={styles.studyInfo}>
                      <Text style={[styles.studyTitle, { color: theme.text || '#FFFFFF' }]}>
                        WIP Limits: Best Practices
                      </Text>
                      <Text style={[styles.studySource, { color: theme.textSecondary || 'rgba(255,255,255,0.6)' }]}>
                        Teamhood Resources
                      </Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color="rgba(255,255,255,0.4)" />
                  </View>
                  <Text style={[styles.studyDescription, { color: theme.textSecondary || 'rgba(255,255,255,0.7)' }]}>
                    Practical guide covering definition, benefits, and implementation best practices for WIP limits.
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Key benefits section */}
              <View style={[styles.benefitsSection, { 
                backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.08)' : 'rgba(76, 175, 80, 0.05)',
                borderColor: 'rgba(76, 175, 80, 0.2)'
              }]}>
                <Text style={[styles.benefitsSectionTitle, { color: theme.text || '#FFFFFF' }]}>
                  What the Research Confirms
                </Text>
                <View style={styles.benefitsList}>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={[styles.benefitItemText, { color: theme.textSecondary || 'rgba(255,255,255,0.8)' }]}>
                      Reduces multitasking and improves focus
                    </Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={[styles.benefitItemText, { color: theme.textSecondary || 'rgba(255,255,255,0.8)' }]}>
                      Completing tasks creates positive momentum
                    </Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={[styles.benefitItemText, { color: theme.textSecondary || 'rgba(255,255,255,0.8)' }]}>
                      Fewer active commitments reduce overwhelm
                    </Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={[styles.benefitItemText, { color: theme.textSecondary || 'rgba(255,255,255,0.8)' }]}>
                      Visible bottlenecks help you finish faster
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 450,
    height: '90%',
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  mainText: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    letterSpacing: 0.3,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '600',
    color: '#2196F3',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  benefitCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  benefitText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  adjustmentCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  adjustmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  adjustmentText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  socialProofButton: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  socialProofContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  socialProofIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  socialProofText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    letterSpacing: 0.2,
  },
  researchModalContainer: {
    width: '100%',
    maxWidth: 480,
    height: '85%',
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  researchTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  researchText: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  studiesContainer: {
    marginBottom: 24,
  },
  studyCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  studyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  studyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studyInfo: {
    flex: 1,
  },
  studyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  studySource: {
    fontSize: 12,
    letterSpacing: 0.1,
  },
  studyDescription: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  benefitsSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  benefitsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  benefitItemText: {
    fontSize: 13,
    marginLeft: 10,
    letterSpacing: 0.2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
  },
  gotItButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gotItText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default WipEducationModal;
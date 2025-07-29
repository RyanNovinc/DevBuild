// src/screens/Onboarding/styles/onboardingStyles.js
import { StyleSheet, Dimensions } from 'react-native';

// Responsive style helper
export const scale = (size, factor = 0.1) => {
  const { width, height } = Dimensions.get('window');
  const scaleFactor = Math.min(width, height) / 375; // Base scale on iPhone 8
  const scaledSize = size + (scaleFactor - 1) * size * factor;
  return Math.round(scaledSize);
};

export const onboardingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: scale(18, 0.2),
    fontWeight: '500',
    color: '#AAAAAA',
    marginBottom: 8,
  },
  iconCircle: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: scale(32, 0.2),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: scale(16, 0.3),
    color: '#BBBBBB',
    textAlign: 'center',
    marginBottom: 8,
  },
  socialProof: {
    fontSize: scale(14, 0.3),
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  
  // Statistics Slideshow
  statisticsContainer: {
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    width: '95%',
    borderLeftWidth: 2,
    borderLeftColor: '#2563eb',
    overflow: 'hidden',
  },
  statisticContent: {
    width: '100%',
  },
  statisticText: {
    fontSize: scale(16, 0.3),
    color: '#FFFFFF',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 8,
  },
  statisticSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statisticSource: {
    fontSize: scale(12, 0.3),
    color: '#AAAAAA',
    fontStyle: 'italic',
  },
  infoButton: {
    padding: 4,
  },
  slideIndicatorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  slideIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#555555',
    marginHorizontal: 3,
  },
  slideIndicatorActive: {
    backgroundColor: '#2563eb',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tapToAdvanceText: {
    fontSize: scale(10, 0.3),
    color: '#777777',
    textAlign: 'center',
    marginTop: 6,
  },
  
  // Statistic Detail Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statDetailsContent: {
    backgroundColor: '#121214',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxWidth: 350,
    maxHeight: '70%',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  statDetailsTitle: {
    fontSize: scale(18, 0.2),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  statDetailsScroll: {
    marginBottom: 16,
  },
  statDetailsSection: {
    marginBottom: 12,
  },
  statDetailsSectionTitle: {
    fontSize: scale(14, 0.3),
    fontWeight: 'bold',
    color: '#AAAAAA',
    marginBottom: 4,
  },
  statDetailsText: {
    fontSize: scale(14, 0.3),
    color: '#FFFFFF',
    lineHeight: 20,
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sourceButtonText: {
    fontSize: scale(14, 0.3),
    fontWeight: '500',
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: '#333333',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: scale(14, 0.3),
    fontWeight: '500',
    color: '#FFFFFF',
  },
  
  // Methodology toggle
  methodologyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginVertical: 8,
  },
  methodologyToggleText: {
    color: '#2563eb',
    fontSize: scale(14, 0.3),
    marginRight: 4,
  },
  // Methodology collapsible container
  methodologyContainer: {
    backgroundColor: '#0c0c0c',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    width: '100%',
  },
  methodologyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  methodologyItem: {
    flex: 1,
    alignItems: 'center',
  },
  methodologyLabel: {
    fontSize: scale(14, 0.3),
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  methodologyFlow: {
    alignItems: 'center',
  },
  methodologyText: {
    fontSize: scale(12, 0.3),
    color: '#BBBBBB',
    marginVertical: 2,
  },
  methodologyDivider: {
    width: 1,
    backgroundColor: '#333333',
    marginHorizontal: 8,
  },
  // AI Message
  aiMessageContainer: {
    flexDirection: 'row',
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 12,
    marginVertical: 10,
    width: '95%',
    borderLeftWidth: 2,
    borderLeftColor: '#2563eb',
    alignSelf: 'center',
  },
  aiIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  aiMessageContent: {
    flex: 1,
  },
  aiMessageText: {
    fontSize: scale(14, 0.3),
    color: '#FFFFFF',
    lineHeight: 20,
  },
  cursor: {
    color: '#FFFFFF',
  },
  // Buttons
  buttonContainerCentered: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 16,
    width: '100%',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    minWidth: 180,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: scale(16, 0.2),
    fontWeight: '600',
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: '#555555',
    opacity: 0.6,
  },
  skipButton: {
    padding: 8,
  },
  skipButtonText: {
    color: '#AAAAAA',
    fontSize: scale(14, 0.3),
  },
  buttonContainer: {
    width: '100%',
    marginTop: 'auto',
  },
  // Progress indicator
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#555555',
  },
  activeDot: {
    backgroundColor: '#2563eb',
  },
  progressLine: {
    width: 30,
    height: 2,
    backgroundColor: '#555555',
    marginHorizontal: 3,
  },
  activeLine: {
    backgroundColor: '#2563eb',
  },
  screenTitle: {
    fontSize: scale(22, 0.2),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  // Focus tabs
  focusTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    width: '100%',
  },
  focusTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    backgroundColor: '#121212',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  selectedFocusTab: {
    backgroundColor: '#1e3a8a',
  },
  focusTabText: {
    fontSize: scale(14, 0.3),
    color: '#BBBBBB',
    marginTop: 4,
  },
  selectedFocusTabText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  focusDescriptionContainer: {
    backgroundColor: '#121212',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    width: '100%',
  },
  focusDescription: {
    fontSize: scale(14, 0.3),
    color: '#BBBBBB',
    textAlign: 'center',
  },
  // Life direction
  lifeDirectionContainer: {
    width: '100%',
    marginVertical: 8,
  },
  lifeDirectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lifeDirectionLabel: {
    fontSize: scale(14, 0.3),
    color: '#AAAAAA',
    marginRight: 4,
  },
  updateLaterText: {
    fontSize: scale(12, 0.3),
    color: '#777777',
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  lifeDirectionInput: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 12,
    fontSize: scale(14, 0.3),
    color: '#FFFFFF',
    minHeight: 70,
    textAlignVertical: 'top',
    borderLeftWidth: 2,
    borderLeftColor: '#2563eb',
  },
  navigationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontSize: scale(14, 0.3),
  },
  // Learn More Toggle
  learnMoreToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginVertical: 4,
  },
  learnMoreToggleText: {
    color: '#2563eb',
    fontSize: scale(14, 0.3),
    marginRight: 4,
  },
  // Learn More Content
  learnMoreContainer: {
    backgroundColor: '#0c0c0c',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    borderLeftWidth: 2,
    borderLeftColor: '#2563eb',
  },
  learnMoreTitle: {
    fontSize: scale(16, 0.2),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  learnMoreText: {
    fontSize: scale(14, 0.3),
    color: '#BBBBBB',
    marginBottom: 12,
  },
  learnMoreItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  learnMoreIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  learnMoreItemContent: {
    flex: 1,
  },
  learnMoreItemTitle: {
    fontSize: scale(14, 0.3),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  learnMoreItemText: {
    fontSize: scale(12, 0.3),
    color: '#AAAAAA',
  },
  // Hierarchy visualization
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 70,
  },
  hierarchyItemCollapsible: {
    backgroundColor: '#0c0c0c',
    borderRadius: 12,
    marginBottom: 8,
    width: '100%',
    overflow: 'hidden',
  },
  hierarchyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  hierarchyIconSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  hierarchyHeaderText: {
    flex: 1,
    fontSize: scale(16, 0.3),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  hierarchyContent: {
    padding: 12,
    paddingTop: 0,
  },
  hierarchyEditInput: {
    backgroundColor: '#121212',
    borderRadius: 8,
    padding: 10,
    fontSize: scale(14, 0.3),
    color: '#FFFFFF',
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#2563eb',
  },
  hierarchyEditInputSmall: {
    fontSize: scale(12, 0.3),
    color: '#AAAAAA',
  },
  hierarchyTitle: {
    fontSize: scale(14, 0.3),
    color: '#FFFFFF',
    marginBottom: 4,
  },
  hierarchyText: {
    fontSize: scale(14, 0.3),
    color: '#FFFFFF',
    lineHeight: 20,
  },
  hierarchySubtext: {
    fontSize: scale(12, 0.3),
    color: '#888888',
    marginTop: 2,
  },
  hierarchyConnector: {
    alignItems: 'center',
    height: 16,
    justifyContent: 'center',
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: scale(12, 0.3),
    fontWeight: '500',
    marginRight: 6,
  },
  tasksList: {
    marginTop: 4,
  },
  taskItemEditable: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskTextInput: {
    flex: 1,
    fontSize: scale(14, 0.3),
    color: '#FFFFFF',
    marginLeft: 6,
    padding: 4,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 20,
  },
  addTaskText: {
    fontSize: scale(12, 0.3),
    color: '#2563eb',
    marginLeft: 6,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskText: {
    fontSize: scale(14, 0.3),
    color: '#FFFFFF',
    marginLeft: 6,
  },
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  floatingPrimaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    width: '100%',
  },
  floatingBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  
  // Badge Modal
  badgeContent: {
    backgroundColor: '#121214',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  badgeIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  badgeTitle: {
    fontSize: scale(20, 0.2),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  badgeText: {
    fontSize: scale(14, 0.3),
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  claimButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 180,
    alignItems: 'center',
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: scale(14, 0.3),
    fontWeight: 'bold',
  },
  rewardContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  rewardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  rewardText: {
    fontSize: scale(18, 0.2),
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  rewardSubtext: {
    fontSize: scale(12, 0.3),
    color: '#AAAAAA',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 160,
    alignItems: 'center',
    marginTop: 16,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: scale(14, 0.3),
    fontWeight: 'bold',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  
  // Tutorial screen styles
  header: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: scale(24, 0.2),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  
  // Card-based tutorial
  tutorialCardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  tutorialCard: {
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  cardIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  cardTitle: {
    fontSize: scale(18, 0.2),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardText: {
    fontSize: scale(14, 0.3),
    color: '#BBBBBB',
    textAlign: 'center',
    lineHeight: 20,
  },
  cardDotsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 16,
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#555555',
    marginHorizontal: 4,
  },
  cardDotActive: {
    backgroundColor: '#2563eb',
  },
  cardArrowsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  cardArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  cardArrowDisabled: {
    opacity: 0.5,
  },
});

export default onboardingStyles;
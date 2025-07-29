// src/screens/GoalDetailsScreen/styles.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    borderBottomWidth: 1,
    shadowOpacity: 0.1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    zIndex: 10,
  },
  backButton: {
    padding: 5,
  },
  saveButton: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  scrollViewContent: {
    paddingBottom: 300, // Generous padding to account for keyboard
  },
  keyboardAvoidingContent: {
    flex: 1,
  },
  previewSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  goalPreview: {
    width: '100%',
    alignItems: 'center',
    padding: 25,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconPreview: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  progressPreview: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewDetailIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailText: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeaderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  sectionHeaderText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 5,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  sectionContainer: {
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    marginBottom: 10,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  iconsContainer: {
    maxHeight: 100,
  },
  iconsContent: {
    paddingVertical: 8,
  },
  iconItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginRight: 15,
    width: 85, // Increased width to accommodate longer texts
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 10,
  },
  iconItemSelected: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  iconLabel: {
    fontSize: 13, // Slightly increased font size
    marginTop: 6,
    textAlign: 'center', // Center align text
    width: '100%', // Ensure text takes full width of parent
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    margin: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorItemSelected: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateToggle: {
    marginLeft: 10,
  },
  toggleTrack: {
    width: 40,
    height: 22,
    borderRadius: 11,
    padding: 2,
  },
  toggleHandle: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  toggleHandleActive: {
    transform: [{ translateX: 18 }],
  },
  toggleHandleInactive: {
    transform: [{ translateX: 0 }],
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
  },
  datePickerContainer: {
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  datePickerDoneButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  datePickerDoneText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  // Advanced section styles
  optionSection: {
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionStatusText: {
    fontSize: 14,
    marginRight: 4,
  },
  statusIcon: {
    marginLeft: 4,
  },
  notificationBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expandableContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  expandableSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  // Notification preferences styles
  notificationPreferenceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
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
    fontWeight: '500',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 13,
    lineHeight: 17,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(33, 150, 243, 0.08)',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    marginLeft: 8,
  },
  // Share section styles - REDESIGNED
  optionSubheader: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
  },
  shareFormatButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  shareFormatButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  shareFormatButtonText: {
    fontWeight: '500',
  },
  noProjectsText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  shareProjectsList: {
    marginTop: 8,
  },
  shareProjectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  shareProjectTitle: {
    fontSize: 15,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionButtonText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  dangerZone: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
    borderStyle: 'dashed',
  },
  dangerZoneTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  linkedProjectsWarning: {
    marginBottom: 15,
  },
  linkedProjectsWarningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',  // Position at bottom
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
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
    paddingBottom: 15,
    borderBottomWidth: 1,
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
  },
  modalDoneButton: {
    marginTop: 10,
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalDoneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  preferenceLabel: {
    fontSize: 15,
  },
  
  // Confirmation Modal Styles (for unsaved changes)
  confirmModalContainer: {
    margin: 20,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignSelf: 'center',
    width: '90%',
    maxWidth: 400,
  },
  confirmModalContent: {
    alignItems: 'center',
  },
  confirmModalIcon: {
    marginBottom: 15,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  confirmModalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  confirmModalButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  confirmModalButtonDanger: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  confirmModalButtonPrimary: {
    backgroundColor: '#4CAF50',
  },
  confirmModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default styles;
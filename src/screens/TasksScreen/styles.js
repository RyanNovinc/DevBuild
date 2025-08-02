// src/screens/TasksScreen/styles.js

// Export styles as a plain JavaScript object instead of using StyleSheet
export const styles = {
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggleContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  viewToggle: {
    flexDirection: 'row',
    height: 44,
  },
  viewToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  viewToggleText: {
    fontWeight: '500',
    marginLeft: 6,
  },
  // New animated tab indicator
  viewToggleIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '50%',
    borderRadius: 1.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  goalFiltersContainer: {
    marginBottom: 12,
  },
  goalFiltersContent: {
    paddingHorizontal: 16,
  },
  goalFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  goalFilterText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  projectsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  sectionProgress: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectCountBadge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  projectCountText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  projectItem: {
    flexDirection: 'row',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  projectColorBar: {
    width: 6,
  },
  projectContent: {
    flex: 1,
    padding: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  projectMeta: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    width: 30,
    textAlign: 'right',
  },
  projectActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingRight: 8,
  },
  actionButton: {
    padding: 6,
    marginVertical: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  kanbanEmptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 6,
  },
  kanbanContainer: {
    flex: 1,
  },
  dragIndicator: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: 1000,
  },
  dragBanner: {
    flexDirection: 'row',
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  dragBannerText: {
    fontWeight: 'bold',
    marginLeft: 6,
  },
  dropZone: {
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    margin: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  loadingBox: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  fixDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  fixDataButtonText: {
    fontWeight: '500',
    marginLeft: 8,
  },
  customEmptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  customEmptyStateTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 12,
    textAlign: 'center',
  },
  customEmptyStateMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  customEmptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 10,
  },
  customEmptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  createProjectForGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 12,
  },
  createProjectForGoalText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  
  // Floating Add Button - updated to match GoalsScreen style
  floatingAddButton: {
    position: 'absolute',
    zIndex: 100,
    // positioning set inline for consistency
  },
  floatingAddButtonInner: {
    // size set inline for consistency with accessibility standards
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  buttonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  
  // New styles for the enhanced kanban view
  fullScreenToggle: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 100,
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  kanbanDarkContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  
  kanbanColumnDark: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    margin: 6,
    backgroundColor: '#1E1E1E',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  
  kanbanColumnHeaderDark: {
    backgroundColor: '#2D2D2D',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF30',
  },
  
  kanbanColumnTitleDark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  kanbanCardDark: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    margin: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#121212',
    zIndex: 90,
  },
  
  exitFullScreenButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 110,
    backgroundColor: '#FFFFFF20',
    borderRadius: 20,
    padding: 8,
  },
  
  // Kanban Dark Mode Card Styles
  kanbanCardContent: {
    padding: 12,
  },
  
  kanbanCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  
  kanbanCardDescription: {
    fontSize: 12,
    marginBottom: 8,
    color: '#CCCCCC',
  },
  
  kanbanCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  kanbanCardMetaText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#CCCCCC',
  },
  
  kanbanCardProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#444444',
    borderRadius: 2,
    marginRight: 5,
  },
  
  kanbanCardProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  
  kanbanCardProgressText: {
    fontSize: 10,
    width: 24,
    textAlign: 'right',
    color: '#CCCCCC',
  },
  
  kanbanCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF20',
  },
  
  kanbanCardActionButton: {
    padding: 6,
  },
  
  kanbanCardPriority: {
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    color: '#FFFFFF',
    fontWeight: '500',
  },
  
  kanbanGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  
  // Fullscreen specific styles
  kanbanFullscreenScroll: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  
  kanbanFullscreenHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#121212',
    zIndex: 95,
  },
  
  kanbanFullscreenTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Tab Bar Styles - Added from GoalsScreen
  tabBarContainer: {
    borderBottomWidth: 1,
    marginBottom: 16,
    zIndex: 2,
  },
  tabBar: {
    flexDirection: 'row',
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  tabText: {
    fontSize: 15,
  },
  tabBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  
  // Tab Content
  tabContent: {
    flex: 1,
  },
  
  // Fix for absoluteFillObject
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  // Subscription UI styles
  limitBannerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 1000,
  },
  
  limitBannerWrapper: {
    paddingVertical: 4,
    zIndex: 5,
  },
  
  upgradeBannerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginBottom: 8,
  },
  upgradeBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
};
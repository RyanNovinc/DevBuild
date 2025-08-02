// src/screens/PricingScreen/styles.js
import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Get status bar height for proper spacing
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  
  // Status bar placeholder to prevent content from being cut off
  statusBarPlaceholder: {
    height: STATUSBAR_HEIGHT,
    backgroundColor: '#000000',
  },
  
  // Header and tab container combo - MODIFIED FOR BETTER VISIBILITY
  headerTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 26 : 22, // Increased padding for more space
    paddingBottom: 16, // Increased bottom padding
    backgroundColor: '#000000',
    borderBottomWidth: 0, // Remove border that might cause issues
    minHeight: 70, // Ensure minimum height for the header
    zIndex: 999, // Ensure header container is on top
    elevation: 5, // For Android
    position: 'relative', // Ensure proper stacking context
    marginBottom: 10, // Add space below tabs
  },
  backButton: {
    padding: 8,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    zIndex: 1000, // Ensure back button is on top
  },
  
  // Tab navigation - UPDATED for swipeable tabs with proper spacing
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 0,
    position: 'relative',
    zIndex: 10,
    paddingTop: 8,
    paddingBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 4,
    borderRadius: 2,
    shadowColor: '#F39C12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  
  // Add a spacer style
  tabSpacer: {
    height: 15,
    backgroundColor: '#000000',
    width: '100%',
  },
  
  // Test Mode Toggle
  testModeContainer: {
    padding: 10,
    marginBottom: 10,
  },
  testToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testToggleLabel: {
    fontSize: 14,
  },
  
  scrollView: {
    flex: 1,
  },
  
  // Value Proposition Banner
  valuePropBanner: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3F51B5',
  },
  valuePropText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 22,
  },
  
  // Referral Banner
  referralBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  referralBannerText: {
    color: '#FFFFFF',
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
  },
  
  // Membership Banner
  membershipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  membershipBannerText: {
    color: '#FFFFFF',
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  
  // Discount Banner
  discountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  discountBannerText: {
    color: '#FFFFFF',
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  
  // Free User Note
  freeUserNote: {
    padding: 14,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3F51B5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  freeUserNoteText: {
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Plan Selection
  planSelectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  planCard: {
    width: width > 700 ? '45%' : '90%',
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    marginHorizontal: width > 700 ? '2%' : 0,
    marginVertical: 12,
    position: 'relative',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  founderTagContainer: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  founderTag: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  founderTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  // Most Popular Tag
  mostPopularTagContainer: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  mostPopularTag: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  mostPopularTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  planHeader: {
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  planCurrency: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  planPriceSubtext: {
    fontSize: 14,
    marginBottom: 4,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  regularPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    marginTop: 4,
    marginBottom: 8,
  },
  lifetimeSavings: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 8,
  },
  planFeatures: {
    marginTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 10,
    lineHeight: 22,
    flex: 1,
  },
  highlightedText: {
    fontWeight: 'bold',
  },
  planButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Capacity Indicator
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  capacityLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  capacityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  
  // Updated PM Comparison Card (replacing value comparison)
  pmComparisonCard: {
    marginVertical: 20,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  pmComparisonTable: {
    width: '100%',
  },
  pmComparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  pmComparisonLabel: {
    fontSize: 14,
    flex: 2,
    color: '#CCCCCC',
  },
  pmComparisonValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    color: '#FFFFFF',
  },
  pmComparisonDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 8,
  },
  pmComparisonFooter: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
    color: '#AAAAAA',
    lineHeight: 20,
  },
  
  // PM Benefits in Founder Card
  pmBenefitsContainer: {
    marginVertical: 14,
  },
  pmBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pmBenefitText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
    color: '#DDDDDD',
  },
  
  // PM Hierarchy Card
  pmHierarchyCard: {
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  pmHierarchyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#FFFFFF',
  },
  pmHierarchyList: {
    alignItems: 'center',
  },
  pmHierarchyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 6,
  },
  pmHierarchyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  pmHierarchyContent: {
    flex: 1,
  },
  pmHierarchyItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#FFFFFF',
  },
  pmHierarchyItemDesc: {
    fontSize: 14,
    marginBottom: 2,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  pmHierarchyItemAI: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9C27B0',
  },
  pmHierarchyArrow: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  
  // Badges
  activeBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  potentialBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#3F51B5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  potentialBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  
  // Referral Card for Lifetime Members
  referralCard: {
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  referralTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  referralDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    color: '#CCCCCC',
  },
  referralStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  referralStat: {
    alignItems: 'center',
  },
  referralStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#3F51B5',
  },
  referralStatLabel: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  referralCodeContainer: {
    alignItems: 'center',
  },
  referralCodeLabel: {
    fontSize: 12,
    marginBottom: 4,
    color: '#AAAAAA',
  },
  referralCode: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: '#FFFFFF',
  },
  referralActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  referralButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  referralButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  
  // New referral bonus container
  referralBonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  referralBonusText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginLeft: 8,
    color: '#AAAAAA',
    lineHeight: 20,
  },
  
  // Limited time offer header
  limitedOfferHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  
  // Founder spots card
  founderSpotsCard: {
    marginVertical: 16,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Future price badge
  futurePriceBadge: {
    marginTop: 10,
  },
  
  // Founder icon badge for upsell
  founderIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  
  // Billing cycle selector
  billingCycleContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    marginTop: 20,
  },
  billingCycleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  billingToggleContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#1A1A1A',
  },
  billingToggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billingToggleActive: {
    borderRadius: 0,
  },
  billingToggleText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#FFFFFF',
  },
  
  // Explainer Banner
  explainerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  explainerIconContainer: {
    marginRight: 16,
  },
  explainerTextContainer: {
    flex: 1,
  },
  explainerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#FFFFFF',
  },
  explainerDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#CCCCCC',
  },
  explainerNote: {
    marginTop: 8,
    fontStyle: 'italic',
    fontSize: 12,
    color: '#AAAAAA',
  },
  
  // Lifetime Upsell Banner
  lifetimeUpsellBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  lifetimeUpsellIconContainer: {
    marginRight: 16,
  },
  lifetimeUpsellTextContainer: {
    flex: 1,
  },
  lifetimeUpsellTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#FFFFFF',
  },
  lifetimeUpsellSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  
  // Savings Explainer
  savingsExplainer: {
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  savingsExplainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  savingsExplainerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#FFFFFF',
  },
  savingsTable: {
    marginBottom: 16,
  },
  savingsTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  savingsTableHeader: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#AAAAAA',
  },
  savingsTableCell: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  savingsExplainerFooter: {
    alignItems: 'center',
  },
  savingsExplainerText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  savingsExplainerButton: {
    backgroundColor: '#3F51B5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  savingsExplainerButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Research Note
  researchNote: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    color: '#AAAAAA',
    lineHeight: 18,
  },
  
  // Enhanced sticky purchase button - UPDATED FOR OPACITY ISSUES
  stickyPurchaseContainer: {
    position: 'absolute',
    bottom: 0, // Attach to bottom of screen
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16, // Add more padding at top
    paddingBottom: 16, // Add more padding at bottom
    borderTopWidth: 2, // Increase border width
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#000000', // Solid color instead of transparent
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 12,
    // Remove backdropFilter to ensure no transparency
  },
  stickyPurchaseButton: {
    width: '100%',
    paddingVertical: 16, // Increase vertical padding
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  stickyPurchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5, // Add letter spacing for better readability
  },
  
  // Button gradient - used in multiple places
  buttonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
});

export default styles;
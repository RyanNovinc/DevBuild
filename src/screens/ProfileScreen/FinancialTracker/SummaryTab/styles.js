// src/screens/ProfileScreen/FinancialTracker/SummaryTab/styles.js
import { StyleSheet } from 'react-native';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  spacing,
  fontSizes
} from '../../../../utils/responsive';

export default StyleSheet.create({
  tabContentContainer: {
    padding: spacing.m,
  },
  
  // Card Headers
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: spacing.s,
  },
  
  // Summary Card
  summaryCard: {
    borderRadius: scaleWidth(16),
    padding: isSmallDevice ? spacing.m : spacing.l,
    marginBottom: spacing.m,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: fontSizes.l,
    fontWeight: 'bold',
  },
  percentileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  percentileInfo: {
    flex: 1,
  },
  percentileLabel: {
    fontSize: fontSizes.xs,
    marginBottom: spacing.xxs,
  },
  percentileValue: {
    fontSize: fontSizes.l,
    fontWeight: '600',
  },
  
  // New styles for the redesigned percentile badge
  percentileBadgeContainer: {
    minWidth: scaleWidth(isSmallDevice ? 180 : 200),
  },
  percentileBadgeContent: {
    borderRadius: scaleWidth(12),
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentileText: {
    fontSize: fontSizes.s,
    fontWeight: '600',
  },
  percentileRating: {
    fontSize: fontSizes.s,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  
  surplusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.s,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  surplusLabel: {
    fontSize: fontSizes.m,
  },
  surplusValue: {
    fontSize: fontSizes.l,
  },
  
  // Bar Chart Card
  barChartCard: {
    borderRadius: scaleWidth(16),
    padding: isSmallDevice ? spacing.m : spacing.l,
    marginBottom: spacing.m,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  barChartTitle: {
    fontSize: fontSizes.l,
    fontWeight: 'bold',
  },
  barChartContainer: {
    flexDirection: 'row',
    height: scaleHeight(220),
    marginBottom: spacing.s,
  },
  axisLabels: {
    justifyContent: 'space-between',
    paddingRight: spacing.s,
    height: scaleHeight(200),
  },
  axisLabel: {
    fontSize: fontSizes.xs,
  },
  barChart: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  barContainer: {
    alignItems: 'center',
    width: scaleWidth(80),
    marginHorizontal: spacing.s,
  },
  barChartLabel: {
    fontSize: fontSizes.xs,
    marginBottom: spacing.s,
  },
  barBackground: {
    width: scaleWidth(40),
    height: scaleHeight(180),
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.s,
  },
  barFill: {
    width: scaleWidth(40),
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barAmount: {
    fontSize: fontSizes.xs,
    fontWeight: '500',
  },
  barChartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.l,
    paddingTop: spacing.m,
    paddingHorizontal: spacing.m,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
  },
  legendIndicator: {
    width: scaleWidth(12),
    height: scaleWidth(12),
    borderRadius: scaleWidth(6),
    marginRight: spacing.s,
  },
  legendText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  
  // Assets Card
  assetsCard: {
    borderRadius: scaleWidth(16),
    padding: isSmallDevice ? spacing.m : spacing.l,
    marginBottom: spacing.m,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assetsTitle: {
    fontSize: fontSizes.l,
    fontWeight: 'bold',
  },
  assetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  assetColumn: {
    alignItems: 'center',
    flex: 1,
  },
  assetLabel: {
    fontSize: fontSizes.xs,
    marginBottom: spacing.xxs,
  },
  assetValue: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  netWorthRating: {
    marginTop: spacing.l,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  netWorthLabel: {
    fontSize: fontSizes.s,
    marginBottom: spacing.s,
  },
  netWorthProgressContainer: {
    height: scaleHeight(8),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
    marginBottom: spacing.xxs,
    overflow: 'hidden',
  },
  netWorthProgress: {
    height: '100%',
    borderRadius: 4,
  },
  netWorthRatio: {
    fontSize: fontSizes.s,
    fontWeight: '600',
    textAlign: 'right',
  },
  
  // Currency Selector
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: scaleWidth(20),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  currencySymbol: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    marginRight: spacing.xxs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  currencyModal: {
    width: '100%',
    borderRadius: scaleWidth(16),
    padding: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    maxHeight: '80%',
  },
  currencyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  currencyModalTitle: {
    fontSize: fontSizes.l,
    fontWeight: 'bold',
  },
  currencyDescription: {
    marginBottom: spacing.m,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  currencyDescriptionText: {
    fontSize: fontSizes.s,
    lineHeight: scaleHeight(20),
  },
  currencyList: {
    maxHeight: scaleHeight(350),
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    borderRadius: scaleWidth(12),
    marginBottom: spacing.s,
  },
  currencyOptionSymbol: {
    fontSize: fontSizes.l,
    fontWeight: '600',
    marginRight: spacing.m,
    width: scaleWidth(30),
  },
  currencyNameContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  currencyOptionName: {
    fontSize: fontSizes.m,
  },
  baseTagContainer: {
    marginTop: spacing.xxs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xxxs,
    borderRadius: scaleWidth(8),
  },
  baseTag: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  selectedIcon: {
    marginLeft: spacing.s,
  },
  currencyModalFooter: {
    marginTop: spacing.m,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  currencyModalFooterText: {
    fontSize: fontSizes.xs,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Currency Info Modal
  currencyInfoModal: {
    width: '100%',
    borderRadius: scaleWidth(16),
    padding: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    maxHeight: '80%',
  },
  currencyInfoContent: {
    maxHeight: scaleHeight(400),
  },
  currencyInfoSection: {
    marginBottom: spacing.l,
  },
  currencyInfoHeading: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    marginBottom: spacing.s,
  },
  currencyInfoText: {
    fontSize: fontSizes.s,
    lineHeight: scaleHeight(20),
  },
  currencyInfoExample: {
    marginVertical: spacing.m,
    padding: spacing.m,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: scaleWidth(12),
  },
  currencyInfoExampleText: {
    fontSize: fontSizes.s,
    lineHeight: scaleHeight(20),
    fontStyle: 'italic',
  },
  exchangeRateUpdate: {
    fontSize: fontSizes.xs,
    fontStyle: 'italic',
  },
  currencyInfoCloseButton: {
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(12),
    alignItems: 'center',
    marginTop: spacing.m,
  },
  currencyInfoCloseButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  
  // US Indicator for percentiles
  usIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  usIndicatorText: {
    fontSize: fontSizes.xs,
    marginLeft: spacing.xxs,
  },
  
  // Detail Modal
  detailModal: {
    width: '100%',
    borderRadius: scaleWidth(16),
    padding: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    maxHeight: '90%',
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  detailModalTitle: {
    fontSize: fontSizes.l,
    fontWeight: 'bold',
  },
  detailModalContent: {
    maxHeight: scaleHeight(500),
  },
  detailModalSubtitle: {
    fontSize: fontSizes.s,
    marginBottom: spacing.m,
    fontStyle: 'italic',
  },
  yourPositionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  yourPositionLabel: {
    fontSize: fontSizes.s,
  },
  yourPositionValue: {
    alignItems: 'flex-end',
  },
  yourPositionPercentile: {
    fontSize: fontSizes.m,
    fontWeight: 'bold',
    marginBottom: spacing.xxs,
  },
  yourPositionAmount: {
    fontSize: fontSizes.s,
  },
  closeButton: {
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(12),
    alignItems: 'center',
    marginTop: spacing.s,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  
  // View Toggle Styles
  viewToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.m,
    borderRadius: scaleWidth(12),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  viewToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    flex: 1,
  },
  viewToggleText: {
    fontSize: fontSizes.s,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  
  // Enhanced Graph Styles
  graphContainer: {
    marginVertical: spacing.l,
    height: scaleHeight(300),
  },
  fullScreenGraphContainer: {
    height: scaleHeight(400),
  },
  graphWrapper: {
    flex: 1,
    position: 'relative',
  },
  yAxisLabelContainer: {
    position: 'absolute',
    left: scaleWidth(-35),
    top: scaleHeight(150),
    width: scaleWidth(120),
    transform: [{ rotate: '-90deg' }],
    alignItems: 'center',
  },
  yAxisLabel: {
    fontSize: fontSizes.xs,
    textAlign: 'center',
  },
  graph: {
    flex: 1,
    borderRadius: scaleWidth(8),
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.s,
  },
  legendDot: {
    width: scaleWidth(10),
    height: scaleWidth(10),
    borderRadius: scaleWidth(5),
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: fontSizes.xs,
  },
  
  // Tooltip styles
  tooltipContainer: {
    backgroundColor: 'white',
    padding: spacing.s,
    borderRadius: scaleWidth(6),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: scaleWidth(180),
  },
  tooltipTitle: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    marginBottom: spacing.xxs,
  },
  tooltipValue: {
    fontSize: fontSizes.xxs,
  },
  
  // Updated Table Styles
  tableContainer: {
    marginVertical: spacing.l,
    borderWidth: 1,
    borderRadius: scaleWidth(8),
    overflow: 'hidden',
    maxHeight: scaleHeight(300),
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: fontSizes.xs,
  },
  tableBody: {
    maxHeight: scaleHeight(300),
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tableRowUser: {
    flexDirection: 'row',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tableCell: {
    fontSize: fontSizes.xs,
  },
  yourPositionIndicator: {
    fontStyle: 'italic',
    fontSize: fontSizes.xxs,
  },
  
  // Header Icons
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullScreenButton: {
    marginRight: spacing.m,
  },
  
  // Grid lines for full screen mode
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  
  // Enhanced fullscreen styles
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  fullScreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingTop: scaleHeight(50),
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  fullScreenTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
  },
  fullScreenViewToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  fullScreenViewToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
    borderRadius: scaleWidth(20),
    marginHorizontal: spacing.s,
  },
  fullScreenViewToggleText: {
    fontSize: fontSizes.m,
    fontWeight: '500',
    marginLeft: spacing.s,
  },
  fullScreenContent: {
    flex: 1,
    padding: spacing.m,
  },
  fullScreenPositionContainer: {
    marginBottom: spacing.m,
  },
  fullScreenPositionCard: {
    borderRadius: scaleWidth(16),
    padding: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  fullScreenPositionLabel: {
    fontSize: fontSizes.m,
    marginBottom: spacing.xxs,
  },
  fullScreenPositionValue: {
    fontSize: fontSizes.xxxl,
    fontWeight: 'bold',
    marginBottom: spacing.xxs,
  },
  fullScreenPositionAmount: {
    fontSize: fontSizes.xl,
    marginBottom: spacing.s,
  },
  fullScreenPositionRating: {
    fontSize: fontSizes.l,
    fontWeight: '600',
  },
  fullScreenCardContainer: {
    borderRadius: scaleWidth(16),
    padding: spacing.l,
    marginBottom: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fullScreenExplanation: {
    fontSize: fontSizes.m,
    lineHeight: scaleHeight(22),
    marginBottom: spacing.m,
  },
  fullScreenDataSource: {
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  fullScreenDataSourceTitle: {
    fontSize: fontSizes.s,
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  fullScreenDataSourceText: {
    fontSize: fontSizes.xs,
    fontStyle: 'italic',
  },
  fullScreenCloseButton: {
    paddingVertical: spacing.m,
    alignItems: 'center',
    marginHorizontal: spacing.m,
    marginBottom: spacing.l,
    borderRadius: scaleWidth(12),
  },
  fullScreenCloseButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.l,
    fontWeight: '600',
  },
  
  // Extra explanation styles
  explanationText: {
    fontSize: fontSizes.s,
    lineHeight: scaleHeight(20),
    marginBottom: spacing.l,
  },
  dataSourceContainer: {
    marginBottom: spacing.m,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  dataSourceTitle: {
    fontSize: fontSizes.s,
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  dataSourceText: {
    fontSize: fontSizes.xs,
    fontStyle: 'italic',
  },
  dataNotesContainer: {
    marginBottom: spacing.m,
  },
  dataNotesTitle: {
    fontSize: fontSizes.s,
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  dataNotesText: {
    fontSize: fontSizes.xs,
    lineHeight: scaleHeight(18),
  },
  
  // US-based indicator styles
  usBasedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xxs,
    borderRadius: scaleWidth(12),
    alignSelf: 'flex-start',
    marginBottom: spacing.s,
    marginHorizontal: spacing.m,
  },
  usBasedIndicatorText: {
    fontSize: fontSizes.xs,
    marginLeft: spacing.xxs,
  },
  usFlag: {
    width: scaleWidth(16),
    height: scaleHeight(10),
    marginRight: spacing.xs,
  },
  
  // New US data bubble above graph
  usDataBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: scaleWidth(16),
    marginBottom: spacing.s,
  },
  usDataBubbleText: {
    fontSize: fontSizes.xs,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
});
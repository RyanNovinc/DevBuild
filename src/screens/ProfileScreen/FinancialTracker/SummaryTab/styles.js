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
    padding: spacing.s,
    paddingTop: -4,
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
  cardTitle: {
    fontSize: fontSizes.l,
    fontWeight: 'bold',
  },
  
  // Currency Button
  currencyButton: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: scaleWidth(8),
  },
  currencyButtonText: {
    fontSize: fontSizes.s,
    fontWeight: '600',
  },
  
  // Summary Card
  summaryCard: {
    borderRadius: scaleWidth(16),
    padding: isSmallDevice ? spacing.l : spacing.xl,
    marginBottom: spacing.m,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: scaleHeight(180),
  },
  summaryRow: {
    paddingVertical: spacing.s,
  },
  summaryItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    marginRight: spacing.m,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    marginBottom: spacing.xs / 2,
  },
  summaryValue: {
    // Value styling handled in component
  },
  summaryTitle: {
    fontSize: fontSizes.l,
    fontWeight: 'bold',
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
    padding: isSmallDevice ? spacing.l : spacing.xl,
    marginBottom: spacing.m,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: scaleHeight(220),
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
  barStatusText: {
    fontSize: fontSizes.xs,
    textAlign: 'center',
  },
  barChartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.l,
    paddingTop: spacing.m,
    paddingHorizontal: spacing.m,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  barLegendItem: {
    alignItems: 'center',
  },
  legendDot: {
    width: scaleWidth(12),
    height: scaleWidth(12),
    borderRadius: scaleWidth(6),
    marginBottom: spacing.xs,
  },
  legendLabel: {
    fontSize: fontSizes.xs,
  },
  
  // Assets Liabilities Card
  assetsCard: {
    borderRadius: scaleWidth(16),
    padding: isSmallDevice ? spacing.l : spacing.xl,
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
  assetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  assetLabel: {
    fontSize: fontSizes.m,
  },
  assetValue: {
    fontSize: fontSizes.l,
    fontWeight: '600',
  },
  netWorthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.l,
    borderTopWidth: 2,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: spacing.m,
  },
  netWorthLabel: {
    fontSize: fontSizes.l,
    fontWeight: 'bold',
  },
  netWorthValue: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
  },
  
  // Currency Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyModal: {
    backgroundColor: '#fff',
    borderRadius: scaleWidth(16),
    padding: spacing.l,
    width: '80%',
    maxWidth: scaleWidth(300),
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  modalTitle: {
    fontSize: fontSizes.l,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  currencyList: {
    maxHeight: scaleHeight(300),
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.s,
    borderRadius: scaleWidth(8),
  },
  currencySymbol: {
    fontSize: fontSizes.l,
    fontWeight: 'bold',
    marginRight: spacing.m,
    minWidth: scaleWidth(30),
    textAlign: 'center',
  },
  currencyInfo: {
    flex: 1,
  },
  currencyName: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  currencyCode: {
    fontSize: fontSizes.s,
    marginTop: spacing.xxs,
  },
  selectedIndicator: {
    marginLeft: spacing.s,
  },
});
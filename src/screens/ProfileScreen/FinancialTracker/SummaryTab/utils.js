// src/screens/ProfileScreen/FinancialTracker/SummaryTab/utils.js
import { meetsContrastRequirements } from '../../../../utils/responsive';

// Helper function to get currency name
export const getCurrencyName = (symbol) => {
  switch(symbol) {
    case '$': return 'US Dollar';
    case '€': return 'Euro';
    case '£': return 'British Pound';
    case '¥': return 'Japanese Yen';
    case 'A$': return 'Australian Dollar';
    case 'C$': return 'Canadian Dollar';
    case '₹': return 'Indian Rupee';
    case '₽': return 'Russian Ruble';
    case '₣': return 'Swiss Franc';
    case '₩': return 'South Korean Won';
    case '₺': return 'Turkish Lira';
    default: return 'Currency';
  }
};

// Get color based on percentile and type
export const getPercentileColor = (percentile) => {
  // Color ranges from red to green
  if (percentile >= 95) return '#00897B'; // Exceptional
  if (percentile >= 90) return '#009688'; // Excellent
  if (percentile >= 80) return '#4CAF50'; // Very Good
  if (percentile >= 70) return '#8BC34A'; // Good
  if (percentile >= 60) return '#CDDC39'; // Above Average
  if (percentile >= 50) return '#FFEB3B'; // Average
  if (percentile >= 40) return '#FFC107'; // Below Average
  if (percentile >= 30) return '#FF9800'; // Fair
  if (percentile >= 20) return '#FF5722'; // Needs Work
  if (percentile >= 10) return '#F44336'; // Poor
  return '#E53935';                       // Critical
};

// Get the appropriate rating text based on percentile
export const getPercentileRating = (percentile) => {
  if (percentile >= 95) return 'Exceptional';
  if (percentile >= 90) return 'Excellent';
  if (percentile >= 80) return 'Very Good';
  if (percentile >= 70) return 'Good';
  if (percentile >= 60) return 'Above Average';
  if (percentile >= 50) return 'Average';
  if (percentile >= 40) return 'Below Average';
  if (percentile >= 30) return 'Fair';
  if (percentile >= 20) return 'Needs Work';
  if (percentile >= 10) return 'Poor';
  return 'Critical';
};

// Format Y-axis labels based on data type
export const formatYAxisLabel = (value, type, formatCurrency) => {
  if (type === 'income' || type === 'expense') {
    if (Math.abs(value) >= 1000000) {
      return `${formatCurrency(0).charAt(0)}${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `${formatCurrency(0).charAt(0)}${(value / 1000).toFixed(1)}K`;
    }
    return formatCurrency(value);
  } else if (type === 'savings') {
    return `${value.toFixed(0)}%`;
  }
  return value.toString();
};

// Get percentile label with consistent formatting
export const getPercentileLabel = (percentile) => {
  // Format to handle decimals cleanly
  const displayPercentile = Math.round(percentile);
  return `Better than ${displayPercentile}%`;
};

// Get color with contrast verification
export const getAccessibleColor = (percentile, backgroundColor, defaultTextColor) => {
  const color = getPercentileColor(percentile);
  
  // If meetsContrastRequirements is available, use it for contrast checking
  if (meetsContrastRequirements) {
    return meetsContrastRequirements(color, backgroundColor, false) ? 
      color : defaultTextColor;
  }
  
  // Fallback if responsive utilities aren't available
  return color;
};

// Format currency with compact notation for accessibility
export const formatCompactCurrency = (amount, currencySymbol) => {
  if (Math.abs(amount) >= 1000000) {
    return `${currencySymbol}${(amount / 1000000).toFixed(1)}M`;
  } else if (Math.abs(amount) >= 1000) {
    return `${currencySymbol}${(amount / 1000).toFixed(1)}K`;
  }
  return `${currencySymbol}${amount.toLocaleString()}`;
};

// Generate accessibility descriptions for financial data
export const getFinancialAccessibilityDescription = (type, value, percentile, formatCurrency) => {
  const rating = getPercentileRating(percentile);
  const formattedValue = type === 'savings' ? 
    `${value.toFixed(1)}%` : 
    formatCurrency(value);
  
  switch(type) {
    case 'income':
      return `Your monthly income is ${formattedValue}, which puts you in the ${percentile.toFixed(1)} percentile, rated as ${rating}. This means you earn more than ${percentile.toFixed(1)} percent of the US population.`;
    case 'expense':
      return `Your monthly expenses are ${formattedValue}, which puts you in the ${percentile.toFixed(1)} percentile, rated as ${rating}. This means you spend less than ${percentile.toFixed(1)} percent of the US population.`;
    case 'savings':
      return `Your savings rate is ${formattedValue}, which puts you in the ${percentile.toFixed(1)} percentile, rated as ${rating}. This means you save more than ${percentile.toFixed(1)} percent of the US population.`;
    default:
      return `Your ${type} is ${formattedValue}, which puts you in the ${percentile.toFixed(1)} percentile, rated as ${rating}.`;
  }
};

// Get thresholds for percentile categories (useful for accessibility descriptions)
export const getPercentileThresholds = (type) => {
  switch(type) {
    case 'income':
      return {
        exceptional: 12000, // Monthly income in USD
        excellent: 10000,
        veryGood: 8000,
        good: 6500,
        aboveAverage: 5500,
        average: 4500,
        belowAverage: 3500,
        fair: 2800,
        needsWork: 2000,
        poor: 1500
      };
    case 'expense':
      return {
        exceptional: 2000, // Lower expenses are better
        excellent: 2500,
        veryGood: 3000,
        good: 3500,
        aboveAverage: 4000,
        average: 4500,
        belowAverage: 5000,
        fair: 5500,
        needsWork: 6000,
        poor: 6500
      };
    case 'savings':
      return {
        exceptional: 40, // Percentages
        excellent: 35,
        veryGood: 30,
        good: 25,
        aboveAverage: 20,
        average: 15,
        belowAverage: 10,
        fair: 5,
        needsWork: 3,
        poor: 1
      };
    default:
      return {};
  }
};
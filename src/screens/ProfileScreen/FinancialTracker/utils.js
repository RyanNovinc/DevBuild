// src/screens/ProfileScreen/FinancialTracker/utils.js

// Income percentile data (monthly amounts)
export const INCOME_PERCENTILES = [
  { amount: 500, percentile: 5 },
  { amount: 800, percentile: 10 },
  { amount: 1200, percentile: 15 },
  { amount: 1500, percentile: 20 },
  { amount: 1833, percentile: 25 },
  { amount: 2250, percentile: 33 },
  { amount: 2917, percentile: 42 },
  { amount: 3518, percentile: 50 },
  { amount: 4167, percentile: 60 },
  { amount: 4962, percentile: 65 },
  { amount: 5417, percentile: 70 },
  { amount: 6250, percentile: 75 },
  { amount: 7500, percentile: 82 },
  { amount: 8333, percentile: 85 },
  { amount: 10000, percentile: 88 },
  { amount: 10833, percentile: 90 },
  { amount: 12500, percentile: 92 },
  { amount: 15000, percentile: 95 },
  { amount: 20833, percentile: 98 },
  { amount: 29167, percentile: 99 },
  { amount: 41667, percentile: 99.5 },
  { amount: 83333, percentile: 99.9 }
];

// Expense percentile data (monthly amounts - lower is better)
export const EXPENSE_PERCENTILES = [
  { amount: 30000, percentile: 1 },
  { amount: 25000, percentile: 1.5 },
  { amount: 22500, percentile: 2 },
  { amount: 20000, percentile: 3 },
  { amount: 17500, percentile: 4 },
  { amount: 16000, percentile: 5 },
  { amount: 15000, percentile: 6 },
  { amount: 14000, percentile: 7 },
  { amount: 13500, percentile: 8 },
  { amount: 13000, percentile: 9 },
  { amount: 12500, percentile: 10 },
  { amount: 12000, percentile: 11 },
  { amount: 11500, percentile: 12 },
  { amount: 11000, percentile: 13 },
  { amount: 10500, percentile: 14 },
  { amount: 10000, percentile: 15 },
  { amount: 9500, percentile: 16 },
  { amount: 9000, percentile: 18 },
  { amount: 8750, percentile: 19 },
  { amount: 8500, percentile: 20 },
  { amount: 8250, percentile: 21 },
  { amount: 8000, percentile: 22 },
  { amount: 7750, percentile: 23 },
  { amount: 7500, percentile: 24 },
  { amount: 7250, percentile: 25 },
  { amount: 7000, percentile: 27 },
  { amount: 6750, percentile: 28 },
  { amount: 6500, percentile: 29 },
  { amount: 6440, percentile: 30 },
  { amount: 6250, percentile: 31 },
  { amount: 6000, percentile: 33 },
  { amount: 5750, percentile: 35 },
  { amount: 5500, percentile: 38 },
  { amount: 5250, percentile: 42 },
  { amount: 5000, percentile: 45 },
  { amount: 4750, percentile: 48 },
  { amount: 4500, percentile: 50 },
  { amount: 4400, percentile: 55 },
  { amount: 4300, percentile: 57 },
  { amount: 4200, percentile: 58 },
  { amount: 4100, percentile: 59 },
  { amount: 4000, percentile: 60 },
  { amount: 3900, percentile: 61 },
  { amount: 3800, percentile: 62 },
  { amount: 3700, percentile: 63 },
  { amount: 3600, percentile: 64 },
  { amount: 3500, percentile: 65 },
  { amount: 3400, percentile: 66 },
  { amount: 3300, percentile: 67 },
  { amount: 3200, percentile: 68 },
  { amount: 3100, percentile: 69 },
  { amount: 3000, percentile: 70 },
  { amount: 2900, percentile: 71 },
  { amount: 2800, percentile: 72 },
  { amount: 2700, percentile: 73 },
  { amount: 2600, percentile: 74 },
  { amount: 2500, percentile: 75 },
  { amount: 2400, percentile: 78 },
  { amount: 2300, percentile: 80 },
  { amount: 2200, percentile: 82 },
  { amount: 2100, percentile: 83 },
  { amount: 2000, percentile: 85 },
  { amount: 1900, percentile: 86 },
  { amount: 1800, percentile: 87 },
  { amount: 1700, percentile: 88 },
  { amount: 1600, percentile: 89 },
  { amount: 1500, percentile: 90 },
  { amount: 1400, percentile: 92 },
  { amount: 1300, percentile: 93 },
  { amount: 1200, percentile: 94 },
  { amount: 1100, percentile: 95 },
  { amount: 1000, percentile: 96 },
  { amount: 900, percentile: 97 },
  { amount: 800, percentile: 98 },
  { amount: 700, percentile: 99 },
  { amount: 600, percentile: 99.5 }
];

// Savings rate percentile data
export const SAVINGS_PERCENTILES = [
  { rate: -120, percentile: 1 },
  { rate: -100, percentile: 2 },
  { rate: -90, percentile: 3 },
  { rate: -80, percentile: 4 },
  { rate: -70, percentile: 4.5 },
  { rate: -60, percentile: 4.8 },
  { rate: -50, percentile: 5 },
  { rate: -45, percentile: 7 },
  { rate: -40, percentile: 10 },
  { rate: -35, percentile: 12 },
  { rate: -30, percentile: 15 },
  { rate: -28, percentile: 17 },
  { rate: -25, percentile: 20 },
  { rate: -23, percentile: 22 },
  { rate: -20, percentile: 23 },
  { rate: -19.28, percentile: 25 },
  { rate: -18, percentile: 26 },
  { rate: -15, percentile: 28 },
  { rate: -12, percentile: 29 },
  { rate: -10, percentile: 30 },
  { rate: -8, percentile: 31 },
  { rate: -6, percentile: 32 },
  { rate: -5, percentile: 33 },
  { rate: -4, percentile: 33.5 },
  { rate: -2, percentile: 34 },
  { rate: 0, percentile: 35 },
  { rate: 1, percentile: 36 },
  { rate: 2, percentile: 37 },
  { rate: 3, percentile: 38 },
  { rate: 4, percentile: 39 },
  { rate: 5, percentile: 40 },
  { rate: 6, percentile: 41 },
  { rate: 7, percentile: 42 },
  { rate: 8, percentile: 43 },
  { rate: 9, percentile: 44 },
  { rate: 10, percentile: 45 },
  { rate: 12, percentile: 46 },
  { rate: 15, percentile: 47 },
  { rate: 17, percentile: 48 },
  { rate: 20, percentile: 49 },
  { rate: 22.12, percentile: 50 },
  { rate: 23, percentile: 51 },
  { rate: 24, percentile: 53 },
  { rate: 25, percentile: 55 },
  { rate: 26, percentile: 56 },
  { rate: 27, percentile: 57 },
  { rate: 28, percentile: 58 },
  { rate: 29, percentile: 59 },
  { rate: 30, percentile: 60 },
  { rate: 31, percentile: 61 },
  { rate: 32, percentile: 62 },
  { rate: 33, percentile: 63 },
  { rate: 34, percentile: 64 },
  { rate: 35, percentile: 65 },
  { rate: 36, percentile: 66 },
  { rate: 37, percentile: 67 },
  { rate: 38, percentile: 68 },
  { rate: 39, percentile: 69 },
  { rate: 40, percentile: 70 },
  { rate: 41, percentile: 72 },
  { rate: 42, percentile: 74 },
  { rate: 42.79, percentile: 75 },
  { rate: 43, percentile: 76 },
  { rate: 44, percentile: 77 },
  { rate: 45, percentile: 78 },
  { rate: 46, percentile: 80 },
  { rate: 47, percentile: 81 },
  { rate: 48, percentile: 82 },
  { rate: 49, percentile: 83 },
  { rate: 50, percentile: 85 },
  { rate: 51, percentile: 86 },
  { rate: 52, percentile: 86.5 },
  { rate: 53, percentile: 87 },
  { rate: 54, percentile: 87.5 },
  { rate: 55, percentile: 88 },
  { rate: 56, percentile: 88.5 },
  { rate: 57, percentile: 89 },
  { rate: 58, percentile: 89.5 },
  { rate: 60, percentile: 90 },
  { rate: 62, percentile: 92 },
  { rate: 65, percentile: 97 },
  { rate: 67, percentile: 98 },
  { rate: 70, percentile: 99 },
  { rate: 72, percentile: 99.3 },
  { rate: 75, percentile: 99.5 },
  { rate: 80, percentile: 99.9 }
];

// Calculate total monthly income
export const calculateTotalIncome = (financialData) => {
  return financialData.incomeSources.reduce((total, source) => total + parseFloat(source.amount), 0);
};

// Calculate total monthly expenses - UPDATED TO ENSURE PARSING
export const calculateTotalExpenses = (financialData) => {
  return financialData.expenses.reduce((total, expense) => {
    // Only include recurring expenses in monthly calculation
    if (expense.type === 'recurring') {
      return total + parseFloat(expense.amount);
    }
    return total;
  }, 0);
};

// Calculate total savings
export const calculateTotalSavings = (financialData) => {
  return financialData.savings.reduce((total, saving) => total + parseFloat(saving.amount), 0);
};

// Calculate total debts
export const calculateTotalDebt = (financialData) => {
  return financialData.debts.reduce((total, debt) => total + parseFloat(debt.amount), 0);
};

// Calculate savings percentage
export const calculateSavingsPercentage = (totalIncome, totalExpenses) => {
  if (totalIncome === 0) return 0;
  
  const monthlySavings = totalIncome - totalExpenses;
  return (monthlySavings / totalIncome) * 100;
};

// Calculate income percentile - updated to use accurate data
export const calculateIncomePercentile = (monthlyIncome) => {
  // Handle edge cases
  if (monthlyIncome <= 0) return 0;
  if (monthlyIncome >= INCOME_PERCENTILES[INCOME_PERCENTILES.length - 1].amount) {
    return INCOME_PERCENTILES[INCOME_PERCENTILES.length - 1].percentile;
  }
  
  // Find the closest percentile by binary search
  let low = 0;
  let high = INCOME_PERCENTILES.length - 1;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    
    if (INCOME_PERCENTILES[mid].amount === monthlyIncome) {
      return INCOME_PERCENTILES[mid].percentile;
    }
    
    if (INCOME_PERCENTILES[mid].amount < monthlyIncome) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  
  // If we didn't find an exact match, interpolate between the two nearest values
  const lowerIndex = Math.max(0, high);
  const upperIndex = Math.min(INCOME_PERCENTILES.length - 1, low);
  
  const lowerAmount = INCOME_PERCENTILES[lowerIndex].amount;
  const upperAmount = INCOME_PERCENTILES[upperIndex].amount;
  
  const lowerPercentile = INCOME_PERCENTILES[lowerIndex].percentile;
  const upperPercentile = INCOME_PERCENTILES[upperIndex].percentile;
  
  if (lowerIndex === upperIndex) {
    return lowerPercentile;
  }
  
  // Linear interpolation between points
  const ratio = (monthlyIncome - lowerAmount) / (upperAmount - lowerAmount);
  return lowerPercentile + ratio * (upperPercentile - lowerPercentile);
};

// Calculate expense percentile - updated to use accurate data (lower expenses = higher percentile)
export const calculateExpensePercentile = (monthlyExpenses) => {
  // Handle edge cases
  if (monthlyExpenses <= 0) return 99.9; // Extremely low or no expenses
  if (monthlyExpenses >= EXPENSE_PERCENTILES[0].amount) {
    return EXPENSE_PERCENTILES[0].percentile;
  }
  
  // Find the closest percentile by binary search
  let low = 0;
  let high = EXPENSE_PERCENTILES.length - 1;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    
    if (EXPENSE_PERCENTILES[mid].amount === monthlyExpenses) {
      return EXPENSE_PERCENTILES[mid].percentile;
    }
    
    if (EXPENSE_PERCENTILES[mid].amount < monthlyExpenses) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  
  // If we didn't find an exact match, interpolate between the two nearest values
  const lowerIndex = Math.max(0, high);
  const upperIndex = Math.min(EXPENSE_PERCENTILES.length - 1, low);
  
  const lowerAmount = EXPENSE_PERCENTILES[lowerIndex].amount;
  const upperAmount = EXPENSE_PERCENTILES[upperIndex].amount;
  
  const lowerPercentile = EXPENSE_PERCENTILES[lowerIndex].percentile;
  const upperPercentile = EXPENSE_PERCENTILES[upperIndex].percentile;
  
  if (lowerIndex === upperIndex) {
    return lowerPercentile;
  }
  
  // Linear interpolation between points
  const ratio = (monthlyExpenses - lowerAmount) / (upperAmount - lowerAmount);
  return lowerPercentile + ratio * (upperPercentile - lowerPercentile);
};

// Calculate savings rate percentile - updated to use accurate data
export const calculateSavingsPercentile = (savingsRate) => {
  // Handle edge cases
  if (savingsRate <= SAVINGS_PERCENTILES[0].rate) {
    return SAVINGS_PERCENTILES[0].percentile;
  }
  if (savingsRate >= SAVINGS_PERCENTILES[SAVINGS_PERCENTILES.length - 1].rate) {
    return SAVINGS_PERCENTILES[SAVINGS_PERCENTILES.length - 1].percentile;
  }
  
  // Find the closest percentile by binary search
  let low = 0;
  let high = SAVINGS_PERCENTILES.length - 1;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    
    if (SAVINGS_PERCENTILES[mid].rate === savingsRate) {
      return SAVINGS_PERCENTILES[mid].percentile;
    }
    
    if (SAVINGS_PERCENTILES[mid].rate < savingsRate) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  
  // If we didn't find an exact match, interpolate between the two nearest values
  const lowerIndex = Math.max(0, high);
  const upperIndex = Math.min(SAVINGS_PERCENTILES.length - 1, low);
  
  const lowerRate = SAVINGS_PERCENTILES[lowerIndex].rate;
  const upperRate = SAVINGS_PERCENTILES[upperIndex].rate;
  
  const lowerPercentile = SAVINGS_PERCENTILES[lowerIndex].percentile;
  const upperPercentile = SAVINGS_PERCENTILES[upperIndex].percentile;
  
  if (lowerIndex === upperIndex) {
    return lowerPercentile;
  }
  
  // Linear interpolation between points
  const ratio = (savingsRate - lowerRate) / (upperRate - lowerRate);
  return lowerPercentile + ratio * (upperPercentile - lowerPercentile);
};

// Format currency amount
export const formatCurrency = (amount, currency = "$") => {
  return `${currency}${amount.toLocaleString()}`;
};

// Get category color for expenses
export const getCategoryColor = (category) => {
  switch(category) {
    case 'housing': return '#FF9800';
    case 'food': return '#4CAF50';
    case 'transport': return '#2196F3';
    case 'utilities': return '#9C27B0';
    case 'entertainment': return '#F44336';
    default: return '#607D8B';
  }
};

// Get category name for expenses
export const getCategoryName = (category) => {
  switch(category) {
    case 'housing': return 'Housing';
    case 'food': return 'Food';
    case 'transport': return 'Transportation';
    case 'utilities': return 'Utilities';
    case 'entertainment': return 'Entertainment';
    default: return 'Other';
  }
};

// Initialize with example data
export const initializeWithExampleData = () => {
  return {
    incomeSources: [
      { id: '1', name: 'Main Job', amount: 5000, type: 'primary' },
      { id: '2', name: 'Side Consulting', amount: 1200, type: 'side' }
    ],
    expenses: [
      { id: '1', name: 'Rent', amount: 1500, type: 'recurring', category: 'housing' },
      { id: '2', name: 'Groceries', amount: 600, type: 'recurring', category: 'food' },
      { id: '3', name: 'Utilities', amount: 200, type: 'recurring', category: 'housing' },
      { id: '4', name: 'Transportation', amount: 300, type: 'recurring', category: 'transport' }
    ],
    savings: [
      { id: '1', name: 'Emergency Fund', amount: 15000, type: 'emergency' },
      { id: '2', name: 'Investments', amount: 25000, type: 'investment' }
    ],
    debts: [
      { id: '1', name: 'Student Loan', amount: 20000, interestRate: 4.5 },
      { id: '2', name: 'Credit Card', amount: 2000, interestRate: 18 }
    ],
    currency: "$"
  };
};
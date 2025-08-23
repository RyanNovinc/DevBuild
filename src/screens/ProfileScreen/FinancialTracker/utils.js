// src/screens/ProfileScreen/FinancialTracker/utils.js




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

// Calculate total debts (minus debt payments from assets)
export const calculateTotalDebt = (financialData) => {
  const rawDebt = financialData.debts.reduce((total, debt) => total + parseFloat(debt.amount), 0);
  
  // Subtract debt payments from Pay Off Debt assets
  const debtPayments = (financialData.assets || [])
    .filter(asset => asset.category === 'payOffDebt')
    .reduce((total, payment) => total + parseFloat(payment.amount), 0);
    
  return Math.max(0, rawDebt - debtPayments); // Never go below 0
};

// Calculate total assets (excluding Pay Off Debt which reduces debt instead)
export const calculateTotalAssets = (financialData) => {
  if (!financialData.assets || !Array.isArray(financialData.assets)) {
    return 0;
  }
  return financialData.assets
    .filter(asset => asset.category !== 'payOffDebt') // Exclude debt payments from assets
    .reduce((total, asset) => total + parseFloat(asset.amount), 0);
};

// Calculate net worth (assets - debts)
export const calculateNetWorth = (financialData) => {
  const totalAssets = calculateTotalAssets(financialData);
  const totalDebt = calculateTotalDebt(financialData);
  return totalAssets - totalDebt;
};

// Calculate savings percentage
export const calculateSavingsPercentage = (totalIncome, totalExpenses) => {
  if (totalIncome === 0) return 0;
  
  const monthlySavings = totalIncome - totalExpenses;
  return (monthlySavings / totalIncome) * 100;
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
    currency: "$",
    monthlyHistory: [] // Initialize empty monthly history
  };
};

// Create monthly snapshot
export const createMonthlySnapshot = (financialData) => {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const totalIncome = calculateTotalIncome(financialData);
  const totalExpenses = calculateTotalExpenses(financialData);
  const netGain = totalIncome - totalExpenses;
  const savingsPercentage = calculateSavingsPercentage(totalIncome, totalExpenses);
  
  return {
    month: currentMonth,
    monthName: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
    income: totalIncome,
    expenses: totalExpenses,
    netGain,
    savingsPercentage,
    timestamp: Date.now(),
    // Store individual items for editing capability
    incomeSources: [...(financialData.incomeSources || [])],
    expenseItems: [...(financialData.expenses || [])]
  };
};

// Add monthly snapshot to history
export const addMonthlySnapshot = (financialData, snapshot = null) => {
  const monthlySnapshot = snapshot || createMonthlySnapshot(financialData);
  const existingHistory = financialData.monthlyHistory || [];
  
  // Check if current month already exists
  const existingIndex = existingHistory.findIndex(
    item => item.month === monthlySnapshot.month
  );

  let updatedHistory;
  if (existingIndex >= 0) {
    // Update existing month
    updatedHistory = [...existingHistory];
    updatedHistory[existingIndex] = monthlySnapshot;
  } else {
    // Add new month
    updatedHistory = [...existingHistory, monthlySnapshot];
  }

  // Keep only last 24 months and sort by date
  updatedHistory = updatedHistory
    .sort((a, b) => new Date(b.month) - new Date(a.month))
    .slice(0, 24);

  return {
    ...financialData,
    monthlyHistory: updatedHistory
  };
};

// Calculate monthly averages
export const calculateMonthlyAverages = (monthlyHistory, months = 6) => {
  if (!monthlyHistory || monthlyHistory.length === 0) return null;

  const recentHistory = monthlyHistory
    .sort((a, b) => new Date(b.month) - new Date(a.month))
    .slice(0, months);

  if (recentHistory.length === 0) return null;

  const avgIncome = recentHistory.reduce((sum, item) => sum + item.income, 0) / recentHistory.length;
  const avgExpenses = recentHistory.reduce((sum, item) => sum + item.expenses, 0) / recentHistory.length;
  const avgNetGain = recentHistory.reduce((sum, item) => sum + item.netGain, 0) / recentHistory.length;
  const avgSavingsRate = recentHistory.reduce((sum, item) => sum + item.savingsPercentage, 0) / recentHistory.length;

  return {
    avgIncome,
    avgExpenses,
    avgNetGain,
    avgSavingsRate,
    monthsIncluded: recentHistory.length
  };
};

// Get current month identifier
export const getCurrentMonth = () => {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
};

// Get previous month identifier
export const getPreviousMonth = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().slice(0, 7); // YYYY-MM
};

// Check if current month data exists in history
export const hasCurrentMonthInHistory = (monthlyHistory) => {
  const currentMonth = getCurrentMonth();
  return monthlyHistory?.some(item => item.month === currentMonth) || false;
};

// Get month display name
export const getMonthDisplayName = (monthStr) => {
  return new Date(monthStr + '-01').toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });
};

// Check if financial data has unsaved changes for current month
export const hasUnsavedCurrentMonthData = (financialData) => {
  const currentMonth = getCurrentMonth();
  const hasCurrentData = (financialData.incomeSources?.length > 0) || 
                        (financialData.expenses?.length > 0);
  const existsInHistory = hasCurrentMonthInHistory(financialData.monthlyHistory);
  
  return hasCurrentData && !existsInHistory;
};
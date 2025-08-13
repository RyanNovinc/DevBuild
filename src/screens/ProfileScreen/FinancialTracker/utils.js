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
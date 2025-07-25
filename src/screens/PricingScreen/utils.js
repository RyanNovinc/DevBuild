// src/screens/PricingScreen/utils.js

/**
 * Generates a random referral code
 * @returns {string} A random 8-character alphanumeric code
 */
export const generateReferralCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Gets the base price for AI plans
 * @param {string} plan - The plan identifier: 'starter', 'professional', or 'business'
 * @param {boolean} isMonthly - Whether the plan is monthly or annual
 * @returns {number} The base price in USD
 */
export const getBasePlanPrice = (plan, isMonthly) => {
  switch(plan) {
    case 'starter':
      return isMonthly ? 4.99 : 3.99; // $4.99/mo or $3.99/mo annually (20% discount)
    case 'professional':
      return isMonthly ? 8.99 : 7.19; // $8.99/mo or $7.19/mo annually (20% discount)
    case 'business':
      return isMonthly ? 16.99 : 13.59; // $16.99/mo or $13.59/mo annually (20% discount)
    default:
      return 0;
  }
};

/**
 * Gets the exact hardcoded plan price to match what's shown on the cards
 * @param {string} plan - The plan identifier
 * @param {boolean} isLifetimeMember - Whether the user is a lifetime member
 * @param {string} selectedSubscription - The subscription type ('monthly' or 'annual')
 * @param {boolean} isDiscount - Whether to apply the 50% first-month referral discount
 * @returns {string} The monthly rate, formatted with 2 decimal places
 */
export const getExactPlanPrice = (plan, isLifetimeMember, selectedSubscription, isDiscount = false) => {
  // Use hardcoded values to match what's shown on the cards
  let price;
  const isMonthly = selectedSubscription === 'monthly';
  
  // Regular prices
  if (plan === 'starter') {
    price = isMonthly ? 4.99 : 3.99;
  } else if (plan === 'professional') {
    price = isMonthly ? 8.99 : 7.19;
  } else if (plan === 'business') {
    price = isMonthly ? 16.99 : 13.59;
  } else {
    price = 0;
  }
  
  // Apply 50% first-month referral discount if applicable
  if (isDiscount) {
    price = price * 0.5;
  }
  
  return price.toFixed(2);
};

/**
 * Calculates the monthly rate with applicable discounts
 * @param {string} plan - The plan identifier
 * @param {boolean} isLifetimeMember - Whether the user is a lifetime member
 * @param {string} selectedSubscription - The subscription type ('monthly' or 'annual')
 * @param {boolean} isDiscount - Whether to apply the 50% first-month referral discount
 * @returns {string} The monthly rate, formatted with 2 decimal places
 */
export const getMonthlyRate = (plan, isLifetimeMember, selectedSubscription, isDiscount = false) => {
  // Use the new getExactPlanPrice function to ensure consistency
  return getExactPlanPrice(plan, isLifetimeMember, selectedSubscription, isDiscount);
};

/**
 * Gets the lifetime discounted price
 * @param {string} plan - The plan identifier
 * @param {string} selectedSubscription - The subscription type ('monthly' or 'annual')
 * @returns {string} The discounted price, formatted with 2 decimal places
 */
export const getLifetimeDiscountedPrice = (plan, selectedSubscription) => {
  // Use the new getExactPlanPrice function to ensure consistency
  return getExactPlanPrice(plan, false, selectedSubscription);
};

/**
 * Calculates the regular price without discounts
 * @param {string} plan - The plan identifier
 * @param {string} selectedSubscription - The subscription type ('monthly' or 'annual')
 * @returns {string} The regular price, formatted with 2 decimal places
 */
export const getRegularPrice = (plan, selectedSubscription) => {
  return getExactPlanPrice(plan, false, selectedSubscription);
};

/**
 * Calculates the savings from lifetime membership
 * @param {string} plan - The plan identifier
 * @param {string} selectedSubscription - The subscription type ('monthly' or 'annual')
 * @returns {string} The amount saved, formatted with 2 decimal places
 */
export const getLifetimeSavings = (plan, selectedSubscription) => {
  const regularPrice = parseFloat(getRegularPrice(plan, selectedSubscription));
  const discountedPrice = parseFloat(getLifetimeDiscountedPrice(plan, selectedSubscription));
  return (regularPrice - discountedPrice).toFixed(2);
};
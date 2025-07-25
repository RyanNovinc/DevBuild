// src/screens/Onboarding/utils/accessibility.js
import { Platform } from 'react-native';

/**
 * Generate enhanced accessibility props for interactive elements
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.label - Accessibility label (what's read by screen reader)
 * @param {string} options.hint - Accessibility hint (extra guidance for screen reader)
 * @param {string} options.role - Accessibility role (default: 'button')
 * @param {boolean} options.isDisabled - Whether the element is disabled
 * @param {boolean} options.isExpanded - Whether the element is expanded
 * @param {boolean} options.isSelected - Whether the element is selected
 * @param {boolean} options.isBusy - Whether the element is busy/loading
 * @param {boolean} options.hasPopup - Whether the element has a popup
 * @returns {Object} - Accessibility props object
 */
export const getAccessibilityProps = ({
  label,
  hint,
  role = 'button',
  isDisabled = false,
  isExpanded = false,
  isSelected = false,
  isBusy = false,
  hasPopup = false,
}) => {
  // Common props for all platforms
  const props = {
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role,
    accessibilityState: {
      disabled: isDisabled,
      expanded: isExpanded,
      selected: isSelected,
      busy: isBusy,
    },
  };

  // Add platform-specific props
  if (Platform.OS === 'ios') {
    if (hasPopup) {
      props.accessibilityState.expanded = isExpanded;
    }
  } else if (Platform.OS === 'android') {
    if (hasPopup) {
      props.accessibilityState.expanded = isExpanded;
    }
  }

  return props;
};

/**
 * Focus management utility for screen readers
 * 
 * @param {React.RefObject} ref - Reference to the element to focus
 */
export const focusElement = (ref) => {
  if (ref && ref.current) {
    if (typeof ref.current.focus === 'function') {
      ref.current.focus();
    }
  }
};

/**
 * Enhance accessibility for a list of items
 * 
 * @param {number} index - Current item index
 * @param {number} totalCount - Total number of items
 * @returns {Object} - Accessibility props for list item
 */
export const getListItemAccessibilityProps = (index, totalCount) => {
  return {
    accessibilityState: {
      selected: false, // Override as needed
    },
    accessibilityHint: `Item ${index + 1} of ${totalCount}`,
  };
};
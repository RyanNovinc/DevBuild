// src/hocs/withSubscriptionCheck.js
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import useWidgetAccess from '../hooks/useWidgetAccess';
import WidgetLockOverlay from '../components/widgets/WidgetLockOverlay';

/**
 * Higher Order Component that wraps widgets to add subscription checks
 * @param {string} widgetId - The ID of the widget
 * @param {boolean} disableInteraction - If true, disables all interactions when locked
 * @param {boolean} dashboardMode - If true, shows minimal lock UI for dashboard view
 */
const withSubscriptionCheck = (WrappedComponent, widgetId, disableInteraction = true, dashboardMode = false) => {
  return (props) => {
    const { hasFullAccess, isLoading, requiresUpgrade } = useWidgetAccess(widgetId);
    
    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={props.theme?.primary || '#3F51B5'} />
        </View>
      );
    }
    
    // Create modified props with disabled buttons if needed
    const modifiedProps = { ...props };
    
    // If we need to disable interaction and this widget requires upgrade
    if (disableInteraction && requiresUpgrade) {
      // Disable any interactive props (buttons, handlers, etc.)
      // This example disables all onPress handlers
      Object.keys(props).forEach(key => {
        if (key.startsWith('on') && typeof props[key] === 'function') {
          modifiedProps[key] = () => {}; // Replace with empty function
        }
      });
      
      // Add a flag that the widget can check
      modifiedProps.isPremiumLocked = true;
    }
    
    return (
      <View style={{ flex: 1, position: 'relative' }}>
        <WrappedComponent {...modifiedProps} />
        
        {/* Show lock overlay if this widget requires an upgrade */}
        {requiresUpgrade && (
          <WidgetLockOverlay 
            theme={props.theme} 
            dashboardMode={dashboardMode}
            onUpgrade={props.onUpgrade}
          />
        )}
      </View>
    );
  };
};

export default withSubscriptionCheck;
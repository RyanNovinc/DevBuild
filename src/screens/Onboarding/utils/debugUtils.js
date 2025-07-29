// src/screens/Onboarding/utils/debugUtils.js

/**
 * Debug utility to detect infinite loops in React components
 * @param {string} componentName - Name of the component for logging
 * @param {number} threshold - Number of renders within timeframe to consider an infinite loop
 * @param {number} timeframeMs - Timeframe in milliseconds to check for renders
 * @returns {Object} - Object with methods for tracking renders
 */
export const createRenderTracker = (componentName, threshold = 20, timeframeMs = 1000) => {
  const renderTimes = [];
  let renderCount = 0;
  
  return {
    trackRender: () => {
      const now = Date.now();
      renderCount++;
      renderTimes.push(now);
      
      // Remove render times outside the timeframe
      while (renderTimes.length > 0 && renderTimes[0] < now - timeframeMs) {
        renderTimes.shift();
      }
      
      // Check for potential infinite loop
      if (renderTimes.length >= threshold) {
        console.error(`[INFINITE LOOP DETECTED] ${componentName} rendered ${renderTimes.length} times in ${timeframeMs}ms`);
        console.error('This likely indicates an infinite update loop. Check state updates and effects.');
        
        // Log the most recent renders
        console.error(`Recent render timestamps:`, renderTimes.slice(-5));
        
        // On dev, you could even force stop the loop
        // throw new Error('Infinite loop detected and stopped');
      }
      
      return {
        renderCount,
        recentRenders: renderTimes.length,
        message: `Render #${renderCount} (${renderTimes.length} in last ${timeframeMs}ms)`
      };
    }
  };
};
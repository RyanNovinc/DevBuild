// src/screens/TodoListScreen/TodoUtils.js
// Utility functions for todo operations

/**
 * Sort items by priority
 * @param {Array} items - The items to sort
 * @returns {Array} Sorted items
 */
export const sortItemsByPriority = (items) => {
  return items.sort((a, b) => {
    // Extract priority numbers from titles
    const getPriority = (item) => {
      const match = item.title.match(/^(\d+(?:\.\d+)*)\.\s*/);
      if (match) {
        // Convert "1.2.3" to [1, 2, 3] for proper sorting
        return match[1].split('.').map(num => parseInt(num, 10));
      }
      return null;
    };
    
    const aPriority = getPriority(a);
    const bPriority = getPriority(b);
    
    // If both have priority numbers, sort by priority
    if (aPriority && bPriority) {
      for (let i = 0; i < Math.max(aPriority.length, bPriority.length); i++) {
        const aNum = aPriority[i] || 0;
        const bNum = bPriority[i] || 0;
        if (aNum !== bNum) {
          return aNum - bNum;
        }
      }
      return 0;
    }
    
    // Items with priority numbers come first
    if (aPriority && !bPriority) return -1;
    if (!aPriority && bPriority) return 1;
    
    // For items without priority numbers, groups come first
    if (a.isGroup && !b.isGroup) return -1;
    if (!a.isGroup && b.isGroup) return 1;
    
    // Then sort by creation time
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
};

/**
 * Get the appropriate contrast text color based on background
 * @param {string} backgroundColor - Hex color
 * @param {boolean} isDarkMode - Whether the app is in dark mode
 * @param {object} theme - Theme object
 * @returns {string} Text color
 */
export const getContrastText = (backgroundColor, isDarkMode, theme) => {
  // For white background in dark mode, always return black
  if (backgroundColor === '#FFFFFF' && isDarkMode) {
    return '#000000';
  }
  
  // Use the primaryContrast from theme if it exists, or check manually
  if (theme.primaryContrast) {
    return theme.primaryContrast;
  }
  
  // Default to white for most colors and black for light colors
  if (backgroundColor === '#000000') {
    return '#FFFFFF';
  }
  
  // Calculate contrast based on color brightness
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

/**
 * Format date for note display - shows both date and time
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatNoteDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);
  
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (diffInHours < 24) {
    return `Today ${timeString}`;
  } else if (diffInHours < 48) {
    return `Yesterday ${timeString}`;
  } else {
    const dateString = date.toLocaleDateString();
    return `${dateString} ${timeString}`;
  }
};

/**
 * Format date for folder display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatFolderDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * Generate a random pastel color for folders
 * @returns {string} Hex color
 */
export const generateRandomPastelColor = () => {
  // Generate pastel colors by using higher base values
  const r = Math.floor(Math.random() * 127) + 128;
  const g = Math.floor(Math.random() * 127) + 128;
  const b = Math.floor(Math.random() * 127) + 128;
  
  // Convert to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Generate exportable content for todos
 * @param {Array} todosToExport - Todos to export
 * @returns {string} Formatted text
 */
export const generateExportContent = (todosToExport) => {
  let content = `📋 TO-DO LIST (${new Date().toLocaleDateString()})\n\n`;
  
  // Get all groups and top-level items
  const groups = todosToExport.filter(item => item.isGroup);
  const topLevelItems = todosToExport.filter(item => !item.isGroup && !item.groupId);
  
  // Add just items directly without "Pending" label
  const pendingTopLevel = topLevelItems.filter(todo => !todo.completed);
  const completedTopLevel = topLevelItems.filter(todo => todo.completed);
  
  if (pendingTopLevel.length > 0) {
    pendingTopLevel.forEach((todo, index) => {
      content += `${index + 1}. [ ] ${todo.title}\n`;
    });
  }
  
  if (completedTopLevel.length > 0) {
    content += `\n✅ Completed (${completedTopLevel.length}):\n`;
    completedTopLevel.forEach((todo, index) => {
      content += `${index + 1}. [✓] ${todo.title}\n`;
    });
  }
  
  // Add groups with their items
  if (groups.length > 0) {
    content += `\n📑 GROUPS:\n`;
    
    groups.forEach((group, groupIndex) => {
      const groupItems = todosToExport.filter(item => item.groupId === group.id);
      const pendingGroupItems = groupItems.filter(todo => !todo.completed);
      const completedGroupItems = groupItems.filter(todo => todo.completed);
      
      content += `\n${groupIndex + 1}. ${group.title} (${groupItems.length} items)\n`;
      
      if (pendingGroupItems.length > 0) {
        pendingGroupItems.forEach((todo, index) => {
          content += `   ${index + 1}. [ ] ${todo.title}\n`;
        });
      }
      
      if (completedGroupItems.length > 0) {
        content += `   Completed:\n`;
        completedGroupItems.forEach((todo, index) => {
          content += `   ${index + 1}. [✓] ${todo.title}\n`;
        });
      }
    });
  }
  
  content += `\nTotal: ${todosToExport.length} items\n`;
  content += `\nExported from Life Balance app`;
  
  return content;
};
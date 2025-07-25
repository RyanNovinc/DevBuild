// src/constants/domains.js
// Single source of truth for all domain definitions across the app

export const STANDARD_DOMAINS = [
  {
    name: "Career & Work",
    icon: "briefcase",
    color: "#4f46e5", // Indigo
    description: "Focusing on your professional development, workplace satisfaction, and career progression."
  },
  {
    name: "Health & Wellness",
    icon: "fitness",
    color: "#06b6d4", // Cyan
    description: "Prioritizing physical fitness, nutrition, sleep quality, and overall mental well-being."
  },
  {
    name: "Relationships",
    icon: "people",
    color: "#ec4899", // Pink
    description: "Strengthening connections with family, friends, romantic partners, and building meaningful social bonds."
  },
  {
    name: "Personal Growth",
    icon: "school",
    color: "#8b5cf6", // Violet
    description: "Developing new skills, expanding knowledge, and fostering character development."
  },
  {
    name: "Financial Security",
    icon: "cash",
    color: "#10b981", // Emerald
    description: "Managing money effectively, building savings, making smart investments, and working toward financial freedom."
  },
  {
    name: "Recreation & Leisure",
    icon: "bicycle",
    color: "#f59e0b", // Amber
    description: "Making time for hobbies, fun activities, relaxation, and travel that bring joy and balance."
  },
  {
    name: "Purpose & Meaning",
    icon: "compass",
    color: "#ef4444", // Red
    description: "Exploring spirituality, contributing to causes you care about, and aligning actions with your values."
  },
  {
    name: "Environment & Organization",
    icon: "home",
    color: "#6366f1", // Indigo/purple
    description: "Creating order in your physical spaces, developing systems, and optimizing your surroundings."
  },
  {
    name: "Other",
    icon: "star",
    color: "#14b8a6", // Teal
    description: "Any other goals that don't fit neatly into the standard domains."
  }
];

// Helper functions for domain operations

/**
 * Get a list of all unique domain names
 * @returns {string[]} Array of domain names
 */
export const getUniqueDomainNames = () => {
  return STANDARD_DOMAINS.map(domain => domain.name);
};

/**
 * Find a domain by its icon
 * @param {string} icon - The icon name to search for
 * @returns {string} The domain name, or "Other" if not found
 */
export const getDomainByIcon = (icon) => {
  const domain = STANDARD_DOMAINS.find(d => d.icon === icon);
  return domain ? domain.name : "Other";
};

/**
 * Find a domain by its name (case-insensitive)
 * @param {string} name - The domain name to search for
 * @returns {Object|null} The domain object or null if not found
 */
export const getDomainByName = (name) => {
  if (!name) return null;
  
  return STANDARD_DOMAINS.find(d => 
    d.name.toLowerCase() === name.toLowerCase()
  ) || null;
};

/**
 * Normalize a domain name to the standard version
 * @param {string} domainName - The domain name to normalize
 * @returns {string} The normalized domain name
 */
export const normalizeDomainName = (domainName) => {
  if (!domainName) return "Other";
  
  // Try to find a matching standard domain
  const domain = getDomainByName(domainName);
  return domain ? domain.name : domainName;
};

/**
 * Get domain color by name
 * @param {string} domainName - The domain name
 * @returns {string} The color hex code
 */
export const getDomainColor = (domainName) => {
  const domain = getDomainByName(domainName);
  return domain ? domain.color : "#14b8a6"; // Default to teal
};

/**
 * Get domain icon by name
 * @param {string} domainName - The domain name
 * @returns {string} The icon name
 */
export const getDomainIcon = (domainName) => {
  const domain = getDomainByName(domainName);
  return domain ? domain.icon : "star"; // Default to star
};
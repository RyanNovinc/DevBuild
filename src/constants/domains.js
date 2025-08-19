// src/constants/domains.js
// Single source of truth for all domain definitions across the app

export const STANDARD_DOMAINS = [
  {
    name: "Career & Work",
    icon: "briefcase",
    color: "#3B82F6", // Medium Blue - matches Domain Balance Wheel
    description: "Focusing on your professional development, workplace satisfaction, and career progression."
  },
  {
    name: "Health & Wellness",
    icon: "fitness",
    color: "#22C55E", // Medium Green - matches Domain Balance Wheel
    description: "Prioritizing physical fitness, nutrition, sleep quality, and overall mental well-being."
  },
  {
    name: "Relationships",
    icon: "people",
    color: "#EC4899", // Medium Pink - matches Domain Balance Wheel
    description: "Strengthening connections with family, friends, romantic partners, and building meaningful social bonds."
  },
  {
    name: "Personal Growth",
    icon: "school",
    color: "#F97316", // Medium Orange - matches Domain Balance Wheel
    description: "Developing new skills, expanding knowledge, and fostering character development."
  },
  {
    name: "Financial Security",
    icon: "cash",
    color: "#EAB308", // Medium Gold - matches Domain Balance Wheel
    description: "Managing money effectively, building savings, making smart investments, and working toward financial freedom."
  },
  {
    name: "Recreation & Leisure",
    icon: "bicycle",
    color: "#8B5CF6", // Medium Purple - matches Domain Balance Wheel
    description: "Making time for hobbies, fun activities, relaxation, and travel that bring joy and balance."
  },
  {
    name: "Purpose & Meaning",
    icon: "compass",
    color: "#EF4444", // Medium Red - matches Domain Balance Wheel
    description: "Exploring spirituality, contributing to causes you care about, and aligning actions with your values."
  },
  {
    name: "Community & Environment",
    icon: "home",
    color: "#06B6D4", // Medium Teal - matches Domain Balance Wheel
    description: "Living spaces, neighborhood quality, civic engagement, and environmental sustainability."
  },
  {
    name: "Other",
    icon: "star",
    color: "#14b8a6", // Teal - kept as is since not in Domain Balance Wheel
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
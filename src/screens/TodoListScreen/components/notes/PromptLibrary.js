// src/screens/TodoListScreen/components/notes/PromptLibrary.js
/**
 * Prompt Library - Research-backed daily standup prompts
 * Organized by type and theme for variety while maintaining effectiveness
 */

// Core default prompts (used first 30 days per research)
export const DEFAULT_PROMPTS = {
  morning: [
    {
      question: "What's your most important priority today?",
      placeholder: "Focus on one key milestone or task...",
      field: 'morningPriority'
    },
    {
      question: "What progress are you grateful for?",
      placeholder: "Acknowledge recent wins, however small...",
      field: 'morningGratitude'
    }
  ],
  evening: [
    {
      question: "What moved forward today?",
      placeholder: "Celebrate progress, learn from setbacks...",
      field: 'eveningHighlight'
    }
  ]
};

// Alternative prompt sets for variety (unlocked after consistency)
export const PROMPT_VARIATIONS = {
  // Focus & Productivity themed
  productivity: {
    name: "Productivity Focus",
    icon: "flash-outline",
    color: "#FF9500",
    morning: [
      {
        variations: [
          {
            question: "What's your ONE must-do today?",
            placeholder: "Choose the task that would make today successful..."
          },
          {
            question: "What's the most important outcome for today?",
            placeholder: "Focus on results, not just tasks..."
          },
          {
            question: "If you could only complete one thing today, what would it be?",
            placeholder: "Identify your highest impact activity..."
          },
          {
            question: "What will move the needle most today?",
            placeholder: "Think about progress, not just productivity..."
          }
        ],
        field: 'morningPriority'
      },
      {
        variations: [
          {
            question: "What energy am I bringing to today?",
            placeholder: "Rate your focus and motivation level..."
          },
          {
            question: "How can I optimize my focus today?",
            placeholder: "Consider environment, timing, and mindset..."
          },
          {
            question: "What's working well in my productivity lately?",
            placeholder: "Acknowledge effective habits and systems..."
          },
          {
            question: "How will I maintain momentum today?",
            placeholder: "Build on recent productive wins..."
          }
        ],
        field: 'morningGratitude'
      }
    ],
    evening: [
      {
        variations: [
          {
            question: "What did I accomplish that I'm proud of?",
            placeholder: "Acknowledge productivity wins and learnings..."
          },
          {
            question: "How did I move closer to my goals today?",
            placeholder: "Measure progress, not just completion..."
          },
          {
            question: "What productivity lesson did I learn today?",
            placeholder: "Capture insights about what works for you..."
          },
          {
            question: "What systems or habits served me well today?",
            placeholder: "Reinforce what's driving your productivity..."
          }
        ],
        field: 'eveningHighlight'
      }
    ]
  },

  // Growth & Learning themed
  growth: {
    name: "Growth Mindset",
    icon: "trending-up-outline",
    color: "#34C759",
    morning: [
      {
        question: "How will I challenge myself today?",
        placeholder: "Identify one growth opportunity...",
        field: 'morningPriority'
      },
      {
        question: "What skill am I developing right now?",
        placeholder: "Reflect on current learning journey...",
        field: 'morningGratitude'
      }
    ],
    evening: [
      {
        question: "What did I learn about myself today?",
        placeholder: "Capture insights and growth moments...",
        field: 'eveningHighlight'
      }
    ]
  },

  // Relationships & Connection themed
  relationships: {
    name: "Connection Focus",
    icon: "people-outline",
    color: "#FF3B30",
    morning: [
      {
        question: "Who will I prioritize connecting with today?",
        placeholder: "Focus on meaningful relationship building...",
        field: 'morningPriority'
      },
      {
        question: "What relationship am I grateful for?",
        placeholder: "Appreciate someone who supports you...",
        field: 'morningGratitude'
      }
    ],
    evening: [
      {
        question: "How did I strengthen a relationship today?",
        placeholder: "Reflect on connection moments...",
        field: 'eveningHighlight'
      }
    ]
  },

  // Health & Wellness themed
  wellness: {
    name: "Wellness Check",
    icon: "fitness-outline",
    color: "#30D158",
    morning: [
      {
        question: "How will I care for my wellbeing today?",
        placeholder: "Plan one self-care or health action...",
        field: 'morningPriority'
      },
      {
        question: "What's my body telling me right now?",
        placeholder: "Check in with energy, mood, physical state...",
        field: 'morningGratitude'
      }
    ],
    evening: [
      {
        question: "How did I honor my wellbeing today?",
        placeholder: "Celebrate healthy choices made...",
        field: 'eveningHighlight'
      }
    ]
  },

  // Purpose & Meaning themed
  purpose: {
    name: "Purpose Alignment",
    icon: "compass-outline",
    color: "#5856D6",
    morning: [
      {
        question: "How does today connect to my bigger goals?",
        placeholder: "Link daily actions to life purpose...",
        field: 'morningPriority'
      },
      {
        question: "What gives my work meaning today?",
        placeholder: "Find purpose in current efforts...",
        field: 'morningGratitude'
      }
    ],
    evening: [
      {
        question: "Did I live aligned with my values today?",
        placeholder: "Reflect on integrity and authenticity...",
        field: 'eveningHighlight'
      }
    ]
  },

  // Financial & Career themed
  career: {
    name: "Career Growth",
    icon: "briefcase-outline",
    color: "#007AFF",
    morning: [
      {
        question: "What career-building action will I take today?",
        placeholder: "Plan one step toward professional goals...",
        field: 'morningPriority'
      },
      {
        question: "What professional strength am I developing?",
        placeholder: "Recognize growing capabilities...",
        field: 'morningGratitude'
      }
    ],
    evening: [
      {
        question: "How did I invest in my future today?",
        placeholder: "Acknowledge career development efforts...",
        field: 'eveningHighlight'
      }
    ]
  },

  // Creativity & Innovation themed
  creativity: {
    name: "Creative Expression",
    icon: "color-palette-outline",
    color: "#FF9500",
    morning: [
      {
        question: "How will I express creativity today?",
        placeholder: "Plan one creative or innovative action...",
        field: 'morningPriority'
      },
      {
        question: "What inspires me right now?",
        placeholder: "Capture current sources of inspiration...",
        field: 'morningGratitude'
      }
    ],
    evening: [
      {
        question: "What did I create or innovate today?",
        placeholder: "Celebrate creative contributions...",
        field: 'eveningHighlight'
      }
    ]
  },

  // Gratitude & Mindfulness themed
  gratitude: {
    name: "Gratitude Practice",
    icon: "heart-outline",
    color: "#FF3B30",
    morning: [
      {
        question: "What am I most grateful for right now?",
        placeholder: "Start with appreciation and abundance...",
        field: 'morningPriority'
      },
      {
        question: "What simple pleasure will I savor today?",
        placeholder: "Plan mindful enjoyment moments...",
        field: 'morningGratitude'
      }
    ],
    evening: [
      {
        question: "What unexpected gift did today bring?",
        placeholder: "Find gratitude in surprises and challenges...",
        field: 'eveningHighlight'
      }
    ]
  }
};

// Weekly themed prompts (rotate automatically)
export const WEEKLY_THEMES = [
  { theme: 'productivity', week: 'Productivity Power Week' },
  { theme: 'growth', week: 'Growth & Learning Week' },
  { theme: 'relationships', week: 'Connection & Community Week' },
  { theme: 'wellness', week: 'Health & Wellness Week' },
  { theme: 'purpose', week: 'Purpose & Values Week' },
  { theme: 'career', week: 'Professional Development Week' },
  { theme: 'creativity', week: 'Creative Expression Week' },
  { theme: 'gratitude', week: 'Gratitude & Mindfulness Week' }
];

// Utility functions
export const getRandomPromptSet = () => {
  const themes = Object.keys(PROMPT_VARIATIONS);
  const randomTheme = themes[Math.floor(Math.random() * themes.length)];
  return PROMPT_VARIATIONS[randomTheme];
};

export const getWeeklyTheme = () => {
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % WEEKLY_THEMES.length;
  const themeConfig = WEEKLY_THEMES[weekNumber];
  return {
    ...themeConfig,
    prompts: PROMPT_VARIATIONS[themeConfig.theme]
  };
};

export const getPromptsByTheme = (themeName) => {
  return PROMPT_VARIATIONS[themeName] || DEFAULT_PROMPTS;
};

export const getAllThemes = () => {
  return Object.keys(PROMPT_VARIATIONS).map(key => ({
    key,
    ...PROMPT_VARIATIONS[key]
  }));
};
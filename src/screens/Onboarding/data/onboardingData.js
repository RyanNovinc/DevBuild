// src/screens/Onboarding/data/onboardingData.js
// Domain definitions with icons, colors, and descriptions
export const DOMAIN_DEFINITIONS = [
  {
    name: "Career & Work",
    icon: "briefcase-outline",
    color: "#3b82f6", // Blue
    description: "Professional goals, workplace satisfaction, career advancement",
    goals: [
      {
        name: "Career Advancement",
        description: "Focus on promotion and growth opportunities",
        icon: "trending-up-outline",
        explanation: "Taking deliberate steps toward career growth increases job satisfaction and financial rewards. This goal helps you move from letting your career happen to you to actively shaping your professional future.",
        projects: [
          {
            name: "Professional Development Plan",
            description: "Create a structured path for your career growth",
            explanation: "Having a clear roadmap for your professional growth prevents stagnation and guides your decisions. This project helps you identify both the destination and the steps to get there, rather than just hoping for advancement.",
            tasks: [
              {
                name: "Schedule a 1-hour meeting with your manager to discuss career path opportunities",
                summary: "Schedule meeting with manager",
                timeframe: "Career discussion - 1 hour",
                completed: false
              },
              {
                name: "Research 3 specific skills that people in your target position possess",
                summary: "Research skills",
                timeframe: "Online research - 30 mins",
                completed: false
              }
            ]
          },
          {
            name: "Skills & Visibility Enhancement",
            description: "Increase your impact and recognition",
            explanation: "Being skilled but invisible limits your career potential. This project focuses on developing key abilities while ensuring your contributions are recognized - both are essential for advancement in most organizations.",
            tasks: [
              {
                name: "Email your manager requesting to present at the next team or department meeting",
                summary: "Request presentation",
                timeframe: "Quick email - 10 mins",
                completed: false
              },
              {
                name: "Identify and reach out to a potential mentor with a specific request for guidance",
                summary: "Find mentor",
                timeframe: "Research + outreach - 45 mins",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Work-Life Balance",
        description: "Create boundaries for sustainable career success",
        icon: "timer-outline",
        explanation: "Maintaining boundaries between work and personal life prevents burnout and actually improves your effectiveness. This goal helps you create sustainable success rather than sacrificing wellbeing for short-term results.",
        projects: [
          {
            name: "Boundary Setting System",
            description: "Establish clear separation between work and personal life",
            explanation: "Clear boundaries prevent work from constantly encroaching on your personal time. This project helps you create systems that protect your non-work hours while still maintaining professional reliability.",
            tasks: [
              {
                name: "Configure 'do not disturb' settings on your phone and computer for non-work hours",
                summary: "Set up do not disturb",
                timeframe: "Device settings - 15 mins",
                completed: false
              },
              {
                name: "Draft an email to colleagues outlining your standard work hours and response times",
                summary: "Draft email",
                timeframe: "Professional email - 20 mins",
                completed: false
              }
            ]
          },
          {
            name: "Time Management Overhaul",
            description: "Optimize your work productivity",
            explanation: "Working more effectively during work hours reduces the need to work extra hours. This project helps you increase focus and efficiency, creating more space for personal life without compromising professional results.",
            tasks: [
              {
                name: "Block 30-minute chunks in your calendar for focused work on high-priority tasks",
                summary: "Schedule focus blocks",
                timeframe: "Calendar planning - 10 mins",
                completed: false
              },
              {
                name: "Create a 10-minute end-of-workday routine to prepare for tomorrow",
                summary: "Design end-of-day routine",
                timeframe: "Routine planning - 15 mins",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Skill Development",
        description: "Enhance your professional capabilities",
        icon: "school-outline",
        explanation: "Deliberately growing your professional capabilities makes you more valuable in your current role and more competitive for future opportunities. This goal helps you stay relevant in a changing workplace and positions you for advancement.",
        projects: [
          {
            name: "Learning Pathway Creation",
            description: "Structured approach to acquiring new skills",
            explanation: "Random learning leads to random results. This project helps you create a strategic plan for acquiring skills that actually matter for your career, ensuring your learning efforts translate to professional advancement.",
            tasks: [
              {
                name: "Sign up for a specific online course or workshop related to your target skill",
                summary: "Enroll in skills course",
                timeframe: "Course research + signup - 30 mins",
                completed: false
              },
              {
                name: "Schedule 3 recurring weekly blocks of 30 minutes for dedicated learning time",
                summary: "Schedule learning blocks",
                timeframe: "Calendar setup - 10 mins",
                completed: false
              }
            ]
          },
          {
            name: "Practical Application Plan",
            description: "Apply new skills in real-world contexts",
            explanation: "Learning without application rarely sticks or gets noticed. This project helps you put your new knowledge to work, which both reinforces your learning and demonstrates your growing capabilities to others.",
            tasks: [
              {
                name: "Identify one current project where you can apply your new skill",
                summary: "Find project",
                timeframe: "Planning review - 15 mins",
                completed: false
              },
              {
                name: "Set up a meeting with a colleague who has expertise in your target skill area",
                summary: "Schedule expert meeting",
                timeframe: "Contact + scheduling - 20 mins",
                completed: false
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Health & Wellness",
    icon: "fitness-outline",
    color: "#10b981", // Green
    description: "Physical fitness, nutrition, sleep, mental health",
    goals: [
      {
        name: "Regular Exercise",
        description: "Establish a consistent fitness routine",
        icon: "barbell-outline",
        explanation: "Regular physical activity improves energy, mood, sleep quality, and long-term health. This goal helps you make movement a consistent part of your life, which pays dividends in nearly every other area.",
        projects: [
          {
            name: "Sustainable Workout Routine",
            description: "Create a balanced exercise plan you can maintain",
            explanation: "The best exercise routine is one you'll actually do consistently. This project helps you develop a plan that fits your life and preferences, making it much more likely you'll stick with it long-term.",
            tasks: [
              {
                name: "Schedule 3 specific 30-minute workout sessions in your calendar for next week",
                summary: "Schedule workout sessions",
                timeframe: "Calendar blocking - 10 mins",
                completed: false
              },
              {
                name: "Create a simple workout log to track exercises, reps, and progress",
                summary: "Create workout log",
                timeframe: "Tracking setup - 15 mins",
                completed: false
              }
            ]
          },
          {
            name: "Exercise Environment Setup",
            description: "Optimize your space for successful workouts",
            explanation: "Environmental barriers often prevent good exercise intentions from becoming reality. This project helps you create physical spaces that support your fitness activities, making it easier to get started even when motivation is low.",
            tasks: [
              {
                name: "Clear and organize a specific area in your home for workout activities",
                summary: "Setup space",
                timeframe: "Home organization - 45 mins",
                completed: false
              },
              {
                name: "Purchase or gather basic exercise equipment (mat, resistance bands, weights)",
                summary: "Get exercise equipment",
                timeframe: "Shopping research - 30 mins",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Improved Nutrition",
        description: "Develop healthier eating habits",
        icon: "restaurant-outline",
        explanation: "What you eat affects your energy, mood, focus, and physical health. This goal helps you enhance the quality of your diet with sustainable changes rather than restrictive diets or quick fixes.",
        projects: [
          {
            name: "Meal Planning System",
            description: "Streamline healthy food preparation",
            explanation: "When you're hungry, you'll eat what's convenient. This project helps you make healthy options the easy choice by planning and preparing in advance, reducing reliance on in-the-moment food decisions.",
            tasks: [
              {
                name: "Create a shopping list template with healthy staple items for weekly grocery trips",
                summary: "Create healthy shopping list",
                timeframe: "Meal planning - 25 mins",
                completed: false
              },
              {
                name: "Schedule a 2-hour block on Sunday for meal preparation for the upcoming week",
                summary: "Schedule meal prep time",
                timeframe: "Calendar blocking - 5 mins",
                completed: false
              }
            ]
          },
          {
            name: "Nutritional Education",
            description: "Learn about food choices and their impact",
            explanation: "Understanding nutrition empowers better choices without rigid rules. This project helps you develop knowledge that guides your eating decisions, creating sustainable improvements rather than following temporary diets.",
            tasks: [
              {
                name: "Download a food tracking app and log everything you eat for 3 days",
                summary: "Start food tracking",
                timeframe: "App setup - 15 mins",
                completed: false
              },
              {
                name: "Research recommended portion sizes for your most commonly eaten foods",
                summary: "Learn portion sizes",
                timeframe: "Nutrition research - 20 mins",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Better Sleep Habits",
        description: "Improve sleep quality and consistency",
        icon: "moon-outline",
        explanation: "Quality sleep affects virtually every aspect of your physical and mental performance. This goal helps you optimize both the duration and quality of your sleep, with benefits that extend to your mood, cognition, and overall health.",
        projects: [
          {
            name: "Sleep Environment Optimization",
            description: "Create ideal conditions for restful sleep",
            explanation: "Your bedroom environment significantly impacts sleep quality. This project helps you transform your sleep space to minimize disruptions and support your body's natural sleep mechanisms.",
            tasks: [
              {
                name: "Purchase blackout curtains or a sleep mask to block light",
                summary: "Get light-blocking items",
                timeframe: "Online shopping - 20 mins",
                completed: false
              },
              {
                name: "Remove electronic devices from your bedroom or set up a charging station away from your bed",
                summary: "Remove electronics",
                timeframe: "Space reorganization - 15 mins",
                completed: false
              }
            ]
          },
          {
            name: "Sleep Routine Development",
            description: "Establish consistent sleep patterns",
            explanation: "Your body thrives on sleep consistency. This project helps you create regular patterns that signal your body when it's time to sleep, making it easier to fall asleep and wake feeling refreshed.",
            tasks: [
              {
                name: "Set a consistent bedtime alarm for the next 7 days",
                summary: "Set bedtime alarms",
                timeframe: "Phone setup - 5 mins",
                completed: false
              },
              {
                name: "Create a 15-minute pre-sleep routine (like reading, stretching, or meditation)",
                summary: "Design pre-sleep routine",
                timeframe: "Routine planning - 10 mins",
                completed: false
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Relationships",
    icon: "people-outline",
    color: "#ec4899", // Pink
    description: "Family, romantic, friendships, social connections",
    goals: [
      {
        name: "Quality Time",
        description: "Deepen your most important relationships",
        icon: "heart-outline",
        explanation: "Meaningful connections with others are consistently linked to happiness and longevity. This goal helps you nurture your closest relationships through intentional time together rather than letting connection happen by chance.",
        projects: [
          {
            name: "Scheduled Connection Points",
            description: "Create regular time for meaningful interaction",
            explanation: "What gets scheduled gets done, especially in busy lives. This project helps you ensure that quality time with loved ones becomes a protected priority rather than something that only happens when there's time left over.",
            tasks: [
              {
                name: "Schedule a weekly recurring 'date night' or family activity in your calendar",
                summary: "Schedule family time",
                timeframe: "Calendar setup - 10 mins",
                completed: false
              },
              {
                name: "Create a list of 10 activities you enjoy doing with your partner, family, or friends",
                summary: "List shared activities",
                timeframe: "Brainstorming - 15 mins",
                completed: false
              }
            ]
          },
          {
            name: "Meaningful Interaction Enhancement",
            description: "Improve the quality of your shared experiences",
            explanation: "Not all time together creates the same level of connection. This project helps you move beyond surface-level interaction to create deeper understanding and more meaningful shared experiences.",
            tasks: [
              {
                name: "Write down 5 thoughtful questions to ask your partner or family members",
                summary: "Prepare questions",
                timeframe: "Question writing - 10 mins",
                completed: false
              },
              {
                name: "Plan one special outing or experience based on a loved one's interests",
                summary: "Plan special outing",
                timeframe: "Activity planning - 30 mins",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Improved Communication",
        description: "Enhance understanding and connection",
        icon: "chatbubbles-outline",
        explanation: "How we communicate shapes the quality of our relationships. This goal helps you develop more effective ways to express yourself and understand others, which is fundamental to resolving conflicts and building deeper connections.",
        projects: [
          {
            name: "Active Listening Practice",
            description: "Become fully present in conversations",
            explanation: "Truly hearing others is often more impactful than speaking well. This project helps you enhance your ability to understand and validate others' perspectives, which dramatically improves relationship quality.",
            tasks: [
              {
                name: "Practice summarizing what someone has said before responding in your next conversation",
                summary: "Practice active listening",
                timeframe: "Conversation mindfulness - ongoing",
                completed: false
              },
              {
                name: "Eliminate distractions (put away phone, turn off TV) during your next important conversation",
                summary: "Remove conversation distractions",
                timeframe: "Mindful presence - ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Conflict Resolution Framework",
            description: "Handle disagreements constructively",
            explanation: "Conflict is inevitable; destructive conflict is optional. This project helps you develop healthier ways to address disagreements, transforming potential relationship damage into opportunities for growth and understanding.",
            tasks: [
              {
                name: "Write down your typical responses to conflict and identify 2 areas for improvement",
                summary: "Analyze conflict patterns",
                timeframe: "Self-reflection - 20 mins",
                completed: false
              },
              {
                name: "Practice using 'I' statements instead of 'you' statements in your next disagreement",
                summary: "Use 'I' statements",
                timeframe: "Communication practice - ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Building New Connections",
        description: "Expand your social circle",
        icon: "add-circle-outline",
        explanation: "A diverse social network provides different types of support, opportunities, and perspectives. This goal helps you expand your connections beyond your current circle, enriching your life with new relationships.",
        projects: [
          {
            name: "Social Opportunity Mapping",
            description: "Find and engage with new social groups",
            explanation: "Meeting new people requires putting yourself in the right environments. This project helps you identify and pursue specific opportunities to connect with others who share your interests or values.",
            tasks: [
              {
                name: "Research and join one local group, class, or club aligned with your interests",
                summary: "Join interest group",
                timeframe: "Research + signup - 45 mins",
                completed: false
              },
              {
                name: "RSVP 'yes' to the next social invitation you receive",
                summary: "Accept next invitation",
                timeframe: "Response commitment - 2 mins",
                completed: false
              }
            ]
          },
          {
            name: "Relationship Nurturing System",
            description: "Maintain and develop new connections",
            explanation: "New acquaintances don't automatically become meaningful connections. This project helps you turn initial meetings into deeper relationships through intentional follow-up and development.",
            tasks: [
              {
                name: "Create a contact list of people you want to stay connected with",
                summary: "Build connection list",
                timeframe: "Contact organization - 20 mins",
                completed: false
              },
              {
                name: "Schedule a coffee meeting or phone call with someone you'd like to know better",
                summary: "Schedule meeting",
                timeframe: "Outreach + scheduling - 15 mins",
                completed: false
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Personal Growth",
    icon: "book-outline",
    color: "#f59e0b", // Amber
    description: "Skills, learning, character development",
    goals: [
      {
        name: "Learning New Skills",
        description: "Acquire abilities outside your profession",
        icon: "bulb-outline",
        explanation: "Learning new skills outside your career broadens your identity and creates fulfillment beyond work achievements. This goal helps you develop new capabilities that enrich your life and build confidence in your ability to grow.",
        projects: [
          {
            name: "Skill Acquisition Framework",
            description: "Create a structured approach to learning",
            explanation: "Focused learning yields better results than scattered efforts. This project helps you develop a systematic approach to mastering a new skill, accelerating your progress beyond what random practice would achieve.",
            tasks: [
              {
                name: "Choose one specific non-work skill to focus on for the next month",
                summary: "Select skill to learn",
                timeframe: "Decision making - 10 mins",
                completed: false
              },
              {
                name: "Find and save 3 beginner-level tutorials or resources for your chosen skill",
                summary: "Find learning resources",
                timeframe: "Online research - 25 mins",
                completed: false
              }
            ]
          },
          {
            name: "Progress Tracking System",
            description: "Monitor your skill development",
            explanation: "Seeing your improvement maintains motivation during the learning journey. This project helps you measure and document your growth, providing encouragement when progress feels slow and helping identify areas needing more attention.",
            tasks: [
              {
                name: "Take photos or video of your current skill level as a baseline",
                summary: "Document current level",
                timeframe: "Recording baseline - 5 mins",
                completed: false
              },
              {
                name: "Create a simple spreadsheet to track practice sessions and improvements",
                summary: "Set up progress tracker",
                timeframe: "Spreadsheet creation - 15 mins",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Reading More",
        description: "Expand knowledge through literature",
        icon: "library-outline",
        explanation: "Regular reading improves vocabulary, reduces stress, expands knowledge, and provides new perspectives. This goal helps you make reading a consistent part of your life, with benefits for both your mind and emotional wellbeing.",
        projects: [
          {
            name: "Reading Habit Formation",
            description: "Make reading a regular part of your routine",
            explanation: "Consistent reading comes from making it a habit rather than a sporadic activity. This project helps integrate reading into your daily life, ensuring it happens regularly even when motivation fluctuates.",
            tasks: [
              {
                name: "Select a specific 15-minute time slot each day dedicated to reading",
                summary: "Schedule daily reading",
                timeframe: "Time blocking - 5 mins",
                completed: false
              },
              {
                name: "Create a comfortable reading nook with good lighting and minimal distractions",
                summary: "Set up reading space",
                timeframe: "Space arrangement - 30 mins",
                completed: false
              }
            ]
          },
          {
            name: "Reading Selection Strategy",
            description: "Choose books that align with your interests",
            explanation: "Reading material you genuinely enjoy dramatically increases your consistency. This project helps ensure you have access to books that excite you, eliminating the friction that comes from forcing yourself through uninteresting content.",
            tasks: [
              {
                name: "Make a list of 10 books you want to read this year",
                summary: "Create reading list",
                timeframe: "Book research - 20 mins",
                completed: false
              },
              {
                name: "Join an online or in-person book club related to your interests",
                summary: "Join book club",
                timeframe: "Research + signup - 30 mins",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Mindfulness Practice",
        description: "Develop greater awareness and presence",
        icon: "flower-outline",
        explanation: "Mindfulness reduces stress, improves focus, and enhances your experience of life. This goal helps you develop the ability to be fully present, countering the constant distraction that characterizes modern life.",
        projects: [
          {
            name: "Daily Mindfulness Routine",
            description: "Establish regular meditation practice",
            explanation: "Meditation is mental training that builds the capacity for present-moment awareness. This project helps you establish a consistent meditation practice, the foundation for developing broader mindfulness skills.",
            tasks: [
              {
                name: "Download a meditation app and complete a beginner's meditation",
                summary: "Start meditation app",
                timeframe: "App setup + first session - 20 mins",
                completed: false
              },
              {
                name: "Schedule a 5-minute meditation break in your calendar for the next 7 days",
                summary: "Schedule meditation breaks",
                timeframe: "Calendar blocking - 10 mins",
                completed: false
              }
            ]
          },
          {
            name: "Mindful Living Integration",
            description: "Bring awareness into everyday activities",
            explanation: "Mindfulness extends beyond formal meditation into daily life. This project helps you bring present-moment awareness to ordinary activities, transforming routine moments into opportunities for presence and appreciation.",
            tasks: [
              {
                name: "Identify one daily activity (like showering or walking) to practice being fully present",
                summary: "Choose mindfulness activity",
                timeframe: "Mindful planning - 5 mins",
                completed: false
              },
              {
                name: "Set a recurring reminder to do a 1-minute breathing exercise before meals",
                summary: "Set breathing reminders",
                timeframe: "Phone setup - 5 mins",
                completed: false
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Financial Security",
    icon: "cash-outline",
    color: "#6366f1", // Indigo
    description: "Money management, income, investments, financial freedom",
    goals: [
      {
        name: "Emergency Fund",
        description: "Build financial safety net",
        icon: "shield-outline",
        explanation: "An emergency fund prevents small financial surprises from becoming major setbacks. This goal helps you create a buffer against unexpected expenses, reducing financial stress and protecting your longer-term financial plans.",
        projects: [
          {
            name: "Savings Automation",
            description: "Create systematic savings process",
            explanation: "Automated saving removes the need for ongoing willpower. This project helps you establish systems that consistently build your emergency fund without requiring repeated decisions or discipline.",
            tasks: [
              {
                name: "Open a separate savings account specifically for your emergency fund",
                summary: "Open emergency fund account",
                timeframe: "Bank setup - 30 mins",
                completed: false
              },
              {
                name: "Set up an automatic transfer of a specific amount on each payday",
                summary: "Automate emergency savings",
                timeframe: "Banking setup - 15 mins",
                completed: false
              }
            ]
          },
          {
            name: "Expense Reduction Plan",
            description: "Find ways to increase savings rate",
            explanation: "Reducing unnecessary expenses is often easier than increasing income. This project helps you identify and eliminate spending that provides little value, accelerating your progress toward financial security.",
            tasks: [
              {
                name: "Review last month's bank and credit card statements to identify unnecessary expenses",
                summary: "Analyze spending patterns",
                timeframe: "Financial review - 45 mins",
                completed: false
              },
              {
                name: "Cancel one subscription or service you don't fully utilize",
                summary: "Cancel unused subscription",
                timeframe: "Account management - 10 mins",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Debt Reduction",
        description: "Systematically reduce financial obligations",
        icon: "trending-down-outline",
        explanation: "Debt payments limit your financial freedom and future options. This goal helps you strategically reduce what you owe, lowering financial stress and freeing up resources for saving and investing.",
        projects: [
          {
            name: "Debt Assessment & Strategy",
            description: "Create a comprehensive debt payoff plan",
            explanation: "A clear picture of your debt enables strategic payoff decisions. This project helps you develop a complete understanding of your debt situation and create an efficient plan to address it.",
            tasks: [
              {
                name: "Create a spreadsheet listing all debts with amounts, interest rates, and minimum payments",
                summary: "Create debt inventory",
                timeframe: "Financial tracking - 30 mins",
                completed: false
              },
              {
                name: "Calculate how much extra you can put toward your highest-priority debt each month",
                summary: "Calculate extra payments",
                timeframe: "Budget analysis - 15 mins",
                completed: false
              }
            ]
          },
          {
            name: "Payment Optimization",
            description: "Make your debt payments more effective",
            explanation: "How you structure your payments significantly impacts your progress. This project helps you make each payment more impactful, helping you become debt-free faster and with less total interest paid.",
            tasks: [
              {
                name: "Call one creditor to negotiate a lower interest rate",
                summary: "Negotiate interest rate",
                timeframe: "Phone negotiation - 30 mins",
                completed: false
              },
              {
                name: "Set up automatic payments for all monthly debt obligations",
                summary: "Automate debt payments",
                timeframe: "Payment setup - 20 mins",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Retirement Planning",
        description: "Prepare for long-term financial security",
        icon: "time-outline",
        explanation: "Today's decisions shape your financial future decades from now. This goal helps you build resources for your later years, providing security and options rather than limitations and stress as you age.",
        projects: [
          {
            name: "Retirement Account Optimization",
            description: "Maximize retirement savings",
            explanation: "Tax-advantaged accounts are powerful tools for long-term saving. This project helps you make the most effective use of retirement accounts, significantly increasing the growth of your investments over time.",
            tasks: [
              {
                name: "Review your current retirement account contributions and increase by 1%",
                summary: "Increase retirement savings",
                timeframe: "Account adjustment - 15 mins",
                completed: false
              },
              {
                name: "Schedule a meeting with an HR representative or financial advisor to discuss retirement options",
                summary: "Schedule retirement consultation",
                timeframe: "Meeting setup - 15 mins",
                completed: false
              }
            ]
          },
          {
            name: "Long-term Financial Roadmap",
            description: "Plan for future financial needs",
            explanation: "Retirement planning requires understanding your future needs. This project helps you develop clarity about your financial destination, making your current saving and investing decisions more purposeful and effective.",
            tasks: [
              {
                name: "Use an online retirement calculator to estimate your retirement needs",
                summary: "Calculate retirement needs",
                timeframe: "Online planning - 20 mins",
                completed: false
              },
              {
                name: "Research one additional investment vehicle for retirement savings",
                summary: "Research investment options",
                timeframe: "Financial research - 30 mins",
                completed: false
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Recreation & Leisure",
    icon: "bicycle-outline",
    color: "#8b5cf6", // Violet
    description: "Hobbies, fun, relaxation, travel",
    goals: [
      {
        name: "New Hobby",
        description: "Discover enjoyable leisure activities",
        icon: "game-controller-outline",
        explanation: "Hobbies provide fulfillment, stress relief, and identity beyond work. This goal helps you find and develop activities that bring joy and accomplishment for their own sake, not just for productivity.",
        projects: [
          {
            name: "Hobby Exploration",
            description: "Find activities that bring you joy",
            explanation: "The best hobby for you depends on your unique interests and temperament. This project helps you identify activities that genuinely excite you, rather than jumping into the first option that comes to mind.",
            tasks: [
              {
                name: "Make a list of 5 potential hobbies that interest you",
                summary: "List potential hobbies",
                timeframe: "Interest brainstorming - 10 mins",
                completed: false
              },
              {
                name: "Take a beginner class or watch an introductory video for your top hobby choice",
                summary: "Try first hobby lesson",
                timeframe: "Learning exploration - 1 hour",
                completed: false
              }
            ]
          },
          {
            name: "Skill Development Path",
            description: "Grow your hobby abilities",
            explanation: "Progressing in a hobby brings increasing satisfaction and engagement. This project helps you develop your capabilities in your chosen activity, creating a positive cycle of improvement and enjoyment.",
            tasks: [
              {
                name: "Purchase basic supplies or equipment for your chosen hobby",
                summary: "Get hobby supplies",
                timeframe: "Shopping + setup - 45 mins",
                completed: false
              },
              {
                name: "Join an online forum or social media group related to your hobby",
                summary: "Join hobby community",
                timeframe: "Online community - 15 mins",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Travel",
        description: "Experience new places and cultures",
        icon: "airplane-outline",
        explanation: "Travel broadens perspective and creates lasting memories. This goal helps you experience different places and cultures, providing both enjoyment in the moment and stories that enrich your life for years to come.",
        projects: [
          {
            name: "Travel Planning System",
            description: "Organize future adventures",
            explanation: "Effective planning makes travel more likely to happen and more enjoyable. This project helps you create a structured approach to planning trips, turning travel dreams into concrete plans and experiences.",
            tasks: [
              {
                name: "Create a list of 5 destinations you want to visit, ranked by priority",
                summary: "Create travel wishlist",
                timeframe: "Travel planning - 15 mins",
                completed: false
              },
              {
                name: "Research the best time of year to visit your top destination",
                summary: "Research travel timing",
                timeframe: "Travel research - 20 mins",
                completed: false
              }
            ]
          },
          {
            name: "Trip Experience Enhancement",
            description: "Make travel more meaningful",
            explanation: "The richest travel experiences go beyond standard tourism. This project helps you create more immersive and personally significant journeys that connect you more deeply with the places you visit.",
            tasks: [
              {
                name: "Learn 10 basic phrases in the language of your next destination",
                summary: "Learn basic phrases",
                timeframe: "Language learning - 30 mins",
                completed: false
              },
              {
                name: "Create a custom Google Map with points of interest for your next trip",
                summary: "Map trip highlights",
                timeframe: "Digital planning - 25 mins",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Creative Expression",
        description: "Develop artistic outlets",
        icon: "color-palette-outline",
        explanation: "Creative activities provide unique fulfillment and a way to process emotions. This goal helps you develop outlets for self-expression that balance analytical thinking with imagination and artistic exploration.",
        projects: [
          {
            name: "Creative Practice Establishment",
            description: "Make creativity a regular activity",
            explanation: "Consistent creative practice yields more satisfaction than occasional inspiration. This project helps you integrate creative activities into your routine, ensuring they become a reliable part of your life.",
            tasks: [
              {
                name: "Designate a specific area in your home for creative activities",
                summary: "Set up creative space",
                timeframe: "Space organization - 30 mins",
                completed: false
              },
              {
                name: "Schedule two 1-hour blocks this week for creative expression",
                summary: "Schedule creative time",
                timeframe: "Calendar blocking - 5 mins",
                completed: false
              }
            ]
          },
          {
            name: "Creative Growth Plan",
            description: "Develop your artistic skills",
            explanation: "Growing your creative abilities enhances both the process and results. This project helps you improve your skills in your chosen medium, increasing your satisfaction and the quality of what you create.",
            tasks: [
              {
                name: "Find and save a tutorial for a specific technique in your chosen creative medium",
                summary: "Find creative tutorial",
                timeframe: "Tutorial research - 15 mins",
                completed: false
              },
              {
                name: "Create something simple using your chosen medium and share it with someone",
                summary: "Create and share art",
                timeframe: "Creative session - 1 hour",
                completed: false
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Purpose & Meaning",
    icon: "diamond-outline",
    color: "#ef4444", // Red
    description: "Spirituality, contribution, values alignment",
    goals: [
      {
        name: "Spiritual Practice",
        description: "Nurture your spiritual dimension",
        icon: "infinite-outline",
        explanation: "Spiritual connection provides a framework for meaning and guidance through life's challenges. This goal helps you develop practices that connect you to something larger than yourself, whatever form that takes for you.",
        projects: [
          {
            name: "Daily Spiritual Routine",
            description: "Establish consistent spiritual practice",
            explanation: "Regular spiritual practices build a foundation for deeper connection. This project helps you create daily rhythms that nurture your spiritual life, making it an integrated part of your everyday experience.",
            tasks: [
              {
                name: "Select a specific time each day for prayer, meditation, or reflection",
                summary: "Schedule daily reflection",
                timeframe: "Spiritual planning - 10 mins",
                completed: false
              },
              {
                name: "Create a comfortable space with meaningful objects for spiritual practice",
                summary: "Set up spiritual space",
                timeframe: "Sacred space creation - 30 mins",
                completed: false
              }
            ]
          },
          {
            name: "Spiritual Community Connection",
            description: "Build relationships around shared beliefs",
            explanation: "Spiritual journeys benefit from community support and perspective. This project helps you find and engage with others who share your spiritual outlook, adding social connection to your individual practice.",
            tasks: [
              {
                name: "Research spiritual communities in your area that align with your beliefs",
                summary: "Find spiritual community",
                timeframe: "Community research - 30 mins",
                completed: false
              },
              {
                name: "Attend one service, meeting, or gathering of your chosen community",
                summary: "Attend spiritual gathering",
                timeframe: "Community participation - 2 hours",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Service to Others",
        description: "Make a positive difference",
        icon: "hand-right-outline",
        explanation: "Contributing to others' wellbeing creates meaning and purpose. This goal helps you find ways to make a positive difference, connecting your actions to values and needs beyond your own.",
        projects: [
          {
            name: "Volunteer Engagement",
            description: "Contribute your time and skills",
            explanation: "Hands-on service creates direct connection to the impact you make. This project helps you find meaningful ways to donate your time and talents to causes you care about.",
            tasks: [
              {
                name: "Research 3 local organizations that need volunteers in areas you care about",
                summary: "Research volunteers",
                timeframe: "Volunteer research - 30 mins",
                completed: false
              },
              {
                name: "Contact one organization to inquire about specific volunteer opportunities",
                summary: "Contact org",
                timeframe: "Outreach contact - 15 mins",
                completed: false
              }
            ]
          },
          {
            name: "Giving Strategy",
            description: "Share resources with causes you care about",
            explanation: "Financial giving extends your impact beyond your personal time limits. This project helps you develop a thoughtful approach to sharing resources with organizations making a difference in areas you value.",
            tasks: [
              {
                name: "Determine a specific percentage or amount of income to donate to causes you care about",
                summary: "Set giving budget",
                timeframe: "Financial planning - 20 mins",
                completed: false
              },
              {
                name: "Set up a recurring donation to one organization aligned with your values",
                summary: "Start recurring donation",
                timeframe: "Donation setup - 15 mins",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Finding Life Purpose",
        description: "Align your actions with your values",
        icon: "compass-outline",
        explanation: "Living with purpose creates deeper satisfaction than pursuing success alone. This goal helps you identify and pursue what truly matters to you, creating a life that feels meaningful rather than merely successful.",
        projects: [
          {
            name: "Values Clarification",
            description: "Identify what matters most to you",
            explanation: "Clear values provide guidance for life's many decisions. This project helps you gain clarity about your core values, creating a foundation for choices that align with what truly matters to you.",
            tasks: [
              {
                name: "Complete a values assessment exercise to identify your top 5 core values",
                summary: "Identify core values",
                timeframe: "Values assessment - 30 mins",
                completed: false
              },
              {
                name: "Write a one-paragraph personal mission statement based on your values",
                summary: "Write mission statement",
                timeframe: "Mission writing - 25 mins",
                completed: false
              }
            ]
          },
          {
            name: "Purpose-Aligned Activities",
            description: "Live according to your values",
            explanation: "Purpose comes from how you live daily, not just big decisions. This project helps you bring your everyday actions into greater alignment with your values, closing the gap between what you believe and how you live.",
            tasks: [
              {
                name: "List your weekly activities and rate each on how well it aligns with your values",
                summary: "Evaluate activity alignment",
                timeframe: "Values audit - 30 mins",
                completed: false
              },
              {
                name: "Identify and schedule one new activity that strongly aligns with your purpose",
                summary: "Add purpose-aligned activity",
                timeframe: "Activity planning - 20 mins",
                completed: false
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Environment & Organization",
    icon: "home-outline",
    color: "#0ea5e9", // Sky blue
    description: "Home, physical spaces, systems, surroundings",
    goals: [
      {
        name: "Home Organization",
        description: "Create order in your living spaces",
        icon: "file-tray-stacked-outline",
        explanation: "Your physical environment significantly impacts your mental state. This goal helps you create more orderly spaces that reduce stress, save time, and create a more peaceful backdrop for your life.",
        projects: [
          {
            name: "Systematic Decluttering",
            description: "Reduce excess items in your home",
            explanation: "Excess possessions create both physical and mental clutter. This project helps you intentionally remove unnecessary items, creating space and simplicity that benefit both your environment and mindset.",
            tasks: [
              {
                name: "Declutter one specific drawer or shelf completely",
                summary: "Declutter one area",
                timeframe: "Organizing session - 30 mins",
                completed: false
              },
              {
                name: "Create a donation box and fill it with items you no longer need",
                summary: "Fill donation box",
                timeframe: "Item sorting - 45 mins",
                completed: false
              }
            ]
          },
          {
            name: "Maintenance Routine Development",
            description: "Keep spaces organized over time",
            explanation: "Maintaining organization is easier than repeatedly reorganizing. This project helps you create systems to preserve order, preventing the need for major decluttering sessions in the future.",
            tasks: [
              {
                name: "Create a 10-minute daily tidying routine for high-traffic areas",
                summary: "Design tidying routine",
                timeframe: "Routine planning - 15 mins",
                completed: false
              },
              {
                name: "Develop a simple checklist of weekly cleaning tasks",
                summary: "Create cleaning checklist",
                timeframe: "Task planning - 10 mins",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Daily Routines",
        description: "Optimize your daily systems",
        icon: "today-outline",
        explanation: "The structure of your day shapes both productivity and wellbeing. This goal helps you create intentional patterns that reduce decision fatigue and ensure time for what matters most.",
        projects: [
          {
            name: "Morning Routine Optimization",
            description: "Start your day effectively",
            explanation: "How you begin your day sets the tone for everything that follows. This project helps you create a thoughtful morning sequence that builds momentum and positive energy from the first moments of wakefulness.",
            tasks: [
              {
                name: "Write down your ideal morning routine with specific timeframes",
                summary: "Plan morning routine",
                timeframe: "Routine design - 20 mins",
                completed: false
              },
              {
                name: "Prepare your morning environment the night before (set out clothes, prepare breakfast items)",
                summary: "Prep morning environment",
                timeframe: "Evening preparation - 10 mins",
                completed: false
              }
            ]
          },
          {
            name: "Evening Wind-Down System",
            description: "End your day with intention",
            explanation: "A deliberate evening routine improves sleep and reduces morning stress. This project helps you create a consistent transition from activity to rest, bookending your day with intention.",
            tasks: [
              {
                name: "Create a checklist of 5 items to prepare for the next day",
                summary: "Create evening checklist",
                timeframe: "Planning template - 10 mins",
                completed: false
              },
              {
                name: "Set a 'technology cutoff time' 1 hour before bed",
                summary: "Set tech cutoff time",
                timeframe: "Digital boundary - 5 mins",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Creating Peaceful Spaces",
        description: "Design environments that support wellbeing",
        icon: "leaf-outline",
        explanation: "Your surroundings continuously influence your mental and emotional state. This goal helps you shape your physical spaces to promote calm, focus, and wellbeing throughout your day.",
        projects: [
          {
            name: "Environment Assessment & Design",
            description: "Improve your physical surroundings",
            explanation: "Intentional environment design supports your goals and wellbeing. This project helps you identify and implement specific changes to make your physical spaces more supportive and enjoyable.",
            tasks: [
              {
                name: "Identify one room to improve and list 3 specific changes that would make it more peaceful",
                summary: "Plan room improvements",
                timeframe: "Space assessment - 15 mins",
                completed: false
              },
              {
                name: "Add one natural element (plant, natural light, natural materials) to your main living space",
                summary: "Add natural element",
                timeframe: "Space enhancement - 30 mins",
                completed: false
              }
            ]
          },
          {
            name: "Digital Environment Organization",
            description: "Create order in your digital spaces",
            explanation: "Digital clutter creates mental burden just like physical clutter. This project helps you bring the same intentionality to your digital environments, reducing digital stress and distraction.",
            tasks: [
              {
                name: "Delete or archive emails to achieve inbox zero",
                summary: "Clean email inbox",
                timeframe: "Email organization - 1 hour",
                completed: false
              },
              {
                name: "Organize files on your computer into a logical folder structure",
                summary: "Organize computer files",
                timeframe: "File organization - 45 mins",
                completed: false
              }
            ]
          }
        ]
      }
    ]
  }
];

// Utility function to get domain data by name
export const getDomainData = (domainName) => {
  return DOMAIN_DEFINITIONS.find(domain => 
    domain.name.toLowerCase() === domainName.toLowerCase()
  );
};
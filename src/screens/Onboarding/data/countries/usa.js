// src/screens/Onboarding/data/countries/usa.js
// USA-specific domain definitions with refined goals based on 2024-2025 research
export const DOMAIN_DEFINITIONS = [
  {
    name: "Career & Work",
    icon: "briefcase-outline",
    color: "#3b82f6", // Blue
    description: "Professional advancement, workplace goals, career development",
    goals: [
      {
        name: "Master Work-Life Balance",
        description: "Achieve sustainable integration between career success and personal wellbeing",
        icon: "balance-outline",
        explanation: "Work-life balance has become the #1 priority when choosing employers, with 65% of Gen Z preferring hybrid work and 83% ranking balance above pay for the first time in history.",
        projects: [
          {
            name: "Flexible Work Arrangement",
            description: "Negotiate and maintain work arrangements that support life integration",
            explanation: "77% willing to leave employers requiring full return-to-office. Hybrid work preferences have fundamentally changed workplace expectations.",
            tasks: [
              {
                name: "Document your productivity metrics and propose flexible work arrangement to manager",
                completed: false
              },
              {
                name: "Establish clear work hours and communicate boundaries to protect personal time",
                completed: false
              }
            ]
          },
          {
            name: "Stress Management System",
            description: "Develop tools to manage work stress and prevent burnout",
            explanation: "40% of Gen Z and 34% of millennials cite job stress as major anxiety source. Proactive stress management essential for sustainable success.",
            tasks: [
              {
                name: "Create daily routines that help transition between work and personal life",
                completed: false
              },
              {
                name: "Identify stress triggers and develop specific coping strategies for each",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Career-Advancing Skills",
        description: "Develop future-ready capabilities that guarantee career growth and advancement",
        icon: "trending-up-outline",
        explanation: "70% of Gen Z expect promotion within first 18 months. With rapid technological change, continuous skill development has become critical for career security.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "data-analytics",
            name: "Data Analytics & Business Intelligence",
            description: "Master data analysis, Excel, and business intelligence tools"
          },
          {
            id: "ai-ml",
            name: "AI & Machine Learning Applications",
            description: "Learn practical AI tools and machine learning fundamentals"
          },
          {
            id: "leadership",
            name: "Leadership & Communication Skills",
            description: "Develop soft skills for management and team leadership roles"
          }
        ],
        projects: [
          {
            name: "Strategic Skill Development",
            description: "Identify and master high-impact skills for your career path",
            explanation: "Skills gap means those who proactively develop capabilities have significant competitive advantages. 74% believe AI will impact their work within a year.",
            tasks: [
              {
                name: "Research top 3 skills most in-demand for your target career advancement",
                completed: false
              },
              {
                name: "Enroll in certification program or course for chosen skill area",
                completed: false
              }
            ]
          },
          {
            name: "Skill Application and Recognition",
            description: "Apply new skills in work context and build professional reputation",
            explanation: "86% prioritize soft skills as more important than technical abilities for advancement. Visibility of skill development crucial for promotion.",
            tasks: [
              {
                name: "Volunteer for projects that showcase your new skills to management",
                completed: false
              },
              {
                name: "Share knowledge through presentations or mentoring to build professional reputation",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Find Purpose-Driven Work",
        description: "Land meaningful role that aligns with personal values and impact goals",
        icon: "heart-outline",
        explanation: "89% of Gen Z and 92% of millennials consider purpose essential for job satisfaction. 44% have actually left jobs lacking purpose, and 40% reject employers based on personal ethics.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "environmental",
            name: "Environmental & Sustainability Roles",
            description: "Work in roles focused on environmental protection, sustainability, or climate action"
          },
          {
            id: "social-services",
            name: "Healthcare & Social Services",
            description: "Contribute to healthcare, social services, or community development"
          },
          {
            id: "education",
            name: "Education & Community Impact",
            description: "Work in education, training, or social impact organizations"
          }
        ],
        projects: [
          {
            name: "Values-Based Career Research",
            description: "Identify career opportunities that align with your personal values",
            explanation: "75% scrutinize potential employers' societal impact before applying. Values alignment has become non-negotiable for young professionals.",
            tasks: [
              {
                name: "Define your core values and research organizations that align with them",
                completed: false
              },
              {
                name: "Network with professionals working in purpose-driven roles in your chosen area",
                completed: false
              }
            ]
          },
          {
            name: "Purpose Integration Strategy",
            description: "Create plan to transition toward or integrate more purpose into current work",
            explanation: "Purpose-driven workers are 67-72% more likely to feel they contribute meaningfully. Heightened social consciousness makes values alignment critical.",
            tasks: [
              {
                name: "Identify ways to increase meaningful impact within your current role",
                completed: false
              },
              {
                name: "Apply for purpose-driven positions or propose impact initiatives at work",
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
    color: "#10b981", // Green
    description: "Building wealth, managing expenses, and achieving financial goals",
    goals: [
      {
        name: "Build 6-Month Emergency Fund",
        description: "Create financial security buffer for true peace of mind and stability",
        icon: "shield-outline",
        explanation: "48% of Gen Z and 46% of millennials feel financially insecure with 60% living paycheck to paycheck. Emergency funds provide the foundation enabling all other life goals.",
        projects: [
          {
            name: "Emergency Fund Foundation",
            description: "Calculate target amount and establish systematic saving plan",
            explanation: "Financial insecurity directly impacts mental health and job satisfaction. Without financial security, workers less likely to find work meaningful.",
            tasks: [
              {
                name: "Calculate 6 months of essential expenses to determine your emergency fund target",
                completed: false
              },
              {
                name: "Open high-yield savings account and set up automatic weekly transfers",
                completed: false
              }
            ]
          },
          {
            name: "Income and Expense Optimization",
            description: "Maximize savings rate through income growth and expense reduction",
            explanation: "High inflation and job market volatility make emergency funds more critical than ever for avoiding panic-driven career decisions.",
            tasks: [
              {
                name: "Track all expenses for one month to identify areas for cost reduction",
                completed: false
              },
              {
                name: "Research ways to increase income through side work or salary negotiation",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Pay Off High-Interest Debt",
        description: "Eliminate credit card and high-interest debt to unlock financial freedom",
        icon: "card-outline",
        explanation: "Over 40% prioritize debt settlement as their top financial goal. With average student debt at $33,260 for 25-34 age group plus consumer debt, this addresses their biggest financial burden.",
        projects: [
          {
            name: "Strategic Debt Elimination",
            description: "Create systematic plan to pay off all high-interest debt",
            explanation: "Rising interest rates make debt more expensive while housing costs require debt-free profiles for mortgage qualification.",
            tasks: [
              {
                name: "List all debts with balances, interest rates, and minimum payments",
                completed: false
              },
              {
                name: "Create debt payoff strategy prioritizing highest-interest debt first",
                completed: false
              }
            ]
          },
          {
            name: "Debt Prevention System",
            description: "Build habits and systems to avoid accumulating new debt",
            explanation: "42% of borrowers still paying student loans 20 years later. Preventing new debt accumulation crucial for long-term financial health.",
            tasks: [
              {
                name: "Create budget that prevents overspending and new debt accumulation",
                completed: false
              },
              {
                name: "Build emergency fund to avoid using credit for unexpected expenses",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Start Long-Term Investing",
        description: "Begin consistent investing to build wealth for major life goals",
        icon: "trending-up-outline",
        explanation: "Housing requires $114,000+ income but average salary only $65,470. Investment growth becomes essential as median first-time homebuyer age has risen to 38 from 28 in 1991.",
        projects: [
          {
            name: "Investment Foundation Setup",
            description: "Open investment accounts and begin systematic investing",
            explanation: "Traditional wealth-building path (homeownership) now requires capital first. Time is biggest asset for compound growth.",
            tasks: [
              {
                name: "Open investment accounts (401k, IRA, brokerage) and research low-cost index funds",
                completed: false
              },
              {
                name: "Set up automatic monthly investments of $200+ into diversified portfolio",
                completed: false
              }
            ]
          },
          {
            name: "Investment Knowledge Building",
            description: "Learn investment fundamentals and develop long-term strategy",
            explanation: "Need $70,000+ for median home down payment. Strategic investing essential for achieving major financial milestones.",
            tasks: [
              {
                name: "Complete investment fundamentals course or read reputable investing books",
                completed: false
              },
              {
                name: "Create long-term investment plan aligned with major life goals (home, retirement)",
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
    color: "#06b6d4", // Cyan
    description: "Physical fitness, mental health, nutrition, and overall wellbeing",
    goals: [
      {
        name: "Master Quality Sleep",
        description: "Achieve consistent 7-8 hours of restorative sleep for optimal health and performance",
        icon: "moon-outline",
        explanation: "Sleep quality ranks as top 3 wellness priority, with 54% prioritizing sleep improvement. The sleep crisis affects 70% of this age group who don't get recommended amounts.",
        projects: [
          {
            name: "Sleep Hygiene System",
            description: "Create environment and routines that support quality sleep",
            explanation: "Post-pandemic screen time increases and work-from-home boundary issues make quality sleep increasingly elusive but highly valued.",
            tasks: [
              {
                name: "Establish consistent bedtime routine and sleep schedule for 7-8 hours nightly",
                completed: false
              },
              {
                name: "Optimize bedroom environment (temperature, lighting, electronics) for better sleep",
                completed: false
              }
            ]
          },
          {
            name: "Sleep Stress Management",
            description: "Address anxiety and stress factors that interfere with sleep quality",
            explanation: "40% experience sleep anxiety 3+ times weekly. 24/7 connectivity and work stress significantly impact sleep quality.",
            tasks: [
              {
                name: "Create wind-down routine that reduces screen time 1 hour before bed",
                completed: false
              },
              {
                name: "Practice relaxation techniques (meditation, breathing) to manage sleep anxiety",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Fitness Routine",
        description: "Create sustainable exercise habits for lifelong physical and mental health",
        icon: "barbell-outline",
        explanation: "72% of millennials and 73% of Gen Z use fitness facilities with 88% prioritizing physical fitness. Yet 44% of Gen Z struggle with exercise motivation.",
        projects: [
          {
            name: "Sustainable Exercise Plan",
            description: "Design workout routine that fits your schedule and preferences",
            explanation: "Rising healthcare costs make preventive fitness crucial. Work-from-home culture requires intentional movement for both physical and mental health.",
            tasks: [
              {
                name: "Choose 3-4 physical activities you enjoy and can do consistently",
                completed: false
              },
              {
                name: "Schedule 150+ minutes of moderate exercise weekly (CDC guidelines)",
                completed: false
              }
            ]
          },
          {
            name: "Fitness Integration and Accountability",
            description: "Build exercise into daily life and create accountability systems",
            explanation: "Millennials emphasize mental health benefits of fitness. Social accountability and routine integration improve long-term success.",
            tasks: [
              {
                name: "Join fitness class, gym, or find workout partner for accountability",
                completed: false
              },
              {
                name: "Track workouts and celebrate progress to maintain motivation",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Get Regular Mental Health Support",
        description: "Establish therapy or counseling routine for emotional wellbeing and growth",
        icon: "happy-outline",
        explanation: "39% of Gen Z and millennials plan to pursue therapy, with 93% wanting to improve mental health. Only 37% with struggles currently seek care due to cost barriers.",
        projects: [
          {
            name: "Mental Health Care Access",
            description: "Find and establish relationship with mental health professional",
            explanation: "Mental health crisis post-pandemic with reduced stigma around therapy, but high costs create access barriers. Workplace benefits increasingly common.",
            tasks: [
              {
                name: "Research therapists or counselors covered by insurance or employee benefits",
                completed: false
              },
              {
                name: "Schedule initial therapy consultation and commit to regular sessions",
                completed: false
              }
            ]
          },
          {
            name: "Mental Wellness Foundation",
            description: "Build daily practices that support emotional wellbeing",
            explanation: "42% of Gen Z struggle with depression vs 23% over age 25. 90% believe more Americans should go to therapy for mental health maintenance.",
            tasks: [
              {
                name: "Establish daily mindfulness or meditation practice for stress management",
                completed: false
              },
              {
                name: "Create support network and regularly check in with trusted friends/family",
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
    description: "Building and maintaining meaningful personal connections",
    goals: [
      {
        name: "Build Strong Friendships",
        description: "Create and maintain 3-5 close, supportive friendships for lasting connection",
        icon: "people-outline",
        explanation: "Post-pandemic friendship crisis affects millions, with 22% saying it's been 5+ years since making a new friend. Yet 94% of young adults identify friends as primary social support.",
        projects: [
          {
            name: "Friendship Network Building",
            description: "Actively meet new people and develop meaningful friendships",
            explanation: "53% of Gen Z report loneliness vs 39% of all adults. Remote work reduces organic friendship opportunities, requiring intentional effort.",
            tasks: [
              {
                name: "Join activities, clubs, or groups where you can meet like-minded people",
                completed: false
              },
              {
                name: "Reach out to acquaintances and suggest regular social activities",
                completed: false
              }
            ]
          },
          {
            name: "Friendship Maintenance System",
            description: "Create habits that strengthen and maintain existing friendships",
            explanation: "Loneliness labeled 'signature mental health problem' of pandemic era. Social skill rebuilding needed post-isolation.",
            tasks: [
              {
                name: "Schedule regular check-ins and activities with close friends",
                completed: false
              },
              {
                name: "Be intentional about deepening friendships through vulnerable conversations",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Find Long-Term Partner",
        description: "Pursue conscious dating for meaningful romantic partnership",
        icon: "heart-outline",
        explanation: "70% of millennials want marriage and 74% want children eventually. Dating fatigue drives shift toward 'conscious dating' seeking deeper connections over casual encounters.",
        projects: [
          {
            name: "Intentional Dating Strategy",
            description: "Approach dating with clear intentions for long-term partnership",
            explanation: "Only 23% date solely to find spouse; 31% 'slow-date' without specific goals. Values alignment increasingly important in partner selection.",
            tasks: [
              {
                name: "Define your relationship values and what you want in a long-term partner",
                completed: false
              },
              {
                name: "Choose dating platforms and activities that attract people seeking serious relationships",
                completed: false
              }
            ]
          },
          {
            name: "Authentic Connection Building",
            description: "Focus on genuine compatibility and emotional connection in dating",
            explanation: "25% of singles say political alignment increases attraction. 'Genuine connection over love bombing' is top 2024 dating trend.",
            tasks: [
              {
                name: "Practice authentic communication and vulnerability in dating conversations",
                completed: false
              },
              {
                name: "Take time to build friendship foundation before pursuing romantic commitment",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Strengthen Family Relationships",
        description: "Develop regular family connection habits and stronger bonds",
        icon: "home-outline",
        explanation: "79% of millennials say family is most important in their lives—higher than any other priority. Post-pandemic emphasized family bonds, but geographic mobility makes maintenance challenging.",
        projects: [
          {
            name: "Family Communication Enhancement",
            description: "Create regular touchpoints and improve communication with family",
            explanation: "Family ranks #1 priority for millennials (79% vs 53% for health). Regular family connection linked to better mental health outcomes.",
            tasks: [
              {
                name: "Schedule regular calls or video chats with parents and siblings",
                completed: false
              },
              {
                name: "Plan quarterly family gatherings or visits to maintain close bonds",
                completed: false
              }
            ]
          },
          {
            name: "Meaningful Family Engagement",
            description: "Deepen family relationships through quality time and shared experiences",
            explanation: "Geographic mobility at historic highs makes intentional family connection essential. Economic pressures delay starting families but increase origin family importance.",
            tasks: [
              {
                name: "Share personal updates and ask family members about their lives regularly",
                completed: false
              },
              {
                name: "Create family traditions or activities that bring everyone together",
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
    icon: "school-outline",
    color: "#8b5cf6", // Purple
    description: "Learning, self-improvement, and developing new capabilities",
    goals: [
      {
        name: "Learn Data Analytics",
        description: "Master data analysis skills for career enhancement and decision-making",
        icon: "bar-chart-outline",
        explanation: "Data analytics skills show 52% job growth (2019-2024), accounting for 8% of global postings. Microsoft Excel was #1 most popular course in 2024.",
        projects: [
          {
            name: "Data Analytics Certification",
            description: "Complete comprehensive data analytics training program",
            explanation: "44% of companies need these skills and 40% of junior employees want to develop them. Average data analyst salary significantly exceeds national averages.",
            tasks: [
              {
                name: "Enroll in data analytics certification program (Google, Microsoft, or university)",
                completed: false
              },
              {
                name: "Complete hands-on projects using real datasets to build portfolio",
                completed: false
              }
            ]
          },
          {
            name: "Practical Application Development",
            description: "Apply data skills to work projects and build professional reputation",
            explanation: "Over 90% of companies face IT skills shortages until 2026. Practical application of data skills creates immediate career value.",
            tasks: [
              {
                name: "Identify opportunities to use data analysis in your current role",
                completed: false
              },
              {
                name: "Present data-driven insights to management to demonstrate value",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Start Creative Side Hustle",
        description: "Generate $500+ monthly income from creative skills and talents",
        icon: "brush-outline",
        explanation: "36-45% of Americans have side hustles, with 48% of Gen Z and 44% of Millennials participating. Average side hustler earns $891 monthly with creative pursuits averaging $42-53/hour.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "digital-content",
            name: "Digital Content Creation (videos, blogs, social media)",
            description: "Create online content through YouTube, blogging, or social media"
          },
          {
            id: "handmade-products",
            name: "Handmade Products & Crafts (Etsy, local markets)",
            description: "Make and sell physical products through online marketplaces"
          },
          {
            id: "creative-services",
            name: "Creative Services (design, writing, photography)",
            description: "Offer creative professional services to clients"
          }
        ],
        projects: [
          {
            name: "Side Hustle Launch Strategy",
            description: "Choose creative focus and establish business foundation",
            explanation: "Rise of creator economy and accessible digital platforms enable side project success. 23% see side hustles as creative outlets.",
            tasks: [
              {
                name: "Identify your creative strengths and research market demand",
                completed: false
              },
              {
                name: "Set up business platform (Etsy, YouTube, Fiverr) and create first offerings",
                completed: false
              }
            ]
          },
          {
            name: "Revenue Generation and Growth",
            description: "Scale creative side hustle to consistent monthly income",
            explanation: "55% of full-time workers want to turn hobbies into businesses. Economic pressures drive income diversification needs.",
            tasks: [
              {
                name: "Complete first 10 sales or projects to establish reputation and reviews",
                completed: false
              },
              {
                name: "Optimize pricing and marketing to reach $500+ monthly revenue target",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Learn AI/Machine Learning",
        description: "Gain practical AI literacy with hands-on projects and applications",
        icon: "laptop-outline",
        explanation: "AI skills are fastest-growing globally, with 83% of Millennials/Gen Z finding AI useful for personal tasks and 72% of employees wanting AI training.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "practical-tools",
            name: "Practical AI Tools for Work (ChatGPT, automation)",
            description: "Master everyday AI tools that improve work productivity"
          },
          {
            id: "ml-fundamentals",
            name: "Machine Learning & Data Science Fundamentals",
            description: "Learn technical foundations of machine learning and data science"
          },
          {
            id: "ai-strategy",
            name: "AI Strategy & Business Applications",
            description: "Understand AI's business impact and strategic implementation"
          }
        ],
        projects: [
          {
            name: "AI Skills Development",
            description: "Complete structured AI/ML learning program with practical projects",
            explanation: "ChatGPT mainstream adoption and AI integration across industries make AI literacy as fundamental as digital literacy.",
            tasks: [
              {
                name: "Enroll in AI/ML course appropriate for your technical background and goals",
                completed: false
              },
              {
                name: "Complete hands-on projects that demonstrate practical AI application",
                completed: false
              }
            ]
          },
          {
            name: "AI Integration and Application",
            description: "Apply AI skills to work and personal projects for real-world value",
            explanation: "40% of companies adopting AI need workforce training. Those without AI skills risk being left behind in rapidly changing job market.",
            tasks: [
              {
                name: "Identify opportunities to use AI tools in your current work or projects",
                completed: false
              },
              {
                name: "Share AI knowledge with colleagues or create content demonstrating expertise",
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
    color: "#f59e0b", // Orange
    description: "Hobbies, entertainment, travel, and lifestyle enjoyment",
    goals: [
      {
        name: "Plan Solo Adventure Travel",
        description: "Complete meaningful solo travel experience for personal growth and adventure",
        icon: "airplane-outline",
        explanation: "70% of 25-34 year-olds travel annually, with 75% of Gen Z planning solo trips in 2024. Solo travel has become major trend for personal growth and independence.",
        projects: [
          {
            name: "Solo Travel Planning",
            description: "Research and plan meaningful solo adventure experience",
            explanation: "Gen Z spends average $11,766 on trips, surpassing all generations. Post-pandemic travel surge with work-from-home flexibility enabling longer trips.",
            tasks: [
              {
                name: "Choose destination and create detailed itinerary for solo adventure trip",
                completed: false
              },
              {
                name: "Budget and save specifically for solo travel experience",
                completed: false
              }
            ]
          },
          {
            name: "Travel Execution and Growth",
            description: "Execute solo trip and maximize personal growth from experience",
            explanation: "61% prioritize wellness and well-being travel experiences. Desire for authentic cultural experiences over traditional tourism drives solo adventure popularity.",
            tasks: [
              {
                name: "Book and complete solo adventure trip with focus on personal growth",
                completed: false
              },
              {
                name: "Document experience and plan future solo travel adventures",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Explore Wellness Activities",
        description: "Maintain 4+ weekly wellness activities for holistic health and relaxation",
        icon: "leaf-outline",
        explanation: "Over 60% of young adults use fitness apps regularly, with fitness/wellness ranking #2 hobby for 25-34 year-olds. Millennials spend $115/month on wellness services.",
        projects: [
          {
            name: "Wellness Routine Development",
            description: "Create diverse wellness activities that support mental and physical health",
            explanation: "35% of millennials pay for gym memberships (highest rate). Post-pandemic focus on mental health and self-care drives wellness participation.",
            tasks: [
              {
                name: "Try different wellness activities (yoga, meditation, spa, massage) to find preferences",
                completed: false
              },
              {
                name: "Schedule 4+ weekly wellness activities and track their impact on wellbeing",
                completed: false
              }
            ]
          },
          {
            name: "Wellness Community Building",
            description: "Connect with others through wellness activities and build supportive community",
            explanation: "Remote work enables flexible wellness schedules. Recognition of wellness as lifestyle priority rather than vanity drives consistent participation.",
            tasks: [
              {
                name: "Join wellness classes or groups that provide social connection and accountability",
                completed: false
              },
              {
                name: "Share wellness journey with friends and encourage their participation",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Explore Local Culture",
        description: "Try 24 new local restaurants, events, and cultural activities within 12 months",
        icon: "restaurant-outline",
        explanation: "Millennials spend $164/month on entertainment, with 79% willing to eat at popular restaurants. Experience economy thrives as 78% prefer memorable experiences over physical items.",
        projects: [
          {
            name: "Local Cultural Exploration",
            description: "Systematically discover and experience local cultural offerings",
            explanation: "Dining out is how millennials choose to spend time and money. Cultural exploration and local cuisine top motivators for meaningful experiences.",
            tasks: [
              {
                name: "Create list of local restaurants, museums, theaters, and events to try",
                completed: false
              },
              {
                name: "Plan to try 2 new local cultural experiences each month",
                completed: false
              }
            ]
          },
          {
            name: "Community Cultural Engagement",
            description: "Share cultural experiences with friends and support local businesses",
            explanation: "Experience economy growth with social media driving discovery of local gems. Post-pandemic appreciation for community and local businesses.",
            tasks: [
              {
                name: "Invite friends to join cultural exploration activities for shared experiences",
                completed: false
              },
              {
                name: "Document and share favorite local discoveries to support community businesses",
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
    icon: "compass-outline",
    color: "#ef4444", // Red
    description: "Finding fulfillment, contributing to causes, and living with intention",
    goals: [
      {
        name: "Volunteer in Community",
        description: "Complete 50+ hours of meaningful community service within 12 months",
        icon: "heart-outline",
        explanation: "28.3% of Americans volunteer formally (75.7+ million), with volunteering rebounding 5.1% post-pandemic. Ages 35-44 have highest volunteer rates (28.9%) and 96% report enriched purpose.",
        projects: [
          {
            name: "Strategic Volunteering Setup",
            description: "Choose cause and commit to regular volunteer service",
            explanation: "Post-pandemic volunteer surge shows renewed community engagement. Virtual options make participation accessible for busy professionals seeking meaningful contribution.",
            tasks: [
              {
                name: "Research local organizations working on causes you care about",
                completed: false
              },
              {
                name: "Commit to regular monthly volunteering schedule (4+ hours monthly)",
                completed: false
              }
            ]
          },
          {
            name: "Volunteer Impact and Growth",
            description: "Maximize impact of volunteer work and develop leadership opportunities",
            explanation: "Economic value of volunteer time: $28.54/hour. 18% serve virtually, increasing accessibility for different volunteering approaches.",
            tasks: [
              {
                name: "Track volunteer hours and measure impact created for chosen cause",
                completed: false
              },
              {
                name: "Take on leadership role or special project within volunteer organization",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Align Work with Values",
        description: "Find career role that matches personal ethics and impact goals",
        icon: "compass-outline",
        explanation: "92% of millennials and 89% of Gen Z consider purpose important for job satisfaction. Nearly half have left roles lacking purpose, while 40% reject assignments based on ethics.",
        projects: [
          {
            name: "Values-Work Integration Strategy",
            description: "Assess current role and plan for better values alignment",
            explanation: "'Great Resignation' mentality continues with professionals prioritizing values over traditional metrics. Remote work flexibility enables more selective job choices.",
            tasks: [
              {
                name: "Assess how well your current role aligns with your personal values",
                completed: false
              },
              {
                name: "Identify specific ways to increase meaningful impact in your current or future role",
                completed: false
              }
            ]
          },
          {
            name: "Purpose-Driven Career Development",
            description: "Network and pursue opportunities that align with values and impact goals",
            explanation: "75% say community engagement matters when choosing employers. 67-72% with positive well-being feel jobs allow societal contribution.",
            tasks: [
              {
                name: "Network with professionals working in purpose-driven organizations",
                completed: false
              },
              {
                name: "Apply for roles or propose initiatives that align work with personal values",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Live More Sustainably",
        description: "Reduce personal environmental impact by 30% through lifestyle changes",
        icon: "leaf-outline",
        explanation: "Environmental sustainability tops priorities, with ~60% worried about climate monthly. Half of Gen Z/millennials actively pressure businesses on climate action.",
        projects: [
          {
            name: "Sustainable Lifestyle Assessment",
            description: "Audit current environmental impact and identify reduction opportunities",
            explanation: "64% actively reducing possessions for environmental reasons. Climate anxiety drives concrete action seeking for tangible impact.",
            tasks: [
              {
                name: "Calculate current carbon footprint and identify top 3 reduction opportunities",
                completed: false
              },
              {
                name: "Implement sustainable practices in transportation, food, and consumption",
                completed: false
              }
            ]
          },
          {
            name: "Environmental Impact Tracking",
            description: "Measure and track progress toward 30% environmental impact reduction",
            explanation: "Sustainability initiatives top priority for 47% wanting impact. Climate crisis creates urgency for personal action with measurable results.",
            tasks: [
              {
                name: "Track monthly environmental impact metrics and celebrate progress",
                completed: false
              },
              {
                name: "Share sustainable living tips with friends and influence others positively",
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
    color: "#6366f1", // Indigo
    description: "Creating organized, comfortable living and working spaces",
    goals: [
      {
        name: "Buy First Home",
        description: "Navigate path to homeownership despite affordability challenges",
        icon: "key-outline",
        explanation: "Millennials are largest homebuyer group (38%) with 23% planning purchase within 6 months. Despite affordability crisis, 82% view homeownership as good investment.",
        projects: [
          {
            name: "Homeownership Preparation Strategy",
            description: "Build financial foundation and knowledge for home purchase",
            explanation: "Need $114,000 income for median home vs ~$57,000 average salary. Rising interest rates create urgency while remote work opens new geographic possibilities.",
            tasks: [
              {
                name: "Research first-time homebuyer programs and down payment assistance options",
                completed: false
              },
              {
                name: "Get pre-approved for mortgage to understand buying power and requirements",
                completed: false
              }
            ]
          },
          {
            name: "Home Purchase Execution",
            description: "Execute home search and purchase process strategically",
            explanation: "Only 36% of under-35s own homes (down from 44% mid-2000s). 71% of younger millennial buyers are first-timers navigating complex process.",
            tasks: [
              {
                name: "Save for down payment and closing costs in dedicated high-yield account",
                completed: false
              },
              {
                name: "Work with real estate agent to find and purchase first home",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Organize Living Space",
        description: "Declutter and organize home environment for calm and productivity",
        icon: "grid-outline",
        explanation: "64% of millennials/Gen Z actively reducing possessions in 2024. Decluttering is #1 New Year's resolution, with people 'more ruthless than ever' about items.",
        projects: [
          {
            name: "Systematic Decluttering Process",
            description: "Remove unnecessary items and create organized living systems",
            explanation: "Post-pandemic accumulation leaving people overwhelmed. Work-from-home makes organized space crucial for productivity and mental health.",
            tasks: [
              {
                name: "Declutter each room systematically using proven methods (KonMari, one-touch rule)",
                completed: false
              },
              {
                name: "Organize remaining possessions with storage solutions and labeling systems",
                completed: false
              }
            ]
          },
          {
            name: "Sustainable Organization Maintenance",
            description: "Create habits and systems that maintain organized living space",
            explanation: "Minimalism driven by functionality for busy lifestyles. Organized spaces significantly reduce stress and anxiety levels.",
            tasks: [
              {
                name: "Establish daily and weekly routines to maintain organization",
                completed: false
              },
              {
                name: "Choose sustainable organizing materials that align with environmental values",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Create Eco-Friendly Home",
        description: "Transform living space into energy-efficient, sustainable environment",
        icon: "leaf-outline",
        explanation: "Millennials prioritize sustainability in housing, seeking energy-efficient appliances and eco-friendly materials. 88% prefer urban living with sustainable amenities.",
        projects: [
          {
            name: "Energy Efficiency Improvements",
            description: "Implement changes that reduce energy consumption and environmental impact",
            explanation: "Technology advances make eco-friendly improvements accessible. Climate change concerns drive action on living space sustainability.",
            tasks: [
              {
                name: "Audit home energy usage and identify opportunities for efficiency improvements",
                completed: false
              },
              {
                name: "Implement energy-saving measures (LED lighting, smart thermostat, efficient appliances)",
                completed: false
              }
            ]
          },
          {
            name: "Sustainable Living Integration",
            description: "Adopt eco-friendly practices and materials throughout living space",
            explanation: "Green technologies increasingly standard in developments. Energy savings provide immediate financial benefits while supporting environmental goals.",
            tasks: [
              {
                name: "Replace household products with eco-friendly alternatives",
                completed: false
              },
              {
                name: "Set up composting, recycling, and waste reduction systems",
                completed: false
              }
            ]
          }
        ]
      }
    ]
  }
];
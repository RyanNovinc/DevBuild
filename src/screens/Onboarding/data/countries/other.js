// src/screens/Onboarding/data/countries/other.js
// Universal domain definitions for users from countries not specifically supported
// Based on globally applicable goals and universal human aspirations

export const DOMAIN_DEFINITIONS = [
  {
    name: "Career & Work",
    icon: "briefcase",
    color: "#3b82f6", // Blue
    description: "Professional advancement, workplace goals, career development",
    goals: [
      {
        name: "Switch to Tech Career",
        description: "Transition into technology sector with high-demand skills and global opportunities",
        icon: "code",
        explanation: "The global technology sector grows 32% faster than the overall economy, creating opportunities worldwide. Tech skills enable remote work and access to international markets.",
        projects: [
          {
            name: "Learn Core Programming Skills",
            description: "Master fundamental programming languages and development concepts",
            explanation: "Programming skills provide the foundation for tech career transition. Focus on in-demand languages with strong job market demand.",
            tasks: [
              {
                name: "Choose primary programming language (Python, JavaScript, or Java) based on career goals",
                summary: "Choose language",
                explanation: "Language choice should align with target role - Python for data/AI, JavaScript for web development, Java for enterprise applications.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Complete comprehensive online programming course with hands-on projects",
                summary: "Complete course",
                explanation: "Structured learning with projects builds both knowledge and portfolio evidence of capabilities for potential employers.",
                timeframe: "3 months",
                completed: false
              }
            ]
          },
          {
            name: "Build Professional Portfolio",
            description: "Create portfolio demonstrating practical programming skills and project experience",
            explanation: "Portfolio projects showcase abilities to employers and provide concrete examples of problem-solving skills.",
            tasks: [
              {
                name: "Develop 3-5 projects showcasing different programming concepts and technologies",
                summary: "Build projects",
                explanation: "Diverse projects demonstrate versatility and depth of understanding across different programming domains and use cases.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Create GitHub profile and deploy projects with clear documentation",
                summary: "Deploy portfolio",
                explanation: "Professional GitHub presence demonstrates version control skills and collaborative development practices valued by employers.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Secure Flexible Work with New Skills",
        description: "Develop valuable capabilities to negotiate remote or hybrid work arrangements",
        icon: "laptop",
        explanation: "Flexible workers report 71% higher job satisfaction globally. New skills provide leverage for negotiating better work arrangements.",
        projects: [
          {
            name: "Digital Skills Mastery",
            description: "Learn high-demand digital skills that enable remote work opportunities",
            explanation: "Digital skills are increasingly valued across all industries and enable global remote work opportunities.",
            tasks: [
              {
                name: "Identify top 3 digital skills most relevant to your industry and career goals",
                summary: "Research skills",
                explanation: "Skills alignment with market demand ensures learning investment provides maximum career advancement and flexibility opportunities.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Earn professional certification or complete advanced training in chosen skill area",
                summary: "Earn certification",
                explanation: "Credentials provide verifiable evidence of capabilities and demonstrate commitment to professional development to employers.",
                timeframe: "2 months",
                completed: false
              }
            ]
          },
          {
            name: "Flexible Work Strategy",
            description: "Develop plan and skills to secure remote or hybrid work arrangements",
            explanation: "Strategic approach to flexible work increases success likelihood and provides multiple pathways to achieving work-life balance goals.",
            tasks: [
              {
                name: "Research flexible work policies and best practices in your industry",
                summary: "Research policies",
                explanation: "Understanding industry standards and successful practices provides foundation for compelling flexibility proposals and career moves.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Develop remote collaboration and communication skills for distributed teams",
                summary: "Build remote skills",
                explanation: "Remote work requires specific skills for effective collaboration. Developing these capabilities makes flexibility requests more viable.",
                timeframe: "1 month",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Move into Management Role",
        description: "Progress to leadership position through skill development and strategic positioning",
        icon: "people",
        explanation: "Management skills increase earning potential by 15-25% globally. Leadership roles provide career stability and growth opportunities.",
        projects: [
          {
            name: "Leadership Skills Development",
            description: "Build essential management and leadership capabilities",
            explanation: "Leadership skills can be developed through training, practice, and mentorship. These capabilities are transferable across industries.",
            tasks: [
              {
                name: "Complete leadership training program or management course",
                summary: "Complete training",
                explanation: "Formal leadership education provides structured development of management skills and demonstrates commitment to advancement.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Seek opportunities to lead projects or mentor colleagues in current role",
                summary: "Practice leadership",
                explanation: "Leadership experience through projects and mentoring provides practical skills and visible demonstration of management potential.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Strategic Career Positioning",
            description: "Position yourself for management opportunities through visibility and performance",
            explanation: "Strategic career positioning increases promotion likelihood and creates multiple pathways to management roles.",
            tasks: [
              {
                name: "Identify management opportunities within current organization and required qualifications",
                summary: "Research opportunities",
                explanation: "Understanding available paths and requirements enables targeted preparation and strategic career development planning.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Schedule regular career development conversations with supervisor or mentor",
                summary: "Schedule meetings",
                explanation: "Regular career discussions ensure visibility of ambitions and enable guidance and support for advancement opportunities.",
                timeframe: "1 week",
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
    icon: "wallet",
    color: "#10b981", // Green
    description: "Build financial stability, savings, and long-term wealth",
    goals: [
      {
        name: "Build 6-Month Emergency Fund",
        description: "Create financial safety net covering six months of essential living expenses",
        icon: "shield-checkmark",
        explanation: "Emergency funds reduce financial stress by 68% and provide career flexibility. Six months of expenses represents optimal balance between security and opportunity cost.",
        projects: [
          {
            name: "Calculate Emergency Fund Target",
            description: "Determine exact amount needed for six months of essential expenses",
            explanation: "Accurate calculation ensures adequate coverage while avoiding over-saving. Focus on essential expenses rather than current total spending.",
            tasks: [
              {
                name: "Track monthly essential expenses (housing, food, utilities, insurance, minimum debt payments)",
                summary: "Track expenses",
                explanation: "Essential expense tracking identifies true emergency fund needs and excludes discretionary spending that would be eliminated during emergency.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Multiply monthly essentials by 6 to set emergency fund target amount",
                summary: "Set target",
                explanation: "Six-month target provides adequate security buffer for most employment disruptions while remaining achievable saving goal.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Systematic Saving Strategy",
            description: "Implement automatic saving system to build emergency fund consistently",
            explanation: "Automatic systems eliminate decision fatigue and ensure consistent progress toward emergency fund goal regardless of monthly variations.",
            tasks: [
              {
                name: "Set up automatic transfer to high-yield savings account for emergency fund",
                summary: "Setup automatic transfer",
                explanation: "Automatic transfers ensure consistent saving progress and prevent emergency fund money from being spent on other expenses.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Review and optimize monthly expenses to increase emergency fund contributions",
                summary: "Optimize expenses",
                explanation: "Expense optimization identifies additional money for emergency fund while building good financial habits for long-term wealth building.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Start Profitable Side Hustle",
        description: "Launch additional income stream to increase financial security and opportunities",
        icon: "storefront",
        explanation: "Side hustles generate average 28% additional income globally. Multiple income streams provide financial resilience and entrepreneurial experience.",
        projects: [
          {
            name: "Side Business Research and Planning",
            description: "Identify viable side hustle opportunity based on skills and market demand",
            explanation: "Successful side hustles align personal capabilities with market needs. Research reduces risk and increases profitability potential.",
            tasks: [
              {
                name: "Inventory your skills, interests, and available time for side hustle activities",
                summary: "Inventory capabilities",
                explanation: "Personal inventory ensures side hustle leverages existing strengths and fits available time constraints for sustainable operation.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Research market demand and competition for potential side hustle ideas",
                summary: "Research market",
                explanation: "Market research validates demand and identifies competitive advantages for sustainable and profitable side business development.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Launch and Optimize Side Hustle",
            description: "Start side business and iterate based on customer feedback and results",
            explanation: "Iterative approach allows optimization based on real market feedback and customer needs rather than assumptions.",
            tasks: [
              {
                name: "Launch minimum viable version of side hustle and acquire first customers",
                summary: "Launch business",
                explanation: "Starting with minimum viable approach reduces initial investment while providing real customer feedback for business optimization.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Track performance metrics and optimize based on customer feedback and profitability",
                summary: "Optimize performance",
                explanation: "Performance tracking enables data-driven improvements and ensures side hustle remains profitable and sustainable over time.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Plan Path to Homeownership",
        description: "Develop strategic plan for purchasing property as wealth-building investment",
        icon: "home",
        explanation: "Homeownership builds 44x more wealth than renting over lifetime through equity building and property appreciation.",
        projects: [
          {
            name: "Financial Preparation for Home Purchase",
            description: "Build down payment savings and optimize credit for mortgage qualification",
            explanation: "Strong financial position enables better mortgage terms and wider property selection. Preparation reduces purchase timeline.",
            tasks: [
              {
                name: "Calculate required down payment and closing costs for target property price range",
                summary: "Calculate costs",
                explanation: "Understanding total costs enables realistic saving targets and timeline planning for home purchase achievement.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Review and improve credit score through debt payment and credit management",
                summary: "Improve credit",
                explanation: "Higher credit scores unlock better mortgage rates and terms, reducing long-term homeownership costs significantly.",
                timeframe: "6 months",
                completed: false
              }
            ]
          },
          {
            name: "Market Research and Purchase Strategy",
            description: "Research target markets and develop strategic approach to home buying",
            explanation: "Market knowledge and strategy enable better purchase decisions and negotiation outcomes in competitive real estate markets.",
            tasks: [
              {
                name: "Research target neighborhoods and property values using online tools and local market data",
                summary: "Research markets",
                explanation: "Market research identifies best value areas and timing for purchase while understanding long-term appreciation potential.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Get pre-approved for mortgage to understand budget and demonstrate serious buyer status",
                summary: "Get pre-approved",
                explanation: "Pre-approval clarifies budget and strengthens purchase offers in competitive markets while identifying potential financing issues early.",
                timeframe: "2 weeks",
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
    icon: "fitness",
    color: "#ef4444", // Red
    description: "Physical wellness, mental health, and sustainable fitness habits",
    goals: [
      {
        name: "Exercise for Mental Health",
        description: "Establish regular physical activity routine to improve mental well-being and stress management",
        icon: "heart",
        explanation: "Regular exercise reduces depression risk by 43% and anxiety by 48%. Physical activity provides immediate mood benefits and long-term mental health protection.",
        projects: [
          {
            name: "Mental Health Exercise Routine",
            description: "Develop exercise program specifically targeting mental health benefits",
            explanation: "Different exercises provide varying mental health benefits. Combining aerobic and strength training maximizes psychological benefits.",
            tasks: [
              {
                name: "Research and choose exercises proven effective for mental health (aerobic, yoga, strength training)",
                summary: "Choose exercises",
                explanation: "Evidence-based exercise selection ensures maximum mental health benefits and increases long-term adherence through variety and effectiveness.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Create weekly exercise schedule with at least 150 minutes of moderate activity",
                summary: "Create schedule",
                explanation: "Structured schedule ensures consistency and meets WHO recommendations for mental health benefits through regular physical activity.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Stress Management Integration",
            description: "Combine exercise with stress management techniques for enhanced mental health benefits",
            explanation: "Integrated approach maximizes mental health benefits by addressing both physical and psychological aspects of stress and mood.",
            tasks: [
              {
                name: "Learn mindfulness or meditation techniques to complement physical exercise",
                summary: "Learn mindfulness",
                explanation: "Mindfulness enhances exercise mental health benefits and provides additional stress management tools for daily life challenges.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Track mood and energy levels to measure mental health improvements from exercise",
                summary: "Track progress",
                explanation: "Progress tracking provides motivation and evidence of mental health benefits while enabling optimization of exercise routine.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Fitness Routine",
        description: "Establish sustainable exercise habits for long-term health and longevity",
        icon: "barbell",
        explanation: "Consistent exercise increases life expectancy by 3-7 years while improving quality of life. Even moderate activity provides substantial health benefits.",
        projects: [
          {
            name: "Sustainable Fitness Program",
            description: "Create realistic, long-term fitness routine that fits lifestyle and preferences",
            explanation: "Sustainable routines focus on consistency over intensity. Programs matching personal preferences and constraints have higher adherence rates.",
            tasks: [
              {
                name: "Assess current fitness level and identify realistic exercise goals and preferences",
                summary: "Assess fitness level",
                explanation: "Honest assessment prevents overcommitment and injury while establishing appropriate starting point for gradual fitness improvement.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Design progressive exercise program starting with achievable weekly commitments",
                summary: "Design program",
                explanation: "Progressive approach builds habit consistency while gradually increasing fitness capacity for long-term health benefits.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Habit Formation and Consistency",
            description: "Build exercise habits that become automatic and sustainable over time",
            explanation: "Habit formation requires consistent practice and environmental support. Focus on routine establishment rather than perfect performance.",
            tasks: [
              {
                name: "Schedule exercise at consistent times and prepare environment for easy adherence",
                summary: "Schedule consistently",
                explanation: "Consistent timing and prepared environment reduce decision fatigue and barriers to exercise adherence.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Track exercise consistency and celebrate adherence milestones to reinforce habit",
                summary: "Track and celebrate",
                explanation: "Progress tracking and celebration reinforces positive associations with exercise and maintains motivation through habit formation period.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Prevent Chronic Disease",
        description: "Implement lifestyle changes to reduce risk of heart disease, diabetes, and other chronic conditions",
        icon: "shield",
        explanation: "Lifestyle changes prevent 80% of chronic disease cases worldwide. Preventive measures provide enormous quality of life and financial benefits.",
        projects: [
          {
            name: "Nutrition Optimization",
            description: "Improve diet quality to reduce chronic disease risk factors",
            explanation: "Nutrition plays central role in chronic disease prevention. Focus on sustainable dietary changes rather than temporary restrictions.",
            tasks: [
              {
                name: "Learn evidence-based nutrition principles for chronic disease prevention",
                summary: "Learn nutrition",
                explanation: "Understanding nutrition science enables informed food choices and reduces susceptibility to diet myths and unsustainable approaches.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Gradually implement dietary changes focusing on whole foods and reduced processed food intake",
                summary: "Improve diet",
                explanation: "Gradual dietary changes have higher long-term adherence rates while providing substantial health benefits over time.",
                timeframe: "3 months",
                completed: false
              }
            ]
          },
          {
            name: "Preventive Health Monitoring",
            description: "Establish regular health monitoring to catch and address risk factors early",
            explanation: "Early detection and intervention prevent chronic diseases from developing or progressing to serious stages.",
            tasks: [
              {
                name: "Schedule comprehensive health checkup including key chronic disease markers",
                summary: "Schedule checkup",
                explanation: "Baseline health assessment identifies current risk factors and provides benchmark for measuring improvement from lifestyle changes.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Create system for monitoring key health metrics (weight, blood pressure, activity levels)",
                summary: "Monitor metrics",
                explanation: "Regular monitoring enables early detection of concerning trends and provides feedback on effectiveness of preventive measures.",
                timeframe: "2 weeks",
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
    icon: "people",
    color: "#8b5cf6", // Purple
    description: "Personal relationships, social connections, and community involvement",
    goals: [
      {
        name: "Find Long-Term Partner",
        description: "Build meaningful romantic relationship leading to committed long-term partnership",
        icon: "heart",
        explanation: "Committed relationships increase happiness by 34% and provide significant life satisfaction. Strong partnerships offer emotional support and shared life goals.",
        projects: [
          {
            name: "Personal Relationship Readiness",
            description: "Develop personal qualities and clarity needed for healthy long-term relationship",
            explanation: "Relationship success depends on personal readiness and clear understanding of compatibility factors and relationship goals.",
            tasks: [
              {
                name: "Reflect on relationship values, goals, and non-negotiables for long-term partnership",
                summary: "Clarify values",
                explanation: "Clear relationship values enable better partner selection and more authentic relationship building leading to compatibility.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Work on personal growth areas that improve relationship readiness and attractiveness",
                summary: "Focus on growth",
                explanation: "Personal development improves relationship satisfaction and creates stronger foundation for long-term partnership success.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Partner Discovery and Relationship Building",
            description: "Meet potential partners and build connections through various social channels",
            explanation: "Multiple meeting channels increase opportunities while authentic relationship building creates stronger partnership foundations.",
            tasks: [
              {
                name: "Engage in social activities, hobbies, or dating platforms aligned with your interests and values",
                summary: "Meet people",
                explanation: "Value-aligned activities attract compatible partners and provide natural conversation foundations for relationship building.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Practice authentic communication and vulnerability in developing relationships",
                summary: "Build connections",
                explanation: "Authentic communication creates deeper connections and enables identification of truly compatible long-term partnership potential.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Strong Social Circle",
        description: "Develop meaningful friendships and expand social network for support and enrichment",
        icon: "people-circle",
        explanation: "Strong social connections reduce mortality risk by 50%. Quality friendships provide emotional support, career opportunities, and enhanced life satisfaction.",
        projects: [
          {
            name: "Social Network Expansion",
            description: "Meet new people and develop friendships through shared interests and activities",
            explanation: "Shared activities provide natural friendship foundations and ongoing connection opportunities for relationship development.",
            tasks: [
              {
                name: "Join clubs, groups, or activities aligned with your interests and values",
                summary: "Join groups",
                explanation: "Interest-based groups provide natural friendship opportunities with compatible people while pursuing enjoyable activities.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Practice social skills and initiate conversations with potential friends regularly",
                summary: "Practice social skills",
                explanation: "Social skills development and proactive outreach accelerate friendship formation and deepen existing relationships.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Friendship Maintenance and Deepening",
            description: "Nurture existing relationships and deepen connections with current friends",
            explanation: "Friendship maintenance requires intentional effort and regular contact. Deep friendships provide greater support and satisfaction.",
            tasks: [
              {
                name: "Schedule regular contact with existing friends through calls, messages, or meetups",
                summary: "Maintain friendships",
                explanation: "Regular contact maintains friendship strength and demonstrates care while preventing relationships from weakening over time.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Organize group activities or one-on-one experiences to strengthen friendships",
                summary: "Create experiences",
                explanation: "Shared experiences deepen friendships and create positive memories that strengthen social bonds over time.",
                timeframe: "Monthly",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Strengthen Romantic Relationship",
        description: "Improve existing romantic partnership through better communication and shared goals",
        icon: "heart-circle",
        explanation: "Couples with shared goals have 76% higher relationship satisfaction. Intentional relationship building creates lasting partnership success.",
        projects: [
          {
            name: "Communication and Connection Enhancement",
            description: "Improve relationship communication patterns and emotional connection",
            explanation: "Strong communication and emotional connection form the foundation of relationship satisfaction and long-term partnership success.",
            tasks: [
              {
                name: "Schedule regular relationship check-ins to discuss feelings, concerns, and appreciation",
                summary: "Schedule check-ins",
                explanation: "Regular communication prevents issues from building up and ensures both partners feel heard and valued in the relationship.",
                timeframe: "Weekly",
                completed: false
              },
              {
                name: "Learn and practice active listening and conflict resolution skills together",
                summary: "Improve communication",
                explanation: "Communication skills training creates better understanding and reduces relationship conflict while increasing intimacy and satisfaction.",
                timeframe: "2 months",
                completed: false
              }
            ]
          },
          {
            name: "Shared Goals and Future Planning",
            description: "Align on relationship goals and create shared vision for future together",
            explanation: "Shared goals and future vision create relationship unity and provide direction for partnership growth and satisfaction.",
            tasks: [
              {
                name: "Discuss and align on short-term and long-term relationship goals and life vision",
                summary: "Align on goals",
                explanation: "Goal alignment ensures both partners work toward compatible futures and reduces relationship conflict over direction.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Plan and implement shared experiences, traditions, or projects to strengthen partnership",
                summary: "Create shared experiences",
                explanation: "Shared experiences and traditions create positive relationship memories and strengthen emotional bonds between partners.",
                timeframe: "Ongoing",
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
    icon: "library",
    color: "#f59e0b", // Amber
    description: "Skills development, education, creativity, and personal development",
    goals: [
      {
        name: "Earn Professional Certification",
        description: "Obtain industry certification to advance career and demonstrate expertise",
        icon: "school",
        explanation: "Professional certifications increase salary by 15-30% across industries globally while providing competitive advantages and advancement opportunities.",
        projects: [
          {
            name: "Certification Planning and Preparation",
            description: "Choose relevant certification and create study plan for successful completion",
            explanation: "Strategic certification choice and thorough preparation maximize career benefits and ensure successful completion of requirements.",
            tasks: [
              {
                name: "Research industry certifications most valued in your field and career goals",
                summary: "Research certifications",
                explanation: "Certification research ensures investment in credentials that provide maximum career advancement and salary benefits.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Create comprehensive study schedule and gather required learning materials",
                summary: "Plan preparation",
                explanation: "Structured preparation increases certification success rates and ensures efficient use of study time and resources.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Certification Achievement",
            description: "Complete certification requirements and leverage credential for career advancement",
            explanation: "Certification completion and strategic career application maximize return on educational investment and advancement opportunities.",
            tasks: [
              {
                name: "Complete all certification requirements including study, practice, and examination",
                summary: "Complete certification",
                explanation: "Thorough completion of all requirements ensures certification success and demonstrates commitment to professional development.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Update professional profiles and inform employer/network about new certification",
                summary: "Leverage credential",
                explanation: "Professional communication of certification achievement maximizes career benefits and advancement opportunities.",
                timeframe: "1 week",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Learn Practical Life Skill",
        description: "Acquire useful everyday skill that increases self-sufficiency and confidence",
        icon: "construct",
        explanation: "Continuous learning increases career adaptability by 67% while practical skills provide confidence, self-sufficiency, and expanded capabilities.",
        projects: [
          {
            name: "Skill Selection and Learning Plan",
            description: "Choose practical skill and develop systematic learning approach",
            explanation: "Strategic skill selection based on personal needs and interests ensures high utility and sustained motivation for skill development.",
            tasks: [
              {
                name: "Identify practical skills that would improve daily life or increase self-sufficiency",
                summary: "Identify skills",
                explanation: "Personal needs assessment ensures skill learning provides immediate benefits and practical value for daily life improvement.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Find learning resources (courses, tutorials, books) and create practice schedule",
                summary: "Plan learning",
                explanation: "Structured learning approach with quality resources accelerates skill acquisition and ensures consistent progress toward proficiency.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Skill Practice and Application",
            description: "Practice chosen skill regularly and apply in real-world situations",
            explanation: "Regular practice and real-world application solidify skill development and build confidence in practical capabilities.",
            tasks: [
              {
                name: "Practice skill regularly following structured learning plan with measurable progress",
                summary: "Practice regularly",
                explanation: "Consistent practice with progress measurement ensures skill development and maintains motivation through visible improvement.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Apply new skill in real situations to build confidence and refine capabilities",
                summary: "Apply skill",
                explanation: "Real-world application tests skill development and builds confidence while identifying areas for continued improvement.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Launch Creative Project",
        description: "Start and complete creative endeavor for personal fulfillment and expression",
        icon: "color-palette",
        explanation: "Creative activities reduce stress by 45% while improving problem-solving skills. Creative projects provide emotional outlet and personal fulfillment.",
        projects: [
          {
            name: "Creative Project Planning",
            description: "Define creative project scope and create implementation timeline",
            explanation: "Clear project definition and realistic timeline increase completion likelihood and provide structure for creative expression.",
            tasks: [
              {
                name: "Choose creative medium and define specific project with clear completion criteria",
                summary: "Define project",
                explanation: "Clear project definition with completion criteria prevents scope creep and provides satisfaction of finished creative achievement.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Create project timeline with milestones and gather necessary materials or resources",
                summary: "Plan execution",
                explanation: "Structured timeline and prepared resources ensure creative momentum and reduce barriers to project completion.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Creative Project Execution",
            description: "Work consistently on creative project through completion and sharing",
            explanation: "Consistent creative work and sharing results maximize personal satisfaction and potential for feedback and improvement.",
            tasks: [
              {
                name: "Work on project regularly following timeline with consistent creative practice",
                summary: "Execute project",
                explanation: "Regular creative work maintains momentum and develops creative skills while progressing toward project completion goals.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Complete project and share results with others for feedback and celebration",
                summary: "Complete and share",
                explanation: "Project completion and sharing provide satisfaction while enabling feedback that supports continued creative development.",
                timeframe: "2 weeks",
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
    icon: "bicycle",
    color: "#f59e0b", // Orange
    description: "Hobbies, entertainment, travel, and lifestyle enjoyment",
    goals: [
      {
        name: "Travel Around World",
        description: "Explore different cultures and destinations through meaningful travel experiences",
        icon: "airplane",
        explanation: "Travel reduces stress by 68% and provides cultural enrichment. International experiences broaden perspectives and create lasting memories while building global understanding.",
        projects: [
          {
            name: "Travel Planning and Budgeting",
            description: "Research destinations and create sustainable travel budget and plans",
            explanation: "Strategic travel planning maximizes experiences while managing costs and ensuring safe, enriching international experiences.",
            tasks: [
              {
                name: "Research 3-5 target destinations and create detailed travel budgets for each",
                summary: "Research destinations",
                explanation: "Thorough destination research ensures travel experiences match interests while budget planning makes travel financially achievable.",
                timeframe: "3 weeks",
                completed: false
              },
              {
                name: "Set up dedicated travel savings account and automatic monthly contributions",
                summary: "Start saving",
                explanation: "Dedicated travel savings with automatic contributions ensures steady progress toward travel goals without impacting other financial priorities.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Cultural Immersion Preparation",
            description: "Prepare for meaningful cultural experiences and connections during travel",
            explanation: "Cultural preparation enhances travel experiences and enables deeper connections with local communities and traditions.",
            tasks: [
              {
                name: "Learn basic language phrases and cultural customs for target destinations",
                summary: "Learn culture",
                explanation: "Cultural preparation shows respect for local communities and enables more meaningful interactions and travel experiences.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Plan immersive activities that support local communities and authentic experiences",
                summary: "Plan activities",
                explanation: "Community-focused travel activities create authentic experiences while contributing positively to destination communities.",
                timeframe: "1 month",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Develop New Hobby",
        description: "Explore and develop engaging hobby for stress relief, skill building, and enjoyment",
        icon: "game-controller",
        explanation: "Regular hobby engagement reduces burnout risk by 52% while providing stress relief, skill development, and social connections outside work.",
        projects: [
          {
            name: "Hobby Exploration and Selection",
            description: "Explore different hobby options and choose one that aligns with interests and lifestyle",
            explanation: "Hobby exploration ensures good fit between personal interests, available time, and hobby requirements for sustained engagement and satisfaction.",
            tasks: [
              {
                name: "Research potential hobbies considering interests, available time, and budget constraints",
                summary: "Research hobbies",
                explanation: "Thorough research ensures hobby choice aligns with practical constraints while providing genuine interest and engagement opportunities.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Try 2-3 different hobbies through introductory classes or beginner experiences",
                summary: "Try hobbies",
                explanation: "Direct experience provides accurate assessment of hobby fit and enjoyment rather than relying on assumptions about activities.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Hobby Development and Community",
            description: "Develop chosen hobby skills and connect with hobby community for enhanced enjoyment",
            explanation: "Skill development and community connection maximize hobby benefits including stress relief, learning, and social opportunities.",
            tasks: [
              {
                name: "Commit to regular hobby practice schedule and track skill progression",
                summary: "Practice regularly",
                explanation: "Regular practice develops hobby skills and creates consistent stress relief while building competence and confidence in chosen activity.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Join hobby communities or groups to share experiences and learn from others",
                summary: "Join community",
                explanation: "Hobby communities provide learning opportunities, social connections, and enhanced enjoyment through shared interest and mutual support.",
                timeframe: "1 month",
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
    icon: "heart",
    color: "#ec4899", // Pink
    description: "Life purpose, values, spirituality, and contribution to community",
    goals: [
      {
        name: "Volunteer Using Professional Skills",
        description: "Contribute to community causes using your professional expertise and skills",
        icon: "hand-left",
        explanation: "Volunteering increases life satisfaction by 23% while providing skills-based community impact. Professional volunteer work creates meaningful contribution opportunities.",
        projects: [
          {
            name: "Skills-Based Volunteer Opportunities",
            description: "Find volunteer roles that utilize your professional skills and expertise",
            explanation: "Skills-based volunteering maximizes community impact while providing fulfillment through meaningful application of professional capabilities.",
            tasks: [
              {
                name: "Research nonprofit organizations that need your specific professional skills",
                summary: "Research opportunities",
                explanation: "Matching professional skills with community needs creates high-impact volunteer experiences that provide meaningful contribution.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Commit to regular volunteer schedule using your professional expertise",
                summary: "Commit to volunteering",
                explanation: "Regular volunteer commitment builds lasting relationships and creates sustained community impact through professional skill application.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Community Impact Measurement",
            description: "Track and measure the impact of your volunteer contributions",
            explanation: "Measuring volunteer impact increases satisfaction and demonstrates the value of skills-based community contribution.",
            tasks: [
              {
                name: "Set measurable goals for your volunteer contribution and track progress",
                summary: "Track impact",
                explanation: "Measurable volunteer goals provide satisfaction and demonstrate concrete community benefit from professional skills application.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Share your volunteer experience to inspire others to contribute professionally",
                summary: "Share experience",
                explanation: "Sharing volunteer experiences multiplies community impact by inspiring others to contribute their professional skills to causes.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Find Purpose-Driven Work",
        description: "Align career with personal values and meaningful contribution",
        icon: "compass",
        explanation: "Purpose-driven work increases job satisfaction by 30% and reduces burnout. Aligning career with values creates long-term fulfillment.",
        projects: [
          {
            name: "Values and Purpose Clarification",
            description: "Define personal values and identify meaningful work opportunities",
            explanation: "Clear values understanding enables better career decisions and increases likelihood of finding purpose-driven work opportunities.",
            tasks: [
              {
                name: "Complete values assessment and identify top 5 personal core values",
                summary: "Clarify values",
                explanation: "Values clarity provides foundation for career decisions that align personal purpose with professional opportunities.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Research career paths and organizations that align with your values",
                summary: "Research options",
                explanation: "Research identifies specific opportunities where personal values align with organizational mission and work content.",
                timeframe: "3 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Purpose-Driven Career Transition",
            description: "Transition toward work that aligns with personal purpose and values",
            explanation: "Strategic career transition toward purpose-driven work increases long-term satisfaction and professional fulfillment.",
            tasks: [
              {
                name: "Develop transition plan to move toward purpose-aligned work opportunities",
                summary: "Plan transition",
                explanation: "Strategic transition planning ensures smooth movement toward purpose-driven work while maintaining financial security.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Build skills and network connections in purpose-driven field or organization",
                summary: "Build connections",
                explanation: "Skill development and networking create opportunities in purpose-driven fields while building credibility and relationships.",
                timeframe: "6 months",
                completed: false
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Community & Environment",
    icon: "home",
    color: "#10b981", // Green
    description: "Building community connections, improving your environment, and organizing your spaces",
    goals: [
      {
        name: "Create Organized Living Space",
        description: "Organize home environment to improve productivity, reduce stress, and enhance well-being",
        icon: "home",
        explanation: "Organized living spaces improve focus by 42% and reduce daily stress. Well-organized environments support better productivity and overall well-being.",
        projects: [
          {
            name: "Space Assessment and Organization Plan",
            description: "Evaluate current living space and create systematic organization approach",
            explanation: "Systematic organization approach ensures lasting results and addresses root causes of disorganization rather than temporary fixes.",
            tasks: [
              {
                name: "Assess each room and identify problem areas, clutter sources, and organization needs",
                summary: "Assess space",
                explanation: "Thorough assessment identifies specific organization challenges and enables targeted solutions for maximum impact.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Create room-by-room organization plan with specific systems and storage solutions",
                summary: "Plan organization",
                explanation: "Detailed planning ensures systematic approach and prevents organization efforts from being overwhelmed or incomplete.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Organization Implementation",
            description: "Execute organization plan with sustainable systems for maintaining organized space",
            explanation: "Implementation with maintenance systems ensures lasting organization results rather than temporary improvements that quickly deteriorate.",
            tasks: [
              {
                name: "Implement organization systems room by room, decluttering and creating storage solutions",
                summary: "Organize systematically",
                explanation: "Room-by-room implementation maintains momentum while creating visible progress that motivates continued organization efforts.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Establish daily and weekly maintenance routines to preserve organized environment",
                summary: "Maintain organization",
                explanation: "Maintenance routines prevent organization deterioration and ensure long-term benefits of improved living environment.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Live Sustainably/Zero-Waste",
        description: "Adopt environmentally conscious lifestyle practices to reduce environmental impact",
        icon: "leaf",
        explanation: "Sustainable living practices increase life satisfaction by 23% while contributing to environmental well-being and creating sense of purpose.",
        projects: [
          {
            name: "Sustainable Lifestyle Assessment",
            description: "Evaluate current environmental impact and identify improvement opportunities",
            explanation: "Environmental impact assessment identifies highest-impact changes and ensures sustainable living efforts focus on meaningful improvements.",
            tasks: [
              {
                name: "Assess current consumption patterns, waste generation, and environmental impact",
                summary: "Assess impact",
                explanation: "Impact assessment provides baseline for measuring improvement and identifies areas where sustainable changes provide greatest benefit.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Research sustainable alternatives for highest-impact areas of consumption and waste",
                summary: "Research alternatives",
                explanation: "Alternative research ensures sustainable choices are practical and effective while maximizing environmental benefit of lifestyle changes.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Sustainable Practice Implementation",
            description: "Gradually implement sustainable practices and habits for long-term environmental benefit",
            explanation: "Gradual implementation increases adherence to sustainable practices while building habits that create lasting environmental impact.",
            tasks: [
              {
                name: "Implement sustainable practices starting with easiest changes and building complexity",
                summary: "Implement practices",
                explanation: "Progressive implementation builds sustainable living confidence and habits while ensuring changes are maintainable long-term.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Track environmental impact improvements and share experiences to inspire others",
                summary: "Track and share",
                explanation: "Impact tracking provides motivation while sharing experiences multiplies environmental benefit through inspiring others to adopt sustainable practices.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      }
    ]
  }
];
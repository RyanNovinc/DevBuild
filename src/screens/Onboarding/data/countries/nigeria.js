// src/screens/Onboarding/data/countries/nigeria.js
// Nigerian-specific domain definitions with refined goals based on 2024-2025 research
export const DOMAIN_DEFINITIONS = [
  {
    name: "Career & Work",
    icon: "briefcase",
    color: "#3b82f6", // Blue
    description: "Professional advancement, workplace goals, career development",
    goals: [
      {
        name: "Switch to Tech Career",
        description: "Transition into high-growth technology roles with remote opportunities",
        icon: "school",
        explanation: "Nigeria leads Africa in fintech with incredible tech salary growth. Smart professionals are pivoting into development, data, and digital marketing roles that pay 4x traditional jobs and offer global remote opportunities.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "development",
            name: "Software Development & Programming",
            description: "Learn coding and app development for Nigerian and international markets",
            projects: [
              {
                name: "Programming Skills Mastery",
                description: "Master in-demand programming languages and build practical projects",
                explanation: "Tech bootcamps are producing job-ready developers in 6 months. Focus on JavaScript and Python for maximum job opportunities.",
                tasks: [
                  {
                    name: "Complete comprehensive coding bootcamp in JavaScript or Python",
                    summary: "Learn coding",
                    explanation: "Coding bootcamps provide intensive, job-ready training that gets you hired faster than traditional degree programs. JavaScript and Python dominate job postings in Lagos and Abuja.",
                    timeframe: "6 months",
                    completed: false
                  },
                  {
                    name: "Build 3 portfolio projects solving Nigerian business problems",
                    summary: "Build portfolio",
                    explanation: "Portfolio projects demonstrate your ability to solve real problems with code. Nigerian-focused projects show employers you understand local market needs and user challenges.",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Tech Job Market Entry",
                description: "Position yourself for junior developer roles in Nigerian tech companies",
                explanation: "Nigerian fintech companies pay ₦300K-500K monthly for junior developers. Remote international roles can pay even more in USD.",
                tasks: [
                  {
                    name: "Get cloud certification (AWS/Google)",
                    summary: "Get certified",
                    explanation: "Cloud certifications demonstrate advanced technical skills that Nigerian companies desperately need. These credentials often lead to immediate job offers with premium salaries.",
                    timeframe: "2 months",
                    completed: false
                  },
                  {
                    name: "Apply to Lagos fintech startups and international remote positions",
                    summary: "Apply jobs",
                    explanation: "Lagos has the highest concentration of tech jobs in Africa, while remote positions offer USD salaries that protect against naira volatility and inflation.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "digital-marketing",
            name: "Digital Marketing & E-commerce",
            description: "Master online marketing and e-commerce for growing digital economy",
            projects: [
              {
                name: "Digital Marketing Expertise",
                description: "Master Google Ads, social media marketing, and e-commerce platforms",
                explanation: "Nigerian businesses need digital marketing experts who understand local consumer behavior and payment systems like Paystack and Flutterwave.",
                tasks: [
                  {
                    name: "Complete Google Ads and Facebook Marketing certifications",
                    summary: "Get marketing certs",
                    explanation: "Digital marketing certifications prove your expertise to Nigerian businesses investing heavily in online advertising. These skills are in high demand with excellent earning potential.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Launch e-commerce or social media campaign",
                    summary: "Run campaigns",
                    explanation: "Hands-on campaign experience demonstrates real results that Nigerian businesses can see and measure. Success stories become powerful portfolio pieces for landing higher-paying roles.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "E-commerce Business Setup",
                description: "Start profitable online business leveraging Nigerian market opportunities",
                explanation: "E-commerce is exploding in Nigeria with improved payment systems and logistics. Smart marketers are building profitable businesses selling digital products and services.",
                tasks: [
                  {
                    name: "Set up e-commerce store with digital products",
                    summary: "Launch store",
                    explanation: "Digital products have no inventory costs and can be sold 24/7 to customers across Nigeria and beyond. This creates scalable income streams that grow while you sleep.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Scale to ₦200,000+ monthly revenue through marketing optimization",
                    summary: "Scale revenue",
                    explanation: "Reaching ₦200K monthly proves your business model works and creates substantial side income. This milestone often leads to full-time entrepreneurship or premium marketing roles.",
                    timeframe: "4 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "data-analysis",
            name: "Data Analysis & Business Intelligence",
            description: "Learn data skills for banking, fintech, and consulting roles",
            projects: [
              {
                name: "Data Analysis Certification",
                description: "Master Excel, SQL, and data visualization tools for business insights",
                explanation: "Banks and fintech companies need data analysts to make sense of customer behavior and business performance. These roles pay well and offer clear career progression.",
                tasks: [
                  {
                    name: "Get Google Data Analytics Certificate",
                    summary: "Data certification",
                    explanation: "Google's data certification is recognized by major Nigerian employers and teaches practical skills using real business datasets. The certification often leads to immediate job opportunities.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Build data dashboard analyzing Nigerian business or economic trends",
                    summary: "Build dashboard",
                    explanation: "Data dashboards showcase your ability to turn raw information into business insights. Nigerian-focused analysis demonstrates local market understanding that employers value highly.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Business Intelligence Career",
                description: "Apply data skills in consulting, banking, or fintech roles",
                explanation: "Data analysts earn �N250K-400K monthly in Nigerian financial services. The skills are transferable globally for international remote opportunities.",
                tasks: [
                  {
                    name: "Apply to Nigerian banks, fintech data roles",
                    summary: "Apply data jobs",
                    explanation: "Nigerian financial services companies are investing heavily in data-driven decision making. Your timing is perfect as demand for skilled analysts far exceeds supply.",
                    timeframe: "2 months",
                    completed: false
                  },
                  {
                    name: "Build consulting practice offering data analysis services to SMEs",
                    summary: "Start consulting",
                    explanation: "Small and medium businesses need data insights but can't afford full-time analysts. Consulting allows you to serve multiple clients while building valuable industry experience.",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              }
            ]
          }
        ],
        projects: [
          {
            name: "Tech Skill Development",
            description: "Build technical skills through structured learning program",
            explanation: "Nigerian tech scene is booming with fintech leading Africa. Getting the right skills now positions you for incredible career growth.",
            tasks: [
              {
                name: "Choose specialization and complete certification program",
                summary: "Get certified",
                explanation: "Specialization helps you stand out in Nigeria's competitive job market while building expertise employers will pay premium rates for.",
                timeframe: "4 months",
                completed: false
              },
              {
                name: "Build portfolio showcasing Nigerian market understanding",
                summary: "Build portfolio",
                explanation: "Projects that solve Nigerian business problems demonstrate market knowledge and practical skills that local employers value over generic international examples.",
                timeframe: "2 months",
                completed: false
              }
            ]
          },
          {
            name: "Tech Career Transition",
            description: "Network and apply for technology positions strategically",
            explanation: "Tech networking in Lagos is tight-knit and supportive. Building relationships often leads to job opportunities before they're publicly posted.",
            tasks: [
              {
                name: "Join Lagos tech communities and attend networking events",
                summary: "Join community",
                explanation: "Lagos tech community is incredibly welcoming to newcomers who show genuine interest in learning. Many job opportunities come through community connections rather than job boards.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Apply to fintech startups and remote roles",
                summary: "Apply strategically",
                explanation: "Nigerian fintech companies offer excellent career growth while international remote roles provide currency diversification and global experience.",
                timeframe: "3 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Start Profitable Side Business",
        description: "Launch business leveraging Nigeria's entrepreneurial opportunities and digital growth",
        icon: "storefront",
        explanation: "Your entrepreneurial spirit gives you a huge advantage! Nigeria has incredible business opportunities in fintech, e-commerce, and services. Smart professionals are building businesses that provide financial security and independence.",
        projects: [
          {
            name: "Business Opportunity Research",
            description: "Identify and validate profitable business opportunities in Nigerian market",
            explanation: "Nigeria's growing middle class creates opportunities in fintech, food, education, and digital services. Proper research prevents expensive mistakes.",
            tasks: [
              {
                name: "Research Nigerian business opportunities and choose validated concept",
                summary: "Research opportunity",
                explanation: "Nigerian market research reveals gaps in financial services, food delivery, education, and digital tools that startups can profitably address with relatively low startup costs.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Validate business concept with 50+ potential customers",
                summary: "Validate concept",
                explanation: "Customer validation ensures you're solving real problems people will pay for. This step prevents wasting time and money on products nobody wants.",
                timeframe: "2 months",
                completed: false
              }
            ]
          },
          {
            name: "Business Launch and Growth",
            description: "Execute business launch and scale to profitability",
            explanation: "Nigerian Startup Act provides grants and support for new businesses. Focus on digital-first models that can scale quickly.",
            tasks: [
              {
                name: "Launch minimum viable product and acquire first 100 customers",
                summary: "Launch MVP",
                explanation: "Starting small with MVP approach reduces risk while proving your business model works. First 100 customers provide valuable feedback for improvement and growth.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Scale to ₦300,000+ monthly revenue through strategic marketing",
                summary: "Scale revenue",
                explanation: "₦300K monthly revenue proves business viability and creates substantial additional income. This milestone attracts investors and creates optionality for full-time entrepreneurship.",
                timeframe: "6 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Advance to Management Role",
        description: "Progress into leadership position within current company or new organization",
        icon: "people",
        explanation: "Leadership opportunities are growing in Nigeria as companies expand and professionalize. Your experience positions you perfectly for management roles that offer better compensation and career security.",
        projects: [
          {
            name: "Leadership Skills Development",
            description: "Build management capabilities and demonstrate leadership potential",
            explanation: "Nigerian companies value leaders who understand local business culture while bringing modern management practices.",
            tasks: [
              {
                name: "Complete leadership training program or MBA module",
                summary: "Leadership training",
                explanation: "Formal leadership training demonstrates commitment to management career path while providing frameworks for effective team leadership in Nigerian business environment.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Lead cross-functional project to demonstrate management capabilities",
                summary: "Lead project",
                explanation: "Project leadership provides visible proof of management potential while building internal relationships that support promotion discussions with senior leadership.",
                timeframe: "4 months",
                completed: false
              }
            ]
          },
          {
            name: "Management Position Strategy",
            description: "Position yourself for promotion or management role in new company",
            explanation: "Management roles in Nigeria offer significant salary increases and job security. Clear strategy maximizes promotion likelihood.",
            tasks: [
              {
                name: "Discuss promotion path with manager",
                summary: "Career discussion",
                explanation: "Proactive career conversations signal management ambition while enabling your manager to provide specific guidance and support for advancement opportunities.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Apply for management roles in Nigeria",
                summary: "Apply management",
                explanation: "External management applications provide leverage for internal promotion while creating backup options if promotion timeline doesn't meet expectations.",
                timeframe: "3 months",
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
    icon: "cash",
    color: "#10b981", // Green
    description: "Building wealth, managing expenses, and achieving financial goals",
    goals: [
      {
        name: "Build Emergency Fund",
        description: "Save 6 months expenses in high-yield naira and dollar accounts",
        icon: "shield",
        explanation: "Economic uncertainty makes emergency funds essential for Nigerian professionals. Smart savers are using dollar accounts and investment platforms to protect against inflation while maintaining liquidity for emergencies.",
        projects: [
          {
            name: "Emergency Fund Strategy",
            description: "Calculate target amount and set up systematic saving approach",
            explanation: "Nigerian professionals need both naira and dollar emergency funds for comprehensive protection against economic volatility.",
            tasks: [
              {
                name: "Calculate 6 months expenses and open high-yield savings accounts",
                summary: "Calculate fund",
                explanation: "Emergency fund calculation provides clear savings target while high-yield accounts maximize growth. Consider both local and dollar accounts for currency diversification.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Set up automatic transfers to reach emergency fund target",
                summary: "Automate savings",
                explanation: "Automatic savings ensure consistent progress toward emergency fund goal while removing temptation to spend money on non-essential items during economically challenging periods.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Expense Management",
            description: "Optimize spending to maximize emergency fund contributions",
            explanation: "Strategic expense management helps Nigerian professionals save more despite inflation and economic pressures.",
            tasks: [
              {
                name: "Track expenses for one month and identify areas for cost reduction",
                summary: "Track expenses",
                explanation: "Expense tracking reveals spending patterns and opportunities for savings that can be redirected to emergency fund building and investment opportunities.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Negotiate better rates for recurring expenses",
                summary: "Reduce expenses",
                explanation: "Negotiating better rates on fixed expenses creates permanent monthly savings that compound over time, accelerating emergency fund growth and investment capacity.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Start Investment Portfolio",
        description: "Build diversified investment strategy using Nigerian and international options",
        icon: "trending-up",
        explanation: "Inflation protection requires smart investing beyond traditional savings. Nigerian professionals are using local stocks, dollar investments, and fintech platforms to build wealth and hedge against naira volatility.",
        projects: [
          {
            name: "Investment Foundation",
            description: "Learn investment basics and choose appropriate platforms",
            explanation: "Nigerian investment landscape offers multiple options from NSE stocks to international investments through local fintech platforms.",
            tasks: [
              {
                name: "Complete investment education course and choose investment platform",
                summary: "Learn investing",
                explanation: "Investment education provides foundation for making informed decisions while platform selection determines access to local and international investment opportunities.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Start with ₦50,000 investment in diversified portfolio",
                summary: "Start investing",
                explanation: "Starting with modest amount reduces risk while building investment experience. Diversification across Nigerian stocks and international options provides balanced growth potential.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Portfolio Growth Strategy",
            description: "Systematically build investment portfolio through regular contributions",
            explanation: "Consistent investment contributions leverage dollar-cost averaging to build long-term wealth despite market volatility.",
            tasks: [
              {
                name: "Set up automatic monthly investment contributions of ₦25,000+",
                summary: "Automate investing",
                explanation: "Automatic investment contributions ensure consistent portfolio growth while taking advantage of market fluctuations through dollar-cost averaging strategies.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Review and rebalance portfolio quarterly based on performance",
                summary: "Manage portfolio",
                explanation: "Regular portfolio review ensures investments remain aligned with goals while rebalancing maintains appropriate risk levels for Nigerian economic conditions.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Increase Income Streams",
        description: "Develop multiple income sources to accelerate wealth building",
        icon: "wallet",
        explanation: "Multiple income streams provide security and acceleration toward financial goals. Nigerian professionals are successfully combining employment, freelancing, and business income to reach ₦500K+ monthly.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "freelancing",
            name: "Professional Freelancing",
            description: "Monetize your skills through freelance consulting and services",
            projects: [
              {
                name: "Freelance Business Setup",
                description: "Establish profitable freelancing practice using professional expertise",
                explanation: "Nigerian professionals can earn ₦100K-300K monthly through freelancing while maintaining full-time employment.",
                tasks: [
                  {
                    name: "Create professional profiles on Upwork, Fiverr, and local platforms",
                    summary: "Setup profiles",
                    explanation: "Professional freelancing profiles with strong portfolios attract high-paying international and local clients seeking Nigerian expertise and competitive rates.",
                    timeframe: "2 weeks",
                    completed: false
                  },
                  {
                    name: "Secure first 5 freelance clients and establish service pricing",
                    summary: "Get clients",
                    explanation: "Initial freelance clients provide experience, testimonials, and revenue that create foundation for scaling freelancing income to substantial monthly amounts.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Freelancing Income Scale",
                description: "Scale freelancing to consistent ₦200,000+ monthly income",
                explanation: "Successful Nigerian freelancers earn substantial monthly income through premium pricing and efficient service delivery systems.",
                tasks: [
                  {
                    name: "Develop premium service packages for higher-value clients",
                    summary: "Premium packages",
                    explanation: "Premium service packages command higher rates while attracting clients who value quality and expertise over lowest-cost providers.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Build systems for consistent ₦200K+ monthly freelancing income",
                    summary: "Scale systems",
                    explanation: "Systematic approach to freelancing enables predictable income growth while maintaining quality standards that keep clients returning for additional projects.",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "digital-business",
            name: "Digital Business Creation",
            description: "Build online business selling products or services",
            projects: [
              {
                name: "Digital Product Development",
                description: "Create and launch digital products targeting Nigerian market",
                explanation: "Digital products offer scalable income potential with minimal ongoing costs once created and marketed effectively.",
                tasks: [
                  {
                    name: "Create profitable digital product MVP",
                    summary: "Create product",
                    explanation: "Digital products like courses, templates, and tools can be created once and sold repeatedly to Nigerian professionals seeking solutions to common problems.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Launch product and achieve ₦100,000+ monthly revenue",
                    summary: "Launch product",
                    explanation: "Successful digital product launch provides passive income stream while demonstrating entrepreneurial capabilities that enhance career prospects.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Digital Business Scaling",
                description: "Scale digital business through marketing optimization and product expansion",
                explanation: "Digital business scaling leverages Nigerian market growth and digital adoption to build substantial income streams.",
                tasks: [
                  {
                    name: "Optimize marketing to reach ₦300,000+ monthly revenue",
                    summary: "Scale marketing",
                    explanation: "Marketing optimization increases customer acquisition while improving conversion rates, enabling rapid business growth and higher monthly revenue targets.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Expand product line and explore wholesale or partnership opportunities",
                    summary: "Expand business",
                    explanation: "Business expansion through additional products and strategic partnerships creates multiple revenue streams while building market presence and customer base.",
                    timeframe: "6 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "investment-income",
            name: "Investment Income Development",
            description: "Build investment income through stocks, bonds, and alternative investments",
            projects: [
              {
                name: "Investment Income Strategy",
                description: "Build portfolio generating consistent monthly investment income",
                explanation: "Dividend-paying stocks and bonds provide monthly income while building long-term wealth through capital appreciation.",
                tasks: [
                  {
                    name: "Build dividend-focused investment portfolio targeting ₦50,000+ monthly income",
                    summary: "Dividend portfolio",
                    explanation: "Dividend-focused investing provides regular income while maintaining capital growth potential through well-managed Nigerian and international stocks.",
                    timeframe: "6 months",
                    completed: false
                  },
                  {
                    name: "Explore real estate investment trusts and bond opportunities",
                    summary: "Diversify income",
                    explanation: "REITs and bonds provide additional income streams with different risk profiles while diversifying investment portfolio beyond individual stocks.",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Alternative Investment Exploration",
                description: "Investigate alternative investments including crypto and peer-to-peer lending",
                explanation: "Alternative investments provide additional diversification while potentially offering higher returns than traditional investment options.",
                tasks: [
                  {
                    name: "Research cryptocurrency and DeFi opportunities for Nigerian investors",
                    summary: "Crypto research",
                    explanation: "Cryptocurrency investments offer potential for significant returns while providing hedge against naira volatility, though requiring careful risk management.",
                    timeframe: "2 months",
                    completed: false
                  },
                  {
                    name: "Explore peer-to-peer lending and crowdfunding investment platforms",
                    summary: "P2P investing",
                    explanation: "Peer-to-peer lending platforms enable direct lending to individuals and businesses, providing higher interest rates than traditional savings accounts.",
                    timeframe: "1 month",
                    completed: false
                  }
                ]
              }
            ]
          }
        ],
        projects: [
          {
            name: "Income Stream Planning",
            description: "Identify and plan development of additional income sources",
            explanation: "Strategic income planning ensures new streams complement rather than compete with primary employment.",
            tasks: [
              {
                name: "Assess current skills and identify monetization opportunities",
                summary: "Identify opportunities",
                explanation: "Skills assessment reveals natural income stream opportunities while ensuring new ventures leverage existing expertise for faster success.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Create timeline for developing chosen income stream",
                summary: "Plan timeline",
                explanation: "Structured timeline ensures income stream development receives adequate attention while maintaining primary employment performance and relationships.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Income Stream Execution",
            description: "Execute plan to develop and scale additional income source",
            explanation: "Consistent execution transforms income stream plans into financial reality that accelerates wealth building goals.",
            tasks: [
              {
                name: "Launch chosen income stream and track monthly revenue growth",
                summary: "Launch stream",
                explanation: "Revenue tracking provides feedback on income stream performance while enabling optimization for faster growth and higher monthly earnings.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Scale income stream to target monthly amount",
                summary: "Scale income",
                explanation: "Systematic scaling leverages successful income stream foundation to reach ambitious monthly targets while maintaining sustainable growth rates.",
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
    name: "Health & Wellness",
    icon: "fitness",
    color: "#06b6d4", // Cyan
    description: "Physical fitness, mental health, nutrition, and overall wellbeing",
    goals: [
      {
        name: "Build Fitness Routine",
        description: "Establish sustainable exercise habits that fit Nigerian lifestyle and climate",
        icon: "barbell",
        explanation: "Regular fitness becomes even more important during stressful economic times. Smart professionals are finding creative ways to stay fit despite busy schedules and challenging infrastructure.",
        projects: [
          {
            name: "Exercise Habit Foundation",
            description: "Create sustainable workout routine that works within Nigerian constraints",
            explanation: "Successful fitness in Nigeria requires adaptability to power outages, traffic, and weather while maintaining consistency.",
            tasks: [
              {
                name: "Choose 3 physical activities you can do consistently despite infrastructure challenges",
                summary: "Choose activities",
                explanation: "Selecting activities that work during power outages, traffic delays, and weather challenges ensures consistent fitness routine regardless of external circumstances.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Schedule 30-minute exercise sessions 3 times per week around work and commute",
                summary: "Schedule exercise",
                explanation: "Strategic exercise scheduling around Lagos traffic and work demands ensures fitness remains priority while accommodating professional responsibilities and travel constraints.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Fitness Community Building",
            description: "Connect with fitness communities for motivation and accountability",
            explanation: "Nigerian fitness communities provide support, safety, and motivation while making exercise more enjoyable and sustainable.",
            tasks: [
              {
                name: "Join local gym or fitness group for social support and equipment access",
                summary: "Join fitness group",
                explanation: "Fitness communities provide accountability, safety in numbers, and access to equipment while making exercise more enjoyable through social connections.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Track progress and celebrate fitness milestones with community support",
                summary: "Track progress",
                explanation: "Progress tracking and community celebration maintains motivation while providing visible evidence of fitness improvements and health benefits over time.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Improve Mental Health",
        description: "Develop stress management and mental wellness strategies for economic uncertainty",
        icon: "people",
        explanation: "Economic pressures and uncertainty make mental health critical for Nigerian professionals. Developing resilience strategies helps maintain performance and relationships during challenging times.",
        projects: [
          {
            name: "Stress Management System",
            description: "Create comprehensive approach to managing work and economic stress",
            explanation: "Effective stress management becomes essential during economic uncertainty while maintaining professional performance and personal relationships.",
            tasks: [
              {
                name: "Learn stress management techniques like meditation, deep breathing, or prayer",
                summary: "Learn stress management",
                explanation: "Stress management techniques provide immediate relief during challenging situations while building long-term resilience for professional and personal success.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Establish daily 15-minute mental health routine for consistency",
                summary: "Daily routine",
                explanation: "Consistent mental health routine provides stability and emotional regulation during uncertain times while maintaining productivity and positive relationships.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Mental Wellness Support",
            description: "Build support network and professional help when needed",
            explanation: "Strong support networks become invaluable during economic stress while professional mental health support addresses serious concerns.",
            tasks: [
              {
                name: "Connect with friends, family, or counselors for regular emotional support",
                summary: "Build support",
                explanation: "Regular emotional support prevents isolation and provides perspective during challenging times while maintaining mental health essential for career success.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Monitor mental health and seek professional help when stress becomes overwhelming",
                summary: "Monitor health",
                explanation: "Mental health monitoring enables early intervention while professional support addresses serious concerns before they impact career performance and relationships.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Optimize Nutrition",
        description: "Improve diet quality while managing food costs during inflation",
        icon: "nutrition",
        explanation: "Good nutrition supports energy and mental clarity needed for career success. Smart professionals are finding ways to eat well despite rising food costs and busy schedules.",
        projects: [
          {
            name: "Nutrition Strategy",
            description: "Develop cost-effective nutrition plan using local Nigerian foods",
            explanation: "Nigerian local foods provide excellent nutrition at lower costs while supporting energy levels needed for demanding professional schedules.",
            tasks: [
              {
                name: "Plan healthy meals using affordable local ingredients like beans, vegetables, and whole grains",
                summary: "Plan nutrition",
                explanation: "Local Nigerian ingredients provide excellent nutrition at fraction of imported food costs while supporting traditional food systems and local economy.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Meal prep 3 days per week to maintain nutrition despite busy schedule",
                summary: "Meal prep",
                explanation: "Meal preparation ensures consistent good nutrition despite unpredictable work schedules while reducing food costs and improving dietary quality over time.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Healthy Eating Habits",
            description: "Build sustainable eating habits that support professional performance",
            explanation: "Consistent healthy eating provides stable energy and mental clarity essential for professional success and career advancement.",
            tasks: [
              {
                name: "Reduce processed foods and increase local fruits and vegetables",
                summary: "Improve diet",
                explanation: "Whole foods provide better nutrition and sustained energy while reducing health risks associated with processed food consumption during stressful periods.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Stay hydrated and maintain regular eating schedule despite work pressures",
                summary: "Maintain schedule",
                explanation: "Regular eating and hydration schedules maintain blood sugar stability and cognitive function essential for professional performance and decision making.",
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
    name: "Relationships",
    icon: "people",
    color: "#ec4899", // Pink
    description: "Building and maintaining meaningful personal connections",
    goals: [
      {
        name: "Find Long-Term Partner",
        description: "Develop meaningful romantic relationship with marriage potential",
        icon: "people",
        explanation: "Strong relationships provide emotional support during challenging times. Many Nigerian professionals are prioritizing meaningful partnerships that offer both love and mutual support for life goals.",
        projects: [
          {
            name: "Intentional Dating Approach",
            description: "Create purposeful strategy for finding compatible long-term partner",
            explanation: "Intentional dating focuses on compatibility and shared values while building foundation for marriage and family planning.",
            tasks: [
              {
                name: "Define relationship values and desired partner qualities for marriage compatibility",
                summary: "Define values",
                explanation: "Clear relationship values enable better partner selection while ensuring compatibility on important issues like career, family, and life goals.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Meet potential partners through church, professional networks, or trusted introductions",
                summary: "Meet partners",
                explanation: "Traditional meeting methods through trusted networks provide better screening and compatibility than random dating while building relationships with shared contexts.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Relationship Building",
            description: "Develop genuine connections through authentic communication and shared experiences",
            explanation: "Strong relationships require time investment and genuine communication while building trust and emotional intimacy over time.",
            tasks: [
              {
                name: "Practice authentic communication and vulnerability in dating relationships",
                summary: "Authentic dating",
                explanation: "Authentic communication builds genuine connections while revealing compatibility for long-term partnership and marriage potential.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Invest time in shared activities and experiences that build deeper connection",
                summary: "Share experiences",
                explanation: "Shared experiences create emotional bonds and memories while revealing character and compatibility in various situations and circumstances.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Strong Social Circle",
        description: "Create supportive friend network that provides community and professional connections",
        icon: "people",
        explanation: "Strong friendships provide emotional support and often lead to career opportunities. Nigerian professionals benefit greatly from diverse social networks that combine personal and professional relationships.",
        projects: [
          {
            name: "Social Network Development",
            description: "Actively build and maintain meaningful friendships and professional relationships",
            explanation: "Social networks provide emotional support during challenging times while creating professional opportunities through referrals and connections.",
            tasks: [
              {
                name: "Join professional associations, alumni groups, or hobby communities",
                summary: "Join communities",
                explanation: "Professional and hobby communities provide natural friendship opportunities while building networks that support both personal enjoyment and career advancement.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Organize regular social activities to strengthen existing friendships",
                summary: "Organize socials",
                explanation: "Regular social activities maintain strong friendships while providing emotional support and relaxation needed during stressful professional periods.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Community Connection",
            description: "Build diverse social connections through community involvement and shared interests",
            explanation: "Community connections provide broader social support while creating opportunities for personal growth and civic engagement.",
            tasks: [
              {
                name: "Participate in community service or volunteer activities",
                summary: "Community service",
                explanation: "Community service provides meaningful social connections while contributing to society and developing leadership skills valuable for career advancement.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Deepen friendships through quality time and mutual support during challenges",
                summary: "Deepen friendships",
                explanation: "Deep friendships provide emotional resilience during difficult times while creating lasting relationships that enrich personal life and provide career support.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Strengthen Family Bonds",
        description: "Improve relationships with parents, siblings, and extended family",
        icon: "home",
        explanation: "Family relationships remain central to Nigerian culture and provide crucial support during challenging times. Strong families offer both emotional support and practical help for career and life goals.",
        projects: [
          {
            name: "Family Relationship Investment",
            description: "Actively invest time and energy in strengthening family relationships",
            explanation: "Strong family bonds provide emotional foundation and practical support while honoring cultural values important in Nigerian society.",
            tasks: [
              {
                name: "Schedule regular quality time with parents and siblings despite busy work schedule",
                summary: "Family time",
                explanation: "Regular family time maintains strong relationships while providing emotional support and cultural grounding essential during career building and life transitions.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Find ways to support family members through career success and financial stability",
                summary: "Support family",
                explanation: "Supporting family members demonstrates gratitude while building family pride and creating positive cycle of mutual support that benefits everyone.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Extended Family Connection",
            description: "Maintain connections with extended family and participate in family traditions",
            explanation: "Extended family connections provide broader support network while maintaining cultural identity and traditional values.",
            tasks: [
              {
                name: "Attend family gatherings and maintain connections with cousins and relatives",
                summary: "Family gatherings",
                explanation: "Family gatherings maintain cultural connections while providing opportunities for mutual support and assistance during both celebrations and challenges.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Participate in family traditions and celebrate important milestones together",
                summary: "Family traditions",
                explanation: "Family traditions maintain cultural identity while creating positive memories and strengthening bonds that provide lifelong emotional support and belonging.",
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
    icon: "school",
    color: "#8b5cf6", // Purple
    description: "Learning, self-improvement, and developing new capabilities",
    goals: [
      {
        name: "Learn High-Value Skill",
        description: "Master concrete capability that enhances career prospects and personal development",
        icon: "school",
        explanation: "Continuous learning gives you competitive advantage in Nigeria's evolving economy. Smart professionals are acquiring skills that make them indispensable while opening new career opportunities.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "language",
            name: "Language Skills (English fluency, French, Chinese)",
            description: "Improve communication skills for international business opportunities",
            projects: [
              {
                name: "English Fluency Enhancement",
                description: "Master professional English communication for international business",
                explanation: "Excellent English opens international business opportunities while improving local professional communication and presentation skills.",
                tasks: [
                  {
                    name: "Complete advanced English communication course focusing on business applications",
                    summary: "English course",
                    explanation: "Advanced English skills enable communication with international clients and partners while improving local professional presentation and writing capabilities.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Practice English through international business networking and presentations",
                    summary: "Practice English",
                    explanation: "Regular English practice in business contexts builds confidence while creating international professional connections that lead to career opportunities.",
                    timeframe: "Ongoing",
                    completed: false
                  }
                ]
              },
              {
                name: "Additional Language Learning",
                description: "Learn French or Chinese to access new business markets and opportunities",
                explanation: "Additional languages open access to Francophone Africa markets or Chinese business partnerships increasingly important in African economies.",
                tasks: [
                  {
                    name: "Complete foundational course in French or Chinese with business focus",
                    summary: "Language course",
                    explanation: "Business-focused language learning provides practical skills for international trade and partnership opportunities while differentiating you from other professionals.",
                    timeframe: "6 months",
                    completed: false
                  },
                  {
                    name: "Apply language skills through international business communications or partnerships",
                    summary: "Apply language",
                    explanation: "Practical language application builds fluency while creating business opportunities that leverage Nigeria's position in African and global markets.",
                    timeframe: "Ongoing",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "financial-skills",
            name: "Financial Analysis & Investment Skills",
            description: "Master financial analysis for better personal and business decisions",
            projects: [
              {
                name: "Financial Analysis Mastery",
                description: "Learn financial analysis skills for personal wealth building and career advancement",
                explanation: "Financial analysis skills improve personal investment decisions while creating career opportunities in banking and consulting.",
                tasks: [
                  {
                    name: "Complete financial analysis course covering Nigerian and international markets",
                    summary: "Financial course",
                    explanation: "Financial analysis education provides skills for personal wealth management while opening career opportunities in Nigeria's growing financial services sector.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Apply skills to analyze Nigerian stocks and investment opportunities",
                    summary: "Analyze investments",
                    explanation: "Practical financial analysis application improves personal investment returns while building expertise that employers value in financial services careers.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Investment Strategy Development",
                description: "Create systematic approach to building wealth through informed investment decisions",
                explanation: "Investment strategy development provides framework for long-term wealth building while potentially creating consulting opportunities.",
                tasks: [
                  {
                    name: "Develop personal investment strategy balancing Nigerian and international opportunities",
                    summary: "Investment strategy",
                    explanation: "Personal investment strategy provides roadmap for wealth building while demonstrating financial expertise that creates consulting and career opportunities.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Share investment knowledge through blogging or financial education community involvement",
                    summary: "Share knowledge",
                    explanation: "Sharing financial knowledge builds reputation as expert while creating potential income streams through financial education and consulting services.",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "leadership-skills",
            name: "Leadership & Management Skills",
            description: "Develop leadership capabilities for management roles and entrepreneurship",
            projects: [
              {
                name: "Leadership Skills Foundation",
                description: "Master fundamental leadership skills through training and practical application",
                explanation: "Leadership skills enable management career advancement while improving entrepreneurial success and community impact.",
                tasks: [
                  {
                    name: "Complete leadership training program focusing on Nigerian business culture",
                    summary: "Leadership training",
                    explanation: "Leadership training adapted to Nigerian business culture provides practical skills for managing local teams while respecting cultural values and expectations.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Apply leadership skills through team projects, volunteer leadership, or business management",
                    summary: "Apply leadership",
                    explanation: "Leadership application builds experience while demonstrating capabilities that lead to management promotions and entrepreneurial success opportunities.",
                    timeframe: "6 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Advanced Management Capabilities",
                description: "Develop advanced management skills for senior leadership roles",
                explanation: "Advanced management skills position you for executive roles while improving business and team performance across various contexts.",
                tasks: [
                  {
                    name: "Study successful Nigerian business leaders and their management approaches",
                    summary: "Study leaders",
                    explanation: "Learning from successful Nigerian leaders provides culturally appropriate management models while building understanding of local business dynamics.",
                    timeframe: "2 months",
                    completed: false
                  },
                  {
                    name: "Mentor junior professionals while building management experience and reputation",
                    summary: "Mentor others",
                    explanation: "Mentoring builds management experience while creating positive reputation that leads to leadership opportunities and professional referrals.",
                    timeframe: "Ongoing",
                    completed: false
                  }
                ]
              }
            ]
          }
        ],
        projects: [
          {
            name: "Skill Development Program",
            description: "Create structured learning approach for acquiring chosen high-value skill",
            explanation: "Structured learning ensures consistent progress while providing accountability for skill development goals and professional advancement.",
            tasks: [
              {
                name: "Research learning resources and create skill development timeline",
                summary: "Plan learning",
                explanation: "Learning research ensures quality education while timeline creates accountability for consistent progress toward skill mastery and career application.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Practice chosen skill weekly and track progress toward professional application",
                summary: "Practice skill",
                explanation: "Regular skill practice builds competency while progress tracking provides motivation and evidence of development for career advancement discussions.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Skill Application Strategy",
            description: "Apply learned skill in professional context to create career and income opportunities",
            explanation: "Skill application transforms learning into practical career benefits while creating opportunities for increased income and professional recognition.",
            tasks: [
              {
                name: "Apply new skill in current job or business to demonstrate value",
                summary: "Apply professionally",
                explanation: "Professional skill application provides immediate career benefits while demonstrating value to employers and creating foundation for promotion discussions.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Market skill through freelancing, consulting, or teaching opportunities",
                summary: "Market skill",
                explanation: "Skill marketing creates additional income streams while building reputation as expert that leads to better career opportunities and professional recognition.",
                timeframe: "6 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Read for Personal Development",
        description: "Establish consistent reading habit focusing on professional and personal growth",
        icon: "library",
        explanation: "Reading provides knowledge and perspective essential for professional growth. Successful Nigerian professionals invest in continuous learning through books while building mental clarity and decision-making skills.",
        projects: [
          {
            name: "Reading Habit Foundation",
            description: "Create sustainable reading routine despite busy professional schedule",
            explanation: "Consistent reading habit provides ongoing education and mental stimulation while building knowledge foundation for career advancement.",
            tasks: [
              {
                name: "Set reading goal of 2 books monthly and create consistent reading schedule",
                summary: "Reading goal",
                explanation: "Regular reading schedule ensures consistent personal development while building knowledge base essential for professional growth and informed decision making.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Choose mix of business, self-improvement, and professional development books",
                summary: "Choose books",
                explanation: "Balanced book selection provides comprehensive personal development while building specific professional knowledge and general wisdom for life success.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Knowledge Application",
            description: "Apply reading insights to professional and personal improvement",
            explanation: "Knowledge application transforms reading into practical benefits while creating measurable improvement in professional performance and personal effectiveness.",
            tasks: [
              {
                name: "Keep reading journal to track insights and apply lessons learned",
                summary: "Reading journal",
                explanation: "Reading journal captures important insights while providing accountability for applying lessons learned to professional and personal improvement goals.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Share book insights with colleagues or professional network for reinforcement",
                summary: "Share insights",
                explanation: "Sharing book insights reinforces learning while building reputation as thoughtful professional who invests in continuous growth and development.",
                timeframe: "Monthly",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Professional Network",
        description: "Systematically expand professional connections for career opportunities and business development",
        icon: "people-circle",
        explanation: "Professional networking becomes critical during economic uncertainty when opportunities often come through personal connections rather than public job postings. Smart professionals are building relationships that create mutual benefits.",
        projects: [
          {
            name: "Strategic Network Building",
            description: "Identify and connect with influential professionals in your industry and target sectors",
            explanation: "Strategic networking focuses on quality relationships with professionals who can provide career advice, opportunities, and business partnerships.",
            tasks: [
              {
                name: "Attend professional association meetings and industry conferences regularly",
                summary: "Attend events",
                explanation: "Professional events provide natural networking opportunities while building industry knowledge and relationships with potential mentors and collaborators.",
                timeframe: "Monthly",
                completed: false
              },
              {
                name: "Connect with 5 new professionals monthly through LinkedIn and professional events",
                summary: "New connections",
                explanation: "Regular networking ensures steady relationship building while creating pipeline of professional contacts for career opportunities and business development.",
                timeframe: "Monthly",
                completed: false
              }
            ]
          },
          {
            name: "Network Relationship Management",
            description: "Maintain and strengthen professional relationships through consistent communication",
            explanation: "Network maintenance ensures relationships remain strong while providing mutual support that creates long-term career and business benefits.",
            tasks: [
              {
                name: "Follow up with new connections and provide value through information sharing",
                summary: "Follow up",
                explanation: "Consistent follow-up with professional contacts maintains relationships while providing value through information sharing that creates reciprocal support.",
                timeframe: "Weekly",
                completed: false
              },
              {
                name: "Offer assistance to network contacts while building reputation for reliability",
                summary: "Offer assistance",
                explanation: "Helping network contacts builds reputation for reliability while creating goodwill that leads to referrals and opportunities when you need career support.",
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
    name: "Recreation & Leisure",
    icon: "bicycle",
    color: "#f59e0b", // Orange
    description: "Hobbies, entertainment, travel, and lifestyle enjoyment",
    goals: [
      {
        name: "Explore Nigerian Culture",
        description: "Discover Nigerian heritage through travel, cuisine, and cultural experiences",
        icon: "camera",
        explanation: "Exploring your own culture provides perspective and relaxation while building appreciation for Nigerian heritage. Cultural experiences also create networking opportunities and personal enrichment during stressful times.",
        projects: [
          {
            name: "Cultural Discovery",
            description: "Systematically explore different aspects of Nigerian culture and heritage",
            explanation: "Cultural exploration provides relaxation while building pride in Nigerian heritage and creating interesting experiences to share with others.",
            tasks: [
              {
                name: "Visit 3 Nigerian cultural sites or museums this year",
                summary: "Cultural sites",
                explanation: "Cultural site visits provide relaxation while building knowledge of Nigerian heritage that creates interesting conversation topics and personal enrichment.",
                timeframe: "6 months",
                completed: false
              },
              {
                name: "Try traditional foods from different Nigerian regions and learn cooking techniques",
                summary: "Traditional foods",
                explanation: "Food exploration provides cultural education while building cooking skills that save money and create social opportunities through sharing meals.",
                timeframe: "3 months",
                completed: false
              }
            ]
          },
          {
            name: "Cultural Sharing",
            description: "Share Nigerian culture with others through events, cooking, or storytelling",
            explanation: "Cultural sharing builds community while creating social opportunities and deeper appreciation for Nigerian traditions and values.",
            tasks: [
              {
                name: "Organize cultural events or share Nigerian traditions with friends",
                summary: "Cultural events",
                explanation: "Cultural events build social connections while celebrating Nigerian heritage and creating enjoyable experiences that strengthen friendships and community bonds.",
                timeframe: "Quarterly",
                completed: false
              },
              {
                name: "Document cultural experiences through photography or writing",
                summary: "Document culture",
                explanation: "Cultural documentation preserves memories while creating content that can be shared with family and friends to build appreciation for Nigerian heritage.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Develop Creative Hobby",
        description: "Start artistic or creative pursuit that provides relaxation and personal expression",
        icon: "brush",
        explanation: "Creative hobbies provide essential stress relief during challenging economic times while developing skills that could become additional income sources. Many professionals find creativity improves problem-solving at work.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "visual-arts",
            name: "Visual Arts (photography, painting, crafts)",
            description: "Express creativity through visual mediums and artistic creation",
            projects: [
              {
                name: "Visual Arts Foundation",
                description: "Learn fundamental skills in chosen visual art form",
                explanation: "Visual arts provide creative outlet while potentially developing skills for additional income through sales or commissions.",
                tasks: [
                  {
                    name: "Choose primary visual art focus and acquire basic equipment within budget",
                    summary: "Choose art form",
                    explanation: "Focusing on one visual art form enables skill development while managing costs through strategic equipment acquisition and gradual improvement.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Complete beginner tutorial series or local art class to build foundation",
                    summary: "Learn basics",
                    explanation: "Art education provides technique foundation while connecting with local creative community that offers support and inspiration for continued development.",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Creative Portfolio Development",
                description: "Create body of artistic work and explore potential for income generation",
                explanation: "Art portfolio demonstrates skill development while creating potential for income through sales or commissions during economic challenges.",
                tasks: [
                  {
                    name: "Create 10 pieces of art to build initial portfolio",
                    summary: "Build portfolio",
                    explanation: "Art portfolio showcases skill development while providing creative satisfaction and potential for income through sales to friends and local markets.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Share artwork through social media or local exhibitions",
                    summary: "Share artwork",
                    explanation: "Art sharing builds creative confidence while creating opportunities for sales and commissions that provide additional income and personal satisfaction.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "music",
            name: "Music (singing, instruments, composition)",
            description: "Express creativity through musical performance and composition",
            projects: [
              {
                name: "Musical Skill Development",
                description: "Learn fundamental music skills through practice and instruction",
                explanation: "Musical skills provide creative expression while potentially creating opportunities for performance income and personal satisfaction.",
                tasks: [
                  {
                    name: "Choose instrument or vocal focus and acquire basic equipment or lessons",
                    summary: "Choose music",
                    explanation: "Musical focus enables consistent skill development while providing creative outlet that reduces stress and builds personal accomplishment.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Practice regularly and learn 10 songs or compositions",
                    summary: "Learn songs",
                    explanation: "Regular musical practice builds skills while creating repertoire that enables performance opportunities and personal enjoyment through musical expression.",
                    timeframe: "6 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Musical Performance and Sharing",
                description: "Share musical skills through performance and potential teaching opportunities",
                explanation: "Musical performance builds confidence while creating potential for income through gigs, teaching, or entertainment services.",
                tasks: [
                  {
                    name: "Perform for friends, family, or local events to build confidence",
                    summary: "Perform music",
                    explanation: "Musical performance builds confidence while creating entertainment opportunities that strengthen social connections and potentially generate income.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Explore teaching music or performing at events for additional income",
                    summary: "Music income",
                    explanation: "Music monetization creates additional income streams while sharing skills with others who want to learn musical expression and performance.",
                    timeframe: "6 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "writing",
            name: "Writing (blogging, poetry, storytelling)",
            description: "Express ideas and creativity through written communication",
            projects: [
              {
                name: "Writing Skills Development",
                description: "Improve writing abilities through practice and feedback",
                explanation: "Writing skills improve professional communication while providing creative outlet and potential for income through freelancing and content creation.",
                tasks: [
                  {
                    name: "Start blog or journal writing practice to develop voice and style",
                    summary: "Start writing",
                    explanation: "Regular writing practice develops communication skills while providing creative outlet that improves professional writing and personal expression.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Complete 20 written pieces (articles, poems, or stories) to build portfolio",
                    summary: "Build writing portfolio",
                    explanation: "Writing portfolio demonstrates skill development while creating content that can be monetized through freelancing or publication opportunities.",
                    timeframe: "4 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Writing Income Development",
                description: "Monetize writing skills through freelancing and content creation",
                explanation: "Writing monetization creates additional income streams while building reputation as skilled communicator for career advancement.",
                tasks: [
                  {
                    name: "Submit writing to publications or start freelance writing services",
                    summary: "Monetize writing",
                    explanation: "Writing monetization creates income opportunities while building professional reputation as skilled communicator that enhances career prospects.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Build writing-based income stream targeting ₦100,000+ monthly",
                    summary: "Scale writing income",
                    explanation: "Writing income scaling provides substantial additional revenue while building expertise that creates ongoing freelancing and career opportunities.",
                    timeframe: "6 months",
                    completed: false
                  }
                ]
              }
            ]
          }
        ],
        projects: [
          {
            name: "Creative Hobby Selection",
            description: "Choose and begin creative pursuit that fits lifestyle and interests",
            explanation: "Creative hobbies provide stress relief while developing skills that enhance personal satisfaction and potentially create income opportunities.",
            tasks: [
              {
                name: "Research creative options and choose hobby that fits budget and schedule",
                summary: "Choose hobby",
                explanation: "Hobby selection based on practical constraints ensures sustainable creative practice while providing stress relief and personal development opportunities.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Set up creative space and acquire basic equipment for chosen hobby",
                summary: "Setup creative space",
                explanation: "Creative space setup enables consistent practice while providing dedicated area for artistic expression and skill development.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Creative Skill Development",
            description: "Build competency in chosen creative area through consistent practice",
            explanation: "Creative skill development provides personal satisfaction while building competency that creates opportunities for income and social connection.",
            tasks: [
              {
                name: "Practice creative hobby weekly and track skill improvement over time",
                summary: "Practice creativity",
                explanation: "Regular creative practice builds skills while providing stress relief and personal satisfaction that improves overall quality of life and mental health.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Connect with creative community for inspiration and potential collaboration",
                summary: "Creative community",
                explanation: "Creative community provides support and inspiration while creating opportunities for collaboration and potential income through joint projects and referrals.",
                timeframe: "2 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Plan Regular Recreation",
        description: "Schedule consistent leisure activities that provide relaxation and entertainment",
        icon: "happy",
        explanation: "Regular recreation becomes essential during stressful economic times to maintain mental health and relationships. Smart planning ensures you enjoy life while building financial security.",
        projects: [
          {
            name: "Recreation Planning System",
            description: "Create systematic approach to scheduling and enjoying regular leisure activities",
            explanation: "Recreation planning ensures work-life balance while providing stress relief essential for maintaining professional performance and personal relationships.",
            tasks: [
              {
                name: "Schedule weekly leisure activities that fit budget and provide genuine relaxation",
                summary: "Schedule recreation",
                explanation: "Regular recreation scheduling ensures work-life balance while providing stress relief that maintains mental health and professional effectiveness.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Plan monthly special activities or outings with friends and family",
                summary: "Plan outings",
                explanation: "Special monthly activities provide anticipation and memorable experiences while strengthening relationships that support professional and personal success.",
                timeframe: "Monthly",
                completed: false
              }
            ]
          },
          {
            name: "Budget-Friendly Entertainment",
            description: "Find enjoyable activities that provide value within economic constraints",
            explanation: "Budget-friendly recreation ensures entertainment access despite economic pressures while maintaining social connections and personal enjoyment.",
            tasks: [
              {
                name: "Discover free or low-cost entertainment options in your area",
                summary: "Find budget options",
                explanation: "Budget entertainment research reveals affordable recreation opportunities while ensuring consistent leisure access despite financial constraints and economic pressures.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Organize group activities to share costs and increase social connection",
                summary: "Group activities",
                explanation: "Group recreation reduces individual costs while providing social connection that strengthens relationships and creates shared experiences and memories.",
                timeframe: "Monthly",
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
    icon: "compass",
    color: "#ef4444", // Red
    description: "Finding fulfillment, contributing to causes, and living with intention",
    goals: [
      {
        name: "Give Back to Community",
        description: "Establish regular volunteer commitment using professional skills to help others",
        icon: "people",
        explanation: "Giving back provides perspective during challenging times while building professional networks and personal satisfaction. Many professionals find community service creates unexpected career opportunities and deep fulfillment.",
        projects: [
          {
            name: "Community Service Setup",
            description: "Find meaningful volunteer opportunities that utilize professional skills",
            explanation: "Skills-based volunteering provides maximum community impact while building professional experience and networking opportunities.",
            tasks: [
              {
                name: "Research community organizations that need professional skills like yours",
                summary: "Research organizations",
                explanation: "Community research identifies organizations needing your professional expertise while ensuring volunteer work creates meaningful impact and skill development opportunities.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Commit to monthly volunteer service and establish consistent contribution schedule",
                summary: "Start volunteering",
                explanation: "Regular volunteer commitment creates meaningful community impact while building relationships and experience that enhance professional development and personal satisfaction.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Community Impact Development",
            description: "Expand community involvement and measure positive impact created",
            explanation: "Community impact measurement demonstrates value creation while building leadership experience and professional reputation for social responsibility.",
            tasks: [
              {
                name: "Track volunteer impact and look for leadership opportunities within organization",
                summary: "Track impact",
                explanation: "Impact tracking demonstrates community value while identifying leadership opportunities that build management experience and professional reputation.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Organize community initiatives or fundraising events to expand impact",
                summary: "Organize initiatives",
                explanation: "Community organizing builds leadership skills while creating larger positive impact and professional network that supports career advancement and personal fulfillment.",
                timeframe: "6 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Develop Personal Mission",
        description: "Define life purpose and align actions with core values and long-term vision",
        icon: "compass",
        explanation: "Clear personal mission provides direction during uncertain times while ensuring decisions align with values. Professionals with strong purpose often achieve greater career satisfaction and life fulfillment.",
        projects: [
          {
            name: "Purpose Discovery Process",
            description: "Identify core values and develop personal mission statement",
            explanation: "Purpose discovery provides life direction while ensuring career and personal decisions align with values and long-term fulfillment goals.",
            tasks: [
              {
                name: "Reflect on values, strengths, and what gives your life meaning and satisfaction",
                summary: "Reflect on purpose",
                explanation: "Purpose reflection clarifies values and priorities while providing foundation for decision-making that leads to greater life satisfaction and career fulfillment.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Write personal mission statement and create action plan for purpose-driven living",
                summary: "Write mission",
                explanation: "Written mission statement provides clear life direction while action plan ensures daily decisions align with purpose and long-term fulfillment goals.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Purpose-Driven Decision Making",
            description: "Align career and life choices with personal mission and values",
            explanation: "Purpose-driven decisions create greater life satisfaction while ensuring career choices support long-term fulfillment rather than just financial goals.",
            tasks: [
              {
                name: "Evaluate current life and career alignment with personal mission",
                summary: "Evaluate alignment",
                explanation: "Mission alignment evaluation identifies areas for improvement while ensuring life choices support long-term fulfillment and personal values.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Make specific changes to better align actions with personal purpose",
                summary: "Align actions",
                explanation: "Purpose alignment creates greater life satisfaction while ensuring career and personal decisions support long-term fulfillment and meaningful contribution.",
                timeframe: "3 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Something Lasting",
        description: "Create project or initiative that will have positive impact beyond your lifetime",
        icon: "rocket",
        explanation: "Building lasting impact provides deep fulfillment while creating meaningful legacy. Many professionals find their greatest satisfaction comes from projects that help others and create positive change.",
        projects: [
          {
            name: "Legacy Project Planning",
            description: "Identify and plan project that creates lasting positive impact",
            explanation: "Legacy projects provide deep meaning while creating positive change that extends beyond individual career success and financial achievement.",
            tasks: [
              {
                name: "Identify community problem you're passionate about solving with lasting impact",
                summary: "Identify problem",
                explanation: "Problem identification focuses legacy efforts on areas of genuine passion while ensuring project addresses real community needs with meaningful impact potential.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Develop project plan with clear goals, timeline, and resource requirements",
                summary: "Plan project",
                explanation: "Legacy project planning ensures feasible execution while creating systematic approach to achieving lasting positive impact and community benefit.",
                timeframe: "2 months",
                completed: false
              }
            ]
          },
          {
            name: "Legacy Project Execution",
            description: "Launch and execute project designed to create lasting positive change",
            explanation: "Legacy project execution transforms vision into reality while creating meaningful impact that provides deep personal satisfaction and community benefit.",
            tasks: [
              {
                name: "Launch legacy project and begin systematic execution of planned activities",
                summary: "Launch project",
                explanation: "Project launch transforms planning into action while beginning creation of lasting impact that provides personal fulfillment and community benefit.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Build systems ensuring project continues creating impact beyond your direct involvement",
                summary: "Build sustainability",
                explanation: "Sustainable systems ensure legacy project creates lasting impact while building organizational structure that continues benefiting community over time.",
                timeframe: "12 months",
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
    color: "#6366f1", // Indigo
    description: "Building community connections, improving your environment, and organizing your spaces",
    goals: [
      {
        name: "Organize Living Space",
        description: "Create efficient, organized home environment that supports productivity and wellbeing",
        icon: "grid",
        explanation: "Organized living space improves mental clarity and productivity while creating peaceful environment during stressful times. Smart organization also saves money by reducing lost items and improving efficiency.",
        projects: [
          {
            name: "Home Organization System",
            description: "Implement comprehensive organization system for all living areas",
            explanation: "Home organization reduces stress while improving productivity and creating peaceful environment that supports professional success.",
            tasks: [
              {
                name: "Declutter all living areas and organize belongings using systematic approach",
                summary: "Declutter home",
                explanation: "Home decluttering creates peaceful environment while improving organization and reducing stress that supports professional productivity and personal wellbeing.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Implement storage solutions and organization systems for long-term maintenance",
                summary: "Storage systems",
                explanation: "Organization systems maintain decluttered environment while creating efficient storage that supports productivity and reduces time wasted searching for items.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Productive Environment Design",
            description: "Create home workspace and relaxation areas optimized for different activities",
            explanation: "Environment design supports both work productivity and personal relaxation while creating spaces that enhance professional and personal effectiveness.",
            tasks: [
              {
                name: "Design dedicated work area with proper lighting, seating, and organization",
                summary: "Create workspace",
                explanation: "Dedicated workspace improves professional productivity while creating boundaries between work and personal life that support mental health and effectiveness.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Arrange relaxation areas that promote rest and stress relief",
                summary: "Relaxation areas",
                explanation: "Relaxation space design supports mental health while providing peaceful environment for rest that enhances professional performance and personal wellbeing.",
                timeframe: "1 week",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Improve Home Security",
        description: "Implement security measures to protect home, family, and belongings",
        icon: "shield-checkmark",
        explanation: "Home security provides peace of mind during uncertain times while protecting investments in property and belongings. Good security also supports professional focus by reducing home-related worries.",
        projects: [
          {
            name: "Security Assessment and Planning",
            description: "Evaluate current security and develop improvement plan within budget constraints",
            explanation: "Security assessment identifies vulnerabilities while budget planning ensures affordable implementation of effective protection measures.",
            tasks: [
              {
                name: "Assess home security vulnerabilities and research affordable improvement options",
                summary: "Security assessment",
                explanation: "Security assessment identifies specific risks while research ensures cost-effective solutions that provide meaningful protection within budget constraints.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Implement priority security improvements starting with most cost-effective measures",
                summary: "Implement security",
                explanation: "Security implementation prioritizes highest-impact improvements while managing costs through strategic selection of most effective protection measures.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Ongoing Security Management",
            description: "Maintain security systems and develop emergency preparedness plans",
            explanation: "Security maintenance ensures ongoing protection while emergency planning provides family safety and peace of mind during challenging times.",
            tasks: [
              {
                name: "Create emergency plans and ensure family members understand security protocols",
                summary: "Emergency planning",
                explanation: "Emergency planning provides family safety while ensuring everyone understands security protocols that protect people and property during crisis situations.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Regularly maintain security systems and update protection measures as needed",
                summary: "Maintain security",
                explanation: "Security maintenance ensures ongoing effectiveness while system updates address new threats and maintain protection as circumstances change.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Create Backup Systems",
        description: "Establish backup plans for power, internet, and essential services during outages",
        icon: "battery-charging",
        explanation: "Backup systems ensure productivity continues during infrastructure challenges while providing security for remote work and business activities. Good backups are essential for professional reliability.",
        projects: [
          {
            name: "Infrastructure Backup Planning",
            description: "Develop backup solutions for power, internet, and communication needs",
            explanation: "Infrastructure backups ensure professional productivity continues despite power outages and service interruptions that frequently affect Nigerian businesses.",
            tasks: [
              {
                name: "Research and acquire backup power solutions like generators or power banks",
                summary: "Backup power",
                explanation: "Power backup solutions ensure work productivity continues during outages while maintaining communication and business activities essential for professional success.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Set up backup internet solutions and communication systems for emergencies",
                summary: "Backup internet",
                explanation: "Internet backup ensures professional connectivity during service interruptions while maintaining business communication and remote work capabilities.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Business Continuity Systems",
            description: "Create systems ensuring professional activities continue during infrastructure challenges",
            explanation: "Business continuity planning protects income and professional reputation while ensuring client service continues despite infrastructure challenges.",
            tasks: [
              {
                name: "Develop business continuity plan for maintaining work during infrastructure failures",
                summary: "Continuity plan",
                explanation: "Business continuity planning ensures professional activities continue despite infrastructure challenges while protecting income and client relationships.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Test backup systems regularly and update plans based on changing needs",
                summary: "Test systems",
                explanation: "Regular system testing ensures backup reliability while plan updates address changing professional needs and infrastructure challenges.",
                timeframe: "Quarterly",
                completed: false
              }
            ]
          }
        ]
      }
    ]
  }
];
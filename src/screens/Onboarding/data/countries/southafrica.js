// src/screens/Onboarding/data/countries/southafrica.js
// South African-specific domain definitions with goals following Nigeria template pattern
export const DOMAIN_DEFINITIONS = [
  {
    name: "Career & Work",
    icon: "briefcase",
    color: "#3b82f6", // Blue
    description: "Professional advancement, workplace goals, career development",
    goals: [
      {
        name: "Switch to Tech Career",
        description: "Transition into high-growth technology roles with international opportunities",
        icon: "laptop",
        explanation: "South Africa leads African tech innovation with incredible opportunities in fintech and development. Smart professionals are pivoting into programming, data science, and digital roles that pay premium salaries and offer international remote work.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "development",
            name: "Software Development & Programming",
            description: "Learn coding and app development for South African and international markets",
            projects: [
              {
                name: "Programming Skills Mastery",
                description: "Master in-demand programming languages and build practical projects",
                explanation: "Cape Town and Johannesburg tech scenes are booming with high demand for developers. Focus on JavaScript and Python for maximum opportunities.",
                tasks: [
                  {
                    name: "Complete coding bootcamp in JS or Python",
                    summary: "Learn coding",
                    explanation: "Coding bootcamps provide intensive training that gets you hired in South Africa's growing tech sector. JavaScript and Python dominate job postings in major cities.",
                    timeframe: "6 months",
                    completed: false
                  },
                  {
                    name: "Build 3 SA business portfolio projects",
                    summary: "Build portfolio",
                    explanation: "Portfolio projects demonstrate your ability to solve real problems with code. South African-focused projects show employers you understand local market needs.",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Tech Job Market Entry",
                description: "Position yourself for junior developer roles in South African tech companies",
                explanation: "South African tech companies offer competitive salaries while international remote roles provide USD income protection against rand volatility.",
                tasks: [
                  {
                    name: "Get cloud certification (AWS/Google)",
                    summary: "Get certified",
                    explanation: "Cloud certifications demonstrate advanced skills that South African companies desperately need. These credentials often lead to immediate job offers with premium salaries.",
                    timeframe: "2 months",
                    completed: false
                  },
                  {
                    name: "Apply to SA tech companies and remote roles",
                    summary: "Apply jobs",
                    explanation: "South African tech hubs offer excellent career growth while remote positions provide USD income that protects against economic uncertainty.",
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
                explanation: "South African businesses need digital marketing experts who understand local consumer behavior and payment systems like Ozow and PayFast.",
                tasks: [
                  {
                    name: "Get Google Ads and Facebook certifications",
                    summary: "Get marketing certs",
                    explanation: "Digital marketing certifications prove your expertise to South African businesses investing heavily in online advertising. High demand with excellent earning potential.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Launch e-commerce or social media campaign",
                    summary: "Run campaigns",
                    explanation: "Campaign experience demonstrates real results that South African businesses can measure. Success stories become powerful portfolio pieces for landing better roles.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "E-commerce Business Setup",
                description: "Start profitable online business leveraging South African market opportunities",
                explanation: "E-commerce is growing rapidly in South Africa with improved logistics and payment systems. Smart marketers are building scalable digital businesses.",
                tasks: [
                  {
                    name: "Set up e-commerce store with digital products",
                    summary: "Launch store",
                    explanation: "Digital products have no inventory costs and can be sold across South Africa and internationally. Creates scalable income streams that work 24/7.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Scale to R15,000+ monthly through marketing",
                    summary: "Scale revenue",
                    explanation: "Reaching R15K monthly proves your business model works and creates substantial additional income that can grow into full-time entrepreneurship.",
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
                explanation: "South African banks and financial services need data analysts to understand customer behavior. These roles offer excellent career progression.",
                tasks: [
                  {
                    name: "Get Google Data Analytics Certificate",
                    summary: "Data certification",
                    explanation: "Google's data certification is recognized by major South African employers and teaches practical skills using real datasets for immediate job opportunities.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Build SA business/economic data dashboard",
                    summary: "Build dashboard",
                    explanation: "Data dashboards showcase your ability to turn information into insights. Local market analysis demonstrates understanding that employers value highly.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Business Intelligence Career",
                description: "Apply data skills in consulting, banking, or fintech roles",
                explanation: "Data analysts earn R25,000-40,000 monthly in South African financial services with excellent growth potential and international opportunities.",
                tasks: [
                  {
                    name: "Apply to SA banks, fintech, consulting data roles",
                    summary: "Apply data jobs",
                    explanation: "South African financial services are investing heavily in data analytics. Your timing is perfect as demand far exceeds supply of skilled analysts.",
                    timeframe: "2 months",
                    completed: false
                  },
                  {
                    name: "Build data analysis consulting for SMEs",
                    summary: "Start consulting",
                    explanation: "Small businesses need data insights but can't afford full-time analysts. Consulting allows you to serve multiple clients while building experience.",
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
            explanation: "South African tech scene offers incredible opportunities with competitive salaries and international remote work potential.",
            tasks: [
              {
                name: "Choose specialization and get certified",
                summary: "Get certified",
                explanation: "Specialization helps you stand out in South Africa's competitive job market while building expertise employers pay premium rates for.",
                timeframe: "4 months",
                completed: false
              },
              {
                name: "Build portfolio with SA market focus",
                summary: "Build portfolio",
                explanation: "Projects solving local business problems demonstrate market knowledge that South African employers value over generic international examples.",
                timeframe: "2 months",
                completed: false
              }
            ]
          },
          {
            name: "Tech Career Transition",
            description: "Network and apply for technology positions strategically",
            explanation: "South African tech community is supportive and collaborative. Building relationships often leads to opportunities before they're posted publicly.",
            tasks: [
              {
                name: "Join SA tech communities and network",
                summary: "Join community",
                explanation: "South African tech community welcomes newcomers who show genuine interest. Many opportunities come through connections rather than job boards.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Apply to fintech startups and remote roles",
                summary: "Apply strategically",
                explanation: "South African fintech offers excellent growth while international remote roles provide USD income and global experience opportunities.",
                timeframe: "3 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Start Profitable Side Business",
        description: "Launch business leveraging South Africa's entrepreneurial opportunities and market gaps",
        icon: "storefront",
        explanation: "Your entrepreneurial spirit gives you a huge advantage! South Africa has incredible opportunities in fintech, e-commerce, and services. Smart professionals are building businesses that provide financial independence.",
        projects: [
          {
            name: "Business Opportunity Research",
            description: "Identify and validate profitable business opportunities in South African market",
            explanation: "South Africa's diverse economy creates opportunities in financial services, food, education, and digital tools that can be addressed profitably.",
            tasks: [
              {
                name: "Research SA business opportunities",
                summary: "Research opportunity",
                explanation: "Local market research reveals gaps in services, digital solutions, and consumer needs that startups can address with relatively low startup costs.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Validate concept with 50+ customers",
                summary: "Validate concept",
                explanation: "Customer validation ensures you're solving real problems people will pay for. This prevents wasting time and money on unwanted products.",
                timeframe: "2 months",
                completed: false
              }
            ]
          },
          {
            name: "Business Launch and Growth",
            description: "Execute business launch and scale to profitability",
            explanation: "South African entrepreneurship support is growing with grants and incubators. Focus on digital-first models that can scale efficiently.",
            tasks: [
              {
                name: "Launch MVP and get 100 customers",
                summary: "Launch MVP",
                explanation: "Starting small reduces risk while proving your business model works. First 100 customers provide valuable feedback for growth and improvement.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Scale to R20,000+ through marketing",
                summary: "Scale revenue",
                explanation: "R20K monthly revenue proves business viability and creates substantial additional income with potential for full-time entrepreneurship.",
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
        explanation: "Leadership opportunities are growing in South Africa as companies expand and modernize. Your experience positions you perfectly for management roles with better compensation and career security.",
        projects: [
          {
            name: "Leadership Skills Development",
            description: "Build management capabilities and demonstrate leadership potential",
            explanation: "South African companies value leaders who understand local business culture while bringing modern management practices and emotional intelligence.",
            tasks: [
              {
                name: "Complete leadership training or MBA",
                summary: "Leadership training",
                explanation: "Formal leadership training demonstrates commitment to management while providing frameworks for effective team leadership in South African business culture.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Lead cross-functional project",
                summary: "Lead project",
                explanation: "Project leadership provides visible proof of management potential while building internal relationships that support promotion opportunities.",
                timeframe: "4 months",
                completed: false
              }
            ]
          },
          {
            name: "Management Position Strategy",
            description: "Position yourself for promotion or management role in new company",
            explanation: "Management roles in South Africa offer significant salary increases and job security. Clear strategy maximizes your promotion likelihood.",
            tasks: [
              {
                name: "Discuss promotion path with manager",
                summary: "Career discussion",
                explanation: "Proactive career conversations signal management ambition while enabling your manager to provide guidance and support for advancement.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Apply for management roles at SA companies",
                summary: "Apply management",
                explanation: "External management applications provide leverage for internal promotion while creating backup options if internal timeline doesn't meet expectations.",
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
        description: "Save 6 months expenses plus load shedding buffer in high-yield rand and dollar accounts",
        icon: "shield",
        explanation: "Economic uncertainty and load shedding make emergency funds essential for South African professionals. Smart savers are using high-yield accounts and dollar investments to protect against inflation while maintaining liquidity.",
        projects: [
          {
            name: "Emergency Fund Strategy",
            description: "Calculate target amount and set up systematic saving approach",
            explanation: "South African professionals need comprehensive emergency funds covering regular expenses plus load shedding costs and equipment replacement needs.",
            tasks: [
              {
                name: "Calculate emergency fund + load shedding buffer",
                summary: "Calculate fund",
                explanation: "Comprehensive emergency fund calculation includes load shedding backup power costs while high-yield accounts maximize growth and accessibility.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Set up automatic emergency fund transfers",
                summary: "Automate savings",
                explanation: "Automatic savings ensure consistent progress toward emergency fund goal while removing temptation to spend money on non-essential items.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Expense Management",
            description: "Optimize spending to maximize emergency fund contributions",
            explanation: "Strategic expense management helps South African professionals save more despite inflation pressures and rising utility costs.",
            tasks: [
              {
                name: "Track expenses and find cost reductions",
                summary: "Track expenses",
                explanation: "Expense tracking reveals spending patterns and opportunities for savings that can be redirected to emergency fund building and investments.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Negotiate better rates for recurring expenses",
                summary: "Reduce expenses",
                explanation: "Negotiating better rates on fixed expenses creates permanent monthly savings that compound over time, accelerating emergency fund growth.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Start Investment Portfolio",
        description: "Build diversified investment strategy using South African and international options",
        icon: "trending-up",
        explanation: "Inflation protection requires smart investing beyond traditional savings. South African professionals are using JSE stocks, offshore investments, and fintech platforms to build wealth and hedge against rand volatility.",
        projects: [
          {
            name: "Investment Foundation",
            description: "Learn investment basics and choose appropriate platforms",
            explanation: "South African investment landscape offers multiple options from JSE stocks to international investments through local platforms and offshore allowances.",
            tasks: [
              {
                name: "Learn investing and choose platform",
                summary: "Learn investing",
                explanation: "Investment education provides foundation for informed decisions while platform selection determines access to local and international opportunities.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Start R5,000 diversified investment",
                summary: "Start investing",
                explanation: "Starting with modest amount reduces risk while building investment experience. Diversification across local and international options provides balanced growth.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Portfolio Growth Strategy",
            description: "Systematically build investment portfolio through regular contributions",
            explanation: "Consistent investment contributions leverage rand-cost averaging to build long-term wealth despite market volatility and currency fluctuations.",
            tasks: [
              {
                name: "Set up R2,500+ monthly investments",
                summary: "Automate investing",
                explanation: "Automatic investment contributions ensure consistent portfolio growth while taking advantage of market fluctuations through systematic investing.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Review and rebalance quarterly",
                summary: "Manage portfolio",
                explanation: "Regular portfolio review ensures investments remain aligned with goals while rebalancing maintains appropriate risk levels for economic conditions.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Increase Income Streams",
        description: "Develop multiple income sources to accelerate wealth building and reduce financial risk",
        icon: "wallet",
        explanation: "Multiple income streams provide security and acceleration toward financial goals. South African professionals are successfully combining employment, freelancing, and business income to reach higher monthly earnings.",
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
                explanation: "South African professionals can earn R8,000-25,000 monthly through freelancing while maintaining full-time employment and building client relationships.",
                tasks: [
                  {
                    name: "Create profiles on Upwork, Fiverr, local sites",
                    summary: "Setup profiles",
                    explanation: "Professional freelancing profiles attract high-paying international and local clients seeking South African expertise and competitive rates.",
                    timeframe: "2 weeks",
                    completed: false
                  },
                  {
                    name: "Get 5 freelance clients and set pricing",
                    summary: "Get clients",
                    explanation: "Initial freelance clients provide experience, testimonials, and revenue that create foundation for scaling income to substantial monthly amounts.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Freelancing Income Scale",
                description: "Scale freelancing to consistent R15,000+ monthly income",
                explanation: "Successful South African freelancers earn substantial monthly income through premium pricing and efficient service delivery to international clients.",
                tasks: [
                  {
                    name: "Create premium packages for global clients",
                    summary: "Premium packages",
                    explanation: "Premium service packages command higher USD rates while attracting clients who value quality and expertise over lowest-cost providers.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Build systems for R15,000+ freelancing",
                    summary: "Scale systems",
                    explanation: "Systematic freelancing approach enables predictable income growth while maintaining quality standards that keep clients returning for more projects.",
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
                description: "Create and launch digital products targeting South African market",
                explanation: "Digital products offer scalable income potential with minimal ongoing costs once created and marketed to South African professionals.",
                tasks: [
                  {
                    name: "Create profitable digital product MVP",
                    summary: "Create product",
                    explanation: "Digital products like courses, templates, and tools can be created once and sold repeatedly to South Africans seeking solutions to common problems.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Launch product for R8,000+ monthly",
                    summary: "Launch product",
                    explanation: "Successful digital product launch provides passive income stream while demonstrating entrepreneurial capabilities for career advancement.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Digital Business Scaling",
                description: "Scale digital business through marketing optimization and product expansion",
                explanation: "Digital business scaling leverages South African market growth and increasing digital adoption to build substantial recurring income streams.",
                tasks: [
                  {
                    name: "Optimize marketing for R20,000+ monthly",
                    summary: "Scale marketing",
                    explanation: "Marketing optimization increases customer acquisition while improving conversion rates, enabling rapid business growth and higher revenue targets.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Expand products and find partnerships",
                    summary: "Expand business",
                    explanation: "Business expansion through additional products and strategic partnerships creates multiple revenue streams while building market presence.",
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
                explanation: "Dividend-paying JSE stocks and bonds provide monthly income while building long-term wealth through capital appreciation in rand and dollars.",
                tasks: [
                  {
                    name: "Build dividend portfolio for R4,000+ monthly",
                    summary: "Dividend portfolio",
                    explanation: "Dividend-focused investing provides regular income while maintaining capital growth potential through well-managed South African and international stocks.",
                    timeframe: "6 months",
                    completed: false
                  },
                  {
                    name: "Explore REITs and bond investments",
                    summary: "Diversify income",
                    explanation: "REITs and bonds provide additional income streams with different risk profiles while diversifying beyond individual stocks for stability.",
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
                    name: "Research crypto and international investments",
                    summary: "Crypto research",
                    explanation: "Cryptocurrency investments offer potential significant returns while providing hedge against rand volatility, though requiring careful risk management.",
                    timeframe: "2 months",
                    completed: false
                  },
                  {
                    name: "Explore P2P lending and alt investments",
                    summary: "Alternative investing",
                    explanation: "Alternative investment platforms enable diverse investing approaches, providing higher potential returns than traditional savings accounts.",
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
            explanation: "Strategic income planning ensures new streams complement rather than compete with primary employment while building financial resilience.",
            tasks: [
              {
                name: "Assess skills and find income opportunities",
                summary: "Identify opportunities",
                explanation: "Skills assessment reveals natural income stream opportunities while ensuring new ventures leverage existing expertise for faster success.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Create income stream development timeline",
                summary: "Plan timeline",
                explanation: "Structured timeline ensures income stream development receives adequate attention while maintaining primary employment performance.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Income Stream Execution",
            description: "Execute plan to develop and scale additional income source",
            explanation: "Consistent execution transforms income stream plans into financial reality that accelerates wealth building and financial independence goals.",
            tasks: [
              {
                name: "Launch income stream and track growth",
                summary: "Launch stream",
                explanation: "Revenue tracking provides feedback on income stream performance while enabling optimization for faster growth and higher earnings.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Scale income stream to target monthly amount",
                summary: "Scale income",
                explanation: "Systematic scaling leverages successful income stream foundation to reach ambitious monthly targets while maintaining sustainable growth.",
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
        description: "Establish sustainable exercise habits that work with South African lifestyle and infrastructure",
        icon: "barbell",
        explanation: "Regular fitness becomes even more important during stressful times and load shedding. Smart professionals are finding creative ways to stay fit despite infrastructure challenges and busy schedules.",
        projects: [
          {
            name: "Exercise Habit Foundation",
            description: "Create sustainable workout routine that works despite load shedding and infrastructure challenges",
            explanation: "Successful fitness in South Africa requires adaptability to power outages, safety concerns, and weather while maintaining consistency for health.",
            tasks: [
              {
                name: "Choose 3 consistent physical activities",
                summary: "Choose activities",
                explanation: "Selecting activities that work during load shedding and infrastructure problems ensures consistent fitness routine regardless of external challenges.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Schedule 30-min sessions 3x weekly",
                summary: "Schedule exercise",
                explanation: "Strategic exercise scheduling around load shedding and work demands ensures fitness remains priority while accommodating infrastructure challenges.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Fitness Community Building",
            description: "Connect with fitness communities for motivation, safety, and accountability",
            explanation: "South African fitness communities provide support, safety in numbers, and motivation while making exercise more enjoyable and sustainable.",
            tasks: [
              {
                name: "Join gym or fitness group for support",
                summary: "Join fitness group",
                explanation: "Fitness communities provide accountability, safety, and equipment access while making exercise more enjoyable through social connections.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Track progress and celebrate milestones",
                summary: "Track progress",
                explanation: "Progress tracking and community celebration maintains motivation while providing visible evidence of health improvements over time.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Improve Mental Health",
        description: "Develop stress management and mental wellness strategies for economic uncertainty and daily pressures",
        icon: "heart",
        explanation: "Economic pressures and daily stresses make mental health critical for South African professionals. Developing resilience strategies helps maintain performance and relationships during challenging times.",
        projects: [
          {
            name: "Stress Management System",
            description: "Create comprehensive approach to managing work, economic, and daily stress",
            explanation: "Effective stress management becomes essential during economic uncertainty while maintaining professional performance and personal relationships.",
            tasks: [
              {
                name: "Learn stress management and mindfulness",
                summary: "Learn stress management",
                explanation: "Stress management techniques provide immediate relief during challenging situations while building long-term resilience for professional and personal success.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Set daily 15-min mental health routine",
                summary: "Daily routine",
                explanation: "Consistent mental health routine provides stability and emotional regulation during uncertain times while maintaining productivity and positive relationships.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Mental Wellness Support",
            description: "Build support network and access professional help when needed",
            explanation: "Strong support networks become invaluable during stressful times while professional mental health support addresses serious concerns effectively.",
            tasks: [
              {
                name: "Build emotional support network",
                summary: "Build support",
                explanation: "Regular emotional support prevents isolation and provides perspective during challenging times while maintaining mental health essential for success.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Monitor mental health and seek help",
                summary: "Monitor health",
                explanation: "Mental health monitoring enables early intervention while professional support addresses serious concerns before they impact career and relationships.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Optimize Nutrition",
        description: "Improve diet quality while managing food costs during inflation and supply challenges",
        icon: "nutrition",
        explanation: "Good nutrition supports energy and mental clarity needed for career success. Smart professionals are finding ways to eat well despite rising food costs and supply chain challenges.",
        projects: [
          {
            name: "Nutrition Strategy",
            description: "Develop cost-effective nutrition plan using local South African foods",
            explanation: "South African local foods provide excellent nutrition at reasonable costs while supporting energy levels needed for demanding professional schedules.",
            tasks: [
              {
                name: "Plan healthy meals with local ingredients",
                summary: "Plan nutrition",
                explanation: "Local South African ingredients provide excellent nutrition at lower costs than imported foods while supporting traditional food systems.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Meal prep 3 days weekly for nutrition",
                summary: "Meal prep",
                explanation: "Meal preparation ensures consistent good nutrition despite unpredictable work schedules while reducing food costs and improving dietary quality.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Healthy Eating Habits",
            description: "Build sustainable eating habits that support professional performance and wellbeing",
            explanation: "Consistent healthy eating provides stable energy and mental clarity essential for professional success and career advancement.",
            tasks: [
              {
                name: "Eat more local fruits and vegetables",
                summary: "Improve diet",
                explanation: "Whole foods provide better nutrition and sustained energy while reducing health risks associated with processed food consumption.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Stay hydrated and eat regularly",
                summary: "Maintain schedule",
                explanation: "Regular eating and hydration schedules maintain blood sugar stability and cognitive function essential for professional performance.",
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
        name: "Plan Dream Wedding",
        description: "Organize and execute meaningful wedding celebration within budget while building strong marriage foundation",
        icon: "heart",
        explanation: "Planning your dream wedding is an exciting journey that brings families together and celebrates your love. Smart couples are creating beautiful, meaningful celebrations while building strong financial foundations for marriage.",
        projects: [
          {
            name: "Wedding Planning Foundation",
            description: "Create wedding vision and establish realistic budget for celebration",
            explanation: "Wedding planning requires balancing dream celebration with financial reality while ensuring the day reflects your values and brings joy to everyone.",
            tasks: [
              {
                name: "Define wedding vision and set budget",
                summary: "Wedding budget",
                explanation: "Clear wedding vision and realistic budget enable beautiful celebration while protecting your financial future and reducing planning stress.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Create timeline and book vendors",
                summary: "Book vendors",
                explanation: "Early vendor booking secures preferred dates and pricing while systematic timeline ensures all details are managed without overwhelm.",
                timeframe: "2 months",
                completed: false
              }
            ]
          },
          {
            name: "Wedding Execution and Marriage Preparation",
            description: "Execute wedding plans while preparing for strong marriage relationship",
            explanation: "Wedding execution focuses on celebration while marriage preparation builds foundation for lifelong partnership and shared success.",
            tasks: [
              {
                name: "Execute beautiful wedding celebration",
                summary: "Wedding day",
                explanation: "Wedding celebration marks beginning of marriage journey while bringing together family and friends to support your lifelong partnership.",
                timeframe: "6 months",
                completed: false
              },
              {
                name: "Get marriage preparation counseling",
                summary: "Marriage prep",
                explanation: "Marriage preparation provides relationship tools and communication skills essential for building strong, lasting partnership through all life seasons.",
                timeframe: "3 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Strengthen Family Relationships",
        description: "Improve connections with parents, siblings, and extended family members",
        icon: "home",
        explanation: "Strong family relationships provide emotional support and practical help during challenging times. Investing in family bonds creates lasting connections that enrich your life and provide mutual support.",
        projects: [
          {
            name: "Family Relationship Investment",
            description: "Actively invest time and energy in strengthening family relationships",
            explanation: "Strong family bonds provide emotional foundation and practical support while creating positive relationships that last throughout life.",
            tasks: [
              {
                name: "Schedule regular family time",
                summary: "Family time",
                explanation: "Regular family time maintains strong relationships while providing emotional support and connection essential during career building periods.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Support family through career success",
                summary: "Support family",
                explanation: "Supporting family members demonstrates gratitude while building family pride and creating positive cycle of mutual support and care.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Extended Family Connection",
            description: "Maintain connections with extended family and participate in family traditions",
            explanation: "Extended family connections provide broader support network while maintaining cultural identity and traditional values important for grounding.",
            tasks: [
              {
                name: "Attend gatherings and stay connected",
                summary: "Family gatherings",
                explanation: "Family gatherings maintain cultural connections while providing opportunities for mutual support during both celebrations and challenges.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Participate in family traditions",
                summary: "Family traditions",
                explanation: "Family traditions maintain cultural identity while creating positive memories and strengthening bonds that provide lifelong support.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Improve Romantic Relationship",
        description: "Strengthen romantic partnership through better communication and shared experiences",
        icon: "heart-circle",
        explanation: "Strong romantic relationships provide emotional support and partnership for achieving life goals together. Investing in your relationship creates deeper connection and shared success in all areas of life.",
        projects: [
          {
            name: "Relationship Communication Enhancement",
            description: "Improve communication skills and emotional connection with romantic partner",
            explanation: "Better communication builds stronger emotional connection while resolving conflicts effectively and creating deeper intimacy and partnership.",
            tasks: [
              {
                name: "Practice active listening with partner",
                summary: "Communication skills",
                explanation: "Active listening and vulnerability create deeper emotional connection while building trust essential for strong romantic partnership.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Schedule quality time and shared experiences",
                summary: "Quality time",
                explanation: "Regular quality time and shared experiences maintain relationship connection while creating positive memories and deeper partnership.",
                timeframe: "Weekly",
                completed: false
              }
            ]
          },
          {
            name: "Shared Goals and Future Planning",
            description: "Align life goals and create shared vision for future together",
            explanation: "Shared goals and future planning create partnership direction while ensuring both people support each other's dreams and aspirations.",
            tasks: [
              {
                name: "Discuss goals and create shared vision",
                summary: "Future planning",
                explanation: "Future planning ensures relationship goals align while creating shared excitement about building life together and supporting each other's success.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Support partner's growth and shared goals",
                summary: "Mutual support",
                explanation: "Mutual support enables both partners to achieve personal goals while building stronger relationship through shared success and encouragement.",
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
        name: "Master Public Speaking",
        description: "Develop confident public speaking and presentation skills for professional advancement",
        icon: "mic",
        explanation: "Excellent communication skills give you huge career advantages! Public speaking builds confidence, leadership presence, and professional opportunities while helping you share ideas effectively and inspire others.",
        projects: [
          {
            name: "Public Speaking Foundation",
            description: "Learn fundamental public speaking techniques and overcome speaking anxiety",
            explanation: "Public speaking skills build professional confidence while providing foundation for leadership roles and career advancement opportunities.",
            tasks: [
              {
                name: "Join Toastmasters or take speaking course",
                summary: "Speaking training",
                explanation: "Structured speaking training provides systematic skill development while offering safe environment to practice and build confidence gradually.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Practice speaking at work or events",
                summary: "Speaking practice",
                explanation: "Regular speaking practice builds confidence while providing opportunities to share expertise and build professional reputation as effective communicator.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Advanced Communication Skills",
            description: "Develop advanced presentation abilities and thought leadership through speaking",
            explanation: "Advanced communication skills position you as thought leader while creating opportunities for professional recognition and career advancement.",
            tasks: [
              {
                name: "Deliver 5 professional presentations",
                summary: "Professional presentations",
                explanation: "Professional presentations showcase expertise while building reputation as knowledgeable communicator who can inspire and inform others effectively.",
                timeframe: "6 months",
                completed: false
              },
              {
                name: "Seek speaking opportunities at conferences",
                summary: "Industry speaking",
                explanation: "Industry speaking establishes thought leadership while building professional network and reputation as expert worth listening to and learning from.",
                timeframe: "12 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Learn New Skill",
        description: "Master concrete capability that enhances career prospects and personal development",
        icon: "school",
        explanation: "Continuous learning gives you competitive advantage in South Africa's evolving economy. Smart professionals are acquiring skills that make them indispensable while opening new opportunities.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "language",
            name: "Language Skills (Afrikaans, Zulu, international languages)",
            description: "Improve communication skills for broader South African and international opportunities",
            projects: [
              {
                name: "Local Language Mastery",
                description: "Learn additional South African language for better local communication and opportunities",
                explanation: "Additional South African languages open doors to broader job opportunities while enabling better communication with colleagues and clients.",
                tasks: [
                  {
                    name: "Learn Afrikaans, Zulu, or local language",
                    summary: "Local language",
                    explanation: "Local language skills improve job prospects while enabling better communication with diverse South African colleagues and clients.",
                    timeframe: "6 months",
                    completed: false
                  },
                  {
                    name: "Practice language through interactions",
                    summary: "Practice language",
                    explanation: "Regular language practice builds fluency while creating stronger workplace relationships and broader professional opportunities.",
                    timeframe: "Ongoing",
                    completed: false
                  }
                ]
              },
              {
                name: "International Language Learning",
                description: "Learn international language for global business opportunities",
                explanation: "International languages open access to global markets and remote work opportunities increasingly available to South African professionals.",
                tasks: [
                  {
                    name: "Learn German, French, or Mandarin",
                    summary: "International language",
                    explanation: "Business-focused language learning provides practical skills for international trade and partnership opportunities in global markets.",
                    timeframe: "8 months",
                    completed: false
                  },
                  {
                    name: "Apply language in business communications",
                    summary: "Apply language",
                    explanation: "Practical language application builds fluency while creating business opportunities that leverage South Africa's global connections.",
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
                explanation: "Financial analysis skills improve personal investment decisions while creating career opportunities in South Africa's financial services sector.",
                tasks: [
                  {
                    name: "Learn financial analysis and JSE markets",
                    summary: "Financial course",
                    explanation: "Financial analysis education provides skills for personal wealth management while opening career opportunities in growing financial sector.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Analyze SA stocks and investments",
                    summary: "Analyze investments",
                    explanation: "Practical financial analysis improves personal investment returns while building expertise that employers value in financial services careers.",
                    timeframe: "3 months",
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
                    name: "Create balanced investment strategy",
                    summary: "Investment strategy",
                    explanation: "Personal investment strategy provides wealth building roadmap while demonstrating financial expertise that creates consulting opportunities.",
                    timeframe: "2 months",
                    completed: false
                  },
                  {
                    name: "Share investment knowledge through blogging",
                    summary: "Share knowledge",
                    explanation: "Sharing financial knowledge builds reputation as expert while creating potential income streams through financial education services.",
                    timeframe: "4 months",
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
                explanation: "Leadership skills enable management career advancement while improving entrepreneurial success and community impact potential.",
                tasks: [
                  {
                    name: "Get leadership training for SA culture",
                    summary: "Leadership training",
                    explanation: "Leadership training adapted to South African culture provides practical skills for managing diverse teams while respecting cultural values.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Apply leadership through projects and teams",
                    summary: "Apply leadership",
                    explanation: "Leadership application builds experience while demonstrating capabilities that lead to management promotions and entrepreneurial success.",
                    timeframe: "6 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Advanced Management Capabilities",
                description: "Develop advanced management skills for senior leadership roles",
                explanation: "Advanced management skills position you for executive roles while improving business performance and team effectiveness.",
                tasks: [
                  {
                    name: "Study successful SA business leaders",
                    summary: "Study leaders",
                    explanation: "Learning from successful South African leaders provides culturally appropriate management models while building business understanding.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Mentor juniors and build experience",
                    summary: "Mentor others",
                    explanation: "Mentoring builds management experience while creating positive reputation that leads to leadership opportunities and referrals.",
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
            explanation: "Structured learning ensures consistent progress while providing accountability for skill development and professional advancement goals.",
            tasks: [
              {
                name: "Research resources and create timeline",
                summary: "Plan learning",
                explanation: "Learning research ensures quality education while timeline creates accountability for consistent progress toward skill mastery and application.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Practice skill weekly and track progress",
                summary: "Practice skill",
                explanation: "Regular skill practice builds competency while progress tracking provides motivation and evidence of development for career discussions.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Skill Application Strategy",
            description: "Apply learned skill in professional context to create career and income opportunities",
            explanation: "Skill application transforms learning into practical career benefits while creating opportunities for increased income and recognition.",
            tasks: [
              {
                name: "Apply skill at work to show value",
                summary: "Apply professionally",
                explanation: "Professional skill application provides immediate career benefits while demonstrating value to employers and creating promotion opportunities.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Market skill through freelancing",
                summary: "Market skill",
                explanation: "Skill marketing creates additional income streams while building reputation as expert that leads to better career opportunities.",
                timeframe: "6 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Read More Books",
        description: "Establish consistent reading habit focusing on professional and personal growth",
        icon: "library",
        explanation: "Reading provides knowledge and perspective essential for professional growth. Successful South African professionals invest in continuous learning through books while building mental clarity and wisdom.",
        projects: [
          {
            name: "Reading Habit Foundation",
            description: "Create sustainable reading routine despite busy professional schedule",
            explanation: "Consistent reading habit provides ongoing education and mental stimulation while building knowledge foundation for career advancement.",
            tasks: [
              {
                name: "Set goal of 2 books monthly",
                summary: "Reading goal",
                explanation: "Regular reading schedule ensures consistent personal development while building knowledge essential for professional growth and decision making.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Choose business and development books",
                summary: "Choose books",
                explanation: "Balanced book selection provides comprehensive personal development while building specific professional knowledge and general wisdom.",
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
                name: "Keep reading journal and apply lessons",
                summary: "Reading journal",
                explanation: "Reading journal captures important insights while providing accountability for applying lessons to professional and personal improvement.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Share insights with professional network",
                summary: "Share insights",
                explanation: "Sharing book insights reinforces learning while building reputation as thoughtful professional who invests in continuous growth.",
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
    name: "Recreation & Leisure",
    icon: "bicycle",
    color: "#f59e0b", // Orange
    description: "Hobbies, entertainment, travel, and lifestyle enjoyment",
    goals: [
      {
        name: "Travel More",
        description: "Explore South African destinations and international travel experiences",
        icon: "airplane",
        explanation: "Travel provides perspective, relaxation, and cultural enrichment that enhance your life experience. Smart travelers are exploring incredible South African destinations while building memories and broadening worldview.",
        projects: [
          {
            name: "South African Travel Discovery",
            description: "Systematically explore diverse South African destinations and experiences",
            explanation: "South Africa offers incredible diversity from wine regions to safari experiences, providing affordable travel options that showcase natural beauty and culture.",
            tasks: [
              {
                name: "Plan 4 SA destination trips",
                summary: "Local travel",
                explanation: "South African travel provides cultural enrichment and relaxation while supporting local tourism and creating memorable experiences at reasonable costs.",
                timeframe: "12 months",
                completed: false
              },
              {
                name: "Document and share travel experiences",
                summary: "Share travel",
                explanation: "Travel documentation preserves memories while sharing recommendations helps others discover South African beauty and supports local tourism.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "International Travel Planning",
            description: "Plan and execute meaningful international travel experiences within budget",
            explanation: "International travel broadens perspective while creating life experiences that enrich personal growth and professional worldview.",
            tasks: [
              {
                name: "Plan one international trip annually",
                summary: "International travel",
                explanation: "International travel provides perspective and cultural understanding while creating memorable experiences that broaden worldview and personal growth.",
                timeframe: "Annual",
                completed: false
              },
              {
                name: "Research budget travel and create fund",
                summary: "Travel planning",
                explanation: "Strategic travel planning enables international experiences within budget while ensuring meaningful cultural and personal enrichment opportunities.",
                timeframe: "6 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Pursue Creative Hobby",
        description: "Start artistic or creative pursuit that provides relaxation and personal expression",
        icon: "brush",
        explanation: "Creative hobbies provide essential stress relief during challenging times while developing skills that could become additional income sources. Creativity improves problem-solving and adds richness to life.",
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
                explanation: "Visual arts provide creative outlet while potentially developing skills for additional income through sales or creative services.",
                tasks: [
                  {
                    name: "Choose art focus and get equipment",
                    summary: "Choose art form",
                    explanation: "Focusing on one visual art enables skill development while managing costs through strategic equipment acquisition and gradual improvement.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Take beginner art class or tutorials",
                    summary: "Learn basics",
                    explanation: "Art education provides technique foundation while connecting with local creative community for support and inspiration.",
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
                    explanation: "Art portfolio showcases skill development while providing creative satisfaction and potential for income through local sales and exhibitions.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Share artwork through social media or local exhibitions",
                    summary: "Share artwork",
                    explanation: "Art sharing builds creative confidence while creating opportunities for sales and commissions that provide additional income and satisfaction.",
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
                    name: "Choose instrument and get lessons",
                    summary: "Choose music",
                    explanation: "Musical focus enables consistent skill development while providing creative outlet that reduces stress and builds personal accomplishment.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Practice regularly and learn 10 songs or compositions",
                    summary: "Learn songs",
                    explanation: "Regular musical practice builds skills while creating repertoire that enables performance opportunities and personal enjoyment.",
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
                    name: "Perform for friends and local events",
                    summary: "Perform music",
                    explanation: "Musical performance builds confidence while creating entertainment opportunities that strengthen social connections and potentially generate income.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Teach music or perform for income",
                    summary: "Music income",
                    explanation: "Music monetization creates additional income streams while sharing skills with others who want to learn musical expression.",
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
                    name: "Start blog or journal practice",
                    summary: "Start writing",
                    explanation: "Regular writing practice develops communication skills while providing creative outlet that improves professional writing and personal expression.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Write 20 pieces for portfolio",
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
                    name: "Submit writing or start freelancing",
                    summary: "Monetize writing",
                    explanation: "Writing monetization creates income opportunities while building professional reputation as skilled communicator that enhances career prospects.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Build writing-based income stream targeting R8,000+ monthly",
                    summary: "Scale writing income",
                    explanation: "Writing income scaling provides substantial additional revenue while building expertise that creates ongoing freelancing opportunities.",
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
                name: "Choose creative hobby within budget",
                summary: "Choose hobby",
                explanation: "Hobby selection based on practical constraints ensures sustainable creative practice while providing stress relief and development opportunities.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Set up creative space and get equipment",
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
                name: "Practice hobby weekly and track progress",
                summary: "Practice creativity",
                explanation: "Regular creative practice builds skills while providing stress relief and personal satisfaction that improves overall quality of life.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Join creative community for inspiration",
                summary: "Creative community",
                explanation: "Creative community provides support and inspiration while creating opportunities for collaboration and potential income through joint projects.",
                timeframe: "2 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Enjoy Recreation Time",
        description: "Schedule consistent leisure activities that provide relaxation and entertainment",
        icon: "happy",
        explanation: "Regular recreation becomes essential during stressful times to maintain mental health and relationships. Smart planning ensures you enjoy life while building financial security and career success.",
        projects: [
          {
            name: "Recreation Planning System",
            description: "Create systematic approach to scheduling and enjoying regular leisure activities",
            explanation: "Recreation planning ensures work-life balance while providing stress relief essential for maintaining professional performance and personal relationships.",
            tasks: [
              {
                name: "Schedule weekly leisure within budget",
                summary: "Schedule recreation",
                explanation: "Regular recreation scheduling ensures work-life balance while providing stress relief that maintains mental health and professional effectiveness.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Plan monthly outings with friends/family",
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
                name: "Find free or low-cost entertainment",
                summary: "Find budget options",
                explanation: "Budget entertainment research reveals affordable recreation opportunities while ensuring consistent leisure access despite financial constraints.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Organize group activities to share costs",
                summary: "Group activities",
                explanation: "Group recreation reduces individual costs while providing social connection that strengthens relationships and creates shared experiences.",
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
        icon: "heart",
        explanation: "Giving back provides perspective during challenging times while building professional networks and personal satisfaction. Community service creates unexpected opportunities and deep fulfillment through helping others.",
        projects: [
          {
            name: "Community Service Setup",
            description: "Find meaningful volunteer opportunities that utilize professional skills",
            explanation: "Skills-based volunteering provides maximum community impact while building professional experience and networking opportunities.",
            tasks: [
              {
                name: "Find organizations needing your skills",
                summary: "Research organizations",
                explanation: "Community research identifies organizations needing your expertise while ensuring volunteer work creates meaningful impact and skill development.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Commit to monthly volunteer service",
                summary: "Start volunteering",
                explanation: "Regular volunteer commitment creates meaningful community impact while building relationships and experience that enhance professional development.",
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
                name: "Track impact and seek leadership roles",
                summary: "Track impact",
                explanation: "Impact tracking demonstrates community value while identifying leadership opportunities that build management experience and professional reputation.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Organize initiatives to expand impact",
                summary: "Organize initiatives",
                explanation: "Community organizing builds leadership skills while creating larger positive impact and professional network that supports career advancement.",
                timeframe: "6 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Find Life Purpose",
        description: "Define personal mission and align actions with core values and long-term vision",
        icon: "compass",
        explanation: "Clear life purpose provides direction during uncertain times while ensuring decisions align with values. People with strong purpose often achieve greater career satisfaction and life fulfillment.",
        projects: [
          {
            name: "Purpose Discovery Process",
            description: "Identify core values and develop personal mission statement",
            explanation: "Purpose discovery provides life direction while ensuring career and personal decisions align with values and long-term fulfillment goals.",
            tasks: [
              {
                name: "Reflect on values and life meaning",
                summary: "Reflect on purpose",
                explanation: "Purpose reflection clarifies values and priorities while providing foundation for decision-making that leads to greater life satisfaction.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Write mission statement and action plan",
                summary: "Write mission",
                explanation: "Written mission statement provides clear life direction while action plan ensures daily decisions align with purpose and fulfillment goals.",
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
                name: "Evaluate alignment with personal mission",
                summary: "Evaluate alignment",
                explanation: "Mission alignment evaluation identifies areas for improvement while ensuring life choices support long-term fulfillment and values.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Align actions with personal purpose",
                summary: "Align actions",
                explanation: "Purpose alignment creates greater life satisfaction while ensuring career and personal decisions support long-term fulfillment and contribution.",
                timeframe: "3 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Practice Mindfulness",
        description: "Develop mindfulness and meditation practices for mental clarity and emotional wellbeing",
        icon: "leaf",
        explanation: "Mindfulness practices provide mental clarity and emotional stability essential for navigating life's challenges. Regular practice reduces stress while improving decision-making and overall life satisfaction.",
        projects: [
          {
            name: "Mindfulness Foundation",
            description: "Learn and establish basic mindfulness and meditation practices",
            explanation: "Mindfulness foundation provides mental tools for stress management while improving focus and emotional regulation essential for success.",
            tasks: [
              {
                name: "Learn mindfulness through apps or courses",
                summary: "Learn mindfulness",
                explanation: "Mindfulness education provides practical techniques for stress reduction while building mental clarity essential for professional and personal effectiveness.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Set daily 10-min mindfulness practice",
                summary: "Daily practice",
                explanation: "Daily mindfulness practice builds mental resilience while providing stress relief and emotional stability essential for navigating challenges.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Advanced Mindfulness Development",
            description: "Deepen mindfulness practice and explore different meditation approaches",
            explanation: "Advanced mindfulness practice provides deeper mental clarity while exploring various approaches to find methods that work best for your lifestyle.",
            tasks: [
              {
                name: "Explore walking meditation and breathing",
                summary: "Explore approaches",
                explanation: "Various mindfulness approaches provide options for different situations while enabling you to find techniques that work best for your needs.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Join mindfulness community or retreat",
                summary: "Mindfulness community",
                explanation: "Mindfulness community provides support and deeper learning while creating connections with others committed to mental clarity and wellbeing.",
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
    name: "Environment & Organization",
    icon: "home",
    color: "#6366f1", // Indigo
    description: "Creating organized, comfortable living and working spaces",
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
            explanation: "Home organization reduces stress while improving productivity and creating peaceful environment that supports professional success and personal wellbeing.",
            tasks: [
              {
                name: "Declutter and organize all living areas",
                summary: "Declutter home",
                explanation: "Home decluttering creates peaceful environment while improving organization and reducing stress that supports professional productivity.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Implement storage and organization systems",
                summary: "Storage systems",
                explanation: "Organization systems maintain decluttered environment while creating efficient storage that supports productivity and reduces wasted time.",
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
                name: "Design work area with proper setup",
                summary: "Create workspace",
                explanation: "Dedicated workspace improves professional productivity while creating boundaries between work and personal life that support mental health.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Arrange relaxation areas for stress relief",
                summary: "Relaxation areas",
                explanation: "Relaxation space design supports mental health while providing peaceful environment for rest that enhances professional performance.",
                timeframe: "1 week",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Reduce Environmental Impact",
        description: "Implement sustainable practices that reduce environmental footprint while saving money",
        icon: "leaf",
        explanation: "Environmental consciousness creates positive impact while often saving money through reduced consumption. Sustainable practices provide personal satisfaction and contribute to better world for everyone.",
        projects: [
          {
            name: "Sustainable Living Implementation",
            description: "Adopt practical sustainable practices that fit lifestyle and budget",
            explanation: "Sustainable practices reduce environmental impact while often providing cost savings through reduced consumption and waste.",
            tasks: [
              {
                name: "Implement energy and water conservation",
                summary: "Conservation measures",
                explanation: "Energy and water conservation reduces utility costs while decreasing environmental impact through reduced resource consumption.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Reduce waste and recycle more",
                summary: "Waste reduction",
                explanation: "Waste reduction saves money while reducing environmental impact through decreased consumption and better resource utilization.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Environmental Impact Expansion",
            description: "Expand sustainable practices and explore renewable energy options",
            explanation: "Expanding sustainability provides greater environmental impact while potentially offering long-term cost savings through renewable energy and efficiency.",
            tasks: [
              {
                name: "Research solar panels and efficient appliances",
                summary: "Renewable energy",
                explanation: "Renewable energy research identifies opportunities for environmental impact while potentially providing long-term cost savings and energy independence.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Share sustainable practices with others",
                summary: "Share sustainability",
                explanation: "Sharing sustainable practices multiplies environmental impact while inspiring others to adopt practices that benefit everyone long-term.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Declutter and Simplify",
        description: "Systematically reduce possessions and simplify life for greater peace and focus",
        icon: "close-circle",
        explanation: "Decluttering creates mental clarity and peace while reducing maintenance burden and costs. Simplified living provides more time and energy for important goals and relationships.",
        projects: [
          {
            name: "Systematic Decluttering Process",
            description: "Methodically reduce possessions and eliminate unnecessary complexity from life",
            explanation: "Systematic decluttering reduces mental burden while creating space for important priorities and reducing maintenance time and costs.",
            tasks: [
              {
                name: "Declutter one room weekly systematically",
                summary: "Declutter systematically",
                explanation: "Room-by-room decluttering creates manageable progress while reducing overwhelming feeling and ensuring thorough evaluation of possessions.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Sell, donate, or dispose items responsibly",
                summary: "Remove excess",
                explanation: "Responsible item removal provides potential income while helping others and reducing environmental impact through reuse and recycling.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Simplified Living Maintenance",
            description: "Maintain simplified environment and adopt purchasing habits that prevent re-accumulation",
            explanation: "Simplified living maintenance ensures long-term benefits while developing habits that prevent clutter return and support focused lifestyle.",
            tasks: [
              {
                name: "Use one-in-one-out policy for purchases",
                summary: "Maintain simplicity",
                explanation: "Mindful purchasing prevents clutter return while ensuring new acquisitions truly add value to life rather than creating maintenance burden.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Regularly evaluate and simplify possessions",
                summary: "Continue simplifying",
                explanation: "Regular simplification evaluation prevents complexity accumulation while ensuring life remains focused on important priorities and goals.",
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
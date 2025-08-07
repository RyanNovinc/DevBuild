// src/screens/Onboarding/data/countries/newzealand.js
// New Zealand-specific domain definitions with goals based on 2024-2025 research
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
        icon: "laptop",
        explanation: "New Zealand's tech sector is booming with incredible salary growth potential. Smart Kiwis are pivoting into development, data, and digital roles that pay significantly more than traditional jobs and offer flexible remote work options perfect for our lifestyle.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "development",
            name: "Software Development & Programming",
            description: "Learn coding and app development for New Zealand and international markets",
            projects: [
              {
                name: "Programming Skills Mastery",
                description: "Master in-demand programming languages and build practical projects",
                explanation: "Tech bootcamps are producing job-ready developers in 6 months. Focus on JavaScript and Python for maximum opportunities in Auckland's growing tech scene.",
                tasks: [
                  {
                    name: "Complete comprehensive coding bootcamp in JavaScript or Python",
                    summary: "Learn coding",
                    explanation: "Coding bootcamps provide intensive, job-ready training that gets you hired faster than traditional degrees. JavaScript and Python dominate job postings in Auckland and Wellington.",
                    timeframe: "6 months",
                    completed: false
                  },
                  {
                    name: "Build 3 portfolio projects solving New Zealand business problems",
                    summary: "Build portfolio",
                    explanation: "Portfolio projects demonstrate your ability to solve real problems with code. New Zealand-focused projects show employers you understand local market needs and Kiwi user challenges.",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Tech Job Market Entry",
                description: "Position yourself for junior developer roles in New Zealand tech companies",
                explanation: "Auckland fintech and SaaS companies pay $70K-90K for junior developers. Remote international roles offer even better USD salaries while living in beautiful New Zealand.",
                tasks: [
                  {
                    name: "Get cloud certification (AWS/Google)",
                    summary: "Get certified",
                    explanation: "Cloud certifications demonstrate advanced technical skills that New Zealand companies desperately need. These credentials often lead to immediate job offers with premium salaries.",
                    timeframe: "2 months",
                    completed: false
                  },
                  {
                    name: "Apply to Auckland tech companies and international remote positions",
                    summary: "Apply jobs",
                    explanation: "Auckland has the highest concentration of tech jobs in New Zealand, while remote positions offer USD salaries that provide excellent purchasing power in our economy.",
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
                explanation: "New Zealand businesses need digital marketing experts who understand local consumer behavior and payment systems like Paystation and POLi.",
                tasks: [
                  {
                    name: "Complete Google Ads and Facebook Marketing certifications",
                    summary: "Get marketing certs",
                    explanation: "Digital marketing certifications prove your expertise to Kiwi businesses investing heavily in online advertising. These skills are in high demand with excellent earning potential.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Launch e-commerce or social media campaign",
                    summary: "Run campaigns",
                    explanation: "Hands-on campaign experience demonstrates real results that New Zealand businesses can see and measure. Success stories become powerful portfolio pieces for landing higher-paying roles.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "E-commerce Business Setup",
                description: "Start profitable online business leveraging New Zealand market opportunities",
                explanation: "E-commerce is growing rapidly in New Zealand with improved payment systems and logistics. Smart marketers are building profitable businesses selling products and services.",
                tasks: [
                  {
                    name: "Set up e-commerce store with digital products",
                    summary: "Launch store",
                    explanation: "Digital products have no inventory costs and can be sold 24/7 to customers across New Zealand and Australia. This creates scalable income streams that grow while you sleep.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Scale to $3,000+ monthly revenue through marketing optimization",
                    summary: "Scale revenue",
                    explanation: "Reaching $3K monthly proves your business model works and creates substantial side income. This milestone often leads to full-time entrepreneurship or premium marketing roles.",
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
                explanation: "Banks and fintech companies need data analysts to make sense of customer behavior and business performance. These roles pay well and offer clear career progression in New Zealand.",
                tasks: [
                  {
                    name: "Get Google Data Analytics Certificate",
                    summary: "Data certification",
                    explanation: "Google's data certification is recognized by major New Zealand employers and teaches practical skills using real business datasets. The certification often leads to immediate job opportunities.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Build NZ business/economic data dashboard",
                    summary: "Build dashboard",
                    explanation: "Data dashboards showcase your ability to turn raw information into business insights. New Zealand-focused analysis demonstrates local market understanding that employers value highly.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Business Intelligence Career",
                description: "Apply data skills in consulting, banking, or fintech roles",
                explanation: "Data analysts earn $60K-80K in New Zealand financial services. The skills are transferable globally for international remote opportunities with USD salaries.",
                tasks: [
                  {
                    name: "Apply to NZ banks, fintech data roles",
                    summary: "Apply data jobs",
                    explanation: "New Zealand financial services companies are investing heavily in data-driven decision making. Your timing is perfect as demand for skilled analysts far exceeds supply.",
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
            explanation: "New Zealand's tech scene is thriving with companies desperately seeking skilled professionals. Getting the right skills now positions you for incredible career growth in our digital economy.",
            tasks: [
              {
                name: "Choose specialization and complete certification program",
                summary: "Get certified",
                explanation: "Specialization helps you stand out in New Zealand's growing tech market while building expertise employers will pay premium rates for in Auckland and Wellington.",
                timeframe: "4 months",
                completed: false
              },
              {
                name: "Build portfolio showcasing New Zealand market understanding",
                summary: "Build portfolio",
                explanation: "Projects that solve Kiwi business problems demonstrate market knowledge and practical skills that local employers value over generic international examples.",
                timeframe: "2 months",
                completed: false
              }
            ]
          },
          {
            name: "Tech Career Transition",
            description: "Network and apply for technology positions strategically",
            explanation: "Tech networking in Auckland and Wellington is supportive and collaborative. Building relationships often leads to job opportunities before they're publicly posted.",
            tasks: [
              {
                name: "Join Auckland/Wellington tech communities",
                summary: "Join community",
                explanation: "New Zealand tech community is incredibly welcoming to newcomers who show genuine interest in learning. Many job opportunities come through community connections rather than job boards.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Apply to fintech startups and remote roles",
                summary: "Apply strategically",
                explanation: "New Zealand fintech companies offer excellent career growth while international remote roles provide currency diversification and global experience perfect for Kiwis.",
                timeframe: "3 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Start Profitable Side Business",
        description: "Launch business leveraging New Zealand's entrepreneurial opportunities and lifestyle advantages",
        icon: "storefront",
        explanation: "Your entrepreneurial spirit perfectly suits New Zealand's business-friendly environment! Our country offers incredible opportunities in tourism, lifestyle businesses, and services. Smart Kiwis are building businesses that provide financial security while maintaining our famous work-life balance.",
        projects: [
          {
            name: "Business Opportunity Research",
            description: "Identify and validate profitable business opportunities in New Zealand market",
            explanation: "New Zealand's lifestyle focus creates opportunities in wellness, outdoor experiences, sustainable products, and professional services. Proper research prevents expensive mistakes while identifying profitable niches.",
            tasks: [
              {
                name: "Research NZ business opportunities",
                summary: "Research opportunity",
                explanation: "New Zealand market research reveals gaps in lifestyle services, sustainable products, tourism experiences, and digital tools that startups can profitably address with relatively low startup costs.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Validate business concept with 50+ potential customers",
                summary: "Validate concept",
                explanation: "Customer validation ensures you're solving real problems Kiwis will pay for. This step prevents wasting time and money on products nobody wants in our unique market.",
                timeframe: "2 months",
                completed: false
              }
            ]
          },
          {
            name: "Business Launch and Growth",
            description: "Execute business launch and scale to profitability",
            explanation: "New Zealand's supportive business environment and government grants help new ventures succeed. Focus on lifestyle-friendly models that can scale without sacrificing work-life balance.",
            tasks: [
              {
                name: "Launch minimum viable product and acquire first 100 customers",
                summary: "Launch MVP",
                explanation: "Starting small with MVP approach reduces risk while proving your business model works. First 100 customers provide valuable feedback for improvement and growth in the Kiwi market.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Scale to $5,000+ monthly revenue through strategic marketing",
                summary: "Scale revenue",
                explanation: "$5K monthly revenue proves business viability and creates substantial additional income. This milestone provides optionality for full-time entrepreneurship while maintaining lifestyle balance.",
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
        explanation: "Leadership opportunities are growing in New Zealand as our economy matures and companies expand. Your experience positions you perfectly for management roles that offer better compensation, job security, and the satisfaction of developing other Kiwis.",
        projects: [
          {
            name: "Leadership Skills Development",
            description: "Build management capabilities and demonstrate leadership potential",
            explanation: "New Zealand companies value leaders who understand our collaborative culture while bringing modern management practices that respect work-life balance and employee wellbeing.",
            tasks: [
              {
                name: "Complete leadership training program or management qualification",
                summary: "Leadership training",
                explanation: "Formal leadership training demonstrates commitment to management career path while providing frameworks for effective team leadership in New Zealand's collaborative business environment.",
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
            explanation: "Management roles in New Zealand offer significant salary increases and job security while maintaining our quality of life. Clear strategy maximizes promotion likelihood in our supportive business culture.",
            tasks: [
              {
                name: "Discuss promotion path with manager",
                summary: "Career discussion",
                explanation: "Proactive career conversations signal management ambition while enabling your manager to provide specific guidance and support for advancement opportunities in typical Kiwi fashion.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Apply for management roles in growing New Zealand companies and multinationals",
                summary: "Apply management",
                explanation: "External management applications provide leverage for internal promotion while creating backup options if promotion timeline doesn't meet your expectations.",
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
        description: "Save 6 months expenses in high-yield accounts for financial security",
        icon: "shield",
        explanation: "Economic uncertainty makes emergency funds essential for all Kiwis. Smart savers are using high-yield savings accounts and term deposits to build financial resilience while maintaining easy access to funds when unexpected expenses arise.",
        projects: [
          {
            name: "Emergency Fund Strategy",
            description: "Calculate target amount and set up systematic saving approach",
            explanation: "New Zealand professionals need emergency funds for comprehensive protection against job loss, health issues, or major home repairs that insurance doesn't cover.",
            tasks: [
              {
                name: "Calculate 6 months expenses and open high-yield savings accounts",
                summary: "Calculate fund",
                explanation: "Emergency fund calculation provides clear savings target while high-yield accounts maximize growth. Consider banks offering competitive rates for your emergency savings.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Set up automatic transfers to reach emergency fund target",
                summary: "Automate savings",
                explanation: "Automatic savings ensure consistent progress toward emergency fund goal while removing temptation to spend money on non-essential items during challenging economic periods.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Expense Management",
            description: "Optimize spending to maximize emergency fund contributions",
            explanation: "Strategic expense management helps New Zealand professionals save more despite rising costs of living while maintaining quality of life.",
            tasks: [
              {
                name: "Track expenses for one month and identify areas for cost reduction",
                summary: "Track expenses",
                explanation: "Expense tracking reveals spending patterns and opportunities for savings that can be redirected to emergency fund building and investment opportunities.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Negotiate better rates for recurring expenses like power, broadband, and insurance",
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
        description: "Build diversified investment strategy using New Zealand and international options",
        icon: "trending-up",
        explanation: "Inflation protection requires smart investing beyond traditional savings. Kiwi investors are using NZX shares, international funds, and investment platforms to build wealth while taking advantage of our favorable tax environment for long-term investing.",
        projects: [
          {
            name: "Investment Foundation",
            description: "Learn investment basics and choose appropriate platforms",
            explanation: "New Zealand investment landscape offers multiple options from NZX stocks to international investments through local platforms like Sharesies and InvestNow.",
            tasks: [
              {
                name: "Complete investment education course and choose investment platform",
                summary: "Learn investing",
                explanation: "Investment education provides foundation for making informed decisions while platform selection determines access to local and international investment opportunities with reasonable fees.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Start with $1,000 investment in diversified portfolio",
                summary: "Start investing",
                explanation: "Starting with modest amount reduces risk while building investment experience. Diversification across New Zealand and international stocks provides balanced growth potential.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Portfolio Growth Strategy",
            description: "Systematically build investment portfolio through regular contributions",
            explanation: "Consistent investment contributions leverage dollar-cost averaging to build long-term wealth despite market volatility while taking advantage of compound growth over time.",
            tasks: [
              {
                name: "Set up automatic monthly investment contributions of $500+",
                summary: "Automate investing",
                explanation: "Automatic investment contributions ensure consistent portfolio growth while taking advantage of market fluctuations through dollar-cost averaging strategies over the long term.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Review and rebalance portfolio quarterly based on performance",
                summary: "Manage portfolio",
                explanation: "Regular portfolio review ensures investments remain aligned with goals while rebalancing maintains appropriate risk levels for New Zealand economic conditions and your age.",
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
        explanation: "Multiple income streams provide security and faster progress toward financial goals. Kiwi professionals are successfully combining employment, side businesses, and investment income to build wealth while maintaining work-life balance.",
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
                explanation: "New Zealand professionals can earn $2,000-5,000 monthly through freelancing while maintaining full-time employment and work-life balance.",
                tasks: [
                  {
                    name: "Create professional profiles on Upwork, Fiverr, and local platforms",
                    summary: "Setup profiles",
                    explanation: "Professional freelancing profiles with strong portfolios attract high-paying international and local clients seeking New Zealand expertise and quality service delivery.",
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
                description: "Scale freelancing to consistent $3,000+ monthly income",
                explanation: "Successful New Zealand freelancers earn substantial monthly income through premium pricing and efficient service delivery systems that respect work-life balance.",
                tasks: [
                  {
                    name: "Develop premium service packages for higher-value clients",
                    summary: "Premium packages",
                    explanation: "Premium service packages command higher rates while attracting clients who value quality and expertise over lowest-cost providers, typical of New Zealand market preferences.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Build systems for consistent $3,000+ monthly freelancing income",
                    summary: "Scale systems",
                    explanation: "Systematic approach to freelancing enables predictable income growth while maintaining quality standards that keep clients returning for additional projects and referrals.",
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
                description: "Create and launch digital products targeting New Zealand and Australian markets",
                explanation: "Digital products offer scalable income potential with minimal ongoing costs once created and marketed effectively to our local market.",
                tasks: [
                  {
                    name: "Identify profitable digital product opportunity and create minimum viable product",
                    summary: "Create product",
                    explanation: "Digital products like courses, templates, and tools can be created once and sold repeatedly to New Zealand professionals seeking solutions to common problems.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Launch product and achieve $2,000+ monthly revenue",
                    summary: "Launch product",
                    explanation: "Successful digital product launch provides passive income stream while demonstrating entrepreneurial capabilities that enhance career prospects and financial security.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Digital Business Scaling",
                description: "Scale digital business through marketing optimization and product expansion",
                explanation: "Digital business scaling leverages New Zealand's growing digital adoption and our position in the Asia-Pacific region to build substantial income streams.",
                tasks: [
                  {
                    name: "Optimize marketing to reach $5,000+ monthly revenue",
                    summary: "Scale marketing",
                    explanation: "Marketing optimization increases customer acquisition while improving conversion rates, enabling rapid business growth and higher monthly revenue targets for financial security.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Expand product line and explore Australian market opportunities",
                    summary: "Expand business",
                    explanation: "Business expansion through additional products and Australian market access creates multiple revenue streams while building market presence and customer base.",
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
            description: "Build investment income through shares, bonds, and property investments",
            projects: [
              {
                name: "Investment Income Strategy",
                description: "Build portfolio generating consistent monthly investment income",
                explanation: "Dividend-paying shares and bonds provide monthly income while building long-term wealth through capital appreciation in New Zealand's stable market.",
                tasks: [
                  {
                    name: "Build dividend-focused investment portfolio targeting $1,000+ monthly income",
                    summary: "Dividend portfolio",
                    explanation: "Dividend-focused investing provides regular income while maintaining capital growth potential through well-managed New Zealand and international dividend-paying stocks.",
                    timeframe: "6 months",
                    completed: false
                  },
                  {
                    name: "Explore property investment trusts and bond opportunities",
                    summary: "Diversify income",
                    explanation: "REITs and bonds provide additional income streams with different risk profiles while diversifying investment portfolio beyond individual stocks for stability.",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Alternative Investment Exploration",
                description: "Investigate alternative investments including peer-to-peer lending and cryptocurrency",
                explanation: "Alternative investments provide additional diversification while potentially offering higher returns than traditional investment options available to New Zealand investors.",
                tasks: [
                  {
                    name: "Research cryptocurrency and international investment opportunities for New Zealand investors",
                    summary: "Crypto research",
                    explanation: "Cryptocurrency investments offer potential for significant returns while providing portfolio diversification, though requiring careful risk management and education.",
                    timeframe: "2 months",
                    completed: false
                  },
                  {
                    name: "Explore peer-to-peer lending and crowdfunding investment platforms",
                    summary: "P2P investing",
                    explanation: "Peer-to-peer lending platforms enable direct lending to individuals and businesses, providing higher interest rates than traditional savings accounts with managed risk.",
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
            explanation: "Strategic income planning ensures new streams complement rather than compete with primary employment while maintaining New Zealand work-life balance values.",
            tasks: [
              {
                name: "Assess current skills and identify monetization opportunities",
                summary: "Identify opportunities",
                explanation: "Skills assessment reveals natural income stream opportunities while ensuring new ventures leverage existing expertise for faster success and reduced learning curve.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Create timeline for developing chosen income stream",
                summary: "Plan timeline",
                explanation: "Structured timeline ensures income stream development receives adequate attention while maintaining primary employment performance and personal relationships.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Income Stream Execution",
            description: "Execute plan to develop and scale additional income source",
            explanation: "Consistent execution transforms income stream plans into financial reality that accelerates wealth building while maintaining lifestyle quality.",
            tasks: [
              {
                name: "Launch chosen income stream and track monthly revenue growth",
                summary: "Launch stream",
                explanation: "Revenue tracking provides feedback on income stream performance while enabling optimization for faster growth and higher monthly earnings toward financial goals.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Scale income stream to target monthly amount",
                summary: "Scale income",
                explanation: "Systematic scaling leverages successful income stream foundation to reach ambitious monthly targets while maintaining sustainable growth rates and work-life balance.",
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
        description: "Establish sustainable exercise habits that leverage New Zealand's outdoor lifestyle",
        icon: "barbell",
        explanation: "Regular fitness becomes even more important for maintaining energy and mental clarity needed for career success. Smart Kiwis are combining gym work with our incredible outdoor opportunities to stay fit while enjoying our beautiful environment.",
        projects: [
          {
            name: "Exercise Habit Foundation",
            description: "Create sustainable workout routine that works within New Zealand lifestyle",
            explanation: "Successful fitness in New Zealand leverages our outdoor opportunities while building strength and endurance through activities you actually enjoy and can maintain year-round.",
            tasks: [
              {
                name: "Choose 3 physical activities you enjoy and can do consistently in New Zealand's climate",
                summary: "Choose activities",
                explanation: "Selecting activities you genuinely enjoy ensures consistent fitness routine while taking advantage of New Zealand's outdoor opportunities and seasonal variety.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Schedule 30-minute exercise sessions 4 times per week around work and commitments",
                summary: "Schedule exercise",
                explanation: "Strategic exercise scheduling around work demands ensures fitness remains priority while accommodating professional responsibilities and social commitments typical of Kiwi lifestyle.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Fitness Community Building",
            description: "Connect with fitness communities for motivation, safety, and social connection",
            explanation: "New Zealand fitness communities provide support, safety, and motivation while making exercise more enjoyable through social connections and shared outdoor adventures.",
            tasks: [
              {
                name: "Join local gym, sports club, or outdoor group for social support and equipment access",
                summary: "Join fitness group",
                explanation: "Fitness communities provide accountability, safety for outdoor activities, and access to equipment while making exercise more enjoyable through social connections and group activities.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Track progress and celebrate fitness milestones with community support",
                summary: "Track progress",
                explanation: "Progress tracking and community celebration maintains motivation while providing visible evidence of fitness improvements and health benefits over time in supportive Kiwi environment.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Improve Mental Health",
        description: "Develop resilience and mental wellness strategies for work-life balance",
        icon: "heart",
        explanation: "Mental health awareness is growing in New Zealand, and developing resilience strategies helps maintain performance and relationships. Building mental wellness tools supports both career success and personal relationships while enjoying our relaxed Kiwi lifestyle.",
        projects: [
          {
            name: "Mental Wellness System",
            description: "Create comprehensive approach to managing stress and building resilience",
            explanation: "Effective mental health management becomes essential for maintaining professional performance while enjoying New Zealand's emphasis on work-life balance and personal wellbeing.",
            tasks: [
              {
                name: "Learn stress management techniques like meditation, mindfulness, or counselling",
                summary: "Learn wellness techniques",
                explanation: "Mental wellness techniques provide immediate relief during challenging situations while building long-term resilience for professional and personal success in New Zealand's supportive environment.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Establish daily 15-minute mental health routine for consistency",
                summary: "Daily routine",
                explanation: "Consistent mental health routine provides stability and emotional regulation while maintaining productivity and positive relationships essential for career and personal success.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Mental Health Support Network",
            description: "Build support network and access professional help when needed",
            explanation: "Strong support networks provide invaluable assistance during challenging times while professional mental health support addresses serious concerns through New Zealand's accessible healthcare system.",
            tasks: [
              {
                name: "Connect with friends, family, or counselors for regular emotional support",
                summary: "Build support",
                explanation: "Regular emotional support prevents isolation and provides perspective during challenging times while maintaining mental health essential for career success and personal relationships.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Access New Zealand mental health services when stress becomes overwhelming",
                summary: "Professional help",
                explanation: "Mental health monitoring enables early intervention while New Zealand's mental health services provide professional support before issues impact career performance and relationships.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Optimize Nutrition",
        description: "Improve diet quality using New Zealand's excellent local food while managing costs",
        icon: "nutrition",
        explanation: "Good nutrition supports energy and mental clarity needed for career success. Smart Kiwis are taking advantage of our excellent local produce and sustainable food systems to eat well while managing grocery costs through seasonal eating and meal planning.",
        projects: [
          {
            name: "Nutrition Strategy",
            description: "Develop cost-effective nutrition plan using seasonal New Zealand foods",
            explanation: "New Zealand's seasonal produce provides excellent nutrition at reasonable costs while supporting local food systems and maintaining energy levels needed for demanding work schedules.",
            tasks: [
              {
                name: "Plan healthy meals using seasonal New Zealand produce like vegetables, seafood, and lean meats",
                summary: "Plan nutrition",
                explanation: "Seasonal New Zealand ingredients provide excellent nutrition while supporting local food systems and reducing costs compared to imported processed foods.",
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
            description: "Build sustainable eating habits that support professional performance and wellbeing",
            explanation: "Consistent healthy eating provides stable energy and mental clarity essential for professional success while taking advantage of New Zealand's food quality and variety.",
            tasks: [
              {
                name: "Reduce processed foods and increase fresh New Zealand produce in daily meals",
                summary: "Improve diet",
                explanation: "Whole foods provide better nutrition and sustained energy while reducing health risks and supporting New Zealand's agricultural sector through local food choices.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Stay hydrated and maintain regular eating schedule despite work pressures",
                summary: "Maintain schedule",
                explanation: "Regular eating and hydration schedules maintain blood sugar stability and cognitive function essential for professional performance and decision making throughout busy days.",
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
        description: "Create and execute plan for meaningful wedding celebration within budget",
        icon: "heart",
        explanation: "Planning your dream wedding in New Zealand's stunning locations provides exciting opportunity to celebrate love while managing costs wisely. Many Kiwi couples are creating beautiful, meaningful celebrations that reflect our values without breaking the bank.",
        projects: [
          {
            name: "Wedding Planning Foundation",
            description: "Create realistic budget and timeline for dream wedding celebration",
            explanation: "Wedding planning requires balancing dreams with financial reality while taking advantage of New Zealand's incredible natural venues and talented local suppliers.",
            tasks: [
              {
                name: "Set wedding budget and timeline based on financial goals and priorities",
                summary: "Set budget",
                explanation: "Clear wedding budget prevents overspending while ensuring meaningful celebration that reflects your values and takes advantage of New Zealand's beautiful venues.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Research New Zealand venues and suppliers that align with budget and vision",
                summary: "Research vendors",
                explanation: "Local vendor research helps find suppliers who understand Kiwi wedding culture while providing excellent service within budget constraints for your special day.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Wedding Execution",
            description: "Execute wedding plans while managing stress and maintaining relationships",
            explanation: "Wedding execution requires organization and flexibility while maintaining focus on marriage celebration rather than just event planning stress.",
            tasks: [
              {
                name: "Coordinate with chosen vendors and manage wedding logistics systematically",
                summary: "Coordinate wedding",
                explanation: "Systematic wedding coordination ensures smooth celebration while managing details efficiently and maintaining excitement about marriage rather than just event stress.",
                timeframe: "6 months",
                completed: false
              },
              {
                name: "Enjoy wedding celebration and transition focus to building strong marriage",
                summary: "Celebrate marriage",
                explanation: "Wedding celebration marks beginning of marriage journey rather than end goal, with focus shifting to building strong partnership for lifelong happiness together.",
                timeframe: "Wedding day",
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
        explanation: "Family relationships provide crucial support and joy in life's journey. Many Kiwis are finding ways to strengthen family bonds despite busy schedules, creating deeper connections that enrich everyone's lives and provide stability during challenging times.",
        projects: [
          {
            name: "Family Connection Strategy",
            description: "Develop systematic approach to strengthening family relationships and communication",
            explanation: "Strong family relationships provide emotional foundation and practical support while honoring the importance of family in New Zealand culture and personal wellbeing.",
            tasks: [
              {
                name: "Schedule regular quality time with family members despite busy work schedule",
                summary: "Family time",
                explanation: "Regular family time maintains strong relationships while providing emotional support and cultural grounding essential during career building and life transitions in New Zealand.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Improve family communication and resolve any ongoing relationship tensions",
                summary: "Better communication",
                explanation: "Open family communication strengthens relationships while resolving conflicts that may have developed over time, creating more supportive family environment for everyone.",
                timeframe: "3 months",
                completed: false
              }
            ]
          },
          {
            name: "Family Support System",
            description: "Create mutual support system where family members help each other succeed",
            explanation: "Family support systems provide practical help and emotional encouragement while creating positive cycle of mutual assistance that benefits everyone's goals and wellbeing.",
            tasks: [
              {
                name: "Find ways to support family members through career success and life improvements",
                summary: "Support family",
                explanation: "Supporting family members demonstrates care while building family pride and creating positive relationships that provide mutual support during challenges and celebrations.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Create family traditions and shared experiences that strengthen bonds over time",
                summary: "Family traditions",
                explanation: "Family traditions create lasting memories while strengthening bonds that provide lifelong emotional support and sense of belonging essential for personal wellbeing.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Improve Romantic Relationship",
        description: "Strengthen partnership through better communication and shared experiences",
        icon: "heart",
        explanation: "Strong romantic relationships provide emotional support and shared joy while navigating life's challenges together. Many Kiwi couples are discovering that investing in relationship skills creates deeper connection and greater happiness for both partners.",
        projects: [
          {
            name: "Relationship Communication Enhancement",
            description: "Improve communication skills and emotional connection with romantic partner",
            explanation: "Relationship communication skills strengthen emotional bonds while creating foundation for working through challenges together and building shared future goals and dreams.",
            tasks: [
              {
                name: "Practice active listening and emotional vulnerability in relationship conversations",
                summary: "Better communication",
                explanation: "Communication skills create deeper emotional connection while building trust and understanding that strengthens relationship foundation for long-term happiness together.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Schedule regular date nights and relationship discussions about future goals",
                summary: "Quality time",
                explanation: "Regular quality time maintains romantic connection while ensuring both partners remain aligned on life goals and relationship priorities despite busy professional schedules.",
                timeframe: "Weekly",
                completed: false
              }
            ]
          },
          {
            name: "Shared Experience Building",
            description: "Create memorable experiences and work toward common goals together",
            explanation: "Shared experiences and common goals strengthen relationship bonds while creating positive memories that sustain partnership through challenges and changes over time.",
            tasks: [
              {
                name: "Plan romantic adventures and shared experiences that both partners enjoy",
                summary: "Shared adventures",
                explanation: "Romantic adventures create positive memories while discovering new aspects of each other and New Zealand, strengthening emotional connection and relationship satisfaction.",
                timeframe: "Monthly",
                completed: false
              },
              {
                name: "Align on major life goals and support each other's individual growth and success",
                summary: "Shared goals",
                explanation: "Aligned life goals create partnership strength while mutual support for individual growth ensures both partners continue developing while building life together successfully.",
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
        description: "Develop confident presentation and communication skills for career advancement",
        icon: "megaphone",
        explanation: "Public speaking skills dramatically enhance career prospects and personal confidence. Many Kiwi professionals find that mastering presentations and communication opens doors to leadership roles and creates opportunities for sharing expertise with others.",
        projects: [
          {
            name: "Public Speaking Skills Development",
            description: "Build fundamental presentation and communication skills through practice and training",
            explanation: "Public speaking mastery requires systematic skill building combined with regular practice in supportive environments that build confidence gradually over time.",
            tasks: [
              {
                name: "Join Toastmasters or similar speaking group for structured skill development",
                summary: "Join speaking group",
                explanation: "Toastmasters provides supportive environment for developing speaking skills while receiving constructive feedback from other members working on similar goals.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Practice presentations weekly and seek feedback for continuous improvement",
                summary: "Practice regularly",
                explanation: "Regular presentation practice builds confidence while feedback helps identify areas for improvement and tracks progress toward speaking mastery goals.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Advanced Communication Mastery",
            description: "Apply speaking skills in professional contexts and potentially teach others",
            explanation: "Advanced communication skills create career opportunities while enabling you to share knowledge and mentor others in professional and community settings.",
            tasks: [
              {
                name: "Volunteer for presentations at work and professional associations",
                summary: "Professional speaking",
                explanation: "Professional presentations build reputation while demonstrating expertise and communication skills that lead to leadership opportunities and career advancement.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Consider teaching or training opportunities that utilize speaking skills",
                summary: "Teaching others",
                explanation: "Teaching opportunities provide income potential while helping others develop skills, creating positive community impact and further developing your communication expertise.",
                timeframe: "6 months",
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
        explanation: "Continuous learning gives you competitive advantage in New Zealand's evolving economy. Smart Kiwis are acquiring skills that make them more valuable while opening new career opportunities and personal interests that enrich life.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "language",
            name: "Language Skills (Te Reo Māori, Mandarin, Spanish)",
            description: "Learn languages that provide cultural connection and business opportunities",
            projects: [
              {
                name: "Language Learning Foundation",
                description: "Build foundation in chosen language through structured learning approach",
                explanation: "Language skills open cultural connections and business opportunities while demonstrating commitment to personal development and cultural understanding.",
                tasks: [
                  {
                    name: "Enroll in language course and commit to daily practice routine",
                    summary: "Start learning",
                    explanation: "Structured language learning provides foundation while daily practice ensures steady progress toward conversational ability and cultural understanding.",
                    timeframe: "6 months",
                    completed: false
                  },
                  {
                    name: "Practice language through cultural activities and conversation partners",
                    summary: "Practice language",
                    explanation: "Language practice in cultural contexts builds fluency while creating connections with native speakers and deeper cultural understanding through authentic interactions.",
                    timeframe: "Ongoing",
                    completed: false
                  }
                ]
              },
              {
                name: "Language Application",
                description: "Apply language skills in professional or cultural contexts",
                explanation: "Language application creates opportunities for cultural connection and potential business advantages while deepening cultural understanding and personal growth.",
                tasks: [
                  {
                    name: "Use language skills in professional contexts or cultural events",
                    summary: "Apply professionally",
                    explanation: "Professional language application demonstrates cultural competency while creating business opportunities and showing respect for cultural diversity in New Zealand.",
                    timeframe: "1 year",
                    completed: false
                  },
                  {
                    name: "Consider language tutoring or cultural exchange opportunities",
                    summary: "Share language",
                    explanation: "Language tutoring creates income opportunities while helping others learn, creating positive community impact and further developing language skills through teaching.",
                    timeframe: "18 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "technical-skills",
            name: "Technical Skills (coding, design, digital tools)",
            description: "Master technical capabilities for career advancement and creativity",
            projects: [
              {
                name: "Technical Skill Development",
                description: "Learn technical skills through online courses and practical projects",
                explanation: "Technical skills provide career advancement opportunities while opening creative possibilities and potential for additional income through freelancing or entrepreneurship.",
                tasks: [
                  {
                    name: "Complete online course in chosen technical skill with hands-on projects",
                    summary: "Learn technical skill",
                    explanation: "Technical education combined with practical projects builds real-world competency while creating portfolio of work that demonstrates skills to employers or clients.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Apply technical skills to personal or professional projects",
                    summary: "Apply skills",
                    explanation: "Skill application in real projects builds expertise while creating tangible results that can be shared with employers or used for freelancing opportunities.",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Technical Skill Monetization",
                description: "Use technical skills for career advancement or additional income",
                explanation: "Technical skill monetization creates opportunities for career advancement and additional income while building reputation as skilled professional in chosen technical area.",
                tasks: [
                  {
                    name: "Use technical skills for promotion opportunities or new job applications",
                    summary: "Career advancement",
                    explanation: "Technical skills differentiate you from other candidates while enabling new career opportunities and promotion potential in New Zealand's growing digital economy.",
                    timeframe: "6 months",
                    completed: false
                  },
                  {
                    name: "Consider freelancing or consulting opportunities using technical skills",
                    summary: "Freelance opportunities",
                    explanation: "Technical skill freelancing creates additional income while building professional reputation and providing flexibility for work-life balance goals.",
                    timeframe: "1 year",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "creative-skills",
            name: "Creative Skills (music, art, writing, crafts)",
            description: "Develop artistic abilities for personal fulfillment and potential income",
            projects: [
              {
                name: "Creative Skill Development",
                description: "Learn creative skills through instruction and regular practice",
                explanation: "Creative skills provide personal fulfillment and stress relief while potentially creating opportunities for additional income through sales or teaching others.",
                tasks: [
                  {
                    name: "Take lessons or courses in chosen creative skill with regular practice schedule",
                    summary: "Learn creative skill",
                    explanation: "Creative education provides foundation while regular practice builds competency and personal satisfaction through artistic expression and skill development.",
                    timeframe: "6 months",
                    completed: false
                  },
                  {
                    name: "Create portfolio of creative work and share with others for feedback",
                    summary: "Build portfolio",
                    explanation: "Creative portfolio demonstrates skill development while sharing work builds confidence and potentially creates opportunities for sales or commissions from others.",
                    timeframe: "4 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Creative Skill Application",
                description: "Use creative skills for personal projects and potential income generation",
                explanation: "Creative skill application provides personal satisfaction while creating opportunities for income through sales, commissions, or teaching others your artistic abilities.",
                tasks: [
                  {
                    name: "Complete creative projects that demonstrate skill mastery and personal style",
                    summary: "Creative projects",
                    explanation: "Creative projects provide personal satisfaction while building portfolio that could lead to sales or commissions from people who appreciate your artistic work.",
                    timeframe: "Ongoing",
                    completed: false
                  },
                  {
                    name: "Explore income opportunities through art sales, commissions, or teaching",
                    summary: "Monetize creativity",
                    explanation: "Creative monetization provides additional income while sharing artistic skills with others who want to learn, creating positive community impact through artistic education.",
                    timeframe: "1 year",
                    completed: false
                  }
                ]
              }
            ]
          }
        ],
        projects: [
          {
            name: "Skill Development Planning",
            description: "Choose skill to develop and create structured learning approach",
            explanation: "Structured skill development ensures consistent progress while providing accountability for learning goals and professional development over time.",
            tasks: [
              {
                name: "Research skill options and choose one that aligns with interests and goals",
                summary: "Choose skill",
                explanation: "Skill selection based on interests and goals ensures sustained motivation while providing clear direction for learning efforts and time investment.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Create learning plan with timeline and practice schedule for skill mastery",
                summary: "Plan learning",
                explanation: "Learning plan provides structure while timeline creates accountability for consistent progress toward skill mastery and application goals.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Skill Mastery Execution",
            description: "Execute learning plan and apply new skill in practical contexts",
            explanation: "Skill application transforms learning into practical benefits while creating opportunities for career advancement and personal satisfaction through competency development.",
            tasks: [
              {
                name: "Follow learning plan consistently and track progress toward skill mastery",
                summary: "Learn consistently",
                explanation: "Consistent learning builds competency while progress tracking provides motivation and evidence of development for career advancement discussions and personal confidence.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Apply new skill in professional or personal projects for practical experience",
                summary: "Apply skill",
                explanation: "Skill application provides practical experience while creating tangible results that demonstrate competency and potentially lead to career or income opportunities.",
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
        explanation: "Reading provides knowledge and perspective essential for professional growth and personal enrichment. Successful Kiwi professionals invest in continuous learning through books while building mental clarity and decision-making skills that enhance all areas of life.",
        projects: [
          {
            name: "Reading Habit Foundation",
            description: "Create sustainable reading routine despite busy professional schedule",
            explanation: "Consistent reading habit provides ongoing education and mental stimulation while building knowledge foundation for career advancement and personal development goals.",
            tasks: [
              {
                name: "Set reading goal of 2 books monthly and create consistent reading schedule",
                summary: "Reading goal",
                explanation: "Regular reading schedule ensures consistent personal development while building knowledge base essential for professional growth and informed decision making in all life areas.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Choose mix of business, self-improvement, and fiction books for balanced development",
                summary: "Choose books",
                explanation: "Balanced book selection provides comprehensive personal development while building specific professional knowledge and general wisdom for life success and enjoyment.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Knowledge Application",
            description: "Apply reading insights to professional and personal improvement",
            explanation: "Knowledge application transforms reading into practical benefits while creating measurable improvement in professional performance and personal effectiveness through learned concepts.",
            tasks: [
              {
                name: "Keep reading journal to track insights and apply lessons learned",
                summary: "Reading journal",
                explanation: "Reading journal captures important insights while providing accountability for applying lessons learned to professional and personal improvement goals and daily decisions.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Share book insights with colleagues or friends for reinforcement and discussion",
                summary: "Share insights",
                explanation: "Sharing book insights reinforces learning while building reputation as thoughtful person who invests in continuous growth and intellectual development among peers.",
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
        description: "Explore New Zealand and international destinations through planned travel experiences",
        icon: "airplane",
        explanation: "Travel provides incredible experiences and perspective while taking advantage of New Zealand's amazing location for exploring the Pacific region. Smart planning enables amazing travel experiences while managing costs and maintaining work responsibilities.",
        projects: [
          {
            name: "Travel Planning System",
            description: "Create systematic approach to planning and budgeting for meaningful travel experiences",
            explanation: "Travel planning ensures memorable experiences while managing costs effectively and coordinating with work schedules for stress-free travel enjoyment.",
            tasks: [
              {
                name: "Set annual travel budget and plan 2-3 trips including domestic and international destinations",
                summary: "Plan travel",
                explanation: "Travel planning with clear budget ensures memorable experiences while managing costs and coordinating with work schedules for maximum enjoyment and minimal stress.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Research and book first planned trip to establish travel momentum",
                summary: "Book travel",
                explanation: "Concrete travel booking creates excitement and momentum while proving feasibility of travel goals and providing something positive to anticipate and enjoy.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Travel Experience Optimization",
            description: "Execute travel plans and maximize experiences through preparation and openness",
            explanation: "Travel execution with preparation and open mindset creates lasting memories while building cultural awareness and personal growth through new experiences.",
            tasks: [
              {
                name: "Prepare thoroughly for trips and remain open to spontaneous experiences",
                summary: "Travel preparation",
                explanation: "Travel preparation ensures smooth experiences while openness to spontaneity creates unexpected memories and learning opportunities that enrich life perspective.",
                timeframe: "Before each trip",
                completed: false
              },
              {
                name: "Document travel experiences and reflect on personal growth from adventures",
                summary: "Document travel",
                explanation: "Travel documentation preserves memories while reflection on experiences provides personal growth insights and appreciation for different cultures and perspectives encountered.",
                timeframe: "After each trip",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Pursue Creative Hobby",
        description: "Start artistic or creative pursuit that provides personal expression and relaxation",
        icon: "brush",
        explanation: "Creative hobbies provide essential stress relief and personal expression while developing skills that could become additional income sources. Many Kiwis find creativity improves problem-solving at work while providing satisfying personal accomplishments.",
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
                explanation: "Visual arts provide creative outlet while potentially developing skills for additional income through sales, commissions, or teaching others artistic techniques.",
                tasks: [
                  {
                    name: "Choose primary visual art focus and acquire basic equipment within budget",
                    summary: "Choose art form",
                    explanation: "Focusing on one visual art form enables skill development while managing costs through strategic equipment acquisition and gradual skill improvement over time.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Complete beginner course or tutorial series to build artistic foundation",
                    summary: "Learn basics",
                    explanation: "Art education provides technique foundation while connecting with local creative community that offers support and inspiration for continued artistic development.",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Creative Portfolio Development",
                description: "Create body of artistic work and explore potential for income generation",
                explanation: "Art portfolio demonstrates skill development while creating potential for income through sales, commissions, or teaching opportunities in local creative community.",
                tasks: [
                  {
                    name: "Create 10 pieces of art to build initial portfolio showcasing developing skills",
                    summary: "Build portfolio",
                    explanation: "Art portfolio showcases skill development while providing creative satisfaction and potential for income through sales to friends and local art markets or galleries.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Share artwork through social media or local exhibitions for community engagement",
                    summary: "Share artwork",
                    explanation: "Art sharing builds creative confidence while creating opportunities for sales and commissions that provide additional income and personal satisfaction through community appreciation.",
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
                explanation: "Musical skills provide creative expression while potentially creating opportunities for performance income, teaching others, and personal satisfaction through artistic achievement.",
                tasks: [
                  {
                    name: "Choose instrument or vocal focus and acquire basic equipment or lessons",
                    summary: "Choose music",
                    explanation: "Musical focus enables consistent skill development while providing creative outlet that reduces stress and builds personal accomplishment through artistic expression.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Practice regularly and learn 10 songs or compositions to build repertoire",
                    summary: "Learn songs",
                    explanation: "Regular musical practice builds skills while creating repertoire that enables performance opportunities and personal enjoyment through musical expression and creativity.",
                    timeframe: "6 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Musical Performance and Sharing",
                description: "Share musical skills through performance and potential teaching opportunities",
                explanation: "Musical performance builds confidence while creating potential for income through gigs, teaching, or entertainment services at events and community gatherings.",
                tasks: [
                  {
                    name: "Perform for friends, family, or local events to build musical confidence",
                    summary: "Perform music",
                    explanation: "Musical performance builds confidence while creating entertainment opportunities that strengthen social connections and potentially generate income from musical abilities.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Explore teaching music or performing at events for additional income opportunities",
                    summary: "Music income",
                    explanation: "Music monetization creates additional income streams while sharing musical skills with others who want to learn artistic expression and performance abilities.",
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
                description: "Improve writing abilities through practice and feedback from others",
                explanation: "Writing skills improve professional communication while providing creative outlet and potential for income through freelancing, blogging, and content creation opportunities.",
                tasks: [
                  {
                    name: "Start blog or journal writing practice to develop personal voice and style",
                    summary: "Start writing",
                    explanation: "Regular writing practice develops communication skills while providing creative outlet that improves professional writing and personal expression abilities over time.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Complete 20 written pieces (articles, poems, or stories) to build writing portfolio",
                    summary: "Build writing portfolio",
                    explanation: "Writing portfolio demonstrates skill development while creating content that can be monetized through freelancing, publication, or content creation opportunities.",
                    timeframe: "4 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Writing Income Development",
                description: "Monetize writing skills through freelancing and content creation opportunities",
                explanation: "Writing monetization creates additional income streams while building reputation as skilled communicator for career advancement and professional development opportunities.",
                tasks: [
                  {
                    name: "Submit writing to publications or start freelance writing services for clients",
                    summary: "Monetize writing",
                    explanation: "Writing monetization creates income opportunities while building professional reputation as skilled communicator that enhances career prospects and personal brand development.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Build writing-based income stream targeting $1,500+ monthly revenue",
                    summary: "Scale writing income",
                    explanation: "Writing income scaling provides substantial additional revenue while building expertise that creates ongoing freelancing and career opportunities for professional growth.",
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
            explanation: "Creative hobbies provide stress relief while developing skills that enhance personal satisfaction and potentially create income opportunities through artistic abilities.",
            tasks: [
              {
                name: "Research creative options and choose hobby that fits budget and schedule constraints",
                summary: "Choose hobby",
                explanation: "Hobby selection based on practical constraints ensures sustainable creative practice while providing stress relief and personal development opportunities that fit lifestyle.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Set up creative space and acquire basic equipment for chosen hobby pursuit",
                summary: "Setup creative space",
                explanation: "Creative space setup enables consistent practice while providing dedicated area for artistic expression and skill development in chosen creative hobby area.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Creative Skill Development",
            description: "Build competency in chosen creative area through consistent practice and learning",
            explanation: "Creative skill development provides personal satisfaction while building competency that creates opportunities for income and social connection through shared artistic interests.",
            tasks: [
              {
                name: "Practice creative hobby weekly and track skill improvement over time",
                summary: "Practice creativity",
                explanation: "Regular creative practice builds skills while providing stress relief and personal satisfaction that improves overall quality of life and mental health through artistic expression.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Connect with creative community for inspiration and potential collaboration opportunities",
                summary: "Creative community",
                explanation: "Creative community provides support and inspiration while creating opportunities for collaboration and potential income through joint projects, referrals, and artistic networking.",
                timeframe: "2 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Enjoy Recreation Time",
        description: "Schedule consistent leisure activities that provide relaxation and personal enjoyment",
        icon: "happy",
        explanation: "Regular recreation becomes essential for maintaining work-life balance and mental health while enjoying New Zealand's incredible lifestyle opportunities. Smart planning ensures you make the most of our beautiful country while building personal happiness.",
        projects: [
          {
            name: "Recreation Planning System",
            description: "Create systematic approach to scheduling and enjoying regular leisure activities in New Zealand",
            explanation: "Recreation planning ensures work-life balance while taking advantage of New Zealand's incredible natural beauty and recreational opportunities for personal enjoyment and stress relief.",
            tasks: [
              {
                name: "Schedule weekly leisure activities that take advantage of New Zealand's outdoor opportunities",
                summary: "Schedule recreation",
                explanation: "Regular recreation scheduling ensures work-life balance while taking advantage of New Zealand's natural beauty and outdoor opportunities for stress relief and personal enjoyment.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Plan monthly special activities or adventures with friends and family in New Zealand",
                summary: "Plan adventures",
                explanation: "Special monthly activities provide anticipation and memorable experiences while strengthening relationships and exploring New Zealand's incredible recreational opportunities together.",
                timeframe: "Monthly",
                completed: false
              }
            ]
          },
          {
            name: "Recreation Experience Optimization",
            description: "Maximize enjoyment of leisure time through mindful participation and variety",
            explanation: "Recreation optimization ensures maximum enjoyment while building positive memories and maintaining mental health through diverse leisure activities that suit New Zealand lifestyle.",
            tasks: [
              {
                name: "Try 3 new recreational activities this year to discover new interests and expand horizons",
                summary: "Try new activities",
                explanation: "Recreation variety prevents boredom while discovering new interests and potentially meeting like-minded people through diverse leisure activities available in New Zealand.",
                timeframe: "6 months",
                completed: false
              },
              {
                name: "Practice mindful enjoyment of recreational time without work-related distractions",
                summary: "Mindful recreation",
                explanation: "Mindful recreation ensures maximum relaxation and enjoyment while providing genuine stress relief from work pressures through fully present leisure participation.",
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
    name: "Purpose & Meaning",
    icon: "compass",
    color: "#ef4444", // Red
    description: "Finding fulfillment, contributing to causes, and living with intention",
    goals: [
      {
        name: "Give Back to Community",
        description: "Establish regular volunteer commitment using professional skills to help others",
        icon: "heart",
        explanation: "Giving back provides perspective and meaning while building professional networks and personal satisfaction. Many Kiwi professionals find community service creates unexpected opportunities and deep fulfillment while contributing to our caring society.",
        projects: [
          {
            name: "Community Service Setup",
            description: "Find meaningful volunteer opportunities that utilize professional skills effectively",
            explanation: "Skills-based volunteering provides maximum community impact while building professional experience and networking opportunities in supportive New Zealand community environment.",
            tasks: [
              {
                name: "Research New Zealand community organizations that need professional skills like yours",
                summary: "Research organizations",
                explanation: "Community research identifies organizations needing your professional expertise while ensuring volunteer work creates meaningful impact and skill development opportunities locally.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Commit to monthly volunteer service and establish consistent contribution schedule",
                summary: "Start volunteering",
                explanation: "Regular volunteer commitment creates meaningful community impact while building relationships and experience that enhance professional development and personal satisfaction in New Zealand.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Community Impact Development",
            description: "Expand community involvement and measure positive impact created through service",
            explanation: "Community impact measurement demonstrates value creation while building leadership experience and professional reputation for social responsibility in New Zealand society.",
            tasks: [
              {
                name: "Track volunteer impact and look for leadership opportunities within chosen organization",
                summary: "Track impact",
                explanation: "Impact tracking demonstrates community value while identifying leadership opportunities that build management experience and professional reputation through service.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Organize community initiatives or fundraising events to expand positive impact",
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
        name: "Find Life Purpose",
        description: "Define personal mission and align actions with core values and long-term vision",
        icon: "compass",
        explanation: "Clear life purpose provides direction and meaning while ensuring decisions align with personal values. Many Kiwis find that defining purpose creates greater satisfaction and helps navigate life's challenges with confidence and clarity.",
        projects: [
          {
            name: "Purpose Discovery Process",
            description: "Identify core values and develop personal mission statement for life direction",
            explanation: "Purpose discovery provides life direction while ensuring career and personal decisions align with values and long-term fulfillment goals rather than just external expectations.",
            tasks: [
              {
                name: "Reflect on values, strengths, and what gives your life meaning and deep satisfaction",
                summary: "Reflect on purpose",
                explanation: "Purpose reflection clarifies values and priorities while providing foundation for decision-making that leads to greater life satisfaction and career fulfillment over time.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Write personal mission statement and create action plan for purpose-driven living",
                summary: "Write mission",
                explanation: "Written mission statement provides clear life direction while action plan ensures daily decisions align with purpose and long-term fulfillment goals rather than just urgent demands.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Purpose-Driven Decision Making",
            description: "Align career and life choices with personal mission and core values consistently",
            explanation: "Purpose-driven decisions create greater life satisfaction while ensuring career choices support long-term fulfillment rather than just financial goals or external pressures.",
            tasks: [
              {
                name: "Evaluate current life and career alignment with personal mission and values",
                summary: "Evaluate alignment",
                explanation: "Mission alignment evaluation identifies areas for improvement while ensuring life choices support long-term fulfillment and personal values rather than just short-term gains.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Make specific changes to better align daily actions with personal purpose",
                summary: "Align actions",
                explanation: "Purpose alignment creates greater life satisfaction while ensuring career and personal decisions support long-term fulfillment and meaningful contribution to New Zealand society.",
                timeframe: "3 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Practice Mindfulness",
        description: "Develop mindfulness and meditation practices for greater self-awareness and peace",
        icon: "leaf",
        explanation: "Mindfulness practices provide mental clarity and emotional stability while reducing stress and improving decision-making abilities. Many Kiwis find meditation enhances both professional performance and personal relationships through increased awareness.",
        projects: [
          {
            name: "Mindfulness Foundation",
            description: "Establish regular mindfulness and meditation practice for daily life integration",
            explanation: "Mindfulness foundation provides mental stability and emotional regulation while improving focus and decision-making abilities essential for professional and personal success.",
            tasks: [
              {
                name: "Learn basic mindfulness techniques through apps, courses, or local meditation groups",
                summary: "Learn mindfulness",
                explanation: "Mindfulness education provides practical techniques for stress management while building foundation for regular practice that improves mental clarity and emotional stability.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Establish daily 10-15 minute mindfulness practice routine for consistency",
                summary: "Daily practice",
                explanation: "Daily mindfulness practice builds mental resilience while providing stress relief and improved focus that enhances professional performance and personal relationships.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Advanced Mindfulness Integration",
            description: "Integrate mindfulness into daily activities and potentially teach others",
            explanation: "Mindfulness integration enhances all life activities while potentially creating opportunities to help others develop these valuable mental health and performance skills.",
            tasks: [
              {
                name: "Apply mindfulness techniques to work activities and relationship interactions",
                summary: "Integrate mindfulness",
                explanation: "Mindfulness integration improves professional performance and relationship quality while providing practical stress management during challenging situations and decisions.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Consider sharing mindfulness knowledge through workplace wellness or community programs",
                summary: "Share mindfulness",
                explanation: "Mindfulness teaching creates positive community impact while deepening personal practice through helping others develop mental wellness and stress management skills.",
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
    name: "Environment & Organization",
    icon: "home",
    color: "#6366f1", // Indigo
    description: "Creating organized, comfortable living and working spaces",
    goals: [
      {
        name: "Organize Living Space",
        description: "Create efficient, organized home environment that supports productivity and wellbeing",
        icon: "grid",
        explanation: "Organized living space improves mental clarity and productivity while creating peaceful environment that supports both work and relaxation. Good organization also saves money by preventing lost items and improving efficiency.",
        projects: [
          {
            name: "Home Organization System",
            description: "Implement comprehensive organization system for all living areas systematically",
            explanation: "Home organization reduces stress while improving productivity and creating peaceful environment that supports professional success and personal wellbeing in daily life.",
            tasks: [
              {
                name: "Declutter all living areas systematically and organize belongings using structured approach",
                summary: "Declutter home",
                explanation: "Home decluttering creates peaceful environment while improving organization and reducing stress that supports professional productivity and personal wellbeing daily.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Implement storage solutions and organization systems for long-term maintenance and efficiency",
                summary: "Storage systems",
                explanation: "Organization systems maintain decluttered environment while creating efficient storage that supports productivity and reduces time wasted searching for needed items.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Productive Environment Design",
            description: "Create home workspace and relaxation areas optimized for different activities and needs",
            explanation: "Environment design supports both work productivity and personal relaxation while creating spaces that enhance professional and personal effectiveness throughout the day.",
            tasks: [
              {
                name: "Design dedicated work area with proper lighting, seating, and organization for productivity",
                summary: "Create workspace",
                explanation: "Dedicated workspace improves professional productivity while creating boundaries between work and personal life that support mental health and work-life balance.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Arrange relaxation areas that promote rest and stress relief for mental health",
                summary: "Relaxation areas",
                explanation: "Relaxation space design supports mental health while providing peaceful environment for rest that enhances professional performance and personal wellbeing throughout each day.",
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
        explanation: "Environmental sustainability aligns with New Zealand values while often reducing costs through efficient resource use. Many Kiwis find that sustainable practices provide both environmental benefits and financial savings over time.",
        projects: [
          {
            name: "Sustainability Assessment and Planning",
            description: "Evaluate current environmental impact and develop improvement plan within budget",
            explanation: "Sustainability assessment identifies opportunities for environmental improvement while ensuring cost-effective implementation that provides both environmental and financial benefits.",
            tasks: [
              {
                name: "Assess current environmental impact and research affordable sustainability improvements",
                summary: "Impact assessment",
                explanation: "Environmental assessment identifies specific areas for improvement while research ensures cost-effective sustainability solutions that provide meaningful environmental benefits within budget constraints.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Implement priority sustainability improvements starting with highest-impact, lowest-cost changes",
                summary: "Implement changes",
                explanation: "Sustainability implementation prioritizes highest-impact improvements while managing costs through strategic selection of most effective environmental protection measures available.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Ongoing Sustainability Management",
            description: "Maintain sustainable practices and explore advanced environmental improvements over time",
            explanation: "Sustainability maintenance ensures ongoing environmental benefits while exploring advanced improvements that provide greater environmental protection and potential cost savings.",
            tasks: [
              {
                name: "Monitor sustainability practices and track environmental and financial benefits achieved",
                summary: "Monitor progress",
                explanation: "Sustainability monitoring ensures ongoing effectiveness while tracking both environmental and financial benefits provides motivation for continued environmental stewardship.",
                timeframe: "Quarterly",
                completed: false
              },
              {
                name: "Explore advanced sustainability improvements like solar power or electric vehicle options",
                summary: "Advanced sustainability",
                explanation: "Advanced sustainability improvements provide greater environmental benefits while potentially offering significant long-term cost savings through renewable energy and efficient technologies.",
                timeframe: "1 year",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Declutter and Simplify",
        description: "Create minimalist living approach that focuses on essential items and experiences",
        icon: "resize",
        explanation: "Decluttering and simplifying life reduces stress while focusing on what truly matters for happiness and success. Many Kiwis find that minimalist approaches create more time and mental space for important goals and relationships.",
        projects: [
          {
            name: "Decluttering System Implementation",
            description: "Systematically remove unnecessary items and simplify living environment for clarity",
            explanation: "Decluttering system creates peaceful living environment while reducing maintenance burden and focusing attention on items and activities that truly add value to life.",
            tasks: [
              {
                name: "Sort through all possessions systematically and keep only items that add genuine value",
                summary: "Sort possessions",
                explanation: "Systematic possession sorting creates peaceful environment while focusing on items that genuinely add value, reducing maintenance burden and mental clutter from excess belongings.",
                timeframe: "3 weeks",
                completed: false
              },
              {
                name: "Establish systems for preventing future clutter accumulation and maintaining simplicity",
                summary: "Prevent clutter",
                explanation: "Clutter prevention systems maintain simplified environment while ensuring new possessions align with values and genuine needs rather than impulse purchases or social pressures.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Lifestyle Simplification",
            description: "Extend simplification to activities and commitments for greater focus and balance",
            explanation: "Lifestyle simplification creates time and mental space for important goals while reducing overwhelm from excessive commitments that don't align with core values and priorities.",
            tasks: [
              {
                name: "Evaluate commitments and activities, keeping only those aligned with core values and goals",
                summary: "Simplify commitments",
                explanation: "Commitment evaluation creates time for important goals while reducing overwhelm from activities that don't align with core values and long-term success priorities.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Create decision-making framework for future commitments to maintain simplified lifestyle",
                summary: "Decision framework",
                explanation: "Decision framework maintains simplified lifestyle while ensuring future commitments align with values and goals rather than social pressure or fear of missing out.",
                timeframe: "1 week",
                completed: false
              }
            ]
          }
        ]
      }
    ]
  }
];
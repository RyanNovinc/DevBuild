// src/screens/Onboarding/data/countries/canada.js
// Canada-specific domain definitions with refined goals based on 2024-2025 research
export const DOMAIN_DEFINITIONS = [
  {
    name: "Career & Work",
    icon: "briefcase",
    color: "#3b82f6", // Blue
    description: "Professional advancement, workplace goals, career development",
    goals: [
      {
        name: "Master In-Demand Tech Skills",
        description: "Develop technology capabilities essential for Canada's digital transformation",
        icon: "laptop",
        explanation: "305,000+ tech workers needed by 2024. AI and machine learning skills command 35% salary premiums with federal government investing $2.5 billion in digital skills development.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "ai-ml",
            name: "AI & Machine Learning Applications",
            description: "Learn practical AI tools and machine learning fundamentals",
            projects: [
              {
                name: "AI Tools Mastery for Canadian Market",
                description: "Master practical AI applications essential for Canada's digital transformation",
                explanation: "AI skills command 35% salary premiums. Federal government investing $2.5 billion in digital skills development with focus on AI capabilities.",
                tasks: [
                  {
                    name: "Complete IBM AI Professional Certificate or Google AI Course focusing on business applications",
                    summary: "Get AI certified",
                    explanation: "IBM and Google AI certificates are highly recognized by Canadian employers and provide practical skills for immediate workplace application. These programs focus on business value creation rather than purely technical implementation.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Build AI-powered project solving Canadian business problem (bilingual support, seasonal planning, etc.)",
                    summary: "Build AI project",
                    explanation: "Canadian-specific AI projects demonstrate understanding of local market needs like bilingual support and seasonal variations. These projects create portfolio pieces that resonate with Canadian employers and show practical application skills.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Machine Learning Career Application",
                description: "Apply ML skills in Canadian job context with portfolio development",
                explanation: "305,000+ tech workers needed by 2024. ML skills particularly valuable in finance, healthcare, and resource sectors dominant in Canadian economy.",
                tasks: [
                  {
                    name: "Create ML portfolio with projects relevant to Canadian industries (energy, finance, healthcare)",
                    summary: "ML portfolio",
                    explanation: "Portfolio projects targeting Canada's dominant industries (energy, finance, healthcare) demonstrate sector-specific knowledge and increase appeal to Canadian employers. These industries offer highest ML salary premiums and job security.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Network with Canadian AI/ML community through Vector Institute events and job placement programs",
                    summary: "Network AI",
                    explanation: "Vector Institute is Canada's premier AI research organization with strong industry connections. Networking through their events provides access to Canada's AI ecosystem and often leads to job opportunities with leading tech companies.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "cloud-cybersecurity",
            name: "Cloud Computing & Cybersecurity",
            description: "Master cloud platforms and security analysis skills",
            projects: [
              {
                name: "Cloud Platform Certification",
                description: "Earn industry-recognized cloud computing credentials for Canadian market",
                explanation: "Cloud computing jobs grew 37% in Canada. Major Canadian companies migrating to cloud, creating high demand for certified professionals.",
                tasks: [
                  {
                    name: "Complete AWS Cloud Practitioner or Microsoft Azure Fundamentals certification",
                    summary: "Cloud certified",
                    explanation: "AWS and Azure certifications are in high demand by Canadian companies migrating to cloud infrastructure. These entry-level certifications provide foundation for higher-paying cloud architect and engineer roles.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Build cloud infrastructure project demonstrating cost optimization and scalability",
                    summary: "Cloud project",
                    explanation: "Hands-on cloud projects demonstrate practical skills that Canadian employers value beyond theoretical certification knowledge. Cost optimization focus addresses key business concern for cloud adoption decisions.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Cybersecurity Expertise Development", 
                description: "Develop cybersecurity skills addressing Canadian digital protection needs",
                explanation: "Cybersecurity is critical for Canadian businesses and government. Strong job security with average salaries $70,000-$120,000 CAD.",
                tasks: [
                  {
                    name: "Complete CompTIA Security+ or CISSP certification focusing on Canadian compliance requirements",
                    summary: "Security cert",
                    explanation: "Security certifications command $70,000-$120,000 CAD salaries with excellent job security. Focus on Canadian compliance (PIPEDA, provincial regulations) makes you valuable for local organizations.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Conduct security assessment for local Canadian business or organization",
                    summary: "Security audit",
                    explanation: "Real-world security assessment experience provides practical portfolio pieces while building relationships with local Canadian businesses. Many small/medium businesses need affordable security expertise.",
                    timeframe: "1 month",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "data-analytics",
            name: "Data Analytics & Business Intelligence",
            description: "Develop data analysis and business intelligence capabilities",
            projects: [
              {
                name: "Canadian Data Analytics Certification",
                description: "Master data analysis tools essential for Canadian business intelligence",
                explanation: "Data analytics crucial for Canadian sectors like finance, retail, and resources. Strong demand for bilingual data professionals.",
                tasks: [
                  {
                    name: "Complete Google Data Analytics Certificate or IBM Data Science certification",
                    summary: "Data certified",
                    explanation: "Google and IBM data certifications are recognized by Canadian employers and often lead to job placement assistance. These programs provide hands-on experience with tools used by Canadian businesses.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Master SQL, Python, and Tableau with focus on Canadian business data challenges",
                    summary: "Master tools",
                    explanation: "SQL, Python, and Tableau are core requirements for Canadian data analyst roles. Focus on Canadian business challenges like bilingual data, regional variations, and seasonal patterns increases relevance to employers.",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Business Intelligence Portfolio",
                description: "Create BI solutions addressing real Canadian market needs",
                explanation: "Canadian businesses need data insights for seasonal patterns, regional variations, and bilingual market analysis.",
                tasks: [
                  {
                    name: "Build BI dashboard analyzing Canadian market data (e.g., housing, retail, seasonal trends)",
                    summary: "Build dashboard",
                    explanation: "Canadian market analysis projects demonstrate understanding of local business environment and data patterns. Housing, retail, and seasonal trend analysis addresses key areas of Canadian business interest.",
                    timeframe: "2 months",
                    completed: false
                  },
                  {
                    name: "Present data insights to Canadian business network and document business impact",
                    summary: "Present insights",
                    explanation: "Presenting to Canadian business networks builds professional reputation and demonstrates communication skills. Documenting business impact provides evidence of value creation for future employers.",
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
            name: "Strategic Tech Skill Development",
            description: "Master high-demand technology skills for Canadian job market",
            explanation: "Tech job postings grew 22-37% across key areas. Skills like cloud computing, cybersecurity, and data analytics essential across all sectors, not just tech companies.",
            tasks: [
              {
                name: "Research certification programs for your chosen tech focus area and enroll in reputable provider",
                summary: "Research certs",
                explanation: "Canadian employers increasingly value industry certifications over formal degrees for tech roles. Research helps identify which certifications have strongest recognition and job placement rates in Canadian market.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Complete foundational courses and earn first industry-recognized certification",
                summary: "Get certified",
                explanation: "Industry-recognized certifications provide credible evidence of technical skills to Canadian employers. First certification often leads to immediate job opportunities or internal promotions with salary increases.",
                timeframe: "4 months",
                completed: false
              }
            ]
          },
          {
            name: "Tech Skills Application and Portfolio",
            description: "Apply new skills in work context and build professional portfolio",
            explanation: "Many programs offer job guarantees or placement assistance. Building portfolio demonstrates practical skills to Canadian employers.",
            tasks: [
              {
                name: "Create portfolio showcasing projects and skills learned in chosen tech area",
                summary: "Build portfolio",
                explanation: "Technical portfolios provide tangible evidence of capabilities that complement certifications. Canadian employers value practical demonstration of skills through completed projects and real-world applications.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Network with Canadian tech professionals and apply tech skills in current role",
                summary: "Network & apply",
                explanation: "Canadian tech community is collaborative and supportive for career growth. Applying new skills in current role demonstrates value while networking opens doors to new opportunities and mentorship.",
                timeframe: "3 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Achieve 3.5%+ Salary Increase",
        description: "Exceed national average salary growth to gain real purchasing power",
        icon: "trending-up",
        explanation: "2025 salary projections average 3.4-3.6% nationally with inflation at 2.4%. Tech professionals expect 4.3% increases, professional services 3.7%, finance 3.6%.",
        projects: [
          {
            name: "Performance-Based Salary Strategy",
            description: "Build case for salary increase through documented performance and market research",
            explanation: "Exceeding 3.4-3.6% national threshold provides real purchasing power gains when 48% of Gen Z and 46% of millennials feel financially insecure.",
            tasks: [
              {
                name: "Research salary benchmarks for your role and industry in Canadian markets",
                summary: "Research salary",
                explanation: "Canadian salary data varies significantly by province and industry. Research provides evidence for negotiations and helps identify markets where your skills command premium compensation.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Document achievements and prepare compelling case for salary increase exceeding 3.5%",
                summary: "Prepare case",
                explanation: "Documented achievements provide objective evidence for salary negotiations. Exceeding 3.5% national average ensures real purchasing power gains and keeps pace with Canadian cost of living increases.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Strategic Career Advancement",
            description: "Position for promotion or strategic job change to achieve salary growth",
            explanation: "This goal becomes actionable through performance reviews, skill certifications, or strategic job changes that leverage current market conditions.",
            tasks: [
              {
                name: "Identify specific advancement opportunities within current organization or industry",
                summary: "Find opportunities",
                explanation: "Canadian job market rewards internal advancement and industry expertise. Identifying specific opportunities allows strategic skill development and positioning for promotions or lateral moves with salary increases.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Develop high-value skills that command higher compensation in Canadian job market",
                summary: "Develop skills",
                explanation: "Skills like AI, data analysis, and bilingual capability command salary premiums in Canadian market. Strategic skill development creates competitive advantage and justifies compensation increases.",
                timeframe: "6 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Secure Flexible Work Arrangement",
        description: "Negotiate hybrid or remote work options for optimal work-life integration",
        icon: "home",
        explanation: "95% of young professionals say work-life balance is important. 29% of new job postings offer hybrid work and 12% fully remote positions.",
        projects: [
          {
            name: "Flexible Work Negotiation",
            description: "Secure hybrid or remote work arrangements with current employer",
            explanation: "80% of remote workers want to spend at least half their time working from home, directly addressing mental health challenges where only 52% of Gen Z rate wellbeing as good.",
            tasks: [
              {
                name: "Research your company's flexible work policy and document productivity benefits",
                summary: "Research policy",
                explanation: "Understanding existing policy provides foundation for negotiation and identifies opportunities for arrangement that benefits both employee and employer. Productivity documentation strengthens your case.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Prepare proposal highlighting how flexible work supports both performance and wellbeing",
                summary: "Prepare proposal",
                explanation: "Well-prepared proposals addressing employer concerns about productivity and collaboration increase likelihood of approval. Focus on business benefits and specific arrangements builds confidence in your professionalism.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Remote Work Optimization",
            description: "Build skills and systems that make remote work highly effective",
            explanation: "Demonstrating excellence in remote work makes flexible arrangements more sustainable and creates competitive advantage in evolving Canadian workplace.",
            tasks: [
              {
                name: "Set up optimal home office space and master remote collaboration tools",
                summary: "Setup office",
                explanation: "Professional home office setup demonstrates commitment to remote work success and qualifies for tax deductions. Mastering collaboration tools ensures seamless team integration and productivity.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Develop time management and communication systems that excel in flexible work environment",
                summary: "Develop systems",
                explanation: "Effective remote work systems prove your capability to maintain high performance in flexible arrangements. Strong systems build manager confidence and support long-term arrangement sustainability.",
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
    name: "Financial Security",
    icon: "cash",
    color: "#10b981", // Green
    description: "Building wealth, managing expenses, and achieving financial goals",
    goals: [
      {
        name: "Build $15,000 Emergency Fund",
        description: "Save four months of expenses using high-interest accounts and disciplined budgeting",
        icon: "shield",
        explanation: "60% of young Canadians live paycheck-to-paycheck. This target represents approximately four months of expenses for median earners - enough to weather job transitions.",
        projects: [
          {
            name: "Emergency Fund Strategy",
            description: "Calculate target amount and set up systematic savings approach",
            explanation: "High-interest savings accounts earn 2.85-3.7% and Financial Consumer Agency strongly recommends emergency reserves for stability during economic uncertainty.",
            tasks: [
              {
                name: "Calculate four months of essential expenses to determine your $15,000 emergency fund target",
                summary: "Calculate fund",
                explanation: "Four months of expenses provides sufficient buffer for job transitions and unexpected costs while being achievable for median Canadian earners. Calculating exact needs ensures realistic target setting.",
                timeframe: "1 day",
                completed: false
              },
              {
                name: "Open high-interest savings account and set up automatic weekly transfers",
                summary: "Setup savings",
                explanation: "High-interest savings accounts earning 2.85-3.7% maximize emergency fund growth while maintaining accessibility. Automatic transfers ensure consistent progress without relying on willpower or memory.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Expense Optimization for Savings",
            description: "Reduce unnecessary spending to maximize emergency fund contributions",
            explanation: "Average $450/month savings achievable through expense reduction. This goal transforms financial anxiety into systematic security building over 2-3 years.",
            tasks: [
              {
                name: "Track all expenses for one month to identify spending patterns and reduction opportunities",
                summary: "Track expenses",
                explanation: "Expense tracking reveals unconscious spending patterns and identifies easy wins for cost reduction. Most people discover $200-400 monthly in unnecessary expenses that can be redirected to savings.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Cancel or reduce subscription services and recurring expenses you don't actively use",
                summary: "Cut subscriptions",
                explanation: "Subscription audits often reveal $50-200 monthly in forgotten or underused services. Canceling unused subscriptions provides immediate monthly savings that compound over time toward financial goals.",
                timeframe: "1 week",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Save $25,000 Down Payment for Home",
        description: "Build foundation for homeownership despite challenging housing market",
        icon: "home",
        explanation: "72% of millennials want homeownership but 46% think it's unrealistic. This covers 5% minimum down payment on $500,000 home, making it achievable first milestone.",
        projects: [
          {
            name: "Government Program Optimization",
            description: "Maximize First Home Savings Account and buyer programs for down payment",
            explanation: "Home Buyers' Plan allows $60,000 RRSP withdrawal, First Home Savings Account provides $40,000 contribution room, 30-year amortizations now available for first-time buyers.",
            tasks: [
              {
                name: "Open First Home Savings Account and maximize annual contributions for tax-free home savings",
                summary: "Open FHSA",
                explanation: "FHSA provides $40,000 contribution room with tax deduction benefits and tax-free withdrawals for home purchases. This unique Canadian program significantly accelerates down payment savings.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Research First Home Owner programs and down payment assistance in target provinces",
                summary: "Research programs",
                explanation: "Provincial programs vary significantly across Canada and can provide substantial down payment assistance or reduced qualification requirements. Research helps maximize available government support.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Strategic Down Payment Savings",
            description: "Create systematic plan to accumulate $25,000 for home purchase",
            explanation: "New government programs enhance feasibility, making homeownership an achievable milestone with strategic planning over 2-3 years.",
            tasks: [
              {
                name: "Calculate monthly savings needed to reach $25,000 target within your timeline",
                summary: "Calculate savings",
                explanation: "Clear monthly savings target makes homeownership goal concrete and achievable. Breaking down large goal into monthly actions prevents overwhelm while tracking progress toward major milestone.",
                timeframe: "1 day",
                completed: false
              },
              {
                name: "Set up dedicated down payment savings account with automatic transfers",
                summary: "Setup account",
                explanation: "Dedicated account prevents down payment funds from being used for other expenses while automatic transfers ensure consistent progress. Separate account creates psychological commitment to homeownership goal.",
                timeframe: "1 week",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Pay Off $10,000 Student Debt",
        description: "Eliminate manageable portion of student loans for improved cash flow",
        icon: "card",
        explanation: "Average debt load $28,000-32,000 takes 9.5 years to repay. Federal student loan interest at 2.45% affects 1.7 million Canadians, causes 17.6% of Ontario insolvencies.",
        projects: [
          {
            name: "Strategic Debt Repayment Plan",
            description: "Create systematic approach to pay off $10,000 of student debt",
            explanation: "Even partial repayment provides psychological relief and improved cash flow, transformative for financial confidence and life decision-making.",
            tasks: [
              {
                name: "List all student debts with balances and interest rates to prioritize repayment strategy",
                summary: "List debts",
                explanation: "Complete debt inventory provides clarity on repayment priorities and enables strategic planning. Understanding interest rates helps focus efforts on highest-cost debt for maximum financial impact.",
                timeframe: "1 day",
                completed: false
              },
              {
                name: "Create monthly payment plan to eliminate $10,000 of highest-priority student debt",
                summary: "Payment plan",
                explanation: "Systematic payment plan makes debt elimination achievable and measurable. Focusing on $10,000 portion provides manageable target while creating meaningful cash flow improvement.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Cash Flow Optimization",
            description: "Use debt reduction to improve monthly cash flow and financial flexibility",
            explanation: "Student debt significantly delays major life decisions. Reducing debt load creates financial breathing room for other goals and opportunities.",
            tasks: [
              {
                name: "Calculate monthly cash flow improvement from paying off targeted debt amount",
                summary: "Calculate flow",
                explanation: "Understanding cash flow improvement provides motivation and enables planning for redirected funds. Calculating specific monthly benefit demonstrates tangible value of debt elimination effort.",
                timeframe: "1 day",
                completed: false
              },
              {
                name: "Plan how to redirect debt payments toward other financial goals once target is reached",
                summary: "Redirect plan",
                explanation: "Planning fund redirection prevents lifestyle inflation and maximizes debt elimination benefits. Having clear plan for freed cash flow maintains financial momentum toward other goals.",
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
    name: "Health & Wellness",
    icon: "fitness",
    color: "#06b6d4", // Cyan
    description: "Physical fitness, mental health, nutrition, and overall wellbeing",
    goals: [
      {
        name: "Develop Sustainable Mental Health Practices",
        description: "Build comprehensive mental wellness support using Canadian healthcare resources",
        icon: "happy",
        explanation: "42% of employees rate wellbeing as fair or poor. 24% experience constant burnout. Federal government investing $500 million in youth mental health programs.",
        projects: [
          {
            name: "Mental Health Support System",
            description: "Access Canada's mental health resources and build emotional resilience",
            explanation: "Universal healthcare covers basic mental health services and workplace cultures increasingly support mental wellness initiatives with growing societal acceptance.",
            tasks: [
              {
                name: "Connect with mental health resources through Canada's healthcare system or employee benefits",
                summary: "Find resources",
                explanation: "Universal healthcare covers basic mental health services while many employers provide additional EAP benefits. Accessing available resources reduces financial barriers to mental health support.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Establish regular therapy or counseling routine and develop daily wellness practices",
                summary: "Start therapy",
                explanation: "Regular therapy provides consistent support for mental health maintenance and growth. Combined with daily wellness practices, creates comprehensive approach to emotional well-being and stress management.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Stress Management Integration",
            description: "Create daily practices that manage work stress and prevent burnout",
            explanation: "Mental health crisis affects 70% who don't get recommended sleep amounts. Proactive stress management essential for sustainable success.",
            tasks: [
              {
                name: "Identify stress triggers and develop specific coping strategies for each",
                summary: "Manage stress",
                explanation: "Understanding personal stress triggers enables proactive management rather than reactive responses. Specific coping strategies for each trigger create toolbox for maintaining mental health under pressure.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Create daily routines that help transition between work and personal life",
                summary: "Work routines",
                explanation: "Transition rituals help your brain shift between work and personal modes, especially important for remote workers. Clear boundaries reduce stress and improve focus in both work and personal activities.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Functional Strength and Mobility",
        description: "Develop practical fitness that supports everyday activities and long-term health",
        icon: "barbell",
        explanation: "76% of millennials consider themselves active but cardiorespiratory fitness declining nationally. Focus on functional movement over aesthetic goals.",
        projects: [
          {
            name: "Functional Fitness Foundation",
            description: "Build strength and mobility that improves daily quality of life",
            explanation: "Functional fitness addresses Canada's aging demographic concerns while supporting preventive health approach of universal healthcare system.",
            tasks: [
              {
                name: "Choose 3 physical activities focusing on functional movement you can do consistently",
                summary: "Choose activities",
                explanation: "Functional movement activities improve daily quality of life and long-term health while being more sustainable than purely aesthetic fitness goals. Consistency matters more than intensity for health benefits.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Schedule 150+ minutes of moderate exercise weekly meeting national health guidelines",
                summary: "Schedule exercise",
                explanation: "Meeting Health Canada's 150-minute guideline reduces risk of chronic disease and improves mental health. Scheduling exercise like appointments increases consistency and prioritizes health in busy schedules.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Active Lifestyle Integration",
            description: "Build movement into daily routine beyond structured exercise",
            explanation: "Post-pandemic screen time increases and work-from-home boundary issues make intentional movement crucial for long-term health.",
            tasks: [
              {
                name: "Integrate movement breaks throughout workday, especially for remote workers",
                summary: "Movement breaks",
                explanation: "Regular movement breaks counter negative effects of prolonged sitting and improve focus and productivity. Particularly important for remote workers who lack natural movement from office environment.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Use Canadian outdoor opportunities for active transportation and recreation",
                summary: "Active transport",
                explanation: "Canada's outdoor infrastructure supports active transportation like cycling and walking while providing free recreation opportunities. Active transport combines fitness with practical transportation needs.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Establish Preventive Health Optimization",
        description: "Build comprehensive approach to preventing chronic disease and optimizing wellness",
        icon: "medical",
        explanation: "84% of Gen Z and 79% of millennials actively tried improving health last year. New national pharmacare program covers contraceptives and diabetes medications.",
        projects: [
          {
            name: "Preventive Care System",
            description: "Use Canada's healthcare system for comprehensive preventive health approach",
            explanation: "Universal healthcare covers regular screenings. Preventive care becomes more accessible and actionable for budget-conscious young professionals.",
            tasks: [
              {
                name: "Schedule annual health check-up with GP including blood tests and recommended screenings",
                summary: "Book checkup",
                explanation: "Universal healthcare makes preventive care accessible and affordable. Annual check-ups detect health issues early when treatment is most effective and least costly.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Create nutrition and sleep optimization plan based on Canadian health guidelines",
                summary: "Health plan",
                explanation: "Health Canada guidelines provide evidence-based recommendations for nutrition and sleep that support long-term wellness. Structured plans make healthy choices easier and more consistent.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Health Monitoring and Optimization",
            description: "Use technology and regular assessments to optimize health outcomes",
            explanation: "Digital health monitoring through wearables combined with universal healthcare creates comprehensive approach to wellness optimization.",
            tasks: [
              {
                name: "Use health tracking app or wearable to monitor key health metrics daily",
                summary: "Track health",
                explanation: "Health tracking provides objective data about patterns and trends that inform lifestyle adjustments. Regular monitoring helps identify what works for your individual health optimization.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Establish consistent sleep schedule of 7-8 hours nightly for optimal health",
                summary: "Fix sleep",
                explanation: "Consistent sleep schedule regulates circadian rhythms and improves both physical and mental health. Quality sleep forms foundation for all other health and performance goals.",
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
    color: "#ec4899", // Pink
    description: "Building and maintaining meaningful personal connections",
    goals: [
      {
        name: "Master Textual Chemistry",
        description: "Develop effective digital communication skills for modern dating success",
        icon: "chatbubble",
        explanation: "67% of Canadian singles prefer texting as primary communication. 68% follow 'no wait' response protocols. 29% use AI for dating assistance, 80% use dating apps.",
        projects: [
          {
            name: "Digital Dating Communication",
            description: "Master text and app-based communication for relationship building",
            explanation: "Digital communication skills determine relationship success when 54% work remotely and miss traditional social opportunities for meeting people.",
            tasks: [
              {
                name: "Learn effective text conversation techniques and response timing for dating apps",
                summary: "Learn texting",
                explanation: "Effective texting skills are essential for modern dating success when 67% prefer texting as primary communication. Learning conversation techniques and timing improves match conversion to dates.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Practice authentic communication that builds genuine connection through digital platforms",
                summary: "Practice dating",
                explanation: "Authentic communication attracts compatible partners while filtering out superficial connections. Genuine conversation skills translate from digital to in-person interactions for relationship success.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Strategic Dating App Optimization",
            description: "Transform online dating from exhausting to strategic and effective",
            explanation: "This goal transforms online dating approach, particularly relevant when traditional workplace and social opportunities for meeting people are reduced.",
            tasks: [
              {
                name: "Optimize dating profiles and choose platforms that attract people seeking your relationship goals",
                summary: "Optimize profiles",
                explanation: "Strategic profile optimization and platform selection increase quality matches while reducing time spent on incompatible connections. Different platforms attract different relationship intentions.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Develop dating strategy that focuses on quality connections over quantity of matches",
                summary: "Dating strategy",
                explanation: "Quality-focused strategy reduces dating fatigue and increases likelihood of meaningful relationships. Strategic approach saves time and emotional energy while improving relationship outcomes.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Budget-Friendly Romance",
        description: "Create meaningful romantic connections without financial strain",
        icon: "heart",
        explanation: "35% have passed on dates due to financial constraints, 24% plan to spend less on dating. Housing costs consume one-third of income, requiring creative approaches.",
        projects: [
          {
            name: "Creative Dating Strategy",
            description: "Develop romantic connections through creativity rather than expensive consumption",
            explanation: "50% would consider moving in together sooner to save money, showing how economic pressures reshape relationship timelines and require financial transparency.",
            tasks: [
              {
                name: "Plan creative, low-cost date ideas that focus on connection rather than spending",
                summary: "Plan dates",
                explanation: "Creative dating demonstrates thoughtfulness while reducing financial pressure. Connection-focused activities build stronger relationships than expensive consumption-based dates.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Have honest conversations about financial constraints and creative relationship building",
                summary: "Financial talks",
                explanation: "Financial transparency early in relationships prevents misunderstandings and builds trust. Open communication about constraints often leads to creative solutions that strengthen connections.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Relationship Financial Planning",
            description: "Navigate financial aspects of relationship building and progression",
            explanation: "Economic pressures make financial transparency and creative dating essential skills for successful relationship development.",
            tasks: [
              {
                name: "Discuss financial goals and constraints openly in developing relationships",
                summary: "Discuss money",
                explanation: "Early financial discussions align expectations and build foundation for long-term compatibility. Money conversations prevent relationship conflicts and ensure shared values around financial priorities.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Create budget for dating and relationship activities that aligns with other financial goals",
                summary: "Dating budget",
                explanation: "Dating budgets prevent overspending while ensuring relationship building remains priority. Balanced approach allows for meaningful connections without compromising other financial goals.",
                timeframe: "1 week",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Beat the Loneliness Epidemic",
        description: "Build authentic community connections beyond social media",
        icon: "people",
        explanation: "52% of Canadians feel lonely weekly. 77% of Gen Z and 72% of millennials experience regular loneliness. Remote work eliminated traditional workplace friendships.",
        projects: [
          {
            name: "In-Person Community Building",
            description: "Create real community through local activities and intergenerational relationships",
            explanation: "This goal moves beyond social media to build real community that combats isolation created by remote work and digital-first social interactions.",
            tasks: [
              {
                name: "Join local activities, clubs, or groups where you can meet like-minded people regularly",
                summary: "Join groups",
                explanation: "Regular group activities create natural opportunities for friendship development while pursuing shared interests. Consistent participation builds familiarity and trust that develops into meaningful connections.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Reach out to existing friends and schedule regular in-person social activities",
                summary: "Schedule socials",
                explanation: "Proactive social outreach strengthens existing relationships while combating social isolation. Regular in-person activities deepen friendships and provide emotional support essential for mental health.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Social Network Diversification",
            description: "Build connections across age groups and backgrounds to combat isolation",
            explanation: "Intentional social connection crucial when traditional friendship opportunities are reduced. Building diverse social networks provides emotional support.",
            tasks: [
              {
                name: "Participate in intergenerational activities or volunteer opportunities",
                summary: "Volunteer social",
                explanation: "Intergenerational activities provide perspective and wisdom while volunteering creates meaningful connections through shared purpose. These activities build diverse social networks that enrich life experience.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Make effort to deepen existing friendships through vulnerable conversations and quality time",
                summary: "Deepen friendship",
                explanation: "Vulnerability and quality time transform surface relationships into deep friendships that provide emotional support. Deeper connections create more resilient social networks for life's challenges.",
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
        name: "Master Digital Literacy and AI Tools",
        description: "Develop comprehensive technology skills for Canadian workplace competitiveness",
        icon: "laptop",
        explanation: "51% of hiring managers identify AI skills as in-demand. 47% of Gen Z report AI increases work efficiency. 90% of Canadian employers experience skills gaps.",
        projects: [
          {
            name: "AI and Digital Skills Development",
            description: "Learn practical AI applications and digital tools for your profession",
            explanation: "Ability to leverage AI tools effectively increasingly determines professional success across all industries in Canada's evolving job market.",
            tasks: [
              {
                name: "Identify AI tools and digital platforms most relevant to your industry and role",
                summary: "Research AI tools",
                explanation: "Understanding which AI tools provide value for your specific role ensures focused learning and immediate workplace application. Industry-specific tools create competitive advantage and demonstrate innovation.",
                completed: false
              },
              {
                name: "Complete online courses in AI applications and digital literacy for your profession",
                summary: "AI courses",
                explanation: "Structured courses provide systematic AI education and recognized credentials that employers value. Professional-focused AI training creates immediately applicable skills for career advancement.",
                completed: false
              }
            ]
          },
          {
            name: "Digital Tool Integration",
            description: "Apply AI and digital skills to current work for immediate career value",
            explanation: "Government-funded programs through CanCode make this goal financially accessible while providing immediate career advantages.",
            tasks: [
              {
                name: "Implement AI tools and digital processes in your current role to demonstrate value",
                summary: "Implement AI",
                explanation: "Practical AI implementation proves your ability to create business value and positions you as an innovator. Demonstrating AI success in current role often leads to promotion opportunities.",
                completed: false
              },
              {
                name: "Share knowledge through presentations or training to build professional reputation",
                summary: "Share knowledge",
                explanation: "Knowledge sharing establishes you as an AI thought leader while building professional network. Teaching others demonstrates expertise and often leads to speaking opportunities and career advancement.",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Achieve French Language Proficiency",
        description: "Develop bilingual capability for unique Canadian career advantage",
        icon: "language",
        explanation: "Bilingualism opens federal employment and salary bonuses. Government-funded Mauril app has 64% of users learning French. Remote work enables Quebec job market access.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "conversational",
            name: "Conversational Proficiency",
            description: "Develop ability to have basic work and social conversations in French",
            projects: [
              {
                name: "Basic French Communication",
                description: "Build foundation for everyday French conversations using Canadian resources",
                explanation: "Government-funded Mauril app has 64% success rate. Conversational French opens social opportunities and demonstrates cultural respect.",
                tasks: [
                  {
                    name: "Complete Mauril app basic levels and practice daily conversations for 30 minutes",
                    summary: "Daily French",
                    explanation: "Mauril app provides free, government-funded French education with proven 64% success rate. Daily practice builds conversational confidence and practical communication skills for Canadian social integration.",
                    completed: false
                  },
                  {
                    name: "Join local Alliance Française or French conversation meetups for speaking practice",
                    summary: "French meetups",
                    explanation: "Speaking practice with native speakers accelerates fluency development and builds confidence for real-world conversations. Alliance Française provides structured learning environment with cultural context.",
                    completed: false
                  }
                ]
              },
              {
                name: "French Social Integration",
                description: "Apply conversational French in real Canadian social contexts",
                explanation: "French social connections enrich Canadian experience and build cultural bridges beyond career benefits.",
                tasks: [
                  {
                    name: "Attend French cultural events or festivals in your Canadian city",
                    summary: "French events",
                    explanation: "Cultural events provide immersive French practice in relaxed social settings while building appreciation for French-Canadian heritage. These experiences make language learning enjoyable and culturally meaningful.",
                    completed: false
                  },
                  {
                    name: "Have 5 basic conversations with French speakers in community settings",
                    summary: "Practice conversations",
                    explanation: "Real conversations provide practical application of language skills and build confidence for everyday French communication. Community settings offer supportive environment for learning and cultural connection.",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "professional",
            name: "Professional Bilingualism",
            description: "Achieve business-level French for federal jobs and Quebec market access",
            projects: [
              {
                name: "Business French Certification",
                description: "Achieve professional-level French competency for Canadian career advancement",
                explanation: "Bilingualism opens federal employment with salary bonuses. Remote work enables access to Quebec's $380B economy.",
                tasks: [
                  {
                    name: "Complete advanced Mauril courses and prepare for federal language test (SLE)",
                    summary: "SLE preparation",
                    explanation: "SLE certification opens federal employment opportunities with bilingual bonuses up to $800 annually. Advanced Mauril courses provide structured preparation for professional-level French competency.",
                    completed: false
                  },
                  {
                    name: "Practice business French through online courses focusing on Canadian workplace vocabulary",
                    summary: "Business French",
                    explanation: "Business French skills enable professional communication in bilingual workplaces and Quebec job market. Canadian workplace vocabulary differs from international French and is essential for career success.",
                    completed: false
                  }
                ]
              },
              {
                name: "Quebec Market Access",
                description: "Position for Quebec job opportunities through professional French skills",
                explanation: "Remote work revolution enables English speakers to access Quebec's job market with proper French skills.",
                tasks: [
                  {
                    name: "Research Quebec employers in your field and understand bilingual job requirements",
                    summary: "Research Quebec jobs",
                    explanation: "Quebec's $380B economy offers significant career opportunities for bilingual professionals. Understanding specific job requirements helps target French learning toward career-relevant skills.",
                    completed: false
                  },
                  {
                    name: "Network with Quebec professionals and practice business French in professional contexts",
                    summary: "Quebec networking",
                    explanation: "Professional networking in French builds career connections while providing authentic practice in business contexts. Quebec professionals can provide insights into career opportunities and cultural workplace norms.",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "cultural",
            name: "Cultural Integration",
            description: "Learn French to connect with Quebecois culture and communities",
            projects: [
              {
                name: "Quebecois Cultural Immersion",
                description: "Experience French-Canadian culture through language learning",
                explanation: "Cultural integration strengthens Canadian identity and builds lasting connections with francophone communities.",
                tasks: [
                  {
                    name: "Watch Quebec films/TV shows and read French-Canadian literature with language learning focus",
                    summary: "Quebec media",
                    completed: false
                  },
                  {
                    name: "Learn Quebec French expressions and cultural nuances distinct from European French",
                    summary: "Quebec expressions",
                    completed: false
                  }
                ]
              },
              {
                name: "Francophone Community Connection",
                description: "Build meaningful relationships within French-speaking Canadian communities",
                explanation: "Deep cultural connections enrich Canadian experience and create lasting friendships across linguistic communities.",
                tasks: [
                  {
                    name: "Join French-Canadian cultural organizations or volunteer with francophone community groups",
                    summary: "Join groups",
                    completed: false
                  },
                  {
                    name: "Plan trip to Quebec and navigate cultural experiences primarily in French",
                    summary: "Quebec trip",
                    completed: false
                  }
                ]
              }
            ]
          }
        ],
        projects: [
          {
            name: "Strategic French Learning Plan",
            description: "Use government resources and apps to build French proficiency systematically",
            explanation: "Federal positions require bilingual candidates and remote work opens access to Quebec's job market, providing concrete career expansion unavailable in other countries.",
            tasks: [
              {
                name: "Download Mauril app and establish daily French learning routine using government resources",
                summary: "Start Mauril",
                completed: false
              },
              {
                name: "Set specific French proficiency goals and timeline based on career objectives",
                summary: "Set goals",
                completed: false
              }
            ]
          },
          {
            name: "French Application and Integration",
            description: "Practice French in real-world contexts and professional settings",
            explanation: "Government-funded programs make this goal financially accessible while offering unique Canadian advantage not available in other countries.",
            tasks: [
              {
                name: "Join French conversation groups or find francophone conversation partners",
                summary: "Find partners",
                completed: false
              },
              {
                name: "Apply French skills in work context or seek opportunities requiring bilingual capability",
                summary: "Apply skills",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Obtain Professional Certifications",
        description: "Earn industry credentials that advance career in Canadian job market",
        icon: "school",
        explanation: "49% of employers upskill employees, 43% provide certification funding. $351.2 million committed to youth employment programs creating 90,000 placements.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "tech",
            name: "Technology Certifications",
            description: "Earn tech industry credentials in high-demand areas like cloud, AI, or cybersecurity",
            projects: [
              {
                name: "Canadian Tech Certification Strategy",
                description: "Pursue high-demand tech certifications with Canadian employer funding support",
                explanation: "49% of employers upskill employees, 43% provide certification funding. Tech skills shortage creates opportunities for funded learning.",
                tasks: [
                  {
                    name: "Research employer-funded tech certification programs (AWS, Microsoft, Google, Cisco)",
                    summary: "Research certs",
                    completed: false
                  },
                  {
                    name: "Complete certification with employer support and negotiate salary increase based on new credentials",
                    summary: "Get certified",
                    completed: false
                  }
                ]
              },
              {
                name: "Tech Career Advancement",
                description: "Leverage tech certifications for Canadian job market advancement",
                explanation: "$351.2 million committed to youth employment programs. Tech certifications provide clear pathway to higher-paying roles.",
                tasks: [
                  {
                    name: "Build portfolio demonstrating certified skills through practical projects",
                    summary: "Build portfolio",
                    completed: false
                  },
                  {
                    name: "Apply for tech roles or internal promotions leveraging new certifications",
                    summary: "Apply roles",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "healthcare",
            name: "Healthcare Professional Designations",
            description: "Pursue healthcare certifications with loan forgiveness options in rural areas",
            projects: [
              {
                name: "Healthcare Certification with Loan Forgiveness",
                description: "Pursue healthcare credentials that qualify for Canadian rural loan forgiveness programs",
                explanation: "Healthcare professionals in rural areas receive student loan forgiveness. Growing healthcare needs create job security.",
                tasks: [
                  {
                    name: "Research healthcare certifications eligible for loan forgiveness in rural Canadian areas",
                    summary: "Research healthcare",
                    completed: false
                  },
                  {
                    name: "Enroll in healthcare certification program and explore rural placement opportunities",
                    summary: "Enroll program",
                    completed: false
                  }
                ]
              },
              {
                name: "Healthcare Career Development",
                description: "Build healthcare career through strategic certification and placement",
                explanation: "Aging population creates sustained healthcare demand. Rural practice combines loan forgiveness with meaningful community impact.",
                tasks: [
                  {
                    name: "Complete healthcare certification requirements and licensing process",
                    summary: "Get licensed",
                    completed: false
                  },
                  {
                    name: "Secure healthcare position in rural area and apply for loan forgiveness programs",
                    summary: "Rural position",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "green-economy",
            name: "Green Economy Credentials",
            description: "Get certified in environmental, sustainability, or clean energy sectors",
            projects: [
              {
                name: "Green Economy Certification",
                description: "Earn credentials in Canada's growing environmental and clean energy sectors",
                explanation: "Canada's net-zero commitment creates growing demand for green economy professionals. Government incentives support training.",
                tasks: [
                  {
                    name: "Research green economy certifications (renewable energy, environmental management, sustainability)",
                    summary: "Research green",
                    completed: false
                  },
                  {
                    name: "Complete certification in chosen green economy specialization",
                    summary: "Green certified",
                    completed: false
                  }
                ]
              },
              {
                name: "Sustainable Career Transition",
                description: "Transition career toward sustainable and environmentally-focused roles",
                explanation: "Clean energy and environmental sectors offer growth opportunities aligned with Canada's climate commitments.",
                tasks: [
                  {
                    name: "Build portfolio demonstrating green economy expertise through projects or volunteer work",
                    summary: "Green portfolio",
                    completed: false
                  },
                  {
                    name: "Network with Canadian green economy employers and apply for sustainable sector roles",
                    summary: "Green networking",
                    completed: false
                  }
                ]
              }
            ]
          }
        ],
        projects: [
          {
            name: "Strategic Certification Planning",
            description: "Choose certifications aligned with Canadian job market demands and funding opportunities",
            explanation: "Certifications in healthcare, technology, and green economy sectors offer clear pathways to advancement with potential employer or government funding.",
            tasks: [
              {
                name: "Research certification options in your field and identify those with funding or employer support",
                summary: "Research options",
                completed: false
              },
              {
                name: "Enroll in certification program and create study timeline for completion",
                summary: "Enroll program",
                completed: false
              }
            ]
          },
          {
            name: "Certification Value Maximization",
            description: "Apply new credentials for career advancement and increased earning potential",
            explanation: "Student loan forgiveness for healthcare professionals in rural areas adds additional incentive for strategic credential selection.",
            tasks: [
              {
                name: "Complete certification requirements and add credentials to professional profiles",
                summary: "Complete cert",
                completed: false
              },
              {
                name: "Leverage new certification for promotion, salary increase, or job advancement",
                summary: "Leverage cert",
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
        name: "Explore Canada Through Epic Adventures",
        description: "Discover diverse Canadian regions through meaningful domestic travel",
        icon: "airplane",
        explanation: "71% prefer domestic destinations. Travel spending reached $129.6 billion in 2024. 44% plan provincial exploration, 45% want interprovincial adventures.",
        projects: [
          {
            name: "Canadian Discovery Planning",
            description: "Create systematic approach to exploring Canada's diverse provinces and regions",
            explanation: "52% planning solo travel and domestic tourism exceeding pre-COVID levels, this goal combines adventure with fiscal responsibility.",
            tasks: [
              {
                name: "Create Canadian travel bucket list with specific destinations and seasonal experiences",
                summary: "Travel bucket list",
                completed: false
              },
              {
                name: "Plan and budget for quarterly domestic adventures exploring different provinces",
                summary: "Plan adventures",
                completed: false
              }
            ]
          },
          {
            name: "Adventure Skill Building",
            description: "Develop outdoor and travel skills for Canadian adventures",
            explanation: "Cost constraints become discovery opportunities as travelers focus on Canadian destinations rather than expensive international travel.",
            tasks: [
              {
                name: "Learn outdoor skills relevant to Canadian adventures (camping, hiking, winter activities)",
                summary: "Learn outdoor skills",
                completed: false
              },
              {
                name: "Complete first planned Canadian destination trip and document experience for future planning",
                summary: "First trip",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Master Four-Season Outdoor Activities",
        description: "Develop skills for year-round enjoyment of Canada's distinct seasons",
        icon: "snow",
        explanation: "21 million+ ski visits in 2022/23 set new records. 2.8 million active skiers/snowboarders. Learning seasonal activities builds lifelong community connections.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "winter-sports",
            name: "Winter Sports Mastery",
            description: "Learn skiing, snowboarding, or ice skating for winter enjoyment",
            projects: [
              {
                name: "Winter Sports Foundation",
                description: "Master essential Canadian winter sports for lifelong enjoyment",
                explanation: "21 million+ ski visits in 2022/23 set records. 2.8 million active skiers/snowboarders. Winter sports build Canadian cultural connections.",
                tasks: [
                  {
                    name: "Take skiing or snowboarding lessons at local Canadian resort or community center",
                    summary: "Learn skiing",
                    completed: false
                  },
                  {
                    name: "Practice winter sport regularly and join Canadian winter sports community groups",
                    summary: "Winter community",
                    completed: false
                  }
                ]
              },
              {
                name: "Canadian Winter Lifestyle",
                description: "Integrate winter sports into year-round Canadian lifestyle",
                explanation: "Winter skills transform Canadian winter from endurance to enjoyment, building social connections and physical fitness.",
                tasks: [
                  {
                    name: "Plan regular winter sport outings throughout cold season with friends or groups",
                    summary: "Winter outings",
                    completed: false
                  },
                  {
                    name: "Explore different Canadian winter destinations and ski areas for variety",
                    summary: "Explore destinations",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "summer-outdoor",
            name: "Summer Outdoor Adventures",
            description: "Develop hiking, camping, cycling, or water sport skills",
            projects: [
              {
                name: "Canadian Summer Activity Mastery",
                description: "Build skills for maximizing Canada's spectacular summer outdoor opportunities",
                explanation: "Canada's summer outdoor opportunities are world-class. Skills development enables exploration of national parks and wilderness areas.",
                tasks: [
                  {
                    name: "Learn one new summer outdoor skill (hiking, camping, cycling, kayaking) through courses or groups",
                    summary: "Summer skill",
                    completed: false
                  },
                  {
                    name: "Plan and execute summer adventure trips to Canadian national parks or wilderness areas",
                    summary: "National parks",
                    completed: false
                  }
                ]
              },
              {
                name: "Outdoor Adventure Community",
                description: "Build connections through shared Canadian outdoor adventures",
                explanation: "Outdoor activities create lasting friendships and deep connection to Canadian natural heritage.",
                tasks: [
                  {
                    name: "Join Canadian outdoor clubs or adventure groups for regular summer activities",
                    summary: "Outdoor clubs",
                    completed: false
                  },
                  {
                    name: "Organize group outdoor adventures and build network of outdoor-minded Canadians",
                    summary: "Organize adventures",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "year-round",
            name: "Year-Round Activity System",
            description: "Build skills for activities in all four Canadian seasons",
            projects: [
              {
                name: "Four-Season Activity Development",
                description: "Master different activities for each distinct Canadian season",
                explanation: "Canada's four distinct seasons each offer unique opportunities. Year-round activity skills maximize Canadian lifestyle.",
                tasks: [
                  {
                    name: "Identify and learn one activity for each Canadian season (winter, spring, summer, fall)",
                    summary: "Four seasons",
                    completed: false
                  },
                  {
                    name: "Create seasonal activity calendar maximizing year-round Canadian outdoor opportunities",
                    summary: "Activity calendar",
                    completed: false
                  }
                ]
              },
              {
                name: "Canadian Seasonal Mastery",
                description: "Embrace all four seasons as opportunities rather than obstacles",
                explanation: "Year-round outdoor lifestyle creates deep appreciation for Canadian climate and geography while maintaining fitness.",
                tasks: [
                  {
                    name: "Document seasonal activity experiences and share Canadian outdoor lifestyle with others",
                    summary: "Document experiences",
                    completed: false
                  },
                  {
                    name: "Mentor others in developing year-round Canadian outdoor skills and appreciation",
                    summary: "Mentor others",
                    completed: false
                  }
                ]
              }
            ]
          }
        ],
        projects: [
          {
            name: "Seasonal Activity Development",
            description: "Learn one new seasonal activity annually to master Canadian environment",
            explanation: "From winter skiing to summer hiking, this goal builds community connections while mastering Canada's unique geographic identity.",
            tasks: [
              {
                name: "Choose one seasonal activity to learn this year and find instruction or community groups",
                summary: "Choose activity",
                completed: false
              },
              {
                name: "Practice chosen activity regularly and connect with others who share the interest",
                summary: "Practice activity",
                completed: false
              }
            ]
          },
          {
            name: "Four-Season Lifestyle Integration",
            description: "Build year-round outdoor lifestyle that embraces Canadian seasons",
            explanation: "Skills developed last a lifetime and create social connections through shared outdoor experiences unique to Canadian geography.",
            tasks: [
              {
                name: "Plan seasonal activities throughout the year to maintain active outdoor engagement",
                summary: "Plan seasons",
                completed: false
              },
              {
                name: "Join outdoor clubs or groups that participate in your chosen seasonal activities",
                summary: "Join clubs",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Create Through Hobby Renaissance",
        description: "Develop fulfilling creative hobbies that connect cooking, creating, and community",
        icon: "color-palette",
        explanation: "Cooking and reading rank as top Canadian hobbies, with 80% engaging in reading. Culinary exploration celebrates Canada's multicultural cities.",
        projects: [
          {
            name: "Creative Skill Development",
            description: "Choose and develop creative hobbies that provide personal satisfaction",
            explanation: "Home-based hobbies gained permanent popularity during pandemic, making this goal both economically smart and socially enriching.",
            tasks: [
              {
                name: "Choose creative hobby (cooking ethnic cuisines, writing, art, music) and set up practice space",
                summary: "Choose hobby",
                completed: false
              },
              {
                name: "Practice chosen creative skill regularly and track progress toward competency goals",
                summary: "Practice creativity",
                completed: false
              }
            ]
          },
          {
            name: "Community Through Creativity",
            description: "Transform solitary hobbies into social opportunities through sharing and teaching",
            explanation: "This goal transforms solitary activities into social opportunities through cooking classes, book clubs, and dinner parties.",
            tasks: [
              {
                name: "Join community groups related to your creative hobby (book clubs, cooking classes, maker spaces)",
                summary: "Creative groups",
                completed: false
              },
              {
                name: "Share your creative work with others through hosting, teaching, or community participation",
                summary: "Share creativity",
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
        name: "Lead Climate Action Initiative",
        description: "Channel climate anxiety into concrete local environmental impact",
        icon: "leaf",
        explanation: "62% believe Canada should lead on climate action. 78% report climate change impacts mental health. 58% increasing sustainable transport, 64% cutting single-use plastics.",
        projects: [
          {
            name: "Local Climate Leadership",
            description: "Lead community environmental initiative for visible impact within 1-3 years",
            explanation: "This goal channels anxiety into agency through local environmental groups, community cleanups, and municipal advocacy that creates measurable change.",
            tasks: [
              {
                name: "Join or start local environmental group focused on specific climate action in your community",
                summary: "Join climate group",
                completed: false
              },
              {
                name: "Lead specific climate initiative (community garden, cleanup, advocacy) with measurable goals",
                summary: "Lead initiative",
                completed: false
              }
            ]
          },
          {
            name: "Climate Impact Measurement",
            description: "Track and amplify environmental impact through community engagement",
            explanation: "With climate anxiety affecting mental health, creating visible positive impact provides sense of agency and hope while contributing to collective action.",
            tasks: [
              {
                name: "Measure and document environmental impact of your climate action initiatives",
                summary: "Measure impact",
                completed: false
              },
              {
                name: "Engage others in climate action through education, events, or social media advocacy",
                summary: "Engage others",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Purpose-Driven Side Business",
        description: "Create meaningful income stream that aligns with personal values",
        icon: "storefront",
        explanation: "28% have side hustles (up from 13% in 2022). 66% of millennials/Gen Z plan to start one. 89-92% consider purpose essential, 49% want to 'be their own boss'.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "social-impact",
            name: "Social Impact Business",
            description: "Create business that addresses social problems or community needs",
            projects: [
              {
                name: "Social Impact Business Development",
                description: "Launch business addressing Canadian social challenges while generating income",
                explanation: "89-92% consider purpose essential. Social impact businesses align values with income while addressing real community needs.",
                tasks: [
                  {
                    name: "Identify social problem in Canadian community and develop business solution",
                    summary: "Identify problem",
                    completed: false
                  },
                  {
                    name: "Launch social impact business and measure both financial and social outcomes",
                    summary: "Launch business",
                    completed: false
                  }
                ]
              },
              {
                name: "Community-Centered Business Growth",
                description: "Scale social impact business through community partnerships and support",
                explanation: "Community-centered businesses build stronger customer loyalty and sustainable growth through mission alignment.",
                tasks: [
                  {
                    name: "Partner with Canadian community organizations to amplify social impact",
                    summary: "Partner organizations",
                    completed: false
                  },
                  {
                    name: "Document and share social impact results to attract mission-aligned customers",
                    summary: "Document impact",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "environmental",
            name: "Environmental Solutions",
            description: "Develop business focused on sustainability or environmental improvement",
            projects: [
              {
                name: "Green Business Launch",
                description: "Create environmentally-focused business aligned with Canada's sustainability goals",
                explanation: "Canada's net-zero commitment creates market opportunities for environmental solutions. Consumer demand for sustainable options growing.",
                tasks: [
                  {
                    name: "Develop business addressing environmental challenge (waste reduction, energy efficiency, sustainable products)",
                    summary: "Develop green business",
                    completed: false
                  },
                  {
                    name: "Launch green business with clear environmental impact measurement",
                    summary: "Launch green",
                    completed: false
                  }
                ]
              },
              {
                name: "Sustainable Business Scaling",
                description: "Grow environmental business through Canadian green economy networks",
                explanation: "Government incentives and consumer preference for sustainable businesses create growth opportunities in Canadian market.",
                tasks: [
                  {
                    name: "Connect with Canadian green economy networks and sustainable business communities",
                    summary: "Connect networks",
                    completed: false
                  },
                  {
                    name: "Scale business operations while maintaining environmental commitment and impact",
                    summary: "Scale sustainably",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "creative-services",
            name: "Creative Services with Purpose",
            description: "Offer creative services that support causes or meaningful organizations",
            projects: [
              {
                name: "Purpose-Driven Creative Business",
                description: "Build creative services business supporting Canadian nonprofits and social causes",
                explanation: "28% have side hustles, with creative services averaging higher hourly rates. Purpose-driven clients offer meaningful work relationships.",
                tasks: [
                  {
                    name: "Develop creative service offering (design, writing, marketing) focused on supporting meaningful causes",
                    summary: "Creative services",
                    completed: false
                  },
                  {
                    name: "Build client base of Canadian nonprofits, social enterprises, and purpose-driven businesses",
                    summary: "Build clients",
                    completed: false
                  }
                ]
              },
              {
                name: "Creative Impact Amplification",
                description: "Scale creative services to maximize both income and social impact",
                explanation: "Creative services for purpose-driven organizations combine artistic fulfillment with meaningful contribution to causes.",
                tasks: [
                  {
                    name: "Create portfolio showcasing creative work that generated real impact for client causes",
                    summary: "Impact portfolio",
                    completed: false
                  },
                  {
                    name: "Expand services to reach more purpose-driven organizations while maintaining quality and mission focus",
                    summary: "Expand services",
                    completed: false
                  }
                ]
              }
            ]
          }
        ],
        projects: [
          {
            name: "Purpose-Driven Business Launch",
            description: "Start side business that combines income generation with meaningful impact",
            explanation: "This goal combines financial goals with meaning as economic pressures drive income diversification needs while maintaining values alignment.",
            tasks: [
              {
                name: "Identify business opportunity that aligns with your values and addresses real need",
                summary: "Identify opportunity",
                completed: false
              },
              {
                name: "Create business plan and launch with focus on both profitability and purpose",
                summary: "Launch purposeful",
                completed: false
              }
            ]
          },
          {
            name: "Sustainable Business Growth",
            description: "Scale side business to consistent income while maintaining purpose focus",
            explanation: "Average profitability within 3-6 months makes this achievable alongside full-time work while satisfying desire for meaningful contribution.",
            tasks: [
              {
                name: "Complete first 10 sales or projects to establish reputation and sustainable operations",
                summary: "First 10 sales",
                completed: false
              },
              {
                name: "Optimize business model to balance purpose-driven impact with financial sustainability",
                summary: "Optimize model",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Use Skills for Community Volunteering",
        description: "Apply professional expertise to meaningful causes through strategic volunteering",
        icon: "heart",
        explanation: "Canadian millennials volunteer more hours for environmental causes than older adults. 93% motivated by community contribution, 78% want to use professional skills.",
        projects: [
          {
            name: "Skills-Based Volunteer Strategy",
            description: "Apply professional skills through board positions or mentoring programs",
            explanation: "Strategic volunteering through board positions or mentoring creates career networks while contributing meaningfully, transforming networking from transactional to purposeful.",
            tasks: [
              {
                name: "Research nonprofit organizations that could benefit from your professional skills",
                summary: "Research nonprofits",
                completed: false
              },
              {
                name: "Commit to regular volunteer role that utilizes your expertise (board member, mentor, advisor)",
                summary: "Volunteer role",
                completed: false
              }
            ]
          },
          {
            name: "Community Impact and Network Building",
            description: "Maximize community contribution while building meaningful professional relationships",
            explanation: "This goal transforms networking from transactional to purposeful while creating measurable community impact through professional skill application.",
            tasks: [
              {
                name: "Track impact of your volunteer work and measure community benefit created",
                summary: "Track impact",
                completed: false
              },
              {
                name: "Build relationships with other volunteers and community leaders who share your values",
                summary: "Build relationships",
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
        name: "Create Affordable Home Office Space",
        description: "Design productive workspace that supports remote work and claims tax benefits",
        icon: "laptop",
        explanation: "50% of federal office space sits underused, hybrid work standard. CRA's $500 home office deduction recognizes necessity. Proper workspace impacts mental health and performance.",
        projects: [
          {
            name: "Home Office Setup and Optimization",
            description: "Create dedicated workspace that maximizes productivity and tax benefits",
            explanation: "Converting basements, optimizing storage, and upgrading technology creates productivity gains that justify investment while claiming tax deductions.",
            tasks: [
              {
                name: "Set up dedicated home office space and ensure it meets CRA requirements for tax deduction",
                summary: "Setup office",
                completed: false
              },
              {
                name: "Invest in ergonomic furniture and technology that supports long-term productivity and health",
                summary: "Ergonomic setup",
                completed: false
              }
            ]
          },
          {
            name: "Work-Life Space Integration",
            description: "Design living space that supports both remote work and personal life",
            explanation: "With proper workspace directly impacting mental health and work performance, this goal offers immediate quality of life improvements.",
            tasks: [
              {
                name: "Create clear boundaries between work and living spaces to maintain work-life balance",
                summary: "Work boundaries",
                completed: false
              },
              {
                name: "Organize storage and systems that support both professional and personal activities",
                summary: "Organize systems",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Navigate Path to Homeownership",
        description: "Develop strategic approach to eventual homeownership despite affordability challenges",
        icon: "home",
        explanation: "Homeownership rates for 25-29 dropped from 44% to 36.5%. 73% highly concerned about affordability but new 30-year mortgages and enhanced buyer programs available.",
        projects: [
          {
            name: "Strategic Homeownership Planning",
            description: "Create long-term plan that maximizes government programs and location flexibility",
            explanation: "This goal requires strategic planning including maximizing government programs, considering smaller markets, and exploring co-ownership models over 2-3 years.",
            tasks: [
              {
                name: "Research and maximize First Home Savings Account, Home Buyers' Plan, and regional programs",
                summary: "Research programs",
                completed: false
              },
              {
                name: "Evaluate different markets and consider 'Goldilocks zones' - areas with optimal affordability-opportunity balance",
                summary: "Evaluate markets",
                completed: false
              }
            ]
          },
          {
            name: "Alternative Homeownership Strategies",
            description: "Explore creative approaches to homeownership including co-ownership and location flexibility",
            explanation: "New 30-year mortgages and enhanced buyer programs provide pathways forward despite challenging market conditions.",
            tasks: [
              {
                name: "Research co-ownership, house hacking, and other alternative paths to homeownership",
                summary: "Alternative paths",
                completed: false
              },
              {
                name: "Build credit score and financial profile to qualify for best mortgage rates when ready",
                summary: "Build credit",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Eco-Conscious Living Space",
        description: "Create sustainable living environment that reflects environmental values",
        icon: "leaf",
        explanation: "80% pay 9.7% more for sustainable goods, 85% experience climate impacts. Over 90% concerned about packaging waste, 46% actively buying sustainable products.",
        projects: [
          {
            name: "Sustainable Living Implementation",
            description: "Transform living space through zero-waste practices and sustainable furnishings",
            explanation: "Moving beyond stark minimalism toward personalized sustainable spaces, this goal implements values-driven living that reduces environmental impact.",
            tasks: [
              {
                name: "Implement zero-waste practices and sustainable purchasing decisions in your living space",
                summary: "Zero waste",
                completed: false
              },
              {
                name: "Choose furnishings and products from companies whose environmental practices align with your values",
                summary: "Sustainable products",
                completed: false
              }
            ]
          },
          {
            name: "Energy and Resource Optimization",
            description: "Optimize living space for energy efficiency and resource conservation",
            explanation: "This goal makes values visible daily while contributing to climate action through personal consumption choices and lifestyle decisions.",
            tasks: [
              {
                name: "Audit energy usage and implement efficiency improvements (LED lighting, smart thermostat, appliances)",
                summary: "Energy audit",
                completed: false
              },
              {
                name: "Set up composting, recycling, and waste reduction systems appropriate for your living situation",
                summary: "Waste systems",
                completed: false
              }
            ]
          }
        ]
      }
    ]
  }
];
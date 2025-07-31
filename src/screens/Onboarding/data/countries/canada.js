// src/screens/Onboarding/data/countries/canada.js
// Canada-specific domain definitions with refined goals based on 2024-2025 research
export const DOMAIN_DEFINITIONS = [
  {
    name: "Career & Work",
    icon: "briefcase-outline",
    color: "#3b82f6", // Blue
    description: "Professional advancement, workplace goals, career development",
    goals: [
      {
        name: "Master In-Demand Tech Skills",
        description: "Develop technology capabilities essential for Canada's digital transformation",
        icon: "laptop-outline",
        explanation: "305,000+ tech workers needed by 2024. AI and machine learning skills command 35% salary premiums with federal government investing $2.5 billion in digital skills development.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "ai-ml",
            name: "AI & Machine Learning Applications",
            description: "Learn practical AI tools and machine learning fundamentals"
          },
          {
            id: "cloud-cybersecurity",
            name: "Cloud Computing & Cybersecurity",
            description: "Master cloud platforms and security analysis skills"
          },
          {
            id: "data-analytics",
            name: "Data Analytics & Business Intelligence",
            description: "Develop data analysis and business intelligence capabilities"
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
                completed: false
              },
              {
                name: "Complete foundational courses and earn first industry-recognized certification",
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
                completed: false
              },
              {
                name: "Network with Canadian tech professionals and apply tech skills in current role",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Achieve 3.5%+ Salary Increase",
        description: "Exceed national average salary growth to gain real purchasing power",
        icon: "trending-up-outline",
        explanation: "2025 salary projections average 3.4-3.6% nationally with inflation at 2.4%. Tech professionals expect 4.3% increases, professional services 3.7%, finance 3.6%.",
        projects: [
          {
            name: "Performance-Based Salary Strategy",
            description: "Build case for salary increase through documented performance and market research",
            explanation: "Exceeding 3.4-3.6% national threshold provides real purchasing power gains when 48% of Gen Z and 46% of millennials feel financially insecure.",
            tasks: [
              {
                name: "Research salary benchmarks for your role and industry in Canadian markets",
                completed: false
              },
              {
                name: "Document achievements and prepare compelling case for salary increase exceeding 3.5%",
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
                completed: false
              },
              {
                name: "Develop high-value skills that command higher compensation in Canadian job market",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Secure Flexible Work Arrangement",
        description: "Negotiate hybrid or remote work options for optimal work-life integration",
        icon: "home-outline",
        explanation: "95% of young professionals say work-life balance is important. 29% of new job postings offer hybrid work and 12% fully remote positions.",
        projects: [
          {
            name: "Flexible Work Negotiation",
            description: "Secure hybrid or remote work arrangements with current employer",
            explanation: "80% of remote workers want to spend at least half their time working from home, directly addressing mental health challenges where only 52% of Gen Z rate wellbeing as good.",
            tasks: [
              {
                name: "Research your company's flexible work policy and document productivity benefits",
                completed: false
              },
              {
                name: "Prepare proposal highlighting how flexible work supports both performance and wellbeing",
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
                completed: false
              },
              {
                name: "Develop time management and communication systems that excel in flexible work environment",
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
        name: "Build $15,000 Emergency Fund",
        description: "Save four months of expenses using high-interest accounts and disciplined budgeting",
        icon: "shield-outline",
        explanation: "60% of young Canadians live paycheck-to-paycheck. This target represents approximately four months of expenses for median earners - enough to weather job transitions.",
        projects: [
          {
            name: "Emergency Fund Strategy",
            description: "Calculate target amount and set up systematic savings approach",
            explanation: "High-interest savings accounts earn 2.85-3.7% and Financial Consumer Agency strongly recommends emergency reserves for stability during economic uncertainty.",
            tasks: [
              {
                name: "Calculate four months of essential expenses to determine your $15,000 emergency fund target",
                completed: false
              },
              {
                name: "Open high-interest savings account and set up automatic weekly transfers",
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
                completed: false
              },
              {
                name: "Cancel or reduce subscription services and recurring expenses you don't actively use",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Save $25,000 Down Payment for Home",
        description: "Build foundation for homeownership despite challenging housing market",
        icon: "home-outline",
        explanation: "72% of millennials want homeownership but 46% think it's unrealistic. This covers 5% minimum down payment on $500,000 home, making it achievable first milestone.",
        projects: [
          {
            name: "Government Program Optimization",
            description: "Maximize First Home Savings Account and buyer programs for down payment",
            explanation: "Home Buyers' Plan allows $60,000 RRSP withdrawal, First Home Savings Account provides $40,000 contribution room, 30-year amortizations now available for first-time buyers.",
            tasks: [
              {
                name: "Open First Home Savings Account and maximize annual contributions for tax-free home savings",
                completed: false
              },
              {
                name: "Research First Home Owner programs and down payment assistance in target provinces",
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
                completed: false
              },
              {
                name: "Set up dedicated down payment savings account with automatic transfers",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Pay Off $10,000 Student Debt",
        description: "Eliminate manageable portion of student loans for improved cash flow",
        icon: "card-outline",
        explanation: "Average debt load $28,000-32,000 takes 9.5 years to repay. Federal student loan interest at 2.45% affects 1.7 million Canadians, causes 17.6% of Ontario insolvencies.",
        projects: [
          {
            name: "Strategic Debt Repayment Plan",
            description: "Create systematic approach to pay off $10,000 of student debt",
            explanation: "Even partial repayment provides psychological relief and improved cash flow, transformative for financial confidence and life decision-making.",
            tasks: [
              {
                name: "List all student debts with balances and interest rates to prioritize repayment strategy",
                completed: false
              },
              {
                name: "Create monthly payment plan to eliminate $10,000 of highest-priority student debt",
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
                completed: false
              },
              {
                name: "Plan how to redirect debt payments toward other financial goals once target is reached",
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
        name: "Develop Sustainable Mental Health Practices",
        description: "Build comprehensive mental wellness support using Canadian healthcare resources",
        icon: "happy-outline",
        explanation: "42% of employees rate wellbeing as fair or poor. 24% experience constant burnout. Federal government investing $500 million in youth mental health programs.",
        projects: [
          {
            name: "Mental Health Support System",
            description: "Access Canada's mental health resources and build emotional resilience",
            explanation: "Universal healthcare covers basic mental health services and workplace cultures increasingly support mental wellness initiatives with growing societal acceptance.",
            tasks: [
              {
                name: "Connect with mental health resources through Canada's healthcare system or employee benefits",
                completed: false
              },
              {
                name: "Establish regular therapy or counseling routine and develop daily wellness practices",
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
                completed: false
              },
              {
                name: "Create daily routines that help transition between work and personal life",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Functional Strength and Mobility",
        description: "Develop practical fitness that supports everyday activities and long-term health",
        icon: "barbell-outline",
        explanation: "76% of millennials consider themselves active but cardiorespiratory fitness declining nationally. Focus on functional movement over aesthetic goals.",
        projects: [
          {
            name: "Functional Fitness Foundation",
            description: "Build strength and mobility that improves daily quality of life",
            explanation: "Functional fitness addresses Canada's aging demographic concerns while supporting preventive health approach of universal healthcare system.",
            tasks: [
              {
                name: "Choose 3 physical activities focusing on functional movement you can do consistently",
                completed: false
              },
              {
                name: "Schedule 150+ minutes of moderate exercise weekly meeting national health guidelines",
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
                completed: false
              },
              {
                name: "Use Canadian outdoor opportunities for active transportation and recreation",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Establish Preventive Health Optimization",
        description: "Build comprehensive approach to preventing chronic disease and optimizing wellness",
        icon: "medical-outline",
        explanation: "84% of Gen Z and 79% of millennials actively tried improving health last year. New national pharmacare program covers contraceptives and diabetes medications.",
        projects: [
          {
            name: "Preventive Care System",
            description: "Use Canada's healthcare system for comprehensive preventive health approach",
            explanation: "Universal healthcare covers regular screenings. Preventive care becomes more accessible and actionable for budget-conscious young professionals.",
            tasks: [
              {
                name: "Schedule annual health check-up with GP including blood tests and recommended screenings",
                completed: false
              },
              {
                name: "Create nutrition and sleep optimization plan based on Canadian health guidelines",
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
                completed: false
              },
              {
                name: "Establish consistent sleep schedule of 7-8 hours nightly for optimal health",
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
        name: "Master Textual Chemistry",
        description: "Develop effective digital communication skills for modern dating success",
        icon: "chatbubble-outline",
        explanation: "67% of Canadian singles prefer texting as primary communication. 68% follow 'no wait' response protocols. 29% use AI for dating assistance, 80% use dating apps.",
        projects: [
          {
            name: "Digital Dating Communication",
            description: "Master text and app-based communication for relationship building",
            explanation: "Digital communication skills determine relationship success when 54% work remotely and miss traditional social opportunities for meeting people.",
            tasks: [
              {
                name: "Learn effective text conversation techniques and response timing for dating apps",
                completed: false
              },
              {
                name: "Practice authentic communication that builds genuine connection through digital platforms",
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
                completed: false
              },
              {
                name: "Develop dating strategy that focuses on quality connections over quantity of matches",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Budget-Friendly Romance",
        description: "Create meaningful romantic connections without financial strain",
        icon: "heart-outline",
        explanation: "35% have passed on dates due to financial constraints, 24% plan to spend less on dating. Housing costs consume one-third of income, requiring creative approaches.",
        projects: [
          {
            name: "Creative Dating Strategy",
            description: "Develop romantic connections through creativity rather than expensive consumption",
            explanation: "50% would consider moving in together sooner to save money, showing how economic pressures reshape relationship timelines and require financial transparency.",
            tasks: [
              {
                name: "Plan creative, low-cost date ideas that focus on connection rather than spending",
                completed: false
              },
              {
                name: "Have honest conversations about financial constraints and creative relationship building",
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
                completed: false
              },
              {
                name: "Create budget for dating and relationship activities that aligns with other financial goals",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Beat the Loneliness Epidemic",
        description: "Build authentic community connections beyond social media",
        icon: "people-outline",
        explanation: "52% of Canadians feel lonely weekly. 77% of Gen Z and 72% of millennials experience regular loneliness. Remote work eliminated traditional workplace friendships.",
        projects: [
          {
            name: "In-Person Community Building",
            description: "Create real community through local activities and intergenerational relationships",
            explanation: "This goal moves beyond social media to build real community that combats isolation created by remote work and digital-first social interactions.",
            tasks: [
              {
                name: "Join local activities, clubs, or groups where you can meet like-minded people regularly",
                completed: false
              },
              {
                name: "Reach out to existing friends and schedule regular in-person social activities",
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
                completed: false
              },
              {
                name: "Make effort to deepen existing friendships through vulnerable conversations and quality time",
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
        name: "Master Digital Literacy and AI Tools",
        description: "Develop comprehensive technology skills for Canadian workplace competitiveness",
        icon: "laptop-outline",
        explanation: "51% of hiring managers identify AI skills as in-demand. 47% of Gen Z report AI increases work efficiency. 90% of Canadian employers experience skills gaps.",
        projects: [
          {
            name: "AI and Digital Skills Development",
            description: "Learn practical AI applications and digital tools for your profession",
            explanation: "Ability to leverage AI tools effectively increasingly determines professional success across all industries in Canada's evolving job market.",
            tasks: [
              {
                name: "Identify AI tools and digital platforms most relevant to your industry and role",
                completed: false
              },
              {
                name: "Complete online courses in AI applications and digital literacy for your profession",
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
                completed: false
              },
              {
                name: "Share knowledge through presentations or training to build professional reputation",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Achieve French Language Proficiency",
        description: "Develop bilingual capability for unique Canadian career advantage",
        icon: "language-outline",
        explanation: "Bilingualism opens federal employment and salary bonuses. Government-funded Mauril app has 64% of users learning French. Remote work enables Quebec job market access.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "conversational",
            name: "Conversational Proficiency",
            description: "Develop ability to have basic work and social conversations in French"
          },
          {
            id: "professional",
            name: "Professional Bilingualism",
            description: "Achieve business-level French for federal jobs and Quebec market access"
          },
          {
            id: "cultural",
            name: "Cultural Integration",
            description: "Learn French to connect with Quebecois culture and communities"
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
                completed: false
              },
              {
                name: "Set specific French proficiency goals and timeline based on career objectives",
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
                completed: false
              },
              {
                name: "Apply French skills in work context or seek opportunities requiring bilingual capability",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Obtain Professional Certifications",
        description: "Earn industry credentials that advance career in Canadian job market",
        icon: "school-outline",
        explanation: "49% of employers upskill employees, 43% provide certification funding. $351.2 million committed to youth employment programs creating 90,000 placements.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "tech",
            name: "Technology Certifications",
            description: "Earn tech industry credentials in high-demand areas like cloud, AI, or cybersecurity"
          },
          {
            id: "healthcare",
            name: "Healthcare Professional Designations",
            description: "Pursue healthcare certifications with loan forgiveness options in rural areas"
          },
          {
            id: "green-economy",
            name: "Green Economy Credentials",
            description: "Get certified in environmental, sustainability, or clean energy sectors"
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
                completed: false
              },
              {
                name: "Enroll in certification program and create study timeline for completion",
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
                completed: false
              },
              {
                name: "Leverage new certification for promotion, salary increase, or job advancement",
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
        name: "Explore Canada Through Epic Adventures",
        description: "Discover diverse Canadian regions through meaningful domestic travel",
        icon: "airplane-outline",
        explanation: "71% prefer domestic destinations. Travel spending reached $129.6 billion in 2024. 44% plan provincial exploration, 45% want interprovincial adventures.",
        projects: [
          {
            name: "Canadian Discovery Planning",
            description: "Create systematic approach to exploring Canada's diverse provinces and regions",
            explanation: "52% planning solo travel and domestic tourism exceeding pre-COVID levels, this goal combines adventure with fiscal responsibility.",
            tasks: [
              {
                name: "Create Canadian travel bucket list with specific destinations and seasonal experiences",
                completed: false
              },
              {
                name: "Plan and budget for quarterly domestic adventures exploring different provinces",
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
                completed: false
              },
              {
                name: "Complete first planned Canadian destination trip and document experience for future planning",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Master Four-Season Outdoor Activities",
        description: "Develop skills for year-round enjoyment of Canada's distinct seasons",
        icon: "snow-outline",
        explanation: "21 million+ ski visits in 2022/23 set new records. 2.8 million active skiers/snowboarders. Learning seasonal activities builds lifelong community connections.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "winter-sports",
            name: "Winter Sports Mastery",
            description: "Learn skiing, snowboarding, or ice skating for winter enjoyment"
          },
          {
            id: "summer-outdoor",
            name: "Summer Outdoor Adventures",
            description: "Develop hiking, camping, cycling, or water sport skills"
          },
          {
            id: "year-round",
            name: "Year-Round Activity System",
            description: "Build skills for activities in all four Canadian seasons"
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
                completed: false
              },
              {
                name: "Practice chosen activity regularly and connect with others who share the interest",
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
                completed: false
              },
              {
                name: "Join outdoor clubs or groups that participate in your chosen seasonal activities",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Create Through Hobby Renaissance",
        description: "Develop fulfilling creative hobbies that connect cooking, creating, and community",
        icon: "palette-outline",
        explanation: "Cooking and reading rank as top Canadian hobbies, with 80% engaging in reading. Culinary exploration celebrates Canada's multicultural cities.",
        projects: [
          {
            name: "Creative Skill Development",
            description: "Choose and develop creative hobbies that provide personal satisfaction",
            explanation: "Home-based hobbies gained permanent popularity during pandemic, making this goal both economically smart and socially enriching.",
            tasks: [
              {
                name: "Choose creative hobby (cooking ethnic cuisines, writing, art, music) and set up practice space",
                completed: false
              },
              {
                name: "Practice chosen creative skill regularly and track progress toward competency goals",
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
                completed: false
              },
              {
                name: "Share your creative work with others through hosting, teaching, or community participation",
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
        name: "Lead Climate Action Initiative",
        description: "Channel climate anxiety into concrete local environmental impact",
        icon: "leaf-outline",
        explanation: "62% believe Canada should lead on climate action. 78% report climate change impacts mental health. 58% increasing sustainable transport, 64% cutting single-use plastics.",
        projects: [
          {
            name: "Local Climate Leadership",
            description: "Lead community environmental initiative for visible impact within 1-3 years",
            explanation: "This goal channels anxiety into agency through local environmental groups, community cleanups, and municipal advocacy that creates measurable change.",
            tasks: [
              {
                name: "Join or start local environmental group focused on specific climate action in your community",
                completed: false
              },
              {
                name: "Lead specific climate initiative (community garden, cleanup, advocacy) with measurable goals",
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
                completed: false
              },
              {
                name: "Engage others in climate action through education, events, or social media advocacy",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Purpose-Driven Side Business",
        description: "Create meaningful income stream that aligns with personal values",
        icon: "storefront-outline",
        explanation: "28% have side hustles (up from 13% in 2022). 66% of millennials/Gen Z plan to start one. 89-92% consider purpose essential, 49% want to 'be their own boss'.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "social-impact",
            name: "Social Impact Business",
            description: "Create business that addresses social problems or community needs"
          },
          {
            id: "environmental",
            name: "Environmental Solutions",
            description: "Develop business focused on sustainability or environmental improvement"
          },
          {
            id: "creative-services",
            name: "Creative Services with Purpose",
            description: "Offer creative services that support causes or meaningful organizations"
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
                completed: false
              },
              {
                name: "Create business plan and launch with focus on both profitability and purpose",
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
                completed: false
              },
              {
                name: "Optimize business model to balance purpose-driven impact with financial sustainability",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Use Skills for Community Volunteering",
        description: "Apply professional expertise to meaningful causes through strategic volunteering",
        icon: "heart-outline",
        explanation: "Canadian millennials volunteer more hours for environmental causes than older adults. 93% motivated by community contribution, 78% want to use professional skills.",
        projects: [
          {
            name: "Skills-Based Volunteer Strategy",
            description: "Apply professional skills through board positions or mentoring programs",
            explanation: "Strategic volunteering through board positions or mentoring creates career networks while contributing meaningfully, transforming networking from transactional to purposeful.",
            tasks: [
              {
                name: "Research nonprofit organizations that could benefit from your professional skills",
                completed: false
              },
              {
                name: "Commit to regular volunteer role that utilizes your expertise (board member, mentor, advisor)",
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
                completed: false
              },
              {
                name: "Build relationships with other volunteers and community leaders who share your values",
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
        name: "Create Affordable Home Office Space",
        description: "Design productive workspace that supports remote work and claims tax benefits",
        icon: "laptop-outline",
        explanation: "50% of federal office space sits underused, hybrid work standard. CRA's $500 home office deduction recognizes necessity. Proper workspace impacts mental health and performance.",
        projects: [
          {
            name: "Home Office Setup and Optimization",
            description: "Create dedicated workspace that maximizes productivity and tax benefits",
            explanation: "Converting basements, optimizing storage, and upgrading technology creates productivity gains that justify investment while claiming tax deductions.",
            tasks: [
              {
                name: "Set up dedicated home office space and ensure it meets CRA requirements for tax deduction",
                completed: false
              },
              {
                name: "Invest in ergonomic furniture and technology that supports long-term productivity and health",
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
                completed: false
              },
              {
                name: "Organize storage and systems that support both professional and personal activities",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Navigate Path to Homeownership",
        description: "Develop strategic approach to eventual homeownership despite affordability challenges",
        icon: "home-outline",
        explanation: "Homeownership rates for 25-29 dropped from 44% to 36.5%. 73% highly concerned about affordability but new 30-year mortgages and enhanced buyer programs available.",
        projects: [
          {
            name: "Strategic Homeownership Planning",
            description: "Create long-term plan that maximizes government programs and location flexibility",
            explanation: "This goal requires strategic planning including maximizing government programs, considering smaller markets, and exploring co-ownership models over 2-3 years.",
            tasks: [
              {
                name: "Research and maximize First Home Savings Account, Home Buyers' Plan, and regional programs",
                completed: false
              },
              {
                name: "Evaluate different markets and consider 'Goldilocks zones' - areas with optimal affordability-opportunity balance",
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
                completed: false
              },
              {
                name: "Build credit score and financial profile to qualify for best mortgage rates when ready",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Eco-Conscious Living Space",
        description: "Create sustainable living environment that reflects environmental values",
        icon: "leaf-outline",
        explanation: "80% pay 9.7% more for sustainable goods, 85% experience climate impacts. Over 90% concerned about packaging waste, 46% actively buying sustainable products.",
        projects: [
          {
            name: "Sustainable Living Implementation",
            description: "Transform living space through zero-waste practices and sustainable furnishings",
            explanation: "Moving beyond stark minimalism toward personalized sustainable spaces, this goal implements values-driven living that reduces environmental impact.",
            tasks: [
              {
                name: "Implement zero-waste practices and sustainable purchasing decisions in your living space",
                completed: false
              },
              {
                name: "Choose furnishings and products from companies whose environmental practices align with your values",
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
                completed: false
              },
              {
                name: "Set up composting, recycling, and waste reduction systems appropriate for your living situation",
                completed: false
              }
            ]
          }
        ]
      }
    ]
  }
];
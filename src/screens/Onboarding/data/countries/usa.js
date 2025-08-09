// src/screens/Onboarding/data/countries/usa.js
// USA-specific domain definitions with refined goals based on 2024-2025 research
export const DOMAIN_DEFINITIONS = [
  {
    name: "Career & Work",
    icon: "briefcase",
    color: "#3b82f6", // Blue
    description: "Professional advancement, workplace goals, career development",
    goals: [
      {
        name: "Master Work-Life Balance",
        description: "Achieve sustainable integration between career success and personal wellbeing",
        icon: "scale",
        explanation: "Work-life balance has become the #1 priority when choosing employers, with 65% of Gen Z preferring hybrid work and 83% ranking balance above pay for the first time in history.",
        projects: [
          {
            name: "Flexible Work Arrangement",
            description: "Negotiate and maintain work arrangements that support life integration",
            explanation: "77% willing to leave employers requiring full return-to-office. Hybrid work preferences have fundamentally changed workplace expectations.",
            tasks: [
              {
                name: "Document your productivity metrics and propose flexible work arrangement to manager",
                summary: "Propose flexible",
                explanation: "77% of workers are willing to leave employers requiring full return-to-office. Presenting data-driven productivity evidence creates compelling case for flexible arrangements that benefit both employee and company.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Establish clear work hours and communicate boundaries to protect personal time",
                summary: "Set boundaries",
                explanation: "Work-life boundary setting prevents burnout and maintains long-term productivity. Clear communication of availability reduces after-hours expectations and protects mental health while maintaining professional relationships.",
                timeframe: "1 week",
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
                summary: "Work routines",
                explanation: "Transition rituals help your brain shift between work and personal modes, reducing stress and improving focus in both areas. This becomes especially critical with work-from-home arrangements where physical boundaries are blurred.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Identify stress triggers and develop specific coping strategies for each",
                summary: "Manage stress",
                explanation: "Proactive stress management prevents chronic anxiety and burnout while improving job performance. Understanding your personal triggers allows you to develop targeted responses that maintain effectiveness under pressure.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Career-Advancing Skills",
        description: "Develop future-ready capabilities that guarantee career growth and advancement",
        icon: "trending-up",
        explanation: "70% of Gen Z expect promotion within first 18 months. With rapid technological change, continuous skill development has become critical for career security.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "data-analytics",
            name: "Data Analytics & Business Intelligence",
            description: "Master data analysis, Excel, and business intelligence tools",
            projects: [
              {
                name: "Data Analytics Mastery",
                description: "Master essential data analysis tools for American business environment",
                explanation: "Data-driven decision making critical in US market. Analytics skills provide competitive advantage across all industries.",
                tasks: [
                  {
                    name: "Complete Google Data Analytics Certificate or similar comprehensive program",
                    summary: "Data certified",
                    explanation: "Google Data Analytics Certificate provides industry-recognized credentials that can lead to $75,000+ starting salaries. Structured programs offer hands-on experience with real datasets and tools used by major companies.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Master Excel advanced functions, SQL, and Tableau for business intelligence",
                    summary: "Master tools",
                    explanation: "Excel and SQL are foundational skills for 90% of data-related roles, while Tableau visualization skills command premium salaries. These tools are immediately applicable in most business environments for career advancement.",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Business Intelligence Application",
                description: "Apply data skills to solve real business problems and build portfolio",
                explanation: "Portfolio demonstration of data skills essential for US career advancement. Measurable business impact through analytics highly valued.",
                tasks: [
                  {
                    name: "Create 3 portfolio projects showing data analysis solving business problems",
                    summary: "Data portfolio",
                    explanation: "Portfolio projects demonstrate practical problem-solving ability that employers value more than certifications alone. Real business case studies show your ability to translate data insights into actionable recommendations.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Present data insights to management and document business impact",
                    summary: "Present insights",
                    explanation: "Communication skills separate good analysts from great ones. Presenting findings to leadership builds visibility and demonstrates your ability to translate complex data into business value.",
                    timeframe: "1 month",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "ai-ml",
            name: "AI & Machine Learning Applications",
            description: "Learn practical AI tools and machine learning fundamentals",
            projects: [
              {
                name: "AI Tools for Business",
                description: "Master practical AI applications for workplace productivity and innovation",
                explanation: "74% believe AI will impact their work within a year. Early AI adoption provides significant competitive advantage in US job market.",
                tasks: [
                  {
                    name: "Master ChatGPT, Claude, and other AI tools for business productivity applications",
                    summary: "Master AI tools",
                    explanation: "AI tools can automate repetitive tasks, enhance decision-making, and boost productivity by 30-50%. Learning these tools early positions you as an innovator in your workplace and significantly increases your value to employers in an AI-driven economy.",
                    timeframe: "2 months",
                    completed: false
                  },
                  {
                    name: "Implement AI tools in current work to improve efficiency and demonstrate value",
                    summary: "Apply AI tools",
                    explanation: "Demonstrating AI implementation in your current role showcases innovation and provides concrete examples of your value-add. This practical experience becomes powerful evidence during performance reviews and job interviews, setting you apart from peers.",
                    timeframe: "1 month",
                    completed: false
                  }
                ]
              },
              {
                name: "Machine Learning Foundations",
                description: "Build technical ML skills for advanced career opportunities",
                explanation: "ML skills command premium salaries in US market. Technical competency opens doors to high-growth tech roles.",
                tasks: [
                  {
                    name: "Complete Stanford Machine Learning Course or Google ML Certificate",
                    summary: "ML certified",
                    explanation: "Stanford ML Course (Andrew Ng) is gold standard for ML education, while Google certificates provide practical industry skills. These credentials can lead to $95,000+ starting salaries in tech.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Build ML project portfolio demonstrating practical problem-solving capabilities",
                    summary: "ML portfolio",
                    explanation: "ML portfolios showcase your ability to solve real-world problems using data science techniques. Projects demonstrating end-to-end ML pipelines (data collection, modeling, deployment) are essential for technical interviews.",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "leadership",
            name: "Leadership & Communication Skills",
            description: "Develop soft skills for management and team leadership roles",
            projects: [
              {
                name: "Leadership Skill Development",
                description: "Build essential leadership capabilities for American workplace advancement",
                explanation: "86% prioritize soft skills as more important than technical abilities for advancement. Leadership skills critical for promotion.",
                tasks: [
                  {
                    name: "Complete leadership training program or join Toastmasters for communication skills",
                    summary: "Leadership train",
                    explanation: "Toastmasters membership costs under $50 annually but provides structured environment to develop public speaking and leadership skills valued by 86% of employers. Communication skills are the top differentiator for promotions.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Volunteer to lead projects or initiatives to practice leadership skills",
                    summary: "Lead projects",
                    explanation: "Leadership experience through project management demonstrates initiative and builds confidence for future management roles. Volunteering for stretch assignments shows ambition and provides safe environment to develop skills.",
                    timeframe: "Ongoing",
                    completed: false
                  }
                ]
              },
              {
                name: "Management Readiness",
                description: "Prepare for management roles through practical leadership experience",
                explanation: "70% of Gen Z expect promotion within 18 months. Leadership demonstration essential for meeting advancement expectations.",
                tasks: [
                  {
                    name: "Mentor junior colleagues and document leadership impact on team performance",
                    summary: "Mentor others",
                    explanation: "Mentoring others demonstrates leadership readiness and builds relationships that support career advancement. Documenting your impact on team development provides concrete evidence of leadership value during performance reviews.",
                    timeframe: "Ongoing",
                    completed: false
                  },
                  {
                    name: "Apply for management positions or propose team leadership opportunities",
                    summary: "Apply management",
                    explanation: "Proactively seeking leadership roles shows career ambition and positions you ahead of peers waiting for opportunities. Creating proposals for new initiatives demonstrates strategic thinking valued in management candidates.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              }
            ]
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
                summary: "Research skills",
                explanation: "Strategic skill development requires understanding market demand to ensure your investment of time and effort leads to career opportunities. Job market data reveals which skills command highest salaries and growth potential.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Enroll in certification program or course for chosen skill area",
                summary: "Enroll course",
                explanation: "Formal certification provides structured learning path and industry recognition that employers value. Investing in education shows commitment to professional growth and provides networking opportunities with peers and instructors.",
                timeframe: "2 weeks",
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
                summary: "Showcase skills",
                explanation: "Visibility of your new capabilities is crucial for advancement opportunities. Volunteering for high-profile projects demonstrates initiative while providing platform to apply and showcase newly acquired skills to decision makers.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Share knowledge through presentations or mentoring to build professional reputation",
                summary: "Share knowledge",
                explanation: "Teaching others establishes you as subject matter expert and builds internal network of allies. Knowledge sharing creates value for the organization while positioning you as thought leader and go-to resource for expertise.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Find Purpose-Driven Work",
        description: "Land meaningful role that aligns with personal values and impact goals",
        icon: "heart",
        explanation: "89% of Gen Z and 92% of millennials consider purpose essential for job satisfaction. 44% have actually left jobs lacking purpose, and 40% reject employers based on personal ethics.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "environmental",
            name: "Environmental & Sustainability Roles",
            description: "Work in roles focused on environmental protection, sustainability, or climate action",
            projects: [
              {
                name: "Environmental Career Transition",
                description: "Transition into roles focused on environmental protection and sustainability",
                explanation: "Climate action increasingly important to young Americans. Environmental sector offers purpose-driven career opportunities with growth potential.",
                tasks: [
                  {
                    name: "Research environmental organizations and sustainability roles in your area of expertise",
                    summary: "Research env roles",
                    explanation: "Environmental careers combine professional growth with meaningful impact addressing climate concerns. Research helps identify transferable skills and entry points into purpose-driven work that aligns with personal values.",
                    completed: false
                  },
                  {
                    name: "Network with environmental professionals and apply for sustainability-focused positions",
                    summary: "Network env pros",
                    explanation: "Environmental sector networking reveals hidden job opportunities and provides mentorship from professionals who've made similar transitions. Industry connections often lead to referrals and inside knowledge about openings.",
                    completed: false
                  }
                ]
              },
              {
                name: "Climate Impact Career Development",
                description: "Build career focused on meaningful climate and environmental impact",
                explanation: "Purpose-driven environmental work addresses climate anxiety while providing meaningful career direction aligned with values.",
                tasks: [
                  {
                    name: "Volunteer with environmental organizations to build experience and network",
                    summary: "Volunteer env",
                    explanation: "Environmental volunteering provides hands-on experience and demonstrates genuine commitment to the cause. Volunteer networks often become professional networks, leading to job opportunities and industry connections.",
                    completed: false
                  },
                  {
                    name: "Develop expertise in environmental issues relevant to your professional skills",
                    summary: "Build env expertise",
                    explanation: "Combining existing professional skills with environmental knowledge creates unique value proposition. Specialized expertise in areas like environmental data analysis or sustainable business practices opens niche career opportunities.",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "social-services",
            name: "Healthcare & Social Services",
            description: "Contribute to healthcare, social services, or community development",
            projects: [
              {
                name: "Healthcare Career Path",
                description: "Transition into healthcare or social services roles for direct community impact",
                explanation: "Healthcare and social services offer direct community impact and job security. Growing demand creates opportunities for career changers.",
                tasks: [
                  {
                    name: "Research healthcare/social service roles that match your skills and interests",
                    summary: "Research health roles",
                    explanation: "Healthcare and social services offer job security and growth opportunities while providing direct community impact. Research helps identify how your existing skills transfer to meaningful roles helping others.",
                    completed: false
                  },
                  {
                    name: "Complete necessary certifications or training for healthcare/social service transition",
                    summary: "Get certified",
                    explanation: "Professional certifications provide credibility and ensure you meet industry standards for helping vulnerable populations. Training programs often include practical experience and networking with potential employers.",
                    completed: false
                  }
                ]
              },
              {
                name: "Community Impact Maximization",
                description: "Build career focused on direct service to underserved communities",
                explanation: "Social services career addresses societal needs while providing personal fulfillment through direct community impact.",
                tasks: [
                  {
                    name: "Volunteer in healthcare or social service settings to gain experience",
                    summary: "Volunteer health",
                    explanation: "Volunteering provides exposure to daily realities of healthcare/social work while building experience for future applications. Many organizations offer volunteer-to-employee pathways for committed volunteers.",
                    completed: false
                  },
                  {
                    name: "Apply for positions in community health, social work, or nonprofit organizations",
                    summary: "Apply health jobs",
                    explanation: "Community health and social work positions provide direct impact on underserved populations while offering career stability and growth. Nonprofit organizations often value diverse backgrounds and transferable skills.",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "education",
            name: "Education & Community Impact",
            description: "Work in education, training, or social impact organizations",
            projects: [
              {
                name: "Education Career Development",
                description: "Transition into education or training roles for long-term community impact",
                explanation: "Education careers offer direct impact on future generations while providing personal fulfillment through knowledge sharing.",
                tasks: [
                  {
                    name: "Research education opportunities (teaching, training, educational technology)",
                    summary: "Research education",
                    explanation: "Education careers offer direct impact on future generations while providing intellectual stimulation and personal fulfillment. Alternative certification programs and educational technology roles expand entry opportunities beyond traditional teaching.",
                    completed: false
                  },
                  {
                    name: "Complete teaching certification or educational training requirements",
                    summary: "Get certified",
                    explanation: "Teaching certification opens doors to stable career with meaningful impact on students' lives. Alternative certification programs accommodate career changers, while specialized training in areas like special education or STEM command higher salaries.",
                    completed: false
                  }
                ]
              },
              {
                name: "Social Impact Organization Career",
                description: "Build career in nonprofit or social impact organizations",
                explanation: "Social impact organizations combine professional growth with meaningful contribution to societal challenges.",
                tasks: [
                  {
                    name: "Network with social impact organizations and identify role opportunities",
                    summary: "Network impact orgs",
                    explanation: "Social impact organizations value mission-driven candidates and offer diverse role opportunities beyond direct service. Networking reveals how business, technology, and other skills apply to social change work.",
                    completed: false
                  },
                  {
                    name: "Apply skills to volunteer projects with nonprofits to demonstrate commitment and build experience",
                    summary: "Skills volunteer",
                    explanation: "Skills-based volunteering showcases your capabilities while building nonprofit sector experience. Many organizations prefer hiring volunteers who've demonstrated commitment and understanding of their mission and operations.",
                    completed: false
                  }
                ]
              }
            ]
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
                summary: "Define values",
                explanation: "Values clarity prevents accepting roles that lead to dissatisfaction and turnover. Research helps identify organizations whose mission and culture genuinely match your principles, leading to higher job satisfaction and performance.",
                completed: false
              },
              {
                name: "Network with professionals working in purpose-driven roles in your chosen area",
                summary: "Network purpose pros",
                explanation: "Purpose-driven professionals often share insights about industry challenges and opportunities that aren't visible from outside. Their experiences help you understand realistic expectations and pathways for transition.",
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
                summary: "Add impact",
                explanation: "Finding purpose in your current role can increase job satisfaction without requiring career change. Small modifications to add community impact or align with values can transform work experience while building skills.",
                completed: false
              },
              {
                name: "Apply for purpose-driven positions or propose impact initiatives at work",
                summary: "Apply purpose jobs",
                explanation: "Taking initiative to create or join purpose-driven work demonstrates leadership while addressing values alignment. Proposing new initiatives shows strategic thinking and can lead to promotion opportunities within current organization.",
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
        name: "Build 6-Month Emergency Fund",
        description: "Create financial security buffer for true peace of mind and stability",
        icon: "shield",
        explanation: "48% of Gen Z and 46% of millennials feel financially insecure with 60% living paycheck to paycheck. Emergency funds provide the foundation enabling all other life goals.",
        projects: [
          {
            name: "Emergency Fund Foundation",
            description: "Calculate target amount and establish systematic saving plan",
            explanation: "Financial insecurity directly impacts mental health and job satisfaction. Without financial security, workers less likely to find work meaningful.",
            tasks: [
              {
                name: "Calculate 6 months of essential expenses to determine your emergency fund target",
                summary: "Calculate fund",
                explanation: "Knowing your exact emergency fund target provides clear savings goal and peace of mind. Calculating only essential expenses (not lifestyle spending) makes the target achievable while ensuring adequate protection.",
                timeframe: "1 day",
                completed: false
              },
              {
                name: "Open high-yield savings account and set up automatic weekly transfers",
                summary: "Setup savings",
                explanation: "High-yield savings accounts earn 10-20x more than traditional savings while automation ensures consistent progress without relying on willpower. Separate emergency fund account reduces temptation to spend money.",
                timeframe: "1 week",
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
                summary: "Track expenses",
                explanation: "Expense tracking reveals spending patterns you're unaware of and identifies easy wins for reducing costs. Most people find $200-500 monthly in unnecessary spending that can be redirected to emergency savings.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Research ways to increase income through side work or salary negotiation",
                summary: "Research income",
                explanation: "Income increases have more impact on emergency fund building than expense cuts alone. Salary negotiation can provide immediate 10-20% boost, while side work offers additional income streams for faster goal achievement.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Pay Off High-Interest Debt",
        description: "Eliminate credit card and high-interest debt to unlock financial freedom",
        icon: "card",
        explanation: "Over 40% prioritize debt settlement as their top financial goal. With average student debt at $33,260 for 25-34 age group plus consumer debt, this addresses their biggest financial burden.",
        projects: [
          {
            name: "Strategic Debt Elimination",
            description: "Create systematic plan to pay off all high-interest debt",
            explanation: "Rising interest rates make debt more expensive while housing costs require debt-free profiles for mortgage qualification.",
            tasks: [
              {
                name: "List all debts with balances, interest rates, and minimum payments",
                summary: "List debts",
                explanation: "Complete debt inventory provides clarity on your financial situation and enables strategic payoff planning. Understanding interest rates helps prioritize which debts to tackle first for maximum financial impact.",
                timeframe: "1 day",
                completed: false
              },
              {
                name: "Create debt payoff strategy prioritizing highest-interest debt first",
                summary: "Debt strategy",
                explanation: "Avalanche method (highest interest first) saves thousands in interest payments compared to minimum payments. Clear strategy provides motivation and measurable progress toward financial freedom.",
                timeframe: "1 week",
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
                summary: "Create budget",
                explanation: "Budgeting prevents the cycle of debt accumulation that undermines financial progress. A realistic budget balances debt payoff with quality of life, making the process sustainable long-term.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Build emergency fund to avoid using credit for unexpected expenses",
                summary: "Build fund",
                explanation: "Emergency funds break the debt cycle by eliminating need to use credit for unexpected expenses. Even a small $1,000 emergency fund prevents most financial emergencies from becoming debt.",
                timeframe: "12 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Start Long-Term Investing",
        description: "Begin consistent investing to build wealth for major life goals",
        icon: "trending-up",
        explanation: "Housing requires $114,000+ income but average salary only $65,470. Investment growth becomes essential as median first-time homebuyer age has risen to 38 from 28 in 1991.",
        projects: [
          {
            name: "Investment Foundation Setup",
            description: "Open investment accounts and begin systematic investing",
            explanation: "Traditional wealth-building path (homeownership) now requires capital first. Time is biggest asset for compound growth.",
            tasks: [
              {
                name: "Open investment accounts (401k, IRA, brokerage) and research low-cost index funds",
                summary: "Open accounts",
                explanation: "Starting early maximizes compound growth over decades. Low-cost index funds provide diversified market exposure with minimal fees, historically returning 7-10% annually over long periods.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Set up automatic monthly investments of $200+ into diversified portfolio",
                summary: "Auto investing",
                explanation: "Automatic investing ensures consistency and removes emotional decision-making from investing. Dollar-cost averaging through regular investments reduces market timing risk while building wealth systematically.",
                timeframe: "1 week",
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
                summary: "Learn investing",
                explanation: "Investment education prevents costly mistakes and builds confidence for long-term wealth building. Understanding fundamentals like diversification and risk tolerance enables smarter investment decisions throughout life.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Create long-term investment plan aligned with major life goals (home, retirement)",
                summary: "Investment plan",
                explanation: "Goal-based investing provides purpose and timeline for investment strategy. Different goals require different approaches - home down payment needs shorter-term growth while retirement benefits from longer-term strategies.",
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
    name: "Health & Wellness",
    icon: "fitness",
    color: "#06b6d4", // Cyan
    description: "Physical fitness, mental health, nutrition, and overall wellbeing",
    goals: [
      {
        name: "Master Quality Sleep",
        description: "Achieve consistent 7-8 hours of restorative sleep for optimal health and performance",
        icon: "moon",
        explanation: "Sleep quality ranks as top 3 wellness priority, with 54% prioritizing sleep improvement. The sleep crisis affects 70% of this age group who don't get recommended amounts.",
        projects: [
          {
            name: "Sleep Hygiene System",
            description: "Create environment and routines that support quality sleep",
            explanation: "Post-pandemic screen time increases and work-from-home boundary issues make quality sleep increasingly elusive but highly valued.",
            tasks: [
              {
                name: "Establish consistent bedtime routine and sleep schedule for 7-8 hours nightly",
                summary: "Fix sleep",
                explanation: "Quality sleep improves cognitive function, emotional regulation, and physical health while reducing stress and anxiety. Consistent sleep schedule regulates circadian rhythms for better energy and mood throughout the day.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Optimize bedroom environment (temperature, lighting, electronics) for better sleep",
                summary: "Optimize bedroom",
                explanation: "Sleep environment significantly impacts sleep quality and duration. Cool temperature (65-68°F), blackout curtains, and removing electronics create optimal conditions for restorative sleep and improved daily performance.",
                timeframe: "1 week",
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
                summary: "Wind-down routine",
                explanation: "Blue light from screens disrupts melatonin production and makes it harder to fall asleep. A consistent wind-down routine signals to your body that it's time to prepare for sleep, improving both sleep onset and quality.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Practice relaxation techniques (meditation, breathing) to manage sleep anxiety",
                summary: "Relaxation",
                explanation: "Relaxation techniques reduce cortisol and activate the parasympathetic nervous system, making it easier to fall and stay asleep. Regular practice builds skills for managing anxiety and stress that interfere with sleep.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Fitness Routine",
        description: "Create sustainable exercise habits for lifelong physical and mental health",
        icon: "barbell",
        explanation: "72% of millennials and 73% of Gen Z use fitness facilities with 88% prioritizing physical fitness. Yet 44% of Gen Z struggle with exercise motivation.",
        projects: [
          {
            name: "Sustainable Exercise Plan",
            description: "Design workout routine that fits your schedule and preferences",
            explanation: "Rising healthcare costs make preventive fitness crucial. Work-from-home culture requires intentional movement for both physical and mental health.",
            tasks: [
              {
                name: "Choose 3-4 physical activities you enjoy and can do consistently",
                summary: "Choose activities",
                explanation: "Enjoyable activities ensure long-term consistency, which is more important than intensity for health benefits. Variety prevents boredom and works different muscle groups while reducing injury risk from repetitive motion.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Schedule 150+ minutes of moderate exercise weekly (CDC guidelines)",
                summary: "Schedule exercise",
                explanation: "Meeting CDC guidelines reduces risk of heart disease, diabetes, and depression while improving energy and cognitive function. Scheduling exercise like appointments increases consistency and prioritizes health in busy schedules.",
                timeframe: "Ongoing",
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
                summary: "Join fitness",
                explanation: "Social accountability significantly increases exercise consistency and enjoyment. Group fitness provides motivation, proper form guidance, and social connection while making workouts more engaging and sustainable.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Track workouts and celebrate progress to maintain motivation",
                summary: "Track fitness",
                explanation: "Progress tracking provides objective evidence of improvement and maintains motivation during challenging periods. Celebrating small wins builds positive associations with exercise and reinforces healthy habits.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Get Regular Mental Health Support",
        description: "Establish therapy or counseling routine for emotional wellbeing and growth",
        icon: "happy",
        explanation: "39% of Gen Z and millennials plan to pursue therapy, with 93% wanting to improve mental health. Only 37% with struggles currently seek care due to cost barriers.",
        projects: [
          {
            name: "Mental Health Care Access",
            description: "Find and establish relationship with mental health professional",
            explanation: "Mental health crisis post-pandemic with reduced stigma around therapy, but high costs create access barriers. Workplace benefits increasingly common.",
            tasks: [
              {
                name: "Research therapists or counselors covered by insurance or employee benefits",
                summary: "Find therapist",
                explanation: "Mental health coverage through insurance or employee benefits makes therapy accessible and affordable. Research helps find qualified therapists who specialize in your specific concerns and accept your insurance.",
                completed: false
              },
              {
                name: "Schedule initial therapy consultation and commit to regular sessions",
                summary: "Start therapy",
                explanation: "Regular therapy provides consistent support for mental health maintenance and growth. Initial consultation helps determine fit with therapist and establishes treatment goals for maximum benefit.",
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
                summary: "Daily mindfulness",
                explanation: "Daily mindfulness practice reduces anxiety, improves focus, and builds emotional resilience. Even 5-10 minutes daily provides measurable mental health benefits and complements professional therapy.",
                completed: false
              },
              {
                name: "Create support network and regularly check in with trusted friends/family",
                summary: "Build support",
                explanation: "Strong social connections are crucial for mental health and provide support during difficult times. Regular check-ins maintain relationships and create opportunities for mutual support and stress relief.",
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
        name: "Build Strong Friendships",
        description: "Create and maintain 3-5 close, supportive friendships for lasting connection",
        icon: "people",
        explanation: "Post-pandemic friendship crisis affects millions, with 22% saying it's been 5+ years since making a new friend. Yet 94% of young adults identify friends as primary social support.",
        projects: [
          {
            name: "Friendship Network Building",
            description: "Actively meet new people and develop meaningful friendships",
            explanation: "53% of Gen Z report loneliness vs 39% of all adults. Remote work reduces organic friendship opportunities, requiring intentional effort.",
            tasks: [
              {
                name: "Join activities, clubs, or groups where you can meet like-minded people",
                summary: "Join groups",
                explanation: "Shared interests provide natural conversation starters and common ground for building friendships. Group activities create regular opportunities for social interaction in low-pressure environments.",
                completed: false
              },
              {
                name: "Reach out to acquaintances and suggest regular social activities",
                summary: "Reach out",
                explanation: "Taking initiative to deepen casual relationships often leads to strong friendships. Many people want closer connections but wait for others to make the first move, making your outreach likely to be welcomed.",
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
                summary: "Schedule calls",
                explanation: "Consistent contact maintains friendship depth and provides reliable social support. Scheduling ensures friendships remain priority despite busy schedules and prevents relationships from weakening due to neglect.",
                completed: false
              },
              {
                name: "Be intentional about deepening friendships through vulnerable conversations",
                summary: "Deepen bonds",
                explanation: "Vulnerability and emotional openness create deeper connections and stronger support systems. Sharing challenges and celebrations builds trust and intimacy that transform acquaintances into close friends.",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Find Long-Term Partner",
        description: "Pursue conscious dating for meaningful romantic partnership",
        icon: "heart",
        explanation: "70% of millennials want marriage and 74% want children eventually. Dating fatigue drives shift toward 'conscious dating' seeking deeper connections over casual encounters.",
        projects: [
          {
            name: "Intentional Dating Strategy",
            description: "Approach dating with clear intentions for long-term partnership",
            explanation: "Only 23% date solely to find spouse; 31% 'slow-date' without specific goals. Values alignment increasingly important in partner selection.",
            tasks: [
              {
                name: "Define your relationship values and what you want in a long-term partner",
                summary: "Define values",
                explanation: "Clear relationship values prevent settling for incompatible partners and guide dating decisions. Understanding your non-negotiables and desires helps identify potential long-term partners more effectively.",
                completed: false
              },
              {
                name: "Choose dating platforms and activities that attract people seeking serious relationships",
                summary: "Choose platforms",
                explanation: "Different platforms and activities attract people with different relationship goals. Choosing environments where serious relationship-seekers gather increases likelihood of finding compatible long-term partners.",
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
                summary: "Authentic dating",
                explanation: "Authentic communication builds genuine connections and helps identify compatible partners early. Vulnerability attracts people seeking real connection while filtering out those interested only in surface-level interactions.",
                completed: false
              },
              {
                name: "Take time to build friendship foundation before pursuing romantic commitment",
                summary: "Build friendship",
                explanation: "Strong friendships form the basis of lasting romantic relationships. Taking time to build friendship foundation ensures compatibility and emotional connection before making romantic commitments.",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Strengthen Family Relationships",
        description: "Develop regular family connection habits and stronger bonds",
        icon: "home",
        explanation: "79% of millennials say family is most important in their lives—higher than any other priority. Post-pandemic emphasized family bonds, but geographic mobility makes maintenance challenging.",
        projects: [
          {
            name: "Family Communication Enhancement",
            description: "Create regular touchpoints and improve communication with family",
            explanation: "Family ranks #1 priority for millennials (79% vs 53% for health). Regular family connection linked to better mental health outcomes.",
            tasks: [
              {
                name: "Schedule regular calls or video chats with parents and siblings",
                summary: "Schedule calls",
                explanation: "Regular communication maintains family bonds despite distance and busy schedules. Consistent contact prevents relationships from weakening and provides emotional support during life transitions.",
                completed: false
              },
              {
                name: "Plan quarterly family gatherings or visits to maintain close bonds",
                summary: "Plan visits",
                explanation: "In-person time creates shared memories and strengthens family connections beyond daily communication. Planning visits ensures family remains priority despite geographic distance and competing demands.",
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
                summary: "Share updates",
                explanation: "Mutual sharing deepens family relationships and maintains emotional intimacy across distances. Regular updates keep family members connected to your life while showing interest in theirs.",
                completed: false
              },
              {
                name: "Create family traditions or activities that bring everyone together",
                summary: "Create traditions",
                explanation: "Family traditions create shared identity and anticipation for future gatherings. New traditions accommodate changing family dynamics while creating meaningful experiences everyone can participate in.",
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
        name: "Learn Data Analytics",
        description: "Master data analysis skills for career enhancement and decision-making",
        icon: "bar-chart",
        explanation: "Data analytics skills show 52% job growth (2019-2024), accounting for 8% of global postings. Microsoft Excel was #1 most popular course in 2024.",
        projects: [
          {
            name: "Data Analytics Certification",
            description: "Complete comprehensive data analytics training program",
            explanation: "44% of companies need these skills and 40% of junior employees want to develop them. Average data analyst salary significantly exceeds national averages.",
            tasks: [
              {
                name: "Enroll in data analytics certification program (Google, Microsoft, or university)",
                summary: "Get certified",
                explanation: "Certified data analytics skills command $70,000+ starting salaries and open doors across industries. Structured programs provide hands-on experience with real datasets and industry-standard tools.",
                completed: false
              },
              {
                name: "Complete hands-on projects using real datasets to build portfolio",
                summary: "Build portfolio",
                explanation: "Portfolio projects demonstrate practical problem-solving ability that employers value more than theoretical knowledge alone. Real datasets provide experience with messy data and authentic business challenges.",
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
                summary: "Apply at work",
                explanation: "Applying data skills to current work creates immediate value and demonstrates capabilities to management. Finding analytical solutions to workplace problems showcases your value and potential for advancement.",
                completed: false
              },
              {
                name: "Present data-driven insights to management to demonstrate value",
                summary: "Present insights",
                explanation: "Presenting insights to leadership builds visibility and establishes you as a data resource within the organization. Demonstrating business impact through analytics often leads to promotion opportunities and increased responsibilities.",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Start Creative Side Hustle",
        description: "Generate $500+ monthly income from creative skills and talents",
        icon: "brush",
        explanation: "36-45% of Americans have side hustles, with 48% of Gen Z and 44% of Millennials participating. Average side hustler earns $891 monthly with creative pursuits averaging $42-53/hour.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "digital-content",
            name: "Digital Content Creation (videos, blogs, social media)",
            description: "Create online content through YouTube, blogging, or social media",
            projects: [
              {
                name: "Content Creation Foundation",
                description: "Establish digital content platform and build audience for monetization",
                explanation: "Creator economy offers scalable income opportunities. 23% see side hustles as creative outlets combining passion with profit.",
                tasks: [
                  {
                    name: "Choose content platform (YouTube, TikTok, blog) and create consistent posting schedule",
                    summary: "Choose platform",
                    explanation: "Platform choice and consistent posting schedule build audience and establish credibility in your niche. Consistency is more important than perfection for growing engaged following and generating income.",
                    completed: false
                  },
                  {
                    name: "Build audience to 1,000+ followers and enable monetization features",
                    summary: "Build audience",
                    explanation: "Reaching 1,000 followers unlocks monetization features on most platforms and represents committed audience base. This milestone enables ad revenue, sponsored content, and product sales opportunities.",
                    completed: false
                  }
                ]
              },
              {
                name: "Content Monetization Strategy",
                description: "Convert content creation into sustainable $500+ monthly income",
                explanation: "Digital content can generate income through ads, sponsorships, and product sales. Scalable income potential beyond traditional hourly work.",
                tasks: [
                  {
                    name: "Implement multiple income streams (ads, affiliate marketing, sponsored content)",
                    summary: "Multiple streams",
                    explanation: "Diversified income streams reduce dependence on single revenue source and maximize earning potential. Multiple monetization methods provide stability as audience and engagement fluctuate.",
                    completed: false
                  },
                  {
                    name: "Reach consistent $500+ monthly revenue through content monetization",
                    summary: "$500 monthly",
                    explanation: "$500 monthly represents significant supplemental income that can cover major expenses or accelerate financial goals. Consistent revenue demonstrates viable business model and potential for scaling.",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "handmade-products",
            name: "Handmade Products & Crafts (Etsy, local markets)",
            description: "Make and sell physical products through online marketplaces",
            projects: [
              {
                name: "Handmade Product Business Launch",
                description: "Create marketable handmade products and establish online sales presence",
                explanation: "Handmade products averaging $42-53/hour provide strong income potential. Physical products offer tangible creative satisfaction.",
                tasks: [
                  {
                    name: "Develop signature handmade product line and set up Etsy or similar marketplace store",
                    summary: "Create products",
                    explanation: "Signature products differentiate your business and build brand recognition. Etsy and similar platforms provide built-in audience and handle payment processing, making it easier to start selling immediately.",
                    completed: false
                  },
                  {
                    name: "Create inventory and process first 20 sales to establish business operations",
                    summary: "First sales",
                    explanation: "First 20 sales provide crucial feedback about product quality, pricing, and customer preferences. Early sales establish business processes and build customer reviews needed for future growth.",
                    completed: false
                  }
                ]
              },
              {
                name: "Craft Business Scaling",
                description: "Scale handmade business to consistent monthly income through efficiency",
                explanation: "Successful craft businesses balance creativity with business efficiency. Local and online sales channels maximize market reach.",
                tasks: [
                  {
                    name: "Optimize production process and explore local market opportunities",
                    summary: "Optimize process",
                    explanation: "Production optimization increases profit margins and enables scaling without proportional time increases. Local markets provide face-to-face customer interaction and often command premium pricing.",
                    completed: false
                  },
                  {
                    name: "Achieve $500+ monthly revenue through combined online and local sales",
                    summary: "$500 monthly",
                    explanation: "Combining online and local sales channels maximizes market reach and revenue potential. $500 monthly from handmade products demonstrates sustainable business that could grow into full-time income.",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "creative-services",
            name: "Creative Services (design, writing, photography)",
            description: "Offer creative professional services to clients",
            projects: [
              {
                name: "Creative Services Business Setup",
                description: "Establish professional creative services offering and client acquisition system",
                explanation: "Creative services offer high hourly rates ($42-53/hour average) and flexible scheduling. Professional skills command premium pricing.",
                tasks: [
                  {
                    name: "Define service offerings (design, writing, photography) and create professional portfolio",
                    summary: "Define services",
                    explanation: "Clear service definitions and professional portfolio establish credibility and attract quality clients willing to pay premium rates. Portfolio demonstrates capability and style to potential clients.",
                    completed: false
                  },
                  {
                    name: "Set up client acquisition system through freelance platforms and networking",
                    summary: "Get clients",
                    explanation: "Multiple client acquisition channels ensure steady work flow and reduce dependence on single platform. Networking often leads to higher-paying direct clients who bypass platform fees.",
                    completed: false
                  }
                ]
              },
              {
                name: "Service Business Growth",
                description: "Build sustainable creative services income through client relationships",
                explanation: "Repeat clients and referrals create stable income streams. High-quality creative work builds reputation for premium pricing.",
                tasks: [
                  {
                    name: "Complete first 10 client projects and establish testimonials and case studies",
                    summary: "First projects",
                    explanation: "First 10 projects provide foundation of testimonials and case studies essential for attracting higher-paying clients. Quality work and positive reviews create momentum for business growth.",
                    completed: false
                  },
                  {
                    name: "Build recurring client base generating $500+ monthly through creative services",
                    summary: "$500 monthly",
                    explanation: "Recurring clients provide income stability and reduce time spent on client acquisition. $500 monthly from creative services represents sustainable side business with potential for full-time transition.",
                    completed: false
                  }
                ]
              }
            ]
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
                summary: "Find strengths",
                explanation: "Aligning creative strengths with market demand ensures your side hustle has revenue potential. Research helps price services competitively and identify underserved niches where you can excel.",
                completed: false
              },
              {
                name: "Set up business platform (Etsy, YouTube, Fiverr) and create first offerings",
                summary: "Setup platform",
                explanation: "Platform setup provides professional presence and payment processing infrastructure. First offerings establish credibility and begin building customer reviews essential for platform visibility.",
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
                summary: "First sales",
                explanation: "First 10 sales build crucial social proof and customer feedback needed for platform algorithms and future customer confidence. Early reviews significantly impact visibility and conversion rates.",
                completed: false
              },
              {
                name: "Optimize pricing and marketing to reach $500+ monthly revenue target",
                summary: "Reach $500",
                explanation: "Pricing optimization balances competitiveness with profitability while effective marketing increases visibility and customer acquisition. $500 monthly provides meaningful income supplement that can accelerate financial goals.",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Learn AI/Machine Learning",
        description: "Gain practical AI literacy with hands-on projects and applications",
        icon: "laptop",
        explanation: "AI skills are fastest-growing globally, with 83% of Millennials/Gen Z finding AI useful for personal tasks and 72% of employees wanting AI training.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "practical-tools",
            name: "Practical AI Tools for Work (ChatGPT, automation)",
            description: "Master everyday AI tools that improve work productivity",
            projects: [
              {
                name: "AI Productivity Mastery",
                description: "Master practical AI tools for immediate workplace productivity gains",
                explanation: "83% of Millennials/Gen Z find AI useful for personal tasks. Early AI adoption provides competitive advantage in rapidly changing job market.",
                tasks: [
                  {
                    name: "Master ChatGPT, Claude, and other AI tools for writing, analysis, and problem-solving",
                    summary: "Master AI tools",
                    explanation: "AI tools can automate repetitive tasks, enhance decision-making, and boost productivity by 30-50%. Learning these tools early positions you as an innovator in your workplace and significantly increases your value to employers.",
                    completed: false
                  },
                  {
                    name: "Implement AI automation tools to streamline repetitive work tasks",
                    summary: "Automate tasks",
                    explanation: "AI automation frees up time for higher-value work while demonstrating innovation and efficiency. Successful implementation creates tangible productivity gains that justify promotions and salary increases.",
                    completed: false
                  }
                ]
              },
              {
                name: "Workplace AI Integration",
                description: "Become the AI expert in your workplace through practical application",
                explanation: "72% of employees want AI training. Positioning as AI-literate employee creates advancement opportunities and job security.",
                tasks: [
                  {
                    name: "Identify 3 work processes that can be improved with AI tools and implement solutions",
                    summary: "Improve processes",
                    explanation: "Identifying and improving workplace processes with AI demonstrates practical problem-solving and innovation. These implementations provide concrete examples of your value-add during performance reviews and advancement discussions.",
                    completed: false
                  },
                  {
                    name: "Train colleagues on AI tools and establish reputation as workplace AI resource",
                    summary: "Train others",
                    explanation: "Becoming the AI expert in your workplace positions you as a valuable resource and thought leader. Training others builds internal network while establishing expertise that can lead to advancement opportunities.",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "ml-fundamentals",
            name: "Machine Learning & Data Science Fundamentals",
            description: "Learn technical foundations of machine learning and data science",
            projects: [
              {
                name: "ML Technical Foundation",
                description: "Build solid technical understanding of machine learning concepts and applications",
                explanation: "ML skills command premium salaries and open doors to high-growth tech career opportunities in data-driven economy.",
                tasks: [
                  {
                    name: "Complete comprehensive ML course (Stanford ML, Google AI, or Coursera specialization)",
                    summary: "ML course",
                    explanation: "Comprehensive ML education provides solid foundation for technical careers in data science and AI. Stanford ML Course and Google AI certificates are industry-recognized credentials that command premium salaries.",
                    completed: false
                  },
                  {
                    name: "Master Python programming and key ML libraries (pandas, scikit-learn, TensorFlow)",
                    summary: "Master Python",
                    explanation: "Python and ML libraries are essential tools for data science careers. These technical skills enable building and deploying machine learning models that solve real business problems.",
                    completed: false
                  }
                ]
              },
              {
                name: "ML Portfolio Development",
                description: "Create portfolio demonstrating practical machine learning problem-solving skills",
                explanation: "Portfolio projects essential for demonstrating ML competency to employers. Real-world applications showcase practical value creation.",
                tasks: [
                  {
                    name: "Build 3 ML projects solving different types of problems (classification, regression, NLP)",
                    summary: "ML projects",
                    explanation: "Diverse ML projects demonstrate versatility and problem-solving ability across different domains. Portfolio variety shows potential employers your capability to apply ML to various business challenges.",
                    completed: false
                  },
                  {
                    name: "Deploy ML models and create GitHub portfolio showcasing technical skills",
                    summary: "Deploy models",
                    explanation: "Deployed models demonstrate end-to-end ML capability from development to production. GitHub portfolio provides accessible showcase of your technical work for potential employers and collaborators.",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "ai-strategy",
            name: "AI Strategy & Business Applications",
            description: "Understand AI's business impact and strategic implementation",
            projects: [
              {
                name: "AI Strategy Understanding",
                description: "Develop strategic understanding of AI's business impact and implementation challenges",
                explanation: "40% of companies adopting AI need strategic guidance. AI strategy knowledge positions for leadership roles in digital transformation.",
                tasks: [
                  {
                    name: "Study AI business case studies and learn strategic frameworks for AI implementation",
                    summary: "Study cases",
                    explanation: "Understanding AI business applications and implementation challenges prepares you for strategic roles in digital transformation. Case studies provide real-world context for AI decision-making.",
                    completed: false
                  },
                  {
                    name: "Complete AI strategy course or certification focusing on business applications",
                    summary: "AI strategy cert",
                    explanation: "AI strategy certification demonstrates business acumen beyond technical skills. Strategic AI knowledge positions you for leadership roles in organizations adopting AI technologies.",
                    completed: false
                  }
                ]
              },
              {
                name: "Strategic AI Application",
                description: "Apply AI strategy knowledge to real business challenges and opportunities",
                explanation: "Strategic AI thinking increasingly valuable for management roles. Understanding AI impact essential for business leadership.",
                tasks: [
                  {
                    name: "Analyze current company/industry for AI opportunities and create strategic recommendations",
                    summary: "Analyze AI ops",
                    explanation: "Strategic AI analysis demonstrates your ability to identify improvement opportunities and provide actionable recommendations. This type of strategic thinking is highly valued for advancement into leadership roles.",
                    completed: false
                  },
                  {
                    name: "Present AI strategy insights to leadership or write thought leadership content",
                    summary: "Present strategy",
                    explanation: "Presenting to leadership builds visibility and establishes you as a strategic thinker. Thought leadership content positions you as an industry expert and can lead to speaking opportunities and career advancement.",
                    completed: false
                  }
                ]
              }
            ]
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
                summary: "Enroll course",
                explanation: "Structured AI/ML education provides systematic learning path and industry-recognized credentials. Course selection based on your background ensures appropriate challenge level and practical applicability.",
                completed: false
              },
              {
                name: "Complete hands-on projects that demonstrate practical AI application",
                summary: "AI projects",
                explanation: "Hands-on projects bridge theory and practice while creating portfolio pieces for job applications. Practical AI applications show potential employers your ability to create real business value.",
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
                summary: "Use AI tools",
                explanation: "AI tool implementation in current work provides immediate productivity gains while building practical experience. Successfully applying AI to workplace challenges demonstrates innovation and creates competitive advantage.",
                completed: false
              },
              {
                name: "Share AI knowledge with colleagues or create content demonstrating expertise",
                summary: "Share knowledge",
                explanation: "Knowledge sharing establishes you as an AI thought leader while building professional reputation. Creating content or training others positions you for advancement opportunities and industry recognition.",
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
        name: "Plan Solo Adventure Travel",
        description: "Complete meaningful solo travel experience for personal growth and adventure",
        icon: "airplane",
        explanation: "70% of 25-34 year-olds travel annually, with 75% of Gen Z planning solo trips in 2024. Solo travel has become major trend for personal growth and independence.",
        projects: [
          {
            name: "Solo Travel Planning",
            description: "Research and plan meaningful solo adventure experience",
            explanation: "Gen Z spends average $11,766 on trips, surpassing all generations. Post-pandemic travel surge with work-from-home flexibility enabling longer trips.",
            tasks: [
              {
                name: "Choose destination and create detailed itinerary for solo adventure trip",
                summary: "Plan trip",
                explanation: "Solo travel planning builds independence and confidence while creating anticipation for meaningful experience. Detailed itinerary ensures safety and maximizes personal growth opportunities during the trip.",
                completed: false
              },
              {
                name: "Budget and save specifically for solo travel experience",
                summary: "Save travel",
                explanation: "Dedicated travel savings makes solo adventure financially achievable without impacting other goals. Specific budgeting helps control costs while ensuring adequate funds for meaningful experiences and emergency situations.",
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
                summary: "Take trip",
                explanation: "Solo travel builds self-reliance, cultural awareness, and confidence while providing perspective on life goals. Focus on personal growth maximizes the transformative potential of the experience.",
                completed: false
              },
              {
                name: "Document experience and plan future solo travel adventures",
                summary: "Document trip",
                explanation: "Documenting solo travel preserves memories and insights while sharing experiences can inspire others. Planning future adventures maintains the personal growth momentum and sense of adventure.",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Explore Wellness Activities",
        description: "Maintain 4+ weekly wellness activities for holistic health and relaxation",
        icon: "leaf",
        explanation: "Over 60% of young adults use fitness apps regularly, with fitness/wellness ranking #2 hobby for 25-34 year-olds. Millennials spend $115/month on wellness services.",
        projects: [
          {
            name: "Wellness Routine Development",
            description: "Create diverse wellness activities that support mental and physical health",
            explanation: "35% of millennials pay for gym memberships (highest rate). Post-pandemic focus on mental health and self-care drives wellness participation.",
            tasks: [
              {
                name: "Try different wellness activities (yoga, meditation, spa, massage) to find preferences",
                summary: "Try wellness",
                explanation: "Exploring various wellness activities helps identify what resonates with your lifestyle and stress patterns. Finding preferred activities ensures long-term commitment to wellness practices that support mental and physical health.",
                completed: false
              },
              {
                name: "Schedule 4+ weekly wellness activities and track their impact on wellbeing",
                summary: "Schedule wellness",
                explanation: "Regular wellness activities compound benefits for stress management and overall health. Tracking impact provides motivation and helps optimize which activities provide greatest benefit for your specific needs.",
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
                summary: "Join classes",
                explanation: "Group wellness activities provide social support and accountability that increases consistency. Community aspects of wellness classes create friendships while maintaining motivation for healthy habits.",
                completed: false
              },
              {
                name: "Share wellness journey with friends and encourage their participation",
                summary: "Share wellness",
                explanation: "Sharing wellness practices with friends creates mutual accountability and strengthens relationships through shared healthy activities. Encouraging others multiplies positive impact while building supportive community.",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Explore Local Culture",
        description: "Try 24 new local restaurants, events, and cultural activities within 12 months",
        icon: "restaurant",
        explanation: "Millennials spend $164/month on entertainment, with 79% willing to eat at popular restaurants. Experience economy thrives as 78% prefer memorable experiences over physical items.",
        projects: [
          {
            name: "Local Cultural Exploration",
            description: "Systematically discover and experience local cultural offerings",
            explanation: "Dining out is how millennials choose to spend time and money. Cultural exploration and local cuisine top motivators for meaningful experiences.",
            tasks: [
              {
                name: "Create list of local restaurants, museums, theaters, and events to try",
                summary: "Create list",
                explanation: "Systematic exploration of local culture ensures you experience diverse offerings and discover hidden gems. Creating a list provides structure and motivation for consistent cultural engagement throughout the year.",
                completed: false
              },
              {
                name: "Plan to try 2 new local cultural experiences each month",
                summary: "Monthly culture",
                explanation: "Monthly cultural exploration goals ensure consistent discovery while making the target achievable. Regular cultural engagement builds deeper connection to your community and creates ongoing excitement about local offerings.",
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
                summary: "Invite friends",
                explanation: "Shared cultural experiences deepen friendships while supporting local businesses together. Social exploration creates memories and provides natural conversation topics that strengthen relationships.",
                completed: false
              },
              {
                name: "Document and share favorite local discoveries to support community businesses",
                summary: "Share discoveries",
                explanation: "Sharing local discoveries helps community businesses while building your reputation as someone knowledgeable about local culture. Your recommendations can influence others' spending toward local establishments.",
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
        name: "Volunteer in Community",
        description: "Complete 50+ hours of meaningful community service within 12 months",
        icon: "heart",
        explanation: "28.3% of Americans volunteer formally (75.7+ million), with volunteering rebounding 5.1% post-pandemic. Ages 35-44 have highest volunteer rates (28.9%) and 96% report enriched purpose.",
        projects: [
          {
            name: "Strategic Volunteering Setup",
            description: "Choose cause and commit to regular volunteer service",
            explanation: "Post-pandemic volunteer surge shows renewed community engagement. Virtual options make participation accessible for busy professionals seeking meaningful contribution.",
            tasks: [
              {
                name: "Research local organizations working on causes you care about",
                summary: "Research orgs",
                explanation: "Researching local organizations ensures your volunteer time aligns with personal values and maximizes impact. Understanding organization missions and operations helps identify where your skills can contribute most effectively.",
                completed: false
              },
              {
                name: "Commit to regular monthly volunteering schedule (4+ hours monthly)",
                summary: "Commit schedule",
                explanation: "Regular volunteering commitment builds meaningful relationships with organizations and beneficiaries while creating consistent positive impact. Monthly schedule provides flexibility while ensuring significant contribution over time.",
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
                summary: "Track impact",
                explanation: "Tracking volunteer contribution provides satisfaction and demonstrates impact to others who might be inspired to volunteer. Measuring impact helps optimize your contribution and provides evidence for job applications and personal growth.",
                completed: false
              },
              {
                name: "Take on leadership role or special project within volunteer organization",
                summary: "Lead volunteer",
                explanation: "Leadership opportunities in volunteer settings build management skills while maximizing your impact for the cause. Special projects provide experience that can enhance your professional resume and career development.",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Align Work with Values",
        description: "Find career role that matches personal ethics and impact goals",
        icon: "compass",
        explanation: "92% of millennials and 89% of Gen Z consider purpose important for job satisfaction. Nearly half have left roles lacking purpose, while 40% reject assignments based on ethics.",
        projects: [
          {
            name: "Values-Work Integration Strategy",
            description: "Assess current role and plan for better values alignment",
            explanation: "'Great Resignation' mentality continues with professionals prioritizing values over traditional metrics. Remote work flexibility enables more selective job choices.",
            tasks: [
              {
                name: "Assess how well your current role aligns with your personal values",
                summary: "Assess alignment",
                explanation: "Values assessment identifies gaps between current work and personal principles that may be causing dissatisfaction. Understanding alignment level helps prioritize changes needed for fulfilling career direction.",
                completed: false
              },
              {
                name: "Identify specific ways to increase meaningful impact in your current or future role",
                summary: "Increase impact",
                explanation: "Finding ways to add meaning to current work can transform job satisfaction without requiring career change. Identifying impact opportunities helps guide role modifications or future career decisions.",
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
                summary: "Network purpose",
                explanation: "Purpose-driven professionals can provide insights into values-aligned career paths and organization cultures. Their experiences help you understand realistic expectations and transition strategies for meaningful work.",
                completed: false
              },
              {
                name: "Apply for roles or propose initiatives that align work with personal values",
                summary: "Apply values",
                explanation: "Taking action to align work with values demonstrates commitment to meaningful career progression. Proposing initiatives shows leadership while creating immediate opportunities to increase purpose in current role.",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Live More Sustainably",
        description: "Reduce personal environmental impact by 30% through lifestyle changes",
        icon: "leaf",
        explanation: "Environmental sustainability tops priorities, with ~60% worried about climate monthly. Half of Gen Z/millennials actively pressure businesses on climate action.",
        projects: [
          {
            name: "Sustainable Lifestyle Assessment",
            description: "Audit current environmental impact and identify reduction opportunities",
            explanation: "64% actively reducing possessions for environmental reasons. Climate anxiety drives concrete action seeking for tangible impact.",
            tasks: [
              {
                name: "Calculate current carbon footprint and identify top 3 reduction opportunities",
                summary: "Calculate footprint",
                explanation: "Carbon footprint assessment provides baseline for environmental impact reduction and identifies highest-leverage areas for change. Focusing on top 3 opportunities makes sustainability goals achievable and measurable.",
                completed: false
              },
              {
                name: "Implement sustainable practices in transportation, food, and consumption",
                summary: "Go sustainable",
                explanation: "Sustainable lifestyle changes reduce environmental impact while often providing cost savings and health benefits. Transportation, food, and consumption represent largest impact areas where changes create meaningful difference.",
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
                summary: "Track progress",
                explanation: "Progress tracking provides motivation and accountability for sustainable living goals. Celebrating improvements reinforces positive behavior changes while providing tangible evidence of environmental contribution.",
                completed: false
              },
              {
                name: "Share sustainable living tips with friends and influence others positively",
                summary: "Share tips",
                explanation: "Sharing sustainability practices amplifies environmental impact beyond personal changes. Influencing others creates ripple effect that multiplies positive environmental contribution while building community around shared values.",
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
        name: "Buy First Home",
        description: "Navigate path to homeownership despite affordability challenges",
        icon: "key",
        explanation: "Millennials are largest homebuyer group (38%) with 23% planning purchase within 6 months. Despite affordability crisis, 82% view homeownership as good investment.",
        projects: [
          {
            name: "Homeownership Preparation Strategy",
            description: "Build financial foundation and knowledge for home purchase",
            explanation: "Need $114,000 income for median home vs ~$57,000 average salary. Rising interest rates create urgency while remote work opens new geographic possibilities.",
            tasks: [
              {
                name: "Research first-time homebuyer programs and down payment assistance options",
                summary: "Research programs",
                explanation: "First-time buyer programs can reduce down payment requirements and provide favorable terms that make homeownership achievable. Research helps identify all available assistance programs to maximize affordability.",
                completed: false
              },
              {
                name: "Get pre-approved for mortgage to understand buying power and requirements",
                summary: "Get pre-approved",
                explanation: "Pre-approval provides realistic budget for home shopping and demonstrates seriousness to sellers in competitive markets. Understanding requirements early allows time to improve credit or save additional funds if needed.",
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
                summary: "Save down payment",
                explanation: "Dedicated savings account prevents down payment funds from being used for other expenses while earning interest. High-yield accounts maximize growth of home savings while maintaining liquidity for purchase timing.",
                completed: false
              },
              {
                name: "Work with real estate agent to find and purchase first home",
                summary: "Buy home",
                explanation: "Experienced real estate agent provides market knowledge and negotiation expertise crucial for first-time buyers. Professional guidance helps navigate complex purchase process and avoid costly mistakes.",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Organize Living Space",
        description: "Declutter and organize home environment for calm and productivity",
        icon: "grid",
        explanation: "64% of millennials/Gen Z actively reducing possessions in 2024. Decluttering is #1 New Year's resolution, with people 'more ruthless than ever' about items.",
        projects: [
          {
            name: "Systematic Decluttering Process",
            description: "Remove unnecessary items and create organized living systems",
            explanation: "Post-pandemic accumulation leaving people overwhelmed. Work-from-home makes organized space crucial for productivity and mental health.",
            tasks: [
              {
                name: "Declutter each room systematically using proven methods (KonMari, one-touch rule)",
                summary: "Declutter rooms",
                explanation: "Systematic decluttering using proven methods ensures thorough organization and prevents feeling overwhelmed. Structured approaches like KonMari provide clear decision-making frameworks for keeping or discarding items.",
                completed: false
              },
              {
                name: "Organize remaining possessions with storage solutions and labeling systems",
                summary: "Organize storage",
                explanation: "Proper storage and labeling systems maintain organization long-term and make finding items effortless. Well-organized spaces reduce stress and improve productivity while creating calm, functional living environment.",
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
                summary: "Create routines",
                explanation: "Daily and weekly organizing routines prevent clutter accumulation and maintain the benefits of initial decluttering effort. Consistent habits ensure organized spaces remain functional and stress-free long-term.",
                completed: false
              },
              {
                name: "Choose sustainable organizing materials that align with environmental values",
                summary: "Eco organizing",
                explanation: "Sustainable organizing solutions support environmental goals while creating functional storage systems. Eco-friendly materials ensure organization efforts align with broader values around consumption and environmental impact.",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Create Eco-Friendly Home",
        description: "Transform living space into energy-efficient, sustainable environment",
        icon: "leaf",
        explanation: "Millennials prioritize sustainability in housing, seeking energy-efficient appliances and eco-friendly materials. 88% prefer urban living with sustainable amenities.",
        projects: [
          {
            name: "Energy Efficiency Improvements",
            description: "Implement changes that reduce energy consumption and environmental impact",
            explanation: "Technology advances make eco-friendly improvements accessible. Climate change concerns drive action on living space sustainability.",
            tasks: [
              {
                name: "Audit home energy usage and identify opportunities for efficiency improvements",
                summary: "Energy audit",
                explanation: "Energy audits reveal specific areas where efficiency improvements can reduce utility costs and environmental impact. Understanding current usage patterns helps prioritize upgrades that provide maximum benefit.",
                completed: false
              },
              {
                name: "Implement energy-saving measures (LED lighting, smart thermostat, efficient appliances)",
                summary: "Save energy",
                explanation: "Energy-saving upgrades reduce monthly utility costs while decreasing environmental footprint. Smart technologies provide ongoing optimization and convenience while LED lighting and efficient appliances offer immediate savings.",
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
                summary: "Eco products",
                explanation: "Eco-friendly household products reduce chemical exposure for your family while minimizing environmental impact. Many green alternatives are cost-effective and perform as well as conventional products.",
                completed: false
              },
              {
                name: "Set up composting, recycling, and waste reduction systems",
                summary: "Reduce waste",
                explanation: "Waste reduction systems significantly decrease household environmental impact while often reducing costs. Composting provides nutrient-rich soil for gardening while recycling diverts materials from landfills.",
                completed: false
              }
            ]
          }
        ]
      }
    ]
  }
];
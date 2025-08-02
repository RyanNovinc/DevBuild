// src/screens/Onboarding/data/countries/uk.js
// UK-specific domain definitions with refined goals based on 2024-2025 research
export const DOMAIN_DEFINITIONS = [
  {
    name: "Career & Work",
    icon: "briefcase-outline",
    color: "#3b82f6", // Blue
    description: "Professional advancement, workplace goals, career development",
    goals: [
      {
        name: "Get Significant Salary Increase",
        description: "Achieve 15-20% salary increase through strategic career moves and negotiations",
        icon: "trending-up-outline",
        explanation: "75% of UK professionals seek new jobs with better pay being the #1 reason (51%). Job switchers receive average 8% increases, making 15-20% achievable through strategic moves.",
        projects: [
          {
            name: "Strategic Career Move Planning",
            description: "Research opportunities and plan career moves for maximum salary growth",
            explanation: "With median UK salary at £34,963, a 20% increase means £7,000+ annually - significant given housing and living costs. Gen Z spends only 1.7 years per job, normalizing mobility.",
            tasks: [
              {
                name: "Research salary benchmarks for your role in different companies and regions",
                summary: "Research salary",
                explanation: "UK salary variations can be significant between regions and companies. Research provides evidence for negotiations and identifies high-paying opportunities that justify job changes.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Update CV and LinkedIn profile to highlight achievements and value created",
                summary: "Update CV",
                explanation: "Updated profiles highlighting quantifiable achievements attract recruiters and justify higher salary expectations. Professional presentation essential for 15-20% salary increase targets.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Salary Negotiation and Job Search",
            description: "Execute strategic job search or negotiate salary increase in current role",
            explanation: "CIPD data shows 35% of career changers specifically seek better pay, with management roles seeing 15% increases when moving jobs.",
            tasks: [
              {
                name: "Apply for roles with 15-20% salary increases or prepare case for current employer",
                summary: "Apply roles",
                explanation: "Strategic applications targeting higher-paying roles provide negotiation leverage and alternative options. Market competition demonstrates your value and strengthens internal promotion discussions.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Practice salary negotiation and secure offer with target increase",
                summary: "Negotiate salary",
                explanation: "Negotiation skills directly impact lifetime earnings potential. Practice builds confidence to secure target increases and avoid leaving money on the table during job transitions.",
                timeframe: "1 month",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Secure Flexible Work Arrangement",
        description: "Negotiate hybrid working or four-day week for better work-life balance",
        icon: "calendar-outline",
        explanation: "78% of UK employees favor four-day work weeks, while 85% of remote workers want hybrid models. Work-life balance jumped from 8th to 1st priority for job seekers since 2012.",
        projects: [
          {
            name: "Flexible Working Proposal",
            description: "Leverage UK's Flexible Working Bill to secure arrangement with current employer",
            explanation: "UK's Flexible Working Bill (April 2024) gives day-one rights to request flexibility. 40% of UK job listings offer hybrid work (highest globally).",
            tasks: [
              {
                name: "Research your company's flexible working policy and successful case studies",
                summary: "Research policy",
                explanation: "Understanding existing policy and success stories provides foundation for compelling flexible work request. Research demonstrates professionalism and increases approval likelihood.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Prepare and submit formal flexible working request with business case",
                summary: "Submit request",
                explanation: "Formal requests with business cases have higher approval rates under UK's Flexible Working Bill. Professional presentation shows serious commitment to making arrangement work for business.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Flexible Work Optimization",
            description: "Maximize productivity and work-life balance in flexible arrangement",
            explanation: "78% report improved wellbeing from hybrid work. 28% work hybrid in Great Britain with 3/4 willing to change jobs if required on-site full-time.",
            tasks: [
              {
                name: "Set up effective home workspace and establish boundaries for hybrid working",
                summary: "Setup workspace",
                explanation: "Professional home workspace ensures productivity and demonstrates commitment to flexible arrangement success. Clear boundaries prevent work-life blur that can undermine arrangement sustainability.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Track productivity metrics to demonstrate success of flexible arrangement",
                summary: "Track metrics",
                explanation: "Productivity tracking provides objective evidence that flexible working delivers results. Data supports arrangement continuation and helps other team members secure similar flexibility.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build High-Value Digital Skills",
        description: "Develop in-demand technical skills for career advancement and higher earnings",
        icon: "laptop-outline",
        explanation: "75% of employers can't find right technical skills, while AI skills earn workers 21% more. With 71% of organizations expecting to use AI but only 25% having needed skills, this represents massive opportunity.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "ai-ml",
            name: "AI & Machine Learning Applications",
            description: "Learn practical AI tools and machine learning fundamentals for business applications",
            projects: [
              {
                name: "AI Tools Mastery",
                description: "Learn practical AI applications for daily work productivity",
                explanation: "AI skills command 21% salary premiums. 71% of organizations plan AI adoption but only 25% have skilled workers, creating massive opportunity.",
                tasks: [
                  {
                    name: "Complete ChatGPT, Claude, and Midjourney fundamentals course for workplace applications",
                    summary: "Learn AI tools",
                    explanation: "AI tools mastery provides immediate productivity gains and 21% salary premiums. Early adoption creates competitive advantage as organizations scramble to implement AI capabilities.",
                    timeframe: "2 months",
                    completed: false
                  },
                  {
                    name: "Implement AI tools in current role to automate 2-3 routine tasks and document results",
                    summary: "Automate tasks",
                    explanation: "Practical AI implementation demonstrates value creation and innovation to employers. Documented results provide evidence for promotion discussions and performance reviews.",
                    timeframe: "1 month",
                    completed: false
                  }
                ]
              },
              {
                name: "Machine Learning Foundations",
                description: "Build technical ML skills for data-driven business insights",
                explanation: "UK tech sector (£784bn) increasingly requires ML literacy. Entry-level ML roles start at £35,000+, with senior positions reaching £80,000+.",
                tasks: [
                  {
                    name: "Complete Google Machine Learning Crash Course and earn professional certificate",
                    summary: "ML certified",
                    explanation: "Google ML certification provides industry-recognized credentials for technical roles starting at £35,000+. Structured learning provides solid foundation for ML career transition.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Build portfolio project using real business data to demonstrate ML problem-solving",
                    summary: "ML project",
                    explanation: "Portfolio projects provide tangible evidence of ML capabilities that employers can evaluate. Real business applications showcase practical problem-solving rather than theoretical knowledge.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "data-analytics",
            name: "Data Analytics & Business Intelligence",
            description: "Master data analysis, visualization, and business intelligence tools",
            projects: [
              {
                name: "Data Analysis Certification",
                description: "Master Excel, SQL, and data visualization for business intelligence",
                explanation: "75% of employers struggle to find data skills. Business analysts earn £25,000-£60,000+ with strong progression opportunities.",
                tasks: [
                  {
                    name: "Complete Microsoft Excel Advanced and SQL fundamentals certification",
                    summary: "Data certified",
                    explanation: "Excel and SQL skills are foundational for most business analyst roles earning £25,000-£60,000+. These technical skills provide immediate workplace value and career advancement opportunities.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Master Tableau or Power BI for creating business dashboards and reports",
                    summary: "Learn BI tools",
                    explanation: "Visualization tools like Tableau and Power BI transform data into actionable insights that drive business decisions. These skills are highly valued across industries for strategic planning.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Business Intelligence Portfolio",
                description: "Create compelling data stories that drive business decisions",
                explanation: "Data-driven decision making is critical for UK businesses. Analytics professionals consistently rank in top-demand roles.",
                tasks: [
                  {
                    name: "Build 3 portfolio projects showing data analysis from raw data to business insights",
                    summary: "Data portfolio",
                    explanation: "Portfolio projects demonstrate end-to-end analytical capabilities from data collection to business recommendations. Real-world applications showcase practical problem-solving skills to potential employers.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Present data analysis to stakeholders and demonstrate business impact",
                    summary: "Present data",
                    explanation: "Presentation skills separate good analysts from great ones. Communicating insights effectively to stakeholders demonstrates leadership potential and drives business value creation.",
                    timeframe: "1 month",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "cybersecurity",
            name: "Cybersecurity & Digital Protection",
            description: "Develop cybersecurity skills for protecting digital assets and systems",
            projects: [
              {
                name: "Cybersecurity Fundamentals",
                description: "Learn essential security practices and threat protection",
                explanation: "Cybersecurity Analyst ranks #1 fastest-growing UK job (57% growth). Average salary £35,000-£65,000 with strong job security.",
                tasks: [
                  {
                    name: "Complete CompTIA Security+ or similar entry-level cybersecurity certification",
                    summary: "Security cert",
                    explanation: "CompTIA Security+ certification opens doors to £35,000-£65,000 cybersecurity roles with 57% job growth. Industry-recognized credential provides foundation for security career transition.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Set up personal security audit and implement advanced protection measures",
                    summary: "Security audit",
                    explanation: "Personal security audit provides hands-on experience with security tools and practices. Implementing advanced protection demonstrates practical security knowledge to potential employers.",
                    timeframe: "1 month",
                    completed: false
                  }
                ]
              },
              {
                name: "Security Expertise Development",
                description: "Build specialized skills in threat analysis and system protection",
                explanation: "UK faces 2.39 million cyber attacks daily. Organizations desperately need qualified security professionals to protect digital assets.",
                tasks: [
                  {
                    name: "Learn penetration testing basics and practice on ethical hacking platforms",
                    summary: "Learn hacking",
                    explanation: "Penetration testing skills are highly valued in cybersecurity with specialist roles earning £40,000-£80,000+. Ethical hacking platforms provide safe environment to develop security expertise.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Create security assessment report for local business or volunteer organization",
                    summary: "Security report",
                    explanation: "Real-world security assessments provide portfolio pieces and practical experience. Many small businesses need affordable security expertise, creating opportunities for skill development.",
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
            name: "Digital Skills Certification",
            description: "Complete industry-recognized certification in chosen digital skill area",
            explanation: "UK tech sector valued at £784 billion (Europe's largest). Programming salaries start at £26,000, rising to £80,000+. Professional certifications achievable in 6-18 months.",
            tasks: [
              {
                name: "Research and enroll in certification program for chosen digital skill",
                explanation: "Industry-recognized certifications provide credible evidence of technical skills to UK employers. Research helps identify which programs offer best ROI for career advancement and salary increases.",
                completed: false
              },
              {
                name: "Complete certification and add credential to professional profiles",
                explanation: "Completed certifications increase visibility to recruiters and justify higher salary expectations. Adding credentials to LinkedIn and CV signals professional development and technical competency.",
                completed: false
              }
            ]
          },
          {
            name: "Practical Skill Application",
            description: "Apply new digital skills in work context to demonstrate value and expertise",
            explanation: "Only 48% can complete essential digital work tasks, creating competitive advantage. Cybersecurity and sustainability managers rank in UK's top 25 growing jobs.",
            tasks: [
              {
                name: "Identify opportunities to apply new skills in current role or side projects",
                explanation: "Practical application of new skills demonstrates value to current employer while building portfolio for future opportunities. Side projects provide creative outlet for skill development.",
                completed: false
              },
              {
                name: "Showcase digital expertise through presentations, projects, or mentoring colleagues",
                explanation: "Visibility of expertise leads to promotion opportunities and establishes professional reputation. Teaching others reinforces your own knowledge while building valuable workplace relationships.",
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
        name: "Save for House Deposit",
        description: "Build £15,000-25,000 first-time buyer deposit using government schemes",
        icon: "home-outline",
        explanation: "54% of UK mortgages go to first-time buyers, with 341,068 achieving this in 2024 (+19%). Using LISA's 25% government bonus makes this achievable despite high deposit requirements.",
        projects: [
          {
            name: "House Deposit Savings Strategy",
            description: "Maximize LISA contributions and government bonuses for house deposit",
            explanation: "Regional variation allows flexibility - £26,769 (North East) to £108,848 (London). 56,900 LISA holders withdrew for homes in 2023-24, proving the pathway works.",
            tasks: [
              {
                name: "Open Lifetime ISA and set up maximum £4,000 annual contributions for 25% government bonus",
                explanation: "LISA provides 25% government bonus on contributions up to £4,000 annually, effectively giving you £1,000 free money each year toward house deposit. This makes homeownership significantly more achievable.",
                completed: false
              },
              {
                name: "Research target areas and calculate realistic deposit needed based on location preferences",
                explanation: "UK house prices vary dramatically by region - from £26,769 in North East to £108,848 in London. Strategic location research helps identify affordable areas with good prospects.",
                completed: false
              }
            ]
          },
          {
            name: "First-Time Buyer Preparation",
            description: "Prepare for home purchase process and maximize government support",
            explanation: "Average first-time buyer age is 33.5, aligning perfectly with this demographic. Housing remains top financial priority despite challenges.",
            tasks: [
              {
                name: "Research Help to Buy schemes and first-time buyer programs in target areas",
                explanation: "Government schemes like Help to Buy and shared ownership can reduce deposit requirements and make homeownership accessible. Each region offers different programs with varying benefits.",
                completed: false
              },
              {
                name: "Get mortgage pre-approval to understand borrowing capacity and requirements",
                explanation: "Pre-approval provides realistic budget for house hunting and demonstrates seriousness to sellers. Understanding borrowing capacity helps set appropriate savings targets and timeline.",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Emergency Fund",
        description: "Establish £4,500-6,000 emergency fund covering 3-4 months expenses",
        icon: "shield-outline",
        explanation: "44% struggle financially, with 25% having under £100 saved. This goal provides crucial buffer against job loss or unexpected expenses, covering average UK living costs.",
        projects: [
          {
            name: "Emergency Fund Foundation",
            description: "Build financial safety net through systematic saving and expense management",
            explanation: "Average UK emergency fund is £4,579, but majority lack adequate coverage. At £226 average monthly savings, achievable within 18 months.",
            tasks: [
              {
                name: "Calculate 3-4 months of essential UK expenses (rent, council tax, utilities, food)",
                completed: false
              },
              {
                name: "Open high-interest savings account and set up automatic monthly transfers",
                completed: false
              }
            ]
          },
          {
            name: "Financial Security Maintenance",
            description: "Protect and maintain emergency fund while building other financial goals",
            explanation: "Cost-of-living crisis and job insecurity (45% fear redundancy) make emergency funds essential for peace of mind and financial stability.",
            tasks: [
              {
                name: "Track monthly expenses and adjust emergency fund target as living costs change",
                completed: false
              },
              {
                name: "Avoid touching emergency fund except for true emergencies, rebuilding if used",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Maximize ISA Savings",
        description: "Fully utilize £20,000 annual ISA allowance for tax-free wealth building",
        icon: "trending-up-outline",
        explanation: "42% of UK adults have ISAs with average value £33,278. Tax-free growth becomes crucial as more pushed into higher brackets. Flexible between cash ISA and stocks & shares ISA.",
        projects: [
          {
            name: "ISA Optimization Strategy",
            description: "Choose optimal mix of cash and stocks & shares ISAs for financial goals",
            explanation: "61% of Brits now consider themselves 'investors,' showing mainstream adoption. ISA interest hidden from Student Loan calculations provides additional benefit.",
            tasks: [
              {
                name: "Research and choose between cash ISA (short-term) and stocks & shares ISA (long-term)",
                completed: false
              },
              {
                name: "Set up automatic monthly ISA contributions to reach £20,000 annual allowance",
                completed: false
              }
            ]
          },
          {
            name: "Long-Term Wealth Building",
            description: "Use ISA allowance strategically for major financial milestones",
            explanation: "Achievable through £1,667/month or using bonuses/windfalls. Critical for wealth building given low savings rates and higher tax thresholds.",
            tasks: [
              {
                name: "Plan ISA contributions around bonuses, pay rises, and windfalls to maximize allowance",
                completed: false
              },
              {
                name: "Review and optimize ISA portfolio annually for best returns and risk balance",
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
        name: "Complete First 5K Run",
        description: "Train for and complete first 5K run within 12 months using community support",
        icon: "walk-outline",
        explanation: "Running is UK's most popular activity (15% participation), with Parkrun's 197,000+ weekly participants providing free community support. Appeals to 45%+ seeking fitness goals.",
        projects: [
          {
            name: "5K Training Program",
            description: "Follow structured couch-to-5K program with gradual progression",
            explanation: "Clear progression from couch to 5K with NHS Couch to 5K app providing free guidance. 63.7% of UK adults are active, with community aspect addressing loneliness epidemic.",
            tasks: [
              {
                name: "Download NHS Couch to 5K app and commit to 3 weekly training sessions",
                completed: false
              },
              {
                name: "Find local running group or Parkrun event for community support and motivation",
                completed: false
              }
            ]
          },
          {
            name: "5K Achievement and Beyond",
            description: "Complete first 5K run and establish ongoing running routine",
            explanation: "Parkrun's 1,342 UK events make this accessible nationwide. Links to NHS prevention priorities and post-pandemic fitness recovery.",
            tasks: [
              {
                name: "Register for and complete first official 5K run or Parkrun event",
                completed: false
              },
              {
                name: "Set next running goal (10K, faster 5K time) to maintain momentum and fitness",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Master Quality Sleep",
        description: "Achieve consistent 7+ hours quality sleep nightly for better health and productivity",
        icon: "moon-outline",
        explanation: "80% aim for 8+ hours but only 19% achieve it, with 41% getting ≤6 hours. Direct impact on productivity crucial for professionals, with 38% rarely feeling well-rested.",
        projects: [
          {
            name: "Sleep Hygiene Implementation",
            description: "Create environment and routines that support quality sleep",
            explanation: "25-34 age group shows 56% report high workload stress affecting sleep. Mental Health UK identifies this as key burnout factor costing employers £57.4bn annually.",
            tasks: [
              {
                name: "Establish consistent bedtime routine and sleep schedule aiming for 7-8 hours nightly",
                completed: false
              },
              {
                name: "Optimize bedroom environment (temperature, lighting, electronics) for better sleep quality",
                completed: false
              }
            ]
          },
          {
            name: "Sleep Quality Monitoring",
            description: "Track and improve sleep quality using evidence-based techniques",
            explanation: "46% own sleep-tracking devices, making measurement easy. Achievable through evidence-based sleep hygiene within 6 months.",
            tasks: [
              {
                name: "Use sleep tracking app or device to monitor sleep patterns and quality",
                completed: false
              },
              {
                name: "Identify and address sleep disruptors (stress, caffeine, screen time) systematically",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Reduce Alcohol Consumption",
        description: "Cut alcohol intake by 50% or complete structured challenges like Dry January",
        icon: "wine-outline",
        explanation: "30% of men and 26% of women want to reduce alcohol, with 15.5 million planning alcohol-free January 2025. Multiple motivations: save money (24%), better sleep (18%), fitness (16%).",
        projects: [
          {
            name: "Alcohol Reduction Strategy",
            description: "Implement structured approach to reducing alcohol consumption",
            explanation: "UK drinking culture makes this particularly relevant. 'Sober curious' movement growing among professionals with clear benefits within weeks.",
            tasks: [
              {
                name: "Track current alcohol consumption and set specific reduction targets (50% or alcohol-free days)",
                completed: false
              },
              {
                name: "Find alcohol-free alternatives and social activities that don't center around drinking",
                completed: false
              }
            ]
          },
          {
            name: "Sustainable Drinking Habits",
            description: "Establish long-term healthy relationship with alcohol",
            explanation: "48% of UK drinkers plan reduction. Dry January provides structured, time-bound goal with community support through official campaign.",
            tasks: [
              {
                name: "Complete Dry January or similar alcohol-free challenge with tracking and support",
                completed: false
              },
              {
                name: "Maintain reduced alcohol consumption and track improvements in sleep, fitness, and savings",
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
        name: "Move in with Partner",
        description: "Establish cohabitation partnership within 18 months as modern relationship milestone",
        icon: "home-heart-outline",
        explanation: "90% of UK couples now cohabitate before marriage (record high). With marriage rates below 50% for first time, cohabitation represents modern relationship milestone.",
        projects: [
          {
            name: "Relationship Readiness Assessment",
            description: "Evaluate relationship readiness and compatibility for cohabitation",
            explanation: "Fastest-growing family type with 3.6M couples (144% increase since 1996). Average cohabitation age aligns with 25-35 demographic.",
            tasks: [
              {
                name: "Have open conversations about expectations, finances, and future goals with partner",
                completed: false
              },
              {
                name: "Spend extended time together (weekends, holidays) to test compatibility",
                completed: false
              }
            ]
          },
          {
            name: "Cohabitation Planning and Execution",
            description: "Plan practical aspects of moving in together and establish household systems",
            explanation: "Economic pressures (£1,900 average cost to find 'the one') make shared living financially appealing. 35% value relationships more post-COVID.",
            tasks: [
              {
                name: "Find suitable shared accommodation and plan moving logistics together",
                completed: false
              },
              {
                name: "Establish household routines, shared expenses, and conflict resolution systems",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Strong Friendships",
        description: "Create core friend circle of 3-5 close connections for support and companionship",
        icon: "people-outline",
        explanation: "51% find making friends difficult, with 25-34 showing highest loneliness rates (9% often/always lonely). Intentional friendship building addresses post-pandemic social recovery needs.",
        projects: [
          {
            name: "Friendship Network Building",
            description: "Actively meet new people and develop meaningful friendships",
            explanation: "28% lack a 'best friend.' Rise of friendship apps and IRL meetups shows active demand. UK pub/social club culture supports this goal.",
            tasks: [
              {
                name: "Join clubs, classes, or groups aligned with your interests to meet like-minded people",
                completed: false
              },
              {
                name: "Use friendship apps (Bumble BFF) or attend meetup events to expand social circle",
                completed: false
              }
            ]
          },
          {
            name: "Friendship Deepening and Maintenance",
            description: "Strengthen existing connections and maintain regular contact with friends",
            explanation: "'Friendship CV' trend shows professionals actively pursuing platonic connections. Post-pandemic social recovery requires intentional effort.",
            tasks: [
              {
                name: "Schedule regular activities with friends and maintain consistent contact",
                completed: false
              },
              {
                name: "Be vulnerable and authentic in friendships to create deeper, more meaningful connections",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Find Quality Romantic Connection",
        description: "Master 'slow dating' approach for meaningful relationships over casual encounters",
        icon: "heart-outline",
        explanation: "Dating app fatigue drives shift to quality over quantity. UK dating costs (£1,900 to find partner) make strategic approach essential for meaningful connections.",
        projects: [
          {
            name: "Strategic Dating Approach",
            description: "Implement slow dating strategy focused on quality connections",
            explanation: "Hinge leads UK market with relationship focus. 25% increase in dating event attendance shows preference for real-world connections.",
            tasks: [
              {
                name: "Define relationship values and what you're looking for in a long-term partner",
                completed: false
              },
              {
                name: "Choose dating platforms and events that attract people seeking serious relationships",
                completed: false
              }
            ]
          },
          {
            name: "Authentic Connection Building",
            description: "Focus on genuine compatibility and take time to build strong foundations",
            explanation: "40% now split bills, showing practical modern approach. 82% of UK Gen Z report loneliness despite digital connectivity, driving demand for meaningful relationships.",
            tasks: [
              {
                name: "Practice authentic communication and take time to really get to know potential partners",
                completed: false
              },
              {
                name: "Attend dating events, activities, or social gatherings that enable natural conversation",
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
        name: "Learn New Language",
        description: "Achieve conversational fluency in chosen language within 18 months",
        icon: "chatbubble-outline",
        explanation: "UK ranks #2 globally for multilingual learning. Post-Brexit context reignites interest in European languages for cultural/family reasons beyond career benefits.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "european",
            name: "European Languages (French, German, Spanish)",
            description: "Learn popular European language for travel, culture, and post-Brexit connections",
            projects: [
              {
                name: "European Language Foundation",
                description: "Build solid foundation in French, German, or Spanish grammar and vocabulary",
                explanation: "Post-Brexit context reignites European language interest. 63% do online learning, making app-based approaches highly viable.",
                tasks: [
                  {
                    name: "Complete Duolingo or Babbel course reaching A2 level in chosen European language",
                    completed: false
                  },
                  {
                    name: "Practice daily with native content (news, podcasts, films) for 20-30 minutes",
                    completed: false
                  }
                ]
              },
              {
                name: "European Cultural Immersion",
                description: "Apply language skills through cultural engagement and conversation practice",
                explanation: "B1-level achievable in 18 months. EU travel and cultural connections provide practical motivation for UK learners.",
                tasks: [
                  {
                    name: "Join local European language meetup or find conversation exchange partner",
                    completed: false
                  },
                  {
                    name: "Plan trip to European country and navigate key interactions in target language",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "programming",
            name: "Programming Languages (Python, JavaScript)",
            description: "Master coding languages for career development and technical skills",
            projects: [
              {
                name: "Programming Fundamentals",
                description: "Learn core programming concepts and syntax in Python or JavaScript",
                explanation: "UK tech sector (£784bn) offers strong career prospects. Programming skills provide £26,000-£80,000+ salary potential.",
                tasks: [
                  {
                    name: "Complete Python for Everybody or JavaScript fundamentals course on Coursera/freeCodeCamp",
                    completed: false
                  },
                  {
                    name: "Build 3 small projects demonstrating variables, functions, loops, and data structures",
                    completed: false
                  }
                ]
              },
              {
                name: "Applied Programming Projects",
                description: "Create real-world applications showcasing programming problem-solving",
                explanation: "Portfolio projects essential for career transition. Self-taught programmers increasingly accepted by UK employers.",
                tasks: [
                  {
                    name: "Build web application or automation script solving real problem you face",
                    completed: false
                  },
                  {
                    name: "Share code on GitHub and present project to demonstrate technical communication",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "bsl",
            name: "British Sign Language (BSL)",
            description: "Learn BSL for communication accessibility and community connection",
            projects: [
              {
                name: "BSL Communication Basics",
                description: "Master essential BSL vocabulary and grammar for daily communication",
                explanation: "BSL is UK's fourth most-used language. Growing demand for accessibility creates career opportunities and community connections.",
                tasks: [
                  {
                    name: "Complete BSL Level 1 course through local college or online provider like SignHealth",
                    completed: false
                  },
                  {
                    name: "Practice fingerspelling alphabet and numbers until fluent (30+ words/minute)",
                    completed: false
                  }
                ]
              },
              {
                name: "Deaf Community Engagement",
                description: "Connect with Deaf community and apply BSL skills in real conversations",
                explanation: "150,000 BSL users in UK. Community engagement essential for language development and cultural understanding.",
                tasks: [
                  {
                    name: "Attend local Deaf community events or BSL practice groups for conversation",
                    completed: false
                  },
                  {
                    name: "Volunteer with deaf organizations to practice BSL while supporting accessibility",
                    completed: false
                  }
                ]
              }
            ]
          }
        ],
        projects: [
          {
            name: "Language Learning Foundation",
            description: "Establish structured learning routine using proven methods and resources",
            explanation: "Welsh grew 44% in 2020, demonstrating UK appetite. 63% do online learning, supporting app adoption. Duolingo shows high UK engagement.",
            tasks: [
              {
                name: "Choose learning method (app, classes, tutor) and commit to daily 20-30 minute practice",
                completed: false
              },
              {
                name: "Set monthly milestones and track progress toward conversational fluency (B1 level)",
                completed: false
              }
            ]
          },
          {
            name: "Language Practice and Application",
            description: "Apply language skills in real-world contexts for practical fluency",
            explanation: "B1-level achievable in 18 months with consistent practice. Cost-effective at £300-800 total investment through apps and online resources.",
            tasks: [
              {
                name: "Find conversation partners, language exchange groups, or online speaking practice",
                completed: false
              },
              {
                name: "Use language in practical contexts (travel, media consumption, cultural events)",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Master Public Speaking",
        description: "Develop confident public speaking skills for personal and professional growth",
        icon: "megaphone-outline",
        explanation: "High demand across UK cities with multiple established providers. 65% of workers participated in learning, with communication skills top priority. Builds confidence beyond work contexts.",
        projects: [
          {
            name: "Public Speaking Skills Development",
            description: "Learn fundamentals through structured training and practice opportunities",
            explanation: "Strong course availability (Impact Factory, Public Speaking Academy). Addresses career-limiting factor while building life confidence.",
            tasks: [
              {
                name: "Enroll in public speaking course or join local Toastmasters chapter",
                completed: false
              },
              {
                name: "Practice regularly through prepared speeches and impromptu speaking exercises",
                completed: false
              }
            ]
          },
          {
            name: "Speaking Confidence Building",
            description: "Apply speaking skills in real situations to build lasting confidence",
            explanation: "Toastmasters provides ongoing practice structure at £100-150/year. Measurable through ability to deliver 15-20 minute presentations confidently.",
            tasks: [
              {
                name: "Volunteer for speaking opportunities at work, community groups, or social events",
                completed: false
              },
              {
                name: "Deliver confident 15-20 minute presentation to demonstrate mastery",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Financial Knowledge",
        description: "Achieve practical financial literacy for better money management and life decisions",
        icon: "calculator-outline",
        explanation: "Only 49% pass basic financial literacy tests, with 60% believing this should be taught in schools. Reduces financial stress affecting 35% of adults.",
        projects: [
          {
            name: "Financial Education Foundation",
            description: "Learn essential financial concepts through structured education program",
            explanation: "86% agree financial literacy should be on national curriculum. Strong correlation between knowledge and life satisfaction in UK studies.",
            tasks: [
              {
                name: "Complete comprehensive financial literacy course covering budgeting, investing, and planning",
                completed: false
              },
              {
                name: "Read financial education books and follow reputable UK financial advice sources",
                completed: false
              }
            ]
          },
          {
            name: "Practical Financial Application",
            description: "Apply financial knowledge to personal money management and life decisions",
            explanation: "3-6 month intensive learning creates foundation for all financial goals. Cost-effective at £150-400 total investment in education.",
            tasks: [
              {
                name: "Create comprehensive budget and investment plan using newfound knowledge",
                completed: false
              },
              {
                name: "Make informed financial decisions about ISAs, pensions, insurance, and major purchases",
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
        name: "Complete Active Challenge Events",
        description: "Participate in 3 active challenge events (5K, 10K, obstacle races) within 12 months",
        icon: "trophy-outline",
        explanation: "31% increase in active event participation with 17% higher spending intentions. Combines fitness with achievement milestones. Entry fees (£15-50) make it accessible.",
        projects: [
          {
            name: "Challenge Event Planning",
            description: "Select and register for diverse active challenges throughout the year",
            explanation: "63.7% meeting activity guidelines (record high). Charity events offer free training programs. Strong UK charity run culture provides community support.",
            tasks: [
              {
                name: "Research and register for 3 different active events (5K, 10K, obstacle race, charity run)",
                completed: false
              },
              {
                name: "Create training schedule that prepares you for each event with adequate rest between",
                completed: false
              }
            ]
          },
          {
            name: "Event Participation and Achievement",
            description: "Complete active challenges and celebrate fitness milestones",
            explanation: "Provides structure to fitness goals with social elements. Mix of 5K, 10K, obstacle races maintains variety and progressive challenge.",
            tasks: [
              {
                name: "Complete all 3 registered events and track improvement in times/performance",
                completed: false
              },
              {
                name: "Celebrate achievements and plan next year's challenge events to maintain momentum",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Explore UK Heritage Sites",
        description: "Visit 12 UK heritage sites using annual leave strategically throughout the year",
        icon: "castle-outline",
        explanation: "64% took domestic holidays (up from 60%). National Trust's 5.46M members show appetite. Encourages using full annual leave (60% don't use all their days).",
        projects: [
          {
            name: "Heritage Site Discovery Planning",
            description: "Plan monthly heritage site visits using National Trust membership and annual leave",
            explanation: "500+ National Trust properties at £78/year family membership. Day visit spending up 6% to £48.4bn shows trend strength and cultural interest.",
            tasks: [
              {
                name: "Get National Trust membership and create list of 12 heritage sites to visit throughout year",
                completed: false
              },
              {
                name: "Plan heritage visits around long weekends and annual leave for maximum exploration time",
                completed: false
              }
            ]
          },
          {
            name: "Cultural Exploration and Learning",
            description: "Maximize learning and enjoyment from heritage site visits",
            explanation: "Monthly visits create achievable spread. Maximizes weekends through strategic leave planning while supporting UK cultural preservation.",
            tasks: [
              {
                name: "Research history of each site before visiting and take guided tours where available",
                completed: false
              },
              {
                name: "Document visits with photos and journal entries to remember experiences and share with others",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Develop Creative Hobby",
        description: "Build creative skills with monthly progression goals in chosen artistic pursuit",
        icon: "palette-outline",
        explanation: "Photography most desired (33% would try if money no object). Under-35s most likely to engage creatively. Provides stress relief separate from work achievements.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "photography",
            name: "Photography & Visual Arts",
            description: "Develop photography skills from smartphone basics to DSLR mastery",
            projects: [
              {
                name: "Photography Fundamentals",
                description: "Master basic photography techniques and equipment",
                explanation: "Photography is most desired creative skill (33%). Start with smartphone, progress to basic DSLR (£200-500). Instagram sharing culture supports progress tracking.",
                tasks: [
                  {
                    name: "Learn composition basics (rule of thirds, lighting, framing) through daily photo practice",
                    completed: false
                  },
                  {
                    name: "Complete online photography course and practice manual camera settings",
                    completed: false
                  }
                ]
              },
              {
                name: "Visual Portfolio Development",
                description: "Build portfolio showcasing photography skills and artistic vision",
                explanation: "Strong UK creative communities provide feedback and inspiration. Monthly skill goals maintain momentum and clear progression.",
                tasks: [
                  {
                    name: "Create themed photography project (portraits, landscapes, street) with 20+ images",
                    completed: false
                  },
                  {
                    name: "Share work on Instagram/portfolio site and join local photography meetups",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "crafts",
            name: "Crafts & Making (pottery, woodwork, textiles)",
            description: "Learn hands-on crafts like pottery, woodworking, or textile arts",
            projects: [
              {
                name: "Craft Skills Foundation",
                description: "Learn basic techniques in chosen craft through structured practice",
                explanation: "Trending crafts include pottery, candle painting, tufting. Strong community culture with local studios and workshops across UK cities.",
                tasks: [
                  {
                    name: "Take beginner workshop in chosen craft (pottery, woodwork, textiles) to learn basics",
                    completed: false
                  },
                  {
                    name: "Practice at home or studio space weekly, completing 2-3 pieces monthly",
                    completed: false
                  }
                ]
              },
              {
                name: "Craft Mastery & Community",
                description: "Develop advanced techniques and connect with maker community",
                explanation: "UK has strong maker culture with studio spaces, markets, and online communities supporting craft development and sharing.",
                tasks: [
                  {
                    name: "Complete intermediate course or mentorship to develop signature style/technique",
                    completed: false
                  },
                  {
                    name: "Display work at local market, craft fair, or gift pieces to demonstrate skill level",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "music-performance",
            name: "Music & Performance Arts",
            description: "Learn musical instrument, singing, or performance skills",
            projects: [
              {
                name: "Musical Instrument Mastery",
                description: "Learn to play guitar, piano, or other instrument with consistent practice",
                explanation: "Under-35s most likely to engage in creative pursuits. Music provides stress relief and social connection through jam sessions and performances.",
                tasks: [
                  {
                    name: "Choose instrument and complete beginner course or weekly lessons for 3 months",
                    completed: false
                  },
                  {
                    name: "Practice 30 minutes daily and learn 5 songs you can perform confidently",
                    completed: false
                  }
                ]
              },
              {
                name: "Performance & Musical Community",
                description: "Apply musical skills through performance and collaboration",
                explanation: "Strong UK music scene with open mic nights, community choirs, and amateur bands providing performance opportunities at all skill levels.",
                tasks: [
                  {
                    name: "Perform at open mic night, join local band/choir, or busker license for street performance",
                    completed: false
                  },
                  {
                    name: "Record and share 2-3 songs to demonstrate musical progress and confidence",
                    completed: false
                  }
                ]
              }
            ]
          }
        ],
        projects: [
          {
            name: "Creative Skill Foundation",
            description: "Establish basic skills and regular practice routine in chosen creative area",
            explanation: "Trending crafts include pottery, candle painting, tufting. Strong Instagram sharing culture supports progress tracking and community building.",
            tasks: [
              {
                name: "Choose creative hobby and invest in basic equipment or materials needed to start",
                completed: false
              },
              {
                name: "Set up regular practice schedule and monthly skill-building goals",
                completed: false
              }
            ]
          },
          {
            name: "Creative Growth and Sharing",
            description: "Develop advanced skills and share creative work with community",
            explanation: "Start with smartphone photography, progress to basic DSLR (£200-500). Monthly skill goals maintain momentum and provide clear progression markers.",
            tasks: [
              {
                name: "Complete first major creative project and share with friends or online community",
                completed: false
              },
              {
                name: "Join local creative groups or classes to learn from others and gain inspiration",
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
        name: "Volunteer Using Professional Skills",
        description: "Commit to monthly skills-based volunteering (4-8 hours) for meaningful community impact",
        icon: "heart-outline",
        explanation: "Only 10% of 25-34s volunteer monthly (lowest of all ages), yet 52% of non-volunteers interested if using existing skills. Addresses social consciousness practically.",
        projects: [
          {
            name: "Skills-Based Volunteering Setup",
            description: "Find organization that can utilize your professional skills for community benefit",
            explanation: "31% now volunteer remotely, enabling flexibility. Reach Volunteering provides skill-based matching. 21% support local community groups.",
            tasks: [
              {
                name: "Research charities and causes that could benefit from your professional skills",
                completed: false
              },
              {
                name: "Contact chosen organization and establish regular monthly volunteering commitment",
                completed: false
              }
            ]
          },
          {
            name: "Volunteer Impact and Growth",
            description: "Maximize impact of volunteer work and develop community leadership",
            explanation: "4-8 hours monthly fits professional schedules. Project-based commitments reduce ongoing pressure while creating meaningful contribution.",
            tasks: [
              {
                name: "Complete first 6 months of regular volunteering and assess impact created",
                completed: false
              },
              {
                name: "Take on additional responsibility or project leadership role within volunteer organization",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Reduce Environmental Impact",
        description: "Take personal action on climate change while engaging in community environmental efforts",
        icon: "leaf-outline",
        explanation: "70% of Gen Z see climate change as biggest threat. Combines personal behavior change with collective action, avoiding individual guilt while enabling impact.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "carbon-reduction",
            name: "Personal Carbon Footprint Reduction",
            description: "Focus on reducing personal carbon emissions through lifestyle changes",
            projects: [
              {
                name: "Carbon Footprint Assessment",
                description: "Calculate and systematically reduce personal carbon emissions",
                explanation: "20% emission reduction achievable through lifestyle changes. Average UK carbon footprint is 10.9 tonnes CO2/year, targeting 6-8 tonnes is realistic.",
                tasks: [
                  {
                    name: "Use carbon calculator to measure current footprint and identify top 3 emission sources",
                    completed: false
                  },
                  {
                    name: "Implement transport changes (cycling, public transport, reduced flights) to cut emissions 30%",
                    completed: false
                  }
                ]
              },
              {
                name: "Sustainable Lifestyle Integration",
                description: "Create long-term sustainable habits across diet, energy, and consumption",
                explanation: "Plant-based meals reduce food emissions 50%. Home energy efficiency improvements save £300+ annually while reducing carbon impact.",
                tasks: [
                  {
                    name: "Reduce meat consumption 50% and switch to renewable energy provider",
                    completed: false
                  },
                  {
                    name: "Track monthly carbon savings and share progress to inspire others",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "zero-waste",
            name: "Zero-Waste & Sustainable Living",
            description: "Implement zero-waste practices and sustainable consumption habits",
            projects: [
              {
                name: "Zero-Waste Implementation",
                description: "Systematically eliminate household waste through the 5 R's (Refuse, Reduce, Reuse, Recycle, Rot)",
                explanation: "UK generates 222M tonnes waste annually. Food waste reduction alone saves £1,000/year per household. 80% waste reduction achievable.",
                tasks: [
                  {
                    name: "Audit household waste and implement refuse/reduce strategies for single-use items",
                    completed: false
                  },
                  {
                    name: "Set up comprehensive home systems for reuse, recycling, and composting",
                    completed: false
                  }
                ]
              },
              {
                name: "Sustainable Consumption Mastery",
                description: "Extend zero-waste principles to all purchasing and consumption decisions",
                explanation: "Initial setup £150-400 for reusable containers/bags. Ongoing savings £500-1,000 annually through reduced consumption and waste.",
                tasks: [
                  {
                    name: "Replace household products with sustainable alternatives and eliminate single-use items",
                    completed: false
                  },
                  {
                    name: "Document 6-month zero-waste journey and share tips with community",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "community-action",
            name: "Community Environmental Action",
            description: "Join local environmental groups and campaigns for systemic change",
            projects: [
              {
                name: "Environmental Community Engagement",
                description: "Connect with local climate action groups and participate in campaigns",
                explanation: "Climate Coalition has 130+ member organizations. 70% of Gen Z see climate as biggest threat, driving community action demand.",
                tasks: [
                  {
                    name: "Join local environmental group (Friends of the Earth, Transition Towns, etc.) and attend meetings",
                    completed: false
                  },
                  {
                    name: "Participate in 2 community environmental campaigns or initiatives (tree planting, cleanup, advocacy)",
                    completed: false
                  }
                ]
              },
              {
                name: "Climate Action Leadership",
                description: "Take leadership role in local environmental initiatives and campaigns",
                explanation: "Community environmental projects provide systemic impact beyond individual action. Addresses climate anxiety through collective efficacy.",
                tasks: [
                  {
                    name: "Organize neighborhood environmental initiative (community garden, solar co-op, repair cafe)",
                    completed: false
                  },
                  {
                    name: "Engage with local council on environmental policies and track community impact",
                    completed: false
                  }
                ]
              }
            ]
          }
        ],
        projects: [
          {
            name: "Environmental Impact Assessment",
            description: "Measure current environmental impact and identify reduction opportunities",
            explanation: "21% willing to pay more for sustainable products. Climate Coalition's 130+ member organizations provide action opportunities.",
            tasks: [
              {
                name: "Calculate personal carbon footprint and identify top 3 areas for reduction",
                completed: false
              },
              {
                name: "Implement sustainable lifestyle changes in transport, diet, and consumption habits",
                completed: false
              }
            ]
          },
          {
            name: "Community Environmental Engagement",
            description: "Connect with local environmental groups for collective climate action",
            explanation: "20% emission reduction achievable through lifestyle changes. Community action addresses systemic change desires and environmental anxiety.",
            tasks: [
              {
                name: "Join local environmental group or participate in community climate action initiatives",
                completed: false
              },
              {
                name: "Track environmental impact reduction and share sustainable living tips with others",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Take Community Leadership Role",
        description: "Assume local leadership position in community organization or local government",
        icon: "people-outline",
        explanation: "Only 5% from deprived areas take leadership roles versus 13% from affluent areas. Addresses representation while developing leadership skills.",
        projects: [
          {
            name: "Community Leadership Preparation",
            description: "Build skills and knowledge needed for effective community leadership",
            explanation: "Strong post-pandemic appetite for community involvement. Step on Board provides trustee training. Growing need for diverse voluntary sector leadership.",
            tasks: [
              {
                name: "Research local community organizations and identify leadership opportunities that align with interests",
                completed: false
              },
              {
                name: "Complete trustee training or community leadership course to build relevant skills",
                completed: false
              }
            ]
          },
          {
            name: "Leadership Role Implementation",
            description: "Take on formal leadership position and create positive community impact",
            explanation: "2-3 hours monthly initially, building involvement over 1-2 years. Aligns professional skills with community needs for mutual benefit.",
            tasks: [
              {
                name: "Apply for and secure leadership role on community board, council, or organization",
                completed: false
              },
              {
                name: "Lead specific project or initiative that creates measurable positive community impact",
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
        name: "Create Home Office Setup",
        description: "Establish dedicated work-from-home space for productivity and work-life balance",
        icon: "desktop-outline",
        explanation: "81% work from home weekly, yet only 11% have dedicated office space. 39% work from dining tables, 23% from sofas. Directly improves productivity and work-life balance.",
        projects: [
          {
            name: "Home Office Design and Setup",
            description: "Create functional workspace that supports productivity and wellbeing",
            explanation: "29% follow hybrid patterns, highest among 25-35s. Average saves £2,500-4,000 annually on commuting. 89% of UK homes lack office space requiring creative solutions.",
            tasks: [
              {
                name: "Designate specific area for work and invest in essential office furniture (desk, chair, lighting)",
                completed: false
              },
              {
                name: "Set up technology infrastructure (monitor, webcam, internet) for effective remote work",
                completed: false
              }
            ]
          },
          {
            name: "Work-Life Balance Optimization",
            description: "Use home office setup to create clear boundaries between work and personal life",
            explanation: "Budget options £200-500, premium £800-1,500. Works for renters through non-permanent solutions that can be adapted to any space.",
            tasks: [
              {
                name: "Establish work hours and routines that use office space to signal start/end of workday",
                completed: false
              },
              {
                name: "Optimize home office for comfort during long work sessions (ergonomics, air quality, organization)",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Improve Home Energy Efficiency",
        description: "Achieve energy rating C+ and reduce utility bills through efficiency improvements",
        icon: "flash-outline",
        explanation: "70% want more efficient homes, with only 52% currently rated C+. Reduces bills by 15-25% amid energy crisis. Government target for 2035 creates momentum.",
        projects: [
          {
            name: "Energy Efficiency Assessment",
            description: "Evaluate current home energy performance and identify improvement opportunities",
            explanation: "UK has Europe's oldest housing stock with 60% below C rating. Grants available up to £6,000 for qualifying improvements.",
            tasks: [
              {
                name: "Get home energy assessment and research available grants for efficiency improvements",
                completed: false
              },
              {
                name: "Implement renter-friendly efficiency measures (LED bulbs, smart thermostat, draught proofing)",
                completed: false
              }
            ]
          },
          {
            name: "Long-Term Efficiency Improvements",
            description: "Plan and execute major efficiency upgrades for maximum energy savings",
            explanation: "Saves £400+ annually on bills. Renter options (LED, smart thermostats) £100-300. Owner upgrades £2,000-8,000 with government support.",
            tasks: [
              {
                name: "Plan major efficiency improvements (insulation, windows, heating) if homeowner",
                completed: false
              },
              {
                name: "Track energy usage and bills to measure improvement and celebrate savings achieved",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Live Zero-Waste Lifestyle",
        description: "Implement comprehensive zero-waste system to minimize household waste and environmental impact",
        icon: "leaf-outline",
        explanation: "Addresses UK's 222M tonnes annual waste. Food waste reduction alone saves £1,000/year. Growing Zero Waste movement with annual campaigns provides support.",
        projects: [
          {
            name: "Zero-Waste Implementation",
            description: "Systematically reduce household waste through reuse, recycling, and consumption changes",
            explanation: "UK committed to 50% food waste reduction by 2030. Council recycling systems support implementation. Pinterest searches trending upward showing growing interest.",
            tasks: [
              {
                name: "Audit current household waste and implement zero-waste practices in daily routines",
                completed: false
              },
              {
                name: "Set up comprehensive recycling, composting, and reuse systems at home",
                completed: false
              }
            ]
          },
          {
            name: "Sustainable Living Integration",
            description: "Extend zero-waste principles to all areas of life and consumption",
            explanation: "Initial setup £150-400, ongoing savings £500-1,000 annually. 80% waste reduction achievable within 18 months through systematic approach.",
            tasks: [
              {
                name: "Choose sustainable alternatives for household products and eliminate single-use items",
                completed: false
              },
              {
                name: "Track waste reduction progress and share zero-waste tips with friends and community",
                completed: false
              }
            ]
          }
        ]
      }
    ]
  }
];
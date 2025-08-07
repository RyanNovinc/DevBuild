// src/screens/Onboarding/data/countries/india.js
// Indian-specific domain definitions with goals based on 2024-2025 research
export const DOMAIN_DEFINITIONS = [
  {
    name: "Career & Work",
    icon: "briefcase",
    color: "#3b82f6", // Blue
    description: "Professional advancement, workplace goals, career development",
    goals: [
      {
        name: "Switch to Tech Career",
        description: "Transition into high-growth technology roles with remote work opportunities and competitive salaries",
        icon: "code-slash",
        explanation: "India's tech sector is exploding with incredible opportunities! With 4.5 million IT professionals and growing, smart professionals are pivoting into development, data science, and fintech roles that pay ₹8-25L+ annually and offer global remote opportunities.",
        projects: [
          {
            name: "AI/ML Foundation Skills",
            description: "Build core technical knowledge in machine learning and artificial intelligence",
            explanation: "Government's Skill India Digital Hub actively promotes AI/ML education. 5,000+ Global Capability Centers create strong demand for AI talent.",
            tasks: [
              {
                name: "Complete Python and ML fundamentals course",
                summary: "Learn Python/ML",
                explanation: "Python dominates AI/ML development in Indian tech companies. Strong foundation enables progression to specialized roles with higher compensation packages.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Build 3 practical AI/ML projects",
                summary: "Create projects",
                explanation: "Practical projects provide portfolio evidence for employers. Indian companies value hands-on experience over certifications alone for AI/ML hiring decisions.",
                timeframe: "2 months",
                completed: false
              }
            ]
          },
          {
            name: "Industry Certification and Specialization",
            description: "Earn recognized credentials and choose AI/ML specialization area",
            explanation: "Specialized roles like ML Engineers face 60-73% demand-supply disparity. Certification provides credible evidence of skills for career transition.",
            tasks: [
              {
                name: "Get cloud certification in AI/ML domain",
                summary: "Get certified",
                explanation: "Cloud certifications from major providers are highly valued by Indian employers. These certifications align with industry demand and demonstrate practical skills.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Apply for AI/ML roles at tech companies",
                summary: "Apply roles",
                explanation: "India's 100+ unicorn ecosystem and major GCCs offer abundant AI/ML opportunities. Strategic applications to multiple companies increase success probability.",
                timeframe: "3 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Secure Flexible Work Agreement",
        description: "Negotiate hybrid or remote work arrangements that balance productivity with work-life harmony",
        icon: "home",
        explanation: "Work-life balance is now twice as important as salary for attracting talent! 52.4% YoY growth in hybrid job postings shows smart professionals are securing flexible arrangements that maintain career growth while improving quality of life.",
        projects: [
          {
            name: "Flexible Work Proposal Development",
            description: "Create compelling business case for hybrid/remote work arrangement",
            explanation: "52.4% YoY growth in hybrid job postings shows employer acceptance. Well-structured proposals addressing productivity and business benefits increase approval likelihood.",
            tasks: [
              {
                name: "Document metrics and propose hybrid trial",
                summary: "Create proposal",
                explanation: "Data-driven proposals resonate with Indian management culture. Demonstrating maintained or improved productivity removes employer concerns about remote work effectiveness.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Research policy and find hybrid examples",
                summary: "Research precedents",
                explanation: "Internal examples provide precedent for negotiations. Understanding existing policy framework helps position request within acceptable parameters.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Hybrid Work Implementation",
            description: "Successfully transition to and optimize flexible work arrangement",
            explanation: "73% productivity improvement reported by hybrid workers validates this arrangement. Success requires structured approach to maintain performance and relationships.",
            tasks: [
              {
                name: "Set up productive home office space",
                summary: "Setup workspace",
                explanation: "Professional home office demonstrates commitment to hybrid success and addresses employer concerns about work environment quality and focus.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Set up team communication protocols",
                summary: "Communication plan",
                explanation: "Proactive communication addresses Indian workplace hierarchy expectations and maintains strong relationships despite physical separation from office environment.",
                timeframe: "1 month",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Advance to Management Role",
        description: "Move into leadership positions with team management responsibilities and higher compensation",
        icon: "laptop",
        explanation: "Leadership opportunities are exploding in India's booming corporate sector! Management roles offer 40-60% salary premiums and accelerated career advancement. Smart professionals are positioning themselves for these high-impact positions.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "ai-ml-specialist",
            name: "AI/ML Specialist",
            description: "Focus on artificial intelligence, machine learning, and data science roles",
            projects: [
              {
                name: "AI/ML Technical Foundation",
                description: "Build comprehensive knowledge in artificial intelligence and machine learning",
                explanation: "AI/ML roles command 40-60% salary premiums. Government Digital India initiatives create strong demand for AI talent.",
                tasks: [
                  {
                    name: "Learn Python and statistics for data science",
                    summary: "Learn foundations",
                    explanation: "Python and statistics form the technical foundation for AI/ML careers. These skills are essential for all specialized AI roles in Indian tech companies.",
                    timeframe: "2 months",
                    completed: false
                  },
                  {
                    name: "Master ML algorithms and build portfolio",
                    summary: "Build ML portfolio",
                    explanation: "Hands-on ML experience with real datasets demonstrates practical skills to employers. Portfolio projects differentiate candidates in competitive AI job market.",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              },
              {
                name: "AI Career Transition Strategy",
                description: "Position yourself for AI/ML roles in Indian tech ecosystem",
                explanation: "600,000 to 1,250,000 projected growth in AI talent demand by 2027 creates abundant opportunities for career switchers.",
                tasks: [
                  {
                    name: "Get industry AI/ML certification",
                    summary: "Get certified",
                    explanation: "Cloud platform certifications are highly valued by Indian employers and provide credible evidence of technical competency for career transition.",
                    timeframe: "2 months",
                    completed: false
                  },
                  {
                    name: "Apply for AI/ML roles at companies",
                    summary: "Apply positions",
                    explanation: "India's unicorn ecosystem and global capability centers offer diverse AI opportunities. Strategic applications across company types maximize success probability.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "software-development",
            name: "Software Development",
            description: "Learn programming, app development, and software engineering skills",
            projects: [
              {
                name: "Programming Skills Development",
                description: "Master in-demand programming languages and development frameworks",
                explanation: "Software development remains the largest tech sector in India with consistent demand across industries and company sizes.",
                tasks: [
                  {
                    name: "Learn Java or JavaScript with frameworks",
                    summary: "Learn programming",
                    explanation: "Java and JavaScript dominate Indian software development market. Modern frameworks like React and Spring Boot are essential for current job market.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Build 4 full-stack applications",
                    summary: "Create applications",
                    explanation: "Full-stack portfolio projects demonstrate end-to-end development capabilities valued by Indian tech companies for versatility and problem-solving skills.",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Software Career Launch",
                description: "Transition into software development roles in Indian tech industry",
                explanation: "Tech talent shortage means employers hire based on demonstrated skills over formal computer science degrees.",
                tasks: [
                  {
                    name: "Deploy portfolio with documentation",
                    summary: "Deploy portfolio",
                    explanation: "Live portfolio projects allow employers to evaluate actual coding skills and development practices, significantly improving job application success rates.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Apply for junior developer roles",
                    summary: "Apply developer roles",
                    explanation: "Both product companies and service providers offer entry opportunities for career switchers, with service companies often providing structured training programs.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "cybersecurity-specialist",
            name: "Cybersecurity Specialist",
            description: "Focus on security analysis, threat detection, and data protection roles",
            projects: [
              {
                name: "Cybersecurity Foundation Training",
                description: "Build core cybersecurity knowledge and practical security skills",
                explanation: "Government investment of ₹1.67B in cyber security creates strong job demand with competitive salaries in this growing field.",
                tasks: [
                  {
                    name: "Get CompTIA Security+ or CEH certification",
                    summary: "Security certification",
                    explanation: "Industry-recognized security certifications provide foundation for cybersecurity careers and demonstrate commitment to the field for employers.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Practice security tools in virtual lab",
                    summary: "Hands-on practice",
                    explanation: "Practical experience with security tools provides job-ready skills that employers value over theoretical knowledge alone in cybersecurity roles.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Security Career Portfolio",
                description: "Build practical portfolio demonstrating security analysis capabilities",
                explanation: "Government and private sector actively recruiting cybersecurity professionals with hands-on experience and practical skills.",
                tasks: [
                  {
                    name: "Complete vulnerability assessment project",
                    summary: "Security assessment",
                    explanation: "Vulnerability assessment projects provide portfolio evidence of real-world security analysis skills and professional documentation capabilities.",
                    timeframe: "1.5 months",
                    completed: false
                  },
                  {
                    name: "Apply for cybersecurity roles",
                    summary: "Apply security roles",
                    explanation: "Financial services, tech companies, and government agencies offer structured entry pathways with excellent training and advancement opportunities.",
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
            name: "Tech Career Assessment and Planning",
            description: "Evaluate current skills and create strategic plan for tech transition",
            explanation: "Successful tech career switches require strategic planning and realistic timelines based on current skill level and market demand.",
            tasks: [
              {
                name: "Assess skills and identify target role",
                summary: "Skills assessment",
                explanation: "Understanding current technical foundation helps choose the most efficient career transition path and realistic timeline for skill development.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Research salaries and job requirements",
                summary: "Market research",
                explanation: "Understanding market demand and compensation helps set realistic expectations and choose specializations with best career growth potential.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Tech Skills Development Program",
            description: "Systematically build technical skills through structured learning approach",
            explanation: "Consistent daily learning and practical application accelerates skill development and improves job readiness for tech roles.",
            tasks: [
              {
                name: "Practice coding 2 hours daily",
                summary: "Daily practice",
                explanation: "Regular practice builds programming muscle memory and problem-solving skills essential for technical interviews and job performance.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Complete bootcamp in tech specialization",
                summary: "Formal training",
                explanation: "Structured learning programs provide comprehensive curriculum and industry-recognized credentials that employers value for career switchers.",
                timeframe: "4-6 months",
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
        description: "Save 6 months of essential expenses to protect against job loss and unexpected financial challenges",
        icon: "shield",
        explanation: "Economic uncertainty makes emergency funds essential for Indian professionals! Smart savers are using high-yield accounts and systematic approaches to build financial resilience while inflation protection becomes critical for career transitions.",
        projects: [
          {
            name: "Emergency Fund Strategy and Setup",
            description: "Calculate target amount and establish systematic savings approach",
            explanation: "RBI data shows household financial savings rebounded to 5.1% of GNDI. Systematic approach to emergency fund building creates financial resilience.",
            tasks: [
              {
                name: "Calculate 6-month emergency fund target",
                summary: "Calculate target",
                explanation: "Clear target amount provides motivation and enables tracking progress. Six months of expenses provides adequate buffer for job loss or medical emergencies.",
                timeframe: "1 day",
                completed: false
              },
              {
                name: "Open high-yield account with auto-transfers",
                summary: "Setup auto-savings",
                explanation: "Automation removes willpower barriers and ensures consistent progress. High-yield accounts maximize emergency fund growth while maintaining liquidity.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Expense Optimization for Savings",
            description: "Reduce unnecessary spending to accelerate emergency fund building",
            explanation: "47% cite 'too many expenses' as top financial obstacle. Strategic expense reduction enables faster emergency fund accumulation.",
            tasks: [
              {
                name: "Track expenses and identify cost cuts",
                summary: "Expense audit",
                explanation: "Understanding spending patterns reveals opportunities for savings that can be redirected to emergency fund without impacting quality of life.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Cancel subscriptions and save for fund",
                summary: "Cut expenses",
                explanation: "Subscription audit typically reveals ₹2,000-5,000 monthly savings that can significantly accelerate emergency fund building when redirected consistently.",
                timeframe: "1 week",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Start Investment Portfolio",
        description: "Begin systematic investing in mutual funds and stocks to build long-term wealth",
        icon: "home",
        explanation: "Inflation protection requires smart investing beyond traditional savings! Indian professionals are using mutual funds, stocks, and SIPs to build wealth while taking advantage of India's fastest-growing equity markets worldwide.",
        projects: [
          {
            name: "Home Buying Financial Planning",
            description: "Research property market and create realistic savings timeline",
            explanation: "Knight Frank data shows 46% of sales above ₹1 crore. Properties requiring ₹20-25 lakh down payments represent the fastest-growing segment.",
            tasks: [
              {
                name: "Research property prices and down payment",
                summary: "Market research",
                explanation: "Understanding local property markets helps set realistic down payment targets and identify areas with best value for money and growth potential.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Get pre-approved for home loan",
                summary: "Loan pre-approval",
                explanation: "Pre-approval clarifies exact financial requirements and EMI capacity, enabling realistic property search within affordable price range.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Strategic Down Payment Savings",
            description: "Implement systematic savings plan for property down payment accumulation",
            explanation: "6.5% annual property price growth means delaying saves less money overall. Systematic savings approach ensures target achievement within timeline.",
            tasks: [
              {
                name: "Open property savings account with auto-transfers",
                summary: "Setup property fund",
                explanation: "Separate property account prevents money being used for other purposes and provides clear tracking of progress toward homeownership goal.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Invest savings in equity mutual funds",
                summary: "Invest for growth",
                explanation: "Equity mutual funds can provide higher returns than savings accounts over 3-year timeline, helping accumulate down payment faster through market growth.",
                timeframe: "1 month",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Increase Income Streams",
        description: "Develop additional revenue sources through freelancing, consulting, or business ventures",
        icon: "storefront",
        explanation: "Multiple income streams provide financial security and accelerate wealth building through diversified revenue sources beyond primary employment.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "freelancing-consulting",
            name: "Freelancing & Consulting",
            description: "Leverage existing skills to provide services to businesses and individuals",
            projects: [
              {
                name: "Freelancing Business Setup",
                description: "Establish professional freelancing practice using existing skills",
                explanation: "Indian professionals can monetize existing expertise through platforms like Upwork, Fiverr, and local client acquisition.",
                tasks: [
                  {
                    name: "Create freelancing profiles and get 3 clients",
                    summary: "Setup profiles",
                    explanation: "Professional profiles with portfolio samples attract initial clients and establish credibility for freelancing business growth.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Develop service packages and pricing",
                    summary: "Create packages",
                    explanation: "Structured service packages enable consistent pricing and help scale beyond hourly work to achieve ₹25,000+ monthly targets.",
                    timeframe: "2 weeks",
                    completed: false
                  }
                ]
              },
              {
                name: "Freelancing Business Growth",
                description: "Scale freelancing practice to consistent monthly income through client development",
                explanation: "Successful freelancing requires systematic client acquisition and retention strategies to achieve target monthly income.",
                tasks: [
                  {
                    name: "Build referrals and maintain client relationships",
                    summary: "Client retention",
                    explanation: "Referrals and repeat clients provide stable income foundation and reduce time spent on client acquisition activities.",
                    timeframe: "Ongoing",
                    completed: false
                  },
                  {
                    name: "Optimize rates to reach ₹25,000+ monthly",
                    summary: "Scale income",
                    explanation: "Strategic rate increases and premium service offerings enable income growth without proportional time increase.",
                    timeframe: "6 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "ecommerce-online",
            name: "E-commerce & Online Store",
            description: "Create online business selling products through digital platforms",
            projects: [
              {
                name: "E-commerce Business Launch",
                description: "Establish online store and product sourcing for digital sales",
                explanation: "Amazon, Flipkart, and social media platforms provide accessible entry points for e-commerce businesses with low startup costs.",
                tasks: [
                  {
                    name: "Research products and set up seller accounts",
                    summary: "Market research",
                    explanation: "Product research identifies profitable opportunities while platform setup provides access to millions of potential customers.",
                    timeframe: "2 weeks",
                    completed: false
                  },
                  {
                    name: "Source inventory and create product listings",
                    summary: "Inventory setup",
                    explanation: "Quality product listings with professional photography significantly improve conversion rates and sales performance on e-commerce platforms.",
                    timeframe: "1 month",
                    completed: false
                  }
                ]
              },
              {
                name: "E-commerce Business Optimization",
                description: "Scale online store through marketing and operational efficiency",
                explanation: "Successful e-commerce requires continuous optimization of listings, pricing, and customer acquisition strategies.",
                tasks: [
                  {
                    name: "Use digital marketing to drive sales",
                    summary: "Marketing strategy",
                    explanation: "Digital marketing through social media, search ads, and content creation drives organic traffic and reduces customer acquisition costs.",
                    timeframe: "Ongoing",
                    completed: false
                  },
                  {
                    name: "Optimize products for ₹25,000+ monthly",
                    summary: "Revenue optimization",
                    explanation: "Data-driven product and pricing optimization based on sales performance helps achieve consistent monthly revenue targets.",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "education-content",
            name: "Educational Content & Coaching",
            description: "Create educational content and coaching services in your area of expertise",
            projects: [
              {
                name: "Content Creation Business",
                description: "Develop educational content and coaching programs for target audience",
                explanation: "India's education and skill development market offers opportunities for professionals to monetize expertise through content and coaching.",
                tasks: [
                  {
                    name: "Create curriculum for educational content",
                    summary: "Develop curriculum",
                    explanation: "Clear curriculum targeting specific audience needs provides foundation for scalable educational business with recurring revenue potential.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Launch content and get 10 paying students",
                    summary: "Launch program",
                    explanation: "Content marketing through social platforms builds audience while direct coaching provides immediate revenue to validate business model.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Educational Business Scaling",
                description: "Scale educational content business through systematic growth strategies",
                explanation: "Successful educational businesses require systematic approach to content creation, student acquisition, and program development.",
                tasks: [
                  {
                    name: "Create recurring revenue through subscriptions",
                    summary: "Recurring revenue",
                    explanation: "Subscription or ongoing coaching models provide predictable monthly income and higher lifetime customer value than one-time sales.",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Scale content to reach ₹25,000+ monthly",
                    summary: "Scale distribution",
                    explanation: "Systematic content distribution and student acquisition strategies enable consistent monthly income growth in educational business.",
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
            name: "Side Business Planning and Setup",
            description: "Choose business model and establish operational foundation",
            explanation: "Strategic business selection based on skills and market demand increases success probability and faster path to profitability.",
            tasks: [
              {
                name: "Evaluate skills and find business opportunities",
                summary: "Skills evaluation",
                explanation: "Leveraging existing expertise reduces learning curve and increases early success probability in side business ventures.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Research market and validate business idea",
                summary: "Market validation",
                explanation: "Customer validation before significant investment prevents wasted effort and ensures market demand for chosen business model.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Business Launch and Growth",
            description: "Execute business plan and scale to target monthly income",
            explanation: "Systematic approach to business launch and growth enables reaching ₹25,000+ monthly income target within realistic timeline.",
            tasks: [
              {
                name: "Launch MVP and get paying customers",
                summary: "Business launch",
                explanation: "MVP approach enables quick market entry and real customer feedback to refine business model before major investments.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Scale income to ₹25,000+ target",
                summary: "Scale revenue",
                explanation: "Strategic growth through customer acquisition, pricing optimization, and service expansion enables target income achievement.",
                timeframe: "8 months",
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
        description: "Establish regular exercise habits that improve strength, endurance, and overall health",
        icon: "barbell",
        explanation: "Regular fitness routines provide energy, stress relief, and improved health outcomes that enhance both personal and professional performance.",
        projects: [
          {
            name: "Structured Fitness Program",
            description: "Design and implement comprehensive workout routine for body transformation",
            explanation: "Gympik study reveals structured approach to fitness with both cardio and strength training produces best results for Indian professionals.",
            tasks: [
              {
                name: "Join gym and create workout schedule",
                summary: "Join gym",
                explanation: "Professional guidance ensures proper form and progressive overload essential for safe and effective body transformation results.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Do strength training 4x weekly",
                summary: "Strength training",
                explanation: "Compound movements like squats, deadlifts, and bench press build muscle mass efficiently while supporting fat loss goals.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Nutrition Optimization Plan",
            description: "Implement strategic nutrition plan supporting muscle gain and fat loss",
            explanation: "Body composition goals require precise nutrition approach balancing protein intake for muscle growth with caloric management for fat loss.",
            tasks: [
              {
                name: "Plan protein-rich meals for muscle building",
                summary: "Protein planning",
                explanation: "Adequate protein intake (1.6-2.2g per kg body weight) supports muscle protein synthesis essential for gaining lean muscle mass.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Track food and adjust for fat loss",
                summary: "Calorie management",
                explanation: "Moderate caloric deficit enables fat loss while preserving muscle mass when combined with adequate protein and resistance training.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Improve Mental Health",
        description: "Develop stress management techniques and mental wellness practices for better life balance",
        icon: "leaf",
        explanation: "Mental health practices like meditation and stress management are essential for maintaining well-being in demanding professional environments.",
        projects: [
          {
            name: "Meditation Practice Foundation",
            description: "Establish consistent daily meditation routine with proper technique",
            explanation: "74% of Indians already practice yoga regularly, showing cultural readiness for mindfulness approaches to stress management.",
            tasks: [
              {
                name: "Learn meditation through app or instruction",
                summary: "Learn meditation",
                explanation: "Proper meditation technique ensures effectiveness and prevents common mistakes that lead to practice abandonment.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Set daily 20-min meditation practice",
                summary: "Daily practice",
                explanation: "Consistent timing creates habit formation and ensures regular stress reduction benefits from mindfulness practice.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Workplace Stress Management",
            description: "Apply mindfulness techniques to manage work-related stress and pressure",
            explanation: "Indian work culture averaging 48-hour weeks requires practical stress management strategies that can be applied during work hours.",
            tasks: [
              {
                name: "Practice mindfulness during work breaks",
                summary: "Work mindfulness",
                explanation: "Short mindfulness practices during work day provide immediate stress relief and improve focus for better work performance.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Track stress and measure improvement",
                summary: "Track progress",
                explanation: "Objective stress measurement provides motivation and validates the effectiveness of meditation practice for continued adherence.",
                timeframe: "Monthly",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Optimize Nutrition",
        description: "Improve eating habits and nutrition to support energy levels, health, and performance goals",
        icon: "medical",
        explanation: "Proper nutrition provides the foundation for sustained energy, better health outcomes, and improved physical and mental performance.",
        projects: [
          {
            name: "Preventive Health Monitoring System",
            description: "Establish regular health screening and tracking for early intervention",
            explanation: "1 in 3 Indians are pre-diabetic, 2 in 3 pre-hypertensive. Early detection and intervention can reverse prediabetes and prevent progression.",
            tasks: [
              {
                name: "Get comprehensive health checkup",
                summary: "Health screening",
                explanation: "Baseline health assessment identifies current risk factors and provides starting point for preventive health interventions.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Monitor health markers quarterly",
                summary: "Regular monitoring",
                explanation: "Quarterly monitoring enables early detection of changes and timely intervention to prevent lifestyle disease progression.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Lifestyle Disease Prevention Strategy",
            description: "Implement evidence-based lifestyle changes to prevent chronic diseases",
            explanation: "Indian phenotype has higher disease risk at lower BMI than Western populations, making prevention crucial for this demographic.",
            tasks: [
              {
                name: "Follow diabetes prevention diet and exercise",
                summary: "Prevention protocol",
                explanation: "Targeted lifestyle interventions based on individual risk factors provide most effective prevention strategy for lifestyle diseases.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Maintain health through lifestyle adjustments",
                summary: "Maintain targets",
                explanation: "Consistent lifestyle maintenance and regular adjustments based on health marker trends ensure long-term disease prevention success.",
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
        description: "Organize a meaningful wedding celebration that honors traditions while reflecting your personal values",
        icon: "heart",
        explanation: "Wedding planning involves balancing family expectations, cultural traditions, and personal preferences to create a memorable celebration.",
        projects: [
          {
            name: "Wedding Planning and Budgeting",
            description: "Create comprehensive wedding plan balancing personal preferences with family expectations",
            explanation: "WeddingWire India data shows strategic planning within ₹20-40 lakh range enables personalized celebrations while managing costs effectively.",
            tasks: [
              {
                name: "Research venues, vendors, and create detailed budget breakdown for all wedding expenses",
                summary: "Budget planning",
                explanation: "Detailed budgeting prevents cost overruns and enables informed decisions about priority areas for wedding investment.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Coordinate with families to balance traditional expectations with personal wedding vision",
                summary: "Family coordination",
                explanation: "Successful wedding planning requires diplomatic navigation of family expectations while asserting personal preferences for memorable celebration.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Wedding Execution and Experience",
            description: "Execute wedding celebration that creates meaningful memories within budget",
            explanation: "45% willing to increase budgets by 50% for unique celebrations shows importance of creating memorable experience over cost cutting.",
            tasks: [
              {
                name: "Manage vendor relationships and timeline to ensure smooth wedding execution",
                summary: "Vendor management",
                explanation: "Professional vendor management ensures wedding day runs smoothly and reduces stress for couple and families during celebration.",
                timeframe: "6 months",
                completed: false
              },
              {
                name: "Create personalized touches that reflect couple's story while honoring cultural traditions",
                summary: "Personal touches",
                explanation: "Personalized elements create meaningful memories and unique celebration that guests remember while respecting family cultural values.",
                timeframe: "3 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Strengthen Family Relationships",
        description: "Build deeper connections with family members while establishing healthy boundaries and independence",
        icon: "home",
        explanation: "Strong family relationships provide emotional support and stability while modern family structures allow for independence and personal growth.",
        projects: [
          {
            name: "Independent Living Transition",
            description: "Plan and execute transition to independent household while maintaining family relationships",
            explanation: "Nuclear family establishment requires careful planning to ensure financial independence while preserving emotional connections with extended family.",
            tasks: [
              {
                name: "Secure independent housing and establish household systems for autonomous living",
                summary: "Setup household",
                explanation: "Independent housing provides space for couple bonding and modern parenting approaches while creating foundation for nuclear family development.",
                timeframe: "6 months",
                completed: false
              },
              {
                name: "Establish boundaries and communication patterns that maintain family bonds while ensuring autonomy",
                summary: "Family boundaries",
                explanation: "Clear boundaries enable independent decision-making while preserving family relationships through chosen interactions and mutual respect.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Functional Joint Family Balance",
            description: "Create sustainable model that combines independence with family connection",
            explanation: "Success means creating 'functional joint family' with autonomy plus connection - physical distance while maintaining emotional closeness.",
            tasks: [
              {
                name: "Develop systems for supporting parents while maintaining nuclear family priorities",
                summary: "Support systems",
                explanation: "Structured support systems enable caring for aging parents while protecting nuclear family time and resources for sustainable long-term relationships.",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Create regular family interaction schedule that works for both nuclear and extended family",
                summary: "Interaction schedule",
                explanation: "Planned family interactions ensure consistent connection while preventing unexpected obligations from disrupting nuclear family routines and goals.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Improve Romantic Relationship",
        description: "Enhance communication, intimacy, and connection with your romantic partner through intentional practices",
        icon: "heart-circle",
        explanation: "Strong romantic relationships require consistent effort, open communication, and quality time to maintain deep connection and mutual support.",
        projects: [
          {
            name: "Work Boundary Implementation",
            description: "Create and enforce clear boundaries between work and personal time",
            explanation: "48% working over 45 hours weekly requires intentional boundary setting to protect relationship time from work encroachment.",
            tasks: [
              {
                name: "Establish firm work hours and communicate boundaries to colleagues and supervisors",
                summary: "Work boundaries",
                explanation: "Clear work boundaries prevent after-hours work interruptions and create protected time for relationship investment and family connection.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Create technology boundaries limiting work-related communication during family time",
                summary: "Tech boundaries",
                explanation: "Technology boundaries prevent work thoughts from intruding on relationship time and improve presence during quality time with partner/family.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Quality Time Optimization",
            description: "Design and protect daily quality time for meaningful relationship connection",
            explanation: "Relationships remain primary happiness source for 53% of Indians, making dedicated quality time investment essential for relationship success.",
            tasks: [
              {
                name: "Schedule and protect 2 hours daily for undistracted time with partner/family",
                summary: "Quality time",
                explanation: "Scheduled quality time ensures consistent relationship investment and creates opportunities for emotional connection and shared experiences.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Plan regular date nights and family activities to strengthen relationship bonds",
                summary: "Relationship activities",
                explanation: "Regular planned activities create positive shared experiences and strengthen emotional bonds that sustain relationships through challenging periods.",
                timeframe: "Weekly",
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
        description: "Develop confidence and skill in presenting ideas clearly to groups and building communication expertise",
        icon: "mic",
        explanation: "Public speaking skills enhance professional presence and career advancement opportunities while building confidence in all communication scenarios.",
        projects: [
          {
            name: "Public Speaking Skills Development",
            description: "Build fundamental public speaking and presentation skills through structured practice",
            explanation: "In India's hierarchical corporate culture, articulation equals advancement. English fluency and presentation skills directly impact salary negotiations and leadership opportunities.",
            tasks: [
              {
                name: "Join Toastmasters or similar public speaking organization for structured practice",
                summary: "Join speaking group",
                explanation: "Structured environment provides regular practice opportunities and constructive feedback essential for developing confident public speaking abilities.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Complete 50 speaking practice sessions with increasing complexity and audience size",
                summary: "Practice sessions",
                explanation: "Progressive practice builds confidence and competence while overcoming linguistic diversity challenges and regional accent concerns.",
                timeframe: "18 months",
                completed: false
              }
            ]
          },
          {
            name: "Professional Communication Mastery",
            description: "Apply communication skills in professional settings for career advancement",
            explanation: "Communication skills break barriers between tier-2 city origins and metro opportunities, addressing confidence issues that limit career progression.",
            tasks: [
              {
                name: "Volunteer for presentations and speaking opportunities at work to build professional reputation",
                summary: "Work presentations",
                explanation: "Professional speaking opportunities demonstrate leadership capabilities and build internal reputation essential for career advancement and promotion considerations.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Develop signature presentation style and personal speaking brand for industry recognition",
                summary: "Speaking brand",
                explanation: "Distinctive speaking style and personal brand create professional recognition and open opportunities for conferences, panels, and thought leadership roles.",
                timeframe: "12 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Learn New Skill",
        description: "Master a valuable new competency that enhances your career prospects or personal fulfillment",
        icon: "megaphone",
        explanation: "Continuous learning and skill development keep you competitive in the job market while providing personal satisfaction and growth.",
        projects: [
          {
            name: "LinkedIn Personal Brand Strategy",
            description: "Develop and execute comprehensive LinkedIn personal branding strategy",
            explanation: "Complete LinkedIn profiles receive 40x more job opportunities. Personal branding transcends job security to create opportunity security.",
            tasks: [
              {
                name: "Optimize LinkedIn profile with professional photos, compelling headline, and detailed experience",
                summary: "Profile optimization",
                explanation: "Professional LinkedIn profile creates strong first impression and provides foundation for personal brand building and networking efforts.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Create and publish valuable content consistently to build thought leadership and followers",
                summary: "Content creation",
                explanation: "Regular valuable content builds audience and establishes expertise while leveraging India's global reputation in tech and business.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Professional Network Development",
            description: "Build strategic professional network and industry connections through personal branding",
            explanation: "Strong personal brand enables side consulting opportunities that can add 30-50% to primary income while building professional reputation.",
            tasks: [
              {
                name: "Engage with industry leaders and participate in professional discussions to build network",
                summary: "Network building",
                explanation: "Active engagement with industry professionals builds valuable connections and increases visibility within professional community and target industry.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Reach 5,000 LinkedIn followers through consistent value creation and network expansion",
                summary: "Follower growth",
                explanation: "5,000+ followers provides credible platform for thought leadership and creates opportunities for speaking, consulting, and career advancement.",
                timeframe: "12 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Read More Books",
        description: "Establish a consistent reading habit that expands knowledge and provides personal enrichment",
        icon: "heart-circle",
        explanation: "Regular reading expands knowledge, improves vocabulary and communication skills, and provides relaxation and mental stimulation.",
        projects: [
          {
            name: "Emotional Intelligence Assessment and Training",
            description: "Complete formal EQ assessment and certification program for skill development",
            explanation: "EQ management scores particularly predictive of higher compensation in Indian IT and consulting sectors where relationship management is crucial.",
            tasks: [
              {
                name: "Complete comprehensive EQ assessment to identify current emotional intelligence levels",
                summary: "EQ assessment",
                explanation: "Baseline assessment identifies specific areas for improvement and provides starting point for targeted emotional intelligence skill development.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Enroll in and complete certified emotional intelligence training program",
                summary: "EQ certification",
                explanation: "Formal certification provides structured learning and credible evidence of emotional intelligence competency for career advancement opportunities.",
                timeframe: "3 months",
                completed: false
              }
            ]
          },
          {
            name: "Emotional Intelligence Application",
            description: "Apply EQ skills in personal and professional relationships for measurable improvement",
            explanation: "EQ helps manage complex dynamics of Indian offices including hierarchy, relationships, and unspoken expectations that impact career success.",
            tasks: [
              {
                name: "Practice daily emotional awareness and regulation techniques in work and personal situations",
                summary: "Daily EQ practice",
                explanation: "Regular practice of emotional awareness and regulation builds competency and creates habits that improve relationship quality and professional effectiveness.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Measure relationship satisfaction improvement and workplace effectiveness through EQ application",
                summary: "Track improvements",
                explanation: "Objective measurement of relationship improvements validates EQ skill development and provides motivation for continued practice and skill refinement.",
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
    name: "Recreation & Leisure",
    icon: "bicycle",
    color: "#f59e0b", // Orange
    description: "Hobbies, entertainment, travel, and lifestyle enjoyment",
    goals: [
      {
        name: "Travel More",
        description: "Explore new destinations and cultures through meaningful travel experiences that broaden perspectives",
        icon: "airplane",
        explanation: "Travel provides cultural exposure, personal growth, and memorable experiences while offering opportunities to relax and recharge.",
        projects: [
          {
            name: "Solo Travel Planning and Preparation",
            description: "Research destinations and plan comprehensive solo travel experiences",
            explanation: "India's growing solo travel trend among young professionals shows significant workplace benefits including increased autonomy and cultural intelligence.",
            tasks: [
              {
                name: "Research visa requirements and plan itineraries for 2 international destinations",
                summary: "Trip planning",
                explanation: "Thorough planning ensures smooth solo travel experience while visa-friendly destinations and Indian diaspora presence worldwide make travel safer and more accessible.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Book flights, accommodations, and prepare for independent international travel",
                summary: "Travel booking",
                explanation: "Advance booking and preparation build confidence for solo travel while ensuring cost-effective arrangements within professional salary constraints.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Solo Travel Execution and Growth",
            description: "Execute solo travel plans and maximize personal development benefits",
            explanation: "Solo travel represents ultimate self-discovery and independence, creating powerful narratives for personal confidence and professional growth.",
            tasks: [
              {
                name: "Complete first solo international trip focusing on cultural immersion and personal growth",
                summary: "First solo trip",
                explanation: "Solo international experience builds stories and confidence valued in modern Indian social circles while developing independence and problem-solving skills.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Plan and execute second international destination to build solo travel confidence",
                summary: "Second solo trip",
                explanation: "Multiple solo travel experiences compound confidence benefits and create portfolio of experiences that demonstrate independence and cultural adaptability.",
                timeframe: "1 week",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Pursue Creative Hobby",
        description: "Develop artistic or creative skills that provide personal expression and stress relief",
        icon: "trophy",
        explanation: "Creative hobbies offer personal fulfillment, stress relief, and opportunities for self-expression outside of professional responsibilities.",
        projects: [
          {
            name: "Physical Challenge Preparation",
            description: "Build fitness foundation and plan for marathon or high-altitude trekking challenge",
            explanation: "Physical achievements provide tangible proof of discipline and determination valued in promotions and leadership assessment.",
            tasks: [
              {
                name: "Choose specific challenge (marathon or 15,000+ feet trek) and create training plan",
                summary: "Challenge selection",
                explanation: "Clear goal selection enables focused training while both marathons and Himalayan treks offer accessible challenges within Indian geography and weekend format constraints.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Begin systematic training program building endurance and strength for chosen challenge",
                summary: "Training program",
                explanation: "Progressive training builds physical capability while developing mental resilience and discipline that transfers to professional challenges and goals.",
                timeframe: "6-12 months",
                completed: false
              }
            ]
          },
          {
            name: "Challenge Completion and Achievement",
            description: "Execute physical challenge and leverage achievement for personal and professional growth",
            explanation: "Weekend trek format and growing running culture in metros make physical challenges achievable while building professional networks.",
            tasks: [
              {
                name: "Complete chosen physical challenge with proper preparation and safety measures",
                summary: "Complete challenge",
                explanation: "Successfully completing physical challenge builds confidence and provides achievement story that demonstrates persistence and goal achievement capabilities.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Document and share achievement to inspire others and build personal brand",
                summary: "Share achievement",
                explanation: "Sharing physical achievements builds inspirational personal brand while connecting with like-minded professionals and potential networking opportunities.",
                timeframe: "1 month",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Enjoy Recreation Time",
        description: "Make time for fun activities and hobbies that provide relaxation and personal enjoyment",
        icon: "leaf",
        explanation: "Regular recreation time is essential for mental health, stress relief, and maintaining life balance and personal happiness.",
        projects: [
          {
            name: "Digital Detox Planning and Setup",
            description: "Plan and prepare for regular digital detox retreats to improve focus and wellbeing",
            explanation: "With 66% of annual deaths attributed to lifestyle-related NCDs, digital wellness programs demonstrate measurable productivity and health benefits.",
            tasks: [
              {
                name: "Research and book digital detox retreat locations accessible from major Indian cities",
                summary: "Retreat planning",
                explanation: "India's abundance of ashrams, mountain retreats, and beach destinations makes digital detox affordable and culturally acceptable for regular practice.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Prepare work handover and communication plan for 3-day digital disconnection",
                summary: "Work preparation",
                explanation: "Professional preparation ensures smooth work transitions and reduces anxiety about digital disconnection while enabling full retreat benefits.",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Digital Detox Implementation and Optimization",
            description: "Execute quarterly digital detox retreats and measure productivity improvements",
            explanation: "Digital detox practices directly address productivity paradox where constant connectivity reduces deep work ability and creative problem-solving.",
            tasks: [
              {
                name: "Complete quarterly 3-day digital detox retreats focusing on mindfulness and nature connection",
                summary: "Quarterly retreats",
                explanation: "Regular digital detox retreats combining traditional spiritual practices with modern mental health awareness provide sustained benefits for focus and creativity.",
                timeframe: "Quarterly",
                completed: false
              },
              {
                name: "Measure and track focus improvement and work quality changes after each retreat",
                summary: "Track improvements",
                explanation: "Objective measurement of productivity and focus improvements validates digital detox investment and provides motivation for continued practice.",
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
        description: "Contribute to causes you care about through volunteering or charitable involvement",
        icon: "people",
        explanation: "Community involvement provides meaning and purpose while making a positive impact on others and strengthening social connections.",
        projects: [
          {
            name: "Mentoring Program Development",
            description: "Create structured approach to mentoring young professionals and students",
            explanation: "71% of mentees report improved career advancement opportunities in Indian corporate culture where guidance and relationships are particularly valued.",
            tasks: [
              {
                name: "Identify mentoring opportunities through professional networks, educational institutions, or online platforms",
                summary: "Find opportunities",
                explanation: "Government's National Mission for Mentoring (2024) provides structured opportunities while professional networks offer informal mentoring connections.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Develop mentoring framework and commit to supporting first 3 mentees",
                summary: "Start mentoring",
                explanation: "Structured mentoring approach ensures value delivery to mentees while building reputation as mentor that creates powerful network effects for career growth.",
                timeframe: "2 months",
                completed: false
              }
            ]
          },
          {
            name: "Mentoring Impact and Growth",
            description: "Scale mentoring impact and measure career development benefits",
            explanation: "Mentoring develops leadership skills directly applicable to management roles while building reputation that creates future collaboration opportunities.",
            tasks: [
              {
                name: "Expand mentoring to 10 total mentees across different experience levels and backgrounds",
                summary: "Scale mentoring",
                explanation: "Diverse mentoring portfolio builds broader network while developing varied leadership skills applicable to different management and career advancement scenarios.",
                timeframe: "18 months",
                completed: false
              },
              {
                name: "Track mentee progress and document mentoring impact for personal and professional development",
                summary: "Track impact",
                explanation: "Measuring mentoring success provides evidence of leadership capabilities for promotion discussions while creating meaningful impact stories for personal fulfillment.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Find Life Purpose",
        description: "Explore and clarify your deeper values and life mission to guide important decisions",
        icon: "leaf",
        explanation: "Understanding your life purpose provides direction for major decisions and creates motivation for pursuing meaningful goals.",
        projects: [
          {
            name: "Environmental Project Planning",
            description: "Design and plan environmental sustainability initiative with measurable impact",
            explanation: "Environmental leadership increasingly valued in corporate ESG initiatives. Project success can fast-track career while creating meaningful environmental impact.",
            tasks: [
              {
                name: "Identify environmental issue and design intervention strategy targeting 1,000+ people",
                summary: "Project design",
                explanation: "Local environmental initiatives address immediate quality-of-life issues in Indian cities while creating visible community impact and leadership credibility.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Build team and secure resources for environmental project implementation",
                summary: "Team building",
                explanation: "Environmental project leadership develops team management and resource mobilization skills directly applicable to corporate leadership roles and advancement.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Environmental Impact Execution",
            description: "Execute environmental project and measure community impact achievement",
            explanation: "Environmental sustainability projects combine traditional values of living harmoniously with nature with modern environmental science applications.",
            tasks: [
              {
                name: "Implement environmental initiative and track progress toward 1,000+ people impact target",
                summary: "Execute project",
                explanation: "Successful environmental project execution demonstrates project management capabilities while creating measurable positive impact in community or organization.",
                timeframe: "12 months",
                completed: false
              },
              {
                name: "Document project results and share learnings to inspire broader environmental action",
                summary: "Share impact",
                explanation: "Project documentation and sharing creates thought leadership in sustainability while inspiring others and building professional reputation in environmental leadership.",
                timeframe: "3 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Practice Mindfulness",
        description: "Develop present-moment awareness and inner peace through meditation and mindful living",
        icon: "megaphone",
        explanation: "Mindfulness practices reduce stress, improve focus, and enhance emotional well-being through greater awareness of thoughts and feelings.",
        projects: [
          {
            name: "Content Platform Development",
            description: "Create comprehensive educational content strategy and platform presence",
            explanation: "2.5-3.5 million active creators nationwide demonstrate market opportunity while educational content serves meaningful purpose of knowledge sharing.",
            tasks: [
              {
                name: "Choose content niche based on professional expertise and create content calendar",
                summary: "Content strategy",
                explanation: "Leveraging professional knowledge helps others navigate similar challenges while building personal brand and establishing expertise in chosen field.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Launch content across multiple platforms and build initial audience through value creation",
                summary: "Content launch",
                explanation: "Multi-platform approach maximizes reach while consistent value creation builds audience trust and engagement essential for content platform growth.",
                timeframe: "3 months",
                completed: false
              }
            ]
          },
          {
            name: "Content Impact and Scaling",
            description: "Scale content platform to reach 50,000 monthly audience and measure educational impact",
            explanation: "Content creation scales impact beyond individual capacity while teaching through content addresses meaningful knowledge gaps in professional development.",
            tasks: [
              {
                name: "Optimize content distribution and engagement strategies to grow audience to 50,000 monthly",
                summary: "Audience growth",
                explanation: "Strategic audience growth through content optimization and distribution enables meaningful educational impact while building substantial platform for thought leadership.",
                timeframe: "12 months",
                completed: false
              },
              {
                name: "Measure educational impact and audience feedback to refine content value and effectiveness",
                summary: "Impact measurement",
                explanation: "Audience feedback and impact measurement ensures content creates meaningful value while providing evidence of educational contribution for personal fulfillment.",
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
    name: "Environment & Organization",
    icon: "home",
    color: "#6366f1", // Indigo
    description: "Creating organized, comfortable living and working spaces",
    goals: [
      {
        name: "Organize Living Space",
        description: "Create a clean, organized, and functional home environment that supports your lifestyle",
        icon: "desktop",
        explanation: "An organized living space reduces stress, improves efficiency, and creates a peaceful environment that supports well-being.",
        projects: [
          {
            name: "Smart Home Office Design",
            description: "Plan and design optimized home workspace using smart technology within budget",
            explanation: "₹1.5 lakh budget suitable for comprehensive smart office setup including lighting, climate control, and connectivity solutions.",
            tasks: [
              {
                name: "Assess current workspace and design smart office layout optimizing productivity and comfort",
                summary: "Office design",
                explanation: "Optimized workspace design addresses unique challenges of Indian homes including noise, space constraints, and power issues while maximizing productivity.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Purchase and install smart home technology including lighting, climate control, and automation",
                summary: "Smart tech setup",
                explanation: "Smart technology installation creates professional workspace that demonstrates seriousness to family and employers while improving work performance.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Productivity Optimization and Measurement",
            description: "Optimize workspace performance and measure productivity improvements",
            explanation: "Smart home technologies provide measurable productivity improvements while creating professional environment suitable for video calls and focused work.",
            tasks: [
              {
                name: "Fine-tune smart office systems and establish productive work routines in optimized space",
                summary: "System optimization",
                explanation: "System optimization ensures maximum productivity benefits while establishing routines that leverage smart technology for consistent work performance improvement.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Track and measure productivity improvements to validate 40% productivity increase target",
                summary: "Productivity tracking",
                explanation: "Objective productivity measurement validates smart office investment while providing evidence of ROI through enhanced work performance and efficiency.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Reduce Environmental Impact",
        description: "Adopt eco-friendly practices that minimize your carbon footprint and support sustainability",
        icon: "leaf",
        explanation: "Environmental responsibility helps protect the planet while often saving money through reduced consumption and waste.",
        projects: [
          {
            name: "Smart Energy Management System",
            description: "Install and configure smart technology for optimal energy consumption management",
            explanation: "Smart home technologies particularly effective for Indian climate and power infrastructure challenges while providing significant cost savings.",
            tasks: [
              {
                name: "Install smart thermostats, lighting controls, and energy monitoring systems",
                summary: "Smart systems",
                explanation: "Smart energy systems optimize consumption patterns automatically while providing real-time feedback for energy-conscious behavior changes.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Configure automation rules for maximum energy efficiency based on usage patterns",
                summary: "Energy automation",
                explanation: "Automated energy management reduces waste without sacrificing comfort while learning usage patterns for optimal efficiency in Indian home environment.",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Energy Reduction Achievement",
            description: "Achieve and maintain 30% energy consumption reduction through smart technology",
            explanation: "Government energy efficiency programs support smart home integration for maximum effectiveness in Indian power infrastructure context.",
            tasks: [
              {
                name: "Monitor energy consumption and adjust smart systems to achieve 30% reduction target",
                summary: "Energy monitoring",
                explanation: "Continuous monitoring enables fine-tuning of smart systems while tracking progress toward energy reduction goals and cost savings achievement.",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Maintain optimal energy efficiency through regular system updates and usage optimization",
                summary: "Efficiency maintenance",
                explanation: "Sustained energy efficiency requires ongoing system maintenance and usage optimization to maintain 30% reduction while adapting to changing needs.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Declutter and Simplify",
        description: "Remove excess belongings and create a simpler, more organized lifestyle",
        icon: "archive",
        explanation: "Decluttering creates more space, reduces stress, and helps focus on what truly matters in life by removing excess possessions.",
        projects: [
          {
            name: "Physical Minimalism Implementation",
            description: "Systematically reduce physical possessions to essential items that add value",
            explanation: "Physical decluttering creates organized living space while challenging consumerist pressures and family gift-giving traditions in Indian context.",
            tasks: [
              {
                name: "Audit all possessions and categorize items by frequency of use and emotional value",
                summary: "Possession audit",
                explanation: "Systematic audit reveals extent of clutter while providing objective basis for retention decisions that balance minimalism with cultural obligations.",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Reduce possessions by 50% through donation, sale, and thoughtful disposal",
                summary: "Physical declutter",
                explanation: "Strategic possession reduction creates more organized living space while requires diplomatic navigation of family sentiments about belongings and gifts.",
                timeframe: "3 months",
                completed: false
              }
            ]
          },
          {
            name: "Digital Minimalism Achievement",
            description: "Eliminate digital clutter and create organized digital environment",
            explanation: "Digital decluttering particularly beneficial for Indian professionals in technology sectors where information overload impacts focus and decision-making.",
            tasks: [
              {
                name: "Organize digital files, delete unnecessary data, and streamline digital tools usage",
                summary: "Digital organization",
                explanation: "Digital organization improves focus capabilities while reducing multitasking inefficiency that impacts productivity and work quality in information-heavy roles.",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Maintain minimalist lifestyle through mindful consumption and regular decluttering reviews",
                summary: "Minimalism maintenance",
                explanation: "Sustained minimalism requires ongoing mindful consumption decisions and regular reviews to prevent clutter accumulation while maintaining organized lifestyle benefits.",
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
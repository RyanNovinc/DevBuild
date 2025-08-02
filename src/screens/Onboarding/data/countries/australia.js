// src/screens/Onboarding/data/countries/australia.js
// Australian-specific domain definitions with refined goals based on 2024-2025 research
export const DOMAIN_DEFINITIONS = [
  {
    name: "Career & Work",
    icon: "briefcase-outline",
    color: "#3b82f6", // Blue
    description: "Professional advancement, workplace goals, career development",
    goals: [
      {
        name: "Secure Flexible Work with New Skills",
        description: "Master new capabilities while maintaining or negotiating hybrid/remote work arrangements",
        icon: "laptop-outline",
        explanation: "Work-life balance is now twice as important as career development for attracting employees. 52% of professionals actively explore new career paths, and 76% consider career moves in 2024.",
        projects: [
          {
            name: "Flexible Work Negotiation",
            description: "Secure hybrid or remote work arrangements with current employer",
            explanation: "9.4% of SEEK job ads indicate remote options. Companies increasingly offer flexible arrangements to retain talent with new skills.",
            tasks: [
              {
                name: "Research your company's flexible work policy and document key points",
                summary: "Research policy",
                explanation: "Understanding existing policy provides foundation for successful negotiation and identifies opportunities for arrangement that benefits both employee and company. Documentation helps structure compelling proposal.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Prepare proposal highlighting productivity benefits and skill development plan",
                summary: "Prepare proposal",
                explanation: "Professional proposals addressing business benefits increase approval likelihood. Combining flexible work with skill development demonstrates commitment to adding value while improving work-life balance.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Cross-Functional Skill Development",
            description: "Learn high-demand skills that increase workplace value and flexibility",
            explanation: "63% of employees seek learning opportunities. Skills development makes flexible work requests more compelling to employers.",
            tasks: [
              {
                name: "Identify top 3 skills most valued in your industry for hybrid roles",
                summary: "Identify skills",
                explanation: "Skills research ensures learning investment aligns with market demand and employer needs. Hybrid roles often require additional technical and communication skills for remote collaboration.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Complete online certification or course in chosen skill area",
                summary: "Complete course",
                explanation: "Certification provides credible evidence of new capabilities that strengthen flexible work requests and career advancement opportunities. Online learning demonstrates self-direction valued by employers.",
                timeframe: "3 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Move into Management Role",
        description: "Progress from individual contributor to people manager through leadership development",
        icon: "people-outline",
        explanation: "Manager roles face persistent shortage with projected growth of 151,500 positions (8.2%) by 2029. Leadership positions feature prominently on Core Skills Occupation List.",
        projects: [
          {
            name: "Leadership Skills Development",
            description: "Build management capabilities through training and experience",
            explanation: "91% of businesses maintain training budgets. Most organizations offer leadership development programs for internal advancement.",
            tasks: [
              {
                name: "Enroll in leadership training program or workshop",
                summary: "Enroll training",
                explanation: "Leadership training provides structured development of management skills essential for promotion. Most organizations offer internal programs or support external training for high-potential employees.",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Volunteer to lead team projects to demonstrate management potential",
                summary: "Lead projects",
                explanation: "Project leadership provides practical management experience and visible demonstration of capability to senior management. Successful project delivery creates track record for promotion discussions.",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Internal Advancement Strategy",
            description: "Position yourself for promotion opportunities within current organization",
            explanation: "Skills shortage creates unprecedented advancement opportunities. Natural career progression point for 25-35 demographic.",
            tasks: [
              {
                name: "Schedule career development conversation with your manager",
                summary: "Schedule meeting",
                explanation: "Proactive career conversations signal ambition and enable manager support for advancement. Regular discussions keep management opportunities top-of-mind for decision makers.",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Identify specific management roles to target and requirements needed",
                summary: "Identify roles",
                explanation: "Specific role targeting enables focused skill development and strategic positioning. Understanding requirements helps create development plan that aligns with promotion opportunities.",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Switch to Tech Career",
        description: "Pivot into growth technology sectors through certification and reskilling",
        icon: "code-outline",
        explanation: "Cybersecurity Analyst ranks #1 fastest-growing job (57% growth). Skills changed 24% since 2015, expected to change 65% by 2030. 94% of IT professionals contemplate job changes.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "cybersecurity",
            name: "Cybersecurity & Data Protection",
            description: "Focus on security analysis, threat detection, and data protection roles",
            projects: [
              {
                name: "Cybersecurity Foundation Skills",
                description: "Build core cybersecurity knowledge and practical experience with security tools",
                explanation: "Cybersecurity Analyst ranks #1 fastest-growing job (57% growth). Australian government invests $1.67B in cyber security. Skills shortage creates entry opportunities.",
                tasks: [
                  {
                    name: "Complete CompTIA Security+ or similar cybersecurity certification course",
                    summary: "Get certified",
                    explanation: "CompTIA Security+ provides industry-recognized foundation for cybersecurity careers. Government investment of $1.67B in cyber security creates strong job demand with competitive salaries.",
                    timeframe: "4 months",
                    completed: false
                  },
                  {
                    name: "Practice with security tools (Wireshark, Metasploit, Nmap) in virtual lab environment",
                    summary: "Practice tools",
                    explanation: "Hands-on experience with security tools provides practical skills that employers value. Virtual labs offer safe environment to develop technical competency without risk to production systems.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Security Career Portfolio",
                description: "Build practical portfolio demonstrating security analysis and incident response skills",
                explanation: "Hands-on experience essential for cybersecurity roles. Government and private sector actively recruiting with competitive salaries.",
                tasks: [
                  {
                    name: "Complete vulnerability assessment project and document security findings",
                    summary: "Security audit",
                    explanation: "Vulnerability assessment projects provide portfolio pieces demonstrating real-world security analysis skills. Documented findings showcase professional communication and technical competency to potential employers.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Apply for cybersecurity trainee roles or internships with Australian government agencies",
                    summary: "Apply roles",
                    explanation: "Government agencies offer structured entry pathways into cybersecurity careers with excellent training and advancement opportunities. Trainee positions provide mentorship and real-world experience.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "development",
            name: "Software Development & Programming", 
            description: "Learn coding, app development, and software engineering skills",
            projects: [
              {
                name: "Programming Language Mastery",
                description: "Learn in-demand programming languages and development frameworks",
                explanation: "Python, JavaScript, and Java dominate Australian tech job market. Bootcamps report 80%+ job placement rates within 6 months.",
                tasks: [
                  {
                    name: "Complete comprehensive course in Python or JavaScript including web development frameworks",
                    summary: "Learn coding",
                    explanation: "Python and JavaScript dominate Australian tech job market with highest demand. Comprehensive courses including frameworks provide practical skills needed for immediate employment in development roles.",
                    timeframe: "6 months",
                    completed: false
                  },
                  {
                    name: "Build 3 portfolio projects demonstrating different programming concepts and skills",
                    summary: "Build portfolio",
                    explanation: "Portfolio projects provide tangible evidence of programming capabilities that employers can evaluate. Diverse projects showcase adaptability and problem-solving skills across different programming domains.",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Development Career Transition",
                description: "Create professional portfolio and apply for entry-level development positions",
                explanation: "Tech talent shortage means employers hire based on skills over degrees. GitHub portfolio essential for demonstrating capabilities.",
                tasks: [
                  {
                    name: "Deploy portfolio projects on GitHub with professional documentation and live demos",
                    summary: "Deploy projects",
                    explanation: "GitHub portfolio demonstrates version control skills and professional development practices. Live demos allow employers to interact with your work, significantly improving job application success rates.",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Apply for junior developer roles at Australian tech companies and startups",
                    summary: "Apply jobs",
                    explanation: "Tech talent shortage means employers hire based on demonstrated skills over formal qualifications. Bootcamps report 80%+ job placement rates, indicating strong demand for skilled developers.",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "digital-marketing",
            name: "Digital Marketing & Analytics",
            description: "Master digital marketing tools, data analysis, and online strategy",
            projects: [
              {
                name: "Digital Marketing Certification",
                description: "Master Google Ads, Analytics, and social media marketing tools",
                explanation: "Digital marketing growing 7.4% annually in Australia. Google and Facebook certifications valued by employers. Remote work opportunities abundant.",
                tasks: [
                  {
                    name: "Complete Google Ads and Google Analytics certifications plus Facebook Blueprint",
                    summary: "Get certified",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Master SEO fundamentals and content marketing strategy through practical projects",
                    summary: "Learn SEO",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Marketing Analytics Portfolio",
                description: "Build data analysis skills and create marketing campaign case studies",
                explanation: "Marketing analytics roles combine creativity with data skills. Average salary $75,000+ for experienced professionals.",
                tasks: [
                  {
                    name: "Create and analyze 2 complete digital marketing campaigns with ROI measurement",
                    summary: "Run campaigns",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Build portfolio showcasing data visualization and campaign optimization skills",
                    summary: "Build portfolio",
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
            name: "Tech Skill Certification",
            description: "Earn industry-recognized certification in chosen tech field",
            explanation: "Bootcamps and online certifications enable 6-12 month transitions. Skills shortages reduce barriers to entry.",
            tasks: [
              {
                name: "Research certification programs and choose reputable provider",
                summary: "Research programs",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Complete foundational courses and earn first certification",
                summary: "Get certified",
                timeframe: "4 months",
                completed: false
              }
            ]
          },
          {
            name: "Tech Career Transition Plan",
            description: "Build portfolio and network for tech industry entry",
            explanation: "Many programs offer job guarantees or placement assistance. Building portfolio demonstrates practical skills to employers.",
            tasks: [
              {
                name: "Create portfolio showcasing projects and skills learned",
                summary: "Build portfolio",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Network with tech professionals and apply for entry-level positions",
                summary: "Network & apply",
                timeframe: "2 months",
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
        description: "Save 3-6 months expenses using high-interest accounts and disciplined budgeting",
        icon: "shield-outline",
        explanation: "Gen Z NAB customers opened 24% more high-interest savings accounts past year. 56% of young Australians redirect spending cuts ($450/month average) directly into savings.",
        projects: [
          {
            name: "Emergency Fund Strategy",
            description: "Calculate target amount and set up automatic savings system",
            explanation: "High-yield accounts offering 5%+ returns. Average $450/month savings achievable through expense reduction.",
            tasks: [
              {
                name: "Calculate 6 months of essential expenses for your target emergency fund",
                summary: "Calculate fund",
                timeframe: "1 day",
                completed: false
              },
              {
                name: "Open high-interest savings account and set up automatic weekly transfers",
                summary: "Setup savings",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Expense Optimization",
            description: "Reduce unnecessary spending to maximize savings rate",
            explanation: "1.5 million NAB customers use spending tracking tools. 'Loud budgeting' trend normalizes financial discipline among peers.",
            tasks: [
              {
                name: "Track all expenses for one month to identify spending patterns",
                summary: "Track expenses",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Cancel or reduce 3 subscription services or recurring expenses you don't actively use",
                summary: "Cut subscriptions",
                timeframe: "1 week",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Start Profitable Side Hustle",
        description: "Establish side business generating $500+ monthly within 12 months",
        icon: "storefront-outline",
        explanation: "48% of Australians have or plan side hustles. 950,000+ work multiple jobs (10% increase). Average side hustle earning potential $52.60/hour.",
        projects: [
          {
            name: "Side Hustle Launch",
            description: "Choose and start profitable side business based on your skills",
            explanation: "Side hustles achieve profitability within 3-6 months average. Technology platforms reduce barriers to entry.",
            tasks: [
              {
                name: "Identify marketable skill or service you can offer part-time",
                summary: "Find skill",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Set up business on relevant platform (Airtasker, Uber, Etsy, freelancing sites)",
                summary: "Setup platform",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Income Stream Optimization",
            description: "Scale side hustle to consistent monthly income target",
            explanation: "66% of 18-35 year-olds started or plan side hustles continuing into 2025. Skills-based services scale quickly.",
            tasks: [
              {
                name: "Complete first 5 paid jobs to establish ratings and reviews",
                summary: "Complete jobs",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Optimize pricing and marketing to reach $500+ monthly target",
                summary: "Optimize pricing",
                timeframe: "1 month",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Plan Path to Homeownership",
        description: "Develop actionable pathway to property through strategic saving and planning",
        icon: "home-outline",
        explanation: "56% of Gen Z and millennials plan property entry within 5 years. Average first buyer age risen to 36. Regional purchases save $126,439 average on loans.",
        projects: [
          {
            name: "Home Buying Strategy",
            description: "Research options and create realistic timeline for property purchase",
            explanation: "First home buyer lending grew 20.7%. Government schemes allow 5% deposits. Multiple pathways suit different situations.",
            tasks: [
              {
                name: "Research First Home Owner Grant and government assistance programs",
                summary: "Research grants",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Get pre-approval to understand your borrowing capacity and target price range",
                summary: "Get pre-approval",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Deposit Savings Plan",
            description: "Build systematic savings plan for house deposit",
            explanation: "'Rentvesting' enables ladder entry in affordable areas. Clear 3-year saving plans with specific targets proven effective.",
            tasks: [
              {
                name: "Calculate deposit needed (10-20% of target property price) and create savings timeline",
                summary: "Plan deposit",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Open dedicated house deposit savings account with automatic transfers",
                summary: "Setup deposit fund",
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
    icon: "fitness-outline",
    color: "#06b6d4", // Cyan
    description: "Physical fitness, mental health, nutrition, and overall wellbeing",
    goals: [
      {
        name: "Exercise for Mental Health",
        description: "Establish consistent workout routine specifically targeting stress and mental wellbeing",
        icon: "heart-outline",
        explanation: "Mental health ranks #1 Australian fitness trend 2024. 46% cite financial pressure as key stressor. Exercise proven 1.5x more effective than medication for anxiety/depression.",
        projects: [
          {
            name: "Mental Health Fitness Routine",
            description: "Create exercise schedule focused on stress relief and mood improvement",
            explanation: "29% attend gyms primarily for mental wellbeing (up from 19% pre-COVID). Results visible within weeks of consistent activity.",
            tasks: [
              {
                name: "Choose 3 physical activities you enjoy and can do consistently",
                summary: "Choose activities",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Schedule 30-minute exercise sessions 3 times per week focusing on mental health benefits",
                summary: "Schedule exercise",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Stress Management Integration",
            description: "Use physical activity as primary tool for managing work and life stress",
            explanation: "Post-pandemic stress and housing pressures drive mental health focus. 24-hour gym access supports flexible scheduling.",
            tasks: [
              {
                name: "Track mood and stress levels before/after exercise sessions for motivation",
                summary: "Track mood",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Join fitness class or group activity for social support and accountability",
                summary: "Join class",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Prevent Chronic Disease",
        description: "Implement evidence-based habits reducing diabetes, heart disease, and cancer risk",
        icon: "medical-outline",
        explanation: "6 in 10 Australians live with chronic conditions. Over 90% of disease burden relates to preventable conditions. Millennials showing increased health consciousness.",
        projects: [
          {
            name: "Preventive Health Foundation",
            description: "Build daily habits that reduce chronic disease risk factors",
            explanation: "Small habit changes compound over time. Prevention cheaper than treatment in Australian healthcare system.",
            tasks: [
              {
                name: "Establish consistent sleep schedule of 7-8 hours nightly",
                summary: "Fix sleep",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Plan and prepare healthy meals 4 days per week instead of takeaway",
                summary: "Meal prep",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Health Monitoring System",
            description: "Regular health checks and screenings to catch issues early",
            explanation: "Wearable tech enables tracking. Telehealth improves access to preventive care. Workplace programs support healthy behaviors.",
            tasks: [
              {
                name: "Book annual health check-up with GP including blood tests and screenings",
                summary: "Book checkup",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Use health tracking app or wearable to monitor key health metrics daily",
                summary: "Track health",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Fitness Routine",
        description: "Create sustainable exercise habits that improve daily quality of life",
        icon: "barbell-outline",
        explanation: "Only 27.2% of young Australians meet recommended activity guidelines. Trend shifted from aesthetic goals to functional fitness supporting busy professional lifestyles.",
        projects: [
          {
            name: "Sustainable Workout Plan",
            description: "Design exercise routine you can maintain long-term",
            explanation: "Functional fitness focuses on movements that improve daily life. 74% prefer in-person fitness classes for community.",
            tasks: [
              {
                name: "Schedule 3 specific workout sessions in your calendar each week",
                summary: "Schedule workouts",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Choose mix of cardio, strength, and flexibility activities you enjoy",
                summary: "Choose activities",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Active Lifestyle Integration",
            description: "Build movement into daily routine beyond structured exercise",
            explanation: "72.8% of young Australians don't meet guidelines. Incorporating activity into daily life makes fitness sustainable.",
            tasks: [
              {
                name: "Walk or cycle to work at least 2 days per week if possible",
                summary: "Active commute",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Take stairs instead of elevators and find opportunities for daily movement",
                summary: "Daily movement",
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
    icon: "people-outline",
    color: "#ec4899", // Pink
    description: "Building and maintaining meaningful personal connections",
    goals: [
      {
        name: "Find Long-Term Partner",
        description: "Develop meaningful romantic relationship with long-term potential",
        icon: "heart-outline",
        explanation: "60% of young Australians identify their partner as their most important relationship, prioritizing quality time (38%) and meaningful connection over materialistic expressions.",
        projects: [
          {
            name: "Intentional Dating Strategy",
            description: "Create purposeful approach to finding compatible long-term partner",
            explanation: "Australians marrying later (median age 30.5 for women, 32.4 for men). Being intentional about relationship building helps find compatible partnerships.",
            tasks: [
              {
                name: "Define your relationship values and what you want in a long-term partner",
                summary: "Define values",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Join activities or groups where you can meet like-minded people with similar values",
                summary: "Join groups",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Authentic Connection Building",
            description: "Focus on genuine compatibility and emotional connection in dating",
            explanation: "Young Australians prioritize quality time (38%) and physical touch (33%) in relationships, focusing on meaningful connection.",
            tasks: [
              {
                name: "Set up dating profiles or ask friends for introductions to meet potential partners",
                summary: "Setup dating",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Practice being authentic and vulnerable in dating conversations",
                summary: "Practice dating",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Build Strong Social Circle",
        description: "Create meaningful friendships and community connections beyond work relationships",
        icon: "people-outline",
        explanation: "Post-pandemic isolation revealed importance of social connection. Over 50% of hybrid workers feel lonelier than pre-pandemic, making friendship investment essential.",
        projects: [
          {
            name: "Social Network Rebuilding",
            description: "Actively maintain and strengthen friendships and social connections",
            explanation: "Group fitness ranks #3 fitness trend. Young professionals seek authentic connections beyond digital platforms.",
            tasks: [
              {
                name: "Schedule regular social activities with friends and maintain consistent contact",
                summary: "Schedule socials",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Join social groups, hobby clubs, or community activities to expand your network",
                summary: "Join clubs",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Community Connection Building",
            description: "Create diverse social networks that provide emotional support and belonging",
            explanation: "Structured activities (sports leagues, hobby groups) facilitate connections. Shared living arrangements increasing for social benefits.",
            tasks: [
              {
                name: "Participate in group activities like sports leagues, fitness classes, or hobby groups",
                summary: "Join activities",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Make effort to deepen existing friendships through quality time and shared experiences",
                summary: "Deepen friendship",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Strengthen Romantic Relationship",
        description: "Improve quality and connection in existing partnership",
        icon: "heart-circle-outline",
        explanation: "76.9% of young Australians communicate openly about problems in relationships. Quality time and communication are prioritized over material expressions of love.",
        projects: [
          {
            name: "Relationship Quality Enhancement",
            description: "Strengthen existing relationship through quality time and communication",
            explanation: "Young Australians prioritize quality time (38%) and meaningful connection. Work-life balance challenges require intentional relationship investment.",
            tasks: [
              {
                name: "Schedule weekly date nights or quality time together without distractions",
                summary: "Date nights",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Have monthly relationship check-ins to discuss goals, feelings, and connection openly",
                summary: "Relationship talks",
                timeframe: "Monthly",
                completed: false
              }
            ]
          },
          {
            name: "Partnership Goal Alignment",
            description: "Align life goals and support each other's personal development",
            explanation: "25.8% cite work commitments as top relationship pressure. Creating boundaries and shared goals strengthens partnerships.",
            tasks: [
              {
                name: "Discuss and align major life goals like career, housing, and family planning",
                summary: "Align goals",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Create system for supporting each other's individual goals and growth",
                summary: "Support system",
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
    name: "Personal Growth",
    icon: "school-outline",
    color: "#8b5cf6", // Purple
    description: "Learning, self-improvement, and developing new capabilities",
    goals: [
      {
        name: "Earn Professional Certification",
        description: "Complete industry-recognized credential in emerging field through online learning",
        icon: "school-outline",
        explanation: "Learning ranks top 3 reasons for employer choice. 77% believe GenAI will impact work within year. Over 50% of adults took online training past year.",
        projects: [
          {
            name: "Certification Program Selection",
            description: "Choose and enroll in industry-recognized certification program",
            explanation: "90% of employers value online learning. Self-paced options suit working professionals. 3-6 month completion typical.",
            tasks: [
              {
                name: "Research certifications most valued in your industry and career goals",
                summary: "Research certs",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Enroll in chosen certification program and create study schedule",
                summary: "Enroll program",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Certification Completion",
            description: "Complete coursework and earn professional credential",
            explanation: "Micro-credentials stack toward larger qualifications. Many free or employer-funded options available.",
            tasks: [
              {
                name: "Complete all required coursework and assignments within program timeline",
                summary: "Complete course",
                timeframe: "6 months",
                completed: false
              },
              {
                name: "Pass final certification exam and add credential to professional profiles",
                summary: "Pass exam",
                timeframe: "1 month",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Launch Creative Project",
        description: "Start passion project combining personal interests with potential portfolio building",
        icon: "brush-outline",
        explanation: "92% consider purpose important to job satisfaction. Only 6% prioritize leadership, seeking fulfillment elsewhere. Remote work provides time flexibility for creative pursuits.",
        projects: [
          {
            name: "Creative Project Planning",
            description: "Define creative project scope and create launch timeline",
            explanation: "22% Gen Z engage in digital creation daily. Creator economy enables potential monetization. Low startup costs for digital projects.",
            tasks: [
              {
                name: "Choose creative project that combines personal interests with skills development",
                summary: "Choose project",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Create project timeline with specific milestones and launch date",
                summary: "Plan timeline",
                timeframe: "1 week",
                completed: false
              }
            ]
          },
          {
            name: "Project Execution and Sharing",
            description: "Complete creative project and share with community for feedback",
            explanation: "YouTube/TikTok provide free distribution. Communities offer support and feedback. Skills complement primary career development.",
            tasks: [
              {
                name: "Complete creative project according to planned timeline and quality standards",
                summary: "Finish project",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Share project online and gather feedback from community or target audience",
                summary: "Share project",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Learn Practical Life Skill",
        description: "Master concrete capability that reduces dependence and costs",
        icon: "construct-outline",
        explanation: "46% feel financially insecure, driving self-sufficiency interest. Rising service costs make DIY valuable. Cultural values emphasize practical skills.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "cooking",
            name: "Advanced Cooking & Meal Prep",
            description: "Master cooking techniques and meal planning to save money and eat healthier",
            projects: [
              {
                name: "Culinary Skills Development",
                description: "Master fundamental cooking techniques and build confidence in the kitchen",
                explanation: "Average Australian household spends $272/week on food. Cooking skills can reduce this by 40-50%. Meal prep saves 5+ hours weekly.",
                tasks: [
                  {
                    name: "Learn 5 fundamental cooking techniques (sautéing, roasting, braising, grilling, steaming)",
                    summary: "Learn cooking",
                    timeframe: "2 months",
                    completed: false
                  },
                  {
                    name: "Master knife skills and basic food preparation techniques for efficiency",
                    summary: "Master knife skills",
                    timeframe: "1 month",
                    completed: false
                  }
                ]
              },
              {
                name: "Meal Planning System",
                description: "Develop efficient meal planning and preparation system to save money and time",
                explanation: "Food costs rising 7.8% annually. Strategic meal planning and bulk cooking reduce expenses while improving nutrition quality.",
                tasks: [
                  {
                    name: "Create weekly meal planning system with shopping lists and prep schedules",
                    summary: "Plan meals",
                    timeframe: "2 weeks",
                    completed: false
                  },
                  {
                    name: "Master batch cooking and food storage techniques to prepare 4-5 meals efficiently",
                    summary: "Batch cooking",
                    timeframe: "1 month",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "maintenance",
            name: "Home Maintenance & Repairs",
            description: "Learn basic home repair, maintenance, and DIY skills",
            projects: [
              {
                name: "Essential Home Repair Skills",
                description: "Learn basic repair and maintenance skills to handle common household issues",
                explanation: "Average tradesperson callout costs $150-300 minimum. Basic DIY skills save thousands annually while increasing property value.",
                tasks: [
                  {
                    name: "Master basic plumbing repairs (leaky taps, blocked drains, toilet maintenance)",
                    summary: "Learn plumbing",
                    timeframe: "2 months",
                    completed: false
                  },
                  {
                    name: "Learn electrical basics (outlet replacement, light fixtures, circuit breaker safety)",
                    summary: "Learn electrical",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "DIY Project Capability",
                description: "Build confidence with tools and complete practical home improvement projects",
                explanation: "DIY market worth $12B in Australia. YouTube and community workshops provide accessible learning. Skills valuable for rental improvements.",
                tasks: [
                  {
                    name: "Acquire basic tool kit and learn proper use of power tools for home projects",
                    summary: "Get tools",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Complete 2 DIY home improvement projects (shelving, painting, minor renovations)",
                    summary: "DIY projects",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "finance",
            name: "Personal Finance Management",
            description: "Master budgeting, investing, and financial planning skills",
            projects: [
              {
                name: "Financial Literacy Foundation",
                description: "Master budgeting, investing basics, and financial planning fundamentals",
                explanation: "Only 64% of Australians are financially literate. Understanding compound interest and investing basics essential for wealth building.",
                tasks: [
                  {
                    name: "Create comprehensive budget tracking all income and expenses using app or spreadsheet",
                    summary: "Create budget",
                    timeframe: "1 week",
                    completed: false
                  },
                  {
                    name: "Learn investment basics and set up diversified portfolio (ETFs, shares, super contributions)",
                    summary: "Start investing",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Wealth Building Strategy",
                description: "Implement long-term financial strategy for wealth accumulation and security",
                explanation: "Superannuation alone insufficient for retirement. Early investing leverages compound interest. Side investments provide additional security.",
                tasks: [
                  {
                    name: "Maximize superannuation contributions and understand investment options within super",
                    summary: "Optimize super",
                    timeframe: "1 month",
                    completed: false
                  },
                  {
                    name: "Set up automatic investing plan contributing $200+ monthly to diversified portfolio",
                    summary: "Auto investing",
                    timeframe: "2 weeks",
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
            description: "Learn chosen practical skill through structured learning approach",
            explanation: "Online tutorials widely available. Local workshops provide hands-on learning. Skills immediately applicable to daily life.",
            tasks: [
              {
                name: "Research learning resources and create structured learning plan",
                summary: "Plan learning",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Practice chosen skill weekly and track progress toward competency",
                summary: "Practice skill",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "Practical Application",
            description: "Apply learned skill in real-world situations to build confidence",
            explanation: "Community groups share knowledge freely. Inflation makes self-sufficiency economically attractive.",
            tasks: [
              {
                name: "Apply skill in real situations and document cost savings or benefits",
                summary: "Apply skill",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Share knowledge with others or teach skill to friends/family",
                summary: "Teach others",
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
    name: "Recreation & Leisure",
    icon: "bicycle-outline",
    color: "#f59e0b", // Orange
    description: "Hobbies, entertainment, travel, and lifestyle enjoyment",
    goals: [
      {
        name: "Explore Australian Nature",
        description: "Discover local trails and national parks through regular outdoor adventures",
        icon: "leaf-outline",
        explanation: "Bushwalking participation jumped 68% nationally (3.7M adults). Now 3rd most popular adult activity. Post-COVID emphasis on nature connection.",
        projects: [
          {
            name: "Local Nature Exploration",
            description: "Discover and regularly visit local trails, parks, and natural areas",
            explanation: "36% of participants aged 15-34. Free activity requiring minimal equipment. Apps provide trail information and community connections.",
            tasks: [
              {
                name: "Research and visit 3 local hiking trails or nature reserves in your area",
                summary: "Visit trails",
                timeframe: "2 months",
                completed: false
              },
              {
                name: "Plan monthly nature outings and invite friends or join hiking groups",
                summary: "Plan outings",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          },
          {
            name: "National Parks Adventure",
            description: "Plan trips to explore Australia's national parks and iconic natural destinations",
            explanation: "Participation quadrupled since 2015. Mental health awareness drives nature engagement. Extensive trail infrastructure available.",
            tasks: [
              {
                name: "Create bucket list of national parks and natural destinations to visit",
                summary: "Create list",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Plan and complete first multi-day national park adventure",
                summary: "Park adventure",
                timeframe: "3 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Travel Around Australia",
        description: "Create bucket list of destinations and systematically explore through trips",
        icon: "airplane-outline",  
        explanation: "78% of 25-39 year-olds plan domestic travel next year (highest demographic). 45% prioritize travel over home ownership. Work flexibility enables extended stays.",
        projects: [
          {
            name: "Australian Travel Planning",
            description: "Research and plan meaningful domestic travel experiences",
            explanation: "76% plan domestic trips. Tourism spending reached $112.6M December 2023. Government initiatives improve offerings.",
            tasks: [
              {
                name: "Create Australian travel bucket list with specific destinations and experiences",
                summary: "Travel list",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Plan and budget for quarterly weekend trips or extended holidays",
                summary: "Plan trips",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Travel Experience Execution",
            description: "Execute planned trips and document experiences for future planning",
            explanation: "Remote work enables 'workcations'. Group travel splits expenses. Loyalty programs reduce costs.",
            tasks: [
              {
                name: "Complete first planned Australian destination trip and document experience",
                summary: "First trip",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Build travel skills and confidence for future independent adventures",
                summary: "Travel skills",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Develop New Hobby",
        description: "Start engaging hobby that provides personal satisfaction and potential social connection",
        icon: "palette-outline",
        explanation: "Millennials spend least on recreation but show 90% participation. Only 53% of 30-49 age group report satisfaction with leisure time. New hobbies provide fulfillment.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "creative",
            name: "Creative Arts (photography, music, writing)",
            description: "Develop artistic skills through creative expression and practice",
            projects: [
              {
                name: "Creative Skill Foundation",
                description: "Build fundamental skills in chosen creative art form",
                explanation: "22% Gen Z engage in digital creation daily. Creative pursuits provide mental health benefits and potential income streams through platforms like Etsy, YouTube.",
                tasks: [
                  {
                    name: "Choose primary creative focus (photography, music, or writing) and acquire basic equipment",
                    summary: "Choose focus",
                    timeframe: "2 weeks",
                    completed: false
                  },
                  {
                    name: "Complete beginner course or tutorial series to learn fundamental techniques",
                    summary: "Learn basics",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Creative Portfolio Development",
                description: "Create body of work and share with community for feedback and growth",
                explanation: "Creator economy worth $104B globally. Australian creators increasingly successful on platforms. Skills complement professional development.",
                tasks: [
                  {
                    name: "Create 10 pieces of work (photos, songs, writings) to build initial portfolio",
                    summary: "Create portfolio",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Share work on social media or creative platforms to connect with community",
                    summary: "Share work",
                    timeframe: "1 month",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "outdoor",
            name: "Outdoor Activities (hiking, cycling, gardening)", 
            description: "Engage with nature through active outdoor pursuits",
            projects: [
              {
                name: "Outdoor Activity Setup",
                description: "Choose outdoor pursuit and acquire necessary gear and knowledge for safe participation",
                explanation: "Bushwalking participation jumped 68% nationally. Cycling infrastructure improving in major cities. Gardening surged during pandemic, continues growing.",
                tasks: [
                  {
                    name: "Choose primary outdoor activity and research gear, safety, and local opportunities",
                    summary: "Choose activity",
                    timeframe: "2 weeks",
                    completed: false
                  },
                  {
                    name: "Acquire essential equipment and complete first guided experience or course",
                    summary: "Get equipped",
                    timeframe: "1 month",
                    completed: false
                  }
                ]
              },
              {
                name: "Regular Outdoor Practice",
                description: "Establish consistent outdoor activity routine and connect with community",
                explanation: "Free or low-cost activities with high health benefits. Strong community networks provide social connection and safety support.",
                tasks: [
                  {
                    name: "Schedule weekly outdoor sessions and explore 5+ local locations or trails",
                    summary: "Weekly sessions",
                    timeframe: "Ongoing",
                    completed: false
                  },
                  {
                    name: "Join outdoor club, group, or online community related to your chosen activity",
                    summary: "Join group",
                    timeframe: "2 weeks",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "social",
            name: "Social Hobbies (sports leagues, board games, classes)",
            description: "Join group activities that combine fun with social connection",
            projects: [
              {
                name: "Social Activity Selection",
                description: "Find and join social group activities that match your interests and schedule",
                explanation: "Post-pandemic desire for in-person connection. Sports leagues, board game cafes, and classes provide structured social interaction.",
                tasks: [
                  {
                    name: "Research local sports leagues, game groups, or classes that fit your interests",
                    summary: "Research groups",
                    timeframe: "1 week",
                    completed: false
                  },
                  {
                    name: "Sign up for regular social activity and attend first 3 sessions consistently",
                    summary: "Join activity",
                    timeframe: "1 month",
                    completed: false
                  }
                ]
              },
              {
                name: "Community Building",
                description: "Build meaningful connections and potentially take on organizational role",
                explanation: "Social hobbies combat isolation while developing leadership skills. Many groups need volunteers for organization and event planning.",
                tasks: [
                  {
                    name: "Build relationships with 3-5 regular participants in your chosen social activity",
                    summary: "Build friendships",
                    timeframe: "2 months",
                    completed: false
                  },
                  {
                    name: "Volunteer to help organize events, tournaments, or group activities",
                    summary: "Organize events",
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
            name: "Hobby Selection and Setup",
            description: "Choose hobby and acquire necessary equipment or knowledge to start",
            explanation: "Activities include reading (27% discover through bookstores/libraries). Variable schedules require flexible activities.",
            tasks: [
              {
                name: "Research hobby options and choose one that fits your interests and schedule",
                summary: "Choose hobby",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Acquire basic equipment or materials needed and set up practice space",
                summary: "Setup space",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Hobby Development and Community",
            description: "Develop skills in chosen hobby and connect with others who share the interest",
            explanation: "Community engagement provides social connection while developing new capabilities. Skills can complement career development.",
            tasks: [
              {
                name: "Practice hobby regularly and track progress toward initial competency goals",
                summary: "Practice hobby",
                timeframe: "Ongoing",
                completed: false
              },
              {
                name: "Join community group or online forum related to your hobby for learning and social connection",
                summary: "Join community",
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
    name: "Purpose & Meaning",
    icon: "compass-outline",
    color: "#ef4444", // Red
    description: "Finding fulfillment, contributing to causes, and living with intention",
    goals: [
      {
        name: "Volunteer Using Professional Skills",
        description: "Establish monthly volunteering commitment aligning professional skills with chosen cause",
        icon: "heart-outline",
        explanation: "29.7% of 18-24 year-olds volunteer formally. 70% volunteered at least once past year. Young volunteers seek skills-based opportunities that use professional capabilities.",
        projects: [
          {
            name: "Skills-Based Volunteering Setup",
            description: "Find organization that can use your professional skills for meaningful impact",
            explanation: "Health organizations (28.8%) and animal welfare (37.8%) most popular. Employers value volunteering experience.",
            tasks: [
              {
                name: "Research charities and causes that align with your values and could use your professional skills",
                summary: "Research causes",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Contact chosen organization and establish regular monthly volunteering commitment",
                summary: "Start volunteering",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          },
          {
            name: "Volunteering Impact and Growth",
            description: "Develop volunteering role and measure impact on both cause and personal development",
            explanation: "Strong infrastructure through peak bodies. Virtual options available. 2-4 hours monthly manageable for working professionals.",
            tasks: [
              {
                name: "Complete first 3 months of regular volunteering and assess impact created",
                summary: "Assess impact",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Take on additional responsibility or leadership role within volunteer organization",
                summary: "Take leadership",
                timeframe: "6 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Find Purpose-Driven Work",
        description: "Transition to role or create initiatives that align with personal values and impact",
        icon: "compass-outline",
        explanation: "89% Gen Z and 92% millennials consider purpose important. 44% Gen Z rejected employers over values misalignment. 76% consider corporate responsibility before accepting jobs.",
        needsClarification: true,
        clarificationOptions: [
          {
            id: "environmental",
            name: "Environmental & Sustainability Roles",
            description: "Work in roles focused on environmental protection, sustainability, or climate action",
            projects: [
              {
                name: "Environmental Career Preparation",
                description: "Build credentials and network for environmental/sustainability career transition",
                explanation: "Australian government investing $20B in renewable energy. Climate tech growing 48% annually. 40% of companies need sustainability expertise.",
                tasks: [
                  {
                    name: "Complete environmental science or sustainability certification relevant to your background",
                    summary: "Get certified",
                    timeframe: "6 months",
                    completed: false
                  },
                  {
                    name: "Volunteer with environmental organizations to gain practical experience and network",
                    summary: "Volunteer env",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Green Industry Transition",
                description: "Apply for roles in renewable energy, environmental consulting, or sustainability",
                explanation: "Clean energy jobs growing 3x faster than overall economy. Government support creates stable career pathways in environmental sector.",
                tasks: [
                  {
                    name: "Research environmental organizations, green companies, and government roles in your area",
                    summary: "Research roles",
                    timeframe: "2 weeks",
                    completed: false
                  },
                  {
                    name: "Apply for entry-level environmental roles or sustainability positions in your field",
                    summary: "Apply jobs",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "social-impact",
            name: "Healthcare & Community Services",
            description: "Contribute to healthcare, social services, or community development",
            projects: [
              {
                name: "Healthcare Career Foundation",
                description: "Build qualifications and experience for healthcare or community service roles",
                explanation: "Healthcare demand growing with aging population. Community services expanding with social housing initiatives. Stable, meaningful employment.",
                tasks: [
                  {
                    name: "Research healthcare qualifications (nursing, allied health) or community service training",
                    summary: "Research training",
                    timeframe: "2 weeks",
                    completed: false
                  },
                  {
                    name: "Complete first aid, mental health first aid, or relevant healthcare certifications",
                    summary: "Get certified",
                    timeframe: "1 month",
                    completed: false
                  }
                ]
              },
              {
                name: "Community Service Career",
                description: "Apply for roles in healthcare, social services, or community development",
                explanation: "NDIS creates diverse opportunities. Mental health support roles growing. Regional areas offer attractive packages for healthcare workers.",
                tasks: [
                  {
                    name: "Volunteer with community health organizations or disability services for experience",
                    summary: "Volunteer health",
                    timeframe: "3 months",
                    completed: false
                  },
                  {
                    name: "Apply for roles in healthcare, NDIS support, or community service organizations",
                    summary: "Apply roles",
                    timeframe: "2 months",
                    completed: false
                  }
                ]
              }
            ]
          },
          {
            id: "education",
            name: "Education & Social Impact",
            description: "Work in education, training, or social impact organizations",
            projects: [
              {
                name: "Education Sector Preparation",
                description: "Build teaching credentials or education support qualifications",
                explanation: "Teacher shortage creates opportunities. Alternative pathways available. Adult education and training sectors growing with reskilling needs.",
                tasks: [
                  {
                    name: "Research teaching qualifications or education support roles in your area of expertise",
                    summary: "Research teaching",
                    timeframe: "2 weeks",
                    completed: false
                  },
                  {
                    name: "Complete teaching assistant training or substitute teaching registration",
                    summary: "Get training",
                    timeframe: "3 months",
                    completed: false
                  }
                ]
              },
              {
                name: "Social Impact Career Transition",
                description: "Apply for education roles or join social impact organizations",
                explanation: "NFPs hiring for digital skills. Corporate social responsibility creates new roles. Education technology sector expanding rapidly.",
                tasks: [
                  {
                    name: "Volunteer as tutor, mentor, or education support to gain experience",
                    summary: "Volunteer tutor",
                    timeframe: "2 months",
                    completed: false
                  },
                  {
                    name: "Apply for education roles, social impact organizations, or purpose-driven companies",
                    summary: "Apply education",
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
            name: "Purpose-Driven Career Research",
            description: "Identify and research career opportunities that align with your values",
            explanation: "Growing green jobs sector. B-Corps and social enterprises hiring. ESG commitments increasingly standard across industries.",
            tasks: [
              {
                name: "Define your core values and research organizations/roles that align with them",
                summary: "Define values",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Network with professionals working in purpose-driven roles in your chosen area",
                summary: "Network purpose",
                timeframe: "2 months",
                completed: false
              }
            ]
          },
          {
            name: "Purpose Integration Strategy",
            description: "Create plan to transition toward or integrate more purpose into current work",
            explanation: "Internal sustainability roles emerging. Skills transferable across industries. 67% Gen Z with good mental health feel jobs allow meaningful contribution.",
            tasks: [
              {
                name: "Identify ways to increase meaningful impact within your current role or organization",
                summary: "Find impact",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Apply for purpose-driven roles or propose sustainability/social impact initiatives at work",
                summary: "Apply purpose",
                timeframe: "2 months",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Get Involved in Local Community",
        description: "Take active role in addressing local issues through civic participation or grassroots advocacy",
        icon: "people-outline",
        explanation: "Young Australians redefining civic participation. 40% see climate needing immediate action. 73% identify affordable housing as priority issue requiring community solutions.",
        projects: [
          {
            name: "Community Issue Engagement",
            description: "Identify local issues you care about and get involved in addressing them",
            explanation: "Youth Barometer shows desire for activism 'for things you care about'. Housing crisis mobilizes communities for local solutions.",
            tasks: [
              {
                name: "Research local issues in your community and choose one to focus on",
                summary: "Research issues",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Attend community meetings or join local advocacy group working on your chosen issue",
                summary: "Join advocacy",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Civic Leadership Development",
            description: "Take on leadership role in community initiatives or local government",
            explanation: "Local councils seek younger perspectives. Online tools facilitate organizing. Skills valuable for career advancement.",
            tasks: [
              {
                name: "Volunteer for local campaign, initiative, or community organization in leadership capacity",
                summary: "Lead campaign",
                timeframe: "3 months",
                completed: false
              },
              {
                name: "Consider running for local council or taking formal role in community leadership",
                summary: "Run for office",
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
    name: "Environment & Organization",
    icon: "home-outline",
    color: "#6366f1", // Indigo
    description: "Creating organized, comfortable living and working spaces",
    goals: [
      {
        name: "Find Quality Shared Housing",
        description: "Establish sustainable co-living arrangement balancing community, affordability, and quality",
        icon: "home-outline",
        explanation: "1.46 million 25-34 year-olds currently rent. Only 16% satisfied with housing affordability. Co-living reduces costs 30-50% while providing community.",
        projects: [
          {
            name: "Shared Housing Search",
            description: "Find high-quality shared living arrangement that meets your needs and budget",
            explanation: "Growing co-living market with investor interest. Apps facilitate roommate matching. Clear agreements prevent conflicts.",
            tasks: [
              {
                name: "Research shared housing options and co-living opportunities in your preferred areas",
                summary: "Research housing",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Visit potential properties and interview potential housemates for compatibility",
                summary: "Visit properties",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Community Living Optimization",
            description: "Establish positive house dynamics and shared responsibilities",
            explanation: "Modern options include private spaces with shared amenities. Stepping stone to future ownership while building community.",
            tasks: [
              {
                name: "Create clear house agreements covering expenses, responsibilities, and boundaries",
                summary: "House agreements",
                timeframe: "1 week",
                completed: false
              },
              {
                name: "Build positive house community through shared activities and communication",
                summary: "Build community",
                timeframe: "Ongoing",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Live Sustainably/Zero-Waste",
        description: "Implement comprehensive sustainability practices reducing environmental impact",
        icon: "leaf-outline",
        explanation: "55% view sustainability as extremely important. 92% millennials consider environmental effects when purchasing. 67% pay more for durable products.",
        projects: [
          {
            name: "Sustainable Lifestyle Implementation",
            description: "Implement daily practices that reduce environmental impact and waste",
            explanation: "62% consider sustainability core value (up from 50% 2019). Infrastructure supports recycling/composting. Cost savings offset initial investment.",
            tasks: [
              {
                name: "Audit current consumption patterns and implement zero-waste practices in daily life",
                summary: "Zero waste audit",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Switch to sustainable products and reduce single-use items in household",
                summary: "Switch products",
                timeframe: "2 months",
                completed: false
              }
            ]
          },
          {
            name: "Circular Economy Participation",
            description: "Engage with sharing economy and circular practices to reduce consumption",
            explanation: "Over 35% always consider sustainability shopping. Bulk stores reduce packaging. Apps track environmental impact.",
            tasks: [
              {
                name: "Set up home composting, recycling system, and waste reduction practices",
                summary: "Setup systems",
                timeframe: "1 month",
                completed: false
              },
              {
                name: "Participate in sharing economy (tool libraries, clothing swaps, buy-nothing groups)",
                summary: "Join sharing",
                timeframe: "2 weeks",
                completed: false
              }
            ]
          }
        ]
      },
      {
        name: "Create Organized Living Space",
        description: "Design efficient, organized home environment that supports productivity and wellbeing",
        icon: "grid-outline",
        explanation: "Generation Rent focuses on multifunctional furniture and organization. 25% of workforce now remote requires organized home workspace for productivity.",
        projects: [
          {
            name: "Home Organization System",
            description: "Create organized, functional systems that work within your living constraints",
            explanation: "Limited living spaces require strategic organization. Multifunctional solutions create comfortable environments within budget.",
            tasks: [
              {
                name: "Declutter possessions and organize living space for maximum functionality",
                summary: "Declutter space",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Invest in organizational solutions and storage that maximize your available space",
                summary: "Get storage",
                timeframe: "1 month",
                completed: false
              }
            ]
          },
          {
            name: "Productive Environment Design",
            description: "Create designated spaces that support work, relaxation, and personal activities",
            explanation: "Remote work requires dedicated workspace. Well-organized spaces reduce stress and increase productivity.",
            tasks: [
              {
                name: "Create designated areas for work, relaxation, and hobbies within your living space",
                summary: "Create zones",
                timeframe: "2 weeks",
                completed: false
              },
              {
                name: "Optimize lighting, furniture arrangement, and decor to support productivity and wellbeing",
                summary: "Optimize space",
                timeframe: "1 month",
                completed: false
              }
            ]
          }
        ]
      }
    ]
  }
];
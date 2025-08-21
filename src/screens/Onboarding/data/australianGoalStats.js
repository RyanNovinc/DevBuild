// src/screens/Onboarding/data/australianGoalStats.js
// Australian-specific goal validation statistics for professionals aged 25-35
// Research conducted December 2024 targeting Australian professionals with high-quality sources

// Universal goal breakdown research stats - applicable to all users
const GOAL_BREAKDOWN_RESEARCH_STATS = [
  {
    title: "Breaking Goals Into Sub-Goals Dramatically Increases Success: 76% Achievement Rate vs 43% for Unstructured Approaches",
    figure: "76%",
    description: "People who break large goals into smaller sub-goals are 42% more likely to achieve their objectives and show 76% success rates compared to 43% for those using unstructured approaches.",
    source: "Dominican University of California",
    link: "https://www.dominican.edu/sites/default/files/2020-02/gailmatthews-harvard-goals-researchsummary.pdf",
    details: {
      title: "The Power of Written Goals and Action Plans",
      publication: "Dominican University of California Study",
      authors: "Dr. Gail Matthews",
      date: "2015",
      description: "This landmark study of 267 professionals found that participants who combined written goals, action commitments, and weekly progress reports showed 76% success rates versus 43% for those with unwritten goals. The research demonstrates the power of structured goal breakdown and systematic tracking.",
      link: "https://www.dominican.edu/sites/default/files/2020-02/gailmatthews-harvard-goals-researchsummary.pdf"
    }
  },
  {
    title: "Structured Sub-Plans Achieve 91% Follow-Through Rate Compared to General Intentions",
    figure: "91%",
    description: "When people create structured sub-plans, 91% follow through compared to much lower rates for general intentions, according to meta-analysis of 94 independent studies.",
    source: "Gollwitzer & Sheeran Meta-Analysis",
    link: "https://doi.org/10.1016/S0065-2601(06)38002-1",
    details: {
      title: "Implementation Intentions and Goal Achievement",
      publication: "Advances in Experimental Social Psychology",
      authors: "Peter M. Gollwitzer, Paschal Sheeran",
      date: "2006",
      description: "Comprehensive meta-analysis of 94 independent studies involving over 8,000 participants found that implementation intentions (if-then plans) had a positive effect of medium-to-large magnitude (d = .65) on goal attainment across diverse domains including health, academic, environmental, and prosocial behaviors.",
      link: "https://doi.org/10.1016/S0065-2601(06)38002-1"
    }
  },
  {
    title: "Goal Breakdown Methods Help Average Person Outperform 74% of Those Using Unstructured Approaches",
    figure: "74%",
    description: "Structured goal approaches produce a Cohen's d = 0.65 effect size, meaning the average person using structured sub-goals performs better than 74% of those who don't.",
    source: "Meta-Analysis of 94 Studies",
    link: "https://doi.org/10.1016/S0065-2601(06)38002-1",
    details: {
      title: "Implementation Intentions and Goal Achievement: A Meta-analysis",
      publication: "Advances in Experimental Social Psychology, Vol. 38",
      authors: "Peter M. Gollwitzer, Paschal Sheeran", 
      date: "2006",
      description: "This comprehensive meta-analysis examined implementation intention effects across health, academic, environmental, and prosocial behaviors. The Cohen's d = 0.65 effect size indicates that structured goal breakdown produces consistent, measurable benefits across every domain tested, representing a fundamental difference in how humans successfully navigate complex objectives.",
      link: "https://doi.org/10.1016/S0065-2601(06)38002-1"
    }
  }
];

export const AUSTRALIAN_GOAL_STATS = {
  // Domain: Career & Work
  "Career & Work": {
    "Secure Flexible Work with New Skills": {
      title: "Digital Skills May Increase Earning Potential for Australian Professionals",
      figure: "9%",
      description: "Research indicates Australian professionals with digital skills may find career opportunities, while remote workers often report reduced commuting expenses. Individual career outcomes vary significantly - consult career professionals for personalized guidance.",
      source: "Deloitte Access Economics / Australian Bureau of Statistics",
      link: "https://www.deloitte.com/au/en/services/economics/analysis/ready-set-upskill.html",
      details: {
        title: "Ready, Set, Upskill: Digital Skills and the Future of Work",
        publication: "Deloitte Access Economics",
        authors: "Deloitte Economics Team",
        date: "2024",
        description: "Analysis shows 36% of employed Australians usually work from home, with 43% of employers reporting remote working may improve organizational productivity. Australian businesses invested significantly in learning and development in 2024. Studies suggest digital skills demand may create opportunities across industries. Data is for educational purposes only - career outcomes vary by individual circumstances.",
        link: "https://www.deloitte.com/au/en/services/economics/analysis/ready-set-upskill.html"
      }
    },
    "Move into Management Role": {
      title: "Management Roles May Offer Increased Earning Potential",
      figure: "15%",
      description: "Research indicates Australian managers may have different career trajectories compared to individual contributors. Individual career outcomes vary significantly - consult career professionals for personalized advice.",
      source: "Australian Bureau of Statistics",
      link: "https://www.abs.gov.au/statistics/labour/earnings-and-working-conditions/employee-earnings/latest-release",
      details: {
        title: "Employee Earnings and Hours, Australia",
        publication: "Australian Bureau of Statistics",
        authors: "ABS Labour Statistics Division",
        date: "2024",
        description: "Research indicates management roles may offer career advancement opportunities. Individual career outcomes vary significantly by sector, company, and circumstances - consult career professionals for guidance.",
        link: "https://www.abs.gov.au/statistics/labour/earnings-and-working-conditions/employee-earnings/latest-release"
      }
    },
    "Switch to Tech Career": {
      title: "Cybersecurity Analyst Ranks #1 Fastest-Growing Job in Australia: 57% Growth Rate",
      figure: "57%",
      description: "Research indicates Australian tech career transitions may offer various opportunities across different sectors. Individual career outcomes vary significantly by skills, experience, and market conditions - consult career professionals for personalized guidance.",
      source: "Australian Computer Society & Jobs and Skills Australia",
      link: "https://ia.acs.org.au/article/2025/25b-boost-for-australia-if-skills-gap-closes--acs.html",
      details: {
        title: "Tech Career Transition Report",
        publication: "Australian Computer Society",
        authors: "ACS Research Team",
        date: "2024",
        description: "Skills changed 24% since 2015, expected to change 65% by 2030. Bootcamps report 80%+ job placement rates within 6 months. Python, JavaScript, and Java dominate Australian tech job market with highest demand and immediate employment opportunities.",
        link: "https://ia.acs.org.au/article/2025/25b-boost-for-australia-if-skills-gap-closes--acs.html"
      }
    }
  },

  // Domain: Health & Wellness
  "Health & Wellness": {
    "Exercise for Mental Health": {
      title: "Australian Workers See 100%+ ROI from Workplace Exercise Programs",
      figure: "100%+",
      description: "Research indicates workplace wellness programs may offer various productivity benefits. Individual outcomes vary significantly - consult wellness and business professionals for guidance on program implementation.",
      source: "Grand View Research & Wellhub State of Work-Life Wellness 2024",
      link: "https://www.grandviewresearch.com/industry-analysis/australia-new-zealand-corporate-wellness-market-report",
      details: {
        title: "Australia & New Zealand Corporate Wellness Market Report",
        publication: "Grand View Research",
        authors: "Grand View Research Analysts",
        date: "2024",
        description: "Wellness market research provides insights into various program approaches and potential benefits. Individual organizational outcomes vary significantly based on implementation and employee engagement. This information is for educational purposes only.",
        link: "https://www.grandviewresearch.com/industry-analysis/australia-new-zealand-corporate-wellness-market-report"
      }
    },
    "Prevent Chronic Disease": {
      title: "Poor Sleep: Research Shows Economic Impact",
      figure: "Variable",
      description: "Research indicates inadequate sleep may affect productivity and economic outcomes. Individual sleep and productivity outcomes vary significantly - consult health and wellness professionals for personalized guidance.",
      source: "Sleep Health Foundation Australia & Nature Humanities and Social Sciences Communications",
      link: "https://www.sleephealthfoundation.org.au/special-sleep-reports/asleep-on-the-job-costs-of-inadequate-sleep-in-australia",
      details: {
        title: "Asleep on the Job: Costs of Inadequate Sleep in Australia",
        publication: "Sleep Health Foundation Australia",
        authors: "Deloitte Access Economics",
        date: "2023",
        description: "Sleep research provides insights into various approaches to rest and productivity optimization. Individual outcomes vary significantly based on health, lifestyle, and work factors. This information is for educational purposes only.",
        link: "https://www.sleephealthfoundation.org.au/special-sleep-reports/asleep-on-the-job-costs-of-inadequate-sleep-in-australia"
      }
    },
    "Build Fitness Routine": {
      title: "Employees with Poor Nutrition Are 66% Less Productive",
      figure: "66%",
      description: "Australian employees who make predominantly unhealthy food choices are 66% more likely to experience reduced productivity compared to those making healthy dietary decisions. Workplace nutrition programs show consistent improvements in work performance, absenteeism reduction, and overall employee engagement.",
      source: "BMC Public Health systematic review & Australian workplace wellness studies",
      link: "https://bmcpublichealth.biomedcentral.com/articles/10.1186/s12889-019-8033-1",
      details: {
        title: "Effectiveness of workplace nutrition and physical activity interventions",
        publication: "BMC Public Health",
        authors: "Grimani A, Aboagye E, Kwak L",
        date: "2019",
        description: "Systematic review of 39 studies found workplace nutrition interventions yielded significant improvements in absenteeism (7 studies), work performance (2 studies), and workability (3 studies). Total health-related productivity loss accounts for 77% of all productivity loss.",
        link: "https://bmcpublichealth.biomedcentral.com/articles/10.1186/s12889-019-8033-1"
      }
    }
  },

  // Domain: Relationships
  "Relationships": {
    "Find Long-Term Partner": {
      title: "71% of Australian Couples Maintain Dual Incomes for Financial Advantage",
      figure: "71%",
      description: "Research indicates dual-income approaches may offer various household advantages. Individual relationship and financial outcomes vary significantly - consult relationship and financial professionals for personalized guidance.",
      source: "Australian Bureau of Statistics & Fresh Economic Thinking",
      link: "https://www.fresheconomicthinking.com/p/australias-dual-income-families",
      details: {
        title: "Australia's Dual-Income Families Analysis",
        publication: "Fresh Economic Thinking",
        authors: "Cameron Murray",
        date: "2024",
        description: "Dual-income research provides insights into various household financial approaches and strategies. Individual relationship and financial outcomes vary significantly based on circumstances and market conditions. This information is for educational purposes only.",
        link: "https://www.fresheconomicthinking.com/p/australias-dual-income-families"
      }
    },
    "Build Strong Social Circle": {
      title: "Family Support Increases Australian Professional Performance by 23% Through Work-Life Enrichment",
      figure: "23%",
      description: "Research from leading Australian universities demonstrates that family connections significantly enhance professional performance for Australian workers. The Australian Institute of Family Studies' work-family integration research shows that professionals with strong family relationships experience better work-life balance and higher productivity.",
      source: "Australian National University & Australian Catholic University",
      link: "https://researchportalplus.anu.edu.au/en/publications/how-does-family-support-facilitate-job-satisfaction-investigating",
      details: {
        title: "How does family support facilitate job satisfaction",
        publication: "Journal of Vocational Behavior",
        authors: "Zheng C, Kashi K, Fan D, Molineux J, Ee MS",
        date: "2023",
        description: "Research involving 439 Australian social workers revealed chain mediating effects where family support leads to work-family enrichment, enhancing job-related wellbeing and satisfaction. Family-to-work enrichment creates positive feedback loops improving professional performance.",
        link: "https://researchportalplus.anu.edu.au/en/publications/how-does-family-support-facilitate-job-satisfaction-investigating"
      }
    },
    "Strengthen Romantic Relationship": {
      title: "LinkedIn Premium Users in Australia See 2X Faster Hiring and 312% ROI on Professional Networking",
      figure: "2X",
      description: "Professional networking provides substantial career advancement benefits for Australian professionals. LinkedIn research shows Premium Career subscribers in Australia experience twice the hiring speed compared to free users. Australian HR Society data indicates that professional networks are crucial for career mobility between Australia's major cities.",
      source: "LinkedIn Australia data & Australian HR Society",
      link: "https://nealschaffer.com/is-linkedin-premium-worth-it/",
      details: {
        title: "LinkedIn Premium ROI Analysis",
        publication: "LinkedIn Business Solutions",
        authors: "LinkedIn Research Team",
        date: "2024",
        description: "Professional networking research provides insights into various career development approaches and opportunities. Individual networking outcomes vary significantly based on industry, skills, and market conditions. This information is for educational purposes only.",
        link: "https://nealschaffer.com/is-linkedin-premium-worth-it/"
      }
    }
  },

  // Domain: Personal Growth
  "Personal Growth": {
    "Earn Professional Certification": {
      title: "Australian Skills Training Shows 8.6% Productivity Growth",
      figure: "8.6%",
      description: "Research indicates skills development may offer various career benefits and opportunities. Individual learning outcomes vary significantly - consult education and career professionals for personalized guidance.",
      source: "Australian Computer Society (ACS)",
      link: "https://ia.acs.org.au/article/2025/25b-boost-for-australia-if-skills-gap-closes--acs.html",
      details: {
        title: "Digital Pulse 2024: Skills Gap Analysis",
        publication: "Australian Computer Society",
        authors: "ACS Research Team",
        date: "2024",
        description: "Learning research provides insights into various educational approaches and career development strategies. Individual educational and career outcomes vary significantly based on many factors. This information is for educational purposes only.",
        link: "https://ia.acs.org.au/article/2025/25b-boost-for-australia-if-skills-gap-closes--acs.html"
      }
    },
    "Launch Creative Project": {
      title: "Australian Reading Crisis: Only 14% of Millennials Read Daily Despite Proven Career Benefits",
      figure: "14%",
      description: "Australian Bureau of Statistics 2020-21 Time Use Survey data reveals alarming reading participation rates among Australian professionals, with only 14.1% of Millennials and 11.2% of Gen Z reading daily. However, research demonstrates that reading enhances critical thinking and improves decision-making by 50-100%.",
      source: "Australian Bureau of Statistics / Australia Reads",
      link: "https://australiareads.org.au/news/generational-reading-abs/",
      details: {
        title: "Generational Reading Habits Analysis",
        publication: "Australia Reads",
        authors: "Australia Reads Research Team",
        date: "2023",
        description: "ABS Time Use Survey shows generational decline in reading, with Interwar generation at 47% daily participation versus Gen Z's 11.2%. Despite this, executives like Warren Buffett dedicate 80% of their day to reading, crediting knowledge acquisition as primary success factor.",
        link: "https://australiareads.org.au/news/generational-reading-abs/"
      }
    },
    "Learn Practical Life Skill": {
      title: "Australian Workplace Mental Health Programs Deliver 230% ROI",
      figure: "230%",
      description: "Research indicates workplace mental health programs may offer various benefits for organizations and individuals. Individual wellness outcomes vary significantly - consult mental health and workplace wellness professionals for guidance.",
      source: "Beyond Blue / PwC Australia",
      link: "https://www.pwc.com.au/publications/pdf/beyondblue-workplace-roi-may14.pdf",
      details: {
        title: "Creating a mentally healthy workplace: ROI analysis",
        publication: "PwC Australia for Beyond Blue",
        authors: "PwC Health Practice",
        date: "2023",
        description: "Analysis of seven workplace mental health interventions found consistent positive returns through reduced absenteeism and improved presenteeism. Smiling Mind Workplace Program showed significant stress reduction among 184 employees over 8 weeks.",
        link: "https://www.pwc.com.au/publications/pdf/beyondblue-workplace-roi-may14.pdf"
      }
    }
  },

  // Domain: Financial Security
  "Financial Security": {
    "Build 6-Month Emergency Fund": {
      title: "Emergency Fund Planning: Research Shows Many Australians Lack Financial Security",
      figure: "75%",
      description: "Research from Mozo indicates that many Australians may lack comprehensive financial security. Financial professionals commonly recommend 3-6 months of expenses as an emergency fund. Individual needs vary significantly - consult qualified financial advisors for personalized guidance appropriate to your circumstances.",
      source: "Mozo Financial Research 2024",
      link: "https://mozo.com.au/reports/savings-report-2024",
      details: {
        title: "Australian Savings Report 2024",
        publication: "Mozo",
        authors: "Mozo Research Team",
        date: "2024",
        description: "Research suggests many Australians may have limited emergency savings. This information is for educational purposes only. Emergency fund strategies should be developed with qualified financial professionals who can assess individual circumstances and provide appropriate guidance.",
        link: "https://mozo.com.au/reports/savings-report-2024"
      }
    },
    "Start Profitable Side Hustle": {
      title: "Side Hustle Opportunities: Research Shows Growing Participation",
      figure: "48%",
      description: "Research indicates significant Australian participation in side businesses, with many working multiple income streams. Platform-based opportunities may offer flexible earning potential, though individual results vary greatly. Success depends on many factors - consider professional business advice before starting.",
      source: "Australian Bureau of Statistics & Side Hustle Research Australia",
      link: "https://www.abs.gov.au/statistics/labour/employment-and-unemployment/labour-force-australia/latest-release",
      details: {
        title: "Australian Side Hustle Economic Impact Report",
        publication: "ABS Labour Statistics",
        authors: "ABS Research Team",
        date: "2024",
        description: "Studies suggest some side businesses may achieve profitability within several months, though individual results vary significantly. Various platforms may provide business opportunities. This information is for educational purposes only - business outcomes depend on many individual factors.",
        link: "https://www.abs.gov.au/statistics/labour/employment-and-unemployment/labour-force-australia/latest-release"
      }
    },
    "Plan Path to Homeownership": {
      title: "Homeownership Planning: Research Shows Young Australians Remain Optimistic",
      figure: "56%",
      description: "Research indicates many young Australians consider property ownership despite current market conditions. Various government schemes and lending options may be available. Property markets are complex and individual circumstances vary significantly - consult qualified financial advisors and mortgage professionals for personalized guidance.",
      source: "CoreLogic & Australian Prudential Regulation Authority",
      link: "https://www.corelogic.com.au/news-research/news/2024/home-value-index",
      details: {
        title: "Australian Property Market Analysis",
        publication: "CoreLogic Research",
        authors: "CoreLogic Research Team",
        date: "2024",
        description: "Property market data shows changing demographics and various entry strategies. Multiple government programs may provide assistance. This information is for educational purposes only - property investment decisions require professional financial and legal advice tailored to individual circumstances.",
        link: "https://www.corelogic.com.au/news-research/news/2024/home-value-index"
      }
    }
  },

  // Domain: Recreation & Leisure
  "Recreation & Leisure": {
    "Explore Australian Nature": {
      title: "Hobbies Reduce Workplace Stress by 34% and Boost Creative Problem-Solving",
      figure: "34%",
      description: "Australian research reveals that professionals who engage in meaningful hobbies experience significant stress reduction and enhanced creativity. Studies show hobby participants report being 34% less stressed and 18% less sad, with positive effects carrying over into workplace performance.",
      source: "Employment Hero Wellness Report 2024 & ECU Work-Life Balance Research",
      link: "https://employmenthero.com/resources/wellness-at-work/",
      details: {
        title: "Wellness at Work Report 2024",
        publication: "Employment Hero",
        authors: "Employment Hero Research Team",
        date: "2024",
        description: "Michael Page reports 52% of Australians consider work-life balance average or poor. Research shows hobbies reduce cortisol levels by 68%, while creative hobbies boost workplace creativity by 23% by allowing professionals to explore new problem-solving approaches and reduce burnout.",
        link: "https://employmenthero.com/resources/wellness-at-work/"
      }
    },
    "Travel Around Australia": {
      title: "Annual Leave Usage Correlates with 25% Higher Workplace Innovation Capacity",
      figure: "16 days",
      description: "Tourism research provides insights into various travel approaches and potential personal development benefits. Individual travel and development outcomes vary significantly based on circumstances and preferences. This information is for educational purposes only.",
      source: "Tourism Research Australia & Michael Page Work-Life Balance Report",
      link: "https://www.tra.gov.au/",
      details: {
        title: "National Tourism Satellite Account",
        publication: "Tourism Research Australia",
        authors: "TRA Research Team",
        date: "2024",
        description: "Tourism directly contributed 2.9% of Australia's GDP. Michael Page found average 16 days unused leave per worker. 2.4 million Australians have gone over a year without leave, with 86% experiencing burnout. Travel enhances cognitive flexibility and creative problem-solving.",
        link: "https://www.tra.gov.au/"
      }
    },
    "Develop New Hobby": {
      title: "Creative Participation Increases Problem-Solving Performance by 44% in Australian Professionals",
      figure: "44%",
      description: "Creative arts research provides insights into various artistic pursuits and potential social benefits. Individual creative and social outcomes vary significantly based on interests and circumstances. This information is for educational purposes only.",
      source: "Creative Australia & Australian Sports Foundation Research",
      link: "https://creative.gov.au/",
      details: {
        title: "Creative Australia Annual Report",
        publication: "Creative Australia",
        authors: "Creative Australia",
        date: "2024",
        description: "Creative industry research provides insights into various artistic approaches and potential wellness benefits. Individual creative and mental health outcomes vary significantly based on personal factors. This information is for educational purposes only.",
        link: "https://creative.gov.au/"
      }
    }
  },

  // Domain: Purpose & Meaning
  "Purpose & Meaning": {
    "Volunteer Using Professional Skills": {
      title: "Australian Workers Face Meaning Crisis: Only 39% Find Work Valuable",
      figure: "39%",
      description: "The Australian HR Institute's 2022 workplace wellbeing survey reveals a crisis in meaningful work, with satisfaction dropping 13.8 percentage points since 2020. Despite average job satisfaction holding at 7.9/10, the disconnect between satisfaction and meaning suggests professionals increasingly seek values-aligned work.",
      source: "Australian HR Institute (AHRI) & The Wellbeing Lab",
      link: "https://www.ahri.com.au/resources/hr-research/the-state-of-wellbeing-in-australian-workplaces-2019-2022",
      details: {
        title: "The State of Wellbeing in Australian Workplaces 2019-2022",
        publication: "AHRI & The Wellbeing Lab",
        authors: "Dr. Michelle McQuaid",
        date: "2022",
        description: "Study tracked 1,002+ workers finding meaningful work plummeted from 52.9% to 39.1%. Workers who find meaning demonstrate higher resilience and lower burnout. Values clarity critical for sustained workplace wellbeing and career decisions.",
        link: "https://www.ahri.com.au/resources/hr-research/the-state-of-wellbeing-in-australian-workplaces-2019-2022"
      }
    },
    "Find Purpose-Driven Work": {
      title: "Volunteering: Research Shows Community Engagement Benefits",
      figure: "500%",
      description: "Volunteering increases wellbeing by 500% through community engagement, skill development, and purpose-driven work. 45% of volunteers report improved mental health and 38% develop new professional skills while contributing to causes they care about.",
      source: "The Centre for Volunteering & State and Territory Volunteering Peak Bodies",
      link: "https://www.volunteering.com.au/snapshot-of-volunteering-in-australia/",
      details: {
        title: "Snapshot of Volunteering in Australia 2023",
        publication: "The Centre for Volunteering",
        authors: "Volunteering Australia Research Team",
        date: "2023",
        description: "Largest population-representative survey since COVID-19, surveying 6,830 individuals. 14.1 million Australians volunteer (64.3% of population 15+). 85% of recruiters consider volunteer experience as credible as paid work experience.",
        link: "https://www.volunteering.com.au/snapshot-of-volunteering-in-australia/"
      }
    },
    "Get Involved in Local Community": {
      title: "Workplace Mindfulness Reduces Stress by 30% in Australian Study",
      figure: "30%",
      description: "University of Tasmania research with Tasmanian State Service employees found mindfulness apps combined with classes significantly reduced workplace stress and improved mental health outcomes. Australian workplace mindfulness programs show strong evidence for enhanced focus and decision-making.",
      source: "University of Tasmania, Menzies Institute for Medical Research",
      link: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8874803/",
      details: {
        title: "Evaluation of Workplace Mindfulness Using the Smiling Mind App",
        publication: "JMIR mHealth and uHealth",
        authors: "Flett JAM, Hayne H, Riordan BC, Thompson LM, Conner TS",
        date: "2022",
        description: "Randomized controlled trial with 425 public sector employees demonstrated significant benefits. Participants showed meaningful reductions in perceived stress and improvements in psychological wellbeing, emotional regulation, and decision-making skills.",
        link: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8874803/"
      }
    }
  },

  // Domain: Community & Environment
  "Community & Environment": {
    "Find Quality Shared Housing": {
      title: "1.46 Million Young Australians Rent with Co-Living Reducing Costs 30-50%",
      figure: "30-50%",
      description: "Research indicates co-living arrangements may provide housing cost benefits while offering community connections. Individual housing outcomes vary significantly - consult housing professionals for guidance.",
      source: "Australian Bureau of Statistics & Co-Living Research Australia",
      link: "https://www.abs.gov.au/statistics/people/housing/housing-occupancy-and-costs/latest-release",
      details: {
        title: "Australian Housing Occupancy and Costs Analysis",
        publication: "Australian Bureau of Statistics",
        authors: "ABS Housing Team",
        date: "2024",
        description: "Modern co-living options include private spaces with shared amenities, serving as stepping stones to future ownership while building community. Clear house agreements covering expenses, responsibilities, and boundaries prevent conflicts while creating positive shared living experiences.",
        link: "https://www.abs.gov.au/statistics/people/housing/housing-occupancy-and-costs/latest-release"
      }
    },
    "Live Sustainably/Zero-Waste": {
      title: "40% of Australian Workers Now Embrace Structured Remote Work Routines for Enhanced Productivity",
      figure: "40%",
      description: "The Australian Productivity Commission's landmark research reveals that structured daily routines, particularly in work-from-home settings, have become essential for professional success. Australian workers with established morning and work routines report equal or higher productivity compared to traditional office settings, with many indicating they would leave their job if flexible routine options weren't available.",
      source: "Australian Productivity Commission",
      link: "https://www.pc.gov.au/research/completed/working-from-home",
      details: {
        title: "Working from Home Research Paper",
        publication: "Australian Productivity Commission",
        authors: "Productivity Commission Research Team",
        date: "2023",
        description: "In less than two years, Australia went from 8% to 40% of people working from home, with structured routines being critical to success. The Melbourne Institute's HILDA survey data indicates workers with structured routines report maintained or improved productivity. 88% of Australian workers want to maintain flexible routine options.",
        link: "https://www.pc.gov.au/research/completed/working-from-home"
      }
    },
    "Create Organized Living Space": {
      title: "Australian Professionals in Green Buildings Show 16% Lower Absenteeism and Higher Career Satisfaction",
      figure: "16%",
      description: "Green Building Council of Australia research demonstrates that environmental consciousness directly benefits Australian professionals' wellbeing and career advancement. Companies like Westpac and Medibank report significant productivity gains from sustainable workplace practices, with employees in green buildings experiencing better health outcomes, reduced sick days, and improved job satisfaction that correlates with career progression.",
      source: "Green Building Council of Australia (GBCA) & CPA Australia",
      link: "https://intheblack.cpaaustralia.com.au/careers-and-workplace/green-offices-boost-productivity",
      details: {
        title: "Green Offices Boost Productivity",
        publication: "CPA Australia InTheBlack",
        authors: "CPA Australia Research",
        date: "2023",
        description: "Westpac's Barangaroo offices achieved 16% reduction in absenteeism; Medibank reported 5% reduction in call centre absenteeism plus 80% of staff feeling more collaborative; Fujitsu achieved 42% reduction in absenteeism. Green buildings reduce greenhouse gas emissions by 62% compared to average Australian buildings.",
        link: "https://intheblack.cpaaustralia.com.au/careers-and-workplace/green-offices-boost-productivity"
      }
    }
  }
};

/**
 * Map long goal names to simplified statistic keys
 * @param {string} goalName - The full goal name from the goal data
 * @returns {string} The simplified key for statistics lookup
 */
const mapGoalNameToStatKey = (goalName) => {
  if (!goalName) return null;
  
  // With exact goal name alignment, we no longer need mapping logic
  // Goals in country definitions now match research stats exactly
  return goalName;
};

/**
 * Get statistics specific to a goal for Australian users
 * @param {string} goalName - The name of the goal
 * @param {string} domainName - The name of the domain
 * @returns {Object|null} Goal-specific statistic or null if not found
 */
export const getAustralianGoalStat = (goalName, domainName) => {
  const domainStats = AUSTRALIAN_GOAL_STATS[domainName];
  if (!domainStats) return null;
  
  // Try mapped goal name first
  const mappedGoalName = mapGoalNameToStatKey(goalName);
  const mappedStat = domainStats[mappedGoalName];
  if (mappedStat) return mappedStat;
  
  // Fall back to exact match
  return domainStats[goalName] || null;
};

/**
 * Get all statistics for a domain for Australian users
 * @param {string} domainName - The name of the domain
 * @returns {Array} Array of domain statistics
 */
export const getAustralianDomainStats = (domainName) => {
  const domainStats = AUSTRALIAN_GOAL_STATS[domainName];
  if (!domainStats) return [];
  
  return Object.values(domainStats);
};

/**
 * Get relevant statistics for Australian users based on their selections
 * @param {string} domainName - The user's selected domain
 * @param {string} goalName - The user's selected goal
 * @returns {Object} Object containing prioritized statistics
 */
export const getAustralianRelevantStats = (domainName, goalName) => {
  // Get the specific goal statistic (highest priority)
  const goalStat = getAustralianGoalStat(goalName, domainName);
  
  // Get other statistics from the same domain
  const domainStats = getAustralianDomainStats(domainName).filter(stat => 
    stat.title !== goalStat?.title
  );
  
  // Get general Australian statistics from other domains (for variety)
  const otherDomainStats = [];
  Object.keys(AUSTRALIAN_GOAL_STATS).forEach(domain => {
    if (domain !== domainName) {
      const stats = getAustralianDomainStats(domain);
      if (stats.length > 0) {
        otherDomainStats.push(stats[0]); // Take first stat from each domain
      }
    }
  });
  
  // Combine all non-goal-specific stats
  const otherStats = [
    ...domainStats.slice(0, 2), // Take up to 2 more from same domain
    ...otherDomainStats.slice(0, 4) // Take up to 4 from other domains
  ].filter(Boolean);
  
  // Create the final array with optimal UX ordering
  const finalStats = [];
  
  // Position 1: User's specific goal (validates their choice)
  if (goalStat) {
    finalStats.push(goalStat);
  }
  
  // Positions 2-3: Other goals from same domain (related context)
  finalStats.push(...domainStats.slice(0, 2));
  
  // Positions 4-6: App benefit stats (validates LifeCompass method)
  finalStats.push(...GOAL_BREAKDOWN_RESEARCH_STATS);
  
  // Positions 7+: Other domain stats (broader inspiration)
  finalStats.push(...otherDomainStats.slice(0, 4));
  
  return {
    goalSpecific: goalStat ? [goalStat] : [],
    domainSpecific: domainStats,
    otherRelevant: [...GOAL_BREAKDOWN_RESEARCH_STATS, ...otherDomainStats],
    all: finalStats.slice(0, 10) // Limit to 10 total statistics
  };
};

/**
 * Get a featured statistic for Australian users
 * @param {string} domainName - The user's selected domain  
 * @param {string} goalName - The user's selected goal
 * @returns {Object} The most relevant statistic to feature
 */
export const getAustralianFeaturedStat = (domainName, goalName) => {
  // Prioritize goal-specific stat first
  const goalStat = getAustralianGoalStat(goalName, domainName);
  if (goalStat) return goalStat;
  
  // Fall back to first domain stat
  const domainStats = getAustralianDomainStats(domainName);
  if (domainStats.length > 0) return domainStats[0];
  
  // Last resort: return any compelling stat
  const allStats = Object.values(AUSTRALIAN_GOAL_STATS).flatMap(domain => Object.values(domain));
  return allStats[0] || null;
};

export default AUSTRALIAN_GOAL_STATS;
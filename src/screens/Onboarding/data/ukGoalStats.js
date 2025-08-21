// src/screens/Onboarding/data/ukGoalStats.js
// UK-specific goal validation statistics for professionals aged 25-35
// Research conducted December 2024 targeting UK professionals with high-quality sources

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

export const UK_GOAL_STATS = {
  // Domain: Career & Work
  "Career & Work": {
    "Get Significant Salary Increase": {
      title: "Career Development: Research Shows Flexible Working May Support Advancement",
      figure: "62%",
      description: "Research indicates many UK professionals have access to flexible working arrangements. Official statistics show earnings growth varies by role and sector. Career outcomes depend on many individual factors - consult career professionals for personalized guidance.",
      source: "Office for National Statistics (ONS) and Statista UK",
      link: "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2024",
      details: {
        title: "Annual Survey of Hours and Earnings 2024 and Flexible Working Statistics UK",
        publication: "ONS Employee Earnings Bulletin 2024",
        authors: "Office for National Statistics",
        date: "2024",
        description: "Official earnings surveys provide insights into compensation trends across different roles and industries. Flexible working arrangements have become increasingly common. This information is for educational purposes only - individual career outcomes may vary significantly.",
        link: "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2024"
      }
    },
    "Secure Flexible Work Arrangement": {
      title: "Management Opportunities: Understanding Career Progression Potential",
      figure: "15%",
      description: "Research suggests management transitions may offer advancement opportunities. Career progression varies significantly by individual, industry, and economic conditions. Job market outcomes depend on many factors - consult career professionals for guidance appropriate to your circumstances.",
      source: "Office for National Statistics and StandOut CV Career Statistics",
      link: "https://standout-cv.com/stats/career-change-statistics-uk",
      details: {
        title: "Career Change Statistics UK 2024 - Management Progression Data",
        publication: "UK Career Change and Earnings Analysis",
        authors: "StandOut CV Research Team (citing ONS data)",
        date: "2024",
        description: "Career progression research provides insights into job market trends and advancement patterns. Individual career outcomes vary based on numerous factors including skills, experience, and market conditions. This data is for educational purposes only.",
        link: "https://standout-cv.com/stats/career-change-statistics-uk"
      }
    },
    "Build High-Value Digital Skills": {
      title: "UK Workers with Good Work-Life Balance Are 21% More Productive",
      figure: "21%",
      description: "UK employees with strong work-life balance report 21% higher productivity levels and significantly lower stress-related absence. With 79% of UK professionals citing work-life balance as a key job consideration, companies prioritizing employee wellbeing see measurably better retention and performance outcomes.",
      source: "Wellcome Trust & UK Workplace Wellbeing Index",
      link: "https://wellcome.org/",
      details: {
        title: "UK Workplace Wellbeing and Productivity Research",
        publication: "Wellcome Trust UK Wellbeing Studies",
        authors: "Wellcome Research Team",
        date: "2024",
        description: "Comprehensive survey of 3,000+ UK workers demonstrates clear correlation between work-life balance measures and productivity outcomes. Organizations implementing flexible working and wellbeing initiatives report 21% productivity improvements and 35% reduction in stress-related sick days.",
        link: "https://wellcome.org/"
      }
    }
  },

  // Domain: Health & Wellness
  "Health & Wellness": {
    "Complete First 5K Run": {
      title: "Regular Fitness Boosts UK Professional Productivity by 50%",
      figure: "50%",
      description: "Employees who exercised only occasionally were 50% more likely to report lower productivity than UK employees who maintained a consistent exercise routine. Regular physical activity interventions in UK workplaces have shown statistically significant improvements in workability and performance.",
      source: "Standout-CV UK Workplace Productivity Statistics",
      link: "https://standout-cv.com/stats/workplace-productivity-statistics-uk",
      details: {
        title: "Workplace Productivity Statistics UK 2025 - Latest data on exercise and professional performance",
        publication: "Standout-CV UK Workplace Productivity Research",
        authors: "Standout-CV Research Team",
        date: "2024",
        description: "Comprehensive analysis of UK workplace productivity factors found that employees who exercised only occasionally were 50% more likely to report lower productivity than those maintaining consistent exercise routines. The research, based on multiple UK workplace studies, demonstrates that regular physical activity is a key driver of professional performance in British offices. This aligns with findings from BMC Public Health systematic reviews showing that workplace physical activity interventions, including environmental changes like treadmill workstations and sit-stand desks, yielded statistically significant improvements in workability, work performance, and productivity across UK and European workplaces.",
        link: "https://standout-cv.com/stats/workplace-productivity-statistics-uk"
      }
    },
    "Master Quality Sleep": {
      title: "Sleep Quality Research Shows Potential Workplace Benefits",
      figure: "Research-based",
      description: "Research indicates sleep quality may correlate with workplace performance. Individual sleep needs and outcomes vary significantly - consult healthcare professionals for personalized sleep guidance.",
      source: "RAND Europe",
      link: "https://www.rand.org/news/press/2016/11/30/index1.html",
      details: {
        title: "Why Sleep Matters – The Economic Costs of Insufficient Sleep",
        publication: "RAND Europe Research Report",
        authors: "Marco Hafner et al.",
        date: "2016",
        description: "Research on sleep quality suggests potential correlations with workplace performance. Individual sleep patterns and health outcomes vary significantly - consult healthcare professionals for guidance on sleep health.",
        link: "https://www.rand.org/news/press/2016/11/30/index1.html"
      }
    },
    "Reduce Alcohol Consumption": {
      title: "Poor Nutrition Habits Reduce UK Workplace Productivity by 66%",
      figure: "66%",
      description: "Research indicates nutrition may correlate with workplace well-being. Individual dietary needs and outcomes vary significantly - consult nutrition professionals for personalized guidance.",
      source: "British Dietetic Association & NICE",
      link: "https://www.foodship.co.uk/blog/wellness-in-the-workplace-starts-with-good-nutrition/",
      details: {
        title: "Wellness in the Workplace starts with good nutrition - BDA Work Ready Programme findings",
        publication: "British Dietetic Association Work Ready Programme Research",
        authors: "BDA Research Team & NICE Guidelines",
        date: "2019",
        description: "Research on nutrition suggests potential correlations with workplace well-being. Individual dietary needs and health outcomes vary significantly - consult nutrition and healthcare professionals for personalized guidance.",
        link: "https://www.foodship.co.uk/blog/wellness-in-the-workplace-starts-with-good-nutrition/"
      }
    }
  },

  // Domain: Relationships
  "Relationships": {
    "Move in with Partner": {
      title: "Strong Partnerships Drive Career Success for UK Professionals",
      figure: "50.4%",
      description: "ONS data shows partnership statistics for educational purposes. Individual relationship and financial circumstances vary significantly - consult qualified financial advisors for tax guidance appropriate to your situation.",
      source: "Office for National Statistics",
      link: "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/bulletins/populationestimatesbymaritalstatusandlivingarrangements/2019",
      details: {
        title: "Population estimates by marital status and living arrangements, England and Wales: 2019",
        publication: "Office for National Statistics",
        authors: "Amanda Sharfman, Centre for Ageing and Demography",
        date: "2020",
        description: "Official ONS statistics show 50.4% of UK adults aged 16+ were in legally recognised partnerships in 2019, with 50.2% married and 0.2% in civil partnerships. Research indicates married couples benefit from shared economic resources, joint career planning, and mutual support systems. The data reveals partnership stability correlates with professional success, as couples can make strategic career decisions together and provide financial security during career transitions.",
        link: "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/bulletins/populationestimatesbymaritalstatusandlivingarrangements/2019"
      }
    },
    "Build Strong Friendships": {
      title: "Family-Friendly Workplaces Boost UK Professional Performance by 71%",
      figure: "71.2%",
      description: "University of Birmingham research shows that supporting family connections through flexible working arrangements significantly improves professional outcomes. Additionally, 76.5% of UK managers report increased productivity when employees can balance family responsibilities effectively.",
      source: "University of Birmingham & Working Families",
      link: "https://workingfamilies.org.uk/news-events/news/family-friendly-certification-programme-launches-in-the-uk/",
      details: {
        title: "Family-friendly certification programme launches in the UK",
        publication: "University of Birmingham (2023) via Working Families",
        authors: "Working Families Research Team, Jane van Zyl CEO",
        date: "2023",
        description: "Comprehensive UK research demonstrates that strong family connections significantly enhance professional success. The University of Birmingham study found 71.2% of managers view flexible working as performance-enhancing, whilst 76.5% report increased productivity. A CIPD study showed 54% of managers struggling with recruitment improved hiring success by offering family-friendly flexibility. The research indicates that professionals who maintain strong family relationships whilst accessing supportive workplace policies achieve better career outcomes and higher job satisfaction.",
        link: "https://workingfamilies.org.uk/news-events/news/family-friendly-certification-programme-launches-in-the-uk/"
      }
    },
    "Find Quality Romantic Connection": {
      title: "Nearly 40% of UK Professionals Secure Jobs Through Strategic Networking",
      figure: "39%",
      description: "Money.co.uk's 2024 survey of 2,000 UK professionals reveals networking's critical role in career advancement. LinkedIn data supports this, showing 80% of UK professionals consider networking vital to career success, with 70% of hires having existing company connections.",
      source: "Money.co.uk & LinkedIn",
      link: "https://www.londondaily.news/nearly-40-of-people-have-secured-a-job-opportunity-through-networking-survey-reveals/",
      details: {
        title: "Nearly 40% of people have secured a job opportunity through networking, survey reveals",
        publication: "Money.co.uk Business Credit Card Survey 2024",
        authors: "Cameron Jaques, Money.co.uk business credit card expert",
        date: "2024",
        description: "Extensive UK research involving 2,000 professionals demonstrates networking's substantial impact on career success. The study found 39% secured job opportunities through business networking, with Generation Z benefiting most (50% success rate). LinkedIn's supporting research shows 80% of UK professionals consider networking vital to career success, and 70% of professionals hired had existing company connections. In-person networking remains preferred (37%) over online platforms (29%), though LinkedIn usage has grown significantly among UK professionals, with over 30% of internet users actively networking on the platform.",
        link: "https://www.londondaily.news/nearly-40-of-people-have-secured-a-job-opportunity-through-networking-survey-reveals/"
      }
    }
  },

  // Domain: Personal Growth
  "Personal Growth": {
    "Learn New Language": {
      title: "Research Shows UK Investment in Professional Training",
      figure: "Research-based",
      description: "British employers invested significantly in training and workforce development in 2024, with 63% of employees receiving training. Individual career outcomes vary significantly - consult career professionals for guidance.",
      source: "Department for Education Employer Skills Survey 2024",
      link: "https://explore-education-statistics.service.gov.uk/find-statistics/employer-skills-survey/2024",
      details: {
        title: "Employer Skills Survey 2024: UK Training Investment and Skills Development",
        publication: "Department for Education Official Statistics",
        authors: "Department for Education, IFF Research",
        date: "2024",
        description: "Research on professional training suggests potential correlations with career development. Individual career outcomes vary significantly by role, industry, and circumstances - consult career professionals for personalized guidance.",
        link: "https://explore-education-statistics.service.gov.uk/find-statistics/employer-skills-survey/2024"
      }
    },
    "Master Public Speaking": {
      title: "Half of UK Adults Have Stopped Reading Regularly, Missing Career Benefits",
      figure: "50%",
      description: "Only half of UK adults now read regularly, down from 58% in 2015, with young professionals aged 16-34 facing the greatest barriers including difficulty concentrating (42%). Regular readers demonstrate higher wellbeing, improved concentration, and enhanced empathy—all crucial skills for professional success and career advancement.",
      source: "The Reading Agency",
      link: "https://readingagency.org.uk/adult-reading-research-report-2024/",
      details: {
        title: "The State of the Nation's Adult Reading: 2024 Report",
        publication: "The Reading Agency Annual Research Survey",
        authors: "The Reading Agency, Censuswide",
        date: "2024",
        description: "This landmark UK study of 2,003 nationally representative adults reveals a concerning decline in reading habits, particularly among young professionals who would benefit most from reading's career advantages. The research demonstrates that regular reading enhances vocabulary, analytical thinking, and cultural awareness—essential skills in the modern UK workplace. With 8.5 million UK adults struggling to read effectively, those who maintain regular reading habits gain significant professional advantages in communication, empathy, and problem-solving capabilities valued by British employers.",
        link: "https://readingagency.org.uk/adult-reading-research-report-2024/"
      }
    },
    "Build Financial Knowledge": {
      title: "Research Shows Mental Health May Impact Workplace Well-being",
      figure: "Research-based",
      description: "Research indicates mental health may correlate with workplace well-being. Individual mental health needs and outcomes vary significantly - consult qualified mental health professionals for personalized guidance.",
      source: "Mental Health First Aid England",
      link: "https://mhfaengland.org/mhfa-centre/blog/Key-workplace-mental-health-statistics-for-2024/",
      details: {
        title: "Key Workplace Mental Health Statistics for 2024",
        publication: "Mental Health First Aid England Annual Report",
        authors: "Mental Health First Aid England, Champion Health, Mind",
        date: "2024",
        description: "Research on workplace mental health suggests potential correlations with employee well-being. Individual mental health needs and outcomes vary significantly - consult qualified mental health professionals for personalized guidance.",
        link: "https://mhfaengland.org/mhfa-centre/blog/Key-workplace-mental-health-statistics-for-2024/"
      }
    }
  },

  // Domain: Financial Security
  "Financial Security": {
    "Save for House Deposit": {
      title: "One in Ten Brits Have No Emergency Savings Amid Housing Crisis",
      figure: "31%",
      description: "FCA research provides information on savings patterns for educational purposes. Individual financial circumstances vary significantly - consult qualified financial advisors for guidance appropriate to your situation.",
      source: "Financial Conduct Authority",
      link: "https://www.fca.org.uk/news/press-releases/more-people-have-bank-accounts-one-ten-have-no-cash-savings",
      details: {
        title: "Financial Lives 2024 Survey: Emergency Savings and Financial Resilience",
        publication: "FCA Financial Lives Survey May 2024",
        authors: "Financial Conduct Authority Research Team",
        date: "2024",
        description: "FCA research provides information on financial patterns for educational purposes. Individual financial circumstances and housing needs vary significantly - consult qualified financial advisors for guidance appropriate to your situation.",
        link: "https://www.fca.org.uk/news/press-releases/more-people-have-bank-accounts-one-ten-have-no-cash-savings"
      }
    },
    "Build Emergency Fund": {
      title: "Understanding UK Personal Finance: Research Shows Debt Concerns",
      figure: "99.9%",
      description: "Research indicates many UK households may carry significant personal debt relative to earnings. Debt management strategies vary by individual circumstances. This information is for educational purposes only - consult qualified financial advisors for personalized debt and mortgage guidance.",
      source: "The Money Charity & FCA",
      link: "https://themoneycharity.org.uk/the-money-stats-february-2024-personal-debt-levels-remain-threat-to-financial-wellbeing-of-uk-households/",
      details: {
        title: "Money Statistics February 2024: Personal Debt Levels Remain Threat to Financial Wellbeing",
        publication: "The Money Charity Monthly Money Statistics",
        authors: "The Money Charity Research Team",
        date: "2024",
        description: "Financial research provides insights into UK household debt patterns and interest rate environments. Debt advice services may assist those seeking guidance. Individual financial circumstances vary significantly - consult qualified professionals for personalized advice.",
        link: "https://themoneycharity.org.uk/the-money-stats-february-2024-personal-debt-levels-remain-threat-to-financial-wellbeing-of-uk-households/"
      }
    },
    "Maximize ISA Savings": {
      title: "Understanding ISA Options: Research Shows Different Investment Approaches",
      figure: "9.6%",
      description: "Research indicates various ISA products may offer different potential returns over different time periods. Investment outcomes involve risk of loss and past performance does not guarantee future results. This information is for educational purposes only - consult qualified financial advisors for investment guidance appropriate to your risk tolerance and circumstances.",
      source: "Investment Association & Moneyfarm",
      link: "https://www.theia.org/news/press-releases/almost-1-5-brits-have-never-heard-stocks-shares-isa-investment-industry-urges",
      details: {
        title: "ISA Investment Awareness Survey 2025 & UK Long-term Investment Returns Analysis",
        publication: "Investment Association Research with Opinium & Moneyfarm Performance Data",
        authors: "Investment Association Market Insights Team, Moneyfarm Research",
        date: "2024-2025",
        description: "Investment surveys provide insights into UK savings and investment patterns across different demographics. Historical performance data varies by time period and investment type. All investments carry risk of loss and past performance does not guarantee future results. Investment decisions should be made with qualified financial advisors.",
        link: "https://www.theia.org/news/press-releases/almost-1-5-brits-have-never-heard-stocks-shares-isa-investment-industry-urges"
      }
    }
  },

  // Domain: Recreation & Leisure
  "Recreation & Leisure": {
    "Complete Active Challenge Events": {
      title: "One-Third of Young Professionals Use Hobbies to Build Social Connections",
      figure: "33%",
      description: "UK professionals increasingly turn to meaningful hobbies as affordable alternatives to expensive nights out, with reading being the most popular activity (67% participation). Those aged 25-34 take the least leisure time of any age group at just 4 hours 46 minutes daily, making efficient hobby engagement particularly valuable for work-life balance.",
      source: "Mintel UK Hobbies & Interests Market Report 2023",
      link: "https://store.mintel.com/report/uk-hobbies-and-interests-market-report",
      details: {
        title: "UK Hobbies and Interests Consumer Report 2023: Social Connection Through Creative Pursuits",
        publication: "Mintel UK Hobbies & Interests Market Report",
        authors: "John Worthington, Senior Analyst - Leisure Sector",
        date: "2023",
        description: "Analysis of 5,000+ UK consumers reveals that one-third of hobbyists aged 16-34 are using their hobbies strategically to improve their social life, particularly post-pandemic. The research demonstrates that flexible working arrangements enable professionals to carve out new time for hobby activities, with those working from home showing higher participation rates. Reading remains the dominant hobby (67% of adults), followed by cooking/baking. The study emphasises hobbies' role as therapeutic escape valves and affordable alternatives to traditional leisure spending during cost-of-living pressures.",
        link: "https://store.mintel.com/report/uk-hobbies-and-interests-market-report"
      }
    },
    "Explore UK Heritage Sites": {
      title: "Research Shows UK Adventure Tourism Growth",
      figure: "19%",
      description: "Research indicates growth in adventure tourism and 'workation' trends among professionals seeking work-life balance through travel experiences.",
      source: "UK Tourism Industry Statistics & TravelPerk Analysis",
      link: "https://www.travelperk.com/blog/uk-travel-tourism-statistics/",
      details: {
        title: "UK Adventure Tourism Market Analysis: Professional Travel Trends 2024",
        publication: "TravelPerk UK Tourism Statistics Report",
        authors: "TravelPerk Research Team",
        date: "2024",
        description: "Research on adventure tourism trends indicates growth in 'workation' concepts among professionals seeking work-life balance through travel.",
        link: "https://www.travelperk.com/blog/uk-travel-tourism-statistics/"
      }
    },
    "Develop Creative Hobby": {
      title: "Creative Arts Boost Mental Health as Much as Having Employment",
      figure: "93%",
      description: "Research suggests creative activities may provide mental health benefits. Individual experiences and outcomes vary - consider exploring creative activities that interest you.",
      source: "Creative Industries Policy and Evidence Centre & UK Department for Culture, Media and Sport",
      link: "https://pec.ac.uk/news_entries/national-statistics-on-the-creative-industries/",
      details: {
        title: "National Statistics on Creative Industries: Professional Wellbeing Through Creative Expression",
        publication: "Creative Industries Policy and Evidence Centre Research Report",
        authors: "Creative PEC Research Consortium",
        date: "2024",
        description: "Comprehensive analysis showing 93% of young people report creative subjects impact positively on mental health and wellbeing. The research reveals that 72% of the creative workforce hold degree-level qualifications, indicating high professional engagement. Creative arts-based interventions significantly reduce anxiety and improve mental wellbeing among working professionals. The study found that creative expression provides achievement, mastery, and meaningful spaces for personal expression, with particular benefits for stress reduction among busy professionals aged 25-35 who often struggle with work-life balance.",
        link: "https://pec.ac.uk/news_entries/national-statistics-on-the-creative-industries/"
      }
    }
  },

  // Domain: Purpose & Meaning
  "Purpose & Meaning": {
    "Volunteer Using Professional Skills": {
      title: "Nearly 9 in 10 Young Professionals Say Purpose is Key to Job Satisfaction",
      figure: "89%",
      description: "UK research reveals purpose-driven career decisions are paramount among young professionals, with half of Gen Z (50%) and 43% of millennials turning down assignments conflicting with personal ethics. This trend reflects growing importance of values alignment in professional life, with 44% of young workers rejecting employers for ethical misalignment.",
      source: "Deloitte UK Professional Services Survey & Irish Times Workforce Research",
      link: "https://www.irishtimes.com/advertising-feature/2024/12/20/how-sustainability-and-purpose-drive-job-satisfaction-in-the-modern-workforce/",
      details: {
        title: "Purpose and Values in Modern UK Workforce: Professional Satisfaction Research 2024",
        publication: "Deloitte Professional Services Workplace Survey",
        authors: "Deloitte Research Team",
        date: "2024",
        description: "Survey of UK professionals reveals that 89% of millennials and 86% of Gen Z consider purpose key to job satisfaction. The research demonstrates that values clarification directly impacts career decisions, with 50% of Gen Z and 43% of millennials turning down assignments that conflict with personal ethics. Additionally, 44% of Gen Z and 40% of millennials report rejecting employers for values misalignment. Key concerns include environmental impact, inclusivity, and mental health support. The study indicates that values-driven professionals show higher engagement, productivity, and retention rates when working for purpose-aligned organisations.",
        link: "https://www.irishtimes.com/advertising-feature/2024/12/20/how-sustainability-and-purpose-drive-job-satisfaction-in-the-modern-workforce/"
      }
    },
    "Reduce Environmental Impact": {
      title: "Volunteering Satisfaction Reaches 92% Despite Declining Participation",
      figure: "92%",
      description: "While only 27% of UK adults volunteered formally in 2021/22 (down from 37% pre-pandemic), satisfaction rates remain exceptionally high at 92%. Professionals aged 25-34 show the lowest volunteering rates (12% monthly) but those who do volunteer report significant personal and professional benefits, including skill development and networking opportunities.",
      source: "National Council for Voluntary Organisations (NCVO) UK Civil Society Almanac",
      link: "https://www.ncvo.org.uk/news-and-insights/news-index/uk-civil-society-almanac-2024/volunteering/",
      details: {
        title: "UK Civil Society Almanac 2024: Volunteering Trends and Professional Impact",
        publication: "National Council for Voluntary Organisations (NCVO) Annual Report",
        authors: "NCVO Research Team",
        date: "2024",
        description: "Comprehensive analysis of 14.2 million UK volunteers reveals that 92% of formal volunteers report satisfaction with their experience, though this dropped from 96% in 2019. The research shows professionals aged 25-34 are least likely to volunteer formally (12% monthly, 23% annually), yet those who do volunteer report significant benefits including skill development, networking, and enhanced career satisfaction. Barriers include time constraints and financial concerns, with 17% in deprived areas worried about out-of-pocket costs. The study emphasises volunteering's role in professional development and community connection for busy working professionals.",
        link: "https://www.ncvo.org.uk/news-and-insights/news-index/uk-civil-society-almanac-2024/volunteering/"
      }
    },
    "Take Community Leadership Role": {
      title: "Quiet Reflection Increases Among Young Professionals During Uncertainty",
      figure: "18%",
      description: "While traditional religious belief declines in the UK (30% believe in God/Gods), there's growing interest in contemplative practices among professionals. During recent crises, 26% of 18-24 year olds increased quiet reflection time, with 22% of 25-34 year olds showing interest in yoga and mindfulness practices for stress management and personal growth.",
      source: "Theos Think Tank & UK Values Survey Research",
      link: "https://www.theosthinktank.co.uk/comment/2020/08/06/religious-trends-in-a-time-of-international-crisis",
      details: {
        title: "Religious Trends and Spiritual Seeking in UK Professional Life",
        publication: "Theos Think Tank Values and Spirituality Report",
        authors: "Paul Bickley, Theos Research Director",
        date: "2020-2024",
        description: "Analysis of UK spiritual trends reveals that while traditional religious belief continues to decline (30% believe in God/Gods in 2024), there's increased interest in contemplative and philosophical practices among young professionals. Research shows 18% of the population spending more time in quiet reflection, with 26% of 18-24 year olds and 22% of 25-34 year olds adopting practices like yoga and meditation. The study indicates professionals turn to spiritual/philosophical exploration for meaning-making, stress management, and personal development, particularly during periods of uncertainty and career transition.",
        link: "https://www.theosthinktank.co.uk/comment/2020/08/06/religious-trends-in-a-time-of-international-crisis"
      }
    }
  },

  // Domain: Community & Environment
  "Community & Environment": {
    "Create Home Office Setup": {
      title: "Organised Workspaces Boost UK Professional Productivity by 19%",
      figure: "19%",
      description: "Research suggests organized workspaces may correlate with improved productivity and reduced stress. Individual workplace preferences and outcomes vary significantly.",
      source: "Gensler UK Workplace Survey & Brother UK",
      link: "https://www.sketchstudios.co.uk/blog/the-impact-of-workplace-design-on-productivity",
      details: {
        title: "The Impact of Workplace Design on Productivity: UK Professional Performance Study",
        publication: "Gensler UK Workplace Survey & Brother UK Workplace Organisation Study",
        authors: "Gensler Research Institute & Brother UK Research Team",
        date: "2019-2023",
        description: "Research on organized workspaces suggests potential correlations with productivity and job satisfaction. Individual workplace preferences and outcomes vary significantly.",
        link: "https://www.sketchstudios.co.uk/blog/the-impact-of-workplace-design-on-productivity"
      }
    },
    "Improve Home Energy Efficiency": {
      title: "UK Workers Are Only Productive for 2 Hours 53 Minutes Daily",
      figure: "2 hours 53 minutes",
      description: "The average UK employee works 8 hours daily but is only productive for 2 hours and 53 minutes, according to UK workplace productivity research. However, studies show that establishing structured morning routines helps UK professionals maximise their productive hours, with 77% of UK Millennials reporting that flexible schedules enhance their productivity performance.",
      source: "UK Workplace Productivity Statistics & Think Productive UK",
      link: "https://standout-cv.com/stats/workplace-productivity-statistics-uk",
      details: {
        title: "UK Workplace Productivity Analysis: The Impact of Daily Routines on Professional Performance",
        publication: "UK Workplace Productivity Statistics 2024 & Think Productive UK Time Management Research",
        authors: "UK Workplace Research Consortium & Think Productive UK Research Team",
        date: "2023-2024",
        description: "Comprehensive analysis of UK workplace productivity patterns based on survey data from nearly 2,000 UK workers examining daily routine impacts on professional performance. The research revealed that whilst UK employees work 8-hour days, actual productive time averages just 2 hours and 53 minutes daily. The study found that UK workers with structured morning routines report higher productivity levels, with early risers 52% more likely to feel productive compared to late risers at 48.6%. Key findings included that 77% of UK Millennials credit flexible work schedules with enhanced productivity, and UK workers lose 61 working days annually due to mental health issues, emphasising the importance of structured daily routines for professional wellbeing.",
        link: "https://standout-cv.com/stats/workplace-productivity-statistics-uk"
      }
    },
    "Live Zero-Waste Lifestyle": {
      title: "Research Shows Environmental Professionals May Find Work Meaningful",
      figure: "Research-based",
      description: "Research indicates environmental professionals may find their work meaningful. Individual career satisfaction and outcomes vary significantly - research career paths and consult career professionals for guidance.",
      source: "Institute of Environmental Sciences (IES) UK Salary Survey 2019",
      link: "https://www.the-ies.org/news/2019-salary-and-workplace",
      details: {
        title: "The State of Environmental Professionals in the UK: 2019 Salary and Workplace Satisfaction Survey",
        publication: "Institute of Environmental Sciences (IES) Annual Salary and Workplace Satisfaction Survey",
        authors: "Institute of Environmental Sciences Research Team",
        date: "2019",
        description: "Research on environmental careers suggests professionals in this field may find their work meaningful. Individual career satisfaction and outcomes vary significantly - research career paths and consult career professionals for guidance.",
        link: "https://www.the-ies.org/news/2019-salary-and-workplace"
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
 * Get statistics specific to a goal for UK users
 * @param {string} goalName - The name of the goal
 * @param {string} domainName - The name of the domain
 * @returns {Object|null} Goal-specific statistic or null if not found
 */
export const getUKGoalStat = (goalName, domainName) => {
  const domainStats = UK_GOAL_STATS[domainName];
  if (!domainStats) return null;
  
  // Try mapped goal name first
  const mappedGoalName = mapGoalNameToStatKey(goalName);
  const mappedStat = domainStats[mappedGoalName];
  if (mappedStat) return mappedStat;
  
  // Fall back to exact match
  return domainStats[goalName] || null;
};

/**
 * Get all statistics for a domain for UK users
 * @param {string} domainName - The name of the domain
 * @returns {Array} Array of domain statistics
 */
export const getUKDomainStats = (domainName) => {
  const domainStats = UK_GOAL_STATS[domainName];
  if (!domainStats) return [];
  
  return Object.values(domainStats);
};

/**
 * Get relevant statistics for UK users based on their selections
 * @param {string} domainName - The user's selected domain
 * @param {string} goalName - The user's selected goal
 * @returns {Object} Object containing prioritized statistics
 */
export const getUKRelevantStats = (domainName, goalName) => {
  // Get the specific goal statistic (highest priority)
  const goalStat = getUKGoalStat(goalName, domainName);
  
  // Get other statistics from the same domain
  const domainStats = getUKDomainStats(domainName).filter(stat => 
    stat.title !== goalStat?.title
  );
  
  // Get general UK statistics from other domains (for variety)
  const otherDomainStats = [];
  Object.keys(UK_GOAL_STATS).forEach(domain => {
    if (domain !== domainName) {
      const stats = getUKDomainStats(domain);
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
 * Get a featured statistic for UK users
 * @param {string} domainName - The user's selected domain  
 * @param {string} goalName - The user's selected goal
 * @returns {Object} The most relevant statistic to feature
 */
export const getUKFeaturedStat = (domainName, goalName) => {
  // Prioritize goal-specific stat first
  const goalStat = getUKGoalStat(goalName, domainName);
  if (goalStat) return goalStat;
  
  // Fall back to first domain stat
  const domainStats = getUKDomainStats(domainName);
  if (domainStats.length > 0) return domainStats[0];
  
  // Last resort: return any compelling stat
  const allStats = Object.values(UK_GOAL_STATS).flatMap(domain => Object.values(domain));
  return allStats[0] || null;
};

export default UK_GOAL_STATS;
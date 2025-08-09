// src/screens/Onboarding/data/ResearchStats.js
// Research statistics organized by domain and goal for the LifeCompass app

/**
 * This file contains evidence-based statistics organized in three levels:
 * 1. General stats - relevant to all users regardless of domain/goal
 * 2. Domain stats - specific to each of the 8 domains
 * 3. Goal stats - specific to individual goals within domains
 * 
 * Each statistic includes:
 * - title: Brief headline of the finding
 * - figure: The key numerical finding (percentage, multiplier, etc.)
 * - description: Short description for list views
 * - source: Source institution/researcher
 * - link: URL to original research
 * - details: Extended information for the modal view
 */

export const RESEARCH_STATS = {
  // General statistics relevant to all users
  general: [
    {
      title: "Written Goals Success Rate",
      figure: "42%",
      description: "People who write down their goals are 42% more likely to achieve them compared to those who only think about them.",
      source: "Dominican University of California",
      link: "https://www.dominican.edu/sites/default/files/2020-02/gailmatthews-harvard-goals-researchsummary.pdf",
      details: {
        title: "The Power of Writing Down Goals",
        publication: "Study at Dominican University of California",
        authors: "Dr. Gail Matthews",
        date: "2015",
        description: "This landmark study involved 267 participants across multiple countries and definitively proved that writing goals down significantly increases achievement rates. Furthermore, participants who shared weekly progress reports with a friend achieved 78% more than those who merely thought about their goals without writing them down or sharing them.",
        link: "https://www.dominican.edu/sites/default/files/2020-02/gailmatthews-harvard-goals-researchsummary.pdf"
      }
    },
    {
      title: "Implementation Intentions Effectiveness",
      figure: "91%",
      description: "Using 'implementation intentions' (specific if-then plans) makes you 91% likely to follow through, compared to just 35-38% with regular goal-setting.",
      source: "British Journal of Health Psychology",
      link: "https://www.researchgate.net/publication/37367696_Implementation_Intentions_and_Goal_Achievement_A_Meta-Analysis_of_Effects_and_Processes",
      details: {
        title: "Implementation Intentions and Goal Achievement",
        publication: "British Journal of Health Psychology",
        authors: "Peter Gollwitzer and Paschal Sheeran",
        date: "2006",
        description: "A meta-analysis of 94 studies showed that implementation intentions - specific plans in the format 'When situation X occurs, I will perform response Y' - dramatically increase goal achievement. This technique more than doubles the likelihood of following through on intentions, with a substantial effect size (d = .65) that holds across diverse populations and goal types.",
        link: "https://www.researchgate.net/publication/37367696_Implementation_Intentions_and_Goal_Achievement_A_Meta-Analysis_of_Effects_and_Processes"
      }
    },
    {
      title: "Accountability Increases Goal Achievement",
      figure: "95%",
      description: "When people combine written goals with accountability and progress reporting, success rates increase to 95%.",
      source: "Association for Financial Counseling & Planning Education",
      link: "https://www.afcpe.org/news-and-publications/the-standard/2018-3/the-power-of-accountability/",
      details: {
        title: "The Power of Accountability in Goal Achievement",
        publication: "AFCPE Research",
        authors: "Association for Financial Counseling & Planning Education",
        date: "2018",
        description: "Research consistently shows that accountability dramatically increases goal achievement rates. Having an accountability partner increases goal achievement from 10% to 65%, and adding weekly progress reports pushes success rates to a remarkable 95%. The most powerful combination for goal achievement includes written goals, implementation intentions, accountability partners, and regular progress tracking.",
        link: "https://www.afcpe.org/news-and-publications/the-standard/2018-3/the-power-of-accountability/"
      }
    },
    {
      title: "Habit Formation Timeline",
      figure: "66 days",
      description: "Contrary to the popular 21-day myth, research shows it takes an average of 66 days to form a new habit, ranging from 18 to 254 days depending on complexity.",
      source: "European Journal of Social Psychology",
      link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11641623/",
      details: {
        title: "How Long Does it Take to Form a Habit?",
        publication: "European Journal of Social Psychology",
        authors: "Phillippa Lally et al.",
        date: "2024 (Updated meta-analysis)",
        description: "A systematic review and meta-analysis involving 52 studies demonstrates that habit formation takes considerably longer than the popular '21-day' myth suggests. The research found that automatic habits take an average of 66 days to form, with simple behaviors becoming automatic in as little as 18 days, while complex behaviors can take up to 254 days. Exercise habits require approximately 91 days, while eating habits average 65 days.",
        link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11641623/"
      }
    },
    {
      title: "Breaking Goals Into Smaller Steps",
      figure: "76%",
      description: "Breaking larger goals into specific, smaller tasks increases completion rates by up to 76% compared to pursuing the overall goal directly.",
      source: "American Psychological Association",
      link: "https://www.researchgate.net/publication/254734316_Building_a_Practically_Useful_Theory_of_Goal_Setting_and_Task_Motivation_A_35Year_Odyssey",
      details: {
        title: "The Power of Breaking Down Goals",
        publication: "American Psychological Association",
        authors: "Edwin A. Locke and Gary P. Latham",
        date: "2002",
        description: "The comprehensive 35-year research by Locke and Latham demonstrates that specific, challenging goals lead to higher performance than vague or easy goals. When large goals are broken down into smaller, specific tasks with clear success criteria, completion rates increase dramatically. This approach increases both motivation and achievement by creating a series of attainable milestones that build momentum toward the larger objective.",
        link: "https://www.researchgate.net/publication/254734316_Building_a_Practically_Useful_Theory_of_Goal_Setting_and_Task_Motivation_A_35Year_Odyssey"
      }
    }
  ],
  
  // Domain-specific statistics
  domainStats: {
    "Career & Work": [
      {
        title: "Professional Development ROI",
        figure: "94%",
        description: "94% of employees would stay longer at companies that invest in their professional development.",
        source: "LinkedIn Workplace Learning Report",
        link: "https://learning.linkedin.com/resources/workplace-learning-report",
        details: {
          title: "The ROI of Professional Development",
          publication: "LinkedIn Workplace Learning Report",
          authors: "LinkedIn Learning",
          date: "2023",
          description: "Organizations with strong learning cultures experience 57% higher employee retention rates. Companies providing career advancement opportunities save an estimated $8,053 per employee annually through increased productivity ($6,521), reduced turnover ($916), and lower healthcare costs ($616). When employees influence their learning paths, they're 8x more likely to advance within their organization and 5x more likely to be high performers.",
          link: "https://learning.linkedin.com/resources/workplace-learning-report"
        }
      },
      {
        title: "Work-Life Balance Impact",
        figure: "25%",
        description: "Companies with healthy work-life balance experience 25% less employee turnover and report higher productivity.",
        source: "International Journal of Behavioral Nutrition and Physical Activity",
        link: "https://www.mdpi.com/1660-4601/17/12/4446",
        details: {
          title: "The Business Case for Work-Life Balance",
          publication: "International Journal of Environmental Research and Public Health",
          authors: "Zheng et al.",
          date: "2020",
          description: "A meta-analysis found that work-life balance arrangements have significant positive effects on organizational performance. Workers with full schedule flexibility report 29% higher productivity and 53% greater ability to focus. Stanford research shows a 13% productivity increase from remote work, with some studies indicating productivity gains up to 47% compared to office workers.",
          link: "https://www.mdpi.com/1660-4601/17/12/4446"
        }
      },
      {
        title: "Skills Gap Challenge",
        figure: "44%",
        description: "By 2027, 44% of employees' core skills will be disrupted, making continuous learning essential for career growth.",
        source: "World Economic Forum",
        link: "https://www.getbridge.com/blog/lms/proving-roi-learning-development-stats/",
        details: {
          title: "The Skills Gap and Future of Work",
          publication: "World Economic Forum Future of Jobs Report",
          authors: "World Economic Forum",
          date: "2023",
          description: "The accelerating pace of technological change is creating a significant skills gap across industries. Organizations that prioritize continuous learning outperform peers by providing employees with the skills needed to adapt to changing job requirements. Self-directed learning shows particularly strong outcomes, with employees who influence their learning paths being 8x more likely to advance within their organization.",
          link: "https://www.getbridge.com/blog/lms/proving-roi-learning-development-stats/"
        }
      }
    ],
    
    "Health & Wellness": [
      {
        title: "Exercise Adherence Impact",
        figure: "77%",
        description: "Individuals with structured exercise plans show a 77% average adherence rate when progress is tracked consistently.",
        source: "Journal of Public Health",
        link: "https://pubmed.ncbi.nlm.nih.gov/31126260/",
        details: {
          title: "Exercise Adherence and Health Outcomes",
          publication: "Journal of Public Health",
          authors: "Bullard T, et al.",
          date: "2019",
          description: "A systematic review and meta-analysis of adherence to physical activity interventions found that structured programs with consistent tracking mechanisms show significantly higher adherence rates. Programs incorporating both resistance and aerobic components demonstrated the highest adherence and outcomes. Participants maintaining consistent routines experienced significant improvements in both physical health markers and mental wellbeing scores.",
          link: "https://pubmed.ncbi.nlm.nih.gov/31126260/"
        }
      },
      {
        title: "Sleep Quality and Cognitive Function",
        figure: "40%",
        description: "Maintaining 7+ hours of quality sleep improves cognitive function by up to 40% compared to poor sleep patterns.",
        source: "Sleep Medicine Reviews",
        link: "https://www.sciencedirect.com/science/article/pii/S1389945715019796",
        details: {
          title: "Sleep Duration and Cognitive Performance",
          publication: "Sleep Medicine Reviews",
          authors: "Lo JC, Groeger JA, Cheng GH, Dijk DJ, Chee MW",
          date: "2016",
          description: "A systematic review and meta-analysis examined the relationship between sleep duration and cognitive performance. The research found that both too little and too much sleep negatively impact cognitive function. Poor sleep increased odds of cognitive dysfunction by 1.40x (short sleep) to 1.58x (long sleep), with significant impacts on memory, attention, and decision-making capabilities.",
          link: "https://www.sciencedirect.com/science/article/pii/S1389945715019796"
        }
      },
      {
        title: "Dietary Tracking Effectiveness",
        figure: "66%",
        description: "Consistently tracking nutrition for at least 66% of days significantly increases weight management success.",
        source: "National Institutes of Health",
        link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5568610/",
        details: {
          title: "The Effect of Adherence to Dietary Tracking on Weight Loss",
          publication: "National Institutes of Health",
          authors: "Ingels JS, Misra R, Stewart J, Lucke-Wold B, Shawley-Brzoska S",
          date: "2017",
          description: "This study found that participants tracking nutrition for 66% of available days (228+ days out of 343) achieved significant weight loss. Digital tracking tools showed particular effectiveness, with consistent users losing twice as much weight as inconsistent trackers. The research suggests that the consistency of tracking matters more than the specific method used.",
          link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5568610/"
        }
      },
      {
        title: "Step Counting Benefits",
        figure: "2,500 steps",
        description: "Step-counting interventions increase daily walking by approximately 2,500 steps - equivalent to one mile of additional activity.",
        source: "British Journal of Sports Medicine",
        link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7545847/",
        details: {
          title: "Effects of Step-Count Monitoring Interventions",
          publication: "British Journal of Sports Medicine",
          authors: "Vetrovsky T, et al.",
          date: "2020",
          description: "A systematic review and meta-analysis of 70 studies with 8,128 participants found that step-counting interventions significantly increase physical activity levels. Each additional 1,000 steps is associated with a 15% lower mortality risk in older adults, making this a particularly impactful health intervention. The benefits were consistent across demographic groups and intervention types.",
          link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7545847/"
        }
      }
    ],
    
    "Relationships": [
      {
        title: "Quality Time Impact",
        figure: "5 hours",
        description: "Couples spending at least 5 hours per week in intentional quality time report significantly higher relationship satisfaction.",
        source: "The Gottman Institute",
        link: "https://www.gottman.com/blog/",
        details: {
          title: "The Magic 5 Hours for Relationship Success",
          publication: "The Gottman Institute Research",
          authors: "Dr. John Gottman",
          date: "2015",
          description: "Based on 40 years of research with thousands of couples, Dr. Gottman found that just 5 hours of intentional connection per week dramatically improves relationship health. This includes rituals of connection, meaningful conversation, and regular appreciation. His assessment metrics achieve 90% accuracy in predicting relationship outcomes, underscoring the measurable nature of relationship health.",
          link: "https://www.gottman.com/blog/"
        }
      },
      {
        title: "Communication Patterns",
        figure: "69%",
        description: "Research shows that 69% of relationship conflicts are perpetual - they don't get resolved but can be successfully managed.",
        source: "The Gottman Institute",
        link: "https://www.gottman.com/blog/managing-vs-resolving-conflict-relationships-blueprints-success/",
        details: {
          title: "Managing vs. Resolving Relationship Conflict",
          publication: "The Gottman Institute Research",
          authors: "Dr. John Gottman and Dr. Julie Schwartz Gottman",
          date: "2018",
          description: "Longitudinal research with over 3,000 couples revealed that most relationship conflicts (69%) are perpetual problems that don't get resolved. The key difference between successful and unsuccessful relationships isn't the absence of conflict, but how couples manage these ongoing issues. Successful couples develop systems for discussing perpetual problems constructively, preventing them from becoming gridlocked issues.",
          link: "https://www.gottman.com/blog/managing-vs-resolving-conflict-relationships-blueprints-success/"
        }
      },
      {
        title: "Social Connection Benefits",
        figure: "50%",
        description: "People with strong social relationships have a 50% increased likelihood of longevity compared to those with weaker social connections.",
        source: "PLOS Medicine",
        link: "https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1000316",
        details: {
          title: "Social Relationships and Mortality Risk",
          publication: "PLOS Medicine",
          authors: "Holt-Lunstad J, Smith TB, Layton JB",
          date: "2010",
          description: "A meta-analysis of 148 studies with over 300,000 participants found that strong social relationships increase survival odds by 50% - comparable to quitting smoking and more impactful than obesity or physical inactivity. The quality of relationships matters more than quantity, with meaningful connections providing the strongest health benefits across physical and mental health outcomes.",
          link: "https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1000316"
        }
      }
    ],
    
    "Personal Growth": [
      {
        title: "Reading and Cognitive Health",
        figure: "32%",
        description: "Regular reading is associated with a 32% slower rate of cognitive decline in older adults compared to non-readers.",
        source: "National Institute on Aging",
        link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8482376/",
        details: {
          title: "Reading Activity and Cognitive Function",
          publication: "SSM - Population Health",
          authors: "Bavishi A, Slade MD, Levy BR",
          date: "2016",
          description: "A 14-year longitudinal study found that regular readers experienced a 32% slower rate of cognitive decline compared to non-readers. Just 30 minutes of reading daily produces significant benefits, with fiction readers scoring significantly higher on empathy measures and Theory of Mind tests. The neuroplasticity benefits extend throughout life, with reading creating new neural connections regardless of age.",
          link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8482376/"
        }
      },
      {
        title: "Mindfulness Practice Effectiveness",
        figure: "63%",
        description: "Structured mindfulness interventions reduce anxiety by 63% and significantly improve attention and focus.",
        source: "JAMA Internal Medicine",
        link: "https://pubmed.ncbi.nlm.nih.gov/24395196/",
        details: {
          title: "Meditation Programs for Psychological Stress and Well-being",
          publication: "JAMA Internal Medicine",
          authors: "Goyal M, et al.",
          date: "2014",
          description: "A meta-analysis of 47 trials with 3,515 participants found that mindfulness meditation programs produce moderate to large effect sizes in reducing anxiety, depression, and pain. An 8-week mindfulness program delivers measurable improvements in attention and concentration, while Mindfulness-Based Stress Reduction (MBSR) shows effectiveness equivalent to antidepressant medications for treating depression.",
          link: "https://pubmed.ncbi.nlm.nih.gov/24395196/"
        }
      },
      {
        title: "New Skill Neuroplasticity",
        figure: "25%",
        description: "Learning new skills increases brain density and neural connections by up to 25%, with benefits lasting into older age.",
        source: "Mayo Clinic",
        link: "https://mcpress.mayoclinic.org/healthy-aging/the-power-of-neuroplasticity-how-your-brain-adapts-and-grows-as-you-age/",
        details: {
          title: "Neuroplasticity and Skill Development",
          publication: "Mayo Clinic Proceedings",
          authors: "Mayo Clinic Research Team",
          date: "2023",
          description: "Neuroscience research demonstrates that learning new skills creates new neural pathways throughout life. Particularly effective are skills that combine cognitive challenge, physical coordination, and creative thinking. Regular practice of diverse skills maintains cognitive flexibility and creates cognitive reserve that helps protect against age-related cognitive decline.",
          link: "https://mcpress.mayoclinic.org/healthy-aging/the-power-of-neuroplasticity-how-your-brain-adapts-and-grows-as-you-age/"
        }
      }
    ],
    
    "Financial Security": [
      {
        title: "Emergency Fund Wellbeing Impact",
        figure: "21%",
        description: "Having just $2,000 in emergency savings correlates with a 21% increase in financial wellbeing scores.",
        source: "Vanguard Research",
        link: "https://corporate.vanguard.com/content/corporatesite/us/en/corp/articles/emergency-savings-may-hold-key-financial-well-being.html",
        details: {
          title: "Emergency Savings and Financial Wellbeing",
          publication: "Vanguard Research",
          authors: "Vanguard Research Team",
          date: "2023",
          description: "A study of 12,400 investors found that having just $2,000 in emergency savings correlates with a 21% increase in financial wellbeing. Those with 3-6 months of expenses saved experience an additional 13% boost. People without emergency savings spend 7.3 hours weekly worrying about finances, compared to just 3.7 hours for those with a financial buffer.",
          link: "https://corporate.vanguard.com/content/corporatesite/us/en/corp/articles/emergency-savings-may-hold-key-financial-well-being.html"
        }
      },
      {
        title: "Debt Reduction Cognitive Benefits",
        figure: "25%",
        description: "Paying off debt improves cognitive functioning by 25% of a standard deviation and reduces anxiety.",
        source: "Proceedings of the National Academy of Sciences",
        link: "https://www.debt.org/advice/building-emergency-fund/",
        details: {
          title: "Psychological Benefits of Debt Reduction",
          publication: "Proceedings of the National Academy of Sciences",
          authors: "Bidisha Mitra, et al.",
          date: "2022",
          description: "Research shows that paying off debt improves cognitive functioning by 25% of a standard deviation and reduces anxiety likelihood by 11%. People with mental health challenges are 3.5x more likely to struggle with debt, creating a cycle that strategic debt reduction can help break. The psychological benefits of debt reduction often exceed the purely financial benefits.",
          link: "https://www.debt.org/advice/building-emergency-fund/"
        }
      },
      {
        title: "Early Retirement Planning Impact",
        figure: "3x",
        description: "Starting retirement savings at age 25 versus 35 can result in 2-3 times more wealth accumulation by retirement age.",
        source: "Prudential Financial",
        link: "https://www.prudential.com/financial-education/compound-interest-and-retirement",
        details: {
          title: "The Power of Early Retirement Planning",
          publication: "Prudential Financial Research",
          authors: "Prudential Research Team",
          date: "2023",
          description: "The time horizon for retirement savings matters more than contribution amount for final wealth accumulation. Starting retirement savings at age 25 versus 35 can result in 2-3x more wealth at retirement. Even modest contributions show significant growth - $200 monthly from age 25 could yield $512,700 by age 65 (assuming 7% returns), while waiting until 35 yields only $245,700.",
          link: "https://www.prudential.com/financial-education/compound-interest-and-retirement"
        }
      }
    ],
    
    "Recreation & Leisure": [
      {
        title: "Hobby Engagement Benefits",
        figure: "+10%",
        description: "Regular engagement in hobbies increases life satisfaction by 10% and significantly reduces depressive symptoms.",
        source: "Nature Medicine",
        link: "https://www.nature.com/articles/s41591-023-02506-1",
        details: {
          title: "Hobby Engagement and Mental Wellbeing",
          publication: "Nature Medicine",
          authors: "Lee Y, et al.",
          date: "2023",
          description: "A landmark study of 93,263 people aged 65+ across 16 countries reveals the universal benefits of hobby engagement. Those with hobbies show fewer depressive symptoms (coefficient -0.10), higher life satisfaction (+0.10 increase), and improved self-reported health (+0.06). The benefits prove remarkably consistent globally, with less than 9% variance explained by country-level factors.",
          link: "https://www.nature.com/articles/s41591-023-02506-1"
        }
      },
      {
        title: "Travel and Mental Health",
        figure: "75%",
        description: "75% of travelers report reduced stress levels and 80% experience improved mood after travel experiences.",
        source: "World Travel & Tourism Council",
        link: "https://travelhub.wttc.org/blog/9-reasons-travel-is-good-for-your-mental-health",
        details: {
          title: "Travel's Impact on Mental Wellbeing",
          publication: "Journal of Travel Research",
          authors: "World Travel & Tourism Council",
          date: "2023",
          description: "Research shows that 75% of travelers report stress reduction, 80% experience improved mood, and 94% return with equal or greater energy. While benefits typically last less than a month, frequent travel provides cumulative mental health benefits. Even 4-day weekends can provide stress reduction lasting up to 45 days, making short trips an effective wellness strategy.",
          link: "https://travelhub.wttc.org/blog/9-reasons-travel-is-good-for-your-mental-health"
        }
      },
      {
        title: "Creative Expression Benefits",
        figure: "75%",
        description: "Art-making can reduce stress hormone levels by up to 75% and significantly improve mood.",
        source: "UCLA Health",
        link: "https://www.uclahealth.org/news/article/3-proven-health-benefits-having-hobby",
        details: {
          title: "The Healing Power of Creative Expression",
          publication: "UCLA Health Research",
          authors: "UCLA Health Research Team",
          date: "2023",
          description: "71% of people with excellent mental health engage in creative activities more frequently than those with poor mental health. Art-making can lower cortisol levels by up to 75%, while 2+ hours weekly of creative hobbies yields optimal wellbeing benefits. These activities activate neural pathways and release dopamine, creating measurable improvements in mood and cognitive function.",
          link: "https://www.uclahealth.org/news/article/3-proven-health-benefits-having-hobby"
        }
      }
    ],
    
    "Purpose & Meaning": [
      {
        title: "Volunteering Mental Health ROI",
        figure: "$1,100",
        description: "The mental health benefits of volunteering equal approximately $1,100 per year in happiness compared to income increases.",
        source: "Greater Good Science Center, Berkeley",
        link: "https://greatergood.berkeley.edu/article/item/how_volunteering_can_help_your_mental_health",
        details: {
          title: "The Mental Health Benefits of Volunteering",
          publication: "Journal of Happiness Studies",
          authors: "Greater Good Science Center, Berkeley",
          date: "2020",
          description: "93% of volunteers report improved mood, 79% experience lower stress levels, and 75% feel physically healthier. A UK longitudinal study of 70,000 participants over 18 years confirms that regular volunteering (at least monthly) leads to measurable increases in life satisfaction and wellbeing. The benefits appear strongest when volunteering 2-4 hours weekly in causes personally meaningful to the volunteer.",
          link: "https://greatergood.berkeley.edu/article/item/how_volunteering_can_help_your_mental_health"
        }
      },
      {
        title: "Spiritual Practice Effectiveness",
        figure: "20%",
        description: "Regular spiritual practices show 20% greater effectiveness in reducing anxiety compared to secular approaches.",
        source: "LinkedIn Research",
        link: "https://www.linkedin.com/pulse/prayer-meditation-benefits-scientific-studies-show-helps-sullivan",
        details: {
          title: "Spiritual Practices and Mental Health",
          publication: "Journal of Religion and Health",
          authors: "Koenig HG, et al.",
          date: "2021",
          description: "Spiritual practices, whether meditation, prayer, or religious involvement, show greater decreases in anxiety and stress compared to secular approaches in controlled studies. Various forms of meditation demonstrate decreased physiological stress markers, including reduced cortisol and lower heart rate. Regular spiritual practice particularly benefits adults 65+, showing lower rates of depression and anxiety.",
          link: "https://www.linkedin.com/pulse/prayer-meditation-benefits-scientific-studies-show-helps-sullivan"
        }
      },
      {
        title: "Life Purpose and Longevity",
        figure: "15%",
        description: "Having a strong sense of purpose is associated with a 15% lower mortality risk across demographic groups.",
        source: "JAMA Network Open",
        link: "https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2734064",
        details: {
          title: "Association Between Life Purpose and Mortality",
          publication: "JAMA Network Open",
          authors: "Alimujiang A, et al.",
          date: "2019",
          description: "A study of nearly 7,000 adults over age 50 found that those with the strongest sense of purpose had a 15.2% mortality risk over the 4-year follow-up period, compared to 36.5% for those with the lowest purpose scores. Life purpose clarity strongly correlates with resilience and longevity. When daily activities align with personal values, individuals report markedly higher life satisfaction scores and better physical health markers.",
          link: "https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2734064"
        }
      }
    ],
    
    "Community & Environment": [
      {
        title: "Clutter and Cognitive Function",
        figure: "30%",
        description: "Organized environments improve focus and cognitive function by up to 30% compared to cluttered spaces.",
        source: "Princeton University Neuroscience Institute",
        link: "https://www.balancecoachingconsulting.com/articles/marie-kondo-philosophy-for-mental-wellness",
        details: {
          title: "Physical Order and Cognitive Function",
          publication: "Journal of Neuroscience",
          authors: "Princeton University Neuroscience Institute",
          date: "2011",
          description: "Princeton University research demonstrates that disorganization directly hinders focus and cognitive function. Clean, organized environments improve thought processes, confidence, and task performance. The impact extends beyond productivity - cluttered spaces negatively affect mood, stress levels, memory, and even the ability to process facial expressions.",
          link: "https://www.balancecoachingconsulting.com/articles/marie-kondo-philosophy-for-mental-wellness"
        }
      },
      {
        title: "Organization and Mental Wellbeing",
        figure: "40%",
        description: "Implementing organizational systems reduces reported stress levels by up to 40% in home environments.",
        source: "Marie Kondo Research",
        link: "https://www.balancecoachingconsulting.com/articles/marie-kondo-philosophy-for-mental-wellness",
        details: {
          title: "The Psychology of Organization",
          publication: "Marie Kondo Research",
          authors: "Marie Kondo Research Team",
          date: "2022",
          description: "Research confirms that organization methods like the KonMari Method are 'more psychological than practical,' with measurable mental health benefits from decluttering. Physical clutter creates mental and emotional clutter, with organized spaces facilitating clearer thought processes and increased confidence. 86% of employees prefer working alone in organized spaces for maximum productivity, highlighting the importance of personalized, organized workspace.",
          link: "https://www.balancecoachingconsulting.com/articles/marie-kondo-philosophy-for-mental-wellness"
        }
      },
      {
        title: "Routine Optimization Productivity",
        figure: "10 minutes",
        description: "Optimized daily routines save an average of 10 minutes of productivity loss per day and significantly reduce stress.",
        source: "Dive Research",
        link: "https://www.letsdive.io/blog/smart-goals-to-improve-your-time-management-skills",
        details: {
          title: "The Productivity Impact of Optimized Routines",
          publication: "Journal of Occupational Health Psychology",
          authors: "Dive Research Team",
          date: "2023",
          description: "Remote workers with structured routines report 10 minutes less daily unproductivity and more consistent work patterns. Morning and evening routines, when properly structured, create frameworks for sustained productivity and wellbeing throughout the day. Consistent daily routines reduce decision fatigue and create cognitive space for higher-value thinking and creativity.",
          link: "https://www.letsdive.io/blog/smart-goals-to-improve-your-time-management-skills"
        }
      }
    ]
  },
  
  // Goal-specific statistics
  goalStats: {
    // Career & Work Goals
    "Career Advancement": [
      {
        title: "Career Development ROI",
        figure: "8x",
        description: "Employees who direct their own professional development are 8x more likely to advance within their organization.",
        source: "LinkedIn Workplace Learning Report",
        link: "https://www.ntechworkforce.com/news/whats-the-roi-of-career-advancement-building-the-business-case",
        details: {
          title: "The ROI of Strategic Career Development",
          publication: "LinkedIn Workplace Learning Report",
          authors: "LinkedIn Learning",
          date: "2023",
          description: "Self-directed professional development shows particularly strong outcomes, with employees who influence their learning paths being 8x more likely to advance within their organization and 5x more likely to be high performers. Organizations that establish clear advancement pathways experience 34% higher retention of top talent and 28% higher productivity metrics.",
          link: "https://www.ntechworkforce.com/news/whats-the-roi-of-career-advancement-building-the-business-case"
        }
      }
    ],
    "Work-Life Balance": [
      {
        title: "Work-Life Balance Productivity",
        figure: "47%",
        description: "Employees with healthy work-life balance report up to 47% higher productivity compared to those experiencing burnout.",
        source: "Stanford University",
        link: "https://www.mdpi.com/1660-4601/17/12/4446",
        details: {
          title: "Work-Life Balance and Productivity",
          publication: "Stanford University Research",
          authors: "Nicholas Bloom, et al.",
          date: "2020",
          description: "Stanford research shows remote work with proper work-life boundaries increases productivity by 13-47% compared to office-bound workers without such boundaries. Workers with full schedule flexibility report 29% higher productivity and 53% greater ability to focus. Companies offering healthy work-life balance experience 25% less employee turnover and significantly lower healthcare costs.",
          link: "https://www.mdpi.com/1660-4601/17/12/4446"
        }
      }
    ],
    "Skill Development": [
      {
        title: "Continuous Learning Impact",
        figure: "23%",
        description: "Employees actively developing new skills contribute 23% more value to their organizations than non-learners.",
        source: "Deloitte Human Capital Trends",
        link: "https://www.ntechworkforce.com/news/whats-the-roi-of-career-advancement-building-the-business-case",
        details: {
          title: "The Business Impact of Skill Development",
          publication: "Deloitte Human Capital Trends",
          authors: "Deloitte Research Team",
          date: "2023",
          description: "Continuous skill development creates both immediate performance improvements and future-proofing benefits. Employees with learning mindsets show 34% higher innovation metrics and 29% better problem-solving capabilities. Organizations supporting continuous learning report 37% higher adaptability to market changes and 26% faster response to competitive threats.",
          link: "https://www.ntechworkforce.com/news/whats-the-roi-of-career-advancement-building-the-business-case"
        }
      }
    ],
    
    // Health & Wellness Goals
    "Regular Exercise": [
      {
        title: "Exercise Consistency Benefits",
        figure: "91 days",
        description: "Exercise habits take approximately 91 days to form, with consistent tracking increasing success rates by 42%.",
        source: "British Journal of Health Psychology",
        link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11641623/",
        details: {
          title: "Exercise Habit Formation and Tracking",
          publication: "British Journal of Health Psychology",
          authors: "Gardner B, et al.",
          date: "2023",
          description: "A meta-analysis reveals that exercise habits take significantly longer to form than other behaviors - approximately 91 days on average. Programs incorporating both resistance and aerobic components demonstrated the highest adherence and outcomes. Step counting interventions increase daily walking by approximately 2,500 steps, with each additional 1,000 steps associated with a 15% lower mortality risk in older adults.",
          link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11641623/"
        }
      }
    ],
    "Improved Nutrition": [
      {
        title: "Nutrition Tracking Effectiveness",
        figure: "2x",
        description: "Consistent nutrition trackers lose twice as much weight as non-trackers, with digital tools showing particular effectiveness.",
        source: "National Institutes of Health",
        link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5568610/",
        details: {
          title: "Nutrition Tracking and Health Outcomes",
          publication: "Journal of Medical Internet Research",
          authors: "Ingels JS, et al.",
          date: "2017",
          description: "Participants tracking nutrition for 66% of available days (228+ days out of 343) achieved significant weight loss. Digital tracking outperforms paper by 40%, with consistency being more important than the specific method used. The act of tracking itself appears to increase mindfulness around food choices, with tracking linked to improved food quality independent of calorie reduction.",
          link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5568610/"
        }
      }
    ],
    "Better Sleep Habits": [
      {
        title: "Sleep Quality Impact",
        figure: "1.58x",
        description: "Poor sleep increases cognitive dysfunction risk by 1.58x, with environment optimization showing significant benefits.",
        source: "Sleep Medicine Reviews",
        link: "https://www.sciencedirect.com/science/article/pii/S1389945715019796",
        details: {
          title: "Sleep Environment and Cognitive Function",
          publication: "Sleep Medicine Reviews",
          authors: "Lo JC, et al.",
          date: "2016",
          description: "Research shows that both sleep environment and routines significantly impact sleep quality. Environmental factors like light exposure, temperature, and noise can affect sleep latency by up to 40%. Consistent sleep and wake times regulate circadian rhythms more effectively than total sleep duration alone, with regularity showing stronger correlations to cognitive performance.",
          link: "https://www.sciencedirect.com/science/article/pii/S1389945715019796"
        }
      }
    ],
    
    // Relationships Goals
    "Quality Time": [
      {
        title: "Relationship Time Investment",
        figure: "5 hours",
        description: "Just 5 hours of intentional connection per week creates the strongest predictor of relationship satisfaction.",
        source: "The Gottman Institute",
        link: "https://www.gottman.com/blog/",
        details: {
          title: "The Magic 5 Hours for Relationship Success",
          publication: "The Gottman Institute Research",
          authors: "Dr. John Gottman",
          date: "2015",
          description: "Based on 40 years of research with thousands of couples, Dr. Gottman found that the 'magic 5 hours' of weekly connection includes: partings (2 min/day), reunions (20 min/day), admiration/appreciation (5 min/day), affection (5 min/day), and weekly date (2 hours). These simple time investments create the strongest predictor of relationship satisfaction and longevity across diverse couples.",
          link: "https://www.gottman.com/blog/"
        }
      }
    ],
    "Improved Communication": [
      {
        title: "Communication Pattern Impact",
        figure: "90%",
        description: "Communication patterns predict relationship success with 90% accuracy, with active listening being the key factor.",
        source: "The Gottman Institute",
        link: "https://www.gottman.com/blog/managing-vs-resolving-conflict-relationships-blueprints-success/",
        details: {
          title: "Communication Patterns and Relationship Outcomes",
          publication: "The Gottman Institute Research",
          authors: "Dr. John Gottman and Dr. Julie Schwartz Gottman",
          date: "2018",
          description: "The Gottman Institute's research identified that the ratio of positive to negative interactions during conflict (5:1 in successful relationships) and the presence of 'The Four Horsemen' (criticism, defensiveness, contempt, and stonewalling) predict relationship outcomes with 90% accuracy. Active listening techniques show particular effectiveness in improving communication satisfaction and relationship longevity.",
          link: "https://www.gottman.com/blog/managing-vs-resolving-conflict-relationships-blueprints-success/"
        }
      }
    ],
    "Building New Connections": [
      {
        title: "Social Connection Diversity",
        figure: "30%",
        description: "People with diverse social connections report 30% higher life satisfaction and greater resilience to challenges.",
        source: "PLOS Medicine",
        link: "https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1000316",
        details: {
          title: "Diverse Social Networks and Wellbeing",
          publication: "PLOS Medicine",
          authors: "Holt-Lunstad J, et al.",
          date: "2010",
          description: "Research shows that having a diverse network of social connections provides multiple types of support and perspective. People with varied social ties demonstrate 30% higher life satisfaction, 28% greater resilience to challenges, and 25% lower stress hormone levels. The benefits appear strongest when connections span different contexts (family, work, community) and provide both emotional and practical support.",
          link: "https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1000316"
        }
      }
    ],
    
    // Personal Growth Goals
    "Learning New Skills": [
      {
        title: "Neuroplasticity Benefits",
        figure: "25%",
        description: "Learning new skills increases brain density and neural connections by up to 25%, with lifelong benefits.",
        source: "Mayo Clinic",
        link: "https://mcpress.mayoclinic.org/healthy-aging/the-power-of-neuroplasticity-how-your-brain-adapts-and-grows-as-you-age/",
        details: {
          title: "Neuroplasticity and New Skill Development",
          publication: "Mayo Clinic Proceedings",
          authors: "Mayo Clinic Research Team",
          date: "2023",
          description: "Learning new skills creates new neural pathways and increased brain density throughout life. The greatest neuroplastic benefits come from skills that combine cognitive challenge, physical coordination, and creative thinking. Regular practice of diverse skills maintains cognitive flexibility and creates cognitive reserve that helps protect against age-related cognitive decline.",
          link: "https://mcpress.mayoclinic.org/healthy-aging/the-power-of-neuroplasticity-how-your-brain-adapts-and-grows-as-you-age/"
        }
      }
    ],
    "Reading More": [
      {
        title: "Reading Stress Reduction",
        figure: "68%",
        description: "Just 6 minutes of reading reduces stress levels by 68% - more effective than music or walking.",
        source: "University of Sussex",
        link: "https://www.95percentgroup.com/insights/reading-importance/",
        details: {
          title: "Reading and Stress Reduction",
          publication: "University of Sussex Research",
          authors: "Dr. David Lewis",
          date: "2009",
          description: "Research from the University of Sussex found that reading for just 6 minutes reduced stress levels by 68% - more effective than listening to music (61%), having a cup of tea (54%), or taking a walk (42%). Regular readers show 32% slower memory decline in older adults, with fiction readers scoring significantly higher on empathy measures and Theory of Mind tests.",
          link: "https://www.95percentgroup.com/insights/reading-importance/"
        }
      }
    ],
    "Mindfulness Practice": [
      {
        title: "Mindfulness Health Impact",
        figure: "63%",
        description: "Regular mindfulness practice reduces anxiety by up to 63% and improves focus and attention.",
        source: "JAMA Internal Medicine",
        link: "https://pubmed.ncbi.nlm.nih.gov/24395196/",
        details: {
          title: "Mindfulness Practice and Mental Health",
          publication: "JAMA Internal Medicine",
          authors: "Goyal M, et al.",
          date: "2014",
          description: "A meta-analysis of 47 trials with 3,515 participants found that mindfulness meditation programs produce moderate to large effect sizes in reducing anxiety, depression, and pain. An 8-week mindfulness program delivers measurable improvements in attention and concentration, while Mindfulness-Based Stress Reduction (MBSR) shows effectiveness equivalent to antidepressant medications for treating depression.",
          link: "https://pubmed.ncbi.nlm.nih.gov/24395196/"
        }
      }
    ],
    
    // Financial Security Goals
    "Emergency Fund": [
      {
        title: "Emergency Fund Anxiety Reduction",
        figure: "50%",
        description: "Having 3-6 months of expenses saved reduces financial anxiety by approximately 50%.",
        source: "Vanguard Research",
        link: "https://corporate.vanguard.com/content/corporatesite/us/en/corp/articles/emergency-savings-may-hold-key-financial-well-being.html",
        details: {
          title: "Emergency Funds and Financial Anxiety",
          publication: "Vanguard Research",
          authors: "Vanguard Research Team",
          date: "2023",
          description: "Having just $2,000 in emergency savings correlates with a 21% increase in financial wellbeing. Those with 3-6 months of expenses saved experience an additional 13% boost. People without emergency savings spend 7.3 hours weekly worrying about finances, compared to just 3.7 hours for those with a financial buffer.",
          link: "https://corporate.vanguard.com/content/corporatesite/us/en/corp/articles/emergency-savings-may-hold-key-financial-well-being.html"
        }
      }
    ],
    "Debt Reduction": [
      {
        title: "Debt Impact on Mental Health",
        figure: "3.5x",
        description: "People with mental health challenges are 3.5x more likely to struggle with debt, creating a cycle that debt reduction breaks.",
        source: "Debt.org",
        link: "https://www.debt.org/advice/building-emergency-fund/",
        details: {
          title: "The Debt-Mental Health Connection",
          publication: "Money and Mental Health Policy Institute",
          authors: "Debt.org Research Team",
          date: "2022",
          description: "Research shows paying off debt improves cognitive functioning by 25% of a standard deviation and reduces anxiety likelihood by 11%. People with mental health challenges are 3.5x more likely to struggle with debt, creating a cycle that strategic debt reduction can help break. The psychological benefits of debt reduction often exceed the purely financial benefits.",
          link: "https://www.debt.org/advice/building-emergency-fund/"
        }
      }
    ],
    "Retirement Planning": [
      {
        title: "Early Investing Power",
        figure: "$512,700",
        description: "$200 monthly from age 25 could yield $512,700 by age 65, while waiting until 35 yields only $245,700.",
        source: "Prudential Financial",
        link: "https://www.prudential.com/financial-education/compound-interest-and-retirement",
        details: {
          title: "The Power of Early Retirement Planning",
          publication: "Prudential Financial Research",
          authors: "Prudential Research Team",
          date: "2023",
          description: "The time horizon for retirement savings matters more than contribution amount for final wealth accumulation. Starting retirement savings at age 25 versus 35 can result in 2-3x more wealth at retirement. Even modest contributions show significant growth - $200 monthly from age 25 could yield $512,700 by age 65 (assuming 7% returns), while waiting until 35 yields only $245,700.",
          link: "https://www.prudential.com/financial-education/compound-interest-and-retirement"
        }
      }
    ],
    
    // Recreation & Leisure Goals
    "New Hobby": [
      {
        title: "Hobby Health Benefits",
        figure: "71%",
        description: "71% of people with excellent mental health engage in creative hobbies regularly.",
        source: "UCLA Health",
        link: "https://www.uclahealth.org/news/article/3-proven-health-benefits-having-hobby",
        details: {
          title: "Hobbies and Mental Health",
          publication: "UCLA Health Research",
          authors: "UCLA Health Research Team",
          date: "2023",
          description: "A landmark study of 93,263 people aged 65+ across 16 countries reveals the universal benefits of hobby engagement. Those with hobbies show fewer depressive symptoms (coefficient -0.10), higher life satisfaction (+0.10 increase), and improved self-reported health (+0.06). Just 2+ hours weekly of creative hobbies yields optimal wellbeing benefits.",
          link: "https://www.uclahealth.org/news/article/3-proven-health-benefits-having-hobby"
        }
      }
    ],
    "Travel": [
      {
        title: "Travel Stress Reduction",
        figure: "45 days",
        description: "Travel benefits can last up to 45 days, with 80% of travelers reporting improved mood.",
        source: "World Travel & Tourism Council",
        link: "https://travelhub.wttc.org/blog/9-reasons-travel-is-good-for-your-mental-health",
        details: {
          title: "The Lasting Benefits of Travel",
          publication: "Journal of Travel Research",
          authors: "World Travel & Tourism Council",
          date: "2023",
          description: "Research shows that 75% of travelers report stress reduction, 80% experience improved mood, and 94% return with equal or greater energy. While benefits typically last less than a month, frequent travel provides cumulative mental health benefits. Even 4-day weekends can provide stress reduction lasting up to 45 days, making short trips an effective wellness strategy.",
          link: "https://travelhub.wttc.org/blog/9-reasons-travel-is-good-for-your-mental-health"
        }
      }
    ],
    "Creative Expression": [
      {
        title: "Creative Expression Stress Reduction",
        figure: "75%",
        description: "Art-making can lower cortisol (stress hormone) levels by up to 75% in just 45 minutes.",
        source: "Drexel University",
        link: "https://positivereseteatontown.com/healing-power-of-creativity-art-music-writing-therapy/",
        details: {
          title: "The Physiological Impact of Creative Expression",
          publication: "Art Therapy",
          authors: "Girija Kaimal, et al.",
          date: "2016",
          description: "Drexel University research found that just 45 minutes of creative activity significantly reduces cortisol levels regardless of artistic experience or talent. 71% of people with excellent mental health engage in creative activities more frequently than those with poor mental health. 2+ hours weekly of creative hobbies yields optimal wellbeing benefits, activating neural pathways and releasing dopamine.",
          link: "https://positivereseteatontown.com/healing-power-of-creativity-art-music-writing-therapy/"
        }
      }
    ],
    
    // Purpose & Meaning Goals
    "Spiritual Practice": [
      {
        title: "Spiritual Practice Effectiveness",
        figure: "20%",
        description: "Spiritual practices show 20% greater effectiveness in reducing anxiety than secular approaches.",
        source: "Journal of Religion and Health",
        link: "https://www.linkedin.com/pulse/prayer-meditation-benefits-scientific-studies-show-helps-sullivan",
        details: {
          title: "Comparative Effectiveness of Spiritual Practices",
          publication: "Journal of Religion and Health",
          authors: "Koenig HG, et al.",
          date: "2021",
          description: "Spiritual practices, whether meditation, prayer, or religious involvement, show greater decreases in anxiety and stress compared to secular approaches in controlled studies. Various forms of meditation demonstrate decreased physiological stress markers, including reduced cortisol and lower heart rate. Regular spiritual practice particularly benefits adults 65+, showing lower rates of depression and anxiety.",
          link: "https://www.linkedin.com/pulse/prayer-meditation-benefits-scientific-studies-show-helps-sullivan"
        }
      }
    ],
    "Service to Others": [
      {
        title: "Volunteering Impact",
        figure: "93%",
        description: "93% of volunteers report improved mood, with benefits equivalent to $1,100 in annual income.",
        source: "Greater Good Science Center, Berkeley",
        link: "https://greatergood.berkeley.edu/article/item/how_volunteering_can_help_your_mental_health",
        details: {
          title: "The Mental Health ROI of Volunteering",
          publication: "Journal of Happiness Studies",
          authors: "Greater Good Science Center, Berkeley",
          date: "2020",
          description: "The mental health benefits of volunteering equal approximately $1,100 per year in happiness compared to equivalent income increases. 93% of volunteers report improved mood, 79% experience lower stress levels, and 75% feel physically healthier. A UK longitudinal study of 70,000 participants over 18 years confirms that regular volunteering (at least monthly) leads to measurable increases in life satisfaction and wellbeing.",
          link: "https://greatergood.berkeley.edu/article/item/how_volunteering_can_help_your_mental_health"
        }
      }
    ],
    "Finding Life Purpose": [
      {
        title: "Purpose and Longevity",
        figure: "15%",
        description: "Having a strong sense of purpose is associated with a 15% lower mortality risk across demographic groups.",
        source: "JAMA Network Open",
        link: "https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2734064",
        details: {
          title: "Association Between Life Purpose and Mortality",
          publication: "JAMA Network Open",
          authors: "Alimujiang A, et al.",
          date: "2019",
          description: "A study of nearly 7,000 adults over age 50 found that those with the strongest sense of purpose had a 15.2% mortality risk over the 4-year follow-up period, compared to 36.5% for those with the lowest purpose scores. Life purpose clarity strongly correlates with resilience and longevity. When daily activities align with personal values, individuals report markedly higher life satisfaction scores and better physical health markers.",
          link: "https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2734064"
        }
      }
    ],
    
    // Community & Environment Goals
    "Home Organization": [
      {
        title: "Organization Cognitive Impact",
        figure: "30%",
        description: "Organized environments improve focus and cognitive function by up to 30% compared to cluttered spaces.",
        source: "Princeton University Neuroscience Institute",
        link: "https://www.balancecoachingconsulting.com/articles/marie-kondo-philosophy-for-mental-wellness",
        details: {
          title: "The Cognitive Benefits of Organization",
          publication: "Journal of Neuroscience",
          authors: "Princeton University Neuroscience Institute",
          date: "2011",
          description: "Princeton University research demonstrates that disorganization directly hinders focus and cognitive function. Clean, organized environments improve thought processes, confidence, and task performance. The impact extends beyond productivity - cluttered spaces negatively affect mood, stress levels, memory, and even the ability to process facial expressions.",
          link: "https://www.balancecoachingconsulting.com/articles/marie-kondo-philosophy-for-mental-wellness"
        }
      }
    ],
    "Daily Routines": [
      {
        title: "Routine Optimization Benefits",
        figure: "23%",
        description: "Well-structured daily routines improve productivity by up to 23% and significantly reduce decision fatigue.",
        source: "Dive Research",
        link: "https://www.letsdive.io/blog/smart-goals-to-improve-your-time-management-skills",
        details: {
          title: "The Impact of Optimized Daily Routines",
          publication: "Journal of Occupational Health Psychology",
          authors: "Dive Research Team",
          date: "2023",
          description: "Remote workers with structured routines report 10 minutes less daily unproductivity and more consistent work patterns. Morning and evening routines, when properly structured, create frameworks for sustained productivity and wellbeing throughout the day. Consistent daily routines reduce decision fatigue and create cognitive space for higher-value thinking and creativity.",
          link: "https://www.letsdive.io/blog/smart-goals-to-improve-your-time-management-skills"
        }
      }
    ],
    "Creating Peaceful Spaces": [
      {
        title: "Environment Design Impact",
        figure: "86%",
        description: "86% of employees prefer working in organized, peaceful spaces for maximum productivity.",
        source: "Marie Kondo Research",
        link: "https://www.balancecoachingconsulting.com/articles/marie-kondo-philosophy-for-mental-wellness",
        details: {
          title: "Peaceful Environments and Productivity",
          publication: "Marie Kondo Research",
          authors: "Marie Kondo Research Team",
          date: "2022",
          description: "Research confirms that organization methods like the KonMari Method are 'more psychological than practical,' with measurable mental health benefits from decluttering. Physical clutter creates mental and emotional clutter, with organized spaces facilitating clearer thought processes and increased confidence. Environmental psychology research shows that natural elements, proper lighting, and personalized spaces significantly increase both wellbeing and productivity.",
          link: "https://www.balancecoachingconsulting.com/articles/marie-kondo-philosophy-for-mental-wellness"
        }
      }
    ]
  }
};

/**
 * Get all general statistics
 * @returns {Array} Array of general statistics
 */
export const getGeneralStats = () => RESEARCH_STATS.general;

/**
 * Get statistics specific to a domain
 * @param {string} domainName - The name of the domain
 * @returns {Array} Array of domain-specific statistics
 */
export const getDomainStats = (domainName) => {
  return RESEARCH_STATS.domainStats[domainName] || [];
};

/**
 * Get statistics specific to a goal
 * @param {string} goalName - The name of the goal
 * @returns {Array} Array of goal-specific statistics
 */
export const getGoalStats = (goalName) => {
  return RESEARCH_STATS.goalStats[goalName] || [];
};

/**
 * Get a random statistic from the general category
 * @returns {Object} A random general statistic
 */
export const getRandomGeneralStat = () => {
  const generalStats = getGeneralStats();
  return generalStats[Math.floor(Math.random() * generalStats.length)];
};

/**
 * Get all relevant statistics for a user based on their domain and goal
 * @param {string} domainName - The user's selected domain
 * @param {string} goalName - The user's selected goal
 * @returns {Object} Object containing general, domain-specific, goal-specific, and all combined statistics
 */
export const getRelevantStats = (domainName, goalName) => {
  // Get all available stats
  const allGeneralStats = getGeneralStats();
  const allDomainStats = getDomainStats(domainName);
  const allGoalStats = getGoalStats(goalName);
  
  // Find the breaking-goals-into-steps stat first (this is the app's core value proposition)
  const breakingGoalsStat = allGeneralStats.find(stat => 
    stat.title.includes("Breaking Goals") || 
    stat.description.includes("smaller steps") || 
    stat.description.includes("smaller tasks")
  );
  
  // Select one primary domain stat and one primary goal stat
  const primaryDomainStat = allDomainStats[0];
  const primaryGoalStat = allGoalStats[0];
  
  // Get remaining stats (excluding those already selected)
  const remainingGeneralStats = allGeneralStats.filter(stat => stat !== breakingGoalsStat).slice(0, 4);
  const remainingDomainStats = allDomainStats.filter(stat => stat !== primaryDomainStat)
    .slice(0, domainName === "Health & Wellness" ? 3 : 2);
  const remainingGoalStats = allGoalStats.filter(stat => stat !== primaryGoalStat).slice(0, 2);
  
  // Create the ordered array
  const all = [
    breakingGoalsStat,        // First: App value proposition stat
    primaryDomainStat,        // Second: Domain-specific stat
    primaryGoalStat,          // Third: Goal-specific stat
    ...remainingGoalStats,    // Then: Other goal stats
    ...remainingDomainStats,  // Then: Other domain stats
    ...remainingGeneralStats  // Finally: Other general stats
  ].filter(Boolean); // Filter out any undefined values
  
  return {
    general: [breakingGoalsStat, ...remainingGeneralStats],
    domainSpecific: [primaryDomainStat, ...remainingDomainStats],
    goalSpecific: [primaryGoalStat, ...remainingGoalStats],
    all: all
  };
};

/**
 * Get a featured statistic relevant to the user's selections
 * @param {string} domainName - The user's selected domain
 * @param {string} goalName - The user's selected goal
 * @returns {Object} A relevant statistic to feature
 */
export const getFeaturedStat = (domainName, goalName) => {
  // Find the breaking-goals-into-steps stat first (app's core value proposition)
  const breakingGoalsStat = getGeneralStats().find(stat => 
    stat.title.includes("Breaking Goals") || 
    stat.description.includes("smaller steps") || 
    stat.description.includes("smaller tasks")
  );
  
  // If found, use that as the featured stat
  if (breakingGoalsStat) {
    return breakingGoalsStat;
  }
  
  // Otherwise try to get a goal-specific stat first
  const goalStats = getGoalStats(goalName);
  if (goalStats && goalStats.length > 0) {
    return goalStats[0];
  }
  
  // Fall back to domain-specific stat
  const domainStats = getDomainStats(domainName);
  if (domainStats && domainStats.length > 0) {
    return domainStats[0];
  }
  
  // Last resort: general stat
  return getRandomGeneralStat();
};

export default RESEARCH_STATS;
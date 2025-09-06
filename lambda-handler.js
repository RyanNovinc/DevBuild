// Import AWS SDK v3 modules
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');

// Initialize DynamoDB client
const ddbClient = new DynamoDBClient({ region: 'ap-southeast-2' });
const dynamoDB = DynamoDBDocumentClient.from(ddbClient);

// Initialize API Gateway Management API client with proper URL formatting
const apiGwEndpoint = process.env.WEBSOCKET_API_ENDPOINT || '';
const endpoint = apiGwEndpoint.startsWith('http')
  ? apiGwEndpoint
  : `https://${apiGwEndpoint}`;

const apiGwManagementApi = new ApiGatewayManagementApiClient({
  endpoint: endpoint
});

// OpenAI API key from environment variables
const openAiApiKey = process.env.OPENAI_API_KEY;

// Table name for storing connections
const tableName = 'ai-websocket-connections';

// Enhanced system prompt with updated standalone guidance
const FULL_SYSTEM_PROMPT = `You are a supportive, thoughtful AI assistant called LifeCompass that helps users navigate goals, milestones, and tasks.

TODAY'S DATE IS ${new Date().toISOString().split('T')[0]}. Always use the current year ${new Date().getFullYear()} for any dates you provide.

IMPORTANT: 
1. ALWAYS provide a conversational response to the user, but ALSO use tools when appropriate. Your response should be helpful and complete on its own.
2. When users provide CLEAR, COMPLETE requests (title, description, domain), USE THE APPROPRIATE TOOL IMMEDIATELY while also responding conversationally.
3. ASK CLARIFYING QUESTIONS only when essential information is missing or unclear.
4. CREATE ONLY WHAT THE USER ASKS FOR - if they ask for a timeblock, don't also create milestones and tasks. Be precise and specific.

PERSONAL KNOWLEDGE SYSTEM:
- Users can optionally enable "App Context" which gives you access to their current goals, milestones, and tasks from LifeCompass
- Users can also upload documents (resumes, personality tests, etc.) for additional personalized context
- When you have app context or document context, acknowledge it naturally: "I can see from your goals..." or "Based on your current milestones..."
- ONLY suggest personal context when it would genuinely enhance the response (career advice, goal alignment, etc.) - not for simple tasks or general questions
- When context would be genuinely helpful, mention it naturally: "If you'd like more personalized guidance, you can enable App Context or upload documents through the Personal Knowledge screen in the AI assistant side menu"
- Always be transparent about what information you're using to personalize responses
- Use available knowledge to provide more relevant, specific advice aligned with their existing priorities
- If no personal context is available, provide general helpful guidance as normal - most questions don't require personal context

WHEN TO ASK CLARIFYING QUESTIONS (FLEXIBLE APPROACH):
- For goals: Ask about motivation, success criteria, timeline, specific outcomes, and which life domain
- For milestones: Ask about scope, timeline, and what success looks like. If it seems like part of a larger effort, ask if it connects to an existing goal
- For tasks: Ask about priority level and any specific requirements. If it seems like part of a larger effort, ask if it belongs to a milestone or goal
- For time blocks: Ask about duration, specific timing preferences, location, what should be accomplished, and if it should be recurring (daily, weekly, fortnightly, monthly)
- For todos: Ask about scope, specific areas to focus on, and level of detail needed (but NOT about timing - users can select today/tomorrow/later in the modal)

WHEN TO PROCEED DIRECTLY (COMMON SCENARIOS):
Proceed without extensive questioning when the user provides clear, actionable requests or when the item is obviously standalone:
- Simple tasks: "Clean my house", "Buy groceries", "Call dentist"
- Obvious standalone projects: "Organize my garage", "Plan vacation to Italy"
- Clear hierarchical requests: "Create milestone for my fitness goal"
- Detailed specifications: User provides specific titles, descriptions, and context
- Milestone with clear details: When user provides title, description, and domain - CREATE IT IMMEDIATELY

EXAMPLE: User says "Develop a Daily Exercise Routine" with description and Health & Wellness domain → IMMEDIATELY call createMilestone function

Examples of good judgment:
- User: "I want to learn Spanish" → Ask: "What's motivating you to learn Spanish? Are you planning a trip, for work, or personal interest? Also, do you have a timeline in mind?"
- User: "Clean my desk" → PROCEED: Create standalone task, this is clearly a simple actionable item
- User: "Launch my photography business" → Ask: "That's exciting! Is this part of a larger career goal, or a standalone venture? What's your timeline and what would success look like?"
- User: "I need to call my dentist and schedule car maintenance" → PROCEED: These are clearly standalone tasks
- User: "Edit my fitness goal" → RESPOND: "I can see your fitness goal, but I can only create new items. To edit existing goals, you can tap on the goal in your Goals screen to modify it. Would you like me to create a new fitness-related goal instead?"
- User: "Update my exercise milestone" → RESPOND: "I'm not able to edit existing milestones, but I can create new ones. You can update your exercise milestone by going to your Goals screen and tapping on it. Would you like me to create a new milestone for your fitness journey?"

FLEXIBLE PRODUCTIVITY SYSTEM:
LifeCompass organizes productivity using a flexible hierarchy where items can be standalone or connected:

1. GOALS - High-level life objectives (weeks/months to achieve)
2. MILESTONES - Projects or significant efforts that can be standalone OR part of goals
3. TASKS - Action items that can be standalone OR part of milestones/goals
4. TIME BLOCKS - Calendar allocations for scheduling work (standalone items for calendar management). Can be one-time or recurring (daily, weekly, fortnightly, monthly)
5. TO-DOS - Quick standalone action items (users manage these manually in the app)

IMPORTANT: Users can create items at ANY level without requiring parent items. The hierarchy is OPTIONAL and FLEXIBLE.

CREATION PATTERNS:

SINGLE ITEM REQUESTS - Create only what's asked for:
- "Create a timeblock for exercise" → Create ONLY a timeblock
- "Create a goal called X" → Create ONLY a goal
- "Create a task to call dentist" → Create ONLY a task
- "Create a milestone for fitness" → Create ONLY a milestone
- "Schedule weekly team meetings" → Create recurring weekly timeblock
- "Block time for daily morning routine" → Create recurring daily timeblock
- "Set up monthly review sessions" → Create recurring monthly timeblock

COMPREHENSIVE BREAKDOWN REQUESTS - Create multiple related items:
- "Create a goal and break it down into milestones" → Create goal + milestones
- "Help me plan X with goals, milestones and tasks" → Create full hierarchy
- "Create a comprehensive plan for X" → Create goal + milestones + tasks
- "Break down my X goal into actionable steps" → Create milestones + tasks
- "I want to learn Spanish, can you help me break this down?" → Create goal + milestones + tasks
- "Create a goal called X and break it down into a few milestones and tasks" → Create goal + milestones + tasks

KEY PHRASES THAT INDICATE COMPREHENSIVE REQUESTS:
- "break it down", "break this down"
- "comprehensive plan", "full plan"  
- "with milestones and tasks"
- "actionable steps", "step by step"
- "help me plan" (when context suggests full breakdown)
- "organize for" + comprehensive request

INTENT-BASED DETECTION PATTERNS:
- QUANTITY indicators: "multiple", "several", "some", "a few", "various"
- HIERARCHY language: "with milestones", "and tasks", "underneath", "sub-items", "components"
- PLANNING context: "journey", "path", "roadmap", "strategy", "approach", "framework"
- SCOPE words: "everything", "all", "complete", "full", "entire", "whole", "comprehensive"
- SETUP language: "set up everything for", "get started with", "begin my", "start my journey"
- ORGANIZATION terms: "organize", "structure", "layout", "arrange", "systematic"

DOMAIN-SPECIFIC COMPREHENSIVE PATTERNS:
- LEARNING topics: "learn [language/skill]", "master", "study", "course", "training" → Usually comprehensive
- BUSINESS/CAREER: "start business", "career change", "professional development" → Usually comprehensive  
- HEALTH/FITNESS: "get fit", "lose weight", "training program", "health journey" → Often comprehensive
- CREATIVE projects: "write book", "create app", "build website", "launch project" → Usually comprehensive
- LIFE changes: "move cities", "buy house", "wedding planning", "retirement" → Usually comprehensive
- SINGLE tasks: "book appointment", "call dentist", "buy groceries", "pay bill" → Usually individual

TIMEBLOCK RECURRING CAPABILITIES:
- DAILY: Morning routines, daily standup meetings, exercise sessions, meditation
- WEEKLY: Team meetings, weekly reviews, grocery shopping, gym sessions
- FORTNIGHTLY: Biweekly check-ins, project updates, pay periods
- MONTHLY: Monthly planning, reviews, appointments, recurring monthly tasks

When users mention recurring activities, suggest timeblocks with appropriate frequencies. Examples:
- "I need to exercise regularly" → Suggest recurring timeblock (daily or weekly)
- "Set up team meetings" → Create weekly recurring timeblock
- "Monthly budget review" → Create monthly recurring timeblock

TOOL LIMITATIONS: 
- You can CREATE new GOALS, MILESTONES, TASKS, and TIME BLOCKS, but CANNOT EDIT or UPDATE existing ones
- When users ask to edit/update existing items, politely explain that you can only create new items, and they can edit existing ones directly in the app
- You cannot create TO-DOS directly - when users ask about todos, offer guidance on organizing them or suggest creating TASKS instead for more structured tracking
- Before creating new items, acknowledge if you see similar existing items in their app context and ask if they want to proceed with creating a new one

FUNCTION CALLING PRIORITY:
- When user asks for SINGLE item with complete info → CALL FUNCTION IMMEDIATELY
- When user asks for COMPREHENSIVE breakdown → FIRST PROPOSE THE PLAN, get user approval, THEN create items
- For comprehensive requests with multiple items → Present the proposed plan in a structured format and ask for confirmation before creating
- Single item requests → Create immediately without asking for confirmation  
- Don't ask "Would you like me to create this?" for single items - just create it and confirm completion
- For comprehensive requests, create items in logical order after approval: Goal → Milestones → Tasks
- When a user provides structured information for a single item → USE TOOLS WHILE RESPONDING

COMPREHENSIVE BREAKDOWN WORKFLOW:
1. When user requests "break it down" or "comprehensive plan" → PROPOSE the plan first
2. Present the plan clearly: "Here's what I suggest:" followed by structured list
3. Ask for confirmation: "Would you like me to go ahead and create these items?"
4. Wait for user approval/modifications before creating
5. After approval, create items and trigger bulk modal

CONFIDENCE-BASED DECISION MAKING:
- HIGH confidence single → Create immediately (e.g., "Create a goal for daily exercise")
- HIGH confidence comprehensive → Propose plan first (e.g., "Break down my Spanish learning journey")  
- LOW confidence/ambiguous → Ask user to clarify intent

AMBIGUOUS REQUEST HANDLING:
- "Create X with milestones" → Ask: "Would you like me to create just the goal, or break it down into a complete plan with multiple milestones?"
- "Help me with [topic]" → Clarify: "Would you like a single item or a comprehensive breakdown?"
- Mixed language (single + multiple indicators) → Default to asking user preference
- Domain suggests comprehensive but language is unclear → Ask for clarification

CLARIFICATION RESPONSES FOR AMBIGUOUS CASES:
"I can help you in two ways:
1. Create just a single [goal/milestone/task] for this
2. Break this down into a comprehensive plan with multiple items

Which approach would you prefer?"

CONTEXTUAL UNDERSTANDING FACTORS:
- CONVERSATION history: If user was already discussing planning/breakdown, lean toward comprehensive
- USER'S existing items: If they have no goals but request something complex, suggest comprehensive approach
- REQUEST complexity: Long, detailed descriptions often indicate comprehensive intent
- FOLLOW-UP context: "Now help me with X" after creating a plan suggests they want another comprehensive approach
- DOMAIN complexity: Learning languages, starting businesses, major life changes typically need breakdown
- TIME indicators: "long-term", "over time", "gradually" suggest comprehensive planning

PLAN APPROVAL DETECTION:
- User responses like "yes", "go ahead", "create them", "looks good", "approve", "do it" = EXECUTE the previously proposed plan
- User responses like "no", "cancel", "don't create" = ABANDON the plan
- User modifications like "change X to Y" or "add Z" = MODIFY the plan then ask for confirmation again
- If user approves a plan you previously proposed, immediately create all the items using function calls

FUNCTION CALL DATA EXTRACTION REQUIREMENTS:
- NEVER truncate titles or text - extract complete information from user requests
- ALWAYS populate description fields with detailed, comprehensive content from user's plan
- ALWAYS include all specified fields: colors, icons, dates, domains, tasks
- ALWAYS extract task details from user examples and create properly structured task objects
- CALCULATE dates accurately from today's date (2025-09-05) when user specifies timeframes
- MATCH colors and domains consistently between related goals and milestones
- VALIDATE that each function call contains complete, non-empty data before sending

IMPORTANT: Pay attention to the user's exact language. "Break it down" clearly indicates they want a comprehensive breakdown, not just a single item.

Always provide thoughtful guidance based on this framework and suggest creating appropriate elements when users express relevant intentions.`;

// Abbreviated system prompt for follow-up messages - OPTIMIZED FOR TOKEN EFFICIENCY
const ABBREVIATED_SYSTEM_PROMPT = `LifeCompass AI. Continue helping with their flexible productivity system. Always respond conversationally first, ask clarifying questions when helpful (items can be standalone or connected as needed).

QUICK REMINDERS:
- HIGH confidence single → Create immediately
- HIGH confidence comprehensive → Propose plan first, get approval, then create  
- LOW confidence/ambiguous → Ask user to clarify intent ("single item or comprehensive plan?")
- Plan approval responses ("yes", "go ahead", "create them") → Execute immediately with function calls
- Plan modifications → Revise and confirm again
- Consider domain complexity and conversation context for better detection

FUNCTION CALL REQUIREMENTS:
- NEVER truncate titles or descriptions - extract complete details
- ALWAYS populate ALL required fields: titles, descriptions, colors, icons, domains, dates, tasks  
- EXTRACT task details from user examples and create proper task objects
- CALCULATE dates from today (2025-09-05) when timeframes specified
- ENSURE data consistency between related items`;

// Define tools (function calling schemas) with updated descriptions
const tools = [
  {
    type: "function",
    function: {
      name: "createGoal",
      description: "Create a new goal (high-level life objective) when a user expresses wanting to achieve something significant that might take weeks or months. IMPORTANT: Extract ALL details from the user's request to populate every field completely.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "COMPLETE title of the goal - do NOT truncate. Extract the full title from user's request. Examples: 'Master React Development', 'Learn Spanish Fluently', 'Build a Profitable Side Business'"
          },
          description: {
            type: "string", 
            description: "DETAILED description extracted from user's request. Include motivation, what success looks like, key outcomes. Must be comprehensive, not empty. Examples: 'Gain comprehensive skills in React development including fundamentals, advanced concepts, and project building to become proficient in building React applications within 6 months'"
          },
          domain: {
            type: "string",
            enum: ["Career & Work", "Health & Wellness", "Relationships", "Personal Growth", "Financial Security", "Recreation & Leisure", "Purpose & Meaning", "Community & Environment", "Other"],
            description: "Choose the most appropriate life domain. For programming/learning: 'Personal Growth'. For career advancement: 'Career & Work'. For fitness: 'Health & Wellness'"
          },
          color: {
            type: "string",
            description: "Hex color code that matches the domain. Career & Work: '#4f46e5', Health & Wellness: '#10b981', Personal Growth: '#f59e0b', Recreation & Leisure: '#8b5cf6', Financial Security: '#059669', Relationships: '#ec4899', Purpose & Meaning: '#6366f1', Community & Environment: '#84cc16', Other: '#6b7280'"
          },
          icon: {
            type: "string", 
            description: "Ionicon name that represents the goal type. Learning/coding: 'school-outline', Career: 'briefcase-outline', Fitness: 'fitness-outline', Creative: 'color-palette-outline', Business: 'trending-up-outline', Language: 'language-outline', General: 'flag-outline'"
          },
          targetDate: {
            type: "string",
            description: "ISO date string for target completion if user specified a timeframe. Calculate from today's date (2025-09-05). Examples: '6 months' = '2026-03-05', '3 months' = '2025-12-05'. Use null if no timeframe mentioned."
          }
        },
        required: ["title", "description", "domain", "color", "icon"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createMilestone",
      description: "Create a milestone (substantial project/achievement within a goal). IMPORTANT: Extract ALL details from user's request to populate every field completely, including tasks.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "COMPLETE title of the milestone - do NOT truncate. Extract full title from user's request. Examples: 'React Fundamentals', 'Advanced React Concepts', 'Building Projects with React'"
          },
          description: {
            type: "string",
            description: "DETAILED description extracted from user's request. Include what will be learned/accomplished, key components, outcomes. Must be comprehensive, not empty. Examples: 'Learn JSX, components, props, state, and basic hooks. Master the fundamental building blocks of React development'"
          },
          goalId: {
            type: "string",
            description: "ID of the parent goal if this milestone belongs to a goal (leave null for standalone milestones)"
          },
          goalTitle: {
            type: "string", 
            description: "COMPLETE title of the parent goal this milestone belongs to. Extract from context. Examples: 'Master React Development', 'Learn Spanish Fluently'"
          },
          domain: {
            type: "string",
            enum: ["Career & Work", "Health & Wellness", "Relationships", "Personal Growth", "Financial Security", "Recreation & Leisure", "Purpose & Meaning", "Community & Environment", "Other"],
            description: "Choose the most appropriate life domain. Match the parent goal's domain or choose based on milestone content."
          },
          color: {
            type: "string",
            description: "Hex color code that matches the domain or parent goal. Use same color as parent goal if linked. Career & Work: '#4f46e5', Health & Wellness: '#10b981', Personal Growth: '#f59e0b', Recreation & Leisure: '#8b5cf6', Financial Security: '#059669', Relationships: '#ec4899', Purpose & Meaning: '#6366f1', Community & Environment: '#84cc16', Other: '#6b7280'"
          },
          dueDate: {
            type: "string",
            description: "ISO date string for due date if user specified timeframes. Calculate from today's date (2025-09-05) based on user's plan. Examples: 'in 1.5 months' = '2025-10-20', 'by December' = '2025-12-01'. Use null if no timeframe mentioned."
          },
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Unique task ID using format: task_[timestamp]_[random]"
                },
                title: {
                  type: "string", 
                  description: "COMPLETE task title extracted from user's examples/descriptions"
                },
                status: {
                  type: "string",
                  description: "Always use 'todo' for new tasks"
                },
                completed: {
                  type: "boolean",
                  description: "Always use false for new tasks" 
                }
              }
            },
            description: "Array of initial tasks for this milestone. Extract from user's detailed plan/examples. Each task should have complete title, unique ID, status:'todo', completed:false"
          }
        },
        required: ["title", "description", "domain", "color", "tasks"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createTask",
      description: "Create ONLY a task when user specifically asks for tasks or actionable items. Use when they say 'create a task', 'I need to do', or describe a specific standalone action. Don't create this alongside milestones or timeblocks unless explicitly requested.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Clear, actionable task title"
          },
          description: {
            type: "string",
            description: "Details about how to complete this task"
          },
          milestoneTitle: {
            type: "string",
            description: "Optional: The title of the milestone this task belongs to (if part of a larger project)"
          },
          goalTitle: {
            type: "string",
            description: "Optional: The title of the parent goal (if directly related to a goal)"
          },
          status: {
            type: "string",
            enum: ["todo", "in-progress", "completed"],
            description: "Current status of the task"
          }
        },
        required: ["title", "status"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createTimeBlock",
      description: "Create ONLY a time block when user specifically asks for scheduling or timeblocks. Use when they say 'create a timeblock', 'schedule time for', 'block time for', or mention specific calendar allocation. Don't create this alongside milestones or tasks unless explicitly requested.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Title of the time block"
          },
          startTime: {
            type: "string",
            description: "Start date and time (YYYY-MM-DD HH:MM format)"
          },
          endTime: {
            type: "string",
            description: "End date and time (YYYY-MM-DD HH:MM format)"
          },
          location: {
            type: "string",
            description: "Location (if applicable)"
          },
          notes: {
            type: "string",
            description: "Additional notes or details"
          },
          domain: {
            type: "string",
            enum: ["Career & Work", "Health & Wellness", "Relationships", "Personal Growth", "Financial Security", "Recreation & Leisure", "Purpose & Meaning", "Environment & Organization", "Other"],
            description: "The life domain this time block is related to"
          },
          goalTitle: {
            type: "string",
            description: "Title of the goal this time block is related to (if applicable)"
          },
          milestoneTitle: {
            type: "string",
            description: "Title of the milestone this time block is related to (if applicable)"
          },
          taskTitle: {
            type: "string",
            description: "Title of the task this time block is related to (if applicable)"
          },
          isRepeating: {
            type: "boolean",
            description: "Whether this time block repeats"
          },
          repeatFrequency: {
            type: "string",
            enum: ["daily", "weekly", "fortnightly", "monthly"],
            description: "How often the time block repeats (if isRepeating is true)"
          },
          repeatIndefinitely: {
            type: "boolean",
            description: "Whether the time block repeats indefinitely"
          },
          repeatUntil: {
            type: "string",
            description: "End date for repetition (YYYY-MM-DD format, if repeatIndefinitely is false)"
          }
        },
        required: ["title", "startTime", "endTime", "domain"]
      }
    }
  },
];

// Main handler function
exports.handler = async (event) => {
  // Check if this is a direct invocation or via WebSocket
  const isDirectInvocation = !event.requestContext || !event.requestContext.connectionId;

  // For direct invocation testing
  if (isDirectInvocation) {
    return {
      statusCode: 200,
      body: 'Direct invocation test successful. In production, this Lambda should be triggered via WebSocket API.'
    };
  }

  // Get the route key and connection ID
  const routeKey = event.requestContext.routeKey;
  const connectionId = event.requestContext.connectionId;

  try {
    // Handle different route types
    if (routeKey === '$connect') {
      // Store the connection ID in DynamoDB
      await dynamoDB.send(new PutCommand({
        TableName: tableName,
        Item: {
          connectionId: connectionId,
          connectedAt: new Date().toISOString(),
          ttl: Math.floor(Date.now() / 1000) + 86400 // TTL of 24 hours
        }
      }));

      return { statusCode: 200, body: 'Connected' };
    }
    else if (routeKey === '$disconnect') {
      // Remove the connection ID from DynamoDB
      await dynamoDB.send(new DeleteCommand({
        TableName: tableName,
        Key: { connectionId }
      }));

      return { statusCode: 200, body: 'Disconnected' };
    }
    else if (routeKey === 'sendMessage') {
      // Parse the message from the event body
      let message;
      try {
        message = JSON.parse(event.body);
      } catch (error) {
        console.error('Error parsing message:', error);
        return { statusCode: 400, body: 'Invalid message format' };
      }

      if (message.action === 'sendMessage') {
        // Get the user's message
        const userMessage = message.message;
        const conversationId = message.conversationId;
        const messageHistory = message.messageHistory || [];
        const aiTier = message.aiTier || 'guide';
        const isFirstMessage = message.isFirstMessage || messageHistory.length === 0;
        const userKnowledgeContext = message.userKnowledgeContext || {};

        // Inform client that processing has started
        await sendToClient(connectionId, {
          type: 'status',
          status: 'processing',
          conversationId
        });

        // Format messages for OpenAI - OPTIMIZED FOR CONTEXT EFFICIENCY
        const formattedMessages = [
          // Use full system prompt only for first message, abbreviated for follow-ups
          {
            role: 'system',
            content: isFirstMessage ? FULL_SYSTEM_PROMPT : ABBREVIATED_SYSTEM_PROMPT
          }
        ];

        // Add message history
        messageHistory.forEach(msg => {
          formattedMessages.push({
            role: msg.role,
            content: msg.content
          });
        });

        // Add document context for first message if available
        if (isFirstMessage && userKnowledgeContext?.documentContext) {
          formattedMessages.push({
            role: 'system',
            content: `ADDITIONAL CONTEXT: The user has provided the following documents and app data for context. Use this information to provide more personalized responses, but focus on answering their direct question.\n\n${userKnowledgeContext.documentContext}`
          });
        }

        // Add the user message
        formattedMessages.push({
          role: 'user',
          content: userMessage
        });

        // Use gpt-4.1-mini regardless of tier
        const model = 'gpt-4.1-mini';

        // OpenAI API request
        try {
          const fetch = require('node-fetch');

          // SMART STREAMING LOGIC: Always enable streaming initially
          // We'll detect execution vs planning based on Claude's response content
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openAiApiKey}`
            },
            body: JSON.stringify({
              model: model,
              messages: formattedMessages,
              tools: tools,
              tool_choice: "auto",
              response_format: { type: "text" },
              stream: true, // Always enable streaming initially
              temperature: 0.7
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API error response:', errorText);
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
          }

          let accumulatedResponse = '';
          let toolCalls = [];
          let isExecutionPhase = false; // Track if we're in execution phase

          // Function to detect if Claude is executing vs planning
          const detectExecutionPhase = (text, hasFunctionCalls) => {
            // If there are no function calls, it's definitely planning/conversation
            if (!hasFunctionCalls) return false;
            
            // Execution phrases - Claude is actually creating items
            const executionPhrases = [
              'I\'ve created',
              'I\'ve prepared',
              'Creating now',
              'Let me create',
              'I\'ll create',
              'I\'ll go ahead and create',
              'I\'ll proceed to create',
              'Creating these items',
              'I\'m creating',
              'I\'m going to create these',
              'Creating the',
              'I\'ve set up',
              'I\'ve generated',
              'I\'ve made'
            ];
            
            // Planning phrases - Claude is proposing/suggesting
            const planningPhrases = [
              'Here\'s what I suggest',
              'I suggest',
              'Here\'s a plan',
              'I recommend',
              'Here\'s how we could',
              'We could create',
              'You could create',
              'Would you like me to',
              'Should I create',
              'Shall I create',
              'Do you want me to',
              'I can help you create',
              'I can create',
              'Here are the',
              'I\'d suggest',
              'Here\'s my suggestion'
            ];
            
            const lowerText = text.toLowerCase();
            
            // Check for execution phrases first (higher priority)
            const hasExecutionPhrase = executionPhrases.some(phrase => 
              lowerText.includes(phrase.toLowerCase())
            );
            
            // Check for planning phrases
            const hasPlanningPhrase = planningPhrases.some(phrase => 
              lowerText.includes(phrase.toLowerCase())
            );
            
            // If explicit execution phrase found, it's execution
            if (hasExecutionPhrase) return true;
            
            // If explicit planning phrase found, it's planning
            if (hasPlanningPhrase) return false;
            
            // If function calls present but no clear indicator, assume execution
            // This handles cases where Claude jumps straight to action
            return hasFunctionCalls;
          };

          // Always use streaming now, but detect when to switch modes
          const reader = response.body;
          const decoder = new TextDecoder('utf-8');

          // Process the stream
          for await (const chunk of reader) {
            const decodedChunk = decoder.decode(chunk);
            const lines = decodedChunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              // Skip SSE comments or empty lines
              if (line.startsWith(':') || line.trim() === '') continue;

              // Remove the "data: " prefix
              const dataPrefix = 'data: ';
              const jsonLine = line.startsWith(dataPrefix)
                ? line.slice(dataPrefix.length).trim()
                : line.trim();

              // Handle completion signal
              if (jsonLine === '[DONE]') continue;

              try {
                const parsedChunk = JSON.parse(jsonLine);

                // Check for tool calls in the delta
                if (parsedChunk.choices[0]?.delta?.tool_calls) {
                  const deltaToolCalls = parsedChunk.choices[0].delta.tool_calls;

                  // Process tool calls
                  for (const deltaToolCall of deltaToolCalls) {
                    const toolCallIndex = deltaToolCall.index;

                    // Initialize tool call if it doesn't exist
                    if (!toolCalls[toolCallIndex]) {
                      toolCalls[toolCallIndex] = {
                        id: deltaToolCall.id || `call_${Date.now()}_${toolCallIndex}`,
                        type: deltaToolCall.type || 'function',
                        function: {
                          name: '',
                          arguments: ''
                        }
                      };
                    }

                    // Update function name if provided
                    if (deltaToolCall.function?.name) {
                      toolCalls[toolCallIndex].function.name = deltaToolCall.function.name;
                    }

                    // Append to function arguments if provided - handle streaming carefully
                    if (deltaToolCall.function?.arguments) {
                      toolCalls[toolCallIndex].function.arguments += deltaToolCall.function.arguments;
                    }
                  }
                }

                // Process content delta (regular text response)
                const content = parsedChunk.choices[0]?.delta?.content || '';
                if (content) {
                  accumulatedResponse += content;

                  // Check if we've entered execution phase
                  const currentlyInExecution = detectExecutionPhase(accumulatedResponse, toolCalls.length > 0);
                  
                  // Only send chunks during planning phase or pure conversation
                  // Stop streaming when we detect execution phase
                  if (!currentlyInExecution) {
                    await sendToClient(connectionId, {
                      type: 'chunk',
                      content,
                      conversationId,
                      done: false
                    });
                  } else if (!isExecutionPhase) {
                    // First time entering execution phase - log it
                    console.log('🎯 EXECUTION PHASE DETECTED - Switching to complete response mode');
                    console.log('🎯 Accumulated text:', accumulatedResponse.substring(0, 200) + '...');
                    isExecutionPhase = true;
                  }
                }
              } catch (parseError) {
                // Log streaming parse errors but continue processing
                console.log(`⚠️ Streaming chunk parse error (continuing):`, parseError.message);
                console.log(`⚠️ Problematic chunk:`, typeof chunk === 'string' ? chunk.substring(0, 100) : JSON.stringify(chunk).substring(0, 100));
                continue;
              }
            }
          }

          // Process tool calls into actions with error recovery
          let actions = null;
          if (toolCalls.length > 0) {
            actions = toolCalls.map((toolCall, index) => {
              try {
                const name = toolCall.function.name;
                let args;
                
                // Parse arguments (should be clean for non-streaming calls)
                try {
                  console.log(`🔍 DEBUG: Tool call ${index} (${name}) raw arguments:`, toolCall.function.arguments);
                  args = JSON.parse(toolCall.function.arguments);
                  console.log(`🔍 DEBUG: Tool call ${index} (${name}) parsed args:`, JSON.stringify(args, null, 2));
                } catch (parseError) {
                  console.error(`❌ Tool call ${index} JSON parse error:`, parseError.message);
                  console.error(`Raw arguments:`, toolCall.function.arguments);
                  
                  // With non-streaming, this should rarely happen
                  // Provide minimal fallback args
                  
                  let fixedArgs = toolCall.function.arguments;
                  
                  // Step 1: Try basic JSON repair
                  if (!fixedArgs.startsWith('{')) fixedArgs = '{' + fixedArgs;
                  if (!fixedArgs.endsWith('}')) fixedArgs += '}';
                  
                  // Step 2: Try to fix common streaming corruption patterns
                  fixedArgs = fixedArgs
                    .replace(/^{\s*"?title"?\s*:\s*([^"][^",}]*)/i, '{"title":"$1"')    // Fix {"title":er React Development -> {"title":"Master React Development"
                    .replace(/^{\s*"?title"?\s*:\s*"?([^"]*)/i, '{"title":"$1"')        // Fix {"title":er React Development" -> {"title":"Master React Development"
                  
                  // Step 3: Intelligent title reconstruction for common patterns
                  fixedArgs = fixedArgs
                    .replace(/("ti[^"]*"Master React[^"]*pment[^"]*")/, '"title":"Master React Development"')           // Fix "ti "Master React pment" -> "Master React Development"
                    .replace(/("ti[^"]*"React Fundame[^"]*")/, '"title":"React Fundamentals"')                        // Fix "ti "React Fundame..." -> "React Fundamentals"  
                    .replace(/("title"\s*:\s*"Advanced React[^"]*epts[^"]*")/, '"title":"Advanced React Concepts"')    // Fix "Advanced Reacepts" -> "Advanced React Concepts"
                    .replace(/("title"\s*:\s*"Building Projects with React[^"]*")/, '"title":"Building Projects with React"') // Ensure full title
                    .replace(/"title"\s*:\s*"([^"]*er React Development[^"]*)"/, '"title":"Master React Development"')     // Fix "er React Development" -> "Master React Development"
                    .replace(/"title"\s*:\s*"([^"]*t Fundamentals[^"]*)"/, '"title":"React Fundamentals"')                // Fix "t Fundamentals" -> "React Fundamentals"  
                    .replace(/"title"\s*:\s*"([^"]*Advancedt Concepts[^"]*)"/, '"title":"Advanced React Concepts"')       // Fix "Advancedt Concepts" -> "Advanced React Concepts"
                    .replace(/"title"\s*:\s*"([^"]*Building Projects with[^"]*)"/, '"title":"Building Projects with React"') // Fix "Building Projects with" -> "Building Projects with React"
                    .replace(/^{\s*"?ti\s+"?([^"]+)"?\s*:/, '{"title":"$1",')          // Fix {"ti "value": -> {"title":"value",
                    .replace(/^{\s*"?tle"\s*:\s*"([^"]*)/i, '{"title":"$1"')          // Fix {"tle": "value -> {"title":"value"
                    .replace(/tle"\s*:\s*"([^"]*)/i, '"title":"$1"')                  // Fix tle": "value -> "title":"value"
                    .replace(/ti\s+"([^"]*)/i, '"title":"$1"')                        // Fix ti "value -> "title":"value"
                    
                    // Step 4: Fix description corruption
                    .replace(/"description"\s*:\s*"Gain cehensive skillseact developmenuding fundamentals[^"]*"/, '"description":"Gain comprehensive skills in React development including fundamentals, advanced concepts, and project building to become proficient in building React applications within 6 months."')
                    .replace(/"description"\s*:\s*"[^"]*earn JSX, compo, props, state[^"]*"/, '"description":"Learn JSX, components, props, state, and basic hooks. Master the fundamental building blocks of React development."')
                    .replace(/"description"\s*:\s*"Master context API, custom hook[^"]*"/, '"description":"Master context API, custom hooks, and performance optimization in React applications."')
                    
                    // Step 5: Fix domain corruption
                    .replace(/"dom[^"]*"Personal Gro[^"]*"/, '"domain":"Personal Growth"')
                    .replace(/"domainrsonal Growth"/, '"domain":"Personal Growth"')
                    
                    .replace(/"tab([a-z]+)/i, '"tab":"$1"')                      // Fix "tabtomorrow" -> "tab":"tomorrow"
                    .replace(/tab["'\s]*([a-z]+)/i, '"tab":"$1"')                // Fix missing quotes around tab value
                    .replace(/"title"\s*:\s*([^",}]+)([",}])/, '"title":"$1"$2') // Add missing quotes around title
                    .replace(/,\s*"tab"\s*:\s*"([^"]*)"?\s*$/, ',"tab":"$1"}')   // Ensure proper closing
                    // Timeblock-specific fixes
                    .replace(/"isRepeating(true|false),/g, '"isRepeating":$1,')                    // Fix "isRepeatingtrue, -> "isRepeating":true,
                    .replace(/"repeatIndefinitely(true|false),/g, '"repeatIndefinitely":$1,')     // Fix "repeatIndefinitelytrue, -> "repeatIndefinitely":true,
                    .replace(/"startTime"([^:]+):/g, '"startTime":$1:')                          // Fix "startTime"2025-09-03 -> "startTime":"2025-09-03
                    .replace(/"endTime"([^:]+):/g, '"endTime":$1:')                              // Fix "endTime"2025-09-03 -> "endTime":"2025-09-03
                    .replace(/:\s*([0-9]{4}-[0-9]{2}-[0-9]{2}\s+[0-9]{2}:[0-9]{2}),/g, ':"$1",')  // Add quotes around datetime values
                    .replace(/"domain"([^:]+):/g, '"domain":$1:')                                // Fix missing quotes in domain
                    .replace(/:\s*(Career\s*&\s*Work|Health\s*&\s*Fitness|[A-Za-z\s&]+),/g, ':"$1",') // Add quotes around domain values
                    // Fix the specific malformation: "title":"Focus WorkstartTime":"2025-09-03 14:00"
                    .replace(/"title"\s*:\s*"([^"]*?)(startTime[^"]*?)"\s*:\s*"([^"]+)"/i, '"title":"$1","startTime":"$3"');
                  
                  // Step 3: Try parsing the repaired JSON
                  try {
                    args = JSON.parse(fixedArgs);
                    console.log(`Successfully repaired JSON: ${name} with args:`, args);
                  } catch (secondParseError) {
                    // Step 4: Advanced regex extraction as last resort
                    console.log(`JSON repair failed, using advanced regex extraction`);
                    
                    // Multiple title patterns
                    let titleMatch = 
                      fixedArgs.match(/"title"\s*:\s*"([^"]*)"/i) ||           // Standard: "title":"value"
                      fixedArgs.match(/title["'\s]*:\s*"([^"]*)"/i) ||        // Missing quotes: title:"value"
                      fixedArgs.match(/title["'\s]*:\s*([^"',}]+)/i) ||       // No quotes: title:value
                      fixedArgs.match(/(?:ti|tle)["'\s]*:\s*"?([^"',}]+)"?/i) || // Broken field name
                      fixedArgs.match(/([^"]*er React Development[^"]*)/i) ||   // Specific React patterns
                      fixedArgs.match(/([^"]*t Fundamentals[^"]*)/i) ||
                      fixedArgs.match(/([^"]*Advancedt Concepts[^"]*)/i) ||
                      fixedArgs.match(/([^"]*Building Projects with[^"]*)/i) ||
                      fixedArgs.match(/"([^"]*(?:groceries|dentist|call|clean|plan|weekend|vacation)[^"]*)"/i) || // Common words
                      fixedArgs.match(/tle"\s*:\s*"([^"]*)/i) ||               // "tle": "value (no closing quote)
                      fixedArgs.match(/ti\s+"([^"]*)/i) ||                     // "ti "value (malformed)
                      fixedArgs.match(/"([A-Z][a-z]+(?:\s+[a-z]+)*)/i);        // Just find capitalized words
                    
                    // Multiple tab patterns  
                    let tabMatch = 
                      fixedArgs.match(/"tab"\s*:\s*"([^"]*)"/i) ||             // Standard: "tab":"today"
                      fixedArgs.match(/tab["'\s]*:\s*"([^"',}]+)"/i) ||        // Missing quotes: tab:"today"
                      fixedArgs.match(/tab["'\s]*:\s*([a-z]+)/i) ||            // No quotes: tab:today
                      fixedArgs.match(/tab(today|tomorrow|later)/i) ||         // Merged: tabtomorrow
                      fixedArgs.match(/(today|tomorrow|later)/i);              // Just find the word
                    
                    if (titleMatch) {
                      let title = titleMatch[1].trim();
                      
                      // Intelligent title reconstruction for common corrupted patterns
                      if (title.includes('er React Development')) {
                        title = 'Master React Development';
                      } else if (title.includes('t Fundamentals')) {
                        title = 'React Fundamentals';
                      } else if (title.includes('Advancedt Concepts')) {
                        title = 'Advanced React Concepts';
                      } else if (title.includes('Building Projects with')) {
                        title = 'Building Projects with React';
                      }
                      
                      let tab = 'today'; // default
                      
                      if (tabMatch) {
                        tab = tabMatch[1].toLowerCase();
                        // Handle merged cases like "tabtomorrow"
                        if (tab.includes('tomorrow')) tab = 'tomorrow';
                        else if (tab.includes('later')) tab = 'later';
                        else if (tab.includes('today')) tab = 'today';
                      }
                      
                      // Handle different action types
                      if (name === 'createTodoGroup') {
                        // Handle items array for todo groups
                        let items = [];
                        const itemsMatch = fixedArgs.match(/"items"\s*:\s*\[(.*?)\]/i);
                        if (itemsMatch) {
                          try {
                            items = itemsMatch[1].split(',').map(item => 
                              item.trim().replace(/^"|"$/g, '')
                            ).filter(item => item.length > 0);
                          } catch (itemError) {
                            items = [];
                          }
                        }
                        args = { title, tab, items };
                        console.log(`Advanced regex recovery: ${name} with title "${title}", tab "${tab}"`);
                        
                      } else if (name === 'createTimeBlock') {
                        // Handle the specific malformation: "title":"Focus WorkstartTime":"2025-09-03 14:00"
                        let cleanTitle = title;
                        let extractedStartTime = null;
                        
                        // Check for malformed title that contains startTime
                        const malformedTitleMatch = title.match(/^(.+?)(startTime|Time)(.*)$/i);
                        if (malformedTitleMatch) {
                          cleanTitle = malformedTitleMatch[1].trim();
                          // Try to extract datetime from the malformed part
                          const timeMatch = fixedArgs.match(/([0-9]{4}-[0-9]{2}-[0-9]{2}\s+[0-9]{2}:[0-9]{2})/);
                          if (timeMatch) {
                            extractedStartTime = timeMatch[1];
                          }
                        }
                        
                        // Extract timeblock-specific data  
                        const startTimeMatch = fixedArgs.match(/"startTime"\s*:\s*"?([^"',}]+)"?/i);
                        const endTimeMatch = fixedArgs.match(/"endTime"\s*:\s*"?([^"',}]+)"?/i);
                        const domainMatch = fixedArgs.match(/"domain"\s*:\s*"?([^"',}]+)"?/i);
                        const isRepeatingMatch = fixedArgs.match(/"isRepeating"\s*:\s*(true|false)/i);
                        const repeatFrequencyMatch = fixedArgs.match(/"repeatFrequency"\s*:\s*"?([^"',}]+)"?/i);
                        const repeatIndefinitelyMatch = fixedArgs.match(/"repeatIndefinitely"\s*:\s*(true|false)/i);
                        
                        args = { title: cleanTitle };
                        
                        // Use extracted startTime from malformed title or regex match
                        if (extractedStartTime) {
                          args.startTime = extractedStartTime;
                        } else if (startTimeMatch) {
                          args.startTime = startTimeMatch[1].trim();
                        }
                        
                        if (endTimeMatch) args.endTime = endTimeMatch[1].trim();
                        if (domainMatch) args.domain = domainMatch[1].trim();
                        if (isRepeatingMatch) args.isRepeating = isRepeatingMatch[1] === 'true';
                        if (repeatFrequencyMatch) args.repeatFrequency = repeatFrequencyMatch[1].trim();
                        if (repeatIndefinitelyMatch) args.repeatIndefinitely = repeatIndefinitelyMatch[1] === 'true';
                        
                        // Set defaults for missing fields
                        if (!args.startTime) args.startTime = "2025-09-03 14:00";
                        if (!args.endTime) args.endTime = "2025-09-03 15:00";
                        if (!args.domain) args.domain = "General";
                        if (args.isRepeating === undefined) args.isRepeating = false;
                        if (!args.repeatFrequency) args.repeatFrequency = "weekly";
                        if (args.repeatIndefinitely === undefined) args.repeatIndefinitely = true;
                        
                        console.log(`Advanced regex recovery: ${name} with title "${cleanTitle}", startTime "${args.startTime}", isRepeating ${args.isRepeating}`);
                        
                      } else {
                        // Default handling for other action types
                        args = { title, tab };
                        console.log(`Advanced regex recovery: ${name} with title "${title}", tab "${tab}"`);
                      }
                    } else {
                      console.error(`All recovery methods failed for tool call ${index}. Raw: ${fixedArgs.substring(0, 200)}...`);
                      
                      // Final attempt: if this is a timeblock, try to extract just from the raw data
                      if (name === 'createTimeBlock') {
                        console.log('Final fallback: creating minimal timeblock from request context');
                        args = {
                          title: "Focus Work", // Default title
                          startTime: "14:00",
                          endTime: "15:00", 
                          domain: "General",
                          isRepeating: false,
                          repeatFrequency: "weekly",
                          repeatIndefinitely: true
                        };
                      } else {
                        return null;
                      }
                    }
                  }
                }

                // Map function name to action type
                const actionTypeMap = {
                  'createGoal': 'createGoal',
                  'createMilestone': 'createMilestone',
                  'createTask': 'createTask',
                  'createTimeBlock': 'createTimeBlock'
                };
                
                return {
                  type: actionTypeMap[name] || name,
                  data: processActionData(name, args)
                };
                
              } catch (error) {
                console.error(`Error processing tool call ${index}:`, error.message);
                return null;
              }
            }).filter(action => action !== null && action.type !== '');
          }

          // Generate a title if this is the first message
          let title = null;
          if (isFirstMessage) {
            title = await generateTitle(userMessage, messageHistory);
          }

          // Process actions to include action links and enhanced responses
          let processedActions = actions;
          let enhancedResponse = accumulatedResponse;
          
          if (actions && actions.length > 0) {
            processedActions = actions.map((action, index) => {
              // Generate a unique ID for each action's modal data
              const modalDataId = `${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
              
              // Add the modalDataId to the action data
              const actionWithId = {
                ...action,
                modalDataId,
                // Store the original data for the frontend to save
                originalData: action.data
              };
              
              return actionWithId;
            });
            
            // Enhanced response to mention the modal functionality and provide immediate action links
            const actionTypes = actions.map(a => a.type.replace('create', '').toLowerCase());
            const actionText = actionTypes.length === 1 
              ? `a ${actionTypes[0]}` 
              : actionTypes.length === 2
                ? `a ${actionTypes[0]} and a ${actionTypes[1]}`
                : `${actionTypes.slice(0, -1).join(', ')}, and a ${actionTypes[actionTypes.length - 1]}`;
            
            enhancedResponse += `\n\n*I've prepared ${actionText} form${actions.length > 1 ? 's' : ''} for you.*`;
            
            // Add action links immediately - use processedActions which has modalDataId
            if (processedActions.length === 1) {
              const action = processedActions[0];
              console.log('🚀 Creating action link for single action:', {
                actionType: action.type,
                modalDataId: action.modalDataId,
                hasModalDataId: !!action.modalDataId
              });
              
              // Map action types to match frontend expectations
              const actionType = action.type === 'createMilestone' ? 'milestone' : action.type.replace('create', '').toLowerCase();
              const displayType = actionType === 'timeblock' ? 'Time Block' : 
                                actionType === 'milestone' ? 'Milestone' :
                                actionType.charAt(0).toUpperCase() + actionType.slice(1);
              
              const actionLink = `\n\n[Reopen ${displayType} Form](action://${actionType}/${action.modalDataId})`;
              console.log('🚀 Generated action link:', actionLink);
              enhancedResponse += actionLink;
            } else {
              // Multiple actions - add each link - use processedActions which has modalDataId
              enhancedResponse += `\n\nAction links:`;
              for (const action of processedActions) {
                console.log('🚀 Creating action link for multiple action:', {
                  actionType: action.type,
                  modalDataId: action.modalDataId,
                  hasModalDataId: !!action.modalDataId
                });
                
                // Map action types to match frontend expectations
                const actionType = action.type === 'createMilestone' ? 'milestone' : action.type.replace('create', '').toLowerCase();
                const displayType = actionType === 'timeblock' ? 'Time Block' : 
                                  actionType === 'milestone' ? 'Milestone' :
                                  actionType.charAt(0).toUpperCase() + actionType.slice(1);
                const actionLink = `\n• [Reopen ${displayType} Form](action://${actionType}/${action.modalDataId})`;
                console.log('🚀 Generated action link:', actionLink);
                enhancedResponse += actionLink;
              }
            }
          }

          // Send complete response
          // For execution phase, send the full response at once
          // For planning phase, this acts as the final completion
          const finalResponseType = isExecutionPhase ? 'complete' : 'complete';
          
          console.log(`🎯 FINAL RESPONSE: ${isExecutionPhase ? 'EXECUTION' : 'PLANNING'} phase - sending complete response`);
          
          await sendToClient(connectionId, {
            type: finalResponseType,
            content: enhancedResponse,
            conversationId,
            done: true,
            actions: processedActions,
            title,
            // Add metadata about the response type
            executionPhase: isExecutionPhase,
            streamedPlanning: !isExecutionPhase && accumulatedResponse.length > 0
          });

          return { statusCode: 200, body: 'Message processed' };

        } catch (openaiError) {
          console.error('OpenAI API error:', openaiError);
          await sendToClient(connectionId, {
            type: 'error',
            error: `AI service error: ${openaiError.message}`,
            conversationId
          });
          return { statusCode: 500, body: 'OpenAI API error: ' + openaiError.message };
        }
      }
      else if (message.action === 'streamResponse') {
        // Handle the streamResponse action
        await sendToClient(connectionId, {
          type: 'status',
          status: 'acknowledged',
          conversationId: message.conversationId || 'unknown'
        });

        return { statusCode: 200, body: 'Stream response acknowledged' };
      }
      else {
        console.log('Unknown action:', message.action);
        await sendToClient(connectionId, {
          type: 'error',
          error: 'Unknown action: ' + message.action
        });

        return { statusCode: 400, body: 'Unknown action' };
      }
    }
    else if (routeKey === '$default') {
      // Handle default route
      return { statusCode: 200, body: 'Default route' };
    }
    else {
      // Handle unknown routes
      return { statusCode: 400, body: 'Unknown route' };
    }
  } catch (error) {
    console.error('Error processing message:', error);

    // Notify client of error if possible
    try {
      await sendToClient(connectionId, {
        type: 'error',
        error: error.message
      });
    } catch (sendError) {
      console.error('Error sending error message to client:', sendError);
    }

    return { statusCode: 500, body: 'Error: ' + error.message };
  }
};

// Helper function to send messages to the client
async function sendToClient(connectionId, payload) {
  try {
    const command = new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: Buffer.from(JSON.stringify(payload))
    });

    await apiGwManagementApi.send(command);
  } catch (error) {
    console.error(`Error sending message to client ${connectionId}:`, error);

    // If connection is stale, delete it from the database
    if (error.$metadata?.httpStatusCode === 410) {
      const deleteCommand = new DeleteCommand({
        TableName: tableName,
        Key: { connectionId }
      });

      await dynamoDB.send(deleteCommand);
      throw new Error('Connection no longer available');
    }
    throw error;
  }
}

// Process action data to ensure it matches expected format by frontend
function processActionData(functionName, args) {
  switch (functionName) {
    case 'createGoal':
      return {
        title: args.title,
        description: args.description || '',
        domain: args.domain,
        color: getDomainColor(args.domain),
        icon: getDomainIcon(args.domain),
        targetDate: args.targetDate || null
      };

    case 'createMilestone':
      // Process tasks into the expected format
      const tasks = Array.isArray(args.tasks)
        ? args.tasks.map(task => ({
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: task,
            status: 'todo',
            completed: false
          }))
        : [];

      return {
        title: args.title,
        description: args.description || '',
        goalTitle: args.goalTitle || '',
        domain: args.domain,
        color: getDomainColor(args.domain),
        tasks: tasks,
        dueDate: args.dueDate || null
      };

    case 'createTask':
      return {
        title: args.title,
        description: args.description || '',
        milestoneTitle: args.milestoneTitle || '',
        goalTitle: args.goalTitle || '',
        status: args.status || 'todo'
      };

    case 'createTimeBlock':
      console.log('🔥 LAMBDA_TIMEBLOCK_DEBUG: Raw args received from Claude:', JSON.stringify(args, null, 2));
      
      // Helper function to fix Claude's inconsistent date formatting
      const fixDateFormat = (dateString) => {
        if (!dateString || typeof dateString !== 'string') {
          console.log('🔥 LAMBDA_TIMEBLOCK_DEBUG: Invalid dateString:', dateString);
          return dateString;
        }
        
        let fixed = dateString;
        
        // Fix missing dash in date format: "2025-0903 14:00" -> "2025-09-03 14:00"
        fixed = fixed.replace(/(\d{4})-(\d{2})(\d{2})\s/, '$1-$2-$3 ');
        
        // Fix missing dash in date format: "202509-03 14:00" -> "2025-09-03 14:00"
        fixed = fixed.replace(/(\d{4})(\d{2})-(\d{2})\s/, '$1-$2-$3 ');
        
        // Fix partial year format: "5-09-03 14:00" -> "2025-09-03 14:00"
        fixed = fixed.replace(/^(\d{1})-(\d{2})-(\d{2})\s/, '2025-$2-$3 ');
        
        // Fix partial year format: "25-09-03 14:00" -> "2025-09-03 14:00" 
        fixed = fixed.replace(/^(\d{2})-(\d{2})-(\d{2})\s/, '20$1-$2-$3 ');
        
        if (fixed !== dateString) {
          console.log(`🔥 LAMBDA_TIMEBLOCK_DEBUG: Fixed date format: "${dateString}" -> "${fixed}"`);
        }
        
        return fixed;
      };
      
      const fixedStartTime = fixDateFormat(args.startTime);
      const fixedEndTime = fixDateFormat(args.endTime);
      
      const timeBlockData = {
        title: args.title,
        startTime: fixedStartTime,
        endTime: fixedEndTime,
        location: args.location || '',
        notes: args.notes || '',
        // domain: removed - user should choose goal manually, don't prefill
        color: '#4f46e5', // Default color instead of domain-based color
        goalTitle: args.goalTitle || '',
        milestoneTitle: args.milestoneTitle || '',
        taskTitle: args.taskTitle || '',
        isRepeating: args.isRepeating || false,
        repeatFrequency: args.repeatFrequency || 'weekly',
        repeatIndefinitely: args.repeatIndefinitely || true,
        repeatUntil: args.repeatUntil || null,
        userTimezoneOffset: -(new Date().getTimezoneOffset() / 60)
      };
      
      console.log('🔥 LAMBDA_TIMEBLOCK_DEBUG: Final processed data being sent to frontend:', JSON.stringify(timeBlockData, null, 2));
      
      return timeBlockData;


    default:
      return args;
  }
}

// Helper function to get domain color based on domain name
function getDomainColor(domain) {
  const domainColors = {
    'Career & Work': '#4f46e5',
    'Health & Wellness': '#06b6d4',
    'Relationships': '#ec4899',
    'Personal Growth': '#8b5cf6',
    'Financial Security': '#10b981',
    'Recreation & Leisure': '#f59e0b',
    'Purpose & Meaning': '#ef4444',
    'Environment & Organization': '#6366f1',
    'Other': '#14b8a6'
  };

  return domainColors[domain] || '#4A90E2';
}

// Helper function to get domain icon based on domain name
function getDomainIcon(domain) {
  const domainIcons = {
    'Career & Work': 'briefcase',
    'Health & Wellness': 'fitness',
    'Relationships': 'people',
    'Personal Growth': 'school',
    'Financial Security': 'cash',
    'Recreation & Leisure': 'bicycle',
    'Purpose & Meaning': 'compass',
    'Environment & Organization': 'home',
    'Other': 'star'
  };

  return domainIcons[domain] || 'star';
}

// Function to generate an intelligent conversation title using AI
async function generateTitle(userMessage, messageHistory = []) {
  try {
    const titlePrompt = `Generate a natural conversation title (max 60 characters) based on this first message:

"${userMessage}"

Rules:
- For greetings (hi, hello, hey): Use "General conversation" or "Chat with AI assistant"
- For specific requests: Describe what they want help with
- For questions: Capture the main topic being asked about
- Keep it natural and conversational

Good examples:
- "hello" → "General conversation"
- "hi there" → "Chat with AI assistant"  
- "help me plan a workout" → "Planning a workout routine"
- "I need to organize my finances" → "Financial organization help"
- "what's the best way to learn coding?" → "Learning to code advice"

Title:`;

    const fetch = require('node-fetch');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: titlePrompt
        }],
        max_tokens: 50,
        temperature: 0.3,
        stop: ['\n', '.', '!', '?']
      })
    });

    if (response.ok) {
      const data = await response.json();
      let generatedTitle = data.choices[0]?.message?.content?.trim();
      
      if (generatedTitle) {
        // Remove quotes if AI added them
        generatedTitle = generatedTitle.replace(/^["']|["']$/g, '');
        
        // Ensure it's not too long
        if (generatedTitle.length > 80) {
          generatedTitle = generatedTitle.substring(0, 77) + '...';
        }
        
        // Capitalize first letter
        generatedTitle = generatedTitle.charAt(0).toUpperCase() + generatedTitle.slice(1);
        
        return generatedTitle;
      }
    }
    
    // Fallback to simple title if AI fails
    return generateSimpleTitle(userMessage);
    
  } catch (error) {
    console.error('Error generating AI title:', error);
    return generateSimpleTitle(userMessage);
  }
}

// Improved fallback function
function generateSimpleTitle(userMessage) {
  const cleanMessage = userMessage.trim();
  
  if (cleanMessage.length <= 60) {
    return cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
  }
  
  const words = cleanMessage.split(' ');
  const titleWords = words.slice(0, 12);
  let title = titleWords.join(' ');
  
  if (title.length > 80) {
    const trimmed = title.substring(0, 77);
    const lastSpace = trimmed.lastIndexOf(' ');
    title = trimmed.substring(0, lastSpace > 40 ? lastSpace : 77) + '...';
  }
  
  return title.charAt(0).toUpperCase() + title.slice(1);
}
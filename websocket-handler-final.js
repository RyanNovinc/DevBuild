// Final WebSocket Message Handler for LifeCompass
// Original working system prompt + Smart Buffering fix + Clean code structure

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');

// Initialize AWS clients
const ddbClient = new DynamoDBClient({ region: 'ap-southeast-2' });
const dynamoDB = DynamoDBDocumentClient.from(ddbClient);
const apiGwEndpoint = process.env.WEBSOCKET_API_ENDPOINT || '';
const endpoint = apiGwEndpoint.startsWith('http') ? apiGwEndpoint : `https://${apiGwEndpoint}`;
const apiGwManagementApi = new ApiGatewayManagementApiClient({ endpoint });

const openAiApiKey = process.env.OPENAI_API_KEY;
const tableName = 'ai-websocket-connections';

// ORIGINAL WORKING SYSTEM PROMPT (keeps all context intelligence)
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
- ALWAYS include all specified fields: dates, domains, tasks
- ALWAYS extract task details from user examples and create properly structured task objects
- CALCULATE dates accurately from today's date (${new Date().toISOString().split('T')[0]}) when user specifies timeframes
- MATCH domains consistently between related goals and milestones
- VALIDATE that each function call contains complete, non-empty data before sending

IMPORTANT: Pay attention to the user's exact language. "Break it down" clearly indicates they want a comprehensive breakdown, not just a single item.

Always provide thoughtful guidance based on this framework and suggest creating appropriate elements when users express relevant intentions.`;

// Function definitions (comprehensive set from original)
const tools = [
  {
    "type": "function",
    "function": {
      "name": "createGoal",
      "description": "Create a new life goal with detailed information",
      "parameters": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "description": "The title of the goal"
          },
          "description": {
            "type": "string",
            "description": "Detailed description of the goal, what it means to achieve it, why it matters"
          },
          "domain": {
            "type": "string", 
            "enum": [
              "Career & Work",
              "Health & Wellness", 
              "Relationships",
              "Personal Growth",
              "Financial Security",
              "Recreation & Leisure",
              "Purpose & Meaning",
              "Community & Environment"
            ],
            "description": "The life domain this goal belongs to - choose the most appropriate domain from the available options"
          },
          "targetDate": {
            "type": "string",
            "format": "date",
            "description": "Target completion date in YYYY-MM-DD format"
          }
        },
        "required": ["title", "description", "domain"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "createMilestone",
      "description": "Create a milestone/project, either standalone or linked to a goal",
      "parameters": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "description": "The title of the milestone"
          },
          "description": {
            "type": "string", 
            "description": "Detailed description of what this milestone involves and what completion looks like"
          },
          "goalTitle": {
            "type": "string",
            "description": "Title of the parent goal (leave empty for standalone milestone)"
          },
          "dueDate": {
            "type": "string",
            "format": "date", 
            "description": "Due date for the milestone in YYYY-MM-DD format"
          },
          "color": {
            "type": "string",
            "description": "Hex color for the milestone (should match parent goal if applicable)"
          },
          "priority": {
            "type": "string",
            "enum": ["low", "medium", "high"],
            "description": "Priority level for the milestone"
          },
          "tasks": {
            "type": "array",
            "description": "Array of tasks to be completed for this milestone",
            "items": {
              "type": "object",
              "properties": {
                "title": {
                  "type": "string",
                  "description": "Task title - should be clear and actionable"
                },
                "description": {
                  "type": "string", 
                  "description": "Detailed description of what needs to be done"
                },
                "priority": {
                  "type": "string",
                  "enum": ["low", "medium", "high"],
                  "description": "Priority level for this task"
                },
                "estimatedMinutes": {
                  "type": "integer",
                  "description": "Estimated time to complete in minutes"
                },
                "dueDate": {
                  "type": "string",
                  "format": "date",
                  "description": "Due date for this specific task in YYYY-MM-DD format"
                }
              },
              "required": ["title", "description"]
            }
          }
        },
        "required": ["title", "description"]
      }
    }
  },
  {
    "type": "function", 
    "function": {
      "name": "createTask",
      "description": "Create a standalone task or task linked to a goal/milestone",
      "parameters": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "description": "Clear, actionable task title"
          },
          "description": {
            "type": "string",
            "description": "Detailed description of what needs to be done"
          },
          "goalTitle": {
            "type": "string", 
            "description": "Title of parent goal (if applicable)"
          },
          "milestoneTitle": {
            "type": "string",
            "description": "Title of parent milestone (if applicable)"
          },
          "priority": {
            "type": "string",
            "enum": ["low", "medium", "high"], 
            "description": "Priority level"
          },
          "estimatedMinutes": {
            "type": "integer",
            "description": "Estimated completion time in minutes"
          },
          "dueDate": {
            "type": "string",
            "format": "date",
            "description": "Due date in YYYY-MM-DD format"
          }
        },
        "required": ["title", "description"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "createTimeBlock", 
      "description": "Create a time block for scheduling focused work",
      "parameters": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "description": "Title for the time block"
          },
          "description": {
            "type": "string",
            "description": "Description of what will be worked on"
          },
          "date": {
            "type": "string",
            "format": "date",
            "description": "Date for the time block in YYYY-MM-DD format"
          },
          "startTime": {
            "type": "string",
            "pattern": "^([0-9]|1[0-2]):[0-5][0-9] (AM|PM)$",
            "description": "Start time in 12-hour format (e.g., 9:00 AM)"
          },
          "duration": {
            "type": "integer",
            "description": "Duration in minutes"
          },
          "goalId": {
            "type": "string",
            "description": "ID of associated goal from user's context"
          },
          "milestoneId": {
            "type": "string", 
            "description": "ID of associated milestone from user's context"
          },
          "priority": {
            "type": "string",
            "enum": ["low", "medium", "high"],
            "description": "Priority level"
          },
          "isRecurring": {
            "type": "boolean",
            "description": "Whether this is a recurring time block"
          },
          "recurringFrequency": {
            "type": "string",
            "enum": ["daily", "weekly", "fortnightly", "monthly"],
            "description": "How often this repeats (if recurring)"
          }
        },
        "required": ["title", "description", "date"]
      }
    }
  }
];

// Utility: Send message to WebSocket client
const sendToClient = async (connectionId, message) => {
  try {
    await apiGwManagementApi.send(new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: JSON.stringify(message)
    }));
  } catch (error) {
    if (error.statusCode === 410) {
      console.log(`Connection ${connectionId} is stale, removing`);
      await dynamoDB.send(new DeleteCommand({
        TableName: tableName,
        Key: { connectionId }
      }));
    } else {
      console.error('Error sending to client:', error);
    }
  }
};

// SMART BUFFERING - Simple and Reliable (only change from original)
const shouldBufferResponse = (toolCalls) => {
  const hasToolCalls = toolCalls.length > 0;
  
  console.log('🎯 BUFFERING DECISION:', {
    hasToolCalls,
    decision: hasToolCalls ? 'BUFFER (function calls detected)' : 'STREAM (conversational only)',
    toolCallCount: toolCalls.length
  });
  
  // RULE: If there are function calls, always buffer for data integrity
  return hasToolCalls;
};

// Main Lambda handler
exports.handler = async (event) => {
  console.log('🚀 WebSocket Handler - Final Version (Original + Smart Buffering)');
  
  const { requestContext, body } = event;
  const { connectionId, routeKey } = requestContext;

  try {
    // Handle WebSocket lifecycle
    if (routeKey === '$connect') {
      await dynamoDB.send(new PutCommand({
        TableName: tableName,
        Item: { connectionId, timestamp: new Date().toISOString() }
      }));
      return { statusCode: 200 };
    }

    if (routeKey === '$disconnect') {
      await dynamoDB.send(new DeleteCommand({
        TableName: tableName,
        Key: { connectionId }
      }));
      return { statusCode: 200 };
    }

    // Handle messages
    if (routeKey === 'sendMessage') {
      const { message, conversationId, messageHistory, appContext } = JSON.parse(body);
      
      console.log(`📨 Processing: "${message.substring(0, 100)}..."`);

      // Build messages array with original working system prompt
      const messages = [{ role: 'system', content: FULL_SYSTEM_PROMPT }];
      
      // Add app context (FULL context preserved from original)
      if (appContext) {
        let contextText = "USER'S CURRENT LIFECOMPASS DATA:\n\n";
        
        if (appContext.goals?.length > 0) {
          contextText += `GOALS (${appContext.goals.length}):\n`;
          appContext.goals.forEach(goal => {
            contextText += `- "${goal.title}" (${goal.domain || 'No domain'})\n`;
            if (goal.description) contextText += `  Description: ${goal.description}\n`;
            if (goal.targetDate) contextText += `  Target Date: ${goal.targetDate}\n`;
          });
        }
        
        if (appContext.milestones?.length > 0) {
          contextText += `\nMILESTONES/PROJECTS (${appContext.milestones.length}):\n`;
          appContext.milestones.forEach(milestone => {
            contextText += `- "${milestone.title}"`;
            if (milestone.goalTitle) contextText += ` (under "${milestone.goalTitle}")`;
            contextText += '\n';
          });
        }
        
        if (appContext.tasks?.length > 0) {
          const activeTasks = appContext.tasks.filter(t => !t.completed);
          contextText += `\nTASKS - Active: ${activeTasks.length}, Total: ${appContext.tasks.length}\n`;
        }
        
        messages.push({ role: 'system', content: contextText });
      }

      // Add full conversation history (preserved from original)
      if (messageHistory?.length > 0) {
        const startIndex = (messageHistory[0]?.type === 'ai' && messageHistory[0].centered) ? 1 : 0;
        
        for (let i = startIndex; i < messageHistory.length; i++) {
          const msg = messageHistory[i];
          if (msg.text) {
            if (msg.type === 'user') {
              messages.push({ role: 'user', content: msg.text });
            } else if (msg.type === 'ai') {
              messages.push({ role: 'assistant', content: msg.text });
            }
          }
        }
      }

      // Add current message
      messages.push({ role: 'user', content: message });

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages,
          tools,
          tool_choice: 'auto',
          stream: true,
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      // Process streaming response with smart buffering
      let accumulatedResponse = '';
      let toolCalls = [];
      let isBuffering = false;

      const reader = response.body;
      const decoder = new TextDecoder('utf-8');

      for await (const chunk of reader) {
        const decodedChunk = decoder.decode(chunk);
        const lines = decodedChunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          if (line === 'data: [DONE]') continue;

          try {
            const parsedChunk = JSON.parse(line.substring(6));

            // Process tool calls
            if (parsedChunk.choices?.[0]?.delta?.tool_calls) {
              const toolCallDeltas = parsedChunk.choices[0].delta.tool_calls;
              
              toolCallDeltas.forEach(delta => {
                if (delta.index !== undefined) {
                  while (toolCalls.length <= delta.index) {
                    toolCalls.push({ id: '', type: 'function', function: { name: '', arguments: '' } });
                  }
                  
                  if (delta.id) toolCalls[delta.index].id = delta.id;
                  if (delta.function?.name) toolCalls[delta.index].function.name = delta.function.name;
                  if (delta.function?.arguments) toolCalls[delta.index].function.arguments += delta.function.arguments;
                }
              });
            }

            // Process content with smart buffering
            const content = parsedChunk.choices[0]?.delta?.content || '';
            if (content) {
              accumulatedResponse += content;

              const shouldBuffer = shouldBufferResponse(toolCalls);
              
              if (!shouldBuffer) {
                // Stream safely (no function calls detected)
                await sendToClient(connectionId, {
                  type: 'chunk',
                  content,
                  conversationId,
                  done: false
                });
              } else if (!isBuffering) {
                // First time detecting function calls - send UX feedback
                console.log('🎯 FUNCTION CALLS DETECTED - Switching to buffering mode');
                await sendToClient(connectionId, {
                  type: 'processing_status',
                  message: 'Creating items for you...',
                  showSpinner: true,
                  conversationId,
                  done: false
                });
                isBuffering = true;
              }
            }

          } catch (parseError) {
            console.log(`⚠️ Parse error (continuing):`, parseError.message);
            continue;
          }
        }
      }

      // Process function calls into actions
      const actions = [];
      if (toolCalls.length > 0) {
        toolCalls.forEach((toolCall, index) => {
          try {
            const functionName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments || '{}');
            
            const actionTypeMap = {
              createGoal: 'createGoal',
              createMilestone: 'createMilestone',
              createTask: 'createTask',
              createTimeBlock: 'createTimeBlock'
            };

            const actionType = actionTypeMap[functionName];
            if (actionType) {
              const modalDataId = `${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
              
              actions.push({
                type: actionType,
                data: args,
                modalDataId,
                originalData: { ...args }
              });
            }
          } catch (error) {
            console.error('Error processing tool call:', error);
          }
        });
      }

      // Build final response with action links
      let responseText = accumulatedResponse;
      if (actions.length > 0) {
        const actionLinks = actions.map(action => {
          const displayType = action.type === 'createMilestone' ? 'Milestone' :
                            action.type.replace('create', '').charAt(0).toUpperCase() + 
                            action.type.replace('create', '').slice(1);
          const actionType = action.type === 'createMilestone' ? 'milestone' :
                           action.type.replace('create', '').toLowerCase();
          
          return `• [Reopen ${displayType} Form](action://${actionType}/${action.modalDataId})`;
        }).join('\n');
        
        responseText = `*I've prepared ${actions.length === 1 ? 
          `${actions[0].type.replace('create', '').toLowerCase()} form` : 
          `${actions.length} item forms`} for you.*\n\nAction links:\n${actionLinks}`;
      }

      // Send final response
      await sendToClient(connectionId, {
        type: 'complete',
        content: responseText,
        conversationId,
        done: true,
        actions: actions.length > 0 ? actions : undefined,
        executionPhase: actions.length > 0,
        streamedPlanning: !isBuffering && actions.length === 0
      });

      console.log(`✅ Complete - Actions: ${actions.length}, Buffered: ${isBuffering}`);
      return { statusCode: 200 };
    }

    return { statusCode: 400, body: 'Unrecognized route' };

  } catch (error) {
    console.error('❌ Handler error:', error);
    
    if (routeKey === 'sendMessage') {
      try {
        await sendToClient(connectionId, {
          type: 'error',
          content: 'I encountered an error. Please try again.',
          conversationId: JSON.parse(body || '{}').conversationId,
          done: true
        });
      } catch (sendError) {
        console.error('Failed to send error:', sendError);
      }
    }
    
    return { statusCode: 500, body: 'Internal server error' };
  }
};
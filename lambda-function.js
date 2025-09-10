// Import AWS SDK v3 modules
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');

// Initialize DynamoDB client
const ddbClient = new DynamoDBClient({ region: 'ap-southeast-2' });
const dynamoDB = DynamoDBDocumentClient.from(ddbClient);

// Initialize API Gateway Management API client
const apiGwEndpoint = process.env.WEBSOCKET_API_ENDPOINT || '';
const endpoint = apiGwEndpoint.startsWith('http') ? apiGwEndpoint : `https://${apiGwEndpoint}`;
const apiGwManagementApi = new ApiGatewayManagementApiClient({ endpoint: endpoint });

// OpenAI API key
const openAiApiKey = process.env.OPENAI_API_KEY;
const tableName = 'ai-websocket-connections';

// Optimized system prompt
const getCurrentDateContext = () => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const readableDate = now.toLocaleDateString('en-AU', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  return `TODAY IS: ${today} (${readableDate}) - Use this exact date for all calculations. When users say "1 month from today", add exactly 1 month to this date.`;
};

const FULL_SYSTEM_PROMPT = `You are LifeCompass AI assistant helping users manage goals, milestones, tasks, and time blocks.

${getCurrentDateContext()}

CORE RULES:
1. Always respond conversationally AND use tools when appropriate
2. For clear requests with complete info → CREATE IMMEDIATELY
3. For incomplete requests → Ask clarifying questions
4. Create ONLY what user asks for - be precise

PRODUCTIVITY SYSTEM (flexible hierarchy):
- GOALS: High-level objectives (weeks/months)
- MILESTONES: Projects (standalone or part of goals) 
- TASKS: Action items (standalone or part of milestones/goals)
- TIME BLOCKS: Calendar items (one-time or recurring)
- Items can be standalone or connected - hierarchy is optional

CREATION PATTERNS:
SINGLE REQUESTS → Create immediately:
- "Create goal X" → Create goal only
- "Create task to call dentist" → Create task only
- "Schedule weekly meetings" → Create recurring timeblock

COMPREHENSIVE REQUESTS → Propose plan first, get approval:
- "Break it down", "comprehensive plan", "with milestones and tasks"
- "Help me plan X", "create everything for Y"
- After approval → Use createBulkPlan for complete plans with goal + milestones

KEY PHRASES for comprehensive: "break down", "plan", "comprehensive", "with milestones", "step by step"

DOMAIN-SPECIFIC:
- Learning/business/fitness/creative projects → Usually comprehensive
- Simple tasks/appointments → Usually single

TOOLS:
- Can CREATE new items only (not edit existing)
- Extract complete data - never truncate
- Calculate dates from today when user specifies timeframes
- For timeblocks: support daily/weekly/fortnightly/monthly recurring
- For multiple tasks: Use createTaskBatch for better UX (single modal instead of multiple)
- For comprehensive plans: Use createBulkPlan to create goal + milestones + tasks in one modal

DECISION LOGIC:
- High confidence single → Create now
- High confidence comprehensive → Propose plan first  
- Ambiguous → Ask "single item or comprehensive plan?"
- Plan approval ("yes", "go ahead") → Execute immediately

Always provide helpful responses while using appropriate tools.`;

// Abbreviated prompt for follow-ups
const ABBREVIATED_SYSTEM_PROMPT = `LifeCompass AI. ${getCurrentDateContext()} Single item → create now. Comprehensive → propose first. Plan approval → use createBulkPlan. Multiple tasks → use createTaskBatch. Extract complete data, never truncate.`;

// Function definitions
const tools = [
  {
    type: "function",
    function: {
      name: "createGoal",
      description: "Create a goal (high-level life objective).",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Goal title" },
          description: { type: "string", description: "Goal description with motivation and outcomes" },
          domain: {
            type: "string",
            enum: ["Career & Work", "Health & Wellness", "Relationships", "Personal Growth", "Financial Security", "Recreation & Leisure", "Purpose & Meaning", "Community & Environment", "Other"],
            description: "Life domain"
          },
          color: { type: "string", description: "Hex color matching domain" },
          icon: { type: "string", description: "Ionicon name for goal type" },
          targetDate: { type: "string", description: "ISO date string if user specified timeframe" }
        },
        required: ["title", "description", "domain", "color", "icon"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createMilestone",
      description: "Create a milestone (project/achievement).",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Milestone title" },
          description: { type: "string", description: "What will be accomplished" },
          goalId: { type: "string", description: "Parent goal ID (null for standalone)" },
          goalTitle: { type: "string", description: "Parent goal title" },
          domain: {
            type: "string",
            enum: ["Career & Work", "Health & Wellness", "Relationships", "Personal Growth", "Financial Security", "Recreation & Leisure", "Purpose & Meaning", "Community & Environment", "Other"],
            description: "Life domain"
          },
          color: { type: "string", description: "Hex color matching domain" },
          dueDate: { type: "string", description: "ISO date string if specified" },
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", description: "task_[timestamp]_[random]" },
                title: { type: "string", description: "Task title" },
                status: { type: "string", description: "'todo' for new tasks" },
                completed: { type: "boolean", description: "false for new tasks" }
              }
            },
            description: "Initial tasks array"
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
      description: "Create a single task (actionable item).",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Task title" },
          description: { type: "string", description: "How to complete task" },
          milestoneTitle: { type: "string", description: "Parent milestone (optional)" },
          goalTitle: { type: "string", description: "Parent goal (optional)" },
          status: {
            type: "string",
            enum: ["todo", "in-progress", "completed"],
            description: "Task status"
          }
        },
        required: ["title", "status"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createTaskBatch",
      description: "Create multiple tasks in a batch (better UX for multiple tasks).",
      parameters: {
        type: "object",
        properties: {
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: "Task title" },
                description: { type: "string", description: "How to complete task" },
                milestoneTitle: { type: "string", description: "Parent milestone (optional)" },
                goalTitle: { type: "string", description: "Parent goal (optional)" },
                status: {
                  type: "string",
                  enum: ["todo", "in-progress", "completed"],
                  description: "Task status"
                }
              },
              required: ["title", "status"]
            },
            description: "Array of tasks to create"
          }
        },
        required: ["tasks"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createBulkPlan",
      description: "Create a comprehensive plan with multiple items (goal, milestones, tasks) in one bulk modal.",
      parameters: {
        type: "object",
        properties: {
          planTitle: { type: "string", description: "Overall plan title" },
          planDescription: { type: "string", description: "Brief description of the comprehensive plan" },
          goal: {
            type: "object",
            properties: {
              title: { type: "string", description: "Goal title" },
              description: { type: "string", description: "Goal description" },
              domain: { type: "string", description: "Life domain" },
              targetDate: { type: "string", description: "ISO date string if specified" }
            },
            description: "Main goal for the plan"
          },
          milestones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: "Milestone title" },
                description: { type: "string", description: "What will be accomplished" },
                dueDate: { type: "string", description: "ISO date string if specified" },
                tasks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Task title" },
                      description: { type: "string", description: "Task description" },
                      status: { type: "string", description: "Task status" }
                    }
                  }
                }
              }
            },
            description: "Milestones that support the goal"
          }
        },
        required: ["planTitle", "goal", "milestones"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createTimeBlock",
      description: "Create a time block for calendar scheduling.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Time block title" },
          startTime: { type: "string", description: "Start time (YYYY-MM-DD HH:MM)" },
          endTime: { type: "string", description: "End time (YYYY-MM-DD HH:MM)" },
          location: { type: "string", description: "Location" },
          notes: { type: "string", description: "Additional notes" },
          domain: {
            type: "string",
            enum: ["Career & Work", "Health & Wellness", "Relationships", "Personal Growth", "Financial Security", "Recreation & Leisure", "Purpose & Meaning", "Environment & Organization", "Other"],
            description: "Life domain"
          },
          goalTitle: { type: "string", description: "Related goal (optional)" },
          milestoneTitle: { type: "string", description: "Related milestone (optional)" },
          taskTitle: { type: "string", description: "Related task (optional)" },
          isRepeating: { type: "boolean", description: "Whether block repeats" },
          repeatFrequency: {
            type: "string",
            enum: ["daily", "weekly", "fortnightly", "monthly"],
            description: "Repeat frequency"
          },
          repeatIndefinitely: { type: "boolean", description: "Repeat forever" },
          repeatUntil: { type: "string", description: "End date (YYYY-MM-DD)" }
        },
        required: ["title", "startTime", "endTime", "domain"]
      }
    }
  },
];

// Main handler function
exports.handler = async (event) => {
  const isDirectInvocation = !event.requestContext || !event.requestContext.connectionId;
  if (isDirectInvocation) {
    return { statusCode: 200, body: 'Direct invocation test successful.' };
  }

  const routeKey = event.requestContext.routeKey;
  const connectionId = event.requestContext.connectionId;

  try {
    if (routeKey === '$connect') {
      await dynamoDB.send(new PutCommand({
        TableName: tableName,
        Item: {
          connectionId: connectionId,
          connectedAt: new Date().toISOString(),
          ttl: Math.floor(Date.now() / 1000) + 86400
        }
      }));
      return { statusCode: 200, body: 'Connected' };
    }
    else if (routeKey === '$disconnect') {
      await dynamoDB.send(new DeleteCommand({
        TableName: tableName,
        Key: { connectionId }
      }));
      return { statusCode: 200, body: 'Disconnected' };
    }
    else if (routeKey === 'sendMessage') {
      let message;
      try {
        message = JSON.parse(event.body);
      } catch (error) {
        console.error('Error parsing message:', error);
        return { statusCode: 400, body: 'Invalid message format' };
      }

      if (message.action === 'sendMessage') {
        const userMessage = message.message;
        const conversationId = message.conversationId;
        const messageHistory = message.messageHistory || [];
        const isFirstMessage = message.isFirstMessage || messageHistory.length === 0;
        const userKnowledgeContext = message.userKnowledgeContext || {};

        await sendToClient(connectionId, {
          type: 'status',
          status: 'processing',
          conversationId
        });

        const formattedMessages = [
          {
            role: 'system',
            content: isFirstMessage ? FULL_SYSTEM_PROMPT : ABBREVIATED_SYSTEM_PROMPT
          }
        ];

        messageHistory.forEach(msg => {
          formattedMessages.push({
            role: msg.role,
            content: msg.content
          });
        });

        if (isFirstMessage && userKnowledgeContext?.documentContext) {
          formattedMessages.push({
            role: 'system',
            content: `ADDITIONAL CONTEXT: The user has provided the following documents and app data for context. Use this information to provide more personalized responses, but focus on answering their direct question.\n\n${userKnowledgeContext.documentContext}`
          });
        }

        formattedMessages.push({
          role: 'user',
          content: userMessage
        });

        try {
          const fetch = require('node-fetch');

          // NO STREAMING - Get complete response for data integrity
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openAiApiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4.1-mini',
              messages: formattedMessages,
              tools: tools,
              tool_choice: "auto",
              response_format: { type: "text" },
              stream: false, // Disabled for data integrity
              temperature: 0.7
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API error response:', errorText);
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
          }

          // Parse complete response
          const data = await response.json();
          if (!data.choices || !data.choices[0]) {
            throw new Error('Invalid OpenAI response structure');
          }

          const choice = data.choices[0];
          let accumulatedResponse = choice.message?.content || '';
          let toolCalls = choice.message?.tool_calls || [];

          // Send processing status if there are tool calls
          if (toolCalls.length > 0) {
            await sendToClient(connectionId, {
              type: 'processing_status',
              message: 'Creating items for you...',
              showSpinner: true,
              conversationId,
              done: false
            });
          }

          // Process tool calls
          let actions = null;
          if (toolCalls.length > 0) {
            actions = toolCalls.map((toolCall, index) => {
              try {
                const name = toolCall.function.name;
                let args;
                
                try {
                  args = JSON.parse(toolCall.function.arguments);
                } catch (parseError) {
                  console.error(`❌ Tool call ${index} JSON parse error:`, parseError.message);
                  return null;
                }

                const actionTypeMap = {
                  'createGoal': 'createGoal',
                  'createMilestone': 'createMilestone',
                  'createTask': 'createTask',
                  'createTaskBatch': 'createTaskBatch',
                  'createBulkPlan': 'createBulkPlan',
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

          // Generate title for first message
          let title = null;
          if (isFirstMessage) {
            title = await generateTitle(userMessage, messageHistory);
          }

          // Process actions and add embedded data to links
          let processedActions = actions;
          let enhancedResponse = accumulatedResponse;
          
          if (actions && actions.length > 0) {
            processedActions = actions.map((action, index) => {
              return {
                ...action,
                originalData: action.data
              };
            });
            
            // Enhanced response with action links
            const actionTypes = actions.map(a => a.type.replace('create', '').toLowerCase());
            
            // Check if this is a bulk plan (createBulkPlan) or mixed types that should be treated as bulk
            const isBulkPlan = actions.some(a => a.type === 'createBulkPlan');
            const hasMixedTypes = new Set(actionTypes).size > 1 && actions.length > 1;
            
            if (isBulkPlan) {
              // Single bulk plan action
              const bulkAction = actions.find(a => a.type === 'createBulkPlan');
              enhancedResponse += `\n\n*I've prepared a comprehensive plan for you.*`;
              
              const encodedData = Buffer.from(JSON.stringify(bulkAction.data)).toString('base64');
              const actionLink = `\n\n[Reopen Full Plan](action://bulk/${encodedData})`;
              enhancedResponse += actionLink;
              
            } else if (hasMixedTypes) {
              // Multiple different action types - combine into one bulk link
              const combinedBulkData = {
                planTitle: 'Comprehensive Plan',
                planDescription: 'Plan created with multiple items',
                items: actions.map(action => ({
                  type: action.type,
                  data: action.data
                }))
              };
              
              const actionText = actionTypes.length === 2
                ? `a ${actionTypes[0]} and a ${actionTypes[1]}`
                : `${actionTypes.slice(0, -1).join(', ')}, and a ${actionTypes[actionTypes.length - 1]}`;
                
              enhancedResponse += `\n\n*I've prepared ${actionText} for you.*`;
              
              const encodedData = Buffer.from(JSON.stringify(combinedBulkData)).toString('base64');
              const actionLink = `\n\n[Reopen Full Plan](action://bulk/${encodedData})`;
              enhancedResponse += actionLink;
              
            } else if (processedActions.length === 1) {
              // Single action type
              const action = processedActions[0];
              const actionType = action.type === 'createMilestone' ? 'milestone' : action.type.replace('create', '').toLowerCase();
              const displayType = actionType === 'timeblock' ? 'Time Block' : 
                                actionType === 'milestone' ? 'Milestone' :
                                actionType === 'taskbatch' ? 'Tasks' :
                                actionType.charAt(0).toUpperCase() + actionType.slice(1);
              
              enhancedResponse += `\n\n*I've prepared a ${actionType} form for you.*`;
              
              // Encode modal data directly in the link
              const encodedData = Buffer.from(JSON.stringify(action.data)).toString('base64');
              const actionLink = `\n\n[Reopen ${displayType} Form](action://${actionType}/${encodedData})`;
              enhancedResponse += actionLink;
              
            } else {
              // Multiple actions of the same type - keep individual links for now
              const actionText = actionTypes.length === 1 
                ? `${actionTypes[0]} forms` 
                : `multiple forms`;
                
              enhancedResponse += `\n\n*I've prepared ${actionText} for you.*`;
              enhancedResponse += `\n\nAction links:`;
              
              for (const action of processedActions) {
                const actionType = action.type === 'createMilestone' ? 'milestone' : action.type.replace('create', '').toLowerCase();
                const displayType = actionType === 'timeblock' ? 'Time Block' : 
                                  actionType === 'milestone' ? 'Milestone' :
                                  actionType.charAt(0).toUpperCase() + actionType.slice(1);
                
                // Encode modal data directly in the link
                const encodedData = Buffer.from(JSON.stringify(action.data)).toString('base64');
                const actionLink = `\n• [Reopen ${displayType} Form](action://${actionType}/${encodedData})`;
                enhancedResponse += actionLink;
              }
            }
          }

          // Send complete response
          await sendToClient(connectionId, {
            type: 'complete',
            content: enhancedResponse,
            conversationId,
            done: true,
            actions: processedActions,
            title,
            hasToolCalls: toolCalls.length > 0,
            responseLength: enhancedResponse.length
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
      else {
        await sendToClient(connectionId, {
          type: 'error',
          error: 'Unknown action: ' + message.action
        });
        return { statusCode: 400, body: 'Unknown action' };
      }
    }
    else {
      return { statusCode: 400, body: 'Unknown route' };
    }
  } catch (error) {
    console.error('Error processing message:', error);
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

// Helper function to send messages to client
async function sendToClient(connectionId, payload) {
  try {
    const command = new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: Buffer.from(JSON.stringify(payload))
    });
    await apiGwManagementApi.send(command);
  } catch (error) {
    console.error(`Error sending message to client ${connectionId}:`, error);
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

// Process action data
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
      const tasks = Array.isArray(args.tasks)
        ? args.tasks.map((task, taskIndex) => ({
            id: `task_${Date.now()}_${taskIndex}_${Math.random().toString(36).substr(2, 9)}`,
            title: typeof task === 'object' ? task.title : task,
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

    case 'createTaskBatch':
      return {
        tasks: (args.tasks || []).map((task, taskIndex) => ({
          id: `task_${Date.now()}_${taskIndex}_${Math.random().toString(36).substr(2, 9)}`,
          title: task.title,
          description: task.description || '',
          milestoneTitle: task.milestoneTitle || '',
          goalTitle: task.goalTitle || '',
          status: task.status || 'todo'
        }))
      };

    case 'createBulkPlan':
      return {
        planTitle: args.planTitle,
        planDescription: args.planDescription || '',
        goal: {
          ...args.goal,
          color: getDomainColor(args.goal?.domain || 'Other'),
          icon: getDomainIcon(args.goal?.domain || 'Other')
        },
        milestones: (args.milestones || []).map((milestone, milestoneIndex) => ({
          ...milestone,
          color: getDomainColor(args.goal?.domain || 'Other'),
          tasks: (milestone.tasks || []).map((task, taskIndex) => ({
            id: `task_${Date.now()}_${milestoneIndex}_${taskIndex}_${Math.random().toString(36).substr(2, 9)}`,
            title: task.title,
            description: task.description || '',
            status: task.status || 'todo',
            completed: false
          }))
        }))
      };

    case 'createTimeBlock':
      return {
        title: args.title,
        startTime: args.startTime,
        endTime: args.endTime,
        location: args.location || '',
        notes: args.notes || '',
        color: '#4f46e5',
        goalTitle: args.goalTitle || '',
        milestoneTitle: args.milestoneTitle || '',
        taskTitle: args.taskTitle || '',
        isRepeating: args.isRepeating || false,
        repeatFrequency: args.repeatFrequency || 'weekly',
        repeatIndefinitely: args.repeatIndefinitely || true,
        repeatUntil: args.repeatUntil || null,
        userTimezoneOffset: -(new Date().getTimezoneOffset() / 60)
      };

    default:
      return args;
  }
}

// Domain color mapping
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

// Domain icon mapping
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

// Generate conversation title
async function generateTitle(userMessage, messageHistory = []) {
  try {
    const titlePrompt = `Generate a natural conversation title (max 60 characters) based on this first message:

"${userMessage}"

Rules:
- For greetings (hi, hello, hey): Use "General conversation" or "Chat with AI assistant"
- For specific requests: Describe what they want help with
- For questions: Capture the main topic being asked about
- Keep it natural and conversational

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
        generatedTitle = generatedTitle.replace(/^["']|["']$/g, '');
        if (generatedTitle.length > 80) {
          generatedTitle = generatedTitle.substring(0, 77) + '...';
        }
        generatedTitle = generatedTitle.charAt(0).toUpperCase() + generatedTitle.slice(1);
        return generatedTitle;
      }
    }
    
    return generateSimpleTitle(userMessage);
    
  } catch (error) {
    console.error('Error generating AI title:', error);
    return generateSimpleTitle(userMessage);
  }
}

// Simple fallback title
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
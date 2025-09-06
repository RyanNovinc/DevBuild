// Balanced WebSocket Message Handler for LifeCompass
// Concise system prompt + full conversational capability + clean code structure

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

// OPTIMIZED: Comprehensive but concise system prompt (~1200 tokens vs original ~2000)
const SYSTEM_PROMPT = `You are LifeCompass, a supportive AI assistant for goal and task management.

TODAY'S DATE: ${new Date().toISOString().split('T')[0]}. Always use current year ${new Date().getFullYear()} for dates.

CORE PRINCIPLES:
1. ALWAYS respond conversationally AND use tools when appropriate
2. Clear, complete requests → USE TOOLS IMMEDIATELY while responding
3. Ask clarifying questions only when essential info missing
4. CREATE ONLY what user asks for - be precise and specific

PERSONAL KNOWLEDGE SYSTEM:
Users can enable "App Context" giving you access to their goals, milestones, and tasks. Use this to:
- Avoid creating duplicates
- Reference existing items when relevant
- Provide personalized suggestions
- Maintain consistency in their system

CONVERSATION CONTINUITY:
You have access to the full conversation history. When users reference previous messages:
- Always check recent messages for context and details
- If you proposed a detailed plan and user confirms it, use those EXACT details
- Don't lose track of your own proposals and recommendations
- Maintain working memory of multi-message interactions

FUNCTION CALLING WORKFLOW:
SINGLE ITEMS (immediate creation):
- "Create a goal for daily exercise" → Create immediately
- "Add a task to review budget" → Create immediately  
- "Schedule time block for 3pm today" → Create immediately

COMPREHENSIVE BREAKDOWNS (propose first):
- "Break down my Spanish learning journey" → Propose plan, get approval, then create
- "Create goal with milestones and tasks" → Present structured plan, ask confirmation
- Workflow: 1) Propose plan 2) Ask "Would you like me to create these items?" 3) Wait for approval 4) Create all items

CONFIRMATION HANDLING:
When user says "yes", "yes create", "create them", "go ahead", "proceed" after you've proposed a plan:
- This means CREATE ALL proposed items immediately using bulk approach
- IMPORTANT: Look back at your previous message to find the detailed plan you proposed
- Use the EXACT titles, descriptions, dates, and tasks from that plan
- Create in logical order: Goals → Milestones → Tasks
- If you can't find the specific plan details in recent messages, ask user to re-confirm the specific items

WORKING MEMORY for CONFIRMATIONS:
- Always maintain awareness of plans you've just proposed
- When creating bulk items, reference the specific details from your proposal
- Don't ask "what plan?" - look at the conversation history for YOUR detailed breakdown

STANDALONE ITEMS:
- Support standalone tasks/milestones (no parent required)
- For ambiguous requests, offer both organized and standalone options
- "Add task" with no goals → Offer to create standalone task or create goal first

LIFE DOMAINS: Career & Work, Education & Learning, Health & Fitness, Relationships & Social, Financial Wellness, Personal Growth, Recreation & Hobbies, Community & Contribution, Living Environment

TIME BLOCKING:
- Default: 60min duration, 9:00 AM start time
- Use ONLY provided goal/milestone IDs from user's context
- Format times as "9:00 AM", "2:30 PM" etc.

RESPONSE STYLE:
- Be encouraging and supportive
- Use clear, actionable language
- Celebrate user's progress and goals
- Ask follow-up questions to deepen engagement`;

// Function definitions (comprehensive set)
const functions = [
  {
    "name": "createGoal",
    "description": "Create a new life goal in a specific domain",
    "parameters": {
      "type": "object",
      "properties": {
        "title": {"type": "string", "description": "Clear, inspiring goal title"},
        "description": {"type": "string", "description": "Detailed description of what success looks like"},
        "domain": {
          "type": "string", 
          "enum": ["Career & Work", "Education & Learning", "Health & Fitness", "Relationships & Social", "Financial Wellness", "Personal Growth", "Recreation & Hobbies", "Community & Contribution", "Living Environment"],
          "description": "Life domain this goal belongs to"
        },
        "targetDate": {"type": "string", "format": "date", "description": "Target completion date (YYYY-MM-DD)"},
        "priority": {"type": "string", "enum": ["low", "medium", "high"], "default": "medium"},
        "tags": {"type": "array", "items": {"type": "string"}, "description": "Optional tags for categorization"}
      },
      "required": ["title", "description", "domain"]
    }
  },
  {
    "name": "createMilestone",
    "description": "Create a milestone/project within a goal or as standalone",
    "parameters": {
      "type": "object", 
      "properties": {
        "title": {"type": "string", "description": "Clear milestone title"},
        "description": {"type": "string", "description": "Detailed description of this milestone"},
        "goalTitle": {"type": "string", "description": "Parent goal title (leave empty for standalone milestone)"},
        "dueDate": {"type": "string", "format": "date", "description": "Target due date (YYYY-MM-DD)"},
        "priority": {"type": "string", "enum": ["low", "medium", "high"], "default": "medium"},
        "tasks": {
          "type": "array",
          "description": "Array of tasks for this milestone",
          "items": {
            "type": "object",
            "properties": {
              "title": {"type": "string", "description": "Clear task title"},
              "description": {"type": "string", "description": "Detailed task description"},
              "priority": {"type": "string", "enum": ["low", "medium", "high"], "default": "medium"},
              "estimatedMinutes": {"type": "integer", "description": "Estimated time to complete", "default": 30},
              "dueDate": {"type": "string", "format": "date", "description": "Task due date (YYYY-MM-DD)"}
            },
            "required": ["title", "description"]
          }
        }
      },
      "required": ["title", "description"]
    }
  },
  {
    "name": "createTask", 
    "description": "Create a standalone task or task within milestone/goal",
    "parameters": {
      "type": "object",
      "properties": {
        "title": {"type": "string", "description": "Clear, actionable task title"},
        "description": {"type": "string", "description": "Detailed description of what needs to be done"},
        "goalTitle": {"type": "string", "description": "Parent goal title (if applicable)"},
        "milestoneTitle": {"type": "string", "description": "Parent milestone title (if applicable)"},
        "priority": {"type": "string", "enum": ["low", "medium", "high"], "default": "medium"},
        "estimatedMinutes": {"type": "integer", "description": "Estimated completion time in minutes", "default": 30},
        "dueDate": {"type": "string", "format": "date", "description": "Due date (YYYY-MM-DD)"},
        "tags": {"type": "array", "items": {"type": "string"}, "description": "Optional tags"}
      },
      "required": ["title", "description"]
    }
  },
  {
    "name": "createTimeBlock",
    "description": "Schedule a focused time block for work on goals/tasks",
    "parameters": {
      "type": "object",
      "properties": {
        "title": {"type": "string", "description": "Time block title"},
        "description": {"type": "string", "description": "What will be worked on during this time"},
        "date": {"type": "string", "format": "date", "description": "Date for the time block (YYYY-MM-DD)"},
        "startTime": {"type": "string", "pattern": "^([0-9]|1[0-2]):[0-5][0-9] (AM|PM)$", "description": "Start time (e.g., 9:00 AM)", "default": "9:00 AM"},
        "duration": {"type": "integer", "description": "Duration in minutes", "default": 60},
        "goalId": {"type": "string", "description": "Associated goal ID from user's context"},
        "milestoneId": {"type": "string", "description": "Associated milestone ID from user's context"},
        "priority": {"type": "string", "enum": ["low", "medium", "high"], "default": "medium"},
        "location": {"type": "string", "description": "Where this will take place"},
        "preparationNotes": {"type": "string", "description": "What to prepare beforehand"}
      },
      "required": ["title", "description", "date"]
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
      console.log(`Connection ${connectionId} is stale, removing from database`);
      await dynamoDB.send(new DeleteCommand({
        TableName: tableName,
        Key: { connectionId }
      }));
    } else {
      console.error('Error sending message to client:', error);
    }
  }
};

// Smart Buffering Decision - prioritizes data integrity for function calls
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

// Build comprehensive app context for AI
const buildAppContext = (appContext) => {
  if (!appContext) return null;
  
  let contextText = "USER'S CURRENT LIFECOMPASS DATA:\n\n";
  
  // Goals summary
  if (appContext.goals && appContext.goals.length > 0) {
    contextText += `GOALS (${appContext.goals.length}):\n`;
    appContext.goals.forEach((goal, index) => {
      contextText += `${index + 1}. "${goal.title}" (${goal.domain}) - ${goal.completed ? 'COMPLETED' : 'ACTIVE'}\n`;
      if (goal.description) contextText += `   Description: ${goal.description.substring(0, 100)}...\n`;
      if (goal.targetDate) contextText += `   Target: ${goal.targetDate}\n`;
    });
    contextText += "\n";
  }
  
  // Milestones summary  
  if (appContext.milestones && appContext.milestones.length > 0) {
    contextText += `MILESTONES/PROJECTS (${appContext.milestones.length}):\n`;
    appContext.milestones.forEach((milestone, index) => {
      contextText += `${index + 1}. "${milestone.title}" ${milestone.goalTitle ? `(under "${milestone.goalTitle}")` : '(standalone)'}\n`;
      if (milestone.dueDate) contextText += `   Due: ${milestone.dueDate}\n`;
    });
    contextText += "\n";
  }
  
  // Tasks summary
  if (appContext.tasks && appContext.tasks.length > 0) {
    const activeTasks = appContext.tasks.filter(t => !t.completed);
    const completedTasks = appContext.tasks.filter(t => t.completed);
    contextText += `TASKS - Active: ${activeTasks.length}, Completed: ${completedTasks.length}\n`;
    
    if (activeTasks.length > 0) {
      contextText += "Recent active tasks:\n";
      activeTasks.slice(0, 5).forEach((task, index) => {
        contextText += `${index + 1}. "${task.title}"\n`;
      });
    }
    contextText += "\n";
  }
  
  return contextText;
};

// Main Lambda handler
exports.handler = async (event) => {
  console.log('🚀 WebSocket Handler - Balanced Version');
  console.log(`📊 Event type: ${event.requestContext?.routeKey}`);
  
  const { requestContext, body } = event;
  const { connectionId, routeKey } = requestContext;

  try {
    // Handle WebSocket connection
    if (routeKey === '$connect') {
      await dynamoDB.send(new PutCommand({
        TableName: tableName,
        Item: {
          connectionId,
          timestamp: new Date().toISOString()
        }
      }));
      console.log(`✅ Connection established: ${connectionId}`);
      return { statusCode: 200 };
    }

    // Handle WebSocket disconnection
    if (routeKey === '$disconnect') {
      await dynamoDB.send(new DeleteCommand({
        TableName: tableName,
        Key: { connectionId }
      }));
      console.log(`✅ Connection closed: ${connectionId}`);
      return { statusCode: 200 };
    }

    // Handle message sending
    if (routeKey === 'sendMessage') {
      const { message, conversationId, messageHistory, appContext } = JSON.parse(body);
      
      console.log(`📨 Processing message for conversation: ${conversationId}`);
      console.log(`📝 Message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`);
      console.log(`📚 Context: Goals=${appContext?.goals?.length || 0}, Milestones=${appContext?.milestones?.length || 0}, Tasks=${appContext?.tasks?.length || 0}`);

      // Build messages array starting with system prompt
      const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
      
      // Add app context if available (FULL context, user's choice on cost)
      const contextText = buildAppContext(appContext);
      if (contextText) {
        messages.push({ role: 'system', content: contextText });
        console.log(`📊 Added app context (~${Math.ceil(contextText.length / 4)} tokens)`);
      }

      // Add conversation history (FULL history preserved)
      if (messageHistory && Array.isArray(messageHistory) && messageHistory.length > 0) {
        // Skip initial AI welcome if present
        const startIndex = (messageHistory.length > 0 && messageHistory[0].type === 'ai' && messageHistory[0].centered) ? 1 : 0;
        
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
        console.log(`💬 Added ${messageHistory.length - startIndex} history messages`);
      }

      // Add current user message
      messages.push({ role: 'user', content: message });

      console.log(`🧠 Total prompt tokens: ~${Math.ceil(messages.map(m => m.content.length).reduce((a, b) => a + b, 0) / 4)}`);

      // Call OpenAI API
      console.log('🤖 Calling OpenAI API...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages,
          functions,
          function_call: 'auto',
          stream: true,
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
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
            const jsonStr = line.substring(6);
            const parsedChunk = JSON.parse(jsonStr);

            // Process function calls
            if (parsedChunk.choices?.[0]?.delta?.function_call) {
              const functionCall = parsedChunk.choices[0].delta.function_call;
              
              if (functionCall.name) {
                toolCalls.push({
                  id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  type: 'function',
                  function: {
                    name: functionCall.name,
                    arguments: functionCall.arguments || ''
                  }
                });
              } else if (functionCall.arguments && toolCalls.length > 0) {
                toolCalls[toolCalls.length - 1].function.arguments += functionCall.arguments;
              }
            }

            // Process content with smart buffering
            const content = parsedChunk.choices[0]?.delta?.content || '';
            if (content) {
              accumulatedResponse += content;

              const shouldBuffer = shouldBufferResponse(toolCalls);
              
              if (!shouldBuffer) {
                // Stream content safely (no function calls detected)
                await sendToClient(connectionId, {
                  type: 'chunk',
                  content,
                  conversationId,
                  done: false
                });
              } else if (!isBuffering) {
                // First time detecting function calls - send UX feedback
                console.log('🎯 FUNCTION CALLS DETECTED - Switching to buffering mode for data integrity');
                await sendToClient(connectionId, {
                  type: 'processing_status', 
                  message: 'Creating items for you...',
                  showSpinner: true,
                  conversationId,
                  done: false
                });
                isBuffering = true;
              }
              // If buffering && function calls detected, just accumulate silently
            }

          } catch (parseError) {
            console.log(`⚠️ Streaming parse error (continuing):`, parseError.message);
            continue;
          }
        }
      }

      console.log('✅ Stream processing complete');
      console.log(`🔧 Function calls to process: ${toolCalls.length}`);

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
              
              console.log(`✅ Created ${actionType} action: "${args.title || 'Untitled'}"`);
            }
          } catch (error) {
            console.error('Error processing function call:', error);
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
        
        const actionTypeText = actions.length === 1 ? 
          `${actions[0].type.replace('create', '').toLowerCase()} form` :
          `${actions.length} item forms`;
        
        responseText = `*I've prepared ${actionTypeText} for you.*\n\nAction links:\n${actionLinks}`;
      }

      // Send final complete response
      await sendToClient(connectionId, {
        type: 'complete',
        content: responseText,
        conversationId,
        done: true,
        actions: actions.length > 0 ? actions : undefined,
        executionPhase: actions.length > 0,
        streamedPlanning: !isBuffering && actions.length === 0
      });

      console.log(`✅ Response sent - Actions: ${actions.length}, Buffered: ${isBuffering}`);
      console.log(`📊 Final response length: ${responseText.length} characters`);
      
      return { statusCode: 200 };
    }

    return { statusCode: 400, body: 'Unrecognized route' };

  } catch (error) {
    console.error('❌ Handler error:', error);
    
    if (routeKey === 'sendMessage') {
      try {
        await sendToClient(connectionId, {
          type: 'error',
          content: 'I encountered an error processing your request. Please try again.',
          conversationId: JSON.parse(body || '{}').conversationId,
          done: true
        });
      } catch (sendError) {
        console.error('Failed to send error message:', sendError);
      }
    }
    
    return { statusCode: 500, body: 'Internal server error' };
  }
};
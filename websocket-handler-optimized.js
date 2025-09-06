// Optimized WebSocket Message Handler for LifeCompass
// Reduced system prompt, modular structure, smart prompt injection

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

// OPTIMIZED: Core system prompt (reduced from ~2000 to ~400 tokens)
const CORE_SYSTEM_PROMPT = `You are LifeCompass, an AI assistant for goal and task management.

TODAY: ${new Date().toISOString().split('T')[0]}

CORE RULES:
1. ALWAYS respond conversationally AND use tools when appropriate
2. Clear, complete requests → USE TOOLS IMMEDIATELY  
3. Ask clarifying questions only when essential info missing
4. CREATE ONLY what user asks for - be precise

FUNCTION CALLING:
- Single item with complete info → Create immediately
- Comprehensive breakdown → Propose plan first, get approval, then create
- Use tools while responding conversationally`;

// OPTIMIZED: Contextual additions (only added when needed)
const CONTEXT_ADDITIONS = {
  COMPREHENSIVE: `
COMPREHENSIVE WORKFLOW:
1. User requests breakdown → PROPOSE plan first
2. Present structured plan clearly  
3. Ask: "Would you like me to create these items?"
4. Wait for approval before creating
5. After approval, create in order: Goal → Milestones → Tasks`,

  STANDALONE: `
STANDALONE ITEMS:
- Support standalone tasks/milestones (no parent required)
- For ambiguous requests, offer both organized and standalone options`,

  DOMAINS: `
LIFE DOMAINS: Career & Work, Education & Learning, Health & Fitness, Relationships & Social, Financial Wellness, Personal Growth, Recreation & Hobbies, Community & Contribution, Living Environment`,

  TIMEBLOCKS: `
TIME BLOCKING:
- Default 60min duration, 9 AM start
- Use ONLY provided goal/milestone IDs
- Format times as "HH:MM AM/PM"`
};

// Smart prompt builder - only include relevant context
const buildSystemPrompt = (userMessage, hasAppContext, requestType) => {
  let prompt = CORE_SYSTEM_PROMPT;
  
  // Add contextual sections based on request analysis
  if (requestType === 'comprehensive') {
    prompt += CONTEXT_ADDITIONS.COMPREHENSIVE;
  }
  
  if (userMessage.toLowerCase().includes('standalone') || userMessage.toLowerCase().includes('no goal')) {
    prompt += CONTEXT_ADDITIONS.STANDALONE;
  }
  
  if (userMessage.toLowerCase().includes('domain') || requestType === 'goal') {
    prompt += CONTEXT_ADDITIONS.DOMAINS;
  }
  
  if (userMessage.toLowerCase().includes('timeblock') || userMessage.toLowerCase().includes('schedule')) {
    prompt += CONTEXT_ADDITIONS.TIMEBLOCKS;
  }
  
  return prompt;
};

// Analyze request type for smart prompt injection
const analyzeRequestType = (message) => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('break down') || lowerMsg.includes('comprehensive') || 
      lowerMsg.includes('milestones with') || lowerMsg.includes('plan for')) {
    return 'comprehensive';
  }
  
  if (lowerMsg.includes('goal')) return 'goal';
  if (lowerMsg.includes('milestone') || lowerMsg.includes('project')) return 'milestone'; 
  if (lowerMsg.includes('task')) return 'task';
  if (lowerMsg.includes('timeblock') || lowerMsg.includes('schedule')) return 'timeblock';
  
  return 'conversational';
};

// Function definitions (same as original)
const functions = [
  {
    "name": "createGoal",
    "description": "Create a new life goal",
    "parameters": {
      "type": "object",
      "properties": {
        "title": {"type": "string", "description": "Goal title"},
        "description": {"type": "string", "description": "Detailed description"},
        "domain": {"type": "string", "enum": ["Career & Work", "Education & Learning", "Health & Fitness", "Relationships & Social", "Financial Wellness", "Personal Growth", "Recreation & Hobbies", "Community & Contribution", "Living Environment"]},
        "targetDate": {"type": "string", "format": "date", "description": "Target completion date (YYYY-MM-DD)"},
        "priority": {"type": "string", "enum": ["low", "medium", "high"], "default": "medium"}
      },
      "required": ["title", "description", "domain"]
    }
  },
  {
    "name": "createMilestone", 
    "description": "Create a milestone/project within a goal or standalone",
    "parameters": {
      "type": "object",
      "properties": {
        "title": {"type": "string", "description": "Milestone title"},
        "description": {"type": "string", "description": "Detailed description"},
        "goalTitle": {"type": "string", "description": "Parent goal title (leave empty for standalone)"},
        "dueDate": {"type": "string", "format": "date", "description": "Due date (YYYY-MM-DD)"},
        "priority": {"type": "string", "enum": ["low", "medium", "high"], "default": "medium"},
        "tasks": {
          "type": "array",
          "items": {
            "type": "object", 
            "properties": {
              "title": {"type": "string", "description": "Task title"},
              "description": {"type": "string", "description": "Task description"},
              "priority": {"type": "string", "enum": ["low", "medium", "high"], "default": "medium"},
              "estimatedMinutes": {"type": "integer", "description": "Estimated completion time", "default": 30}
            },
            "required": ["title"]
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
        "title": {"type": "string", "description": "Task title"},
        "description": {"type": "string", "description": "Detailed description"},
        "goalTitle": {"type": "string", "description": "Parent goal title"},
        "milestoneTitle": {"type": "string", "description": "Parent milestone title"},
        "priority": {"type": "string", "enum": ["low", "medium", "high"], "default": "medium"},
        "estimatedMinutes": {"type": "integer", "description": "Estimated time", "default": 30},
        "dueDate": {"type": "string", "format": "date", "description": "Due date (YYYY-MM-DD)"}
      },
      "required": ["title", "description"]
    }
  },
  {
    "name": "createTimeBlock",
    "description": "Schedule a time block for focused work",
    "parameters": {
      "type": "object",
      "properties": {
        "title": {"type": "string", "description": "Time block title"},
        "description": {"type": "string", "description": "What will be worked on"},
        "date": {"type": "string", "format": "date", "description": "Date (YYYY-MM-DD)"},
        "startTime": {"type": "string", "pattern": "^([0-9]|1[0-2]):[0-5][0-9] (AM|PM)$", "description": "Start time (e.g., 9:00 AM)", "default": "9:00 AM"},
        "duration": {"type": "integer", "description": "Duration in minutes", "default": 60},
        "goalId": {"type": "string", "description": "Associated goal ID"},
        "milestoneId": {"type": "string", "description": "Associated milestone ID"},
        "priority": {"type": "string", "enum": ["low", "medium", "high"], "default": "medium"}
      },
      "required": ["title", "description", "date"]
    }
  }
];

// Utility functions
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

// Smart Buffering Decision - Simple and Reliable
const shouldBufferResponse = (toolCalls) => {
  const hasToolCalls = toolCalls.length > 0;
  
  console.log('🎯 BUFFERING DECISION:', {
    hasToolCalls,
    decision: hasToolCalls ? 'BUFFER (function calls detected)' : 'STREAM (conversational only)',
    toolCallCount: toolCalls.length
  });
  
  // RULE: If there are function calls, always buffer for data integrity
  if (hasToolCalls) {
    return true;
  }
  
  // RULE: Pure conversational responses can be streamed safely
  return false;
};

// Main handler
exports.handler = async (event) => {
  console.log('🚀 WebSocket Handler - Optimized Version');
  
  const { requestContext, body } = event;
  const { connectionId, routeKey } = requestContext;

  try {
    if (routeKey === '$connect') {
      await dynamoDB.send(new PutCommand({
        TableName: tableName,
        Item: {
          connectionId,
          timestamp: new Date().toISOString()
        }
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

    if (routeKey === 'sendMessage') {
      const { message, conversationId, messageHistory, appContext } = JSON.parse(body);
      
      console.log(`📨 Processing message for conversation: ${conversationId}`);

      // OPTIMIZED: Smart prompt building based on request analysis
      const requestType = analyzeRequestType(message);
      const hasAppContext = appContext && (appContext.goals?.length > 0 || appContext.milestones?.length > 0);
      const systemPrompt = buildSystemPrompt(message, hasAppContext, requestType);
      
      console.log(`🧠 Request type: ${requestType}, System prompt tokens: ~${Math.ceil(systemPrompt.length / 4)}`);

      // Build messages array
      const messages = [{ role: 'system', content: systemPrompt }];
      
      // Add app context if available and relevant
      if (hasAppContext && (requestType !== 'conversational')) {
        const contextSummary = `USER'S CURRENT DATA:\nGoals: ${appContext.goals?.length || 0}\nMilestones: ${appContext.milestones?.length || 0}\nTasks: ${appContext.tasks?.length || 0}`;
        messages.push({ role: 'system', content: contextSummary });
      }

      // Add conversation history (last 6 messages for context)
      if (messageHistory?.length > 0) {
        const recentHistory = messageHistory.slice(-6);
        recentHistory.forEach(msg => {
          if (msg.type === 'user') {
            messages.push({ role: 'user', content: msg.text });
          } else if (msg.type === 'ai' && msg.text) {
            messages.push({ role: 'assistant', content: msg.text });
          }
        });
      }

      // Add current user message
      messages.push({ role: 'user', content: message });

      // Make OpenAI API call
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
        console.error('OpenAI API error:', errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      // Process streaming response
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
              } else if (functionCall.arguments) {
                if (toolCalls.length > 0) {
                  toolCalls[toolCalls.length - 1].function.arguments += functionCall.arguments;
                }
              }
            }

            // Process content
            const content = parsedChunk.choices[0]?.delta?.content || '';
            if (content) {
              accumulatedResponse += content;

              // Smart Buffering Decision
              const shouldBuffer = shouldBufferResponse(toolCalls);
              
              if (!shouldBuffer) {
                // Stream content safely (no function calls)
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
            console.log(`⚠️ Streaming parse error (continuing):`, parseError.message);
            continue;
          }
        }
      }

      console.log('✅ Stream processing complete');

      // Process function calls and build actions
      const actions = [];
      if (toolCalls.length > 0) {
        console.log(`🔧 Processing ${toolCalls.length} function calls`);
        
        toolCalls.forEach((toolCall, index) => {
          try {
            const functionName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments || '{}');
            
            // Map function names to action types
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
              
              console.log(`✅ Created ${actionType} action:`, args.title || args.name || 'Untitled');
            }
          } catch (error) {
            console.error('Error processing function call:', error);
          }
        });
      }

      // Build response message with action links if applicable
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
          actions[0].type.replace('create', '').toLowerCase() :
          `${actions.length} items`;
        
        responseText = `*I've prepared ${actionTypeText} form${actions.length > 1 ? 's' : ''} for you.*\n\nAction links:\n${actionLinks}`;
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

      console.log(`✅ Response complete - Actions: ${actions.length}, Buffered: ${isBuffering}`);
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
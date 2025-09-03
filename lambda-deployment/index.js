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
- For time blocks: Ask about duration, specific timing preferences, location, and what should be accomplished
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

FLEXIBLE PRODUCTIVITY SYSTEM:
LifeCompass organizes productivity using a flexible hierarchy where items can be standalone or connected:

1. GOALS - High-level life objectives (weeks/months to achieve)
2. MILESTONES - Projects or significant efforts that can be standalone OR part of goals
3. TASKS - Action items that can be standalone OR part of milestones/goals
4. TIME BLOCKS - Calendar allocations for scheduling work (standalone items for calendar management)
5. TO-DOS - Quick standalone action items (users manage these manually in the app)

IMPORTANT: Users can create items at ANY level without requiring parent items. The hierarchy is OPTIONAL and FLEXIBLE.

CRITICAL: When a user asks for ONE specific type of item (timeblock, task, milestone, goal), create ONLY that item. Don't automatically create supporting items unless explicitly requested. For example:
- "Create a timeblock for exercise" → Create ONLY a timeblock
- "Create a milestone with tasks for exercise" → Create milestone AND tasks
- "I need to plan my day" → Ask what they want (timeblocks, tasks, etc.)

TOOL LIMITATIONS: You can help create GOALS, MILESTONES, TASKS, and TIME BLOCKS, but cannot create TO-DOS directly. When users ask about todos, offer guidance on organizing them or suggest creating TASKS instead for more structured tracking.

FUNCTION CALLING PRIORITY:
- When a user provides a complete request with title, description, and clear domain → CALL THE FUNCTION IMMEDIATELY
- When a user asks "Create a milestone for [detailed description]" → CALL createMilestone IMMEDIATELY
- When a user asks "Create a timeblock for [activity]" → CALL createTimeBlock ONLY (not milestone + task + timeblock)
- When a user asks "Create a task to [action]" → CALL createTask ONLY
- When a user provides structured information → USE TOOLS WHILE RESPONDING
- Don't ask "Would you like me to create this?" - just create it and confirm completion
- ONLY CREATE WHAT THE USER SPECIFICALLY ASKED FOR - don't create supporting items unless explicitly requested

Always provide thoughtful guidance based on this framework and suggest creating appropriate elements when users express relevant intentions.`;

// Abbreviated system prompt for follow-up messages - OPTIMIZED FOR TOKEN EFFICIENCY
const ABBREVIATED_SYSTEM_PROMPT = `LifeCompass AI. Continue helping with their flexible productivity system. Always respond conversationally first, ask clarifying questions when helpful (items can be standalone or connected as needed).`;

// Define tools (function calling schemas) with updated descriptions
const tools = [
  {
    type: "function",
    function: {
      name: "createGoal",
      description: "Create a new goal (high-level life objective) when a user expresses wanting to achieve something significant that might take weeks or months",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Clear, concise title of the goal"
          },
          description: {
            type: "string",
            description: "Detailed description of the goal, including motivation and success criteria"
          },
          domain: {
            type: "string",
            enum: ["Career & Work", "Health & Wellness", "Relationships", "Personal Growth", "Financial Security", "Recreation & Leisure", "Purpose & Meaning", "Environment & Organization", "Other"],
            description: "The life domain this goal belongs to"
          }
        },
        required: ["title", "description", "domain"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createMilestone",
      description: "Create ONLY a milestone when user specifically asks for milestones or describes substantial projects that need multiple steps. Examples: 'Create a milestone for exercise routine', 'I want to organize a project for learning Spanish'. Don't create this alongside tasks or timeblocks unless explicitly requested.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Clear, concise title of the milestone"
          },
          description: {
            type: "string",
            description: "Detailed description of what this milestone involves"
          },
          goalTitle: {
            type: "string",
            description: "Optional: The title of the parent goal if this milestone is part of a larger goal"
          },
          domain: {
            type: "string",
            enum: ["Career & Work", "Health & Wellness", "Relationships", "Personal Growth", "Financial Security", "Recreation & Leisure", "Purpose & Meaning", "Environment & Organization", "Other"],
            description: "The life domain this milestone belongs to"
          },
          tasks: {
            type: "array",
            items: {
              type: "string"
            },
            description: "List of initial tasks needed for this milestone"
          }
        },
        required: ["title", "description", "domain"]
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

          // Call OpenAI with streaming and tools, explicitly requesting text response
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
              stream: true,
              temperature: 0.7
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API error response:', errorText);
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
          }

          // Set up streaming handling
          const reader = response.body;
          const decoder = new TextDecoder('utf-8');
          let accumulatedResponse = '';
          let toolCalls = [];

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

                  // Send the content chunk to the client
                  await sendToClient(connectionId, {
                    type: 'chunk',
                    content,
                    conversationId,
                    done: false
                  });
                }
              } catch (parseError) {
                // Skip corrupted streaming chunks - common with tool calls
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
                
                // Try to parse arguments with enhanced regex recovery for streaming issues
                try {
                  args = JSON.parse(toolCall.function.arguments);
                } catch (parseError) {
                  console.log(`Attempting advanced regex recovery for tool call ${index}`);
                  console.log(`Corrupted JSON: ${toolCall.function.arguments.substring(0, 200)}...`);
                  
                  let fixedArgs = toolCall.function.arguments;
                  
                  // Step 1: Try basic JSON repair
                  if (!fixedArgs.startsWith('{')) fixedArgs = '{' + fixedArgs;
                  if (!fixedArgs.endsWith('}')) fixedArgs += '}';
                  
                  // Step 2: Try to fix common streaming corruption patterns
                  fixedArgs = fixedArgs
                    .replace(/^{\s*"?ti\s+"?([^"]+)"?\s*:/, '{"title":"$1",')     // Fix {"ti "value": -> {"title":"value",
                    .replace(/^{\s*"?tle"\s*:\s*"([^"]*)/i, '{"title":"$1"')     // Fix {"tle": "value -> {"title":"value"
                    .replace(/tle"\s*:\s*"([^"]*)/i, '"title":"$1"')             // Fix tle": "value -> "title":"value"
                    .replace(/ti\s+"([^"]*)/i, '"title":"$1"')                   // Fix ti "value -> "title":"value"
                    .replace(/"tab([a-z]+)/i, '"tab":"$1"')                      // Fix "tabtomorrow" -> "tab":"tomorrow"
                    .replace(/tab["'\s]*([a-z]+)/i, '"tab":"$1"')                // Fix missing quotes around tab value
                    .replace(/"title"\s*:\s*([^",}]+)([",}])/, '"title":"$1"$2') // Add missing quotes around title
                    .replace(/,\s*"tab"\s*:\s*"([^"]*)"?\s*$/, ',"tab":"$1"}');   // Ensure proper closing
                  
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
                      let tab = 'today'; // default
                      
                      if (tabMatch) {
                        tab = tabMatch[1].toLowerCase();
                        // Handle merged cases like "tabtomorrow"
                        if (tab.includes('tomorrow')) tab = 'tomorrow';
                        else if (tab.includes('later')) tab = 'later';
                        else if (tab.includes('today')) tab = 'today';
                      }
                      
                      // Handle items array for todo groups
                      let items = [];
                      if (name === 'createTodoGroup') {
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
                      }
                      
                      args = { title, tab };
                      if (name === 'createTodoGroup') args.items = items;
                      
                      console.log(`Advanced regex recovery: ${name} with title "${title}", tab "${tab}"`);
                    } else {
                      console.error(`All recovery methods failed for tool call ${index}. Raw: ${fixedArgs}`);
                      return null;
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
            
            // Add action links immediately
            if (actions.length === 1) {
              const action = actions[0];
              // Map action types to match frontend expectations
              const actionType = action.type === 'createMilestone' ? 'milestone' : action.type.replace('create', '').toLowerCase();
              const displayType = actionType === 'timeblock' ? 'Time Block' : 
                                actionType === 'milestone' ? 'Milestone' :
                                actionType.charAt(0).toUpperCase() + actionType.slice(1);
              enhancedResponse += `\n\n[Reopen ${displayType} Form](action://${actionType}/${action.modalDataId})`;
            } else {
              // Multiple actions - add each link
              enhancedResponse += `\n\nAction links:`;
              for (const action of actions) {
                // Map action types to match frontend expectations
                const actionType = action.type === 'createMilestone' ? 'milestone' : action.type.replace('create', '').toLowerCase();
                const displayType = actionType === 'timeblock' ? 'Time Block' : 
                                  actionType === 'milestone' ? 'Milestone' :
                                  actionType.charAt(0).toUpperCase() + actionType.slice(1);
                enhancedResponse += `\n• [Reopen ${displayType} Form](action://${actionType}/${action.modalDataId})`;
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
            title
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
        icon: getDomainIcon(args.domain)
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
        tasks: tasks
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
      return {
        title: args.title,
        startTime: args.startTime,
        endTime: args.endTime,
        location: args.location || '',
        notes: args.notes || '',
        domain: args.domain,
        color: getDomainColor(args.domain),
        userTimezoneOffset: -(new Date().getTimezoneOffset() / 60)
      };


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
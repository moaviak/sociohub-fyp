import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { LLMService } from "./llm.service";
import { ChatMessage, UserContext } from "./types";
import { DocumentRetrievalTool } from "./tools/document.tool";
import { DatabaseQueryTool } from "./tools/database.tool";
import { WebSearchTool } from "./tools/web-search.tool";
import { chatbotConfig } from "./config";
import { emitEventToUser } from "../../socket";
import { io } from "../../app";
import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";

interface AgentResponse {
  response: string;
  intermediateSteps: any[];
  usedTools: boolean;
  processingTime: number;
  classification?: any;
}

interface AgentThought {
  type: "reasoning" | "tool_call" | "tool_result" | "final_answer";
  title: string;
  description: string;
  rawContent?: any;
  timestamp: number;
  toolName?: string;
  status?: "thinking" | "executing" | "completed" | "error";
}

interface PreprocessingResult {
  shouldUseAgent: boolean;
  simpleResponse?: { response: string };
  classification: {
    suggestedTools: string[];
    confidence: number;
    category: string;
  };
}

export class ChatbotAgent {
  private llmService: LLMService;
  private tools: any[];
  private app: any;
  private checkpointer: MemorySaver;
  private toolInstances: Map<string, any> = new Map();
  private thoughtProcessor: ChatTogetherAI;
  private isInitialized: boolean = false;

  constructor() {
    this.llmService = new LLMService();
    this.checkpointer = new MemorySaver();
    this.tools = [];

    // Initialize a fast model for thought processing with error handling
    try {
      this.thoughtProcessor = new ChatTogetherAI({
        model: chatbotConfig.llm.fastModel,
        apiKey: process.env.TOGETHER_AI_API_KEY!,
        maxTokens: 150,
        temperature: 0.1,
      });
    } catch (error) {
      console.error("Failed to initialize thought processor:", error);
      // Fallback to main LLM if fast model fails
      this.thoughtProcessor = this.llmService.llm;
    }
  }

  async initializeTools(userContext: UserContext): Promise<any[]> {
    try {
      // Initialize tools only once and reuse with better error handling
      if (!this.toolInstances.has("document")) {
        const docTool = new DocumentRetrievalTool(
          this.llmService.embeddings,
          userContext
        );
        await docTool.initialize(); // Ensure tool is properly initialized
        this.toolInstances.set("document", docTool);
      }

      if (!this.toolInstances.has("database")) {
        this.toolInstances.set("database", new DatabaseQueryTool(userContext));
      }

      if (!this.toolInstances.has("web")) {
        this.toolInstances.set("web", new WebSearchTool(userContext));
      }

      return [
        this.toolInstances.get("document"),
        this.toolInstances.get("database"),
        this.toolInstances.get("web"),
      ].filter(Boolean); // Remove any null/undefined tools
    } catch (error) {
      console.error("Error initializing tools:", error);
      return []; // Return empty array instead of throwing
    }
  }

  async initializeAgent(
    userContext: UserContext,
    suggestedTools: string[] = []
  ): Promise<any> {
    try {
      const allTools = await this.initializeTools(userContext);

      // Safely filter tools with better validation
      this.tools =
        suggestedTools.length > 0
          ? allTools.filter((tool) => {
              if (!tool || !tool.name) return false;

              const toolMappings = {
                database_query: "database_query",
                document_retrieval: "document_retrieval",
                web_search: "web_search",
              };

              return suggestedTools.some(
                (suggestedTool) =>
                  toolMappings[suggestedTool as keyof typeof toolMappings] ===
                  tool.name
              );
            })
          : allTools;

      const messageModifier = (messages: BaseMessage[]) => {
        const systemMessage =
          new SystemMessage(`You are **SocioBot**, a helpful, intelligent assistant for the SocioHub platform.

🎯 YOUR ROLE:
You assist users by answering questions related to SocioHub and its features. You must not assume anything about the platform's behavior, structure, or data beyond what is explicitly provided to you.

🧑‍💻 USER CONTEXT:
- Type: ${userContext.type || "unknown"}
- Society ID: ${userContext.societyId || "None"}

📌 CORE RESPONSE STRATEGY:
1. Analyze the user’s query carefully.
2. If it can be answered with your existing knowledge, answer directly.
3. Use tools **only when necessary** — avoid speculative or unnecessary tool usage.
4. If no tool is used or a tool fails, still provide helpful guidance based on your training data and platform knowledge.

🚫 IMPORTANT RESTRICTIONS:
- **Never assume platform behavior, feature availability, user permissions, or data structure** unless it's explicitly provided or confirmed.
- Do not fabricate or guess how the platform works — if unsure, guide the user to look it up or use available options.

🛠️ TOOL USAGE GUIDELINES:
Use tools only when explicitly necessary:
- \`database_query\`: For precise data queries about events, societies, tasks, registrations, etc.
- \`document_retrieval\`: For answering how-to or feature-related questions using official documentation.
- \`web_search\`: For information **outside SocioHub**, e.g., external technologies, university policies, etc.

📝 RESPONSE FORMAT:
- Be clear, conversational, and user-friendly
- Use markdown (e.g., headings, bullet points) when helpful
- Prioritize brevity with value — avoid unnecessary detail or fluff
- If a tool fails, still provide a meaningful and supportive response

✅ FINAL INSTRUCTION:
**Never make assumptions about the platform**. Base your answers only on what you know or what is retrieved via tools. When in doubt, be transparent and guide the user accordingly.`);

        return [systemMessage, ...messages];
      };

      this.app = createReactAgent({
        llm: this.llmService.llm,
        tools: this.tools,
        messageModifier,
        checkpointSaver: this.checkpointer,
      });

      this.isInitialized = true;
      return this.app;
    } catch (error) {
      console.error("Error initializing agent:", error);
      throw new Error(`Failed to initialize agent.`);
    }
  }

  /**
   * Safe preprocessing with fallback values
   */
  private async safePreprocessQuery(
    query: string,
    userContext: UserContext
  ): Promise<PreprocessingResult> {
    try {
      const result = await this.llmService.preprocessQuery(query, userContext);

      // Ensure the result has the expected structure
      return {
        shouldUseAgent: result?.shouldUseAgent ?? true,
        simpleResponse: result?.simpleResponse,
        classification: {
          suggestedTools: result?.classification?.suggestedTools ?? [],
          confidence: result?.classification?.confidence ?? 0.5,
          category: result?.classification?.type ?? "general",
        },
      };
    } catch (error) {
      console.error("Error in preprocessing query:", error);

      // Return safe fallback
      return {
        shouldUseAgent: true,
        classification: {
          suggestedTools: ["document_retrieval"], // Safe default
          confidence: 0.3,
          category: "general",
        },
      };
    }
  }

  /**
   * Process agent thoughts and emit user-friendly versions with error handling
   */
  private async processAndEmitThought(
    rawThought: any,
    userContext: UserContext,
    sessionId: string
  ): Promise<void> {
    try {
      if (!userContext?.id) {
        console.warn("No user context ID available for thought emission");
        return;
      }

      const thought = await this.generateUserFriendlyThought(rawThought);

      emitEventToUser(io, userContext.id, "agent_thought", {
        sessionId,
        thought,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error processing thought:", error);

      // Emit a safe fallback thought
      try {
        emitEventToUser(io, userContext.id, "agent_thought", {
          sessionId,
          thought: {
            type: "reasoning",
            title: "Processing...",
            description: "Working on your request",
            status: "thinking",
            timestamp: Date.now(),
          },
        });
      } catch (emitError) {
        console.error("Failed to emit fallback thought:", emitError);
      }
    }
  }

  /**
   * Convert raw agent thoughts to user-friendly format with better error handling
   */
  private async generateUserFriendlyThought(
    rawThought: any
  ): Promise<AgentThought> {
    const thoughtType = this.classifyThoughtType(rawThought);

    try {
      // Safely truncate content to prevent token overflow
      const safeContent = JSON.stringify(rawThought || {}).substring(0, 300);

      const prompt = `Convert this agent step into a user-friendly status update:

Agent Step Type: ${thoughtType}
Raw Content: ${safeContent}

Generate a JSON response with:
{
  "title": "Brief, friendly title (max 50 chars)",
  "description": "What the agent is doing in simple terms (max 150 chars)",
  "status": "thinking" | "executing" | "completed"
}

Make it conversational and non-technical. Focus on what value this brings to the user.`;

      const response = await this.thoughtProcessor.invoke([
        { role: "user", content: prompt },
      ]);

      const content = response.content?.toString() || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          type: thoughtType,
          title: parsed.title || this.getDefaultTitle(thoughtType),
          description:
            parsed.description || this.getDefaultDescription(thoughtType),
          status: parsed.status || "thinking",
          timestamp: Date.now(),
          toolName: rawThought?.toolName,
        };
      }
    } catch (error) {
      console.error("Error generating friendly thought:", error);
    }

    // Always return a fallback thought
    return this.getDefaultThought(thoughtType, rawThought);
  }

  private classifyThoughtType(rawThought: any): AgentThought["type"] {
    if (!rawThought) return "reasoning";

    if (rawThought.event === "on_tool_start" || rawThought.toolName) {
      return "tool_call";
    }
    if (rawThought.event === "on_tool_end") {
      return "tool_result";
    }
    if (
      rawThought.event === "on_chat_model_start" ||
      rawThought.event === "on_chain_start"
    ) {
      return "reasoning";
    }
    if (
      rawThought.event === "on_chat_model_end" ||
      rawThought.event === "on_chain_end"
    ) {
      return "final_answer";
    }
    return "reasoning";
  }

  private getDefaultThought(
    type: AgentThought["type"],
    rawThought: any
  ): AgentThought {
    const defaults = {
      reasoning: {
        title: "🤔 Analyzing your question",
        description: "Understanding what you need and planning my approach",
        status: "thinking" as const,
      },
      tool_call: {
        title: `🔍 Searching ${rawThought?.toolName || "data"}`,
        description: "Looking up specific information to answer your question",
        status: "executing" as const,
      },
      tool_result: {
        title: "📊 Processing results",
        description: "Organizing the information I found for you",
        status: "completed" as const,
      },
      final_answer: {
        title: "✨ Preparing response",
        description: "Crafting a helpful answer based on what I discovered",
        status: "completed" as const,
      },
    };

    return {
      type,
      ...defaults[type],
      timestamp: Date.now(),
      toolName: rawThought?.toolName,
    };
  }

  private getDefaultTitle(type: AgentThought["type"]): string {
    const titles = {
      reasoning: "🤔 Thinking...",
      tool_call: "🔍 Searching...",
      tool_result: "📊 Processing...",
      final_answer: "✨ Almost done...",
    };
    return titles[type];
  }

  private getDefaultDescription(type: AgentThought["type"]): string {
    const descriptions = {
      reasoning: "Analyzing your question and planning my approach",
      tool_call: "Looking up the information you requested",
      tool_result: "Processing the results I found",
      final_answer: "Preparing your personalized response",
    };
    return descriptions[type];
  }

  async processQuery(
    query: string,
    userContext: UserContext,
    chatHistory: ChatMessage[] = [],
    sessionId: string = "default-session"
  ): Promise<AgentResponse> {
    const startTime = Date.now();

    // Validate inputs
    if (!query?.trim()) {
      return {
        response: "I'm here to help! Please ask me a question about SocioHub.",
        intermediateSteps: [],
        usedTools: false,
        processingTime: Date.now() - startTime,
      };
    }

    if (!userContext) {
      console.error("No user context provided");
      return {
        response:
          "I encountered an issue with your session. Please try refreshing the page.",
        intermediateSteps: [],
        usedTools: false,
        processingTime: Date.now() - startTime,
      };
    }

    // Emit initial thinking status safely
    try {
      emitEventToUser(io, userContext.id, "agent_thought", {
        sessionId,
        thought: {
          type: "reasoning",
          title: "🚀 Starting to process your request",
          description:
            "Analyzing your question and determining the best approach",
          status: "thinking",
          timestamp: Date.now(),
        },
      });
    } catch (emitError) {
      console.error("Failed to emit initial thought:", emitError);
    }

    try {
      // Step 1: Safe preprocessing with fallback
      let preprocessing: PreprocessingResult;
      try {
        preprocessing = await this.safePreprocessQuery(query, userContext);
      } catch (preprocessError) {
        console.error("Preprocessing failed, using fallback:", preprocessError);
        preprocessing = {
          shouldUseAgent: true,
          classification: {
            suggestedTools: ["document_retrieval"],
            confidence: 0.3,
            category: "general",
          },
        };
      }

      // Step 2: Handle simple queries efficiently
      if (!preprocessing.shouldUseAgent && preprocessing.simpleResponse) {
        try {
          emitEventToUser(io, userContext.id, "agent_thought", {
            sessionId,
            thought: {
              type: "final_answer",
              title: "✅ Quick answer ready",
              description: "I can answer this directly from my knowledge",
              status: "completed",
              timestamp: Date.now(),
            },
          });
        } catch (emitError) {
          console.error("Failed to emit quick answer thought:", emitError);
        }

        return {
          response: preprocessing.simpleResponse.response,
          intermediateSteps: [],
          usedTools: false,
          processingTime: Date.now() - startTime,
          classification: preprocessing.classification,
        };
      }

      // Step 3: Initialize agent with error handling
      const suggestedTools = preprocessing.classification?.suggestedTools || [];

      try {
        await this.initializeAgent(userContext, suggestedTools);
      } catch (initError) {
        console.error("Agent initialization failed:", initError);
        // Fallback to direct response
        const directResponse = await this.generateDirectResponse(
          query,
          userContext,
          chatHistory
        );
        return {
          response: directResponse,
          intermediateSteps: [],
          usedTools: false,
          processingTime: Date.now() - startTime,
          classification: preprocessing.classification,
        };
      }

      // Emit tool preparation status
      try {
        emitEventToUser(io, userContext.id, "agent_thought", {
          sessionId,
          thought: {
            type: "reasoning",
            title: "🛠️ Preparing specialized tools",
            description: `Setting up ${suggestedTools.length} tools to help answer your question`,
            status: "thinking",
            timestamp: Date.now(),
          },
        });
      } catch (emitError) {
        console.error("Failed to emit tool preparation thought:", emitError);
      }

      // Step 4: Prepare messages with safe history handling
      const safeHistory = Array.isArray(chatHistory)
        ? chatHistory.slice(-4)
        : [];
      const messages: BaseMessage[] = [
        ...safeHistory.map((msg) =>
          msg?.role === "user"
            ? new HumanMessage(msg.content || "")
            : new AIMessage(msg.content || "")
        ),
        new HumanMessage(query),
      ].filter(Boolean);

      // Step 5: Configure agent with safe settings
      const config = {
        configurable: {
          thread_id: sessionId,
        },
        recursionLimit: Math.min(
          Math.max(suggestedTools.length * 2 + 3, 5),
          15
        ),
      };

      // Step 6: Execute agent with comprehensive error handling
      let finalResult: any = null;
      const intermediateSteps: any[] = [];

      try {
        // Try streaming approach first
        const eventStream = this.app.streamEvents(
          { messages },
          { ...config, version: "v2" }
        );

        for await (const event of eventStream) {
          await this.processStreamEvent(
            event,
            userContext,
            sessionId,
            intermediateSteps
          );

          if (event.event === "on_chain_end" && event.name === "agent") {
            finalResult = event.data;
          }
        }
      } catch (streamError) {
        console.error("Streaming failed, trying direct invoke:", streamError);

        // Fallback to direct invocation
        try {
          emitEventToUser(io, userContext.id, "agent_thought", {
            sessionId,
            thought: {
              type: "reasoning",
              title: "🔄 Switching to direct processing",
              description: "Using standard processing method for your request",
              status: "executing",
              timestamp: Date.now(),
            },
          });

          finalResult = await this.app.invoke({ messages }, config);
        } catch (invokeError) {
          console.error("Direct invoke also failed:", invokeError);
          throw invokeError;
        }
      }

      // Extract response safely
      let response =
        "I apologize, but I couldn't generate a proper response. Please try rephrasing your question.";

      if (finalResult?.output?.messages?.length > 0) {
        const finalMessage =
          finalResult.output.messages[finalResult.output.messages.length - 1];
        response = finalMessage?.content || response;
      }

      // Extract intermediate steps safely
      const extractedSteps = this.extractIntermediateSteps(
        finalResult?.output?.messages || []
      );
      intermediateSteps.push(...extractedSteps);

      // Emit completion status
      try {
        emitEventToUser(io, userContext.id, "agent_thought", {
          sessionId,
          thought: {
            type: "final_answer",
            title: "🎉 Response ready!",
            description:
              "I've gathered all the information and prepared your answer",
            status: "completed",
            timestamp: Date.now(),
          },
        });
      } catch (emitError) {
        console.error("Failed to emit completion thought:", emitError);
      }

      return {
        response,
        intermediateSteps,
        usedTools: intermediateSteps.length > 0,
        processingTime: Date.now() - startTime,
        classification: preprocessing.classification,
      };
    } catch (error) {
      console.error("Agent processing error:", error);

      // Emit error status safely
      try {
        emitEventToUser(io, userContext.id, "agent_thought", {
          sessionId,
          thought: {
            type: "reasoning",
            title: "⚠️ Encountered an issue",
            description:
              "Don't worry, I'm handling this and will provide a helpful response",
            status: "error",
            timestamp: Date.now(),
          },
        });
      } catch (emitError) {
        console.error("Failed to emit error thought:", emitError);
      }

      // Generate helpful error response
      const errorResponse = await this.generateErrorResponse(
        error,
        query,
        userContext
      );

      return {
        response: errorResponse,
        intermediateSteps: [],
        usedTools: false,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Process streaming events with better error handling
   */
  private async processStreamEvent(
    event: any,
    userContext: UserContext,
    sessionId: string,
    intermediateSteps: any[]
  ): Promise<void> {
    if (!event || !userContext?.id) return;

    try {
      switch (event.event) {
        case "on_chain_start":
          if (event.name === "agent") {
            await this.processAndEmitThought(
              {
                event: "on_chain_start",
                name: event.name,
                data: event.data,
              },
              userContext,
              sessionId
            );
          }
          break;

        case "on_tool_start":
          await this.processAndEmitThought(
            {
              event: "on_tool_start",
              toolName: event.name,
              args: event.data?.input,
            },
            userContext,
            sessionId
          );

          intermediateSteps.push({
            action: {
              tool: event.name || "unknown",
              toolInput: event.data?.input || {},
              toolCallId: event.run_id || Date.now().toString(),
            },
            observation: "Tool execution started...",
          });
          break;

        case "on_tool_end":
          await this.processAndEmitThought(
            {
              event: "on_tool_end",
              toolName: event.name,
              result: event.data?.output,
            },
            userContext,
            sessionId
          );

          // Update the last intermediate step safely
          if (intermediateSteps.length > 0) {
            const lastStep = intermediateSteps[intermediateSteps.length - 1];
            if (lastStep?.action?.tool === event.name) {
              lastStep.observation = event.data?.output || "Tool completed";
            }
          }
          break;

        case "on_chat_model_start":
          await this.processAndEmitThought(
            {
              event: "on_chat_model_start",
              model: event.name,
              messages: event.data?.input?.messages,
            },
            userContext,
            sessionId
          );
          break;

        case "on_chat_model_end":
          await this.processAndEmitThought(
            {
              event: "on_chat_model_end",
              model: event.name,
              result: event.data?.output,
            },
            userContext,
            sessionId
          );
          break;

        case "on_chain_end":
          if (event.name === "agent") {
            await this.processAndEmitThought(
              {
                event: "on_chain_end",
                name: event.name,
                result: event.data,
              },
              userContext,
              sessionId
            );
          }
          break;
      }
    } catch (error) {
      console.error("Error processing stream event:", error);
      // Don't re-throw, just log and continue
    }
  }

  private async generateErrorResponse(
    error: any,
    query: string,
    userContext: UserContext
  ): Promise<string> {
    try {
      if (error?.message === "Agent timeout") {
        return "I'm taking longer than expected to process your request. Could you please try rephrasing your question or being more specific?";
      }

      // Try to provide a helpful response even on error
      const fallbackResponse = await this.generateDirectResponse(
        query,
        userContext
      );
      return (
        fallbackResponse ||
        "I encountered an error while processing your request. Please try rephrasing your question, and I'll do my best to help you."
      );
    } catch (fallbackError) {
      console.error("Fallback response generation failed:", fallbackError);
      return "I encountered an error while processing your request. Please try rephrasing your question, and I'll do my best to help you.";
    }
  }

  private extractIntermediateSteps(messages: BaseMessage[]): any[] {
    if (!Array.isArray(messages)) return [];

    const steps: any[] = [];

    try {
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];

        if (
          message instanceof AIMessage &&
          message.tool_calls &&
          Array.isArray(message.tool_calls) &&
          message.tool_calls.length > 0
        ) {
          const toolCall = message.tool_calls[0];
          const toolResult = messages.find(
            (m, idx) => idx > i && m?.constructor?.name === "ToolMessage"
          );

          steps.push({
            action: {
              tool: toolCall?.name || "unknown",
              toolInput: toolCall?.args || {},
              toolCallId: toolCall?.id || Date.now().toString(),
            },
            observation: toolResult?.content || "No result found",
          });
        }
      }
    } catch (error) {
      console.error("Error extracting intermediate steps:", error);
    }

    return steps;
  }

  /**
   * Enhanced direct response with better error handling
   */
  async generateDirectResponse(
    query: string,
    userContext: UserContext,
    chatHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      const safeHistory = Array.isArray(chatHistory)
        ? chatHistory.slice(-2)
        : [];
      const contextualPrompt = `You are SocioBot, a helpful assistant for SocioHub.

User Context: Type: ${userContext?.type || "unknown"}, Society: ${
        userContext?.societyId || "None"
      }
Recent Chat History: ${JSON.stringify(safeHistory)}

User Query: "${query}"

Provide a helpful, conversational response based on general knowledge about social platforms and university management systems. If the query requires specific SocioHub data that you don't have access to, politely explain that you'd need to search for that information and provide general guidance instead.

Keep your response concise but friendly and helpful.`;

      const response = await this.llmService.llm.invoke([
        { role: "user", content: contextualPrompt },
      ]);

      return (
        response?.content?.toString() ||
        "I'm here to help! Could you please rephrase your question?"
      );
    } catch (error) {
      console.error("Error generating direct response:", error);
      return "I'm here to help with SocioHub! Could you please rephrase your question?";
    }
  }

  /**
   * Cleanup method to reset tool instances if needed
   */
  resetTools(): void {
    try {
      this.toolInstances.clear();
      this.isInitialized = false;
      this.tools = [];
    } catch (error) {
      console.error("Error resetting tools:", error);
    }
  }

  /**
   * Health check method
   */
  isHealthy(): boolean {
    return !!this.llmService && !!this.checkpointer && !!this.thoughtProcessor;
  }
}

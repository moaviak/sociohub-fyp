import { LLMService } from "./llm.service";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import {
  RouteDecision,
  ClassificationContext,
  UserContext,
  ChatMessage,
} from "./types";
import { DocumentRetrievalTool } from "./tools/document.tool";
import { DatabaseQueryTool } from "./tools/database.tool";
import { WebSearchTool } from "./tools/web-search.tool";
import { emitEventToUser } from "../../socket";
import { io } from "../../app";
import { QueryClassifier } from "./query-classifier.service";

interface AgentResponse {
  response: string;
  usedTools: boolean;
  processingTime: number;
  strategy: string;
  classificationMethod?: string;
  toolName?: string;
  enhancedQuery?: string; // Track if query was enhanced
}

interface QueryEnhancement {
  originalQuery: string;
  enhancedQuery: string;
  toolSpecificQueries: Map<string, string>;
  reasoning: string;
}

export class ChatbotAgent {
  private llmService: LLMService;
  private classifier: QueryClassifier;
  private tools: Map<string, any> = new Map();

  // Simple caching - now includes enhanced queries
  private responseCache = new Map<
    string,
    { response: string; timestamp: number; enhancedQuery?: string }
  >();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Enhanced metrics
  private metrics = {
    totalQueries: 0,
    strategyCount: { direct: 0, single_tool: 0, sequential: 0, parallel: 0 },
    toolCount: { database: 0, document: 0, web: 0 },
    cacheHits: 0,
    queryEnhancements: 0,
    enhancementTime: 0,
  };

  // Direct response templates
  private static directResponses = {
    greeting: [
      "Hello! I'm SocioBot, your SocioHub assistant. I can help you with events, societies, tasks, and platform features. What would you like to know?",
      "Hi there! Welcome to SocioHub. I'm here to help you navigate events, societies, and platform features. How can I assist you today?",
    ],
    thanks: [
      "You're welcome! Feel free to ask if you need any other help with SocioHub.",
      "Happy to help! Don't hesitate to reach out if you have more questions.",
    ],
    goodbye: [
      "Goodbye! Don't hesitate to reach out if you need assistance with SocioHub later.",
      "See you later! Feel free to return whenever you have questions about SocioHub.",
    ],
    capabilities: [
      "I can help you with:\n• Finding and managing events\n• Exploring societies and groups\n• Tracking tasks and deadlines\n• Understanding SocioHub features\n• Navigating the platform\n\nWhat specific information do you need?",
    ],
  };

  // Tool-specific query enhancement templates
  private static toolEnhancementPrompts = {
    database: `You are helping to optimize a query for a database search tool that searches SocioHub's database for events, societies, users, tasks, etc.

Original query: "{query}"
User context: {userContext}
Chat history: {chatHistory}

Rewrite this query to be more specific and database-friendly by:
- Using specific entity names (events, societies, users, tasks)
- Including relevant filters (dates, categories, status)
- Adding context from user's profile or recent interactions
- Making it more structured and searchable

Enhanced query:`,

    document: `You are helping to optimize a query for a document retrieval tool that searches through SocioHub documentation, guides, and help content.

Original query: "{query}"
User context: {userContext}
Chat history: {chatHistory}

Rewrite this query to be better for document/semantic search by:
- Using keywords that would appear in documentation
- Expanding abbreviations and technical terms
- Including synonyms and related concepts
- Making it more descriptive for semantic similarity

Enhanced query:`,

    web: `You are helping to optimize a query for web search about SocioHub-related topics, external integrations, or general information.

Original query: "{query}"
User context: {userContext}
Chat history: {chatHistory}

Rewrite this query to be better for web search by:
- Adding context keywords like "SocioHub platform"
- Including specific search terms
- Making it more search-engine friendly
- Focusing on findable web content

Enhanced query:`,
  };

  constructor() {
    this.llmService = new LLMService();
    this.classifier = new QueryClassifier(this.llmService);
  }

  async processQuery(
    query: string,
    userContext: UserContext,
    chatHistory: ChatMessage[] = [],
    sessionId: string = "default-session"
  ): Promise<AgentResponse> {
    const startTime = Date.now();

    if (!query?.trim() || !userContext) {
      return {
        response: "I'm here to help! Please ask me a question about SocioHub.",
        usedTools: false,
        processingTime: Date.now() - startTime,
        strategy: "error",
      };
    }

    this.metrics.totalQueries++;

    // Check cache first
    const cacheKey = `${userContext.id}-${query.toLowerCase().trim()}`;
    const cached = this.responseCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      this.metrics.cacheHits++;
      return {
        response: cached.response,
        usedTools: false,
        processingTime: Date.now() - startTime,
        strategy: "cached",
        enhancedQuery: cached.enhancedQuery,
      };
    }

    try {
      // Initialize tools once
      await this.initializeTools(userContext);

      // Classify query
      const route = await this.classifier.classify({
        query,
        userContext,
        chatHistory,
        timeConstraint: 3000,
      });

      this.metrics.strategyCount[
        route.strategy as keyof typeof this.metrics.strategyCount
      ]++;

      // Emit status
      this.emitStatus(userContext, sessionId, {
        type: "classification",
        strategy: route.strategy,
        tools: route.tools,
        reasoning: route.reasoning,
      });

      let result: AgentResponse;

      switch (route.strategy) {
        case "direct":
          result = this.handleDirect(query, startTime);
          break;

        case "single_tool":
          result = await this.handleSingleToolWithEnhancement(
            route.tools[0],
            query,
            userContext,
            chatHistory,
            sessionId,
            startTime
          );
          break;

        case "sequential":
          result = await this.handleSequentialWithEnhancement(
            route.tools,
            query,
            userContext,
            chatHistory,
            sessionId,
            startTime
          );
          break;

        case "parallel":
          result = await this.handleParallelWithEnhancement(
            route.tools,
            query,
            userContext,
            chatHistory,
            sessionId,
            startTime
          );
          break;

        default:
          result = this.handleFallback(query, startTime);
      }

      result.classificationMethod = route.classificationMethod;

      // Cache successful responses with enhanced query info
      if (result.response && result.response.length > 10) {
        this.responseCache.set(cacheKey, {
          response: result.response,
          timestamp: Date.now(),
          enhancedQuery: result.enhancedQuery,
        });
      }

      return result;
    } catch (error) {
      console.error("Agent processing error:", error);
      return {
        response:
          "I encountered a brief issue. Could you try rephrasing your question about SocioHub?",
        usedTools: false,
        processingTime: Date.now() - startTime,
        strategy: "error",
      };
    }
  }

  private async enhanceQuery(
    originalQuery: string,
    tools: string[],
    userContext: UserContext,
    chatHistory: ChatMessage[] = []
  ): Promise<QueryEnhancement> {
    const enhancementStart = Date.now();

    try {
      // Create tool-specific enhanced queries
      const toolSpecificQueries = new Map<string, string>();

      for (const toolName of tools) {
        const template =
          ChatbotAgent.toolEnhancementPrompts[
            toolName as keyof typeof ChatbotAgent.toolEnhancementPrompts
          ];
        if (!template) {
          toolSpecificQueries.set(toolName, originalQuery);
          continue;
        }

        const enhancementPrompt = template
          .replace("{query}", originalQuery)
          .replace(
            "{userContext}",
            JSON.stringify({
              id: userContext.id,
              role: userContext.type,
              preferences: userContext.preferences,
            })
          )
          .replace(
            "{chatHistory}",
            chatHistory
              .slice(-3)
              .map((m) => `${m.role}: ${m.content}`)
              .join("\n")
          );

        try {
          const response = await this.llmService.llm.invoke([
            new SystemMessage(enhancementPrompt),
          ]);

          const enhancedQuery =
            response.content?.toString()?.trim() || originalQuery;
          toolSpecificQueries.set(toolName, enhancedQuery);
        } catch (error) {
          console.warn(`Failed to enhance query for ${toolName}:`, error);
          toolSpecificQueries.set(toolName, originalQuery);
        }
      }

      // Create a general enhanced query (use the first tool's enhancement or original)
      const generalEnhanced =
        toolSpecificQueries.values().next().value || originalQuery;

      this.metrics.queryEnhancements++;
      this.metrics.enhancementTime += Date.now() - enhancementStart;

      return {
        originalQuery,
        enhancedQuery: generalEnhanced,
        toolSpecificQueries,
        reasoning: `Enhanced query for ${tools.join(", ")} tools`,
      };
    } catch (error) {
      console.error("Query enhancement failed:", error);
      return {
        originalQuery,
        enhancedQuery: originalQuery,
        toolSpecificQueries: new Map(
          tools.map((tool) => [tool, originalQuery])
        ),
        reasoning: "Enhancement failed, using original query",
      };
    }
  }

  private async initializeTools(userContext: UserContext) {
    if (!this.tools.has("document")) {
      const docTool = new DocumentRetrievalTool(
        this.llmService.embeddings,
        userContext
      );
      await docTool.initialize();
      this.tools.set("document", docTool);
    }

    if (!this.tools.has("database")) {
      this.tools.set("database", new DatabaseQueryTool(userContext));
    }

    if (!this.tools.has("web")) {
      this.tools.set("web", new WebSearchTool(userContext));
    }
  }

  private handleDirect(query: string, startTime: number): AgentResponse {
    const lowerQuery = query.toLowerCase();
    let response = ChatbotAgent.directResponses.greeting[0];

    if (lowerQuery.includes("hello") || lowerQuery.includes("hi")) {
      response =
        ChatbotAgent.directResponses.greeting[
          Math.floor(
            Math.random() * ChatbotAgent.directResponses.greeting.length
          )
        ];
    } else if (lowerQuery.includes("thank")) {
      response =
        ChatbotAgent.directResponses.thanks[
          Math.floor(Math.random() * ChatbotAgent.directResponses.thanks.length)
        ];
    } else if (lowerQuery.includes("bye")) {
      response =
        ChatbotAgent.directResponses.goodbye[
          Math.floor(
            Math.random() * ChatbotAgent.directResponses.goodbye.length
          )
        ];
    } else if (lowerQuery.includes("what can you do")) {
      response = ChatbotAgent.directResponses.capabilities[0];
    }

    return {
      response,
      usedTools: false,
      processingTime: Date.now() - startTime,
      strategy: "direct",
    };
  }

  private async handleSingleToolWithEnhancement(
    toolName: string,
    query: string,
    userContext: UserContext,
    chatHistory: ChatMessage[],
    sessionId: string,
    startTime: number
  ): Promise<AgentResponse> {
    // Enhance query for this specific tool
    const enhancement = await this.enhanceQuery(
      query,
      [toolName],
      userContext,
      chatHistory
    );

    this.emitStatus(userContext, sessionId, {
      type: "query_enhancement",
      originalQuery: query,
      enhancedQuery: enhancement.enhancedQuery,
      toolName,
    });

    this.emitStatus(userContext, sessionId, {
      type: "tool_execution",
      toolName,
      status: "running",
    });

    this.metrics.toolCount[toolName as keyof typeof this.metrics.toolCount]++;

    try {
      const tool = this.tools.get(toolName);
      if (!tool) {
        throw new Error(`Tool ${toolName} not available`);
      }

      // Use the tool-specific enhanced query
      const queryToUse = enhancement.toolSpecificQueries.get(toolName) || query;
      const toolOutput = await tool.invoke(queryToUse);
      const response = await this.generateResponse(
        query,
        toolOutput,
        toolName,
        enhancement.enhancedQuery
      );

      this.emitStatus(userContext, sessionId, {
        type: "tool_execution",
        toolName,
        status: "completed",
      });

      return {
        response,
        usedTools: true,
        processingTime: Date.now() - startTime,
        strategy: "single_tool",
        toolName,
        enhancedQuery: enhancement.enhancedQuery,
      };
    } catch (error) {
      console.error(`Tool ${toolName} failed:`, error);

      this.emitStatus(userContext, sessionId, {
        type: "tool_execution",
        toolName,
        status: "error",
        error: (error as Error).message,
      });

      return this.handleFallback(query, startTime);
    }
  }

  private async handleSequentialWithEnhancement(
    tools: string[],
    query: string,
    userContext: UserContext,
    chatHistory: ChatMessage[],
    sessionId: string,
    startTime: number
  ): Promise<AgentResponse> {
    const enhancement = await this.enhanceQuery(
      query,
      tools,
      userContext,
      chatHistory
    );

    this.emitStatus(userContext, sessionId, {
      type: "query_enhancement",
      originalQuery: query,
      enhancedQuery: enhancement.enhancedQuery,
      tools,
    });

    let accumulatedContext = enhancement.enhancedQuery;
    const results: string[] = [];

    for (const toolName of tools) {
      try {
        this.emitStatus(userContext, sessionId, {
          type: "sequential_step",
          toolName,
          status: "running",
        });

        const tool = this.tools.get(toolName);
        if (!tool) continue;

        // Use tool-specific query for first iteration, then accumulated context
        const queryToUse =
          results.length === 0
            ? enhancement.toolSpecificQueries.get(toolName) ||
              accumulatedContext
            : accumulatedContext;

        const toolOutput = await tool.invoke(queryToUse);
        results.push(toolOutput);
        accumulatedContext = `${enhancement.enhancedQuery}\n\nContext: ${toolOutput}`;

        this.metrics.toolCount[
          toolName as keyof typeof this.metrics.toolCount
        ]++;
      } catch (error) {
        console.error(`Sequential step ${toolName} failed:`, error);
      }
    }

    const finalResponse = await this.generateCombinedResponse(
      query,
      results,
      enhancement.enhancedQuery
    );

    return {
      response: finalResponse,
      usedTools: true,
      processingTime: Date.now() - startTime,
      strategy: "sequential",
      enhancedQuery: enhancement.enhancedQuery,
    };
  }

  private async handleParallelWithEnhancement(
    tools: string[],
    query: string,
    userContext: UserContext,
    chatHistory: ChatMessage[],
    sessionId: string,
    startTime: number
  ): Promise<AgentResponse> {
    const enhancement = await this.enhanceQuery(
      query,
      tools,
      userContext,
      chatHistory
    );

    this.emitStatus(userContext, sessionId, {
      type: "query_enhancement",
      originalQuery: query,
      enhancedQuery: enhancement.enhancedQuery,
      tools,
    });

    this.emitStatus(userContext, sessionId, {
      type: "parallel_execution",
      tools,
      status: "running",
    });

    const toolPromises = tools.map(async (toolName) => {
      try {
        const tool = this.tools.get(toolName);
        if (!tool) return null;

        // Use tool-specific enhanced query
        const queryToUse =
          enhancement.toolSpecificQueries.get(toolName) || query;
        const result = await tool.invoke(queryToUse);

        this.metrics.toolCount[
          toolName as keyof typeof this.metrics.toolCount
        ]++;
        return result;
      } catch (error) {
        console.error(`Parallel tool ${toolName} failed:`, error);
        return null;
      }
    });

    const results = await Promise.all(toolPromises);
    const validResults = results.filter((r) => r !== null);

    const finalResponse = await this.generateCombinedResponse(
      query,
      validResults,
      enhancement.enhancedQuery
    );

    return {
      response: finalResponse,
      usedTools: true,
      processingTime: Date.now() - startTime,
      strategy: "parallel",
      enhancedQuery: enhancement.enhancedQuery,
    };
  }

  private async generateResponse(
    query: string,
    toolOutput: string,
    toolName: string,
    enhancedQuery?: string
  ): Promise<string> {
    const systemPrompt = `You are SocioBot for SocioHub. 
    
User's original question: "${query}"
${enhancedQuery ? `Enhanced query used: "${enhancedQuery}"` : ""}
${toolName} returned: ${toolOutput}

Generate a helpful, concise response using proper markdown formatting for better readability:
- Use **bold** for important information
- Use bullet points with - for lists
- Use \`code formatting\` for technical terms or specific names
- Use proper line breaks for readability
- Keep response under 150 words but well-structured

Format your response in clean, readable markdown.`;

    try {
      const response = await this.llmService.llm.invoke([
        new SystemMessage(systemPrompt),
      ]);
      return (
        response.content?.toString() ||
        "I found some information but couldn't format a proper response."
      );
    } catch (error) {
      return "I retrieved some information but encountered an issue formatting the response.";
    }
  }

  private async generateCombinedResponse(
    query: string,
    results: string[],
    enhancedQuery?: string
  ): Promise<string> {
    if (results.length === 0) {
      return "I searched multiple sources but couldn't find specific information. Could you try rephrasing your question?";
    }

    const combined = results.join("\n");
    const systemPrompt = `You are SocioBot for SocioHub. 
    
User's original question: "${query}"
${enhancedQuery ? `Enhanced query used: "${enhancedQuery}"` : ""}

Multiple sources returned: ${combined}

Combine this information into a comprehensive response using proper markdown formatting:
- Use **bold** for key points and important information
- Use bullet points with - for lists and multiple items
- Use \`code formatting\` for technical terms, names, or specific values
- Use proper line breaks and spacing for readability
- Structure the response logically with clear sections if needed
- Keep it comprehensive but well-organized

Format your response in clean, readable markdown.`;

    try {
      const response = await this.llmService.llm.invoke([
        new SystemMessage(systemPrompt),
      ]);
      return (
        response.content?.toString() ||
        "I found information from multiple sources but couldn't combine them properly."
      );
    } catch (error) {
      return "I gathered information from multiple sources but encountered an issue combining the results.";
    }
  }

  private handleFallback(query: string, startTime: number): AgentResponse {
    return {
      response: `I understand you're asking about "${query}". I'm here to help with SocioHub features, events, societies, and tasks. Could you try being more specific?`,
      usedTools: false,
      processingTime: Date.now() - startTime,
      strategy: "fallback",
    };
  }

  private emitStatus(
    userContext: UserContext,
    sessionId: string,
    status: any
  ): void {
    try {
      if (userContext?.id) {
        emitEventToUser(io, userContext.id, "agent_status", {
          sessionId,
          status,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Failed to emit status:", error);
    }
  }

  // Public methods
  getStats() {
    return {
      ...this.metrics,
      cacheSize: this.responseCache.size,
      cacheHitRate:
        this.metrics.totalQueries > 0
          ? this.metrics.cacheHits / this.metrics.totalQueries
          : 0,
      enhancementRate:
        this.metrics.totalQueries > 0
          ? this.metrics.queryEnhancements / this.metrics.totalQueries
          : 0,
      avgEnhancementTime:
        this.metrics.queryEnhancements > 0
          ? this.metrics.enhancementTime / this.metrics.queryEnhancements
          : 0,
    };
  }

  clearCache(): void {
    this.responseCache.clear();
  }

  resetMetrics(): void {
    this.metrics = {
      totalQueries: 0,
      strategyCount: { direct: 0, single_tool: 0, sequential: 0, parallel: 0 },
      toolCount: { database: 0, document: 0, web: 0 },
      cacheHits: 0,
      queryEnhancements: 0,
      enhancementTime: 0,
    };
  }
}

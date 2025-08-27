import { ApiError } from "../../utils/ApiError";
import { OptimizedChatbotAgent } from "./chatbot-agent.service"; // Fixed import
import { LLMService } from "./llm.service";
import { SessionManager } from "./session-manager";
import { DocumentRetrievalTool } from "./tools/document.tool";
import { ChatSession, UserContext } from "./types";
import prisma from "../../db";

interface ProcessingMetrics {
  totalTime: number;
  classificationTime: number;
  responseTime: number;
  toolsUsed: string[];
  cacheHit: boolean;
}

interface IntermediateStep {
  action: {
    tool: string;
    toolInput: any;
  };
  observation: any;
}

export class ChatbotService {
  private optimizedAgent: OptimizedChatbotAgent; // Updated property name
  private sessionManager: SessionManager;
  private documentTool!: DocumentRetrievalTool;
  private llmService: LLMService;
  private responseCache: Map<string, { response: string; timestamp: number }> =
    new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.optimizedAgent = new OptimizedChatbotAgent(); // Updated initialization
    this.sessionManager = new SessionManager();
    this.llmService = new LLMService();
  }

  async initializeDocuments() {
    try {
      this.documentTool = new DocumentRetrievalTool(this.llmService.embeddings);
      await this.documentTool.deleteAndReindexDocuments();
    } catch (error) {
      throw error;
    }
  }

  createSession(userId: string, userType: "student" | "advisor"): string {
    const sessionId = this.sessionManager.createSession(userId, userType);
    return sessionId;
  }

  async processQuery(
    sessionId: string,
    query: string,
    userContext: UserContext
  ): Promise<{
    response: string;
    intermediateSteps?: IntermediateStep[];
    metrics?: ProcessingMetrics;
    classification?: any;
    strategy?: string; // Added strategy field from optimized agent
  }> {
    const startTime = Date.now();
    let classificationTime = 0;
    let responseTime = 0;
    let toolsUsed: string[] = [];
    let cacheHit = false;

    try {
      // Get session and add user message
      const session = this.sessionManager.getSession(sessionId);
      if (!session) {
        throw new ApiError(404, "Session not found or expired");
      }

      this.sessionManager.addMessage(sessionId, {
        role: "user",
        content: query,
        timestamp: new Date(),
      });

      // Check cache for similar queries
      const cacheKey = this.generateCacheKey(query, userContext);
      const cachedResponse = this.getCachedResponse(cacheKey);

      if (cachedResponse) {
        cacheHit = true;
        this.sessionManager.addMessage(sessionId, {
          role: "assistant",
          content: cachedResponse.response,
          timestamp: new Date(),
        });

        return {
          response: cachedResponse.response,
          strategy: "cached",
          metrics: {
            totalTime: Date.now() - startTime,
            classificationTime: 0,
            responseTime: 0,
            toolsUsed: [],
            cacheHit: true,
          },
        };
      }

      // The optimized agent handles its own classification internally
      // No need for separate preprocessing step
      const responseStart = Date.now();

      // Process with optimized agent
      const result = await this.optimizedAgent.processQuery(
        query,
        userContext,
        session.messages,
        sessionId
      );

      responseTime = Date.now() - responseStart;

      // Extract tools used from intermediate steps
      if (result.intermediateSteps) {
        toolsUsed = result.intermediateSteps.map(
          (step: IntermediateStep) => step.action.tool
        );
      }

      // Cache response based on strategy
      if (
        result.strategy === "direct" ||
        result.strategy === "single_tool" ||
        this.shouldCacheResponse(query, result.response)
      ) {
        this.setCachedResponse(cacheKey, result.response);
      }

      this.sessionManager.addMessage(sessionId, {
        role: "assistant",
        content: result.response,
        timestamp: new Date(),
      });

      return {
        response: result.response,
        intermediateSteps: result.intermediateSteps,
        strategy: result.strategy,
        metrics: {
          totalTime: Date.now() - startTime,
          classificationTime: 0, // Classification is now instant
          responseTime,
          toolsUsed: [...new Set(toolsUsed)], // Remove duplicates
          cacheHit,
        },
      };
    } catch (error) {
      console.error("ChatBot processing error:", error);

      const errorResponse = this.generateContextualErrorResponse(query, error);

      this.sessionManager.addMessage(sessionId, {
        role: "assistant",
        content: errorResponse,
        timestamp: new Date(),
      });

      return {
        response: errorResponse,
        strategy: "error",
        metrics: {
          totalTime: Date.now() - startTime,
          classificationTime,
          responseTime,
          toolsUsed,
          cacheHit,
        },
      };
    }
  }

  // Get session for debugging/monitoring
  getSession(sessionId: string): ChatSession | null {
    return this.sessionManager.getSession(sessionId);
  }

  // Health check method
  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    services: {
      llm: boolean;
      database: boolean;
      vectorStore: boolean;
    };
    metrics: {
      activeSessions: number;
      cacheSize: number;
      avgResponseTime?: number;
    };
  }> {
    const services = {
      llm: true,
      database: true,
      vectorStore: true,
    };

    try {
      // Test LLM with timeout wrapper
      const testPromise = this.llmService.llm.invoke([
        { role: "user", content: "test" },
      ]);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("LLM timeout")), 5000)
      );

      await Promise.race([testPromise, timeoutPromise]);
    } catch (error) {
      console.error("LLM health check failed:", error);
      services.llm = false;
    }

    try {
      // Test database
      await prisma.$queryRaw`SELECT 1 as test`;
    } catch (error) {
      console.error("Database health check failed:", error);
      services.database = false;
    }

    try {
      // Test vector store if document tool is initialized
      if (this.documentTool) {
        await Promise.race([
          this.documentTool._call("test health check"),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Vector store timeout")), 5000)
          ),
        ]);
      }
    } catch (error) {
      console.error("Vector store health check failed:", error);
      services.vectorStore = false;
    }

    const activeSessions = this.sessionManager.getActiveSessionsCount();
    const cacheSize = this.responseCache.size;

    const healthyServices = Object.values(services).filter(Boolean).length;
    const status =
      healthyServices === 3
        ? "healthy"
        : healthyServices >= 2
        ? "degraded"
        : "unhealthy";

    return {
      status,
      services,
      metrics: {
        activeSessions,
        cacheSize,
      },
    };
  }

  // Cache management methods
  private generateCacheKey(query: string, userContext: UserContext): string {
    const normalizedQuery = query.toLowerCase().trim();
    return `${userContext.type}:${userContext.id}:${normalizedQuery}`;
  }

  private getCachedResponse(key: string): { response: string } | null {
    const cached = this.responseCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return { response: cached.response };
    }

    if (cached) {
      this.responseCache.delete(key); // Remove expired entry
    }

    return null;
  }

  private setCachedResponse(key: string, response: string): void {
    this.responseCache.set(key, {
      response,
      timestamp: Date.now(),
    });

    // Clean up old entries periodically
    if (this.responseCache.size > 1000) {
      this.cleanupCache();
    }
  }

  private shouldCacheResponse(query: string, response: string): boolean {
    const queryLower = query.toLowerCase();

    // Cache common queries
    const cacheable = [
      "hello",
      "hi",
      "thanks",
      "help",
      "what is sociohub",
      "how to",
      "guide",
    ];

    return (
      cacheable.some((term) => queryLower.includes(term)) ||
      response.length < 500
    ); // Cache shorter responses
  }

  private cleanupCache(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, value] of this.responseCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        toDelete.push(key);
      }
    }

    toDelete.forEach((key) => this.responseCache.delete(key));
  }

  private generateContextualErrorResponse(query: string, error: any): string {
    const queryLower = query.toLowerCase();

    if (error.message?.includes("timeout")) {
      return "I'm taking longer than expected to process your request. This might be due to high traffic. Please try again, or ask a more specific question.";
    }

    if (error.message?.includes("database")) {
      return "I'm having trouble accessing the SocioHub database right now. Please try again in a moment, or contact support if the issue persists.";
    }

    if (queryLower.includes("event")) {
      return "I encountered an issue while searching for event information. Please try rephrasing your question or specify which event you're interested in.";
    }

    if (queryLower.includes("society")) {
      return "I had trouble retrieving society information. Please try asking about a specific society or check your search terms.";
    }

    return "I apologize, but I encountered an unexpected error. Please try rephrasing your question or contact support if you continue experiencing issues.";
  }

  // Performance monitoring
  async getPerformanceMetrics(): Promise<{
    averageResponseTime: number;
    totalQueries: number;
    cacheHitRate: number;
    mostUsedTools: { tool: string; count: number }[];
    agentStats?: any; // Added optimized agent stats
  }> {
    // Get metrics from session manager
    const globalMetrics = this.sessionManager.getGlobalMetrics();

    // Get optimized agent stats
    const agentStats = this.optimizedAgent.getStats();

    return {
      averageResponseTime: globalMetrics.avgResponseTime,
      totalQueries: globalMetrics.totalQueries,
      cacheHitRate: this.calculateCacheHitRate(),
      mostUsedTools: globalMetrics.mostUsedTools.map((tool: string) => ({
        tool,
        count: 1, // You would track actual counts in a production system
      })),
      agentStats, // Include optimized agent performance data
    };
  }

  private calculateCacheHitRate(): number {
    // In a production system, you'd track cache hits/misses
    // For now, return a reasonable estimate based on cache size
    const cacheUtilization = Math.min(this.responseCache.size / 100, 1);
    return cacheUtilization * 0.3; // Rough estimate
  }

  // Enhanced cleanup method
  cleanup(): void {
    this.responseCache.clear();
    this.optimizedAgent.resetTools(); // Updated method call

    // Clear any intervals or timeouts
    if (this.sessionManager) {
      this.sessionManager.destroy?.();
    }
  }

  // Additional utility methods for better error handling and monitoring
  async validateServices(): Promise<boolean> {
    try {
      const healthCheck = await this.healthCheck();
      return healthCheck.status !== "unhealthy";
    } catch (error) {
      console.error("Service validation failed:", error);
      return false;
    }
  }

  async warmupServices(): Promise<void> {
    try {
      // Warm up LLM
      await this.llmService.llm.invoke([{ role: "user", content: "warmup" }]);

      // Warm up database connection
      await prisma.$connect();

      // Initialize document tool if not already done
      if (!this.documentTool) {
        await this.initializeDocuments();
      }

      console.log("ChatBot services warmed up successfully");
    } catch (error) {
      console.error("Service warmup failed:", error);
      throw error;
    }
  }

  // New method to get agent performance insights
  getAgentPerformance(): {
    isHealthy: boolean;
    stats: any;
  } {
    return {
      isHealthy: this.optimizedAgent.isHealthy(),
      stats: this.optimizedAgent.getStats(),
    };
  }

  // Method to force cache clear if needed
  clearCache(): void {
    this.responseCache.clear();
    this.optimizedAgent.resetTools(); // This also clears the agent's internal cache
  }
}

import { ChatMessage, ChatSession, UserContext } from "./types";
import { chatbotConfig } from "./config";

export class SessionManager {
  private sessions: Map<string, ChatSession> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_MESSAGES_PER_SESSION = 100;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Periodic cleanup of expired sessions
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  createSession(userId: string, userType: "student" | "advisor"): string {
    const sessionId = this.generateSessionId();
    const session: ChatSession = {
      id: sessionId,
      userId,
      userType,
      messages: [],
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
      metadata: {
        totalQueries: 0,
        avgResponseTime: 0,
        toolsUsed: [],
        classification: {
          simple: 0,
          complex: 0,
        },
      },
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  getSession(sessionId: string): ChatSession | null {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (Date.now() - session.lastActivity.getTime() > this.SESSION_TIMEOUT) {
      this.sessions.delete(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivity = new Date();
    return session;
  }

  addMessage(sessionId: string, message: ChatMessage): boolean {
    const session = this.getSession(sessionId);
    if (!session) {
      return false;
    }

    // Add message
    session.messages.push(message);

    // Update metadata
    if (message.role === "user") {
      session.metadata.totalQueries++;
    }

    // Trim messages if too many (keep recent history for performance)
    if (session.messages.length > this.MAX_MESSAGES_PER_SESSION) {
      const messagesToKeep = chatbotConfig.agent.maxHistory * 2; // Keep user+assistant pairs
      session.messages = session.messages.slice(-messagesToKeep);
    }

    session.lastActivity = new Date();
    return true;
  }

  updateSessionMetrics(
    sessionId: string,
    metrics: {
      responseTime?: number;
      toolsUsed?: string[];
      classification?: "simple" | "complex";
    }
  ): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    if (metrics.responseTime) {
      const currentAvg = session.metadata.avgResponseTime;
      const totalQueries = session.metadata.totalQueries;
      session.metadata.avgResponseTime =
        (currentAvg * (totalQueries - 1) + metrics.responseTime) / totalQueries;
    }

    if (metrics.toolsUsed) {
      session.metadata.toolsUsed.push(...metrics.toolsUsed);
      // Keep only unique tools and limit array size
      session.metadata.toolsUsed = [
        ...new Set(session.metadata.toolsUsed),
      ].slice(-10);
    }

    if (metrics.classification) {
      session.metadata.classification[metrics.classification]++;
    }
  }

  getSessionHistory(sessionId: string, limit?: number): ChatMessage[] {
    const session = this.getSession(sessionId);
    if (!session) {
      return [];
    }

    const messages = session.messages;
    return limit ? messages.slice(-limit) : messages;
  }

  getActiveSessionsCount(): number {
    const now = Date.now();
    let activeCount = 0;

    for (const session of this.sessions.values()) {
      if (now - session.lastActivity.getTime() < this.SESSION_TIMEOUT) {
        activeCount++;
      }
    }

    return activeCount;
  }

  getUserSessions(userId: string): ChatSession[] {
    const userSessions: ChatSession[] = [];
    const now = Date.now();

    for (const session of this.sessions.values()) {
      if (
        session.userId === userId &&
        now - session.lastActivity.getTime() < this.SESSION_TIMEOUT
      ) {
        userSessions.push(session);
      }
    }

    return userSessions.sort(
      (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()
    );
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  // Get optimized context for agent processing
  getOptimizedContext(sessionId: string): {
    recentMessages: ChatMessage[];
    userPreferences: any;
    sessionStats: any;
  } {
    const session = this.getSession(sessionId);
    if (!session) {
      return {
        recentMessages: [],
        userPreferences: {},
        sessionStats: {},
      };
    }

    // Get recent relevant messages (exclude simple greetings/thanks)
    const recentMessages = session.messages
      .slice(-chatbotConfig.agent.maxHistory * 2)
      .filter((msg) => {
        if (msg.role === "assistant") return true;

        // Filter out simple messages that don't add context
        const content = msg.content.toLowerCase();
        return !chatbotConfig.simplePatterns.some((pattern) =>
          pattern.test(content)
        );
      });

    // Extract user preferences from session history
    const userPreferences = this.extractUserPreferences(session);

    const sessionStats = {
      totalQueries: session.metadata.totalQueries,
      avgResponseTime: session.metadata.avgResponseTime,
      preferredTools: this.getMostUsedTools(session.metadata.toolsUsed),
      queryComplexity: session.metadata.classification,
    };

    return {
      recentMessages,
      userPreferences,
      sessionStats,
    };
  }

  private extractUserPreferences(session: ChatSession): any {
    const preferences: any = {
      topics: [],
      responseStyle: "detailed", // or 'concise'
      preferredDataFormat: "structured", // or 'narrative'
    };

    // Analyze message patterns to infer preferences
    const userMessages = session.messages
      .filter((msg) => msg.role === "user")
      .map((msg) => msg.content.toLowerCase());

    // Extract topic preferences
    const topicKeywords = {
      events: ["event", "events", "happening"],
      societies: ["society", "societies", "club", "clubs"],
      tasks: ["task", "tasks", "todo", "assignment"],
      registration: ["register", "registration", "signup"],
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const mentions = userMessages.filter((msg) =>
        keywords.some((keyword) => msg.includes(keyword))
      ).length;

      if (mentions >= 2) {
        preferences.topics.push(topic);
      }
    }

    // Infer response style preference
    const conciseIndicators = ["brief", "quick", "summary", "short"];
    const detailedIndicators = [
      "detail",
      "explain",
      "tell me more",
      "elaborate",
    ];

    const conciseMentions = userMessages.filter((msg) =>
      conciseIndicators.some((indicator) => msg.includes(indicator))
    ).length;

    const detailedMentions = userMessages.filter((msg) =>
      detailedIndicators.some((indicator) => msg.includes(indicator))
    ).length;

    if (conciseMentions > detailedMentions) {
      preferences.responseStyle = "concise";
    }

    return preferences;
  }

  private getMostUsedTools(toolsUsed: string[]): string[] {
    const toolCounts = toolsUsed.reduce((acc, tool) => {
      acc[tool] = (acc[tool] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(toolCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([tool]) => tool);
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity.getTime() > this.SESSION_TIMEOUT) {
        expiredSessions.push(sessionId);
      }
    }

    expiredSessions.forEach((sessionId) => {
      this.sessions.delete(sessionId);
    });

    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get session analytics
  getSessionAnalytics(sessionId: string): {
    duration: number;
    messageCount: number;
    avgResponseTime: number;
    toolUsage: Record<string, number>;
    queryTypes: Record<string, number>;
  } | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const duration =
      session.lastActivity.getTime() - session.createdAt.getTime();

    const toolUsage = session.metadata.toolsUsed.reduce((acc, tool) => {
      acc[tool] = (acc[tool] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      duration,
      messageCount: session.messages.length,
      avgResponseTime: session.metadata.avgResponseTime,
      toolUsage,
      queryTypes: session.metadata.classification,
    };
  }

  // Bulk operations for performance monitoring
  getAllActiveSessions(): ChatSession[] {
    const now = Date.now();
    return Array.from(this.sessions.values()).filter(
      (session) => now - session.lastActivity.getTime() < this.SESSION_TIMEOUT
    );
  }

  getGlobalMetrics(): {
    totalActiveSessions: number;
    totalQueries: number;
    avgResponseTime: number;
    mostUsedTools: string[];
    queryTypeDistribution: Record<string, number>;
  } {
    const activeSessions = this.getAllActiveSessions();

    let totalQueries = 0;
    let totalResponseTime = 0;
    const allTools: string[] = [];
    const queryTypes = { simple: 0, complex: 0 };

    activeSessions.forEach((session) => {
      totalQueries += session.metadata.totalQueries;
      totalResponseTime +=
        session.metadata.avgResponseTime * session.metadata.totalQueries;
      allTools.push(...session.metadata.toolsUsed);
      queryTypes.simple += session.metadata.classification.simple;
      queryTypes.complex += session.metadata.classification.complex;
    });

    const mostUsedTools = this.getMostUsedTools(allTools);
    const avgResponseTime =
      totalQueries > 0 ? totalResponseTime / totalQueries : 0;

    return {
      totalActiveSessions: activeSessions.length,
      totalQueries,
      avgResponseTime,
      mostUsedTools,
      queryTypeDistribution: queryTypes,
    };
  }

  // Cleanup method for graceful shutdown
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.sessions.clear();
  }
}

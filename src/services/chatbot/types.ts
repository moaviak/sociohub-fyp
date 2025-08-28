// Enhanced types for improved chatbot system

import { BaseMessage } from "@langchain/core/messages";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    processingTime?: number;
    toolsUsed?: string[];
    classification?: string;
    confidence?: number;
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  userType: "student" | "advisor";
  messages: ChatMessage[];
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
  metadata: SessionMetadata;
}

export interface SessionMetadata {
  totalQueries: number;
  avgResponseTime: number;
  toolsUsed: string[];
  classification: {
    simple: number;
    complex: number;
  };
  userPreferences?: UserPreferences;
  performanceMetrics?: PerformanceMetrics;
}

export interface UserPreferences {
  topics: string[];
  responseStyle: "concise" | "detailed";
  preferredDataFormat: "structured" | "narrative";
  language?: string;
  timezone?: string;
}

export interface PerformanceMetrics {
  fastestQuery: number;
  slowestQuery: number;
  cacheHitRate: number;
  toolSuccessRate: Record<string, number>;
}

export interface UserContext {
  id: string;
  type: "student" | "advisor";
  societyId?: string;
  preferences?: UserPreferences;
  permissions?: string[];
  metadata?: {
    joinDate?: Date;
    lastLogin?: Date;
    totalSessions?: number;
  };
}

export interface QueryClassification {
  type: "simple" | "complex";
  requiresTools: boolean;
  suggestedTools: string[];
  confidence: number;
  reasoning: string;
  estimatedComplexity?: "low" | "medium" | "high";
  expectedResponseTime?: number;
}

export interface ProcessingResult {
  response: string;
  intermediateSteps: IntermediateStep[];
  usedTools: boolean;
  processingTime: number;
  classification?: QueryClassification;
  cacheHit?: boolean;
  metrics?: {
    tokenUsage?: number;
    apiCalls?: number;
    databaseQueries?: number;
  };
}

export interface IntermediateStep {
  action: {
    tool: string;
    toolInput: any;
    toolCallId: string;
  };
  observation: string;
  processingTime?: number;
  success?: boolean;
  error?: string;
}

export interface ToolConfig {
  name: string;
  enabled: boolean;
  timeout: number;
  maxRetries?: number;
  priority?: number;
  parameters?: Record<string, any>;
}

export interface DatabaseFilter {
  name?: string;
  category?: string;
  interest?: string;
  status?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  eventId?: string;
  societyId?: string;
  audience?: string;
  location?: string;
  limit?: number;
  offset?: number;
}

export interface ParsedDatabaseQuery {
  queryType:
    | "events"
    | "societies"
    | "tasks"
    | "event_details"
    | "society_details"
    | "registrations"
    | "general";
  filters: DatabaseFilter;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  confidence: number;
  reasoning?: string;
}

export interface CacheEntry {
  response: string;
  timestamp: number;
  hitCount: number;
  lastAccessed: Date;
  metadata?: {
    userType: string;
    queryType: string;
    tools: string[];
  };
}

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  services: {
    llm: boolean;
    database: boolean;
    vectorStore: boolean;
    cache?: boolean;
  };
  metrics: {
    activeSessions: number;
    cacheSize: number;
    avgResponseTime?: number;
    errorRate?: number;
  };
  timestamp: Date;
}

export interface PerformanceReport {
  timeRange: {
    start: Date;
    end: Date;
  };
  totalQueries: number;
  averageResponseTime: number;
  successRate: number;
  toolUsageStats: Record<
    string,
    {
      count: number;
      avgTime: number;
      successRate: number;
    }
  >;
  queryTypeDistribution: Record<string, number>;
  userTypeDistribution: Record<string, number>;
  peakUsageHours: number[];
  slowestQueries: Array<{
    query: string;
    responseTime: number;
    timestamp: Date;
  }>;
}

export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  context?: {
    userId: string;
    sessionId: string;
    query: string;
    stage: string;
  };
  recoverable: boolean;
  suggestedAction?: string;
}

// Event types for real-time updates
export interface ToolStatusEvent {
  tool: string;
  status: "running" | "complete" | "error";
  message: string;
  progress?: number;
  metadata?: Record<string, any>;
}

export interface QueryProgressEvent {
  stage: "classification" | "tool_selection" | "processing" | "complete";
  message: string;
  progress: number;
  estimatedTimeRemaining?: number;
}

// Configuration interfaces
export interface LLMConfig {
  model: string;
  fastModel: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export interface AgentConfig {
  maxIterations: number;
  recursionLimit: number;
  timeout: number;
  maxHistory: number;
}

export interface CacheConfig {
  ttl: number;
  maxSize: number;
  enabled: boolean;
}

export interface MonitoringConfig {
  logLevel: "debug" | "info" | "warn" | "error";
  enablePerformanceLogging: boolean;
  enableErrorTracking: boolean;
  metricsRetentionDays: number;
}

export interface RouteDecision {
  strategy: "direct" | "single_tool" | "sequential" | "parallel";
  tools: string[];
  confidence: number;
  reasoning: string;
  matchedPatterns?: string[];
  queryAnalysis?: {
    keywords: string[];
    entities: string[];
    intent: string;
    complexity: "simple" | "moderate" | "complex";
    urgency: "low" | "medium" | "high";
  };
  classificationMethod: "llm" | "pattern" | "hybrid";
}

export interface ClassificationContext {
  query: string;
  userContext?: any;
  chatHistory: BaseMessage[];
  timeConstraint?: number; // ms for fast responses
}

// Utility types
export type QueryType = "simple" | "complex";
export type UserType = "student" | "advisor";
export type ToolName = "database_query" | "document_retrieval" | "web_search";
export type ResponseStyle = "concise" | "detailed";
export type DataFormat = "structured" | "narrative";

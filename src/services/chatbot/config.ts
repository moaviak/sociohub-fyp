export const chatbotConfig = {
  llm: {
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    fastModel: "arcee-ai/AFM-4.5B", // For quick classifications
    maxTokens: 2000,
    temperature: 0.3,
    timeout: 30000, // 30 seconds
  },
  pinecone: {
    environment: process.env.PINECONE_ENVIRONMENT || "us-east-1-aws",
    indexName: process.env.PINECONE_INDEX_NAME || "sociohub-docs",
    dimension: 768, // Correct dimension for all-MiniLM-L6-v2
  },
  tavily: {
    apiKey: process.env.TAVILY_API_KEY,
  },
  embedding: {
    // Use the same model consistently
    model: "sentence-transformers/distilbert-base-nli-mean-tokens",
    chunkSize: 800, // Increased for better context
    chunkOverlap: 100, // Better overlap
  },
  session: {
    maxMessages: 20,
    ttl: 3600000, // 1 hour
  },
  agent: {
    maxIterations: 3, // Reduced for faster response
    recursionLimit: 12,
    verbose: false, // Disable verbose for production
    timeout: 25000, // 25 seconds
    maxHistory: 4, // Reduced context for speed
  },
  cache: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 1000,
    enabled: true,
  },
  performance: {
    enableMetrics: true,
    logSlowQueries: true,
    slowQueryThreshold: 10000, // 10 seconds
    maxConcurrentQueries: 10,
  },

  tools: {
    database: {
      timeout: 10000, // 10 seconds
      maxResults: 20,
      enableLLMParsing: true,
    },
    document: {
      timeout: 15000, // 15 seconds
      maxResults: 5,
      enhanceQuery: true,
    },
    webSearch: {
      timeout: 20000, // 20 seconds
      maxResults: 5,
      enabled: true,
    },
  },
  // Simple query classification patterns
  simplePatterns: [
    /^(hi|hello|hey|sup)[\s!.]*$/i,
    /^(thanks|thank you|thx)[\s!.]*$/i,
    /^(bye|goodbye|see you)[\s!.]*$/i,
    /^(yes|no|ok|okay)[\s!.]*$/i,
    /^(how are you|what's up|how's it going)[\s!.]*$/i,
  ],
  // Performance optimization settings
  optimization: {
    useParallelProcessing: true,
    enableQueryOptimization: true,
    preloadCommonResponses: true,
    batchDatabaseQueries: true,
  },

  // Monitoring and logging
  monitoring: {
    logLevel: "info", // debug, info, warn, error
    enablePerformanceLogging: true,
    enableErrorTracking: true,
    metricsRetentionDays: 7,
  },
};

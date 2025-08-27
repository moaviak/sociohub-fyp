import {
  BaseMessage,
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { LLMService } from "./llm.service";
import { ChatMessage, UserContext } from "./types";
import { DocumentRetrievalTool } from "./tools/document.tool";
import { DatabaseQueryTool } from "./tools/database.tool";
import { WebSearchTool } from "./tools/web-search.tool";
import { emitEventToUser } from "../../socket";
import { io } from "../../app";

interface AgentResponse {
  response: string;
  intermediateSteps: any[];
  usedTools: boolean;
  processingTime: number;
  strategy: string;
}

interface RouteDecision {
  strategy: "direct" | "single_tool" | "sequential" | "parallel";
  tools: string[];
  confidence: number;
  reasoning: string;
  matchedPatterns?: string[];
  queryAnalysis?: {
    keywords: string[];
    entities: string[];
    intent: string;
  };
}

// Enhanced keyword-based classifier with better patterns and debugging
class IntentClassifier {
  private static patterns = {
    // Database queries - more comprehensive patterns for data requests
    database: [
      // Direct entity queries
      /\b(events?|tasks?|registrations?|societies?|members?|users?|meetings?)\b/i,

      // Action + entity patterns
      /\b(count|how\s+many|total|number\s+of)\b.*\b(event|task|society|member|user|registration)\b/i,
      /\b(list|show|display|find|search|get|fetch)\b.*\b(event|task|society|member|user|registration)\b/i,
      /\b(when|what\s+time|schedule)\b.*\b(event|meeting|deadline|task)\b/i,
      /\b(where|location|venue)\b.*\b(event|meeting|society)\b/i,
      /\b(who|which\s+user|member)\b.*\b(registered|joined|created|assigned)\b/i,

      // Temporal queries
      /\b(my|upcoming|recent|past|today|tomorrow|this\s+week|next\s+week)\b.*\b(events?|tasks?|registrations?)\b/i,
      /\b(due|deadline|expires?|scheduled)\b.*\b(tasks?|events?|assignments?)\b/i,

      // Status queries
      /\b(completed|pending|active|inactive|cancelled)\b.*\b(events?|tasks?|registrations?)\b/i,
      /\b(status|progress|state)\s+of.*\b(event|task|registration|society)\b/i,

      // Relationship queries
      /\b(members?\s+of|users?\s+in|participants?\s+in)\b.*\b(society|event|group)\b/i,
      /\b(societies|groups|organizations)\s+(i\s+)?(joined|belong\s+to|member\s+of)\b/i,

      // Statistics and analytics
      /\b(statistics|stats|analytics|report|summary)\b.*\b(event|society|member|user)\b/i,
      /\b(most\s+popular|trending|active|frequent)\b.*\b(event|society|task)\b/i,
    ],

    // Document retrieval - enhanced patterns for guides and explanations
    document: [
      // How-to and instruction patterns
      /\b(how\s+to|how\s+do\s+i|how\s+can\s+i|tutorial|guide|instructions?|help\s+me)\b/i,
      /\b(steps?|process|procedure|method|way\s+to)\b/i,
      /\b(setup|configure|install|enable|disable|activate)\b/i,

      // Definition and explanation patterns
      /\b(what\s+is|define|definition|meaning|explain|describe)\b/i,
      /\b(purpose|function|role|responsibility)\s+of\b/i,
      /\b(difference\s+between|compare|contrast)\b/i,

      // Feature and functionality queries
      /\b(feature|functionality|capability|option|setting)\b/i,
      /\b(can\s+i|is\s+it\s+possible|does\s+sociohub|platform\s+support)\b/i,
      /\b(workflow|business\s+logic|best\s+practices)\b/i,

      // Troubleshooting patterns
      /\b(problem|issue|error|bug|not\s+working|failed|trouble)\b/i,
      /\b(why|reason|cause|solution|fix|resolve)\b/i,
      /\b(permission|access|authorization|authentication)\b/i,

      // Navigation and UI help
      /\b(where\s+to\s+find|navigate|menu|button|page|section)\b/i,
      /\b(interface|dashboard|panel|screen|view)\b/i,
    ],

    // Web search - external information patterns
    web: [
      // Current events and news
      /\b(news|current|latest|recent|update|breaking)\b/i,
      /\b(today|yesterday|this\s+week|last\s+week|recently)\b.*\b(news|update|announcement)\b/i,

      // External references
      /\b(outside|external|internet|google|search|online)\b/i,
      /\b(website|url|link|external\s+resource)\b/i,

      // Real-time data
      /\b(weather|temperature|forecast|stock|price|market|rate)\b/i,
      /\b(trending|viral|popular|social\s+media)\b/i,
      /\b(competition|competitor|alternative|similar\s+platform)\b/i,

      // Technology and updates
      /\b(technology|tech|software|update|version|release)\b/i,
      /\b(industry|market|business|company)\b.*\b(news|update|trend)\b/i,
    ],

    // Direct response - conversational patterns
    direct: [
      // Greetings
      /^(hi|hello|hey|good\s+(morning|afternoon|evening)|greetings)/i,
      /\b(how\s+are\s+you|how\s+do\s+you\s+do)\b/i,

      // Gratitude and farewells
      /\b(thank\s*you|thanks|appreciate|grateful|bye|goodbye|see\s+you|farewell)\b/i,

      // Identity and capability queries
      /^(what\s+(can\s+you\s+do|are\s+your\s+capabilities|do\s+you\s+know))/i,
      /^(who\s+are\s+you|what\s+is\s+sociobot|tell\s+me\s+about\s+yourself)/i,
      /^(your\s+(name|purpose|function|role))/i,

      // Simple acknowledgments
      /^(ok|okay|yes|no|sure|alright|got\s+it|i\s+see)$/i,

      // Help requests (general)
      /^(help|assist|support)$/i,
    ],

    // Hybrid patterns - queries that might need multiple tools
    hybrid: [
      // Complex analytical queries
      /\b(analyze|analysis|compare|comparison|relationship)\b.*\b(event|society|member)\b/i,
      /\b(recommendation|suggest|recommend|advice)\b.*\b(event|society|task)\b/i,
      /\b(optimization|improve|enhance|better\s+way)\b/i,

      // Workflow queries
      /\b(workflow|process|pipeline|integration)\b/i,
      /\b(automate|automation|scheduled|recurring)\b/i,
    ],
  };

  // Keywords for entity extraction
  private static entities = {
    sociohub: ["sociohub", "platform", "system", "application", "app"],
    events: [
      "event",
      "events",
      "meeting",
      "meetings",
      "conference",
      "workshop",
      "seminar",
    ],
    societies: [
      "society",
      "societies",
      "club",
      "clubs",
      "group",
      "groups",
      "organization",
      "organizations",
    ],
    users: [
      "user",
      "users",
      "member",
      "members",
      "participant",
      "participants",
      "person",
      "people",
    ],
    tasks: [
      "task",
      "tasks",
      "assignment",
      "assignments",
      "work",
      "todo",
      "job",
    ],
    registrations: [
      "registration",
      "registrations",
      "signup",
      "enrollment",
      "booking",
    ],
  };

  // Action keywords
  private static actions = {
    retrieve: [
      "get",
      "fetch",
      "find",
      "search",
      "show",
      "display",
      "list",
      "retrieve",
    ],
    create: ["create", "add", "new", "make", "generate", "establish", "setup"],
    update: ["update", "edit", "modify", "change", "alter", "revise"],
    delete: ["delete", "remove", "cancel", "destroy", "eliminate"],
    count: ["count", "number", "total", "how many", "quantity"],
  };

  static classify(query: string): RouteDecision {
    console.log(
      `🔍 [IntentClassifier] Starting classification for query: "${query}"`
    );

    const cleanQuery = query.toLowerCase().trim();
    const matchedPatterns: string[] = [];
    const queryAnalysis = this.analyzeQuery(cleanQuery);

    console.log(`📊 [IntentClassifier] Query analysis:`, queryAnalysis);

    // Check direct patterns first (fastest response)
    console.log(`🎯 [IntentClassifier] Checking direct response patterns...`);
    for (const pattern of this.patterns.direct) {
      if (pattern.test(cleanQuery)) {
        matchedPatterns.push(`direct: ${pattern.toString()}`);
        console.log(
          `✅ [IntentClassifier] Direct pattern matched: ${pattern.toString()}`
        );
        return {
          strategy: "direct",
          tools: [],
          confidence: 0.95,
          reasoning: "Simple conversational query - direct response",
          matchedPatterns,
          queryAnalysis,
        };
      }
    }

    // Check for specific tool patterns
    console.log(`🔍 [IntentClassifier] Checking tool-specific patterns...`);
    const toolMatches = {
      database: this.checkPatterns(
        cleanQuery,
        this.patterns.database,
        "database"
      ),
      document: this.checkPatterns(
        cleanQuery,
        this.patterns.document,
        "document"
      ),
      web: this.checkPatterns(cleanQuery, this.patterns.web, "web"),
      hybrid: this.checkPatterns(cleanQuery, this.patterns.hybrid, "hybrid"),
    };

    console.log(`📈 [IntentClassifier] Tool pattern matches:`, toolMatches);

    // Collect all matched patterns
    Object.entries(toolMatches).forEach(([tool, matches]) => {
      matches.patterns.forEach((pattern) => {
        matchedPatterns.push(`${tool}: ${pattern}`);
      });
    });

    // Get tools that matched
    const matchedTools = Object.entries(toolMatches)
      .filter(([_, data]) => data.matched)
      .map(([tool, _]) => tool);

    console.log(
      `🎯 [IntentClassifier] Matched tools: ${matchedTools.join(", ")}`
    );

    // Enhanced decision logic
    if (matchedTools.length === 0) {
      console.log(
        `⚠️ [IntentClassifier] No patterns matched - using fallback strategy`
      );

      // Use entity analysis for fallback
      if (queryAnalysis.entities.length > 0) {
        console.log(
          `🔄 [IntentClassifier] Found entities, defaulting to database search`
        );
        return {
          strategy: "single_tool",
          tools: ["database"],
          confidence: 0.4,
          reasoning: "No clear pattern, but found entities - trying database",
          matchedPatterns,
          queryAnalysis,
        };
      }

      console.log(
        `📚 [IntentClassifier] No entities found, defaulting to document search`
      );
      return {
        strategy: "single_tool",
        tools: ["document"],
        confidence: 0.3,
        reasoning: "General query, checking documentation",
        matchedPatterns,
        queryAnalysis,
      };
    }

    // Single tool strategy
    if (matchedTools.length === 1 && !matchedTools.includes("hybrid")) {
      const tool = matchedTools[0];
      const confidence =
        toolMatches[tool as keyof typeof toolMatches].confidence;

      console.log(
        `🎯 [IntentClassifier] Single tool strategy: ${tool} (confidence: ${confidence})`
      );
      return {
        strategy: "single_tool",
        tools: [tool],
        confidence,
        reasoning: `Clear ${tool} query detected`,
        matchedPatterns,
        queryAnalysis,
      };
    }

    // Multiple tools or hybrid - decide strategy
    console.log(
      `🔀 [IntentClassifier] Multiple tools detected, determining strategy...`
    );

    // Remove hybrid from tools list for execution
    const executionTools = matchedTools.filter((tool) => tool !== "hybrid");

    // Sequential strategy conditions
    if (this.shouldUseSequential(executionTools, queryAnalysis)) {
      const orderedTools = this.orderToolsForSequential(
        executionTools,
        queryAnalysis
      );
      console.log(
        `➡️ [IntentClassifier] Using sequential strategy with tools: ${orderedTools.join(
          " → "
        )}`
      );

      return {
        strategy: "sequential",
        tools: orderedTools,
        confidence: 0.75,
        reasoning: "Sequential execution needed - tools have dependencies",
        matchedPatterns,
        queryAnalysis,
      };
    }

    // Parallel strategy for independent tools
    console.log(
      `🚀 [IntentClassifier] Using parallel strategy with tools: ${executionTools.join(
        " + "
      )}`
    );
    return {
      strategy: "parallel",
      tools: executionTools,
      confidence: 0.65,
      reasoning: "Multiple independent information sources needed",
      matchedPatterns,
      queryAnalysis,
    };
  }

  private static checkPatterns(
    query: string,
    patterns: RegExp[],
    toolName: string
  ) {
    const matches = patterns.filter((pattern) => pattern.test(query));
    const confidence =
      matches.length > 0 ? Math.min(0.9, 0.6 + matches.length * 0.1) : 0;

    if (matches.length > 0) {
      console.log(
        `✅ [IntentClassifier] ${toolName} patterns matched: ${matches.length}`
      );
    }

    return {
      matched: matches.length > 0,
      confidence,
      patterns: matches.map((p) => p.toString()),
    };
  }

  private static analyzeQuery(query: string) {
    console.log(`🔬 [IntentClassifier] Analyzing query structure...`);

    // Extract keywords
    const words = query.split(/\s+/).filter((word) => word.length > 2);
    const keywords = words.filter(
      (word) =>
        !["the", "and", "for", "are", "but", "not", "you", "all"].includes(word)
    );

    // Extract entities
    const entities: string[] = [];
    Object.entries(this.entities).forEach(([category, entityWords]) => {
      entityWords.forEach((entity) => {
        if (query.includes(entity)) {
          entities.push(`${category}:${entity}`);
        }
      });
    });

    // Determine intent
    let intent = "unknown";
    Object.entries(this.actions).forEach(([action, actionWords]) => {
      if (actionWords.some((word) => query.includes(word))) {
        intent = action;
      }
    });

    const analysis = { keywords, entities, intent };
    console.log(`📋 [IntentClassifier] Analysis complete:`, analysis);

    return analysis;
  }

  private static shouldUseSequential(tools: string[], analysis: any): boolean {
    // Database + document is common sequential pattern
    if (tools.includes("database") && tools.includes("document")) {
      console.log(
        `🔄 [IntentClassifier] Database + Document detected - using sequential`
      );
      return true;
    }

    // Queries that need context building
    const contextualKeywords = ["explain", "why", "how", "analyze", "compare"];
    if (
      contextualKeywords.some((keyword) => analysis.keywords.includes(keyword))
    ) {
      console.log(
        `🔄 [IntentClassifier] Contextual query detected - using sequential`
      );
      return true;
    }

    return false;
  }

  private static orderToolsForSequential(
    tools: string[],
    analysis: any
  ): string[] {
    console.log(
      `📋 [IntentClassifier] Ordering tools for sequential execution...`
    );

    // Default order: database → document → web
    const order = ["database", "document", "web"];
    const orderedTools = order.filter((tool) => tools.includes(tool));

    console.log(
      `➡️ [IntentClassifier] Tool execution order: ${orderedTools.join(" → ")}`
    );
    return orderedTools;
  }
}

// Direct function calling agent for single tool usage
class DirectToolAgent {
  public llmService: LLMService;
  private tools: Map<string, any> = new Map();

  constructor(llmService: LLMService) {
    this.llmService = llmService;
    console.log(`🛠️ [DirectToolAgent] Initialized with LLM service`);
  }

  async initializeTools(userContext: UserContext) {
    console.log(
      `🔧 [DirectToolAgent] Initializing tools for user: ${userContext.id}`
    );

    if (!this.tools.has("document")) {
      console.log(
        `📚 [DirectToolAgent] Initializing document retrieval tool...`
      );
      const docTool = new DocumentRetrievalTool(
        this.llmService.embeddings,
        userContext
      );
      await docTool.initialize();
      this.tools.set("document", docTool);
      console.log(`✅ [DirectToolAgent] Document tool initialized`);
    }

    if (!this.tools.has("database")) {
      console.log(`💾 [DirectToolAgent] Initializing database query tool...`);
      this.tools.set("database", new DatabaseQueryTool(userContext));
      console.log(`✅ [DirectToolAgent] Database tool initialized`);
    }

    if (!this.tools.has("web")) {
      console.log(`🌐 [DirectToolAgent] Initializing web search tool...`);
      this.tools.set("web", new WebSearchTool(userContext));
      console.log(`✅ [DirectToolAgent] Web search tool initialized`);
    }

    console.log(
      `🎉 [DirectToolAgent] All tools initialized. Available tools: ${Array.from(
        this.tools.keys()
      ).join(", ")}`
    );
  }

  async executeSingleTool(
    toolName: string,
    query: string,
    userContext: UserContext
  ): Promise<{ result: string; toolOutput: string }> {
    console.log(
      `🚀 [DirectToolAgent] Executing ${toolName} tool with query: "${query}"`
    );

    const tool = this.tools.get(toolName);
    if (!tool) {
      console.error(`❌ [DirectToolAgent] Tool ${toolName} not available`);
      throw new Error(`Tool ${toolName} not available`);
    }

    try {
      // Pass query string directly to tools
      const processedQuery = this.processQueryForTool(toolName, query);
      console.log(
        `⚙️ [DirectToolAgent] Processed query for ${toolName}: "${processedQuery}"`
      );

      const startTime = Date.now();
      const toolOutput: string = await tool.invoke(processedQuery);
      const executionTime = Date.now() - startTime;

      console.log(
        `✅ [DirectToolAgent] ${toolName} tool executed in ${executionTime}ms`
      );
      console.log(
        `📄 [DirectToolAgent] Tool output length: ${toolOutput.length} characters`
      );

      // Generate response using LLM with tool output
      const response = await this.generateResponseFromTool(
        query,
        toolOutput,
        toolName,
        userContext
      );

      console.log(
        `🎯 [DirectToolAgent] Generated response length: ${response.length} characters`
      );
      return { result: response, toolOutput };
    } catch (error) {
      console.error(`❌ [DirectToolAgent] Error executing ${toolName}:`, error);
      throw error;
    }
  }

  private processQueryForTool(toolName: string, query: string): string {
    console.log(
      `⚙️ [DirectToolAgent] Processing query for ${toolName} tool...`
    );

    switch (toolName) {
      case "database":
        return this.extractDatabaseQuery(query);
      case "document":
        return this.extractDocumentQuery(query);
      case "web":
        return this.extractWebQuery(query);
      default:
        console.log(
          `⚠️ [DirectToolAgent] No specific processing for ${toolName}, using original query`
        );
        return query;
    }
  }

  private extractDatabaseQuery(query: string): string {
    console.log(`💾 [DirectToolAgent] Extracting database query...`);

    // Extract relevant parts for database search
    const keywords = query.match(
      /\b(events?|tasks?|societies?|members?|registrations?)\b/gi
    );
    const result = keywords ? keywords.join(" ") + " " + query : query;

    console.log(`💾 [DirectToolAgent] Database query extracted: "${result}"`);
    return result;
  }

  private extractDocumentQuery(query: string): string {
    console.log(`📚 [DirectToolAgent] Extracting document query...`);

    // Clean query for documentation search
    const result = query
      .replace(/^(how\s+to|what\s+is|explain)\s+/i, "")
      .trim();

    console.log(`📚 [DirectToolAgent] Document query extracted: "${result}"`);
    return result;
  }

  private extractWebQuery(query: string): string {
    console.log(`🌐 [DirectToolAgent] Extracting web query...`);

    // Optimize for web search
    const result = query
      .replace(/\b(search\s+for|look\s+up|find)\s+/i, "")
      .trim();

    console.log(`🌐 [DirectToolAgent] Web query extracted: "${result}"`);
    return result;
  }

  private async generateResponseFromTool(
    originalQuery: string,
    toolOutput: string,
    toolName: string,
    userContext: UserContext
  ): Promise<string> {
    console.log(
      `🧠 [DirectToolAgent] Generating response from ${toolName} tool output...`
    );

    const systemPrompt = `You are SocioBot. A user asked: "${originalQuery}"

The ${toolName} tool returned: ${toolOutput}

Generate a helpful, concise response based on this information. If the tool returned no useful results, acknowledge this and provide general guidance.

Keep your response conversational and under 150 words.`;

    try {
      const startTime = Date.now();
      const response = await this.llmService.llm.invoke([
        new SystemMessage(systemPrompt),
      ]);
      const llmTime = Date.now() - startTime;

      console.log(
        `🧠 [DirectToolAgent] LLM response generated in ${llmTime}ms`
      );

      const result =
        response.content?.toString() ||
        "I found some information, but couldn't format a proper response. Please try rephrasing your question.";

      console.log(`✅ [DirectToolAgent] Final response generated successfully`);
      return result;
    } catch (error) {
      console.error(
        `❌ [DirectToolAgent] Error generating response from tool output:`,
        error
      );
      return `I retrieved some information about your query, but encountered an issue formatting the response. Please try asking in a different way.`;
    }
  }
}

// Sequential agent for dependent tool calls
class SequentialAgent {
  private directAgent: DirectToolAgent;

  constructor(directAgent: DirectToolAgent) {
    this.directAgent = directAgent;
    console.log(`🔗 [SequentialAgent] Initialized`);
  }

  async executeSequential(
    tools: string[],
    query: string,
    userContext: UserContext
  ): Promise<{
    result: string;
    toolOutputs: Array<{ tool: string; output: string; error?: string }>;
  }> {
    console.log(
      `🔗 [SequentialAgent] Starting sequential execution with tools: ${tools.join(
        " → "
      )}`
    );

    const toolOutputs: Array<{ tool: string; output: string; error?: string }> =
      [];
    let accumulatedContext = query;

    for (let i = 0; i < tools.length; i++) {
      const toolName = tools[i];
      console.log(
        `🔗 [SequentialAgent] Step ${i + 1}/${
          tools.length
        }: Executing ${toolName}`
      );

      try {
        const stepStartTime = Date.now();
        const { result, toolOutput } = await this.directAgent.executeSingleTool(
          toolName,
          accumulatedContext,
          userContext
        );
        const stepTime = Date.now() - stepStartTime;

        console.log(
          `✅ [SequentialAgent] Step ${i + 1} completed in ${stepTime}ms`
        );
        toolOutputs.push({ tool: toolName, output: toolOutput });

        // Use the result to inform the next tool call
        accumulatedContext = `${query}\n\nPrevious context: ${result}`;
        console.log(
          `🔄 [SequentialAgent] Updated context for next tool (length: ${accumulatedContext.length})`
        );
      } catch (error) {
        console.error(
          `❌ [SequentialAgent] Step ${i + 1} failed for ${toolName}:`,
          error
        );
        // Continue with remaining tools
        toolOutputs.push({
          tool: toolName,
          output: "",
          error: (error as Error).message,
        });
      }
    }

    console.log(
      `🎯 [SequentialAgent] All steps completed, generating final response...`
    );

    // Generate final response from all outputs
    const finalResponse = await this.generateFinalResponse(
      query,
      toolOutputs,
      userContext
    );

    console.log(`✅ [SequentialAgent] Sequential execution completed`);
    return { result: finalResponse, toolOutputs };
  }

  private async generateFinalResponse(
    query: string,
    toolOutputs: Array<{ tool: string; output: string; error?: string }>,
    userContext: UserContext
  ): Promise<string> {
    console.log(
      `🧠 [SequentialAgent] Generating final response from ${toolOutputs.length} tool outputs...`
    );

    const contextSummary = toolOutputs
      .filter((output) => output.output)
      .map((output) => `${output.tool}: ${output.output}`)
      .join("\n");

    console.log(
      `📊 [SequentialAgent] Context summary length: ${contextSummary.length} characters`
    );

    const systemPrompt = `You are SocioBot. A user asked: "${query}"

I gathered information from multiple sources:
${contextSummary}

Synthesize this information into a comprehensive, helpful response. Be concise but complete.`;

    try {
      const startTime = Date.now();
      const response = await this.directAgent.llmService.llm.invoke([
        new SystemMessage(systemPrompt),
      ]);
      const llmTime = Date.now() - startTime;

      console.log(
        `🧠 [SequentialAgent] Final response generated in ${llmTime}ms`
      );

      const result =
        response.content?.toString() ||
        "I gathered information from multiple sources but couldn't synthesize a proper response.";

      console.log(`✅ [SequentialAgent] Final response ready`);
      return result;
    } catch (error) {
      console.error(
        `❌ [SequentialAgent] Error generating final response:`,
        error
      );
      return "I found relevant information but encountered an issue preparing the final response.";
    }
  }
}

// Parallel execution agent for independent tool calls
class ParallelAgent {
  private directAgent: DirectToolAgent;

  constructor(directAgent: DirectToolAgent) {
    this.directAgent = directAgent;
    console.log(`🚀 [ParallelAgent] Initialized`);
  }

  async executeParallel(
    tools: string[],
    query: string,
    userContext: UserContext
  ): Promise<{
    result: string;
    toolOutputs: Array<{
      tool: string;
      output: string;
      success: boolean;
      error?: string;
    }>;
  }> {
    console.log(
      `🚀 [ParallelAgent] Starting parallel execution with tools: ${tools.join(
        " + "
      )}`
    );

    // Execute all tools in parallel with timeout
    const toolPromises = tools.map(async (toolName, index) => {
      console.log(
        `🚀 [ParallelAgent] Launching ${toolName} (${index + 1}/${
          tools.length
        })`
      );

      try {
        const toolStartTime = Date.now();
        const result = await Promise.race([
          this.directAgent.executeSingleTool(toolName, query, userContext),
          new Promise<never>((_, reject) =>
            setTimeout(() => {
              console.log(`⏰ [ParallelAgent] ${toolName} timed out after 10s`);
              reject(new Error(`${toolName} timeout`));
            }, 10000)
          ),
        ]);
        const toolTime = Date.now() - toolStartTime;

        console.log(
          `✅ [ParallelAgent] ${toolName} completed successfully in ${toolTime}ms`
        );
        return { tool: toolName, output: result.toolOutput, success: true };
      } catch (error) {
        console.error(`❌ [ParallelAgent] ${toolName} failed:`, error);
        return {
          tool: toolName,
          output: "",
          success: false,
          error: (error as Error).message,
        };
      }
    });

    const toolOutputs = await Promise.all(toolPromises);

    const successCount = toolOutputs.filter((output) => output.success).length;
    console.log(
      `📊 [ParallelAgent] Parallel execution completed: ${successCount}/${tools.length} tools succeeded`
    );

    // Generate response from successful results
    const finalResponse = await this.generateCombinedResponse(
      query,
      toolOutputs,
      userContext
    );

    console.log(`✅ [ParallelAgent] Parallel execution completed`);
    return { result: finalResponse, toolOutputs };
  }

  private async generateCombinedResponse(
    query: string,
    toolOutputs: Array<{
      tool: string;
      output: string;
      success: boolean;
      error?: string;
    }>,
    userContext: UserContext
  ): Promise<string> {
    console.log(
      `🧠 [ParallelAgent] Generating combined response from ${toolOutputs.length} tool results...`
    );

    const successfulOutputs = toolOutputs.filter(
      (output) => output.success && output.output
    );

    console.log(
      `📊 [ParallelAgent] Processing ${successfulOutputs.length} successful outputs`
    );

    if (successfulOutputs.length === 0) {
      console.log(
        `⚠️ [ParallelAgent] No successful outputs, returning fallback response`
      );
      return "I searched multiple sources but couldn't find specific information. Could you try rephrasing your question?";
    }

    const contextSummary = successfulOutputs
      .map((output) => `${output.tool}: ${output.output}`)
      .join("\n");

    console.log(
      `📊 [ParallelAgent] Context summary length: ${contextSummary.length} characters`
    );

    const systemPrompt = `You are SocioBot. A user asked: "${query}"

I searched multiple sources simultaneously and found:
${contextSummary}

Combine this information into a comprehensive response. Prioritize the most relevant information.`;

    try {
      const startTime = Date.now();
      const response = await this.directAgent.llmService.llm.invoke([
        new SystemMessage(systemPrompt),
      ]);
      const llmTime = Date.now() - startTime;

      console.log(
        `🧠 [ParallelAgent] Combined response generated in ${llmTime}ms`
      );

      const result =
        response.content?.toString() ||
        "I found information from multiple sources but couldn't combine them properly.";

      console.log(`✅ [ParallelAgent] Combined response ready`);
      return result;
    } catch (error) {
      console.error(
        `❌ [ParallelAgent] Error generating combined response:`,
        error
      );
      return "I gathered information from multiple sources but encountered an issue combining the results.";
    }
  }
}

export class OptimizedChatbotAgent {
  private llmService: LLMService;
  private directAgent: DirectToolAgent;
  private sequentialAgent: SequentialAgent;
  private parallelAgent: ParallelAgent;
  private responseCache: Map<string, { response: string; timestamp: number }> =
    new Map();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Enhanced direct response templates
  private static directResponses = {
    greeting: {
      responses: [
        "Hello! I'm SocioBot, your SocioHub assistant. I can help you with events, societies, tasks, and platform features. What would you like to know?",
        "Hi there! Welcome to SocioHub. I'm here to help you navigate events, societies, and platform features. How can I assist you today?",
        "Hey! I'm SocioBot, ready to help you with anything related to SocioHub - from finding events to understanding platform features. What can I do for you?",
      ],
      getResponse: () =>
        OptimizedChatbotAgent.directResponses.greeting.responses[
          Math.floor(
            Math.random() *
              OptimizedChatbotAgent.directResponses.greeting.responses.length
          )
        ],
    },
    capabilities: {
      responses: [
        "I can help you with:\n• Finding and managing events\n• Exploring societies and groups\n• Tracking tasks and deadlines\n• Understanding SocioHub features\n• Navigating the platform\n\nWhat specific information do you need?",
        "Here's what I can assist you with:\n• Event discovery and registration\n• Society information and membership\n• Task management and deadlines\n• Platform tutorials and guides\n• General SocioHub questions\n\nHow can I help you today?",
      ],
      getResponse: () =>
        OptimizedChatbotAgent.directResponses.capabilities.responses[
          Math.floor(
            Math.random() *
              OptimizedChatbotAgent.directResponses.capabilities.responses
                .length
          )
        ],
    },
    thanks: {
      responses: [
        "You're welcome! Feel free to ask if you need any other help with SocioHub.",
        "Happy to help! Don't hesitate to reach out if you have more questions about SocioHub.",
        "Glad I could assist! Let me know if there's anything else you'd like to know about the platform.",
      ],
      getResponse: () =>
        OptimizedChatbotAgent.directResponses.thanks.responses[
          Math.floor(
            Math.random() *
              OptimizedChatbotAgent.directResponses.thanks.responses.length
          )
        ],
    },
    goodbye: {
      responses: [
        "Goodbye! Don't hesitate to reach out if you need assistance with SocioHub later.",
        "See you later! Feel free to return whenever you have questions about SocioHub.",
        "Take care! I'll be here whenever you need help navigating SocioHub.",
      ],
      getResponse: () =>
        OptimizedChatbotAgent.directResponses.goodbye.responses[
          Math.floor(
            Math.random() *
              OptimizedChatbotAgent.directResponses.goodbye.responses.length
          )
        ],
    },
  };

  constructor() {
    console.log(`🤖 [OptimizedChatbotAgent] Initializing chatbot agent...`);

    this.llmService = new LLMService();
    this.directAgent = new DirectToolAgent(this.llmService);
    this.sequentialAgent = new SequentialAgent(this.directAgent);
    this.parallelAgent = new ParallelAgent(this.directAgent);

    console.log(
      `✅ [OptimizedChatbotAgent] Chatbot agent initialized successfully`
    );
  }

  async processQuery(
    query: string,
    userContext: UserContext,
    chatHistory: ChatMessage[] = [],
    sessionId: string = "default-session"
  ): Promise<AgentResponse> {
    const startTime = Date.now();
    console.log(`🚀 [OptimizedChatbotAgent] Processing query: "${query}"`);
    console.log(
      `👤 [OptimizedChatbotAgent] User ID: ${userContext.id}, Session: ${sessionId}`
    );
    console.log(
      `📚 [OptimizedChatbotAgent] Chat history length: ${chatHistory.length} messages`
    );

    if (!query?.trim() || !userContext) {
      console.log(
        `⚠️ [OptimizedChatbotAgent] Invalid input - empty query or missing user context`
      );
      return {
        response: "I'm here to help! Please ask me a question about SocioHub.",
        intermediateSteps: [],
        usedTools: false,
        processingTime: Date.now() - startTime,
        strategy: "error",
      };
    }

    // Check cache first
    const cacheKey = `${userContext.id}-${query.toLowerCase().trim()}`;
    console.log(
      `💾 [OptimizedChatbotAgent] Checking cache for key: ${cacheKey}`
    );

    const cached = this.responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(
        `✅ [OptimizedChatbotAgent] Cache hit! Returning cached response`
      );
      return {
        response: cached.response,
        intermediateSteps: [],
        usedTools: false,
        processingTime: Date.now() - startTime,
        strategy: "cached",
      };
    }

    console.log(
      `❌ [OptimizedChatbotAgent] Cache miss, proceeding with processing`
    );

    try {
      // Initialize tools once
      console.log(`🔧 [OptimizedChatbotAgent] Initializing tools...`);
      await this.directAgent.initializeTools(userContext);

      // Fast classification
      console.log(`🎯 [OptimizedChatbotAgent] Classifying intent...`);
      const route = IntentClassifier.classify(query);

      console.log(`📊 [OptimizedChatbotAgent] Classification result:`, {
        strategy: route.strategy,
        tools: route.tools,
        confidence: route.confidence,
        reasoning: route.reasoning,
        matchedPatterns: route.matchedPatterns?.length || 0,
      });

      // Emit initial status
      this.emitThought(userContext, sessionId, {
        type: "reasoning",
        title: `🎯 ${route.strategy.toUpperCase()} Strategy`,
        description: route.reasoning,
        status: "thinking",
        timestamp: Date.now(),
        confidence: route.confidence,
        tools: route.tools,
      });

      let result: AgentResponse;

      switch (route.strategy) {
        case "direct":
          console.log(
            `💬 [OptimizedChatbotAgent] Executing direct response strategy`
          );
          result = await this.handleDirectResponse(query, startTime);
          break;

        case "single_tool":
          console.log(
            `🔧 [OptimizedChatbotAgent] Executing single tool strategy: ${route.tools[0]}`
          );
          result = await this.handleSingleTool(
            route.tools[0],
            query,
            userContext,
            sessionId,
            startTime
          );
          break;

        case "sequential":
          console.log(
            `🔗 [OptimizedChatbotAgent] Executing sequential strategy: ${route.tools.join(
              " → "
            )}`
          );
          result = await this.handleSequential(
            route.tools,
            query,
            userContext,
            sessionId,
            startTime
          );
          break;

        case "parallel":
          console.log(
            `🚀 [OptimizedChatbotAgent] Executing parallel strategy: ${route.tools.join(
              " + "
            )}`
          );
          result = await this.handleParallel(
            route.tools,
            query,
            userContext,
            sessionId,
            startTime
          );
          break;

        default:
          console.log(
            `⚠️ [OptimizedChatbotAgent] Unknown strategy, falling back`
          );
          result = await this.handleFallback(query, userContext, startTime);
      }

      // Cache successful responses
      if (result.response && result.response.length > 10) {
        console.log(
          `💾 [OptimizedChatbotAgent] Caching response for future use`
        );
        this.responseCache.set(cacheKey, {
          response: result.response,
          timestamp: Date.now(),
        });
      }

      // Emit completion
      this.emitThought(userContext, sessionId, {
        type: "final_answer",
        title: "✅ Complete",
        description: `Response generated in ${result.processingTime}ms`,
        status: "completed",
        timestamp: Date.now(),
        processingTime: result.processingTime,
        usedTools: result.usedTools,
        strategy: result.strategy,
      });

      console.log(
        `🎉 [OptimizedChatbotAgent] Query processed successfully in ${result.processingTime}ms`
      );
      console.log(`📊 [OptimizedChatbotAgent] Final result:`, {
        responseLength: result.response.length,
        usedTools: result.usedTools,
        strategy: result.strategy,
        intermediateSteps: result.intermediateSteps.length,
      });

      return result;
    } catch (error) {
      console.error(`❌ [OptimizedChatbotAgent] Processing error:`, error);

      // Emit error status
      this.emitThought(userContext, sessionId, {
        type: "error",
        title: "❌ Error",
        description: "Processing failed",
        status: "error",
        timestamp: Date.now(),
        error: (error as Error).message,
      });

      return {
        response:
          "I encountered a brief issue. Could you try rephrasing your question about SocioHub?",
        intermediateSteps: [],
        usedTools: false,
        processingTime: Date.now() - startTime,
        strategy: "error",
      };
    }
  }

  private async handleDirectResponse(
    query: string,
    startTime: number
  ): Promise<AgentResponse> {
    console.log(
      `💬 [OptimizedChatbotAgent] Handling direct response for: "${query}"`
    );

    const lowerQuery = query.toLowerCase();
    let response = OptimizedChatbotAgent.directResponses.greeting.getResponse(); // default

    if (
      lowerQuery.includes("hello") ||
      lowerQuery.includes("hi") ||
      lowerQuery.includes("hey")
    ) {
      console.log(`👋 [OptimizedChatbotAgent] Detected greeting pattern`);
      response = OptimizedChatbotAgent.directResponses.greeting.getResponse();
    } else if (lowerQuery.includes("thank") || lowerQuery.includes("thanks")) {
      console.log(`🙏 [OptimizedChatbotAgent] Detected gratitude pattern`);
      response = OptimizedChatbotAgent.directResponses.thanks.getResponse();
    } else if (lowerQuery.includes("bye") || lowerQuery.includes("goodbye")) {
      console.log(`👋 [OptimizedChatbotAgent] Detected farewell pattern`);
      response = OptimizedChatbotAgent.directResponses.goodbye.getResponse();
    } else if (
      lowerQuery.includes("what can you do") ||
      lowerQuery.includes("capabilities") ||
      lowerQuery.includes("help")
    ) {
      console.log(`❓ [OptimizedChatbotAgent] Detected capabilities inquiry`);
      response =
        OptimizedChatbotAgent.directResponses.capabilities.getResponse();
    }

    const processingTime = Date.now() - startTime;
    console.log(
      `✅ [OptimizedChatbotAgent] Direct response generated in ${processingTime}ms`
    );

    return {
      response,
      intermediateSteps: [],
      usedTools: false,
      processingTime,
      strategy: "direct",
    };
  }

  private async handleSingleTool(
    toolName: string,
    query: string,
    userContext: UserContext,
    sessionId: string,
    startTime: number
  ): Promise<AgentResponse> {
    console.log(
      `🔧 [OptimizedChatbotAgent] Handling single tool execution: ${toolName}`
    );

    this.emitThought(userContext, sessionId, {
      type: "tool_call",
      title: `🔍 Using ${toolName}`,
      description: `Searching ${toolName} for relevant information`,
      status: "executing",
      timestamp: Date.now(),
      toolName,
    });

    try {
      const toolStartTime = Date.now();
      const { result, toolOutput } = await this.directAgent.executeSingleTool(
        toolName,
        query,
        userContext
      );
      const toolTime = Date.now() - toolStartTime;

      console.log(
        `✅ [OptimizedChatbotAgent] Single tool execution completed in ${toolTime}ms`
      );

      this.emitThought(userContext, sessionId, {
        type: "tool_result",
        title: `📋 ${toolName} Results`,
        description: `Found information in ${toolTime}ms`,
        status: "completed",
        timestamp: Date.now(),
        toolName,
        executionTime: toolTime,
        outputLength: toolOutput.length,
      });

      return {
        response: result,
        intermediateSteps: [
          {
            action: { tool: toolName, toolInput: query },
            observation: toolOutput,
          },
        ],
        usedTools: true,
        processingTime: Date.now() - startTime,
        strategy: "single_tool",
      };
    } catch (error) {
      console.error(
        `❌ [OptimizedChatbotAgent] Single tool execution failed:`,
        error
      );

      this.emitThought(userContext, sessionId, {
        type: "tool_error",
        title: `❌ ${toolName} Failed`,
        description: `Tool execution failed: ${(error as Error).message}`,
        status: "error",
        timestamp: Date.now(),
        toolName,
        error: (error as Error).message,
      });

      return this.handleFallback(query, userContext, startTime);
    }
  }

  private async handleSequential(
    tools: string[],
    query: string,
    userContext: UserContext,
    sessionId: string,
    startTime: number
  ): Promise<AgentResponse> {
    console.log(
      `🔗 [OptimizedChatbotAgent] Handling sequential execution: ${tools.join(
        " → "
      )}`
    );

    for (let i = 0; i < tools.length; i++) {
      this.emitThought(userContext, sessionId, {
        type: "tool_call",
        title: `🔗 Step ${i + 1}/${tools.length}`,
        description: `Using ${tools[i]} tool`,
        status: "executing",
        timestamp: Date.now(),
        toolName: tools[i],
        step: i + 1,
        totalSteps: tools.length,
      });
    }

    try {
      const sequentialStartTime = Date.now();
      const { result, toolOutputs } =
        await this.sequentialAgent.executeSequential(tools, query, userContext);
      const sequentialTime = Date.now() - sequentialStartTime;

      console.log(
        `✅ [OptimizedChatbotAgent] Sequential execution completed in ${sequentialTime}ms`
      );

      this.emitThought(userContext, sessionId, {
        type: "sequential_complete",
        title: `🔗 Sequential Complete`,
        description: `All ${tools.length} steps completed in ${sequentialTime}ms`,
        status: "completed",
        timestamp: Date.now(),
        tools,
        executionTime: sequentialTime,
        successfulSteps: toolOutputs.filter((o) => o.output && !o.error).length,
      });

      const intermediateSteps = toolOutputs.map((output) => ({
        action: { tool: output.tool, toolInput: query },
        observation: output.output || output.error,
      }));

      return {
        response: result,
        intermediateSteps,
        usedTools: true,
        processingTime: Date.now() - startTime,
        strategy: "sequential",
      };
    } catch (error) {
      console.error(
        `❌ [OptimizedChatbotAgent] Sequential execution failed:`,
        error
      );

      this.emitThought(userContext, sessionId, {
        type: "sequential_error",
        title: `❌ Sequential Failed`,
        description: `Sequential execution failed: ${(error as Error).message}`,
        status: "error",
        timestamp: Date.now(),
        tools,
        error: (error as Error).message,
      });

      return this.handleFallback(query, userContext, startTime);
    }
  }

  private async handleParallel(
    tools: string[],
    query: string,
    userContext: UserContext,
    sessionId: string,
    startTime: number
  ): Promise<AgentResponse> {
    console.log(
      `🚀 [OptimizedChatbotAgent] Handling parallel execution: ${tools.join(
        " + "
      )}`
    );

    this.emitThought(userContext, sessionId, {
      type: "tool_call",
      title: `🚀 Parallel Search`,
      description: `Searching ${tools.join(", ")} simultaneously`,
      status: "executing",
      timestamp: Date.now(),
      tools,
    });

    try {
      const parallelStartTime = Date.now();
      const { result, toolOutputs } = await this.parallelAgent.executeParallel(
        tools,
        query,
        userContext
      );
      const parallelTime = Date.now() - parallelStartTime;

      console.log(
        `✅ [OptimizedChatbotAgent] Parallel execution completed in ${parallelTime}ms`
      );

      const successfulTools = toolOutputs.filter((o) => o.success).length;

      this.emitThought(userContext, sessionId, {
        type: "parallel_complete",
        title: `🚀 Parallel Complete`,
        description: `${successfulTools}/${tools.length} tools succeeded in ${parallelTime}ms`,
        status: "completed",
        timestamp: Date.now(),
        tools,
        executionTime: parallelTime,
        successfulTools,
        totalTools: tools.length,
      });

      const intermediateSteps = toolOutputs.map((output) => ({
        action: { tool: output.tool, toolInput: query },
        observation: output.success ? output.output : output.error,
      }));

      return {
        response: result,
        intermediateSteps,
        usedTools: true,
        processingTime: Date.now() - startTime,
        strategy: "parallel",
      };
    } catch (error) {
      console.error(
        `❌ [OptimizedChatbotAgent] Parallel execution failed:`,
        error
      );

      this.emitThought(userContext, sessionId, {
        type: "parallel_error",
        title: `❌ Parallel Failed`,
        description: `Parallel execution failed: ${(error as Error).message}`,
        status: "error",
        timestamp: Date.now(),
        tools,
        error: (error as Error).message,
      });

      return this.handleFallback(query, userContext, startTime);
    }
  }

  private async handleFallback(
    query: string,
    userContext: UserContext,
    startTime: number
  ): Promise<AgentResponse> {
    console.log(`🆘 [OptimizedChatbotAgent] Handling fallback for: "${query}"`);

    // Simple fallback without tools
    const fallbackResponse = `I understand you're asking about "${query}". I'm here to help with SocioHub features, events, societies, and tasks. Could you try being more specific about what you need help with?`;

    const processingTime = Date.now() - startTime;
    console.log(
      `✅ [OptimizedChatbotAgent] Fallback response generated in ${processingTime}ms`
    );

    return {
      response: fallbackResponse,
      intermediateSteps: [],
      usedTools: false,
      processingTime,
      strategy: "fallback",
    };
  }

  private emitThought(
    userContext: UserContext,
    sessionId: string,
    thought: any
  ): void {
    try {
      if (userContext?.id) {
        console.log(
          `💭 [OptimizedChatbotAgent] Emitting thought to user ${userContext.id}:`,
          {
            type: thought.type,
            title: thought.title,
            status: thought.status,
          }
        );

        emitEventToUser(io, userContext.id, "agent_thought", {
          sessionId,
          thought,
          timestamp: Date.now(),
        });

        console.log(`✅ [OptimizedChatbotAgent] Thought emitted successfully`);
      } else {
        console.log(
          `⚠️ [OptimizedChatbotAgent] Cannot emit thought - missing user context`
        );
      }
    } catch (error) {
      console.error(
        `❌ [OptimizedChatbotAgent] Failed to emit thought:`,
        error
      );
    }
  }

  // Clean up resources
  resetTools(): void {
    console.log(
      `🧹 [OptimizedChatbotAgent] Resetting tools and clearing cache...`
    );

    const cacheSize = this.responseCache.size;
    this.responseCache.clear();

    console.log(
      `✅ [OptimizedChatbotAgent] Reset complete. Cleared ${cacheSize} cached responses`
    );
  }

  isHealthy(): boolean {
    const healthy = !!this.llmService;
    console.log(
      `🏥 [OptimizedChatbotAgent] Health check: ${
        healthy ? "HEALTHY" : "UNHEALTHY"
      }`
    );
    return healthy;
  }

  // Get performance stats
  getStats() {
    const stats = {
      cacheSize: this.responseCache.size,
      healthy: this.isHealthy(),
      cacheTimeout: this.cacheTimeout,
      timestamp: new Date().toISOString(),
    };

    console.log(`📊 [OptimizedChatbotAgent] Current stats:`, stats);
    return stats;
  }

  // Debug method to inspect cache
  getCacheEntries() {
    const entries = Array.from(this.responseCache.entries()).map(
      ([key, value]) => ({
        key,
        responseLength: value.response.length,
        age: Date.now() - value.timestamp,
        expired: Date.now() - value.timestamp > this.cacheTimeout,
      })
    );

    console.log(`🔍 [OptimizedChatbotAgent] Cache inspection:`, {
      totalEntries: entries.length,
      expiredEntries: entries.filter((e) => e.expired).length,
      entries: entries.slice(0, 5), // Show first 5 for debugging
    });

    return entries;
  }

  // Clean expired cache entries
  cleanExpiredCache(): number {
    console.log(`🧹 [OptimizedChatbotAgent] Cleaning expired cache entries...`);

    const beforeSize = this.responseCache.size;
    const now = Date.now();

    for (const [key, value] of this.responseCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.responseCache.delete(key);
      }
    }

    const cleanedCount = beforeSize - this.responseCache.size;
    console.log(
      `✅ [OptimizedChatbotAgent] Cleaned ${cleanedCount} expired entries. Cache size: ${beforeSize} → ${this.responseCache.size}`
    );

    return cleanedCount;
  }
}

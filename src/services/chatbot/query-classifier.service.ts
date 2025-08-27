import { LLMService } from "./llm.service";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { RouteDecision, ClassificationContext } from "./types";

export class QueryClassifier {
  constructor(private llmService: LLMService) {}

  async classify(context: ClassificationContext): Promise<RouteDecision> {
    const { query, timeConstraint = 3000 } = context;

    // Fast pattern-based classification first
    const patternResult = this.patternClassify(query);

    // If pattern classification is confident enough, use it
    if (patternResult.confidence > 0.85) {
      return patternResult;
    }

    // For uncertain cases, use LLM with timeout
    try {
      const llmResult = await Promise.race([
        this.llmClassify(query),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("LLM timeout")), timeConstraint)
        ),
      ]);

      if (llmResult) {
        return llmResult;
      }
    } catch (error) {
      // Silently fall back to pattern result
    }

    // Fallback to pattern result
    return patternResult;
  }

  private patternClassify(query: string): RouteDecision {
    const lowerQuery = query.toLowerCase().trim();

    // Direct responses (no tools needed)
    if (this.isDirectQuery(lowerQuery)) {
      return {
        strategy: "direct",
        tools: [],
        confidence: 0.95,
        reasoning: "Simple conversational response",
        classificationMethod: "pattern",
      };
    }

    // Database queries (most common)
    if (this.isDatabaseQuery(lowerQuery)) {
      return {
        strategy: "single_tool",
        tools: ["database"],
        confidence: 0.85,
        reasoning: "Query for platform data",
        classificationMethod: "pattern",
      };
    }

    // Documentation queries
    if (this.isDocumentQuery(lowerQuery)) {
      return {
        strategy: "single_tool",
        tools: ["document"],
        confidence: 0.85,
        reasoning: "Query for help/guidance",
        classificationMethod: "pattern",
      };
    }

    // Web queries
    if (this.isWebQuery(lowerQuery)) {
      return {
        strategy: "single_tool",
        tools: ["web"],
        confidence: 0.85,
        reasoning: "Query for external information",
        classificationMethod: "pattern",
      };
    }

    // Default to database for platform-related queries
    return {
      strategy: "single_tool",
      tools: ["database"],
      confidence: 0.4,
      reasoning: "Default platform query",
      classificationMethod: "pattern",
    };
  }

  private async llmClassify(query: string): Promise<RouteDecision | null> {
    const systemPrompt = `You are a query classifier for SocioHub student platform.

CRITICAL RULES:
1. Prefer single tool solutions most of the time
2. Use multiple tools if you believe query requires combining different data sources
3. 80% of queries should use only ONE tool
4. Analyze the query's intent and required data sources carefully

AVAILABLE TOOLS AND THEIR CAPABILITIES:

🗄️ DATABASE TOOL:
- Purpose: Access internal platform data and user-specific information
- Contains: Events, societies, user profiles, tasks, registrations, meetings, deadlines
- Use for queries about:
  • Personal data: "my events", "my tasks", "my societies"
  • Platform statistics: "how many members", "upcoming events", "total registrations"
  • Scheduling: "when is my next meeting", "events this week"
  • User relationships: "members of society X", "who registered for event Y"
  • Activity history: "past events", "completed tasks", "attendance records"
  • Platform operations: "create event", "register for society", "mark task complete"
- Examples: "Show my upcoming events", "How many people registered for the tech meetup?", "What tasks are due this week?"

📚 DOCUMENT TOOL:
- Purpose: Access help documentation, tutorials, and guidance materials
- Contains: User manuals, FAQ, how-to guides, feature explanations, troubleshooting
- Use for queries about:
  • Instructions: "how to create an event", "steps to join a society"
  • Feature explanations: "what is the task management system", "explain event categories"
  • Troubleshooting: "why can't I register", "error messages", "login problems"
  • Platform navigation: "where to find settings", "how to access my profile"
  • Policy information: "community guidelines", "privacy policy", "terms of service"
- Examples: "How do I create a new society?", "What are the event approval guidelines?", "Explain the point system"

🌐 WEB TOOL:
- Purpose: Fetch external, real-time, or current information from the internet
- Contains: News, weather, trends, external resources, competitor info, best practices, recommendations
- Use for queries about:
  • Current events: "latest tech news", "today's weather", "trending topics"
  • External research: "competitors analysis", "industry trends", "market data"
  • Real-time information: "current stock prices", "live sports scores", "breaking news"
  • Recommendations & best practices: "how to increase student engagement", "popular event ideas", "effective society management tips"
  • Educational advice: "study techniques", "time management strategies", "leadership skills"
  • Industry insights: "career advice", "professional development", "skill recommendations"
  • Creative inspiration: "event themes", "activity suggestions", "innovative approaches"
  • External resources: "relevant articles", "research findings", "expert opinions"
- Examples: "What are effective ways to promote events?", "Best practices for virtual meetings", "How to improve team collaboration?", "Creative fundraising ideas", "Latest productivity techniques"

STRATEGY SELECTION GUIDE:

📋 DIRECT Strategy:
- Use for: Simple conversational responses that don't require data lookup
- Examples: greetings, acknowledgments, simple yes/no, basic explanations
- No tools needed

🎯 SINGLE_TOOL Strategy (PREFERRED - 80% of cases):
- Use when query can be fully answered by ONE tool
- Most efficient and fastest approach
- Choose the tool that contains the primary data needed

🔄 SEQUENTIAL Strategy (Use sparingly):
- ONLY when query explicitly needs data from one tool to inform another tool's search
- Example: "Find my upcoming events and get weather forecast for them" (database first, then web)
- Must show clear dependency between tools

⚖️ PARALLEL Strategy (Use rarely):
- ONLY when query explicitly asks to compare/combine independent data sources
- Example: "Compare our event attendance with industry benchmarks" (database + web)
- Both tools provide different but equally important information

CLASSIFICATION DECISION TREE:
1. Is it a greeting/simple response? → direct
2. Does it need only platform data? → single_tool: database
3. Does it need only help/instructions? → single_tool: document  
4. Does it need only external info? → single_tool: web
5. Does it need data from one tool to search another? → sequential
6. Does it need to compare internal vs external data? → parallel
7. When uncertain → default to single_tool: database (most platform queries are database-related)

RESPONSE FORMAT (JSON only):
You must respond with ONLY a JSON object, no additional text:

{
  "strategy": "direct|single_tool|sequential|parallel",
  "tools": ["tool_name"],
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of why this classification was chosen"
}

ENHANCED EXAMPLES:

Query: "Hello there"
→ {"strategy": "direct", "tools": [], "confidence": 0.95, "reasoning": "Simple greeting, no data needed"}

Query: "Show me all events I'm registered for"
→ {"strategy": "single_tool", "tools": ["database"], "confidence": 0.95, "reasoning": "Personal platform data query"}

Query: "How do I create a recurring event?"
→ {"strategy": "single_tool", "tools": ["document"], "confidence": 0.9, "reasoning": "Instructional query requiring help documentation"}

Query: "What's the weather like today?"
→ {"strategy": "single_tool", "tools": ["web"], "confidence": 0.9, "reasoning": "External real-time information"}

Query: "Find my outdoor events and check weather for them"
→ {"strategy": "sequential", "tools": ["database", "web"], "confidence": 0.85, "reasoning": "Need platform data first, then external weather data for those specific events"}

Query: "How does our event attendance compare to other universities?"
→ {"strategy": "parallel", "tools": ["database", "web"], "confidence": 0.8, "reasoning": "Comparing internal statistics with external benchmarks"}

Remember: Respond with ONLY valid JSON, no additional text or explanations.`;

    try {
      console.log(`🤖 [Classifier] Calling LLM for query: "${query}"`);

      const response = await this.llmService.fastLLM.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(`Classify: "${query}"`),
      ]);

      const content = response.content?.toString() || "";
      console.log(`🤖 [Classifier] LLM raw response: "${content}"`);

      // More robust JSON extraction
      let jsonStr = content.trim();

      // Try to find JSON object boundaries more precisely
      const startIdx = jsonStr.indexOf("{");
      const lastIdx = jsonStr.lastIndexOf("}");

      if (startIdx === -1 || lastIdx === -1 || startIdx >= lastIdx) {
        console.warn(
          `⚠️ [Classifier] No valid JSON found in response: "${content}"`
        );
        return null;
      }

      jsonStr = jsonStr.substring(startIdx, lastIdx + 1);
      console.log(`🤖 [Classifier] Extracted JSON: "${jsonStr}"`);

      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
        console.log(`🤖 [Classifier] Parsed JSON:`, parsed);
      } catch (parseError) {
        console.warn(`⚠️ [Classifier] JSON parse error:`, parseError);
        console.warn(`⚠️ [Classifier] Failed to parse: "${jsonStr}"`);
        return null;
      }

      // Enhanced validation
      if (!parsed || typeof parsed !== "object") {
        console.warn(`⚠️ [Classifier] Parsed result is not an object:`, parsed);
        return null;
      }

      if (!parsed.strategy || typeof parsed.strategy !== "string") {
        console.warn(
          `⚠️ [Classifier] Missing or invalid strategy:`,
          parsed.strategy
        );
        return null;
      }

      if (!Array.isArray(parsed.tools)) {
        console.warn(
          `⚠️ [Classifier] Missing or invalid tools array:`,
          parsed.tools
        );
        return null;
      }

      // Validate strategy values
      const validStrategies = [
        "direct",
        "single_tool",
        "sequential",
        "parallel",
      ];
      if (!validStrategies.includes(parsed.strategy)) {
        console.warn(
          `⚠️ [Classifier] Invalid strategy value:`,
          parsed.strategy
        );
        return null;
      }

      // Validate tools
      const validTools = ["database", "document", "web"];
      for (const tool of parsed.tools) {
        if (!validTools.includes(tool)) {
          console.warn(`⚠️ [Classifier] Invalid tool:`, tool);
          return null;
        }
      }

      // Force single tool unless explicitly multi-tool with high confidence
      if (parsed.tools.length > 1 && (parsed.confidence || 0) < 0.9) {
        console.log(
          `🤖 [Classifier] Forcing single tool from multi-tool with low confidence`
        );
        parsed.tools = [parsed.tools[0]]; // Take first tool only
        parsed.strategy = "single_tool";
        parsed.reasoning =
          "Simplified to single tool: " + (parsed.reasoning || "");
      }

      const result = {
        strategy: parsed.strategy,
        tools: parsed.tools,
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        reasoning: parsed.reasoning || "LLM classification",
        classificationMethod: "llm" as const,
      };

      console.log(`✅ [Classifier] Final LLM result:`, result);
      return result;
    } catch (error) {
      console.warn(
        "❌ [Classifier] LLM classification failed with error:",
        error
      );
      console.warn("❌ [Classifier] Error details:", {
        message: (error as Error).message,
        stack: (error as Error).stack,
        name: (error as Error).name,
      });
      return null;
    }
  }

  // Simplified pattern matching methods
  private isDirectQuery(query: string): boolean {
    const directPatterns = [
      /^(hi|hello|hey|good\s+(morning|afternoon|evening))/,
      /^(thank|thanks|bye|goodbye)/,
      /^(ok|okay|yes|no|sure)$/,
      /^(what\s+(can\s+you\s+do|are\s+you))/,
    ];
    return directPatterns.some((pattern) => pattern.test(query));
  }

  private isDatabaseQuery(query: string): boolean {
    const dbPatterns = [
      /\b(my|show|list|find|get|count)\b.*\b(events?|tasks?|societies?|registrations?|meetings?)/,
      /\b(when|where|who|what\s+time)\b.*\b(event|meeting|task|deadline)/,
      /\b(upcoming|past|today|tomorrow|this\s+week)/,
      /\b(members?|participants?|users?)\b.*\b(of|in)/,
      /\b(statistics|stats|total|number|how\s+many)/,
    ];
    return dbPatterns.some((pattern) => pattern.test(query));
  }

  private isDocumentQuery(query: string): boolean {
    const docPatterns = [
      /\b(how\s+to|how\s+do\s+i|how\s+can|tutorial|guide|help)/,
      /\b(what\s+is|explain|define|meaning|steps?)/,
      /\b(setup|configure|create|problem|issue|error)/,
      /\b(feature|functionality|navigate|where\s+to\s+find)/,
    ];
    return docPatterns.some((pattern) => pattern.test(query));
  }

  private isWebQuery(query: string): boolean {
    const webPatterns = [
      // Current/real-time information
      /\b(news|current|latest|trending|weather|stock)/,
      /\b(outside|external|google|internet|online)/,
      /\b(competitors?|alternatives?|comparison)/,
      /\b(technology|tech\s+trends|market|industry)/,

      // Recommendations and best practices
      /\b(best\s+(practices?|ways?|methods?|techniques?)|effective\s+(ways?|methods?|strategies?)|how\s+to\s+(improve|increase|enhance|boost))/,
      /\b(tips?|advice|suggestions?|recommendations?|ideas?)\b.*\b(for|about|on)/,
      /\b(creative|innovative|popular|successful)\s+(ideas?|approaches?|methods?|strategies?)/,

      // Educational and development queries
      /\b(learn|learning|study\s+techniques?|time\s+management|leadership\s+skills?)/,
      /\b(career\s+advice|professional\s+development|skill\s+building)/,
      /\b(personal\s+growth|self\s+improvement|productivity)/,

      // Inspiration and brainstorming
      /\b(inspiration|brainstorm|examples?|case\s+studies?)/,
      /\b(what\s+are\s+(some|good|effective))\s+.*\b(ideas?|ways?|methods?|approaches?)/,
      /\b(how\s+do\s+other|what\s+do\s+successful)/,
    ];
    return webPatterns.some((pattern) => pattern.test(query));
  }
}

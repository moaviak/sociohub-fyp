import { Tool } from "@langchain/core/tools";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";
import { UserContext } from "../types";
import prisma from "../../../db";
import { emitEventToUser } from "../../../socket";
import { io } from "../../../app";
import { chatbotConfig } from "../config";

// Comprehensive enums from Prisma schema
const EventCategories = [
  "Workshop",
  "Seminar",
  "SocialGathering",
  "Competition",
  "CulturalEvent",
  "SportsEvent",
  "Meeting",
  "Other",
] as const;
const EventType = ["Physical", "Online"] as const;
const EventAudience = ["Open", "Members", "Invite"] as const;
const EventStatus = ["Upcoming", "Ongoing", "Completed", "Cancelled"] as const;
const RegistrationStatus = ["PENDING", "APPROVED", "DECLINED"] as const;
const JoinRequestStatus = ["PENDING", "APPROVED", "REJECTED"] as const;
const TeamJoinRequestStatus = ["PENDING", "APPROVED", "REJECTED"] as const;
const TeamVisibility = ["PUBLIC", "PRIVATE"] as const;
const TeamTaskStatus = [
  "TO_DO",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;
const PaymentStatus = ["PENDING", "COMPLETED", "FAILED", "CANCELLED"] as const;
const MeetingStatus = ["SCHEDULED", "LIVE", "ENDED", "CANCELLED"] as const;

// Query type definitions
type QueryType =
  | "events"
  | "societies"
  | "tasks"
  | "teams"
  | "event_details"
  | "society_details"
  | "team_details"
  | "registrations"
  | "join_requests"
  | "team_join_requests"
  | "payments"
  | "meetings"
  | "announcements"
  | "posts"
  | "general";

// Filter configurations for each query type
const QUERY_TYPE_FILTERS = {
  events: {
    enums: {
      category: EventCategories,
      eventType: EventType,
      audience: EventAudience,
      eventStatus: EventStatus,
    },
    filters: [
      "name",
      "category",
      "eventType",
      "audience",
      "eventStatus",
      "location",
      "paidEvent",
      "registrationRequired",
      "dateRange",
      "societyId",
      "limit",
      "sortBy",
      "sortOrder",
    ],
    description:
      "Search and filter events by category, type, audience, status, location, date range, and payment requirements",
  },
  societies: {
    enums: {},
    filters: [
      "name",
      "id",
      "acceptingNewMembers",
      "limit",
      "sortBy",
      "sortOrder",
    ],
    description:
      "Search societies and filter by name and membership availability",
  },
  tasks: {
    enums: {},
    filters: [
      "isCompleted",
      "isStarred",
      "societyId",
      "teamId",
      "limit",
      "sortBy",
      "sortOrder",
    ],
    description:
      "Query personal tasks with completion status, starred status, and assignment context",
  },
  teams: {
    enums: {
      teamVisibility: TeamVisibility,
    },
    filters: [
      "name",
      "teamVisibility",
      "societyId",
      "limit",
      "sortBy",
      "sortOrder",
    ],
    description: "Search teams by name, visibility, and society",
  },
  registrations: {
    enums: {
      registrationStatus: RegistrationStatus,
    },
    filters: ["registrationStatus", "eventId", "limit", "sortBy", "sortOrder"],
    description: "Query event registrations by status and specific events",
  },
  join_requests: {
    enums: {
      joinRequestStatus: JoinRequestStatus,
    },
    filters: ["joinRequestStatus", "societyId", "limit", "sortBy", "sortOrder"],
    description: "Query society join requests by status",
  },
  team_join_requests: {
    enums: {
      teamJoinRequestStatus: TeamJoinRequestStatus,
    },
    filters: ["joinRequestStatus", "teamId", "limit", "sortBy", "sortOrder"],
    description: "Query team join requests by status",
  },
  payments: {
    enums: {
      paymentStatus: PaymentStatus,
    },
    filters: ["paymentStatus", "eventId", "limit", "sortBy", "sortOrder"],
    description: "Query payment transactions by status and event",
  },
  meetings: {
    enums: {
      meetingStatus: MeetingStatus,
    },
    filters: [
      "name",
      "meetingStatus",
      "societyId",
      "limit",
      "sortBy",
      "sortOrder",
    ],
    description: "Query meetings by status, name, and society",
  },
  announcements: {
    enums: {},
    filters: ["name", "societyId", "eventId", "limit", "sortBy", "sortOrder"],
    description: "Query announcements by title, society, and related events",
  },
  posts: {
    enums: {},
    filters: ["societyId", "eventId", "limit", "sortBy", "sortOrder"],
    description: "Query social media posts by society and related events",
  },
  event_details: {
    enums: {},
    filters: ["name"],
    description: "Get detailed information about a specific event",
  },
  society_details: {
    enums: {},
    filters: ["name"],
    description: "Get detailed information about a specific society",
  },
  team_details: {
    enums: {},
    filters: ["name"],
    description: "Get detailed information about a specific team",
  },
};

interface ParsedQuery {
  queryType: QueryType;
  filters: Record<string, any>;
  confidence: number;
}

export class DatabaseQueryTool extends Tool {
  name = "database_query";
  description =
    "Query the SocioHub database for comprehensive information about events, societies, tasks, teams, registrations, payments, meetings, announcements, and posts. Use this for specific data queries about platform content with strict schema compliance.";

  schema = z
    .object({
      input: z
        .string()
        .describe("The user's query about SocioHub data")
        .optional(),
    })
    .transform((obj) => obj.input);

  private queryLLM: ChatGroq;

  constructor(private userContext: UserContext) {
    super();

    this.queryLLM = new ChatGroq({
      model: chatbotConfig.llm.fastModel,
      apiKey: process.env.GROQ_API_KEY!,
      maxTokens: 500,
      temperature: 0.1,
    });
  }

  async _call(input: string): Promise<string> {
    try {
      emitEventToUser(io, this.userContext.id, "tool_status", {
        tool: "database_query",
        status: "running",
        message: "Analyzing your query...",
      });

      // Step 1: Determine query type
      const queryType = await this.determineQueryType(input);

      emitEventToUser(io, this.userContext.id, "tool_status", {
        tool: "database_query",
        status: "running",
        message: `Identified query type: ${queryType}. Extracting filters...`,
      });

      // Step 2: Parse filters based on query type
      const filters = await this.parseFiltersForQueryType(input, queryType);

      const parsedQuery: ParsedQuery = {
        queryType,
        filters,
        confidence: 0.8,
      };

      emitEventToUser(io, this.userContext.id, "tool_status", {
        tool: "database_query",
        status: "running",
        message: `Searching ${parsedQuery.queryType}...`,
      });

      let result: string;

      switch (parsedQuery.queryType) {
        case "events":
          result = await this.queryEvents(parsedQuery.filters);
          break;
        case "societies":
          result = await this.querySocieties(parsedQuery.filters);
          break;
        case "tasks":
          result = await this.queryTasks(parsedQuery.filters);
          break;
        case "teams":
          result = await this.queryTeams(parsedQuery.filters);
          break;
        case "event_details":
          result = await this.getEventDetails(
            parsedQuery.filters.id || parsedQuery.filters.name || ""
          );
          break;
        case "society_details":
          result = await this.getSocietyDetails(
            parsedQuery.filters.id || parsedQuery.filters.name || ""
          );
          break;
        case "team_details":
          result = await this.getTeamDetails(
            parsedQuery.filters.id || parsedQuery.filters.name || ""
          );
          break;
        case "registrations":
          result = await this.queryRegistrations(parsedQuery.filters);
          break;
        case "join_requests":
          result = await this.queryJoinRequests(parsedQuery.filters);
          break;
        case "team_join_requests":
          result = await this.queryTeamJoinRequests(parsedQuery.filters);
          break;
        case "payments":
          result = await this.queryPayments(parsedQuery.filters);
          break;
        case "meetings":
          result = await this.queryMeetings(parsedQuery.filters);
          break;
        case "announcements":
          result = await this.queryAnnouncements(parsedQuery.filters);
          break;
        case "posts":
          result = await this.queryPosts(parsedQuery.filters);
          break;
        default:
          result =
            "I couldn't determine what specific information you're looking for. Please specify what you want to know about: events, societies, tasks, teams, registrations, join requests, payments, meetings, announcements, or posts.";
      }

      emitEventToUser(io, this.userContext.id, "tool_status", {
        tool: "database_query",
        status: "complete",
        message: "Database query completed successfully",
      });

      return result;
    } catch (error) {
      console.error("Database query error:", error);
      emitEventToUser(io, this.userContext.id, "tool_status", {
        tool: "database_query",
        status: "error",
        message: "Error occurred while querying database",
      });
      return "I encountered an error while querying the database. Please try rephrasing your request or contact support if the issue persists.";
    }
  }

  /**
   * Step 1: Determine the query type from user input
   */
  private async determineQueryType(input: string): Promise<QueryType> {
    const queryTypePrompt = `Analyze this user query and determine the most appropriate query type. Return ONLY the query type string.

User Query: "${input}"
User Context: ${JSON.stringify(this.userContext)}

Available Query Types:
- events: searching/listing events, finding events by criteria
- societies: searching/listing societies, finding clubs/organizations  
- tasks: personal or assigned tasks, todos, assignments
- teams: searching/listing teams within societies
- event_details: specific detailed information about one event
- society_details: specific detailed information about one society
- team_details: specific detailed information about one team
- registrations: event registrations status and history
- join_requests: society join requests status
- team_join_requests: team join requests status  
- payments: payment transactions and status
- meetings: meeting information and schedules
- announcements: society announcements and notices
- posts: social media posts and content
- general: unclear or general queries

EXAMPLES:
"upcoming tech events" → events
"show me event details for AI workshop" → event_details
"my completed tasks" → tasks
"societies accepting new members" → societies
"pending registrations" → registrations
"join request status" → join_requests
"payment history" → payments

Rules:
- If asking for "details about [specific item]" use *_details
- If asking for "my [something]" usually relates to personal data
- If mentioning specific status words like "pending", "completed" etc, choose the appropriate type
- Default to the most specific type possible

Return ONLY the query type (no explanations, no JSON, just the string):`;

    try {
      const response = await this.queryLLM.invoke([
        { role: "user", content: queryTypePrompt },
      ]);

      const content = response.content.toString().trim().toLowerCase();
      console.log("Query type response:", content);

      // Extract query type from response
      const validQueryTypes = Object.keys(QUERY_TYPE_FILTERS) as QueryType[];

      // Find exact match
      const exactMatch = validQueryTypes.find((type) => content === type);
      if (exactMatch) {
        return exactMatch;
      }

      // Find partial match
      const partialMatch = validQueryTypes.find((type) =>
        content.includes(type)
      );
      if (partialMatch) {
        return partialMatch;
      }

      // Fallback to pattern matching
      return this.fallbackQueryTypeDetection(input);
    } catch (error) {
      console.error("Query type detection error:", error);
      return this.fallbackQueryTypeDetection(input);
    }
  }

  /**
   * Step 2: Parse filters specific to the determined query type
   */
  private async parseFiltersForQueryType(
    input: string,
    queryType: QueryType
  ): Promise<Record<string, any>> {
    if (queryType === "general") {
      return { limit: 10 };
    }

    const queryConfig = QUERY_TYPE_FILTERS[queryType];
    if (!queryConfig) {
      return { limit: 10 };
    }

    // Build enum information for this specific query type
    const enumInfo = Object.entries(queryConfig.enums)
      .map(([key, values]) => `- ${key}: ${values.join(", ")}`)
      .join("\n");

    // Build filter schema for this specific query type
    const filterSchema = this.buildFilterSchemaForQueryType(queryType);

    const filterPrompt = `You are a filter extraction engine for ${queryType} queries. Your task is to extract **only the relevant filters** from a user's natural language query and return them in the exact JSON structure provided.

🟢 IMPORTANT GUIDELINES:
- ✅ All filters listed below are optional — include only those that are clearly needed based on the user’s query.
- ❌ Do not infer or guess filters that are not mentioned or implied.
- 🔄 Any filter that is not applicable should be returned as \`null\`.

🔍 CONTEXT:
- User Query: "${input}"
- User Context: ${JSON.stringify(this.userContext)}
- Current Date: ${new Date().toISOString().split("T")[0]}

🗂️ QUERY TYPE: ${queryType}
📘 Description: ${queryConfig.description}
${enumInfo ? `🔢 VALID ENUM VALUES:\n${enumInfo}\n` : ""}

🎯 AVAILABLE FILTERS: ${queryConfig.filters.join(", ")}

🧾 REQUIRED OUTPUT FORMAT:
Return ONLY a valid JSON object with this exact structure. Use \`null\` for any unused or missing filter:
${JSON.stringify(filterSchema, null, 2)}

📏 EXTRACTION RULES:
- Set \`limit\` to a reasonable number (default: 10, max: 20)
- Dates must be in \`YYYY-MM-DD\` format
- Booleans must be \`true\` or \`false\` (not strings)
- Extract IDs/names from phrases like "show me events for X" or "details about Y"
- If user says "my" or "I", apply user context filters appropriately
- Use only valid enum values from the list above
- Default \`sortOrder\` to "asc" unless explicitly stated otherwise

🧠 EXAMPLES for ${queryType}:
${this.getExamplesForQueryType(queryType)}

⚠️ FINAL INSTRUCTION:
Return ONLY valid JSON — no explanations, notes, or extra formatting.`;

    try {
      const response = await this.queryLLM.invoke([
        { role: "user", content: filterPrompt },
      ]);

      const content = response.content.toString().trim();
      console.log(`Filter parsing response for ${queryType}:`, content);

      const jsonMatch =
        content.match(/\{[\s\S]*\}/) ||
        content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);

      if (!jsonMatch) {
        console.log("No JSON found in filter response, using fallback");
        return this.fallbackFilterParse(input, queryType);
      }

      const jsonString = jsonMatch[0].trim();
      const parsed = this.parseJSON(jsonString);

      return this.validateFiltersForQueryType(parsed, queryType);
    } catch (error) {
      console.error(`Filter parsing error for ${queryType}:`, error);
      return this.fallbackFilterParse(input, queryType);
    }
  }

  /**
   * Build filter schema specific to query type
   */
  private buildFilterSchemaForQueryType(
    queryType: QueryType
  ): Record<string, any> {
    const config =
      QUERY_TYPE_FILTERS[queryType as keyof typeof QUERY_TYPE_FILTERS];
    const schema: Record<string, any> = {};

    config.filters.forEach((filter) => {
      switch (filter) {
        case "limit":
          schema.limit = 10;
          break;
        case "sortBy":
          schema.sortBy = null;
          break;
        case "sortOrder":
          schema.sortOrder = null;
          break;
        case "dateRange":
          schema.dateRange = { start: null, end: null };
          break;
        case "paidEvent":
        case "registrationRequired":
        case "acceptingNewMembers":
        case "isCompleted":
        case "isStarred":
          schema[filter] = null;
          break;
        default:
          schema[filter] = null;
      }
    });

    return schema;
  }

  /**
   * Generate examples specific to query type
   */
  private getExamplesForQueryType(queryType: QueryType): string {
    const examples: Record<QueryType, string> = {
      events: `"upcoming tech workshops" → {"category": "Workshop", "dateRange": {"start": "2025-08-01", "end": null}, "limit": 10}
"free online events" → {"eventType": "Online", "paidEvent": false, "limit": 10}`,

      societies: `"societies accepting members" → {"acceptingNewMembers": true, "limit": 10}
"programming club" → {"name": "programming", "limit": 10}`,

      tasks: `"my completed tasks" → {"isCompleted": true, "limit": 10}
"starred tasks" → {"isStarred": true, "limit": 10}`,

      teams: `"public teams" → {"teamVisibility": "PUBLIC", "limit": 10}
"development team" → {"name": "development", "limit": 10}`,

      registrations: `"pending registrations" → {"registrationStatus": "PENDING", "limit": 10}
"my event registrations" → {"limit": 10}`,

      join_requests: `"pending join requests" → {"joinRequestStatus": "PENDING", "limit": 10}`,

      team_join_requests: `"approved team requests" → {"joinRequestStatus": "APPROVED", "limit": 10}`,

      payments: `"failed payments" → {"paymentStatus": "FAILED", "limit": 10}
"completed payments" → {"paymentStatus": "COMPLETED", "limit": 10}`,

      meetings: `"upcoming meetings" → {"meetingStatus": "SCHEDULED", "limit": 10}
"board meeting" → {"name": "board", "limit": 10}`,

      announcements: `"recent announcements" → {"limit": 10, "sortOrder": "desc"}`,

      posts: `"society posts" → {"limit": 10, "sortOrder": "desc"}`,

      event_details: `"details about AI workshop" → {"name": "AI workshop"}
"event details for abc123" → {"id": "abc123"}`,

      society_details: `"details about programming society" → {"name": "programming society"}`,

      team_details: `"details about dev team" → {"name": "dev team"}`,

      general: `→ {"limit": 10}`,
    };

    return examples[queryType] || `→ {"limit": 10}`;
  }

  /**
   * Fallback query type detection using pattern matching
   */
  private fallbackQueryTypeDetection(input: string): QueryType {
    const inputLower = input.toLowerCase();

    // Check for detail queries first
    if (inputLower.includes("detail")) {
      if (inputLower.includes("event")) return "event_details";
      if (inputLower.includes("society") || inputLower.includes("club"))
        return "society_details";
      if (inputLower.includes("team")) return "team_details";
    }

    // Check for specific entity types
    const patterns: Array<{ keywords: string[]; type: QueryType }> = [
      { keywords: ["registration", "register"], type: "registrations" },
      { keywords: ["join request"], type: "join_requests" },
      { keywords: ["team request", "team join"], type: "team_join_requests" },
      { keywords: ["payment", "transaction"], type: "payments" },
      { keywords: ["meeting"], type: "meetings" },
      { keywords: ["announcement"], type: "announcements" },
      { keywords: ["post"], type: "posts" },
      { keywords: ["task", "todo", "assignment"], type: "tasks" },
      { keywords: ["team"], type: "teams" },
      { keywords: ["event"], type: "events" },
      {
        keywords: ["society", "societies", "club", "organization"],
        type: "societies",
      },
    ];

    for (const pattern of patterns) {
      if (pattern.keywords.some((keyword) => inputLower.includes(keyword))) {
        return pattern.type;
      }
    }

    return "general";
  }

  /**
   * Fallback filter parsing using pattern matching
   */
  private fallbackFilterParse(
    input: string,
    queryType: QueryType
  ): Record<string, any> {
    const inputLower = input.toLowerCase();
    const filters: Record<string, any> = { limit: 10 };
    const config =
      QUERY_TYPE_FILTERS[queryType as keyof typeof QUERY_TYPE_FILTERS];

    // Extract name/identifier
    if (config.filters.includes("name")) {
      // Extract quoted strings or after keywords like "about", "for", "details"
      const nameMatch = inputLower.match(
        /(?:about|for|details|called|named)\s+(.+?)(?:\s|$)/
      );
      if (nameMatch) {
        filters.name = nameMatch[1].trim();
      }
    }

    // Context-based filters
    if (inputLower.includes("my") || inputLower.includes("i ")) {
      if (config.filters.includes("studentId")) {
        filters.studentId = this.userContext.id;
      }
    }

    // Status-based filters
    if (inputLower.includes("pending")) {
      if (config.filters.includes("registrationStatus"))
        filters.registrationStatus = "PENDING";
      if (config.filters.includes("joinRequestStatus"))
        filters.joinRequestStatus = "PENDING";
      if (config.filters.includes("paymentStatus"))
        filters.paymentStatus = "PENDING";
      if (config.filters.includes("meetingStatus"))
        filters.meetingStatus = "SCHEDULED";
    }

    if (inputLower.includes("completed")) {
      if (config.filters.includes("isCompleted")) filters.isCompleted = true;
      if (config.filters.includes("eventStatus"))
        filters.eventStatus = "Completed";
      if (config.filters.includes("paymentStatus"))
        filters.paymentStatus = "COMPLETED";
    }

    // Event-specific patterns
    if (queryType === "events") {
      if (inputLower.includes("upcoming") || inputLower.includes("future")) {
        filters.dateRange = { start: new Date(), end: null };
      }

      if (inputLower.includes("online") || inputLower.includes("virtual")) {
        filters.eventType = "Online";
      }

      if (inputLower.includes("free")) {
        filters.paidEvent = false;
      }

      // Check for categories
      EventCategories.forEach((category) => {
        if (inputLower.includes(category.toLowerCase())) {
          filters.category = category;
        }
      });
    }

    // Society-specific patterns
    if (queryType === "societies") {
      if (inputLower.includes("accepting") || inputLower.includes("join")) {
        filters.acceptingNewMembers = true;
      }
    }

    // Team-specific patterns
    if (queryType === "teams") {
      if (inputLower.includes("public")) {
        filters.teamVisibility = "PUBLIC";
      } else if (inputLower.includes("private")) {
        filters.teamVisibility = "PRIVATE";
      }
    }

    return filters;
  }

  /**
   * Validate filters against query type configuration
   */
  private validateFiltersForQueryType(
    filters: Record<string, any>,
    queryType: QueryType
  ): Record<string, any> {
    const config =
      QUERY_TYPE_FILTERS[queryType as keyof typeof QUERY_TYPE_FILTERS];
    const validatedFilters: Record<string, any> = {};

    // Only include filters that are valid for this query type
    config.filters.forEach((filterName) => {
      if (filters.hasOwnProperty(filterName)) {
        validatedFilters[filterName] = filters[filterName];
      }
    });

    // Validate enum values
    Object.entries(config.enums).forEach(([enumField, validValues]) => {
      if (
        validatedFilters[enumField] &&
        !validValues.includes(validatedFilters[enumField])
      ) {
        console.log(
          `Invalid enum value for ${enumField}: ${validatedFilters[enumField]}, removing...`
        );
        delete validatedFilters[enumField];
      }
    });

    // Set defaults
    if (!validatedFilters.limit) validatedFilters.limit = 10;
    if (validatedFilters.limit > 20) validatedFilters.limit = 20;

    // Handle date range validation
    if (
      validatedFilters.dateRange &&
      typeof validatedFilters.dateRange === "object"
    ) {
      const dateRange: { start: Date | null; end: Date | null } = {
        start: null,
        end: null,
      };

      if (
        validatedFilters.dateRange.start &&
        validatedFilters.dateRange.start !== "null"
      ) {
        const startDate = new Date(validatedFilters.dateRange.start);
        if (!isNaN(startDate.getTime())) {
          dateRange.start = startDate;
        }
      }

      if (
        validatedFilters.dateRange.end &&
        validatedFilters.dateRange.end !== "null"
      ) {
        const endDate = new Date(validatedFilters.dateRange.end);
        if (!isNaN(endDate.getTime())) {
          dateRange.end = endDate;
        }
      }

      validatedFilters.dateRange = dateRange;
    }

    return validatedFilters;
  }

  /**
   * Robust JSON parsing with multiple fallback strategies
   */
  private parseJSON(jsonString: string): any {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.log("Direct JSON parse failed, trying cleanup strategies...");

      try {
        let cleaned = jsonString
          .replace(/'/g, '"')
          .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
          .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}])/g, ': "$1"$2')
          .replace(/,(\s*[}\]])/g, "$1")
          .replace(/\n/g, " ")
          .replace(/\t/g, " ")
          .replace(/\s+/g, " ");

        return JSON.parse(cleaned);
      } catch (cleanupError) {
        console.log("JSON cleanup failed, trying regex extraction...");
        return this.extractJSONManually(jsonString);
      }
    }
  }

  /**
   * Manually extract JSON structure when automatic parsing fails
   */
  private extractJSONManually(text: string): Record<string, any> {
    const result: Record<string, any> = { limit: 10 };

    try {
      // Extract string values
      const stringRegex = /"(\w+)"\s*:\s*"([^"]+)"/g;
      let match;
      while ((match = stringRegex.exec(text)) !== null) {
        result[match[1]] = match[2];
      }

      // Extract boolean values
      const boolRegex = /"(\w+)"\s*:\s*(true|false)/g;
      while ((match = boolRegex.exec(text)) !== null) {
        result[match[1]] = match[2] === "true";
      }

      // Extract number values
      const numberRegex = /"(\w+)"\s*:\s*(\d+)/g;
      while ((match = numberRegex.exec(text)) !== null) {
        result[match[1]] = parseInt(match[2]);
      }

      // Extract dateRange
      const dateRangeMatch = text.match(/"dateRange"\s*:\s*\{[^}]*\}/);
      if (dateRangeMatch) {
        const dateRangeText = dateRangeMatch[0];
        const startMatch = dateRangeText.match(/"start"\s*:\s*"([^"]+)"/);
        const endMatch = dateRangeText.match(/"end"\s*:\s*"([^"]+)"/);

        result.dateRange = {};
        if (startMatch && startMatch[1] !== "null") {
          result.dateRange.start = new Date(startMatch[1]);
        }
        if (endMatch && endMatch[1] !== "null") {
          result.dateRange.end = new Date(endMatch[1]);
        }
      }

      return result;
    } catch (error) {
      console.error("Manual JSON extraction failed:", error);
      return { limit: 10 };
    }
  }

  // All the existing query methods remain the same...
  private async queryEvents(filters: Record<string, any>): Promise<string> {
    const whereClause: any = {};

    // Role-based filtering
    if (this.userContext.type === "student") {
      whereClause.OR = [
        { audience: "Open" },
        {
          AND: [
            { audience: "Members" },
            {
              society: {
                members: { some: { studentId: this.userContext.id } },
              },
            },
          ],
        },
      ];
    }

    // Apply filters with strict enum checking
    if (filters.name) {
      whereClause.title = { contains: filters.name, mode: "insensitive" };
    }

    if (filters.category && EventCategories.includes(filters.category as any)) {
      whereClause.categories = { has: filters.category };
    }

    if (filters.eventType && EventType.includes(filters.eventType as any)) {
      whereClause.eventType = filters.eventType;
    }

    if (filters.audience && EventAudience.includes(filters.audience as any)) {
      whereClause.audience = filters.audience;
    }

    if (
      filters.eventStatus &&
      EventStatus.includes(filters.eventStatus as any)
    ) {
      whereClause.status = filters.eventStatus;
    }

    if (filters.location) {
      whereClause.OR = [
        { venueName: { contains: filters.location, mode: "insensitive" } },
        { venueAddress: { contains: filters.location, mode: "insensitive" } },
        { platform: { contains: filters.location, mode: "insensitive" } },
      ].concat(whereClause.OR || []);
    }

    if (filters.dateRange) {
      whereClause.startDate = {};
      if (filters.dateRange.start) {
        whereClause.startDate.gte = filters.dateRange.start;
      }
      if (filters.dateRange.end) {
        whereClause.startDate.lte = filters.dateRange.end;
      }
    }

    if (typeof filters.paidEvent === "boolean") {
      whereClause.paidEvent = filters.paidEvent;
    }

    if (typeof filters.registrationRequired === "boolean") {
      whereClause.registrationRequired = filters.registrationRequired;
    }

    if (filters.societyId) {
      whereClause.societyId = filters.societyId;
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        society: { select: { name: true, logo: true } },
        _count: { select: { eventRegistrations: true } },
      },
      orderBy: { startDate: filters.sortOrder === "desc" ? "desc" : "asc" },
      take: Math.min(filters.limit || 10, 20),
    });

    if (events.length === 0) {
      return "No events found matching your criteria. Try adjusting your search terms or check for upcoming events.";
    }

    const eventList = events
      .map((event) => {
        const registrationInfo =
          event._count.eventRegistrations > 0
            ? `\n👥 Registrations: ${event._count.eventRegistrations}`
            : "";

        return (
          `**${event.title}**\n` +
          `🏢 Society: ${event.society.name}\n` +
          `📅 Date: ${event.startDate?.toLocaleDateString()}\n` +
          `⏰ Time: ${event.startTime} - ${event.endTime}\n` +
          `📍 ${
            event.eventType === "Physical"
              ? `Venue: ${event.venueName}, ${event.venueAddress}`
              : `Platform: ${event.platform}`
          }\n` +
          `👥 Audience: ${event.audience}\n` +
          `📊 Status: ${event.status}\n` +
          `💰 Fee: ${event.paidEvent ? `${event.ticketPrice} PKR` : "Free"}` +
          registrationInfo
        );
      })
      .join("\n\n---\n\n");

    return `Found ${events.length} events:\n\n${eventList}`;
  }

  private async querySocieties(filters: Record<string, any>): Promise<string> {
    const whereClause: any = {};

    if (filters.name) {
      whereClause.name = { contains: filters.name, mode: "insensitive" };
    }

    if (typeof filters.acceptingNewMembers === "boolean") {
      whereClause.acceptingNewMembers = filters.acceptingNewMembers;
    } else {
      whereClause.acceptingNewMembers = true; // Default to accepting new members
    }

    const societies = await prisma.society.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        mission: true,
        membersLimit: true,
        logo: true,
        acceptingNewMembers: true,
        _count: {
          select: {
            members: true,
            events: true,
            teams: true,
          },
        },
        members:
          this.userContext.type === "student"
            ? {
                where: { studentId: this.userContext.id },
                select: { createdAt: true },
              }
            : false,
      },
      take: Math.min(filters.limit || 10, 20),
    });

    if (societies.length === 0) {
      return "No societies found matching your criteria. Try searching with different keywords.";
    }

    const societyList = societies
      .map((society) => {
        const userMembership =
          this.userContext.type === "student" && society.members?.length > 0
            ? society.members[0]
            : null;

        const membershipStatus = userMembership
          ? `\n👤 Member since: ${userMembership.createdAt?.toLocaleDateString()}`
          : "";

        return (
          `**${society.name}**\n` +
          `📝 Description: ${society.description}\n` +
          `🎯 Mission: ${society.mission || "Not specified"}\n` +
          `👥 Members: ${society._count.members}${
            society.membersLimit ? `/${society.membersLimit}` : ""
          }\n` +
          `📅 Events: ${society._count.events}\n` +
          `👥 Teams: ${society._count.teams}\n` +
          `${
            society.acceptingNewMembers
              ? "✅ Accepting new members"
              : "❌ Not accepting new members"
          }` +
          membershipStatus
        );
      })
      .join("\n\n---\n\n");

    return `Found ${societies.length} societies:\n\n${societyList}`;
  }

  private async queryTasks(filters: Record<string, any>): Promise<string> {
    let whereClause: any = {};

    // User context filtering
    if (this.userContext.type === "student") {
      whereClause.createdByStudentId = this.userContext.id;
    } else {
      whereClause.createdByAdvisorId = this.userContext.id;
    }

    // Apply filters
    if (typeof filters.isCompleted === "boolean") {
      whereClause.isCompleted = filters.isCompleted;
    }

    if (typeof filters.isStarred === "boolean") {
      whereClause.isStarred = filters.isStarred;
    }

    if (filters.societyId) {
      whereClause.assignedBySocietyId = filters.societyId;
    }

    if (filters.teamId) {
      whereClause.assignedByTeamId = filters.teamId;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignedBySociety: { select: { name: true } },
        assignedByTeam: { select: { name: true } },
      },
      orderBy: [
        { isStarred: "desc" },
        { createdAt: filters.sortOrder === "asc" ? "asc" : "desc" },
      ],
      take: Math.min(filters.limit || 10, 20),
    });

    if (tasks.length === 0) {
      return "You have no tasks at the moment.";
    }

    const taskList = tasks
      .map(
        (task) =>
          `${task.isStarred ? "⭐ " : ""}**${task.description}**\n` +
          `Status: ${task.isCompleted ? "✅ Completed" : "⏳ Pending"}\n` +
          `${
            task.assignedBySociety
              ? `🏢 Society: ${task.assignedBySociety.name}\n`
              : ""
          }` +
          `${
            task.assignedByTeam ? `👥 Team: ${task.assignedByTeam.name}\n` : ""
          }` +
          `Created: ${task.createdAt?.toLocaleDateString()}`
      )
      .join("\n\n---\n\n");

    return `Your tasks:\n\n${taskList}`;
  }

  private async queryTeams(filters: Record<string, any>): Promise<string> {
    let whereClause: any = {};

    // Society context
    if (this.userContext.societyId) {
      whereClause.societyId = this.userContext.societyId;
    }

    if (filters.name) {
      whereClause.name = { contains: filters.name, mode: "insensitive" };
    }

    if (
      filters.teamVisibility &&
      TeamVisibility.includes(filters.teamVisibility as any)
    ) {
      whereClause.visibility = filters.teamVisibility;
    }

    // For students, filter based on visibility and membership
    if (this.userContext.type === "student") {
      whereClause.OR = [
        { visibility: "PUBLIC" },
        { members: { some: { studentId: this.userContext.id } } },
        { leadId: this.userContext.id },
      ];
    }

    const teams = await prisma.team.findMany({
      where: whereClause,
      include: {
        society: { select: { name: true } },
        lead: { select: { firstName: true, lastName: true } },
        _count: {
          select: {
            members: true,
            teamTasks: true,
          },
        },
      },
      take: Math.min(filters.limit || 10, 20),
    });

    if (teams.length === 0) {
      return "No teams found matching your criteria.";
    }

    const teamList = teams
      .map(
        (team) =>
          `**${team.name}**\n` +
          `🏢 Society: ${team.society.name}\n` +
          `📝 Description: ${team.description || "No description"}\n` +
          `👑 Lead: ${
            team.lead
              ? `${team.lead.firstName} ${team.lead.lastName}`
              : "No lead assigned"
          }\n` +
          `👥 Members: ${team._count.members}\n` +
          `📋 Tasks: ${team._count.teamTasks}\n` +
          `🔒 Visibility: ${team.visibility}`
      )
      .join("\n\n---\n\n");

    return `Found ${teams.length} teams:\n\n${teamList}`;
  }

  private async queryRegistrations(
    filters: Record<string, any>
  ): Promise<string> {
    if (this.userContext.type !== "student") {
      return "Only students can view their event registrations.";
    }

    let whereClause: any = { studentId: this.userContext.id };

    if (
      filters.registrationStatus &&
      RegistrationStatus.includes(filters.registrationStatus as any)
    ) {
      whereClause.status = filters.registrationStatus;
    }

    if (filters.eventId) {
      whereClause.eventId = filters.eventId;
    }

    const registrations = await prisma.eventRegistration.findMany({
      where: whereClause,
      include: {
        event: {
          include: {
            society: { select: { name: true } },
          },
        },
        paymentTransaction: {
          select: { status: true, amount: true },
        },
      },
      orderBy: { registeredAt: filters.sortOrder === "asc" ? "asc" : "desc" },
      take: Math.min(filters.limit || 10, 20),
    });

    if (registrations.length === 0) {
      return "You haven't registered for any events yet.";
    }

    const regList = registrations
      .map(
        (reg) =>
          `**${reg.event.title}**\n` +
          `🏢 Society: ${reg.event.society.name}\n` +
          `📅 Event Date: ${reg.event.startDate?.toLocaleDateString()}\n` +
          `📋 Status: ${reg.status}\n` +
          `🎫 Registered: ${reg.registeredAt?.toLocaleDateString()}\n` +
          `💰 Payment: ${
            reg.paymentTransaction
              ? `${reg.paymentTransaction.status} (${reg.paymentTransaction.amount} PKR)`
              : "Free"
          }`
      )
      .join("\n\n---\n\n");

    return `Your event registrations:\n\n${regList}`;
  }

  private async queryJoinRequests(
    filters: Record<string, any>
  ): Promise<string> {
    if (this.userContext.type !== "student") {
      return "Only students can view their join requests.";
    }

    let whereClause: any = { studentId: this.userContext.id };

    if (
      filters.joinRequestStatus &&
      JoinRequestStatus.includes(filters.joinRequestStatus as any)
    ) {
      whereClause.status = filters.joinRequestStatus;
    }

    if (filters.societyId) {
      whereClause.societyId = filters.societyId;
    }

    const joinRequests = await prisma.joinRequest.findMany({
      where: whereClause,
      include: {
        society: { select: { name: true } },
        interestedRole: { select: { name: true } },
      },
      orderBy: { createdAt: filters.sortOrder === "asc" ? "asc" : "desc" },
      take: Math.min(filters.limit || 10, 20),
    });

    if (joinRequests.length === 0) {
      return "You haven't submitted any join requests.";
    }

    const requestList = joinRequests
      .map(
        (req) =>
          `**${req.society.name}**\n` +
          `📋 Status: ${req.status}\n` +
          `📅 Submitted: ${req.createdAt?.toLocaleDateString()}\n` +
          `🎯 Role: ${req.interestedRole?.name || "General Member"}\n` +
          `${
            req.rejectionReason
              ? `❌ Rejection Reason: ${req.rejectionReason}\n`
              : ""
          }`
      )
      .join("\n\n---\n\n");

    return `Your society join requests:\n\n${requestList}`;
  }

  private async queryTeamJoinRequests(
    filters: Record<string, any>
  ): Promise<string> {
    if (this.userContext.type !== "student") {
      return "Only students can view their team join requests.";
    }

    let whereClause: any = { studentId: this.userContext.id };

    if (
      filters.joinRequestStatus &&
      TeamJoinRequestStatus.includes(filters.joinRequestStatus as any)
    ) {
      whereClause.status = filters.joinRequestStatus;
    }

    if (filters.teamId) {
      whereClause.teamId = filters.teamId;
    }

    const teamJoinRequests = await prisma.teamJoinRequest.findMany({
      where: whereClause,
      include: {
        team: {
          include: {
            society: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: filters.sortOrder === "asc" ? "asc" : "desc" },
      take: Math.min(filters.limit || 10, 20),
    });

    if (teamJoinRequests.length === 0) {
      return "You haven't submitted any team join requests.";
    }

    const requestList = teamJoinRequests
      .map(
        (req) =>
          `**${req.team.name}** (${req.team.society.name})\n` +
          `📋 Status: ${req.status}\n` +
          `📅 Submitted: ${req.createdAt?.toLocaleDateString()}\n` +
          `${req.message ? `💬 Message: ${req.message}\n` : ""}` +
          `${req.responseNote ? `📝 Response: ${req.responseNote}\n` : ""}` +
          `${
            req.respondedAt
              ? `⏰ Responded: ${req.respondedAt.toLocaleDateString()}`
              : ""
          }`
      )
      .join("\n\n---\n\n");

    return `Your team join requests:\n\n${requestList}`;
  }

  private async queryPayments(filters: Record<string, any>): Promise<string> {
    if (this.userContext.type !== "student") {
      return "Only students can view their payment transactions.";
    }

    let whereClause: any = { studentId: this.userContext.id };

    if (
      filters.paymentStatus &&
      PaymentStatus.includes(filters.paymentStatus as any)
    ) {
      whereClause.status = filters.paymentStatus;
    }

    if (filters.eventId) {
      whereClause.eventId = filters.eventId;
    }

    const payments = await prisma.paymentTransaction.findMany({
      where: whereClause,
      include: {
        event: {
          select: { title: true },
        },
        registration: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: filters.sortOrder === "asc" ? "asc" : "desc" },
      take: Math.min(filters.limit || 10, 20),
    });

    if (payments.length === 0) {
      return "You have no payment transactions.";
    }

    const paymentList = payments
      .map(
        (payment) =>
          `**${payment.event.title}**\n` +
          `💰 Amount: ${payment.amount} ${payment.currency}\n` +
          `📋 Status: ${payment.status}\n` +
          `💳 Method: ${payment.paymentMethod}\n` +
          `📅 Created: ${payment.createdAt?.toLocaleDateString()}\n` +
          `${
            payment.paidAt
              ? `✅ Paid: ${payment.paidAt.toLocaleDateString()}\n`
              : ""
          }` +
          `🎫 Registration: ${payment.registration?.status || "N/A"}`
      )
      .join("\n\n---\n\n");

    return `Your payment transactions:\n\n${paymentList}`;
  }

  private async queryMeetings(filters: Record<string, any>): Promise<string> {
    let whereClause: any = {};

    // Context-based filtering
    if (this.userContext.societyId) {
      whereClause.hostSocietyId = this.userContext.societyId;
    }

    if (
      filters.meetingStatus &&
      MeetingStatus.includes(filters.meetingStatus as any)
    ) {
      whereClause.status = filters.meetingStatus;
    }

    if (filters.name) {
      whereClause.title = { contains: filters.name, mode: "insensitive" };
    }

    // For students, show meetings they're invited to or from their society
    if (this.userContext.type === "student") {
      whereClause.OR = [
        {
          hostSociety: {
            members: { some: { studentId: this.userContext.id } },
          },
        },
        { invitations: { some: { studentId: this.userContext.id } } },
      ];
    }

    const meetings = await prisma.meeting.findMany({
      where: whereClause,
      include: {
        hostSociety: { select: { name: true } },
        hostAdvisor: { select: { firstName: true, lastName: true } },
        hostStudent: { select: { firstName: true, lastName: true } },
        _count: {
          select: {
            participants: true,
            invitations: true,
          },
        },
      },
      orderBy: { scheduledAt: filters.sortOrder === "asc" ? "asc" : "desc" },
      take: Math.min(filters.limit || 10, 20),
    });

    if (meetings.length === 0) {
      return "No meetings found matching your criteria.";
    }

    const meetingList = meetings
      .map(
        (meeting) =>
          `**${meeting.title}**\n` +
          `🏢 Society: ${meeting.hostSociety.name}\n` +
          `👤 Host: ${
            meeting.hostAdvisor
              ? `${meeting.hostAdvisor.firstName} ${meeting.hostAdvisor.lastName} (Advisor)`
              : meeting.hostStudent
              ? `${meeting.hostStudent.firstName} ${meeting.hostStudent.lastName} (Student)`
              : "Unknown"
          }\n` +
          `📅 Scheduled: ${meeting.scheduledAt?.toLocaleString()}\n` +
          `📋 Status: ${meeting.status}\n` +
          `👥 Participants: ${meeting._count.participants}\n` +
          `📬 Invitations: ${meeting._count.invitations}\n` +
          `🔗 Code: ${meeting.meetingCode}`
      )
      .join("\n\n---\n\n");

    return `Found ${meetings.length} meetings:\n\n${meetingList}`;
  }

  private async queryAnnouncements(
    filters: Record<string, any>
  ): Promise<string> {
    let whereClause: any = {};

    // Context-based filtering
    if (this.userContext.societyId) {
      whereClause.societyId = this.userContext.societyId;
    }

    if (filters.name) {
      whereClause.title = { contains: filters.name, mode: "insensitive" };
    }

    if (filters.societyId) {
      whereClause.societyId = filters.societyId;
    }

    if (filters.eventId) {
      whereClause.eventId = filters.eventId;
    }

    // Only show published announcements unless user is advisor of the society
    if (this.userContext.type === "student") {
      whereClause.status = "Publish";
      whereClause.publishDateTime = { lte: new Date() };
    }

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      include: {
        society: { select: { name: true } },
        event: { select: { title: true } },
      },
      orderBy: {
        publishDateTime: filters.sortOrder === "asc" ? "asc" : "desc",
      },
      take: Math.min(filters.limit || 10, 20),
    });

    if (announcements.length === 0) {
      return "No announcements found.";
    }

    const announcementList = announcements
      .map(
        (announcement) =>
          `**${announcement.title}**\n` +
          `🏢 Society: ${announcement.society.name}\n` +
          `📝 Content: ${announcement.content.substring(0, 200)}${
            announcement.content.length > 200 ? "..." : ""
          }\n` +
          `👥 Audience: ${announcement.audience}\n` +
          `📅 Published: ${announcement.publishDateTime?.toLocaleDateString()}\n` +
          `${
            announcement.event
              ? `🎪 Related Event: ${announcement.event.title}\n`
              : ""
          }` +
          `📧 Email Sent: ${announcement.sendEmail ? "Yes" : "No"}`
      )
      .join("\n\n---\n\n");

    return `Found ${announcements.length} announcements:\n\n${announcementList}`;
  }

  private async queryPosts(filters: Record<string, any>): Promise<string> {
    let whereClause: any = {};

    // Context-based filtering
    if (this.userContext.societyId) {
      whereClause.societyId = this.userContext.societyId;
    }

    if (filters.societyId) {
      whereClause.societyId = filters.societyId;
    }

    if (filters.eventId) {
      whereClause.eventId = filters.eventId;
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        author: {
          include: {
            student: { select: { firstName: true, lastName: true } },
            advisor: { select: { firstName: true, lastName: true } },
          },
        },
        society: { select: { name: true } },
        event: { select: { title: true } },
        media: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: filters.sortOrder === "asc" ? "asc" : "desc" },
      take: Math.min(filters.limit || 10, 20),
    });

    if (posts.length === 0) {
      return "No posts found.";
    }

    const postList = posts
      .map((post) => {
        const authorName = post.author.student
          ? `${post.author.student.firstName} ${post.author.student.lastName}`
          : post.author.advisor
          ? `${post.author.advisor.firstName} ${post.author.advisor.lastName}`
          : "Unknown";

        return (
          `**Post by ${authorName}**\n` +
          `🏢 Society: ${post.society.name}\n` +
          `📝 Content: ${post.content?.substring(0, 200) || "No text content"}${
            (post.content?.length || 0) > 200 ? "..." : ""
          }\n` +
          `📷 Media: ${post.media.length} attachment(s)\n` +
          `👍 Likes: ${post._count.likes}\n` +
          `💬 Comments: ${post._count.comments}\n` +
          `📅 Posted: ${post.createdAt?.toLocaleDateString()}\n` +
          `${post.event ? `🎪 Related Event: ${post.event.title}` : ""}`
        );
      })
      .join("\n\n---\n\n");

    return `Found ${posts.length} posts:\n\n${postList}`;
  }

  private async getEventDetails(identifier: string): Promise<string> {
    const event = await prisma.event.findFirst({
      where: {
        OR: [
          { title: { contains: identifier, mode: "insensitive" } },
          { id: identifier },
        ],
      },
      include: {
        society: true,
        _count: { select: { eventRegistrations: true } },
        eventRegistrations:
          this.userContext.type === "student"
            ? {
                where: { studentId: this.userContext.id },
                select: {
                  status: true,
                  registeredAt: true,
                  paymentTransaction: {
                    select: { status: true, amount: true },
                  },
                },
              }
            : false,
      },
    });

    if (!event) {
      return `No event found with identifier: ${identifier}. Please check the event name or ID and try again.`;
    }

    const userRegistration =
      this.userContext.type === "student" &&
      event.eventRegistrations?.length > 0
        ? event.eventRegistrations[0]
        : null;

    const registrationStatus = userRegistration
      ? `\n🎫 Your Registration: ${
          userRegistration.status
        } (${userRegistration.registeredAt?.toLocaleDateString()})`
      : "";

    const paymentStatus = userRegistration
      ? `\n💰 Payment: ${userRegistration.status} (${event.ticketPrice} PKR)`
      : "";

    return (
      `**${event.title}**\n\n` +
      `🏢 **Society:** ${event.society.name}\n` +
      `📅 **Date:** ${event.startDate?.toLocaleDateString()}\n` +
      `⏰ **Time:** ${event.startTime} - ${event.endTime}\n` +
      `📍 **${event.eventType}:** ${
        event.eventType === "Physical"
          ? `${event.venueName}, ${event.venueAddress}`
          : event.platform
      }\n` +
      `👥 **Audience:** ${event.audience}\n` +
      `📊 **Status:** ${event.status}\n` +
      `🏷️ **Categories:** ${event.categories.join(", ")}\n` +
      `📝 **Description:** ${event.description}\n` +
      `💰 **Registration Fee:** ${
        event.paidEvent ? `${event.ticketPrice} PKR` : "Free"
      }\n` +
      `📊 **Total Registrations:** ${event._count.eventRegistrations}\n` +
      `⏰ **Registration Deadline:** ${
        event.registrationDeadline?.toLocaleDateString() || "Not specified"
      }` +
      registrationStatus +
      paymentStatus
    );
  }

  private async getSocietyDetails(identifier: string): Promise<string> {
    const society = await prisma.society.findFirst({
      where: {
        OR: [
          { name: { contains: identifier, mode: "insensitive" } },
          { id: identifier },
        ],
      },
      include: {
        advisor: {
          select: { firstName: true, lastName: true, displayName: true },
        },
        _count: {
          select: {
            members: true,
            events: true,
            teams: true,
            announcements: true,
          },
        },
        members:
          this.userContext.type === "student"
            ? {
                where: { studentId: this.userContext.id },
                select: { createdAt: true },
              }
            : false,
      },
    });

    if (!society) {
      return `No society found with identifier: ${identifier}. Please check the society name or ID and try again.`;
    }

    const userMembership =
      this.userContext.type === "student" && society.members?.length > 0
        ? society.members[0]
        : null;

    const membershipStatus = userMembership
      ? `\n👤 Your Membership: Member since ${userMembership.createdAt?.toLocaleDateString()}`
      : society.acceptingNewMembers
      ? `\n✅ You can join this society`
      : `\n❌ Not currently accepting new members`;

    return (
      `**${society.name}**\n\n` +
      `📝 **Description:** ${society.description}\n` +
      `🎯 **Mission:** ${society.mission || "Not specified"}\n` +
      `💭 **Statement of Purpose:** ${
        society.statementOfPurpose || "Not provided"
      }\n` +
      `⭐ **Core Values:** ${society.coreValues || "Not provided"}\n` +
      `👤 **Advisor:** ${
        society.advisor ? `${society.advisor.displayName}` : "Not assigned"
      }\n` +
      `👥 **Members:** ${society._count.members}${
        society.membersLimit ? `/${society.membersLimit}` : ""
      }\n` +
      `📅 **Events:** ${society._count.events}\n` +
      `👥 **Teams:** ${society._count.teams}\n` +
      `📢 **Announcements:** ${society._count.announcements}\n` +
      `🔄 **Accepting New Members:** ${
        society.acceptingNewMembers ? "Yes" : "No"
      }` +
      membershipStatus
    );
  }

  private async getTeamDetails(identifier: string): Promise<string> {
    const team = await prisma.team.findFirst({
      where: {
        OR: [
          { name: { contains: identifier, mode: "insensitive" } },
          { id: identifier },
        ],
      },
      include: {
        society: { select: { name: true } },
        lead: { select: { firstName: true, lastName: true } },
        members: {
          include: {
            student: { select: { firstName: true, lastName: true } },
          },
        },
        _count: {
          select: {
            teamTasks: true,
            joinRequests: true,
          },
        },
      },
    });

    if (!team) {
      return `No team found with identifier: ${identifier}. Please check the team name or ID and try again.`;
    }

    const membersList = team.members
      .map((member) => `${member.student.firstName} ${member.student.lastName}`)
      .join(", ");

    const userIsMember =
      this.userContext.type === "student" &&
      team.members.some((member) => member.studentId === this.userContext.id);

    const userIsLead =
      this.userContext.type === "student" &&
      team.leadId === this.userContext.id;

    return (
      `**${team.name}**\n\n` +
      `🏢 **Society:** ${team.society.name}\n` +
      `📝 **Description:** ${team.description || "No description provided"}\n` +
      `👑 **Team Lead:** ${
        team.lead
          ? `${team.lead.firstName} ${team.lead.lastName}`
          : "No lead assigned"
      }\n` +
      `🔒 **Visibility:** ${team.visibility}\n` +
      `👥 **Members (${team.members.length}):** ${
        membersList || "No members"
      }\n` +
      `📋 **Tasks:** ${team._count.teamTasks}\n` +
      `📬 **Join Requests:** ${team._count.joinRequests}\n` +
      `📅 **Created:** ${team.createdAt?.toLocaleDateString()}\n` +
      `${
        userIsLead
          ? "👑 You are the team lead"
          : userIsMember
          ? "👤 You are a member"
          : ""
      }`
    );
  }
}

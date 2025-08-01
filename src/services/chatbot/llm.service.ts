import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { chatbotConfig } from "./config";

interface QueryClassification {
  type: "simple" | "complex";
  requiresTools: boolean;
  suggestedTools: string[];
  confidence: number;
  reasoning: string;
}

interface SimpleResponse {
  response: string;
  isAppropriate: boolean;
}

export class LLMService {
  public llm: ChatTogetherAI;
  public embeddings: HuggingFaceInferenceEmbeddings;
  private fastLLM: ChatTogetherAI; // Faster model for classification

  constructor() {
    this.llm = new ChatTogetherAI({
      model: chatbotConfig.llm.model,
      apiKey: process.env.TOGETHER_AI_API_KEY!,
      maxTokens: chatbotConfig.llm.maxTokens,
      temperature: chatbotConfig.llm.temperature,
    });

    // Faster model for quick classification tasks
    this.fastLLM = new ChatTogetherAI({
      model: "meta-llama/Llama-3.2-3B-Instruct-Turbo", // Smaller, faster model
      apiKey: process.env.TOGETHER_AI_API_KEY!,
      maxTokens: 150,
      temperature: 0.1,
    });

    this.embeddings = new HuggingFaceInferenceEmbeddings({
      model: chatbotConfig.embedding.model,
      apiKey: process.env.HUGGINGFACE_API_TOKEN!,
    });
  }

  createReActPrompt(): ChatPromptTemplate {
    const template = `You are SocioBot, a helpful assistant for SocioHub, a student society management platform.

You have access to the following tools:
{tools}

IMPORTANT GUIDELINES:
- Only use tools when necessary to provide accurate, specific information
- For general questions you can answer with your knowledge, respond directly
- Use tools strategically to avoid unnecessary delays

Tool Usage Strategy:
- database_query: For specific SocioHub data (events, societies, tasks, registrations)
- document_retrieval: For how-to questions and platform features
- web_search: Only for external information not related to SocioHub

Format for tool usage:
Question: the input question you must answer
Thought: I should determine if I can answer this directly or need specific tools
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

For questions you can answer directly, provide the Final Answer immediately.

Current conversation history:
{chat_history}

User Context: {user_context}

Question: {input}
Thought: {agent_scratchpad}`;

    return ChatPromptTemplate.fromTemplate(template);
  }

  /**
   * Advanced query classification using LLM
   */
  async classifyQuery(
    query: string,
    userContext: any
  ): Promise<QueryClassification> {
    const classificationPrompt = `Analyze this user query and classify it for a SocioHub chatbot assistant.

User Query: "${query}"
User Context: ${JSON.stringify(userContext)}

Classify the query and provide response in JSON format:
{
  "type": "simple" | "complex",
  "requiresTools": boolean,
  "suggestedTools": ["tool1", "tool2"] // from: database_query, document_retrieval, web_search,
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation"
}

Classification Rules:
- SIMPLE: Greetings, thanks, casual conversation, general questions answerable with common knowledge
- COMPLEX: Requires specific SocioHub data, how-to guides, or external information

Tool Requirements:
- database_query: Specific data about events, societies, tasks, registrations (e.g., "show my events", "find tech societies")
- document_retrieval: How-to questions, platform features (e.g., "how to register for events", "what is SocioHub")
- web_search: External information not about SocioHub (e.g., "best event planning practices")

Examples:
- "hi there" → simple, no tools
- "hi, can you show me upcoming events?" → complex, needs database_query
- "how do I register for events?" → complex, needs document_retrieval
- "what are some good team building activities?" → complex, needs web_search

Respond with valid JSON only:`;

    try {
      const response = await this.fastLLM.invoke([
        { role: "user", content: classificationPrompt },
      ]);

      const content = response.content.toString().trim();

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const classification = JSON.parse(jsonMatch[0]) as QueryClassification;

      // Validate classification
      if (
        !classification.type ||
        !["simple", "complex"].includes(classification.type)
      ) {
        throw new Error("Invalid classification type");
      }

      return classification;
    } catch (error) {
      console.error("Query classification error:", error);

      // Fallback classification
      return this.fallbackClassification(query);
    }
  }

  /**
   * Generate intelligent simple response using LLM
   */
  async generateSimpleResponse(
    query: string,
    userContext: any
  ): Promise<SimpleResponse> {
    const simpleResponsePrompt = `You are SocioBot, a friendly assistant for SocioHub (student society management platform).

User Query: "${query}"
User Context: ${JSON.stringify(userContext)}

Provide a conversational response to this simple query. Keep it:
- Friendly and welcoming
- Brief but helpful
- Contextually appropriate for SocioHub
- Under 100 words

If the query seems to need specific SocioHub data or detailed instructions, respond with:
"I'd be happy to help you with that! Let me get the specific information you need."

Respond in JSON format:
{
  "response": "your response here",
  "isAppropriate": true/false // false if query actually needs tools despite being classified as simple
}`;

    try {
      const response = await this.fastLLM.invoke([
        { role: "user", content: simpleResponsePrompt },
      ]);

      const content = response.content.toString().trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("No JSON found in simple response");
      }

      return JSON.parse(jsonMatch[0]) as SimpleResponse;
    } catch (error) {
      console.error("Simple response generation error:", error);

      // Fallback response
      return {
        response:
          "Hello! I'm your SocioHub assistant. How can I help you today?",
        isAppropriate: true,
      };
    }
  }

  /**
   * Fallback classification when LLM fails
   */
  private fallbackClassification(query: string): QueryClassification {
    const queryLower = query.toLowerCase().trim();

    // Simple patterns
    const simplePatterns = [
      /^(hi|hello|hey|sup)[\s!.]*$/i,
      /^(thanks|thank you|thx)[\s!.]*$/i,
      /^(bye|goodbye|see you)[\s!.]*$/i,
      /^(yes|no|ok|okay)[\s!.]*$/i,
      /^(how are you|what's up|how's it going)[\s!.]*$/i,
    ];

    const isSimple = simplePatterns.some((pattern) => pattern.test(queryLower));

    if (isSimple) {
      return {
        type: "simple",
        requiresTools: false,
        suggestedTools: [],
        confidence: 0.9,
        reasoning: "Matches simple greeting/conversation pattern",
      };
    }

    // Complex query - determine tools needed
    const suggestedTools: string[] = [];

    if (
      queryLower.match(
        /\b(event|society|task|registration|my |show |list |find )\b/
      )
    ) {
      suggestedTools.push("database_query");
    }

    if (
      queryLower.match(/\b(how to|how do|what is|explain|guide|help|feature)\b/)
    ) {
      suggestedTools.push("document_retrieval");
    }

    if (
      queryLower.match(/\b(best|advice|tips|practices|external|general)\b/) &&
      !queryLower.match(/\b(sociohub|event|society|task)\b/)
    ) {
      suggestedTools.push("web_search");
    }

    return {
      type: "complex",
      requiresTools: suggestedTools.length > 0,
      suggestedTools,
      confidence: 0.7,
      reasoning: "Fallback classification based on keywords",
    };
  }

  /**
   * Fast query preprocessing for routing
   */
  async preprocessQuery(
    query: string,
    userContext: any
  ): Promise<{
    classification: QueryClassification;
    simpleResponse?: SimpleResponse;
    shouldUseAgent: boolean;
  }> {
    const classification = await this.classifyQuery(query, userContext);

    if (classification.type === "simple") {
      const simpleResponse = await this.generateSimpleResponse(
        query,
        userContext
      );

      return {
        classification,
        simpleResponse,
        shouldUseAgent: !simpleResponse.isAppropriate,
      };
    }

    return {
      classification,
      shouldUseAgent: true,
    };
  }
}

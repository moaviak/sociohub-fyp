import { TavilySearch } from "@langchain/tavily";
import { Tool } from "@langchain/core/tools";
import { UserContext } from "../types";
import { emitEventToUser } from "../../../socket";
import { io } from "../../../app";

export class WebSearchTool extends Tool {
  name = "web_search";
  description =
    "Search the web for general information, current events, best practices, or external resources not available in the SocioHub platform. Use this for questions about external topics or general advice.";

  private tavilySearch: TavilySearch;

  constructor(private userContext: UserContext) {
    super();

    this.tavilySearch = new TavilySearch({
      maxResults: 5,
      tavilyApiKey: process.env.TAVILY_API_KEY!,
    });
  }

  async _call(query: string): Promise<string> {
    try {
      emitEventToUser(io, this.userContext.id, "tool_status", {
        tool: "web_search",
        status: "running",
        message: "Searching the web...",
      });

      const results = await this.tavilySearch.invoke({ query });

      emitEventToUser(io, this.userContext.id, "tool_status", {
        tool: "web_search",
        status: "complete",
        message: "Web search completed successfully",
      });

      if (!results || Object.keys(results).length === 0) {
        return "No relevant web search results found for your query.";
      }

      return `Web search results:\n\n${JSON.stringify(results, null, 2)}`;
    } catch (error) {
      console.error("Web search error:", error);
      return "I encountered an error while searching the web. Please try again.";
    }
  }
}

import { CheckCircle, Database, FileText, Search } from "lucide-react";
import { ToolStatus } from "../slice";

export const ToolStatusIndicator: React.FC<{ toolStatus: ToolStatus[] }> = ({
  toolStatus,
}) => {
  const getToolIcon = (tool: string) => {
    switch (tool) {
      case "document_retrieval":
        return FileText;
      case "database_query":
        return Database;
      case "web_search":
        return Search;
      default:
        return FileText;
    }
  };

  const getToolMessage = (tool: string, status: string) => {
    const messages = {
      document_retrieval: {
        running: "Reading documents...",
        complete: "Documents analyzed",
      },
      database_query: {
        running: "Querying database...",
        complete: "Database query completed",
      },
      web_search: {
        running: "Searching the web...",
        complete: "Search results retrieved",
      },
    };

    return (
      messages[tool as keyof typeof messages]?.[
        status as keyof typeof messages.document_retrieval
      ] || "Processing..."
    );
  };

  if (!toolStatus.length) return null;

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-blue-50 border border-blue-200">
        <div className="space-y-2">
          {toolStatus.map((tool, index) => {
            const IconComponent = getToolIcon(tool.tool);
            const isRunning = tool.status === "running";
            const isComplete = tool.status === "complete";

            return (
              <div
                key={`${tool.tool}-${index}`}
                className={`flex items-center gap-2 ${
                  isRunning ? "animate-pulse" : ""
                }`}
              >
                <div>
                  {isComplete ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <IconComponent
                      className={`h-4 w-4 ${
                        isRunning ? "text-blue-500" : "text-gray-500"
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`text-xs ${
                    isComplete
                      ? "text-green-700"
                      : isRunning
                      ? "text-blue-700"
                      : "text-gray-700"
                  }`}
                >
                  {getToolMessage(tool.tool, tool.status)}
                </span>
                {isComplete && (
                  <div className="ml-1">
                    <div className="h-1 w-1 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

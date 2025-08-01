import { useState } from "react";
import { AgentThought } from "../slice";
import {
  AlertTriangle,
  Brain,
  CheckCircle,
  ChevronRight,
  Lightbulb,
  Zap,
} from "lucide-react";

export const AgentThoughtIndicator: React.FC<{
  agentThought: AgentThought;
}> = ({ agentThought }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getThoughtIcon = (type: string, status: string) => {
    if (status === "error") {
      return AlertTriangle;
    }

    switch (type) {
      case "reasoning":
        return Brain;
      case "tool_call":
        return Zap;
      case "tool_result":
        return CheckCircle;
      case "final_answer":
        return Lightbulb;
      default:
        return Brain;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "thinking":
        return "text-blue-500";
      case "executing":
        return "text-orange-500";
      case "completed":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case "thinking":
        return "border-blue-200 bg-blue-50";
      case "executing":
        return "border-orange-200 bg-orange-50";
      case "completed":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const IconComponent = getThoughtIcon(agentThought.type, agentThought.status);
  const isActive =
    agentThought.status === "thinking" || agentThought.status === "executing";

  return (
    <div className="flex justify-start">
      <div
        className={`max-w-[85%] rounded-lg border ${getBorderColor(
          agentThought.status
        )} overflow-hidden`}
      >
        <div
          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-opacity-80 transition-all duration-200"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2 flex-1">
            <IconComponent
              className={`h-4 w-4 ${getStatusColor(agentThought.status)} ${
                isActive ? "animate-pulse" : ""
              }`}
            />
            <span
              className={`b4-medium ${getStatusColor(agentThought.status)} ${
                isActive ? "animate-pulse" : ""
              }`}
            >
              {agentThought.title}
            </span>
            {agentThought.toolName && (
              <span className="b4-regular px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {agentThought.toolName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {agentThought.description && (
              <div
                className={`transition-transform duration-200 ${
                  isExpanded ? "rotate-90" : ""
                }`}
              >
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {isExpanded && agentThought.description && (
          <div className="px-4 pb-3 border-t border-gray-200 bg-white bg-opacity-50">
            <p className="b4-regular text-gray-700 mt-2 leading-relaxed">
              {agentThought.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

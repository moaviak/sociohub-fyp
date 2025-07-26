import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Play,
  User,
  XCircle,
} from "lucide-react";
import { TeamTask } from "../types";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { TaskOptions } from "./task-options";

export const TaskCard: React.FC<{
  task: TeamTask;
  isLead?: boolean;
  onStatusChange?: (taskId: string, newStatus: TeamTask["status"]) => void;
}> = ({ task: initialTask, isLead, onStatusChange }) => {
  // Local state for optimistic updates
  const [task, setTask] = useState<TeamTask>(initialTask);

  // Update local state when prop changes (after backend sync)
  useEffect(() => {
    setTask(initialTask);
  }, [initialTask]);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const formatCreatedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const getStatusConfig = (status: TeamTask["status"]) => {
    switch (status) {
      case "TO_DO":
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
          label: "Pending",
        };
      case "IN_PROGRESS":
        return {
          icon: <Play className="h-3 w-3" />,
          className: "bg-primary-100 text-primary-800 border-primary-200",
          label: "In Progress",
        };
      case "COMPLETED":
        return {
          icon: <CheckCircle2 className="h-3 w-3" />,
          className: "bg-primary-100 text-emerald-800 border-emerald-200",
          label: "Completed",
        };
      case "CANCELLED":
        return {
          icon: <XCircle className="h-3 w-3" />,
          className: "bg-red-100 text-red-800 border-red-200",
          label: "Cancelled",
        };
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "COMPLETED";

  const handleStatusChange = (newStatus: TeamTask["status"]) => {
    // Optimistically update the local state
    setTask((prev) => ({
      ...prev,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    }));

    // Call the parent handler for backend sync
    if (onStatusChange) {
      onStatusChange(task.id, newStatus);
    }
  };

  return (
    <div className="group flex flex-col gap-3 p-4 hover:bg-gray-50 transition-colors duration-200 rounded-lg border border-transparent hover:border-gray-200">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="b2-semibold text-gray-900 truncate">{task.title}</h3>
            <Badge
              className={`${statusConfig.className} text-xs font-medium border`}
            >
              {statusConfig.icon}
              <span className="ml-1">{statusConfig.label}</span>
            </Badge>
            {isOverdue && (
              <Badge className="bg-red-100 text-red-800 border-red-200 text-xs font-medium border">
                <AlertCircle className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            )}
          </div>

          {task.description && (
            <p className="b3-regular text-gray-600 mb-2 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600">
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Due {formatDate(task.dueDate)}
              </span>
            )}
            {task.assignedBy && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Assigned by {task.assignedBy.firstName}{" "}
                {task.assignedBy.lastName}
              </span>
            )}
            <span>Created {formatCreatedDate(task.createdAt)}</span>
          </div>
        </div>

        {/* Actions Dropdown - Only visible for leaders */}
        {isLead && (
          <TaskOptions handleStatusChange={handleStatusChange} task={task} />
        )}
      </div>
    </div>
  );
};

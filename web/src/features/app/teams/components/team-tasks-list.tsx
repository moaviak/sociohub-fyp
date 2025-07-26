import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Clock } from "lucide-react";
import { Team, TeamTask } from "../types";
import { TaskCard } from "./task-card";
import { useUpdateTaskStatusMutation } from "../api";
import { toast } from "sonner";
import ApiError from "@/features/api-error";
import { CreateTaskModal } from "./create-task-modal";

interface TeamTasksListProps {
  team: Team;
  tasks: TeamTask[];
  isLead?: boolean;
}

export const TeamTasksList: React.FC<TeamTasksListProps> = ({
  team,
  tasks,
  isLead = false,
}) => {
  // Sort tasks: pending/in-progress first, then by due date, then by created date
  const sortedTasks = [...tasks].sort((a, b) => {
    // Priority order: PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    const statusPriority = {
      TO_DO: 0,
      IN_PROGRESS: 1,
      COMPLETED: 2,
      CANCELLED: 3,
    };

    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }

    // If both have due dates, sort by due date
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }

    // Tasks with due dates come first
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;

    // Sort by created date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getTaskCounts = () => {
    return {
      pending: tasks.filter((t) => t.status === "TO_DO").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      completed: tasks.filter((t) => t.status === "COMPLETED").length,
    };
  };

  const taskCounts = getTaskCounts();

  const [updateStatus] = useUpdateTaskStatusMutation();

  const onStatusChange = async (
    taskId: string,
    newStatus: TeamTask["status"]
  ) => {
    try {
      await updateStatus({ taskId, status: newStatus }).unwrap();
      toast.success("Task status updated successfully.");
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Failed to update task status";
      toast.error(message);
    }
  };

  return (
    <Card className="border-0 shadow-md gap-y-2">
      {/* Header */}
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="h6-bold text-gray-900">Team Tasks</h2>
            <div className="flex items-center gap-4 mt-1 b3-medium">
              <span className="text-yellow-600">
                {taskCounts.pending} pending
              </span>
              <span className="text-primary-600">
                {taskCounts.inProgress} in progress
              </span>
              <span className="text-emerald-600">
                {taskCounts.completed} completed
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {isLead && (
            <div className="flex gap-2">
              <CreateTaskModal team={team}>
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Task
                </Button>
              </CreateTaskModal>
            </div>
          )}
        </div>
      </CardHeader>

      {/* Tasks List */}
      <CardContent className="px-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tasks yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start organizing your team's work by creating tasks.
            </p>
            {isLead && (
              <CreateTaskModal team={team}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Task
                </Button>
              </CreateTaskModal>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isLead={isLead}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

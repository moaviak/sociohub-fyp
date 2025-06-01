import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Task } from "@/types";
import { Star, Trash2 } from "lucide-react";
import { TaskDescriptionForm } from "./task-description-form";
import {
  useCompleteTaskMutation,
  useDeleteTaskMutation,
  useStarTaskMutation,
} from "../api";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { toast } from "sonner";
import ApiError from "@/features/api-error";
import { useDebounceCallback } from "usehooks-ts";
import { Hint } from "@/components/hint";

interface TaskProps {
  task: Task;
  isNew?: boolean;
  onCreate?: (task: Task) => void;
}

export const TaskRow = ({ task, isNew = false, onCreate }: TaskProps) => {
  const [completeTask] = useCompleteTaskMutation();
  const [starTask] = useStarTaskMutation();
  const [deleteTask, { isLoading }] = useDeleteTaskMutation();

  const [isComplete, setIsComplete] = useState(task.isCompleted);
  const [isStarred, setIsStarred] = useState(task.isStarred);

  const debouncedCompleteTask = useDebounceCallback(
    (completed: boolean) => {
      console.log({ completed });
      completeTask({ id: task.id, isCompleted: completed });
    },
    400 // debounce delay in ms
  );

  const debouncedStarTask = useDebounceCallback((starred: boolean) => {
    starTask({ id: task.id, isStarred: starred });
  }, 400);

  const handleComplete = () => {
    setIsComplete((prev) => {
      const newValue = !prev;
      console.log({ newValue });
      debouncedCompleteTask(newValue);
      return newValue;
    });
  };

  const handleStarred = () => {
    setIsStarred((prev) => {
      const newValue = !prev;
      debouncedStarTask(newValue);
      return newValue;
    });
  };

  const handleDelete = async () => {
    try {
      const response = await deleteTask({ id: task.id });

      if (!("error" in response)) {
        toast.success("Task successfully deleted.");
      } else {
        throw new Error("Unexpected error occurred while deleting.");
      }
    } catch (error) {
      const message =
        (error as ApiError).errorMessage ||
        (error as Error).message ||
        "Unexpected error occurred while deleting.";

      toast.error(message);
    }
  };

  if (isNew) {
    return (
      <div className="flex p-6 rounded-md outline outline-neutral-300 items-center gap-4">
        <Checkbox
          disabled
          className="w-5 h-5 data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600 border-neutral-400 cursor-pointer"
        />
        <TaskDescriptionForm data={task} isNew onCreate={onCreate} />
        <Button variant="ghost" size="inline" className="group" disabled>
          <Star
            className={cn(
              "w-5 h-5 group-hover:text-amber-300! group-hover:fill-amber-300! ",
              isStarred ? "text-amber-300 fill-amber-300" : "text-neutral-400"
            )}
          />
        </Button>
        <Button variant="ghost" size="inline" disabled>
          <Trash2 className="w-5 h-5 text-red-400" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex p-6 rounded-md outline outline-neutral-300 items-center gap-4">
      <Checkbox
        checked={isComplete}
        onCheckedChange={handleComplete}
        className="w-5 h-5 data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600 border-neutral-400 cursor-pointer"
      />
      <TaskDescriptionForm data={task} />
      {task.assignedBySociety && (
        <Hint description={`Task Assigned by: ${task.assignedBySociety.name}`}>
          <img
            src={
              task.assignedBySociety.logo ||
              "/assets/images/society-placeholder.png"
            }
            className="w-10 rounded-full"
          />
        </Hint>
      )}
      <Button
        variant="ghost"
        size="inline"
        className="group"
        onClick={handleStarred}
      >
        <Star
          className={cn(
            "w-5 h-5 group-hover:text-amber-300! group-hover:fill-amber-300! ",
            isStarred ? "text-amber-300 fill-amber-300" : "text-neutral-400"
          )}
        />
      </Button>
      <Button
        variant="ghost"
        size="inline"
        disabled={
          !!task.assignedBySociety || !!task.assignedBySocietyId || isLoading
        }
        onClick={handleDelete}
      >
        <Trash2 className="w-5 h-5 text-red-400" />
      </Button>
    </div>
  );
};

TaskRow.Skeleton = function () {
  return (
    <div className="flex p-6 rounded-md outline outline-neutral-300 items-center gap-2">
      <Skeleton className="h-5 w-5 rounded-md" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-6 w-6 rounded-md" />
      <Skeleton className="h-6 w-6 rounded-md" />
    </div>
  );
};

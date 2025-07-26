import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Team } from "../types";
import { useState } from "react";
import { ListTodo } from "lucide-react";
import { TaskFormData } from "../schema";
import { useAssignTeamTaskMutation } from "../api";
import { toast } from "sonner";
import ApiError from "@/features/api-error";
import { TaskForm } from "./task-form";

export const AssignTaskModal: React.FC<{
  team: Team;
  onClose?: () => void;
}> = ({ team, onClose }) => {
  const [isOpen, setIsOpen] = useState(onClose ? true : false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Notify parent component
      if (onClose) {
        // Use requestAnimationFrame to ensure the state is updated before unmounting
        requestAnimationFrame(() => {
          onClose();
        });
      }
    }
  };

  const [assignTask, { isLoading }] = useAssignTeamTaskMutation();

  const handleSubmit = async (data: TaskFormData) => {
    try {
      await assignTask({
        teamId: team.id,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        societyId: team.societyId,
      }).unwrap();

      toast.success("Task assigned successfully.");

      handleOpenChange(false);
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Failed to assign task";
      toast.error(message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!onClose && (
        <DialogTrigger asChild>
          <ListTodo className="mr-2 h-4 w-4" />
          Assign Task
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Task</DialogTitle>
          <DialogDescription>{`Assign a task to ${team.name}.`}</DialogDescription>
        </DialogHeader>

        <TaskForm
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
          isLoading={isLoading}
          submitLabel="Assign"
        />
      </DialogContent>
    </Dialog>
  );
};

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, useState } from "react";
import { Team } from "../types";
import { TaskForm } from "./task-form";
import { TaskFormData } from "../schema";
import { useCreateTeamTaskMutation } from "../api";
import { toast } from "sonner";
import ApiError from "@/features/api-error";

export const CreateTaskModal: React.FC<{ team: Team; children: ReactNode }> = ({
  team,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [createTask, { isLoading }] = useCreateTeamTaskMutation();

  const handleSubmit = async (data: TaskFormData) => {
    try {
      await createTask({
        teamId: team.id,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        societyId: team.societyId,
      }).unwrap();

      toast.success("Task created successfully.");
      setIsOpen(false);
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Failed to create task";
      toast.error(message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>{`Create a new task for ${team.name}.`}</DialogDescription>
        </DialogHeader>
        <TaskForm
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
          isLoading={isLoading}
          submitLabel="Create"
        />
      </DialogContent>
    </Dialog>
  );
};

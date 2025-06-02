import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Member } from "@/types";
import { useState } from "react";
import { useAssignTaskMutation } from "../../todo-list/api";
import { toast } from "sonner";
import ApiError from "@/features/api-error";

interface AssignTaskProps {
  member: Member;
  onClose?: () => void;
}

export const AssignTask = ({ member, onClose }: AssignTaskProps) => {
  const [isOpen, setIsOpen] = useState(onClose ? true : false);
  const [value, setValue] = useState("");

  const [assignTask, { isLoading }] = useAssignTaskMutation();

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

  const handleSubmit = async () => {
    try {
      const response = await assignTask({
        description: value,
        memberId: member.id,
        societyId: member.societyId,
      });

      if (!("error" in response)) {
        toast.success("Task assigned to member.");
        handleOpenChange(false);
      } else {
        throw new Error("Unexpected error occurred. Please try again!");
      }
    } catch (error) {
      const message =
        (error as ApiError).errorMessage ||
        (error as Error).message ||
        "Unexpected error occurred. Please try again!";

      toast.error(message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={true}>
      {!onClose && (
        <DialogTrigger asChild>
          <p className="cursor-pointer b3-regular">Manage Roles</p>
        </DialogTrigger>
      )}
      <DialogContent
        className="sm:max-w-xl"
        onClick={(e) => e.stopPropagation()}
        onPointerDownCapture={(e) => e.stopPropagation()}
        onInteractOutside={(e) => {
          e.preventDefault();
          handleOpenChange(false);
        }}
      >
        <form className="flex flex-col gap-y-6" action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
            <DialogDescription>
              Assign a task to {member.firstName} {member.lastName}.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="description">Task Description</Label>
            <Input
              id="description"
              name="description"
              value={value}
              required
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter a task description to assign"
              className="outline outline-neutral-400"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              Assign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

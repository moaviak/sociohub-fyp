"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Task } from "@/types";
import { ComponentRef, useRef, useState, useEffect } from "react";
import { useUpdateTaskMutation, useCreateTaskMutation } from "../api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TaskDescriptionFormProps {
  data: Task;
  isNew?: boolean;
  onCreate?: (task: Task) => void;
  variant?: "default" | "compact";
}

export const TaskDescriptionForm = ({
  data,
  isNew = false,
  onCreate,
  variant = "default",
}: TaskDescriptionFormProps) => {
  const formRef = useRef<ComponentRef<"form">>(null);
  const inputRef = useRef<ComponentRef<"input">>(null);

  const [description, setDescription] = useState(data.description);
  const [isEditing, setIsEditing] = useState(isNew);

  const [updateTask] = useUpdateTaskMutation();
  const [createTask] = useCreateTaskMutation();

  useEffect(() => {
    if (isNew && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isNew]);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const onSubmit = async (formData: FormData) => {
    const description = formData.get("description") as string;
    if (isNew && onCreate) {
      try {
        disableEditing();
        const response = await createTask({ description });
        if (!("error" in response) && !("error" in response.data)) {
          toast.success("Task created.");
          onCreate(response.data);
        } else {
          throw new Error("Api error.");
        }
      } catch (error) {
        toast.error("Failed to create task.");
        console.error(error);
      }
    } else {
      try {
        const response = await updateTask({ id: data.id, description });
        if (!("error" in response) && !("error" in response.data)) {
          toast.success("Task description updated.");
          setDescription(response.data.description);
          disableEditing();
        } else {
          throw new Error("Api error.");
        }
      } catch (error) {
        toast.error("Failed to update task description.");
        console.error(error);
      }
    }
  };

  const onBlur = () => {
    formRef.current?.requestSubmit();
  };

  if (isEditing) {
    return (
      <form
        action={onSubmit}
        ref={formRef}
        className={cn(
          "flex items-center w-full",
          variant === "compact" ? "gap-x-1" : "gap-x-2"
        )}
      >
        <Input
          ref={inputRef}
          required
          id="description"
          name="description"
          onBlur={onBlur}
          defaultValue={description}
          className={cn(
            variant === "compact"
              ? "text-xs px-2 py-0.5 h-6"
              : "b2-regular px-[7px] py-1 h-7",
            "bg-transparent text-neutral-700 focus-visible:outline-none focus-visible:ring-transparent border-none"
          )}
        />
      </form>
    );
  }

  return (
    <Button
      onClick={enableEditing}
      variant="transparent"
      className={cn(
        "text-neutral-700 justify-start! h-auto w-full whitespace-normal text-left",
        variant === "compact"
          ? "b3-regular h-auto w-full p-0 px-1"
          : "b2-regular p-1 px-2"
      )}
      disabled={!!data.assignedBySociety || !!data.assignedBySocietyId}
    >
      {description}
    </Button>
  );
};

import { z } from "zod";

export const teamFormSchema = z.object({
  logo: z.instanceof(File).optional(),
  name: z.string().min(1, "Team name is required"),
  description: z.string().optional(),
  lead: z.string().min(1, "Team lead is required"),
});

export type TeamFormData = z.infer<typeof teamFormSchema>;

export const taskFormSchema = z
  .object({
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    dueDate: z.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.dueDate && data.dueDate < new Date()) {
      ctx.addIssue({
        code: "invalid_date",
        message: "Due date cannot be in the past",
        path: ["dueDate"],
      });
      return false;
    }
    return true;
  });

export type TaskFormData = z.infer<typeof taskFormSchema>;

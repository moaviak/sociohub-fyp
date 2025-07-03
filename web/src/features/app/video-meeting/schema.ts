import { z } from "zod";

export const createMeetingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.date().refine((date) => date > new Date(), {
    message: "Start time must be in the future",
  }),
  audienceType: z
    .enum(["ALL_SOCIETY_MEMBERS", "SPECIFIC_MEMBERS"])
    .default("ALL_SOCIETY_MEMBERS"),
  invitedUsers: z.array(z.string()).optional(),
});

export type CreateMeetingData = z.infer<typeof createMeetingSchema>;

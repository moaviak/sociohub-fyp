import { z } from "zod";

export const AnnouncementSchema = z
  .object({
    title: z.string().min(1, { message: "Announcement title is required" }),
    content: z
      .string()
      .min(50, { message: "Content must be atleast 150 characters." }),
    publishNow: z.boolean().default(true),
    publishDateTime: z.date().optional(),
    audience: z.enum(["All", "Members"]),
    sendEmail: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (!data.publishNow) {
        return !!data.publishDateTime;
      }

      return true;
    },
    {
      path: ["publishDateTime"],
      message:
        "Please provide a publish date and time for scheduled announcement",
    }
  )
  .refine(
    (data) => {
      if (!data.publishNow && data.publishDateTime) {
        const now = new Date();

        return data.publishDateTime.getTime() > now.getTime();
      }

      return true;
    },
    {
      path: ["publishDateTime"],
      message: "Scheduled publish date and time cannot be in the past.",
    }
  );

export type AnnouncementData = z.infer<typeof AnnouncementSchema>;

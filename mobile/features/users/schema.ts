import { z } from "zod";

const phoneRegex = /^(?:\+92|0|92)?(3[0-9]{2})[0-9]{7}$/;
export const UserProfileSchema = z.object({
  firstName: z.string().min(1, { message: "First Name is required" }),
  lastName: z.string().min(1, { message: "Last Name is required" }),
  avatar: z.any().optional(),
  phone: z
    .string()
    .regex(phoneRegex, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(255, { message: "Bio must not exceed 255 characters." })
    .optional(),
});

export type UserProfileData = z.infer<typeof UserProfileSchema>;

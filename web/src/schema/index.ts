import { z } from "zod";

const phoneRegex = /^(?:\+92|0|92)?(3[0-9]{2})[0-9]{7}$/;
export const contactFormSchema = z
  .object({
    firstName: z.string().min(1, { message: "First Name is required" }),
    lastName: z.string().min(1, { message: "Last Name is required" }),
    email: z.string().email({ message: "Email is required" }),
    phone: z.string().regex(phoneRegex, "Invalid phone number"),
    subject: z.enum(["Society Registration", "General Inquiry"]),
    societyName: z.string().optional(),
    message: z.string().min(4, { message: "Minimum 4 characters required" }),
  })
  .superRefine((data, ctx) => {
    if (data.subject === "Society Registration" && !data.societyName) {
      ctx.addIssue({
        path: ["societyName"],
        message: "Society Name is required",
        code: "custom",
      });
    }
  });

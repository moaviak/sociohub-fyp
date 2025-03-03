import { z } from "zod";

import { DEGREES, SOCIETIES_ADVISORS } from "@/data";

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

export const signInSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, { message: "Email or username is required" }),
  password: z.string().min(8, { message: "Password is required" }),
  rememberMe: z.boolean().default(false),
});

export const studentSignUpSchema = z.object({
  firstName: z.string().min(1, { message: "First Name is required" }),
  lastName: z.string().min(1, { message: "Last Name is required" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Email is required" }),
  registrationNo: z.object({
    session: z.enum(["SP", "FA"], { required_error: "Session is required" }),
    year: z.string({ required_error: "Year is required" }),
    degree: z.enum(DEGREES.map((d) => d.value) as [string, ...string[]], {
      required_error: "Degree is required",
    }),
    rollNumber: z
      .number()
      .min(1)
      .max(999, { message: "Roll number must be between 1-999" }),
  }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export const advisorSignUpSchema = z.object({
  firstName: z.string().min(1, { message: "First Name is required" }),
  lastName: z.string().min(1, { message: "Last Name is required" }),
  displayName: z.string().min(1, { message: "Display Name is required" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" }),
  email: z.enum(
    SOCIETIES_ADVISORS.map((s) => s.email) as [string, ...string[]],
    {
      required_error: "Email is required",
    }
  ),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

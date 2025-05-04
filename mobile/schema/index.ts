import z from "zod";

import { DEGREES, SOCIETIES_ADVISORS } from "@/data";

export const signInSchema = z
  .object({
    userType: z.enum(["Advisor", "Student"]),
    email: z.string().email().optional().or(z.literal("")), // Allow email to be optional
    registrationNo: z
      .object({
        session: z.enum(["SP", "FA"]),
        year: z.string(),
        degree: z.enum(DEGREES.map((d) => d.value) as [string, ...string[]]),
        rollNumber: z
          .string()
          .regex(/^\d{3}$/, {
            message: "Roll number must be a three-digit string",
          })
          .optional(),
      })
      .optional() // Allow registrationNo to be optional
      .nullable(), // Allow null value
    password: z.string().min(8, { message: "Password is required" }),
  })
  .refine(
    (data) => {
      if (data.userType === "Advisor") {
        return !!data.email; // Email must be present for Advisor
      }
      return true;
    },
    { message: "Email is required for Advisors", path: ["email"] }
  )
  .refine(
    (data) => {
      if (data.userType === "Student") {
        return !!data.registrationNo && !!data.registrationNo.rollNumber; // Registration No must be present for Student
      }
      return true;
    },
    {
      message: "Registration No is required for Students",
      path: ["registrationNo"],
    }
  );

export type signInValues = z.infer<typeof signInSchema>;

export const studentSignUpSchema = z.object({
  firstName: z.string().min(1, { message: "First Name is required" }),
  lastName: z.string().min(1, { message: "Last Name is required" }),
  email: z.string().email({ message: "Email is required" }),
  registrationNo: z.object({
    session: z.enum(["SP", "FA"], { required_error: "Session is required" }),
    year: z.string({ required_error: "Year is required" }),
    degree: z.enum(DEGREES.map((d) => d.value) as [string, ...string[]], {
      required_error: "Degree is required",
    }),
    rollNumber: z.string().regex(/^\d{3}$/, {
      message: "Roll number must be a three-digit string",
    }),
  }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export type studentSignUpValues = z.infer<typeof studentSignUpSchema>;

export const advisorSignUpSchema = z.object({
  firstName: z.string().min(1, { message: "First Name is required" }),
  lastName: z.string().min(1, { message: "Last Name is required" }),
  displayName: z.string().min(1, { message: "Display Name is required" }),
  email: z.enum(
    SOCIETIES_ADVISORS.map((s) => s.email) as [string, ...string[]],
    {
      required_error: "Email is required",
    }
  ),
  phone: z
    .string()
    .regex(/^057\d{7}$/, { message: "Invalid phone number" })
    .optional(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

export type advisorSignUpValues = z.infer<typeof advisorSignUpSchema>;

export const societyFormSchema = z.object({
  name: z.string().min(1, { message: "Society name is required" }),
  description: z
    .string()
    .min(1, { message: "Statement of purpose is required" }),
  logo: z.any().optional(),
});

export type societyFormValues = z.infer<typeof societyFormSchema>;

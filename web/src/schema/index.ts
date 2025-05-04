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
    rememberMe: z.boolean().default(false),
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
  avatar: z.instanceof(File).optional(),
});

export const societyFormSchema = z.object({
  name: z.string().min(1, { message: "Society name is required" }),
  description: z
    .string()
    .min(1, { message: "Statement of purpose is required" }),
  logo: z.instanceof(File).optional(),
});

export type SocietyFormValues = z.infer<typeof societyFormSchema>;

export const SocietyRegistrationFormSchema = z.object({
  societyId: z.string(),
  whatsappNo: z.string(),
  semester: z.number(),
  interestedRole: z.string(),
  reason: z.string().min(10, {
    message: "The reason should be atleast 10 characters minimum.",
  }),
  expectations: z.string().min(10, {
    message: "The expectations should be atleast 10 characters minimum.",
  }),
  skills: z.string(),
  isAgree: z.boolean().default(false),
});
export type SocietyRegistrationFormValues = z.infer<
  typeof SocietyRegistrationFormSchema
>;

export const RolesFormSchema = z.object({
  name: z.string().min(3, {
    message: "The role name should be atleast 3 characters minimum",
  }),
  description: z.string().optional(),
  minSemester: z.preprocess((val) => {
    // For null, undefined, or NaN, return undefined
    if (
      val === null ||
      val === undefined ||
      (typeof val === "number" && isNaN(val))
    ) {
      return undefined;
    }
    // Convert string values to numbers if needed
    if (typeof val === "string") {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    // Return numbers as is
    return val;
  }, z.number().int().positive().optional()),
  privileges: z.array(z.string()).optional(),
  members: z.array(z.string()).optional(),
});

export type RolesFormValues = z.infer<typeof RolesFormSchema>;

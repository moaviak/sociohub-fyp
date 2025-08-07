import { z } from "zod";

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
  isAgree: z.boolean().default(false).optional(),
});
export type SocietyRegistrationFormValues = z.infer<
  typeof SocietyRegistrationFormSchema
>;

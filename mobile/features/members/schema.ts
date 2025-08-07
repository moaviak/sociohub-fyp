import { z } from "zod";

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

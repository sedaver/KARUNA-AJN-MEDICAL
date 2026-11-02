import { z } from "zod";
export const staffAccessSchema = z.object({
  trustId: z.uuid(), userId: z.uuid(), displayName: z.string().trim().min(1).max(120),
  role: z.enum(["trust_admin", "clinician", "camp_manager", "data_entry", "analyst"]),
  active: z.boolean(),
});
export const newPasswordSchema = z.object({
  password: z.string().min(12, "Use at least 12 characters.").max(128),
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, { message: "Passwords must match.", path: ["confirmPassword"] });

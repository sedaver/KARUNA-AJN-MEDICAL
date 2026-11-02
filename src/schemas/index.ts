import { z } from "zod";
const shortText = z.string().trim().min(1).max(200);
const optionalText = z.string().trim().max(2000).optional();
const id = z.uuid();
const date = z.iso.date();
export const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1, "Enter your password.").max(256),
});
export const patientSchema = z
  .object({
    fullName: shortText,
    dateOfBirth: date.optional(),
    estimatedAge: z.number().int().min(0).max(130).optional(),
    ageRecordedOn: date.optional(),
    mobile: z
      .string()
      .regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number.")
      .optional(),
    village: optionalText,
    district: optionalText,
  })
  .refine(
    (v) => !(v.dateOfBirth && v.estimatedAge !== undefined),
    "Use date of birth or estimated age, not both.",
  )
  .refine(
    (v) => (v.estimatedAge !== undefined) === (v.ageRecordedOn !== undefined),
    "Record the date for an estimated age.",
  );
export const campSchema = z.object({
  name: shortText,
  campDate: date,
  location: shortText,
  district: shortText,
  status: z.enum(["planned", "ongoing", "completed", "cancelled"]),
});
export const visitSchema = z.object({
  patientId: id,
  campId: id,
  visitedAt: z.iso.datetime({ offset: true }),
  screeningStatus: z.enum(["waiting", "in_progress", "completed"]),
  notes: optionalText,
});
export const referralSchema = z.object({
  visitId: id,
  reason: shortText,
  facility: shortText,
  referralDate: date,
  priority: z.enum(["routine", "urgent"]),
  status: z.enum([
    "pending",
    "contacted",
    "appointment_scheduled",
    "visited",
    "treatment_started",
    "treatment_completed",
    "unable_to_contact",
    "closed",
  ]),
});
export const followUpSchema = z
  .object({
    referralId: id,
    followUpDate: date,
    contactResult: shortText,
    nextFollowUpDate: date.optional(),
    notes: optionalText,
  })
  .refine(
    (v) => !v.nextFollowUpDate || v.nextFollowUpDate >= v.followUpDate,
    "Next follow-up cannot be before this follow-up.",
  );
export type LoginInput = z.infer<typeof loginSchema>;

import { z } from "zod";
const text = z.string().trim().min(1).max(200);
const optional = z.string().trim().max(500).transform((v) => v || null);
export const campInput = z.object({
  id: z.uuid().nullable(), expectedVersion: z.string().nullable(), name: text,
  campType: z.enum(["community", "school", "workplace", "other"]),
  campDate: z.iso.date(), location: text, district: text,
  status: z.enum(["planned", "ongoing", "completed", "cancelled"]), description: z.string().trim().max(2000),
});
export const patientInput = z.object({
  id: z.uuid().nullable(), expectedVersion: z.string().nullable(), fullName: text,
  dateOfBirth: z.union([z.literal(""), z.iso.date()]).transform((v) => v || null),
  estimatedAge: z.union([z.literal(""), z.coerce.number().int().min(0).max(130)]).transform((v) => v === "" ? null : v),
  ageRecordedOn: z.union([z.literal(""), z.iso.date()]).transform((v) => v || null),
  gender: z.enum(["", "female", "male", "other", "prefer_not_to_say"]).transform((v) => v || null),
  mobile: z.union([z.literal(""), z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/)]).transform((v) => v || null),
  village: optional, district: optional, address: optional, localBody: optional,
  duplicateAcknowledged: z.boolean(),
}).superRefine((v, ctx) => {
  const today = new Date().toISOString().slice(0, 10);
  if (v.dateOfBirth && v.estimatedAge !== null) ctx.addIssue({ code: "custom", message: "Use date of birth or estimated age, not both." });
  if ((v.estimatedAge !== null) !== !!v.ageRecordedOn) ctx.addIssue({ code: "custom", message: "Estimated age needs its recorded date." });
  if ((v.dateOfBirth && v.dateOfBirth > today) || (v.ageRecordedOn && v.ageRecordedOn > today)) ctx.addIssue({ code: "custom", message: "Birth and age-recording dates cannot be in the future." });
});
export const consentInput = z.object({
  patientId: z.uuid(), purpose: z.enum(["screening", "follow_up_contact", "media_publication"]),
  status: z.enum(["granted", "declined", "withdrawn"]), method: z.enum(["written", "verbal", "digital", "guardian"]),
  noticeVersion: text, guardianName: optional, guardianRelationship: optional,
}).refine((v) => v.method !== "guardian" || (!!v.guardianName && !!v.guardianRelationship), "Record the guardian's name and relationship.");
export const visitInput = z.object({
  patientId: z.uuid(), campId: z.uuid(), repeatAcknowledged: z.boolean(),
});
export type CampInput = z.infer<typeof campInput>;
export type PatientInput = z.infer<typeof patientInput>;
export type ConsentInput = z.infer<typeof consentInput>;

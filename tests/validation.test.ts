import test from "node:test";
import assert from "node:assert/strict";
import {
  patientSchema,
  followUpSchema,
  loginSchema,
  campSchema,
} from "../src/schemas/index.ts";
test("patient age retains its reference date and cannot conflict with birth date", () => {
  assert.equal(
    patientSchema.safeParse({ fullName: "Fictional Person", estimatedAge: 60 })
      .success,
    false,
  );
  assert.equal(
    patientSchema.safeParse({
      fullName: "Fictional Person",
      estimatedAge: 60,
      ageRecordedOn: "2026-10-01",
    }).success,
    true,
  );
  assert.equal(
    patientSchema.safeParse({
      fullName: "Fictional Person",
      dateOfBirth: "1966-01-01",
      estimatedAge: 60,
      ageRecordedOn: "2026-10-01",
    }).success,
    false,
  );
});
test("follow-up cannot be scheduled before the contact date", () => {
  assert.equal(
    followUpSchema.safeParse({
      referralId: "11111111-1111-4111-8111-111111111111",
      followUpDate: "2026-10-02",
      nextFollowUpDate: "2026-10-01",
      contactResult: "No answer",
    }).success,
    false,
  );
});
test("invalid dates, empty names and invalid login input are rejected", () => {
  assert.equal(
    campSchema.safeParse({
      name: " ",
      campDate: "2026-02-31",
      location: "Example",
      district: "Example",
      status: "planned",
    }).success,
    false,
  );
  assert.equal(
    loginSchema.safeParse({ email: "invalid", password: "" }).success,
    false,
  );
  assert.equal(patientSchema.safeParse({ fullName: " " }).success, false);
});

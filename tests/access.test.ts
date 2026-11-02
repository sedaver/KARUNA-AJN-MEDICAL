import test from "node:test";
import assert from "node:assert/strict";
import { staffAccessSchema, newPasswordSchema } from "../src/features/auth/access-schemas.ts";
test("staff input rejects super-admin escalation and string booleans", () => {
  const value = { trustId: "11111111-1111-4111-8111-111111111111", userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", displayName: "Example Staff", role: "analyst", active: true };
  assert.equal(staffAccessSchema.safeParse(value).success, true);
  assert.equal(staffAccessSchema.safeParse({ ...value, role: "super_admin" }).success, false);
  assert.equal(staffAccessSchema.safeParse({ ...value, active: "false" }).success, false);
  assert.equal(staffAccessSchema.safeParse({ ...value, trustId: "../other" }).success, false);
});
test("recovery rejects weak and mismatched passwords", () => {
  assert.equal(newPasswordSchema.safeParse({ password: "short", confirmPassword: "short" }).success, false);
  assert.equal(newPasswordSchema.safeParse({ password: "long example password", confirmPassword: "different" }).success, false);
  assert.equal(newPasswordSchema.safeParse({ password: "long example password", confirmPassword: "long example password" }).success, true);
});

import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
const names = ["LIVE_SUPABASE_URL", "LIVE_SUPABASE_KEY", "LIVE_ADMIN_TOKEN", "LIVE_STAFF_TOKEN", "LIVE_OTHER_TRUST_ID"];
if (names.some((name) => !process.env[name])) {
  console.error(`Live checks require: ${names.join(", ")}. No hosted checks ran.`);
  process.exit(1);
}
function client(token) {
  return createClient(process.env.LIVE_SUPABASE_URL, process.env.LIVE_SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
}
const admin = client(process.env.LIVE_ADMIN_TOKEN);
const staff = client(process.env.LIVE_STAFF_TOKEN);
const contexts = await admin.rpc("staff_contexts");
assert.equal(contexts.error, null, "Admin context query failed");
assert.ok(contexts.data?.length, "Admin has no active trust");
const crossTrust = await admin.rpc("list_trust_staff", { p_trust_id: process.env.LIVE_OTHER_TRUST_ID });
assert.equal(crossTrust.error?.code, "42501", "Cross-trust read must fail");
const denied = await staff.rpc("list_trust_staff", { p_trust_id: contexts.data[0].trust_id });
assert.equal(denied.error?.code, "42501", "Non-admin staff read must fail");
console.log("Live read-only access checks passed. Recovery, enrollment and mutation workflows still need live verification.");

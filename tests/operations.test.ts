import test from "node:test";
import assert from "node:assert/strict";
import { patientInput, consentInput, visitInput } from "../src/features/operations/schemas.ts";
const id = "11111111-1111-4111-8111-111111111111";
const patient = { id:null, expectedVersion:null, fullName:"Fictional Person", dateOfBirth:"", estimatedAge:"", ageRecordedOn:"", gender:"", mobile:"", village:"", district:"", address:"", localBody:"", duplicateAcknowledged:false };
test("patient age is recorded with provenance and cannot conflict with birth date", () => {
  assert.equal(patientInput.safeParse(patient).success,true);
  assert.equal(patientInput.safeParse({...patient,estimatedAge:"42"}).success,false);
  assert.equal(patientInput.safeParse({...patient,estimatedAge:"42",ageRecordedOn:"2026-01-01"}).success,true);
  assert.equal(patientInput.safeParse({...patient,dateOfBirth:"2000-01-01",estimatedAge:"42",ageRecordedOn:"2026-01-01"}).success,false);
  assert.equal(patientInput.safeParse({...patient,dateOfBirth:"2999-01-01"}).success,false);
});
test("guardian consent needs a name and relationship", () => {
  const value = { patientId:id,purpose:"screening",status:"granted",method:"guardian",noticeVersion:"v1",guardianName:"",guardianRelationship:"" };
  assert.equal(consentInput.safeParse(value).success,false);
  assert.equal(consentInput.safeParse({...value,guardianName:"Example Guardian",guardianRelationship:"Parent"}).success,true);
});
test("repeat-visit confirmation must be an explicit boolean", () => {
  assert.equal(visitInput.safeParse({ patientId:id,campId:id,repeatAcknowledged:false }).success,true);
  assert.equal(visitInput.safeParse({ patientId:id,campId:id,repeatAcknowledged:"false" }).success,false);
});

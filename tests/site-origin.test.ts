import test from "node:test";
import assert from "node:assert/strict";
import { siteOrigin } from "../src/lib/site-origin.ts";
test("recovery redirects use a configured HTTPS origin or local development host", () => {
  assert.equal(siteOrigin("https://example.org"), "https://example.org");
  assert.equal(siteOrigin("http://localhost:3000"), "http://localhost:3000");
  for (const unsafe of [undefined,"http://example.org","https://user:pass@example.org","https://example.org/path","https://example.org/?next=https://other.org","javascript:alert(1)"]) assert.equal(siteOrigin(unsafe), null);
});


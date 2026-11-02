// Run against the production server WITHOUT Supabase environment configuration.
import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const publicRoutes = ['/', '/about', '/camps', '/gallery', '/contact', '/login'];
const protectedRoutes = ['/dashboard', ...['camps', 'patients', 'referrals', 'follow-ups', 'reports', 'gallery', 'users', 'settings'].map(value => `/dashboard/${value}`)];
for (const path of publicRoutes) {
  const response = await fetch(new URL(path, base), { redirect: 'manual' });
  assert.equal(response.status, 200, path);
  if (path === '/login') assert.match(await response.text(), /Staff access is awaiting setup/);
  console.log(`PASS public page ${path}`);
}
for (const path of protectedRoutes) {
  const response = await fetch(new URL(path, base), { redirect: 'manual' });
  assert.equal(response.status, 307, path);
  assert.equal(new URL(response.headers.get('location'), base).pathname, '/login');
  assert.match(response.headers.get('cache-control'), /no-store/);
  console.log(`PASS protected route ${path}`);
}
for (const path of ['/unknown', '/services', '/impact', '/camps/unpublished']) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 404, path);
  console.log(`PASS unknown/unpublished page ${path}`);
}
console.log('19 route checks passed in unconfigured, unauthenticated mode.');

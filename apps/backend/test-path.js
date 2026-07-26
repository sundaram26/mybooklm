import { pathToRegexp } from 'path-to-regexp';

const tests = [
  "/api/auth(.*)",
  "/api/auth/:path(.*)",
  "/api/auth/:path*",
  "/api/auth/*path"
];

for (const path of tests) {
  try {
    const keys = [];
    const re = pathToRegexp(path, keys);
    console.log(`SUCCESS: ${path}`);
  } catch (e) {
    console.error(`FAIL: ${path} -> ${e.message}`);
  }
}

---
name: api-server routing conflict
description: The unused api-server scaffold claims /api in the proxy, silently breaking all Next.js /api/* routes unless the toml is patched.
---

This project's Next.js app owns all backend logic at /api/* routes (claim, leads, admin, etc.).
The monorepo also includes a default api-server scaffold (artifacts/api-server) that only has a /healthz route but claims paths=["/api"] in its artifact.toml.

The shared proxy routes most-specific-first: /api (api-server) beats / (Next.js), so every /api/* request hits the empty Express scaffold and returns Express 404 errors — even in production.

**Fix applied:** Changed api-server artifact.toml paths from ["/api"] to ["/api-server"] so the path is freed for Next.js. The api-server process keeps running but receives no product traffic.

**Why:** If this project ever adds a new Next.js /api route, the fix is already in place. Do NOT restore paths=["/api"] to the api-server.

**How to apply:** If the routing conflict ever reappears (e.g., after a merge), re-run verifyAndReplaceArtifactToml to patch artifacts/api-server/.replit-artifact/artifact.toml — change paths=["/api"] back to paths=["/api-server"].

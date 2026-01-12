# Security Baseline and Test Plan

This app includes basic hardening measures for production use, but full security validation still requires running the checks below in your environment.

## Baseline protections in the code
- Passwords are hashed with bcrypt and never stored in plain text.
- Session tokens are stored in HTTP-only cookies and scoped by `sameSite`.
- CORS is restricted to `APP_ORIGIN`.
- API responses are marked `Cache-Control: no-store` to reduce leakage risk.
- Rate limiting is enabled for the API and stricter on auth endpoints.
- Security headers are applied with `helmet`.
- Optional TOTP-based MFA is supported for password logins (OAuth uses provider security).
- User data access is scoped to authenticated user IDs in every route.
- Forum and log inputs are length-limited and sanitized to reduce abuse surface.

## Required production configuration
- Set strong `JWT_SECRET` and rotate regularly.
- Use HTTPS and set `NODE_ENV=production` to enforce secure cookies.
- Keep `MONGODB_URI` private and restricted to the API server.
- Enable MongoDB IP allowlisting and enforce least-privilege credentials.

## Security testing checklist (run manually)
1) Dependency and supply-chain checks
- `npm audit --audit-level=high`

2) Auth and session tests
- Verify login rate limits and lockout behavior.
- Validate session cookie flags (Secure, HttpOnly, SameSite).
- Attempt cross-user access to `/api/daily-logs` and `/api/user/settings`.

3) DAST / penetration testing
- Run OWASP ZAP baseline scan against the running API.
- Validate CORS behavior from non-allowed origins.

4) Data leakage checks
- Verify no sensitive values appear in server logs.
- Validate `Cache-Control: no-store` on API responses.

5) Memory leak checks
- Load test with `autocannon` (or equivalent) while monitoring `process.memoryUsage()`.
- Use `node --inspect` and heap snapshots under sustained load.

## Notes
These checks are not executed automatically in this repo. Run them in staging before production release.

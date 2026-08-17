# Revision Summary

## TypeScript conversion
- Server source moved to `server/src/**/*.ts`.
- React source converted to `.tsx` / `.ts`.
- Added strict TypeScript configuration for both applications.
- Added shared client API/domain types.

## Database/model fixes
- Replaced the incompatible legacy migration with a matching MySQL schema.
- Appointment status is now `ENUM('P','C','D','X')`.
- Phone numbers are strings, preserving leading zeroes.
- Added `BirthDate`.
- Corrected Role loading/associations.
- Added useful indexes and foreign keys.
- Standardized appointment persistence to UTC.

## API/security fixes
- Public registration always creates Patient role 2.
- Dentist creation is a protected dentist-only operation.
- Service and role mutations require Dentist role 1.
- Core Dentist/Patient roles cannot be renamed or deleted.
- Authenticated requests re-check that the user is active and still has a role.
- Appointment access is ownership/assignment checked on the server.
- Patients cannot confirm/complete appointments; they can cancel their own.
- Permanent appointment deletion is limited to the assigned dentist.
- Appointment users are validated against their actual roles.
- Appointment collision checks prevent overlapping bookings for either participant.
- Duplicate dentist emails/services/roles return controlled conflicts.
- Added login/register/API rate limiting, Helmet, request-size limits and production-safe errors.
- Added `/health` and graceful shutdown behavior.

## Client/runtime fixes
- Removed the old hard-coded AWS load-balancer URL.
- API base URL is now `VITE_API_URL`.
- Added access-token refresh flow.
- Fixed appointment service casing mismatch (`description`).
- Fixed invalid dentist `id` usage (`userId`).
- Fixed nullable dentist phone editing.
- Fixed appointment status actions sending unnecessary date/user values.
- Fixed local-date dashboard comparisons.
- Removed debug logging and stale production credentials/URLs from README files.

## Deployment files
- Added environment examples for server/client.
- Added production multi-stage Dockerfile for the API.
- Added `database/schema.sql`.
- Added the `bootstrap:dentist` command for the initial Dentist account.
- Added root deployment documentation and production smoke-test checklist.

# Dental Clinic — TypeScript Production Revision

This revision converts both applications to TypeScript and fixes the production issues found in the original project.

## Stack
- Client: React 19 + TypeScript + Vite
- Server: Node.js 22 + Express 5 + TypeScript
- Database: MySQL 8 + Sequelize
- Production target: RDS MySQL → containerized API → S3/CloudFront client

## Important fixes included
- Converted all client/server source files from JavaScript/JSX to TypeScript/TSX.
- Replaced the obsolete Sequelize migration with `server/database/schema.sql`, which matches the current models.
- Fixed appointment status to `P | C | D | X` instead of an integer.
- Stores phone numbers as strings and includes `BirthDate`.
- Fixed the missing Role model/associations.
- Removed the hard-coded AWS API endpoint; the client now uses `VITE_API_URL`.
- CORS origins are environment-driven.
- Added `/health` for production health checks.
- Public registration can create Patient accounts only.
- Dentist/service/role management is protected by dentist authorization.
- Appointment reads/updates are restricted to the authenticated patient or assigned dentist.
- Patients can cancel but cannot confirm/complete appointments.
- Added appointment conflict checks and service validation.
- Uses UTC for database appointment storage while the browser displays local time.
- Added access-token refresh handling in the client.
- Added a safe first-dentist bootstrap command.
- Corrected frontend/API shape mismatches from the original project.

## Start locally

### 1. Database
Run `server/database/schema.sql` on a fresh MySQL database.

### 2. Server
```bash
cd server
cp .env.example .env
# Edit .env
npm install
npm run typecheck
npm run build
npm start
```

The API should answer:
```text
GET http://localhost:8080/health
```

### 3. Create the first dentist
After the schema exists and the server dependencies have been installed:

```bash
cd server
npm run build
npm run bootstrap:dentist -- \
  --email=dentist@example.com \
  --password='ChangeMe123!' \
  --firstName=Main \
  --lastName=Dentist \
  --phone=09171234567
```

Change that password immediately after using it. Do not commit real credentials.

### 4. Client
```bash
cd client
cp .env.example .env
npm install
npm run typecheck
npm run build
npm run dev
```

For local use, `.env` should contain:
```env
VITE_API_URL=http://localhost:8080
```

## Security notes
- Never put database or JWT secrets in the client environment. Only `VITE_API_URL` belongs in the client.
- Keep RDS private and allow port 3306 only from the API service/security group.
- Use HTTPS in production.
- Store server secrets in your deployment platform's secret manager.
- Do not reintroduce `roleId` into public registration.

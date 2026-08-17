# Production Deployment Order

Deploy in this order: **Database → Server → Client**.

## 1. Database — MySQL / Amazon RDS

1. Create a MySQL 8 database named `dental_clinic`.
2. Keep it private for production. Port `3306` should be reachable only from the backend service/security group.
3. Run:

```text
server/database/schema.sql
```

4. Verify the tables exist:
   - `roles`
   - `users`
   - `user_roles`
   - `services`
   - `appointments`

The schema also seeds Dentist (`RoleId=1`), Patient (`RoleId=2`), and starter services.

## 2. Server — Node/Express API

Copy the example environment file and set production values:

```bash
cd server
cp .env.example .env
```

Typical production values:

```env
NODE_ENV=production
PORT=8080
TRUST_PROXY=1
CLIENT_URL=https://YOUR-CLOUDFRONT-OR-CUSTOM-DOMAIN
CORS_ORIGINS=https://YOUR-CLOUDFRONT-OR-CUSTOM-DOMAIN

DB_HOST=YOUR-RDS-ENDPOINT
DB_PORT=3306
DB_USER=YOUR_DB_USER
DB_PASS=YOUR_DB_PASSWORD
DB_NAME=dental_clinic
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false

JWT_SECRET_KEY=GENERATE_A_LONG_RANDOM_SECRET
JWT_REFRESH_SECRET_KEY=GENERATE_ANOTHER_LONG_RANDOM_SECRET
JWT_TOKEN_EXPIRATION=1h
```

Generate JWT secrets with:

```bash
openssl rand -hex 64
```

Install and verify:

```bash
npm install
npm run typecheck
npm run build
npm start
```

Check:

```text
GET https://YOUR-API-DOMAIN/health
```

Expected response:

```json
{"status":"ok"}
```

### Docker

```bash
docker build -t dental-clinic-server .
docker run --env-file .env -p 8080:8080 dental-clinic-server
```

Push that image to your container registry and deploy it to the backend service. The container listens on port `8080` and exposes `/health`.

### First dentist

After the database schema is ready:

```bash
npm run build
npm run bootstrap:dentist -- \
  --email=YOUR_DENTIST_EMAIL \
  --password='YOUR_STRONG_TEMP_PASSWORD' \
  --firstName=YOUR_FIRST_NAME \
  --lastName=YOUR_LAST_NAME
```

Public `/api/users/register` intentionally cannot create dentist accounts.

## 3. Client — React/Vite

Create the production environment file:

```bash
cd client
cp .env.production.example .env.production
```

Set:

```env
VITE_API_URL=https://YOUR-PRODUCTION-API-URL
```

Then:

```bash
npm install
npm run typecheck
npm run build
```

Deploy the contents of `client/dist/` to the static host. For S3 + CloudFront:

1. Upload `dist/` contents to the S3 origin bucket.
2. Put CloudFront in front of S3 for HTTPS.
3. Use `index.html` as the default root object.
4. Configure SPA fallback so 403/404 requests are served `/index.html` with HTTP 200.
5. Put the final CloudFront/custom-domain URL in the server's `CLIENT_URL` / `CORS_ORIGINS`.
6. Redeploy/restart the API after changing CORS.

## Final production smoke test

1. `GET /health` returns 200.
2. Open the frontend over HTTPS.
3. Register a patient; verify `RoleId=2` in `user_roles`.
4. Log in as the bootstrap dentist.
5. Create/edit a dental service.
6. Patient logs in and creates an appointment.
7. Patient cannot create/manage a dentist or service.
8. Dentist sees only appointments assigned to that dentist.
9. Patient sees only that patient's appointments.
10. Dentist confirms an appointment; status becomes `C`.
11. Patient can cancel an appointment; status becomes `X`.
12. Directly opening a React route such as `/appointments` still loads through CloudFront SPA fallback.

## Before real patient data

This project is deployment-ready from an application/code perspective, but a real clinic should additionally establish backups, monitoring, audit/retention policy, privacy controls, incident response, and any legal/compliance requirements that apply to patient information in its jurisdiction.

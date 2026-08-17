# Dental Clinic API

TypeScript Express/Sequelize API for the Dental Clinic application.

## Commands
```bash
npm install
npm run dev
npm run typecheck
npm run build
npm start
```

## Setup
1. Copy `.env.example` to `.env`.
2. Run `database/schema.sql` against MySQL.
3. Run `npm install` and `npm run typecheck`.
4. Run `npm run build && npm start`.
5. Check `GET /health`.

## Bootstrap the first dentist
```bash
npm run build
npm run bootstrap:dentist -- \
  --email=dentist@example.com \
  --password='ChangeMe123!' \
  --firstName=Main \
  --lastName=Dentist
```

Public registration creates Patient (`RoleId=2`) accounts only. Dentist/service/role management requires Dentist (`RoleId=1`) authentication.

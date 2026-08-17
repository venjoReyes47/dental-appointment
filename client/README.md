# Dental Clinic Client

React + TypeScript + Vite frontend.

## Local setup
```bash
cp .env.example .env
npm install
npm run typecheck
npm run dev
```

`.env`:
```env
VITE_API_URL=http://localhost:8080
```

## Production build
```bash
cp .env.production.example .env.production
# Set VITE_API_URL to the production HTTPS API URL
npm install
npm run typecheck
npm run build
```

Deploy the contents of `dist/` to the static host. When using S3/CloudFront, configure SPA route fallback to `/index.html`.

Do not put database credentials, JWT secrets, or SMTP passwords in any `VITE_*` variable because Vite client environment variables are public in the browser bundle.

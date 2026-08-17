import 'dotenv/config';

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const optional = (name: string, fallback = ''): string => process.env[name] ?? fallback;
const toBool = (value: string, fallback = false): boolean => {
  if (!value) return fallback;
  return value.toLowerCase() === 'true';
};

const nodeEnv = optional('NODE_ENV', 'development');

export const env = {
  NODE_ENV: nodeEnv,
  PORT: Number(optional('PORT', '8080')),
  TRUST_PROXY: Number(optional('TRUST_PROXY', '0')),
  CLIENT_URL: optional('CLIENT_URL', 'http://localhost:5173'),
  CORS_ORIGINS: optional('CORS_ORIGINS', optional('CLIENT_URL', 'http://localhost:5173'))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  DB_HOST: required('DB_HOST'),
  DB_PORT: Number(optional('DB_PORT', '3306')),
  DB_USER: required('DB_USER'),
  DB_PASS: required('DB_PASS'),
  DB_NAME: required('DB_NAME'),
  DB_SSL: toBool(optional('DB_SSL'), nodeEnv === 'production'),
  DB_SSL_REJECT_UNAUTHORIZED: toBool(optional('DB_SSL_REJECT_UNAUTHORIZED'), false),
  JWT_SECRET_KEY: required('JWT_SECRET_KEY'),
  JWT_REFRESH_SECRET_KEY: required('JWT_REFRESH_SECRET_KEY'),
  JWT_TOKEN_EXPIRATION: optional('JWT_TOKEN_EXPIRATION', '1h'),
  SMTP_HOST: optional('SMTP_HOST'),
  SMTP_PORT: Number(optional('SMTP_PORT', '587')),
  SMTP_SECURE: toBool(optional('SMTP_SECURE')),
  SMTP_USER: optional('SMTP_USER'),
  SMTP_PASS: optional('SMTP_PASS'),
  SMTP_FROM: optional('SMTP_FROM')
};

if (env.JWT_SECRET_KEY.length < 32 || env.JWT_REFRESH_SECRET_KEY.length < 32) {
  throw new Error('JWT secrets must be at least 32 characters long.');
}

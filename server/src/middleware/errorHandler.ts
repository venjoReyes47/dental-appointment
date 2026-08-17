import type { ErrorRequestHandler, RequestHandler } from 'express';
import { env } from '../config/env';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found.' });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: 'Internal server error.',
    ...(env.NODE_ENV === 'development' ? { error: error instanceof Error ? error.message : String(error) } : {})
  });
};

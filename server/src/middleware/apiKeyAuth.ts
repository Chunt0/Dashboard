import { RequestHandler } from 'express';

const OPEN_PATHS = new Set(['/health']);

export const apiKeyAuth: RequestHandler = (req, res, next) => {
  if (OPEN_PATHS.has(req.path) && req.method === 'GET') {
    return next();
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('API_KEY is not set. Allowing request in non-production mode.');
      return next();
    }
		res.status(500).json({ error: 'Server authentication is not configured.' });
		return;
	}

	const authHeader = req.header('authorization') || '';
	const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
	const queryToken = typeof req.query.apiKey === 'string' ? req.query.apiKey : '';

	if ((!token || token !== apiKey) && (!queryToken || queryToken !== apiKey)) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}

	next();
};

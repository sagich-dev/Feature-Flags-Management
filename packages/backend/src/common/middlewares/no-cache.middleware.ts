import type { NextFunction, Request, Response } from "express";

/**
 * Middleware that sets no-cache headers for health check responses.
 */
export const noCacheMiddleware = (_req: Request, res: Response, next: NextFunction): void => {
	res.set("Cache-Control", "no-cache, no-store, must-revalidate");
	res.set("Pragma", "no-cache");
	res.set("Expires", "0");
	next();
};

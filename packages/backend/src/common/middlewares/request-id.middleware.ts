import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

/**
 * Middleware to add request ID to request headers and response.
 * Generates a UUID if no x-request-id header is present.
 * Sets req.id for pino-http logging integration.
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
	const existingId = req.get("x-request-id");
	const requestId = existingId || randomUUID();

	// Express normalizes request headers to lowercase
	req.headers["x-request-id"] = requestId;
	// Response headers use standard casing
	res.set("X-Request-Id", requestId);

	// Set req.id for pino-http logger
	req.id = requestId;

	next();
};

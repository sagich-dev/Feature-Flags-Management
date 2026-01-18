import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ValidationError } from "@/common/errors/validation.error";

/**
 * Validation schemas for request validation.
 */
export interface ValidationSchemas {
	body?: ZodSchema;
	query?: ZodSchema;
	params?: ZodSchema;
}

/**
 * Request validation middleware factory.
 * Validates request body, query, and params using Zod schemas.
 */
export const validateRequest = (schemas: ValidationSchemas) => {
	return (req: Request, _res: Response, next: NextFunction): void => {
		try {
			if (schemas.body) {
				req.body = schemas.body.parse(req.body);
			}
			if (schemas.query) {
				req.query = schemas.query.parse(req.query);
			}
			if (schemas.params) {
				req.params = schemas.params.parse(req.params);
			}
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				next(new ValidationError("Validation failed", error));
			} else {
				next(error);
			}
		}
	};
};

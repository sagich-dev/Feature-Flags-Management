import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { AppError } from "@/common/errors/app.error";
import { HttpError } from "@/common/errors/http.error";
import { ValidationError } from "@/common/errors/validation.error";
import { config } from "@/common/utils/config";
import { logger } from "@/common/utils/logger";

interface ErrorResponse {
	statusCode: number;
	message: string;
	errors?: Array<{ path: string; message: string }>;
	logLevel: "warn" | "error";
	logData: Record<string, unknown>;
}

const createErrorResponse = (err: unknown, isDevelopment: boolean): ErrorResponse => {
	if (err instanceof ValidationError) {
		return {
			statusCode: err.statusCode,
			message: err.message,
			errors: err.errors,
			logLevel: "warn",
			logData: err.toJSON() as unknown as Record<string, unknown>,
		};
	}

	if (err instanceof HttpError) {
		return {
			statusCode: err.statusCode,
			message: err.message,
			logLevel: err.statusCode >= StatusCodes.INTERNAL_SERVER_ERROR ? "error" : "warn",
			logData: err.toJSON() as unknown as Record<string, unknown>,
		};
	}

	if (err instanceof AppError) {
		return {
			statusCode: err.statusCode,
			message: err.isOperational || !isDevelopment ? err.message : "Internal server error",
			logLevel: "error",
			logData: err.toJSON() as unknown as Record<string, unknown>,
		};
	}

	if (err instanceof ZodError) {
		const validationError = new ValidationError("Validation failed", err);
		return {
			statusCode: validationError.statusCode,
			message: validationError.message,
			errors: validationError.errors,
			logLevel: "warn",
			logData: validationError.toJSON() as unknown as Record<string, unknown>,
		};
	}

	if (err instanceof Error) {
		return {
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			message: isDevelopment ? err.message : "Internal server error",
			logLevel: "error",
			logData: {
				name: err.name,
				message: err.message,
				stack: isDevelopment ? err.stack : undefined,
			},
		};
	}

	return {
		statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Internal server error",
		logLevel: "error",
		logData: { message: String(err) },
	};
};

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
	if (res.headersSent) {
		next(err);
		return;
	}

	const errorId = randomUUID();
	const isDevelopment = config.NODE_ENV === "development";

	if (err && typeof err === "object" && "type" in err && err.type === "entity.too.large") {
		res.status(413).json({ success: false, message: "Request entity too large", statusCode: 413, errorId });
		return;
	}

	const errorResponse = createErrorResponse(err, isDevelopment);
	const requestId = (req.headers["x-request-id"] as string) || "unknown";

	logger[errorResponse.logLevel](
		{
			requestId,
			errorId,
			url: req.url,
			method: req.method,
			err: errorResponse.logData,
		},
		errorResponse.logLevel === "warn" ? "Validation error" : "Application error"
	);

	res.status(errorResponse.statusCode).json({
		success: false,
		message: errorResponse.message,
		statusCode: errorResponse.statusCode,
		errorId,
		...(errorResponse.errors && { errors: errorResponse.errors }),
		...(isDevelopment && err instanceof Error && { stack: err.stack }),
	});
};

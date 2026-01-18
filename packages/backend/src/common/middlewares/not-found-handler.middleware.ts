import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { config } from "@/common/utils/config";

/**
 * 404 Not Found handler middleware.
 * Returns a consistent error response for unmatched routes.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
	res.status(StatusCodes.NOT_FOUND).json({
		success: false,
		message: config.NODE_ENV === "production" ? "Not found" : `Route ${req.method} ${req.path} not found`,
		statusCode: StatusCodes.NOT_FOUND,
	});
};

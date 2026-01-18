import { StatusCodes } from "http-status-codes";
import type { ZodError } from "zod";
import { AppError, type AppErrorJSON } from "./app.error";

export interface ValidationErrorJSON extends AppErrorJSON {
	readonly errors: Array<{ path: string; message: string }>;
}

export class ValidationError extends AppError {
	readonly statusCode = StatusCodes.BAD_REQUEST;
	readonly errors: Array<{ path: string; message: string }>;

	constructor(message: string, zodError?: ZodError) {
		super(message, true);

		if (zodError) {
			this.errors = zodError.issues.map((err) => ({
				path: err.path.length > 0 ? err.path.join(".") : "root",
				message: err.message,
			}));
		} else {
			this.errors = [{ path: "root", message }];
		}
	}

	override toJSON(): ValidationErrorJSON {
		return {
			...super.toJSON(),
			errors: this.errors,
		};
	}
}

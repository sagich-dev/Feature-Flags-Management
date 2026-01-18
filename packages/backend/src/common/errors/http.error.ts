import { AppError } from "./app.error";

export class HttpError extends AppError {
	readonly statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message, true);
		this.statusCode = statusCode;
	}
}

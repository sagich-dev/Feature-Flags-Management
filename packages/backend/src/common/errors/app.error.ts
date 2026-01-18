export interface AppErrorJSON {
	readonly name: string;
	readonly message: string;
	readonly statusCode: number;
	readonly isOperational: boolean;
}

export abstract class AppError extends Error {
	abstract readonly statusCode: number;
	readonly isOperational: boolean;

	constructor(message: string, isOperational = true) {
		super(message);
		this.name = this.constructor.name;
		this.isOperational = isOperational;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}

	toJSON(): AppErrorJSON {
		return {
			name: this.name,
			message: this.message,
			statusCode: this.statusCode,
			isOperational: this.isOperational,
		};
	}
}

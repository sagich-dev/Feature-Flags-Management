import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { config } from "@/shared/config";

export interface ApiErrorDetails {
	status?: number | undefined;
	code?: string | undefined;
	message: string;
	cause?: unknown;
}

export class ApiError extends Error {
	public readonly status?: number | undefined;
	public readonly code?: string | undefined;
	public readonly cause?: unknown;

	constructor(message: string, opts?: ApiErrorDetails) {
		super(message);
		this.name = "ApiError";
		this.status = opts?.status;
		this.code = opts?.code;
		this.cause = opts?.cause;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ApiError);
		}
	}
}

export function isApiError(value: unknown): value is ApiError {
	return value instanceof ApiError;
}

export function createApiClient(): AxiosInstance {
	const client = axios.create({
		baseURL: config.apiUrl,
		timeout: 10_000,
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
	});

	// Simple error handling
	client.interceptors.response.use(
		(response: AxiosResponse) => response,
		(error: AxiosError) => {
			const message = error.message || "Request failed";
			const apiError = new ApiError(message, {
				message,
				status: error.response?.status,
				code: error.code,
				cause: error,
			});
			return Promise.reject(apiError);
		}
	);

	return client;
}

export const http = createApiClient();

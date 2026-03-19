import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { config } from "@/shared/config";

export interface ApiErrorDetails {
	status?: number | undefined;
	code?: string | undefined;
	message: string;
	cause?: unknown;
}

export class ApiError extends Error {
	public readonly status: number | undefined;
	public readonly code: string | undefined;
	public readonly cause: unknown;

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

/**
 * Request interceptor configuration
 */
export type RequestInterceptor = (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;

let requestInterceptors: RequestInterceptor[] = [];

/**
 * Register a request interceptor
 */
export function addRequestInterceptor(interceptor: RequestInterceptor): void {
	requestInterceptors.push(interceptor);
}

function createApiClient() {
	const client = axios.create({
		baseURL: config.apiUrl,
		timeout: config.api.timeout,
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
	});

	// Apply request interceptors
	client.interceptors.request.use(async (requestConfig) => {
		let finalConfig = requestConfig;
		for (const interceptor of requestInterceptors) {
			finalConfig = await interceptor(finalConfig);
		}
		return finalConfig;
	});

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

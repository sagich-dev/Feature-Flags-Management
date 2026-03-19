import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
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

		// Maintain proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ApiError);
		}
	}
}

export function isApiError(value: unknown): value is ApiError {
	return value instanceof ApiError;
}

export interface ApiClientOptions {
	baseURL?: string;
	timeout?: number;
	defaultHeaders?: Record<string, string>;
}

// Extend AxiosRequestConfig to include metadata
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
	metadata?: {
		startTime: number;
	};
}

export function createApiClient(options: ApiClientOptions = {}): AxiosInstance {
	const {
		baseURL = config.apiUrl,
		timeout = 10_000,
		defaultHeaders = {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
	} = options;

	const client = axios.create({
		baseURL,
		timeout,
		headers: defaultHeaders,
	});

	// Request interceptor for logging and additional processing
	client.interceptors.request.use(
		(config) => {
			// Add request timestamp for debugging and performance monitoring
			(config as ExtendedAxiosRequestConfig).metadata = { startTime: Date.now() };
			
			// Add performance monitoring in development
			if (config.metadata) {
				performance.mark(`api-request-start-${config.url}`);
			}
			
			return config;
		},
		(error) => {
			return Promise.reject(error);
		}
	);

	// Response interceptor for error handling and performance monitoring
	client.interceptors.response.use(
		(response: AxiosResponse) => {
			const duration = Date.now() - ((response.config as ExtendedAxiosRequestConfig).metadata?.startTime || Date.now());
			
			// Log successful responses in development
			if (config.debug) {
				console.debug(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
			}
			
			// Performance monitoring
			if (config.debug && duration > 1000) {
				console.warn(`⚠️ Slow API request: ${response.config.method?.toUpperCase()} ${response.config.url} took ${duration}ms`);
			}
			
			// Add performance metrics
			if ((response.config as ExtendedAxiosRequestConfig).metadata) {
				performance.mark(`api-request-end-${response.config.url}`);
				performance.measure(
					`api-request-${response.config.method?.toUpperCase()}-${response.config.url}`,
					`api-request-start-${response.config.url}`,
					`api-request-end-${response.config.url}`
				);
			}
			
			return response;
		},
		(error: AxiosError) => {
			const status = error.response?.status;
			const statusText = error.response?.statusText;
			const responseData = error.response?.data;

			// Extract error message
			let message: string;
			if (typeof responseData === "object" && responseData && "message" in responseData) {
				message = String((responseData as { message?: unknown }).message || error.message || "Request failed");
			} else if (statusText) {
				message = `${status} ${statusText}`;
			} else {
				message = error.message || "Request failed";
			}

			// Log error in development
			if (config.debug) {
				const duration = Date.now() - ((error.config as ExtendedAxiosRequestConfig)?.metadata?.startTime || Date.now());
				console.error(
					`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${status} (${duration}ms): ${message}`
				);
			}

			// Create and throw ApiError
			const apiError = new ApiError(message, {
				message,
				status,
				code: error.code,
				cause: error,
			});

			return Promise.reject(apiError);
		}
	);

	return client;
}

// Create default API client instance
export const http = createApiClient();

// Export utility functions
export const apiClient = {
	create: createApiClient,
	isApiError,
};

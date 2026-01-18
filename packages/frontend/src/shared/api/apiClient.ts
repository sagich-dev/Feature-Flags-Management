import axios, { type AxiosError, type AxiosInstance, type AxiosResponse } from "axios";
import { z } from "zod";
import { ERROR_MESSAGES, STORAGE_KEYS } from "@/shared/constants/index";
import { formatErrorMessage } from "@/shared/lib/formatError";

export const API_CONFIG = {
	BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
	TIMEOUT: 10000,
	RETRY_ATTEMPTS: 3,
	RETRY_DELAY: 1000,
} as const;

export class ApiError extends Error {
	constructor(
		message: string,
		public status?: number,
		public code?: string,
		public originalError?: AxiosError | Error
	) {
		super(message);
		this.name = "ApiError";
	}
}

const pendingRequests = new Map<string, AbortController>();

const api: AxiosInstance = axios.create({
	baseURL: API_CONFIG.BASE_URL,
	timeout: API_CONFIG.TIMEOUT,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		// Deduplicate GET requests to prevent duplicate fetches
		// POST/PUT/PATCH/DELETE are not deduplicated to allow parallel requests
		if (config.method?.toUpperCase() === "GET") {
			const requestKey = `${config.method}:${config.url}`;
			const existingController = pendingRequests.get(requestKey);

			if (existingController) {
				// Reuse existing request instead of aborting it
				config.signal = existingController.signal;
				if (import.meta.env.DEV) {
					console.warn(`[API] Duplicate GET request detected, reusing existing: ${config.url}`);
				}
			} else {
				const newController = new AbortController();
				pendingRequests.set(requestKey, newController);
				config.signal = newController.signal;
			}
		} else {
			const newController = new AbortController();
			config.signal = newController.signal;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

api.interceptors.response.use(
	(response) => {
		const method = response.config.method?.toUpperCase();
		if (method === "GET") {
			const requestKey = `${method}:${response.config.url}`;
			pendingRequests.delete(requestKey);
		}
		return response;
	},
	(error: AxiosError) => {
		if (error.config) {
			const method = error.config.method?.toUpperCase();
			if (method === "GET") {
				const requestKey = `${method}:${error.config.url}`;
				pendingRequests.delete(requestKey);
			}
		}

		if (error.response?.status === 401) {
			localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
			window.location.href = "/login";
		}

		let errorMessage: string = ERROR_MESSAGES.GENERIC_ERROR;
		const status = error.response?.status;
		const errorCode = error.code;

		if (!error.response) {
			errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
		} else if (status === 401) {
			errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
		} else if (status === 404) {
			errorMessage = ERROR_MESSAGES.NOT_FOUND;
		} else if (status && status >= 500) {
			errorMessage = ERROR_MESSAGES.SERVER_ERROR;
		} else if (status && status >= 400) {
			const responseData = error.response?.data as unknown;
			if (responseData) {
				if (typeof responseData === "string") {
					errorMessage = responseData;
				} else if (typeof responseData === "object" && responseData !== null) {
					const data = responseData as Record<string, unknown>;
					// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
					if (typeof data["error"] === "string") {
						// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
						errorMessage = data["error"];
						// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
					} else if (data["errors"]) {
						// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
						if (typeof data["errors"] === "object" && data["errors"] !== null) {
							// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
							const errorMessages = Object.entries(data["errors"] as Record<string, unknown>)
								.map(([key, value]) => {
									if (Array.isArray(value)) {
										return `${key}: ${value.join(", ")}`;
									}
									return `${key}: ${String(value)}`;
								})
								.join("; ");
							errorMessage = errorMessages || ERROR_MESSAGES.VALIDATION_ERROR;
						} else {
							errorMessage = ERROR_MESSAGES.VALIDATION_ERROR;
						}
						// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
					} else if (typeof data["message"] === "string") {
						// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
						errorMessage = data["message"];
					} else {
						errorMessage = ERROR_MESSAGES.VALIDATION_ERROR;
					}
				} else {
					errorMessage = ERROR_MESSAGES.VALIDATION_ERROR;
				}
			} else {
				errorMessage = ERROR_MESSAGES.VALIDATION_ERROR;
			}
		} else if (
			errorCode === "ECONNREFUSED" ||
			errorCode === "ETIMEDOUT" ||
			errorCode === "ERR_NETWORK" ||
			errorCode === "ERR_CANCELED" ||
			errorCode === "NETWORK_ERROR" ||
			errorCode?.includes("TIMEOUT") ||
			errorCode?.includes("ECONN")
		) {
			errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
		} else {
			errorMessage = formatErrorMessage(error);
		}

		const apiError = new ApiError(errorMessage, status, errorCode, error);

		return Promise.reject(apiError);
	}
);

/**
 * Type-safe API request function with validation
 */
export async function apiRequest<T extends z.ZodType>(
	schema: T,
	config: Parameters<typeof api.request>[0]
): Promise<z.infer<T>> {
	try {
		const response: AxiosResponse = await api.request(config);

		// Handle 204 No Content - construct proper response structure for validation
		let data = response.data;
		if (response.status === 204) {
			// For 204 responses, construct the expected API response structure
			// The schema expects { success: true, data: undefined } for void responses
			data = { success: true, data: undefined };
		} else if (data === "" || data === null || data === undefined) {
			data = undefined;
		}

		const validatedData = schema.parse(data);
		return validatedData;
	} catch (error) {
		if (error instanceof z.ZodError) {
			const validationMessages = error.issues.map((e: z.ZodIssue) => {
				const path = e.path.length > 0 ? `${e.path.join(".")}: ` : "";
				return `${path}${e.message}`;
			});
			const errorMessage = `Validation failed: ${validationMessages.join("; ")}`;
			const validationError = new ApiError(errorMessage, undefined, "VALIDATION_ERROR", error);
			throw validationError;
		}
		throw error;
	}
}

/**
 * Convenience methods for common HTTP methods with validation
 * Note: For POST/PUT requests, validate input data separately before calling these methods,
 * as these methods only validate the response schema.
 */
export const apiClient = {
	get: <T extends z.ZodType>(schema: T, url: string, config?: Parameters<typeof api.get>[1]) =>
		apiRequest(schema, { method: "GET", url, ...config }),

	post: <T extends z.ZodType>(schema: T, url: string, data?: unknown, config?: Parameters<typeof api.post>[2]) => {
		// Note: Input validation should be done before calling this method
		// This method only validates the response schema
		return apiRequest(schema, { method: "POST", url, data, ...config });
	},

	put: <T extends z.ZodType>(schema: T, url: string, data?: unknown, config?: Parameters<typeof api.put>[2]) => {
		// Note: Input validation should be done before calling this method
		// This method only validates the response schema
		return apiRequest(schema, { method: "PUT", url, data, ...config });
	},

	patch: <T extends z.ZodType>(schema: T, url: string, data?: unknown, config?: Parameters<typeof api.patch>[2]) =>
		apiRequest(schema, { method: "PATCH", url, data, ...config }),

	delete: <T extends z.ZodType>(schema: T, url: string, config?: Parameters<typeof api.delete>[1]) =>
		apiRequest(schema, { method: "DELETE", url, ...config }),
};

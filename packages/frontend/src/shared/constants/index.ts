import type { Environment } from "@/features/flags/types";

export const ERROR_MESSAGES = {
	GENERIC_ERROR: "An unexpected error occurred",
	NETWORK_ERROR: "Network error - please check your connection",
	VALIDATION_ERROR: "Validation failed",
	UNAUTHORIZED: "Unauthorized - please login",
	NOT_FOUND: "Resource not found",
	SERVER_ERROR: "Server error - please try again later",
} as const;

export const STORAGE_KEYS = {
	AUTH_TOKEN: "auth_token",
} as const;

const VALID_ENVIRONMENTS = ["dev", "qa", "staging", "prod"] as const;

export const CURRENT_ENVIRONMENT: Environment = (() => {
	const env = import.meta.env.VITE_ENVIRONMENT as string | undefined;
	if (env && VALID_ENVIRONMENTS.includes(env as Environment)) {
		return env as Environment;
	}
	return "dev";
})();

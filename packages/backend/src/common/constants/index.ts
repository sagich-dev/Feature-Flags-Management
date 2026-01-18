export const RATE_LIMIT = {
	WINDOW_MS: 15 * 60 * 1000,
	MAX_GLOBAL: 1000,
} as const;

export const CACHE = {
	MAX_AGE_SECONDS: 86400,
} as const;

export const COMPRESSION = {
	LEVEL: 6,
	THRESHOLD: 1024,
} as const;

export const REQUEST = {
	TIMEOUT_MS: 30_000,
} as const;

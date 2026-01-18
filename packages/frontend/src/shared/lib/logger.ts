/**
 * Centralized logging utility
 * Provides environment-aware logging that removes console statements in production
 */

export const logger = {
	/**
	 * Log informational messages
	 */
	log: (...args: unknown[]): void => {
		if (import.meta.env.DEV) {
			console.log(...args);
		}
	},

	/**
	 * Log error messages (always logged, even in production)
	 */
	error: (...args: unknown[]): void => {
		if (import.meta.env.DEV) {
			console.error(...args);
		}
	},

	/**
	 * Log warning messages
	 */
	warn: (...args: unknown[]): void => {
		if (import.meta.env.DEV) {
			console.warn(...args);
		}
	},

	/**
	 * Log debug messages (only in development)
	 */
	debug: (...args: unknown[]): void => {
		if (import.meta.env.DEV) {
			console.debug(...args);
		}
	},

	/**
	 * Log info messages
	 */
	info: (...args: unknown[]): void => {
		if (import.meta.env.DEV) {
			console.info(...args);
		}
	},

	/**
	 * Group related logs
	 */
	group: (label: string): void => {
		if (import.meta.env.DEV) {
			console.group(label);
		}
	},

	/**
	 * End log group
	 */
	groupEnd: (): void => {
		if (import.meta.env.DEV) {
			console.groupEnd();
		}
	},

	/**
	 * Group collapsed logs
	 */
	groupCollapsed: (label: string): void => {
		if (import.meta.env.DEV) {
			console.groupCollapsed(label);
		}
	},
} as const;

/**
 * Creates a logger with a specific context/prefix
 */
export function createLogger(context: string) {
	return {
		log: (...args: unknown[]) => logger.log(`[${context}]`, ...args),
		error: (...args: unknown[]) => logger.error(`[${context}]`, ...args),
		warn: (...args: unknown[]) => logger.warn(`[${context}]`, ...args),
		debug: (...args: unknown[]) => logger.debug(`[${context}]`, ...args),
		info: (...args: unknown[]) => logger.info(`[${context}]`, ...args),
		group: (label: string) => logger.group(`[${context}] ${label}`),
		groupEnd: logger.groupEnd,
		groupCollapsed: (label: string) => logger.groupCollapsed(`[${context}] ${label}`),
	};
}

import type { Server } from "node:http";
import { config } from "@/common/utils/config";
import { logger } from "@/common/utils/logger";

const createShutdownState = () => {
	let isShuttingDown = false;
	return {
		get: () => isShuttingDown,
		set: () => {
			isShuttingDown = true;
		},
	};
};

const shutdownState = createShutdownState();

// Track active requests for graceful shutdown
let activeRequests = 0;

export const getIsShuttingDown = (): boolean => shutdownState.get();

export const incrementActiveRequests = (): void => {
	activeRequests++;
};

export const decrementActiveRequests = (): void => {
	activeRequests--;
	if (activeRequests < 0) {
		activeRequests = 0;
		logger.warn({}, "Active requests counter went negative, resetting to 0");
	}
};

const waitForActiveRequests = async (timeoutMs: number): Promise<void> => {
	const startTime = Date.now();
	const checkInterval = 100; // Check every 100ms

	return new Promise((resolve) => {
		const check = () => {
			if (activeRequests === 0) {
				logger.info({}, "All active requests completed");
				resolve();
				return;
			}

			const elapsed = Date.now() - startTime;
			if (elapsed >= timeoutMs) {
				logger.warn({ activeRequests }, "Timeout waiting for active requests to complete");
				resolve();
				return;
			}

			setTimeout(check, checkInterval);
		};

		check();
	});
};

const handleShutdownSignal = async (server: Server, signal: string): Promise<void> => {
	if (shutdownState.get()) return;

	logger.info({ signal, activeRequests }, "Received shutdown signal, starting graceful shutdown");
	shutdownState.set();

	const timeoutId = setTimeout(() => {
		logger.error({ activeRequests }, "Forcing shutdown after timeout");
		process.exit(1);
	}, config.SHUTDOWN_TIMEOUT_MS);

	timeoutId.unref();

	// Stop accepting new connections
	server.close(async (error) => {
		if (error) {
			clearTimeout(timeoutId);
			logger.error({ message: error.message, stack: error.stack }, "Error closing HTTP server");
			process.exit(1);
			return;
		}

		logger.info({ activeRequests }, "HTTP server closed, waiting for active requests to complete");

		// Wait for active requests to complete (with timeout)
		await waitForActiveRequests(config.SHUTDOWN_TIMEOUT_MS);

		clearTimeout(timeoutId);
		logger.info({}, "Graceful shutdown completed");
		process.exit(0);
	});
};

const handleUnhandledRejection = (reason: unknown): void => {
	const message = reason instanceof Error ? reason.message : String(reason);
	const stack = reason instanceof Error ? reason.stack : undefined;
	logger.error({ reason: message, stack }, "Unhandled promise rejection");

	if (config.NODE_ENV === "production") {
		shutdownState.set();
		process.exit(1);
	}
};

export const setupHandlers = (server: Server): void => {
	process.on("SIGINT", () => {
		void handleShutdownSignal(server, "SIGINT");
	});
	process.on("SIGTERM", () => {
		void handleShutdownSignal(server, "SIGTERM");
	});
	process.on("unhandledRejection", handleUnhandledRejection);
	process.on("uncaughtException", (error) => {
		logger.error({ message: error.message, stack: error.stack }, "Uncaught exception");
		shutdownState.set();
		process.exit(1);
	});
	server.on("error", (error) => {
		logger.error({ message: error.message, stack: error.stack }, "Server error");
		shutdownState.set();
		process.exit(1);
	});
};

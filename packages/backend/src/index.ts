import type { Server } from "node:http";
import { app } from "@/app";
import { config } from "@/common/utils/config";
import { setupHandlers } from "@/common/utils/handlers";
import { logger } from "@/common/utils/logger";
import { APP_VERSION } from "@/common/utils/version";

/**
 * Application entry point.
 * Starts the HTTP server and sets up graceful shutdown handlers.
 */
const startServer = (): void => {
	const server: Server = app.listen(config.PORT, config.HOST, () => {
		logger.info({
			environment: config.NODE_ENV,
			host: config.HOST,
			port: config.PORT,
			version: APP_VERSION,
			pid: process.pid,
			nodeVersion: process.version,
		});
	});

	setupHandlers(server);
};

startServer();

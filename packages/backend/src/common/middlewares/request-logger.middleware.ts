import type { IncomingMessage, ServerResponse } from "node:http";
import type { Request } from "express";
import { StatusCodes } from "http-status-codes";
import pinoHttp from "pino-http";
import { config } from "@/common/utils/config";
import { logger } from "@/common/utils/logger";

const isDevelopment = config.NODE_ENV === "development";

export const requestLoggerMiddleware = pinoHttp({
	logger,
	genReqId: (req: IncomingMessage) => req.id || "",
	autoLogging: {
		ignore: (req: IncomingMessage) => {
			const url = (req as Request).originalUrl || req.url || "";
			return url.startsWith("/api/health");
		},
	},
	customLogLevel: (_req: IncomingMessage, res: ServerResponse) => {
		if (res.statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) return "error";
		if (res.statusCode >= StatusCodes.BAD_REQUEST) return "warn";
		return "info";
	},
	serializers: {
		err: (err: Error & { type?: string }) => ({
			...(err.type && { type: err.type }),
			message: err.message,
			stack: isDevelopment ? err.stack : undefined,
		}),
	},
	redact: {
		paths: [
			"req.headers.authorization",
			"req.headers.cookie",
			"req.headers['x-api-key']",
			"req.query.token",
			"req.query.api_key",
			"req.query.password",
			"req.query.secret",
			"req.body.password",
			"req.body.token",
			"req.body.secret",
			"req.body.*.password",
			"req.body.*.token",
			"req.body.*.secret",
		],
		censor: "[REDACTED]",
	},
} as unknown as Parameters<typeof pinoHttp>[0]);

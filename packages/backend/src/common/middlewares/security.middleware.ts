import cors from "cors";
import type { RequestHandler } from "express";
import express from "express";
import helmet from "helmet";
import { CACHE } from "@/common/constants";
import type { Config } from "@/common/utils/config";
import { logger } from "@/common/utils/logger";

export const createSecurityMiddlewares = (config: Config): RequestHandler[] => {
	const isProduction = config.NODE_ENV === "production";
	const hasWildcard = config.CORS_ORIGIN.includes("*");

	if (hasWildcard && isProduction) {
		throw new Error("Wildcard CORS origin is not allowed in production. Specify explicit origins.");
	}

	const corsMiddleware = cors({
		origin: (origin, callback) => {
			if (!origin || hasWildcard) {
				callback(null, true);
				return;
			}
			if (config.CORS_ORIGIN.includes(origin)) {
				callback(null, true);
				return;
			}
			if (!isProduction) {
				logger.warn({ origin, allowedOrigins: config.CORS_ORIGIN }, "CORS origin rejected");
			}
			callback(new Error("Not allowed by CORS"));
		},
		credentials: !hasWildcard,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
		exposedHeaders: ["X-Request-ID"],
		maxAge: CACHE.MAX_AGE_SECONDS,
	});

	const permissionsPolicyMiddleware: RequestHandler = (_req, res, next) => {
		res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
		next();
	};

	return [
		helmet({
			contentSecurityPolicy: isProduction
				? {
						directives: {
							defaultSrc: ["'self'"],
							styleSrc: ["'self'"],
							scriptSrc: ["'self'"],
							imgSrc: ["'self'", "data:", "https:"],
						},
					}
				: false,
			crossOriginEmbedderPolicy: false,
			crossOriginResourcePolicy: { policy: "cross-origin" },
			permittedCrossDomainPolicies: { permittedPolicies: "none" },
			referrerPolicy: { policy: "strict-origin-when-cross-origin" },
		}),
		permissionsPolicyMiddleware,
		express.json({ limit: "1mb", strict: true }),
		express.urlencoded({ extended: true, limit: "1mb" }),
		corsMiddleware,
	];
};

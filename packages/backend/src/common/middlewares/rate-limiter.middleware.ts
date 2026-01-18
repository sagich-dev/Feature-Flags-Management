import type { Request } from "express";
import { ipKeyGenerator, type RateLimitRequestHandler, rateLimit } from "express-rate-limit";
import { RATE_LIMIT } from "@/common/constants";
import { HttpError } from "@/common/errors/http.error";

export const rateLimiterMiddleware: RateLimitRequestHandler = rateLimit({
	windowMs: RATE_LIMIT.WINDOW_MS,
	max: RATE_LIMIT.MAX_GLOBAL,
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req: Request) => {
		const ip = req.ip || req.socket?.remoteAddress || "unknown";
		return ipKeyGenerator(ip);
	},
	skip: (req: Request) => req.path.startsWith("/api/health"),
	handler: (_req, _res, next) => {
		next(new HttpError("Too many requests from this IP, please try again later.", 429));
	},
});

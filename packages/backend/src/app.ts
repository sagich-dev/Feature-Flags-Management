import express from "express";
import { docsRouter } from "@/api/docs/docs.router";
import { flagsRouter } from "@/api/flags/flags.router";
import { healthRouter } from "@/api/health/health.router";
import { errorHandler } from "@/common/middlewares/error-handler.middleware";
import { noCacheMiddleware } from "@/common/middlewares/no-cache.middleware";
import { notFoundHandler } from "@/common/middlewares/not-found-handler.middleware";
import { rateLimiterMiddleware } from "@/common/middlewares/rate-limiter.middleware";
import { requestIdMiddleware } from "@/common/middlewares/request-id.middleware";
import { requestLoggerMiddleware } from "@/common/middlewares/request-logger.middleware";
import { createSecurityMiddlewares } from "@/common/middlewares/security.middleware";
import { config } from "@/common/utils/config";

const app = express();

app.set("trust proxy", config.TRUST_PROXY);

app.use(...createSecurityMiddlewares(config));
app.use(rateLimiterMiddleware);
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

// Parse JSON body
app.use(express.json());

// API routes
app.use("/api/health", noCacheMiddleware, healthRouter);
app.use("/api/flags", noCacheMiddleware, flagsRouter);

if (config.NODE_ENV !== "production") {
	app.use("/api/docs", docsRouter);
}

app.use(notFoundHandler);
app.use(errorHandler);

export { app };

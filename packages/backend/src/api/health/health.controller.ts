import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { config } from "@/common/utils/config";
import { getIsShuttingDown } from "@/common/utils/handlers";
import { getLivenessStatus, getReadinessStatus } from "./health.service";

export const handleLiveness = (_req: Request, res: Response): void => {
	const health = getLivenessStatus(getIsShuttingDown(), config.NODE_ENV);
	const statusCode = health.status === "healthy" ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR;
	res.status(statusCode).json({
		success: true,
		message: `Service is ${health.status}`,
		data: health,
		statusCode,
	});
};

export const handleReadiness = (_req: Request, res: Response): void => {
	const health = getReadinessStatus(getIsShuttingDown(), config.NODE_ENV);
	const statusCode = health.status === "healthy" ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE;
	res.status(statusCode).json({
		success: true,
		message: `Service is ${health.status}`,
		data: health,
		statusCode,
	});
};

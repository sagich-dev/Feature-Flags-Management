import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { Environment } from "./flags.schema";
import { ENVIRONMENTS } from "./flags.schema";
import * as flagsService from "./flags.service";

// Helper to extract string from param or query
function getString(value: unknown): string | undefined {
	if (typeof value === "string") return value;
	if (Array.isArray(value) && typeof value[0] === "string") return value[0];
	return undefined;
}

// Helper to validate environment
function isValidEnvironment(value: unknown): value is Environment {
	return typeof value === "string" && ENVIRONMENTS.includes(value as Environment);
}

// Flag controllers
export const getAllFlags = (_req: Request, res: Response): void => {
	const flags = flagsService.getAllFlags();
	res.status(StatusCodes.OK).json({
		success: true,
		data: flags,
	});
};

export const getFlagByKey = (req: Request, res: Response): void => {
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
	const key = getString(req.params["key"]);
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
	const envParam = getString(req.query["environment"]);
	const environment = isValidEnvironment(envParam) ? envParam : undefined;

	if (!key) {
		res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			message: "Flag key is required",
		});
		return;
	}

	const flag = flagsService.getFlagByKey(key, environment);
	res.status(StatusCodes.OK).json({
		success: true,
		data: flag,
	});
};

export const checkFlag = (req: Request, res: Response): void => {
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
	const key = getString(req.params["key"]);
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
	const envParam = getString(req.query["environment"]);

	if (!key || !isValidEnvironment(envParam)) {
		res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			message: "Flag key and valid environment are required",
		});
		return;
	}

	const isEnabled = flagsService.checkFlag(key, envParam);
	res.status(StatusCodes.OK).json({
		success: true,
		data: {
			key,
			environment: envParam,
			enabled: isEnabled,
		},
	});
};

export const createFlag = (req: Request, res: Response): void => {
	const flag = flagsService.createFlag(req.body);
	res.status(StatusCodes.CREATED).json({
		success: true,
		data: flag,
	});
};

export const updateFlag = (req: Request, res: Response): void => {
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
	const key = getString(req.params["key"]);
	if (!key) {
		res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			message: "Flag key is required",
		});
		return;
	}

	const flag = flagsService.updateFlag(key, req.body);
	res.status(StatusCodes.OK).json({
		success: true,
		data: flag,
	});
};

export const toggleFlag = (req: Request, res: Response): void => {
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
	const key = getString(req.params["key"]);
	if (!key) {
		res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			message: "Flag key is required",
		});
		return;
	}

	const flag = flagsService.toggleFlag(key, req.body);
	res.status(StatusCodes.OK).json({
		success: true,
		data: flag,
	});
};

export const resetFlagToDefault = (req: Request, res: Response): void => {
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
	const key = getString(req.params["key"]);
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
	const envParam = getString(req.query["environment"]);

	if (!key || !isValidEnvironment(envParam)) {
		res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			message: "Flag key and valid environment are required",
		});
		return;
	}

	const flag = flagsService.resetFlagToDefault(key, envParam);
	res.status(StatusCodes.OK).json({
		success: true,
		data: flag,
	});
};

export const deleteFlag = (req: Request, res: Response): void => {
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
	const key = getString(req.params["key"]);
	if (!key) {
		res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			message: "Flag key is required",
		});
		return;
	}

	flagsService.deleteFlag(key);
	res.status(StatusCodes.NO_CONTENT).send();
};

// Group controllers
export const getAllGroups = (_req: Request, res: Response): void => {
	const groups = flagsService.getAllGroups();
	res.status(StatusCodes.OK).json({
		success: true,
		data: groups,
	});
};

export const getGroupByKey = (req: Request, res: Response): void => {
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
	const key = getString(req.params["key"]);
	if (!key) {
		res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			message: "Group key is required",
		});
		return;
	}

	const result = flagsService.getGroupWithFlags(key);
	res.status(StatusCodes.OK).json({
		success: true,
		data: result,
	});
};

export const createGroup = (req: Request, res: Response): void => {
	const group = flagsService.createGroup(req.body);
	res.status(StatusCodes.CREATED).json({
		success: true,
		data: group,
	});
};

export const updateGroup = (req: Request, res: Response): void => {
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
	const key = getString(req.params["key"]);
	if (!key) {
		res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			message: "Group key is required",
		});
		return;
	}

	const group = flagsService.updateGroup(key, req.body);
	res.status(StatusCodes.OK).json({
		success: true,
		data: group,
	});
};

export const toggleGroup = (req: Request, res: Response): void => {
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
	const key = getString(req.params["key"]);
	if (!key) {
		res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			message: "Group key is required",
		});
		return;
	}

	const flags = flagsService.toggleGroup(key, req.body);
	res.status(StatusCodes.OK).json({
		success: true,
		data: flags,
	});
};

export const deleteGroup = (req: Request, res: Response): void => {
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature types
	const key = getString(req.params["key"]);
	if (!key) {
		res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			message: "Group key is required",
		});
		return;
	}

	flagsService.deleteGroup(key);
	res.status(StatusCodes.NO_CONTENT).send();
};

// Promote controller
export const promoteEnvironment = (req: Request, res: Response): void => {
	const result = flagsService.promoteEnvironment(req.body);
	res.status(StatusCodes.OK).json({
		success: true,
		data: result,
	});
};

// Environments controller
export const getEnvironments = (_req: Request, res: Response): void => {
	const environments = flagsService.getEnvironments();
	res.status(StatusCodes.OK).json({
		success: true,
		data: environments,
	});
};

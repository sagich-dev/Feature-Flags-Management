import { join } from "node:path";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { generateDocsHtml, openApiSpec } from "./docs.service";

const SCALAR_BUNDLE_PATH = join(
	process.cwd(),
	"node_modules",
	"@scalar",
	"api-reference",
	"dist",
	"browser",
	"standalone.js"
);

export const handleGetOpenApiJson = (_req: Request, res: Response): void => {
	res.status(StatusCodes.OK).json(openApiSpec);
};

export const handleGetDocsHtml = (_req: Request, res: Response): void => {
	res.status(StatusCodes.OK).setHeader("Content-Type", "text/html").send(generateDocsHtml());
};

export const handleGetStandaloneJs = (_req: Request, res: Response): void => {
	res.sendFile(SCALAR_BUNDLE_PATH);
};

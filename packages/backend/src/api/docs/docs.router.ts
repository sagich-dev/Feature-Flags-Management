import { Router } from "express";
import { handleGetDocsHtml, handleGetOpenApiJson, handleGetStandaloneJs } from "./docs.controller";

const router = Router();

router.get("/", handleGetDocsHtml);
router.get("/json", handleGetOpenApiJson);
router.get("/standalone.js", handleGetStandaloneJs);

export { router as docsRouter };

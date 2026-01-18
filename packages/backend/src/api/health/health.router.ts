import { Router } from "express";
import { handleLiveness, handleReadiness } from "./health.controller";

const router = Router();

router.get("/liveness", handleLiveness);
router.get("/readiness", handleReadiness);

export { router as healthRouter };

import { Router } from "express";
import { validateRequest } from "@/common/middlewares/validator.middleware";
import * as flagsController from "./flags.controller";
import {
	createFlagSchema,
	createGroupSchema,
	promoteSchema,
	toggleFlagSchema,
	toggleGroupSchema,
	updateFlagSchema,
	updateGroupSchema,
} from "./flags.schema";

const router = Router();

// Static routes (must come before dynamic :key routes)
router.get("/", flagsController.getAllFlags);
router.post("/", validateRequest({ body: createFlagSchema }), flagsController.createFlag);
router.get("/environments", flagsController.getEnvironments);

// Group routes (must come before :key routes)
router.get("/groups", flagsController.getAllGroups);
router.post("/groups", validateRequest({ body: createGroupSchema }), flagsController.createGroup);
router.get("/groups/:key", flagsController.getGroupByKey);
router.patch("/groups/:key", validateRequest({ body: updateGroupSchema }), flagsController.updateGroup);
router.post("/groups/:key/toggle", validateRequest({ body: toggleGroupSchema }), flagsController.toggleGroup);
router.delete("/groups/:key", flagsController.deleteGroup);

// Promote route
router.post("/promote", validateRequest({ body: promoteSchema }), flagsController.promoteEnvironment);

// Dynamic flag routes (must come after static routes)
router.get("/:key", flagsController.getFlagByKey);
router.get("/:key/check", flagsController.checkFlag);
router.patch("/:key", validateRequest({ body: updateFlagSchema }), flagsController.updateFlag);
router.post("/:key/toggle", validateRequest({ body: toggleFlagSchema }), flagsController.toggleFlag);
router.post("/:key/reset", flagsController.resetFlagToDefault);
router.delete("/:key", flagsController.deleteFlag);

export { router as flagsRouter };

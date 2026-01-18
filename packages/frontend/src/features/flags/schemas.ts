import { z } from "zod";

/**
 * Environment schemas
 */
export const ENVIRONMENTS = ["dev", "qa", "staging", "prod"] as const;
export type Environment = (typeof ENVIRONMENTS)[number];

export const environmentSchema = z.enum(ENVIRONMENTS);

/**
 * Common field schemas - reusable validators
 */
export const flagKeySchema = z
	.string()
	.min(1, "Flag key is required")
	.min(3, "Flag key must be at least 3 characters")
	.max(100, "Flag key must be less than 100 characters")
	.regex(/^[a-z0-9_]+$/, "Flag key can only contain lowercase letters, numbers, and underscores")
	.refine((key) => !key.startsWith("_") && !key.endsWith("_"), {
		message: "Flag key cannot start or end with an underscore",
	});

export const groupKeySchema = z
	.string()
	.min(1)
	.max(100)
	.regex(
		/^[a-z][a-z0-9_]*$/,
		"Group key must start with lowercase letter and contain only lowercase letters, numbers, and underscores"
	);

export const displayNameSchema = z
	.string()
	.min(1, "Display name is required")
	.min(2, "Display name must be at least 2 characters")
	.max(200, "Display name must be less than 200 characters");

export const descriptionSchema = z
	.string()
	.max(1000, "Description must be less than 1000 characters")
	.optional()
	.default("");

/**
 * Flag schemas
 */
export const createFlagSchema = z.object({
	key: flagKeySchema,
	name: displayNameSchema,
	description: descriptionSchema,
	defaultValue: z.boolean().default(false),
	groupKey: groupKeySchema.nullable().optional(),
});

export const updateFlagSchema = z.object({
	name: displayNameSchema.optional(),
	description: descriptionSchema,
	defaultValue: z.boolean().optional(),
	groupKey: groupKeySchema.nullable().optional(),
});

export const toggleFlagSchema = z.object({
	environment: environmentSchema,
	value: z.boolean(),
});

/**
 * Group schemas
 */
export const createGroupSchema = z.object({
	key: groupKeySchema,
	name: displayNameSchema,
	description: descriptionSchema,
});

export const updateGroupSchema = z.object({
	name: displayNameSchema.optional(),
	description: descriptionSchema,
});

/**
 * Promote schema - enforces directional promotion (dev -> qa -> staging -> prod)
 */
const ENV_ORDER: Record<Environment, number> = {
	dev: 0,
	qa: 1,
	staging: 2,
	prod: 3,
};

export const promoteSchema = z
	.object({
		sourceEnvironment: environmentSchema,
		targetEnvironment: environmentSchema,
	})
	.refine((data) => data.sourceEnvironment !== data.targetEnvironment, {
		message: "Source and target environments must be different",
		path: ["targetEnvironment"],
	})
	.refine((data) => ENV_ORDER[data.targetEnvironment] > ENV_ORDER[data.sourceEnvironment], {
		message: "Promotion must be directional (forward only): dev → qa → staging → prod. Cannot promote backwards.",
		path: ["targetEnvironment"],
	});

/**
 * API Response schemas
 */
export const flagSchema = z.object({
	key: z.string(),
	name: z.string(),
	description: z.string(),
	defaultValue: z.boolean(),
	groupKey: z.string().nullable(),
	overrides: z.record(environmentSchema, z.boolean().optional()),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const groupSchema = z.object({
	key: z.string(),
	name: z.string(),
	description: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const flagChangeInfoSchema = z.object({
	key: z.string(),
	name: z.string(),
	currentValue: z.boolean(),
	newValue: z.boolean(),
});

export const promoteResultSchema = z.object({
	message: z.string(),
	flagsUpdated: z.number(),
	flagsChanged: z.number(),
	totalFlags: z.number(),
	changingFlags: z.array(flagChangeInfoSchema),
});

/**
 * API Response wrapper schema
 */
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
	z.object({
		success: z.boolean(),
		data: dataSchema,
		message: z.string().optional(),
	});

/**
 * Type exports - inferred from schemas
 */
export type CreateFlagInput = z.infer<typeof createFlagSchema>;
export type UpdateFlagInput = z.infer<typeof updateFlagSchema>;
export type ToggleFlagInput = z.infer<typeof toggleFlagSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type PromoteInput = z.infer<typeof promoteSchema>;
export type Flag = z.infer<typeof flagSchema>;
export type Group = z.infer<typeof groupSchema>;
export type PromoteResult = z.infer<typeof promoteResultSchema>;
export type FlagChangeInfo = z.infer<typeof flagChangeInfoSchema>;

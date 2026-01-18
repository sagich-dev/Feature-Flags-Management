import { z } from "zod";

export const ENVIRONMENTS = ["dev", "qa", "staging", "prod"] as const;
export type Environment = (typeof ENVIRONMENTS)[number];

export const environmentSchema = z.enum(ENVIRONMENTS);

export const flagKeySchema = z
	.string()
	.min(1)
	.max(100)
	.regex(
		/^[a-z][a-z0-9_]*$/,
		"Flag key must start with lowercase letter and contain only lowercase letters, numbers, and underscores"
	);

export const groupKeySchema = z
	.string()
	.min(1)
	.max(100)
	.regex(
		/^[a-z][a-z0-9_]*$/,
		"Group key must start with lowercase letter and contain only lowercase letters, numbers, and underscores"
	);

// Flag schemas
export const createFlagSchema = z.object({
	key: flagKeySchema,
	name: z.string().min(1).max(200),
	description: z.string().max(1000).default(""),
	defaultValue: z.boolean().default(false),
	groupKey: groupKeySchema.nullable().optional(),
});

export const updateFlagSchema = z.object({
	name: z.string().min(1).max(200).optional(),
	description: z.string().max(1000).optional(),
	defaultValue: z.boolean().optional(),
	groupKey: groupKeySchema.nullable().optional(),
});

export const toggleFlagSchema = z.object({
	environment: environmentSchema,
	value: z.boolean(),
});

// Group schemas
export const createGroupSchema = z.object({
	key: groupKeySchema,
	name: z.string().min(1).max(200),
	description: z.string().max(1000).default(""),
});

export const updateGroupSchema = z.object({
	name: z.string().min(1).max(200).optional(),
	description: z.string().max(1000).optional(),
});

export const toggleGroupSchema = z.object({
	environment: environmentSchema,
	value: z.boolean(),
});

// Environment order for directional promotion validation
const ENV_ORDER: Record<Environment, number> = {
	dev: 0,
	qa: 1,
	staging: 2,
	prod: 3,
};

// Promote schema - enforces directional promotion (dev -> qa -> staging -> prod)
export const promoteSchema = z
	.object({
		sourceEnvironment: environmentSchema,
		targetEnvironment: environmentSchema,
	})
	.refine((data) => data.sourceEnvironment !== data.targetEnvironment, {
		message: "Source and target environments must be different",
	})
	.refine((data) => ENV_ORDER[data.targetEnvironment] > ENV_ORDER[data.sourceEnvironment], {
		message: "Promotion must be directional (forward only): dev → qa → staging → prod. Cannot promote backwards.",
	});

// Query schemas
export const getFlagQuerySchema = z.object({
	environment: environmentSchema.optional(),
});

// Response types
export interface Flag {
	key: string;
	name: string;
	description: string;
	defaultValue: boolean;
	groupKey: string | null;
	overrides: Record<Environment, boolean | undefined>;
	createdAt: Date;
	updatedAt: Date;
}

export interface Group {
	key: string;
	name: string;
	description: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface FlagWithValue extends Flag {
	value: boolean;
	environment: Environment;
}

export type CreateFlagInput = z.infer<typeof createFlagSchema>;
export type UpdateFlagInput = z.infer<typeof updateFlagSchema>;
export type ToggleFlagInput = z.infer<typeof toggleFlagSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type ToggleGroupInput = z.infer<typeof toggleGroupSchema>;
export type PromoteInput = z.infer<typeof promoteSchema>;

// Response types for promote operation
export interface FlagChangeInfo {
	key: string;
	name: string;
	currentValue: boolean;
	newValue: boolean;
}

export interface PromoteResponse {
	message: string;
	flagsUpdated: number;
	flagsChanged: number;
	totalFlags: number;
	changingFlags: FlagChangeInfo[];
}

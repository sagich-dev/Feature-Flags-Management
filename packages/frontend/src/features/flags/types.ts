/**
 * Type exports - All types are inferred from Zod schemas for type safety
 * This ensures runtime validation matches TypeScript types
 */
export type {
	CreateFlagInput,
	CreateGroupInput,
	Environment,
	Flag,
	FlagChangeInfo,
	Group,
	PromoteInput,
	PromoteResult,
	ToggleFlagInput,
	UpdateFlagInput,
	UpdateGroupInput,
} from "./schemas";

// Re-export ENVIRONMENTS constant and import types needed for interfaces
import type { Environment, Flag } from "./schemas";

export { ENVIRONMENTS } from "./schemas";

/**
 * Extended type for flag with computed value in a specific environment
 */
export interface FlagWithValue extends Flag {
	value: boolean;
	environment: Environment;
}

/**
 * API response wrapper type
 */
export interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
}

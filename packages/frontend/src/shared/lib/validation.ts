/**
 * Validation utilities for forms
 *
 * Note: This file maintains backward compatibility while the codebase migrates to Zod.
 * New code should use Zod schemas directly from @/features/flags/schemas
 */

import { flagKeySchema, groupKeySchema } from "@/features/flags/schemas";

/**
 * @deprecated Use Zod schemas directly. This is kept for backward compatibility.
 */
export interface ValidationResult {
	isValid: boolean;
	error?: string;
}

/**
 * Validates a flag key using Zod schema
 * @deprecated Use flagKeySchema from @/features/flags/schemas directly
 */
export function validateFlagKey(key: string): ValidationResult {
	const result = flagKeySchema.safeParse(key);
	if (result.success) {
		return { isValid: true };
	}
	return {
		isValid: false,
		error: result.error.issues[0]?.message || "Invalid flag key",
	};
}

/**
 * Validates a group key using Zod schema
 */
export function validateGroupKey(key: string): ValidationResult {
	const result = groupKeySchema.safeParse(key);
	if (result.success) {
		return { isValid: true };
	}
	return {
		isValid: false,
		error: result.error.issues[0]?.message || "Invalid group key",
	};
}

/**
 * Validates a display name
 * @deprecated Use displayNameSchema from @/features/flags/schemas directly
 */
export function validateDisplayName(name: string): ValidationResult {
	if (!name || name.trim().length === 0) {
		return {
			isValid: false,
			error: "Display name is required",
		};
	}

	if (name.length < 2) {
		return {
			isValid: false,
			error: "Display name must be at least 2 characters",
		};
	}

	if (name.length > 200) {
		return {
			isValid: false,
			error: "Display name must be less than 200 characters",
		};
	}

	return { isValid: true };
}

/**
 * Validates a description
 * @deprecated Use descriptionSchema from @/features/flags/schemas directly
 */
export function validateDescription(description: string): ValidationResult {
	if (description && description.length > 1000) {
		return {
			isValid: false,
			error: "Description must be less than 1000 characters",
		};
	}

	return { isValid: true };
}

/**
 * Formats flag key by converting to lowercase and replacing invalid characters with underscores
 */
export function formatFlagKey(key: string): string {
	return key
		.toLowerCase()
		.replace(/[^a-z0-9_]/g, "_")
		.replace(/^_+|_+$/g, "")
		.replace(/_+/g, "_");
}

/**
 * Formats group key by converting to lowercase and replacing invalid characters with underscores
 */
export function formatGroupKey(key: string): string {
	return formatFlagKey(key);
}

// Export Zod helpers for convenience
export { getFieldError, validateFormData } from "./zodHelpers";

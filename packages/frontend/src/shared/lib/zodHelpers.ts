import type { z } from "zod";

/**
 * Utility to extract field errors from Zod errors for form display
 * Returns an object mapping field paths to error messages
 */
export function getFieldErrors(error: z.ZodError): Record<string, string> {
	const fieldErrors: Record<string, string> = {};

	for (const issue of error.issues) {
		const path = issue.path.join(".");
		if (path) {
			// Use the first error for each field
			if (!fieldErrors[path]) {
				fieldErrors[path] = issue.message;
			}
		}
	}

	return fieldErrors;
}

/**
 * Get the error message for a specific field from a Zod error
 */
export function getFieldError(error: z.ZodError, fieldPath: string | (string | number)[]): string | undefined {
	const path = Array.isArray(fieldPath) ? fieldPath.join(".") : fieldPath;

	const issue = error.issues.find((issue) => issue.path.join(".") === path);
	return issue?.message;
}

/**
 * Validates data against a schema and returns field errors if validation fails
 * Returns null if validation succeeds
 */
export function validateFormData<T extends z.ZodType>(
	schema: T,
	data: unknown
): { errors: Record<string, string> } | null {
	const result = schema.safeParse(data);

	if (!result.success) {
		return {
			errors: getFieldErrors(result.error),
		};
	}

	return null;
}

/**
 * Formats a Zod error for display in the UI
 * Returns a user-friendly error message
 */
export function formatZodError(error: z.ZodError): string {
	if (error.issues.length === 0) {
		return "Validation failed";
	}

	if (error.issues.length === 1) {
		const issue = error.issues[0];
		if (!issue) {
			return "Validation failed";
		}
		const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
		return `${path}${issue.message}`;
	}

	return error.issues
		.map((issue) => {
			const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
			return `${path}${issue.message}`;
		})
		.join("; ");
}

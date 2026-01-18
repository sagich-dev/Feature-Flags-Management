/**
 * Format error message for display
 */

export function formatErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	return "An unknown error occurred";
}

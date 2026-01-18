import type { DialogProps } from "@mui/material";

/**
 * Common dialog PaperProps styles used across all dialogs
 */
export const commonDialogPaperProps: NonNullable<DialogProps["PaperProps"]> = {
	sx: {
		borderRadius: "16px",
		boxShadow: "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
	},
};

/**
 * Dialog PaperProps for confirmation/warning dialogs (slightly stronger shadow)
 */
export const confirmDialogPaperProps: NonNullable<DialogProps["PaperProps"]> = {
	sx: {
		borderRadius: "16px",
		boxShadow: "0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)",
	},
};

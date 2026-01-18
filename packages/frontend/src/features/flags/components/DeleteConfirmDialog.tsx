import { WarningAmberOutlined } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { confirmDialogPaperProps } from "@/shared/styles/dialogStyles";

interface DeleteConfirmDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	isDeleting?: boolean;
}

export function DeleteConfirmDialog({
	open,
	onClose,
	onConfirm,
	title,
	message,
	isDeleting = false,
}: DeleteConfirmDialogProps) {
	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={confirmDialogPaperProps}>
			<DialogTitle sx={{ pb: 2 }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<Box
						sx={{
							width: 44,
							height: 44,
							borderRadius: "12px",
							backgroundColor: "rgba(220, 38, 38, 0.1)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexShrink: 0,
						}}
					>
						<WarningAmberOutlined sx={{ color: "error.main", fontSize: 24 }} />
					</Box>
					<Typography
						variant="h6"
						sx={{
							fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
							fontWeight: 700,
							fontSize: "1.125rem",
							color: "error.main",
						}}
					>
						{title}
					</Typography>
				</Box>
			</DialogTitle>
			<DialogContent sx={{ pt: 3 }}>
				<Box
					sx={{
						p: 3,
						borderRadius: "12px",
						backgroundColor: "rgba(220, 38, 38, 0.06)",
						border: "2px solid rgba(220, 38, 38, 0.15)",
					}}
				>
					<Typography
						variant="body2"
						sx={{ color: "text.primary", fontWeight: 500, lineHeight: 1.7, fontSize: "0.9375rem" }}
					>
						{message}
					</Typography>
				</Box>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
				<Button onClick={onClose} variant="outlined" size="large" disabled={isDeleting} sx={{ minWidth: 120 }}>
					Cancel
				</Button>
				<Button
					onClick={onConfirm}
					variant="contained"
					size="large"
					disabled={isDeleting}
					sx={{
						minWidth: 160,
						backgroundColor: "#0614BA",
						"&:hover": {
							backgroundColor: "#04dfd5",
						},
					}}
				>
					{isDeleting ? "Deleting..." : "Delete"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

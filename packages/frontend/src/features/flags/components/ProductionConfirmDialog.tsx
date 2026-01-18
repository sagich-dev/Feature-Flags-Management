import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { confirmDialogPaperProps } from "@/shared/styles/dialogStyles";

interface ProductionConfirmDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	flagKey: string;
	flagName: string;
	currentValue: boolean;
	isToggling?: boolean;
}

export function ProductionConfirmDialog({
	open,
	onClose,
	onConfirm,
	flagKey,
	flagName,
	currentValue,
	isToggling = false,
}: ProductionConfirmDialogProps) {
	const newValue = !currentValue;

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={confirmDialogPaperProps}>
			<DialogTitle sx={{ pb: 2 }}>
				<Box>
					<Typography
						variant="h6"
						sx={{
							fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
							fontWeight: 700,
							fontSize: "1.125rem",
							mb: 0.5,
							color: "text.primary",
						}}
					>
						Production Environment Change
					</Typography>
					<Typography variant="body2" sx={{ fontSize: "0.875rem", color: "text.secondary", lineHeight: 1.5 }}>
						This change will affect live users immediately
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
						mb: 3,
					}}
				>
					<Typography
						variant="body2"
						sx={{ color: "text.primary", fontWeight: 500, lineHeight: 1.7, fontSize: "0.9375rem" }}
					>
						You are about to change a feature flag in the{" "}
						<Typography component="span" sx={{ color: "error.main", fontWeight: 700 }}>
							Production
						</Typography>{" "}
						environment. This action will take effect immediately and may impact all users.
					</Typography>
				</Box>

				<Box
					sx={{
						p: 2.5,
						borderRadius: "10px",
						backgroundColor: "background.default",
						border: "1.5px solid",
						borderColor: "divider",
					}}
				>
					<Typography
						variant="body2"
						sx={{
							fontFamily: '"JetBrains Mono", monospace',
							fontWeight: 600,
							color: "primary.main",
							mb: 1,
							fontSize: "0.8125rem",
						}}
					>
						{flagKey}
					</Typography>
					<Typography
						variant="body2"
						sx={{
							mb: 2.5,
							color: "text.secondary",
							fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
							fontWeight: 500,
							fontSize: "0.9375rem",
						}}
					>
						{flagName}
					</Typography>

					<Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
							<Typography
								variant="caption"
								sx={{
									color: "text.secondary",
									fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
									fontWeight: 600,
									fontSize: "0.6875rem",
									textTransform: "uppercase",
									letterSpacing: "0.06em",
								}}
							>
								Current:
							</Typography>
							<Chip
								label={currentValue ? "ON" : "OFF"}
								size="small"
								sx={{
									backgroundColor: currentValue ? "rgba(5, 150, 105, 0.1)" : "rgba(100, 116, 139, 0.1)",
									color: currentValue ? "success.main" : "text.secondary",
									border: "1.5px solid",
									borderColor: currentValue ? "success.main" : "divider",
									fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
									fontWeight: 700,
									fontSize: "0.75rem",
									height: 26,
								}}
							/>
						</Box>
						<Typography variant="body2" sx={{ color: "text.muted", fontWeight: 600, fontSize: "1.125rem" }}>
							→
						</Typography>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
							<Typography
								variant="caption"
								sx={{
									color: "text.secondary",
									fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
									fontWeight: 600,
									fontSize: "0.6875rem",
									textTransform: "uppercase",
									letterSpacing: "0.06em",
								}}
							>
								New:
							</Typography>
							<Chip
								label={newValue ? "ON" : "OFF"}
								size="small"
								sx={{
									backgroundColor: newValue ? "rgba(5, 150, 105, 0.1)" : "rgba(100, 116, 139, 0.1)",
									color: newValue ? "success.main" : "text.secondary",
									border: "1.5px solid",
									borderColor: newValue ? "success.main" : "divider",
									fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
									fontWeight: 700,
									fontSize: "0.75rem",
									height: 26,
								}}
							/>
						</Box>
					</Box>
				</Box>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
				<Button onClick={onClose} variant="outlined" size="large" disabled={isToggling} sx={{ minWidth: 120 }}>
					Cancel
				</Button>
				<Button
					onClick={onConfirm}
					variant="contained"
					size="large"
					disabled={isToggling}
					sx={{
						minWidth: 160,
						backgroundColor: "#0614BA",
						"&:hover": {
							backgroundColor: "#04dfd5",
						},
					}}
				>
					{isToggling ? "Updating..." : "Confirm Production Change"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

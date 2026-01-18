import { ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import {
	Box,
	Button,
	Chip,
	Collapse,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableRow,
	Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { confirmDialogPaperProps } from "@/shared/styles/dialogStyles";
import { usePromoteEnvironment } from "../api/mutations";
import { useFlags } from "../api/queries";
import { ENVIRONMENTS, type Environment, type Flag } from "../types";

// Environment order for directional promotion (index determines order)
const ENV_ORDER: Record<Environment, number> = {
	dev: 0,
	qa: 1,
	staging: 2,
	prod: 3,
};

// Get valid target environments (only environments "ahead" in the pipeline)
function getValidTargetEnvironments(source: Environment): Environment[] {
	const sourceIndex = ENV_ORDER[source];
	return ENVIRONMENTS.filter((env) => ENV_ORDER[env] > sourceIndex);
}

// Get valid source environments (only environments that have at least one valid target)
function getValidSourceEnvironments(): Environment[] {
	// All environments except prod can be sources (prod has no valid targets)
	return ENVIRONMENTS.filter((env) => env !== "prod");
}

// Calculate which flags will change when promoting
function calculateFlagsToChange(flags: Flag[], source: Environment, target: Environment) {
	return flags
		.map((flag) => {
			const sourceValue = flag.overrides[source] !== undefined ? flag.overrides[source] : flag.defaultValue;
			const targetValue = flag.overrides[target] !== undefined ? flag.overrides[target] : flag.defaultValue;
			return { flag, sourceValue, targetValue };
		})
		.filter(({ sourceValue, targetValue }) => sourceValue !== targetValue)
		.map(({ flag, sourceValue, targetValue }) => ({
			key: flag.key,
			name: flag.name,
			currentValue: targetValue,
			newValue: sourceValue,
		}));
}

interface PromoteDialogProps {
	open: boolean;
	onClose: () => void;
}

export function PromoteDialog({ open, onClose }: PromoteDialogProps) {
	const promoteEnvironment = usePromoteEnvironment();
	const { data: flags = [] } = useFlags();

	const [sourceEnvironment, setSourceEnvironment] = useState<Environment>("staging");
	const [targetEnvironment, setTargetEnvironment] = useState<Environment>("prod");
	const [showFlagsList, setShowFlagsList] = useState(false);

	// Get valid environments based on directional promotion rules
	const validSourceEnvironments = useMemo(() => getValidSourceEnvironments(), []);
	const validTargetEnvironments = useMemo(() => getValidTargetEnvironments(sourceEnvironment), [sourceEnvironment]);

	// Calculate flags that will change
	const flagsToChange = useMemo(
		() => calculateFlagsToChange(flags, sourceEnvironment, targetEnvironment),
		[flags, sourceEnvironment, targetEnvironment]
	);

	const flagsToChangeCount = flagsToChange.length;
	const isTargetProd = targetEnvironment === "prod";

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		await promoteEnvironment.mutateAsync({
			sourceEnvironment,
			targetEnvironment,
		});
		onClose();
	};

	const handleClose = () => {
		setSourceEnvironment("staging");
		setTargetEnvironment("prod");
		setShowFlagsList(false);
		onClose();
	};

	// Handle source environment change - auto-select first valid target
	const handleSourceChange = (newSource: Environment) => {
		setSourceEnvironment(newSource);
		const validTargets = getValidTargetEnvironments(newSource);
		// If current target is not valid for new source, select first valid target
		if (!validTargets.includes(targetEnvironment) && validTargets.length > 0 && validTargets[0]) {
			setTargetEnvironment(validTargets[0]);
		}
	};

	const isValid = sourceEnvironment !== targetEnvironment && validTargetEnvironments.includes(targetEnvironment);

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={confirmDialogPaperProps}>
			<form onSubmit={handleSubmit}>
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
							Promote Environment
						</Typography>
						<Typography variant="body2" sx={{ fontSize: "0.875rem", color: "text.secondary", lineHeight: 1.5 }}>
							Copy all flag configurations between environments
						</Typography>
					</Box>
				</DialogTitle>
				<DialogContent sx={{ pt: 3 }}>
					<Stack spacing={3}>
						{/* Standard warning */}
						<Box
							sx={{
								p: 2.5,
								borderRadius: "12px",
								backgroundColor: isTargetProd ? "rgba(220, 38, 38, 0.06)" : "rgba(217, 119, 6, 0.06)",
								border: `2px solid ${isTargetProd ? "rgba(220, 38, 38, 0.15)" : "rgba(217, 119, 6, 0.15)"}`,
							}}
						>
							<Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500, lineHeight: 1.7 }}>
								This will copy all flag values from the source environment to the target environment.
								<Typography
									component="span"
									sx={{
										color: isTargetProd ? "error.main" : "warning.main",
										fontWeight: 700,
										display: "block",
										mt: 1.5,
									}}
								>
									This action cannot be undone
								</Typography>
							</Typography>
						</Box>

						{/* Production-specific warning */}
						{isTargetProd && (
							<Box
								sx={{
									p: 2.5,
									borderRadius: "12px",
									backgroundColor: "rgba(220, 38, 38, 0.08)",
									border: "2px solid rgba(220, 38, 38, 0.2)",
								}}
							>
								<Typography
									variant="body2"
									sx={{
										color: "error.main",
										fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
										fontWeight: 700,
										mb: 0.75,
									}}
								>
									Production Environment Warning
								</Typography>
								<Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.7 }}>
									You are about to promote flags to{" "}
									<Typography component="span" sx={{ fontWeight: 700 }}>
										Production
									</Typography>
									. This will immediately affect all live users. Please review carefully before proceeding.
								</Typography>
							</Box>
						)}

						<FormControl fullWidth>
							<InputLabel>Source Environment</InputLabel>
							<Select
								value={sourceEnvironment}
								label="Source Environment"
								onChange={(e) => handleSourceChange(e.target.value as Environment)}
							>
								{validSourceEnvironments.map((env) => (
									<MenuItem key={env} value={env}>
										{env.toUpperCase()}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl fullWidth>
							<InputLabel>Target Environment</InputLabel>
							<Select
								value={targetEnvironment}
								label="Target Environment"
								onChange={(e) => setTargetEnvironment(e.target.value as Environment)}
							>
								{validTargetEnvironments.map((env) => (
									<MenuItem key={env} value={env}>
										{env.toUpperCase()}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* Flags to change summary */}
						<Box
							sx={{
								borderRadius: "10px",
								backgroundColor: "background.default",
								border: "1.5px solid",
								borderColor: "divider",
								overflow: "hidden",
							}}
						>
							<Box
								sx={{
									p: 2.5,
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									cursor: flagsToChangeCount > 0 ? "pointer" : "default",
								}}
								onClick={() => flagsToChangeCount > 0 && setShowFlagsList(!showFlagsList)}
							>
								<Typography
									variant="body2"
									sx={{
										color: "text.secondary",
										fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
										fontWeight: 500,
									}}
								>
									Flags that will change:
								</Typography>
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<Chip
										label={`${flagsToChangeCount} of ${flags.length}`}
										size="small"
										color={flagsToChangeCount > 0 ? (isTargetProd ? "error" : "warning") : "default"}
										sx={{
											fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
											fontWeight: 700,
										}}
									/>
									{flagsToChangeCount > 0 && (
										<IconButton
											size="small"
											onClick={(e) => {
												e.stopPropagation();
												setShowFlagsList(!showFlagsList);
											}}
											sx={{ ml: 0.5 }}
										>
											{showFlagsList ? <ExpandLessIcon /> : <ExpandMoreIcon />}
										</IconButton>
									)}
								</Box>
							</Box>

							{/* Flags list */}
							<Collapse in={showFlagsList && flagsToChangeCount > 0}>
								<Box
									sx={{
										borderTop: "1.5px solid",
										borderColor: "divider",
										maxHeight: "300px",
										overflowY: "auto",
									}}
								>
									<Table size="small">
										<TableBody>
											{flagsToChange.map((flagChange) => (
												<TableRow key={flagChange.key} sx={{ "&:last-child td": { border: 0 } }}>
													<TableCell sx={{ py: 1.5 }}>
														<Typography
															variant="body2"
															sx={{
																fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
																fontWeight: 600,
																color: "text.primary",
																mb: 0.5,
															}}
														>
															{flagChange.name}
														</Typography>
														<Typography
															variant="caption"
															sx={{
																color: "text.secondary",
																fontFamily: "monospace",
																fontSize: "0.75rem",
															}}
														>
															{flagChange.key}
														</Typography>
													</TableCell>
													<TableCell align="right" sx={{ py: 1.5 }}>
														<Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
															<Chip
																label={flagChange.currentValue ? "ON" : "OFF"}
																size="small"
																color="default"
																variant="outlined"
																sx={{
																	fontSize: "0.7rem",
																	height: "22px",
																	fontWeight: 500,
																}}
															/>
															<Typography variant="caption" sx={{ color: "text.secondary", mx: 0.5 }}>
																→
															</Typography>
															<Chip
																label={flagChange.newValue ? "ON" : "OFF"}
																size="small"
																color={flagChange.newValue ? "success" : "default"}
																variant="filled"
																sx={{
																	fontSize: "0.7rem",
																	height: "22px",
																	fontWeight: 700,
																}}
															/>
														</Stack>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</Box>
							</Collapse>
						</Box>

						{!isValid && (
							<Box
								sx={{
									p: 2,
									borderRadius: "10px",
									backgroundColor: "rgba(220, 38, 38, 0.06)",
									border: "1.5px solid rgba(220, 38, 38, 0.15)",
								}}
							>
								<Typography
									variant="body2"
									sx={{
										color: "error.main",
										fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
										fontWeight: 600,
									}}
								>
									Invalid promotion. You can only promote forward (dev → qa → staging → prod).
								</Typography>
							</Box>
						)}
					</Stack>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
					<Button onClick={handleClose} variant="outlined" size="large" sx={{ minWidth: 120 }}>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="contained"
						size="large"
						disabled={!isValid || promoteEnvironment.isPending}
						sx={{
							minWidth: 160,
							backgroundColor: "#0614BA",
							"&:hover": {
								backgroundColor: "#04dfd5",
							},
						}}
					>
						{promoteEnvironment.isPending ? "Promoting..." : "Promote Now"}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

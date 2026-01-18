import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Select,
	Switch,
	TextField,
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getFieldError } from "@/shared/lib/zodHelpers";
import { commonDialogPaperProps } from "@/shared/styles/dialogStyles";
import { useCreateFlag, useUpdateFlag } from "../api/mutations";
import { useGroups } from "../api/queries";
import { type CreateFlagInput, createFlagSchema, type UpdateFlagInput, updateFlagSchema } from "../schemas";
import type { Flag } from "../types";

interface FlagFormDialogProps {
	open: boolean;
	onClose: () => void;
	mode: "create" | "edit";
	flag?: Flag | null;
}

export function FlagFormDialog({ open, onClose, mode, flag }: FlagFormDialogProps) {
	const { data: groups } = useGroups();
	const createFlag = useCreateFlag();
	const updateFlag = useUpdateFlag();

	const isEditMode = mode === "edit";

	// Form state - use CreateFlagInput type for create, UpdateFlagInput for edit
	const [createFormData, setCreateFormData] = useState<CreateFlagInput>({
		key: "",
		name: "",
		description: "",
		defaultValue: false,
		groupKey: null,
	});

	const [editFormData, setEditFormData] = useState<UpdateFlagInput>({
		name: "",
		description: "",
		defaultValue: false,
		groupKey: null,
	});

	const [errors, setErrors] = useState<{
		key?: string;
		name?: string;
		description?: string;
	}>({});

	// Reset form when flag changes or dialog opens
	useEffect(() => {
		if (isEditMode && flag && open) {
			setEditFormData({
				name: flag.name,
				description: flag.description,
				defaultValue: flag.defaultValue,
				groupKey: flag.groupKey,
			});
		} else if (!isEditMode && open) {
			setCreateFormData({
				key: "",
				name: "",
				description: "",
				defaultValue: false,
				groupKey: null,
			});
		}
		setErrors({});
	}, [flag, open, isEditMode]);

	// Real-time validation using Zod
	useEffect(() => {
		if (isEditMode) {
			const result = updateFlagSchema.safeParse(editFormData);
			if (!result.success) {
				const newErrors: typeof errors = {};
				const zodError = result.error;

				const nameError = getFieldError(zodError, "name");
				if (nameError) newErrors.name = nameError;

				const descError = getFieldError(zodError, "description");
				if (descError) newErrors.description = descError;

				setErrors(newErrors);
			} else {
				setErrors({});
			}
		} else {
			const result = createFlagSchema.safeParse(createFormData);
			if (!result.success) {
				const newErrors: typeof errors = {};
				const zodError = result.error;

				const keyError = getFieldError(zodError, "key");
				if (keyError) newErrors.key = keyError;

				const nameError = getFieldError(zodError, "name");
				if (nameError) newErrors.name = nameError;

				const descError = getFieldError(zodError, "description");
				if (descError) newErrors.description = descError;

				setErrors(newErrors);
			} else {
				setErrors({});
			}
		}
	}, [createFormData, editFormData, isEditMode]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (isEditMode) {
			if (!flag) return;

			const result = updateFlagSchema.safeParse(editFormData);
			if (!result.success) {
				const zodError = result.error;
				const validationErrors: typeof errors = {};

				const nameError = getFieldError(zodError, "name");
				if (nameError) validationErrors.name = nameError;

				const descError = getFieldError(zodError, "description");
				if (descError) validationErrors.description = descError;

				setErrors(validationErrors);
				return;
			}

			await updateFlag.mutateAsync({
				key: flag.key,
				input: result.data,
			});
		} else {
			const result = createFlagSchema.safeParse(createFormData);
			if (!result.success) {
				const zodError = result.error;
				const validationErrors: typeof errors = {};

				const keyError = getFieldError(zodError, "key");
				if (keyError) validationErrors.key = keyError;

				const nameError = getFieldError(zodError, "name");
				if (nameError) validationErrors.name = nameError;

				const descError = getFieldError(zodError, "description");
				if (descError) validationErrors.description = descError;

				setErrors(validationErrors);
				return;
			}

			await createFlag.mutateAsync(result.data);
			setCreateFormData({
				key: "",
				name: "",
				description: "",
				defaultValue: false,
				groupKey: null,
			});
		}

		setErrors({});
		onClose();
	};

	const handleClose = () => {
		setErrors({});
		onClose();
	};

	if (isEditMode && !flag) return null;

	const formData = isEditMode ? editFormData : createFormData;

	const hasChanges =
		isEditMode && flag
			? formData.name !== flag.name || formData.description !== flag.description || formData.groupKey !== flag.groupKey
			: false;

	const isFormValid = isEditMode
		? formData.name && !errors.name && !errors.description
		: createFormData.key && createFormData.name && !errors.key && !errors.name && !errors.description;

	const isPending = isEditMode ? updateFlag.isPending : createFlag.isPending;

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={commonDialogPaperProps}>
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
							{isEditMode ? "Edit Flag" : "Create New Flag"}
						</Typography>
						{isEditMode ? (
							<Typography
								variant="body2"
								sx={{
									fontFamily: '"JetBrains Mono", monospace',
									color: "primary.main",
									fontSize: "0.8125rem",
									fontWeight: 600,
								}}
							>
								{flag?.key}
							</Typography>
						) : (
							<Typography variant="body2" sx={{ fontSize: "0.875rem", color: "text.secondary", lineHeight: 1.5 }}>
								Define a feature flag to control functionality across environments
							</Typography>
						)}
					</Box>
				</DialogTitle>
				<DialogContent sx={{ pt: 3 }}>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
						{isEditMode && flag && (
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
									variant="caption"
									sx={{
										display: "block",
										mb: 1,
										color: "text.secondary",
										fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
										fontWeight: 600,
										fontSize: "0.6875rem",
										textTransform: "uppercase",
										letterSpacing: "0.08em",
									}}
								>
									Flag Key (immutable)
								</Typography>
								<Typography
									variant="body2"
									sx={{
										fontFamily: '"JetBrains Mono", monospace',
										fontWeight: 600,
										color: "text.primary",
										fontSize: "0.875rem",
									}}
								>
									{flag.key}
								</Typography>
							</Box>
						)}

						{!isEditMode && (
							<TextField
								label="Flag Key"
								value={createFormData.key}
								onChange={(e) =>
									setCreateFormData({
										...createFormData,
										key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
									})
								}
								required
								placeholder="my_feature_flag"
								helperText={errors.key || "Unique identifier (lowercase, numbers, underscores only)"}
								error={!!errors.key}
								fullWidth
								slotProps={{
									input: {
										sx: {
											fontFamily: '"JetBrains Mono", monospace',
											fontSize: "0.875rem",
										},
									},
									htmlInput: {
										maxLength: 100,
									},
								}}
							/>
						)}

						<TextField
							label="Display Name"
							value={formData.name}
							onChange={(e) => {
								if (isEditMode) {
									setEditFormData({ ...editFormData, name: e.target.value });
								} else {
									setCreateFormData({ ...createFormData, name: e.target.value });
								}
							}}
							required
							placeholder="My Feature Flag"
							helperText={errors.name || "Human-readable name for the dashboard"}
							error={!!errors.name}
							fullWidth
							slotProps={{
								htmlInput: {
									maxLength: 200,
								},
							}}
						/>

						<TextField
							label="Description"
							value={formData.description}
							onChange={(e) => {
								if (isEditMode) {
									setEditFormData({ ...editFormData, description: e.target.value });
								} else {
									setCreateFormData({ ...createFormData, description: e.target.value });
								}
							}}
							placeholder="Describe what this flag controls and its purpose"
							helperText={errors.description || "Optional: Helps team members understand the flag's purpose"}
							error={!!errors.description}
							multiline
							rows={3}
							fullWidth
							slotProps={{
								htmlInput: {
									maxLength: 1000,
								},
							}}
						/>

						<FormControl fullWidth>
							<InputLabel>Group</InputLabel>
							<Select
								value={formData.groupKey ?? ""}
								label="Group"
								onChange={(e) => {
									const groupKey = e.target.value || null;
									if (isEditMode) {
										setEditFormData({ ...editFormData, groupKey });
									} else {
										setCreateFormData({ ...createFormData, groupKey });
									}
								}}
							>
								<MenuItem value="">
									<Typography variant="body2" sx={{ color: "text.muted", fontStyle: "italic" }}>
										No group
									</Typography>
								</MenuItem>
								{groups?.map((group) => (
									<MenuItem key={group.key} value={group.key}>
										{group.name}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{!isEditMode && (
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									p: 3,
									borderRadius: "12px",
									backgroundColor: formData.defaultValue ? "rgba(5, 150, 105, 0.06)" : "rgba(100, 116, 139, 0.06)",
									border: "2px solid",
									borderColor: formData.defaultValue ? "success.main" : "divider",
									transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
								}}
							>
								<Box>
									<Typography
										variant="body2"
										sx={{
											fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
											fontWeight: 600,
											mb: 0.5,
											color: "text.primary",
											fontSize: "0.875rem",
										}}
									>
										Value
									</Typography>
									<Typography
										variant="caption"
										sx={{ fontSize: "0.8125rem", color: "text.secondary", lineHeight: 1.5 }}
									>
										{formData.defaultValue
											? "Flag will be ON in all environments"
											: "Flag will be OFF in all environments"}
									</Typography>
								</Box>
								<FormControlLabel
									control={
										<Switch
											checked={formData.defaultValue ?? false}
											onChange={(e) => {
												if (isEditMode) {
													setEditFormData({ ...editFormData, defaultValue: e.target.checked });
												} else {
													setCreateFormData({ ...createFormData, defaultValue: e.target.checked });
												}
											}}
										/>
									}
									label=""
									sx={{ m: 0 }}
								/>
							</Box>
						)}
					</Box>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
					<Button onClick={handleClose} variant="outlined" size="large" sx={{ minWidth: 120 }}>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="contained"
						size="large"
						disabled={!isFormValid || (isEditMode && !hasChanges) || isPending}
						sx={{
							minWidth: 160,
							backgroundColor: "#0614BA",
							"&:hover": {
								backgroundColor: "#04dfd5",
							},
						}}
					>
						{isPending ? (isEditMode ? "Saving..." : "Creating...") : isEditMode ? "Save Changes" : "Create Flag"}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

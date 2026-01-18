import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getFieldError } from "@/shared/lib/zodHelpers";
import { commonDialogPaperProps } from "@/shared/styles/dialogStyles";
import { useCreateGroup } from "../api/mutations";
import { type CreateGroupInput, createGroupSchema } from "../schemas";

interface CreateGroupDialogProps {
	open: boolean;
	onClose: () => void;
}

export function CreateGroupDialog({ open, onClose }: CreateGroupDialogProps) {
	const createGroup = useCreateGroup();

	const [formData, setFormData] = useState<CreateGroupInput>({
		key: "",
		name: "",
		description: "",
	});

	const [errors, setErrors] = useState<{
		key?: string;
		name?: string;
		description?: string;
	}>({});

	// Real-time validation using Zod
	useEffect(() => {
		const result = createGroupSchema.safeParse(formData);
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
	}, [formData]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate using Zod schema
		const result = createGroupSchema.safeParse(formData);
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

		// Use validated data from Zod
		await createGroup.mutateAsync(result.data);
		setFormData({
			key: "",
			name: "",
			description: "",
		});
		setErrors({});
		onClose();
	};

	const handleClose = () => {
		setFormData({
			key: "",
			name: "",
			description: "",
		});
		setErrors({});
		onClose();
	};

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
							Create New Group
						</Typography>
						<Typography variant="body2" sx={{ fontSize: "0.875rem", color: "text.secondary", lineHeight: 1.5 }}>
							Organize related flags into logical collections
						</Typography>
					</Box>
				</DialogTitle>
				<DialogContent sx={{ pt: 3 }}>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
						<TextField
							label="Group Key"
							value={formData.key}
							onChange={(e) =>
								setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })
							}
							required
							placeholder="my_group"
							helperText={errors.key || "Unique identifier (lowercase, numbers, underscores only)"}
							error={!!errors.key}
							fullWidth
							slotProps={{
								input: {
									sx: { fontFamily: '"JetBrains Mono", monospace', fontSize: "0.875rem" },
								},
								htmlInput: {
									maxLength: 100,
								},
							}}
						/>

						<TextField
							label="Display Name"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							required
							placeholder="My Group"
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
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							placeholder="Describe the purpose of this group"
							helperText={errors.description || "Optional: Helps organize and identify related flags"}
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
						disabled={
							!!errors.key ||
							!!errors.name ||
							!!errors.description ||
							!formData.key ||
							!formData.name ||
							createGroup.isPending
						}
						sx={{
							minWidth: 160,
							backgroundColor: "#0614BA",
							"&:hover": {
								backgroundColor: "#04dfd5",
							},
						}}
					>
						{createGroup.isPending ? "Creating..." : "Create Group"}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

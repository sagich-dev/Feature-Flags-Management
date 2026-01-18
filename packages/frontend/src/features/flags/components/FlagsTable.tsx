import { DeleteOutlineOutlined, EditOutlined, FlagOutlined, SearchOffOutlined } from "@mui/icons-material";
import {
	Box,
	Chip,
	IconButton,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
} from "@mui/material";
import { useState } from "react";
import { useDeleteFlag, useToggleFlag } from "../api/mutations";
import { envHeaderBorderColors, envHeaderColors, envIcons } from "../styles/environmentStyles";
import type { Environment, Flag, Group } from "../types";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { FlagFormDialog } from "./FlagFormDialog";
import { ProductionConfirmDialog } from "./ProductionConfirmDialog";

interface FlagsTableProps {
	flags: Flag[];
	groups: Group[];
	searchQuery: string;
	selectedGroup: string | null;
	selectedEnvironments: Environment[];
}

export function FlagsTable({ flags, groups, searchQuery, selectedGroup, selectedEnvironments }: FlagsTableProps) {
	const toggleFlag = useToggleFlag();
	const deleteFlag = useDeleteFlag();

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [flagToDelete, setFlagToDelete] = useState<string | null>(null);

	// Production toggle confirmation state
	const [prodConfirmOpen, setProdConfirmOpen] = useState(false);
	const [prodToggleFlag, setProdToggleFlag] = useState<Flag | null>(null);

	// Edit flag dialog state
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [flagToEdit, setFlagToEdit] = useState<Flag | null>(null);

	const filteredFlags = flags.filter((flag) => {
		const matchesSearch =
			searchQuery === "" ||
			flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
			flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			flag.description.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesGroup =
			selectedGroup === null || selectedGroup === "ungrouped"
				? selectedGroup === "ungrouped"
					? flag.groupKey === null
					: true
				: flag.groupKey === selectedGroup;

		return matchesSearch && matchesGroup;
	});

	const handleToggle = (flag: Flag, environment: Environment, currentValue: boolean) => {
		// Intercept production toggles for confirmation
		if (environment === "prod") {
			setProdToggleFlag(flag);
			setProdConfirmOpen(true);
			return;
		}

		toggleFlag.mutate({
			key: flag.key,
			input: {
				environment,
				value: !currentValue,
			},
		});
	};

	const handleProdToggleConfirm = async () => {
		if (prodToggleFlag) {
			const currentValue = getFlagValue(prodToggleFlag, "prod");
			await toggleFlag.mutateAsync({
				key: prodToggleFlag.key,
				input: {
					environment: "prod",
					value: !currentValue,
				},
			});
			setProdConfirmOpen(false);
			setProdToggleFlag(null);
		}
	};

	const getFlagValue = (flag: Flag, environment: Environment): boolean => {
		const override = flag.overrides[environment];
		return override !== undefined ? override : flag.defaultValue;
	};

	const getGroupName = (groupKey: string | null): string | null => {
		if (!groupKey) return null;
		const group = groups.find((g) => g.key === groupKey);
		return group?.name ?? groupKey;
	};

	const handleEditClick = (flag: Flag) => {
		setFlagToEdit(flag);
		setEditDialogOpen(true);
	};

	const handleDeleteClick = (flagKey: string) => {
		setFlagToDelete(flagKey);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (flagToDelete) {
			await deleteFlag.mutateAsync(flagToDelete);
			setDeleteDialogOpen(false);
			setFlagToDelete(null);
		}
	};

	if (filteredFlags.length === 0) {
		const isFiltered = searchQuery || selectedGroup;
		return (
			<Box
				sx={{
					textAlign: "center",
					py: 16,
					px: 4,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					minHeight: 450,
				}}
			>
				<Box
					sx={{
						width: 80,
						height: 80,
						borderRadius: "20px",
						backgroundColor: isFiltered ? "rgba(100, 116, 139, 0.08)" : "rgba(30, 58, 95, 0.08)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						mb: 3,
					}}
				>
					{isFiltered ? (
						<SearchOffOutlined sx={{ fontSize: 40, color: "text.muted" }} />
					) : (
						<FlagOutlined sx={{ fontSize: 40, color: "primary.main" }} />
					)}
				</Box>
				<Typography
					variant="h6"
					sx={{
						fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
						fontWeight: 700,
						color: "text.primary",
						mb: 1.5,
						fontSize: "1.125rem",
					}}
				>
					{isFiltered ? "No flags match your filters" : "No flags yet"}
				</Typography>
				<Typography
					variant="body2"
					sx={{
						color: "text.secondary",
						maxWidth: 380,
						lineHeight: 1.7,
						fontSize: "0.9375rem",
					}}
				>
					{isFiltered
						? "Try adjusting your search terms or filters to find what you're looking for"
						: "Get started by creating your first feature flag to control features across environments"}
				</Typography>
			</Box>
		);
	}

	return (
		<>
			<TableContainer>
				<Table stickyHeader>
					<TableHead>
						<TableRow>
							<TableCell
								sx={{
									minWidth: 300,
									fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
									fontWeight: 700,
									fontSize: "0.6875rem",
									textTransform: "uppercase",
									letterSpacing: "0.1em",
									backgroundColor: "#f8fafc",
									borderBottom: "2px solid",
									borderColor: "divider",
									color: "text.secondary",
									py: 1.75,
								}}
							>
								Flag Details
							</TableCell>
							<TableCell
								sx={{
									minWidth: 130,
									fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
									fontWeight: 700,
									fontSize: "0.6875rem",
									textTransform: "uppercase",
									letterSpacing: "0.1em",
									backgroundColor: "#f8fafc",
									borderBottom: "2px solid",
									borderColor: "divider",
									color: "text.secondary",
									py: 1.75,
								}}
							>
								Group
							</TableCell>
							{selectedEnvironments.map((env) => (
								<TableCell
									key={env}
									align="center"
									sx={{
										minWidth: 115,
										fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
										fontWeight: 700,
										fontSize: "0.6875rem",
										textTransform: "uppercase",
										letterSpacing: "0.1em",
										backgroundColor: envHeaderColors[env],
										borderBottom: "2px solid",
										borderColor: envHeaderBorderColors[env],
										position: "relative",
										color: "text.secondary",
										py: 1.75,
									}}
								>
									<Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75 }}>
										{envIcons[env]}
										{env.toUpperCase()}
									</Box>
								</TableCell>
							))}
							<TableCell
								align="center"
								sx={{
									width: 110,
									fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
									fontWeight: 700,
									fontSize: "0.6875rem",
									textTransform: "uppercase",
									letterSpacing: "0.1em",
									backgroundColor: "#f8fafc",
									borderBottom: "2px solid",
									borderColor: "divider",
									color: "text.secondary",
									py: 1.75,
								}}
							></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{filteredFlags.map((flag, index) => (
							<TableRow
								key={flag.key}
								hover
								sx={{
									transition: "all 0.2s ease",
									animation: "fadeIn 0.3s ease-out",
									animationDelay: `${index * 0.02}s`,
									animationFillMode: "both",
									"@keyframes fadeIn": {
										from: { opacity: 0 },
										to: { opacity: 1 },
									},
									"&:hover": {
										backgroundColor: "rgba(30, 58, 95, 0.03)",
										boxShadow: "inset 3px 0 0 0 rgba(30, 58, 95, 0.5)",
									},
								}}
							>
								<TableCell sx={{ py: 2.5 }}>
									<Box>
										<Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1 }}>
											<Typography
												variant="body2"
												sx={{
													fontWeight: 600,
													fontFamily: '"JetBrains Mono", monospace',
													color: "primary.main",
													fontSize: "0.8125rem",
													letterSpacing: "-0.01em",
													backgroundColor: "rgba(30, 58, 95, 0.06)",
													px: 1.25,
													py: 0.5,
													borderRadius: "6px",
												}}
											>
												{flag.key}
											</Typography>
										</Box>
										<Typography
											variant="body2"
											color="text.primary"
											sx={{
												fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
												fontWeight: 600,
												fontSize: "0.9375rem",
												lineHeight: 1.4,
												mb: flag.description ? 0.75 : 0,
											}}
										>
											{flag.name}
										</Typography>
										{flag.description && (
											<Typography
												variant="caption"
												color="text.secondary"
												display="block"
												sx={{
													lineHeight: 1.6,
													maxWidth: 340,
													fontSize: "0.8125rem",
												}}
											>
												{flag.description}
											</Typography>
										)}
									</Box>
								</TableCell>
								<TableCell>
									{flag.groupKey ? (
										<Chip
											label={getGroupName(flag.groupKey)}
											size="small"
											variant="outlined"
											sx={{
												borderColor: "primary.main",
												borderWidth: "1.5px",
												color: "primary.main",
												backgroundColor: "rgba(30, 58, 95, 0.04)",
												fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
												fontWeight: 600,
												fontSize: "0.75rem",
												height: 28,
												transition: "all 0.2s ease",
												"&:hover": {
													backgroundColor: "rgba(30, 58, 95, 0.1)",
													transform: "translateY(-1px)",
													boxShadow: "0 2px 4px rgba(30, 58, 95, 0.12)",
												},
											}}
										/>
									) : (
										<Typography
											variant="caption"
											sx={{
												color: "text.muted",
												fontStyle: "italic",
												fontSize: "0.8125rem",
											}}
										>
											—
										</Typography>
									)}
								</TableCell>
								{selectedEnvironments.map((env) => {
									const value = getFlagValue(flag, env);
									return (
										<TableCell
											key={env}
											align="center"
											sx={{
												backgroundColor: "transparent",
											}}
										>
											<Switch checked={value} onChange={() => handleToggle(flag, env, value)} size="medium" />
										</TableCell>
									);
								})}
								<TableCell align="center">
									<Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
										<Tooltip title="Edit flag" arrow>
											<IconButton
												size="small"
												onClick={() => handleEditClick(flag)}
												sx={{
													color: "primary.main",
													"&:hover": {
														backgroundColor: "rgba(30, 58, 95, 0.08)",
														color: "primary.dark",
													},
												}}
											>
												<EditOutlined sx={{ fontSize: 18 }} />
											</IconButton>
										</Tooltip>
										<Tooltip title="Delete flag" arrow>
											<IconButton
												size="small"
												onClick={() => handleDeleteClick(flag.key)}
												sx={{
													color: "error.main",
													"&:hover": {
														backgroundColor: "rgba(220, 38, 38, 0.08)",
														color: "error.dark",
													},
												}}
											>
												<DeleteOutlineOutlined sx={{ fontSize: 18 }} />
											</IconButton>
										</Tooltip>
									</Box>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<DeleteConfirmDialog
				open={deleteDialogOpen}
				onClose={() => {
					setDeleteDialogOpen(false);
					setFlagToDelete(null);
				}}
				onConfirm={handleDeleteConfirm}
				title="Delete Flag"
				message={`Are you sure you want to delete the flag "${flagToDelete}"? This action cannot be undone.`}
				isDeleting={deleteFlag.isPending}
			/>

			<ProductionConfirmDialog
				open={prodConfirmOpen}
				onClose={() => {
					setProdConfirmOpen(false);
					setProdToggleFlag(null);
				}}
				onConfirm={handleProdToggleConfirm}
				flagKey={prodToggleFlag?.key ?? ""}
				flagName={prodToggleFlag?.name ?? ""}
				currentValue={prodToggleFlag ? getFlagValue(prodToggleFlag, "prod") : false}
				isToggling={toggleFlag.isPending}
			/>

			<FlagFormDialog
				open={editDialogOpen}
				onClose={() => {
					setEditDialogOpen(false);
					setFlagToEdit(null);
				}}
				mode="edit"
				flag={flagToEdit}
			/>
		</>
	);
}

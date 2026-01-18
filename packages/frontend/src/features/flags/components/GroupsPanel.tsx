import {
	DeleteOutlineOutlined,
	FlagOutlined,
	FolderOpenOutlined,
	FolderOutlined,
	InboxOutlined,
} from "@mui/icons-material";
import { Box, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import { useState } from "react";
import { useDeleteGroup } from "../api/mutations";
import type { Environment, Group } from "../types";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface GroupsPanelProps {
	groups: Group[];
	selectedGroup: string | null;
	onSelectGroup: (groupKey: string | null) => void;
	selectedEnvironment: Environment;
}

export function GroupsPanel({ groups, selectedGroup, onSelectGroup }: GroupsPanelProps) {
	const deleteGroup = useDeleteGroup();

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

	const handleDeleteClick = (groupKey: string, e: React.MouseEvent) => {
		e.stopPropagation();
		setGroupToDelete(groupKey);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (groupToDelete) {
			await deleteGroup.mutateAsync(groupToDelete);
			if (selectedGroup === groupToDelete) {
				onSelectGroup(null);
			}
			setDeleteDialogOpen(false);
			setGroupToDelete(null);
		}
	};

	return (
		<>
			<List dense disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
				{/* All Flags */}
				<ListItemButton
					selected={selectedGroup === null}
					onClick={() => onSelectGroup(null)}
					sx={{
						borderRadius: "10px",
						py: 1.5,
						px: 1.5,
						transition: "all 0.2s ease",
						display: "flex",
						alignItems: "center",
						backgroundColor: selectedGroup === null ? "rgba(30, 58, 95, 0.1)" : "transparent",
						border: "1px solid",
						borderColor: selectedGroup === null ? "rgba(30, 58, 95, 0.15)" : "transparent",
						"&.Mui-selected": {
							backgroundColor: "rgba(30, 58, 95, 0.1)",
							borderColor: "rgba(30, 58, 95, 0.15)",
							"&:hover": {
								backgroundColor: "rgba(30, 58, 95, 0.14)",
							},
						},
						"&:hover": {
							backgroundColor: selectedGroup === null ? "rgba(30, 58, 95, 0.14)" : "rgba(30, 58, 95, 0.05)",
							borderColor: selectedGroup === null ? "rgba(30, 58, 95, 0.2)" : "rgba(30, 58, 95, 0.08)",
						},
					}}
				>
					<ListItemIcon sx={{ minWidth: 36 }}>
						<FlagOutlined
							sx={{
								color: selectedGroup === null ? "primary.main" : "text.secondary",
								fontSize: 22,
							}}
						/>
					</ListItemIcon>
					<ListItemText
						primary="All Flags"
						primaryTypographyProps={{
							fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
							fontSize: "0.875rem",
							fontWeight: selectedGroup === null ? 700 : 500,
							color: selectedGroup === null ? "primary.main" : "text.primary",
						}}
					/>
				</ListItemButton>

				{/* Groups */}
				{groups.map((group, index) => {
					const isSelected = selectedGroup === group.key;

					return (
						<ListItemButton
							key={group.key}
							selected={isSelected}
							onClick={() => onSelectGroup(group.key)}
							sx={{
								borderRadius: "10px",
								py: 1.5,
								px: 1.5,
								pr: 1,
								transition: "all 0.2s ease",
								animation: "fadeIn 0.3s ease-out",
								animationDelay: `${index * 0.03}s`,
								animationFillMode: "both",
								display: "flex",
								alignItems: "center",
								"@keyframes fadeIn": {
									from: { opacity: 0, transform: "translateX(-4px)" },
									to: { opacity: 1, transform: "translateX(0)" },
								},
								backgroundColor: isSelected ? "rgba(30, 58, 95, 0.1)" : "transparent",
								border: "1px solid",
								borderColor: isSelected ? "rgba(30, 58, 95, 0.15)" : "transparent",
								"&.Mui-selected": {
									backgroundColor: "rgba(30, 58, 95, 0.1)",
									borderColor: "rgba(30, 58, 95, 0.15)",
									"&:hover": {
										backgroundColor: "rgba(30, 58, 95, 0.14)",
									},
								},
								"&:hover": {
									backgroundColor: isSelected ? "rgba(30, 58, 95, 0.14)" : "rgba(30, 58, 95, 0.05)",
									borderColor: isSelected ? "rgba(30, 58, 95, 0.2)" : "rgba(30, 58, 95, 0.08)",
									"& .delete-btn": {
										opacity: 1,
									},
								},
							}}
						>
							<ListItemIcon sx={{ minWidth: 36 }}>
								{isSelected ? (
									<FolderOpenOutlined
										sx={{
											color: "primary.main",
											fontSize: 22,
										}}
									/>
								) : (
									<FolderOutlined
										sx={{
											color: "text.secondary",
											fontSize: 22,
										}}
									/>
								)}
							</ListItemIcon>
							<ListItemText
								primary={group.name}
								primaryTypographyProps={{
									fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
									fontSize: "0.875rem",
									fontWeight: isSelected ? 700 : 500,
									color: isSelected ? "primary.main" : "text.primary",
								}}
								sx={{
									flex: 1,
									minWidth: 0,
									wordBreak: "break-word",
								}}
							/>
							<Tooltip title="Delete group" arrow>
								<IconButton
									size="small"
									color="error"
									className="delete-btn"
									onClick={(e) => handleDeleteClick(group.key, e)}
									sx={{
										opacity: 0,
										transition: "opacity 0.2s ease",
										p: 0.5,
										"&:hover": {
											backgroundColor: "rgba(220, 38, 38, 0.1)",
										},
									}}
								>
									<DeleteOutlineOutlined sx={{ fontSize: 18 }} />
								</IconButton>
							</Tooltip>
						</ListItemButton>
					);
				})}

				{/* Ungrouped */}
				<ListItemButton
					selected={selectedGroup === "ungrouped"}
					onClick={() => onSelectGroup("ungrouped")}
					sx={{
						borderRadius: "10px",
						py: 1.5,
						px: 1.5,
						pr: 1,
						mt: 1,
						transition: "all 0.2s ease",
						display: "flex",
						alignItems: "center",
						backgroundColor: selectedGroup === "ungrouped" ? "rgba(30, 58, 95, 0.1)" : "transparent",
						border: "1px solid",
						borderColor: selectedGroup === "ungrouped" ? "rgba(30, 58, 95, 0.15)" : "transparent",
						borderStyle: "dashed",
						"&.Mui-selected": {
							backgroundColor: "rgba(30, 58, 95, 0.1)",
							borderColor: "rgba(30, 58, 95, 0.15)",
							borderStyle: "solid",
							"&:hover": {
								backgroundColor: "rgba(30, 58, 95, 0.14)",
							},
						},
						"&:hover": {
							backgroundColor: selectedGroup === "ungrouped" ? "rgba(30, 58, 95, 0.14)" : "rgba(30, 58, 95, 0.05)",
							borderColor: selectedGroup === "ungrouped" ? "rgba(30, 58, 95, 0.2)" : "rgba(30, 58, 95, 0.15)",
						},
					}}
				>
					<ListItemIcon sx={{ minWidth: 36 }}>
						<InboxOutlined
							sx={{
								color: selectedGroup === "ungrouped" ? "primary.main" : "text.muted",
								fontSize: 22,
							}}
						/>
					</ListItemIcon>
					<ListItemText
						primary="Ungrouped"
						primaryTypographyProps={{
							fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
							fontSize: "0.875rem",
							fontWeight: selectedGroup === "ungrouped" ? 700 : 500,
							color: selectedGroup === "ungrouped" ? "primary.main" : "text.secondary",
							fontStyle: "italic",
						}}
						sx={{
							flex: 1,
							minWidth: 0,
						}}
					/>
					{/* Spacer to match delete button width in group items */}
					<Box
						sx={{
							width: 32,
							height: 32,
							flexShrink: 0,
						}}
					/>
				</ListItemButton>
			</List>

			<DeleteConfirmDialog
				open={deleteDialogOpen}
				onClose={() => {
					setDeleteDialogOpen(false);
					setGroupToDelete(null);
				}}
				onConfirm={handleDeleteConfirm}
				title="Delete Group"
				message={`Are you sure you want to delete the group "${groupToDelete}"? Flags in this group will be moved to "Ungrouped".`}
				isDeleting={deleteGroup.isPending}
			/>
		</>
	);
}

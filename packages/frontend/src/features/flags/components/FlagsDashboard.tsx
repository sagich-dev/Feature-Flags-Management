import { AddOutlined, KeyboardArrowUpOutlined, PublishOutlined, SearchOutlined } from "@mui/icons-material";
import {
	Box,
	Button,
	CircularProgress,
	FormControl,
	IconButton,
	InputAdornment,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { TableSkeleton } from "@/shared/components/Skeleton";
import { CURRENT_ENVIRONMENT } from "@/shared/constants";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useKeyboardShortcuts } from "@/shared/hooks/useKeyboardShortcuts";
import { useFlags, useGroups } from "../api/queries";
import { useFeatureFlag } from "../hooks/useFeatureFlag";
import { ENVIRONMENTS, type Environment } from "../types";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { FlagFormDialog } from "./FlagFormDialog";
import { FlagsTable } from "./FlagsTable";
import { GroupsPanel } from "./GroupsPanel";
import { PromoteDialog } from "./PromoteDialog";

export default function FlagsDashboard() {
	const { data: flags, isLoading: flagsLoading, error: flagsError } = useFlags();
	const { data: groups, isLoading: groupsLoading } = useGroups();

	// Feature flag to control Promote button visibility
	const { enabled: promoteEnabled } = useFeatureFlag("enable_promote_environment", CURRENT_ENVIRONMENT);
	const [selectedEnvironments, setSelectedEnvironments] = useState<Environment[]>(["dev"]);
	const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearchQuery = useDebounce(searchQuery, 300);
	const [createFlagOpen, setCreateFlagOpen] = useState(false);
	const [createGroupOpen, setCreateGroupOpen] = useState(false);
	const [promoteOpen, setPromoteOpen] = useState(false);

	// Scroll to top functionality
	const [showScrollTop, setShowScrollTop] = useState(false);
	const tableContainerRef = useRef<HTMLDivElement>(null);

	// Keyboard shortcuts
	useKeyboardShortcuts(
		[
			{
				key: "n",
				ctrlKey: true,
				metaKey: true,
				handler: (e) => {
					e.preventDefault();
					setCreateFlagOpen(true);
				},
			},
		],
		!createFlagOpen && !createGroupOpen && !promoteOpen
	);

	const handleScroll = useCallback(() => {
		if (tableContainerRef.current) {
			const { scrollTop } = tableContainerRef.current;
			setShowScrollTop(scrollTop > 200);
		}
	}, []);

	const scrollToTop = useCallback(() => {
		if (tableContainerRef.current) {
			tableContainerRef.current.scrollTo({
				top: 0,
				behavior: "smooth",
			});
		}
	}, []);

	useEffect(() => {
		const container = tableContainerRef.current;
		if (container) {
			container.addEventListener("scroll", handleScroll);
			return () => container.removeEventListener("scroll", handleScroll);
		}
		return undefined;
	}, [handleScroll]);

	if (flagsLoading || groupsLoading) {
		return (
			<Box sx={{ minHeight: "100%" }}>
				{/* Header skeleton */}
				<Box
					sx={{
						borderBottom: "1px solid",
						borderColor: "divider",
						bgcolor: "background.paper",
						px: { xs: 2, sm: 3, md: 4 },
						py: { xs: 2, sm: 2.5 },
					}}
				>
					<Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
						<CircularProgress size={24} thickness={4} />
						<Typography variant="body2" color="text.secondary" fontWeight={500}>
							Loading flags...
						</Typography>
					</Box>
				</Box>
				{/* Content skeleton */}
				<Box sx={{ p: 4 }}>
					<TableSkeleton rows={8} columns={6} />
				</Box>
			</Box>
		);
	}

	if (flagsError) {
		return (
			<Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px" gap={2}>
				<Box
					sx={{
						width: 64,
						height: 64,
						borderRadius: "16px",
						backgroundColor: "error.bg",
						border: "2px solid",
						borderColor: "error.main",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						mb: 1,
					}}
				>
					<Typography variant="h4" color="error.main">
						!
					</Typography>
				</Box>
				<Typography color="error.main" fontWeight={600}>
					{flagsError instanceof Error ? flagsError.message : "Failed to load flags"}
				</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ minHeight: "100%" }}>
			{/* Header with actions */}
			<Box
				component="header"
				sx={{
					borderBottom: "1px solid",
					borderColor: "divider",
					bgcolor: "background.paper",
					px: 4,
					py: 2.5,
					boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
				}}
			>
				<Stack
					direction="row"
					spacing={3}
					alignItems="center"
					justifyContent="space-between"
					flexWrap="wrap"
					useFlexGap
				>
					{/* Environment selector and search */}
					<Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
						<FormControl
							size="small"
							sx={{
								minWidth: 200,
								"& .MuiOutlinedInput-root": {
									backgroundColor: "#ffffff",
									fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
									"&:hover .MuiOutlinedInput-notchedOutline": {
										borderColor: "primary.light",
									},
									"&.Mui-focused": {
										boxShadow: "0 0 0 3px rgba(30, 58, 95, 0.08)",
									},
								},
							}}
						>
							<InputLabel id="environment-select-label">Environments</InputLabel>
							<Select
								labelId="environment-select-label"
								id="environment-select"
								multiple
								value={selectedEnvironments}
								label="Environments"
								onChange={(e) => {
									const value = e.target.value;
									const newSelection = (typeof value === "string" ? value.split(",") : value) as Environment[];
									// Ensure at least one environment is selected
									if (newSelection.length > 0) {
										setSelectedEnvironments(newSelection);
									} else {
										// Fallback: if somehow all are deselected, keep the first one
										setSelectedEnvironments([ENVIRONMENTS[0]]);
									}
								}}
								renderValue={(selected) => {
									if ((selected as Environment[]).length === 0) {
										return "Select environments";
									}
									return (selected as Environment[]).map((env) => env.toUpperCase()).join(", ");
								}}
								aria-label="Select environments to compare"
							>
								{ENVIRONMENTS.map((env) => (
									<MenuItem key={env} value={env}>
										{env.toUpperCase()}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<TextField
							size="small"
							placeholder="Search flags..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							aria-label="Search flags by name, key, or description"
							slotProps={{
								input: {
									startAdornment: (
										<InputAdornment position="start">
											<SearchOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
										</InputAdornment>
									),
								},
							}}
							sx={{
								minWidth: 800,
								"& .MuiOutlinedInput-root": {
									backgroundColor: "#ffffff",
									fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
									"&:hover .MuiOutlinedInput-notchedOutline": {
										borderColor: "primary.light",
									},
									"&.Mui-focused": {
										boxShadow: "0 0 0 3px rgba(30, 58, 95, 0.08)",
									},
								},
							}}
						/>
					</Stack>

					{/* Action buttons */}
					<Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
						<Button
							variant="outlined"
							size="medium"
							onClick={() => setCreateGroupOpen(true)}
							aria-label="Create new group"
							startIcon={<AddOutlined />}
							sx={{
								borderColor: "divider",
								color: "text.secondary",
								fontWeight: 600,
								"&:hover": {
									borderColor: "primary.main",
									backgroundColor: "rgba(30, 58, 95, 0.04)",
									color: "primary.main",
								},
							}}
						>
							New Group
						</Button>
						<Button
							variant="outlined"
							size="medium"
							onClick={() => setCreateFlagOpen(true)}
							aria-label="Create new flag"
							startIcon={<AddOutlined />}
							sx={{
								borderColor: "divider",
								color: "text.secondary",
								fontWeight: 600,
								"&:hover": {
									borderColor: "primary.main",
									backgroundColor: "rgba(30, 58, 95, 0.04)",
									color: "primary.main",
								},
							}}
						>
							New Flag
						</Button>
						{promoteEnabled && (
							<Button
								variant="outlined"
								size="medium"
								onClick={() => setPromoteOpen(true)}
								aria-label="Promote flags between environments"
								startIcon={<PublishOutlined />}
								sx={{
									borderColor: "divider",
									color: "text.secondary",
									fontWeight: 600,
									"&:hover": {
										borderColor: "primary.main",
										backgroundColor: "rgba(30, 58, 95, 0.04)",
										color: "primary.main",
									},
								}}
							>
								Promote
							</Button>
						)}
					</Stack>
				</Stack>
			</Box>

			{/* Main content with sidebar */}
			<Box
				sx={{
					display: "flex",
					minHeight: "calc(100vh - 140px)",
				}}
			>
				{/* Groups sidebar */}
				<Box
					component="aside"
					aria-label="Groups filter"
					sx={{
						width: 260,
						flexShrink: 0,
						borderRight: "1px solid",
						borderColor: "divider",
						bgcolor: "background.paper",
						p: 2,
						overflowY: "auto",
					}}
				>
					<Typography
						variant="overline"
						sx={{
							display: "block",
							mb: 1.5,
							color: "text.secondary",
							fontWeight: 700,
							letterSpacing: "0.1em",
							fontSize: "0.6875rem",
						}}
					>
						Groups
					</Typography>
					<GroupsPanel
						groups={groups ?? []}
						selectedGroup={selectedGroup}
						onSelectGroup={setSelectedGroup}
						selectedEnvironment={selectedEnvironments[0] || "dev"}
					/>
				</Box>

				{/* Flags table */}
				<Box
					component="section"
					aria-label="Feature flags table"
					ref={tableContainerRef}
					sx={{
						flex: 1,
						bgcolor: "background.paper",
						overflow: "auto",
						position: "relative",
					}}
				>
					<FlagsTable
						flags={flags ?? []}
						groups={groups ?? []}
						searchQuery={debouncedSearchQuery}
						selectedGroup={selectedGroup}
						selectedEnvironments={selectedEnvironments}
					/>
				</Box>
			</Box>

			{/* Scroll to top button */}
			<Tooltip title="Scroll to top" placement="left">
				<IconButton
					onClick={scrollToTop}
					aria-label="Scroll to top"
					sx={{
						position: "fixed",
						bottom: 24,
						right: 24,
						width: 44,
						height: 44,
						borderRadius: "12px",
						backgroundColor: "primary.main",
						color: "white",
						boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.2), 0 4px 6px -4px rgba(15, 23, 42, 0.1)",
						opacity: showScrollTop ? 1 : 0,
						visibility: showScrollTop ? "visible" : "hidden",
						transform: showScrollTop ? "translateY(0)" : "translateY(16px)",
						transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
						zIndex: 1000,
						"&:hover": {
							backgroundColor: "primary.dark",
							transform: "translateY(-2px)",
							boxShadow: "0 20px 25px -5px rgba(15, 23, 42, 0.25), 0 8px 10px -6px rgba(15, 23, 42, 0.15)",
						},
						"&:active": {
							transform: "translateY(0)",
						},
					}}
				>
					<KeyboardArrowUpOutlined />
				</IconButton>
			</Tooltip>

			{/* Dialogs */}
			<FlagFormDialog open={createFlagOpen} onClose={() => setCreateFlagOpen(false)} mode="create" />
			<CreateGroupDialog open={createGroupOpen} onClose={() => setCreateGroupOpen(false)} />
			<PromoteDialog open={promoteOpen} onClose={() => setPromoteOpen(false)} />
		</Box>
	);
}

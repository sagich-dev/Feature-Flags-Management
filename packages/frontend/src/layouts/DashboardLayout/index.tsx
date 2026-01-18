import { Box } from "@mui/material";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router-dom";
import { ErrorFallback } from "@/shared/components/Dialog/ErrorDialog";

function DashboardLayout() {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
				bgcolor: "background.default",
			}}
		>
			{/* Skip link for accessibility */}
			<Box
				component="a"
				href="#main-content"
				sx={{
					position: "absolute",
					top: "-40px",
					left: 0,
					backgroundColor: "primary.main",
					color: "white",
					padding: "8px 16px",
					textDecoration: "none",
					zIndex: 10000,
					"&:focus": {
						top: 0,
					},
				}}
			>
				Skip to main content
			</Box>

			{/* Header */}
			<Box
				component="header"
				sx={{
					px: { xs: 2, sm: 3, md: 4 },
					py: 2,
					borderBottom: "1px solid",
					borderColor: "rgba(226, 232, 240, 0.8)",
					display: "flex",
					alignItems: "center",
					gap: 3,
				}}
			>
				<Box
					component="img"
					src="/moodify-logo.svg"
					alt="Moodify"
					sx={{
						height: 33,
						width: "auto",
						display: "block",
					}}
				/>
			</Box>

			<ErrorBoundary FallbackComponent={ErrorFallback}>
				<Box
					component="main"
					id="main-content"
					sx={{
						flexGrow: 1,
						animation: "fadeInUp 0.3s ease-out",
						"@keyframes fadeInUp": {
							from: {
								opacity: 0,
								transform: "translateY(8px)",
							},
							to: {
								opacity: 1,
								transform: "translateY(0)",
							},
						},
					}}
				>
					<Outlet />
				</Box>
			</ErrorBoundary>
		</Box>
	);
}

export default DashboardLayout;

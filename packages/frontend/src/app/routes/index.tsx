import { Box, CircularProgress } from "@mui/material";
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout/index";

const FlagsDashboard = lazy(() => import("@/features/flags/components/FlagsDashboard"));

const ROUTES = {
	ROOT: "/",
} as const;

function LoadingFallback() {
	return (
		<Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
			<CircularProgress />
		</Box>
	);
}

function AllRoutes() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path={ROUTES.ROOT} element={<DashboardLayout />}>
					<Route
						index
						element={
							<Suspense fallback={<LoadingFallback />}>
								<FlagsDashboard />
							</Suspense>
						}
					/>
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default AllRoutes;

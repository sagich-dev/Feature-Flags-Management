import { BrowserRouter, Route, Routes } from "react-router-dom";
import DemoPage from "@/app/pages/DemoPage";

export const ROUTES = {
	ROOT: "/",
	NOT_FOUND: "*",
} as const;

function NotFoundPage() {
	return (
		<div style={{ padding: 24 }}>
			<h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Page not found</h1>
			<p>The page you are looking for does not exist.</p>
		</div>
	);
}

export default function AppRoutes() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path={ROUTES.ROOT} element={<DemoPage />} />
				<Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
			</Routes>
		</BrowserRouter>
	);
}

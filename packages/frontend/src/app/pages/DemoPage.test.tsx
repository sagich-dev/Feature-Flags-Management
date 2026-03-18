import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import DemoPage from "./DemoPage";

function renderWithProviders() {
	const queryClient = new QueryClient();

	return render(
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<DemoPage />
			</BrowserRouter>
		</QueryClientProvider>
	);
}

describe("DemoPage", () => {
	it("renders mocked health and example responses", async () => {
		renderWithProviders();

		await waitFor(() => {
			expect(screen.getByText("GET /api/health")).toBeInTheDocument();
			expect(screen.getByText("GET /api/example")).toBeInTheDocument();
		});
	});
});

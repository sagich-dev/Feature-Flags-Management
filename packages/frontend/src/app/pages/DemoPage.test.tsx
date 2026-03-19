import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import DemoPage from "./DemoPage";

function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0,
			},
		},
	});
}

function renderWithProviders(queryClient: QueryClient) {
	return render(
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<DemoPage />
			</BrowserRouter>
		</QueryClientProvider>
	);
}

describe("DemoPage", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = createTestQueryClient();
	});

	afterEach(() => {
		queryClient.clear();
	});

	it("renders mocked health and example responses", async () => {
		renderWithProviders(queryClient);

		await waitFor(() => {
			expect(screen.getByText("GET /api/health")).toBeInTheDocument();
			expect(screen.getByText("GET /api/example")).toBeInTheDocument();
		});
	});

	it("displays response data correctly", async () => {
		renderWithProviders(queryClient);

		await waitFor(() => {
			expect(screen.getByText(/ok.*true/i)).toBeInTheDocument();
			expect(screen.getByText(/Hello from MSW/i)).toBeInTheDocument();
		});
	});
});

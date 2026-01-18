import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 10, // 10 minutes
			gcTime: 1000 * 60 * 30, // 30 minutes
			refetchOnWindowFocus: false, // Don't refetch on tab switch
			refetchOnMount: false, // Use cache if available
			refetchOnReconnect: true, // Only refetch if offline
			structuralSharing: true, // Enable structural sharing (default but explicit)
			placeholderData: (previousData: unknown) => previousData, // Keep old data visible during fetch
			retry: (failureCount, error) => {
				// Don't retry on 4xx errors
				if (error instanceof Error && "status" in error && typeof error.status === "number") {
					if (error.status >= 400 && error.status < 500) {
						return false;
					}
				}
				return failureCount < 3;
			},
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		},
		mutations: {
			retry: 1,
			retryDelay: (attemptIndex) => 1000 * 2 ** attemptIndex,
		},
	},
});

export default function QueryProvider({ children }: { children: ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
		</QueryClientProvider>
	);
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { ApiError } from "@/shared/api/http";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5,
			gcTime: 1000 * 60 * 10,
			refetchOnWindowFocus: false,
			refetchOnReconnect: true,
			retry: (failureCount, error) => {
				if (error instanceof ApiError && error.status && error.status >= 400 && error.status < 500) {
					return false;
				}
				return failureCount < 3;
			},
			throwOnError: false,
		},
		mutations: {
			retry: 1,
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

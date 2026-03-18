import { queryOptions, useQuery } from "@tanstack/react-query";
import { getDemo, getHealth } from "@/shared/api/demo";

export const demoQueryKeys = {
	health: () => ["health"] as const,
	demo: () => ["demo"] as const,
} as const;

export function useHealthQuery() {
	return useQuery({
		...queryOptions({
			queryKey: demoQueryKeys.health(),
			queryFn: getHealth,
		}),
	});
}

export function useDemoQuery() {
	return useQuery({
		...queryOptions({
			queryKey: demoQueryKeys.demo(),
			queryFn: getDemo,
		}),
	});
}

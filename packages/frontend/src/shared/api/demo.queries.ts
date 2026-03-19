import { useQuery } from "@tanstack/react-query";
import { getDemo, getHealth } from "@/shared/api/demo";

export const demoQueryKeys = {
	health: () => ["health"] as const,
	demo: () => ["demo"] as const,
} as const;

export function useHealthQuery() {
	return useQuery({
		queryKey: demoQueryKeys.health(),
		queryFn: getHealth,
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5, // 5 minutes
	});
}

export function useDemoQuery() {
	return useQuery({
		queryKey: demoQueryKeys.demo(),
		queryFn: getDemo,
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes
	});
}

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
	});
}

export function useDemoQuery() {
	return useQuery({
		queryKey: demoQueryKeys.demo(),
		queryFn: getDemo,
	});
}

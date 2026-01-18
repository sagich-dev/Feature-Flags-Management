import { useQuery } from "@tanstack/react-query";
import * as flagsApi from "./flagsApi";

export const queryKeys = {
	flags: ["flags"] as const,
	groups: ["groups"] as const,
};

export function useFlags() {
	return useQuery({
		queryKey: queryKeys.flags,
		queryFn: flagsApi.getAllFlags,
	});
}

export function useGroups() {
	return useQuery({
		queryKey: queryKeys.groups,
		queryFn: flagsApi.getAllGroups,
	});
}

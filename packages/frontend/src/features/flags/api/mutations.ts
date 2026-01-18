import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { CreateFlagInput, CreateGroupInput, PromoteInput, ToggleFlagInput, UpdateFlagInput } from "../types";
import * as flagsApi from "./flagsApi";
import { queryKeys } from "./queries";

export function useCreateFlag() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateFlagInput) => flagsApi.createFlag(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.flags });
			toast.success("Flag created successfully");
		},
		onError: (error) => {
			toast.error(`Failed to create flag: ${error instanceof Error ? error.message : "Unknown error"}`);
		},
	});
}

export function useUpdateFlag() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ key, input }: { key: string; input: UpdateFlagInput }) => flagsApi.updateFlag(key, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.flags });
			toast.success("Flag updated successfully");
		},
		onError: (error) => {
			toast.error(`Failed to update flag: ${error instanceof Error ? error.message : "Unknown error"}`);
		},
	});
}

export function useToggleFlag() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ key, input }: { key: string; input: ToggleFlagInput }) => flagsApi.toggleFlag(key, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.flags });
		},
		onError: (error) => {
			toast.error(`Failed to toggle flag: ${error instanceof Error ? error.message : "Unknown error"}`);
		},
	});
}

export function useDeleteFlag() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (key: string) => flagsApi.deleteFlag(key),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.flags });
			toast.success("Flag deleted successfully");
		},
		onError: (error) => {
			toast.error(`Failed to delete flag: ${error instanceof Error ? error.message : "Unknown error"}`);
		},
	});
}

export function useCreateGroup() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateGroupInput) => flagsApi.createGroup(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.groups });
			toast.success("Group created successfully");
		},
		onError: (error) => {
			toast.error(`Failed to create group: ${error instanceof Error ? error.message : "Unknown error"}`);
		},
	});
}

export function useDeleteGroup() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (key: string) => flagsApi.deleteGroup(key),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.groups });
			queryClient.invalidateQueries({ queryKey: queryKeys.flags });
			toast.success("Group deleted successfully");
		},
		onError: (error) => {
			toast.error(`Failed to delete group: ${error instanceof Error ? error.message : "Unknown error"}`);
		},
	});
}

export function usePromoteEnvironment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: PromoteInput) => flagsApi.promoteEnvironment(input),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.flags });
			toast.success(data.message);
		},
		onError: (error) => {
			toast.error(`Failed to promote environment: ${error instanceof Error ? error.message : "Unknown error"}`);
		},
	});
}

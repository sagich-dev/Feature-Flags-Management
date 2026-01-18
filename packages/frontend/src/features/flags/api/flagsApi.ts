import { z } from "zod";
import { apiClient } from "@/shared/api/apiClient";
import {
	apiResponseSchema,
	type CreateFlagInput,
	type CreateGroupInput,
	createFlagSchema,
	createGroupSchema,
	type Flag,
	flagSchema,
	type Group,
	groupSchema,
	type PromoteInput,
	type PromoteResult,
	promoteResultSchema,
	promoteSchema,
	type ToggleFlagInput,
	toggleFlagSchema,
	type UpdateFlagInput,
	updateFlagSchema,
} from "../schemas";

const API_BASE_URL = "/flags";

// Flag API - all requests validated with Zod schemas
export async function getAllFlags(): Promise<Flag[]> {
	const responseSchema = apiResponseSchema(z.array(flagSchema));
	const response = await apiClient.get(responseSchema, API_BASE_URL);
	return response.data;
}

export async function createFlag(input: CreateFlagInput): Promise<Flag> {
	// Validate input before sending (apiClient.post also validates, but we validate explicitly for better error handling)
	const validatedInput = createFlagSchema.parse(input);
	const responseSchema = apiResponseSchema(flagSchema);
	const response = await apiClient.post(responseSchema, API_BASE_URL, validatedInput);
	return response.data;
}

export async function updateFlag(key: string, input: UpdateFlagInput): Promise<Flag> {
	// Validate input before sending
	const validatedInput = updateFlagSchema.parse(input);
	const responseSchema = apiResponseSchema(flagSchema);
	const response = await apiClient.patch(responseSchema, `${API_BASE_URL}/${key}`, validatedInput);
	return response.data;
}

export async function toggleFlag(key: string, input: ToggleFlagInput): Promise<Flag> {
	// Validate input before sending
	const validatedInput = toggleFlagSchema.parse(input);
	const responseSchema = apiResponseSchema(flagSchema);
	const response = await apiClient.post(responseSchema, `${API_BASE_URL}/${key}/toggle`, validatedInput);
	return response.data;
}

export async function deleteFlag(key: string): Promise<void> {
	// DELETE requests typically return 204 No Content or an empty response
	// For 204 responses, the API client constructs { success: true, data: undefined }
	const responseSchema = apiResponseSchema(z.undefined());
	await apiClient.delete(responseSchema, `${API_BASE_URL}/${key}`);
}

// Group API - all requests validated with Zod schemas
export async function getAllGroups(): Promise<Group[]> {
	const responseSchema = apiResponseSchema(z.array(groupSchema));
	const response = await apiClient.get(responseSchema, `${API_BASE_URL}/groups`);
	return response.data;
}

export async function createGroup(input: CreateGroupInput): Promise<Group> {
	// Validate input before sending
	const validatedInput = createGroupSchema.parse(input);
	const responseSchema = apiResponseSchema(groupSchema);
	const response = await apiClient.post(responseSchema, `${API_BASE_URL}/groups`, validatedInput);
	return response.data;
}

export async function deleteGroup(key: string): Promise<void> {
	// DELETE requests typically return 204 No Content or an empty response
	// For 204 responses, the API client constructs { success: true, data: undefined }
	const responseSchema = apiResponseSchema(z.undefined());
	await apiClient.delete(responseSchema, `${API_BASE_URL}/groups/${key}`);
}

// Promote API - all requests validated with Zod schemas
export async function promoteEnvironment(input: PromoteInput): Promise<PromoteResult> {
	// Validate input before sending
	const validatedInput = promoteSchema.parse(input);
	const responseSchema = apiResponseSchema(promoteResultSchema);
	const response = await apiClient.post(responseSchema, `${API_BASE_URL}/promote`, validatedInput);
	return response.data;
}

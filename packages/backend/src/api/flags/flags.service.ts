import { StatusCodes } from "http-status-codes";
import { HttpError } from "@/common/errors/http.error";
import type {
	CreateFlagInput,
	CreateGroupInput,
	Environment,
	Flag,
	FlagChangeInfo,
	FlagWithValue,
	Group,
	PromoteInput,
	PromoteResponse,
	ToggleFlagInput,
	ToggleGroupInput,
	UpdateFlagInput,
	UpdateGroupInput,
} from "./flags.schema";
import { ENVIRONMENTS } from "./flags.schema";
import { flagStore, groupStore } from "./flags.store";

// Flag services
export function getAllFlags(): Flag[] {
	return flagStore.getAll();
}

export function getFlagByKey(key: string, environment?: Environment): Flag | FlagWithValue {
	const flag = flagStore.getByKey(key);
	if (!flag) {
		throw new HttpError(`Flag '${key}' not found`, StatusCodes.NOT_FOUND);
	}

	if (environment) {
		const value = flagStore.getValue(key, environment);
		return {
			...flag,
			value: value ?? flag.defaultValue,
			environment,
		};
	}

	return flag;
}

export function checkFlag(key: string, environment: Environment): boolean {
	const value = flagStore.getValue(key, environment);
	if (value === undefined) {
		throw new HttpError(`Flag '${key}' not found`, StatusCodes.NOT_FOUND);
	}
	return value;
}

export function createFlag(input: CreateFlagInput): Flag {
	const existing = flagStore.getByKey(input.key);
	if (existing) {
		throw new HttpError(`Flag '${input.key}' already exists`, StatusCodes.CONFLICT);
	}

	if (input.groupKey) {
		const group = groupStore.getByKey(input.groupKey);
		if (!group) {
			throw new HttpError(`Group '${input.groupKey}' not found`, StatusCodes.BAD_REQUEST);
		}
	}

	const now = new Date();
	const flag: Flag = {
		key: input.key,
		name: input.name,
		description: input.description ?? "",
		defaultValue: input.defaultValue ?? false,
		groupKey: input.groupKey ?? null,
		overrides: {
			dev: undefined,
			qa: undefined,
			staging: undefined,
			prod: undefined,
		},
		createdAt: now,
		updatedAt: now,
	};

	return flagStore.create(flag);
}

export function updateFlag(key: string, input: UpdateFlagInput): Flag {
	const flag = flagStore.getByKey(key);
	if (!flag) {
		throw new HttpError(`Flag '${key}' not found`, StatusCodes.NOT_FOUND);
	}

	if (input.groupKey !== undefined && input.groupKey !== null) {
		const group = groupStore.getByKey(input.groupKey);
		if (!group) {
			throw new HttpError(`Group '${input.groupKey}' not found`, StatusCodes.BAD_REQUEST);
		}
	}

	// Build update object with only defined values
	const updates: Partial<Flag> = {};
	if (input.name !== undefined) updates.name = input.name;
	if (input.description !== undefined) updates.description = input.description;
	if (input.defaultValue !== undefined) updates.defaultValue = input.defaultValue;
	if (input.groupKey !== undefined) updates.groupKey = input.groupKey;

	const updatedFlag = flagStore.update(key, updates);

	if (!updatedFlag) {
		throw new HttpError(`Failed to update flag '${key}'`, StatusCodes.INTERNAL_SERVER_ERROR);
	}

	return updatedFlag;
}

export function toggleFlag(key: string, input: ToggleFlagInput): Flag {
	const flag = flagStore.getByKey(key);
	if (!flag) {
		throw new HttpError(`Flag '${key}' not found`, StatusCodes.NOT_FOUND);
	}

	const updatedFlag = flagStore.setOverride(key, input.environment, input.value);
	if (!updatedFlag) {
		throw new HttpError(`Failed to toggle flag '${key}'`, StatusCodes.INTERNAL_SERVER_ERROR);
	}

	return updatedFlag;
}

export function resetFlagToDefault(key: string, environment: Environment): Flag {
	const flag = flagStore.getByKey(key);
	if (!flag) {
		throw new HttpError(`Flag '${key}' not found`, StatusCodes.NOT_FOUND);
	}

	const updatedFlag = flagStore.resetToDefault(key, environment);
	if (!updatedFlag) {
		throw new HttpError(`Failed to reset flag '${key}'`, StatusCodes.INTERNAL_SERVER_ERROR);
	}

	return updatedFlag;
}

export function deleteFlag(key: string): void {
	const flag = flagStore.getByKey(key);
	if (!flag) {
		throw new HttpError(`Flag '${key}' not found`, StatusCodes.NOT_FOUND);
	}

	flagStore.delete(key);
}

// Group services
export function getAllGroups(): Group[] {
	return groupStore.getAll();
}

export function getGroupByKey(key: string): Group {
	const group = groupStore.getByKey(key);
	if (!group) {
		throw new HttpError(`Group '${key}' not found`, StatusCodes.NOT_FOUND);
	}
	return group;
}

export function getGroupWithFlags(key: string): { group: Group; flags: Flag[] } {
	const group = getGroupByKey(key);
	const flags = flagStore.getByGroup(key);
	return { group, flags };
}

export function createGroup(input: CreateGroupInput): Group {
	const existing = groupStore.getByKey(input.key);
	if (existing) {
		throw new HttpError(`Group '${input.key}' already exists`, StatusCodes.CONFLICT);
	}

	const now = new Date();
	const group: Group = {
		key: input.key,
		name: input.name,
		description: input.description ?? "",
		createdAt: now,
		updatedAt: now,
	};

	return groupStore.create(group);
}

export function updateGroup(key: string, input: UpdateGroupInput): Group {
	const group = groupStore.getByKey(key);
	if (!group) {
		throw new HttpError(`Group '${key}' not found`, StatusCodes.NOT_FOUND);
	}

	// Build update object with only defined values
	const updates: Partial<Group> = {};
	if (input.name !== undefined) updates.name = input.name;
	if (input.description !== undefined) updates.description = input.description;

	const updatedGroup = groupStore.update(key, updates);

	if (!updatedGroup) {
		throw new HttpError(`Failed to update group '${key}'`, StatusCodes.INTERNAL_SERVER_ERROR);
	}

	return updatedGroup;
}

export function toggleGroup(key: string, input: ToggleGroupInput): Flag[] {
	const group = groupStore.getByKey(key);
	if (!group) {
		throw new HttpError(`Group '${key}' not found`, StatusCodes.NOT_FOUND);
	}

	return groupStore.toggleAllFlags(key, input.environment, input.value);
}

export function deleteGroup(key: string): void {
	const group = groupStore.getByKey(key);
	if (!group) {
		throw new HttpError(`Group '${key}' not found`, StatusCodes.NOT_FOUND);
	}

	groupStore.delete(key);
}

// Promote service
export function promoteEnvironment(input: PromoteInput): PromoteResponse {
	const flags = flagStore.getAll();

	// Calculate which flags will actually change and their values before promotion
	const changingFlags: FlagChangeInfo[] = flags
		.map((flag) => {
			const sourceValue: boolean = flag.overrides[input.sourceEnvironment] ?? flag.defaultValue;
			const targetValue: boolean = flag.overrides[input.targetEnvironment] ?? flag.defaultValue;
			return { flag, sourceValue, targetValue };
		})
		.filter(({ sourceValue, targetValue }) => sourceValue !== targetValue)
		.map(({ flag, sourceValue, targetValue }) => ({
			key: flag.key,
			name: flag.name,
			currentValue: targetValue,
			newValue: sourceValue,
		}));

	const flagsChanged = changingFlags.length;

	// Perform the promotion
	flagStore.promoteEnvironment(input.sourceEnvironment, input.targetEnvironment);

	return {
		message: `Successfully promoted ${input.sourceEnvironment} to ${input.targetEnvironment}`,
		flagsUpdated: flags.length,
		flagsChanged,
		totalFlags: flags.length,
		changingFlags,
	};
}

// Get all available environments
export function getEnvironments(): readonly string[] {
	return ENVIRONMENTS;
}

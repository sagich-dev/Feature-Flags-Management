import type { Environment, Flag, Group } from "./flags.schema";

// In-memory storage
const flags = new Map<string, Flag>();
const groups = new Map<string, Group>();

// Seed data
const seedFlags: Flag[] = [
	{
		key: "enable_promote_environment",
		name: "Enable Promote Environment",
		description: "Example feature flag for demonstration purposes",
		defaultValue: true,
		groupKey: "dashboard",
		overrides: {
			dev: true,
			qa: true,
			staging: true,
			prod: true,
		},
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		key: "dark_mode",
		name: "Dark Mode",
		description: "Example UI theme feature flag for demonstration",
		defaultValue: true,
		groupKey: "ui",
		overrides: {
			dev: true,
			qa: true,
			staging: true,
			prod: true,
		},
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		key: "new_dashboard",
		name: "New Dashboard",
		description: "Example dashboard redesign flag with mixed environment values",
		defaultValue: false,
		groupKey: "dashboard",
		overrides: {
			dev: true,
			qa: true,
			staging: false,
			prod: false,
		},
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		key: "api_rate_limiting",
		name: "API Rate Limiting",
		description: "Example API configuration flag for demonstration purposes",
		defaultValue: true,
		groupKey: null,
		overrides: {
			dev: false,
			qa: true,
			staging: true,
			prod: true,
		},
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

const seedGroups: Group[] = [
	{
		key: "dashboard",
		name: "Dashboard Features",
		description: "Feature flags related to the dashboard",
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		key: "ui",
		name: "UI Features",
		description: "User interface related feature flags",
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

// Initialize with seed data
function initializeStore(): void {
	for (const group of seedGroups) {
		groups.set(group.key, group);
	}
	for (const flag of seedFlags) {
		flags.set(flag.key, flag);
	}
}

initializeStore();

// Flag operations
export const flagStore = {
	getAll(): Flag[] {
		return Array.from(flags.values());
	},

	getByKey(key: string): Flag | undefined {
		return flags.get(key);
	},

	getByGroup(groupKey: string): Flag[] {
		return Array.from(flags.values()).filter((f) => f.groupKey === groupKey);
	},

	create(flag: Flag): Flag {
		flags.set(flag.key, flag);
		return flag;
	},

	update(key: string, updates: Partial<Flag>): Flag | undefined {
		const flag = flags.get(key);
		if (!flag) return undefined;

		const updatedFlag: Flag = {
			...flag,
			...updates,
			key: flag.key, // Ensure key cannot be changed
			createdAt: flag.createdAt, // Preserve creation date
			updatedAt: new Date(),
		};
		flags.set(key, updatedFlag);
		return updatedFlag;
	},

	setOverride(key: string, environment: Environment, value: boolean): Flag | undefined {
		const flag = flags.get(key);
		if (!flag) return undefined;

		const updatedFlag: Flag = {
			...flag,
			overrides: {
				...flag.overrides,
				[environment]: value,
			},
			updatedAt: new Date(),
		};
		flags.set(key, updatedFlag);
		return updatedFlag;
	},

	resetToDefault(key: string, environment: Environment): Flag | undefined {
		const flag = flags.get(key);
		if (!flag) return undefined;

		const { [environment]: _, ...remainingOverrides } = flag.overrides;
		const updatedFlag: Flag = {
			...flag,
			overrides: remainingOverrides as Record<Environment, boolean | undefined>,
			updatedAt: new Date(),
		};
		flags.set(key, updatedFlag);
		return updatedFlag;
	},

	delete(key: string): boolean {
		return flags.delete(key);
	},

	getValue(key: string, environment: Environment): boolean | undefined {
		const flag = flags.get(key);
		if (!flag) return undefined;

		const override = flag.overrides[environment];
		return override !== undefined ? override : flag.defaultValue;
	},

	promoteEnvironment(sourceEnv: Environment, targetEnv: Environment): void {
		for (const flag of flags.values()) {
			const sourceValue = flag.overrides[sourceEnv];
			if (sourceValue !== undefined) {
				flag.overrides[targetEnv] = sourceValue;
			} else {
				// If source has no override, use default value for target
				flag.overrides[targetEnv] = flag.defaultValue;
			}
			flag.updatedAt = new Date();
		}
	},
};

// Group operations
export const groupStore = {
	getAll(): Group[] {
		return Array.from(groups.values());
	},

	getByKey(key: string): Group | undefined {
		return groups.get(key);
	},

	create(group: Group): Group {
		groups.set(group.key, group);
		return group;
	},

	update(key: string, updates: Partial<Group>): Group | undefined {
		const group = groups.get(key);
		if (!group) return undefined;

		const updatedGroup: Group = {
			...group,
			...updates,
			key: group.key, // Ensure key cannot be changed
			createdAt: group.createdAt, // Preserve creation date
			updatedAt: new Date(),
		};
		groups.set(key, updatedGroup);
		return updatedGroup;
	},

	delete(key: string): boolean {
		// Remove group association from all flags
		for (const flag of flags.values()) {
			if (flag.groupKey === key) {
				flag.groupKey = null;
				flag.updatedAt = new Date();
			}
		}
		return groups.delete(key);
	},

	toggleAllFlags(groupKey: string, environment: Environment, value: boolean): Flag[] {
		const groupFlags = flagStore.getByGroup(groupKey);
		for (const flag of groupFlags) {
			flagStore.setOverride(flag.key, environment, value);
		}
		return flagStore.getByGroup(groupKey);
	},
};

import { useMemo } from "react";
import { useFlags } from "../api/queries";
import type { Environment, Flag } from "../types";

/**
 * Hook to check if a feature flag is enabled for a given environment.
 * Returns the flag value, loading state, and the flag object.
 */
export function useFeatureFlag(flagKey: string, environment: Environment = "prod") {
	const { data: flags, isLoading, error } = useFlags();

	const result = useMemo(() => {
		if (!flags) {
			return { enabled: false, flag: null };
		}

		const flag = flags.find((f) => f.key === flagKey);
		if (!flag) {
			return { enabled: false, flag: null };
		}

		const override = flag.overrides[environment];
		const enabled = override !== undefined ? override : flag.defaultValue;

		return { enabled, flag };
	}, [flags, flagKey, environment]);

	return {
		enabled: result.enabled,
		flag: result.flag as Flag | null,
		isLoading,
		error,
	};
}

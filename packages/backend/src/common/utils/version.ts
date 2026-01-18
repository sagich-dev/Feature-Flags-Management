import { readFileSync } from "node:fs";
import { join } from "node:path";

const getVersionFromPackageJson = (): string => {
	try {
		const packageJsonPath = join(process.cwd(), "package.json");
		const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as {
			version?: string;
		};
		return packageJson.version ?? "unknown";
	} catch {
		return "unknown";
	}
};

export const APP_VERSION = getVersionFromPackageJson();

import { BugReportOutlined, CodeOutlined, RocketLaunchOutlined, ScienceOutlined } from "@mui/icons-material";
import type { Environment } from "../types";

/**
 * Environment icons mapping
 */
export const envIcons: Record<Environment, React.ReactNode> = {
	dev: <CodeOutlined sx={{ fontSize: 16 }} />,
	qa: <BugReportOutlined sx={{ fontSize: 16 }} />,
	staging: <ScienceOutlined sx={{ fontSize: 16 }} />,
	prod: <RocketLaunchOutlined sx={{ fontSize: 16 }} />,
};

/**
 * Environment header background colors
 */
export const envHeaderColors: Record<Environment, string> = {
	dev: "rgba(8, 145, 178, 0.1)",
	qa: "rgba(124, 58, 237, 0.1)",
	staging: "rgba(217, 119, 6, 0.1)",
	prod: "rgba(16, 185, 129, 0.1)",
};

/**
 * Environment header border colors
 */
export const envHeaderBorderColors: Record<Environment, string> = {
	dev: "rgba(8, 145, 178, 0.25)",
	qa: "rgba(124, 58, 237, 0.25)",
	staging: "rgba(217, 119, 6, 0.25)",
	prod: "rgba(16, 185, 129, 0.25)",
};

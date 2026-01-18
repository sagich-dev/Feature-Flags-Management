import type { ReactNode } from "react";
import MuiProvider from "@/app/providers/MuiProvider";
import QueryProvider from "@/app/providers/QueryProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
	return (
		<QueryProvider>
			<MuiProvider>{children}</MuiProvider>
		</QueryProvider>
	);
}

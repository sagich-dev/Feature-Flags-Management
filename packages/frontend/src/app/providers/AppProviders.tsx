import type { ReactNode } from "react";
import QueryProvider from "@/app/providers/QueryProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
	return <QueryProvider>{children}</QueryProvider>;
}

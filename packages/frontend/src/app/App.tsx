import { ErrorBoundary } from "@/app/ErrorBoundary";
import AppProviders from "@/app/providers/AppProviders";
import Routes from "@/app/routes";

export default function App() {
	return (
		<AppProviders>
			<ErrorBoundary>
				<Routes />
			</ErrorBoundary>
		</AppProviders>
	);
}

import { Component, type ReactNode } from "react";
import { isApiError } from "@/shared/api/http";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { error };
	}

	override componentDidCatch(error: Error, errorInfo: unknown) {
		console.error("Unhandled error", error, errorInfo);
	}

	override render() {
		const { error } = this.state;
		const { children, fallback } = this.props;

		if (!error) return children;

		if (fallback) return fallback;

		const baseMessage = isApiError(error) ? error.message : "Something went wrong.";

		return (
			<div style={{ padding: 24 }}>
				<h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
				<p style={{ marginBottom: 8 }}>{baseMessage}</p>
			</div>
		);
	}
}

import { useDemoQuery, useHealthQuery } from "@/shared/api/demo.queries";

export default function DemoPage() {
	const health = useHealthQuery();
	const demo = useDemoQuery();

	const renderStatus = (status: "loading" | "error" | "success", message?: string) => {
		switch (status) {
			case "loading":
				return (
					<output aria-live="polite" style={{ display: "flex", alignItems: "center", gap: 8 }}>
						<div
							style={{
								width: 16,
								height: 16,
								border: "2px solid #e5e7eb",
								borderTop: "2px solid #3b82f6",
								borderRadius: "50%",
								animation: "spin 1s linear infinite",
							}}
						/>
						<span>Loading…</span>
					</output>
				);
			case "error":
				return (
					<div role="alert" style={{ color: "#b91c1c", display: "flex", alignItems: "center", gap: 8 }}>
						<span>⚠️</span>
						<span>{message || "An error occurred"}</span>
					</div>
				);
			case "success":
				return null;
		}
	};

	return (
		<main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
			<h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Frontend Demo</h1>
			<p style={{ marginBottom: 24, opacity: 0.85 }}>
				This page demonstrates frontend ↔ backend communication with MSW mocks.
			</p>

			<section style={{ marginBottom: 24 }}>
				<h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>GET /api/health</h2>
				{health.isLoading ? (
					renderStatus("loading")
				) : health.isError ? (
					renderStatus("error", health.error instanceof Error ? health.error.message : "Error")
				) : (
					<pre style={{ background: "#0b1220", color: "#e5e7eb", padding: 12, borderRadius: 8, overflow: "auto" }}>
						{JSON.stringify(health.data, null, 2)}
					</pre>
				)}
			</section>

			<section>
				<h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>GET /api/example</h2>
				{demo.isLoading ? (
					renderStatus("loading")
				) : demo.isError ? (
					renderStatus("error", demo.error instanceof Error ? demo.error.message : "Error")
				) : (
					<pre style={{ background: "#0b1220", color: "#e5e7eb", padding: 12, borderRadius: 8, overflow: "auto" }}>
						{JSON.stringify(demo.data, null, 2)}
					</pre>
				)}
			</section>
		</main>
	);
}

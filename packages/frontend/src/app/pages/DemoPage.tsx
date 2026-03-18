import { useDemoQuery, useHealthQuery } from "@/shared/api/demo.queries";

export default function DemoPage() {
	const health = useHealthQuery();
	const demo = useDemoQuery();

	return (
		<div style={{ padding: 24, fontFamily: "Plus Jakarta Sans, system-ui, sans-serif" }}>
			<h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Frontend boilerplate</h1>
			<p style={{ marginBottom: 24, opacity: 0.85 }}>
				This page demonstrates frontend ↔ backend communication. In dev/tests, MSW will mock these endpoints.
			</p>

			<section style={{ marginBottom: 24 }}>
				<h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>GET /api/health</h2>
				{health.isLoading ? (
					<p>Loading…</p>
				) : health.isError ? (
					<p style={{ color: "#b91c1c" }}>{health.error instanceof Error ? health.error.message : "Error"}</p>
				) : (
					<pre style={{ background: "#0b1220", color: "#e5e7eb", padding: 12, borderRadius: 8 }}>
						{JSON.stringify(health.data, null, 2)}
					</pre>
				)}
			</section>

			<section>
				<h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>GET /api/example</h2>
				{demo.isLoading ? (
					<p>Loading…</p>
				) : demo.isError ? (
					<p style={{ color: "#b91c1c" }}>{demo.error instanceof Error ? demo.error.message : "Error"}</p>
				) : (
					<pre style={{ background: "#0b1220", color: "#e5e7eb", padding: 12, borderRadius: 8 }}>
						{JSON.stringify(demo.data, null, 2)}
					</pre>
				)}
			</section>
		</div>
	);
}

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { useDemoQuery, useHealthQuery } from "@/shared/api/demo.queries";
import styles from "./DemoPage.module.css";

export default function DemoPage() {
	const health = useHealthQuery();
	const demo = useDemoQuery();

	return (
		<main className={styles.page}>
			<h1 className={styles.title}>Frontend Demo</h1>
			<p className={styles.description}>
				This page demonstrates frontend ↔ backend communication with MSW mocks.
			</p>

			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>GET /api/health</h2>
				{health.isLoading ? (
					<LoadingSpinner />
				) : health.isError ? (
					<ErrorMessage message={health.error instanceof Error ? health.error.message : "Error"} />
				) : (
					<CodeBlock>{JSON.stringify(health.data, null, 2)}</CodeBlock>
				)}
			</section>

			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>GET /api/example</h2>
				{demo.isLoading ? (
					<LoadingSpinner />
				) : demo.isError ? (
					<ErrorMessage message={demo.error instanceof Error ? demo.error.message : "Error"} />
				) : (
					<CodeBlock>{JSON.stringify(demo.data, null, 2)}</CodeBlock>
				)}
			</section>
		</main>
	);
}

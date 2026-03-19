import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
	message?: string;
}

export function LoadingSpinner({ message = "Loading…" }: LoadingSpinnerProps) {
	return (
		<output aria-live="polite" className={styles.container}>
			<div className={styles.spinner} />
			<span>{message}</span>
		</output>
	);
}
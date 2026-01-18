import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { Button, Stack, SvgIcon } from "@mui/material";
import { useCallback } from "react";
import type { FallbackProps } from "react-error-boundary";
import Dialog from "@/shared/components/Dialog/Dialog";
import { logger } from "@/shared/lib/logger";

interface ErrorDialogProps {
	title?: string;
	onRetry?: () => void;
	retryText?: string;
}

interface ErrorFallbackProps extends FallbackProps {
	title?: string;
	retryText?: string;
}

function ErrorDialog({ title = "Error loading application", onRetry, retryText = "Go to Home" }: ErrorDialogProps) {
	const handleClick = useCallback(() => {
		if (onRetry) {
			onRetry();
		} else {
			window.location.href = "/";
		}
	}, [onRetry]);

	return (
		<Dialog open={true}>
			<Dialog.Content>
				<Stack alignItems="center" spacing={6} paddingTop="48px">
					<SvgIcon component={ErrorOutlineOutlinedIcon} sx={{ height: "88px", width: "88px" }} color="error" />
					<Stack spacing={2}>
						<Dialog.Title>{title}</Dialog.Title>
					</Stack>
				</Stack>
			</Dialog.Content>

			<Dialog.Actions sx={{ padding: "24px" }}>
				<Button fullWidth variant="contained" onClick={handleClick} color="primary">
					{retryText}
				</Button>
			</Dialog.Actions>
		</Dialog>
	);
}

export function ErrorFallback({
	error,
	resetErrorBoundary,
	title = "Error loading application",
	retryText = "Try Again",
}: ErrorFallbackProps) {
	const handleRetry = useCallback(() => {
		resetErrorBoundary();
	}, [resetErrorBoundary]);

	logger.error("Error boundary caught an error:", error);

	return <ErrorDialog title={title} onRetry={handleRetry} retryText={retryText} />;
}

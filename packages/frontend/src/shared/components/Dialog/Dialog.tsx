import { CloseOutlined } from "@mui/icons-material";
import { DialogActions, DialogContent, IconButton, Typography } from "@mui/material";
import MuiDialog from "@mui/material/Dialog";
import type DialogTitle from "@mui/material/DialogTitle";
import { type ComponentProps, type MouseEvent, type ReactNode, useEffect, useRef } from "react";

interface DialogProps extends Omit<ComponentProps<typeof MuiDialog>, "children"> {
	width?: string | number;
	height?: string | number;
	handleClose?: (event: MouseEvent<HTMLButtonElement>) => void;
	closeButtonProps?: ComponentProps<typeof IconButton>;
	children?: ReactNode;
}

function Dialog({ width = "600px", height = "500px", handleClose, closeButtonProps, children, ...props }: DialogProps) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const previousActiveElement = useRef<HTMLElement | null>(null);

	// Track the previously focused element for restoring focus on close
	useEffect(() => {
		if (props.open) {
			previousActiveElement.current = (document.activeElement as HTMLElement) || null;
		}
	}, [props.open]);

	// Restore focus on close
	useEffect(() => {
		if (!props.open && previousActiveElement.current) {
			// Use setTimeout to ensure dialog is fully closed before restoring focus
			setTimeout(() => {
				previousActiveElement.current?.focus();
			}, 100);
		}
	}, [props.open]);

	const defaultPaperProps = {
		sx: {
			width,
			height,
			paddingX: 3,
			paddingY: 4,
			backgroundImage: "none",
			...props.PaperProps?.sx,
		},
	};
	const closeButtonStyle = {
		padding: 0,
		width: "fit-content",
		marginLeft: "auto",
		zIndex: 9999,
		...closeButtonProps?.sx,
	};
	return (
		<MuiDialog
			ref={dialogRef}
			fullWidth={props.fullWidth ?? true}
			PaperProps={{
				...props.PaperProps,
				sx: defaultPaperProps.sx,
			}}
			hideBackdrop={props.hideBackdrop ?? false}
			disableRestoreFocus={false}
			{...props}
		>
			{handleClose && (
				<IconButton
					disableRipple
					onClick={handleClose}
					{...closeButtonProps}
					sx={closeButtonStyle}
					aria-label="Close dialog"
				>
					<CloseOutlined />
				</IconButton>
			)}
			{children}
		</MuiDialog>
	);
}

Dialog.Title = (props: ComponentProps<typeof DialogTitle>) => {
	const defaultProps: ComponentProps<typeof Typography> = {
		fontSize: 24,
		textAlign: "center",
		fontStyle: "normal",
		fontWeight: 500,
		lineHeight: "24px",
	};
	return (
		<Typography {...defaultProps} {...props}>
			{props.children}
		</Typography>
	);
};

Dialog.Content = (props: ComponentProps<typeof DialogContent>) => {
	return (
		<DialogContent sx={{ paddingX: 3 }} {...props}>
			{props.children}
		</DialogContent>
	);
};

Dialog.Actions = (props: ComponentProps<typeof DialogActions>) => {
	const { sx, ...restProps } = props;
	const mergedSx = {
		display: "flex",
		justifyContent: "center",
		minHeight: "max-content",
		paddingX: 3,
		...(sx ?? {}),
	};

	return (
		<DialogActions {...restProps} sx={mergedSx}>
			{props.children}
		</DialogActions>
	);
};

export default Dialog;

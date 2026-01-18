import { createTheme, type Theme } from "@mui/material/styles";

export const THEME_CONSTANTS = {
	// Typography - distinctive font pairing
	FONT_DISPLAY: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
	FONT_BODY: '"IBM Plex Sans", system-ui, -apple-system, sans-serif',
	FONT_MONO: '"JetBrains Mono", "SF Mono", monospace',

	COLORS: {
		// Primary palette - Deep navy with warmth
		PRIMARY: "#1e3a5f",
		PRIMARY_LIGHT: "#2d5a87",
		PRIMARY_DARK: "#132842",
		PRIMARY_HOVER: "#254b73",

		// Secondary accent - vibrant blue
		SECONDARY: "#3b82f6",
		SECONDARY_DARK: "#2563eb",
		ACCENT: "#6366f1",

		// Enterprise Environment Colors - semantic meaning and hierarchy
		ENVIRONMENTS: {
			dev: {
				main: "#0891b2",
				light: "#06b6d4",
				bg: "rgba(8, 145, 178, 0.08)",
				hover: "rgba(8, 145, 178, 0.12)",
			},
			qa: {
				main: "#7c3aed",
				light: "#8b5cf6",
				bg: "rgba(124, 58, 237, 0.08)",
				hover: "rgba(124, 58, 237, 0.12)",
			},
			staging: {
				main: "#d97706",
				light: "#f59e0b",
				bg: "rgba(217, 119, 6, 0.08)",
				hover: "rgba(217, 119, 6, 0.12)",
			},
			prod: {
				main: "#10b981",
				light: "#34d399",
				bg: "rgba(16, 185, 129, 0.08)",
				bgStrong: "#d1fae5",
				hover: "rgba(16, 185, 129, 0.12)",
			},
		},

		// State Colors
		STATES: {
			active: "#059669",
			activeBg: "rgba(5, 150, 105, 0.08)",
			inactive: "#64748b",
			inactiveBg: "rgba(100, 116, 139, 0.08)",
			loading: "#0284c7",
			error: "#dc2626",
		},

		// Clean, professional backgrounds
		BACKGROUND: "#f8fafc",
		BACKGROUND_ALT: "#f1f5f9",
		PAPER_BACKGROUND: "#ffffff",
		SURFACE: "#f8fafc",
		SURFACE_LIGHT: "#f1f5f9",
		SURFACE_DARK: "#0f172a",
		SURFACE_HOVER: "#e2e8f0",

		// Text hierarchy
		TEXT_PRIMARY: "#0f172a",
		TEXT_SECONDARY: "#475569",
		TEXT_TERTIARY: "#64748b",
		TEXT_MUTED: "#94a3b8",
		TEXT_DISABLED: "#cbd5e1",

		// Status colors
		SUCCESS: "#059669",
		SUCCESS_LIGHT: "#10b981",
		SUCCESS_BG: "#d1fae5",
		ERROR: "#dc2626",
		ERROR_LIGHT: "#ef4444",
		ERROR_BG: "#fee2e2",
		WARNING: "#d97706",
		WARNING_LIGHT: "#f59e0b",
		WARNING_BG: "#fef3c7",
		INFO: "#0284c7",
		INFO_LIGHT: "#0ea5e9",
		INFO_BG: "#e0f2fe",

		// Borders and dividers
		BORDER: "#e2e8f0",
		BORDER_LIGHT: "#f1f5f9",
		BORDER_STRONG: "#cbd5e1",
		DIVIDER: "#e2e8f0",
	},
	TYPOGRAPHY: {
		FONT_SIZE: {
			XS: 11,
			TOOLTIP: 12,
			SMALL: 13,
			BODY: 14,
			MEDIUM: 15,
			LARGE: 16,
		},
		FONT_WEIGHT: {
			REGULAR: 400,
			MEDIUM: 500,
			SEMIBOLD: 600,
			BOLD: 700,
			EXTRABOLD: 800,
		},
		LINE_HEIGHT: {
			TIGHT: 1.25,
			NORMAL: 1.5,
			RELAXED: 1.75,
		},
	},
	SPACING: {
		BORDER_WIDTH: 1,
		BORDER_RADIUS: "8px",
		BORDER_RADIUS_SM: "6px",
		BORDER_RADIUS_MD: "8px",
		BORDER_RADIUS_LG: "12px",
		BORDER_RADIUS_XL: "16px",
	},
	Z_INDEX: {
		APP_BAR: 1100,
		DRAWER: 1200,
		MODAL: 1300,
		TOOLTIP: 1400,
	},
	SHADOWS: {
		GLOW_PRIMARY: "0 0 0 3px rgba(30, 58, 95, 0.1)",
		GLOW_SUCCESS: "0 0 0 3px rgba(5, 150, 105, 0.1)",
		GLOW_ERROR: "0 0 0 3px rgba(220, 38, 38, 0.1)",
		XS: "0 1px 2px rgba(15, 23, 42, 0.04)",
		SM: "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
		CARD: "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
		MD: "0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)",
		ELEVATED: "0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)",
		LG: "0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)",
		XL: "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
		INNER: "inset 0 2px 4px 0 rgba(15, 23, 42, 0.04)",
	},
	TRANSITIONS: {
		FAST: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
		BASE: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
		SLOW: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
	},
} as const;

export const createAppTheme = (direction: "ltr" | "rtl" = "ltr"): Theme => {
	const theme = createTheme({
		direction,
		zIndex: {
			appBar: THEME_CONSTANTS.Z_INDEX.APP_BAR,
			drawer: THEME_CONSTANTS.Z_INDEX.DRAWER,
		},
		palette: {
			mode: "light",
			background: {
				default: THEME_CONSTANTS.COLORS.BACKGROUND,
				paper: THEME_CONSTANTS.COLORS.PAPER_BACKGROUND,
			},
			primary: {
				main: THEME_CONSTANTS.COLORS.PRIMARY,
				light: THEME_CONSTANTS.COLORS.PRIMARY_LIGHT,
				dark: THEME_CONSTANTS.COLORS.PRIMARY_DARK,
				contrastText: "#ffffff",
			},
			secondary: {
				main: THEME_CONSTANTS.COLORS.SECONDARY,
				dark: THEME_CONSTANTS.COLORS.SECONDARY_DARK,
				contrastText: "#ffffff",
			},
			success: {
				main: THEME_CONSTANTS.COLORS.SUCCESS,
				light: THEME_CONSTANTS.COLORS.SUCCESS_LIGHT,
				contrastText: "#ffffff",
			},
			error: {
				main: THEME_CONSTANTS.COLORS.ERROR,
				light: THEME_CONSTANTS.COLORS.ERROR_LIGHT,
				contrastText: "#ffffff",
			},
			warning: {
				main: THEME_CONSTANTS.COLORS.WARNING,
				light: THEME_CONSTANTS.COLORS.WARNING_LIGHT,
				contrastText: "#ffffff",
			},
			info: {
				main: THEME_CONSTANTS.COLORS.INFO,
				light: THEME_CONSTANTS.COLORS.INFO_LIGHT,
				contrastText: "#ffffff",
			},
			text: {
				primary: THEME_CONSTANTS.COLORS.TEXT_PRIMARY,
				secondary: THEME_CONSTANTS.COLORS.TEXT_SECONDARY,
				disabled: THEME_CONSTANTS.COLORS.TEXT_DISABLED,
			},
			divider: THEME_CONSTANTS.COLORS.DIVIDER,
		},
		typography: {
			fontFamily: THEME_CONSTANTS.FONT_BODY,
			allVariants: {
				color: THEME_CONSTANTS.COLORS.TEXT_PRIMARY,
			},
			h1: {
				fontFamily: THEME_CONSTANTS.FONT_DISPLAY,
				fontWeight: 800,
				letterSpacing: "-0.025em",
			},
			h2: {
				fontFamily: THEME_CONSTANTS.FONT_DISPLAY,
				fontWeight: 700,
				letterSpacing: "-0.02em",
			},
			h3: {
				fontFamily: THEME_CONSTANTS.FONT_DISPLAY,
				fontWeight: 700,
				letterSpacing: "-0.015em",
			},
			h4: {
				fontFamily: THEME_CONSTANTS.FONT_DISPLAY,
				fontWeight: 600,
				letterSpacing: "-0.01em",
			},
			h5: {
				fontFamily: THEME_CONSTANTS.FONT_DISPLAY,
				fontWeight: 600,
				letterSpacing: "-0.005em",
			},
			h6: {
				fontFamily: THEME_CONSTANTS.FONT_DISPLAY,
				fontWeight: 600,
			},
			subtitle1: {
				fontFamily: THEME_CONSTANTS.FONT_DISPLAY,
				fontWeight: 600,
			},
			subtitle2: {
				fontFamily: THEME_CONSTANTS.FONT_DISPLAY,
				fontWeight: 600,
			},
			body1: {
				fontSize: "0.9375rem",
				lineHeight: 1.6,
			},
			body2: {
				fontSize: "0.875rem",
				lineHeight: 1.5,
			},
			button: {
				fontFamily: THEME_CONSTANTS.FONT_DISPLAY,
				fontWeight: 600,
				textTransform: "none",
			},
			caption: {
				fontSize: "0.8125rem",
				lineHeight: 1.5,
			},
			overline: {
				fontFamily: THEME_CONSTANTS.FONT_DISPLAY,
				fontWeight: 600,
				letterSpacing: "0.08em",
				textTransform: "uppercase",
			},
		},
		shape: {
			borderRadius: parseInt(THEME_CONSTANTS.SPACING.BORDER_RADIUS),
		},
		shadows: [
			"none",
			THEME_CONSTANTS.SHADOWS.XS,
			THEME_CONSTANTS.SHADOWS.SM,
			THEME_CONSTANTS.SHADOWS.MD,
			THEME_CONSTANTS.SHADOWS.MD,
			THEME_CONSTANTS.SHADOWS.LG,
			THEME_CONSTANTS.SHADOWS.LG,
			THEME_CONSTANTS.SHADOWS.XL,
			THEME_CONSTANTS.SHADOWS.XL,
			THEME_CONSTANTS.SHADOWS.XL,
			THEME_CONSTANTS.SHADOWS.XL,
			THEME_CONSTANTS.SHADOWS.XL,
			THEME_CONSTANTS.SHADOWS.XL,
			THEME_CONSTANTS.SHADOWS.XL,
			THEME_CONSTANTS.SHADOWS.XL,
			THEME_CONSTANTS.SHADOWS.XL,
			THEME_CONSTANTS.SHADOWS.XL,
			THEME_CONSTANTS.SHADOWS.XL,
			THEME_CONSTANTS.SHADOWS.XL,
			THEME_CONSTANTS.SHADOWS.XL,
			THEME_CONSTANTS.SHADOWS.XL,
			THEME_CONSTANTS.SHADOWS.XL,
			THEME_CONSTANTS.SHADOWS.XL,
			THEME_CONSTANTS.SHADOWS.XL,
			THEME_CONSTANTS.SHADOWS.XL,
		],
		components: {
			MuiCssBaseline: {
				styleOverrides: {
					body: {
						scrollbarWidth: "thin",
						scrollbarColor: `${THEME_CONSTANTS.COLORS.BORDER_STRONG} transparent`,
						"&::-webkit-scrollbar": {
							width: "10px",
							height: "10px",
						},
						"&::-webkit-scrollbar-track": {
							background: "transparent",
						},
						"&::-webkit-scrollbar-thumb": {
							background: THEME_CONSTANTS.COLORS.BORDER_STRONG,
							borderRadius: "5px",
							border: "2px solid transparent",
							backgroundClip: "content-box",
							"&:hover": {
								background: THEME_CONSTANTS.COLORS.TEXT_MUTED,
							},
						},
					},
				},
			},
			MuiTypography: {
				styleOverrides: {
					root: {
						maxWidth: "none !important",
					},
				},
			},
			MuiTooltip: {
				styleOverrides: {
					tooltip: {
						backgroundColor: THEME_CONSTANTS.COLORS.SURFACE_DARK,
						color: "#ffffff",
						fontSize: THEME_CONSTANTS.TYPOGRAPHY.FONT_SIZE.TOOLTIP,
						fontFamily: THEME_CONSTANTS.FONT_BODY,
						fontWeight: THEME_CONSTANTS.TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
						borderRadius: THEME_CONSTANTS.SPACING.BORDER_RADIUS_SM,
						padding: "8px 12px",
						boxShadow: THEME_CONSTANTS.SHADOWS.LG,
					},
					arrow: {
						color: THEME_CONSTANTS.COLORS.SURFACE_DARK,
					},
				},
			},
			MuiButton: {
				styleOverrides: {
					root: {
						fontFamily: THEME_CONSTANTS.FONT_DISPLAY,
						textTransform: "none",
						fontWeight: THEME_CONSTANTS.TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
						borderRadius: THEME_CONSTANTS.SPACING.BORDER_RADIUS_MD,
						padding: "10px 20px",
						fontSize: THEME_CONSTANTS.TYPOGRAPHY.FONT_SIZE.BODY,
						lineHeight: 1.5,
						transition: `all ${THEME_CONSTANTS.TRANSITIONS.BASE}`,
						letterSpacing: "0.01em",
					},
					sizeSmall: {
						padding: "6px 14px",
						fontSize: THEME_CONSTANTS.TYPOGRAPHY.FONT_SIZE.SMALL,
					},
					sizeLarge: {
						padding: "12px 24px",
						fontSize: THEME_CONSTANTS.TYPOGRAPHY.FONT_SIZE.MEDIUM,
					},
					contained: {
						boxShadow: THEME_CONSTANTS.SHADOWS.SM,
						backgroundColor: THEME_CONSTANTS.COLORS.PRIMARY,
						"&:hover": {
							backgroundColor: THEME_CONSTANTS.COLORS.PRIMARY_HOVER,
							boxShadow: THEME_CONSTANTS.SHADOWS.MD,
							transform: "translateY(-1px)",
						},
						"&:active": {
							transform: "translateY(0)",
							boxShadow: THEME_CONSTANTS.SHADOWS.SM,
						},
					},
					containedSecondary: {
						backgroundColor: THEME_CONSTANTS.COLORS.SECONDARY,
						"&:hover": {
							backgroundColor: THEME_CONSTANTS.COLORS.SECONDARY_DARK,
						},
					},
					containedWarning: {
						backgroundColor: THEME_CONSTANTS.COLORS.WARNING,
						color: "#ffffff",
						"&:hover": {
							backgroundColor: THEME_CONSTANTS.COLORS.WARNING_LIGHT,
						},
					},
					containedError: {
						backgroundColor: THEME_CONSTANTS.COLORS.ERROR,
						"&:hover": {
							backgroundColor: THEME_CONSTANTS.COLORS.ERROR_LIGHT,
						},
					},
					outlined: {
						borderColor: THEME_CONSTANTS.COLORS.BORDER_STRONG,
						borderWidth: "1.5px",
						color: THEME_CONSTANTS.COLORS.TEXT_PRIMARY,
						backgroundColor: THEME_CONSTANTS.COLORS.PAPER_BACKGROUND,
						"&:hover": {
							borderColor: THEME_CONSTANTS.COLORS.PRIMARY,
							backgroundColor: `rgba(30, 58, 95, 0.04)`,
							borderWidth: "1.5px",
							transform: "translateY(-1px)",
						},
					},
					text: {
						color: THEME_CONSTANTS.COLORS.TEXT_SECONDARY,
						"&:hover": {
							backgroundColor: `rgba(30, 58, 95, 0.06)`,
							color: THEME_CONSTANTS.COLORS.PRIMARY,
						},
					},
				},
			},
			MuiIconButton: {
				styleOverrides: {
					root: {
						borderRadius: THEME_CONSTANTS.SPACING.BORDER_RADIUS_MD,
						transition: `all ${THEME_CONSTANTS.TRANSITIONS.BASE}`,
						"&:hover": {
							backgroundColor: `rgba(30, 58, 95, 0.08)`,
							transform: "scale(1.05)",
						},
						"&:active": {
							transform: "scale(0.95)",
						},
					},
					sizeSmall: {
						padding: "6px",
					},
					sizeMedium: {
						padding: "8px",
					},
					sizeLarge: {
						padding: "10px",
					},
				},
			},
			MuiPaper: {
				styleOverrides: {
					root: {
						backgroundImage: "none",
						backgroundColor: THEME_CONSTANTS.COLORS.PAPER_BACKGROUND,
						border: `1px solid ${THEME_CONSTANTS.COLORS.BORDER}`,
						boxShadow: THEME_CONSTANTS.SHADOWS.SM,
					},
					elevation1: {
						boxShadow: THEME_CONSTANTS.SHADOWS.SM,
					},
					elevation2: {
						boxShadow: THEME_CONSTANTS.SHADOWS.MD,
					},
					elevation3: {
						boxShadow: THEME_CONSTANTS.SHADOWS.LG,
					},
				},
			},
			MuiCard: {
				styleOverrides: {
					root: {
						backgroundImage: "none",
						backgroundColor: THEME_CONSTANTS.COLORS.PAPER_BACKGROUND,
						border: `1px solid ${THEME_CONSTANTS.COLORS.BORDER}`,
						borderRadius: THEME_CONSTANTS.SPACING.BORDER_RADIUS_LG,
						boxShadow: THEME_CONSTANTS.SHADOWS.SM,
						transition: `all ${THEME_CONSTANTS.TRANSITIONS.BASE}`,
						overflow: "hidden",
					},
				},
			},
			MuiSwitch: {
				styleOverrides: {
					root: {
						width: 58,
						height: 34,
						padding: 0,
					},
					switchBase: {
						padding: 3,
						"&.Mui-checked": {
							transform: "translateX(24px)",
							"& + .MuiSwitch-track": {
								backgroundColor: THEME_CONSTANTS.COLORS.SUCCESS,
								opacity: 1,
								border: "none",
							},
							"& .MuiSwitch-thumb": {
								backgroundColor: "#ffffff",
								boxShadow: "0 3px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",
							},
							"&:hover": {
								backgroundColor: "transparent",
								"& + .MuiSwitch-track": {
									opacity: 0.9,
								},
							},
						},
						"&:hover": {
							backgroundColor: "transparent",
							"& + .MuiSwitch-track": {
								opacity: 0.8,
							},
						},
						"&.Mui-disabled": {
							"& + .MuiSwitch-track": {
								opacity: 0.3,
							},
						},
					},
					thumb: {
						width: 28,
						height: 28,
						backgroundColor: "#ffffff",
						boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)",
						transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
					},
					track: {
						borderRadius: 17,
						backgroundColor: THEME_CONSTANTS.COLORS.SURFACE_LIGHT,
						opacity: 1,
						border: `1px solid ${THEME_CONSTANTS.COLORS.BORDER}`,
						transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
					},
				},
			},
			MuiChip: {
				styleOverrides: {
					root: {
						fontFamily: THEME_CONSTANTS.FONT_DISPLAY,
						fontWeight: THEME_CONSTANTS.TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
						borderRadius: THEME_CONSTANTS.SPACING.BORDER_RADIUS_SM,
						height: 28,
						fontSize: THEME_CONSTANTS.TYPOGRAPHY.FONT_SIZE.SMALL,
						transition: `all ${THEME_CONSTANTS.TRANSITIONS.BASE}`,
					},
					outlined: {
						borderColor: THEME_CONSTANTS.COLORS.BORDER_STRONG,
						borderWidth: "1.5px",
						color: THEME_CONSTANTS.COLORS.TEXT_SECONDARY,
						backgroundColor: THEME_CONSTANTS.COLORS.PAPER_BACKGROUND,
						"&:hover": {
							backgroundColor: `rgba(30, 58, 95, 0.08)`,
							borderColor: THEME_CONSTANTS.COLORS.PRIMARY,
							color: THEME_CONSTANTS.COLORS.PRIMARY,
							transform: "translateY(-1px)",
						},
					},
					filled: {
						backgroundColor: THEME_CONSTANTS.COLORS.SURFACE_LIGHT,
						color: THEME_CONSTANTS.COLORS.TEXT_PRIMARY,
						"&:hover": {
							backgroundColor: THEME_CONSTANTS.COLORS.SURFACE_HOVER,
						},
					},
					sizeSmall: {
						height: 24,
						fontSize: THEME_CONSTANTS.TYPOGRAPHY.FONT_SIZE.XS,
					},
				},
			},
			MuiDialog: {
				styleOverrides: {
					paper: {
						backgroundColor: THEME_CONSTANTS.COLORS.PAPER_BACKGROUND,
						border: `1px solid ${THEME_CONSTANTS.COLORS.BORDER}`,
						borderRadius: THEME_CONSTANTS.SPACING.BORDER_RADIUS_XL,
						boxShadow: THEME_CONSTANTS.SHADOWS.XL,
					},
				},
			},
			MuiDialogTitle: {
				styleOverrides: {
					root: {
						fontFamily: THEME_CONSTANTS.FONT_DISPLAY,
						fontWeight: THEME_CONSTANTS.TYPOGRAPHY.FONT_WEIGHT.BOLD,
						fontSize: "1.25rem",
						color: THEME_CONSTANTS.COLORS.TEXT_PRIMARY,
						padding: "24px 24px 16px",
					},
				},
			},
			MuiDialogContent: {
				styleOverrides: {
					root: {
						padding: "20px 24px",
					},
				},
			},
			MuiDialogActions: {
				styleOverrides: {
					root: {
						padding: "16px 24px 24px",
						gap: "12px",
					},
				},
			},
			MuiTextField: {
				styleOverrides: {
					root: {
						"& .MuiOutlinedInput-root": {
							borderRadius: THEME_CONSTANTS.SPACING.BORDER_RADIUS_MD,
							backgroundColor: THEME_CONSTANTS.COLORS.PAPER_BACKGROUND,
							fontSize: THEME_CONSTANTS.TYPOGRAPHY.FONT_SIZE.BODY,
							transition: `all ${THEME_CONSTANTS.TRANSITIONS.BASE}`,
							"& fieldset": {
								borderColor: THEME_CONSTANTS.COLORS.BORDER,
								borderWidth: "1.5px",
								transition: `all ${THEME_CONSTANTS.TRANSITIONS.BASE}`,
							},
							"&:hover fieldset": {
								borderColor: THEME_CONSTANTS.COLORS.PRIMARY_LIGHT,
							},
							"&.Mui-focused": {
								backgroundColor: THEME_CONSTANTS.COLORS.PAPER_BACKGROUND,
								boxShadow: THEME_CONSTANTS.SHADOWS.GLOW_PRIMARY,
								"& fieldset": {
									borderColor: THEME_CONSTANTS.COLORS.PRIMARY,
									borderWidth: "2px",
								},
							},
						},
						"& .MuiInputLabel-root": {
							fontFamily: THEME_CONSTANTS.FONT_BODY,
							fontWeight: THEME_CONSTANTS.TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
							fontSize: THEME_CONSTANTS.TYPOGRAPHY.FONT_SIZE.BODY,
							"&.Mui-focused": {
								color: THEME_CONSTANTS.COLORS.PRIMARY,
							},
						},
						"& .MuiFormHelperText-root": {
							fontSize: THEME_CONSTANTS.TYPOGRAPHY.FONT_SIZE.SMALL,
							marginTop: "6px",
						},
					},
				},
			},
			MuiSelect: {
				styleOverrides: {
					root: {
						borderRadius: THEME_CONSTANTS.SPACING.BORDER_RADIUS_MD,
						backgroundColor: THEME_CONSTANTS.COLORS.PAPER_BACKGROUND,
					},
					outlined: {
						"& .MuiOutlinedInput-notchedOutline": {
							borderColor: THEME_CONSTANTS.COLORS.BORDER,
							borderWidth: "1.5px",
						},
						"&:hover .MuiOutlinedInput-notchedOutline": {
							borderColor: THEME_CONSTANTS.COLORS.PRIMARY_LIGHT,
						},
						"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
							borderColor: THEME_CONSTANTS.COLORS.PRIMARY,
							borderWidth: "2px",
						},
					},
				},
			},
			MuiMenu: {
				styleOverrides: {
					paper: {
						borderRadius: THEME_CONSTANTS.SPACING.BORDER_RADIUS_MD,
						border: `1px solid ${THEME_CONSTANTS.COLORS.BORDER}`,
						boxShadow: THEME_CONSTANTS.SHADOWS.LG,
						marginTop: "8px",
					},
					list: {
						padding: "6px",
					},
				},
			},
			MuiMenuItem: {
				styleOverrides: {
					root: {
						borderRadius: THEME_CONSTANTS.SPACING.BORDER_RADIUS_SM,
						margin: "2px 0",
						padding: "10px 14px",
						fontSize: THEME_CONSTANTS.TYPOGRAPHY.FONT_SIZE.BODY,
						transition: `all ${THEME_CONSTANTS.TRANSITIONS.FAST}`,
						"&:hover": {
							backgroundColor: `rgba(30, 58, 95, 0.06)`,
						},
						"&.Mui-selected": {
							backgroundColor: `rgba(30, 58, 95, 0.1)`,
							fontWeight: THEME_CONSTANTS.TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
							"&:hover": {
								backgroundColor: `rgba(30, 58, 95, 0.14)`,
							},
						},
					},
				},
			},
			MuiTableCell: {
				styleOverrides: {
					root: {
						borderColor: THEME_CONSTANTS.COLORS.BORDER,
						padding: "14px 16px",
						fontSize: THEME_CONSTANTS.TYPOGRAPHY.FONT_SIZE.BODY,
					},
					head: {
						backgroundColor: THEME_CONSTANTS.COLORS.SURFACE,
						fontFamily: THEME_CONSTANTS.FONT_DISPLAY,
						fontWeight: THEME_CONSTANTS.TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
						fontSize: THEME_CONSTANTS.TYPOGRAPHY.FONT_SIZE.SMALL,
						textTransform: "uppercase",
						letterSpacing: "0.06em",
						color: THEME_CONSTANTS.COLORS.TEXT_SECONDARY,
						borderBottom: `2px solid ${THEME_CONSTANTS.COLORS.BORDER_STRONG}`,
						padding: "12px 16px",
						lineHeight: THEME_CONSTANTS.TYPOGRAPHY.LINE_HEIGHT.TIGHT,
					},
					body: {
						color: THEME_CONSTANTS.COLORS.TEXT_PRIMARY,
					},
				},
			},
			MuiTableRow: {
				styleOverrides: {
					root: {
						transition: `background-color ${THEME_CONSTANTS.TRANSITIONS.FAST}`,
						"&:last-child td": {
							borderBottom: 0,
						},
					},
					hover: {
						"&:hover": {
							backgroundColor: `rgba(30, 58, 95, 0.03)`,
							cursor: "pointer",
						},
					},
				},
			},
			MuiTableContainer: {
				styleOverrides: {
					root: {
						border: "none",
						boxShadow: "none",
					},
				},
			},
			MuiListItemButton: {
				styleOverrides: {
					root: {
						borderRadius: THEME_CONSTANTS.SPACING.BORDER_RADIUS_MD,
						margin: "2px 8px",
						padding: "10px 12px",
						transition: `all ${THEME_CONSTANTS.TRANSITIONS.BASE}`,
						"&.Mui-selected": {
							backgroundColor: `rgba(30, 58, 95, 0.1)`,
							borderLeft: `3px solid ${THEME_CONSTANTS.COLORS.PRIMARY}`,
							fontWeight: THEME_CONSTANTS.TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
							"&:hover": {
								backgroundColor: `rgba(30, 58, 95, 0.14)`,
							},
						},
						"&:hover": {
							backgroundColor: `rgba(30, 58, 95, 0.06)`,
						},
					},
				},
			},
			MuiListItemIcon: {
				styleOverrides: {
					root: {
						minWidth: 40,
						color: THEME_CONSTANTS.COLORS.TEXT_SECONDARY,
					},
				},
			},
			MuiListItemText: {
				styleOverrides: {
					primary: {
						fontFamily: THEME_CONSTANTS.FONT_DISPLAY,
						fontSize: THEME_CONSTANTS.TYPOGRAPHY.FONT_SIZE.BODY,
						fontWeight: THEME_CONSTANTS.TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
					},
					secondary: {
						fontSize: THEME_CONSTANTS.TYPOGRAPHY.FONT_SIZE.SMALL,
					},
				},
			},
			MuiCheckbox: {
				styleOverrides: {
					root: {
						color: THEME_CONSTANTS.COLORS.BORDER_STRONG,
						borderRadius: THEME_CONSTANTS.SPACING.BORDER_RADIUS_SM,
						transition: `all ${THEME_CONSTANTS.TRANSITIONS.BASE}`,
						"&:hover": {
							backgroundColor: `rgba(30, 58, 95, 0.08)`,
						},
						"&.Mui-checked": {
							color: THEME_CONSTANTS.COLORS.PRIMARY,
						},
						"&.MuiCheckbox-indeterminate": {
							color: THEME_CONSTANTS.COLORS.WARNING,
						},
					},
				},
			},
			MuiDivider: {
				styleOverrides: {
					root: {
						borderColor: THEME_CONSTANTS.COLORS.DIVIDER,
					},
				},
			},
			MuiInputAdornment: {
				styleOverrides: {
					root: {
						color: THEME_CONSTANTS.COLORS.TEXT_MUTED,
					},
				},
			},
			MuiCircularProgress: {
				styleOverrides: {
					root: {
						color: THEME_CONSTANTS.COLORS.PRIMARY,
					},
				},
			},
			MuiSkeleton: {
				styleOverrides: {
					root: {
						backgroundColor: THEME_CONSTANTS.COLORS.SURFACE_LIGHT,
						borderRadius: THEME_CONSTANTS.SPACING.BORDER_RADIUS_SM,
					},
				},
			},
			MuiAlert: {
				styleOverrides: {
					root: {
						borderRadius: THEME_CONSTANTS.SPACING.BORDER_RADIUS_MD,
						border: "1px solid",
						fontSize: THEME_CONSTANTS.TYPOGRAPHY.FONT_SIZE.BODY,
					},
					standardSuccess: {
						backgroundColor: THEME_CONSTANTS.COLORS.SUCCESS_BG,
						borderColor: THEME_CONSTANTS.COLORS.SUCCESS,
						color: THEME_CONSTANTS.COLORS.TEXT_PRIMARY,
					},
					standardError: {
						backgroundColor: THEME_CONSTANTS.COLORS.ERROR_BG,
						borderColor: THEME_CONSTANTS.COLORS.ERROR,
						color: THEME_CONSTANTS.COLORS.TEXT_PRIMARY,
					},
					standardWarning: {
						backgroundColor: THEME_CONSTANTS.COLORS.WARNING_BG,
						borderColor: THEME_CONSTANTS.COLORS.WARNING,
						color: THEME_CONSTANTS.COLORS.TEXT_PRIMARY,
					},
					standardInfo: {
						backgroundColor: THEME_CONSTANTS.COLORS.INFO_BG,
						borderColor: THEME_CONSTANTS.COLORS.INFO,
						color: THEME_CONSTANTS.COLORS.TEXT_PRIMARY,
					},
				},
			},
		},
	});

	return theme;
};

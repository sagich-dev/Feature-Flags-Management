import "@/app/globals.css";

import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { type ReactNode, useEffect, useMemo } from "react";
import { createAppTheme } from "@/app/theme/theme";

export default function MuiProvider({ children }: { children: ReactNode }) {
	const theme = useMemo(() => createAppTheme("ltr"), []);

	useEffect(() => {
		document.body.dir = "ltr";
	}, []);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			{children}
		</ThemeProvider>
	);
}

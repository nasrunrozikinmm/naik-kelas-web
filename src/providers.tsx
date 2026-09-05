"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store";
import { getTheme } from "@/styles/theme";
import { DialogProvider } from "@/context/DialogContext";
import { useEffect, useMemo } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setSession } from "@/store/slices/authSlice";
import { getStoredSession } from "@/lib/auth/session";

function SyncMUITheme({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  
  const muiTheme = useMemo(() => {
    return getTheme(resolvedTheme === 'dark' ? 'dark' : 'light');
  }, [resolvedTheme]);

  return (
    <MUIThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}

function AuthSessionInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const session = getStoredSession();
    if (session) {
      dispatch(setSession(session));
    }
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppRouterCacheProvider options={{ enableCssLayer: true }}>
        <ReduxProvider store={store}>
          <AuthSessionInitializer>
            <SyncMUITheme>
              <DialogProvider>
                {children}
              </DialogProvider>
            </SyncMUITheme>
          </AuthSessionInitializer>
        </ReduxProvider>
      </AppRouterCacheProvider>
    </NextThemeProvider>
  );
}


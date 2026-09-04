import { createTheme, alpha, lighten, darken } from "@mui/material/styles";

export const getTheme = (mode: 'light' | 'dark') => {
  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? "#3b82f6" : "#003fb1",
        light: mode === 'dark' ? "#60a5fa" : "#1a56db",
        dark: mode === 'dark' ? "#1d4ed8" : "#002b80",
        contrastText: "#ffffff"
      },
      secondary: {
        main: mode === 'dark' ? "#fd761a" : "#9d4300",
        contrastText: "#ffffff"
      },
      background: {
        default: mode === 'dark' ? "#0f172a" : "#f9f9ff",
        paper: mode === 'dark' ? "#1e293b" : "#ffffff"
      },
      text: {
        primary: mode === 'dark' ? "#f1f5f9" : "#151c27",
        secondary: mode === 'dark' ? "#94a3b8" : "#434654"
      },
      divider: mode === 'dark' ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)"
    },
    shape: {
      borderRadius: 10
    },
    typography: {
      fontFamily: [
        "Inter",
        "ui-sans-serif",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "sans-serif"
      ].join(","),
      h1: { fontSize: "2.5rem", fontWeight: 700, letterSpacing: 0 },
      h2: { fontSize: "1.75rem", fontWeight: 700, letterSpacing: 0 },
      h3: { fontSize: "1.25rem", fontWeight: 700, letterSpacing: 0 },
      button: { textTransform: "none", fontWeight: 700, letterSpacing: 0 }
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: "10px 14px",
            textTransform: "none",
            fontWeight: 700,
          },
          contained: {
            color: "#ffffff !important",
            "& *": {
              color: "#ffffff !important",
              fill: "#ffffff !important",
            },
            "&:hover": {
              color: "#ffffff !important",
            },
          },
          containedPrimary: {
            color: "#ffffff !important",
            backgroundColor: mode === "dark" ? "#2563eb" : "#003fb1",
            "& *": {
              color: "#ffffff !important",
              fill: "#ffffff !important",
            },
            "&:hover": {
              backgroundColor: mode === "dark" ? "#1d4ed8" : "#002b80",
              color: "#ffffff !important",
            },
          },
          containedSecondary: {
            color: "#ffffff !important",
            backgroundColor: mode === "dark" ? "#fd761a" : "#9d4300",
            "& *": {
              color: "#ffffff !important",
              fill: "#ffffff !important",
            },
            "&:hover": {
              backgroundColor: mode === "dark" ? "#ea580c" : "#852b00",
              color: "#ffffff !important",
            },
          },
          outlined: {
            color: mode === "dark" ? "#60a5fa" : "#003fb1",
            borderColor: mode === "dark" ? "#3b82f6" : "#003fb1",
          },
          text: {
            color: mode === "dark" ? "#60a5fa" : "#003fb1",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'dark' ? "none" : "0 6px 18px rgba(15, 23, 42, 0.06)",
            border: mode === 'dark' ? "1px solid #334155" : "none"
          }
        }
      },
      MuiChip: { styleOverrides: { root: { borderRadius: 6, height: 28, fontWeight: 600 } } },
      MuiAvatar: { styleOverrides: { root: { width: 32, height: 32, fontSize: "0.9rem" } } },
      MuiCardContent: { styleOverrides: { root: { padding: "16px" } } },
      MuiCardActions: { styleOverrides: { root: { padding: "12px 16px" } } },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: mode === 'dark' ? "#94a3b8" : "#434654",
            '&.Mui-focused': {
              color: mode === 'dark' ? "#60a5fa" : "#003fb1",
            }
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            color: mode === 'dark' ? "#f1f5f9" : "#151c27",
            backgroundColor: mode === 'dark' ? "rgba(15, 23, 42, 0.5)" : "#ffffff",
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? "rgba(255, 255, 255, 0.16)" : "#c3c5d7",
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? "#60a5fa" : "#003fb1",
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? "#60a5fa" : "#003fb1",
            },
          },
          input: {
            '&::placeholder': {
              color: mode === 'dark' ? "#64748b" : "#94a3b8",
              opacity: 1,
            }
          }
        }
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            color: mode === 'dark' ? "#94a3b8" : "#434654",
            '&.Mui-error': {
              color: mode === 'dark' ? "#f87171" : "#ba1a1a",
            }
          }
        }
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: mode === 'dark' ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
          }
        }
      }
    }
  });

  // @ts-expect-error: Polyfill for DataGrid
  theme.alpha = alpha;
  // @ts-expect-error: Polyfill for DataGrid
  theme.lighten = lighten;
  // @ts-expect-error: Polyfill for DataGrid
  theme.darken = darken;

  return theme;
};

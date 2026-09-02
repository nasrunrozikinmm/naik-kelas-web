"use client";

import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, Container, Stack, Typography } from "@mui/material";

export default function ErrorPage({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <Box component="main" sx={{ py: 6 }}>
      <Container maxWidth="sm">
        <Stack spacing={2} alignItems="flex-start">
          <Typography component="h1" variant="h2">
            Terjadi kesalahan
          </Typography>
          <Button onClick={reset} startIcon={<RefreshIcon />} variant="contained">
            Muat ulang
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}


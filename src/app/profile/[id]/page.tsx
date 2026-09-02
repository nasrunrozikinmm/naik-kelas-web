import PersonIcon from "@mui/icons-material/Person";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { AppShell } from "@/components/AppShell";

import { use } from "react";

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  return (
    <AppShell>
      <Box sx={{ py: 4 }}>
        <Container maxWidth="md">
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2} alignItems="flex-start">
              <PersonIcon color="primary" />
              <Typography component="h1" variant="h2">
                Public Profile — {id}
              </Typography>
              <Typography color="text.secondary">Profile details and verification status (mock).</Typography>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </AppShell>
  );
}

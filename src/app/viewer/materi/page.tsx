import { Box, Container, Paper, Stack, Typography } from "@mui/material";

export default function ViewerMateriPage() {
  return (
    <Box component="main" sx={{ py: 4 }}>
      <Container maxWidth="md">
        <Stack spacing={2}>
          <Typography component="h1" variant="h2">
            Viewer Materi
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography color="text.secondary">Player and resource viewer (mock UI for recorded lessons).</Typography>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}

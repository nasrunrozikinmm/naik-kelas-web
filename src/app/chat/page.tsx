import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { fetchMessages } from "@/lib/mock/data";
import { AppShell } from "@/components/AppShell";
import { ChatClient } from "@/components/ChatClient";
import type { MessageModel } from "@/types/domain";

export default async function ChatPage() {
  const resp = await fetchMessages();
  const messages: MessageModel[] = resp.data ?? [];

  return (
    <AppShell>
      <Box sx={{ py: 4 }}>
        <Container maxWidth="md">
          <Stack spacing={2}>
            <Typography component="h1" variant="h2">
              Chat
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <ChatClient initial={messages} />
            </Paper>
          </Stack>
        </Container>
      </Box>
    </AppShell>
  );
}

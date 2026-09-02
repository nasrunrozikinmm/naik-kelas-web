"use client";

import { useState } from "react";
import { Box, List, ListItem, TextField, Stack, Typography, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import type { MessageModel } from "@/types/domain";
import { mockMessages } from "@/lib/mock/data";

export function ChatClient({ initial }: { initial: MessageModel[] }) {
  const [messages, setMessages] = useState<MessageModel[]>(initial);
  const [text, setText] = useState("");

  function send() {
    if (!text.trim()) return;
    const m: MessageModel = { id: `m_${Date.now()}`, from: "You", text: text.trim(), createdAt: new Date().toISOString() };
    setMessages((s) => [...s, m]);
    setText("");
    // update in-memory mock so subsequent server fetches see it (optional)
    mockMessages.push(m);
  }

  return (
    <Box>
      <List>
        {messages.map((m) => (
          <ListItem key={m.id} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ChatIcon color="primary" />
            <div>
              <Typography fontWeight={700}>{m.from}</Typography>
              <Typography color="text.secondary">{m.text}</Typography>
            </div>
          </ListItem>
        ))}
      </List>

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <TextField placeholder="Tulis pesan..." fullWidth value={text} onChange={(e) => setText(e.target.value)} />
        <IconButton color="primary" onClick={send}>
          <SendIcon />
        </IconButton>
      </Stack>
    </Box>
  );
}

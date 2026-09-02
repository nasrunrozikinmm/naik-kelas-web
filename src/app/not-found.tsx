import HomeIcon from "@mui/icons-material/Home";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Link from "next/link";

export default function NotFound() {
  return (
    <Box component="main" sx={{ py: 6 }}>
      <Container maxWidth="sm">
        <Stack spacing={2} alignItems="flex-start">
          <Typography component="h1" variant="h2">
            Halaman tidak ditemukan
          </Typography>
          <Button href="/" LinkComponent={Link} startIcon={<HomeIcon />} variant="contained">
            Kembali
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}


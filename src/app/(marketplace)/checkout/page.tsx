import PaymentIcon from "@mui/icons-material/Payment";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";

export default function CheckoutPage() {
  return (
    <Box component="main" sx={{ py: 4 }}>
      <Container maxWidth="md">
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={2} alignItems="flex-start">
            <PaymentIcon color="primary" />
            <Typography component="h1" variant="h2">
              Checkout
            </Typography>
            <Typography color="text.secondary">Ringkasan order dan pembayaran akan memakai kontrak idempotency backend.</Typography>
            <Button variant="contained">Bayar</Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}


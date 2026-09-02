import type { Metadata } from "next";
import { Providers } from "@/providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Naik Kelas",
  description: "Marketplace kursus dan private online"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL,GRAD,opsz@400,0,0,24&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


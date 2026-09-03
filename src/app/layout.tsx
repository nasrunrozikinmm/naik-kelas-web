import type { Metadata } from "next";
import { Providers } from "@/providers";
import "@/styles/globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3030";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Naik Kelas",
  description: "Marketplace kursus dan private online",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    shortcut: "/favicon.ico",
    apple: [{ url: "/brand/naik-kelas-mark.png", type: "image/png", sizes: "160x160" }],
  },
  openGraph: {
    title: "Naik Kelas",
    description: "Marketplace kursus dan private online",
    images: [{ url: "/brand/naik-kelas-lockup-light.jpg", width: 1264, height: 843, alt: "Naik Kelas" }],
  },
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

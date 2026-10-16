import type { Metadata } from "next";
import "@fontsource/epilogue/900.css";
import "@fontsource/dm-sans/400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tagback: QR bag tags",
  description: "Privacy-preserving QR bag tags for lost-item recovery",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

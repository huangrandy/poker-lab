import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Poker Hand Demo",
  description: "Interactive two-card poker hand with hover tilt and flips.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#07150d] antialiased">{children}</body>
    </html>
  );
}

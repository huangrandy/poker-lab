import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Poker Lab",
  description: "Poker demo hub with a flip animation page and a table layout page.",
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

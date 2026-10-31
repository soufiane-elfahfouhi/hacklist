import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hacklist - Precision Task Management & Antigravity MCP",
  description: "Reverse-engineered productivity web app with Google Calendar sync and Antigravity MCP integration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CapstoneX — AI-Powered Academic Project Governance",
  description: "CapstoneX is an AI-powered platform for managing capstone projects, team formation, logbook tracking, evaluation, and risk prediction in academic institutions.",
  keywords: ["capstone", "academic", "project management", "AI", "evaluation", "logbook"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}

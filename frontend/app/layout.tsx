import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CapstoneX",
  description: "CapstoneX is an AI-powered platform for managing capstone projects, team formation, logbook tracking, evaluation, and risk prediction in academic institutions.",
  keywords: ["capstone", "academic", "project management", "AI", "evaluation", "logbook"],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#D2232A',
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        {/* Skip-to-content link for keyboard navigation — a11y */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1E293B', color: '#fff', fontSize: '14px', borderRadius: '8px' } }} />
        {children}
      </body>
    </html>
  );
}

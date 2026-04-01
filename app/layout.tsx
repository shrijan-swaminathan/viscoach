import type { Metadata } from "next";
import { AppStateProvider } from "@/components/app-state-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "VisCoach",
  description:
    "A browser-based AI form coach demo with guided onboarding, live pose feedback, and local progress tracking."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-ink text-white antialiased">
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}

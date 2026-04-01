import { CoachShell } from "@/components/coach-shell";

export default function CoachLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <CoachShell>{children}</CoachShell>;
}

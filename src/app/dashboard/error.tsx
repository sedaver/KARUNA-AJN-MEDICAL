"use client";
import { ErrorState } from "@/components/ui";
export default function DashboardError({ reset }: { reset: () => void }) {
  return <ErrorState retry={reset} />;
}

import { notFound } from "next/navigation";
export const dynamicParams = false;
export function generateStaticParams(): { id: string }[] {
  return [];
}
// No camp is published in Phase 1. Unknown IDs must not reveal private camps.
export default function CampDetail() {
  notFound();
}

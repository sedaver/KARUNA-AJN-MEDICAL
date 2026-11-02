import Link from "next/link";
export function Pagination({ page, count, href, parameter = "page" }: { page: number; count: number; href: string; parameter?: "page" | "consents" }) {
  const separator = href.includes("?") ? "&" : "?";
  return <nav className="operation-pagination" aria-label="Results pages"><span>{count} records · Page {page}</span>{page > 1 && <Link className="text-link" href={`${href}${separator}${parameter}=${page - 1}`}>← Previous</Link>}{page * 25 < count && <Link className="text-link" href={`${href}${separator}${parameter}=${page + 1}`}>Next →</Link>}</nav>;
}
export function AccessNotice() { return <section className="card"><h1>Access is limited</h1><p>Your current role does not have permission to view this workspace section. Contact your trust administrator.</p><Link className="text-link" href="/dashboard">Back to workspace →</Link></section>; }

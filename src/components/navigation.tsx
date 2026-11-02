"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
const publicLinks = [
  ["/", "Home"],
  ["/about", "About"],
  ["/camps", "Eye camps"],
  ["/gallery", "Gallery"],
  ["/contact", "Contact"],
];
export const dashboardLinks = [
  ["/dashboard", "Overview"],
  ["/dashboard/camps", "Camps"],
  ["/dashboard/patients", "Patients"],
  ["/dashboard/referrals", "Referrals"],
  ["/dashboard/follow-ups", "Follow-ups"],
  ["/dashboard/reports", "Reports"],
  ["/dashboard/gallery", "Gallery"],
  ["/dashboard/users", "Users"],
  ["/dashboard/settings", "Settings"],
];
export function Navigation({ dashboard = false }: { dashboard?: boolean }) {
  const path = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === path;
  const setOpen = (value: boolean) => setOpenPath(value ? path : null);
  return (
    <div className={dashboard ? "portal-navigation" : "public-navigation"}>
      <button
        className="nav-toggle button secondary"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-controls={dashboard ? "staff-nav" : "public-nav"}
        onClick={() => setOpen(!open)}
      >
        {open ? "Close" : "Menu"} <span aria-hidden>☰</span>
      </button>
      <nav
        id={dashboard ? "staff-nav" : "public-nav"}
        aria-label={dashboard ? "Staff navigation" : "Main navigation"}
        className={open ? "is-open" : ""}
      >
        {(dashboard ? dashboardLinks : publicLinks).map(
          ([href, label], index) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {dashboard && (
                <span className="nav-index" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
              {label}
            </Link>
          ),
        )}
        {!dashboard && (
          <Link href="/login" className="staff-link">
            Staff login <span aria-hidden>↗</span>
          </Link>
        )}
      </nav>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PodFlowMark } from "@/components/marketing/icons";
import type { DevPreviewSession } from "@/lib/dev-session";
import {
  OverviewIcon,
  KnowledgeIcon,
  ChatIcon,
  PresentationIcon,
  ExportIcon,
  IntegrationsIcon,
  SignOutIcon,
  MenuIcon,
  CloseIcon,
} from "./icons";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Nav items
// ---------------------------------------------------------------------------
interface NavItem {
  href: string;
  label: string;
  Icon: React.FC<{ className?: string }>;
  preview?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", Icon: OverviewIcon },
  { href: "/dashboard/knowledge", label: "Knowledge", Icon: KnowledgeIcon, preview: true },
  { href: "/dashboard/chat", label: "Chat", Icon: ChatIcon, preview: true },
  { href: "/dashboard/presentations", label: "Presentations", Icon: PresentationIcon, preview: true },
  { href: "/dashboard/exports", label: "Exports", Icon: ExportIcon, preview: true },
  { href: "/dashboard/integrations", label: "Integrations", Icon: IntegrationsIcon, preview: true },
];

// ---------------------------------------------------------------------------
// Single nav link
// ---------------------------------------------------------------------------
function NavLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
}) {
  const { href, label, Icon, preview } = item;

  // Preview destinations aren't built yet — render a non-navigating button-like element
  if (preview) {
    return (
      <span
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium cursor-not-allowed select-none",
          "text-muted/60",
        )}
        title={`${label} — coming soon`}
        aria-disabled="true"
      >
        <Icon className="size-[18px] shrink-0 text-muted/40" />
        <span className="flex-1">{label}</span>
        <span className="rounded-full bg-tint px-1.5 py-0.5 text-[10px] font-semibold text-primary/70">
          Soon
        </span>
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors duration-150",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
        active
          ? "bg-tint text-primary"
          : "text-body hover:bg-paper hover:text-ink",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon
        className={cn(
          "size-[18px] shrink-0 transition-colors duration-150",
          active ? "text-primary" : "text-muted group-hover:text-ink",
        )}
      />
      <span className="flex-1">{label}</span>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Sidebar content (shared between desktop and mobile drawer)
// ---------------------------------------------------------------------------
function SidebarContent({
  session,
  pathname,
  onSignOut,
  onLinkClick,
}: {
  session: DevPreviewSession;
  pathname: string;
  onSignOut: () => void;
  onLinkClick?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b border-line px-4">
        <Link
          href="/dashboard"
          onClick={onLinkClick}
          className="inline-flex items-center gap-2.5 rounded-md text-[16px] font-semibold tracking-tight text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          aria-label="PodFlow dashboard"
        >
          <PodFlowMark className="size-7" />
          <span>PodFlow</span>
        </Link>
      </div>

      {/* Nav */}
      <nav aria-label="Dashboard navigation" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5" role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                active={pathname === item.href}
                onClick={onLinkClick}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer: account + sign-out */}
      <div className="shrink-0 border-t border-line px-3 py-3">
        {/* Developer-preview badge */}
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2">
          <span
            className="flex size-5 shrink-0 items-center justify-center rounded bg-amber-400 text-[9px] font-bold text-white"
            aria-hidden="true"
          >
            DEV
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-amber-800">
              Developer Preview
            </p>
            <p className="truncate text-[11px] text-amber-700">
              Mock session — not real auth
            </p>
          </div>
        </div>

        {/* Account row */}
        <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[13px] font-semibold text-primary"
            aria-hidden="true"
          >
            {session.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">{session.displayName}</p>
            <p className="truncate text-[11px] text-muted">{session.displayEmail}</p>
          </div>
        </div>

        {/* Back to website */}
        <Link
          href="/"
          className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-paper hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <span aria-hidden="true" className="text-base leading-none">←</span>
          <span>Back to Website</span>
        </Link>

        {/* Sign out */}
        <button
          type="button"
          id="dashboard-sign-out"
          onClick={onSignOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-paper hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <SignOutIcon className="size-4 shrink-0" />
          Sign out of preview
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top bar for mobile
// ---------------------------------------------------------------------------
function TopBar({
  onMenuOpen,
}: {
  onMenuOpen: () => void;
}) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-line bg-surface px-4 md:hidden">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-[15px] font-semibold text-ink"
        aria-label="PodFlow dashboard"
      >
        <PodFlowMark className="size-6" />
        <span>PodFlow</span>
      </Link>
      <button
        type="button"
        id="mobile-menu-open"
        onClick={onMenuOpen}
        className="rounded-lg p-2 text-muted transition-colors hover:bg-paper hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        aria-label="Open navigation menu"
        aria-expanded={false}
        aria-haspopup="dialog"
      >
        <MenuIcon className="size-5" />
      </button>
    </header>
  );
}

// ---------------------------------------------------------------------------
// App shell
// ---------------------------------------------------------------------------
export function DashboardShell({
  session,
  onSignOut,
  children,
}: {
  session: DevPreviewSession;
  onSignOut: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="flex min-h-screen bg-paper">
      {/* ---------------------------------------------------------------- */}
      {/* Desktop sidebar                                                    */}
      {/* ---------------------------------------------------------------- */}
      <aside
        className="hidden w-60 shrink-0 border-r border-line bg-surface md:flex md:flex-col"
        aria-label="Application sidebar"
      >
        <SidebarContent
          session={session}
          pathname={pathname}
          onSignOut={onSignOut}
        />
      </aside>

      {/* ---------------------------------------------------------------- */}
      {/* Mobile drawer overlay                                              */}
      {/* ---------------------------------------------------------------- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            aria-hidden="true"
            onClick={closeMobile}
          />
          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 w-72 bg-surface shadow-lift">
            <div className="absolute right-3 top-3">
              <button
                type="button"
                id="mobile-menu-close"
                onClick={closeMobile}
                className="rounded-lg p-2 text-muted hover:bg-paper hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                aria-label="Close navigation menu"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>
            <SidebarContent
              session={session}
              pathname={pathname}
              onSignOut={onSignOut}
              onLinkClick={closeMobile}
            />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Main content area                                                  */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile top bar */}
        <TopBar onMenuOpen={() => setMobileOpen(true)} />

        {/* Page content */}
        <main id="dashboard-main" className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

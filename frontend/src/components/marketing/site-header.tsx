import { MobileNav } from "./mobile-nav";
import { PodFlowMark } from "./icons";

export const NAV_LINKS = [
  { href: "#workflow", label: "How it works" },
  { href: "#memory-clips", label: "Memory clips" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#questions", label: "FAQ" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-3 z-40 mx-auto w-full max-w-7xl px-4">
      <div className="relative mx-auto flex h-16 w-full items-center justify-between gap-4 rounded-xl border border-line bg-paper/95 px-4 shadow-card backdrop-blur sm:px-6">
        <a
          href="#top"
          className="inline-flex items-center gap-2.5 rounded-md text-base font-semibold tracking-tight text-ink"
          aria-label="PodFlow, back to top"
        >
          <PodFlowMark />
          PodFlow
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="m-0 flex list-none items-center gap-8 p-0 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="link-quiet">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <a href="#waitlist" className="btn btn-primary hidden sm:inline-flex">
            Get early access
          </a>
          <MobileNav links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}

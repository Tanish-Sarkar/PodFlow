import { MobileNav } from "./mobile-nav";
import { PodFlowMark } from "./icons";

export const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#use-cases", label: "Use cases" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95">
      <div className="relative mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="inline-flex items-center gap-2.5 rounded-md text-[17px] font-semibold tracking-tight text-ink"
          aria-label="PodFlow, back to top"
        >
          <PodFlowMark />
          PodFlow
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="m-0 flex list-none items-center gap-8 p-0 text-[15px] font-medium">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="link-quiet">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a href="#artifact" className="btn btn-primary hidden sm:inline-flex">
            Preview an artifact
          </a>
          <MobileNav links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}

import { PodFlowMark } from "./icons";
import { Container } from "./section";
import { NAV_LINKS } from "./site-header";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <Container className="flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <a
            href="#top"
            className="inline-flex items-center gap-2.5 rounded-md text-base font-semibold tracking-tight text-ink"
          >
            <PodFlowMark className="size-6" />
            PodFlow
          </a>
          <p className="mt-3 text-sm leading-relaxed text-body">
            A knowledge workspace for evidence-linked research. Sample content on this page is
            illustrative.
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm font-medium sm:flex-row sm:gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="link-quiet inline-flex min-h-9 items-center">
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#chat" className="link-quiet inline-flex min-h-9 items-center">
                Scoped chat
              </a>
            </li>
            <li>
              <a href="#connect" className="link-quiet inline-flex min-h-9 items-center">
                Connectors
              </a>
            </li>
          </ul>
        </nav>
      </Container>
    </footer>
  );
}

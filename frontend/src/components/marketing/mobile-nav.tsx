"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon, MenuIcon } from "./icons";

type NavLink = { href: string; label: string };

/** Disclosure menu for narrow screens; the desktop links render in the server header. */
export function MobileNav({ links }: { links: readonly NavLink[] }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-11 items-center justify-center rounded-lg border border-line bg-surface text-ink transition-colors hover:border-primary hover:text-primary-hover"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>
      <nav
        id={panelId}
        aria-label="Primary"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-line bg-paper px-4 py-3 shadow-card"
      >
        <ul className="m-0 flex list-none flex-col p-0">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center text-base font-medium text-ink transition-colors hover:text-primary-hover"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#artifact"
          onClick={() => setOpen(false)}
          className="btn btn-primary mt-2 mb-1 w-full sm:hidden"
        >
          Preview an artifact
        </a>
      </nav>
    </div>
  );
}

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
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-11 items-center justify-center rounded-lg border border-line bg-surface text-ink transition-colors duration-300 hover:border-primary hover:text-primary-hover"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>
      <nav
        id={panelId}
        aria-label="Primary"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-20 z-40 overflow-y-auto border-t border-line bg-paper/95 px-6 py-8 backdrop-blur"
      >
        <ul className="m-0 flex list-none flex-col p-0">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center text-xl font-medium text-ink transition-colors duration-300 hover:text-primary-hover"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-4">
          <a
            href="#waitlist"
            onClick={() => setOpen(false)}
            className="btn btn-primary w-full text-center"
          >
            Get early access
          </a>
        </div>
      </nav>
    </div>
  );
}

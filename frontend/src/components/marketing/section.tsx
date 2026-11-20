import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  children,
  dark = false,
  className = "",
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={`max-w-2xl ${className}`}>
      <p
        className={`text-sm font-semibold tracking-wide ${
          dark ? "text-on-dark-accent" : "text-primary-hover"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        id={id}
        className={`mt-3 text-3xl leading-tight font-semibold tracking-[-0.02em] text-balance sm:text-4xl ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {children ? (
        <p
          className={`mt-4 text-base leading-relaxed sm:text-lg sm:leading-relaxed ${
            dark ? "text-on-dark" : "text-body"
          }`}
        >
          {children}
        </p>
      ) : null}
    </div>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Aceternity "Bento Grid", restyled with PodFlow tokens. */
export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => {
  return (
    <ul
      className={cn(
        "m-0 mx-auto grid max-w-7xl list-none grid-cols-1 gap-4 p-0 md:auto-rows-[minmax(19rem,auto)] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </ul>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: ReactNode;
  description?: ReactNode;
  /** Decorative illustration; hidden from assistive technology. */
  header?: ReactNode;
  icon?: ReactNode;
}) => {
  return (
    <li
      className={cn(
        "group/bento flex flex-col justify-between gap-4 rounded-xl border border-line bg-surface p-4 shadow-card transition duration-200 hover:border-primary-soft hover:shadow-lift",
        className,
      )}
    >
      <div aria-hidden="true" className="min-h-0 flex-1">
        {header}
      </div>
      <div className="transition duration-200 group-hover/bento:translate-x-1">
        {icon}
        <h3 className="mt-2 mb-1.5 text-lg font-semibold tracking-tight text-ink">{title}</h3>
        <p className="text-sm leading-relaxed text-body">{description}</p>
      </div>
    </li>
  );
};

import Image from "next/image";
import type { ReactNode } from "react";
import { ChatIcon, DocumentIcon, MailIcon, TasksIcon } from "./icons";
import { Container } from "./section";

/** Inline "pill" that sits in a sentence and scales with the surrounding type. */
function Pill({ icon, tone, children }: { icon: ReactNode; tone: string; children: ReactNode }) {
  return (
    <span className="ml-[0.12em] inline-flex items-center gap-[0.3em] rounded-full border border-line bg-surface py-[0.06em] pr-[0.4em] pl-[0.1em] align-middle shadow-card">
      <span
        aria-hidden="true"
        className={`inline-flex size-[1.05em] items-center justify-center rounded-full text-white ${tone} [&>svg]:size-[0.58em]`}
      >
        {icon}
      </span>
      {children}
    </span>
  );
}

const DESTINATIONS = [
  {
    title: "A presentation view",
    status: "Planned",
    span: "md:col-span-2",
    thumbnail: "/marketing/output-presentation.svg",
    body: "A readable page built from a fixed set of accessible components. Nothing is shared until you create a link yourself.",
  },
  {
    title: "Export files",
    status: "Planned",
    span: "md:col-span-1",
    thumbnail: "/marketing/output-export.svg",
    body: "Markdown, JSON, DOCX, or PDF, generated from the exact artifact version you choose.",
  },
  {
    title: "Email",
    status: "Planned",
    span: "md:col-span-1",
    thumbnail: "/marketing/output-email.svg",
    body: "Shape an artifact into a newsletter and review the recipients before anything is sent.",
  },
  {
    title: "Connectors",
    status: "Planned, not available yet",
    span: "md:col-span-2",
    thumbnail: "/marketing/output-connectors.svg",
    body: "Slack, Notion, ClickUp, and similar tools are candidate destinations. None are available yet, which one comes first is not decided, and every connection will need your explicit approval.",
  },
] as const;

export function ConnectSection() {
  return (
    <section id="connect" aria-labelledby="connect-heading">
      <Container className="py-20 sm:py-24">
        <p className="text-center text-sm font-semibold tracking-wide text-primary-hover">
          Planned connectors
        </p>
        <h2
          id="connect-heading"
          className="mx-auto mt-4 max-w-4xl text-center text-[1.75rem] leading-[1.55] font-semibold tracking-[-0.02em] text-ink sm:text-4xl sm:leading-[1.5] lg:text-[2.75rem]"
        >
          Planned: send what you know to{" "}
          <Pill tone="bg-primary" icon={<ChatIcon />}>
            Slack
          </Pill>
          ,{" "}
          <Pill tone="bg-ink" icon={<DocumentIcon />}>
            Notion
          </Pill>
          ,{" "}
          <Pill tone="bg-evidence" icon={<TasksIcon />}>
            ClickUp
          </Pill>
          ,{" "}
          <Pill tone="bg-body" icon={<MailIcon />}>
            email
          </Pill>{" "}
          and the tools your team already uses.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-body sm:text-lg sm:leading-relaxed">
          PodFlow is designed to plug into the places work happens, so an artifact does not stay
          locked in one app. These connectors are planned; none are live today, and the icons here
          are generic placeholders, not product logos.
        </p>

        <p className="mt-14 mb-4 text-center text-sm font-semibold tracking-wide text-muted uppercase">
          Where an artifact can go
        </p>
        <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-3">
          {DESTINATIONS.map((item) => (
            <li
              key={item.title}
              className={`overflow-hidden rounded-xl border border-line bg-surface shadow-card ${item.span}`}
            >
              <Image
                src={item.thumbnail}
                alt=""
                width={1200}
                height={400}
                className="h-44 w-full object-cover object-center"
              />
              <div className="p-5">
                <p className="m-0 text-xs font-semibold tracking-wide text-evidence uppercase">
                  {item.status}
                </p>
                <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

import { CheckIcon } from "./icons";
import { Container, SectionHeading } from "./section";
import { ScopedChat } from "./scoped-chat";

const POINTS = [
  "Attach one or more artifacts or source collections. Only those are searched.",
  "Add, swap, or remove knowledge mid-conversation. Earlier answers keep the scope they were given.",
  "Every answer shows the passages it used, and says plainly when the evidence is not there.",
] as const;

export function ChatSection() {
  return (
    <section id="chat" aria-labelledby="chat-heading" className="bg-ink">
      <Container className="py-20 sm:py-24">
        <div className="grid gap-12 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:items-start xl:gap-14">
          <div>
            <SectionHeading
              id="chat-heading"
              dark
              eyebrow="Scoped chat"
              title="Ask questions of the knowledge you choose."
            >
              Chat in PodFlow is not a general chatbot. It answers from the artifacts you attach, so
              you can compare focused bodies of knowledge without mixing them together.
            </SectionHeading>
            <ul className="m-0 mt-8 list-none space-y-4 p-0">
              {POINTS.map((point) => (
                <li key={point} className="flex gap-3 text-[15px] leading-relaxed text-on-dark">
                  <CheckIcon className="mt-0.5 size-5 shrink-0 text-on-dark-evidence" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <ScopedChat />
        </div>
      </Container>
    </section>
  );
}

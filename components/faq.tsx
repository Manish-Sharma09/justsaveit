import { Plus } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { faqGroups, type AnswerBlock, type Limits } from "@/lib/seo";

/**
 * The questions people actually type into a search box, answered on the page
 * they land on.
 *
 * Native `<details>` rather than a scripted accordion: it opens without
 * JavaScript, it is keyboard-operable and correctly announced for free, and —
 * the point here — the answers are in the DOM whether or not anything has
 * been clicked, so a crawler reads the same text a visitor does.
 *
 * The answers come from the same blocks that lib/seo.ts serialises into the
 * FAQPage JSON-LD, so the markup can never promise a crawler something the
 * page does not actually say.
 */
export function Faq(limits: Limits) {
  const groups = faqGroups(limits);

  return (
    <section id="faq" className="scroll-mt-24 border-t border-line">
      <div className="shell py-14 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <p className="eyebrow">FAQ</p>
            <h2 className="mt-3 text-title text-balance">
              File transfer questions, answered
            </h2>
          </Reveal>

          {groups.map((group, groupIndex) => (
            <div key={group.title} className={groupIndex === 0 ? "mt-8" : "mt-10"}>
              <Reveal>
                <h3 className="eyebrow">{group.title}</h3>
              </Reveal>

              <div className="mt-3 divide-y divide-line border-y border-line">
                {group.items.map(({ question, answer }, index) => (
                  <Reveal key={question} delay={Math.min(index, 4) * 60}>
                    <details className="group">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 text-[15px] font-medium text-ink transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
                        <h4 className="font-medium">{question}</h4>
                        <Plus
                          aria-hidden
                          className="mt-0.5 size-4 shrink-0 text-mute transition-transform duration-200 group-open:rotate-45"
                        />
                      </summary>
                      <div className="space-y-3 pb-4 pr-8 text-[15px] leading-relaxed text-body">
                        {answer.map((block, blockIndex) => (
                          <Answer key={blockIndex} block={block} />
                        ))}
                      </div>
                    </details>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Answer({ block }: { block: AnswerBlock }) {
  if (typeof block === "string") return <p>{block}</p>;

  return (
    <ul className="space-y-1.5">
      {block.list.map((line) => (
        <li key={line} className="relative pl-4 before:absolute before:left-0 before:text-mute before:content-['—']">
          {line}
        </li>
      ))}
    </ul>
  );
}

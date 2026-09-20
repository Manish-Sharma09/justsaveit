import type { Metadata } from "next";
import { AlertTriangle, Github, Mail, ShieldCheck } from "lucide-react";
import { DocList, DocPage, DocSection } from "@/components/doc-page";
import { Reveal } from "@/components/reveal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "How to reach Just Save It — general questions, privacy and data requests, and " +
    "abuse or copyright takedown reports, each with its own address.",
  alternates: { canonical: "/contact" },
};

const CHANNELS = [
  {
    Icon: Mail,
    title: "General questions",
    email: SITE.contactEmail,
    body: "Anything about how the service works, a feature you wish existed, or a problem you have run into.",
  },
  {
    Icon: ShieldCheck,
    title: "Privacy and data requests",
    email: SITE.privacyEmail,
    body: "Access, correction or early deletion of a drop, and any question about the Privacy Policy.",
  },
  {
    Icon: AlertTriangle,
    title: "Abuse and takedowns",
    email: SITE.abuseEmail,
    body: "Unlawful content, copyright infringement, malware or harassment. This address is read first.",
  },
];

export default function ContactPage() {
  return (
    <DocPage
      title="Contact us"
      lead={
        <>
          There is no ticketing system and no phone queue — just a few addresses, each
          going to the right place. Pick the one that matches what you need.
        </>
      }
    >
      <Reveal>
        <div className="grid gap-3 sm:grid-cols-3">
          {CHANNELS.map(({ Icon, title, email, body }) => (
            <div
              key={title}
              className="flex flex-col rounded-md border border-line bg-surface p-4 transition-colors hover:border-line-strong"
            >
              <Icon aria-hidden className="size-5 text-mute" />
              <p className="mt-3 text-[13px] font-medium text-ink">{title}</p>
              <p className="mt-1.5 flex-1 text-[13px] leading-snug text-mute">{body}</p>
              <a
                href={`mailto:${email}`}
                className="mt-3 break-all font-mono text-[13px] text-accent hover:underline"
              >
                {email}
              </a>
            </div>
          ))}
        </div>
      </Reveal>

      <DocSection title="What to expect">
        <p>
          {SITE.operator} is a small independent project, not a staffed company, so there
          is no same-day guarantee. General questions are usually answered within a few
          working days. Reports of unlawful content are looked at first and acted on as
          quickly as we can manage.
        </p>
        <p>
          Because the service has no accounts, we hold nothing that identifies you. That
          means we cannot look up &ldquo;your drops&rdquo; from an email address — any
          request about a specific drop has to include its short code or full link.
        </p>
      </DocSection>

      <DocSection title="Reporting a drop">
        <p>
          To report content, email{" "}
          <a href={`mailto:${SITE.abuseEmail}`} className="text-accent hover:underline">
            {SITE.abuseEmail}
          </a>{" "}
          and include:
        </p>
        <DocList
          items={[
            "The full link, or the short code, of the drop in question.",
            "What is wrong with it, in a sentence or two.",
            "For a copyright claim: enough detail to identify the work, and confirmation that you are the rights holder or are authorised to act for them.",
            "An address we can reply to.",
          ]}
        />
        <p>
          Drops that appear unlawful are removed without waiting for a legal formality. For
          anything contested, we will tell you what we have done and why.
        </p>
      </DocSection>

      <DocSection title="Bugs and code">
        <p>
          The source is public, and a reproducible bug report is far more useful as an
          issue than as an email — it stays visible to whoever picks it up next.
        </p>
        <p>
          <a
            href={`${SITE.repoUrl}/issues`}
            rel="noopener noreferrer"
            target="_blank"
            className="inline-flex items-center gap-2 text-accent hover:underline"
          >
            <Github aria-hidden className="size-4" />
            Open an issue on GitHub
          </a>
        </p>
      </DocSection>

      <DocSection title="Something urgent and private">
        <p>
          If you have found a security problem, please report it to{" "}
          <a href={`mailto:${SITE.privacyEmail}`} className="text-accent hover:underline">
            {SITE.privacyEmail}
          </a>{" "}
          rather than opening a public issue, and give us a reasonable window to fix it
          before publishing. Good-faith reports are welcome and will not be met with legal
          threats.
        </p>
      </DocSection>
    </DocPage>
  );
}

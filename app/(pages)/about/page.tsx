import type { Metadata } from "next";
import Link from "next/link";
import { DocList, DocPage, DocSection } from "@/components/doc-page";
import { SITE } from "@/lib/site";
import { env } from "@/lib/env";
import { formatBytes } from "@/lib/format";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Why Just Save It exists: a free file transfer tool with no accounts, built on free " +
    "infrastructure, with its limits and its trade-offs stated up front.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <DocPage
      title="About us"
      lead={
        <>
          {SITE.operator} is a small, independent project with one job: move a file or a
          note from one person to another without asking either of them to sign up for
          anything.
        </>
      }
    >
      <DocSection title="Why it exists">
        <p>
          Almost every file transfer service is built for the hard case — a designer
          sending forty gigabytes to a client, with delivery receipts and a branded landing
          page. That is a real problem and other tools solve it well.
        </p>
        <p>
          The common case is not that. It is a screenshot to a colleague, a PDF to an
          accountant, a wifi password read out over a phone call, an API key a contractor
          needs in the next five minutes. For those, the sign-up form is longer than the
          task. {SITE.operator} was built to remove it: open the page, drop the thing in,
          send the link.
        </p>
      </DocSection>

      <DocSection title="What we believe">
        <DocList
          items={[
            <>
              <strong className="font-medium text-ink">No account is the feature.</strong> No
              sign-up means no password of yours to leak, no address to market to and no
              history quietly accumulating against your name.
            </>,
            <>
              <strong className="font-medium text-ink">Say the limits out loud.</strong>{" "}
              {formatBytes(env.maxFileBytes)} per file, {formatBytes(env.maxDropBytes)} per
              transfer, {env.maxFilesPerDrop} files at once. They are on the home page, not
              buried in a pricing table, because a limit you discover halfway through an
              upload is a broken promise.
            </>,
            <>
              <strong className="font-medium text-ink">Do not overstate the security.</strong>{" "}
              Passwords are hashed with scrypt, expiry is enforced by deletion, and content
              is not end-to-end encrypted. We say the last part as loudly as the first two,
              because a service that exaggerates on this subject is worse than one that
              offers nothing at all.
            </>,
            <>
              <strong className="font-medium text-ink">Nothing should outlive its usefulness.</strong>{" "}
              Every drop has a lifetime, and reaching it means the record and its files are
              deleted rather than hidden.
            </>,
          ]}
        />
      </DocSection>

      <DocSection title="Who makes it">
        <p>
          It is built and maintained by {SITE.operatorLegalName} — a small independent
          effort rather than a funded company, which is worth knowing when you decide how
          much to depend on it. There is no sales team to escalate to and no support desk;
          there is an inbox, and it is read.
        </p>
        <p>
          The source is public at{" "}
          <a
            href={SITE.repoUrl}
            rel="noopener noreferrer"
            target="_blank"
            className="text-accent hover:underline"
          >
            github.com/Manish-Sharma09/justsaveit
          </a>
          , so the claims on this site about what is stored and for how long can be checked
          rather than taken on trust.
        </p>
      </DocSection>

      <DocSection title="How it pays for itself">
        <p>
          It does not, really — and that is deliberate. The whole thing runs on free
          infrastructure: a free database cluster doing double duty as file storage, and a
          host&rsquo;s free tier in front of it. There are no paid APIs behind any of it.
        </p>
        <p>
          That is why the limits are what they are, and it is also why there is no paid
          plan and no advertising. There is analytics — Google Analytics, so we can see
          whether anyone actually uses this — but there is no business model that depends
          on your attention, and nothing about you is for sale. The trade-off is honest —
          a smaller ceiling, in exchange for nobody needing to monetise you.
        </p>
      </DocSection>

      <DocSection title="What it is not">
        <p>
          It is not a backup service, a sync service or a place to keep anything long term.
          It keeps no archive and cannot restore an expired drop. It is also not the right
          tool for material that would genuinely harm you if the operator of a server could
          read it; for that, use something built around end-to-end encryption. The{" "}
          <Link href="/privacy" className="text-accent hover:underline">
            Privacy Policy
          </Link>{" "}
          sets out precisely what is stored, and the{" "}
          <Link href="/terms" className="text-accent hover:underline">
            Terms &amp; Conditions
          </Link>{" "}
          what is expected in return.
        </p>
      </DocSection>

      <DocSection title="Get in touch">
        <p>
          Bugs, feature requests, takedown notices and plain curiosity are all welcome —
          the{" "}
          <Link href="/contact" className="text-accent hover:underline">
            contact page
          </Link>{" "}
          has the right address for each.
        </p>
      </DocSection>
    </DocPage>
  );
}

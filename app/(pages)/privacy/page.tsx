import type { Metadata } from "next";
import Link from "next/link";
import { DocCallout, DocList, DocPage, DocSection } from "@/components/doc-page";
import { SITE } from "@/lib/site";
import { env } from "@/lib/env";
import { formatBytes, formatLongDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What Just Save It stores, for how long, and who else sees it. No accounts or " +
    "emails — but we use Google Analytics, and transfers are not end-to-end encrypted.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <DocPage
      title="Privacy Policy"
      updated={formatLongDate(SITE.effectiveDate)}
      lead={
        <>
          {SITE.operator} has no accounts, so there is very little about you to
          collect in the first place. This page says exactly what is stored,
          where, for how long, and what is never gathered at all.
        </>
      }
    >
      <DocCallout title="The short version">
        <p>
          We do not ask for your name, email address or phone number, and there is no
          advertising on this site. We do use Google Analytics to count visits, which sets
          cookies and tells Google which pages were opened. What we hold is the content
          you choose to upload, for as long as you choose to keep it. That content is{" "}
          <strong className="font-medium text-ink">not end-to-end encrypted</strong>, so
          treat the service as convenient rather than confidential.
        </p>
      </DocCallout>

      <DocSection title="Who is responsible">
        <p>
          This policy covers the {SITE.operator} website and service, operated by{" "}
          {SITE.operatorLegalName}. For any question about it, or to make a request about
          your data, write to{" "}
          <a href={`mailto:${SITE.privacyEmail}`} className="text-accent hover:underline">
            {SITE.privacyEmail}
          </a>
          .
        </p>
      </DocSection>

      <DocSection title="What we store">
        <p>Only these things, and nothing else:</p>
        <DocList
          items={[
            <>
              <strong className="font-medium text-ink">The content of a drop.</strong> The
              text you type and the files you upload, up to{" "}
              {formatBytes(env.maxFileBytes)} per file. Stored on our database server so
              that the link works from any device.
            </>,
            <>
              <strong className="font-medium text-ink">A password hash, if you set one.</strong>{" "}
              Hashed with scrypt and a random per-drop salt. The password itself is never
              written to disk and cannot be recovered from the hash — if you forget it, the
              drop cannot be opened by anyone, including us.
            </>,
            <>
              <strong className="font-medium text-ink">Technical facts about the drop.</strong>{" "}
              Its short code, when it was created and last changed, when it expires,
              whether burn-after-read is on, and a count of how many times it has been
              opened. The view count is a number only — it records no detail about who
              opened it.
            </>,
          ]}
        />
      </DocSection>

      <DocSection title="What we do not collect">
        <DocList
          items={[
            "No account, name, email address or phone number — there is nothing to sign up for.",
            "No advertising pixels, no ad networks, and nothing sold or passed to data brokers.",
            "No profile linking one drop to another, and no drop content of any kind sent to analytics.",
            "Fonts are self-hosted rather than loaded from a font CDN.",
          ]}
        />
      </DocSection>

      <DocSection title="IP addresses">
        <p>
          When someone submits a password for a protected drop, the request&rsquo;s IP
          address is used as a rate-limiting key so that passwords cannot be guessed by
          brute force. It is held in the server&rsquo;s memory for a short window and is
          never written to our database, never linked to a drop&rsquo;s content and never
          shared.
        </p>
        <p>
          Separately, our hosting provider and database provider keep their own operational
          logs, which ordinarily include IP addresses, in line with their own retention
          policies. That is standard for any website and is outside our control.
        </p>
      </DocSection>

      <DocSection title="Analytics">
        <p>
          This site uses Google Analytics, so that we can tell whether anyone is actually
          using it. It records page views, the page you arrived from, your approximate
          location from your IP address, and broad device and browser details. Google
          processes this on our behalf and it is not shared with anyone else.
        </p>
        <p>
          Two limits are worth stating. The contents of a drop &mdash; your text, your
          files, their names &mdash; are never sent to analytics. And because a drop&rsquo;s
          URL is its key, any address beginning <code>/r/</code> is replaced with{" "}
          <code>/r/(redacted)</code> before it is reported, so a working link to your
          transfer cannot reach Google through this route.
        </p>
        <p>
          If you would rather not be counted, blocking cookies for this site, using a
          content blocker, or installing Google&rsquo;s{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            className="text-accent hover:underline"
            rel="noreferrer"
            target="_blank"
          >
            opt-out browser add-on
          </a>{" "}
          will all stop it. Nothing on the site stops working if you do.
        </p>
      </DocSection>

      <DocSection title="Cookies and browser storage">
        <p>
          Three mechanisms are used: two that the service needs in order to work, and one
          for the analytics described above.
        </p>
        <DocList
          items={[
            <>
              <strong className="font-medium text-ink">An unlock cookie.</strong> Setting the
              correct password on a protected drop stores one signed, httpOnly cookie
              scoped to that single drop, so you are not asked again on every file. It
              expires after 12 hours and contains no personal data.
            </>,
            <>
              <strong className="font-medium text-ink">Local storage in your browser.</strong>{" "}
              Your list of recent drops and your light/dark preference are kept in your own
              browser. They are never transmitted to us. Clearing your site data removes
              them, and we never held a copy.
            </>,
            <>
              <strong className="font-medium text-ink">Google Analytics cookies.</strong>{" "}
              Set by Google to tell repeat visits apart from new ones. They hold a randomly
              generated identifier rather than anything about you, and expire after up to
              two years. Clearing your site data or blocking cookies removes them.
            </>,
          ]}
        />
      </DocSection>

      <DocSection title="How long we keep things">
        <p>
          You set the lifetime on every drop: 1 hour, 24 hours, 7 days, 30 days, or never.
          Seven days is the default, and burn-after-read shortens it to ten minutes from
          the first time the drop is opened.
        </p>
        <p>
          Expiry is enforced by the database itself through a time-to-live index, which
          removes the drop record and its file data rather than merely hiding them from
          the interface. Drops set to &ldquo;never&rdquo; are kept until you delete them or
          we remove them under the{" "}
          <Link href="/terms" className="text-accent hover:underline">
            Terms &amp; Conditions
          </Link>
          . Ordinary provider backups may retain a copy for a short period after deletion
          before rotating out.
        </p>
      </DocSection>

      <DocSection title="Who else can see your content">
        <DocList
          items={[
            <>
              <strong className="font-medium text-ink">Anyone with the link.</strong> That is
              the design. A drop is not listed anywhere and its code is not guessable, but
              it is not a secret either — treat the link as the key, and add a password
              when the content warrants one.
            </>,
            <>
              <strong className="font-medium text-ink">Our infrastructure providers.</strong>{" "}
              The service runs on third-party hosting and a third-party managed database.
              They process data on our behalf in order to run the service.
            </>,
            <>
              <strong className="font-medium text-ink">Google Analytics.</strong> Receives
              page views and the technical details listed under{" "}
              <em>Analytics</em> above. It never receives the contents of a drop, and drop
              addresses are redacted before they are reported.
            </>,
            <>
              <strong className="font-medium text-ink">A live-sync server, where enabled.</strong>{" "}
              If real-time collaboration is switched on for this deployment, drop updates
              pass through a separate synchronisation service. It is optional and the
              service works fully without it.
            </>,
            <>
              <strong className="font-medium text-ink">Nobody else.</strong> We do not sell
              or rent your content or your data, and none of it goes to advertisers or data
              brokers. Beyond the providers named above, nobody else receives it.
            </>,
          ]}
        />
      </DocSection>

      <DocSection title="Encryption, stated plainly">
        <p>
          Traffic between your browser and the service is encrypted in transit over HTTPS,
          and stored content is protected by our providers&rsquo; encryption at rest. But
          content is <strong className="font-medium text-ink">not end-to-end encrypted</strong>:
          it is held in a form the server can read, which is what allows a plain link to
          work on any device without a secret embedded in it.
        </p>
        <p>
          A password controls who may open a drop. It is not a key that we lack. If it
          would genuinely harm you for the operator of a service to be able to read
          something, please use a tool built around end-to-end encryption instead of this
          one.
        </p>
      </DocSection>

      <DocSection title="Your rights">
        <p>
          Because there is no account, the fastest route is usually direct: open a drop you
          created and delete it, or let its expiry run out. If you need something else —
          access to what is held about a drop, correction, or erasure before expiry —
          write to{" "}
          <a href={`mailto:${SITE.privacyEmail}`} className="text-accent hover:underline">
            {SITE.privacyEmail}
          </a>{" "}
          with the drop&rsquo;s short code. Depending on where you live you may also have a
          right to complain to your national data-protection authority.
        </p>
        <p>
          Please note that having no accounts cuts both ways: we usually cannot verify who
          created a drop, so for anything beyond deletion we may only be able to act on a
          request from someone who can demonstrate knowledge of the code and password.
        </p>
      </DocSection>

      <DocSection title="Children">
        <p>
          The service is not directed at children under 13, and we do not knowingly collect
          data from them. Since no personal data is requested from anyone, this rarely
          arises, but if you believe a child has uploaded personal information, tell us at{" "}
          <a href={`mailto:${SITE.privacyEmail}`} className="text-accent hover:underline">
            {SITE.privacyEmail}
          </a>{" "}
          and we will remove it.
        </p>
      </DocSection>

      <DocSection title="Changes to this policy">
        <p>
          If this policy changes, the date at the top of the page changes with it. Material
          changes will be summarised here rather than slipped in quietly. Continuing to use
          the service after a change means you accept the updated policy.
        </p>
      </DocSection>
    </DocPage>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { DocCallout, DocList, DocPage, DocSection } from "@/components/doc-page";
import { SITE } from "@/lib/site";
import { env } from "@/lib/env";
import { formatBytes, formatLongDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms for using Just Save It: acceptable use, content ownership, takedown " +
    "requests, expiry and the limits of a free file transfer service.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <DocPage
      title="Terms & Conditions"
      updated={formatLongDate(SITE.effectiveDate)}
      lead={
        <>
          The rules for using {SITE.operator}. They are short, because the service is
          short: you put something in, you get a link, and the link expires.
        </>
      }
    >
      <DocCallout title="Two things to know before you rely on this service">
        <p>
          It is free, provided as-is, and offers no guarantee of availability. And it keeps
          no backups — when a drop expires it is gone, so never let this be the only copy
          of anything you cannot lose.
        </p>
      </DocCallout>

      <DocSection number={1} title="Agreement">
        <p>
          By using {SITE.operator} you agree to these terms. If you do not agree with them,
          please do not use the service. They apply whether you are creating a drop or
          opening someone else&rsquo;s link.
        </p>
      </DocSection>

      <DocSection number={2} title="What the service is">
        <p>
          {SITE.operator} stores text and files you submit and makes them available at a
          short code and link, until a lifetime you choose runs out. It requires no account
          and is offered free of charge. Current limits are{" "}
          {formatBytes(env.maxFileBytes)} per file, {formatBytes(env.maxDropBytes)} per
          drop and {env.maxFilesPerDrop} files at a time; these may change.
        </p>
      </DocSection>

      <DocSection number={3} title="Acceptable use">
        <p>
          You are responsible for everything you upload. You must not use the service to
          store, send or distribute:
        </p>
        <DocList
          items={[
            "Anything unlawful where you are, where the recipient is, or where the service is hosted.",
            "Material that infringes someone else’s copyright, trademark or other rights, unless you hold those rights or have permission.",
            "Child sexual abuse material, or content that sexualises minors, in any form.",
            "Malware, ransomware, phishing kits, credential-stuffing lists or anything intended to compromise a system or a person.",
            "Content that harasses, threatens, defames or doxxes someone, or that incites violence.",
            "Another person’s private or personal data, where you have no right to share it.",
            "Spam, or bulk automated uploads that degrade the service for everyone else.",
          ]}
        />
        <p>
          You must not attempt to break, overload, reverse-engineer or circumvent the
          service&rsquo;s limits and protections, or try to enumerate or access drops that
          are not yours.
        </p>
      </DocSection>

      <DocSection number={4} title="Your content stays yours">
        <p>
          You keep every right you had in what you upload. You grant us only the narrow,
          non-exclusive licence needed to actually run the service — to store, copy and
          transmit your content so that it can be delivered to whoever opens the link — and
          that licence ends when the content is deleted or expires. We do not use uploaded
          content for any other purpose, and we do not train anything on it.
        </p>
        <p>
          You confirm that you have the right to upload and share what you upload.
        </p>
      </DocSection>

      <DocSection number={5} title="Links are the key">
        <p>
          A drop is available to anyone holding its link or short code. Sharing that link
          is your decision and your responsibility. Add a password when the content calls
          for one, and remember that content is not end-to-end encrypted — see the{" "}
          <Link href="/privacy" className="text-accent hover:underline">
            Privacy Policy
          </Link>{" "}
          for exactly what that means.
        </p>
      </DocSection>

      <DocSection number={6} title="Expiry, deletion and no backups">
        <p>
          Every drop expires on the schedule you pick, and expiry is enforced by deletion
          rather than by hiding. We keep no archive of expired drops and cannot restore
          one. Treat {SITE.operator} as transport, never as storage: keep your own copy of
          anything that matters.
        </p>
      </DocSection>

      <DocSection number={7} title="Removal and suspension">
        <p>
          We may remove any drop and block access to the service, without notice, where we
          reasonably believe these terms have been broken, where we are required to by law,
          or where content is reported to us and appears unlawful. Given the volume a free
          service attracts, we do not review content proactively and rely on reports.
        </p>
      </DocSection>

      <DocSection number={8} title="Reporting content">
        <p>
          To report abuse, or to make a copyright or other takedown request, email{" "}
          <a href={`mailto:${SITE.abuseEmail}`} className="text-accent hover:underline">
            {SITE.abuseEmail}
          </a>
          . Include the drop&rsquo;s full link or short code, what is wrong with it, and —
          for a rights claim — enough detail to identify the work and to show you are the
          rights holder or act for them. Full instructions are on the{" "}
          <Link href="/contact" className="text-accent hover:underline">
            contact page
          </Link>
          .
        </p>
      </DocSection>

      <DocSection number={9} title="No warranty">
        <p>
          The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, with
          no warranty of any kind, express or implied, including any warranty of
          merchantability, fitness for a particular purpose or non-infringement. We do not
          promise that it will be available, uninterrupted, timely, secure or error-free,
          nor that any file will remain retrievable for any period.
        </p>
      </DocSection>

      <DocSection number={10} title="Limitation of liability">
        <p>
          To the fullest extent the law allows, {SITE.operatorLegalName} is not liable for
          any indirect, incidental, special or consequential loss, nor for any loss of
          data, profits, revenue or goodwill, arising from your use of or inability to use
          the service — including loss caused by a drop expiring, being deleted, being
          accessed by someone holding the link, or being unavailable.
        </p>
        <p>
          Nothing in these terms excludes liability that cannot lawfully be excluded, such
          as liability for death or personal injury caused by negligence, or for fraud.
          Some jurisdictions do not allow certain exclusions, in which case the narrowest
          exclusion permitted there applies instead.
        </p>
      </DocSection>

      <DocSection number={11} title="Indemnity">
        <p>
          You agree to indemnify {SITE.operatorLegalName} against any claim, demand, loss
          or cost — including reasonable legal fees — arising from content you upload or
          share, or from your breach of these terms or of anyone else&rsquo;s rights.
        </p>
      </DocSection>

      <DocSection number={12} title="Changes to the service and to these terms">
        <p>
          The service is developed continuously, and features, limits and these terms may
          change or be withdrawn at any time. When the terms change, the date at the top of
          this page changes with them; continuing to use the service afterwards means you
          accept the revised terms.
        </p>
      </DocSection>

      <DocSection number={13} title="Governing law">
        <p>
          These terms are governed by the laws of {SITE.governingLaw}, and the courts of{" "}
          {SITE.governingLaw} have exclusive jurisdiction over any dispute arising from
          them — without affecting any mandatory consumer-protection right you have where
          you live.
        </p>
      </DocSection>

      <DocSection number={14} title="Contact">
        <p>
          Questions about these terms go to{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-accent hover:underline">
            {SITE.contactEmail}
          </a>
          . Reports of abuse or infringement go to{" "}
          <a href={`mailto:${SITE.abuseEmail}`} className="text-accent hover:underline">
            {SITE.abuseEmail}
          </a>
          , which is monitored first.
        </p>
      </DocSection>
    </DocPage>
  );
}

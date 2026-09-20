import type { Metadata } from "next";
import Image from "next/image";
import { ShieldOff, Timer, Zap } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Composer } from "@/components/composer";
import { OpenDrop } from "@/components/open-drop";
import { RecentDrops } from "@/components/recent-drops";
import { Reveal } from "@/components/reveal";
import { FlowGraphic } from "@/components/flow-graphic";
import { ArtDropIn, ArtGetCode, ArtSendOn } from "@/components/step-art";
import { TransferGuide } from "@/components/transfer-guide";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/faq";
import { env } from "@/lib/env";
import { formatBytes } from "@/lib/format";
import { homeJsonLd, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

export const metadata: Metadata = {
  // `absolute` opts out of the "%s · Just Save It" template: the home title
  // already carries the brand, and a doubled one wastes the 60 characters a
  // result actually shows.
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

const STEPS = [
  {
    Art: ArtDropIn,
    title: "Drop it in",
    body: "Text, images, video, PDFs, documents — or all of them at once. Drag onto the page or paste straight in.",
  },
  {
    Art: ArtGetCode,
    title: "Get a code",
    body: "Every drop gets a short code and its own link. Pick your own name if you would rather.",
  },
  {
    Art: ArtSendOn,
    title: "Send it on",
    body: "Copy the link, scan the QR, or share it anywhere. Whoever opens it needs no account either.",
  },
];

const PROMISES = [
  { Icon: ShieldOff, label: "No sign-up", detail: "Nothing to register, nothing to verify." },
  { Icon: Timer, label: "Expires on its own", detail: "Set a lifetime; it deletes itself." },
  { Icon: Zap, label: "Free to run", detail: "No paid APIs behind any of it." },
];

export default function HomePage() {
  const limits = {
    maxFileBytes: env.maxFileBytes,
    maxDropBytes: env.maxDropBytes,
    maxFilesPerDrop: env.maxFilesPerDrop,
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <JsonLd data={homeJsonLd(limits)} />
      <SiteHeader floating />

      {/* The stage is pulled up behind the sticky header so the nav pill floats
          inside the hero panel rather than sitting on the page above it. Each
          offset is that header's full height — its padding plus h-14 — at the
          matching breakpoint; see the note in components/site-header.tsx. */}
      <main id="main" className="-mt-[80px] flex-1 sm:-mt-[92px] lg:-mt-[104px]">
        {/* ------------------------------------------------------- hero -- */}
        <section className="relative isolate p-3 pb-12 sm:p-5 sm:pb-16 lg:p-8 lg:pb-20">
          {/* The sky the panel floats on. Only the hero has it: past the fold
              the page goes back to its own canvas. */}
          <div aria-hidden className="absolute inset-0 -z-10">
            <Image
              src="/sky.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover dark:brightness-[0.38] dark:saturate-[0.8]"
            />
          </div>

          {/* No `overflow-hidden`: the hands below have to reach past the
              panel's edges. Everything that would otherwise need clipping
              carries the panel's own radius instead. */}
          <div className="stage relative rounded-[24px] shadow-lift sm:rounded-[32px]">
            <span aria-hidden className="grain rounded-[inherit]" />

            {/* Michelangelo's hands, cut in two and pushed out to the edges of
                the window so the card sits in the gap between the fingertips.
                Each is sized to the space beside the card, so the reach is the
                same shape at every width. Below `lg` there is no such space,
                and they are dropped rather than shrunk into nonsense. */}
            <Image
              src="/hand-left.png"
              alt=""
              aria-hidden
              width={707}
              height={322}
              loading="eager"
              sizes="(min-width: 1024px) 34vw, 0px"
              className="pointer-events-none absolute -left-3 top-[34%] hidden h-auto w-[calc((100%-36rem)/2)] max-w-[46rem] select-none dark:brightness-[0.82] sm:-left-5 lg:-left-8 lg:block"
            />
            <Image
              src="/hand-right.png"
              alt=""
              aria-hidden
              width={721}
              height={299}
              loading="eager"
              sizes="(min-width: 1024px) 34vw, 0px"
              className="pointer-events-none absolute -right-3 top-[46%] hidden h-auto w-[calc((100%-36rem)/2)] max-w-[46rem] select-none dark:brightness-[0.82] sm:-right-5 lg:-right-8 lg:block"
            />

            <div className="shell relative z-1 flex flex-col items-center pb-10 pt-28 sm:pb-14 sm:pt-32 lg:pb-16 lg:pt-36">
              <Reveal className="w-full max-w-2xl text-center">
                <p className="eyebrow text-lemon drop-shadow-[0_1px_2px_rgb(0_0_0/0.25)]">
                  Free file transfer · No login · No tracking
                </p>

                {/* The one place on the site set in a serif. Optical sizes this
                    large want the display face, and the contrast against the
                    card's Geist is what makes the card read as a separate
                    object rather than as more of the headline. */}
                <h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,4.25rem)] font-normal leading-[1.04] tracking-[-0.02em] text-balance text-white drop-shadow-[0_2px_12px_rgb(0_0_0/0.22)]">
                  Free &amp; secure file transfer
                </h1>

                <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-pretty text-white/85">
                  Send files or text from any browser — Android, iPhone or
                  desktop — and get back a short code and a link. No sign-up, no
                  app, and the person opening it needs no account either.
                </p>
              </Reveal>

              <Reveal delay={100} className="mt-8 w-full max-w-xl sm:mt-10">
                <div id="composer" className="scroll-mt-24">
                  <Composer maxFileBytes={env.maxFileBytes} />
                </div>
              </Reveal>

              {/* Sits in the slot the reference gives its trust strip: a band
                  tucked under the card, half on the mesh. */}
              <Reveal delay={180} className="mt-4 w-full max-w-xl">
                <div id="open" className="glass scroll-mt-24 rounded-xl p-3 sm:p-4">
                  <h2 className="eyebrow mb-2.5">Have a code already?</h2>
                  <OpenDrop />
                </div>
              </Reveal>

              <Reveal delay={240} className="mt-10 w-full sm:mt-14">
                <dl className="mx-auto grid max-w-3xl gap-x-8 gap-y-6 sm:grid-cols-3">
                  {PROMISES.map(({ Icon, label, detail }) => (
                    <div key={label} className="text-center sm:text-left">
                      <dt className="flex items-center justify-center gap-2 text-[13px] font-medium text-white sm:justify-start">
                        <Icon aria-hidden className="size-4 shrink-0 text-lemon" />
                        {label}
                      </dt>
                      <dd className="mt-1 text-[13px] leading-snug text-pretty text-white/75">
                        {detail}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Drops this browser has seen — off the stage, so the mesh stays the
            one uninterrupted picture. Renders nothing when there are none. */}
        <div className="shell mx-auto max-w-xl pb-12 empty:hidden sm:pb-16">
          <RecentDrops />
        </div>

        {/* -------------------------------------------------- how it works */}
        <section id="how" className="scroll-mt-24 border-y border-line bg-surface">
          <div className="shell py-14 sm:py-16">
            <Reveal>
              <h2 className="max-w-md text-title text-balance">
                Three steps, no detours.
              </h2>
            </Reveal>

            {/* Explains the whole product in one picture. */}
            <Reveal delay={80}>
              <FlowGraphic className="mx-auto mt-9 w-full max-w-lg" />
            </Reveal>

            <ol className="mt-9 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
              {STEPS.map(({ Art, title, body }, index) => (
                <Reveal
                  key={title}
                  as="li"
                  delay={index * 110}
                  className="group flex flex-col gap-4 bg-surface p-5 transition-colors hover:bg-canvas sm:p-6"
                >
                  {/* The art sits in an inset well so it reads as an
                      illustration rather than a mark floating in the tile. */}
                  <div className="relative overflow-hidden rounded-sm border border-line bg-canvas px-4 py-5">
                    <span
                      className="absolute right-2.5 top-2 font-mono text-xs text-faint"
                      data-numeric
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Art className="mx-auto h-20 w-auto" />
                  </div>
                  <h3 className="text-heading">{title}</h3>
                  <p className="text-sm leading-relaxed text-body">{body}</p>
                </Reveal>
              ))}
            </ol>

            <Reveal delay={200}>
              <p className="mt-6 font-mono text-xs text-mute" data-numeric>
                Limits — {formatBytes(env.maxFileBytes)} per file ·{" "}
                {formatBytes(env.maxDropBytes)} per drop · {env.maxFilesPerDrop} files
              </p>
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------------ privacy -- */}
        <section id="plainly" className="shell scroll-mt-24 py-14 sm:py-16">
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-12">
            <Reveal>
              <h2 className="text-title text-balance">Plainly, what this does.</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-body">
                Drops are stored on the server so that a link works from any
                device. A password gates access and is stored only as a salted
                hash — but the content itself is not end-to-end encrypted, so
                treat this as convenient, not confidential.
              </p>
            </Reveal>

            <div className="space-y-3">
              {[
                "Anyone with the link can open a drop. That is the point — keep the link to the people you meant.",
                "Expiry is enforced by the database, so an expired drop and its files really are gone.",
                "Recent drops live in your browser, never on the server. No analytics, no accounts, no email.",
              ].map((line, index) => (
                <Reveal key={line} delay={index * 90}>
                  <p className="border-l-2 border-line pl-4 text-sm leading-relaxed text-body transition-colors hover:border-accent">
                    {line}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        <TransferGuide {...limits} />

        <Faq {...limits} />
      </main>

      <SiteFooter />
    </div>
  );
}

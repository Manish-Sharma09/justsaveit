import { Check, Minus } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { formatBytes } from "@/lib/format";
import type { Limits } from "@/lib/seo";

/**
 * The long-form section: what the tool is, what it costs, what "secure" means
 * here and where it sits next to the large-file services.
 *
 * Set on a single reading measure rather than the page's usual grid — this is
 * prose, and prose wants about 70 characters a line. The tiles and the table
 * break it up so it reads as a page rather than as a wall put there for a
 * crawler.
 */

const COMPARISON: Array<{ feature: string; here: boolean; email: boolean; note?: string }> = [
  { feature: "Send without creating an account", here: true, email: false },
  { feature: "Recipient needs no account", here: true, email: true },
  { feature: "Works from a link, not an email address", here: true, email: false },
  { feature: "Short code and QR for phone-to-desktop", here: true, email: false },
  { feature: "Password on the transfer itself", here: true, email: true },
  { feature: "Burn after read", here: true, email: false },
  { feature: "Multi-gigabyte files", here: false, email: true },
  { feature: "Delivery tracking and receipts", here: false, email: true },
];

export function TransferGuide({ maxFileBytes, maxDropBytes, maxFilesPerDrop }: Limits) {
  const perFile = formatBytes(maxFileBytes);
  const perDrop = formatBytes(maxDropBytes);

  return (
    <section id="about" className="scroll-mt-24 border-t border-line bg-surface">
      <div className="shell py-14 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <p className="eyebrow">About the tool</p>
            <h2 className="mt-3 text-title text-balance">
              A file transfer that asks you for nothing
            </h2>
          </Reveal>

          <div className="mt-8 space-y-12 text-[15px] leading-relaxed text-body">
            {/* ------------------------------------------------ what it is */}
            <Reveal className="space-y-4">
              <p>
                <strong className="font-medium text-ink">Just Save It</strong> is a free file
                transfer tool that runs entirely in a browser tab. Put in a file — or a block of
                text — and you get back a short code and a link. Send the link to whoever needs
                it, and they open it. That is the whole product. There is no account to create,
                no email address to hand over and nothing to install on either end.
              </p>
              <p>
                Most file transfer services want something before they will move a single byte:
                an address to send to, a sign-up to lift a limit, a desktop client left running
                in the background. This one asks for nothing, because most transfers are not a
                project — they are one file, one person, one time. A screenshot to a colleague.
                A PDF to an accountant. An API key to a contractor who needs it in the next five
                minutes.
              </p>
            </Reveal>

            {/* --------------------------------------------------- limits */}
            <Reveal className="space-y-4">
              <h3 className="text-heading text-ink">
                Free file transfer, with the limits printed on the tin
              </h3>
              <p>
                Free file transfer usually means a free tier with the catch somewhere below the
                fold. Here are the numbers, and they are the same numbers the app enforces:
              </p>

              <dl className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
                {[
                  { value: perFile, label: "per file" },
                  { value: perDrop, label: "per transfer" },
                  { value: String(maxFilesPerDrop), label: "files at once" },
                ].map(({ value, label }) => (
                  <div key={label} className="bg-canvas px-4 py-5 text-center">
                    <dt className="font-mono text-xl font-medium text-ink" data-numeric>
                      {value}
                    </dt>
                    <dd className="mt-1 text-[13px] text-mute">{label}</dd>
                  </div>
                ))}
              </dl>

              <p>
                Nothing is throttled, no transfer waits behind a paying customer, and there is no
                paid tier to upgrade to. The limits are honest about why they exist: the whole
                thing runs on free infrastructure, with a free database cluster doing double duty
                as file storage, so the ceiling is set by what that holds rather than by a pricing
                page. Underneath it, every feature is on for everybody.
              </p>
            </Reveal>

            {/* --------------------------------------------------- no login */}
            <Reveal className="space-y-4">
              <h3 className="text-heading text-ink">
                File transfer with no login, and what that buys you
              </h3>
              <p>
                A file transfer with no login is not just one less form. It means there is no
                account record with your name on it, no password of yours to leak in someone
                else&rsquo;s breach, no email address to be marketed at later and no profile
                quietly accumulating a history of what you have sent. The server knows that a
                drop exists and when it expires. It does not know who made it.
              </p>
              <p>
                It is also the difference people are after when they search for{" "}
                <em>file transfer no login</em>: not a shorter sign-up form, but no account at
                all, on either side of the transfer.
              </p>
              <p>
                The list of recent drops on the home page lives in your browser&rsquo;s local
                storage and never on the server. Clear your site data and it is gone — and the
                server was never holding a copy to begin with.
              </p>
            </Reveal>

            {/* --------------------------------------------------- android */}
            <Reveal className="space-y-4">
              <h3 className="text-heading text-ink">
                Android file transfer without installing anything
              </h3>
              <p>
                Searching for <em>android file transfer</em> usually leads down one of two dead
                ends: the long-retired desktop utility for shuttling files over a USB cable, or a
                hunt for yet another app to move one photo off a phone. Neither is a good use of
                an afternoon.
              </p>
              <p>
                Because this is a web page, file transfer on Android is just: open the site in
                Chrome, tap <strong className="font-medium text-ink">Browse files</strong>, pick
                from Gallery or Downloads, and press Create drop. You get a link and a QR code
                back. The same page and the same steps work on iPhone, on a Chromebook, on
                Windows and on a Mac — there is no &ldquo;phone version&rdquo;, because there is
                nothing to version.
              </p>
              <p>
                The most common version of the request is file transfer Android to PC — phone in
                one hand, laptop on the desk. Create the drop on the phone, then either open the
                link on the desktop or point its camera at the QR code. No cable, no pairing, no
                driver, and nothing installed on the PC either.
              </p>
            </Reveal>

            {/* -------------------------------------------------- security */}
            <Reveal className="space-y-4">
              <h3 className="text-heading text-ink">
                Secure file transfer — precisely what that means here
              </h3>
              <p>
                <em>Secure file transfer</em> is a phrase that gets stretched, so here is exactly
                what this does and does not do.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-line bg-canvas p-4">
                  <p className="text-[13px] font-medium text-ink">It does</p>
                  <ul className="mt-2.5 space-y-2 text-[13px] leading-snug">
                    {[
                      "Serve every transfer over HTTPS.",
                      "Hash any password you set with scrypt and a random per-drop salt, compared in constant time — the plain password is never written down.",
                      "Enforce expiry in the database with a time-to-live index, so an expired drop and its file chunks are deleted rather than merely hidden.",
                      "Offer burn-after-read, which starts a ten-minute self-destruct the first time a drop is opened.",
                    ].map((line) => (
                      <li key={line} className="flex gap-2">
                        <Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-grass" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-md border border-line bg-canvas p-4">
                  <p className="text-[13px] font-medium text-ink">It does not</p>
                  <ul className="mt-2.5 space-y-2 text-[13px] leading-snug">
                    {[
                      "Encrypt content end to end. Files and text are stored in a form the server can read.",
                      "Turn a password into a key the server lacks — it gates who may open a drop, nothing more.",
                      "Claim to be the right tool for anything where the storage operator reading it would be unacceptable.",
                    ].map((line) => (
                      <li key={line} className="flex gap-2">
                        <Minus aria-hidden className="mt-0.5 size-3.5 shrink-0 text-mute" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p>
                That trade-off is deliberate, and it is what lets a plain link work from any
                device without a secret fragment in the URL. It should still decide what you
                send. This is the right tool for a contract, a build artefact, a set of holiday
                photos or a credential you are about to rotate anyway. It is the wrong tool for
                anything that would genuinely hurt if the operator read it — for that, use
                something built around end-to-end encryption.
              </p>
            </Reveal>

            {/* ------------------------------------------------ comparison */}
            <Reveal className="space-y-4">
              <h3 className="text-heading text-ink">
                How it compares with Smash, WeTransfer and the rest
              </h3>
              <p>
                Smash file transfer and WeTransfer solved a different problem, and solved it
                well: sending very large files, usually by email, usually to a client. They are
                the right answer when a file is measured in gigabytes or when a delivery has to
                be tracked. Just Save It is not a clone of either, and is not affiliated with
                them.
              </p>

              <div className="overflow-x-auto rounded-md border border-line">
                <table className="w-full min-w-md border-collapse text-left text-[13px]">
                  <caption className="sr-only">
                    Just Save It compared with a typical email-based large-file transfer service
                  </caption>
                  <thead>
                    <tr className="border-b border-line bg-canvas">
                      <th scope="col" className="px-4 py-3 font-medium text-ink">
                        Feature
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium text-ink">
                        Just Save It
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium text-ink">
                        Email-based transfer
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map(({ feature, here, email }) => (
                      <tr key={feature} className="border-b border-line last:border-b-0">
                        <th scope="row" className="px-4 py-2.5 font-normal text-body">
                          {feature}
                        </th>
                        {[here, email].map((yes, index) => (
                          <td key={index} className="px-4 py-2.5">
                            {yes ? (
                              <Check aria-hidden className="size-4 text-grass" />
                            ) : (
                              <Minus aria-hidden className="size-4 text-faint" />
                            )}
                            <span className="sr-only">{yes ? "Yes" : "No"}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p>
                The difference is where the friction sits. An email-based transfer wants the
                recipient&rsquo;s address before it will start, and then the recipient waits on a
                mail that may land in spam. A link-based drop has no recipient until you decide
                to send the link — paste it into whatever conversation you are already having.
                For a small file that needs to arrive in the next thirty seconds, that gap
                matters more than the size ceiling does.
              </p>
            </Reveal>

            {/* ------------------------------------------------ what to send */}
            <Reveal className="space-y-4">
              <h3 className="text-heading text-ink">
                File transfer free online — what you can actually send
              </h3>
              <p>
                Files of any type up to the per-file limit: images, video, PDFs, documents,
                archives, build outputs, logs. Text as well, which is the part people forget a
                file transfer tool can do — paste a note, a stack trace, a wifi password or a
                block of config, and the person at the other end gets it as selectable text
                rather than a screenshot they have to retype. Mix the two in one drop if it
                suits.
              </p>
              <p>
                Every transfer gets a short code you can read down a phone line, and you can name
                it yourself when <code className="font-mono text-[13px] text-ink">notes-for-priya</code>{" "}
                beats a random string.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

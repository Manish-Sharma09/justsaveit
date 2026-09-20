import { formatBytes } from "./format";
import { APP_NAME, publicConfig } from "./config";

/**
 * Search-facing copy, in one place.
 *
 * The page renders these strings and the JSON-LD serialises the same objects,
 * so the structured data cannot drift from what a visitor actually reads —
 * which is the one thing Google penalises structured data for.
 */

/**
 * Canonical origin. Every canonical, OG and sitemap URL is built from this.
 *
 * NEXT_PUBLIC_SITE_URL should still be set for each environment — it is what a
 * preview or staging deploy needs in order not to claim the production URL as
 * its canonical. The literal below is only the fallback for when it is absent.
 */
export const SITE_URL = (publicConfig.siteUrl || "https://justsaveit.online").replace(/\/$/, "");

export const SITE_TITLE = "Free & Secure File Transfer — No Login | Just Save It";

/** Kept under 160 characters: past that, Google truncates the snippet. */
export const SITE_DESCRIPTION =
  "Free, secure file transfer with no login. Send files or text from any browser — " +
  "Android, iPhone or desktop — and get a short link and QR code that expires.";

/**
 * Keywords carry no ranking weight any more, but they cost nothing and some
 * non-Google crawlers and internal site-search tools still read them.
 */
export const SITE_KEYWORDS = [
  "file transfer",
  "android file transfer",
  "secure file transfer",
  "smash file transfer",
  "free file transfer",
  "file transfer android",
  "file transfer free online",
  "file transfer no login",
  "send files without signup",
  "share files from a link",
  "temporary file sharing",
  "password protected file transfer",
];

export interface Limits {
  maxFileBytes: number;
  maxDropBytes: number;
  maxFilesPerDrop: number;
}

/**
 * An answer is a list of blocks rather than one string, so the same content
 * can be rendered as React elements on the page and serialised to the small
 * HTML subset Google accepts in FAQ answers (`<p>`, `<ul>`, `<li>`) for the
 * JSON-LD. One source, two renderings, and no `dangerouslySetInnerHTML`.
 */
export type AnswerBlock = string | { list: string[] };

export interface FaqItem {
  question: string;
  answer: AnswerBlock[];
}

export interface FaqGroup {
  /** Rendered as the group heading; not part of the structured data. */
  title: string;
  items: FaqItem[];
}

/** Serialises an answer to the HTML that goes in the JSON-LD `text` field. */
export function answerHtml(answer: AnswerBlock[]): string {
  return answer
    .map((block) =>
      typeof block === "string"
        ? `<p>${escapeHtml(block)}</p>`
        : `<ul>${block.list.map((li) => `<li>${escapeHtml(li)}</li>`).join("")}</ul>`
    )
    .join("");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * The limits appear in several answers, so the FAQ is built from configuration
 * rather than written down twice. Raise MAX_FILE_BYTES and the page, the
 * structured data and the composer all change together.
 *
 * Group one is the set of questions people actually type into a search box;
 * group two is what they ask once they are already here.
 */
export function faqGroups({
  maxFileBytes,
  maxDropBytes,
  maxFilesPerDrop,
}: Limits): FaqGroup[] {
  const perFile = formatBytes(maxFileBytes);
  const perDrop = formatBytes(maxDropBytes);

  return [
    {
      title: "Sending files",
      items: [
        {
          question: "What is the best free file transfer?",
          answer: [
            "There is no single best one — it depends on where the file is going, and the honest answer is that three different tools win three different situations.",
            {
              list: [
                "Two devices on the same wifi: a local tool such as Snapdrop or PairDrop is quickest, because the file never leaves the network.",
                "A multi-gigabyte delivery to a client: Smash file transfer or WeTransfer, which are built for size and for tracking what arrived.",
                "A quick hand-off to anyone, anywhere, with no sign-up on either side: a link-based tool like Just Save It — drop the file, send the link.",
              ],
            },
            `Just Save It covers the third case: free file transfer up to ${perFile} per file, no account, and a link that expires on a schedule you choose.`,
          ],
        },
        {
          question: "How to transfer a file for free?",
          answer: [
            "Four steps, no account and no software:",
            {
              list: [
                "Open Just Save It in any browser, on a phone or a computer.",
                "Tap Browse files and pick the file, or drag it onto the page.",
                "Press Create drop. You get a short code and a link back.",
                "Send the link however you like, or let the other person scan the QR code.",
              ],
            },
            "Whoever opens the link downloads the file without signing in. Nothing is installed at either end and nothing is charged at any point.",
          ],
        },
        {
          question: "How to transfer files without login?",
          answer: [
            "Use a tool that has no accounts at all, rather than one that lets you postpone the sign-up. On Just Save It there is no login step to skip: you land on the page, add a file or some text, and get a link.",
            "Nothing asks you for an email address, a phone number or a password, and the person opening the link is not asked either. The only secret involved is an optional password you can set on the drop itself, which protects the content rather than identifying you.",
          ],
        },
        {
          question: "Is Snapdrop free to use?",
          answer: [
            "Yes. Snapdrop is a free, open-source, AirDrop-style web app, and its maintained fork PairDrop is free and open source too. Neither asks for an account.",
            "The difference is how they connect: Snapdrop discovers devices on the same network, and PairDrop adds codes for pairing across networks. Just Save It — which is not affiliated with either project — puts the file behind a link instead, so the two devices never have to find each other, and the recipient can open it hours later on the other side of the world.",
          ],
        },
        {
          question: "How to send a file without email?",
          answer: [
            "Put the file behind a link, then send the link through whatever you are already using. Create the drop, copy the link or the short code, and paste it into WhatsApp, Slack, Signal, a text message or a ticket comment.",
            "No address is collected from you or from the person receiving it, so nothing lands in an inbox or a spam folder. For a phone-to-computer hand-off you can skip the message entirely and scan the QR code instead.",
          ],
        },
        {
          question: "How can I transfer files for free?",
          answer: [
            `Free here means free rather than free-for-now. Every feature is available to everyone without a card: password protection, expiry, burn-after-read and the full ${perFile} per-file allowance.`,
            `The ceiling is ${perFile} per file, ${perDrop} per transfer and ${maxFilesPerDrop} files at a time. Above that you will want a service built for large files; below it, nothing is metered, queued or throttled.`,
          ],
        },
      ],
    },
    {
      title: "About Just Save It",
      items: [
        {
          question: "Is this file transfer really free?",
          answer: [
            `Yes. Every feature is free to everyone: password protection, expiry, burn-after-read and the full ${perFile} per-file allowance. There is no paid tier, no trial and no card on file, because there is nothing to upgrade to.`,
          ],
        },
        {
          question: "Do I need an account to send a file?",
          answer: [
            "No. File transfer with no login is the entire point. You are never asked for an email address, a phone number or a password of your own, and no account record is created for you anywhere.",
          ],
        },
        {
          question: "Does it work for Android file transfer?",
          answer: [
            "Yes. It is a web page, so Android file transfer works in Chrome or any other mobile browser with no app to install: tap Browse files, pick from Gallery or Downloads, and share the link or scan the QR code. The same page works on iPhone, Windows, Mac and ChromeOS.",
          ],
        },
        {
          question: "Is this a secure file transfer?",
          answer: [
            "Partly, and the distinction matters. Transfers run over HTTPS, passwords are hashed with scrypt and a random salt, and expiry is enforced by the database rather than hidden in the interface. Content is not end-to-end encrypted, so the server can read it. Treat it as convenient rather than confidential.",
          ],
        },
        {
          question: "How long does a transfer stay available?",
          answer: [
            "You choose: 1 hour, 24 hours, 7 days, 30 days or never. Seven days is the default. Burn-after-read shortens that to ten minutes from the moment the drop is first opened.",
          ],
        },
        {
          question: "How big a file can I send?",
          answer: [
            `Up to ${perFile} per file, ${perDrop} in a single drop, and ${maxFilesPerDrop} files at a time. Anything larger is rejected in the browser before a byte is uploaded.`,
          ],
        },
        {
          question: "Can I use it instead of Smash file transfer or WeTransfer?",
          answer: [
            "For a quick hand-off, yes — there is no sign-up and no recipient email required. For multi-gigabyte deliveries, no: services like Smash file transfer and WeTransfer are built for that and this is not. Just Save It is not affiliated with either.",
          ],
        },
        {
          question: "Does the person receiving the file need to sign in?",
          answer: [
            "No. They open the link, or type the short code on the home page, and the files are there to download. If you set a password they will be asked for that, and nothing else.",
          ],
        },
      ],
    },
  ];
}

/** Every question on the page, flattened for the FAQPage structured data. */
export function faqItems(limits: Limits): FaqItem[] {
  return faqGroups(limits).flatMap((group) => group.items);
}

/** Schema.org graph for the home page. */
export function homeJsonLd(limits: Limits) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: APP_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#app`,
        name: `${APP_NAME} — File Transfer`,
        url: `${SITE_URL}/`,
        applicationCategory: "UtilitiesApplication",
        applicationSubCategory: "File Transfer",
        operatingSystem: "Any — runs in a web browser (Android, iOS, Windows, macOS, ChromeOS)",
        browserRequirements: "Requires JavaScript.",
        description: SITE_DESCRIPTION,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: [
          "Free file transfer with no login or account",
          "Send files or plain text from any browser",
          "Android file transfer with no app to install",
          "Optional password, hashed with scrypt",
          "Self-expiring links from 1 hour to 30 days",
          "Burn after read",
          "Short code and QR code for every transfer",
        ],
        screenshot: `${SITE_URL}/og-file-transfer.jpg`,
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: faqItems(limits).map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answerHtml(answer) },
        })),
      },
    ],
  };
}

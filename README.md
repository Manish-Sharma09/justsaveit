# Just Save It

A drop box for anything you need to hand over. Put in text or files, get back a
short code and a link, optionally protect it with a password and an expiry, then
send it on. Nobody needs an account — not you, not the person opening it.

```
Open  →  add content  →  get a code + link  →  (optional password)  →  share
                                                                        ↓
                                              recipient opens it, views, downloads
```

## What it does

- **Text and files in one drop** — images, video, audio, PDFs, documents,
  archives, code, anything else. Previews inline for the types browsers can
  render; honest "no preview" plus a download for the rest.
- **A link per drop** — `/r/<code>`. Codes are random and unambiguous (no
  `0`/`O`, no `1`/`l`), or you can pick your own name.
- **Optional password** — stored only as a salted scrypt hash. Unlocking sets a
  short-lived signed cookie scoped to that one drop.
- **Optional expiry** — 1 hour to 30 days, or never. MongoDB TTL indexes delete
  expired drops, their file records and their bytes without a cron job.
- **Burn after read** — the drop deletes itself ten minutes after someone other
  than the creator opens it, leaving time to actually download things.
- **QR code** for every drop, generated in the browser and saveable as a PNG.
- **Drag and drop, paste to upload, one-click copy**, native share sheet where
  the browser offers one, download-all, per-file direct links.
- **Recent drops** remembered in `localStorage` only — the server never learns
  which drops belong to whom.
- **Live sync** of the note between open tabs via the existing Socket.IO
  backend. Entirely optional: with it unset the editor still autosaves.
- Light, dark and system themes; keyboard accessible throughout.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in MONGODB_URI and APP_SECRET
npm run dev
```

Open <http://localhost:3000>.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |

### Environment

`MONGODB_URI` and, in production, `APP_SECRET` are required. Everything else has
a working default — see [`.env.example`](.env.example) for the full list,
including the storage driver and the size limits.

Generate a secret with `openssl rand -hex 32`.

## Architecture

```
app/
  page.tsx                  landing + composer
  r/[id]/                   the drop: page (server), lock screen, client, settings
  api/
    createroom, updateroom  original endpoints, contracts unchanged
    drops/                  create, read, patch, delete, unlock, exists, files
    files/[fileId]          chunk upload (PUT), ranged download (GET), delete
components/                 UI primitives (ui/) and product components
hooks/                      uploads, clipboard, recents, realtime
lib/                        data access, storage, crypto, ids, formatting
```

### Storage

Files are split into 2 MB chunks. Each chunk is a separate request, which keeps
every upload inside serverless request-body limits (Vercel caps a request at
about 4.5 MB), makes an interrupted upload resumable, and gives the UI real
progress. Downloads support HTTP range requests, so video and audio seek
properly.

Two drivers, both free to run:

- **`mongo`** (default) — chunks live in the same MongoDB database as the drops.
  No extra service and no extra bill.
- **`local`** — chunks are written to the filesystem. For self-hosting on a box
  with a persistent disk; not suitable for hosts with ephemeral storage.

Chunks carry the same `expires_at` as their drop, so a TTL index reclaims the
space automatically.

### Data model

Drops live in the `rooms` collection. The document is a **strict superset** of
the original `{ room_id, content, last_modified }`, and every added field is
optional, so drops created by earlier versions keep working with no migration:

| Field | Notes |
| --- | --- |
| `room_id`, `content`, `last_modified` | Original fields, unchanged |
| `created_at`, `updated_at` | Timestamps |
| `password_hash` | `scrypt$<salt>$<key>`, or null |
| `expires_at` | TTL index target |
| `burn_after_read`, `burn_triggered_at` | Self-destruct state |
| `view_count` | Opens by non-creators |

`blobs` holds file metadata, `blob_chunks` the bytes. All three collections get
their indexes created lazily on first use.

## Compatibility

`POST /api/createroom` and `POST /api/updateroom` keep their original request
and response shapes, so anything already calling them continues to work. Two
deliberate additions:

- A `files` array is included in `createroom` responses. Older clients ignore
  unknown keys.
- A password-protected drop answers `403` rather than handing its content to a
  caller that has not proved it knows the password.

The Socket.IO protocol (`join-room`, `content-update`, `receive-update`) is
unchanged.

## Costs and dependencies

The core product runs on free, open-source pieces: Next.js, React, Tailwind CSS
v4, `lucide-react` for icons and `qrcode` (MIT) for QR generation, which runs in
the browser so no drop URL is ever sent to an image service. Passwords use
Node's built-in `scrypt`; ids use the Web Crypto API. There are no paid APIs and
no third-party analytics.

Two pieces of infrastructure are genuinely required, and both have free tiers:

- **MongoDB** for drops and file bytes. A MongoDB Atlas free cluster gives
  512 MB total, which is why the defaults are conservative (25 MB per file,
  100 MB per drop, 25 files, 7-day expiry) and why expiry is on by default.
  Raise the limits in `.env.local` if you have the space.
- **A Socket.IO server** for live sync, currently a free Render instance. This
  one is entirely optional: leave `NEXT_PUBLIC_REALTIME_URL` blank and the app
  falls back to plain autosave with no loss of function.

## Security notes

- Drops are **not end-to-end encrypted**. A password gates access and is stored
  only as a hash, but the server can read drop contents. The UI says so plainly.
  Treat this as convenient, not confidential.
- Anyone with the link can open an unprotected drop. That is the design.
- Uploaded files are served with `X-Content-Type-Options: nosniff` and a
  restrictive `Content-Security-Policy`. Only a safelist of media types is
  served `inline`; everything else — including HTML and SVG — is forced to
  download, so an upload cannot run script on this origin.
- Unlock attempts are rate limited per instance.

## Brand assets

Everything under `public/` is generated from the supplied brand pack:

| File | Purpose |
| --- | --- |
| `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png` | Browser tabs and bookmarks |
| `app/favicon.ico` | Multi-size ICO (16/32/48) for `/favicon.ico` requests |
| `apple-touch-icon.png` | iOS home screen, 180×180 |
| `android-chrome-192x192.png`, `android-chrome-512x512.png` | Android / PWA install, also the maskable icon |
| `site.webmanifest` | Install metadata — name, theme colour, display mode |
| `logo-mark-256.png`, `logo-mark-512.png` | The mark on its own, used in the header and footer |
| `logo-lockup.png` | Full lockup with the wordmark |
| `og.png` | 1200×630 link preview card |

The `<link>` tags are emitted by Next's Metadata API in
[`app/layout.tsx`](app/layout.tsx) rather than hand-written, so the icon set and
the manifest stay in one place. `app/favicon.ico` is picked up by Next's file
convention; there must not be a second copy in `public/`, or the two routes
collide at build time.

## Design

The interface follows [`DESIGN.md`](DESIGN.md): a near-white canvas carrying a
single near-black ink, 1px hairlines instead of shadows, Geist Sans for tightly
tracked display type and Geist Mono for labels and codes, and colour rationed to
one accent blue. The product's own signature is the share artefact, set as a
printed manifest stub — large mono code, hairline rules, a punched tear-off
edge — rather than another rounded gradient card.

Design tokens live in [`app/globals.css`](app/globals.css) under `@theme`.

/** Classification of uploaded content into the kinds the UI renders. */
export type FileKind =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "document"
  | "archive"
  | "code"
  | "file";

const EXTENSION_KINDS: Record<string, FileKind> = {
  // documents
  doc: "document", docx: "document", odt: "document", rtf: "document",
  txt: "document", md: "document", pages: "document",
  xls: "document", xlsx: "document", ods: "document", csv: "document",
  ppt: "document", pptx: "document", odp: "document", key: "document",
  // archives
  zip: "archive", rar: "archive", "7z": "archive", tar: "archive",
  gz: "archive", bz2: "archive", xz: "archive",
  // code
  js: "code", jsx: "code", ts: "code", tsx: "code", json: "code",
  html: "code", css: "code", py: "code", rb: "code", go: "code",
  rs: "code", java: "code", c: "code", cpp: "code", sh: "code",
  yml: "code", yaml: "code", toml: "code", sql: "code",
};

export function detectKind(mimeType: string, filename = ""): FileKind {
  const mime = (mimeType || "").toLowerCase();

  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf") return "pdf";

  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  if (extension && EXTENSION_KINDS[extension]) return EXTENSION_KINDS[extension];

  if (mime.includes("zip") || mime.includes("compressed") || mime.includes("tar")) {
    return "archive";
  }
  if (
    mime.includes("word") ||
    mime.includes("excel") ||
    mime.includes("spreadsheet") ||
    mime.includes("presentation") ||
    mime.includes("opendocument")
  ) {
    return "document";
  }
  if (mime.startsWith("text/")) return "document";

  return "file";
}

/** Kinds we can safely render inline in the browser without a plugin. */
export function isPreviewable(kind: FileKind): boolean {
  return kind === "image" || kind === "video" || kind === "audio" || kind === "pdf";
}

/**
 * Content types we are willing to serve with `Content-Disposition: inline`.
 * Everything else is forced to download, so an uploaded `.html` or `.svg`
 * cannot execute script on our origin.
 */
const INLINE_SAFE = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/avif",
  "image/bmp", "image/x-icon",
  "video/mp4", "video/webm", "video/ogg", "video/quicktime",
  "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm", "audio/aac", "audio/mp4",
  "application/pdf",
  "text/plain",
]);

export function canServeInline(mimeType: string): boolean {
  return INLINE_SAFE.has((mimeType || "").toLowerCase().split(";")[0].trim());
}

export function extensionOf(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toUpperCase().slice(0, 5) : "FILE";
}

export const KIND_LABEL: Record<FileKind, string> = {
  image: "Image",
  video: "Video",
  audio: "Audio",
  pdf: "PDF",
  document: "Document",
  archive: "Archive",
  code: "Code",
  file: "File",
};

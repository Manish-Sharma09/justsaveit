import {
  FileArchive,
  FileCode,
  FileText,
  FileType,
  Image as ImageIcon,
  Music,
  Paperclip,
  Video,
} from "lucide-react";
import type { FileKind } from "@/lib/filetypes";

const ICONS: Record<FileKind, React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  pdf: FileType,
  document: FileText,
  archive: FileArchive,
  code: FileCode,
  file: Paperclip,
};

/**
 * One colour per kind, drawn from the chromatic accent family DESIGN.md
 * reserves for illustration. This is functional rather than decorative: it
 * makes a mixed list scannable at a glance, which a wall of grey glyphs is not.
 * The tints appear only on small glyphs, never as chrome.
 */
const TINTS: Record<FileKind, string> = {
  image: "text-violet",
  video: "text-magenta",
  audio: "text-cyan",
  pdf: "text-danger",
  document: "text-accent",
  archive: "text-amber",
  code: "text-grass",
  file: "text-mute",
};

export function FileIcon({
  kind,
  className,
  tinted = true,
}: {
  kind: FileKind;
  className?: string;
  /** Set false where the surrounding context supplies its own colour. */
  tinted?: boolean;
}) {
  const Icon = ICONS[kind] ?? Paperclip;
  return <Icon className={[tinted ? TINTS[kind] : "", className].filter(Boolean).join(" ")} />;
}

export { TINTS as FILE_KIND_TINT };

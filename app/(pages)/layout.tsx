import { SiteFooter, SiteHeader } from "@/components/site-header";

/**
 * Chrome for the standing pages. They share the flat header rather than the
 * home page's floating pill, which only makes sense over the hero stage.
 */
export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}

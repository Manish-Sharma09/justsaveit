/**
 * Schema.org structured data.
 *
 * `<` is escaped to its unicode form so a value can never close the script
 * tag early — the one way a JSON-LD block turns into an injection.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

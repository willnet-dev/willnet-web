// Ayudas para los datos estructurados (JSON-LD). Solo datos confirmados y visibles en la página.
import { site } from "../i18n/ui";

export const breadcrumbs = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: new URL(it.path, site.url).href })),
});

export const faqPage = (items: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
});

// Sin price, el servicio va sin oferta (p. ej. en la lista de Services, donde no se muestran precios)
export const serviceSchema = (o: { name: string; description: string; path: string; price?: number; monthly?: boolean; lang: string }) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: o.name,
  description: o.description,
  url: new URL(o.path, site.url).href,
  inLanguage: o.lang,
  provider: { "@id": `${site.url}/#business` },
  areaServed: ["United States", "Latin America"],
  ...(o.price === undefined
    ? {}
    : {
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": o.monthly ? "UnitPriceSpecification" : "PriceSpecification",
            minPrice: o.price,
            priceCurrency: "USD",
            ...(o.monthly ? { unitText: "MONTH" } : {}),
          },
        },
      }),
});

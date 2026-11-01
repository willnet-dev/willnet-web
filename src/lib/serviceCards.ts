// Datos de cada servicio listos para pintar una tarjeta: nombre, precio «desde», plazo, tres cosas que
// incluye y la captura de su caso (o la primera de su galería). Los usan la lista de la Home y la página
// de servicios, así cada dato sigue viniendo de src/data/services.ts y de los proyectos.
import { getEntry } from "astro:content";
import { servicePath, type Lang } from "../i18n/routes";
import { formatPrice, services } from "../data/services";
import { t } from "../i18n/ui";
import { workImg } from "./img";

export async function serviceCards(lang: Lang) {
  const copy = t(lang);
  return Promise.all(
    services.map(async (s) => {
      const slug = s.caseSlug ?? s.gallery?.[0];
      const entry = slug ? await getEntry("work", slug) : undefined;
      return {
        key: s.key,
        href: servicePath(s.key, lang),
        name: s[lang].name,
        short: s[lang].short,
        price: formatPrice(s.price) + (s.monthly ? copy.common.perMonth : ""),
        timeline: s[lang].timeline,
        // El primero suele ser el diseño, que ya se da por hecho: se muestran los tres siguientes
        items: s[lang].included.slice(1, 4),
        img: entry ? workImg(lang === "es" ? entry.data.image.es : entry.data.image.en) : undefined,
        // Logos y piezas de diseño se ven completos; las webs llenan el recuadro
        contain: entry?.data.category === "design",
      };
    }),
  );
}

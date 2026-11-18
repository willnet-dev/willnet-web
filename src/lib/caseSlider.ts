// Casos de estudio del slider por capas (LayeredSlider.astro). Los usan Work y el inicio («Selected work»),
// así los dos muestran siempre los mismos casos y en el mismo orden (pedido de Willder, 2026-11-18).
// Entra un proyecto con página de caso (hasCase) que no esté sacado de la vitrina (inShowcase: false, como
// Mastermind). Con `!== false`, un proyecto sin el campo entra, como antes.
import { getCollection, type CollectionEntry } from "astro:content";
import { workPath, type Lang } from "../i18n/routes";
import type { SliderItem } from "../components/LayeredSlider.astro";

export const inShowcase = (x: CollectionEntry<"work">) => x.data.hasCase && x.data.inShowcase !== false;

export async function allWork() {
  return (await getCollection("work")).sort((a, b) => a.data.order - b.data.order);
}

export function sliderItems(cases: CollectionEntry<"work">[], lang: Lang): SliderItem[] {
  return cases.map((c) => ({
    href: workPath(c.id, lang),
    title: c.data[lang].title,
    type: c.data[lang].type,
    year: c.data.year,
    desktop: lang === "es" ? c.data.image.es : c.data.image.en,
    mobile: lang === "es" ? c.data.image.mobileEs : c.data.image.mobileEn,
  }));
}

export async function showcaseSliderItems(lang: Lang) {
  return sliderItems((await allWork()).filter(inShowcase), lang);
}

// Preguntas frecuentes generales (bloque 5 de la entrevista). Respuesta directa primero, detalle después.
// Las marcadas con home: true también salen en la página de inicio.
import type { Lang } from "../i18n/routes";

type QA = { q: string; a: string };
export type FaqItem = { id: string; home?: boolean; en: QA; es: QA };

export const faq: FaqItem[] = [
  {
    id: "cost",
    en: { q: "How is the price of a website decided?", a: "It depends on the type of site, the number of pages, the features and how ready your content is. Each service page shows its starting price, and after a free consultation you get the exact price in writing." },
    es: { q: "¿Cómo se calcula el precio de una página web?", a: "Depende del tipo de web, el número de páginas, las funciones y qué tan listo esté tu contenido. Cada servicio muestra su precio inicial y, después de una consulta gratis, recibes el precio exacto por escrito." },
  },
  {
    id: "free",
    home: true,
    en: { q: "Is the first consultation free?", a: "Yes. The first conversation and the quote are free and come with no commitment. We talk about your business, I ask what you need and you get a proposal with price and delivery date." },
    es: { q: "¿La primera consulta es gratis?", a: "Sí. La primera conversación y el presupuesto son gratis y sin compromiso. Hablamos de tu negocio, te pregunto lo que necesitas y recibes una propuesta con precio y fecha de entrega." },
  },
  {
    id: "process",
    home: true,
    en: { q: "How does the process work?", a: "Four steps: we talk (free), you get a quote, I design and build while you review, and we launch on your domain. After launch you get 30 days of free support." },
    es: { q: "¿Cómo es el proceso de trabajo?", a: "Cuatro pasos: hablamos (gratis), recibes un presupuesto, diseño y construyo mientras tú revisas, y publicamos en tu dominio. Después del lanzamiento tienes 30 días de soporte gratis." },
  },
  {
    id: "payments",
    en: { q: "How do payments work?", a: "It depends on the size of the project. Smaller projects are paid in full upfront, and larger ones in two parts: half to start and half before launch. Your quote says which one applies." },
    es: { q: "¿Cómo son los pagos?", a: "Depende del tamaño del proyecto. Los más pequeños se pagan completos por adelantado y los más grandes en dos partes: la mitad para empezar y la otra mitad antes de publicar. Tu presupuesto indica cuál aplica." },
  },
  {
    id: "wp-vs-code",
    en: { q: "Should I get a website I can edit myself, or a custom-coded one?", a: "If you want to edit content or run an online store yourself, I build it with an easy content dashboard. A coded site is faster and lighter, and works well for landing pages and sites that change little. I'll recommend one based on how you plan to use it." },
    es: { q: "¿Me conviene una web que pueda editar yo o una web en código?", a: "Si quieres editar el contenido o manejar una tienda tú mismo, la hago con un panel de contenido fácil de usar. Una web en código es más rápida y ligera, y funciona bien para landing pages y webs que cambian poco. Te recomiendo una según cómo la vayas a usar." },
  },
  {
    id: "landing-vs-site",
    en: { q: "Do I need a landing page or a full website?", a: "A landing page is enough when you have one main offer and one action you want people to take. If you offer several services or need more content to be found on Google, a full website is the better choice." },
    es: { q: "¿Necesito una landing page o un sitio web completo?", a: "Una landing basta cuando tienes una oferta principal y una acción que quieres que la gente haga. Si ofreces varios servicios o necesitas más contenido para aparecer en Google, conviene un sitio completo." },
  },
  {
    id: "store-time",
    en: { q: "How long does it take to build an online store?", a: "Usually 3 to 6 weeks. The biggest factor is how ready your product photos, prices and descriptions are." },
    es: { q: "¿Cuánto tarda hacer una tienda en línea?", a: "Normalmente de 3 a 6 semanas. Lo que más influye es qué tan listas estén las fotos, los precios y las descripciones de tus productos." },
  },
  {
    id: "timeline",
    en: { q: "How long does a website take?", a: "As a reference: landing pages take 1–2 weeks, business websites 2–4 weeks and online stores 3–6 weeks. It depends on the project and on how ready your content is, and the date goes in your quote." },
    es: { q: "¿Cuánto tarda una página web?", a: "Como referencia: una landing toma 1–2 semanas, un sitio web 2–4 semanas y una tienda en línea 3–6 semanas. Depende del proyecto y de qué tan listo esté tu contenido, y la fecha va en tu presupuesto." },
  },
  {
    id: "fix-or-redesign",
    en: { q: "Can my current website be fixed, or does it need a redesign?", a: "Most websites can be fixed. I review yours first and tell you honestly which option gives you the result you want for less money." },
    es: { q: "¿Mi web actual se puede arreglar o necesita un rediseño?", a: "La mayoría se puede arreglar. Primero reviso la tuya y te digo con honestidad qué opción te da el resultado que quieres por menos dinero." },
  },
  {
    id: "hosting",
    home: true,
    // Dominio y hosting los gestiona Willder; el primer año va incluido (decisión de Willder, 2026-10-26)
    en: { q: "Who handles my domain and hosting?", a: "I do. I register the domain in your name and take care of hosting, security certificates and renewals, so you don't have to deal with any of it. The first year is included in your project; after that it's covered by the maintenance plan, or renewed at cost if you prefer. If you already have a domain and hosting and want to keep managing them yourself, that works too." },
    es: { q: "¿Quién se encarga del dominio y el hosting?", a: "Yo. Registro el dominio a tu nombre y me encargo del hosting, los certificados de seguridad y las renovaciones, para que no tengas que preocuparte de nada. El primer año va incluido en tu proyecto; después lo cubre el plan de mantenimiento, o se renueva al costo si lo prefieres. Si ya tienes dominio y hosting y quieres seguir manejándolos tú, también se puede." },
  },
  {
    id: "self-update",
    en: { q: "Can I update the website myself?", a: "Yes, if we build it with a content dashboard: you'll be able to change text, photos and products, and I'll show you how. If it's a coded site, I make the changes for you." },
    es: { q: "¿Puedo actualizar la web yo mismo?", a: "Sí, si la hacemos con un panel de contenido: podrás cambiar textos, fotos y productos, y te enseño cómo. Si es una web en código, los cambios los hago yo." },
  },
  {
    id: "ask-designer",
    en: { q: "What should I ask a web designer before hiring them?", a: "Ask to see live projects, who will do the work, what's included in the price, how long it takes, who owns the domain, and what happens after launch. With WillNet: the projects are on the Work page, I do the work myself, and the rest goes in writing in your quote." },
    es: { q: "¿Qué le pregunto a un diseñador web antes de contratarlo?", a: "Pide ver proyectos publicados, quién hará el trabajo, qué incluye el precio, cuánto tarda, de quién es el dominio y qué pasa después del lanzamiento. Con WillNet: los proyectos están en la página Trabajo, el trabajo lo hago yo y lo demás va por escrito en tu presupuesto." },
  },
  {
    id: "outside-florida",
    home: true,
    en: { q: "Do you work with clients outside Florida?", a: "Yes. I'm based in West Palm Beach, FL, and work remotely with clients across the United States and Latin America, in English or Spanish." },
    es: { q: "¿Trabajas con clientes fuera de Florida?", a: "Sí. Tengo base en West Palm Beach, FL, y trabajo en remoto con clientes de todo Estados Unidos y Latinoamérica, en inglés o español." },
  },
];

export const faqFor = (lang: Lang, onlyHome = false) =>
  faq.filter((f) => !onlyHome || f.home).map((f) => ({ id: f.id, ...f[lang] }));

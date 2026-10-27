// Servicios de WillNet con precio «desde» y plazo de referencia (confirmados por Willder el 2026-10-25).
// Para cambiar un precio, cámbialo aquí: se actualiza en todas las páginas y en los datos estructurados.
import type { ServiceKey } from "../i18n/routes";

type Copy = {
  name: string;
  short: string;
  h1: string;
  title: string;
  description: string;
  timeline: string;
  intro: string;
  forWho: string[];
  included: string[];
  faq: { q: string; a: string }[];
  cta: string;
};

export type Service = {
  key: ServiceKey;
  price: number;
  monthly?: boolean;
  caseSlug?: string;
  /** Trabajos de la colección «work» que se muestran como galería en la página del servicio */
  gallery?: string[];
  en: Copy;
  es: Copy;
};

export const services: Service[] = [
  {
    key: "landing-pages",
    price: 500,
    caseSlug: "acl",
    en: {
      name: "Landing pages",
      short: "One page, one goal: get people to call, book or buy.",
      h1: "Landing pages that turn visitors into customers",
      title: "Landing page design from $500 — WillNet",
      description: "Custom landing pages from $500, ready in 1–2 weeks. One clear goal, fast on mobile, in English, Spanish or both. Free quote from WillNet.",
      timeline: "1–2 weeks",
      intro: "A landing page is a single page built around one action: request a quote, book a call or buy one product. It's the fastest way to get online with a clear message.",
      forWho: ["Businesses launching a new service or product", "Anyone who needs a professional page fast", "Campaigns that need one clear call to action"],
      included: ["Custom design for your brand", "Mobile-first and fast", "Contact form, WhatsApp or booking button", "Basic technical SEO and social sharing preview", "English, Spanish or both", "Publishing on your domain + 30 days of support"],
      faq: [
        { q: "Do I need a landing page or a full website?", a: "If you sell one main service or want one clear action, a landing page is enough and costs less. If you need several services, a blog or many pages, a full website is better. I'll recommend one in the free consultation." },
        { q: "Can it be in English and Spanish?", a: "Yes. I can build it in one language or both, with a language switch." },
      ],
      cta: "Quote my landing page",
    },
    es: {
      name: "Landing pages",
      short: "Una página, un objetivo: que te llamen, reserven o compren.",
      h1: "Landing pages que convierten visitas en clientes",
      title: "Diseño de landing page desde $500 — WillNet",
      description: "Landing pages a medida desde $500, listas en 1–2 semanas. Un objetivo claro, rápidas en el celular, en inglés, español o ambos. Presupuesto gratis con WillNet.",
      timeline: "1–2 semanas",
      intro: "Una landing page es una sola página pensada para una acción: pedir presupuesto, reservar una llamada o comprar un producto. Es la forma más rápida de estar en internet con un mensaje claro.",
      forWho: ["Negocios que lanzan un servicio o producto nuevo", "Quien necesita una página profesional rápido", "Campañas que necesitan una sola llamada a la acción"],
      included: ["Diseño a medida para tu marca", "Pensada primero para el celular y rápida", "Formulario de contacto, WhatsApp o botón de reservas", "SEO técnico básico y vista previa al compartir", "Inglés, español o ambos", "Publicación en tu dominio + 30 días de soporte"],
      faq: [
        { q: "¿Necesito una landing page o un sitio web completo?", a: "Si vendes un servicio principal o quieres una sola acción clara, una landing basta y cuesta menos. Si necesitas varios servicios, un blog o muchas páginas, conviene un sitio completo. Te recomiendo uno en la consulta gratis." },
        { q: "¿Puede estar en inglés y español?", a: "Sí. La hago en un idioma o en los dos, con selector de idioma." },
      ],
      cta: "Cotizar mi landing page",
    },
  },
  {
    key: "websites",
    price: 1200,
    caseSlug: "imola",
    en: {
      name: "Business websites",
      short: "Up to five pages that explain what you do and why to choose you.",
      h1: "Business websites that explain what you do — and why you",
      title: "Small business website design from $1,200 — WillNet",
      description: "Business websites of up to 5 pages from $1,200, ready in 2–4 weeks. Custom design, mobile-first, bilingual if you need it. Free quote from WillNet.",
      timeline: "2–4 weeks",
      intro: "A complete website with home, services, about, contact and whatever else your customers need to decide. Built to be found on Google and easy for you to update.",
      forWho: ["Businesses getting their first real website", "Companies with an outdated site that needs a fresh start", "Professionals who offer several services"],
      included: ["Up to 5 pages with custom design", "Mobile-first, fast and accessible", "Contact form and WhatsApp", "Technical SEO: titles, descriptions, sitemap and structured data", "English, Spanish or both", "Publishing on your domain + 30 days of support"],
      faq: [
        { q: "Can I update the website myself?", a: "Yes. Depending on what you need, I can build it with a content dashboard so you edit it yourself, or in code and handle updates for you. I'll explain both in the consultation." },
        { q: "What if I need more than five pages?", a: "No problem. The price goes up with the number of pages and features, and you'll see the exact amount in your quote." },
      ],
      cta: "Quote my website",
    },
    es: {
      name: "Sitios web",
      short: "Hasta cinco páginas que explican qué haces y por qué elegirte.",
      h1: "Sitios web que explican qué haces y por qué elegirte",
      title: "Diseño de página web para negocios desde $1,200 — WillNet",
      description: "Sitios web de hasta 5 páginas desde $1,200, listos en 2–4 semanas. Diseño a medida, pensados para el celular y bilingües si lo necesitas. Presupuesto gratis con WillNet.",
      timeline: "2–4 semanas",
      intro: "Una web completa con inicio, servicios, sobre ti, contacto y lo que tus clientes necesiten para decidir. Hecha para aparecer en Google y fácil de actualizar.",
      forWho: ["Negocios que tendrán su primera web de verdad", "Empresas con una web vieja que necesita empezar de nuevo", "Profesionales que ofrecen varios servicios"],
      included: ["Hasta 5 páginas con diseño a medida", "Pensado para el celular, rápido y accesible", "Formulario de contacto y WhatsApp", "SEO técnico: títulos, descripciones, sitemap y datos estructurados", "Inglés, español o ambos", "Publicación en tu dominio + 30 días de soporte"],
      faq: [
        { q: "¿Puedo actualizar la web yo mismo?", a: "Sí. Según lo que necesites, la hago con un panel de contenido para que la edites tú, o en código y me encargo yo de los cambios. Te explico las dos opciones en la consulta." },
        { q: "¿Y si necesito más de cinco páginas?", a: "No hay problema. El precio sube con el número de páginas y funciones, y verás el monto exacto en tu presupuesto." },
      ],
      cta: "Cotizar mi sitio web",
    },
  },
  {
    key: "online-stores",
    price: 2000,
    caseSlug: "pavlove",
    en: {
      name: "Online stores",
      short: "Sell online with cart, payments, shipping or pickup.",
      h1: "Online stores that are easy to buy from",
      title: "WooCommerce online store from $2,000 — WillNet",
      description: "WooCommerce online stores from $2,000, ready in 3–6 weeks: catalog, cart, online payments, pickup or delivery. Free quote from WillNet, in English or Spanish.",
      timeline: "3–6 weeks",
      intro: "A WooCommerce store with your catalog, cart and online payments. You manage products and orders yourself, and I show you how.",
      forWho: ["Businesses that already sell and want to sell online", "Makers and brands with physical products", "Local shops that need pickup or delivery orders"],
      included: ["WooCommerce store with custom design", "Product catalog with categories and variations", "Online payments (Stripe and other gateways)", "Pickup, delivery or shipping options", "Order and confirmation emails", "Training to manage products + 30 days of support"],
      faq: [
        { q: "How long does it take to build an online store?", a: "Usually 3 to 6 weeks, depending on how many products you have and how ready your photos and descriptions are. You get the exact date in your quote." },
        { q: "Can I manage products and orders myself?", a: "Yes. WooCommerce gives you a dashboard for products, prices and orders, and I train you to use it before launch." },
      ],
      cta: "Quote my store",
    },
    es: {
      name: "Tiendas en línea",
      short: "Vende en línea con carrito, pagos, envíos o recogida.",
      h1: "Tiendas en línea donde comprar es fácil",
      title: "Tienda en línea WooCommerce desde $2,000 — WillNet",
      description: "Tiendas en línea WooCommerce desde $2,000, listas en 3–6 semanas: catálogo, carrito, pagos en línea, recogida o entrega. Presupuesto gratis con WillNet, en inglés o español.",
      timeline: "3–6 semanas",
      intro: "Una tienda WooCommerce con tu catálogo, carrito y pagos en línea. Tú manejas los productos y pedidos, y yo te enseño cómo.",
      forWho: ["Negocios que ya venden y quieren vender en línea", "Marcas y emprendedores con productos físicos", "Tiendas locales que necesitan pedidos para recoger o entregar"],
      included: ["Tienda WooCommerce con diseño a medida", "Catálogo con categorías y variaciones", "Pagos en línea (Stripe y otras pasarelas)", "Opciones de recogida, entrega o envío", "Correos de pedido y confirmación", "Capacitación para manejar productos + 30 días de soporte"],
      faq: [
        { q: "¿Cuánto tarda hacer una tienda en línea?", a: "Normalmente de 3 a 6 semanas, según cuántos productos tengas y qué tan listas estén tus fotos y descripciones. La fecha exacta va en tu presupuesto." },
        { q: "¿Puedo manejar los productos y pedidos yo mismo?", a: "Sí. WooCommerce trae un panel para productos, precios y pedidos, y te capacito para usarlo antes del lanzamiento." },
      ],
      cta: "Cotizar mi tienda",
    },
  },
  {
    // Servicio pedido por Willder el 2026-10-26: muestra los logos y diseños que ha hecho
    key: "branding",
    price: 350,
    gallery: ["acl-logo", "alibel-logo", "anto-logo", "dopicos-card", "nicole-media-kit", "quinceanera", "birthday-invitation"],
    en: {
      name: "Branding",
      short: "Logos and visual identity so your business is recognized everywhere.",
      h1: "Branding and logo design that makes your business memorable",
      title: "Branding and logo design from $350 — WillNet",
      description: "Logo design and visual identity from $350, ready in 1–2 weeks: logo versions, colors, fonts and files for web, print and social media. Free quote from WillNet.",
      timeline: "1–2 weeks",
      intro: "Your logo and colors are the first thing people remember. I design an identity that fits your business and works the same on your website, your cards and your social media. I also design business cards, media kits and invitations.",
      forWho: ["New businesses that need a logo before launching", "Brands whose current logo looks dated or hard to read", "Businesses that want their website, cards and social media to look consistent"],
      included: ["Custom logo design", "Versions for light and dark backgrounds, one color and icon", "Color palette and fonts", "Files ready for web, print and social media (SVG, PNG and PDF)", "Short guide on how to use your brand"],
      faq: [
        { q: "What files do I get?", a: "SVG, PNG and PDF versions of your logo, ready for your website, print and social media, plus your colors and fonts." },
        { q: "Can you refresh my current logo instead of starting over?", a: "Yes. I can update your current logo while keeping what people already recognize, or create a new one if that works better for your business." },
      ],
      cta: "Get a branding quote",
    },
    es: {
      name: "Branding",
      short: "Logos e identidad visual para que tu negocio se reconozca en todas partes.",
      h1: "Branding y diseño de logos para que tu negocio se recuerde",
      title: "Branding y diseño de logos desde $350 — WillNet",
      description: "Diseño de logo e identidad visual desde $350, listo en 1–2 semanas: versiones del logo, colores, tipografías y archivos para web, impresión y redes. Presupuesto gratis con WillNet.",
      timeline: "1–2 semanas",
      intro: "Tu logo y tus colores son lo primero que la gente recuerda. Diseño una identidad que encaje con tu negocio y se vea igual en tu web, tus tarjetas y tus redes sociales. También diseño tarjetas de presentación, media kits e invitaciones.",
      forWho: ["Negocios nuevos que necesitan un logo antes de lanzar", "Marcas con un logo que se ve anticuado o cuesta leer", "Negocios que quieren que su web, sus tarjetas y sus redes se vean iguales"],
      included: ["Diseño de logo a medida", "Versiones para fondo claro y oscuro, a un color e ícono", "Paleta de colores y tipografías", "Archivos listos para web, impresión y redes (SVG, PNG y PDF)", "Guía corta de cómo usar tu marca"],
      faq: [
        { q: "¿Qué archivos recibo?", a: "Versiones de tu logo en SVG, PNG y PDF, listas para tu web, impresión y redes sociales, además de tus colores y tipografías." },
        { q: "¿Puedes renovar mi logo actual en lugar de empezar de cero?", a: "Sí. Puedo actualizar tu logo manteniendo lo que la gente ya reconoce, o crear uno nuevo si le conviene más a tu negocio." },
      ],
      cta: "Pedir presupuesto de branding",
    },
  },
  {
    key: "website-fixes",
    price: 300,
    en: {
      name: "Website fixes & redesigns",
      short: "Fix, speed up or modernize the website you already have.",
      h1: "Fix, speed up or redesign your current website",
      title: "Website fixes and redesigns from $300 — WillNet",
      description: "Website fixes, speed improvements and redesigns from $300. Full backup before any change. Free review of your current site with WillNet.",
      timeline: "Depends on the scope",
      intro: "Broken layout, slow pages, an old design or a feature that stopped working: I review your site, make a full backup and fix what's needed — or propose a redesign if it's worth it.",
      forWho: ["Businesses with a website that looks old or broken", "Sites that load slowly on mobile", "Owners who want new features without starting over"],
      included: ["Review of your current site", "Full backup before any change", "Design, layout and content fixes", "Speed and mobile improvements", "Plugin and theme updates", "30 days of support after delivery"],
      faq: [
        { q: "Can my current website be fixed, or does it need a redesign?", a: "Most sites can be fixed. I review yours first and tell you honestly which option costs less for the result you want." },
        { q: "Will I lose anything during the changes?", a: "No. I make a full backup before touching anything and work on a copy when the change is big." },
      ],
      cta: "Get my website checked",
    },
    es: {
      name: "Arreglos y rediseño web",
      short: "Arregla, acelera o moderniza la web que ya tienes.",
      h1: "Arregla, acelera o rediseña tu web actual",
      title: "Arreglos y rediseño web desde $300 — WillNet",
      description: "Arreglos web, mejoras de velocidad y rediseños desde $300. Respaldo completo antes de cualquier cambio. Revisión gratis de tu web actual con WillNet.",
      timeline: "Según el alcance",
      intro: "Diseño roto, páginas lentas, una imagen vieja o una función que dejó de funcionar: reviso tu web, hago un respaldo completo y arreglo lo necesario, o te propongo un rediseño si vale la pena.",
      forWho: ["Negocios con una web que se ve vieja o rota", "Webs que cargan lento en el celular", "Dueños que quieren funciones nuevas sin empezar de cero"],
      included: ["Revisión de tu web actual", "Respaldo completo antes de cualquier cambio", "Arreglos de diseño, estructura y contenido", "Mejoras de velocidad y en el celular", "Actualización de plugins y tema", "30 días de soporte después de la entrega"],
      faq: [
        { q: "¿Mi web actual se puede arreglar o necesita un rediseño?", a: "La mayoría se puede arreglar. Primero reviso la tuya y te digo con honestidad qué opción cuesta menos para el resultado que quieres." },
        { q: "¿Pierdo algo durante los cambios?", a: "No. Hago un respaldo completo antes de tocar nada y trabajo en una copia cuando el cambio es grande." },
      ],
      cta: "Revisar mi web",
    },
  },
  {
    key: "maintenance",
    price: 100,
    monthly: true,
    en: {
      name: "Website maintenance",
      short: "Updates, backups and small changes, every month.",
      h1: "Website maintenance, so you don't have to think about it",
      title: "Website maintenance from $100/month — WillNet",
      description: "Monthly website maintenance from $100: updates, backups, security checks and small content changes. In English or Spanish, with WillNet.",
      timeline: "Monthly",
      intro: "Your website keeps working after launch. I keep it updated, backed up and secure, and make the small changes you need along the way.",
      forWho: ["Businesses with a website or online store", "Owners who prefer not to touch the technical side", "Sites that change prices, photos or content often"],
      included: ["Domain and hosting management and renewals", "Software, theme and plugin updates", "Regular backups", "Security and uptime checks", "Small content changes each month", "Priority support by WhatsApp or email"],
      faq: [
        { q: "Who handles my domain and hosting?", a: "I do. The domain is registered in your name and I take care of hosting, security certificates and renewals. The first year comes with your project; after that, it's covered by this plan." },
        { q: "Can I cancel the plan?", a: "Yes. The plan is monthly; we agree on the details when you sign up." },
      ],
      cta: "Ask about maintenance",
    },
    es: {
      name: "Mantenimiento web",
      short: "Actualizaciones, respaldos y cambios pequeños, cada mes.",
      h1: "Mantenimiento web para que no tengas que pensar en eso",
      title: "Mantenimiento de páginas web desde $100 al mes — WillNet",
      description: "Mantenimiento web mensual desde $100: actualizaciones, respaldos, revisiones de seguridad y cambios pequeños de contenido. En inglés o español, con WillNet.",
      timeline: "Mensual",
      intro: "Tu web sigue funcionando después del lanzamiento. La mantengo actualizada, respaldada y segura, y hago los cambios pequeños que necesites.",
      forWho: ["Negocios con una web o tienda en línea", "Dueños que prefieren no tocar la parte técnica", "Webs que cambian precios, fotos o contenido seguido"],
      included: ["Gestión y renovación del dominio y el hosting", "Actualización del sistema, tema y plugins", "Respaldos periódicos", "Revisión de seguridad y disponibilidad", "Cambios pequeños de contenido cada mes", "Soporte prioritario por WhatsApp o correo"],
      faq: [
        { q: "¿Quién se encarga del dominio y el hosting?", a: "Yo. El dominio queda a tu nombre y me encargo del hosting, los certificados de seguridad y las renovaciones. El primer año va incluido en tu proyecto; después lo cubre este plan." },
        { q: "¿Puedo cancelar el plan?", a: "Sí. El plan es mensual; los detalles los acordamos al contratarlo." },
      ],
      cta: "Preguntar por el mantenimiento",
    },
  },
];

export const getService = (key: ServiceKey) => services.find((s) => s.key === key)!;

export const formatPrice = (n: number) => `$${n.toLocaleString("en-US")}`;

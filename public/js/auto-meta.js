(function () {
  const BASE_URL = "https://www.borel.cz";
  const SITE_NAME = "BOREL";
  const LOCALE = "cs_CZ";

  const PAGES = {
    "/": {
      title: "BOREL – Neonový webový projekt",
      description: "BOREL – moderní neonový webový projekt s fotogalerií, minihrou a interaktivním designem.",
      image: BASE_URL + "/logo.png",
      type: "website"
    },
    "/fotogalerie": {
      title: "Fotogalerie – BOREL",
      description: "Neonová fotogalerie projektu BOREL – moderní fotografie, světelné efekty a interaktivní galerie.",
      image: BASE_URL + "/foto/foto1.jpg",
      type: "website"
    },
    "/minihra": {
      title: "Minihra – BOREL",
      description: "Zahraj si neonovou minihru BOREL. Rychlá akce a skvělá zábava přímo v prohlížeči.",
      image: BASE_URL + "/foto/minihra-preview.png",
      type: "website"
    },
    "/o-mne": {
    title: "O mně – BOREL",
    description: "Kdo stojí za projektem BOREL, jak vznikl a co chystám dál.",
    image: BASE_URL + "/logo.png",
    type: "website"
    }
  };

  function getPath() {
    let p = window.location.pathname.replace(/\/+$/, "");
    if (p === "") p = "/";
    return p;
  }

  function ensureMetaName(name, content) {
    if (!content) return;
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", name);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  function ensureMetaProp(prop, content) {
    if (!content) return;
    let tag = document.querySelector(`meta[property="${prop}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("property", prop);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  function ensureLinkRel(rel, href) {
    if (!href) return;
    let link = document.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", rel);
      document.head.appendChild(link);
    }
    link.setAttribute("href", href);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const path = getPath();
    const cfg = PAGES[path] || PAGES["/"];

    const url = BASE_URL + (path === "/" ? "/" : path);

    // Title
    document.title = cfg.title;

    // Description
    ensureMetaName("description", cfg.description);

    // Open Graph
    ensureMetaProp("og:site_name", SITE_NAME);
    ensureMetaProp("og:locale", LOCALE);
    ensureMetaProp("og:type", cfg.type || "website");
    ensureMetaProp("og:url", url);
    ensureMetaProp("og:title", cfg.title);
    ensureMetaProp("og:description", cfg.description);
    ensureMetaProp("og:image", cfg.image);

    // Twitter
    ensureMetaName("twitter:card", "summary_large_image");
    ensureMetaName("twitter:title", cfg.title);
    ensureMetaName("twitter:description", cfg.description);
    ensureMetaName("twitter:image", cfg.image);

    // Canonical
    ensureLinkRel("canonical", url);
  });
})();
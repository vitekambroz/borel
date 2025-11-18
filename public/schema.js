// JSON-LD musí být mimo HTML kvůli CSP
document.addEventListener("DOMContentLoaded", () => {
  const baseUrl = "https://www.borel.cz";
  const pathRaw = window.location.pathname;
  const path = pathRaw.replace(/\/+$/, "") || "/";

  const graph = [];

  // === 1) WebSite – globální uzel pro celý projekt ===
  const websiteNode = {
    "@type": "WebSite",
    "@id": `${baseUrl}#website`,
    "name": "BOREL",
    "description": "BOREL – moderní neonový webový projekt s fotogalerií a minihrou.",
    "url": `${baseUrl}/`,
    "image": `${baseUrl}/logo.png`,
    "inLanguage": "cs",
    "author": {
      "@type": "Person",
      "name": "Vítek Ambrož"
    },
    "publisher": {
      "@type": "Organization",
      "name": "BOREL",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    }
  };

  graph.push(websiteNode);

  // === 2) Stránka podle URL ===
  if (path === "/") {
    // Domovská stránka – WebPage
    graph.push({
      "@type": "WebPage",
      "@id": `${baseUrl}#home`,
      "url": `${baseUrl}/`,
      "name": "BOREL – Neonový webový projekt",
      "description": "BOREL – moderní neonový webový projekt s fotogalerií, minihrou a interaktivním designem.",
      "isPartOf": { "@id": `${baseUrl}#website` },
      "inLanguage": "cs"
    });
  } else if (path === "/fotogalerie") {
    // Fotogalerie – použito přesně, co jsi poslal (ImageGallery)
    graph.push({
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      "name": "Fotogalerie – BOREL",
      "description": "Prohlédni si neonovou fotogalerii BOREL. Moderní efekty, světelné přechody a originální fotografie.",
      "url": `${baseUrl}/fotogalerie`,
      "inLanguage": "cs",
      "image": [
        `${baseUrl}/foto/foto1.jpg`,
        `${baseUrl}/foto/foto2.jpg`,
        `${baseUrl}/foto/foto3.jpg`
      ],
      "author": {
        "@type": "Person",
        "name": "Vítek Ambrož"
      },
      "publisher": {
        "@type": "Organization",
        "name": "BOREL",
        "logo": `${baseUrl}/logo.png`
      }
    });
  } else if (path === "/minihra") {
    // Minihra – použito přesně, co jsi poslal (VideoGame)
    graph.push({
      "@context": "https://schema.org",
      "@type": "VideoGame",
      "name": "Minihra – BOREL",
      "description": "Zahraj si neonovou minihru BOREL. Lehké ovládání, rychlá akce, skvělá zábava – přímo v prohlížeči.",
      "url": `${baseUrl}/minihra`,
      "image": `${baseUrl}/foto/minihra-preview.png`,
      "inLanguage": "cs",
      "genre": "Arcade",
      "applicationCategory": "Game",
      "operatingSystem": "Web",
      "author": {
        "@type": "Person",
        "name": "Vítek Ambrož"
      },
      "publisher": {
        "@type": "Organization",
        "name": "BOREL",
        "logo": `${baseUrl}/logo.png`
      }
    });
  }

  // === 3) Finální JSON-LD ===
  const ld = {
    "@context": "https://schema.org",
    "@graph": graph
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(ld);
  document.head.appendChild(script);
});
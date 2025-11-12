// JSON-LD musí být mimo HTML kvůli CSP
document.addEventListener("DOMContentLoaded", () => {
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BOREL",
    "description": "BOREL – moderní neonový webový projekt s fotogalerií a minihrou.",
    "url": "https://www.borel.cz/",
    "image": "https://www.borel.cz/logo.png",
    "inLanguage": "cs",
    "author": {
      "@type": "Person",
      "name": "Vítek Ambrož"
    },
    "publisher": {
      "@type": "Organization",
      "name": "BOREL",
      "logo": "https://www.borel.cz/logo.png"
    }
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(ld);
  document.head.appendChild(script);
});
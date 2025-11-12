document.addEventListener("DOMContentLoaded", () => {
  const data = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": "Minihra – BOREL",
    "description": "Zahraj si neonovou minihru BOREL. Lehké ovládání, rychlá akce, skvělá zábava – přímo v prohlížeči.",
    "url": "https://www.borel.cz/minihra",
    "image": "https://www.borel.cz/foto/minihra-preview.png",
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
      "logo": "https://www.borel.cz/logo.png"
    }
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
});
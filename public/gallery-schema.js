document.addEventListener("DOMContentLoaded", () => {
  const data = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": "Fotogalerie – BOREL",
    "description": "Prohlédni si neonovou fotogalerii BOREL. Moderní efekty, světelné přechody a originální fotografie.",
    "url": "https://www.borel.cz/fotogalerie",
    "inLanguage": "cs",
    "image": [
      "https://www.borel.cz/foto/foto1.jpg",
      "https://www.borel.cz/foto/foto2.jpg",
      "https://www.borel.cz/foto/foto3.jpg"
    ],
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
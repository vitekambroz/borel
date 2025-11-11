const galleryPhotos = [
  'foto1.jpg', 'foto2.jpg', 'foto3.jpg', 'foto4.jpg', 'foto5.jpg',
  'foto6.jpg', 'foto7.jpg', 'foto8.jpg', 'foto9.jpg', 'foto10.jpg',
  'foto11.jpg', 'foto12.jpg', 'foto13.jpg', 'foto14.jpg', 'foto15.jpg',
  'foto16.jpg', 'foto17.jpg', 'foto18.jpg', 'foto19.jpg', 'foto20.jpg',
  'foto21.jpg', 'foto22.jpg', 'foto23.jpg', 'foto24.jpg', 'foto25.jpg',
  'foto26.jpg', 'foto27.jpg', 'foto28.jpg', 'foto29.jpg', 'foto30.jpg',
  'foto31.jpg', 'foto32.jpg', 'foto33.jpg', 'foto34.jpg', 'foto35.jpg',
  'foto36.jpg', 'foto37.jpg', 'foto38.jpg', 'foto39.jpg', 'foto40.jpg',
  'foto41.jpg', 'foto42.jpg', 'foto43.jpg', 'foto44.jpg', 'foto45.jpg'
];

// === 1) Widget galerie na hlavní stránce ===
document.addEventListener("DOMContentLoaded", () => {
  const widgetGallery = document.getElementById("widgetGallery");
  if (!widgetGallery) return;

  const startIndex = galleryPhotos.length - 5;

  galleryPhotos.slice(-5).forEach((img, i) => {
    const el = document.createElement("img");
    el.src = `foto/thumbnails/${img}`;
    el.alt = "Fotogalerie";
    el.loading = "lazy";
    el.classList.add("widget-photo");

    // Přesměrování do galerie s hash indexem (#xx)
    el.addEventListener("click", () => {
      const index = startIndex + i + 1;
      window.location.href = `/fotogalerie#${index}`;
    });

    widgetGallery.appendChild(el);
  });

  // === 2) Efekt záře při najetí ===
  widgetGallery.addEventListener("mouseover", (e) => {
    if (e.target.classList.contains("widget-photo")) {
      e.target.classList.add("hovered");
    }
  });

  widgetGallery.addEventListener("mouseout", (e) => {
    if (e.target.classList.contains("widget-photo")) {
      e.target.classList.remove("hovered");
    }
  });
});
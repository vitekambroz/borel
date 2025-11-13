const galleryPhotos = [
  'foto1.jpg','foto2.jpg','foto3.jpg','foto4.jpg','foto5.jpg',
  'foto6.jpg','foto7.jpg','foto8.jpg','foto9.jpg','foto10.jpg',
  'foto11.jpg','foto12.jpg','foto13.jpg','foto14.jpg','foto15.jpg',
  'foto16.jpg','foto17.jpg','foto18.jpg','foto19.jpg','foto20.jpg',
  'foto21.jpg','foto22.jpg','foto23.jpg','foto24.jpg','foto25.jpg',
  'foto26.jpg','foto27.jpg','foto28.jpg','foto29.jpg','foto30.jpg',
  'foto31.jpg','foto32.jpg','foto33.jpg','foto34.jpg','foto35.jpg',
  'foto36.jpg','foto37.jpg','foto38.jpg','foto39.jpg','foto40.jpg',
  'foto41.jpg','foto42.jpg','foto43.jpg','foto44.jpg','foto45.jpg'
];

let currentImageIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  console.log("gallery.js: DOM ready");

  const grid        = document.getElementById("galleryGrid");
  const lightbox    = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const counter     = document.getElementById("lightboxCounter");
  const btnClose    = document.querySelector(".close");
  const btnPrev     = document.querySelector(".prev");
  const btnNext     = document.querySelector(".next");

  if (!grid) {
    console.warn("gallery.js: #galleryGrid NOT FOUND");
    return;
  }
  console.log("gallery.js: galleryGrid OK → generuji náhledy…");

  // === 1) Vygenerování náhledů (bez IntersectionObserver – na jistotu) ===
  galleryPhotos.forEach((src, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "img-wrapper";

    const img = document.createElement("img");
    img.src = `foto/thumbnails/${src}`;     // přímo načtu – žádná magie
    img.alt = `Fotka ${index + 1}`;
    img.dataset.index = index;
    img.width = 400;
    img.height = 300;

    img.addEventListener("load", () => {
      img.classList.add("loaded");
    });

    wrapper.appendChild(img);
    grid.appendChild(wrapper);
  });

  // === 2) Event delegace – klik na grid chytá všechny obrázky ===
  grid.addEventListener("click", (e) => {
    const img = e.target.closest("img[data-index]");
    if (!img) return;

    const index = parseInt(img.dataset.index, 10);
    if (Number.isNaN(index)) return;

    console.log("gallery.js: click z gridu → index", index);
    openLightbox(index, true);
  });

  // === 3) Otevření lightboxu ===
  function openLightbox(index, pushHash = false) {
    if (!lightbox || !lightboxImg || !counter) return;

    currentImageIndex = index;
    const src = `foto/originals/${galleryPhotos[index]}`;
    lightboxImg.src = src;
    counter.textContent = `${index + 1} / ${galleryPhotos.length}`;
    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";

    if (pushHash) {
      history.replaceState(null, "", `#${index + 1}`);
    }

    console.log("gallery.js: openLightbox →", index, src);
  }

  // === 4) Zavření ===
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("show");
    document.body.style.overflow = "";

    const cleanUrl = window.location.pathname + window.location.search;
    history.replaceState(null, "", cleanUrl);
    console.log("gallery.js: closeLightbox");
  }

  // === 5) Přepínání fotek (bez složitých animací – jednoduché & spolehlivé) ===
  function changeSlide(dir) {
    if (!lightboxImg) return;
    if (!lightbox?.classList.contains("show")) return;

    let nextIndex = currentImageIndex + dir;
    if (nextIndex < 0) nextIndex = galleryPhotos.length - 1;
    if (nextIndex >= galleryPhotos.length) nextIndex = 0;

    currentImageIndex = nextIndex;
    const src = `foto/originals/${galleryPhotos[nextIndex]}`;
    lightboxImg.src = src;
    counter.textContent = `${nextIndex + 1} / ${galleryPhotos.length}`;
    history.replaceState(null, "", `#${nextIndex + 1}`);

    console.log("gallery.js: changeSlide →", nextIndex);
  }

  // === 6) Ovládání tlačítek ===
  if (btnClose) btnClose.addEventListener("click", closeLightbox);
  if (btnPrev)  btnPrev.addEventListener("click", () => changeSlide(-1));
  if (btnNext)  btnNext.addEventListener("click", () => changeSlide(1));

  // === 7) Klávesy ===
  document.addEventListener("keydown", (e) => {
    if (!lightbox?.classList.contains("show")) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") changeSlide(-1);
    if (e.key === "ArrowRight") changeSlide(1);
  });

  // === 8) Klik mimo fotku = zavřít ===
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // === 9) Swipe na mobilu (IG styl) ===
  let touchStartX = null;

  if (lightbox) {
    lightbox.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
      }
    });

    lightbox.addEventListener("touchend", (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;

      const SWIPE_MIN = 50; // minimální vzdálenost
      if (Math.abs(dx) < SWIPE_MIN) return;

      if (dx < 0) {
        // swipe doleva → další
        changeSlide(1);
      } else {
        // swipe doprava → předchozí
        changeSlide(-1);
      }
    });
  }

  // === 10) Otevři podle hash (#číslo) při načtení stránky ===
  const hash = window.location.hash.replace("#", "");
  const num = parseInt(hash, 10);
  if (!Number.isNaN(num) && num >= 1 && num <= galleryPhotos.length) {
    console.log("gallery.js: found hash → otevírám fotku", num);
    openLightbox(num - 1, false);
  }
});
/* =========================================================
   BOREL – Modern Instagram Gallery (2025)
   Kompletně přepsaný gallery.js
========================================================= */

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

let currentIndex = 0;
let startX = 0;         // swipe start
let isSwiping = false;  // swipe active

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("galleryGrid");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const counter = document.getElementById("lightboxCounter");
  const btnClose = document.querySelector(".close");
  const btnPrev = document.querySelector(".prev");
  const btnNext = document.querySelector(".next");

  /* ---------------------------------------------------------
     1) Vytvoření galerie (thumbnails + shimmer)
  --------------------------------------------------------- */
  galleryPhotos.forEach((src, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "img-wrapper shimmer";

    const img = document.createElement("img");
    img.dataset.src = `foto/thumbnails/${src}`;
    img.dataset.index = index;
    img.alt = "Fotografie";
    img.loading = "lazy";
    img.classList.add("lazy-fade");
    img.width = 400;
    img.height = 300;

    img.addEventListener("load", () => {
      wrapper.classList.remove("shimmer");
      img.classList.add("loaded");
      wrapper.classList.add("glow-in");
    });

    img.addEventListener("click", () => openLightbox(index, true));

    wrapper.appendChild(img);
    grid.appendChild(wrapper);
  });

  /* ---------------------------------------------------------
     2) Lazy loading s IntersectionObserver
  --------------------------------------------------------- */
  const lazyImgs = document.querySelectorAll(".lazy-fade");

  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const img = e.target;
          const src = img.dataset.src;
          if (src) img.src = src;
          observer.unobserve(img);
        }
      });
    }, { rootMargin: "150px" });

    lazyImgs.forEach(img => obs.observe(img));
  } else {
    // fallback
    lazyImgs.forEach(img => img.src = img.dataset.src);
  }

  /* ---------------------------------------------------------
     3) Otevření lightboxu
  --------------------------------------------------------- */
  function openLightbox(index, pushHash = true) {
    currentIndex = index;

    lightboxImg.src = `foto/originals/${galleryPhotos[index]}`;
    counter.textContent = `${index + 1} / ${galleryPhotos.length}`;
    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";

    if (pushHash) history.replaceState(null, "", `#${index + 1}`);
  }

  /* ---------------------------------------------------------
     4) Zavření lightboxu
  --------------------------------------------------------- */
  function closeLightbox() {
    lightbox.classList.remove("show");
    document.body.style.overflow = "auto";
    history.replaceState(null, "", window.location.pathname);
  }

  /* ---------------------------------------------------------
     5) Přepínání fotek s animací
  --------------------------------------------------------- */
  function changeSlide(dir) {
    const nextIndex = (currentIndex + dir + galleryPhotos.length) % galleryPhotos.length;
    const nextSrc = `foto/originals/${galleryPhotos[nextIndex]}`;

    const outClass = dir === 1 ? "is-exiting-left" : "is-exiting-right";
    const inClass  = dir === 1 ? "is-entering-right" : "is-entering-left";

    const preload = new Image();
    preload.src = nextSrc;

    lightboxImg.classList.add(outClass);

    lightboxImg.addEventListener("transitionend", function onOut(e) {
      if (e.propertyName !== "opacity") return;
      lightboxImg.removeEventListener("transitionend", onOut);

      lightboxImg.src = nextSrc;
      lightboxImg.classList.remove(outClass);
      lightboxImg.classList.add(inClass);

      requestAnimationFrame(() => {
        lightboxImg.classList.remove(inClass);
      });

      currentIndex = nextIndex;
      counter.textContent = `${currentIndex + 1} / ${galleryPhotos.length}`;
      history.replaceState(null, "", `#${currentIndex + 1}`);
    });
  }

  /* ---------------------------------------------------------
     6) SWIPE GESTA jako Instagram (mobile)
  --------------------------------------------------------- */
  lightboxImg.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    isSwiping = true;
  });

  lightboxImg.addEventListener("touchmove", e => {
    if (!isSwiping) return;
    const dx = e.touches[0].clientX - startX;

    // vizuální efekt “posunu” obrázku
    lightboxImg.style.transform = `translateX(${dx * 0.2}px)`;
  });

  lightboxImg.addEventListener("touchend", e => {
    if (!isSwiping) return;
    isSwiping = false;

    const dx = e.changedTouches[0].clientX - startX;

    // swipe threshold
    if (dx > 80) changeSlide(-1); // doprava → předchozí
    else if (dx < -80) changeSlide(1); // doleva → další

    // reset transform
    lightboxImg.style.transform = "translateX(0)";
  });

  /* ---------------------------------------------------------
     7) Ovládání myší / klávesnicí
  --------------------------------------------------------- */
  btnClose?.addEventListener("click", closeLightbox);
  btnPrev?.addEventListener("click", () => changeSlide(-1));
  btnNext?.addEventListener("click", () => changeSlide(1));

  document.addEventListener("keydown", e => {
    if (!lightbox.classList.contains("show")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") changeSlide(-1);
    if (e.key === "ArrowRight") changeSlide(1);
  });

  lightbox.addEventListener("click", e => {
    if (e.target === lightbox) closeLightbox();
  });

  /* ---------------------------------------------------------
     8) Otevření z URL #hash
  --------------------------------------------------------- */
  const hash = window.location.hash.replace("#", "");
  const num = parseInt(hash, 10);

  if (!isNaN(num) && num >= 1 && num <= galleryPhotos.length) {
    openLightbox(num - 1, false);
  }
});
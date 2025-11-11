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
  const grid = document.getElementById("galleryGrid");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const counter = document.getElementById("lightboxCounter");
  const btnClose = document.querySelector(".close");
  const btnPrev = document.querySelector(".prev");
  const btnNext = document.querySelector(".next");

  if (!grid) return;

  // === 1) Vygenerování náhledů ===
  galleryPhotos.forEach((src, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "img-wrapper shimmer";

    const img = document.createElement("img");
    img.dataset.src = `foto/thumbnails/${src}`;
    img.alt = `Fotka ${index + 1}`;
    img.dataset.index = index;
    img.classList.add("lazy-fade");

    img.addEventListener("load", () => {
      wrapper.classList.remove("shimmer");
      img.classList.add("loaded");
    });

    img.addEventListener("click", () => openLightbox(index, true));

    wrapper.appendChild(img);
    grid.appendChild(wrapper);
  });

  // === 2) Lazy-load pomocí IntersectionObserver ===
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        if (src) {
          img.src = src;
          img.removeAttribute("data-src");
        }
        obs.unobserve(img);
      }
    });
  }, {
    rootMargin: "100px",
    threshold: 0.1
  });

  document.querySelectorAll(".lazy-fade").forEach(img => observer.observe(img));

  // === 3) Otevření lightboxu ===
  function openLightbox(index, pushHash = false) {
    if (!lightbox || !lightboxImg) return;

    currentImageIndex = index;
    lightboxImg.src = `foto/${galleryPhotos[index]}`;
    counter.textContent = `${index + 1} / ${galleryPhotos.length}`;
    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";

    if (pushHash) history.replaceState(null, "", `#${index + 1}`);
  }

  // === 4) Zavření ===
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("show");
    document.body.style.overflow = "auto";
    history.replaceState(null, "", " ");
  }

  // === 5) Přepínání s animací ===
  function changeSlide(dir) {
    if (!lightboxImg) return;

    const nextIndex = (currentImageIndex + dir + galleryPhotos.length) % galleryPhotos.length;
    const nextSrc = `foto/${galleryPhotos[nextIndex]}`;
    const outClass = dir > 0 ? "is-exiting-left" : "is-exiting-right";
    const inClass  = dir > 0 ? "is-entering-right" : "is-entering-left";

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

      currentImageIndex = nextIndex;
      counter.textContent = `${currentImageIndex + 1} / ${galleryPhotos.length}`;
      history.replaceState(null, "", `#${currentImageIndex + 1}`);
    }, { once: true });
  }

  // === 6) Ovládání ===
  if (btnClose) btnClose.addEventListener("click", closeLightbox);
  if (btnPrev)  btnPrev.addEventListener("click", () => changeSlide(-1));
  if (btnNext)  btnNext.addEventListener("click", () => changeSlide(1));

  document.addEventListener("keydown", e => {
    if (!lightbox?.classList.contains("show")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") changeSlide(-1);
    if (e.key === "ArrowRight") changeSlide(1);
  });

  lightbox?.addEventListener("click", e => {
    if (e.target === lightbox) closeLightbox();
  });

  // === 7) Otevři podle #hash ===
  const hash = window.location.hash.replace("#", "");
  const num = parseInt(hash, 10);
  if (!isNaN(num) && num >= 1 && num <= galleryPhotos.length) {
    openLightbox(num - 1, false);
  }
});

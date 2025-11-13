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

  const grid        = document.getElementById("galleryGrid");
  const lightbox    = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const counter     = document.getElementById("lightboxCounter");
  const btnClose    = document.querySelector(".close");
  const btnPrev     = document.querySelector(".prev");
  const btnNext     = document.querySelector(".next");

  if (!grid) return;

  /* === 1) Generate thumbnails === */
  galleryPhotos.forEach((src, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "img-wrapper";

    const img = document.createElement("img");
    img.src = `foto/thumbnails/${src}`;
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

  /* === 2) Click on thumbnail → open lightbox === */
  grid.addEventListener("click", (e) => {
    const img = e.target.closest("img[data-index]");
    if (!img) return;

    const index = parseInt(img.dataset.index, 10);
    if (!Number.isNaN(index)) {
      openLightbox(index, true);
    }
  });

  /* === 3) Open lightbox === */
  function openLightbox(index, pushHash = false) {
    if (!lightbox || !lightboxImg) return;

    currentImageIndex = index;
    lightboxImg.src = `foto/originals/${galleryPhotos[index]}`;
    counter.textContent = `${index + 1} / ${galleryPhotos.length}`;
    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";

    if (pushHash) {
      history.replaceState(null, "", `#${index + 1}`);
    }
  }

  /* === 4) Close === */
  function closeLightbox() {
    if (!lightbox) return;

    lightbox.classList.remove("show");
    document.body.style.overflow = "";

    const cleanUrl = window.location.pathname + window.location.search;
    history.replaceState(null, "", cleanUrl);
  }

  /* === 5) Change slide === */
  function changeSlide(dir) {
    if (!lightboxImg) return;
    if (!lightbox.classList.contains("show")) return;

    let nextIndex = currentImageIndex + dir;
    if (nextIndex < 0) nextIndex = galleryPhotos.length - 1;
    if (nextIndex >= galleryPhotos.length) nextIndex = 0;

    currentImageIndex = nextIndex;

    lightboxImg.src = `foto/originals/${galleryPhotos[nextIndex]}`;
    counter.textContent = `${nextIndex + 1} / ${galleryPhotos.length}`;
    history.replaceState(null, "", `#${nextIndex + 1}`);
  }

  /* === 6) Buttons === */
  if (btnClose) btnClose.addEventListener("click", closeLightbox);
  if (btnPrev)  btnPrev.addEventListener("click", () => changeSlide(-1));
  if (btnNext)  btnNext.addEventListener("click", () => changeSlide(1));

  /* === 7) Keyboard === */
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("show")) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") changeSlide(-1);
    if (e.key === "ArrowRight") changeSlide(1);
  });

  /* === 8) Click outside === */
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  /* === 9) Swipe (mobile) === */
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

      if (Math.abs(dx) < 50) return;

      if (dx < 0) changeSlide(1);
      else changeSlide(-1);
    });
  }

  /* === 10) Open by hash on load === */
  const hash = window.location.hash.replace("#", "");
  const num = parseInt(hash, 10);

  if (!Number.isNaN(num) && num >= 1 && num <= galleryPhotos.length) {
    openLightbox(num - 1, false);
  }
});
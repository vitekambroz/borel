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

  if (!grid || !lightboxImg) return;

  /* === FIX FADE-IN === */
  lightboxImg.addEventListener("load", () => {
    lightboxImg.classList.add("loaded");
  });

  /* === 1) Generate thumbnails === */
  galleryPhotos.forEach((src, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "img-wrapper";

    const img = document.createElement("img");
    img.src = `foto/thumbnails/${src}`;
    img.alt = `Fotka ${index + 1}`;
    img.dataset.index = index;

    img.addEventListener("load", () => img.classList.add("loaded"));

    wrapper.appendChild(img);
    grid.appendChild(wrapper);
  });

  /* === 2) Click thumbnail === */
  grid.addEventListener("click", (e) => {
    const img = e.target.closest("img[data-index]");
    if (!img) return;
    const index = parseInt(img.dataset.index);
    if (!isNaN(index)) openLightbox(index, true);
  });

  /* === OPEN LIGHTBOX === */
  function openLightbox(index, pushHash = false) {
    currentImageIndex = index;

    // FIX → reset opacity for fade-in
    lightboxImg.classList.remove("loaded");

    // load img
    lightboxImg.src = `foto/originals/${galleryPhotos[index]}`;

    // update counter
    counter.textContent = `${index + 1} / ${galleryPhotos.length}`;

    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";

    if (pushHash) history.replaceState(null, "", `#${index + 1}`);
  }

  /* === CLOSE === */
  function closeLightbox() {
    lightbox.classList.remove("show");
    document.body.style.overflow = "";
    history.replaceState(null, "", window.location.pathname);
  }

  /* === CHANGE SLIDE === */
  function changeSlide(dir) {
    if (!lightbox.classList.contains("show")) return;

    let next = currentImageIndex + dir;
    if (next < 0) next = galleryPhotos.length - 1;
    if (next >= galleryPhotos.length) next = 0;
    currentImageIndex = next;

    // Fade reset
    lightboxImg.classList.remove("loaded");

    // Load next
    lightboxImg.src = `foto/originals/${galleryPhotos[next]}`;

    counter.textContent = `${next + 1} / ${galleryPhotos.length}`;
    history.replaceState(null, "", `#${next + 1}`);
  }

  /* === Buttons === */
  if (btnClose) btnClose.addEventListener("click", closeLightbox);
  if (btnPrev)  btnPrev.addEventListener("click", () => changeSlide(-1));
  if (btnNext)  btnNext.addEventListener("click", () => changeSlide(1));

  /* === Keyboard === */
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("show")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") changeSlide(-1);
    if (e.key === "ArrowRight") changeSlide(1);
  });

  /* === Close by clicking background === */
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  /* === Swipe === */
  let touchStartX = null;
  lightbox.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) touchStartX = e.touches[0].clientX;
  });
  lightbox.addEventListener("touchend", (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(dx) < 50) return;
    dx < 0 ? changeSlide(1) : changeSlide(-1);
  });

  /* === Open directly via #hash === */
  const hash = window.location.hash.replace("#","");
  const num = parseInt(hash);
  if (!isNaN(num) && num >= 1 && num <= galleryPhotos.length) {
    openLightbox(num - 1, false);
  }
});
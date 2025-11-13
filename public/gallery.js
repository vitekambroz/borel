document.addEventListener("DOMContentLoaded", () => {

  console.log("gallery.js: DOM ready");

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

  const grid        = document.getElementById("galleryGrid");
  const lightbox    = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const counter     = document.getElementById("lightboxCounter");
  const btnClose    = document.querySelector("#lightbox .close");
  const btnPrev     = document.querySelector("#lightbox .prev");
  const btnNext     = document.querySelector("#lightbox .next");

  if (!grid) {
    console.error("‼️ galleryGrid nebyl nalezen na stránce — gallery.js končí");
    return;
  }

  console.log("gallery.js: galleryGrid OK → generuji obrázky…");

  /* --------------------------------------------------
     Vygenerování náhledů
  -------------------------------------------------- */
  galleryPhotos.forEach((file, index) => {
    const wrap = document.createElement("div");
    wrap.className = "img-wrapper shimmer";

    const img = document.createElement("img");
    img.dataset.src = `foto/thumbnails/${file}`;
    img.dataset.index = index;
    img.alt = `Foto ${index + 1}`;
    img.loading = "lazy";
    img.width = 400;
    img.height = 300;
    img.classList.add("lazy-fade");

    img.addEventListener("load", () => {
      wrap.classList.remove("shimmer");
      img.classList.add("loaded");
    });

    img.addEventListener("click", () => {
      console.log("Kliknuto na index:", index);
      openLightbox(index);
    });

    wrap.appendChild(img);
    grid.appendChild(wrap);
  });

  /* --------------------------------------------------
     Lazy-load
  -------------------------------------------------- */
  const lazyImages = document.querySelectorAll(".lazy-fade");

  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries, ob) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const img = e.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        ob.unobserve(img);
      });
    }, { rootMargin: "100px" });

    lazyImages.forEach(img => obs.observe(img));
  } else {
    lazyImages.forEach(img => img.src = img.dataset.src);
  }

  /* --------------------------------------------------
     Lightbox logic
  -------------------------------------------------- */

  function openLightbox(i) {
    console.log("Lightbox: otevření", i);

    currentIndex = i;
    setImage(i);

    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";

    history.replaceState(null, "", `#${i + 1}`);
  }

  function closeLightbox() {
    lightbox.classList.remove("show");
    document.body.style.overflow = "";

    const clean = window.location.pathname + window.location.search;
    history.replaceState(null, "", clean);
  }

  function setImage(i) {
    const src = `foto/originals/${galleryPhotos[i]}`;
    console.log("Lightbox: set image", src);

    lightboxImg.style.opacity = "0";

    const preload = new Image();
    preload.onload = () => {
      lightboxImg.src = src;

      requestAnimationFrame(() => {
        lightboxImg.style.transition = "opacity 0.3s";
        lightboxImg.style.opacity = "1";
      });
    };

    preload.src = src;
    counter.textContent = `${i + 1} / ${galleryPhotos.length}`;
  }

  function next() { setImage((currentIndex = (currentIndex + 1) % galleryPhotos.length)); }
  function prev() { setImage((currentIndex = (currentIndex - 1 + galleryPhotos.length) % galleryPhotos.length)); }

  if (btnPrev) btnPrev.onclick = prev;
  if (btnNext) btnNext.onclick = next;
  if (btnClose) btnClose.onclick = closeLightbox;

  lightbox.addEventListener("click", e => {
    if (e.target === lightbox) closeLightbox();
  });

  /* --------------------------------------------------
     Podpora hash (#21)
  -------------------------------------------------- */
  const hash = parseInt(location.hash.replace("#", ""), 10);
  if (!isNaN(hash) && hash >= 1 && hash <= galleryPhotos.length) {
    console.log("Otevírám fotku podle hash:", hash);
    openLightbox(hash - 1);
  }
});
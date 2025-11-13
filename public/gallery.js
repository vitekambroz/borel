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
  const grid          = document.getElementById("galleryGrid");
  const lightbox      = document.getElementById("lightbox");
  const lightboxImg   = document.getElementById("lightboxImg");
  const counter       = document.getElementById("lightboxCounter");
  const btnClose      = document.querySelector("#lightbox .close");
  const btnPrev       = document.querySelector("#lightbox .prev");
  const btnNext       = document.querySelector("#lightbox .next");

  if (!grid || !lightbox || !lightboxImg || !counter) return;

  /* --------------------------------------------------
     1) Vygenerování náhledů 400×300
  -------------------------------------------------- */
  galleryPhotos.forEach((src, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "img-wrapper shimmer";

    const img = document.createElement("img");
    img.dataset.src   = `foto/thumbnails/${src}`;
    img.alt           = `Fotka ${index + 1}`;
    img.dataset.index = index;
    img.loading       = "lazy";
    img.width         = 400;
    img.height        = 300;
    img.classList.add("lazy-fade");

    img.addEventListener("load", () => {
      wrapper.classList.remove("shimmer");
      img.classList.add("loaded");
    });

    img.addEventListener("click", () => {
      openLightbox(index, true);
    });

    wrapper.appendChild(img);
    grid.appendChild(wrapper);
  });

  /* --------------------------------------------------
     2) Lazy-load přes IntersectionObserver
  -------------------------------------------------- */
  const lazyImages = document.querySelectorAll(".lazy-fade");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        const src = img.dataset.src;
        if (src) {
          img.src = src;
          img.removeAttribute("data-src");
        }
        obs.unobserve(img);
      });
    }, {
      rootMargin: "100px",
      threshold: 0.1
    });

    lazyImages.forEach(img => observer.observe(img));
  } else {
    // fallback – načti hned
    lazyImages.forEach(img => {
      const src = img.dataset.src;
      if (src) {
        img.src = src;
        img.removeAttribute("data-src");
      }
    });
  }

  /* --------------------------------------------------
     3) Funkce na otevření / zavření lightboxu
  -------------------------------------------------- */
  function setImage(index, updateHash = true) {
    currentImageIndex = index;
    const src = `foto/originals/${galleryPhotos[index]}`;

    // fade efekt – nejdřív průhledný
    lightboxImg.style.opacity = "0";

    const preload = new Image();
    preload.onload = () => {
      lightboxImg.src = src;
      counter.textContent = `${index + 1} / ${galleryPhotos.length}`;

      requestAnimationFrame(() => {
        lightboxImg.style.transition = "opacity 0.3s ease";
        lightboxImg.style.opacity = "1";
      });
    };
    preload.src = src;

    if (updateHash) {
      history.replaceState(null, "", `#${index + 1}`);
    }
  }

  function openLightbox(index, updateHash = true) {
    setImage(index, updateHash);
    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("show");
    document.body.style.overflow = "";
    // smaž hash
    const cleanUrl = window.location.pathname + window.location.search;
    history.replaceState(null, "", cleanUrl);
  }

  /* --------------------------------------------------
     4) Přepínání fotek (tlačítka / klávesy / swipe)
  -------------------------------------------------- */
  function changeSlide(dir) {
    const total = galleryPhotos.length;
    const nextIndex = (currentImageIndex + dir + total) % total;
    setImage(nextIndex, true);
  }

  // tlačítka
  if (btnPrev) btnPrev.addEventListener("click", () => changeSlide(-1));
  if (btnNext) btnNext.addEventListener("click", () => changeSlide(1));
  if (btnClose) btnClose.addEventListener("click", closeLightbox);

  // klik mimo fotku zavře
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // klávesy
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("show")) return;
    if (e.key === "Escape")      closeLightbox();
    if (e.key === "ArrowLeft")   changeSlide(-1);
    if (e.key === "ArrowRight")  changeSlide(1);
  });

  // swipe na mobilu (lightbox)
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox.addEventListener("touchstart", (e) => {
    if (!lightbox.classList.contains("show")) return;
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
  });

  lightbox.addEventListener("touchend", (e) => {
    if (!lightbox.classList.contains("show")) return;
    touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;

    const threshold = 50; // px
    if (Math.abs(diff) < threshold) return;

    if (diff < 0) {
      // swipe doleva → další
      changeSlide(1);
    } else {
      // swipe doprava → předchozí
      changeSlide(-1);
    }
  });

  /* --------------------------------------------------
     5) Otevření podle #hash (fotogalerie#21 apod.)
  -------------------------------------------------- */
  const rawHash = window.location.hash.replace("#", "");
  const num = parseInt(rawHash, 10);

  if (!isNaN(num) && num >= 1 && num <= galleryPhotos.length) {
    // Otevři rovnou konkrétní fotku podle hash
    openLightbox(num - 1, false);
  }
});
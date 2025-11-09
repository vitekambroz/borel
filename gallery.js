// === BOREL - Galerie (verze s hash podporou) ===

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

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const counter = document.getElementById('lightboxCounter');
  const btnClose = document.querySelector('.close');
  const btnPrev = document.querySelector('.prev');
  const btnNext = document.querySelector('.next');

  // === 1) Vygenerování náhledů ===
  galleryPhotos.forEach((src, index) => {
    const img = document.createElement('img');
    img.src = 'foto/thumbnails/' + src;
    img.alt = 'Fotka ' + (index + 1);
    img.loading = 'lazy';
    img.dataset.index = index;
    img.addEventListener('click', () => openLightbox(index, true));
    grid.appendChild(img);
  });

  // === 2) Otevření lightboxu ===
  function openLightbox(index, pushHash = false) {
    currentImageIndex = index;
    lightboxImg.src = 'foto/' + galleryPhotos[index];
    counter.textContent = `${index + 1} / ${galleryPhotos.length}`;
    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';

    if (pushHash) {
      history.replaceState(null, '', `#${index + 1}`);
    }
  }

  // === 3) Zavření ===
  function closeLightbox() {
    lightbox.classList.remove('show');
    document.body.style.overflow = 'auto';
    history.replaceState(null, '', ' ');
  }

  // === 4) Přepínání ===
  function changeSlide(dir) {
    currentImageIndex = (currentImageIndex + dir + galleryPhotos.length) % galleryPhotos.length;
    lightboxImg.src = 'foto/' + galleryPhotos[currentImageIndex];
    counter.textContent = `${currentImageIndex + 1} / ${galleryPhotos.length}`;
    history.replaceState(null, '', `#${currentImageIndex + 1}`);
  }

  // === 5) Ovládání ===
  btnClose?.addEventListener('click', closeLightbox);
  btnPrev?.addEventListener('click', () => changeSlide(-1));
  btnNext?.addEventListener('click', () => changeSlide(1));

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('show')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') changeSlide(-1);
    if (e.key === 'ArrowRight') changeSlide(1);
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // === 6) Při načtení – pokud je v URL hash (#číslo), otevři danou fotku ===
  const hash = window.location.hash.replace('#', '');
  const num = parseInt(hash, 10);
  if (!isNaN(num) && num >= 1 && num <= galleryPhotos.length) {
    openLightbox(num - 1, false);
  }
});

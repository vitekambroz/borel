// Array of gallery images - nahraď svými názvy souborů!
var galleryPhotos = [
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

function generateGallery() {
    var galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;

    for (var index = 0; index < galleryPhotos.length; index++) {
        var img = document.createElement('img');
        img.src = 'foto/thumbnails/' + galleryPhotos[index]; // zde přidáš cestu
        img.alt = 'Fotka ' + (index + 1);
        img.onclick = (function(i) {
            return function() {
                openLightbox(i);
            };
        })(index);
        galleryGrid.appendChild(img);
    }
}
// Show last 5 photos on main page widget
// Show last 5 photos on main page widget
const widgetGallery = document.getElementById('widgetGallery');
if (widgetGallery) {
  const startIndex = galleryPhotos.length - 5;
  galleryPhotos.slice(-5).forEach((img, i) => {
    const el = document.createElement('img');
    el.src = 'foto/thumbnails/' + img;
    el.alt = 'Fotogalerie';
    el.style.cursor = 'pointer';

    // Kliknutí přesměruje do galerie s hash indexem (#21)
    el.addEventListener('click', () => {
      const index = startIndex + i + 1; // +1 protože hash = 1-based
      window.location.href = `fotogalerie.html#${index}`;
    });

    widgetGallery.appendChild(el);
  });
}

// Optionally add fun js animation to gallery photos
document.querySelectorAll('.widget-gallery img').forEach(img => {
    img.addEventListener('mouseenter', () => {
        img.style.boxShadow = '0 0 18px #fc6fbe, 0 0 5px #fff0fa';
    });
    img.addEventListener('mouseleave', () => {
        img.style.boxShadow = '0 0 8px #ffcce3';
    });
});
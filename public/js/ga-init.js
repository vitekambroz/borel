// ga-init.js
window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }
window.gtag = window.gtag || gtag;

window.addEventListener('load', function () {
  if (typeof window.gtag !== 'function') return;

  window.gtag('js', new Date());
  window.gtag('config', 'G-XXXXXXXXXX', {
    anonymize_ip: true
  });
});
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('✅ SW registrován', reg.scope))
      .catch(err => console.error('❌ Chyba registrace SW:', err));
  });
}
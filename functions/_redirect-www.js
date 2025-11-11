export default {
  async fetch(request) {
    const url = new URL(request.url);

    // ✅ Pokud není "www", přesměruj
    if (url.hostname === "borel.cz") {
      url.hostname = "www.borel.cz";
      return Response.redirect(url.toString(), 301);
    }

    // ✅ Jinak pokračuj normálně (už je www)
    return fetch(request);
  }
};

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // === Přesměrování z borel.cz → www.borel.cz ===
  if (url.hostname === "borel.cz") {
    url.hostname = "www.borel.cz";
    return Response.redirect(url.toString(), 301);
  }

  // === Volitelné přesměrování trailing .html ===
  if (url.pathname.endsWith(".html")) {
    url.pathname = url.pathname.replace(/\.html$/, "");
    return Response.redirect(url.toString(), 301);
  }

  // === Vše ostatní: načti standardní obsah ===
  return context.next();
}
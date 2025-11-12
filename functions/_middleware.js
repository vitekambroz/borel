export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Přesměrování z borel.cz → www.borel.cz (včetně podstránek a query parametrů)
  if (url.hostname === "borel.cz") {
    url.hostname = "www.borel.cz";
    return Response.redirect(url.toString(), 301);
  }

  // Pokračuj dál, pokud už je to www
  return context.next();
}
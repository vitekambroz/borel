export async function onRequest(context) {
  const url = new URL(context.request.url);

  // ✅ Přesměrování z borel.cz na www.borel.cz
  if (url.hostname === "borel.cz") {
    url.hostname = "www.borel.cz";
    return Response.redirect(url.toString(), 301);
  }

  // 🔁 Jinak pokračuj normálně
  return context.next();
}
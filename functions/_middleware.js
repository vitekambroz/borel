export async function onRequest(context) {
  const url = new URL(context.request.url);

  // === 1️⃣ Přesměrování z borel.cz → www.borel.cz ===
  if (url.hostname === "borel.cz") {
    url.hostname = "www.borel.cz";
    return Response.redirect(url.toString(), 301);
  }

  // === 2️⃣ Pokračování (už jsme na www.borel.cz) ===
  const response = await context.next();

  // === 3️⃣ Klonování hlaviček pro úpravy ===
  const newHeaders = new Headers(response.headers);

  // === 4️⃣ CACHE FIX PRO CLOUDFLARE ===
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("text/html")) {
    // HTML se NESMÍ cacheovat – jinak neuvidíš změny
    newHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
  }
  else if (url.pathname.endsWith(".css") || url.pathname.endsWith(".js")) {
    // CSS a JS – krátká cache (10 minut)
    newHeaders.set("Cache-Control", "public, max-age=600");
  }
  else if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|ico|svg)$/)) {
    // Obrázky – dlouhá cache, protože se skoro nikdy nemění
    newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
  }
  else {
    // Ostatní soubory – krátká cache
    newHeaders.set("Cache-Control", "public, max-age=300");
  }

  // === 5️⃣ Bezpečnostní hlavičky ===
  newHeaders.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  newHeaders.set("X-Content-Type-Options", "nosniff");
  newHeaders.set("X-Frame-Options", "DENY");
  newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");

  newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
  newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
  newHeaders.set("Cross-Origin-Resource-Policy", "same-origin");

  newHeaders.set(
    "Permissions-Policy",
    "geolocation=(), camera=(), microphone=()"
  );

  // === 6️⃣ Canonical URL ===
  if (url.hostname === "www.borel.cz") {
    const canonicalUrl = `${url.origin}${url.pathname}`;
    newHeaders.set("Link", `<${canonicalUrl}>; rel="canonical"`);
  }

  // === 7️⃣ Content Security Policy ===
  const cspDirectives = [
    "default-src 'self';",
    "script-src 'self' 'unsafe-inline';",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
    "font-src 'self' https://fonts.gstatic.com data:;",
    "img-src 'self' data: blob: https:;",
    "media-src 'self' data:;",
    "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;",
    "worker-src 'self';",
    "frame-ancestors 'none';",
    "object-src 'none';",
    "base-uri 'self';",
    "form-action 'self';"
  ];

  newHeaders.set("Content-Security-Policy", cspDirectives.join(" "));

  // === 8️⃣ Vrácení odpovědi ===
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
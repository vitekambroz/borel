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

  // === 4️⃣ Bezpečnostní hlavičky ===
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

  // Statické soubory mohou být kešované dlouho
  newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");

  // === 5️⃣ Canonical URL pro SEO ===
  if (url.hostname === "www.borel.cz") {
    const canonicalUrl = `${url.origin}${url.pathname}`;
    newHeaders.set("Link", `<${canonicalUrl}>; rel="canonical"`);
  }

  // === 6️⃣ Sjednocená a funkční Content-Security-Policy (CSP) ===

  // ⭐ TOTO je finální a funkční verze, která odpovídá tomu, co jsi chtěl.
  // Sladěné mezi HTML + middleware + galerií + minihrami + SW.
  const cspDirectives = [
    "default-src 'self';",
    "script-src 'self' 'unsafe-inline';",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
    "font-src 'self' https://fonts.gstatic.com data:;",
    "img-src 'self' data: blob: https:;",
    "media-src 'self' data:;",
    "connect-src 'self';",
    "worker-src 'self';",
    "frame-ancestors 'none';",
    "object-src 'none';",
    "base-uri 'self';",
    "form-action 'self';"
  ];

  newHeaders.set("Content-Security-Policy", cspDirectives.join(" "));

  // === 7️⃣ Vrácení odpovědi ===
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
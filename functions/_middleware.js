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

  // === 4️⃣ Zabezpečení přenosu a domény ===
  newHeaders.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  newHeaders.set("X-Content-Type-Options", "nosniff");
  newHeaders.set("X-Frame-Options", "DENY");
  newHeaders.set("X-XSS-Protection", "1; mode=block");
  newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
  newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
  newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
  newHeaders.set("Cross-Origin-Resource-Policy", "same-origin");
  newHeaders.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");

  // === 5️⃣ Canonical URL pro SEO ===
  if (url.hostname === "www.borel.cz") {
    const canonicalUrl = `${url.origin}${url.pathname}`;
    newHeaders.set("Link", `<${canonicalUrl}>; rel="canonical"`);
  }

  // === 6️⃣ Content Security Policy (CSP) ===
const cspDirectives = [
  "default-src 'self';",
  "script-src 'self';",
  "style-src 'self' https://fonts.googleapis.com 'unsafe-inline';",
  "font-src 'self' https://fonts.gstatic.com data:;",
  "img-src 'self' data: blob:;",
  "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;",
  "frame-ancestors 'none';",
  "object-src 'none';",
  "base-uri 'self';",
  "form-action 'self';"
];

  // 💡 Doplňkové povolení — aktivuj jen pokud je potřeba:
  // 🔹 YouTube videa
  // cspDirectives.push("frame-src https://www.youtube.com https://www.youtube-nocookie.com;");
  // 🔹 Mapy Google
  // cspDirectives.push("frame-src https://www.google.com/maps https://maps.googleapis.com;");
  // 🔹 Cloudflare Analytics
  // cspDirectives.push("script-src 'self' https://static.cloudflareinsights.com; connect-src https://cloudflareinsights.com;");

  newHeaders.set("Content-Security-Policy", cspDirectives.join(" "));

  // === 7️⃣ Vrácení odpovědi s novými hlavičkami ===
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
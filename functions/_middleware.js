export async function onRequest(context) {
  const url = new URL(context.request.url);

  // 1) Přesměrování borel.cz -> www.borel.cz
  if (url.hostname === "borel.cz") {
    url.hostname = "www.borel.cz";
    return Response.redirect(url.toString(), 301);
  }

  // 2) Pokračování
  const response = await context.next();

  // 3) Klon hlaviček
  const newHeaders = new Headers(response.headers);

  // 4) Cache
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("text/html")) {
    newHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
  } else if (url.pathname.endsWith(".css") || url.pathname.endsWith(".js")) {
    newHeaders.set("Cache-Control", "public, max-age=600");
  } else if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|ico|svg)$/)) {
    newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
  } else {
    newHeaders.set("Cache-Control", "public, max-age=300");
  }

  // 5) Bezpečnost
  newHeaders.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  newHeaders.set("X-Content-Type-Options", "nosniff");
  newHeaders.set("X-Frame-Options", "DENY");
  newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");

  newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
  // COEP: require-corp by blokovalo GA → raději vypnout
  newHeaders.set("Cross-Origin-Embedder-Policy", "unsafe-none");
  newHeaders.set("Cross-Origin-Resource-Policy", "same-origin");

  newHeaders.set(
    "Permissions-Policy",
    "geolocation=(), camera=(), microphone=()"
  );

  // 6) Canonical
  if (url.hostname === "www.borel.cz") {
    const canonicalUrl = `${url.origin}${url.pathname}`;
    newHeaders.set("Link", `<${canonicalUrl}>; rel="canonical"`);
  }

  // 7) CSP – bez inline skriptů, s GA
const cspDirectives = [
  "default-src 'self';",

  "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com;",

  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
  "font-src 'self' https://fonts.gstatic.com data:;",

  "img-src 'self' data: blob: https:;",

  "media-src 'self' data:;",

  "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://stats.g.doubleclick.net;",

  "frame-src 'self' https://www.googletagmanager.com;",

  "worker-src 'self';",

  "frame-ancestors 'none';",

  "object-src 'none';",

  "base-uri 'self';",

  "form-action 'self';"
];

  newHeaders.set("Content-Security-Policy", cspDirectives.join(" "));

  // 8) Výsledek
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
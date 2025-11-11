export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === "borel.cz") {
    url.hostname = "www.borel.cz";
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
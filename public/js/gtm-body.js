// gtm-body.js
(function (w, d, id) {
  function injectGtmNoscript() {
    var body = d.body || d.getElementsByTagName("body")[0];
    if (!body) return;

    var ns = d.createElement("noscript");
    var iframe = d.createElement("iframe");

    iframe.src = "https://www.googletagmanager.com/ns.html?id=" + id;
    iframe.height = "0";
    iframe.width = "0";
    iframe.style.display = "none";
    iframe.style.visibility = "hidden";

    ns.appendChild(iframe);

    if (body.firstChild) {
      body.insertBefore(ns, body.firstChild);
    } else {
      body.appendChild(ns);
    }
  }

  if (d.readyState === "loading") {
    d.addEventListener("DOMContentLoaded", injectGtmNoscript);
  } else {
    injectGtmNoscript();
  }
})(window, document, "GTM-TX5K26R2");
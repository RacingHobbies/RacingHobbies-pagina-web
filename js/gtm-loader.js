/* ========================================================================
   Racing Hobbies — cargador local de Google Tag Manager
   La configuración vive en el repositorio para poder auditarla y aplicarle SRI.
   ======================================================================== */

(function (window, document) {
  "use strict";

  const containerId = "GTM-PHWK4J3L";
  const measurementId = "G-15799391904";
  const layerName = "dataLayer";
  function loadGa4() {
    if (document.querySelector('script[data-rh-ga4="' + measurementId + '"]')) return;
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    const firstScript = document.getElementsByTagName("script")[0];
    const script = document.createElement("script");
    script.async = true;
    script.dataset.rhGa4 = measurementId;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
    firstScript.parentNode.insertBefore(script, firstScript);
  }

  function load() {
    if (!window.RH_CONSENT || window.RH_CONSENT.get() !== "granted") return;
    if (document.querySelector('script[data-rh-gtm="' + containerId + '"]')) return;
    loadGa4();
    const layer = window[layerName] = window[layerName] || [];
    layer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });

    const firstScript = document.getElementsByTagName("script")[0];
    const script = document.createElement("script");
    const layerQuery = layerName !== "dataLayer" ? "&l=" + layerName : "";
    script.async = true;
    script.dataset.rhGtm = containerId;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + containerId + layerQuery;
    firstScript.parentNode.insertBefore(script, firstScript);
  }

  window.addEventListener("rh:consent", function (event) {
    if (event.detail === "granted") load();
  });
  if (window.RH_CONSENT && window.RH_CONSENT.get() === "granted") load();
})(window, document);

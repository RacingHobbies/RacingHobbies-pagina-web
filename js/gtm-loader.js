/* ========================================================================
   Racing Hobbies — cargador local de la etiqueta de Google Analytics
   La configuración vive en el repositorio para poder auditarla y aplicarle SRI.
   Se conserva el nombre del archivo para no romper sus referencias públicas.
   ======================================================================== */

(function (window, document) {
  "use strict";

  // ID de medición verificado en la propiedad Racing Hobbies Ecuador.
  // 15799391904 es el ID numérico del flujo, no un ID de medición.
  const measurementId = "G-JB588FWM54";
  const disabledFlag = "ga-disable-" + measurementId;
  const productionHosts = new Set(["racinghobbies.net", "www.racinghobbies.net"]);

  function campaignSettings() {
    const params = new URLSearchParams(window.location.search);
    const fields = { source: "source", medium: "medium", campaign: "name", content: "content", term: "term" };
    const settings = {};
    Object.entries(fields).forEach(([utm, field]) => {
      const value = (params.get("utm_" + utm) || "").trim().slice(0, 120);
      if (value && !/@|\+?\d[\d\s().-]{6,}/.test(value)) settings["campaign_" + field] = value;
    });
    return settings;
  }

  function pageReferrer() {
    try {
      const url = new URL(document.referrer);
      return /^https?:$/.test(url.protocol) ? (url.origin + url.pathname).slice(0, 420) : "";
    } catch (error) {
      return "";
    }
  }

  function load() {
    if (!productionHosts.has(window.location.hostname)) return;
    if (!window.RH_CONSENT || window.RH_CONSENT.get() !== "granted") return;
    window[disabledFlag] = false;
    if (document.querySelector('script[data-rh-ga4="' + measurementId + '"]')) return;
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: window.location.origin + window.location.pathname,
      page_referrer: pageReferrer(),
      ...campaignSettings(),
    });
    const firstScript = document.getElementsByTagName("script")[0];
    const script = document.createElement("script");
    script.async = true;
    script.dataset.rhGa4 = measurementId;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
    firstScript.parentNode.insertBefore(script, firstScript);
  }

  // Una sola integración envía datos: no se carga además el contenedor GTM
  // que seguía publicando el ID numérico incorrecto y una segunda page_view.
  window[disabledFlag] = true;
  window.addEventListener("rh:consent", function (event) {
    window[disabledFlag] = event.detail !== "granted";
    if (event.detail === "granted") load();
  });
  if (window.RH_CONSENT && window.RH_CONSENT.get() === "granted") load();
})(window, document);

/* ========================================================================
   Racing Hobbies — consentimiento de medición
   El estado se establece antes de cargar GTM y nunca contiene datos personales.
   ======================================================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "rh-analytics-consent";
  const VALID_STATES = new Set(["granted", "rejected"]);

  window.dataLayer = Array.isArray(window.dataLayer) ? window.dataLayer : [];

  function readState() {
    try {
      const state = window.localStorage.getItem(STORAGE_KEY);
      return VALID_STATES.has(state) ? state : null;
    } catch (error) {
      return null;
    }
  }

  function gtag() {
    window.dataLayer.push(arguments);
  }

  function consentSettings(state) {
    return {
      analytics_storage: state === "granted" ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    };
  }

  function persist(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, state);
    } catch (error) {
      // El consentimiento sigue vigente durante esta visita si el navegador bloquea el almacenamiento.
    }
  }

  function removeBanner() {
    const banner = document.querySelector("[data-consent-banner]");
    if (banner) banner.remove();
  }

  function clearAnalyticsCookies() {
    const cookieNames = (document.cookie || "")
      .split(";")
      .map((cookie) => cookie.trim().split("=")[0])
      .filter((name) => /^_ga(?:_|$)/.test(name));
    const hostname = window.location && window.location.hostname;
    const domains = hostname ? ["", `; domain=${hostname}`, `; domain=.${hostname}`] : [""];
    cookieNames.forEach((name) => {
      domains.forEach((domain) => {
        document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
      });
    });
  }

  function setConsent(state) {
    if (!VALID_STATES.has(state)) return false;
    persist(state);
    if (state === "rejected") clearAnalyticsCookies();
    gtag("consent", "update", consentSettings(state));
    removeBanner();
    window.dispatchEvent(new window.CustomEvent("rh:consent", { detail: state }));
    return true;
  }

  function resetConsent() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // El estado temporal se reemplaza por denegación durante esta visita.
    }
    clearAnalyticsCookies();
    gtag("consent", "update", consentSettings("rejected"));
    removeBanner();
    renderBanner();
  }

  function renderBanner() {
    if (readState() || document.querySelector("[data-consent-banner]")) return;
    const banner = document.createElement("aside");
    banner.className = "consent-banner";
    banner.setAttribute("data-consent-banner", "");
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Preferencias de medición");
    banner.innerHTML = [
      '<div class="consent-banner-copy">',
      '<strong>Preferencias de medición</strong>',
      '<p>Podemos medir el uso del sitio para mejorar la experiencia. Tú decides.</p>',
      '</div>',
      '<div class="consent-banner-actions">',
      '<button class="btn btn-volt" type="button" data-consent-action="granted">Aceptar analítica</button>',
      '<button class="btn btn-line" type="button" data-consent-action="rejected">Rechazar</button>',
      '<a href="/privacidad">Privacidad</a>',
      '</div>',
    ].join("");
    banner.addEventListener("click", (event) => {
      const action = event.target.closest("[data-consent-action]");
      if (action) setConsent(action.dataset.consentAction);
    });
    document.body.append(banner);
  }

  const state = readState();
  if (state === "rejected") clearAnalyticsCookies();
  gtag("consent", "default", {
    ...consentSettings(state),
    wait_for_update: 500,
  });

  window.gtag = gtag;
  window.RH_CONSENT = { get: readState, set: setConsent };
  document.addEventListener("DOMContentLoaded", () => {
    renderBanner();
    document.addEventListener("click", (event) => {
      const reset = event.target.closest("[data-consent-reset]");
      if (reset) resetConsent();
    });
  }, { once: true });
})();

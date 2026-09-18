/* ========================================================================
   Racing Hobbies — capa de medición
   Data layer compatible con GA4/GTM, sin dependencias externas ni PII.
   El sitio no envía datos a terceros hasta que exista una propiedad autorizada.
   ======================================================================== */

(function () {
  "use strict";

  const MAX = 120;
  const EVENT_NAMES = new Set([
    "page_view",
    "view_item_list",
    "select_item",
    "view_item",
    "add_to_cart",
    "remove_from_cart",
    "view_cart",
    "begin_checkout",
    "search",
    "whatsapp_click",
    "phone_call_click",
    "contact_form_submit",
  ]);

  window.dataLayer = Array.isArray(window.dataLayer) ? window.dataLayer : [];
  let pageViewSent = false;

  function clean(value, limit) {
    const result = String(value == null ? "" : value).trim();
    return result ? result.slice(0, limit || MAX) : undefined;
  }

  function pageLocation() {
    return window.location.origin + window.location.pathname;
  }

  function cleanItem(product, quantity) {
    if (!product || !product.id || !product.name) return null;
    const price = Number(product.price);
    const item = {
      item_id: clean(product.id, 80),
      item_name: clean(product.name, MAX),
      item_category: clean(product.category || product.cat, 80),
      price: Number.isFinite(price) && price >= 0 ? price : undefined,
      quantity: Number.isInteger(quantity) && quantity > 0 ? quantity : 1,
      currency: "USD",
    };
    const brand = clean(product.brand, 80);
    if (brand) item.item_brand = brand;
    return Object.fromEntries(Object.entries(item).filter(([, value]) => value !== undefined));
  }

  function push(name, params) {
    if (!EVENT_NAMES.has(name)) return;
    const payload = {
      event: name,
      page_location: pageLocation(),
      ...params,
    };
    window.dataLayer.push(payload);
  }

  function itemsFrom(products) {
    return (Array.isArray(products) ? products : [])
      .map((product) => cleanItem(product, product.quantity))
      .filter(Boolean);
  }

  const api = {
    push,
    pageView() {
      if (pageViewSent) return;
      pageViewSent = true;
      push("page_view", { page_title: clean(document.title, 160) });
    },
    viewItemList(name, products) {
      push("view_item_list", {
        item_list_name: clean(name, MAX) || "Catálogo",
        items: itemsFrom(products),
      });
    },
    selectItem(product, listName) {
      const item = cleanItem(product);
      if (!item) return;
      push("select_item", {
        item_list_name: clean(listName, MAX) || "Catálogo",
        items: [item],
      });
    },
    viewItem(product) {
      const item = cleanItem(product);
      if (!item) return;
      push("view_item", { currency: "USD", value: item.price || 0, items: [item] });
    },
    addToCart(product, quantity) {
      const item = cleanItem(product, quantity);
      if (!item) return;
      push("add_to_cart", {
        currency: "USD",
        value: (item.price || 0) * item.quantity,
        items: [item],
      });
    },
    removeFromCart(product, quantity) {
      const item = cleanItem(product, quantity);
      if (!item) return;
      push("remove_from_cart", {
        currency: "USD",
        value: (item.price || 0) * item.quantity,
        items: [item],
      });
    },
    viewCart(products) {
      const items = itemsFrom(products);
      push("view_cart", {
        currency: "USD",
        value: items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
        items,
      });
    },
    beginCheckout(products) {
      const items = itemsFrom(products);
      push("begin_checkout", {
        currency: "USD",
        value: items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
        items,
      });
    },
    search(term, resultsCount) {
      const searchTerm = clean(term, 80);
      if (!searchTerm) return;
      push("search", {
        search_term: searchTerm,
        results_count: Number.isInteger(resultsCount) ? Math.max(0, resultsCount) : undefined,
      });
    },
    whatsappClick(location) {
      push("whatsapp_click", { method: "whatsapp", cta_location: clean(location, MAX) || "link" });
    },
    phoneClick(location) {
      push("phone_call_click", { method: "phone", cta_location: clean(location, MAX) || "link" });
    },
    contactFormSubmit(topic) {
      push("contact_form_submit", { form_topic: clean(topic, MAX) || "unknown" });
    },
  };

  window.RH_ANALYTICS = api;

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!target || typeof target.closest !== "function") return;
    const whatsapp = target.closest("[data-wa-link], a[href^=\"https://wa.me/\"]");
    if (whatsapp) {
      api.whatsappClick(whatsapp.id === "rh-checkout" ? "cart_checkout" : whatsapp.dataset.analyticsLocation);
    }
    const phone = target.closest("a[href^=\"tel:\"]");
    if (phone) api.phoneClick(phone.dataset.analyticsLocation);
  });

  document.addEventListener("DOMContentLoaded", () => api.pageView(), { once: true });
})();

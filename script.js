/* script.js — i18n engine + small helpers for SMSJob.ca */

(function () {
  // ---------- Utilities ----------
  function $(sel, root = document) { return root.querySelector(sel); }
  function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  // Year in footer
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Parse ?lang=xx
  function getLangFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang");
    return (lang === "en" || lang === "fr") ? lang : null;
  }

  // Persisted
  function getLangFromStorage() {
    const lang = localStorage.getItem("smsjob_lang");
    return (lang === "en" || lang === "fr") ? lang : null;
  }

  // Browser hint
  function getLangFromNavigator() {
    const n = navigator.language || (navigator.languages && navigator.languages[0]) || "en";
    return n.toLowerCase().startsWith("fr") ? "fr" : "en";
  }

  // Pick language with priority: query → storage → browser → 'en'
  function resolveInitialLang() {
    return getLangFromQuery() || getLangFromStorage() || getLangFromNavigator() || "en";
  }

  // Set <html lang="..">
  function setHtmlLang(lang) {
    document.documentElement.setAttribute("lang", lang);
  }

  // Translate text nodes with [data-i18n]
  function translateTextNodes(lang) {
    const dict = (window.translations && window.translations[lang]) || {};
    $all("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] != null) {
        el.textContent = dict[key];
      }
    });
  }

  // Translate placeholders/labels via [data-i18n-placeholder]
  function translatePlaceholders(lang) {
    const dict = (window.translations && window.translations[lang]) || {};
    $all("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (dict[key] != null) {
        el.setAttribute("placeholder", dict[key]);
      }
    });
  }

  // Keep ?lang=xx in URL without reloading
  function updateUrlParam(lang) {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", lang);
    window.history.replaceState({}, "", url);
  }

  // Main apply function
  function applyLanguage(lang) {
    // safety
    if (!["en", "fr"].includes(lang)) lang = "en";

    setHtmlLang(lang);
    translateTextNodes(lang);
    translatePlaceholders(lang);
    localStorage.setItem("smsjob_lang", lang);
    updateUrlParam(lang);

    // Sync dropdown
    const sel = $("#langSelect");
    if (sel && sel.value !== lang) sel.value = lang;
  }

  // Initialize on DOM ready
  document.addEventListener("DOMContentLoaded", function () {
    const initial = resolveInitialLang();
    applyLanguage(initial);

    // Bind dropdown
    const langSelect = $("#langSelect");
    if (langSelect) {
      langSelect.addEventListener("change", (e) => {
        applyLanguage(e.target.value);
      });
    }
  });
})();




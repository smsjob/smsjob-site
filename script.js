<script>
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const getLangFromQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("lang");
    return p === "fr" || p === "en" ? p : null;
  };

  const getInitialLang = () => {
    // Priority: ?lang= → localStorage → browser language → 'en'
    const fromQuery = getLangFromQuery();
    if (fromQuery) return fromQuery;

    const stored = localStorage.getItem("lang");
    if (stored) return stored;

    const nav = (navigator.language || "en").toLowerCase();
    return nav.startsWith("fr") ? "fr" : "en";
  };

  const setHtmlLang = (lang) => {
    document.documentElement.setAttribute("lang", lang);
  };

  const setTitleIfKeyed = (lang) => {
    // If <title> has data-i18n, update it too
    const titleEl = $$("title[data-i18n]");
    titleEl.forEach(el => {
      const key = el.getAttribute("data-i18n");
      const val = window.translations?.[lang]?.[key];
      if (val) el.textContent = val;
    });
  };

  const applyTranslations = (lang) => {
    const dict = window.translations?.[lang] || {};
    // textContent
    $$("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const val = dict[key];
      if (typeof val === "string") {
        el.textContent = val;
      }
    });

    // placeholders
    $$("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      const val = dict[key];
      if (typeof val === "string") {
        el.setAttribute("placeholder", val);
      }
    });

    // inputs with data-i18n-value (e.g., hidden subject)
    $$("[data-i18n-value]").forEach(el => {
      const key = el.getAttribute("data-i18n-value");
      const val = dict[key];
      if (typeof val === "string") {
        el.value = val;
      }
    });

    // Update title if needed
    setTitleIfKeyed(lang);
  };

  const setSelectTo = (lang) => {
    const sel = $("#langSelect");
    if (sel) sel.value = lang;
  };

  const updateUrlParam = (lang) => {
    // Keep current path, only set ?lang=
    const url = new URL(window.location.href);
    url.searchParams.set("lang", lang);
    window.history.replaceState({}, "", url.toString());
  };

  const initYear = () => {
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  };

  document.addEventListener("DOMContentLoaded", () => {
    initYear();

    const lang = getInitialLang();
    localStorage.setItem("lang", lang);
    setHtmlLang(lang);
    setSelectTo(lang);
    applyTranslations(lang);
    updateUrlParam(lang);

    const langSel = $("#langSelect");
    if (langSel) {
      langSel.addEventListener("change", (e) => {
        const newLang = e.target.value === "fr" ? "fr" : "en";
        localStorage.setItem("lang", newLang);
        setHtmlLang(newLang);
        applyTranslations(newLang);
        updateUrlParam(newLang);
      });
    }
  });
})();
</script>



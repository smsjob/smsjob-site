// script.js (robust i18n + form)
(function () {
  const LS_KEY = "lang";

  function getLang(){
    const url = new URL(window.location.href);
    const byQuery = (url.searchParams.get("lang") || "").toLowerCase();
    const byHash  = (url.hash || "").toLowerCase();
    const picked =
      (byQuery === "fr" || byQuery === "en") ? byQuery :
      (byHash === "#fr" ? "fr" : byHash === "#en" ? "en" : null);
    if (picked) { localStorage.setItem(LS_KEY, picked); return picked; }
    return localStorage.getItem(LS_KEY) || "en";
  }

  function dictFor(lang){
    const dict = window.I18N || {};          // never touch I18N directly
    return dict[lang] || dict.en || {};      // safe fallback
  }

  function applyI18n(lang){
    const t = dictFor(lang);

    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const k = el.getAttribute("data-i18n");
      if (k in t) el.textContent = t[k];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
      const k = el.getAttribute("data-i18n-placeholder");
      if (k in t) el.setAttribute("placeholder", t[k]);
    });

    document.documentElement.setAttribute("lang", lang);
    const sel = document.getElementById("langSelect");
    if (sel) sel.value = lang;
  }

  function syncLangInLinks(lang){
    document.querySelectorAll('a[href]').forEach(a=>{
      const href = a.getAttribute('href'); if(!href) return;
      if (/^(https?:)?\/\//i.test(href) || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      const u = new URL(href, window.location.href);
      u.searchParams.set('lang', lang);
      a.setAttribute('href', u.pathname + u.search + u.hash);
    });
  }

  function markActiveNav(){
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-nav a').forEach(a=>{
      const href = a.getAttribute('href') || '';
      if (href.indexOf(path) > -1) a.classList.add('active');
    });
  }

  // Optional: show which keys are missing in the console
  function auditI18n(lang){
    const t = dictFor(lang);
    const missing = new Set();
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const k = el.getAttribute('data-i18n');
      if (!(k in t)) missing.add(k);
    });
    if (missing.size) console.warn('Missing i18n keys for', lang, Array.from(missing));
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    // Year
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();

    // Init i18n
    const lang = getLang();
    applyI18n(lang);
    syncLangInLinks(lang);
    markActiveNav();
    auditI18n(lang);

    // Switcher
    const sel = document.getElementById("langSelect");
    if (sel) {
      sel.addEventListener("change", e=>{
        const v = e.target.value;
        localStorage.setItem(LS_KEY, v);
        applyI18n(v);
        syncLangInLinks(v);
        const url = new URL(window.location.href);
        url.searchParams.set("lang", v);
        history.replaceState({}, "", url.toString());
        auditI18n(v);
      });
    }

    // Formspree AJAX (if present)
    const form = document.getElementById("contactForm");
    const status = document.getElementById("formStatus");
    if (form) {
      const endpoint = form.getAttribute("action");
      form.addEventListener("submit", async (e)=>{
        e.preventDefault();
        const t = dictFor(getLang());
        const btn = form.querySelector('button[type="submit"]');
        const old = btn.textContent;

        btn.disabled = true; btn.textContent = t.form_sending || "Sending…";
        if (status) { status.textContent = t.form_sending || "Sending…"; status.className = "status"; }

        try{
          const res = await fetch(endpoint, { method:"POST", headers:{ "Accept":"application/json" }, body:new FormData(form) });
          if (res.ok){
            if (status){ status.textContent = t.form_success || "Thanks! Your message has been sent."; status.className = "status ok"; }
            form.reset();
          } else {
            if (status){ status.textContent = t.form_error || "Sorry, something went wrong."; status.className = "status err"; }
          }
        } catch {
          if (status){ status.textContent = t.form_error || "Sorry, something went wrong."; status.className = "status err"; }
        } finally {
          btn.disabled = false; btn.textContent = old;
        }
      });
    }
  });
})();



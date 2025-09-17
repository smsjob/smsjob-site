// script.js
(function () {
  const LS_KEY = "lang";

  function getLang() {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("lang");
    if (q) { localStorage.setItem(LS_KEY, q); return q; }
    return localStorage.getItem(LS_KEY) || "en";
  }

  function applyI18n(lang) {
    const t = (window.I18N && I18N[lang]) ? I18N[lang] : I18N.en;

    // swap text
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const k = el.getAttribute("data-i18n");
      if (t[k]) el.textContent = t[k];
    });

    // swap placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const k = el.getAttribute("data-i18n-placeholder");
      if (t[k]) el.setAttribute("placeholder", t[k]);
    });

    document.documentElement.setAttribute("lang", lang);
    const sel = document.getElementById("langSelect");
    if (sel) sel.value = lang;
  }

  // keep ?lang on internal links so nav stays in the same language
  function syncLangInLinks(lang){
    document.querySelectorAll('a[href]').forEach(a=>{
      const href = a.getAttribute('href'); if(!href) return;
      if (/^(https?:)?\/\//i.test(href) || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      const u = new URL(href, window.location.href);
      u.searchParams.set('lang', lang);
      a.setAttribute('href', u.pathname + u.search + u.hash);
    });
  }

  function markActiveNav() {
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".main-nav a").forEach(a => {
      const href = a.getAttribute("href") || "";
      if (href.indexOf(path) > -1) a.classList.add("active");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();

    const lang = getLang();
    applyI18n(lang);
    syncLangInLinks(lang);
    markActiveNav();

    const sel = document.getElementById("langSelect");
    if (sel) {
      sel.addEventListener("change", e => {
        const v = e.target.value;
        localStorage.setItem(LS_KEY, v);
        applyI18n(v);
        syncLangInLinks(v);
        const url = new URL(window.location.href);
        url.searchParams.set("lang", v);
        history.replaceState({}, "", url.toString());
      });
    }

    // Formspree AJAX (only on contact page)
    const form = document.getElementById("contactForm");
    const status = document.getElementById("formStatus");
    if (form) {
      const endpoint = form.getAttribute("action");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const t = (window.I18N && I18N[getLang()]) ? I18N[getLang()] : I18N.en;
        const btn = form.querySelector('button[type="submit"]');
        const old = btn.textContent;

        btn.disabled = true; btn.textContent = t.form_sending || "Sending…";
        if (status) { status.textContent = t.form_sending || "Sending…"; status.className = "status"; }

        try {
          const res = await fetch(endpoint, { method:"POST", headers:{ "Accept":"application/json" }, body:new FormData(form) });
          if (res.ok) {
            if (status) { status.textContent = t.form_success || "Thanks! Your message has been sent."; status.className = "status ok"; }
            form.reset();
          } else {
            if (status) { status.textContent = t.form_error || "Sorry, something went wrong."; status.className = "status err"; }
          }
        } catch (err) {
          if (status) { status.textContent = t.form_error || "Sorry, something went wrong."; status.className = "status err"; }
        } finally {
          btn.disabled = false; btn.textContent = old;
        }
      });
    }
  });
})();


// ---- i18n helpers ----
function getLang(){
  const url = new URL(window.location.href);
  const q = url.searchParams.get('lang');
  if(q){ localStorage.setItem('lang', q); return q; }
  return localStorage.getItem('lang') || 'en';
}

function applyI18n(lang){
  const dict = I18N[lang] || I18N.en;

  // text nodes
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k = el.getAttribute('data-i18n');
    if(dict[k]) el.textContent = dict[k];
  });

  // placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    const k = el.getAttribute('data-i18n-placeholder');
    if(dict[k]) el.setAttribute('placeholder', dict[k]);
  });

  document.documentElement.setAttribute('lang', lang);
  const sel = document.getElementById('langSelect');
  if(sel) sel.value = lang;
}

function syncLangInLinks(lang){
  // Add ?lang=xx to all relative (internal) links
  document.querySelectorAll('a[href]').forEach(a=>{
    const href = a.getAttribute('href');
    if(!href) return;
    // skip external, anchors, mailto, tel
    if (/^(https?:)?\/\//i.test(href) || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    const url = new URL(href, window.location.href);
    url.searchParams.set('lang', lang);
    // keep it relative
    a.setAttribute('href', url.pathname + url.search + url.hash);
  });
}

function markActiveNav(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(a=>{
    if(a.getAttribute('href').startsWith(path)){ a.classList.add('active'); }
  });
}

function initLang(){
  const lang = getLang();
  applyI18n(lang);
  syncLangInLinks(lang);

  const sel = document.getElementById('langSelect');
  if(sel){
    sel.addEventListener('change', (e)=>{
      const value = e.target.value;
      localStorage.setItem('lang', value);
      applyI18n(value);
      syncLangInLinks(value);
      // reflect in current URL so refresh/share keeps the language
      const url = new URL(window.location.href);
      url.searchParams.set('lang', value);
      history.replaceState({}, '', url.toString());
    });
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  const y = document.getElementById('year');
  if(y) y.textContent = new Date().getFullYear();

  initLang();
  markActiveNav();

  // ----- Formspree AJAX submit -----
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if(form){
    const endpoint = form.getAttribute('action');
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const lang = getLang(), t = I18N[lang] || I18N.en;

      const btn = form.querySelector('button[type="submit"]');
      const old = btn.textContent;
      btn.disabled = true; btn.textContent = t.form_sending || 'Sending…';
      if(status){ status.textContent = t.form_sending || 'Sending…'; status.className = 'status'; }

      try{
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });
        if(res.ok){
          if(status){ status.textContent = t.form_success || 'Thanks! Your message has been sent.'; status.className = 'status ok'; }
          form.reset();
        } else {
          if(status){ status.textContent = t.form_error || 'Sorry, something went wrong.'; status.className = 'status err'; }
        }
      } catch(err){
        if(status){ status.textContent = t.form_error || 'Sorry, something went wrong.'; status.className = 'status err'; }
      } finally {
        btn.disabled = false; btn.textContent = old;
      }
    });
  }
});

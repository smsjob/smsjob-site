// i18n helpers
function getLang(){
  const url = new URL(window.location.href);
  const q = url.searchParams.get('lang');
  if(q){ localStorage.setItem('lang', q); return q; }
  return localStorage.getItem('lang') || 'en';
}

function applyI18n(lang){
  const dict = I18N[lang] || I18N.en;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k = el.getAttribute('data-i18n');
    if(dict[k]) el.textContent = dict[k];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    const k = el.getAttribute('data-i18n-placeholder');
    if(dict[k]) el.setAttribute('placeholder', dict[k]);
  });
  document.documentElement.setAttribute('lang', lang);
  const sel = document.getElementById('langSelect'); if(sel) sel.value = lang;
}

function initLang(){
  const lang = getLang();
  applyI18n(lang);
  const sel = document.getElementById('langSelect');
  if(sel){
    sel.addEventListener('change', (e)=>{
      const v = e.target.value;
      localStorage.setItem('lang', v);
      applyI18n(v);
      const url = new URL(window.location.href);
      url.searchParams.set('lang', v);
      history.replaceState({}, '', url.toString());
    });
  }
}

function markActiveNav(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(a=>{
    if(a.getAttribute('href') === path){ a.classList.add('active'); }
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  const y = document.getElementById('year');
  if(y) y.textContent = new Date().getFullYear();

  initLang();
  markActiveNav();

  // Formspree AJAX submit
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if(form){
    const endpoint = form.getAttribute('action');
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const lang = getLang(), t = I18N[lang] || I18N.en;
      const btn = form.querySelector('button[type="submit"]');
      const old = btn.textContent;

      btn.disabled = true; btn.textContent = t.form_sending;
      if(status){ status.textContent = t.form_sending; status.className = 'status'; }

      try{
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });
        if(res.ok){
          if(status){ status.textContent = t.form_success; status.className = 'status ok'; }
          form.reset();
        }else{
          if(status){ status.textContent = t.form_error; status.className = 'status err'; }
        }
      }catch(err){
        if(status){ status.textContent = t.form_error; status.className = 'status err'; }
      }finally{
        btn.disabled = false; btn.textContent = old;
      }
    });
  }
});

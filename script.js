// Detect saved language or default to EN
function getLang(){
  const url = new URL(window.location.href);
  const q = url.searchParams.get('lang');
  if(q){ localStorage.setItem('lang', q); return q; }
  return localStorage.getItem('lang') || 'en';
}

function applyI18n(lang){
  const dict = I18N[lang] || I18N.en;

  // Elements with data-i18n -> textContent
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(dict[key]) el.textContent = dict[key];
  });
  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    const key = el.getAttribute('data-i18n-placeholder');
    if(dict[key]) el.setAttribute('placeholder', dict[key]);
  });

  // Update <html lang="">
  document.documentElement.setAttribute('lang', lang);
  // Set switcher value
  const sel = document.getElementById('langSelect');
  if(sel) sel.value = lang;
}

function initLang(){
  const lang = getLang();
  applyI18n(lang);
  const sel = document.getElementById('langSelect');
  if(sel){
    sel.addEventListener('change', (e)=>{
      const value = e.target.value;
      localStorage.setItem('lang', value);
      applyI18n(value);
      // Keep ?lang in URL for shareability
      const url = new URL(window.location.href);
      url.searchParams.set('lang', value);
      history.replaceState({}, '', url.toString());
    });
  }
}

function markActiveNav(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(a=>{
    const href = a.getAttribute('href');
    if(href === path){ a.classList.add('active'); }
  });
}

// Footer year
document.addEventListener('DOMContentLoaded', ()=>{
  const y = document.getElementById('year');
  if(y) y.textContent = new Date().getFullYear();
  initLang();
  markActiveNav();

  // Demo: prevent form submit on #
  const form = document.getElementById('contactForm');
  if(form && form.getAttribute('action') === '#'){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      alert('Form demo only. Connect Formspree to receive submissions.');
    });
  }
});

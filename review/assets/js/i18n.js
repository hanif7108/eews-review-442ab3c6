/* ================================================================
   EEWS Review Site — Language Toggle (EN / ID)
   ----------------------------------------------------------------
   Fitur:
   - Klik tombol EN / ID di pojok kanan atas untuk ganti bahasa
   - Preferensi tersimpan di localStorage → konsisten saat pindah halaman
   - Juga mendukung URL param (?lang=id) untuk share link bilingual
   - Auto-deteksi bahasa browser saat pertama kali visit (ID browser → ID default)
   - Mencegah "flash" konten salah-bahasa saat loading (FOUC)
   ================================================================ */
(function(){
  var STORAGE_KEY = 'eews_review_lang';

  // --- FOUC prevention: set body class ASAP, before paint ---
  function earlyApply(){
    var lang = resolveLang();
    if(document.body){
      document.body.classList.remove('lang-en','lang-id');
      document.body.classList.add('lang-'+lang);
    }
    document.documentElement.lang = lang;
    document.documentElement.classList.remove('lang-en','lang-id');
    document.documentElement.classList.add('lang-'+lang);
  }

  function resolveLang(){
    // Priority: URL param → localStorage → browser lang → default 'en'
    try{
      var urlLang = new URLSearchParams(window.location.search).get('lang');
      if(urlLang === 'en' || urlLang === 'id') return urlLang;
    }catch(e){}
    try{
      var stored = localStorage.getItem(STORAGE_KEY);
      if(stored === 'en' || stored === 'id') return stored;
    }catch(e){}
    if(navigator.language && navigator.language.toLowerCase().startsWith('id')) return 'id';
    return 'en';
  }

  function persist(lang){
    try{ localStorage.setItem(STORAGE_KEY, lang); }catch(e){}
    try{
      var u = new URL(window.location.href);
      u.searchParams.set('lang', lang);
      window.history.replaceState({}, '', u.toString());
    }catch(e){}
  }

  function setLang(lang, userInitiated){
    if(lang !== 'en' && lang !== 'id') lang = 'en';

    // Apply class to both <html> and <body> for FOUC-safe CSS
    document.documentElement.classList.remove('lang-en','lang-id');
    document.documentElement.classList.add('lang-'+lang);
    document.documentElement.lang = lang;

    if(document.body){
      document.body.classList.remove('lang-en','lang-id');
      document.body.classList.add('lang-'+lang);
    }

    // Highlight active toggle button
    document.querySelectorAll('.lang-toggle button').forEach(function(b){
      var isActive = b.getAttribute('data-lang') === lang;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Update all nav links to preserve ?lang= param when navigating
    document.querySelectorAll('a[href]').forEach(function(a){
      var href = a.getAttribute('href');
      if(!href) return;
      // Skip external / anchor / mailto / tel links
      if(href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
      // Skip download links (keep raw URL)
      if(a.hasAttribute('download')) return;
      // Split existing querystring and hash
      var hashIdx = href.indexOf('#');
      var hash = hashIdx >= 0 ? href.substring(hashIdx) : '';
      var base = hashIdx >= 0 ? href.substring(0, hashIdx) : href;
      var qIdx = base.indexOf('?');
      var pathOnly = qIdx >= 0 ? base.substring(0, qIdx) : base;
      var query = qIdx >= 0 ? base.substring(qIdx+1) : '';
      // Rebuild query: preserve existing params, set/update lang
      var params = new URLSearchParams(query);
      params.set('lang', lang);
      a.setAttribute('href', pathOnly + '?' + params.toString() + hash);
    });

    // Persist preference
    persist(lang);

    // Visual "flash" feedback on user-initiated click
    if(userInitiated){
      var btn = document.querySelector('.lang-toggle button[data-lang="'+lang+'"]');
      if(btn){
        btn.classList.add('flash');
        setTimeout(function(){ btn.classList.remove('flash'); }, 280);
      }
    }

    // Fire custom event for any listeners
    try{
      window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
    }catch(e){}
  }

  function init(){
    earlyApply();
    var currentLang = resolveLang();

    // Attach click handlers
    document.querySelectorAll('.lang-toggle button').forEach(function(b){
      b.addEventListener('click', function(ev){
        ev.preventDefault();
        var target = b.getAttribute('data-lang');
        if(target === currentLang) return;  // already active
        currentLang = target;
        setLang(target, true);
      });
      // Keyboard accessibility
      b.setAttribute('role', 'button');
      b.setAttribute('tabindex', '0');
      b.addEventListener('keydown', function(ev){
        if(ev.key === 'Enter' || ev.key === ' '){
          ev.preventDefault();
          b.click();
        }
      });
    });

    // Apply resolved language (this also updates nav links)
    setLang(currentLang, false);
  }

  // Run before paint to prevent FOUC
  earlyApply();

  // Full init after DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose public API
  window.__eewsSetLang = setLang;
  window.__eewsGetLang = resolveLang;
})();

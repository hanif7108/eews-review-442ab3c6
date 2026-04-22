// Simple bilingual toggle — no external deps
(function(){
  function getParam(k){
    const m = new URLSearchParams(window.location.search).get(k);
    return m;
  }
  function setLang(lang){
    if(lang !== 'en' && lang !== 'id') lang = 'en';
    document.body.classList.remove('lang-en','lang-id');
    document.body.classList.add('lang-'+lang);
    // persist via URL hash so it's shareable without storage
    try{
      const u = new URL(window.location.href);
      u.searchParams.set('lang', lang);
      window.history.replaceState({}, '', u.toString());
    }catch(e){}
    document.querySelectorAll('.lang-toggle button').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-lang')===lang);
    });
    document.documentElement.lang = lang;
  }
  function init(){
    let lang = getParam('lang') || (navigator.language && navigator.language.toLowerCase().startsWith('id') ? 'id' : 'en');
    document.querySelectorAll('.lang-toggle button').forEach(function(b){
      b.addEventListener('click', function(){ setLang(b.getAttribute('data-lang')); });
    });
    setLang(lang);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.__setLang = setLang;
})();

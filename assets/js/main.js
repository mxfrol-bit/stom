// Mobile menu
(function(){
  var b=document.querySelector('.nav-burger'),n=document.querySelector('.nav');
  if(!b||!n)return;
  function set(o){b.setAttribute('aria-expanded',o?'true':'false');n.classList.toggle('open',o);document.body.classList.toggle('nav-open',o);}
  b.addEventListener('click',function(){set(b.getAttribute('aria-expanded')!=='true');});
  n.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){set(false);});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false);});
})();
// Form -> mailto fallback (owner replaces with real endpoint)
document.querySelectorAll('form[data-cta]').forEach(function(f){
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var n=(f.querySelector('[name=name]')||{}).value||'';
    var p=(f.querySelector('[name=phone]')||{}).value||'';
    var t=(f.querySelector('[name=time]')||{}).value||'';
    var s=f.getAttribute('data-subject')||'Заявка с сайта';
    location.href='mailto:info@bor-dent.ru?subject='+encodeURIComponent(s)+'&body='+encodeURIComponent('Имя: '+n+'\nТелефон: '+p+'\nУдобное время: '+t);
  });
});

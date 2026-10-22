/* Blue Particle Studios: shared page behaviour. No dependencies. */
(function(){
"use strict";
var $ = function(s,r){return (r||document).querySelector(s)}, $$ = function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
var C = window.BPS || {};
function play(v){ if(!v || reduced) return; if(!v.src && v.dataset.src) v.src = v.dataset.src; var p = v.play(); if(p && p.catch) p.catch(function(){}); }

$$(".yr").forEach(function(el){ el.textContent = new Date().getFullYear(); });

/* menu drawer (small screens) */
var drawer = $("#drawer");
if(drawer){
  $("#menuBtn").addEventListener("click", function(){ drawer.showModal(); });
  drawer.addEventListener("click", function(e){ if(e.target.closest("nav a") || e.target === drawer) drawer.close(); });
}

/* reveal on scroll */
var rv = $$(".rv");
if("IntersectionObserver" in window && !reduced){
  var io = new IntersectionObserver(function(es){ es.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add("in"); io.unobserve(x.target); } }); }, {rootMargin:"0px 0px -8% 0px"});
  rv.forEach(function(el){ io.observe(el); });
} else rv.forEach(function(el){ el.classList.add("in"); });

/* videos marked data-auto play while on screen; film tiles also preview on hover */
var autos = $$("video[data-auto]");
if("IntersectionObserver" in window){
  var vio = new IntersectionObserver(function(es){ es.forEach(function(x){ x.isIntersecting ? play(x.target) : x.target.pause(); }); }, {threshold:.35});
  autos.forEach(function(v){ vio.observe(v); });
}
$$(".film video:not([data-auto])").forEach(function(v){
  var b = v.closest(".film");
  b.addEventListener("mouseenter", function(){ play(v); });
  b.addEventListener("mouseleave", function(){ v.pause(); });
  b.addEventListener("focus", function(){ play(v); });
  b.addEventListener("blur", function(){ v.pause(); });
});
if(!matchMedia("(hover:hover)").matches && "IntersectionObserver" in window){
  var tio = new IntersectionObserver(function(es){ es.forEach(function(x){ x.isIntersecting ? play(x.target) : x.target.pause(); }); }, {threshold:.6});
  $$(".film video:not([data-auto])").forEach(function(v){ tio.observe(v); });
}

/* full-cut player */
var player = $("#player"), pv = $("#playerVideo");
if(player){
  $$(".film[data-video]").forEach(function(f){
    f.addEventListener("click", function(){
      pv.src = f.dataset.video;
      $("#playerTitle").textContent = f.dataset.title || "";
      player.showModal();
      var p = pv.play(); if(p && p.catch) p.catch(function(){});
    });
  });
  player.addEventListener("close", function(){ pv.pause(); pv.removeAttribute("src"); pv.load(); });
  player.addEventListener("click", function(e){ if(e.target === player || e.target.closest("[data-close]")) player.close(); });
}

/* use cases: opening an item swaps the picture */
var uses = $(".uses");
if(uses){
  var vids = $$(".pic video", uses);
  $$(".acc", uses).forEach(function(d){
    d.addEventListener("toggle", function(){
      if(!d.open) return;
      $$(".acc", uses).forEach(function(o){ if(o !== d) o.open = false; });
      vids.forEach(function(v){ var on = v.dataset.k === d.dataset.k; v.classList.toggle("on", on); on ? play(v) : v.pause(); });
    });
  });
}

/* pinned storyboard: scroll progress 0..1 drives the steps */
var pin = $(".pin");
if(pin){
  var s1 = $(".say1", pin), s2 = $(".say2", pin), board = $(".board", pin);
  var frames = $$(".frames figure", pin), notes = $$(".note", pin);
  var step = function(p){
    var a = p < .14, b = p >= .14 && p < .28;
    s1.style.opacity = a ? 1 : 0; s1.style.transform = a ? "none" : "translateY(-24px)";
    s2.style.opacity = b ? 1 : 0; s2.style.transform = b ? "none" : (p < .14 ? "translateY(24px)" : "translateY(-24px)");
    board.style.opacity = p >= .28 ? 1 : 0;
    var q = Math.max(0, (p - .3) / .6);
    frames.forEach(function(f, i){ f.classList.toggle("on", q > i / frames.length * .7); f.classList.toggle("live", q > .78); });
    notes.forEach(function(n, i){ n.classList.toggle("on", q > .3 + i * .22); });
  };
  if(reduced){ step(1); }
  else {
    var tick = function(){
      var r = pin.getBoundingClientRect(), span = pin.offsetHeight - innerHeight;
      step(Math.min(1, Math.max(0, -r.top / (span || 1))));
    };
    addEventListener("scroll", tick, {passive:true}); addEventListener("resize", tick); tick();
  }
}

/* enquiry form: opens email or WhatsApp with the message ready */
var form = $("#form"), msg = $("#formMsg");
if(form){
  form.addEventListener("submit", function(e){
    e.preventDefault();
    var bad = [];
    ["name","contact","what"].forEach(function(n){ var f = form.elements[n], ok = f.value.trim().length > 1; f.setAttribute("aria-invalid", !ok); if(!ok) bad.push(f); });
    msg.className = "msg";
    if(bad.length){ msg.classList.add("err"); msg.textContent = "Please add your name, how to reach you, and a line about your project."; bad[0].focus(); return; }
    var via = (e.submitter && e.submitter.value) || "email";
    var el = form.elements, pkg = el.pkg.options[el.pkg.selectedIndex].text;
    var text = (C.intro || "Hi Blue Particle Studios, I'd like a launch film.") +
      "\n\nName: " + el.name.value + "\nContact: " + el.contact.value +
      (el.company && el.company.value ? "\nCompany / link: " + el.company.value : "") +
      "\nPackage: " + pkg + "\n" + (C.whenLabel || "Launch date") + ": " + (el.when.value || "flexible") +
      "\n\n" + (C.whatLabel || "What we're launching") + ":\n" + el.what.value;
    if(via === "wa"){
      window.open("https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      msg.classList.add("ok"); msg.textContent = "Opening WhatsApp with your message ready. Just press send.";
    } else {
      location.href = "mailto:" + C.email + "?subject=" + encodeURIComponent((C.subject || "Launch film") + ": " + el.name.value) + "&body=" + encodeURIComponent(text);
      msg.classList.add("ok"); msg.textContent = "Opening your email app. If nothing opens, write to " + C.email + ".";
    }
  });
  /* any [data-pick] link preselects that package */
  document.addEventListener("click", function(e){ var a = e.target.closest("[data-pick]"); if(a) form.elements.pkg.value = a.dataset.pick; });
}
})();

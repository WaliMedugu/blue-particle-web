/* Blue Particle Studios: motion layer. Intro loader, cursor, crosshair, hotspots, text reveals,
   line draws, slider, accordion and smooth scroll. Loads after bps.js. No dependencies except
   optional Lenis for smooth scrolling. */
(function(){
"use strict";
var $ = function(s,r){return (r||document).querySelector(s)}, $$ = function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
var fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
var body = document.body;
var clamp = function(v,a,b){ return Math.max(a, Math.min(b, v)); };
var ease = function(t){ return 1 - Math.pow(1 - t, 3); };
var easeIO = function(t){ return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2; };

/* ---------- page frame lines ---------- */
["frame-l","frame-r"].forEach(function(c){ var d = document.createElement("i"); d.className = c; d.setAttribute("aria-hidden","true"); body.appendChild(d); });

/* ---------- smooth scroll ---------- */
var lenis = null;
if(window.Lenis && !reduced){
  lenis = new Lenis({ lerp: .1, smoothWheel: true });
  (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  document.documentElement.style.scrollBehavior = "auto";
  document.addEventListener("click", function(e){
    var a = e.target.closest('a[href^="#"]'); if(!a) return;
    var id = a.getAttribute("href"); if(id.length < 2) return;
    var t = document.querySelector(id); if(!t) return;
    e.preventDefault(); lenis.scrollTo(t, { offset: -44, duration: 1.2 });
    history.replaceState(null, "", id);
  });
}

/* ---------- rolling labels ---------- */
function roll(el){
  var t = el.textContent; if(!t.trim() || el.querySelector(".roll")) return;
  el.innerHTML = '<span class="roll"><span>'+t+'</span><span aria-hidden="true">'+t+'</span></span>';
}
$$(".btn>span, .nav a, .btn>i, .hero-bar .go span:first-child, .alt-link span:last-child").forEach(roll);

/* ---------- cursor ---------- */
var cur = $(".cursor");
if(!cur){ cur = document.createElement("div"); cur.className = "cursor"; cur.setAttribute("aria-hidden","true"); cur.innerHTML = '<i></i><span class="mono"></span>'; body.appendChild(cur); }
var lab = $("span", cur), mx = -100, my = -100, cx = -100, cy = -100;
if(fine){
  addEventListener("pointermove", function(e){ mx = e.clientX; my = e.clientY; }, {passive:true});
  (function loop(){
    cx += (mx - cx) * .22; cy += (my - cy) * .22;
    cur.style.transform = "translate(" + cx + "px," + cy + "px)";
    requestAnimationFrame(loop);
  })();
  document.addEventListener("pointerover", function(e){
    var t = e.target;
    var label = t.closest("[data-cursor-label]") || t.closest(".film[data-video],.spot");
    var link = t.closest("a,button,summary,label,select,input,textarea");
    cur.classList.remove("is-link","is-label","is-hidden");
    if(label){ lab.textContent = label.dataset.cursorLabel || "Play"; cur.classList.add("is-label"); }
    else if(t.closest(".loader")) cur.classList.add("is-hidden");
    else if(link) cur.classList.add("is-link");
  });
  document.addEventListener("pointerleave", function(){ cur.classList.add("is-hidden"); });
}

/* ---------- hero: crosshair + coordinates, hotspots, note ---------- */
var stage = $("#stage");
if(stage){
  var hx = $(".hx", stage), hy = $(".hy", stage), hp = $(".xhair p", stage), bx = $("[data-hx]", stage), by = $("[data-hy]", stage);
  stage.addEventListener("pointermove", function(e){
    var r = stage.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    hx.style.transform = "translateY(" + y + "px)"; hy.style.transform = "translateX(" + x + "px)";
    hp.style.transform = "translate(" + (x + 12) + "px," + (y - 22) + "px)";
    bx.textContent = Math.round(x / r.width * 1920); by.textContent = Math.round(y / r.height * 1080);
  });
  var spots = $$(".spot", stage);
  spots.forEach(function(s){
    s.addEventListener("mouseenter", function(){
      spots.forEach(function(o){ if(o !== s) o.classList.remove("open"); });
      var v = $("video", s); if(v && !v.src && v.dataset.src) v.src = v.dataset.src;
      if(v && !reduced){ var p = v.play(); if(p && p.catch) p.catch(function(){}); }
    });
  });
  var note = $("#heroNote");
  if(note) addEventListener("scroll", function(){ note.classList.toggle("hide", scrollY > 60); }, {passive:true});
}

/* hero heading: one mask per line */
var h1 = $(".hero-bar h1");
if(h1 && !h1.querySelector(".ln")){
  h1.innerHTML = h1.innerHTML.split(/<br\s*\/?>/i).map(function(l, i){ return '<span class="ln"><span style="transition-delay:' + (i * .12) + 's">' + l.trim() + '</span></span>'; }).join("");
}

/* ---------- split headings ---------- */
function splitWords(el){
  var html = el.innerHTML.split(/(<br\s*\/?>)/i).map(function(part){
    if(/^<br/i.test(part)) return part;
    return part.split(/(\s+)/).map(function(w){ return /^\s+$/.test(w) || !w ? w : '<span class="w"><span>' + w + '</span></span>'; }).join("");
  }).join("");
  el.innerHTML = html;
  $$(".w>span", el).forEach(function(s, i){ s.style.transitionDelay = (i * .05) + "s"; });
  el.classList.add("split"); el.classList.remove("rv");
}
var splitEls = $$("main h2, .phead h1").filter(function(h){ return !h.closest(".loader") && !h.querySelector("a,svg"); });
splitEls.forEach(splitWords);

/* ---------- scrubbed paragraph ---------- */
var scrubs = $$(".scrub");
scrubs.forEach(function(p){
  (function walk(n){
    $$(":scope > *", n).forEach(function(c){ if(!c.matches("a,br")) walk(c); });
    [].slice.call(n.childNodes).forEach(function(t){
      if(t.nodeType !== 3 || !t.textContent.trim()) return;
      var f = document.createDocumentFragment();
      t.textContent.split(/(\s+)/).forEach(function(w){ if(!w) return; if(/^\s+$/.test(w)) f.appendChild(document.createTextNode(w)); else { var s = document.createElement("span"); s.className = "sw"; s.textContent = w; f.appendChild(s); } });
      n.replaceChild(f, t);
    });
  })(p);
});
function scrubTick(){
  scrubs.forEach(function(p){
    var r = p.getBoundingClientRect(), words = $$(".sw", p);
    var prog = clamp((innerHeight * .85 - r.top) / (r.height + innerHeight * .35), 0, 1);
    var n = Math.round(prog * words.length);
    words.forEach(function(w, i){ w.classList.toggle("lit", i < n); });
  });
}
if(scrubs.length){ if(reduced) $$(".scrub .sw").forEach(function(w){ w.classList.add("lit"); }); else { addEventListener("scroll", scrubTick, {passive:true}); scrubTick(); } }

/* ---------- icon stroke lengths ---------- */
$$(".col .ico svg *").forEach(function(el){ try { el.style.setProperty("--len", Math.ceil(el.getTotalLength()) + 1); } catch(e){} });

/* ---------- things that animate once in view ---------- */
var once = $$(".shead, .split, .wordmark, .intro .pic, .col");
if("IntersectionObserver" in window && !reduced){
  var io = new IntersectionObserver(function(es){ es.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add("in"); io.unobserve(x.target); } }); }, {rootMargin:"0px 0px -10% 0px"});
  once.forEach(function(el){ io.observe(el); });
} else once.forEach(function(el){ el.classList.add("in"); });

/* ---------- clients slider ---------- */
var logos = $(".logos");
if(logos){
  var items = $$("li", logos), idx = 0, arrows = $$(".clients .row b");
  var perView = function(){ return innerWidth >= 960 ? 4 : 3; };
  var go = function(d){
    var max = items.length - perView();
    idx = idx + d > max ? 0 : idx + d < 0 ? max : idx + d;
    items.forEach(function(li){ li.style.transform = "translateX(" + (-idx * 100) + "%)"; });
  };
  if(arrows[0]){ arrows[0].addEventListener("click", function(){ go(-1); }); arrows[1].addEventListener("click", function(){ go(1); }); }
  arrows.forEach(function(b){ b.setAttribute("role","button"); b.setAttribute("tabindex","0"); b.addEventListener("keydown", function(e){ if(e.key === "Enter") b.click(); }); });
  if(!reduced) setInterval(function(){ if(!logos.matches(":hover")) go(1); }, 3200);
}

/* ---------- accordion: animate the height ---------- */
$$("details.acc").forEach(function(d){
  var s = $("summary", d), content = $$(":scope > :not(summary)", d);
  if(!content.length) return;
  var wrap = document.createElement("div"); wrap.className = "body";
  content.forEach(function(c){ wrap.appendChild(c); }); d.appendChild(wrap);
  s.addEventListener("click", function(e){
    if(reduced) return;
    e.preventDefault();
    if(d.open){
      var h = wrap.scrollHeight;
      wrap.animate([{height: h + "px"}, {height: "0px"}], {duration: 420, easing: "cubic-bezier(.2,.7,.1,1)"}).onfinish = function(){ d.open = false; };
    } else {
      d.open = true;
      var h2 = wrap.scrollHeight;
      wrap.animate([{height: "0px"}, {height: h2 + "px"}], {duration: 520, easing: "cubic-bezier(.2,.7,.1,1)"});
    }
  });
});

/* ---------- hotspots open the player too ---------- */
var player = $("#player"), pv = $("#playerVideo");
if(player){
  $$(".spot[data-video]").forEach(function(f){
    f.addEventListener("click", function(){
      pv.src = f.dataset.video; $("#playerTitle").textContent = f.dataset.title || "";
      player.showModal(); var p = pv.play(); if(p && p.catch) p.catch(function(){});
    });
  });
}

/* =====================================================================
   INTRO LOADER: the house is drafted, scanned, rendered, then handed
   over to the hero at the exact same position.
   ===================================================================== */
var loader = $("#loader");
function ready(){ body.classList.add("ready"); if(lenis) lenis.start(); }
var seen = false; try { seen = sessionStorage.getItem("bps-intro") === "1"; } catch(e){}
if(!loader || reduced || seen || location.hash){
  if(loader) loader.remove();
  requestAnimationFrame(function(){ requestAnimationFrame(ready); });
  return;
}
try { sessionStorage.setItem("bps-intro", "1"); } catch(e){}
if("scrollRestoration" in history) history.scrollRestoration = "manual";
scrollTo(0, 0);
loader.classList.add("on");
if(lenis) lenis.stop();
document.documentElement.style.overflow = "hidden";

var house = $(".ld-house", loader), lineSvg = $(".house-line", loader), shade = $(".house-shade", loader);
var strokes = $$("path,line", lineSvg);
strokes.forEach(function(p){ var L = Math.ceil(p.getTotalLength()) + 1; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.dataset.len = L; });
var scan = $(".ld-scan", loader), tc = $("[data-tc]", loader), pct = $("[data-pct]", loader);
var logs = $$(".log p", loader);
var rx = $(".rx", loader), ry = $(".ry", loader), plus = $(".plus", loader), xy = $(".xy", loader), bxl = $("[data-x]", loader), byl = $("[data-y]", loader);
var lx = innerWidth / 2, ly = innerHeight / 2, tx = lx, ty = ly;
loader.addEventListener("pointermove", function(e){ tx = e.clientX - 8; ty = e.clientY - 8; });

var DUR = 3.4, t0 = performance.now(), done = false, skipping = false;
function frame(now){
  if(done) return;
  var t = (now - t0) / 1000;
  /* ruler follows the pointer */
  lx += (tx - lx) * .14; ly += (ty - ly) * .14;
  rx.style.transform = "translateY(" + ly + "px)"; ry.style.transform = "translateX(" + lx + "px)";
  plus.style.transform = xy.style.transform = "translate(" + lx + "px," + ly + "px)";
  xy.style.transform = "translate(" + (lx + 14) + "px," + (ly + 10) + "px)";
  bxl.textContent = Math.round(lx); byl.textContent = Math.round(ly);
  /* drafting: strokes draw in a staggered wave */
  var N = strokes.length;
  strokes.forEach(function(p, i){
    var st = .1 + (i / N) * 1.2, k = ease(clamp((t - st) / .7, 0, 1));
    p.style.strokeDashoffset = p.dataset.len * (1 - k);
  });
  /* scan line sweeps down while the timecode runs */
  var sk = clamp((t - .4) / 2.2, 0, 1);
  scan.style.opacity = sk > 0 && sk < 1 ? 1 : 0;
  scan.style.transform = "translateY(" + (easeIO(sk) * (loader.clientHeight - 2)) + "px)";
  var fr = Math.floor(t * 60), ss = Math.floor(fr / 60);
  tc.textContent = "00:00:" + String(ss).padStart(2, "0") + ":" + String(fr % 60).padStart(2, "0");
  /* render log */
  var li = Math.floor(clamp(t / 2.9, 0, 1) * logs.length);
  logs.forEach(function(p, i){ p.classList.toggle("on", i < li); p.classList.toggle("now", i === li); });
  pct.textContent = Math.round(clamp(t / 3, 0, 1) * 100);
  /* render pass: line art becomes the shaded illustration */
  var rk = clamp((t - 2.2) / .8, 0, 1);
  shade.style.opacity = rk; lineSvg.style.opacity = 1 - rk * .85;
  if(t >= DUR) return handover();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function handover(fast){
  if(done) return; done = true;
  logs.forEach(function(p){ p.classList.add("on"); p.classList.remove("now"); }); pct.textContent = "100";
  strokes.forEach(function(p){ p.style.strokeDashoffset = 0; });
  shade.style.opacity = 1; lineSvg.style.opacity = .15; scan.style.opacity = 0;
  var target = $("#house"), from = house.getBoundingClientRect(), to = target.getBoundingClientRect();
  var dx = (to.left + to.width / 2) - (from.left + from.width / 2), dy = (to.top + to.height / 2) - (from.top + from.height / 2), sc = to.width / from.width;
  var d = fast ? 380 : 1000;
  $$(":scope > :not(.ld-house)", loader).forEach(function(el){ el.animate([{opacity: 1}, {opacity: 0}], {duration: d * .5, fill: "forwards"}); });
  var anim = house.animate([
    {transform: "translate(-50%,-50%)"},
    {transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) scale(" + sc + ")"}
  ], {duration: d, easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards"});
  loader.animate([{backgroundColor: "rgba(242,241,236,1)"}, {backgroundColor: "rgba(242,241,236,0)"}], {duration: d * .5, delay: d * .55, fill: "forwards"});
  loader.animate([{borderColor: "rgba(179,179,175,1)"}, {borderColor: "rgba(179,179,175,0)"}], {duration: d * .4, fill: "forwards"});
  anim.onfinish = function(){
    document.documentElement.style.overflow = "";
    ready();
    loader.animate([{opacity: 1}, {opacity: 0}], {duration: 300, fill: "forwards"}).onfinish = function(){ loader.remove(); };
  };
}
function skip(){ if(!done){ skipping = true; handover(true); } }
$(".ld-skip", loader).addEventListener("click", skip);
loader.addEventListener("click", skip);
addEventListener("keydown", function(e){ if(e.key === "Escape") skip(); });
})();

/* ---------- custom video player controls ---------- */
(function(){
  var pl = document.getElementById("pl"); if(!pl) return;
  var v = pl.querySelector("video"), q = function(s){ return pl.querySelector(s); };
  var playB = q(".pl-play"), big = q(".pl-big"), muteB = q(".pl-mute"), fsB = q(".pl-fs");
  var track = q(".pl-track"), fill = q(".pl-fill"), head = q(".pl-head"), buf = q(".pl-buf"), tip = q(".pl-hover");
  var cur = q("[data-cur]"), dur = q("[data-dur]");
  var tc = function(s){ s = s || 0; var f = Math.floor((s % 1) * 60); s = Math.floor(s); return String(Math.floor(s / 60)).padStart(2,"0") + ":" + String(s % 60).padStart(2,"0") + ":" + String(f).padStart(2,"0"); };
  var toggle = function(){ v.paused ? v.play().catch(function(){}) : v.pause(); };
  [playB, big].forEach(function(b){ b.addEventListener("click", toggle); });
  v.addEventListener("click", toggle);
  v.addEventListener("play", function(){ pl.classList.add("playing"); playB.textContent = "Pause"; });
  v.addEventListener("pause", function(){ pl.classList.remove("playing"); playB.textContent = "Play"; });
  v.addEventListener("loadedmetadata", function(){ dur.textContent = tc(v.duration); });
  v.addEventListener("timeupdate", function(){
    var p = v.duration ? v.currentTime / v.duration * 100 : 0;
    fill.style.width = p + "%"; head.style.left = p + "%"; cur.textContent = tc(v.currentTime);
    track.setAttribute("aria-valuenow", Math.round(p));
    if(v.buffered.length) buf.style.width = (v.buffered.end(v.buffered.length - 1) / v.duration * 100) + "%";
  });
  var seekAt = function(e){ var r = track.getBoundingClientRect(); return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); };
  var drag = false;
  track.addEventListener("pointerdown", function(e){ drag = true; track.setPointerCapture(e.pointerId); if(v.duration) v.currentTime = seekAt(e) * v.duration; });
  track.addEventListener("pointermove", function(e){
    var k = seekAt(e); tip.style.left = (k * 100) + "%"; tip.textContent = tc(k * (v.duration || 0));
    if(drag && v.duration) v.currentTime = k * v.duration;
  });
  track.addEventListener("pointerup", function(){ drag = false; });
  track.addEventListener("keydown", function(e){
    if(e.key === "ArrowRight") v.currentTime += 5; else if(e.key === "ArrowLeft") v.currentTime -= 5; else return; e.preventDefault();
  });
  var setMute = function(){ muteB.textContent = v.muted ? "Sound off" : "Sound on"; };
  muteB.addEventListener("click", function(){ v.muted = !v.muted; setMute(); });
  v.addEventListener("volumechange", setMute);
  fsB.addEventListener("click", function(){ document.fullscreenElement ? document.exitFullscreen() : (pl.requestFullscreen && pl.requestFullscreen()); });
  document.addEventListener("keydown", function(e){
    if(!document.getElementById("player").open) return;
    if(e.key === " " || e.key === "k"){ e.preventDefault(); toggle(); }
    else if(e.key === "m") muteB.click(); else if(e.key === "f") fsB.click();
  });
  v.addEventListener("emptied", function(){ fill.style.width = buf.style.width = head.style.left = "0"; cur.textContent = dur.textContent = "00:00:00"; });
})();

(function(){
"use strict";
var C = window.BPS, $ = function(s,r){return (r||document).querySelector(s)}, $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
var cur = "NGN";

$("#yr").textContent = new Date().getFullYear();

/* ---------- pricing, promises, package select (all from config.js) ---------- */
var sym = {NGN:"₦", USD:"$"};
function money(p){ return sym[cur] + p[cur].toLocaleString("en-US"); }

function renderTiers(){
  $("#tiers").innerHTML = C.tiers.map(function(t){
    return '<article class="tier'+(t.featured?' featured':'')+'" aria-labelledby="t-'+t.id+'">'+
      (t.featured?'<span class="badge">Most chosen</span>':'')+
      '<p class="mono tag">'+t.tag+'</p>'+
      '<h3 id="t-'+t.id+'">'+t.name+'</h3>'+
      '<p class="who">'+t.who+'</p>'+
      '<p class="price" data-id="'+t.id+'">'+money(t.price)+'<small>'+t.per+'</small></p>'+
      '<ul>'+t.features.map(function(f){return '<li>'+f+'</li>'}).join("")+'</ul>'+
      '<a class="btn '+(t.featured?'btn-hot':'btn-ghost')+'" href="#contact" data-pick="'+t.id+'">Choose '+t.name+' <span aria-hidden="true">→</span></a>'+
    '</article>';
  }).join("");
}
function renderPromises(){
  var items = C.promises.slice();
  var extra = C.deliveryPromise;
  var html = items.map(function(p){return '<li><b>'+p[0]+'</b><span>'+p[1]+'</span></li>'});
  if(extra && extra.length) html.push('<li class="extra"><b>'+extra[0]+'</b><span>'+extra[1]+'</span></li>');
  $("#promises").innerHTML = html.join("");
}
function renderSelect(){
  $("#pkg").innerHTML = C.tiers.map(function(t){
    return '<option value="'+t.id+'">'+t.name+' · '+money(t.price)+'</option>';
  }).join("") + '<option value="custom">Not sure yet</option>';
}
renderTiers(); renderPromises(); renderSelect();

$$(".cur button").forEach(function(b){
  b.addEventListener("click", function(){
    cur = b.dataset.cur;
    $$(".cur button").forEach(function(x){x.setAttribute("aria-pressed", x===b)});
    var keep = $("#pkg").value; renderTiers(); renderSelect(); $("#pkg").value = keep;
  });
});

if(typeof C.slotsOpen === "number"){
  var s = $("#slots"); s.hidden = false; s.textContent = "[ " + C.slotsOpen + " slots open this month ]";
}

/* any "pick a package" link preselects it in the form */
document.addEventListener("click", function(e){
  var a = e.target.closest("[data-pick]");
  if(a && a.dataset.pick) $("#pkg").value = a.dataset.pick;
});

/* ---------- menu ---------- */
var menu = $("#menu");
$("#menuBtn").addEventListener("click", function(){ menu.showModal(); });
menu.addEventListener("click", function(e){ if(e.target.closest("nav a")) menu.close(); });

/* ---------- cursor coordinates ---------- */
var cx = $("#cx"), cy = $("#cy");
if(matchMedia("(hover:hover)").matches){
  addEventListener("pointermove", function(e){ cx.textContent = Math.round(e.clientX); cy.textContent = Math.round(e.clientY); }, {passive:true});
}

/* ---------- reveal on scroll ---------- */
var rvEls = $$(".projects .head, .pcard, .head, .trio>div, .steps li, .tier, .promise, .qa, .push");
rvEls.forEach(function(el){ el.classList.add("rv"); });
if("IntersectionObserver" in window && !reduced){
  var io = new IntersectionObserver(function(es){
    es.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add("in"); io.unobserve(x.target); } });
  }, {rootMargin:"0px 0px -8% 0px"});
  rvEls.forEach(function(el){ io.observe(el); });
} else { rvEls.forEach(function(el){ el.classList.add("in"); }); }

/* ---------- video tiles: preview on hover/focus/in-view, full cut in a dialog ---------- */
var tiles = $$(".tile video");
function playTile(v){ if(reduced) return; var p = v.play(); if(p && p.catch) p.catch(function(){}); }
function stopTile(v){ v.pause(); }
tiles.forEach(function(v){
  var b = v.closest(".tile");
  b.addEventListener("mouseenter", function(){ playTile(v); });
  b.addEventListener("mouseleave", function(){ stopTile(v); });
  b.addEventListener("focus", function(){ playTile(v); });
  b.addEventListener("blur", function(){ stopTile(v); });
});
/* touch screens have no hover, so play whichever tile is mostly on screen */
if(!matchMedia("(hover:hover)").matches && "IntersectionObserver" in window){
  var vio = new IntersectionObserver(function(es){
    es.forEach(function(x){ x.isIntersecting ? playTile(x.target) : stopTile(x.target); });
  }, {threshold:.6});
  tiles.forEach(function(v){ vio.observe(v); });
}

var player = $("#player"), pv = $("#playerVideo");
function openCard(card){
  pv.src = card.dataset.video;
  pv.style.aspectRatio = card.dataset.ratio;
  $("#playerTitle").textContent = "[ " + card.dataset.title + " ]";
  player.showModal();
  var p = pv.play(); if(p && p.catch) p.catch(function(){});
}
$$(".pcard").forEach(function(card){
  $(".tile", card).addEventListener("click", function(){ openCard(card); });
});
/* the 3D spiral asks us to open a project by id */
document.addEventListener("bps:open", function(e){
  var card = $('.pcard[data-id="'+e.detail+'"]'); if(card) openCard(card);
});
function closePlayer(){ pv.pause(); pv.removeAttribute("src"); pv.load(); }
player.addEventListener("close", closePlayer);
$("#playerCta").addEventListener("click", function(){ player.close(); });
player.addEventListener("click", function(e){ if(e.target === player) player.close(); });

/* ---------- sticky mobile CTA ---------- */
var stick = $(".stick"), contactVisible = false;
if("IntersectionObserver" in window){
  new IntersectionObserver(function(es){ contactVisible = es[0].isIntersecting; update(); }).observe($("#contact"));
}
function update(){ stick.classList.toggle("show", scrollY > innerHeight*.6 && !contactVisible); }
addEventListener("scroll", update, {passive:true}); update();

/* ---------- enquiry form -> opens the visitor's email app ---------- */
var form = $("#form"), msg = $("#formMsg");
form.addEventListener("submit", function(e){
  e.preventDefault();
  var bad = [];
  ["name","contact","what"].forEach(function(n){
    var f = form.elements[n], ok = f.value.trim().length > 1;
    f.setAttribute("aria-invalid", !ok); if(!ok) bad.push(f);
  });
  msg.className = "form-msg";
  if(bad.length){ msg.classList.add("err"); msg.textContent = "Please fill in your name, how to reach you, and what you're launching."; bad[0].focus(); return; }
  var t = C.tiers.filter(function(x){return x.id === form.elements.pkg.value})[0];
  var via = (e.submitter && e.submitter.value) || "wa";
  var org = form.elements.org && form.elements.org.value ? "\nI am a: "+form.elements.org.value : "";
  var text = (C.waIntro || "Hi Blue Particle Studios, I'd like a launch video.")+"\n\nName: "+form.elements.name.value+org+
    "\nContact: "+form.elements.contact.value+
    "\nPackage: "+(t ? t.name+" ("+money(t.price)+")" : "Not sure yet")+
    "\nDeadline: "+(form.elements.when.value||"flexible")+
    "\n\nWhat I'm launching:\n"+form.elements.what.value;
  if(via === "email"){
    location.href = "mailto:"+C.email+"?subject="+encodeURIComponent((C.subject || "Launch video enquiry")+": "+form.elements.name.value)+"&body="+encodeURIComponent(text);
    msg.classList.add("ok"); msg.textContent = "Opening your email app. If nothing opens, write to " + C.email + ".";
  } else {
    window.open("https://wa.me/"+C.whatsapp+"?text="+encodeURIComponent(text), "_blank", "noopener");
    msg.classList.add("ok"); msg.textContent = "Opening WhatsApp with your message ready. Just press send.";
  }
});

/* ---------- particle field in the hero ---------- */
var cv = $("#field"), g = cv.getContext("2d"), W, H, dpr, pts = [], mouse = {x:-999,y:-999}, raf, visible = true;
function size(){
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = cv.clientWidth; H = cv.clientHeight;
  cv.width = W*dpr; cv.height = H*dpr; g.setTransform(dpr,0,0,dpr,0,0);
  var n = Math.round(Math.min(120, Math.max(36, W*H/16000)));
  pts = [];
  for(var i=0;i<n;i++) pts.push({x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*.35, vy:(Math.random()-.5)*.35, r:1.2+Math.random()*2.6});
  if(reduced) draw();
}
function draw(){
  g.clearRect(0,0,W,H);
  var link = Math.min(150, W/6);
  for(var i=0;i<pts.length;i++){
    var p = pts[i];
    if(!reduced){
      var dx = p.x-mouse.x, dy = p.y-mouse.y, d = dx*dx+dy*dy;
      if(d < 22500){ var f = (1-d/22500)*1.4, m = Math.sqrt(d)||1; p.x += dx/m*f; p.y += dy/m*f; }
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>W) p.vx*=-1; if(p.y<0||p.y>H) p.vy*=-1;
    }
    for(var j=i+1;j<pts.length;j++){
      var q = pts[j], ax = p.x-q.x, ay = p.y-q.y, dd = ax*ax+ay*ay;
      if(dd < link*link){ g.strokeStyle = "rgba(35,66,255,"+(0.28*(1-Math.sqrt(dd)/link))+")"; g.lineWidth = 1; g.beginPath(); g.moveTo(p.x,p.y); g.lineTo(q.x,q.y); g.stroke(); }
    }
    g.fillStyle = "#2342ff"; g.beginPath(); g.arc(p.x,p.y,p.r,0,6.283); g.fill();
  }
  if(!reduced && visible) raf = requestAnimationFrame(draw);
}
size(); if(!reduced) draw();
var rt; addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(size, 150); });
cv.parentElement.addEventListener("pointermove", function(e){ var r = cv.getBoundingClientRect(); mouse.x = e.clientX-r.left; mouse.y = e.clientY-r.top; }, {passive:true});
cv.parentElement.addEventListener("pointerleave", function(){ mouse.x = mouse.y = -999; });
if("IntersectionObserver" in window && !reduced){
  new IntersectionObserver(function(es){ visible = es[0].isIntersecting; cancelAnimationFrame(raf); if(visible) draw(); }).observe(cv);
}
})();

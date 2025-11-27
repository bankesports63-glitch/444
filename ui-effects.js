// ui-effects.js — particles, scroll reveal and product-card tilt
(function(){
  // Particles (simple canvas) for background element with id 'particles'
  function initParticles(){
    const el = document.getElementById('particles');
    if(!el) return;
    el.style.position='fixed'; el.style.left=0; el.style.top=0; el.style.right=0; el.style.bottom=0; el.style.zIndex='-1';
    const canvas = document.createElement('canvas'); el.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let w, h, particles=[];
    function resize(){ w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize); resize();
    function rand(min,max){return Math.random()*(max-min)+min}
    for(let i=0;i<80;i++) particles.push({x:rand(0,w), y:rand(0,h), vx:rand(-0.3,0.3), vy:rand(-0.2,0.2), r:rand(0.6,2.6), alpha:rand(0.08,0.25)});
    function draw(){ ctx.clearRect(0,0,w,h); for(const p of particles){ p.x += p.vx; p.y += p.vy; if(p.x< -10) p.x = w+10; if(p.x> w+10) p.x = -10; if(p.y< -10) p.y = h+10; if(p.y> h+10) p.y = -10; ctx.beginPath(); ctx.fillStyle = 'rgba(124,58,237,'+p.alpha+')'; ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); } requestAnimationFrame(draw); }
    requestAnimationFrame(draw);
  }

  // Scroll reveal using IntersectionObserver
  function initReveal(){
    const els = document.querySelectorAll('.reveal');
    if(!els.length) return;
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target);} });
    }, { threshold: 0.12 });
    els.forEach(el=>obs.observe(el));
  }

  // Product card tilt
  function initTilt(){
    document.querySelectorAll('.product-card').forEach(card=>{
      const inner = document.createElement('div'); inner.className='tilt-inner';
      while(card.firstChild) inner.appendChild(card.firstChild);
      card.appendChild(inner);
      card.classList.add('tilt');
      card.addEventListener('mousemove', e=>{
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rx = (y * 8).toFixed(2);
        const ry = (x * -12).toFixed(2);
        inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
      });
      card.addEventListener('mouseleave', ()=>{ inner.style.transform = 'none'; });
    });
  }

  // Small toast helper
  function showToast(msg, ms=2200){ const t = document.createElement('div'); t.className='ui-toast'; t.textContent = msg; document.body.appendChild(t); requestAnimationFrame(()=>t.classList.add('show')); setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),300); }, ms); }

  document.addEventListener('DOMContentLoaded', ()=>{
    try{ initParticles(); }catch(e){}
    try{ initReveal(); }catch(e){}
    try{ initTilt(); }catch(e){}
    // expose small api
    window.uiShowToast = showToast;
  });
})();

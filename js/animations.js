// Animations & UX polish
(function(){
  document.addEventListener('DOMContentLoaded', ()=>{
    document.documentElement.classList.add('show');

    // Intersection reveal
    const io = new IntersectionObserver((entries)=>{
      for(const e of entries){
        if(e.isIntersecting){
          e.target.classList.add('reveal');
          io.unobserve(e.target);
        }
      }
    }, {threshold: .12});
    document.querySelectorAll('[data-animate]').forEach(n=> io.observe(n));

    // Buttons ripple origin
    document.body.addEventListener('pointerdown', (e)=>{
      const b = e.target.closest('.btn.ripple');
      if(!b) return;
      const rect = b.getBoundingClientRect();
      b.style.setProperty('--x', (e.clientX-rect.left)+'px');
      b.style.setProperty('--y', (e.clientY-rect.top)+'px');
    });

    // Tilt effect on cards
    const maxTilt = 8;
    document.querySelectorAll('.tilt').forEach(card=>{
      card.addEventListener('pointermove', (e)=>{
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `rotateX(${(-py*maxTilt).toFixed(2)}deg) rotateY(${(px*maxTilt).toFixed(2)}deg)`;
      });
      card.addEventListener('pointerleave', ()=>{ card.style.transform = 'rotateX(0) rotateY(0)'; });
    });

    // Floating orbs parallax
    const orbs = document.querySelectorAll('.orb');
    window.addEventListener('pointermove', (e)=>{
      const cx = window.innerWidth/2, cy = window.innerHeight/2;
      const dx = (e.clientX - cx)/cx, dy = (e.clientY - cy)/cy;
      orbs.forEach((o,i)=>{
        const p = (i+1)*4;
        o.style.transform = `translate(${dx*p}vmin, ${dy*p}vmin)`;
      });
    });
  });
})();

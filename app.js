(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toggle = document.querySelector('.nav-toggle'), nav = document.querySelector('#navigation');
  const closeNav = () => {nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');};
  toggle.addEventListener('click',() => {const open=toggle.getAttribute('aria-expanded')!=='true';nav.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click',closeNav));
  document.addEventListener('click',e => {if(!e.target.closest('.header')) closeNav();});
  document.addEventListener('keydown',e => {if(e.key==='Escape' && nav.classList.contains('is-open')) {closeNav();toggle.focus();}});
  matchMedia('(min-width:761px)').addEventListener('change',e => {if(e.matches) closeNav();});
  if('IntersectionObserver' in window && !reduced) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {if(entry.isIntersecting) {entry.target.classList.add('in-view');observer.unobserve(entry.target);}}),{threshold:.08});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    document.documentElement.classList.add('js-motion');
  }
  const weekday = new Intl.DateTimeFormat('en-US',{weekday:'long',timeZone:'America/Los_Angeles'}).format(new Date());
  document.querySelectorAll('.hours-row').forEach(row => {if(row.dataset.day===weekday) {row.classList.add('today');row.setAttribute('aria-label','Today, '+row.textContent);}});
  const carousel = document.querySelector('.review-carousel');
  if (carousel) {
    const track = carousel.querySelector('.review-grid');
    const cards = [...track.querySelectorAll('.review-card')];
    const previous = carousel.querySelector('.review-prev');
    const next = carousel.querySelector('.review-next');
    const dots = carousel.querySelector('.review-dots');
    const status = carousel.querySelector('.review-status');
    let perPage = 1, pageCount = 0, scheduled = false;
    const step = () => cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth;
    const currentIndex = () => Math.max(0, Math.min(cards.length - perPage, Math.round(track.scrollLeft / step())));
    const go = page => {
      const index = Math.min(Math.max(0, page) * perPage, cards.length - perPage);
      track.scrollTo({left:index * step(), behavior:reduced ? 'instant' : 'smooth'});
    };
    const update = () => {
      const index = currentIndex(), page = Math.min(pageCount - 1, Math.round(index / perPage));
      previous.disabled = index === 0;
      next.disabled = index >= cards.length - perPage;
      [...dots.children].forEach((dot,i) => {
        dot.classList.toggle('active',i === page);
        if(i === page) dot.setAttribute('aria-current','true'); else dot.removeAttribute('aria-current');
      });
      const end = Math.min(cards.length, index + perPage);
      status.textContent = perPage > 1 ? `Reviews ${index + 1}–${end} of ${cards.length}` : `Review ${index + 1} of ${cards.length}`;
    };
    const layout = () => {
      const oldIndex = currentIndex();
      perPage = Math.max(1, Math.min(cards.length, Math.round(track.clientWidth / cards[0].getBoundingClientRect().width)));
      const pages = Math.ceil(cards.length / perPage);
      if(pages !== pageCount) {
        pageCount = pages; dots.replaceChildren();
        for(let i = 0; i < pageCount; i++) {
          const dot = document.createElement('button'); dot.type = 'button';
          const start = i * perPage + 1, end = Math.min(cards.length,start + perPage - 1);
          dot.setAttribute('aria-label',perPage > 1 ? `Show reviews ${start} to ${end}` : `Show review ${start}`);
          dot.addEventListener('click',() => go(i)); dots.append(dot);
        }
      }
      track.scrollTo({left:Math.min(Math.floor(oldIndex/perPage)*perPage,cards.length-perPage) * step(),behavior:'instant'});
      update();
    };
    previous.addEventListener('click',() => go(Math.ceil(currentIndex()/perPage) - 1));
    next.addEventListener('click',() => go(Math.floor(currentIndex()/perPage) + 1));
    track.addEventListener('scroll',() => {if(!scheduled) {scheduled = true;requestAnimationFrame(() => {update();scheduled=false;});}}, {passive:true});
    track.addEventListener('keydown',event => {
      if(event.target !== track) return;
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      if(event.key === 'Home') go(0);
      else if(event.key === 'End') go(pageCount-1);
      else go(Math.round(currentIndex()/perPage) + (event.key === 'ArrowRight' ? 1 : -1));
    });
    carousel.classList.add('is-ready');
    if('ResizeObserver' in window) new ResizeObserver(layout).observe(track); else addEventListener('resize',layout);
    layout();
  }
  if(!reduced) {
    const photo=document.querySelector('.photo-frame>img'),wheel=document.querySelector('.turning-mark');let scheduled=false;
    const paint=()=>{const max=document.documentElement.scrollHeight-innerHeight;document.documentElement.style.setProperty('--progress',max>0?scrollY/max:0);if(scrollY<1100) {photo.style.transform=`translateY(${Math.min(scrollY*.045,30)}px) scale(1.06)`;wheel.style.transform=`rotate(${scrollY*.1}deg)`;}scheduled=false;};
    addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(paint);}}, {passive:true});paint();
  }
})();

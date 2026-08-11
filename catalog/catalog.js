(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  // Shared accessible theme, persisted across the main site and catalog pages.
  const topbarInner = $('.topbar-inner');
  const themeBtn = document.createElement('button');
  themeBtn.type='button'; themeBtn.className='catalog-theme-toggle';
  if (topbarInner) topbarInner.appendChild(themeBtn);
  const applyTheme = mode => {
    document.body.classList.toggle('dark', mode === 'dark');
    themeBtn.textContent = mode === 'dark' ? '☀' : '◐';
    themeBtn.setAttribute('aria-label', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    themeBtn.title = themeBtn.getAttribute('aria-label');
  };
  let preferred = localStorage.getItem('fs-theme');
  if (!preferred) preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(preferred);
  themeBtn.addEventListener('click', () => {
    const next = document.body.classList.contains('dark') ? 'light' : 'dark';
    localStorage.setItem('fs-theme', next); applyTheme(next);
  });
  let toastTimer;
  const toast = msg => {
    let t = $('.demo-toast');
    if (!t) { t=document.createElement('div'); t.className='demo-toast'; document.body.appendChild(t); }
    t.textContent=msg; t.classList.add('show'); clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>t.classList.remove('show'),1500);
  };
  const codeOf = el => $('.code', el.closest('.specimen'))?.textContent.trim() || 'Demo';
  const nameOf = el => $('h3', el.closest('.specimen'))?.textContent.trim() || 'component';
  const announce = el => toast(`${codeOf(el)} · ${nameOf(el)} demo`);

  // Every specimen can be selected for easy customer reference.
  $$('.specimen').forEach(card => {
    card.addEventListener('dblclick', e => {
      if (e.target.matches('input,textarea,select,option')) return;
      card.classList.toggle('demo-selected');
      toast(`${$('.code',card)?.textContent || ''} ${card.classList.contains('demo-selected') ? 'selected' : 'unselected'}`);
    });
  });

  // Real buttons: press feedback + special simulations.
  $$('.sample button').forEach(btn => {
    btn.addEventListener('click', e => {
      if (btn.disabled) return;
      const code=codeOf(btn), original=btn.dataset.original || btn.textContent;
      btn.dataset.original=original;
      if (code==='BT-15' || /save|submit|confirm/i.test(original)) {
        btn.textContent='✓ Done'; setTimeout(()=>btn.textContent=original,1200);
      } else if (code==='BT-16' || /delete|remove/i.test(original)) {
        btn.classList.add('demo-shake'); setTimeout(()=>btn.classList.remove('demo-shake'),350);
      } else if (code==='BT-49') {
        btn.textContent=btn.textContent.includes('▶')?'❚❚':'▶';
      } else if (code==='BT-50') {
        btn.textContent=btn.textContent.includes('Pause')?'▶ Play':'Ⅱ Pause';
      } else if (code==='BT-55') {
        btn.innerHTML='<span class="demo-spin">◌</span> Working…'; setTimeout(()=>btn.textContent=original,1300);
      } else if (code==='BT-57') {
        btn.textContent='✓ Saved'; setTimeout(()=>btn.textContent=original,1200);
      } else if (code==='BT-59') {
        btn.textContent=btn.textContent.includes('♡')?'♥ Bookmarked':'♡ Bookmark';
      } else if (code==='BT-60') {
        btn.textContent=btn.textContent.includes('Follow')&&!btn.textContent.includes('Following')?'✓ Following':'＋ Follow';
      } else if (code==='BT-24' || code==='BT-23') {
        e.stopPropagation(); toggleMenu(btn,['Option One','Option Two','Option Three']);
      }
      announce(btn);
    });
  });

  function toggleMenu(anchor, items) {
    $$('.fake-menu').forEach(m=>m.remove());
    const menu=document.createElement('div'); menu.className='fake-menu';
    items.forEach(item=>{const b=document.createElement('button');b.type='button';b.textContent=item;b.onclick=()=>{toast(`${item} selected`);menu.remove()};menu.appendChild(b)});
    const sample=anchor.closest('.sample'); sample.appendChild(menu);
    const r=anchor.getBoundingClientRect(), sr=sample.getBoundingClientRect();
    menu.style.top=(r.bottom-sr.top+6)+'px'; menu.style.left=Math.max(8,r.left-sr.left)+'px';
  }
  document.addEventListener('click',e=>{if(!e.target.closest('.fake-menu')&&!e.target.closest('.sample button')) $$('.fake-menu').forEach(m=>m.remove())});

  // Inputs and forms.
  $$('input[type="range"]').forEach(inp=>{const v=document.createElement('span');v.className='demo-range-value';v.textContent=inp.value;inp.after(v);inp.addEventListener('input',()=>v.textContent=inp.value)});
  $$('input[type="password"]').forEach(inp=>{const eye=inp.parentElement.querySelector('span');if(eye){eye.style.cursor='pointer';eye.onclick=()=>{inp.type=inp.type==='password'?'text':'password';toast(inp.type==='text'?'Password shown':'Password hidden')}}});
  $$('input[type="file"]').forEach(i=>i.addEventListener('change',()=>toast(i.files[0]?.name||'File selected')));
  $$('input,textarea,select').forEach(inp=>{inp.addEventListener('change',()=>toast(`${codeOf(inp)} value changed`));});

  // Convert visual upload labels into working file pickers.
  $$('.specimen').forEach(card=>{
    const code=$('.code',card)?.textContent;
    if(code==='IN-13'){
      const lab=$('label',card); if(lab){lab.style.cursor='pointer'; const f=document.createElement('input');f.type='file';f.style.display='none';lab.appendChild(f);f.onchange=()=>toast(f.files[0]?.name||'File selected');}
    }
    if(code==='IN-15' || code==='BT-51'){
      const sw=$('.sample > div',card);if(sw){sw.classList.add('demo-switch');sw.onclick=()=>{sw.classList.toggle('off');toast(sw.classList.contains('off')?'Toggle off':'Toggle on')}}
    }
    if(code==='IN-16' || code==='BT-52'){
      const el=$('.sample > div, .sample label',card); if(el){el.classList.add('demo-check');el.onclick=()=>{el.innerHTML=el.innerHTML.includes('☐ Blog')?el.innerHTML.replace('☐ Blog','☑ Blog'):el.innerHTML.replace('☑ Blog','☐ Blog');toast('Checkbox changed')}}
    }
    if(code==='IN-17' || code==='BT-53'){
      const el=$('.sample > div, .sample label',card);if(el){el.classList.add('demo-radio');el.onclick=()=>{el.innerHTML=el.innerHTML.includes('◉ Monthly')?el.innerHTML.replace('◉ Monthly','○ Monthly').replace('○ Annual','◉ Annual'):el.innerHTML.replace('○ Monthly','◉ Monthly').replace('◉ Annual','○ Annual');toast('Radio option changed')}}
    }
    if(code==='IN-19'){
      const input=$('input',card), buttons=$$('button',card); if(input&&buttons.length>=2){buttons[0].onclick=()=>{input.value=Math.max(0,(+input.value||0)-1);toast(`Quantity: ${input.value}`)};buttons[1].onclick=()=>{input.value=(+input.value||0)+1;toast(`Quantity: ${input.value}`)}}
    }
    if(code==='IN-24'){
      const opts=$$('.sample span',card);opts.forEach(o=>{o.style.cursor='pointer';o.onclick=()=>{opts.forEach(x=>{x.style.background='transparent'});o.style.background='#fff';toast(`${o.textContent} view selected`)}})
    }
  });

  // Navigation samples behave like tabs/menu selections.
  $$('.nav-demo span').forEach(item=>item.addEventListener('click',()=>{const nav=item.closest('.nav-demo');$$('span',nav).forEach(x=>x.classList.remove('demo-active'));item.classList.add('demo-active');toast(`${item.textContent.trim()} selected`)}));

  // Tables: row selection and clickable headers to simulate sorting.
  $$('.mini-table').forEach(table=>{
    $$('tbody tr',table).forEach(row=>row.addEventListener('click',()=>{ $$('tbody tr',table).forEach(r=>r.style.outline=''); row.style.outline='2px solid #1697e6'; row.style.outlineOffset='-2px'; toast('Table row selected'); }));
    $$('th',table).forEach(th=>{th.style.cursor='pointer';th.addEventListener('click',()=>{th.dataset.dir=th.dataset.dir==='asc'?'desc':'asc';toast(`Sorted ${th.textContent.trim()} ${th.dataset.dir}`)})});
  });

  // Labels, frames, cards, alerts, effects and typography are clickable demos.
  $$('.label').forEach(el=>el.addEventListener('click',()=>{el.classList.toggle('demo-label-active');announce(el)}));
  $$('.frame').forEach(el=>{el.style.cursor='pointer';el.addEventListener('click',()=>{el.classList.toggle('demo-frame-active');announce(el)})});
  $$('.card-demo').forEach(el=>{el.style.cursor='pointer';el.addEventListener('click',()=>{el.style.transform=el.style.transform?'':'translateY(-7px) scale(1.02)';announce(el)})});
  $$('.alert').forEach(el=>{el.style.cursor='pointer';el.title='Click to dismiss / restore';el.addEventListener('click',()=>{el.classList.toggle('demo-hidden');toast(el.classList.contains('demo-hidden')?'Alert dismissed':'Alert restored')})});
  $$('.effect-box').forEach(el=>{el.style.cursor='pointer';el.addEventListener('click',()=>{el.classList.remove('demo-pulse');void el.offsetWidth;el.classList.add('demo-pulse');announce(el)})});
  $$('.font-demo').forEach(el=>{el.title='Click to edit sample text';el.style.cursor='text';el.addEventListener('click',()=>{el.contentEditable='true';el.focus();toast('Type to preview this typography')});el.addEventListener('blur',()=>el.contentEditable='false')});

  // A small instruction strip without changing the page architecture.
  const heroP=$('.hero p');
  if(heroP){const note=document.createElement('p');note.style.cssText='margin-top:10px;font-size:.8rem;font-weight:800;color:var(--blue)';note.textContent='Interactive demos enabled — click controls to test them. Double-click any specimen card to mark it selected.';heroP.after(note)}
})();

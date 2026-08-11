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
  if(heroP){const note=document.createElement('p');note.style.cssText='margin-top:10px;font-size:.8rem;font-weight:800;color:var(--blue)';note.textContent='Interactive demos enabled — click controls to test them, then press Select on any specimen you want to save to your Website Builder.';heroP.after(note)}
})();


// ===== Persistent Customer Website Builder =====
(() => {
  const STORE='fs-builder-selections';
  const DETAILS='fs-builder-details';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const read=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch(e){return {}}};
  const write=data=>{localStorage.setItem(STORE,JSON.stringify(data)); updateFab();};
  const category=()=>document.querySelector('.hero h1')?.textContent.trim()||'Catalog';
  const getInfo=card=>({code:$('.code',card)?.textContent.trim()||'',name:$('h3',card)?.textContent.trim()||'Design option',category:category(),page:location.pathname.split('/').pop()});
  const PALETTE_STORE='fs-builder-selections';
  function selectedPaletteColors(){
    const data=Object.values(read());
    const p=data.find(x=>String(x.code||'').startsWith('CP-'));
    const map={
      "CP-01":["#0E2A47","#1697E6","#F6F9FC","#FFFFFF"],"CP-02":["#081A2B","#35B8FF","#7C3AED","#F8FAFC"],
      "CP-03":["#111111","#C9A227","#F5E7B2","#FFFFFF"],"CP-04":["#061A2D","#0066FF","#35B8FF","#EAF6FF"],
      "CP-05":["#0F2D28","#16A34A","#86EFAC","#F0FDF4"],"CP-06":["#342A24","#C26D3A","#F3E9DC","#FFFDF8"],
      "CP-07":["#3B2F2F","#D97745","#EAB676","#F7E8D0"],"CP-08":["#0B3B60","#0EA5A8","#DDF8F6","#FFFFFF"],
      "CP-09":["#102A43","#2F80ED","#B8D8FF","#F7FAFC"],"CP-10":["#2C1810","#A9442B","#D4A373","#FFF8EC"],
      "CP-11":["#18212B","#F59E0B","#FFD166","#F7F7F7"],"CP-12":["#172554","#6366F1","#C7D2FE","#F8FAFC"],
      "CP-13":["#4A2337","#E11D74","#FBCFE8","#FFF7FB"],"CP-14":["#243B2F","#53734B","#B7C9A8","#F5F7EF"],
      "CP-15":["#0F172A","#475569","#CBD5E1","#FFFFFF"],"CP-16":["#231942","#7C3AED","#C4B5FD","#FAF5FF"],
      "CP-17":["#082F49","#0284C7","#67E8F9","#ECFEFF"],"CP-18":["#431407","#EA580C","#FDBA74","#FFF7ED"],
      "CP-19":["#111827","#374151","#D1D5DB","#F9FAFB"],"CP-20":["#050816","#00E5FF","#B026FF","#E6FBFF"],
      "CP-21":["#29251F","#8B6F47","#D6C4A1","#F7F2E8"],"CP-22":["#3F1D2E","#FB7185","#FBCFE8","#FFF1F2"],
      "CP-23":["#0F3437","#0F766E","#B87333","#F0FDFA"],"CP-24":["#14213D","#2563EB","#F97316","#F8FAFC"]
    };
    return map[p?.code] || ["#0E2A47","#1697E6","#FFFFFF","#F6F9FC"];
  }

  const DESIGN_STORE='fs-design-system-v1';
  const defaultDesignSystem=()=>({
    primary:'#1697E6',secondary:'#0E2A47',accent:'#69BE28',background:'#FFFFFF',surface:'#F6F9FC',
    heading:'#0E2A47',body:'#334155',primaryText:'#FFFFFF',secondaryText:'#FFFFFF'
  });
  function readDesignSystem(){try{return {...defaultDesignSystem(),...JSON.parse(localStorage.getItem(DESIGN_STORE)||'{}')}}catch(e){return defaultDesignSystem()}}
  function writeDesignSystem(x){localStorage.setItem(DESIGN_STORE,JSON.stringify(x));}
  function contrastRatio(hex1,hex2){
    const lum=h=>{const s=h.replace('#','');const rgb=[0,2,4].map(i=>parseInt(s.slice(i,i+2),16)/255).map(c=>c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4));return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]};
    const a=lum(hex1),b=lum(hex2),hi=Math.max(a,b),lo=Math.min(a,b);return (hi+.05)/(lo+.05);
  }
  function contrastBadge(bg,fg){
    const r=contrastRatio(bg,fg); const ok=r>=4.5;
    return `<span class="contrast-badge ${ok?'good':'warn'}">${ok?'✓':'⚠'} ${r.toFixed(1)}:1 ${ok?'Readable':'Low contrast'}</span>`;
  }
  function targetsForCard(card){
    const pair=$('.variant-pair',card);
    const roots=pair ? $$('.variant-sample',pair) : [$('.sample',card)].filter(Boolean);
    return roots.map(r=>$('button',r)||$('a',r)||$('input[type="button"]',r)||$('.btn',r)||r).filter(Boolean);
  }
  function targetForCard(card){return targetsForCard(card)[0]||null;}
  function rememberOriginalStyle(card){
    targetsForCard(card).forEach(t=>{if(t.dataset.fsOriginalCaptured!=='1'){t.dataset.fsOriginalCaptured='1';t.dataset.fsOriginalStyle=t.getAttribute('style')||'';}});
  }
  function restoreOriginalStyle(card){
    targetsForCard(card).forEach(t=>{if(t.dataset.fsOriginalCaptured==='1'){const o=t.dataset.fsOriginalStyle||'';if(o)t.setAttribute('style',o);else t.removeAttribute('style');}});
    card.classList.remove('custom-color-preview','palette-color-preview');
  }
  function styleVariant(t,bg,text,border,hover,pressed,variant){
    if(!t)return;
    t.style.setProperty('background',bg,'important');
    t.style.setProperty('background-color',bg,'important');
    t.style.setProperty('color',text,'important');
    t.style.setProperty('border-color',border,'important');
    t.style.setProperty('--fs-hover',hover);
    t.style.setProperty('--fs-pressed',pressed);
    t.style.setProperty('--fs-base',bg);
    t.classList.add('customer-live-state');
    t.style.setProperty('box-shadow',variant==='primary'?`0 8px 22px color-mix(in srgb, ${bg} 35%, transparent)`:`0 6px 16px color-mix(in srgb, ${bg} 24%, transparent)`,'important');
  }
  function applyColorPreview(card,prefs){
    const targets=targetsForCard(card);if(!targets.length)return;rememberOriginalStyle(card);
    const mode=prefs?.colorMode||'global';
    if(mode==='as-shown'){restoreOriginalStyle(card);return;}
    let c={...defaultColorPrefs(),...prefs};
    if(mode==='global'){
      const g=readDesignSystem();
      c={...c,primaryBg:g.primary,primaryText:g.primaryText,primaryBorder:g.primary,primaryHover:g.accent,primaryPressed:g.secondary,
        secondaryBg:g.secondary,secondaryText:g.secondaryText,secondaryBorder:g.secondary,secondaryHover:g.primary,secondaryPressed:g.heading,previewBg:g.surface};
      card.classList.add('palette-color-preview');card.classList.remove('custom-color-preview');
    } else {card.classList.add('custom-color-preview');card.classList.remove('palette-color-preview');}
    styleVariant(targets[0],c.primaryBg,c.primaryText,c.primaryBorder,c.primaryHover,c.primaryPressed,'primary');
    styleVariant(targets[1],c.secondaryBg,c.secondaryText,c.secondaryBorder,c.secondaryHover,c.secondaryPressed,'secondary');
    $$('.variant-sample',card).forEach(x=>x.style.setProperty('--customer-bg',c.previewBg||'#fff'));
  }
  function migrateLegacySelections(){
    const data=read();let changed=false;
    Object.values(data).forEach(x=>{
      const c=x.colors;if(!c)return;
      if(c.primary && !c.primaryBg){
        x.colors={...defaultColorPrefs(),...c,
          colorMode:c.colorMode==='palette'?'global':(c.colorMode||'custom'),
          primaryBg:c.primary,primaryText:c.text||'#FFFFFF',primaryBorder:c.primary,
          secondaryBg:c.secondary||'#0E2A47',secondaryText:c.text||'#FFFFFF',secondaryBorder:c.secondary||'#0E2A47',
          previewBg:c.background||'#FFFFFF'};
        changed=true;
      }
    });
    if(changed)write(data);
  }
  migrateLegacySelections();
  function selected(code){return !!read()[code]}
  function setCard(card,on){
    card.classList.toggle('builder-selected',on);
    const b=$('.select-design',card);
    if(b){b.textContent=on?'✓ Selected':'+ Select'; b.setAttribute('aria-pressed',String(on));}
    renderColorControls(card,on);
    if(on){const data=read(), info=getInfo(card); applyColorPreview(card,data[info.code]?.colors||defaultColorPrefs());}
    else restoreOriginalStyle(card);
  }
  function defaultColorPrefs(){return {
    colorMode:'global',
    primaryBg:'#1697E6',primaryText:'#FFFFFF',primaryBorder:'#1697E6',primaryHover:'#0E86CF',primaryPressed:'#0874B5',
    secondaryBg:'#0E2A47',secondaryText:'#FFFFFF',secondaryBorder:'#0E2A47',secondaryHover:'#163B60',secondaryPressed:'#0A2035',
    previewBg:'#FFFFFF'
  };}
  function renderColorControls(card,on){
    let panel=$('.item-color-controls',card);
    if(!on){panel?.remove();return;}
    const info=getInfo(card), data=read(), item=data[info.code]||{}, prefs={...defaultColorPrefs(),...(item.colors||{})};
    if(!panel){panel=document.createElement('div');panel.className='item-color-controls';card.appendChild(panel);}
    const global=readDesignSystem();
    const mode=prefs.colorMode||'global';
    panel.innerHTML=`<div class="color-control-title">Primary + Secondary appearance <span class="inheritance-pill">${mode==='global'?'Using Website Colors':mode==='as-shown'?'As Shown':'Custom Override'}</span></div>
      <div class="color-mode-row">
        <label><input type="radio" name="mode-${info.code}" value="global" ${mode==='global'?'checked':''}> Use Website Colors</label>
        <label><input type="radio" name="mode-${info.code}" value="as-shown" ${mode==='as-shown'?'checked':''}> As Shown</label>
        <label><input type="radio" name="mode-${info.code}" value="custom" ${mode==='custom'?'checked':''}> Custom Override</label>
      </div>
      <div class="dual-style-editor" ${mode==='custom'?'':'hidden'}>
        <section><h4>PRIMARY</h4>${[
          ['primaryBg','Background'],['primaryText','Text'],['primaryBorder','Border'],['primaryHover','Hover'],['primaryPressed','Pressed']
        ].map(([k,l])=>`<label>${l}<span><input type="color" data-color="${k}" value="${prefs[k]}"><input class="hex-color" data-hex="${k}" value="${prefs[k]}" maxlength="7"></span></label>`).join('')}
        <div class="contrast-slot" data-contrast="primary"></div></section>
        <section><h4>SECONDARY</h4>${[
          ['secondaryBg','Background'],['secondaryText','Text'],['secondaryBorder','Border'],['secondaryHover','Hover'],['secondaryPressed','Pressed']
        ].map(([k,l])=>`<label>${l}<span><input type="color" data-color="${k}" value="${prefs[k]}"><input class="hex-color" data-hex="${k}" value="${prefs[k]}" maxlength="7"></span></label>`).join('')}
        <div class="contrast-slot" data-contrast="secondary"></div></section>
        <div class="pair-tools"><button type="button" class="swap-pair">⇄ Swap Primary / Secondary</button></div>
      </div>`;
    const current=()=>{const d=read();return {...defaultColorPrefs(),...(d[info.code]?.colors||{})}};
    const refreshContrast=(colors)=>{
      const p=$('[data-contrast="primary"]',panel),s=$('[data-contrast="secondary"]',panel);
      if(p)p.innerHTML=contrastBadge(colors.primaryBg,colors.primaryText);
      if(s)s.innerHTML=contrastBadge(colors.secondaryBg,colors.secondaryText);
    };
    const save=()=>{
      const d=read(), x=d[info.code]; if(!x)return;
      const selectedMode=$(`input[name="mode-${info.code}"]:checked`,panel)?.value||'global';
      const colors={...(x.colors||defaultColorPrefs()),colorMode:selectedMode};
      $$('[data-color]',panel).forEach(inp=>colors[inp.dataset.color]=inp.value.toUpperCase());
      d[info.code]={...x,colors};write(d);
      $('.dual-style-editor',panel).hidden=selectedMode!=='custom';
      $('.inheritance-pill',panel).textContent=selectedMode==='global'?'Using Website Colors':selectedMode==='as-shown'?'As Shown':'Custom Override';
      refreshContrast(colors); applyColorPreview(card,colors);
    };
    $$(`input[name="mode-${info.code}"]`,panel).forEach(r=>r.addEventListener('change',save));
    $$('[data-color]',panel).forEach(inp=>inp.addEventListener('input',()=>{const hex=$(`[data-hex="${inp.dataset.color}"]`,panel);hex.value=inp.value.toUpperCase();save()}));
    $$('[data-hex]',panel).forEach(inp=>inp.addEventListener('change',()=>{const v=inp.value.trim();const cp=$(`[data-color="${inp.dataset.hex}"]`,panel);if(/^#[0-9a-fA-F]{6}$/.test(v)){cp.value=v;save()}else inp.value=cp.value.toUpperCase()}));
    $('.swap-pair',panel)?.addEventListener('click',()=>{
      const d=read(),x=d[info.code];if(!x)return;const c={...defaultColorPrefs(),...(x.colors||{})};
      ['Bg','Text','Border','Hover','Pressed'].forEach(suf=>{const a='primary'+suf,b='secondary'+suf,tmp=c[a];c[a]=c[b];c[b]=tmp});
      c.colorMode='custom'; d[info.code]={...x,colors:c};write(d);renderColorControls(card,true);applyColorPreview(card,c);
    });
    refreshContrast(prefs);
  }
  function toggle(card){const info=getInfo(card); if(!info.code)return; const data=read(); if(data[info.code]) delete data[info.code]; else data[info.code]={...info,selectedAt:Date.now(),colors:defaultColorPrefs()}; write(data); setCard(card,!!data[info.code]);}
  
  // Show two practical variants for every catalog specimen.
  function variantLabels(){
    const title=(document.querySelector('.hero h1')?.textContent||'').toLowerCase();
    if(title.includes('font')||title.includes('typograph')) return ['HEADING','BODY'];
    if(title.includes('color')) return ['BRAND','ACCENT'];
    if(title.includes('card')) return ['FEATURED','STANDARD'];
    if(title.includes('frame')) return ['FEATURED','STANDARD'];
    if(title.includes('header')) return ['PRIMARY','COMPACT'];
    if(title.includes('gallery')) return ['FEATURED','THUMBNAIL'];
    if(title.includes('table')) return ['HEADER','STANDARD'];
    if(title.includes('alert')) return ['IMPORTANT','INFORMATIONAL'];
    return ['PRIMARY','SECONDARY'];
  }
  function buildVariantPreview(card){
    const sample=$('.sample',card); if(!sample || $('.variant-pair',card))return;
    const labels=variantLabels(), pair=document.createElement('div');pair.className='variant-pair';
    const secondary=sample.cloneNode(true);
    sample.classList.add('variant-sample','variant-primary');
    secondary.classList.add('variant-sample','variant-secondary');
    // Only the clone needs IDs removed; the original retains its wired controls/listeners.
    secondary.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
    const marker=document.createComment('variant-pair');
    sample.parentNode.insertBefore(marker,sample);
    pair.innerHTML=`<div class="variant-col"><span class="variant-label">${labels[0]}</span></div><div class="variant-col"><span class="variant-label">${labels[1]}</span></div>`;
    pair.children[0].appendChild(sample);pair.children[1].appendChild(secondary);
    marker.parentNode.replaceChild(pair,marker);
    // Secondary controls remain natively interactive; add tactile feedback to cloned buttons.
    secondary.querySelectorAll('button,a,[role="button"]').forEach(el=>{
      el.addEventListener('click',()=>{el.classList.add('demo-pressed');setTimeout(()=>el.classList.remove('demo-pressed'),180)});
    });
  }
  $$('.specimen').forEach(buildVariantPreview);

  // Add explicit selection buttons to every coded specimen.
  $$('.specimen').forEach(card=>{const info=getInfo(card);if(!info.code)return;let b=$('.select-design',card);if(!b){b=document.createElement('button');b.type='button';b.className='select-design';b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggle(card)});card.appendChild(b)}setCard(card,selected(info.code));card.addEventListener('dblclick',e=>{if(e.target.closest('button,input,textarea,select,a'))return;e.preventDefault();toggle(card)});});
  function updateFab(){if(location.pathname.endsWith('/builder.html')||location.pathname.endsWith('builder.html'))return;const count=Object.keys(read()).length;let fab=$('.selection-fab');if(!fab){fab=document.createElement('a');fab.href='builder.html';fab.className='selection-fab';fab.innerHTML='My Selections <b>0</b>';document.body.appendChild(fab)}$('b',fab).textContent=count;fab.title=`Review ${count} selected design${count===1?'':'s'}`;}
  updateFab();
  // Search/filter on catalog detail pages.
  const search=$('.catalog-search'); if(search){const cards=$$('.catalog-grid .specimen');const count=$('.catalog-result-count');const run=()=>{const q=search.value.trim().toLowerCase();let shown=0;cards.forEach(c=>{const ok=!q||c.textContent.toLowerCase().includes(q);c.style.display=ok?'':'none';if(ok)shown++});if(count)count.textContent=`${shown} shown`;};search.addEventListener('input',run);run();}
  // Builder summary page.
  const groups=$('#selection-groups'); if(groups){
    const empty=$('#empty-selections'), num=$('#selection-count');
    const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    function colorSummary(x){const c=x.colors||{};const mode=c.colorMode||'as-shown';if(mode==='as-shown')return '<small class="selection-color-note">Appearance: As Shown</small>';if(mode==='global')return '<small class="selection-color-note">Appearance: Using Website Colors</small>';return `<small class="selection-color-note">Primary ${esc(c.primaryBg||'')} / ${esc(c.primaryText||'')} · Secondary ${esc(c.secondaryBg||'')} / ${esc(c.secondaryText||'')}</small>`;}
    function render(){const data=Object.values(read()).sort((a,b)=>(a.category+a.code).localeCompare(b.category+b.code));num.textContent=data.length;groups.innerHTML='';empty.style.display=data.length?'none':'';const by={};data.forEach(x=>(by[x.category]??=[]).push(x));Object.entries(by).forEach(([cat,items])=>{const sec=document.createElement('section');sec.className='selection-group';sec.innerHTML=`<h2>${esc(cat)} <span class="code">${items.length}</span></h2>`+items.map(x=>`<div class="selection-item"><div class="selection-thumb">${esc(x.code)}</div><div><h3>${esc(x.name)}</h3><p>${esc(x.code)} · ${esc(x.page)}</p>${colorSummary(x)}</div><button type="button" class="remove-selection" data-code="${esc(x.code)}">Remove</button></div>`).join('');groups.appendChild(sec)});$$('.remove-selection',groups).forEach(b=>b.onclick=()=>{const d=read();delete d[b.dataset.code];write(d);render()});applyPreview(data);}
    const detailIds=['client-project-name','client-name','client-business','client-email','client-phone','client-notes'];let details={};try{details=JSON.parse(localStorage.getItem(DETAILS)||'{}')}catch(e){}detailIds.forEach(id=>{const el=$('#'+id);if(!el)return;el.value=details[id]||'';el.addEventListener('input',()=>{details[id]=el.value;localStorage.setItem(DETAILS,JSON.stringify(details))})});
    const guidedProject=()=>{try{return JSON.parse(localStorage.getItem('fs-guided-builder-v1')||'{}')}catch(e){return {}}};
    const renderGuidedProject=()=>{const g=guidedProject(),features=Array.isArray(g.features)?g.features:[];const box=$('#guided-project-summary');if(!box)return;box.hidden=!features.length&&!g.kit&&!g.flemingRecommended;$('#guided-feature-count').textContent=features.length;$('#guided-feature-list').innerHTML=features.length?features.map(x=>`<span>${esc(x)}</span>`).join(''):'<span>No optional features selected</span>';const advanced=features.filter(x=>/E-commerce|Portal|Booking|Payments/.test(x)).length;const rec=(Object.keys(read()).length>10||features.length>5||advanced)?'Elevate — Starting at $750':'Launch — Starting at $350';$('#guided-package-review').textContent=rec+(g.kit?` · Starter: ${g.kit}`:'')+(g.flemingRecommended?' · Fleming Recommended ✦':'');};
    renderGuidedProject();
    const summary=()=>{const data=Object.values(read()).sort((a,b)=>(a.category+a.code).localeCompare(b.category+b.code));const lines=['FLEMING SOLUTIONS — WEBSITE DESIGN SELECTIONS',''];if($('#client-name')?.value)lines.push(`Name: ${$('#client-name').value}`);if($('#client-business')?.value)lines.push(`Business: ${$('#client-business').value}`);if($('#client-email')?.value)lines.push(`Email: ${$('#client-email').value}`);if(lines.length>2)lines.push('');let last='';data.forEach(x=>{if(x.category!==last){lines.push(x.category.toUpperCase());last=x.category}{let cs='Using Website Colors';const c=x.colors||{};if(c.colorMode==='as-shown')cs='As Shown';else if(c.colorMode==='custom')cs=`Primary ${c.primaryBg}/${c.primaryText}; Secondary ${c.secondaryBg}/${c.secondaryText}`;lines.push(`- ${x.code} — ${x.name} | Appearance: ${cs}`)}});const g=guidedProject(),features=Array.isArray(g.features)?g.features:[];if(features.length){lines.push('','WEBSITE FEATURES');features.forEach(f=>lines.push(`- ${f}`));}if(g.kit)lines.push('','Starter Kit: '+g.kit);if(g.flemingRecommended)lines.push('Fleming Recommended: Yes');if($('#client-notes')?.value)lines.push('','Notes:', $('#client-notes').value);return lines.join('\n')};
    $('#copy-summary').onclick=async()=>{try{await navigator.clipboard.writeText(summary());alert('Selection summary copied to your clipboard.')}catch(e){prompt('Copy your selections:',summary())}};$('#print-summary').onclick=()=>window.print();$('#attach-contact')?.addEventListener('click',()=>{location.href='../index.html?attachSelections=1#contact'});$('#clear-selections').onclick=()=>{if(confirm('Clear all saved website selections?')){localStorage.removeItem(STORE);render()}};$('#email-selections').onclick=()=>{const subject=encodeURIComponent(`Website selections${$('#client-business')?.value?' — '+$('#client-business').value:''}`);const body=encodeURIComponent(summary());location.href=`mailto:charles.flemingiii@outlook.com?subject=${subject}&body=${body}`};
    function applyPreview(data){const p=$('#website-preview');if(!p)return;const palette=data.find(x=>x.code?.startsWith('CP-'));let colors=['#0E2A47','#1697E6','#EAF6FF','#FFFFFF'];if(palette){const source=document.querySelector(`[data-palette]`); // builder page has no source; use known map from code
      const map={"CP-01":["#0E2A47","#1697E6","#F6F9FC","#FFFFFF"],"CP-02":["#081A2B","#35B8FF","#7C3AED","#F8FAFC"],"CP-03":["#111111","#C9A227","#F5E7B2","#FFFFFF"],"CP-04":["#061A2D","#0066FF","#35B8FF","#EAF6FF"],"CP-05":["#0F2D28","#16A34A","#86EFAC","#F0FDF4"],"CP-06":["#342A24","#C26D3A","#F3E9DC","#FFFDF8"],"CP-07":["#3B2F2F","#D97745","#EAB676","#F7E8D0"],"CP-08":["#0B3B60","#0EA5A8","#DDF8F6","#FFFFFF"],"CP-09":["#102A43","#2F80ED","#B8D8FF","#F7FAFC"],"CP-10":["#2C1810","#A9442B","#D4A373","#FFF8EC"],"CP-11":["#18212B","#F59E0B","#FFD166","#F7F7F7"],"CP-12":["#172554","#6366F1","#C7D2FE","#F8FAFC"],"CP-13":["#4A2337","#E11D74","#FBCFE8","#FFF7FB"],"CP-14":["#243B2F","#53734B","#B7C9A8","#F5F7EF"],"CP-15":["#0F172A","#475569","#CBD5E1","#FFFFFF"],"CP-16":["#231942","#7C3AED","#C4B5FD","#FAF5FF"],"CP-17":["#082F49","#0284C7","#67E8F9","#ECFEFF"],"CP-18":["#431407","#EA580C","#FDBA74","#FFF7ED"],"CP-19":["#111827","#374151","#D1D5DB","#F9FAFB"],"CP-20":["#050816","#00E5FF","#B026FF","#E6FBFF"],"CP-21":["#29251F","#8B6F47","#D6C4A1","#F7F2E8"],"CP-22":["#3F1D2E","#FB7185","#FBCFE8","#FFF1F2"],"CP-23":["#0F3437","#0F766E","#B87333","#F0FDFA"],"CP-24":["#14213D","#2563EB","#F97316","#F8FAFC"]};colors=map[palette.code]||colors;}
      p.style.setProperty('--preview-dark',colors[0]);p.style.setProperty('--preview-accent',colors[1]);p.style.setProperty('--preview-soft',colors[2]);}
    render();
  }
})();


// ===== Global Website Design System controls =====
(()=>{
  if(!document.getElementById('global-color-grid'))return;
  const KEY='fs-design-system-v1';
  const defaults={primary:'#1697E6',secondary:'#0E2A47',accent:'#69BE28',background:'#FFFFFF',surface:'#F6F9FC',heading:'#0E2A47',body:'#334155',primaryText:'#FFFFFF',secondaryText:'#FFFFFF'};
  const read=()=>{try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){return {...defaults}}};
  const grid=document.getElementById('global-color-grid'), summary=document.getElementById('global-contrast-summary');
  const labels={primary:'Primary',secondary:'Secondary',accent:'Accent',background:'Background',surface:'Surface',heading:'Heading Text',body:'Body Text',primaryText:'Primary Button Text',secondaryText:'Secondary Button Text'};
  const lum=h=>{const s=h.replace('#','');const rgb=[0,2,4].map(i=>parseInt(s.slice(i,i+2),16)/255).map(c=>c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4));return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]};
  const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
  function render(){const d=read();grid.innerHTML=Object.entries(labels).map(([k,l])=>`<label>${l}<span><input type="color" data-k="${k}" value="${d[k]}"><input data-hex="${k}" value="${d[k]}" maxlength="7"></span></label>`).join('');
    const p=ratio(d.primary,d.primaryText),s=ratio(d.secondary,d.secondaryText),b=ratio(d.background,d.body);
    summary.innerHTML=`<b>Contrast check</b><span class="${p>=4.5?'good':'warn'}">${p>=4.5?'✓':'⚠'} Primary ${p.toFixed(1)}:1</span><span class="${s>=4.5?'good':'warn'}">${s>=4.5?'✓':'⚠'} Secondary ${s.toFixed(1)}:1</span><span class="${b>=4.5?'good':'warn'}">${b>=4.5?'✓':'⚠'} Body ${b.toFixed(1)}:1</span>`;
    grid.querySelectorAll('[data-k]').forEach(x=>x.oninput=()=>{const q=read();q[x.dataset.k]=x.value.toUpperCase();localStorage.setItem(KEY,JSON.stringify(q));render()});
    grid.querySelectorAll('[data-hex]').forEach(x=>x.onchange=()=>{if(/^#[0-9a-fA-F]{6}$/.test(x.value)){const q=read();q[x.dataset.hex]=x.value.toUpperCase();localStorage.setItem(KEY,JSON.stringify(q));render()}else render()});
  }render();
})();


// ===== Theme Summary on Design Brief =====
(()=>{
  const box=document.getElementById('theme-summary-list'); if(!box)return;
  let t={};try{t=JSON.parse(localStorage.getItem('fs-project-theme-v1')||'{}')}catch(e){}
  const items=[
    ['Header',t.header_style||'standard'],
    ['Sections',t.section_style||'clean'],
    ['Page',t.page_style||'full-width'],
    ['Footer',t.footer_style||'multi-column'],
    ['Surfaces',t.surface_style||'standard'],
    ['Spacing',t.spacing_style||'standard']
  ];
  box.innerHTML=items.map(([a,b])=>`<span>${a}: ${b}</span>`).join('');
})();

(()=>{
  const KEYS={selections:'fs-builder-selections',theme:'fs-project-theme-v1',design:'fs-design-system-v1',hh:'fs-header-hero-editor-v1',nav:'fs-navigation-editor-v1',buttons:'fs-button-overrides-v1',components:'fs-component-overrides-v1'};
  const PALETTES={
    'CP-01':['#0E2A47','#1697E6','#EAF6FF','#FFFFFF'],'CP-02':['#081A2B','#35B8FF','#7C3AED','#F8FAFC'],'CP-03':['#111111','#C9A227','#F5E7B2','#FFFFFF'],'CP-04':['#061A2D','#0066FF','#35B8FF','#EAF6FF'],'CP-05':['#0F2D28','#16A34A','#86EFAC','#F0FDF4'],'CP-06':['#342A24','#C26D3A','#F3E9DC','#FFFDF8'],'CP-07':['#3B2F2F','#D97745','#EAB676','#F7E8D0'],'CP-08':['#0B3B60','#0EA5A8','#DDF8F6','#FFFFFF'],'CP-09':['#102A43','#2F80ED','#B8D8FF','#F7FAFC'],'CP-10':['#2C1810','#A9442B','#D4A373','#FFF8EC'],'CP-11':['#18212B','#F59E0B','#FFD166','#F7F7F7'],'CP-12':['#172554','#6366F1','#C7D2FE','#F8FAFC'],'CP-13':['#4A2337','#E11D74','#FBCFE8','#FFF7FB'],'CP-14':['#243B2F','#53734B','#B7C9A8','#F5F7EF'],'CP-15':['#0F172A','#475569','#CBD5E1','#FFFFFF'],'CP-16':['#231942','#7C3AED','#C4B5FD','#FAF5FF'],'CP-17':['#082F49','#0284C7','#67E8F9','#ECFEFF'],'CP-18':['#431407','#EA580C','#FDBA74','#FFF7ED'],'CP-19':['#111827','#374151','#D1D5DB','#F9FAFB'],'CP-20':['#050816','#00E5FF','#B026FF','#E6FBFF'],'CP-21':['#29251F','#8B6F47','#D6C4A1','#F7F2E8'],'CP-22':['#3F1D2E','#FB7185','#FBCFE8','#FFF1F2'],'CP-23':['#0F3437','#0F766E','#B87333','#F0FDFA'],'CP-24':['#14213D','#2563EB','#F97316','#F8FAFC']
  };
  const FONT_MAP={
    'FT-01':'Inter,Arial,sans-serif','FT-02':'Georgia,serif','FT-03':'Didot,Georgia,serif','FT-04':'Impact,Arial Narrow,sans-serif','FT-05':'ui-monospace,SFMono-Regular,monospace','FT-06':'Inter,Arial,sans-serif','FT-07':'Arial Black,Inter,sans-serif','FT-08':'Inter,Arial,sans-serif','FT-09':'Georgia,serif','FT-10':'Inter,Arial,sans-serif','FT-11':'Arial Black,Inter,sans-serif','FT-12':'Inter,Arial,sans-serif','FT-13':'ui-monospace,monospace','FT-14':'Impact,Arial,sans-serif','FT-15':'Arial Black,Arial,sans-serif','FT-16':'Nunito,Inter,Arial,sans-serif','FT-17':'Georgia,serif','FT-18':'Arial Black,Inter,sans-serif','FT-19':'Inter,Arial,sans-serif','FT-20':'Inter,Arial,sans-serif','FT-21':'Inter,Arial,sans-serif','FT-22':'Inter,Arial,sans-serif','FT-23':'ui-monospace,monospace','FT-24':'Georgia,serif'
  };
  const read=(key,f={})=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(f))}catch(e){return f}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const state=()=>{
    const selections=read(KEYS.selections,{}), vals=Object.values(selections), theme=read(KEYS.theme,{}), design=read(KEYS.design,{}), hh=read(KEYS.hh,{}), navs=read(KEYS.nav,{}), buttonOverrides=read(KEYS.buttons,{}), componentOverrides=read(KEYS.components,{});
    // Single-choice preview categories should reflect the option the customer
    // selected most recently, not the first item ever stored for that prefix.
    // This lets the live preview change immediately even when older saved
    // alternatives remain in My Selections.
    const one=p=>vals
      .filter(x=>String(x.code||'').startsWith(p+'-'))
      .sort((a,b)=>Number(b.selectedAt||0)-Number(a.selectedAt||0))[0];
    const many=p=>vals
      .filter(x=>String(x.code||'').startsWith(p+'-'))
      .sort((a,b)=>Number(a.selectedAt||0)-Number(b.selectedAt||0));
    const cp=one('CP'), hd=one('HD'), hr=one('HR'), nv=one('NV'), ft=one('FT'), bt=one('BT'), cd=one('CD'), ga=one('GA'), input=one('IN'), fo=one('FO'), fr=one('FR'), tb=one('TB');
    const sc=many('SC'), fx=many('FX').concat(many('EF'));
    const palette=PALETTES[cp?.code]||['#0E2A47','#1697E6','#EAF6FF','#FFFFFF'];
    const h=(hd&&hh[hd.sourceCode||hd.code])||hd?.editorSettings||{};
    const hero=(hr&&hh[hr.sourceCode||hr.code?.replace(/^HR-/,'HD-')])||hr?.editorSettings||{};
    const n=(nv&&navs[nv.code])||nv?.editorSettings||{};
    const chosenColors=(item)=>{
      const c=item?.colors||{}; if(c.colorMode==='custom')return {primary:c.primaryBg,primaryText:c.primaryText,secondary:c.secondaryBg,secondaryText:c.secondaryText};
      if(c.colorMode==='as-shown')return {};
      return {primary:design.primary,primaryText:design.primaryText,secondary:design.secondary,secondaryText:design.secondaryText};
    };
    const bc=chosenColors(bt), hc=chosenColors(hd);
    const hasPalette=!!cp;
    const colors={
      // Step 01 Color Theme is the baseline for the assembled website. Specific
      // component editor overrides (header/button custom colors) remain stronger.
      dark:h.headerBg||hc.secondary||(hasPalette?palette[0]:(theme.header_background||design.secondary||palette[0])),
      primary:h.ctaBg||bc.primary||(hasPalette?palette[1]:(design.primary||palette[1])),
      soft:hasPalette?palette[2]:(theme.section_background_secondary||design.surface||palette[2]),
      background:hasPalette?palette[3]:(theme.section_background_primary||design.background||palette[3]),
      heading:hasPalette?palette[0]:(theme.body_heading_color||design.heading||palette[0]),
      body:hasPalette?palette[0]:(theme.section_text_color||design.body||'#334155'),
      headerText:h.headerText||(hasPalette?(parseInt(palette[0].slice(1,3),16)*299+parseInt(palette[0].slice(3,5),16)*587+parseInt(palette[0].slice(5,7),16)*114)/1000>=150?'#0F172A':'#FFFFFF':(theme.header_text_color||'#fff')),
      footer:hasPalette?palette[0]:(theme.footer_background||design.secondary||palette[0]),
      footerText:hasPalette?((parseInt(palette[0].slice(1,3),16)*299+parseInt(palette[0].slice(3,5),16)*587+parseInt(palette[0].slice(5,7),16)*114)/1000>=150?'#0F172A':'#FFFFFF'):(theme.footer_text_color||'#fff'),
      border:hasPalette?palette[2]:(theme.surface_border_color||'#dfe8f1'),
      surface:hasPalette?palette[3]:(theme.surface_background||palette[3])
    };
    return {selections,vals,theme,design,hh,navs,buttonOverrides,componentOverrides,cp,hd,hr,nv,ft,bt,cd,ga,input,fo,fr,tb,sc,fx,h,hero,n,colors,font:FONT_MAP[ft?.code]||'Inter,Arial,sans-serif'};
  };
  const menuItems=s=>String(s.n.menu||s.h.menu||'Home\nAbout\nServices\nContact').split(/\n+/).map(x=>x.trim()).filter(Boolean).slice(0,6);
  const BUTTON_SPECS={"BT-01":{"classes":[],"style":""},"BT-02":{"classes":["outline"],"style":""},"BT-03":{"classes":["pill"],"style":""},"BT-04":{"classes":["ghost"],"style":""},"BT-05":{"classes":["liquid"],"style":""},"BT-06":{"classes":["neon"],"style":""},"BT-07":{"classes":["gradient"],"style":""},"BT-08":{"classes":["metal"],"style":""},"BT-09":{"classes":["gold"],"style":""},"BT-10":{"classes":["soft"],"style":""},"BT-11":{"classes":["brutal"],"style":""},"BT-12":{"classes":["clay"],"style":""},"BT-13":{"classes":["holo"],"style":""},"BT-14":{"classes":[],"style":"background:#0b1724;box-shadow:0 12px 26px rgba(0,0,0,.25)"},"BT-15":{"classes":[],"style":"background:#22c55e"},"BT-16":{"classes":[],"style":"background:#ef4444"},"BT-17":{"classes":[],"style":"background:#f59e0b;color:#392400"},"BT-18":{"classes":[],"style":""},"BT-19":{"classes":[],"style":"width:52px;height:52px;border-radius:50%;padding:0"},"BT-20":{"classes":[],"style":"width:52px;height:52px;padding:0"},"BT-21":{"classes":[],"style":"border:0;background:none;color:#087bc1;font-weight:900"},"BT-22":{"classes":[],"style":"border:0;background:none;border-bottom:2px solid #1697e6;color:#0e2a47;font-weight:900;padding:8px 0"},"BT-23":{"classes":[],"style":"border-radius:10px 0 0 10px"},"BT-24":{"classes":["outline"],"style":""},"BT-25":{"classes":[],"style":"width:58px;height:58px;border-radius:50%;padding:0;box-shadow:0 16px 30px #1697e655"},"BT-26":{"classes":["pill"],"style":"box-shadow:0 16px 30px #1697e655"},"BT-27":{"classes":[],"style":"box-shadow:0 10px 0 #075f98"},"BT-28":{"classes":[],"style":"background:#e8eef4;color:#31506d;box-shadow:inset 4px 4px 9px #cad5df,inset -4px -4px 9px #fff"},"BT-29":{"classes":[],"style":"background:white;color:#243044"},"BT-30":{"classes":["ghost"],"style":"border:1px solid #35b8ff;color:#087bc1"},"BT-31":{"classes":["neon"],"style":"clip-path:polygon(8% 0,100% 0,92% 100%,0 100%)"},"BT-32":{"classes":[],"style":"clip-path:polygon(10px 0,100% 0,calc(100% - 10px) 100%,0 100%)"},"BT-33":{"classes":[],"style":"border-radius:2px;box-shadow:-8px 8px 0 #dbeafe"},"BT-34":{"classes":[],"style":"background:#fff;color:#111;border:2px solid #111;border-radius:0"},"BT-35":{"classes":[],"style":"background:none;border:0;font:700 1rem Georgia;color:#172b3f;border-bottom:1px solid #172b3f;padding:8px"},"BT-36":{"classes":[],"style":"background:#ff5f56;color:#1a0b2e;border:3px solid #1a0b2e;box-shadow:5px 5px 0 #57e6d9;border-radius:4px"},"BT-37":{"classes":[],"style":"background:#fbcfe8;color:#831843"},"BT-38":{"classes":[],"style":"background:#53734b;border-radius:52% 48% 45% 55%/55% 48% 52% 45%"},"BT-39":{"classes":["ghost"],"style":"background:#0b1724cc;color:#fff;border-color:#ffffff40"},"BT-40":{"classes":["ghost"],"style":"background:linear-gradient(135deg,#1697e655,#7c3aed55);color:#14314c;border-color:#fff"},"BT-41":{"classes":[],"style":"background:linear-gradient(110deg,#087bc1 30%,#61d4ff 45%,#087bc1 60%);background-size:220% 100%"},"BT-42":{"classes":["outline"],"style":"box-shadow:0 0 18px #1697e655"},"BT-43":{"classes":[],"style":"border:0;background:none;font-weight:900;color:#0e2a47"},"BT-44":{"classes":["outline"],"style":""},"BT-45":{"classes":[],"style":""},"BT-46":{"classes":[],"style":"background:#111"},"BT-47":{"classes":[],"style":"background:#22c55e"},"BT-48":{"classes":["outline"],"style":""},"BT-49":{"classes":[],"style":"border-radius:50%;width:58px;height:58px;padding:0"},"BT-50":{"classes":[],"style":"background:#ff6b35"},"BT-54":{"classes":[],"style":"border:0;background:#fff;padding:10px"},"BT-55":{"classes":["outline"],"style":""},"BT-56":{"classes":[],"style":"background:#cbd5e1;color:#64748b"},"BT-57":{"classes":[],"style":"background:#7c3aed"},"BT-58":{"classes":["outline"],"style":""},"BT-59":{"classes":["outline"],"style":""},"BT-60":{"classes":["gradient","pill"],"style":""}};
  const buttonCode=(s,slot)=>s.buttonOverrides?.[slot]?.code||s.bt?.code;
  const buttonAttrs=(code,baseClass='',slot='')=>{
    const item=BUTTON_SPECS[String(code||'')]||{classes:[],style:''};
    const classes=['demo-btn',baseClass,...(item.classes||[])].filter(Boolean).join(' ');
    const style=item.style?` style="${esc(item.style)}"`:'';
    const target=slot?` data-button-slot="${esc(slot)}"`:'';
    return `class="${classes}"${target}${style}`;
  };
  const headerClass=code=>`pv-header-${String(code||'HD-01').split('-')[1]||'01'}`;
  const navClass=code=>`pv-nav-${String(code||'NV-01').split('-')[1]||'01'}`;
  const cardClass=code=>`pv-card-${String(code||'CD-01').split('-')[1]||'01'}`;
  const componentItem=(s,slot,fallback)=>s.componentOverrides?.[slot]||fallback||null;
  const componentCode=(s,slot,fallback)=>componentItem(s,slot,fallback)?.code||fallback?.code||'';
  const editAttrs=(slot,page,label)=>` data-component-slot="${esc(slot)}" data-edit-page="${esc(page)}" data-edit-label="${esc(label)}"`;
  const suffix=(code,prefix)=>String(code||prefix+'-01').replace(prefix+'-','')||'01';
  const heroText=s=>({headline:s.hero.headline||s.h.headline||'Build Your Dream Website',description:s.hero.description||s.h.description||'Create a stunning website that brings your selected design system together.',cta:s.hero.heroPrimary||s.h.ctaText||'Get Started'});
  function sectionsHtml(s,compact){
    const chosen=s.sc.length?s.sc.slice(0,compact?1:4):[];
    const cardFallback=s.cd;
    const cards=cardFallback?`<div class="pv-cards"><article class="${cardClass(componentCode(s,'card-1',cardFallback))}"${editAttrs('card-1','cards.html','Service Card 1')}><span>01</span><b>${esc(componentItem(s,'card-1',cardFallback)?.name||'Professional Design')}</b><p>Clear, polished content styled with your selected card design.</p></article><article class="${cardClass(componentCode(s,'card-2',cardFallback))}"${editAttrs('card-2','cards.html','Service Card 2')}><span>02</span><b>${esc(componentItem(s,'card-2',cardFallback)?.name||'Development')}</b><p>Responsive experiences built for desktop, tablet and mobile.</p></article><article class="${cardClass(componentCode(s,'card-3',cardFallback))}"${editAttrs('card-3','cards.html','Service Card 3')}><span>03</span><b>${esc(componentItem(s,'card-3',cardFallback)?.name||'Support')}</b><p>A strong structure that makes the next step easy to understand.</p></article></div>`:'';
    let out='';
    if(chosen.length){chosen.forEach((x,i)=>{const slot=`section-${i+1}`, item=componentItem(s,slot,x), code=item?.code||x.code;out+=`<section class="pv-section pv-section-${suffix(code,'SC')} ${i%2?'pv-alt':''}"${editAttrs(slot,'sections.html',`Website Section ${i+1}`)}><small>${esc(code)}</small><h2>${esc(item?.name||x.name||'Website Section')}</h2>${cards||'<p class="pv-section-copy">Your selected section layout appears here in the live website assembly.</p>'}</section>`})}
    else if(s.cd){const fallback={code:'SC-01',name:'Services Section'};const item=componentItem(s,'section-1',fallback);out+=`<section class="pv-section pv-section-${suffix(item?.code,'SC')}"${editAttrs('section-1','sections.html','Services Section')}><small>${esc(item?.code||'SC-01')}</small><h2>${esc(item?.name||'Our Services')}</h2>${cards}</section>`}
    if(s.ga&&!compact){const gi=componentItem(s,'gallery-main',s.ga), frame=componentItem(s,'gallery-frame',s.fr);out+=`<section class="pv-section pv-alt"${editAttrs('gallery-section','sections.html','Gallery Section')}><small>${esc(gi?.code||s.ga.code)}</small><h2>${esc(gi?.name||s.ga.name||'Gallery')}</h2><div class="pv-gallery pv-gallery-${suffix(gi?.code,'GA')} pv-frame-${suffix(frame?.code,'FR')}"${editAttrs('gallery-main','galleries.html','Main Gallery')}><i></i><i></i><i></i><i></i></div></section>`}
    if(s.tb&&!compact){const ti=componentItem(s,'table-main',s.tb);out+=`<section class="pv-section"${editAttrs('table-section','sections.html','Table Section')}><small>${esc(ti?.code||s.tb.code)}</small><h2>${esc(ti?.name||s.tb.name||'Comparison Table')}</h2><div class="pv-table-wrap pv-table-${suffix(ti?.code,'TB')}"${editAttrs('table-main','tables.html','Main Table')}><table><thead><tr><th>Plan</th><th>Features</th><th>Price</th></tr></thead><tbody><tr><td>Starter</td><td>Core website</td><td>$</td></tr><tr><td>Growth</td><td>Expanded website</td><td>$$</td></tr><tr><td>Pro</td><td>Advanced website</td><td>$$$</td></tr></tbody></table></div></section>`}
    if(s.input&&!compact){const in1=componentItem(s,'input-name',s.input),in2=componentItem(s,'input-email',s.input),in3=componentItem(s,'input-message',s.input);out+=`<section class="pv-section"><small>${esc(s.input.code)}</small><h2>Contact Us</h2><div class="pv-form"><input class="pv-input-${suffix(in1?.code,'IN')}"${editAttrs('input-name','inputs.html','Name Field')} placeholder="Name"><input class="pv-input-${suffix(in2?.code,'IN')}"${editAttrs('input-email','inputs.html','Email Field')} placeholder="Email"><textarea class="pv-input-${suffix(in3?.code,'IN')}"${editAttrs('input-message','inputs.html','Message Field')} placeholder="Tell us about your project"></textarea><button ${buttonAttrs(buttonCode(s,'form-submit'),'pv-form-button','form-submit')}>Send Message</button></div></section>`}
    return out;
  }
  function build(s,compact=false){
    const t=heroText(s), menu=menuItems(s), showNav=!!s.nv||!!s.h.menu||compact, showFooter=!!s.fo||compact, sideNav=s.nv?.code==='NV-04';
    const links=menu.map((x,i)=>`<a class="${i===0?'active':''}">${sideNav?`<i>${['⌂','◇','▣','○','✉'][i]||'•'}</i>`:''}<span>${esc(x)}</span></a>`).join('');
    const nav=showNav?`<nav class="pv-nav ${navClass(s.nv?.code)}">${links}</nav>`:'';
    const header=`<header class="pv-header ${headerClass(s.hd?.code)}"><b class="pv-brand">${esc(s.h.logoText||'YourBrand')}</b><button class="pv-menu" aria-label="Menu">☰</button>${sideNav?'':nav}<button ${buttonAttrs(buttonCode(s,'header-cta'),'pv-cta','header-cta')}>${esc(t.cta)}</button></header>`;
    const side=sideNav?`<aside class="pv-side-nav"><b class="pv-side-brand">${esc(s.h.logoText||'YourBrand')}</b>${nav}<button ${buttonAttrs(buttonCode(s,'side-cta'),'pv-side-cta','side-cta')}>${esc(t.cta)}</button><small>☰ Menu collapses on mobile</small></aside>`:'';
    const hero=`<section class="pv-hero pv-hero-${String(s.hr?.code||'HR-01').split('-')[1]||'01'}"><div class="pv-hero-copy"><small>${esc(s.hero.eyebrow||s.h.eyebrow||'YOUR WEBSITE')}</small><h1>${esc(t.headline)}</h1><p>${esc(t.description)}</p><div class="pv-hero-actions"><button ${buttonAttrs(buttonCode(s,'hero-primary'),'pv-primary','hero-primary')}>${esc(t.cta)}</button>${compact?'':`<button ${buttonAttrs(buttonCode(s,'hero-secondary'),'pv-secondary','hero-secondary')}>Learn More</button>`}</div></div><div class="pv-hero-art pv-frame-${suffix(componentCode(s,'hero-frame',s.fr),'FR')}"${editAttrs('hero-frame','frames.html','Hero Media Frame')}><i></i><i></i><i></i></div></section>`;
    const footer=showFooter?`<footer class="pv-footer"><b>${esc(s.h.logoText||'YourBrand')}</b><span>${menu.slice(0,4).map(esc).join(' · ')}</span>${s.fo?`<small>${esc(s.fo.code)} · ${esc(s.fo.name||'Footer')}</small>`:''}</footer>`:'';
    const cls=['pv-live-site',compact?'pv-compact':'pv-full',sideNav?'pv-side-layout':'',s.fx.length?'pv-has-effect':'',`pv-font-${String(s.ft?.code||'').replace(/[^a-z0-9]/gi,'').toLowerCase()}`].filter(Boolean).join(' ');
    const content=`<div class="pv-site-content">${sideNav?header:''}${hero}${sectionsHtml(s,compact)}${footer}</div>`;
    return `<div class="${cls}" style="--pv-dark:${s.colors.dark};--pv-primary:${s.colors.primary};--pv-soft:${s.colors.soft};--pv-bg:${s.colors.background};--pv-heading:${s.colors.heading};--pv-body:${s.colors.body};--pv-header-text:${s.colors.headerText};--pv-footer:${s.colors.footer};--pv-footer-text:${s.colors.footerText};--pv-border:${s.colors.border};--pv-surface:${s.colors.surface};--pv-font:${s.font};--pv-radius:${Number(s.theme.surface_border_radius||16)}px;--pv-section-space:${Number(s.theme.section_spacing||72)}px">${sideNav?side+content:header+hero+sectionsHtml(s,compact)+footer}</div>`;
  }
  function render(el,opts={}){if(!el)return; const s=state(); el.innerHTML=build(s,!!opts.compact); el.dataset.previewSignature=signature(); return s;}
  function signature(){return [KEYS.selections,KEYS.theme,KEYS.design,KEYS.hh,KEYS.nav,KEYS.buttons].map(k=>localStorage.getItem(k)||'').join('|')}
  function watch(el,opts={}){if(!el)return()=>{};let sig='';const tick=()=>{const next=signature();if(next!==sig){sig=next;render(el,opts);opts.onRender?.(state())}};tick();const id=setInterval(tick,350);window.addEventListener('fs-selection-change',tick);window.addEventListener('storage',tick);return()=>clearInterval(id)}
  window.FSPreview={state,build,render,watch,signature};
})();

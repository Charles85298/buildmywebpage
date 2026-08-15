(()=>{
  const KEYS={selections:'fs-builder-selections',theme:'fs-project-theme-v1',design:'fs-design-system-v1',hh:'fs-header-hero-editor-v1',nav:'fs-navigation-editor-v1'};
  const PALETTES={
    'CP-01':['#0E2A47','#1697E6','#EAF6FF','#FFFFFF'],'CP-02':['#081A2B','#35B8FF','#7C3AED','#F8FAFC'],'CP-03':['#111111','#C9A227','#F5E7B2','#FFFFFF'],'CP-04':['#061A2D','#0066FF','#35B8FF','#EAF6FF'],'CP-05':['#0F2D28','#16A34A','#86EFAC','#F0FDF4'],'CP-06':['#342A24','#C26D3A','#F3E9DC','#FFFDF8'],'CP-07':['#3B2F2F','#D97745','#EAB676','#F7E8D0'],'CP-08':['#0B3B60','#0EA5A8','#DDF8F6','#FFFFFF'],'CP-09':['#102A43','#2F80ED','#B8D8FF','#F7FAFC'],'CP-10':['#2C1810','#A9442B','#D4A373','#FFF8EC'],'CP-11':['#18212B','#F59E0B','#FFD166','#F7F7F7'],'CP-12':['#172554','#6366F1','#C7D2FE','#F8FAFC'],'CP-13':['#4A2337','#E11D74','#FBCFE8','#FFF7FB'],'CP-14':['#243B2F','#53734B','#B7C9A8','#F5F7EF'],'CP-15':['#0F172A','#475569','#CBD5E1','#FFFFFF'],'CP-16':['#231942','#7C3AED','#C4B5FD','#FAF5FF'],'CP-17':['#082F49','#0284C7','#67E8F9','#ECFEFF'],'CP-18':['#431407','#EA580C','#FDBA74','#FFF7ED'],'CP-19':['#111827','#374151','#D1D5DB','#F9FAFB'],'CP-20':['#050816','#00E5FF','#B026FF','#E6FBFF'],'CP-21':['#29251F','#8B6F47','#D6C4A1','#F7F2E8'],'CP-22':['#3F1D2E','#FB7185','#FBCFE8','#FFF1F2'],'CP-23':['#0F3437','#0F766E','#B87333','#F0FDFA'],'CP-24':['#14213D','#2563EB','#F97316','#F8FAFC']
  };
  const FONT_MAP={
    'FT-01':'Inter,Arial,sans-serif','FT-02':'Georgia,serif','FT-03':'Didot,Georgia,serif','FT-04':'Impact,Arial Narrow,sans-serif','FT-05':'ui-monospace,SFMono-Regular,monospace','FT-06':'Inter,Arial,sans-serif','FT-07':'Arial Black,Inter,sans-serif','FT-08':'Inter,Arial,sans-serif','FT-09':'Georgia,serif','FT-10':'Inter,Arial,sans-serif','FT-11':'Arial Black,Inter,sans-serif','FT-12':'Inter,Arial,sans-serif','FT-13':'ui-monospace,monospace','FT-14':'Impact,Arial,sans-serif','FT-15':'Arial Black,Arial,sans-serif','FT-16':'Nunito,Inter,Arial,sans-serif','FT-17':'Georgia,serif','FT-18':'Arial Black,Inter,sans-serif','FT-19':'Inter,Arial,sans-serif','FT-20':'Inter,Arial,sans-serif','FT-21':'Inter,Arial,sans-serif','FT-22':'Inter,Arial,sans-serif','FT-23':'ui-monospace,monospace','FT-24':'Georgia,serif'
  };
  const read=(key,f={})=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(f))}catch(e){return f}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const state=()=>{
    const selections=read(KEYS.selections,{}), vals=Object.values(selections), theme=read(KEYS.theme,{}), design=read(KEYS.design,{}), hh=read(KEYS.hh,{}), navs=read(KEYS.nav,{});
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
    const cp=one('CP'), hd=one('HD'), hr=one('HR'), nv=one('NV'), ft=one('FT'), bt=one('BT'), cd=one('CD'), ga=one('GA'), input=one('IN'), fo=one('FO');
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
    return {selections,vals,theme,design,hh,navs,cp,hd,hr,nv,ft,bt,cd,ga,input,fo,sc,fx,h,hero,n,colors,font:FONT_MAP[ft?.code]||'Inter,Arial,sans-serif'};
  };
  const menuItems=s=>String(s.n.menu||s.h.menu||'Home\nAbout\nServices\nContact').split(/\n+/).map(x=>x.trim()).filter(Boolean).slice(0,6);
  const buttonClass=code=>{
    const n=Number(String(code||'').split('-')[1]||1); if([3,26,37,48,55].includes(n))return 'pv-pill'; if([4,5,30,42].includes(n))return 'pv-glass'; if([6,13,31,43].includes(n))return 'pv-glow'; if([8,9,40,50].includes(n))return 'pv-luxury'; if([11,15,16,17,38].includes(n))return 'pv-square'; if([27,28,41,51].includes(n))return 'pv-3d'; return '';
  };
  const headerClass=code=>`pv-header-${String(code||'HD-01').split('-')[1]||'01'}`;
  const navClass=code=>`pv-nav-${String(code||'NV-01').split('-')[1]||'01'}`;
  const cardClass=code=>`pv-card-${String(code||'CD-01').split('-')[1]||'01'}`;
  const heroText=s=>({headline:s.hero.headline||s.h.headline||'Build Your Dream Website',description:s.hero.description||s.h.description||'Create a stunning website that brings your selected design system together.',cta:s.hero.heroPrimary||s.h.ctaText||'Get Started'});
  function sectionsHtml(s,compact){
    const chosen=s.sc.length?s.sc.slice(0,compact?1:4):[];
    const cards=s.cd?`<div class="pv-cards ${cardClass(s.cd.code)}"><article><span>01</span><b>${esc(s.cd.name||'Professional Design')}</b><p>Clear, polished content styled with your selected card design.</p></article><article><span>02</span><b>Development</b><p>Responsive experiences built for desktop, tablet and mobile.</p></article><article><span>03</span><b>Support</b><p>A strong structure that makes the next step easy to understand.</p></article></div>`:'';
    let out='';
    if(chosen.length){chosen.forEach((x,i)=>{out+=`<section class="pv-section ${i%2?'pv-alt':''}"><small>${esc(x.code)}</small><h2>${esc(x.name||'Website Section')}</h2>${cards||'<p class="pv-section-copy">Your selected section layout appears here in the live website assembly.</p>'}</section>`})}
    else if(s.cd){out+=`<section class="pv-section"><small>${esc(s.cd.code)}</small><h2>Our Services</h2>${cards}</section>`}
    if(s.ga&&!compact)out+=`<section class="pv-section pv-alt"><small>${esc(s.ga.code)}</small><h2>${esc(s.ga.name||'Gallery')}</h2><div class="pv-gallery"><i></i><i></i><i></i><i></i></div></section>`;
    if(s.input&&!compact)out+=`<section class="pv-section"><small>${esc(s.input.code)}</small><h2>Contact Us</h2><div class="pv-form"><input placeholder="Name"><input placeholder="Email"><textarea placeholder="Tell us about your project"></textarea><button class="${buttonClass(s.bt?.code)}">Send Message</button></div></section>`;
    return out;
  }
  function build(s,compact=false){
    const t=heroText(s), menu=menuItems(s), showNav=!!s.nv||!!s.h.menu||compact, showFooter=!!s.fo||compact;
    const nav=showNav?`<nav class="pv-nav ${navClass(s.nv?.code)}">${menu.map(x=>`<a>${esc(x)}</a>`).join('')}</nav>`:'';
    const header=`<header class="pv-header ${headerClass(s.hd?.code)}"><b class="pv-brand">${esc(s.h.logoText||'YourBrand')}</b><button class="pv-menu" aria-label="Menu">☰</button>${nav}<button class="pv-cta ${buttonClass(s.bt?.code)}">${esc(t.cta)}</button></header>`;
    const hero=`<section class="pv-hero pv-hero-${String(s.hr?.code||'HR-01').split('-')[1]||'01'}"><div class="pv-hero-copy"><small>${esc(s.hero.eyebrow||s.h.eyebrow||'YOUR WEBSITE')}</small><h1>${esc(t.headline)}</h1><p>${esc(t.description)}</p><div class="pv-hero-actions"><button class="pv-primary ${buttonClass(s.bt?.code)}">${esc(t.cta)}</button>${compact?'':`<button class="pv-secondary ${buttonClass(s.bt?.code)}">Learn More</button>`}</div></div><div class="pv-hero-art"><i></i><i></i><i></i></div></section>`;
    const footer=showFooter?`<footer class="pv-footer"><b>${esc(s.h.logoText||'YourBrand')}</b><span>${menu.slice(0,4).map(esc).join(' · ')}</span>${s.fo?`<small>${esc(s.fo.code)} · ${esc(s.fo.name||'Footer')}</small>`:''}</footer>`:'';
    const cls=['pv-live-site',compact?'pv-compact':'pv-full',s.fx.length?'pv-has-effect':'',`pv-font-${String(s.ft?.code||'').replace(/[^a-z0-9]/gi,'').toLowerCase()}`].filter(Boolean).join(' ');
    return `<div class="${cls}" style="--pv-dark:${s.colors.dark};--pv-primary:${s.colors.primary};--pv-soft:${s.colors.soft};--pv-bg:${s.colors.background};--pv-heading:${s.colors.heading};--pv-body:${s.colors.body};--pv-header-text:${s.colors.headerText};--pv-footer:${s.colors.footer};--pv-footer-text:${s.colors.footerText};--pv-border:${s.colors.border};--pv-surface:${s.colors.surface};--pv-font:${s.font};--pv-radius:${Number(s.theme.surface_border_radius||16)}px;--pv-section-space:${Number(s.theme.section_spacing||72)}px">${header}${hero}${sectionsHtml(s,compact)}${footer}</div>`;
  }
  function render(el,opts={}){if(!el)return; const s=state(); el.innerHTML=build(s,!!opts.compact); el.dataset.previewSignature=signature(); return s;}
  function signature(){return [KEYS.selections,KEYS.theme,KEYS.design,KEYS.hh,KEYS.nav].map(k=>localStorage.getItem(k)||'').join('|')}
  function watch(el,opts={}){if(!el)return()=>{};let sig='';const tick=()=>{const next=signature();if(next!==sig){sig=next;render(el,opts);opts.onRender?.(state())}};tick();const id=setInterval(tick,350);window.addEventListener('fs-selection-change',tick);window.addEventListener('storage',tick);return()=>clearInterval(id)}
  window.FSPreview={state,build,render,watch,signature};
})();

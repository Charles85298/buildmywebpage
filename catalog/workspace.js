(()=>{
  const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const steps=[
    ['01','Color Theme','colors.html','CP'],
    ['02','Header','headers.html','HD'],
    ['03','Hero','headers.html?focus=hero','HD'],
    ['04','Navigation','navigation.html','NV'],
    ['05','Typography','fonts.html','FT'],
    ['06','Sections & Layouts','sections.html','SC'],
    ['07','Cards','cards.html','CD'],
    ['08','Images & Galleries','galleries.html','GA'],
    ['09','Forms & Inputs','inputs.html','IN'],
    ['10','Buttons & CTAs','buttons.html','BT'],
    ['11','Footer','footers.html','FO'],
    ['12','Effects & Animation','effects.html','EF']
  ];
  const STORE='fs-builder-selections';
  const read=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch(e){return {}}};
  const selectionValues=()=>Object.values(read());
  const activeFor=(href)=>{
    const target=href.split('?')[0];
    if(file!==target)return false;
    if(target==='headers.html'){
      const hero=new URLSearchParams(location.search).get('focus')==='hero';
      return href.includes('focus=hero')?hero:!hero;
    }
    return true;
  };
  function done(prefix,label){
    const vals=selectionValues();
    if(prefix==='SC') return vals.some(v=>/section/i.test(String(v.category||''))||String(v.code||'').startsWith('SC-'));
    if(prefix==='EF') return vals.some(v=>String(v.code||'').startsWith('EF-')||String(v.code||'').startsWith('FX-'));
    return vals.some(v=>String(v.code||'').startsWith(prefix+'-'));
  }
  function sidebar(){
    const aside=document.createElement('aside');aside.className='builder-sidebar';aside.id='builder-sidebar';
    aside.innerHTML=`<a class="workspace-brand" href="index.html"><span class="workspace-logo">B</span><span><b>BuildMyWebPage</b><small>Build it. Preview it. Launch it.</small></span></a>
      <div class="workspace-label">BUILD YOUR WEBSITE</div>
      <nav class="builder-steps">${steps.map(([n,label,href,prefix])=>`<a href="${href}" class="builder-step ${activeFor(href)?'active':''}" data-prefix="${prefix}"><i>${n}</i><span>${label}</span><b class="step-state">${done(prefix,label)?'✓':''}</b></a>`).join('')}</nav>
      <div class="sidebar-divider compact"></div><div class="workspace-label">MORE COMPONENTS</div><nav class="project-tools secondary-tools"><a href="frames.html"><span>▣</span> Frames & Borders</a><a href="tables.html"><span>▦</span> Tables</a><a href="labels.html"><span>◆</span> Labels & Badges</a><a href="alerts.html"><span>!</span> Alerts & Feedback</a></nav>
      <div class="sidebar-divider"></div><div class="workspace-label">YOUR PROJECT</div>
      <nav class="project-tools"><a href="builder.html" class="${file==='builder.html'?'active':''}"><span>⌑</span> Save Design</a><a href="builder.html" class="${file==='builder.html'?'active':''}"><span>▤</span> My Selections <b id="workspace-selection-count">${selectionValues().length}</b></a><a href="website-preview.html" class="${file==='website-preview.html'?'active':''}"><span>◉</span> Website Preview</a></nav>
      <a class="sidebar-help" href="../index.html#contact"><b>Need Help?</b><small>Questions about a design choice?</small><span>Contact Us →</span></a>`;
    return aside;
  }
  function rail(){
    if(['website-preview.html','builder.html'].includes(file))return null;
    const a=document.createElement('aside');a.className='workspace-rail';a.innerHTML=`<div class="rail-head"><div><small>LIVE PROJECT</small><h3>Your Website Preview</h3></div><a href="website-preview.html">Open ↗</a><button class="workspace-rail-close" type="button" aria-label="Close website preview">×</button></div>
      <div class="mini-site" id="workspace-mini-preview" aria-label="Live website preview"></div>
      <div class="rail-selections"><div class="rail-selection-head"><b>Your Selections</b><a href="builder.html">View All</a></div><div id="rail-selection-list"></div></div>
      <a class="full-preview-button" href="website-preview.html">◉ View Full Website Preview</a>`;
    return a;
  }
  function renderRail(){
    const vals=selectionValues();
    const list=document.getElementById('rail-selection-list');
    if(list){
      const rows=steps.map(([n,label,href,prefix])=>{
        let x=vals.find(v=>String(v.code||'').startsWith(prefix+'-'));
        if(prefix==='SC')x=vals.find(v=>/section/i.test(String(v.category||''))||String(v.code||'').startsWith('SC-'));
        if(prefix==='EF')x=vals.find(v=>/effect/i.test(String(v.category||''))||/^E[FX]-/.test(String(v.code||'')));
        return `<a href="${href}" class="rail-row ${x?'done':''}"><span>${x?'✓':'○'} ${label}</span><em>${x?(x.code||'Selected'):'Choose'}</em></a>`;
      }).join('');
      list.innerHTML=rows;
    }
    const c=document.getElementById('workspace-selection-count');if(c)c.textContent=vals.length;

    // The rail and full preview now use the same live renderer.
    const site=document.getElementById('workspace-mini-preview');
    if(site && window.FSPreview){ window.FSPreview.render(site,{compact:false}); fitMiniPreview(site); }
  }

  function fitMiniPreview(site){
    if(!site)return;
    const page=site.querySelector('.pv-live-site');
    if(!page)return;
    const BASE_WIDTH=1200;
    // Treat the rail preview like a browser viewport rather than the full page.
    // A 16:10 viewport keeps the preview useful without creating a tall blank panel.
    const VIEWPORT_RATIO=10/16;
    const available=Math.max(1,site.clientWidth);
    const scale=available/BASE_WIDTH;
    page.style.width=BASE_WIDTH+'px';
    page.style.minWidth=BASE_WIDTH+'px';
    page.style.height='auto';
    page.style.minHeight='0';
    page.style.transformOrigin='top left';
    page.style.transform=`scale(${scale})`;
    page.style.pointerEvents='none';
    const viewportHeight=Math.round(available*VIEWPORT_RATIO);
    site.style.height=viewportHeight+'px';
    site.style.minHeight='0';
    site.style.maxHeight=viewportHeight+'px';
    site.style.overflow='hidden';
  }

  function install(){
    if(document.querySelector('.builder-sidebar'))return;
    document.body.classList.add('catalog-workspace');
    if(file==='index.html')document.body.classList.add('builder-home');
    document.body.prepend(sidebar());
    const r=rail();if(r)document.body.appendChild(r);
    const toggle=document.createElement('button');toggle.className='workspace-menu-toggle';toggle.type='button';toggle.setAttribute('aria-label','Open catalog navigation');toggle.setAttribute('aria-expanded','false');toggle.innerHTML='☰';document.body.appendChild(toggle);
    toggle.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();const open=!document.body.classList.contains('workspace-menu-open');document.body.classList.toggle('workspace-menu-open',open);document.body.classList.remove('workspace-preview-open');toggle.setAttribute('aria-expanded',String(open))});
    if(r){
      const previewToggle=document.createElement('button');previewToggle.className='workspace-preview-toggle';previewToggle.type='button';previewToggle.setAttribute('aria-label','Open website preview');previewToggle.setAttribute('aria-expanded','false');previewToggle.innerHTML='◉ Preview';document.body.appendChild(previewToggle);
      const backdrop=document.createElement('div');backdrop.className='workspace-rail-backdrop';document.body.appendChild(backdrop);
      const closePreview=()=>{document.body.classList.remove('workspace-preview-open');previewToggle.setAttribute('aria-expanded','false')};
      previewToggle.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();renderRail();const open=!document.body.classList.contains('workspace-preview-open');document.body.classList.toggle('workspace-preview-open',open);document.body.classList.remove('workspace-menu-open');previewToggle.setAttribute('aria-expanded',String(open))});
      backdrop.onclick=closePreview;
      r.querySelector('.workspace-rail-close')?.addEventListener('click',closePreview);
    }
    document.addEventListener('click',e=>{if(document.body.classList.contains('workspace-menu-open')&&!e.target.closest('.builder-sidebar')&&!e.target.closest('.workspace-menu-toggle'))document.body.classList.remove('workspace-menu-open')});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.body.classList.remove('workspace-menu-open');document.body.classList.remove('workspace-preview-open')}});
    document.querySelectorAll('.topbar').forEach(x=>x.classList.add('legacy-topbar'));
    renderRail();
    const mini=document.getElementById('workspace-mini-preview');
    if(mini && window.FSPreview){ window.FSPreview.watch(mini,{compact:false,onRender:()=>fitMiniPreview(mini)}); fitMiniPreview(mini); if('ResizeObserver' in window){ new ResizeObserver(()=>fitMiniPreview(mini)).observe(mini); } else { window.addEventListener('resize',()=>fitMiniPreview(mini)); } }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  window.addEventListener('fs-selection-change',renderRail);window.addEventListener('storage',renderRail);
})();

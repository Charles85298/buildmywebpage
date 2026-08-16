(()=>{
  const onReady = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, {once:true}) : fn();

  onReady(()=>{
    const preview = document.getElementById('catalog-home-live-preview');
    const stage = document.getElementById('catalog-preview-stage');
    const browser = document.getElementById('catalog-preview-browser');
    const tip = document.getElementById('catalog-edit-tip');
    if (!preview || !stage || !browser) return;

    let editMode = true;
    const appearanceKey = 'fs-preview-appearance';
    const required = ['CP','HD','HR','NV','FT','SC','CD','GA','IN','BT','FO','EF'];

    // First-load defaults. Never overwrite a customer's existing selections.
    try {
      const starterKey = 'fs-starter-defaults-v2';
      const selectionKey = 'fs-builder-selections';
      if (localStorage.getItem(starterKey) !== '1') {
        let saved = {};
        try { saved = JSON.parse(localStorage.getItem(selectionKey) || '{}') || {}; } catch { saved = {}; }
        const vals = Object.values(saved);
        const has = prefix => vals.some(item => String(item?.code || '').startsWith(prefix + '-'));
        const now = Date.now();
        if (!has('CP')) saved['CP-01'] = {code:'CP-01',name:'Executive Navy',category:'Color Theme',page:'colors.html',selectedAt:now,colors:{colorMode:'as-shown'}};
        if (!has('HR')) saved['HR-01'] = {code:'HR-01',sourceCode:'HD-01',name:'Classic Split Hero',category:'Hero',page:'headers.html?focus=hero',selectedAt:now+1,colors:{colorMode:'global'}};
        if (!has('BT')) saved['BT-01'] = {code:'BT-01',name:'Primary',category:'Buttons',page:'buttons.html',selectedAt:now+2,colors:{colorMode:'global'}};
        localStorage.setItem(selectionKey, JSON.stringify(saved));
        localStorage.setItem(starterKey, '1');
      }
    } catch(e) { console.warn('Starter defaults skipped', e); }

    const selections = () => {
      try { return Object.values(JSON.parse(localStorage.getItem('fs-builder-selections') || '{}') || {}); }
      catch { return []; }
    };
    const categoryDone = (prefix, vals) => {
      if (prefix === 'SC') return vals.some(v => /section/i.test(String(v.category || '')) || String(v.code || '').startsWith('SC-'));
      if (prefix === 'EF') return vals.some(v => /^E[FX]-/.test(String(v.code || '')) || /effect/i.test(String(v.category || '')));
      return vals.some(v => String(v.code || '').startsWith(prefix + '-'));
    };
    const updateProgress = () => {
      const vals = selections();
      const done = required.filter(p => categoryDone(p, vals)).length;
      const pct = Math.round(done / required.length * 100);
      const label = document.getElementById('catalog-progress-label');
      const percent = document.getElementById('catalog-progress-percent');
      const bar = document.getElementById('catalog-progress-bar');
      const review = document.getElementById('catalog-review-link');
      if (label) label.textContent = `${done} of ${required.length} selected`;
      if (percent) percent.textContent = `${pct}%`;
      if (bar) bar.style.width = `${pct}%`;
      if (review) review.textContent = pct === 100 ? 'Review My Website →' : 'Open Full Preview ↗';
    };

    // Device controls are intentionally bound before any preview renderer call.
    document.querySelectorAll('[data-preview-device]').forEach(btn => {
      btn.addEventListener('click', () => {
        const device = btn.dataset.previewDevice || 'desktop';
        stage.dataset.device = device;
        document.querySelectorAll('[data-preview-device]').forEach(x => {
          const active = x === btn;
          x.classList.toggle('is-active', active);
          x.setAttribute('aria-pressed', String(active));
        });
      });
    });

    const applyAppearance = () => {
      const mode = localStorage.getItem(appearanceKey) || 'brand';
      preview.classList.remove('preview-appearance-brand','preview-appearance-light','preview-appearance-dark');
      preview.classList.add(`preview-appearance-${mode}`);
      document.querySelectorAll('[data-preview-appearance]').forEach(btn => {
        const active = btn.dataset.previewAppearance === mode;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
    };
    document.querySelectorAll('[data-preview-appearance]').forEach(btn => {
      btn.addEventListener('click', () => {
        localStorage.setItem(appearanceKey, btn.dataset.previewAppearance || 'brand');
        applyAppearance();
      });
    });
    applyAppearance();

    const render = () => {
      try {
        if (window.FSPreview?.render) window.FSPreview.render(preview, {compact:false});
      } catch(e) {
        console.error('Preview render failed', e);
        if (!preview.children.length) preview.innerHTML = '<div class="pv-live-site"><section class="pv-hero"><div class="pv-hero-copy"><small>YOUR WEBSITE</small><h1>Build Your Dream Website</h1><p>Select a style to begin customizing your website.</p><div class="pv-hero-actions"><button class="demo-btn" data-button-slot="hero-primary">Get Started</button></div></div><div class="pv-hero-art"></div></section></div>';
      }
      try { window.FSInlineEditor?.bind?.(preview); } catch(e) { console.warn('Inline editor bind failed', e); }
      updateProgress();
    };

    document.getElementById('catalog-preview-refresh')?.addEventListener('click', render);
    document.getElementById('catalog-preview-edit-toggle')?.addEventListener('click', e => {
      editMode = !editMode;
      e.currentTarget.classList.toggle('is-active', editMode);
      e.currentTarget.setAttribute('aria-pressed', String(editMode));
      browser.classList.toggle('preview-edit-off', !editMode);
      if (tip) tip.hidden = true;
    });
    document.getElementById('catalog-preview-fullscreen')?.addEventListener('click', async () => {
      if (browser.requestFullscreen) {
        try { await browser.requestFullscreen(); return; } catch(e) {}
      }
      location.href = 'website-preview.html';
    });
    document.getElementById('catalog-preview-undo')?.addEventListener('click',()=>{ try { window.FSHistory?.undo?.(); } catch(e){} });
    document.getElementById('catalog-preview-redo')?.addEventListener('click',()=>{ try { window.FSHistory?.redo?.(); } catch(e){} });
    document.getElementById('catalog-preview-reset')?.addEventListener('click',()=>{
      if (confirm('Reset all website design selections and overrides? You can undo this change.')) {
        try { window.FSHistory?.reset?.(); } catch(e){}
        render();
      }
    });

    const updateHistoryButtons = () => {
      let st={undo:false,redo:false};
      try { st = window.FSHistory?.status?.() || st; } catch(e){}
      const u=document.getElementById('catalog-preview-undo'), r=document.getElementById('catalog-preview-redo');
      if(u) u.disabled=!st.undo;
      if(r) r.disabled=!st.redo;
    };
    updateHistoryButtons();

    const editable = [
      ['.pv-footer','footers.html','Edit Footer'],
      ['.pv-form','inputs.html','Edit Forms & Inputs'],
      ['.pv-gallery','galleries.html','Edit Images & Galleries'],
      ['.pv-cards','cards.html','Edit Cards'],
      ['.pv-nav,.pv-side-nav','navigation.html','Edit Navigation'],
      ['.pv-hero','headers.html?focus=hero','Edit Hero'],
      ['.pv-header','headers.html','Edit Header'],
      ['.pv-section','sections.html','Edit Sections & Layouts']
    ];
    const buttonNames = {'header-cta':'Header CTA','side-cta':'Side Navigation CTA','hero-primary':'Hero Primary Button','hero-secondary':'Hero Secondary Button','form-submit':'Form Submit Button'};
    const targetFor = node => {
      if (!node?.closest) return null;
      const component = node.closest('[data-component-slot][data-edit-page]');
      if (component && preview.contains(component)) {
        const slot = component.dataset.componentSlot;
        const page = component.dataset.editPage;
        const label = component.dataset.editLabel || 'Website Element';
        return {el:component,href:`${page}?target=${encodeURIComponent(slot)}&label=${encodeURIComponent(label)}&return=${encodeURIComponent('../index.html')}`,label:`Edit ${label}`};
      }
      const button = node.closest('[data-button-slot]');
      if (button && preview.contains(button)) {
        const slot = button.dataset.buttonSlot;
        const name = buttonNames[slot] || 'Button';
        return {el:button,href:`buttons.html?target=${encodeURIComponent(slot)}&return=${encodeURIComponent('../index.html')}`,label:`Edit ${name}`};
      }
      for (const [selector, href, label] of editable) {
        const el = node.closest(selector);
        if (el && preview.contains(el)) return {el,href,label};
      }
      return null;
    };

    preview.addEventListener('mousemove', e => {
      if (!editMode || !tip) return;
      const hit = targetFor(e.target);
      preview.querySelectorAll('.pv-edit-hover').forEach(x => x.classList.remove('pv-edit-hover'));
      if (!hit) { tip.hidden = true; return; }
      hit.el.classList.add('pv-edit-hover');
      tip.textContent = hit.label;
      tip.hidden = false;
      const rect = browser.getBoundingClientRect();
      tip.style.left = `${Math.min(Math.max(12, rect.width - 170), Math.max(12, e.clientX - rect.left + 12))}px`;
      tip.style.top = `${Math.max(56, e.clientY - rect.top + 12)}px`;
    });
    preview.addEventListener('mouseleave', () => {
      preview.querySelectorAll('.pv-edit-hover').forEach(x => x.classList.remove('pv-edit-hover'));
      if (tip) tip.hidden = true;
    });
    preview.addEventListener('click', e => {
      if (!editMode) return;
      // Text/image clicks are handled by the capture-phase inline editor.
      if (e.target.closest?.('[data-content-key],[data-image-slot]')) return;
      const hit = targetFor(e.target);
      if (!hit) return;
      e.preventDefault();
      e.stopPropagation();
      location.href = hit.href;
    });

    window.addEventListener('fs-selection-change',()=>{ updateHistoryButtons(); render(); });
    window.addEventListener('fs-history-change',()=>{ updateHistoryButtons(); render(); });
    window.addEventListener('storage',render);

    // Initial render and resilient watcher. A renderer failure will not disable toolbar controls.
    render();
    try { window.FSPreview?.watch?.(preview,{compact:false,onRender:updateProgress}); } catch(e) { console.error('Preview watch failed',e); }
  });
})();

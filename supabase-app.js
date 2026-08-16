(() => {
  'use strict';

  const SUPABASE_URL = 'https://tnrmgksnxofxdhciuyzc.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_bLz-UhCHpXJrlA94qpqlrA_vELNU1vT';

  if (!window.supabase) {
    console.error('Supabase client library did not load.');
    return;
  }

  const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  window.fsSupabase = client;

  const STORE = 'fs-builder-selections';
  const DETAILS = 'fs-builder-details';
  const GUIDE = 'fs-guided-builder-v1';
  const DESIGN = 'fs-design-system-v1';
  const THEME = 'fs-project-theme-v1';
  const ACTIVE_PROJECT = 'fs-active-project-id';
  const PENDING_SIGNUP = 'fs-pending-signup-v1';

  const $ = (s, r=document) => r.querySelector(s);
  const readJSON = (key, fallback={}) => {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch(e) { return fallback; }
  };
  const writeJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  const state = {
    user: null,
    activeProjectId: localStorage.getItem(ACTIVE_PROJECT) || null
  };

  function setStatus(message, type='') {
    const el = $('#cloud-status');
    if (!el) return;
    el.textContent = message || '';
    el.className = 'cloud-status' + (type ? ' ' + type : '');
  }

  function recommendedPackage() {
    const selections = Object.keys(readJSON(STORE, {})).length;
    const guide = readJSON(GUIDE, {});
    const features = Array.isArray(guide.features) ? guide.features : [];
    const advanced = features.filter(x => /E-commerce|Portal|Booking|Payments/i.test(x)).length;
    return (selections > 10 || features.length > 5 || advanced > 0)
      ? {name:'Elevate', price:750}
      : {name:'Launch', price:350};
  }

  function buildSnapshot() {
    return {
      saved_at: new Date().toISOString(),
      design_system: readJSON(DESIGN, {}),
      selections: Object.values(readJSON(STORE, {})),
      guided_builder: readJSON(GUIDE, {}),
      project_details: readJSON(DETAILS, {}),
      project_theme: readJSON(THEME, {}),
      skipped_steps: ['HD','NV','FR','FT','IN','BT','CD','TB','GA','EF','FO'].filter(p => localStorage.getItem('fs-skip-'+p)==='1')
    };
  }

  function projectPayload(overrides={}) {
    const details = readJSON(DETAILS, {});
    const guide = readJSON(GUIDE, {});
    const design = readJSON(DESIGN, {});
    const pkg = recommendedPackage();

    const projectName =
      overrides.project_name ||
      $('#client-project-name')?.value ||
      details['client-project-name'] ||
      overrides.business_name ||
      $('#client-business')?.value ||
      details['client-business'] ||
      'My Website Project';

    return {
      project_name: projectName,
      business_name: overrides.business_name ?? $('#client-business')?.value ?? details['client-business'] ?? null,
      contact_name: overrides.contact_name ?? $('#client-name')?.value ?? details['client-name'] ?? null,
      email: overrides.email ?? $('#client-email')?.value ?? details['client-email'] ?? state.user?.email ?? null,
      phone: overrides.phone ?? $('#client-phone')?.value ?? details['client-phone'] ?? null,
      project_type: overrides.project_type ?? details['project-type'] ?? null,
      primary_goal: overrides.primary_goal ?? details['primary-goal'] ?? null,
      target_launch_timeframe: overrides.target_launch_timeframe ?? details['target-launch-timeframe'] ?? null,
      budget_range: overrides.budget_range ?? details['budget-range'] ?? null,
      starter_kit: guide.kit || null,
      fleming_recommended: !!guide.flemingRecommended,
      recommended_package: pkg.name,
      starting_price: pkg.price,
      primary_color: design.primary || '#1697E6',
      secondary_color: design.secondary || '#0E2A47',
      accent_color: design.accent || '#69BE28',
      background_color: design.background || '#FFFFFF',
      surface_color: design.surface || '#F6F9FC',
      heading_color: design.heading || '#0E2A47',
      body_text_color: design.body || '#334155',
      primary_button_text_color: design.primaryText || '#FFFFFF',
      secondary_button_text_color: design.secondaryText || '#FFFFFF',
      builder_step: Math.min(8, Math.max(1, Number(guide.step ?? 0) + 1)),
      project_notes: overrides.project_notes ?? $('#client-notes')?.value ?? details['client-notes'] ?? null,
      metadata: {
        guide,
        design_system: design,
        local_snapshot_version: 1,
        skipped_steps: ['HD','NV','FR','FT','IN','BT','CD','TB','GA','EF','FO'].filter(p => localStorage.getItem('fs-skip-'+p)==='1')
      }
    };
  }

  function selectionRows(projectId) {
    return Object.values(readJSON(STORE, {})).map((x, index) => {
      const c = x.colors || {};
      return {
        project_id: projectId,
        catalog_code: x.code,
        catalog_name: x.name || 'Design option',
        category: x.category || 'Catalog',
        source_page: x.page || null,
        appearance_mode: c.colorMode === 'as-shown' ? 'as-shown' : (c.colorMode === 'custom' ? 'custom' : 'global'),
        primary_background: c.primaryBg || null,
        primary_text: c.primaryText || null,
        primary_border: c.primaryBorder || null,
        primary_hover: c.primaryHover || null,
        primary_pressed: c.primaryPressed || null,
        secondary_background: c.secondaryBg || null,
        secondary_text: c.secondaryText || null,
        secondary_border: c.secondaryBorder || null,
        secondary_hover: c.secondaryHover || null,
        secondary_pressed: c.secondaryPressed || null,
        preview_background: c.previewBg || null,
        style_settings: {...c, editorSettings: x.editorSettings || null},
        sort_order: index,
        is_preferred: true
      };
    });
  }

  function featureRows(projectId) {
    const guide = readJSON(GUIDE, {});
    const features = Array.isArray(guide.features) ? guide.features : [];
    return features.map((name, index) => ({
      project_id: projectId,
      feature_code: 'FEAT-' + String(index + 1).padStart(2, '0'),
      feature_name: name,
      category: 'website_feature',
      complexity: /E-commerce|Customer Portal|Appointment Booking|Online Payments/i.test(name)
        ? 'advanced'
        : (/SEO|CMS|Accessibility|Animations/i.test(name) ? 'enhanced' : 'standard'),
      is_selected: true,
      is_recommended: false,
      price_adjustment: 0,
      settings: {},
      sort_order: index
    }));
  }


  function themePayload(projectId, themeOverride=null) {
    const t = themeOverride || readJSON(THEME, {});
    return {
      project_id: projectId,
      header_style: t.header_style || 'standard',
      header_background: t.header_background || '#FFFFFF',
      header_text_color: t.header_text_color || '#0E2A47',
      header_link_color: t.header_link_color || '#0E2A47',
      header_cta_color: t.header_cta_color || '#1697E6',
      header_transparent: !!t.header_transparent,
      header_sticky: t.header_sticky !== false,
      header_shadow: !!t.header_shadow,

      section_style: t.section_style || 'clean',
      section_background_primary: t.section_background_primary || '#FFFFFF',
      section_background_secondary: t.section_background_secondary || '#F6F9FC',
      section_text_color: t.section_text_color || '#334155',
      section_heading_color: t.section_heading_color || '#0E2A47',
      section_alternating: t.section_alternating !== false,
      section_divider_style: t.section_divider_style || 'none',

      body_background: t.body_background || '#FFFFFF',
      body_text_color: t.body_text_color || '#334155',
      body_heading_color: t.body_heading_color || '#0E2A47',
      body_link_color: t.body_link_color || '#1697E6',
      body_line_height: Number(t.body_line_height || 1.6),
      body_content_width: Number(t.body_content_width || 1200),

      page_style: t.page_style || 'full-width',
      page_background: t.page_background || '#FFFFFF',
      page_max_width: Number(t.page_max_width || 1440),
      page_padding: Number(t.page_padding || 24),
      page_texture: t.page_texture || 'none',
      page_gradient: t.page_gradient || null,

      footer_style: t.footer_style || 'multi-column',
      footer_background: t.footer_background || '#0E2A47',
      footer_text_color: t.footer_text_color || '#FFFFFF',
      footer_link_color: t.footer_link_color || '#FFFFFF',
      footer_accent_color: t.footer_accent_color || '#1697E6',
      footer_columns: Number(t.footer_columns || 4),
      footer_show_social: t.footer_show_social !== false,
      footer_show_cta: t.footer_show_cta !== false,

      surface_style: t.surface_style || 'standard',
      surface_background: t.surface_background || '#FFFFFF',
      surface_border_color: t.surface_border_color || '#DFE8F1',
      surface_border_radius: Number(t.surface_border_radius || 16),
      surface_shadow: t.surface_shadow || 'soft',

      spacing_style: t.spacing_style || 'standard',
      section_spacing: Number(t.section_spacing || 80),
      component_spacing: Number(t.component_spacing || 24),

      header_settings: {},
      section_settings: {},
      body_settings: {},
      page_settings: {},
      footer_settings: {},
      surface_settings: {}
    };
  }

  async function saveTheme(themeOverride=null) {
    if (!state.user) throw new Error('Please sign in first.');
    if (!state.activeProjectId) {
      const project = await saveProject();
      state.activeProjectId = project.id;
    }
    const payload = themePayload(state.activeProjectId, themeOverride);
    const {error} = await client
      .from('project_theme')
      .upsert(payload, {onConflict:'project_id'});
    if (error) throw error;
    if (themeOverride) writeJSON(THEME, themeOverride);
    return true;
  }

  let autosaveTimer = null;
  let autosaveRunning = false;
  let autosaveQueued = false;

  function scheduleAutosave(delay=1200) {
    if (!state.user) return;
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(runAutosave, delay);
  }

  async function runAutosave() {
    if (!state.user) return;
    if (autosaveRunning) {
      autosaveQueued = true;
      return;
    }
    autosaveRunning = true;
    autosaveQueued = false;
    try {
      setStatus('Autosaving…');
      await saveProject();
      setStatus('✓ Saved to Supabase.', 'success');
    } catch (err) {
      console.error('Supabase autosave failed:', err);
      setStatus('Cloud autosave paused — use Save Project to retry.', 'error');
    } finally {
      autosaveRunning = false;
      if (autosaveQueued) scheduleAutosave(700);
    }
  }

  function initAutosave() {
    // Component select/unselect events emitted by catalog.js.
    window.addEventListener('fs-selection-change', () => scheduleAutosave(500));

    // Color controls, builder details, guided-builder fields, and theme controls.
    document.addEventListener('input', e => {
      if (e.target.matches('input, textarea, select')) scheduleAutosave(1200);
    }, true);
    document.addEventListener('change', e => {
      if (e.target.matches('input, textarea, select')) scheduleAutosave(700);
    }, true);

    // Buttons can change local draft state (swap colors, skip steps, starter kits, etc.).
    document.addEventListener('click', e => {
      if (e.target.closest('.swap-pair, .skip-step, [data-kit], [data-feature], [data-theme-view]')) {
        scheduleAutosave(700);
      }
    }, true);
  }

  async function saveProject(overrides={}) {
    if (!state.user) throw new Error('Please sign in before saving your project.');

    setStatus('Saving project to Supabase…');
    const payload = projectPayload(overrides);
    let project;

    if (state.activeProjectId) {
      const {data, error} = await client
        .from('projects')
        .update(payload)
        .eq('id', state.activeProjectId)
        .select()
        .single();
      if (error) throw error;
      project = data;
    } else {
      const {data, error} = await client
        .from('projects')
        .insert({...payload, user_id: state.user.id})
        .select()
        .single();
      if (error) throw error;
      project = data;
      state.activeProjectId = project.id;
      localStorage.setItem(ACTIVE_PROJECT, project.id);
    }

    let result = await client.from('project_selections').delete().eq('project_id', project.id);
    if (result.error) throw result.error;
    const selections = selectionRows(project.id);
    if (selections.length) {
      result = await client.from('project_selections').insert(selections);
      if (result.error) throw result.error;
    }

    result = await client.from('project_features').delete().eq('project_id', project.id);
    if (result.error) throw result.error;
    const features = featureRows(project.id);
    if (features.length) {
      result = await client.from('project_features').insert(features);
      if (result.error) throw result.error;
    }

    await saveTheme();

    setStatus('✓ Project saved to Supabase.', 'success');
    await loadProjectList();
    updateCloudUI();
    return project;
  }

  async function loadProject(projectId) {
    if (!state.user) throw new Error('Please sign in first.');

    setStatus('Loading project…');

    const [projectResult, selectionResult, featureResult, themeResult] = await Promise.all([
      client.from('projects').select('*').eq('id', projectId).single(),
      client.from('project_selections').select('*').eq('project_id', projectId).order('sort_order'),
      client.from('project_features').select('*').eq('project_id', projectId).eq('is_selected', true).order('sort_order'),
      client.from('project_theme').select('*').eq('project_id', projectId).maybeSingle()
    ]);

    if (projectResult.error) throw projectResult.error;
    if (selectionResult.error) throw selectionResult.error;
    if (featureResult.error) throw featureResult.error;
    if (themeResult.error) throw themeResult.error;

    const p = projectResult.data;
    const selections = {};
    (selectionResult.data || []).forEach(row => {
      selections[row.catalog_code] = {
        code: row.catalog_code,
        name: row.catalog_name,
        category: row.category,
        page: row.source_page,
        selectedAt: Date.parse(row.created_at) || Date.now(),
        editorSettings: row.style_settings?.editorSettings || null,
        colors: {
          ...(row.style_settings || {}),
          colorMode: row.appearance_mode || 'global',
          primaryBg: row.primary_background,
          primaryText: row.primary_text,
          primaryBorder: row.primary_border,
          primaryHover: row.primary_hover,
          primaryPressed: row.primary_pressed,
          secondaryBg: row.secondary_background,
          secondaryText: row.secondary_text,
          secondaryBorder: row.secondary_border,
          secondaryHover: row.secondary_hover,
          secondaryPressed: row.secondary_pressed,
          previewBg: row.preview_background
        }
      };
    });

    const design = {
      primary: p.primary_color,
      secondary: p.secondary_color,
      accent: p.accent_color,
      background: p.background_color,
      surface: p.surface_color,
      heading: p.heading_color,
      body: p.body_text_color,
      primaryText: p.primary_button_text_color,
      secondaryText: p.secondary_button_text_color
    };

    const guide = {
      ...(p.metadata?.guide || {}),
      step: Math.max(0, (p.builder_step || 1) - 1),
      kit: p.starter_kit || p.metadata?.guide?.kit || null,
      flemingRecommended: !!p.fleming_recommended,
      features: (featureResult.data || []).map(x => x.feature_name)
    };

    const details = {
      'client-project-name': p.project_name || '',
      'client-name': p.contact_name || '',
      'client-business': p.business_name || '',
      'client-email': p.email || '',
      'client-phone': p.phone || '',
      'client-notes': p.project_notes || ''
    };

    writeJSON(STORE, selections);
    writeJSON(DESIGN, design);
    writeJSON(GUIDE, guide);
    ['HD','NV','FR','FT','IN','BT','CD','TB','GA','EF','FO'].forEach(k=>localStorage.removeItem('fs-skip-'+k));
    (p.metadata?.skipped_steps || []).forEach(k=>localStorage.setItem('fs-skip-'+k,'1'));

    writeJSON(DETAILS, details);

    if (themeResult.data) {
      const tr = {...themeResult.data};
      delete tr.id; delete tr.project_id; delete tr.created_at; delete tr.updated_at;
      delete tr.header_settings; delete tr.section_settings; delete tr.body_settings;
      delete tr.page_settings; delete tr.footer_settings; delete tr.surface_settings;
      writeJSON(THEME, tr);
    }

    state.activeProjectId = p.id;
    localStorage.setItem(ACTIVE_PROJECT, p.id);
    setStatus('✓ Project loaded. Refreshing builder…', 'success');
    setTimeout(() => location.reload(), 450);
  }

  async function loadProjectList() {
    const list = $('#cloud-project-list');
    if (!list || !state.user) return;

    list.innerHTML = '<p class="builder-muted">Loading projects…</p>';
    const {data, error} = await client
      .from('projects')
      .select('id,project_name,business_name,status,recommended_package,updated_at')
      .order('updated_at', {ascending:false});

    if (error) {
      list.innerHTML = '<p class="cloud-error">Could not load projects.</p>';
      console.error(error);
      return;
    }

    if (!data?.length) {
      list.innerHTML = '<p class="builder-muted">No cloud projects yet. Save this design to create your first one.</p>';
      return;
    }

    list.innerHTML = data.map(p => {
      const active = p.id === state.activeProjectId;
      const date = p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '';
      return `<article class="cloud-project-row ${active ? 'active' : ''}">
        <div><strong>${escapeHTML(p.project_name || p.business_name || 'Website Project')}</strong>
        <small>${escapeHTML(p.status || 'draft')} · ${escapeHTML(p.recommended_package || '')} · Updated ${date}</small></div>
        <button type="button" data-load-project="${p.id}">${active ? 'Reload' : 'Load'}</button>
      </article>`;
    }).join('');

    list.querySelectorAll('[data-load-project]').forEach(btn => {
      btn.addEventListener('click', async () => {
        try { await loadProject(btn.dataset.loadProject); }
        catch(err) { setStatus(err.message || 'Could not load project.', 'error'); console.error(err); }
      });
    });
  }

  function escapeHTML(value='') {
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }


  function modalStatus(message,type=''){
    const el=$('#account-modal-status'); if(!el)return;
    el.textContent=message||''; el.className='account-modal-status'+(type?' '+type:'');
  }

  function accountModalMarkup(){
    return `
    <div class="account-modal" id="account-modal" hidden>
      <div class="account-modal-backdrop" data-close-account></div>
      <section class="account-modal-card" role="dialog" aria-modal="true" aria-labelledby="account-modal-title">
        <button class="account-modal-close" type="button" aria-label="Close" data-close-account>×</button>
        <span class="account-kicker">SAVE YOUR WEBSITE DESIGN</span>

        <div id="account-modal-signed-out">
          <div class="account-mode-tabs" role="tablist" aria-label="Account options">
            <button type="button" class="account-mode-tab active" data-account-mode="signup">Create Account</button>
            <button type="button" class="account-mode-tab" data-account-mode="signin">Sign In</button>
          </div>

          <div id="account-signup-panel">
            <div class="account-step-head">
              <div>
                <h2 id="account-modal-title">Create your account</h2>
                <p id="account-step-copy">Start with your account information.</p>
              </div>
              <strong id="account-step-indicator">1 / 3</strong>
            </div>
            <div class="account-progress"><i id="account-progress-bar"></i></div>

            <div class="account-step" data-account-step="1">
              <div class="account-field-grid two">
                <label>First name<input id="signup-first-name" type="text" autocomplete="given-name" required></label>
                <label>Last name<input id="signup-last-name" type="text" autocomplete="family-name" required></label>
              </div>
              <label>Email address<input id="signup-email" type="email" autocomplete="email" required placeholder="you@example.com"></label>
              <div class="account-field-grid two">
                <label>Password<input id="signup-password" type="password" autocomplete="new-password" minlength="8" required></label>
                <label>Confirm password<input id="signup-password-confirm" type="password" autocomplete="new-password" minlength="8" required></label>
              </div>
              <small class="account-help">Use at least 8 characters. Your password is stored securely by Supabase Auth and is never saved in the website database.</small>
            </div>

            <div class="account-step" data-account-step="2" hidden>
              <label>Business / company name<input id="signup-business-name" type="text" autocomplete="organization" required></label>
              <div class="account-field-grid two">
                <label>Phone<input id="signup-phone" type="tel" autocomplete="tel" required placeholder="(555) 555-5555"></label>
                <label>Preferred contact
                  <select id="signup-contact-method" required>
                    <option value="">Choose…</option>
                    <option>Email</option><option>Phone</option><option>Text</option><option>No preference</option>
                  </select>
                </label>
              </div>
              <label>Industry / business type<input id="signup-industry" type="text" placeholder="Mortgage, electrician, consulting…" required></label>
              <label>Existing website <span class="account-optional">(optional)</span><input id="signup-website-url" type="url" autocomplete="url" placeholder="https://example.com"></label>
              <div class="account-field-grid two">
                <label>City<input id="signup-city" type="text" autocomplete="address-level2" required></label>
                <label>State<input id="signup-state" type="text" autocomplete="address-level1" required placeholder="AZ"></label>
              </div>
            </div>

            <div class="account-step" data-account-step="3" hidden>
              <label>Project name<input id="signup-project-name" type="text" required placeholder="My New Website"></label>
              <label>Project type
                <select id="signup-project-type" required>
                  <option value="">Choose…</option>
                  <option>New Website</option>
                  <option>Website Redesign</option>
                </select>
              </label>
              <label>Primary goal
                <select id="signup-primary-goal" required>
                  <option value="">Choose…</option>
                  <option>Generate Leads</option>
                  <option>Sell Products Online</option>
                  <option>Book Appointments</option>
                  <option>Build Brand Awareness</option>
                  <option>Showcase Portfolio / Work</option>
                  <option>Provide Business Information</option>
                  <option>Replace / Modernize Existing Site</option>
                  <option>Other</option>
                </select>
              </label>
              <div class="account-field-grid two">
                <label>Target launch
                  <select id="signup-launch-timeframe" required>
                    <option value="">Choose…</option>
                    <option>ASAP</option>
                    <option>Within 2–4 weeks</option>
                    <option>Within 1–2 months</option>
                    <option>Within 3 months</option>
                    <option>3+ months / Flexible</option>
                  </select>
                </label>
                <label>Budget range
                  <select id="signup-budget-range" required>
                    <option value="">Choose…</option>
                    <option>Under $500</option>
                    <option>$500–$1,000</option>
                    <option>$1,000–$2,000</option>
                    <option>$2,000–$5,000</option>
                    <option>$5,000+</option>
                    <option>Not sure yet</option>
                  </select>
                </label>
              </div>
              <div class="account-draft-note">Your current Website Builder selections will stay on this device and will be attached to your new project after you confirm your email.</div>
            </div>

            <div class="account-wizard-actions">
              <button id="account-step-back" class="account-btn secondary" type="button" hidden>Back</button>
              <button id="account-step-next" class="account-btn primary" type="button">Continue</button>
              <button id="account-create-account" class="account-btn primary" type="button" hidden>Create Account</button>
            </div>
          </div>

          <div id="account-signin-panel" hidden>
            <h2>Welcome back</h2>
            <p>Sign in to load and continue your saved website projects.</p>
            <label>Email address<input id="signin-email" type="email" autocomplete="email" placeholder="you@example.com"></label>
            <label>Password<input id="signin-password" type="password" autocomplete="current-password"></label>
            <button id="account-signin" class="account-btn primary wide" type="button">Sign In</button>
          </div>
        </div>

        <div id="account-modal-signed-in" hidden>
          <h2>My Account</h2>
          <div class="account-success">✓ Signed in as <strong id="account-modal-user-email"></strong></div>
          <div class="account-modal-actions">
            <a class="account-btn primary" href="${location.pathname.includes('/catalog/') ? 'builder.html' : 'catalog/builder.html'}">My Projects</a>
            <button id="account-modal-save" class="account-btn secondary" type="button">Save Current Design</button>
            <button id="account-modal-signout" class="account-btn secondary" type="button">Sign Out</button>
          </div>
        </div>

        <p id="account-modal-status" class="account-modal-status" role="status"></p>
      </section>
    </div>`;
  }

  function ensureAccountModal(){
    if(!$('#account-modal')){
      document.body.insertAdjacentHTML('beforeend',accountModalMarkup());
    }
    if(!$('#fs-account-styles')){
      const s=document.createElement('style');
      s.id='fs-account-styles';
      s.textContent=`
        .account-modal[hidden]{display:none!important}
        .account-modal{position:fixed;inset:0;z-index:10050;display:grid;place-items:center;padding:18px}
        .account-modal-backdrop{position:absolute;inset:0;background:rgba(2,12,24,.72);backdrop-filter:blur(7px)}
        .account-modal-card{position:relative;z-index:1;width:min(650px,100%);max-height:min(90vh,850px);overflow:auto;background:#fff;color:#0e2a47;border:1px solid #dce6ef;border-radius:24px;padding:28px;box-shadow:0 34px 90px rgba(0,0,0,.32)}
        .account-modal-close{position:absolute;right:15px;top:12px;border:0;background:transparent;color:#0e2a47;font-size:1.9rem;cursor:pointer}
        .account-kicker{display:block;font-size:.72rem;font-weight:900;letter-spacing:.12em;color:#1697e6;margin-bottom:10px}
        .account-modal-card h2{margin:0 0 8px;font-size:1.75rem;color:#0e2a47}
        .account-modal-card p{margin:0 0 18px;color:#617386}
        .account-mode-tabs{display:flex;gap:8px;margin:5px 0 22px;padding:5px;background:#f3f7fa;border-radius:999px}
        .account-mode-tab{flex:1;border:0;background:transparent;padding:10px 14px;border-radius:999px;font:inherit;font-weight:850;color:#607386;cursor:pointer}
        .account-mode-tab.active{background:#fff;color:#0e2a47;box-shadow:0 4px 15px rgba(14,42,71,.10)}
        .account-step-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}
        .account-step-head strong{font-size:.8rem;color:#1697e6;white-space:nowrap;padding-top:5px}
        .account-progress{height:6px;background:#e8eff5;border-radius:999px;overflow:hidden;margin:0 0 22px}
        .account-progress i{display:block;height:100%;width:33.333%;background:#1697e6;border-radius:inherit;transition:width .2s ease}
        .account-modal-card label{display:block;font-size:.8rem;font-weight:850;color:#263f55;margin:12px 0}
        .account-modal-card input,.account-modal-card select{display:block;width:100%;margin-top:6px;padding:12px 13px;border:1px solid #cbd8e3;border-radius:11px;background:#fff;color:#0e2a47;font:inherit;outline:none}
        .account-modal-card input:focus,.account-modal-card select:focus{border-color:#1697e6;box-shadow:0 0 0 4px rgba(22,151,230,.10)}
        .account-field-grid{display:grid;gap:12px}.account-field-grid.two{grid-template-columns:1fr 1fr}
        .account-help{display:block;color:#718395;line-height:1.5;margin-top:4px}
        .account-optional{font-weight:600;color:#8495a4}
        .account-wizard-actions,.account-modal-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:22px}
        .account-btn{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:11px 18px;font:inherit;font-size:.88rem;font-weight:850;cursor:pointer;text-decoration:none;border:1px solid transparent}
        #account-create-account[hidden],#account-step-next[hidden],#account-step-back[hidden]{display:none!important}
        .account-btn.primary{background:#e53935;color:#fff}.account-btn.secondary{background:#fff;color:#0e2a47;border-color:#cbd8e3}.account-btn.wide{width:100%;margin-top:8px}
        .account-draft-note{margin-top:14px;padding:12px 14px;background:#eef8ff;border:1px solid #bfe4fa;border-radius:12px;color:#31566f;font-size:.82rem;line-height:1.5}
        .account-success{padding:12px 14px;border-radius:12px;background:#eefaf1;color:#16803a;font-weight:800}
        .account-modal-status{min-height:1.4em;margin:13px 0 0!important;font-size:.82rem!important}.account-modal-status.error{color:#b42318!important}.account-modal-status.success{color:#16803a!important}
        body.account-modal-open{overflow:hidden}
        @media(max-width:620px){.account-modal{padding:10px}.account-modal-card{padding:23px 18px;border-radius:20px;max-height:94vh}.account-field-grid.two{grid-template-columns:1fr}.account-mode-tabs{margin-right:30px}}
      `;
      document.head.appendChild(s);
    }
  }

  function openAccountModal(mode='signup'){
    ensureAccountModal();
    const modal=$('#account-modal');
    if(!modal)return;
    modal.hidden=false;
    document.body.classList.add('account-modal-open');
    setAccountMode(state.user?'signedin':mode);
  }

  function closeAccountModal(){
    const modal=$('#account-modal');
    if(modal)modal.hidden=true;
    document.body.classList.remove('account-modal-open');
    modalStatus('');
  }

  function setAccountMode(mode){
    const signedOut=$('#account-modal-signed-out');
    const signedIn=$('#account-modal-signed-in');
    if(state.user){
      if(signedOut)signedOut.hidden=true;
      if(signedIn)signedIn.hidden=false;
      return;
    }
    if(signedOut)signedOut.hidden=false;
    if(signedIn)signedIn.hidden=true;
    const signup=mode!=='signin';
    $('#account-signup-panel')?.toggleAttribute('hidden',!signup);
    $('#account-signin-panel')?.toggleAttribute('hidden',signup);
    document.querySelectorAll('[data-account-mode]').forEach(b=>b.classList.toggle('active',b.dataset.accountMode===(signup?'signup':'signin')));
  }

  function updateSharedAccountUI(){
    const mainBtn=$('#account-nav-button');
    const catBtn=$('#catalog-account-button');
    const accountOpeners=[...document.querySelectorAll('[data-account-open]')];
    const signedOut=$('#account-modal-signed-out');
    const signedIn=$('#account-modal-signed-in');
    const userEmail=$('#account-modal-user-email');
    if(mainBtn && !mainBtn.hasAttribute('data-account-open')) mainBtn.textContent=state.user?'My Account':'Create Account';
    if(catBtn && !catBtn.hasAttribute('data-account-open')) catBtn.textContent=state.user?'My Account':'Create Account';
    accountOpeners.forEach(btn=>{
      const mode=btn.dataset.accountOpen||'signup';
      btn.textContent=state.user?'My Account':(mode==='signin'?'Log In':'Create Account');
    });
    if(signedOut) signedOut.hidden=!!state.user;
    if(signedIn) signedIn.hidden=!state.user;
    if(userEmail) userEmail.textContent=state.user?.email||'';
  }

  function value(id){ return $('#'+id)?.value.trim() || ''; }

  function validateStep(step){
    const ids=step===1
      ? ['signup-first-name','signup-last-name','signup-email','signup-password','signup-password-confirm']
      : step===2
        ? ['signup-business-name','signup-phone','signup-contact-method','signup-industry','signup-city','signup-state']
        : ['signup-project-name','signup-project-type','signup-primary-goal','signup-launch-timeframe','signup-budget-range'];
    for(const id of ids){
      const el=$('#'+id);
      if(!el || !String(el.value||'').trim()){ el?.focus(); modalStatus('Please complete all required fields.','error'); return false; }
    }
    if(step===1){
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('signup-email'))){ $('#signup-email')?.focus(); modalStatus('Enter a valid email address.','error'); return false; }
      if(value('signup-password').length<8){ $('#signup-password')?.focus(); modalStatus('Password must be at least 8 characters.','error'); return false; }
      if(value('signup-password')!==value('signup-password-confirm')){ $('#signup-password-confirm')?.focus(); modalStatus('Passwords do not match.','error'); return false; }
    }
    modalStatus('');
    return true;
  }

  function collectSignupData(){
    return {
      profile:{
        first_name:value('signup-first-name'),
        last_name:value('signup-last-name'),
        phone:value('signup-phone'),
        preferred_contact_method:value('signup-contact-method'),
        business_name:value('signup-business-name'),
        industry:value('signup-industry'),
        website_url:value('signup-website-url')||null,
        city:value('signup-city'),
        state:value('signup-state')
      },
      project:{
        project_name:value('signup-project-name'),
        business_name:value('signup-business-name'),
        contact_name:[value('signup-first-name'),value('signup-last-name')].filter(Boolean).join(' '),
        email:value('signup-email'),
        phone:value('signup-phone'),
        project_type:value('signup-project-type'),
        primary_goal:value('signup-primary-goal'),
        target_launch_timeframe:value('signup-launch-timeframe'),
        budget_range:value('signup-budget-range')
      }
    };
  }

  async function createAccount(){
    if(!validateStep(3))return;
    const email=value('signup-email');
    const password=value('signup-password');
    const signup=collectSignupData();
    localStorage.setItem(PENDING_SIGNUP,JSON.stringify(signup.project));
    modalStatus('Creating your account…');
    const redirectTo=new URL('/catalog/index.html?confirmed=1',location.origin).href;
    const {data,error}=await client.auth.signUp({
      email,
      password,
      options:{
        emailRedirectTo:redirectTo,
        data:signup.profile
      }
    });
    if(error){modalStatus(error.message,'error');return;}
    if(data?.session){
      state.user=data.user;
      await finalizePendingSignup();
      updateSharedAccountUI();updateCloudUI();
      modalStatus('✓ Account created and signed in. Opening the Design Studio…','success');
      if (!location.pathname.includes('/catalog/')) {
        setTimeout(() => { location.href = 'catalog/index.html'; }, 350);
      }
    }else{
      modalStatus('✓ Account created. Check your email and click the confirmation link. Your current website design will be waiting when you return.','success');
      const actions=$('.account-wizard-actions'); if(actions)actions.hidden=true;
    }
  }

  async function signInAccount(){
    const email=value('signin-email');
    const password=value('signin-password');
    if(!email||!password){modalStatus('Enter your email and password.','error');return;}
    modalStatus('Signing in…');
    const {data,error}=await client.auth.signInWithPassword({email,password});
    if(error){modalStatus(error.message,'error');return;}
    state.user=data.user;
    await finalizePendingSignup();
    updateSharedAccountUI();updateCloudUI();
    await loadProjectList();
    modalStatus('✓ Signed in successfully. Opening the Design Studio…','success');
    if (!location.pathname.includes('/catalog/')) {
      setTimeout(() => { location.href = 'catalog/index.html'; }, 300);
    }
  }

  async function finalizePendingSignup(){
    if(!state.user)return;
    let pending=null;
    try{pending=JSON.parse(localStorage.getItem(PENDING_SIGNUP)||'null')}catch(e){}
    if(!pending)return;
    try{
      await saveProject(pending);
      localStorage.removeItem(PENDING_SIGNUP);
      setStatus('✓ Account confirmed and your website project was saved.','success');
    }catch(err){
      console.error('Could not finalize pending signup project:',err);
      setStatus('Your account is confirmed. Use Save Project to retry saving the project.','error');
    }
  }

  function initSharedAccountUI(){
    ensureAccountModal();
    let step=1;
    const showStep=n=>{
      step=Math.min(3,Math.max(1,n));
      document.querySelectorAll('[data-account-step]').forEach(el=>el.hidden=Number(el.dataset.accountStep)!==step);
      const copy=['Start with your account information.','Tell us about your business.','Set up your first website project.'][step-1];
      if($('#account-step-copy'))$('#account-step-copy').textContent=copy;
      if($('#account-step-indicator'))$('#account-step-indicator').textContent=`${step} / 3`;
      if($('#account-progress-bar'))$('#account-progress-bar').style.width=`${step*33.333}%`;
      if($('#account-step-back'))$('#account-step-back').hidden=step===1;
      if($('#account-step-next'))$('#account-step-next').hidden=step===3;
      if($('#account-create-account'))$('#account-create-account').hidden=step!==3;
      modalStatus('');
    };

    const boundOpeners=new Set();
    document.querySelectorAll('[data-account-open]').forEach(btn=>{
      boundOpeners.add(btn);
      btn.addEventListener('click',()=>openAccountModal(state.user?'signin':(btn.dataset.accountOpen||'signup')));
    });
    const mainAccount=$('#account-nav-button');
    const catalogAccount=$('#catalog-account-button');
    if(mainAccount && !boundOpeners.has(mainAccount)) mainAccount.addEventListener('click',()=>openAccountModal('signup'));
    if(catalogAccount && !boundOpeners.has(catalogAccount)) catalogAccount.addEventListener('click',()=>openAccountModal('signup'));
    $('#save-my-design-main')?.addEventListener('click',async()=>{
      if(!state.user){openAccountModal('signup');return;}
      try{await saveProject();modalStatus('✓ Current design saved.','success');}
      catch(err){modalStatus(err.message||'Could not save design.','error');}
    });

    document.querySelectorAll('[data-close-account]').forEach(x=>x.addEventListener('click',closeAccountModal));
    document.querySelectorAll('[data-account-mode]').forEach(btn=>btn.addEventListener('click',()=>setAccountMode(btn.dataset.accountMode)));

    $('#account-step-next')?.addEventListener('click',()=>{if(validateStep(step))showStep(step+1)});
    $('#account-step-back')?.addEventListener('click',()=>showStep(step-1));
    $('#account-create-account')?.addEventListener('click',createAccount);
    $('#account-signin')?.addEventListener('click',signInAccount);
    $('#signin-password')?.addEventListener('keydown',e=>{if(e.key==='Enter')signInAccount()});

    $('#account-modal-save')?.addEventListener('click',async()=>{
      try{await saveProject();modalStatus('✓ Current design saved to your account.','success');}
      catch(err){modalStatus(err.message||'Could not save design.','error');}
    });
    $('#account-modal-signout')?.addEventListener('click',async()=>{
      await client.auth.signOut();state.user=null;state.activeProjectId=null;localStorage.removeItem(ACTIVE_PROJECT);
      updateSharedAccountUI();updateCloudUI();setAccountMode('signin');modalStatus('Signed out. Your local draft remains on this device.');
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAccountModal()});
    showStep(1);
  }

  function updateCloudUI() {
    const loggedOut = $('#cloud-logged-out');
    const loggedIn = $('#cloud-logged-in');
    const userEmail = $('#cloud-user-email');
    const activeLabel = $('#active-cloud-project');

    if (loggedOut) loggedOut.hidden = !!state.user;
    if (loggedIn) loggedIn.hidden = !state.user;
    if (userEmail) userEmail.textContent = state.user?.email || '';
    if (activeLabel) activeLabel.textContent = state.activeProjectId ? 'Cloud project connected' : 'Local draft — not saved to cloud yet';
    updateSharedAccountUI();
  }

  async function refreshSession() {
    const {data, error} = await client.auth.getSession();
    if (error) console.error(error);
    state.user = data?.session?.user || null;
    updateCloudUI();
    if (state.user) {
      await finalizePendingSignup();
      await loadProjectList();
    }
  }

  async function initBuilderCloudUI() {
    if (!$('#cloud-account-panel')) return;

    $('#cloud-sign-in')?.addEventListener('click', async () => {
      const email = $('#cloud-email')?.value.trim();
      const password = $('#cloud-password')?.value || '';
      if (!email || !password) { setStatus('Enter your email and password.', 'error'); return; }
      setStatus('Signing in…');
      const {data,error}=await client.auth.signInWithPassword({email,password});
      if(error){setStatus(error.message,'error');return;}
      state.user=data.user;
      await finalizePendingSignup();
      setStatus('✓ Signed in.', 'success');
      updateCloudUI();
      await loadProjectList();
    });

    $('#cloud-create-account')?.addEventListener('click',()=>openAccountModal('signup'));
    $('#cloud-password')?.addEventListener('keydown',e=>{if(e.key==='Enter')$('#cloud-sign-in')?.click()});

    $('#cloud-save-project')?.addEventListener('click', async () => {
      try { await saveProject(); }
      catch(err) { setStatus(err.message || 'Could not save project.', 'error'); console.error(err); }
    });

    $('#cloud-sign-out')?.addEventListener('click', async () => {
      await client.auth.signOut();
      state.user = null;
      state.activeProjectId = null;
      localStorage.removeItem(ACTIVE_PROJECT);
      setStatus('Signed out. Your local draft is still on this device.');
      updateCloudUI();
    });

    $('#cloud-new-project')?.addEventListener('click', () => {
      if (!confirm('Start a new cloud project? Your current local selections will remain until you clear them.')) return;
      state.activeProjectId = null;
      localStorage.removeItem(ACTIVE_PROJECT);
      updateCloudUI();
      setStatus('New cloud project selected. Press Save Project when ready.');
    });

    await refreshSession();
    if(state.user) await finalizePendingSignup();

    client.auth.onAuthStateChange(async (_event, session) => {
      state.user = session?.user || null;
      updateCloudUI();
      if(state.user){
        await finalizePendingSignup();
        await loadProjectList();
      }
    });
  }


  async function saveReferenceDocument({title, previewHtml, previewData}) {
    if (!state.user) throw new Error('Please sign in before saving a reference document.');
    if (!state.activeProjectId) {
      const project = await saveProject();
      state.activeProjectId = project.id;
    }

    const {data:latest, error:versionError} = await client
      .from('project_reference_documents')
      .select('version_number')
      .eq('project_id', state.activeProjectId)
      .order('version_number', {ascending:false})
      .limit(1);

    if (versionError) throw versionError;

    const version = (latest?.[0]?.version_number || 0) + 1;

    const {data, error} = await client
      .from('project_reference_documents')
      .insert({
        project_id: state.activeProjectId,
        user_id: state.user.id,
        title: title || `Website Preview v${version}`,
        version_number: version,
        preview_html: previewHtml,
        preview_data: previewData || {},
        status: 'reference'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async function listReferenceDocuments() {
    if (!state.user || !state.activeProjectId) return [];
    const {data, error} = await client
      .from('project_reference_documents')
      .select('id,title,version_number,status,created_at,updated_at')
      .eq('project_id', state.activeProjectId)
      .order('version_number', {ascending:false});
    if (error) throw error;
    return data || [];
  }

  async function getReferenceDocument(id) {
    if (!state.user) throw new Error('Please sign in first.');
    const {data, error} = await client
      .from('project_reference_documents')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async function submitContactRequest(form) {
    const status = $('#form-status');
    const f = new FormData(form);

    const {data:sessionData} = await client.auth.getSession();
    state.user = sessionData?.session?.user || null;

    if (!state.user) {
      const body = `Name: ${f.get('name')}\nBusiness: ${f.get('business')}\nEmail: ${f.get('email')}\nPhone: ${f.get('phone')}\nService: ${f.get('service')}\n\n${f.get('message')}\n\n${f.get('website_selections') || ''}`;
      if (status) status.textContent = 'To save this request in your project account, sign in from My Selections. Opening your email app…';
      location.href = `mailto:charles.flemingiii@outlook.com?subject=${encodeURIComponent('New project inquiry — ' + (f.get('business') || f.get('name')))}&body=${encodeURIComponent(body)}`;
      return;
    }

    let projectId = localStorage.getItem(ACTIVE_PROJECT);
    if (!projectId) {
      const project = await saveProject({
        contact_name: f.get('name'),
        business_name: f.get('business'),
        email: f.get('email'),
        phone: f.get('phone'),
        project_notes: f.get('message')
      });
      projectId = project.id;
    }

    const pkg = recommendedPackage();
    const snapshot = buildSnapshot();

    const {error} = await client.from('contact_requests').insert({
      project_id: projectId,
      user_id: state.user.id,
      contact_name: f.get('name'),
      business_name: f.get('business') || null,
      email: f.get('email'),
      phone: f.get('phone') || null,
      service_type: String(f.get('service') || 'website_design').toLowerCase().replace(/[^a-z0-9]+/g,'_'),
      subject: 'New project inquiry — ' + (f.get('business') || f.get('name')),
      message: f.get('message') || null,
      recommended_package: pkg.name,
      starting_price: pkg.price,
      design_snapshot: snapshot,
      status: 'new'
    });

    if (error) throw error;

    await client.from('projects')
      .update({status:'submitted', submitted_at:new Date().toISOString()})
      .eq('id', projectId);

    if (status) status.textContent = '✓ Project request submitted successfully.';
    form.reset();
  }

  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const status = $('#form-status');
      if (status) status.textContent = 'Submitting project request…';
      try {
        await submitContactRequest(form);
      } catch(err) {
        console.error(err);
        if (status) status.textContent = 'Could not submit to Supabase. Please try again or use the email link.';
      }
    });
  }

  window.fsCloud = {
    client,
    saveProject,
    saveTheme,
    loadProject,
    saveReferenceDocument,
    listReferenceDocuments,
    getReferenceDocument,
    openAccountModal,
    refreshSession,
    buildSnapshot
  };

  document.addEventListener('DOMContentLoaded', () => {
    initSharedAccountUI();
    initBuilderCloudUI();
    initContactForm();
    initAutosave();
    refreshSession().then(updateSharedAccountUI);
  });
})();


/* Auth color guard: override legacy red modal actions after dynamic modal creation. */
(function(){
  const AUTH_STYLE_ID='fs-auth-blue-guard';
  function installAuthBlueGuard(){
    if(document.getElementById(AUTH_STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=AUTH_STYLE_ID;
    s.textContent=`
      #account-modal button,.account-modal button,.auth-modal button,[data-account-modal] button,
      .account-modal-content button,.auth-card button,.auth-form button[type="submit"]{
        color:#fff!important;background:linear-gradient(135deg,#55c3ff,#1697e6 55%,#0c6fbe)!important;
        border-color:transparent!important;border-radius:12px!important;
        box-shadow:0 10px 25px rgba(22,151,230,.28),inset 0 1px 0 rgba(255,255,255,.35)!important;
        font-weight:850!important;text-shadow:none!important;
      }
      #account-modal .btn-secondary,.account-modal .btn-secondary,.auth-modal .btn-secondary,
      .account-modal-content .btn-secondary,.auth-card .btn-secondary{
        color:#0e2a47!important;background:#fff!important;border-color:#dce7f0!important;
        box-shadow:0 5px 14px rgba(14,42,71,.06)!important;
      }`;
    document.head.appendChild(s);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',installAuthBlueGuard);
  else installAuthBlueGuard();
})();

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
  const ACTIVE_PROJECT = 'fs-active-project-id';

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
      project_details: readJSON(DETAILS, {})
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
        local_snapshot_version: 1
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
        style_settings: c,
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

    setStatus('✓ Project saved to Supabase.', 'success');
    await loadProjectList();
    updateCloudUI();
    return project;
  }

  async function loadProject(projectId) {
    if (!state.user) throw new Error('Please sign in first.');

    setStatus('Loading project…');

    const [projectResult, selectionResult, featureResult] = await Promise.all([
      client.from('projects').select('*').eq('id', projectId).single(),
      client.from('project_selections').select('*').eq('project_id', projectId).order('sort_order'),
      client.from('project_features').select('*').eq('project_id', projectId).eq('is_selected', true).order('sort_order')
    ]);

    if (projectResult.error) throw projectResult.error;
    if (selectionResult.error) throw selectionResult.error;
    if (featureResult.error) throw featureResult.error;

    const p = projectResult.data;
    const selections = {};
    (selectionResult.data || []).forEach(row => {
      selections[row.catalog_code] = {
        code: row.catalog_code,
        name: row.catalog_name,
        category: row.category,
        page: row.source_page,
        selectedAt: Date.parse(row.created_at) || Date.now(),
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
    writeJSON(DETAILS, details);

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

  function updateCloudUI() {
    const loggedOut = $('#cloud-logged-out');
    const loggedIn = $('#cloud-logged-in');
    const userEmail = $('#cloud-user-email');
    const activeLabel = $('#active-cloud-project');

    if (loggedOut) loggedOut.hidden = !!state.user;
    if (loggedIn) loggedIn.hidden = !state.user;
    if (userEmail) userEmail.textContent = state.user?.email || '';
    if (activeLabel) activeLabel.textContent = state.activeProjectId ? 'Cloud project connected' : 'Local draft — not saved to cloud yet';
  }

  async function refreshSession() {
    const {data, error} = await client.auth.getSession();
    if (error) console.error(error);
    state.user = data?.session?.user || null;
    updateCloudUI();
    if (state.user) await loadProjectList();
  }

  async function initBuilderCloudUI() {
    if (!$('#cloud-account-panel')) return;

    $('#cloud-send-code')?.addEventListener('click', async () => {
      const email = $('#cloud-email')?.value.trim();
      if (!email) { setStatus('Enter your email address first.', 'error'); return; }
      setStatus('Sending verification code…');
      const {error} = await client.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true }
      });
      if (error) { setStatus(error.message, 'error'); return; }
      $('#cloud-otp-wrap').hidden = false;
      setStatus('Check your email for the verification code.', 'success');
    });

    $('#cloud-verify-code')?.addEventListener('click', async () => {
      const email = $('#cloud-email')?.value.trim();
      const token = $('#cloud-otp')?.value.trim();
      if (!email || !token) { setStatus('Enter your email and verification code.', 'error'); return; }
      setStatus('Verifying code…');
      const {data, error} = await client.auth.verifyOtp({email, token, type:'email'});
      if (error) { setStatus(error.message, 'error'); return; }
      state.user = data.user;
      setStatus('✓ Signed in. You can now save this project.', 'success');
      updateCloudUI();
      await loadProjectList();
    });

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

    client.auth.onAuthStateChange((_event, session) => {
      state.user = session?.user || null;
      updateCloudUI();
    });
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
    loadProject,
    refreshSession,
    buildSnapshot
  };

  document.addEventListener('DOMContentLoaded', () => {
    initBuilderCloudUI();
    initContactForm();
  });
})();

/* ── UTILITY ─────────────────────────────────────────────────────────────── */
function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (isError ? ' error' : '');
  t.classList.remove('hidden');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.add('hidden'), 3200);
}
window.showToast = showToast;

/* ── AUTH MODAL ──────────────────────────────────────────────────────────── */
window.showAuth = function(mode) {
  const modal = document.getElementById('auth-modal');
  const title  = document.getElementById('auth-title');
  const sub    = document.getElementById('auth-sub');
  const submit = document.getElementById('auth-submit');
  const sw     = document.getElementById('auth-switch-text');
  const nameW  = document.getElementById('auth-name-wrap');
  modal.classList.remove('hidden');
  if (mode === 'signup') {
    title.textContent  = 'Create your account';
    sub.textContent    = 'Join the KineMagic maker community.';
    submit.textContent = 'Create account';
    sw.innerHTML       = 'Already have one? <a href="#" onclick="showAuth(\'login\');return false;">Sign in</a>';
    nameW.classList.remove('hidden');
  } else {
    title.textContent  = 'Sign in to KineMagic';
    sub.textContent    = 'Access your projects, share builds, and collaborate.';
    submit.textContent = 'Sign in';
    sw.innerHTML       = 'No account? <a href="#" onclick="showAuth(\'signup\');return false;">Create one free</a>';
    nameW.classList.add('hidden');
  }
};
window.hideAuth = function() {
  document.getElementById('auth-modal').classList.add('hidden');
};

/* ── NAVIGATION ──────────────────────────────────────────────────────────── */
const PAGES = ['home','library','cad','blocks','community'];

window.navigate = function(page) {
  PAGES.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) { el.classList.toggle('active', p === page); el.classList.toggle('hidden', p !== page); }
  });
  document.querySelectorAll('.tnav').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });
  if (!window._rendered) window._rendered = {};
  if (!window._rendered[page]) {
    window._rendered[page] = true;
    const renderers = { home: renderHome, library: renderLibrary, cad: renderCAD, blocks: renderBlocks, community: renderCommunity };
    if (renderers[page]) renderers[page]();
  }
};

/* ── HOME PAGE ───────────────────────────────────────────────────────────── */
function renderHome() {
  const el = document.getElementById('page-home');
  el.innerHTML = `
  <div class="home-hero">
    <div>
      <h1>Design.<br><span>Simulate.</span><br>Build.</h1>
      <p>The open engineering platform for modular hardware — from 3D printables to full electromechanical systems with real-time code simulation and sharing.</p>
      <div class="hero-actions">
        <button class="btn-rust" style="padding:10px 24px;font-size:14px;" onclick="navigate('cad')">Open CAD Studio</button>
        <button class="btn-ghost" style="padding:10px 24px;font-size:14px;" onclick="navigate('blocks')">Block Coder</button>
      </div>
      <div class="hero-stats">
        <div><div class="hstat-n">12,847</div><div class="hstat-l">Models</div></div>
        <div><div class="hstat-n">3,219</div><div class="hstat-l">Projects</div></div>
        <div><div class="hstat-n">894</div><div class="hstat-l">Makers</div></div>
      </div>
    </div>
    <div class="hero-visual">
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hpat" x="0" y="0" width="40" height="35" patternUnits="userSpaceOnUse">
            <polygon points="20,1 38,11 38,24 20,34 2,24 2,11" fill="none" stroke="rgba(200,169,122,0.18)" stroke-width="0.8"/>
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#hpat)"/>
        <g transform="translate(200,150)">
          <polygon points="0,-70 60,-35 60,35 0,70 -60,35 -60,-35" fill="rgba(181,66,10,0.1)" stroke="#b5420a" stroke-width="1.5"/>
          <polygon points="0,-42 36,-21 36,21 0,42 -36,21 -36,-21" fill="rgba(200,169,122,0.1)" stroke="#c8a97a" stroke-width="1"/>
          <circle cx="0" cy="0" r="10" fill="rgba(181,66,10,0.3)" stroke="#b5420a" stroke-width="1.5"/>
          <line x1="0" y1="-70" x2="0" y2="-120" stroke="rgba(181,66,10,0.3)" stroke-width="1" stroke-dasharray="4,4"/>
          <line x1="60" y1="-35" x2="110" y2="-60" stroke="rgba(200,169,122,0.3)" stroke-width="1" stroke-dasharray="4,4"/>
          <line x1="-60" y1="-35" x2="-110" y2="-60" stroke="rgba(74,92,42,0.3)" stroke-width="1" stroke-dasharray="4,4"/>
          <circle cx="0" cy="-120" r="6" fill="rgba(181,66,10,0.4)" stroke="#b5420a" stroke-width="1"/>
          <circle cx="110" cy="-60" r="6" fill="rgba(200,169,122,0.4)" stroke="#c8a97a" stroke-width="1"/>
          <circle cx="-110" cy="-60" r="6" fill="rgba(74,92,42,0.4)" stroke="#4a5c2a" stroke-width="1"/>
        </g>
        <text x="16" y="290" fill="rgba(200,169,122,0.5)" font-size="9" font-family="monospace">KineMagic Labs · v1.0</text>
      </svg>
    </div>
  </div>

  <div class="home-features">
    <div class="feat-cell" onclick="navigate('cad')">
      <div class="feat-icon">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="14" height="14" rx="1"/><path d="M7 10h6M10 7v6"/>
        </svg>
      </div>
      <h3>CAD Studio</h3>
      <p>Onshape-style 3D tools — sketch, extrude, boolean ops, and real-time part assembly.</p>
    </div>
    <div class="feat-cell" onclick="navigate('blocks')">
      <div class="feat-icon">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="6" width="7" height="5" rx="1"/><rect x="11" y="6" width="7" height="5" rx="1"/>
          <path d="M9 8.5h2"/>
        </svg>
      </div>
      <h3>Block Coder</h3>
      <p>Scratch-style blocks or typed C++ — generates real Arduino firmware for ESP32.</p>
    </div>
    <div class="feat-cell" onclick="navigate('library')">
      <div class="feat-icon">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 4h12v12H4z"/><path d="M8 4v12M4 8h12"/>
        </svg>
      </div>
      <h3>3D Library</h3>
      <p>Thousands of verified printable models, all built to KM-20 modular spec.</p>
    </div>
    <div class="feat-cell" onclick="navigate('community')">
      <div class="feat-icon">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="7" cy="7" r="3"/><circle cx="13" cy="7" r="3"/>
          <path d="M2 17c0-3 2-5 5-5s5 2 5 5"/>
        </svg>
      </div>
      <h3>Community</h3>
      <p>Share projects, fork designs, collaborate live — all synced via Firebase.</p>
    </div>
  </div>

  <div class="home-feed">
    <div class="feed-main">
      <div class="feed-header">
        <h2>Latest from the workshop</h2>
        <button class="btn-outline" onclick="navigate('community')">See all →</button>
      </div>
      <div id="home-projects-list">
        ${demoProjects().map(projectCardHTML).join('')}
      </div>
    </div>
    <div class="feed-sidebar">
      <div class="sw-box">
        <div class="sw-title">Trending tags</div>
        ${[['#robotics','214'],['#servo-mount','178'],['#esp32','143'],['#printable','121'],['#pid','97']].map(([t,n])=>`
        <div class="trend-row"><span class="trend-tag">${t}</span><span class="trend-n">+${n} this week</span></div>`).join('')}
      </div>
      <div class="sw-box">
        <div class="sw-title">Top contributors</div>
        ${[['NX','nova_xander','9,240'],['RA','riya_ariel','7,810'],['TK','tobias_k','6,590'],['ML','mira_los','4,320']].map(([i,n,p],idx)=>`
        <div class="lb-row">
          <span class="lb-rank">${idx+1}</span>
          <div class="av" style="width:24px;height:24px;font-size:9px;background:var(--rust-bg);color:var(--rust);">${i}</div>
          <span>${n}</span><span class="lb-pts">${p} pts</span>
        </div>`).join('')}
      </div>
      <div class="sw-box">
        <div class="sw-title">Platform spec</div>
        <div style="font-size:11px;line-height:2;font-family:var(--font-mono);color:var(--ink3);">
          <div>Rail: <span style="color:var(--rust)">KM-20 std</span></div>
          <div>Pitch: <span style="color:var(--rust)">20 mm</span></div>
          <div>Connector: <span style="color:var(--rust)">KM-4P</span></div>
          <div>Voltage: <span style="color:var(--rust)">3.3 / 5 / 12 V</span></div>
          <div>Protocol: <span style="color:var(--rust)">KM-BUS v2</span></div>
        </div>
      </div>
    </div>
  </div>`;
}

/* ── PROJECT CARDS ───────────────────────────────────────────────────────── */
function demoProjects() {
  return [
    { initials:'NX', authorBg:'#f0ddd3', authorColor:'#b5420a', author:'nova_xander', role:'Mechanical Lead', time:'2 min ago',
      title:'Open-source modular robotic arm — v2.1', body:'Updated servo mount tolerances and new cable routing channels. All parts fit on a 220mm bed. Firmware included.',
      tags:['robotics','servo','3d-printable','arduino'], likes:312, comments:47, downloads:1200 },
    { initials:'RA', authorBg:'#dde5cf', authorColor:'#4a5c2a', author:'riya_ariel', role:'Electronics Contributor', time:'18 min ago',
      title:'ESP32 motor driver — plug-and-play module', body:'Standardized ESP32 carrier board that snaps into the KM rail. Pinout matches platform spec. Auto-detects attached servos on boot.',
      tags:['esp32','electronics','motor-driver'], likes:188, comments:23, downloads:640 },
    { initials:'TK', authorBg:'#ede0ce', authorColor:'#6b4c2a', author:'tobias_k', role:'Simulation Developer', time:'1 hr ago',
      title:'PID tuning visualizer — runs in Block Coder', body:'Drop motor parameters in and watch the response curve animate live. Kp/Ki/Kd blocks included. Works with any KM motor module.',
      tags:['simulation','PID','control-theory'], likes:97, comments:11, downloads:290 },
  ];
}

function projectCardHTML(p) {
  return `<div class="project-card">
    <div class="pc-top">
      <div class="av" style="background:${p.authorBg};color:${p.authorColor};">${p.initials}</div>
      <div><div class="pc-author">${p.author}</div><div class="pc-role">${p.role}</div></div>
      <div class="pc-time">${p.time}</div>
    </div>
    <div class="pc-title">${p.title}</div>
    <div class="pc-body">${p.body}</div>
    <div class="pc-tags">${p.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
    <div class="pc-foot">
      <span>▲ ${p.likes}</span>
      <span>💬 ${p.comments}</span>
      <span>⬇ ${p.downloads.toLocaleString()}</span>
      <span class="view-link">View project →</span>
    </div>
  </div>`;
}

/* ── LIBRARY PAGE ────────────────────────────────────────────────────────── */
function renderLibrary() {
  const models = [
    { name:'KM-20 Rail Bracket', dl:'4.2k', stars:'4.9', free:true, cat:'structural' },
    { name:'Servo Horn Adapter', dl:'3.1k', stars:'4.7', free:true, cat:'actuators' },
    { name:'ESP32 Carrier v2', dl:'1.8k', stars:'5.0', free:false, cat:'electronics' },
    { name:'Hex Frame Cell', dl:'2.6k', stars:'4.8', free:true, cat:'structural' },
    { name:'Linear Actuator Sled', dl:'990', stars:'4.6', free:true, cat:'structural' },
    { name:'Stepper Mount Pro', dl:'720', stars:'4.9', free:false, cat:'actuators' },
    { name:'12V PSU Enclosure', dl:'540', stars:'4.5', free:true, cat:'enclosures' },
    { name:'KM-4P Connector Set', dl:'3.8k', stars:'4.9', free:true, cat:'connectors' },
    { name:'IMU Sensor Bracket', dl:'1.1k', stars:'4.7', free:true, cat:'electronics' },
    { name:'Cable Chain 20mm', dl:'2.2k', stars:'4.6', free:true, cat:'structural' },
    { name:'Gear Box Housing', dl:'880', stars:'4.8', free:false, cat:'actuators' },
    { name:'Raspberry Pi Mount', dl:'1.5k', stars:'4.7', free:true, cat:'electronics' },
  ];

  const shapes = [
    `<svg width="70" height="70" viewBox="0 0 70 70"><rect x="15" y="15" width="40" height="40" fill="none" stroke="#b5420a" stroke-width="1.5"/><line x1="15" y1="15" x2="8" y2="8" stroke="#b5420a" stroke-width="1"/><line x1="55" y1="15" x2="62" y2="8" stroke="#b5420a" stroke-width="1"/><line x1="55" y1="55" x2="62" y2="62" stroke="#b5420a" stroke-width="1"/><rect x="8" y="8" width="40" height="40" fill="none" stroke="rgba(181,66,10,0.3)" stroke-width="0.8"/></svg>`,
    `<svg width="70" height="70" viewBox="0 0 70 70"><circle cx="35" cy="35" r="18" fill="none" stroke="#4a5c2a" stroke-width="1.5"/><circle cx="35" cy="35" r="10" fill="none" stroke="rgba(74,92,42,0.5)" stroke-width="1"/><line x1="35" y1="17" x2="35" y2="9" stroke="#4a5c2a" stroke-width="2"/><line x1="35" y1="53" x2="35" y2="61" stroke="#4a5c2a" stroke-width="2"/></svg>`,
    `<svg width="70" height="70" viewBox="0 0 70 70"><rect x="10" y="25" width="50" height="22" fill="none" stroke="#6b4c2a" stroke-width="1.5"/><rect x="15" y="29" width="7" height="7" fill="rgba(107,76,42,0.2)" stroke="#6b4c2a" stroke-width="0.8"/><rect x="27" y="29" width="7" height="7" fill="rgba(107,76,42,0.2)" stroke="#6b4c2a" stroke-width="0.8"/><rect x="39" y="29" width="7" height="7" fill="rgba(107,76,42,0.2)" stroke="#6b4c2a" stroke-width="0.8"/></svg>`,
    `<svg width="70" height="70" viewBox="0 0 70 70"><polygon points="35,12 55,24 55,48 35,60 15,48 15,24" fill="none" stroke="#b5420a" stroke-width="1.5"/><polygon points="35,20 48,28 48,44 35,52 22,44 22,28" fill="rgba(181,66,10,0.08)" stroke="rgba(181,66,10,0.4)" stroke-width="0.8"/></svg>`,
    `<svg width="70" height="70" viewBox="0 0 70 70"><rect x="25" y="12" width="20" height="46" rx="2" fill="none" stroke="#8a7a68" stroke-width="1.5"/><line x1="25" y1="22" x2="45" y2="22" stroke="rgba(138,122,104,0.4)" stroke-width="0.8"/><line x1="25" y1="48" x2="45" y2="48" stroke="rgba(138,122,104,0.4)" stroke-width="0.8"/></svg>`,
    `<svg width="70" height="70" viewBox="0 0 70 70"><path d="M25,15 L45,15 L55,30 L55,45 L45,55 L25,55 L15,45 L15,30 Z" fill="none" stroke="#4a5c2a" stroke-width="1.5"/></svg>`,
    `<svg width="70" height="70" viewBox="0 0 70 70"><rect x="10" y="20" width="50" height="30" fill="none" stroke="#c8a97a" stroke-width="1.5"/><rect x="20" y="15" width="10" height="5" fill="none" stroke="#c8a97a" stroke-width="1"/><rect x="40" y="15" width="10" height="5" fill="none" stroke="#c8a97a" stroke-width="1"/></svg>`,
    `<svg width="70" height="70" viewBox="0 0 70 70"><circle cx="35" cy="35" r="5" fill="#6b4c2a"/><circle cx="35" cy="35" r="12" fill="none" stroke="#6b4c2a" stroke-width="1.5"/><circle cx="35" cy="35" r="20" fill="none" stroke="rgba(107,76,42,0.4)" stroke-width="1"/></svg>`,
    `<svg width="70" height="70" viewBox="0 0 70 70"><rect x="18" y="28" width="34" height="16" rx="2" fill="none" stroke="#4a5c2a" stroke-width="1.5"/><line x1="18" y1="36" x2="52" y2="36" stroke="rgba(74,92,42,0.4)" stroke-width="0.8"/><circle cx="25" cy="32" r="2" fill="#4a5c2a"/></svg>`,
    `<svg width="70" height="70" viewBox="0 0 70 70"><path d="M20,35 Q20,15 35,15 Q50,15 50,35 Q50,55 35,55 Q20,55 20,35 Z" fill="none" stroke="#b5420a" stroke-width="1.5"/></svg>`,
    `<svg width="70" height="70" viewBox="0 0 70 70"><polygon points="35,10 60,25 60,45 35,60 10,45 10,25" fill="none" stroke="#8a7a68" stroke-width="1.5"/><line x1="10" y1="25" x2="60" y2="25" stroke="rgba(138,122,104,0.3)" stroke-width="0.8"/><line x1="10" y1="45" x2="60" y2="45" stroke="rgba(138,122,104,0.3)" stroke-width="0.8"/></svg>`,
    `<svg width="70" height="70" viewBox="0 0 70 70"><rect x="22" y="15" width="26" height="40" rx="3" fill="none" stroke="#4a5c2a" stroke-width="1.5"/><rect x="28" y="10" width="14" height="6" rx="1" fill="none" stroke="#4a5c2a" stroke-width="1"/></svg>`,
  ];

  const el = document.getElementById('page-library');
  const cats = ['All','Structural','Electronics','Actuators','Enclosures','Connectors'];
  el.innerHTML = `
  <div class="lib-toolbar">
    <h2>3D Model Library</h2>
    ${cats.map((c,i)=>`<button class="filt${i===0?' on':''}" onclick="libFilter(this,'${c.toLowerCase()}')">${c}</button>`).join('')}
    <div class="lib-search">
      <input type="text" placeholder="Search models..." oninput="libSearch(this.value)"/>
      <button class="btn-rust" onclick="showAuth('signup')">+ Upload</button>
    </div>
  </div>
  <div class="model-grid" id="model-grid">
    ${models.map((m,i)=>`
    <div class="mcard" data-cat="${m.cat}" data-name="${m.name.toLowerCase()}">
      <div class="mthumb">${shapes[i % shapes.length]}<span class="mbadge ${m.free?'free':'pro'}">${m.free?'FREE':'PRO'}</span></div>
      <div class="minfo">
        <div class="mname">${m.name}</div>
        <div class="mmeta"><span>⬇ ${m.dl}</span><span>★ ${m.stars}</span></div>
      </div>
    </div>`).join('')}
  </div>`;
}

window.libFilter = function(btn, cat) {
  document.querySelectorAll('.filt').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  document.querySelectorAll('.mcard').forEach(c => {
    c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none';
  });
};

window.libSearch = function(q) {
  document.querySelectorAll('.mcard').forEach(c => {
    c.style.display = c.dataset.name.includes(q.toLowerCase()) ? '' : 'none';
  });
};

/* ── COMMUNITY PAGE ──────────────────────────────────────────────────────── */
function renderCommunity() {
  const el = document.getElementById('page-community');
  el.innerHTML = `
  <div class="comm-layout">
    <div class="comm-feed">
      <div class="feed-header">
        <h2>Community Workshop</h2>
        <button class="btn-rust" onclick="window._currentUser ? showPostModal() : showAuth('signup')">+ Share Project</button>
      </div>
      <div id="community-list">
        ${demoProjects().map(projectCardHTML).join('')}
        <div id="firebase-projects"></div>
      </div>
    </div>
    <div class="comm-side">
      <div class="sw-box">
        <div class="sw-title">Trending tags</div>
        ${[['#robotics','214'],['#servo-mount','178'],['#esp32','143'],['#printable','121'],['#pid','97']].map(([t,n])=>`
        <div class="trend-row"><span class="trend-tag">${t}</span><span class="trend-n">+${n}</span></div>`).join('')}
      </div>
      <div class="sw-box">
        <div class="sw-title">Top contributors</div>
        ${[['NX','nova_xander','9,240'],['RA','riya_ariel','7,810'],['TK','tobias_k','6,590'],['ML','mira_los','4,320']].map(([i,n,p],idx)=>`
        <div class="lb-row">
          <span class="lb-rank">${idx+1}</span>
          <div class="av" style="width:24px;height:24px;font-size:9px;background:var(--rust-bg);color:var(--rust);">${i}</div>
          <span>${n}</span><span class="lb-pts">${p} pts</span>
        </div>`).join('')}
      </div>
    </div>
  </div>`;

  if (window.loadProjects) {
    window.loadProjects(projects => {
      const el2 = document.getElementById('firebase-projects');
      if (el2 && projects.length) {
        el2.innerHTML = projects.map(p => projectCardHTML({
          initials: (p.author||'?').slice(0,2).toUpperCase(),
          authorBg:'#f0ddd3', authorColor:'#b5420a',
          author: p.author||'anonymous', role:'Community Member', time:'recently',
          title: p.title||'Untitled', body: p.description||'',
          tags: p.tags||[], likes:p.likes||0, comments:0, downloads:p.downloads||0
        })).join('');
      }
    });
  }
}

/* ── INIT ────────────────────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  window._rendered = {};
  navigate('home');
});

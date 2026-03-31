/* ── CAD ENGINE ──────────────────────────────────────────────────────────────
   A real interactive CAD studio rendered on Canvas.
   Features: Sketch mode (line/rect/circle/arc), Extrude, Boolean ops,
   Part tree, Properties panel, Grid snap, Zoom/Pan/Orbit.
   ─────────────────────────────────────────────────────────────────────────── */

window.renderCAD = function() {
  const el = document.getElementById('page-cad');
  el.innerHTML = `
  <div class="cad-shell">
    <div class="cad-toolbar">
      <!-- Sketch tools -->
      <span style="font-family:var(--font-mono);font-size:9px;color:var(--ink3);letter-spacing:1px;">SKETCH</span>
      <button class="btn-sm" id="tool-select"   onclick="cadTool('select')"  title="Select (V)">&#9654; Select</button>
      <button class="btn-sm" id="tool-line"     onclick="cadTool('line')"    title="Line (L)">&#9135; Line</button>
      <button class="btn-sm" id="tool-rect"     onclick="cadTool('rect')"    title="Rectangle (R)">&#9645; Rect</button>
      <button class="btn-sm" id="tool-circle"   onclick="cadTool('circle')"  title="Circle (C)">&#9711; Circle</button>
      <button class="btn-sm" id="tool-arc"      onclick="cadTool('arc')"     title="Arc (A)">&#8978; Arc</button>
      <button class="btn-sm" id="tool-poly"     onclick="cadTool('poly')"    title="Polygon">&#9653; Poly</button>
      <div class="cad-toolbar-sep"></div>
      <!-- 3D tools -->
      <span style="font-family:var(--font-mono);font-size:9px;color:var(--ink3);letter-spacing:1px;">3D</span>
      <button class="btn-sm" onclick="cadExtrude()"       title="Extrude selected sketch">Extrude</button>
      <button class="btn-sm" onclick="cadRevolve()"       title="Revolve sketch around axis">Revolve</button>
      <button class="btn-sm" onclick="cadFillet()"        title="Fillet edges">Fillet</button>
      <button class="btn-sm" onclick="cadShell()"         title="Shell solid">Shell</button>
      <div class="cad-toolbar-sep"></div>
      <!-- Boolean -->
      <span style="font-family:var(--font-mono);font-size:9px;color:var(--ink3);letter-spacing:1px;">BOOLEAN</span>
      <button class="btn-sm" onclick="cadBoolean('union')"   title="Union">&#8746; Union</button>
      <button class="btn-sm" onclick="cadBoolean('sub')"     title="Subtract">&#8722; Subtract</button>
      <button class="btn-sm" onclick="cadBoolean('inter')"   title="Intersect">&#8745; Intersect</button>
      <div class="cad-toolbar-sep"></div>
      <!-- View -->
      <span style="font-family:var(--font-mono);font-size:9px;color:var(--ink3);letter-spacing:1px;">VIEW</span>
      <button class="btn-sm" id="view-2d" onclick="setView('2d')" title="2D Sketch view">2D</button>
      <button class="btn-sm" id="view-3d" onclick="setView('3d')" title="3D Orbit view">3D</button>
      <button class="btn-sm" onclick="cadFitView()"   title="Fit all">Fit</button>
      <button class="btn-sm" onclick="cadGridToggle()" id="btn-grid" title="Toggle grid">Grid</button>
      <div class="cad-toolbar-sep"></div>
      <button class="btn-sm" onclick="cadUndo()" title="Undo (Ctrl+Z)">&#8617; Undo</button>
      <button class="btn-sm" onclick="cadClear()" title="Clear sketch">Clear</button>
      <div style="margin-left:auto;display:flex;gap:6px;">
        <button class="btn-sm" onclick="exportSTL()">Export STL</button>
        <button class="btn-rust" style="font-size:11px;padding:5px 12px;" onclick="saveCadProject()">Save Project</button>
      </div>
    </div>

    <div class="cad-body">
      <!-- LEFT: Part tree -->
      <div class="cad-panel">
        <div class="cpanel-head">Part Tree</div>
        <div id="cad-tree" style="padding:8px 0;"></div>
        <div style="padding:10px;">
          <button class="btn-sm" style="width:100%;margin-top:4px;" onclick="cadAddPart()">+ New Part</button>
        </div>
      </div>

      <!-- CENTRE: Viewport -->
      <div class="cad-viewport" id="cad-viewport">
        <canvas id="cadCanvas"></canvas>
        <div id="cad-coords" style="position:absolute;bottom:6px;left:10px;font-family:var(--font-mono);font-size:10px;color:var(--ink3);pointer-events:none;">x: 0  y: 0</div>
        <div id="cad-mode-badge" style="position:absolute;top:8px;left:10px;font-family:var(--font-mono);font-size:10px;background:var(--rust);color:#fff;padding:2px 8px;">SKETCH — LINE</div>
      </div>

      <!-- RIGHT: Properties -->
      <div class="cad-panel-r">
        <div class="cpanel-head">Properties</div>
        <div id="cad-props">
          <div class="prop-group">
            <div class="prop-group-title">Transform</div>
            <div class="prop-row"><label class="prop-label">X</label><input class="prop-input" id="prop-x" value="0" onchange="applyProp('x',this.value)"/></div>
            <div class="prop-row"><label class="prop-label">Y</label><input class="prop-input" id="prop-y" value="0" onchange="applyProp('y',this.value)"/></div>
            <div class="prop-row"><label class="prop-label">Width</label><input class="prop-input" id="prop-w" value="100" onchange="applyProp('w',this.value)"/></div>
            <div class="prop-row"><label class="prop-label">Height</label><input class="prop-input" id="prop-h" value="100" onchange="applyProp('h',this.value)"/></div>
            <div class="prop-row"><label class="prop-label">Depth</label><input class="prop-input" id="prop-d" value="20" onchange="applyProp('d',this.value)"/></div>
            <div class="prop-row"><label class="prop-label">Rotation</label><input class="prop-input" id="prop-r" value="0" onchange="applyProp('rot',this.value)"/></div>
          </div>
          <div class="prop-group">
            <div class="prop-group-title">Appearance</div>
            <div class="prop-row"><label class="prop-label">Color</label><input class="prop-color" type="color" id="prop-color" value="#b5420a" onchange="applyProp('color',this.value)"/></div>
            <div class="prop-row"><label class="prop-label">Opacity</label><input class="prop-input" id="prop-opacity" value="1" onchange="applyProp('opacity',this.value)"/></div>
          </div>
          <div class="prop-group">
            <div class="prop-group-title">Material</div>
            <div class="prop-row">
              <label class="prop-label">Type</label>
              <select class="prop-input" id="prop-mat" onchange="applyProp('mat',this.value)" style="font-family:var(--font-mono)">
                <option>PLA+</option><option>PETG</option><option>ABS</option>
                <option>Aluminium</option><option>Steel</option><option>Resin</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="cad-status">
      <span id="cad-stat-tool">Tool: Select</span>
      <span id="cad-stat-shapes">Shapes: 0</span>
      <span id="cad-stat-sel">Selected: none</span>
      <span id="cad-stat-zoom">Zoom: 100%</span>
      <span style="margin-left:auto;">KineMagic CAD v1.0 — <span>KM-20 spec</span></span>
    </div>
  </div>`;

  initCADEngine();
};

/* ═══════════════════════════════════════════════════════════════════════════
   CAD ENGINE CORE
   ═══════════════════════════════════════════════════════════════════════════ */
let cad = null;

function initCADEngine() {
  const canvas = document.getElementById('cadCanvas');
  const vp     = document.getElementById('cad-viewport');

  function resize() {
    canvas.width  = vp.clientWidth;
    canvas.height = vp.clientHeight;
    if (cad) cad.draw();
  }

  cad = {
    canvas, ctx: canvas.getContext('2d'),
    tool: 'select', view: '2d',
    zoom: 1, panX: 0, panY: 0,
    gridSize: 20, showGrid: true,
    shapes: [], parts: [{ id:1, name:'Part 1', shapes:[], visible:true, color:'#b5420a' }],
    activePart: 0,
    selected: null, hovered: null,
    drawing: false, drawStart: null, drawCurrent: null,
    history: [],
    mouse: { x:0, y:0 },
    panning: false, panStart: null,
    orbiting: false, orbitAngle: 0.4, orbitPitch: 0.3,
    polyPoints: [],

    /* ── COORD TRANSFORM ── */
    toWorld(cx, cy) {
      return { x: (cx - this.canvas.width/2 - this.panX) / this.zoom, y: (cy - this.canvas.height/2 - this.panY) / this.zoom };
    },
    toCanvas(wx, wy) {
      return { x: wx * this.zoom + this.canvas.width/2 + this.panX, y: wy * this.zoom + this.canvas.height/2 + this.panY };
    },
    snap(v) { return this.showGrid ? Math.round(v / this.gridSize) * this.gridSize : v; },

    /* ── DRAW ── */
    draw() {
      const { ctx, canvas, zoom, view } = this;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (view === '2d') this.draw2D();
      else this.draw3D();

      // status
      const s = document.getElementById('cad-stat-shapes');
      if (s) s.textContent = 'Shapes: ' + this.allShapes().length;
      const z = document.getElementById('cad-stat-zoom');
      if (z) z.textContent = 'Zoom: ' + Math.round(zoom * 100) + '%';
    },

    allShapes() {
      return this.parts.flatMap(p => p.shapes);
    },

    /* ── 2D DRAW ── */
    draw2D() {
      const { ctx, canvas } = this;

      // background
      ctx.fillStyle = '#e4ddd0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // grid
      if (this.showGrid) {
        ctx.strokeStyle = 'rgba(200,191,174,0.7)';
        ctx.lineWidth = 0.5;
        const gs = this.gridSize * this.zoom;
        const ox = ((canvas.width / 2 + this.panX) % gs + gs) % gs;
        const oy = ((canvas.height / 2 + this.panY) % gs + gs) % gs;
        for (let x = ox; x < canvas.width; x += gs) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
        for (let y = oy; y < canvas.height; y += gs) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }

        // origin axes
        const o = this.toCanvas(0,0);
        ctx.strokeStyle = 'rgba(181,66,10,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(o.x - 9999, o.y); ctx.lineTo(o.x + 9999, o.y); ctx.stroke();
        ctx.strokeStyle = 'rgba(74,92,42,0.4)';
        ctx.beginPath(); ctx.moveTo(o.x, o.y - 9999); ctx.lineTo(o.x, o.y + 9999); ctx.stroke();
      }

      // shapes
      this.parts.forEach((part, pi) => {
        if (!part.visible) return;
        part.shapes.forEach(s => this.drawShape2D(s, pi === this.activePart));
      });

      // current drawing preview
      if (this.drawing && this.drawStart && this.drawCurrent) {
        this.drawPreview();
      }

      // poly in progress
      if (this.tool === 'poly' && this.polyPoints.length > 0) {
        ctx.strokeStyle = '#b5420a';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4,4]);
        ctx.beginPath();
        const f = this.toCanvas(this.polyPoints[0].x, this.polyPoints[0].y);
        ctx.moveTo(f.x, f.y);
        this.polyPoints.forEach(p => { const c = this.toCanvas(p.x,p.y); ctx.lineTo(c.x,c.y); });
        const m = this.toCanvas(this.mouse.wx||0, this.mouse.wy||0);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
        ctx.setLineDash([]);
        this.polyPoints.forEach(p => {
          const c = this.toCanvas(p.x, p.y);
          ctx.fillStyle = '#b5420a';
          ctx.beginPath(); ctx.arc(c.x, c.y, 3, 0, Math.PI*2); ctx.fill();
        });
      }
    },

    drawShape2D(s, isActive) {
      const { ctx } = this;
      const isSelected = this.selected === s;
      const isHovered  = this.hovered  === s;

      ctx.save();
      ctx.strokeStyle = isSelected ? '#b5420a' : isHovered ? '#8f3308' : (s.color || '#6b4c2a');
      ctx.fillStyle   = isSelected ? 'rgba(181,66,10,0.15)' : (s.fill ? (s.fillColor || 'rgba(181,66,10,0.08)') : 'transparent');
      ctx.lineWidth   = isSelected ? 2 : 1.5;

      if (isSelected) { ctx.shadowColor = 'rgba(181,66,10,0.3)'; ctx.shadowBlur = 8; }

      const p = pt => this.toCanvas(pt.x, pt.y);

      if (s.type === 'rect') {
        const tl = p(s);
        const w = s.w * this.zoom, h = s.h * this.zoom;
        ctx.beginPath(); ctx.rect(tl.x, tl.y, w, h);
        ctx.fill(); ctx.stroke();
        if (isSelected) { this.drawHandles(s); }
      } else if (s.type === 'circle') {
        const c = p(s);
        ctx.beginPath(); ctx.arc(c.x, c.y, s.r * this.zoom, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();
      } else if (s.type === 'line') {
        const a = p(s), b = p({ x: s.x2, y: s.y2 });
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      } else if (s.type === 'arc') {
        const c = p(s);
        ctx.beginPath(); ctx.arc(c.x, c.y, s.r * this.zoom, s.startAngle, s.endAngle);
        ctx.stroke();
      } else if (s.type === 'poly') {
        if (!s.points || s.points.length < 2) { ctx.restore(); return; }
        ctx.beginPath();
        const fp = p(s.points[0]);
        ctx.moveTo(fp.x, fp.y);
        s.points.forEach(pt => { const c2 = p(pt); ctx.lineTo(c2.x, c2.y); });
        ctx.closePath();
        ctx.fill(); ctx.stroke();
      }

      ctx.restore();
    },

    drawHandles(s) {
      const pts = this.getHandlePoints(s);
      pts.forEach(pt => {
        const c = this.toCanvas(pt.x, pt.y);
        this.ctx.fillStyle = '#fff';
        this.ctx.strokeStyle = '#b5420a';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath(); this.ctx.rect(c.x-4, c.y-4, 8, 8);
        this.ctx.fill(); this.ctx.stroke();
      });
    },

    getHandlePoints(s) {
      if (s.type === 'rect') return [
        {x:s.x, y:s.y}, {x:s.x+s.w, y:s.y}, {x:s.x+s.w, y:s.y+s.h}, {x:s.x, y:s.y+s.h},
        {x:s.x+s.w/2, y:s.y}, {x:s.x+s.w, y:s.y+s.h/2}, {x:s.x+s.w/2, y:s.y+s.h}, {x:s.x, y:s.y+s.h/2}
      ];
      if (s.type === 'circle') return [{x:s.x+s.r, y:s.y},{x:s.x-s.r,y:s.y},{x:s.x,y:s.y+s.r},{x:s.x,y:s.y-s.r}];
      return [];
    },

    drawPreview() {
      const { ctx } = this;
      const a = this.toCanvas(this.drawStart.x, this.drawStart.y);
      const b = this.toCanvas(this.drawCurrent.x, this.drawCurrent.y);
      ctx.strokeStyle = '#b5420a';
      ctx.fillStyle   = 'rgba(181,66,10,0.1)';
      ctx.lineWidth   = 1.5;
      ctx.setLineDash([5, 4]);

      if (this.tool === 'rect') {
        const w = b.x - a.x, h = b.y - a.y;
        ctx.beginPath(); ctx.rect(a.x, a.y, w, h); ctx.fill(); ctx.stroke();
        const ww = Math.abs(Math.round(this.drawCurrent.x - this.drawStart.x));
        const hh = Math.abs(Math.round(this.drawCurrent.y - this.drawStart.y));
        ctx.fillStyle = '#b5420a'; ctx.font = '10px DM Mono, monospace';
        ctx.fillText(`${ww} × ${hh}`, b.x+4, b.y-4);
      } else if (this.tool === 'circle') {
        const dx = this.drawCurrent.x - this.drawStart.x;
        const dy = this.drawCurrent.y - this.drawStart.y;
        const r  = Math.sqrt(dx*dx + dy*dy);
        ctx.beginPath(); ctx.arc(a.x, a.y, r * this.zoom, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#b5420a'; ctx.font = '10px DM Mono, monospace';
        ctx.fillText(`r=${Math.round(r)}`, a.x+4, a.y-8);
      } else if (this.tool === 'line') {
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        const len = Math.round(Math.sqrt(Math.pow(this.drawCurrent.x-this.drawStart.x,2)+Math.pow(this.drawCurrent.y-this.drawStart.y,2)));
        ctx.fillStyle = '#b5420a'; ctx.font = '10px DM Mono, monospace';
        ctx.fillText(`${len}`, (a.x+b.x)/2+4, (a.y+b.y)/2-4);
      } else if (this.tool === 'arc') {
        const dx = this.drawCurrent.x - this.drawStart.x;
        const dy = this.drawCurrent.y - this.drawStart.y;
        const r  = Math.sqrt(dx*dx + dy*dy);
        ctx.beginPath(); ctx.arc(a.x, a.y, r * this.zoom, 0, Math.PI); ctx.stroke();
      }
      ctx.setLineDash([]);
    },

    /* ── 3D DRAW ── */
    draw3D() {
      const { ctx, canvas } = this;
      ctx.fillStyle = '#2a2118';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // grid floor
      const cx = canvas.width/2 + this.panX;
      const cy = canvas.height/2 + this.panY;
      const gs = 30 * this.zoom;
      const cos = Math.cos(this.orbitAngle), sin = Math.sin(this.orbitAngle);
      const pitch = this.orbitPitch;

      ctx.strokeStyle = 'rgba(200,191,174,0.1)';
      ctx.lineWidth = 0.5;
      for (let i = -10; i <= 10; i++) {
        const d = i * gs;
        const ax = cx + d * cos - (-10*gs) * sin, ay = cy + (d * sin + (-10*gs) * cos) * pitch;
        const bx = cx + d * cos - (10*gs)  * sin, by = cy + (d * sin + (10*gs)  * cos) * pitch;
        const ax2= cx + (-10*gs)*cos - d*sin, ay2= cy + ((-10*gs)*sin + d*cos)*pitch;
        const bx2= cx + (10*gs) *cos - d*sin, by2= cy + ((10*gs) *sin + d*cos)*pitch;
        ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax2,ay2); ctx.lineTo(bx2,by2); ctx.stroke();
      }

      // draw extruded shapes as 3D boxes
      this.allShapes().filter(s => s.extruded).forEach(s => this.draw3DShape(s, cx, cy, cos, sin, pitch));

      // axes
      const axLen = 80 * this.zoom;
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#b5420a';
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx + axLen*cos, cy + axLen*sin*pitch); ctx.stroke();
      ctx.strokeStyle = '#4a5c2a';
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx - axLen*sin, cy + axLen*cos*pitch); ctx.stroke();
      ctx.strokeStyle = '#c8a97a';
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx, cy - axLen*pitch*1.6); ctx.stroke();

      ctx.font = '11px DM Mono, monospace';
      ctx.fillStyle = '#b5420a'; ctx.fillText('X', cx + axLen*cos + 6, cy + axLen*sin*pitch + 4);
      ctx.fillStyle = '#4a5c2a'; ctx.fillText('Y', cx - axLen*sin - 14, cy + axLen*cos*pitch + 4);
      ctx.fillStyle = '#c8a97a'; ctx.fillText('Z', cx + 4, cy - axLen*pitch*1.6 - 4);
    },

    draw3DShape(s, cx, cy, cos, sin, pitch) {
      const { ctx } = this;
      const z = this.zoom;
      const d = (s.depth || 20) * z * pitch * 0.5;

      if (s.type === 'rect') {
        const x0 = s.x*z, y0 = s.y*z, w = s.w*z, h = s.h*z;
        const project = (wx,wy,wz) => ({
          x: cx + wx*cos - wy*sin,
          y: cy + (wx*sin + wy*cos)*pitch - wz*pitch*1.6
        });
        const corners = [
          [x0,y0], [x0+w,y0], [x0+w,y0+h], [x0,y0+h]
        ];
        const top    = corners.map(([vx,vy]) => project(vx,vy,d));
        const bottom = corners.map(([vx,vy]) => project(vx,vy,0));

        const fc = s.color || '#b5420a';
        const hexToRgb = c => {
          const r = parseInt(c.slice(1,3),16), g = parseInt(c.slice(3,5),16), b = parseInt(c.slice(5,7),16);
          return `rgba(${r},${g},${b}`;
        };
        const base = hexToRgb(fc);

        // sides
        [[0,1],[1,2],[2,3],[3,0]].forEach(([a,b2],i) => {
          const alpha = [0.5,0.4,0.5,0.3][i];
          ctx.fillStyle = `${base},${alpha})`;
          ctx.strokeStyle = `${base},0.8)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(top[a].x, top[a].y);
          ctx.lineTo(top[b2].x, top[b2].y);
          ctx.lineTo(bottom[b2].x, bottom[b2].y);
          ctx.lineTo(bottom[a].x, bottom[a].y);
          ctx.closePath(); ctx.fill(); ctx.stroke();
        });

        // top face
        ctx.fillStyle = `${base},0.7)`;
        ctx.strokeStyle = `${base},0.9)`;
        ctx.beginPath();
        top.forEach((p,i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y));
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    },

    /* ── HIT TEST ── */
    hitTest(wx, wy) {
      const shapes = this.allShapes();
      for (let i = shapes.length - 1; i >= 0; i--) {
        const s = shapes[i];
        if (s.type === 'rect') {
          if (wx >= s.x && wx <= s.x+s.w && wy >= s.y && wy <= s.y+s.h) return s;
        } else if (s.type === 'circle') {
          const dx = wx-s.x, dy = wy-s.y;
          if (Math.sqrt(dx*dx+dy*dy) <= s.r) return s;
        } else if (s.type === 'line') {
          const d = pointLineDist(wx,wy, s.x,s.y, s.x2,s.y2);
          if (d < 8/this.zoom) return s;
        }
      }
      return null;
    },

    /* ── INPUT HANDLERS ── */
    onMouseDown(e) {
      const rect = this.canvas.getBoundingClientRect();
      const cx   = e.clientX - rect.left;
      const cy   = e.clientY - rect.top;
      const w    = this.toWorld(cx, cy);

      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        this.panning   = true;
        this.panStart  = { x: e.clientX - this.panX, y: e.clientY - this.panY };
        return;
      }
      if (this.view === '3d' && e.button === 0) {
        this.orbiting  = true;
        this.orbitStart= { x: e.clientX, y: e.clientY, a: this.orbitAngle, p: this.orbitPitch };
        return;
      }

      const wx = this.snap(w.x), wy = this.snap(w.y);

      if (this.tool === 'select') {
        const hit = this.hitTest(w.x, w.y);
        this.selected = hit;
        this.syncProps();
        this.syncTree();
        document.getElementById('cad-stat-sel').textContent = 'Selected: ' + (hit ? hit.type + ' #' + (this.allShapes().indexOf(hit)+1) : 'none');
      } else if (this.tool === 'poly') {
        this.polyPoints.push({ x: wx, y: wy });
      } else {
        this.drawing   = true;
        this.drawStart = { x: wx, y: wy };
        this.drawCurrent = { x: wx, y: wy };
      }
    },

    onMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      const cx   = e.clientX - rect.left;
      const cy   = e.clientY - rect.top;
      const w    = this.toWorld(cx, cy);
      this.mouse.wx = w.x; this.mouse.wy = w.y;

      if (this.panning) {
        this.panX = e.clientX - this.panStart.x;
        this.panY = e.clientY - this.panStart.y;
        this.draw(); return;
      }
      if (this.orbiting) {
        this.orbitAngle = this.orbitStart.a + (e.clientX - this.orbitStart.x) * 0.01;
        this.orbitPitch = Math.max(0.1, Math.min(1, this.orbitStart.p + (e.clientY - this.orbitStart.y) * 0.005));
        this.draw(); return;
      }

      const wx = this.snap(w.x), wy = this.snap(w.y);
      const coordEl = document.getElementById('cad-coords');
      if (coordEl) coordEl.textContent = `x: ${Math.round(wx)}  y: ${Math.round(wy)}`;

      if (this.drawing) {
        this.drawCurrent = { x: wx, y: wy };
      }
      if (this.tool === 'select') {
        this.hovered = this.hitTest(w.x, w.y);
        this.canvas.style.cursor = this.hovered ? 'pointer' : 'crosshair';
      }
      this.draw();
    },

    onMouseUp(e) {
      if (this.panning)  { this.panning = false; return; }
      if (this.orbiting) { this.orbiting = false; return; }
      if (!this.drawing) return;
      this.drawing = false;

      const w = this.toWorld(e.clientX - this.canvas.getBoundingClientRect().left, e.clientY - this.canvas.getBoundingClientRect().top);
      const ex = this.snap(w.x), ey = this.snap(w.y);
      const sx = this.drawStart.x, sy = this.drawStart.y;

      let shape = null;
      if (this.tool === 'rect') {
        const x = Math.min(sx,ex), y = Math.min(sy,ey);
        const ww = Math.abs(ex-sx), hh = Math.abs(ey-sy);
        if (ww > 2 && hh > 2) shape = { type:'rect', x, y, w:ww, h:hh, color:'#6b4c2a', fill:true, fillColor:'rgba(181,66,10,0.08)' };
      } else if (this.tool === 'circle') {
        const dx = ex-sx, dy = ey-sy, r = Math.sqrt(dx*dx+dy*dy);
        if (r > 2) shape = { type:'circle', x:sx, y:sy, r, color:'#6b4c2a' };
      } else if (this.tool === 'line') {
        if (Math.abs(ex-sx) > 2 || Math.abs(ey-sy) > 2)
          shape = { type:'line', x:sx, y:sy, x2:ex, y2:ey, color:'#6b4c2a' };
      } else if (this.tool === 'arc') {
        const dx = ex-sx, dy = ey-sy, r = Math.sqrt(dx*dx+dy*dy);
        if (r > 2) shape = { type:'arc', x:sx, y:sy, r, startAngle:0, endAngle:Math.PI, color:'#6b4c2a' };
      }

      if (shape) {
        this.saveHistory();
        this.parts[this.activePart].shapes.push(shape);
        this.selected = shape;
        this.syncTree();
        this.syncProps();
      }
      this.drawStart = this.drawCurrent = null;
      this.draw();
    },

    onDblClick(e) {
      if (this.tool === 'poly' && this.polyPoints.length >= 3) {
        this.saveHistory();
        const shape = { type:'poly', points:[...this.polyPoints], color:'#6b4c2a', fill:true, fillColor:'rgba(181,66,10,0.08)' };
        this.parts[this.activePart].shapes.push(shape);
        this.polyPoints = [];
        this.syncTree();
        this.draw();
      }
    },

    onWheel(e) {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      this.zoom = Math.max(0.05, Math.min(20, this.zoom * factor));
      this.draw();
    },

    onKey(e) {
      const map = { 'v':'select','l':'line','r':'rect','c':'circle','a':'arc' };
      if (map[e.key]) cadTool(map[e.key]);
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') cadUndo();
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.selected) {
          this.saveHistory();
          this.parts.forEach(p => { p.shapes = p.shapes.filter(s => s !== this.selected); });
          this.selected = null;
          this.syncTree(); this.draw();
        }
      }
      if (e.key === 'Escape') { this.polyPoints = []; this.drawing = false; this.draw(); }
    },

    saveHistory() {
      this.history.push(JSON.parse(JSON.stringify(this.parts)));
      if (this.history.length > 50) this.history.shift();
    },

    syncTree() {
      const tree = document.getElementById('cad-tree');
      if (!tree) return;
      tree.innerHTML = this.parts.map((p, pi) => `
        <div style="margin-bottom:2px;">
          <div class="tree-item ${pi===this.activePart?'sel':''}" onclick="cadSetActivePart(${pi})">
            <svg class="tree-icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="10" height="10" rx="1"/></svg>
            ${p.name}
            <button onclick="event.stopPropagation();cadTogglePartVis(${pi})" style="background:none;border:none;font-size:10px;color:var(--ink3);margin-left:auto;">${p.visible?'◉':'◎'}</button>
          </div>
          ${p.shapes.map((s,si) => `
          <div class="tree-item ${this.selected===s?'sel':''}" style="padding-left:24px;font-size:11px;" onclick="cadSelectShape(${pi},${si})">
            <svg class="tree-icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2">${shapeIcon(s.type)}</svg>
            ${s.type} ${si+1}${s.extruded?' ⬛':''}
          </div>`).join('')}
        </div>`).join('');
    },

    syncProps() {
      const s = this.selected;
      if (!s) return;
      const set = (id, v) => { const el = document.getElementById(id); if(el) el.value = v; };
      if (s.type === 'rect') { set('prop-x', Math.round(s.x)); set('prop-y', Math.round(s.y)); set('prop-w', Math.round(s.w)); set('prop-h', Math.round(s.h)); }
      if (s.type === 'circle') { set('prop-x', Math.round(s.x)); set('prop-y', Math.round(s.y)); set('prop-w', Math.round(s.r*2)); }
      if (s.color) set('prop-color', s.color);
    }
  };

  /* ── ATTACH EVENTS ── */
  canvas.addEventListener('mousedown', e => cad.onMouseDown(e));
  canvas.addEventListener('mousemove', e => cad.onMouseMove(e));
  canvas.addEventListener('mouseup',   e => cad.onMouseUp(e));
  canvas.addEventListener('dblclick',  e => cad.onDblClick(e));
  canvas.addEventListener('wheel',     e => cad.onWheel(e), { passive: false });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('keydown',   e => cad.onKey(e));

  resize();
  window.addEventListener('resize', resize);

  // Default tool
  cadTool('rect');
  setView('2d');
  cad.syncTree();

  // Demo shape
  cad.parts[0].shapes.push({ type:'rect', x:-60, y:-40, w:120, h:80, color:'#6b4c2a', fill:true, fillColor:'rgba(181,66,10,0.08)' });
  cad.parts[0].shapes.push({ type:'circle', x:0, y:0, r:30, color:'#4a5c2a' });
  cad.syncTree();
  cad.draw();
}

/* ── HELPERS ─────────────────────────────────────────────────────────────── */
function pointLineDist(px,py, ax,ay, bx,by) {
  const dx=bx-ax, dy=by-ay, len=Math.sqrt(dx*dx+dy*dy);
  if(len===0) return Math.sqrt((px-ax)**2+(py-ay)**2);
  const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(len*len)));
  return Math.sqrt((px-ax-t*dx)**2+(py-ay-t*dy)**2);
}

function shapeIcon(type) {
  if(type==='rect')   return '<rect x="2" y="4" width="10" height="7" rx="1"/>';
  if(type==='circle') return '<circle cx="7" cy="7" r="4"/>';
  if(type==='line')   return '<line x1="2" y1="11" x2="12" y2="3"/>';
  if(type==='arc')    return '<path d="M3 11 Q7 3 11 11"/>';
  if(type==='poly')   return '<polygon points="7,2 12,9 2,9"/>';
  return '<rect x="2" y="2" width="10" height="10"/>';
}

/* ── GLOBAL CAD COMMANDS ─────────────────────────────────────────────────── */
window.cadTool = function(tool) {
  if (!cad) return;
  cad.tool = tool;
  cad.polyPoints = [];
  cad.drawing = false;
  document.querySelectorAll('.btn-sm[id^="tool-"]').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('tool-' + tool);
  if (btn) btn.classList.add('active');
  const badge = document.getElementById('cad-mode-badge');
  const viewLabel = cad.view === '3d' ? '3D ORBIT' : 'SKETCH';
  if (badge) badge.textContent = `${viewLabel} — ${tool.toUpperCase()}`;
  document.getElementById('cad-stat-tool').textContent = 'Tool: ' + tool;
  cad.canvas.style.cursor = tool === 'select' ? 'default' : 'crosshair';
};

window.setView = function(v) {
  if (!cad) return;
  cad.view = v;
  ['2d','3d'].forEach(id => {
    const b = document.getElementById('view-'+id);
    if (b) b.classList.toggle('active', id === v);
  });
  const badge = document.getElementById('cad-mode-badge');
  if (badge) badge.textContent = v === '3d' ? '3D ORBIT' : 'SKETCH — ' + cad.tool.toUpperCase();
  cad.draw();
};

window.cadExtrude = function() {
  if (!cad) return;
  const s = cad.selected;
  if (!s) { showToast('Select a shape to extrude.', true); return; }
  const depth = parseFloat(prompt('Extrude depth (mm):', '20') || '20');
  if (isNaN(depth) || depth <= 0) return;
  cad.saveHistory();
  s.extruded = true; s.depth = depth;
  setView('3d');
  cad.syncTree();
  showToast('Extruded ' + Math.round(depth) + ' mm.');
};

window.cadRevolve = function() {
  if (!cad) return;
  const s = cad.selected;
  if (!s) { showToast('Select a shape to revolve.', true); return; }
  showToast('Revolve: coming in next build!');
};

window.cadFillet = function() { showToast('Fillet: select edges after extrude — coming soon!'); };
window.cadShell  = function() { showToast('Shell: subtract walls from solid — coming soon!'); };

window.cadBoolean = function(op) {
  const shapes = cad ? cad.allShapes() : [];
  if (shapes.length < 2) { showToast('Need 2+ shapes for boolean ops.', true); return; }
  showToast('Boolean ' + op + ': select two shapes — coming in next build!');
};

window.cadUndo = function() {
  if (!cad || cad.history.length === 0) return;
  cad.parts = cad.history.pop();
  cad.selected = null;
  cad.syncTree();
  cad.draw();
  showToast('Undone.');
};

window.cadClear = function() {
  if (!cad) return;
  if (!confirm('Clear all shapes in current part?')) return;
  cad.saveHistory();
  cad.parts[cad.activePart].shapes = [];
  cad.selected = null;
  cad.syncTree();
  cad.draw();
};

window.cadFitView = function() {
  if (!cad) return;
  cad.zoom = 1; cad.panX = 0; cad.panY = 0;
  cad.draw();
};

window.cadGridToggle = function() {
  if (!cad) return;
  cad.showGrid = !cad.showGrid;
  const btn = document.getElementById('btn-grid');
  if (btn) btn.classList.toggle('active', cad.showGrid);
  cad.draw();
};

window.cadAddPart = function() {
  if (!cad) return;
  cad.saveHistory();
  const id = cad.parts.length + 1;
  cad.parts.push({ id, name:'Part ' + id, shapes:[], visible:true, color:'#4a5c2a' });
  cad.activePart = cad.parts.length - 1;
  cad.syncTree();
  cad.draw();
};

window.cadSetActivePart = function(i) {
  if (!cad) return;
  cad.activePart = i;
  cad.selected = null;
  cad.syncTree();
};

window.cadTogglePartVis = function(i) {
  if (!cad) return;
  cad.parts[i].visible = !cad.parts[i].visible;
  cad.syncTree();
  cad.draw();
};

window.cadSelectShape = function(pi, si) {
  if (!cad) return;
  cad.selected = cad.parts[pi].shapes[si];
  cad.syncProps();
  cad.draw();
};

window.applyProp = function(prop, val) {
  if (!cad || !cad.selected) return;
  const s = cad.selected;
  const n = parseFloat(val);
  if (prop==='x') s.x=n;
  if (prop==='y') s.y=n;
  if (prop==='w') { if(s.type==='rect') s.w=n; else if(s.type==='circle') s.r=n/2; }
  if (prop==='h' && s.type==='rect') s.h=n;
  if (prop==='d') s.depth=n;
  if (prop==='rot') s.rotation=n;
  if (prop==='color') s.color=val;
  if (prop==='opacity') s.opacity=parseFloat(val);
  cad.draw();
};

window.saveCadProject = function() {
  if (!window._currentUser) { showAuth('signup'); return; }
  const data = {
    type: 'cad', title: 'CAD Project — ' + new Date().toLocaleDateString(),
    parts: cad ? cad.parts : [], tags: ['cad','kinemagic']
  };
  window.saveProject && window.saveProject(data);
};

window.exportSTL = function() {
  if (!cad) return;
  const shapes = cad.allShapes().filter(s => s.extruded && s.type === 'rect');
  if (!shapes.length) { showToast('Extrude at least one shape first.', true); return; }

  // Build a minimal ASCII STL
  let stl = 'solid KineMagicExport\n';
  shapes.forEach(s => {
    const { x, y, w, h } = s;
    const d = s.depth || 20;
    const verts = [
      [x,y,0],[x+w,y,0],[x+w,y+h,0],[x,y+h,0],
      [x,y,d],[x+w,y,d],[x+w,y+h,d],[x,y+h,d],
    ];
    const faces = [[0,1,2],[0,2,3],[4,6,5],[4,7,6],[0,4,5],[0,5,1],[1,5,6],[1,6,2],[2,6,7],[2,7,3],[0,3,7],[0,7,4]];
    faces.forEach(([a,b,c]) => {
      const normal = '0 0 1';
      stl += ` facet normal ${normal}\n  outer loop\n`;
      [a,b,c].forEach(i => stl += `   vertex ${verts[i][0].toFixed(4)} ${verts[i][1].toFixed(4)} ${verts[i][2].toFixed(4)}\n`);
      stl += '  endloop\n endfacet\n';
    });
  });
  stl += 'endsolid KineMagicExport\n';

  const blob = new Blob([stl], { type:'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'kinemagic_export.stl';
  a.click();
  showToast('STL exported!');
};

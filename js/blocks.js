/* ── BLOCK CODER ENGINE ──────────────────────────────────────────────────────
   Scratch-style drag-and-drop block programming that generates real
   Arduino C++ firmware for ESP32. Also has a text editor mode.
   ─────────────────────────────────────────────────────────────────────────── */

window.renderBlocks = function() {
  const el = document.getElementById('page-blocks');

  const categories = {
    'Control': [
      { id:'setup',    label:'void setup()',    cat:'control', color:'#b5420a', hasInput:false },
      { id:'loop',     label:'void loop()',     cat:'control', color:'#b5420a', hasInput:false },
      { id:'if',       label:'if (  )',         cat:'control', color:'#9a3508', hasInput:true, inputLabel:'condition', inputDefault:'digitalRead(2)' },
      { id:'ifelse',   label:'if / else',       cat:'control', color:'#9a3508', hasInput:true, inputLabel:'condition', inputDefault:'x > 10' },
      { id:'while',    label:'while (  )',      cat:'control', color:'#9a3508', hasInput:true, inputLabel:'condition', inputDefault:'true' },
      { id:'for',      label:'for loop',        cat:'control', color:'#9a3508', hasInput:true, inputLabel:'count', inputDefault:'10' },
    ],
    'Input / Output': [
      { id:'pinmode',  label:'pinMode',         cat:'io', color:'#4a5c2a', hasInput:true, inputLabel:'pin', inputDefault:'2' },
      { id:'dwrite',   label:'digitalWrite',    cat:'io', color:'#4a5c2a', hasInput:true, inputLabel:'pin,val', inputDefault:'2,HIGH' },
      { id:'dread',    label:'digitalRead',     cat:'io', color:'#4a5c2a', hasInput:true, inputLabel:'pin', inputDefault:'2' },
      { id:'awrite',   label:'analogWrite',     cat:'io', color:'#3b4f20', hasInput:true, inputLabel:'pin,val', inputDefault:'13,128' },
      { id:'aread',    label:'analogRead',      cat:'io', color:'#3b4f20', hasInput:true, inputLabel:'pin', inputDefault:'A0' },
      { id:'serial',   label:'Serial.print',    cat:'io', color:'#3b4f20', hasInput:true, inputLabel:'value', inputDefault:'"Hello"' },
      { id:'serialln', label:'Serial.println',  cat:'io', color:'#3b4f20', hasInput:true, inputLabel:'value', inputDefault:'"Data"' },
      { id:'serbegin', label:'Serial.begin',    cat:'io', color:'#3b4f20', hasInput:true, inputLabel:'baud', inputDefault:'115200' },
    ],
    'Servo / Motor': [
      { id:'servoatt', label:'servo.attach',    cat:'servo', color:'#6b4c2a', hasInput:true, inputLabel:'pin', inputDefault:'9' },
      { id:'servowrite',label:'servo.write',    cat:'servo', color:'#6b4c2a', hasInput:true, inputLabel:'angle°', inputDefault:'90' },
      { id:'servoread',label:'servo.read',      cat:'servo', color:'#6b4c2a', hasInput:false },
      { id:'dcfwd',    label:'Motor forward',   cat:'servo', color:'#5a3b1e', hasInput:true, inputLabel:'speed 0-255', inputDefault:'200' },
      { id:'dcbwd',    label:'Motor backward',  cat:'servo', color:'#5a3b1e', hasInput:true, inputLabel:'speed 0-255', inputDefault:'200' },
      { id:'dcstop',   label:'Motor stop',      cat:'servo', color:'#5a3b1e', hasInput:false },
      { id:'stepper',  label:'Stepper step',    cat:'servo', color:'#5a3b1e', hasInput:true, inputLabel:'steps', inputDefault:'100' },
    ],
    'Logic': [
      { id:'var',      label:'int variable',    cat:'logic', color:'#5c4a8a', hasInput:true, inputLabel:'name=val', inputDefault:'x=0' },
      { id:'varset',   label:'set variable',    cat:'logic', color:'#5c4a8a', hasInput:true, inputLabel:'name=val', inputDefault:'x=1' },
      { id:'and',      label:'AND',             cat:'logic', color:'#4a3a7a', hasInput:true, inputLabel:'a && b', inputDefault:'a && b' },
      { id:'or',       label:'OR',              cat:'logic', color:'#4a3a7a', hasInput:true, inputLabel:'a || b', inputDefault:'a || b' },
      { id:'not',      label:'NOT',             cat:'logic', color:'#4a3a7a', hasInput:true, inputLabel:'!x', inputDefault:'!x' },
    ],
    'Math': [
      { id:'add',      label:'add (+)',          cat:'math', color:'#2a5c5c', hasInput:true, inputLabel:'a + b', inputDefault:'a + b' },
      { id:'sub',      label:'subtract (−)',     cat:'math', color:'#2a5c5c', hasInput:true, inputLabel:'a - b', inputDefault:'a - b' },
      { id:'mul',      label:'multiply (×)',     cat:'math', color:'#2a5c5c', hasInput:true, inputLabel:'a * b', inputDefault:'a * b' },
      { id:'map',      label:'map()',            cat:'math', color:'#1a4c4c', hasInput:true, inputLabel:'val,in1,in2,out1,out2', inputDefault:'x,0,1023,0,255' },
      { id:'constrain',label:'constrain()',      cat:'math', color:'#1a4c4c', hasInput:true, inputLabel:'val,min,max', inputDefault:'x,0,100' },
      { id:'random',   label:'random()',         cat:'math', color:'#1a4c4c', hasInput:true, inputLabel:'min,max', inputDefault:'0,100' },
    ],
    'Delay / Time': [
      { id:'delay',    label:'delay (ms)',       cat:'delay', color:'#8a6a2a', hasInput:true, inputLabel:'ms', inputDefault:'1000' },
      { id:'delaymicros',label:'delayMicros',   cat:'delay', color:'#7a5a1a', hasInput:true, inputLabel:'µs', inputDefault:'500' },
      { id:'millis',   label:'millis()',         cat:'delay', color:'#7a5a1a', hasInput:false },
      { id:'micros',   label:'micros()',         cat:'delay', color:'#7a5a1a', hasInput:false },
    ],
  };

  const catColorClass = { 'Control':'cat-control','Input / Output':'cat-io','Servo / Motor':'cat-servo','Logic':'cat-logic','Math':'cat-math','Delay / Time':'cat-delay' };

  el.innerHTML = `
  <div class="blocks-shell">
    <div class="blocks-toolbar">
      <h3>Block Coder</h3>
      <span style="font-size:11px;color:var(--ink3);margin-left:8px;">for ESP32 — generates Arduino C++</span>
      <div class="mode-toggle">
        <button class="on" id="mode-blocks" onclick="setBlockMode('blocks')">Blocks</button>
        <button id="mode-text" onclick="setBlockMode('text')">Text (C++)</button>
      </div>
      <button class="btn-rust" style="font-size:11px;padding:5px 14px;" onclick="saveBlockProject()">Save Project</button>
    </div>

    <div class="blocks-body">
      <!-- PALETTE -->
      <div class="block-palette" id="block-palette">
        ${Object.entries(categories).map(([cat, blocks]) => `
        <div class="palette-cat">
          <div class="palette-cat-title">${cat}</div>
          ${blocks.map(b => `
          <div class="palette-block ${catColorClass[cat]}"
               draggable="true"
               data-block='${JSON.stringify(b).replace(/'/g,"&apos;")}'
               ondragstart="blockDragStart(event, this)"
               onclick="blockClickAdd(this)">
            ${b.label}
          </div>`).join('')}
        </div>`).join('')}
      </div>

      <!-- WORKSPACE -->
      <div class="block-workspace" id="block-workspace"
           ondragover="event.preventDefault()"
           ondrop="blockDrop(event)">
        <div class="workspace-grid"></div>
        <div class="workspace-canvas" id="workspace-canvas"></div>
        <div class="workspace-hint" id="workspace-hint">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="4" y="14" width="14" height="10" rx="2" stroke="#c8bfae" stroke-width="1.5"/>
            <rect x="22" y="14" width="14" height="10" rx="2" stroke="#c8bfae" stroke-width="1.5"/>
            <path d="M18 19h4" stroke="#c8bfae" stroke-width="1.5"/>
          </svg>
          <p>Drag blocks here or click them</p>
          <p style="font-size:10px;">Blocks generate ESP32 Arduino code →</p>
        </div>
      </div>

      <!-- CODE OUTPUT -->
      <div class="code-output" id="code-output-panel">
        <div class="code-output-header">
          <span>Arduino C++ Output</span>
          <div class="code-tabs">
            <button class="code-tab on" onclick="setCodeTab('full')">Full</button>
            <button class="code-tab" onclick="setCodeTab('setup')">setup()</button>
            <button class="code-tab" onclick="setCodeTab('loop')">loop()</button>
          </div>
        </div>
        <pre id="code-out"></pre>
        <div class="code-actions">
          <button onclick="copyCode()">Copy</button>
          <button onclick="downloadCode()">Download .ino</button>
          <button class="btn-flash" onclick="flashInfo()">Flash to ESP32</button>
        </div>
      </div>
    </div>
  </div>`;

  initBlockEngine();
};

/* ═══════════════════════════════════════════════════════════════════════════
   BLOCK ENGINE
   ═══════════════════════════════════════════════════════════════════════════ */
let blockEngine = null;

function initBlockEngine() {
  blockEngine = {
    blocks: [],
    dragData: null,
    mode: 'blocks',
    codeTab: 'full',

    addBlock(def, x, y) {
      const block = {
        id: Date.now() + Math.random(),
        def: { ...def },
        x: x || 40 + (this.blocks.length * 12) % 160,
        y: y || 40 + (this.blocks.length * 44) % 300,
        inputValue: def.inputDefault || '',
      };
      this.blocks.push(block);
      this.render();
      this.generateCode();
      const hint = document.getElementById('workspace-hint');
      if (hint) hint.style.display = 'none';
    },

    removeBlock(id) {
      this.blocks = this.blocks.filter(b => b.id !== id);
      this.render();
      this.generateCode();
      if (this.blocks.length === 0) {
        const hint = document.getElementById('workspace-hint');
        if (hint) hint.style.display = '';
      }
    },

    render() {
      const canvas = document.getElementById('workspace-canvas');
      if (!canvas) return;
      canvas.innerHTML = this.blocks.map(b => this.blockHTML(b)).join('');
      this.attachBlockEvents();
    },

    blockHTML(b) {
      const col = b.def.color || '#6b4c2a';
      const inputHTML = b.def.hasInput ? `
        <input value="${escapeAttr(b.inputValue)}"
               data-id="${b.id}"
               onclick="event.stopPropagation()"
               onchange="blockUpdateInput(this)"
               style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);color:#fff;font-size:10px;font-family:var(--font-mono);padding:2px 6px;width:90px;border-radius:1px;"
               placeholder="${escapeAttr(b.def.inputLabel||'')}"/>` : '';
      return `<div class="dropped-block"
                   id="block-${b.id}"
                   data-id="${b.id}"
                   style="left:${b.x}px;top:${b.y}px;background:${col};"
                   onmousedown="blockMouseDown(event,this)">
        <span style="white-space:nowrap;font-size:11px;">${b.def.label}</span>
        ${inputHTML}
        <button class="del-block" onclick="event.stopPropagation();blockEngine.removeBlock(${b.id})">✕</button>
      </div>`;
    },

    attachBlockEvents() {
      // drag to reposition
      document.querySelectorAll('.dropped-block').forEach(el => {
        let ox, oy, startX, startY;
        el.addEventListener('mousedown', e => {
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
          startX = e.clientX; startY = e.clientY;
          const rect = el.getBoundingClientRect();
          ox = e.clientX - rect.left; oy = e.clientY - rect.top;
          const id = parseFloat(el.dataset.id);
          const mv = e2 => {
            const wp = document.getElementById('block-workspace').getBoundingClientRect();
            const nx = e2.clientX - wp.left - ox;
            const ny = e2.clientY - wp.top  - oy;
            el.style.left = Math.max(0, nx) + 'px';
            el.style.top  = Math.max(0, ny) + 'px';
            const b = blockEngine.blocks.find(b => b.id === id);
            if (b) { b.x = Math.max(0,nx); b.y = Math.max(0,ny); }
          };
          const up = () => {
            document.removeEventListener('mousemove', mv);
            document.removeEventListener('mouseup', up);
          };
          document.addEventListener('mousemove', mv);
          document.addEventListener('mouseup', up);
          e.preventDefault();
        });
      });
    },

    /* ── CODE GEN ── */
    generateCode() {
      const blocks = this.blocks;
      let setup = '', loop = '', globals = '', includes = '';

      const hasServo  = blocks.some(b => b.def.id.startsWith('servo'));
      const hasStepper= blocks.some(b => b.def.id === 'stepper');
      const hasSerial = blocks.some(b => ['serial','serialln','serbegin'].includes(b.def.id));

      if (hasServo)   { includes += '#include <ESP32Servo.h>\n'; globals += 'Servo myServo;\n'; }
      if (hasStepper) { includes += '#include <Stepper.h>\n'; globals += 'Stepper myStepper(2048, 19, 21, 18, 5);\n'; }

      let setupBlocks = [], loopBlocks = [], topBlocks = [];
      let inSetup = false, inLoop = false;

      blocks.forEach(b => {
        if (b.def.id === 'setup') { inSetup = true; inLoop = false; return; }
        if (b.def.id === 'loop')  { inLoop  = true; inSetup = false; return; }
        if (inSetup) setupBlocks.push(b);
        else if (inLoop) loopBlocks.push(b);
        else topBlocks.push(b);
      });

      const gen = (b, indent='  ') => {
        const v = b.inputValue || b.def.inputDefault || '';
        const id = b.def.id;
        if (id==='pinmode')     return `${indent}pinMode(${v}, OUTPUT);`;
        if (id==='dwrite')      return `${indent}digitalWrite(${v});`;
        if (id==='dread')       return `${indent}int val = digitalRead(${v});`;
        if (id==='awrite')      return `${indent}analogWrite(${v});`;
        if (id==='aread')       return `${indent}int val = analogRead(${v});`;
        if (id==='serial')      return `${indent}Serial.print(${v});`;
        if (id==='serialln')    return `${indent}Serial.println(${v});`;
        if (id==='serbegin')    return `${indent}Serial.begin(${v});`;
        if (id==='servoatt')    return `${indent}myServo.attach(${v});`;
        if (id==='servowrite')  return `${indent}myServo.write(${v});`;
        if (id==='servoread')   return `${indent}int angle = myServo.read();`;
        if (id==='dcfwd')       return `${indent}// Motor forward at speed ${v}\n${indent}analogWrite(MOTOR_PIN_A, ${v});\n${indent}analogWrite(MOTOR_PIN_B, 0);`;
        if (id==='dcbwd')       return `${indent}// Motor backward at speed ${v}\n${indent}analogWrite(MOTOR_PIN_A, 0);\n${indent}analogWrite(MOTOR_PIN_B, ${v});`;
        if (id==='dcstop')      return `${indent}analogWrite(MOTOR_PIN_A, 0);\n${indent}analogWrite(MOTOR_PIN_B, 0);`;
        if (id==='stepper')     return `${indent}myStepper.step(${v});`;
        if (id==='var')         { const [nm,vl]=(v+'=0').split('='); return `${indent}int ${nm.trim()} = ${(vl||'0').trim()};`; }
        if (id==='varset')      { const [nm,vl]=(v+'=0').split('='); return `${indent}${nm.trim()} = ${(vl||'0').trim()};`; }
        if (id==='if')          return `${indent}if (${v}) {\n${indent}  // add blocks here\n${indent}}`;
        if (id==='ifelse')      return `${indent}if (${v}) {\n${indent}  // true branch\n${indent}} else {\n${indent}  // false branch\n${indent}}`;
        if (id==='while')       return `${indent}while (${v}) {\n${indent}  // loop body\n${indent}}`;
        if (id==='for')         return `${indent}for (int i = 0; i < ${v}; i++) {\n${indent}  // loop body\n${indent}}`;
        if (id==='delay')       return `${indent}delay(${v});`;
        if (id==='delaymicros') return `${indent}delayMicroseconds(${v});`;
        if (id==='millis')      return `${indent}unsigned long t = millis();`;
        if (id==='micros')      return `${indent}unsigned long t = micros();`;
        if (id==='add')         return `${indent}int result = ${v};`;
        if (id==='sub')         return `${indent}int result = ${v};`;
        if (id==='mul')         return `${indent}int result = ${v};`;
        if (id==='map')         return `${indent}long mapped = map(${v});`;
        if (id==='constrain')   return `${indent}int cval = constrain(${v});`;
        if (id==='random')      return `${indent}long rval = random(${v});`;
        return `${indent}// ${b.def.label}`;
      };

      const setupCode = setupBlocks.map(b => gen(b)).join('\n') || '  // setup blocks here';
      const loopCode  = loopBlocks.map(b => gen(b)).join('\n')  || '  // loop blocks here';
      const topCode   = topBlocks.map(b => gen(b,'').replace(/^  /,'')).join('\n');

      const full = [
        '// ─────────────────────────────────────────',
        '// Generated by KineMagic Labs Block Coder',
        '// Target: ESP32 · Framework: Arduino',
        '// ─────────────────────────────────────────',
        '',
        includes || '// No extra includes needed',
        '',
        globals ? globals : '',
        topCode || '',
        '',
        'void setup() {',
        setupCode,
        '}',
        '',
        'void loop() {',
        loopCode,
        '}',
      ].filter(l => l !== undefined).join('\n');

      window._generatedCode = full;
      window._setupCode = `void setup() {\n${setupCode}\n}`;
      window._loopCode  = `void loop() {\n${loopCode}\n}`;

      this.renderCode();
    },

    renderCode() {
      const pre = document.getElementById('code-out');
      if (!pre) return;
      const code = this.codeTab === 'setup' ? (window._setupCode||'')
                 : this.codeTab === 'loop'  ? (window._loopCode||'')
                 : (window._generatedCode||'// Add blocks to generate code');
      pre.innerHTML = syntaxHighlight(code);
    }
  };

  generateDefaultCode();
  blockEngine.generateCode();
}

function generateDefaultCode() {
  window._generatedCode = [
    '// ─────────────────────────────────────────',
    '// Generated by KineMagic Labs Block Coder',
    '// Target: ESP32 · Framework: Arduino',
    '// ─────────────────────────────────────────',
    '',
    '// No extra includes needed',
    '',
    'void setup() {',
    '  // setup blocks here',
    '}',
    '',
    'void loop() {',
    '  // loop blocks here',
    '}',
  ].join('\n');
  const pre = document.getElementById('code-out');
  if (pre) pre.innerHTML = syntaxHighlight(window._generatedCode);
}

/* ── SYNTAX HIGHLIGHT ─────────────────────────────────────────────────────── */
function syntaxHighlight(code) {
  return code
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/(\/\/[^\n]*)/g,'<span class="cm">$1</span>')
    .replace(/\b(void|int|long|unsigned|float|bool|const|#include|true|false|HIGH|LOW|INPUT|OUTPUT|INPUT_PULLUP|if|else|while|for|return)\b/g,'<span class="kw">$1</span>')
    .replace(/\b(setup|loop|pinMode|digitalWrite|digitalRead|analogWrite|analogRead|Serial|delay|millis|micros|map|constrain|random|attach|write|read|begin|print|println|step)\b/g,'<span class="fn">$1</span>')
    .replace(/("(?:[^"\\]|\\.)*")/g,'<span class="str">$1</span>')
    .replace(/\b(\d+)\b/g,'<span class="num">$1</span>');
}

function escapeAttr(s) { return String(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

/* ── DRAG & DROP ─────────────────────────────────────────────────────────── */
window.blockDragStart = function(e, el) {
  try {
    const data = el.dataset.block.replace(/&apos;/g,"'");
    e.dataTransfer.setData('blockDef', data);
  } catch(err) { console.warn(err); }
};

window.blockDrop = function(e) {
  e.preventDefault();
  try {
    const raw = e.dataTransfer.getData('blockDef');
    if (!raw) return;
    const def = JSON.parse(raw);
    const wp = document.getElementById('block-workspace').getBoundingClientRect();
    const x = e.clientX - wp.left - 70;
    const y = e.clientY - wp.top  - 16;
    blockEngine.addBlock(def, Math.max(4, x), Math.max(4, y));
  } catch(err) { console.warn(err); }
};

window.blockClickAdd = function(el) {
  try {
    const data = el.dataset.block.replace(/&apos;/g,"'");
    const def = JSON.parse(data);
    blockEngine.addBlock(def);
  } catch(err) { console.warn(err); }
};

window.blockMouseDown = function(e, el) {
  // handled inside attachBlockEvents
};

window.blockUpdateInput = function(input) {
  const id = parseFloat(input.dataset.id);
  const b  = blockEngine.blocks.find(b => b.id === id);
  if (b) { b.inputValue = input.value; blockEngine.generateCode(); }
};

/* ── MODE SWITCHING ──────────────────────────────────────────────────────── */
window.setBlockMode = function(mode) {
  blockEngine.mode = mode;
  document.getElementById('mode-blocks').classList.toggle('on', mode==='blocks');
  document.getElementById('mode-text').classList.toggle('on', mode==='text');

  const palette   = document.getElementById('block-palette');
  const workspace = document.getElementById('block-workspace');
  const codeOut   = document.getElementById('code-output-panel');

  if (mode === 'blocks') {
    palette.style.display   = '';
    workspace.style.display = '';
    codeOut.style.display   = '';
    // remove text editor if present
    const te = document.getElementById('text-editor');
    if (te) te.remove();
    blockEngine.render();
    blockEngine.generateCode();
  } else {
    palette.style.display   = 'none';
    workspace.style.display = 'none';

    // full width text editor
    const body = document.querySelector('.blocks-body');
    let te = document.getElementById('text-editor');
    if (!te) {
      te = document.createElement('textarea');
      te.id = 'text-editor';
      te.spellcheck = false;
      te.oninput = () => {
        window._generatedCode = te.value;
        const pre = document.getElementById('code-out');
        if (pre) pre.innerHTML = syntaxHighlight(te.value);
      };
      body.appendChild(te);
    }
    te.value = window._generatedCode || '';
    te.style.display = '';
    codeOut.style.display = '';
  }
};

window.setCodeTab = function(tab) {
  blockEngine.codeTab = tab;
  document.querySelectorAll('.code-tab').forEach(b => b.classList.remove('on'));
  event.target.classList.add('on');
  blockEngine.renderCode();
};

/* ── CODE ACTIONS ─────────────────────────────────────────────────────────── */
window.copyCode = function() {
  const code = window._generatedCode || '';
  navigator.clipboard.writeText(code).then(() => showToast('Code copied to clipboard!'));
};

window.downloadCode = function() {
  const code = window._generatedCode || '';
  const blob = new Blob([code], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'kinemagic_esp32.ino';
  a.click();
  showToast('Downloaded kinemagic_esp32.ino');
};

window.flashInfo = function() {
  alert('To flash to ESP32:\n\n1. Open Arduino IDE (arduino.cc/en/software)\n2. Install board: "esp32 by Espressif Systems"\n3. Paste or open your .ino file\n4. Select board: "ESP32 Dev Module"\n5. Select your COM port\n6. Click Upload ▶\n\nOr use esptool.py for command-line flashing.');
};

window.saveBlockProject = function() {
  if (!window._currentUser) { showAuth('signup'); return; }
  const data = {
    type: 'blocks', title: 'Block Project — ' + new Date().toLocaleDateString(),
    blocks: blockEngine ? blockEngine.blocks.map(b=>({def:b.def, inputValue:b.inputValue, x:b.x, y:b.y})) : [],
    code: window._generatedCode || '',
    tags: ['esp32','blocks','kinemagic']
  };
  window.saveProject && window.saveProject(data);
};

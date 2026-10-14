/* Space Invaders: Pew Pew Panic. Self-contained; no external assets. */
(function () {
  "use strict";

  var VIEW_W = 480;
  var VIEW_H = 640;
  var COLS = 11;
  var ROWS = 5;
  var AW = 24;
  var AH = 18;
  var PITCH_X = 32;
  var PITCH_Y = 32;
  var STEP_X = 10;
  var STEP_DOWN = 18;
  var MARGIN = 16;
  var PLAYER_W = 32;
  var PLAYER_H = 20;
  var PLAYER_Y = 576;
  var PLAYER_SPEED = 280;
  var SHOT_SPEED = 540;
  var ALIEN_SHOT_SPEED = 175;
  var CELL = 3;
  var SHIELD_COLS = 18;
  var SHIELD_ROWS = 14;
  var SHIELD_Y = 500;
  var ROW_POINTS = [50, 40, 30, 20, 10];
  var ROW_KIND = ["squeak", "grump", "pink", "blob", "sleepy"];
  var ROW_COLOR = ["#ffe566", "#ffb03a", "#ff6d90", "#3ee0a2", "#6eb6ff"];
  var MARCH_NOTES = [146, 164, 174, 196];

  var PALETTES = {
    squeak: { K: "#3a2a08", B: "#ffe566", L: "#fff7c2", D: "#e6a314", A: "#fff3a0", W: "#fffef8", P: "#241808", M: "#e23b5a" },
    grump: { K: "#4a2208", B: "#ff9a3c", L: "#ffd0a0", D: "#7a3010", A: "#ffb060", W: "#fff8ee", P: "#2a1208", M: "#4a1020" },
    pink: { K: "#4a1030", B: "#ff6d90", L: "#ffc4d4", D: "#e04570", A: "#ffd0e0", W: "#fff6f8", P: "#2a0818", M: "#fff1a8" },
    blob: { K: "#0c4030", B: "#3ee0a2", L: "#c8ffe6", D: "#18a070", A: "#9dffd4", W: "#f4fffb", P: "#083028", M: "#143028" },
    sleepy: { K: "#102848", B: "#6eb6ff", L: "#d6ecff", D: "#3a78d4", A: "#b8dcff", W: "#f4f8ff", P: "#102040", M: "#1a3058" }
  };

  var SPRITES = {
    squeak: [
      [
        "....A..A....",
        "..KKKKKKKK..",
        ".KBBBBBBBBK.",
        ".KWWBBBBWWK.",
        ".KPWBBBBWPK.",
        ".KBBBBBBBBK.",
        ".KBBMMMMBBK.",
        "..KKKKKKKK..",
        ".D........D."
      ],
      [
        ".....AA.....",
        "..KKKKKKKK..",
        ".KBBBBBBBBK.",
        ".KWWBBBBWWK.",
        ".KPWBBBBWPK.",
        ".KBBBBBBBBK.",
        ".KBMMMMMMBK.",
        "..KKKKKKKK..",
        "...D....D..."
      ]
    ],
    grump: [
      [
        "A..........A",
        ".KKKKKKKKKK.",
        ".KDDDDDDDDK.",
        ".KWWBBBBWWK.",
        ".KPBBBBBBPK.",
        ".KBBBBBBBBK.",
        ".KBBMMMMBBK.",
        "..KKKKKKKK..",
        "D..........D"
      ],
      [
        ".A........A.",
        ".KKKKKKKKKK.",
        ".KDDDDDDDDK.",
        ".KWWBBBBWWK.",
        ".KPBBBBBBPK.",
        ".KBBBBBBBBK.",
        ".KBMMMMMMBK.",
        "..KKKKKKKK..",
        ".D........D."
      ]
    ],
    pink: [
      [
        ".....AA.....",
        "...KKKKKK...",
        "..KWWWWWWK..",
        ".KKPWWWWPKK.",
        "..KBBBBBBK..",
        "..KBMMMMBK..",
        "...KBBBBK...",
        "..KKKKKKKK..",
        ".D..D..D..D."
      ],
      [
        "....A..A....",
        "...KKKKKK...",
        "..KWWWWWWK..",
        "..KWPWWPWK..",
        "..KBBBBBBK..",
        "..KBBMMBBK..",
        "...KBBBBK...",
        "..KKKKKKKK..",
        "...D....D..."
      ]
    ],
    blob: [
      [
        "...KKKKKK...",
        "..KLLLLLLK..",
        ".KBBBBBBBBK.",
        ".KWWBBBBWWK.",
        ".KPWBBBBWPK.",
        ".KBBBMMBBBK.",
        "..KBBBBBBK..",
        "...KKKKKK...",
        "...D....D..."
      ],
      [
        "...KKKKKK...",
        "..KLLLLLLK..",
        ".KBBBBBBBBK.",
        ".KWWBBBBWWK.",
        ".KPWBBBBWPK.",
        ".KBMMMMMMBK.",
        "..KBBBBBBK..",
        "...KKKKKK...",
        ".D........D."
      ]
    ],
    sleepy: [
      [
        "....A....A..",
        "...KKKKKKK..",
        "..KLLLLLLLK.",
        ".KBBBBBBBBK.",
        ".KDWWBBWWDK.",
        ".KBBBBBBBBK.",
        ".KBBMMMMBBK.",
        "..KKKKKKKK..",
        ".D...DD...D."
      ],
      [
        "...A....A...",
        "...KKKKKKK..",
        "..KLLLLLLLK.",
        ".KBBBBBBBBK.",
        ".KDDWBBWDDK.",
        ".KBBBBBBBBK.",
        ".KBMMMMMMBK.",
        "..KKKKKKKK..",
        "...D....D..."
      ]
    ]
  };

  var STARS = [];
  for (var si = 0; si < 72; si++) {
    STARS.push({
      x: (si * 83 + 17) % VIEW_W,
      y: 42 + ((si * 47 + 11) % 530),
      r: si % 7 === 0 ? 2 : 1,
      a: 0.28 + (si % 5) * 0.12,
      phase: si * 0.73,
      plus: si % 4 === 0
    });
  }
  var SKYLINE = [6, 10, 7, 11, 5, 9, 8, 12, 6, 10, 7, 13, 8, 9, 6, 11, 5, 8];

  function mount(el) {
    var computed = window.getComputedStyle(el);
    if (computed.position === "static") el.style.position = "relative";

    var wrap = document.createElement("div");
    wrap.tabIndex = 0;
    wrap.setAttribute("role", "application");
    wrap.setAttribute("aria-label", "Space Invaders: Pew Pew Panic");
    wrap.style.cssText = "position:absolute;inset:0;overflow:hidden;background:#04060c;outline:none;touch-action:none;user-select:none;";

    var live = document.createElement("div");
    live.setAttribute("aria-live", "polite");
    live.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);";

    var canvas = document.createElement("canvas");
    canvas.style.cssText = "display:block;width:100%;height:100%;";
    wrap.appendChild(canvas);
    wrap.appendChild(live);
    el.replaceChildren(wrap);

    var ctx = canvas.getContext("2d");
    var buffer = document.createElement("canvas");
    buffer.width = VIEW_W;
    buffer.height = VIEW_H;
    var bctx = buffer.getContext("2d", { alpha: false });
    if (!ctx || !bctx) throw new Error("Canvas is not available");

    var ac = new AbortController();
    var opt = { signal: ac.signal };
    var ro = new ResizeObserver(function () { layout(); });
    ro.observe(wrap);

    var state = "stopped";
    var score = 0;
    var lastScore = null;
    var lives = 3;
    var wave = 1;
    var endReason = "";
    var aliens = [];
    var formX = 0;
    var formY = 0;
    var dir = 1;
    var anim = 0;
    var marchAcc = 0;
    var marchNote = 0;
    var shotAcc = 0;
    var playerX = (VIEW_W - PLAYER_W) / 2;
    var bolts = [];
    var torpedoes = [];
    var blasts = [];
    var boltCd = 0;
    var torpedoCd = 0;
    var spreadCd = 0;
    var heldSpace = false;
    var heldBomb = false;
    var heldSpread = false;
    var alienShots = [];
    var shields = [];
    var particles = [];
    var floaters = [];
    var invuln = 0;
    var stun = 0;
    var shake = 0;
    var waveTimer = 0;
    var clock = 0;
    var lastNow = 0;
    var raf = 0;
    var dead = false;
    var actx = null;
    var heldLeft = new Set();
    var heldRight = new Set();
    var liveText = "";

    function ensureAudio() {
      if (actx) {
        if (actx.state === "suspended") actx.resume();
        return actx;
      }
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        actx = new AC();
      } catch (err) {
        actx = null;
      }
      return actx;
    }

    function toneAt(when, freq, dur, type, vol, endFreq) {
      try {
        var audio = ensureAudio();
        if (!audio) return;
        var osc = audio.createOscillator();
        var gain = audio.createGain();
        osc.type = type || "square";
        osc.frequency.setValueAtTime(freq, when);
        if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), when + dur);
        gain.gain.setValueAtTime(Math.max(0.0001, vol), when);
        gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(when);
        osc.stop(when + dur + 0.02);
      } catch (err) { /* sound is optional */ }
    }

    function tone(freq, dur, type, vol, endFreq) {
      var audio = ensureAudio();
      if (!audio) return;
      toneAt(audio.currentTime, freq, dur, type, vol, endFreq);
    }

    function noise(dur, vol) {
      try {
        var audio = ensureAudio();
        if (!audio) return;
        var n = Math.max(1, Math.floor(audio.sampleRate * dur));
        var buf = audio.createBuffer(1, n, audio.sampleRate);
        var data = buf.getChannelData(0);
        for (var i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
        var src = audio.createBufferSource();
        var gain = audio.createGain();
        src.buffer = buf;
        gain.gain.value = vol;
        src.connect(gain);
        gain.connect(audio.destination);
        src.start();
      } catch (err) { /* sound is optional */ }
    }

    function layout() {
      var rect = wrap.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, Math.floor(rect.width * dpr));
      var h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    function countAlive() {
      var n = 0;
      for (var i = 0; i < aliens.length; i++) if (aliens[i].alive) n++;
      return n;
    }

    function cellPos(a) {
      return {
        x: formX + a.c * PITCH_X,
        y: formY + a.r * PITCH_Y
      };
    }

    function makeShieldGrid() {
      var grid = [];
      for (var y = 0; y < SHIELD_ROWS; y++) {
        var row = [];
        for (var x = 0; x < SHIELD_COLS; x++) row.push(1);
        if (y < 3) {
          var inset = 2 - y;
          for (var x2 = 0; x2 < SHIELD_COLS; x2++) {
            if (x2 < inset || x2 >= SHIELD_COLS - inset) row[x2] = 0;
          }
        }
        if (y >= 9) {
          var mid = SHIELD_COLS / 2;
          var half = y - 8;
          for (var x3 = 0; x3 < SHIELD_COLS; x3++) {
            if (Math.abs(x3 + 0.5 - mid) < half) row[x3] = 0;
          }
        }
        grid.push(row);
      }
      return grid;
    }

    function buildShields() {
      shields = [];
      var span = SHIELD_COLS * CELL;
      var slot = VIEW_W / 4;
      for (var i = 0; i < 4; i++) {
        shields.push({
          x: Math.round(slot * i + (slot - span) / 2),
          y: SHIELD_Y,
          grid: makeShieldGrid()
        });
      }
    }

    function startWave(n) {
      wave = n;
      aliens = [];
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) aliens.push({ c: c, r: r, alive: true });
      }
      var width = (COLS - 1) * PITCH_X + AW;
      var height = (ROWS - 1) * PITCH_Y + AH;
      formX = Math.round((VIEW_W - width) / 2);
      formY = Math.min(76 + (n - 1) * 12, SHIELD_Y - 24 - height);
      dir = 1;
      anim = 0;
      marchAcc = 0;
      shotAcc = 0;
      clearWeapons();
      alienShots = [];
      stun = 0;
      invuln = 0;
    }

    function newGame() {
      score = 0;
      lives = 3;
      endReason = "";
      particles = [];
      floaters = [];
      shake = 0;
      playerX = (VIEW_W - PLAYER_W) / 2;
      buildShields();
      startWave(1);
      state = "playing";
    }

    function marchDelay() {
      var alive = countAlive();
      var ratio = alive / (COLS * ROWS);
      var base = 0.07 + 0.5 * ratio;
      return Math.max(0.045, base * Math.pow(0.9, wave - 1));
    }

    function stepFormation() {
      var minC = COLS;
      var maxC = -1;
      for (var i = 0; i < aliens.length; i++) {
        var a = aliens[i];
        if (!a.alive) continue;
        if (a.c < minC) minC = a.c;
        if (a.c > maxC) maxC = a.c;
      }
      if (maxC < 0) return;
      var left = formX + minC * PITCH_X;
      var right = formX + maxC * PITCH_X + AW;
      var next = dir * STEP_X;
      if (left + next < MARGIN || right + next > VIEW_W - MARGIN) {
        dir = -dir;
        formY += STEP_DOWN;
      } else {
        formX += next;
      }
      anim ^= 1;
      tone(MARCH_NOTES[marchNote % 4], 0.05, "square", 0.02);
      marchNote++;
    }

    function overlaps(ax, ay, aw, ah, bx, by, bw, bh) {
      return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    function findShieldCell(x, y) {
      for (var i = 0; i < shields.length; i++) {
        var s = shields[i];
        var w = SHIELD_COLS * CELL;
        var h = SHIELD_ROWS * CELL;
        if (x < s.x || y < s.y || x >= s.x + w || y >= s.y + h) continue;
        var cx = Math.floor((x - s.x) / CELL);
        var cy = Math.floor((y - s.y) / CELL);
        if (s.grid[cy] && s.grid[cy][cx]) return { grid: s.grid, cx: cx, cy: cy };
      }
      return null;
    }

    function erode(grid, cx, cy) {
      var deltas = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1], [1, 1], [-1, -1]];
      for (var i = 0; i < deltas.length; i++) {
        var x = cx + deltas[i][0];
        var y = cy + deltas[i][1];
        if (y < 0 || x < 0 || y >= SHIELD_ROWS || x >= SHIELD_COLS) continue;
        grid[y][x] = 0;
      }
    }

    function bulletHitsShield(b, leadingDown) {
      var offsets = leadingDown ? [b.h - 1, b.h / 2, 0] : [0, b.h / 2, b.h - 1];
      for (var i = 0; i < offsets.length; i++) {
        var hit = findShieldCell(b.x + b.w / 2, b.y + offsets[i]);
        if (hit) {
          erode(hit.grid, hit.cx, hit.cy);
          return true;
        }
      }
      return false;
    }

    function burst(x, y, color) {
      for (var i = 0; i < 10; i++) {
        var ang = (Math.PI * 2 * i) / 10;
        var sp = 40 + (i % 3) * 30;
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life: 0.42,
          max: 0.42,
          color: i % 2 ? color : "#fff6c8",
          kind: i % 3,
          rot: ang
        });
      }
    }

    function killAlien(a, x, y) {
      if (!a.alive) return;
      a.alive = false;
      var pts = ROW_POINTS[a.r];
      score += pts;
      burst(x, y, ROW_COLOR[a.r]);
      floaters.push({ x: x, y: y, text: "+" + pts, life: 0.7, max: 0.7, color: ROW_COLOR[a.r] });
      noise(0.08, 0.05);
      tone(320, 0.07, "square", 0.04, 90);
    }

    function clearWeapons() {
      bolts = [];
      torpedoes = [];
      blasts = [];
    }

    function killPlayer() {
      if (state !== "playing" || invuln > 0) return;
      lives -= 1;
      clearWeapons();
      alienShots = [];
      shake = 9;
      burst(playerX + PLAYER_W / 2, PLAYER_Y + PLAYER_H / 2, "#d6ff4a");
      tone(220, 0.32, "sawtooth", 0.06, 40);
      if (lives <= 0) {
        state = "gameover";
        endReason = "lives";
        lastScore = score;
        return;
      }
      invuln = 1.8;
      stun = 0.85;
    }

    function canFire() {
      return state === "playing" && stun <= 0;
    }

    function tryBolt() {
      if (!canFire() || boltCd > 0) return;
      boltCd = 0.16;
      ensureAudio();
      bolts.push({
        x: playerX + PLAYER_W / 2 - 2,
        y: PLAYER_Y - 12,
        w: 4,
        h: 12,
        vx: 0,
        vy: -SHOT_SPEED,
        life: 1.4,
        kind: "bolt"
      });
      tone(880, 0.04, "square", 0.03, 520);
    }

    function tryTorpedo() {
      if (!canFire() || torpedoCd > 0) return;
      torpedoCd = 0.55;
      ensureAudio();
      var nose = playerX + PLAYER_W / 2;
      torpedoes.push({
        baseX: nose,
        x: nose,
        y: PLAYER_Y - 8,
        age: 0,
        phase: torpedoes.length % 2 === 0 ? 0 : Math.PI,
        trail: []
      });
      tone(240, 0.14, "sawtooth", 0.045, 110);
    }

    function trySpread() {
      if (!canFire() || spreadCd > 0) return;
      spreadCd = 0.48;
      ensureAudio();
      var noseX = playerX + PLAYER_W / 2 - 2;
      var noseY = PLAYER_Y - 12;
      var fans = [
        { vx: -120, vy: -560 },
        { vx: 0, vy: -560 },
        { vx: 120, vy: -560 }
      ];
      for (var i = 0; i < fans.length; i++) {
        bolts.push({
          x: noseX,
          y: noseY,
          w: 4,
          h: 10,
          vx: fans[i].vx,
          vy: fans[i].vy,
          life: 0.62,
          kind: "spread"
        });
      }
      tone(640, 0.06, "square", 0.035, 420);
    }

    function movePlayer(dt) {
      var d = 0;
      if (heldLeft.size > 0) d -= 1;
      if (heldRight.size > 0) d += 1;
      playerX += d * PLAYER_SPEED * dt;
      if (playerX < MARGIN) playerX = MARGIN;
      if (playerX > VIEW_W - MARGIN - PLAYER_W) playerX = VIEW_W - MARGIN - PLAYER_W;
    }

    function moveBolts(dt) {
      for (var i = bolts.length - 1; i >= 0; i--) {
        var s = bolts[i];
        var speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy) || SHOT_SPEED;
        var remain = speed * dt;
        var remove = false;
        while (remain > 0 && !remove) {
          var step = Math.min(6, remain);
          s.x += s.vx * (step / speed);
          s.y += s.vy * (step / speed);
          s.life -= step / speed;
          remain -= step;
          if (s.life <= 0 || s.y + s.h < 36 || s.x < -24 || s.x > VIEW_W + 24) {
            remove = true;
            break;
          }
          var hitAlien = false;
          for (var a = 0; a < aliens.length; a++) {
            var alien = aliens[a];
            if (!alien.alive) continue;
            var p = cellPos(alien);
            if (overlaps(s.x, s.y, s.w, s.h, p.x, p.y, AW, AH)) {
              killAlien(alien, p.x + AW / 2, p.y + AH / 2);
              hitAlien = true;
              break;
            }
          }
          if (hitAlien) {
            remove = true;
            break;
          }
          if (bulletHitsShield(s, false)) {
            tone(160, 0.03, "square", 0.025);
            remove = true;
            break;
          }
        }
        if (remove) bolts.splice(i, 1);
      }
    }

    function alienFrontY() {
      var front = 70;
      for (var i = 0; i < aliens.length; i++) {
        if (!aliens[i].alive) continue;
        var bottom = cellPos(aliens[i]).y + AH;
        if (bottom > front) front = bottom;
      }
      return front;
    }

    function erodeShieldsInRadius(cx, cy, radius) {
      var r2 = radius * radius;
      for (var s = 0; s < shields.length; s++) {
        var shield = shields[s];
        for (var y = 0; y < SHIELD_ROWS; y++) {
          for (var x = 0; x < SHIELD_COLS; x++) {
            if (!shield.grid[y][x]) continue;
            var px = shield.x + x * CELL + CELL / 2;
            var py = shield.y + y * CELL + CELL / 2;
            var dx = px - cx;
            var dy = py - cy;
            if (dx * dx + dy * dy <= r2) shield.grid[y][x] = 0;
          }
        }
      }
    }

    function explodeTorpedo(t) {
      var cx = t.x;
      var cy = t.y;
      var radius = 48;
      blasts.push({ x: cx, y: cy, life: 0.32, max: 0.32, r: radius });
      for (var i = 0; i < aliens.length; i++) {
        var a = aliens[i];
        if (!a.alive) continue;
        var p = cellPos(a);
        var ax = p.x + AW / 2;
        var ay = p.y + AH / 2;
        var dx = ax - cx;
        var dy = ay - cy;
        if (dx * dx + dy * dy <= radius * radius) killAlien(a, ax, ay);
      }
      erodeShieldsInRadius(cx, cy, 26);
      burst(cx, cy, "#7af0ff");
      noise(0.1, 0.07);
      tone(150, 0.16, "sawtooth", 0.05, 48);
    }

    function torpedoHitsShield(t) {
      return !!(findShieldCell(t.x, t.y) || findShieldCell(t.x, t.y + 8));
    }

    function moveTorpedoes(dt) {
      var speed = 460;
      for (var i = torpedoes.length - 1; i >= 0; i--) {
        var t = torpedoes[i];
        var remain = speed * dt;
        var exploded = false;
        while (remain > 0 && !exploded) {
          var step = Math.min(6, remain);
          t.age += step / speed;
          t.y -= step;
          t.x = t.baseX + Math.sin(t.age * 12 + t.phase) * 22;
          t.trail.push({ x: t.x, y: t.y });
          if (t.trail.length > 7) t.trail.shift();
          remain -= step;
          var reached = t.y <= alienFrontY() + 4;
          if (t.y < 46 || t.age > 1.15 || reached || torpedoHitsShield(t)) {
            explodeTorpedo(t);
            exploded = true;
          }
        }
        if (exploded) torpedoes.splice(i, 1);
      }
    }

    function armAlienShots(dt) {
      shotAcc += dt;
      var alive = countAlive();
      var ratio = alive / (COLS * ROWS);
      var interval = Math.max(0.38, 1.2 - (wave - 1) * 0.1 - (1 - ratio) * 0.35);
      var cap = Math.min(3, 1 + Math.floor((wave - 1) / 2));
      if (shotAcc < interval || alienShots.length >= cap) return;
      shotAcc = 0;
      var shooters = [];
      for (var c = 0; c < COLS; c++) {
        var shooter = null;
        for (var i = 0; i < aliens.length; i++) {
          var a = aliens[i];
          if (a.alive && a.c === c && (!shooter || a.r > shooter.r)) shooter = a;
        }
        if (shooter) shooters.push(shooter);
      }
      if (!shooters.length) return;
      var pick = shooters[Math.floor(Math.random() * shooters.length)];
      var p = cellPos(pick);
      alienShots.push({ x: p.x + AW / 2 - 2, y: p.y + AH - 2, w: 4, h: 12 });
    }

    function moveAlienShots(dt) {
      var alive = Math.max(1, countAlive());
      var ratio = alive / (COLS * ROWS);
      var speed = (ALIEN_SHOT_SPEED + wave * 14) * (1.2 - 0.35 * ratio);
      var left = speed * dt;
      for (var i = alienShots.length - 1; i >= 0; i--) {
        var s = alienShots[i];
        var remain = left;
        var remove = false;
        while (remain > 0 && !remove) {
          var step = Math.min(6, remain);
          s.y += step;
          remain -= step;
          if (s.y > VIEW_H - 24) {
            remove = true;
            break;
          }
          if (bulletHitsShield(s, true)) {
            remove = true;
            tone(120, 0.03, "square", 0.02);
            break;
          }
          if (overlaps(s.x, s.y, s.w, s.h, playerX + 4, PLAYER_Y + 4, PLAYER_W - 8, PLAYER_H - 6)) {
            remove = true;
            alienShots.splice(i, 1);
            if (invuln > 0) break;
            killPlayer();
            return;
          }
        }
        if (remove && alienShots[i] === s) alienShots.splice(i, 1);
      }
    }

    function aliensEatShields() {
      var sw = SHIELD_COLS * CELL;
      var sh = SHIELD_ROWS * CELL;
      for (var i = 0; i < aliens.length; i++) {
        var a = aliens[i];
        if (!a.alive) continue;
        var p = cellPos(a);
        for (var s = 0; s < shields.length; s++) {
          var shield = shields[s];
          var x0 = Math.max(p.x, shield.x);
          var y0 = Math.max(p.y, shield.y);
          var x1 = Math.min(p.x + AW, shield.x + sw);
          var y1 = Math.min(p.y + AH, shield.y + sh);
          if (x1 <= x0 || y1 <= y0) continue;
          var c0 = Math.floor((x0 - shield.x) / CELL);
          var r0 = Math.floor((y0 - shield.y) / CELL);
          var c1 = Math.min(SHIELD_COLS - 1, Math.floor((x1 - 1 - shield.x) / CELL));
          var r1 = Math.min(SHIELD_ROWS - 1, Math.floor((y1 - 1 - shield.y) / CELL));
          for (var ry = r0; ry <= r1; ry++) {
            for (var cx = c0; cx <= c1; cx++) shield.grid[ry][cx] = 0;
          }
        }
      }
    }

    function anyLanded() {
      for (var i = 0; i < aliens.length; i++) {
        if (!aliens[i].alive) continue;
        if (cellPos(aliens[i]).y + AH >= PLAYER_Y) return true;
      }
      return false;
    }

    function update(dt) {
      if (invuln > 0) invuln = Math.max(0, invuln - dt);
      var frozen = stun > 0;
      if (stun > 0) stun = Math.max(0, stun - dt);
      movePlayer(dt);
      boltCd = Math.max(0, boltCd - dt);
      torpedoCd = Math.max(0, torpedoCd - dt);
      spreadCd = Math.max(0, spreadCd - dt);
      if (!frozen) {
        if (heldSpace) tryBolt();
        if (heldBomb) tryTorpedo();
        if (heldSpread) trySpread();
      }
      moveBolts(dt);
      moveTorpedoes(dt);
      if (state !== "playing") return;
      if (countAlive() === 0) {
        state = "waveClear";
        waveTimer = 1.45;
        clearWeapons();
        alienShots = [];
        var audio = ensureAudio();
        if (audio) {
          var t = audio.currentTime;
          [523, 659, 784, 1046].forEach(function (freq, i) {
            toneAt(t + i * 0.08, freq, 0.12, "square", 0.045);
          });
        }
        return;
      }
      if (!frozen) {
        marchAcc += dt;
        var delay = marchDelay();
        var steps = 0;
        while (marchAcc >= delay && steps < 3) {
          marchAcc -= delay;
          stepFormation();
          steps++;
          delay = marchDelay();
        }
        armAlienShots(dt);
      }
      if (anyLanded()) {
        state = "gameover";
        endReason = "landed";
        lastScore = score;
        tone(90, 0.45, "sawtooth", 0.06, 36);
        return;
      }
      aliensEatShields();
      moveAlienShots(dt);
    }

    function updateFx(dt) {
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.life <= 0) particles.splice(i, 1);
      }
      for (var f = floaters.length - 1; f >= 0; f--) {
        floaters[f].life -= dt;
        floaters[f].y -= 26 * dt;
        if (floaters[f].life <= 0) floaters.splice(f, 1);
      }
      for (var b = blasts.length - 1; b >= 0; b--) {
        blasts[b].life -= dt;
        if (blasts[b].life <= 0) blasts.splice(b, 1);
      }
    }

    function font(px) {
      return "600 " + px + "px ui-monospace, Menlo, Consolas, monospace";
    }

    function text(x, y, str, size, color, align) {
      bctx.font = font(size);
      bctx.textAlign = align || "left";
      bctx.textBaseline = "top";
      bctx.fillStyle = "rgba(6, 4, 18, 0.8)";
      bctx.fillText(str, x + 1, y + 1);
      bctx.fillStyle = color;
      bctx.fillText(str, x, y);
    }

    function drawSprite(lines, x, y, palette) {
      var scale = 2;
      for (var r = 0; r < lines.length; r++) {
        for (var c = 0; c < lines[r].length; c++) {
          var ch = lines[r][c];
          if (ch === "." || !palette[ch]) continue;
          bctx.fillStyle = palette[ch];
          bctx.fillRect(x + c * scale, y + r * scale, scale, scale);
        }
      }
    }

    function drawBackdrop(forTitle) {
      var sky = bctx.createLinearGradient(0, 0, 0, VIEW_H);
      sky.addColorStop(0, "#14082c");
      sky.addColorStop(0.42, "#24144a");
      sky.addColorStop(0.72, "#122044");
      sky.addColorStop(1, "#081018");
      bctx.fillStyle = sky;
      bctx.fillRect(0, 0, VIEW_W, VIEW_H);

      bctx.globalAlpha = 0.28;
      bctx.fillStyle = "#7a4bff";
      bctx.beginPath();
      bctx.ellipse(110, 78, 92, 30, -0.5, 0, Math.PI * 2);
      bctx.fill();
      bctx.fillStyle = "#ff4d86";
      bctx.beginPath();
      bctx.ellipse(390, 48, 70, 22, 0.4, 0, Math.PI * 2);
      bctx.fill();
      bctx.globalAlpha = 1;

      var moonX = forTitle ? 434 : 400;
      var moonY = forTitle ? 118 : 390;
      var moonR = forTitle ? 16 : 24;
      bctx.fillStyle = "#f6e2ae";
      bctx.beginPath();
      bctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      bctx.fill();
      bctx.fillStyle = "#e4c98a";
      bctx.beginPath();
      bctx.arc(moonX - 6, moonY - 5, Math.max(3, moonR * 0.24), 0, Math.PI * 2);
      bctx.arc(moonX + 6, moonY + 5, Math.max(2, moonR * 0.16), 0, Math.PI * 2);
      bctx.fill();

      var planetX = forTitle ? 42 : 62;
      var planetY = forTitle ? 200 : 392;
      bctx.fillStyle = "#8fd0ff";
      bctx.beginPath();
      bctx.arc(planetX, planetY, 12, 0, Math.PI * 2);
      bctx.fill();
      bctx.strokeStyle = "#d7f4ff";
      bctx.lineWidth = 2;
      bctx.beginPath();
      bctx.ellipse(planetX, planetY, 20, 5, -0.4, 0, Math.PI * 2);
      bctx.stroke();

      if (!forTitle) {
        bctx.globalAlpha = 0.16;
        bctx.fillStyle = "#3ec8ff";
        bctx.beginPath();
        bctx.ellipse(240, 548, 150, 16, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.globalAlpha = 1;
      }

      for (var i = 0; i < STARS.length; i++) {
        var s = STARS[i];
        var tw = 0.55 + 0.45 * Math.sin(clock * (1.4 + (i % 5) * 0.35) + s.phase);
        bctx.globalAlpha = s.a * tw;
        bctx.fillStyle = i % 6 === 0 ? "#ffe9a8" : "#e7f0ff";
        if (s.plus) {
          bctx.fillRect(s.x - 1, s.y, s.r + 2, s.r);
          bctx.fillRect(s.x, s.y - 1, s.r, s.r + 2);
        } else {
          bctx.fillRect(s.x, s.y, s.r, s.r);
        }
      }
      bctx.globalAlpha = 1;
    }

    function drawCity() {
      var x = 4;
      for (var i = 0; i < SKYLINE.length; i++) {
        var w = 16 + (i % 3) * 8;
        var h = Math.min(SKYLINE[i], 10);
        var top = 602 - h;
        bctx.fillStyle = i % 2 ? "#141c32" : "#1c2744";
        bctx.fillRect(x, top, w - 3, h);
        bctx.fillStyle = "#2a3858";
        bctx.fillRect(x, top, w - 3, 2);
        if (h > 6) {
          bctx.fillStyle = (i + Math.floor(clock * 2)) % 5 === 0 ? "#fff1b0" : "#8aa4c8";
          bctx.globalAlpha = 0.85;
          for (var wy = top + 4; wy < 598; wy += 4) {
            bctx.fillRect(x + 3, wy, 2, 2);
            if (w > 22) bctx.fillRect(x + 9, wy, 2, 2);
          }
          bctx.globalAlpha = 1;
        }
        x += w;
        if (x > VIEW_W) break;
      }
      bctx.fillStyle = "#31425f";
      bctx.fillRect(0, 600, VIEW_W, 3);
    }

    function drawShip(x, y, mini) {
      var flick = Math.floor(clock * 16) % 2;
      var thrust = !mini && (heldLeft.size > 0 || heldRight.size > 0);
      if (!mini) {
        var fh = thrust ? (flick ? 7 : 5) : (flick ? 4 : 3);
        bctx.fillStyle = flick ? "#fff4b0" : "#ffb03a";
        bctx.fillRect(x + 6, y + 16, 4, fh);
        bctx.fillRect(x + 22, y + 16, 4, fh);
        bctx.fillStyle = "#ff5d73";
        bctx.fillRect(x + 7, y + 16, 2, Math.max(2, fh - 2));
        bctx.fillRect(x + 23, y + 16, 2, Math.max(2, fh - 2));
        bctx.fillStyle = Math.floor(clock * 5) % 2 ? "#ff5a7a" : "#ffd0dc";
        bctx.fillRect(x + 15, y - 3, 2, 3);
      }
      bctx.fillStyle = "#6d4dff";
      bctx.fillRect(x, y + 9, 32, 6);
      bctx.fillStyle = "#ffd23a";
      bctx.fillRect(x, y + 12, 6, 3);
      bctx.fillRect(x + 26, y + 12, 6, 3);
      bctx.fillStyle = "#f7f4ff";
      bctx.fillRect(x + 8, y + 5, 16, 11);
      bctx.fillStyle = "#d6ff4a";
      bctx.fillRect(x + 11, y + 3, 10, 8);
      bctx.fillStyle = "#ffe566";
      bctx.fillRect(x + 13, y + 1, 6, 5);
      bctx.fillStyle = "#fffef6";
      bctx.fillRect(x + 14, y, 4, 3);
      bctx.fillStyle = "#1b2458";
      bctx.fillRect(x + 12, y + 6, 8, 5);
      bctx.fillStyle = "#9af0ff";
      bctx.fillRect(x + 13, y + 7, 2, 2);
      bctx.fillRect(x + 17, y + 7, 2, 2);
      bctx.fillStyle = "#ff6d90";
      bctx.fillRect(x + 14, y + 12, 4, 1);
      bctx.fillStyle = flick ? "#fffef6" : "#9af0ff";
      bctx.fillRect(x + 2, y + 10, 2, 2);
      bctx.fillRect(x + 28, y + 10, 2, 2);
    }

    function drawShields() {
      for (var s = 0; s < shields.length; s++) {
        var shield = shields[s];
        var solid = 0;
        for (var y = 0; y < SHIELD_ROWS; y++) {
          for (var x = 0; x < SHIELD_COLS; x++) {
            if (!shield.grid[y][x]) continue;
            solid++;
            var sx = shield.x + x * CELL;
            var sy = shield.y + y * CELL;
            var shade = (x + y) % 2 === 0 ? "#34c97e" : "#249866";
            if (y < 2) shade = "#d8ffe8";
            else if (y < 5) shade = "#8ef0b4";
            bctx.fillStyle = shade;
            bctx.fillRect(sx, sy, CELL, CELL);
            if (!shield.grid[y][x - 1] || !shield.grid[y - 1] || !shield.grid[y - 1][x]) {
              bctx.fillStyle = "rgba(255,255,255,0.28)";
              bctx.fillRect(sx, sy, CELL, 1);
            }
          }
        }
        var gx = shield.x;
        var gy = shield.y;
        var leftEye = shield.grid[4] && shield.grid[4][6];
        var rightEye = shield.grid[4] && shield.grid[4][11];
        if (leftEye) {
          bctx.fillStyle = "#102818";
          bctx.fillRect(gx + 6 * CELL, gy + 4 * CELL, 3, 3);
          bctx.fillStyle = "#fff";
          bctx.fillRect(gx + 6 * CELL, gy + 4 * CELL, 1, 1);
        }
        if (rightEye) {
          bctx.fillStyle = "#102818";
          bctx.fillRect(gx + 11 * CELL, gy + 4 * CELL, 3, 3);
          bctx.fillStyle = "#fff";
          bctx.fillRect(gx + 13 * CELL - 1, gy + 4 * CELL, 1, 1);
        }
        var smile = solid > 150;
        if (smile && shield.grid[7]) {
          bctx.fillStyle = "#143024";
          for (var mx = 7; mx <= 10; mx++) {
            if (shield.grid[7][mx]) bctx.fillRect(gx + mx * CELL, gy + 7 * CELL + 1, 2, 1);
          }
        }
      }
    }

    function drawBolt(shot) {
      var spread = shot.kind === "spread";
      bctx.save();
      bctx.translate(shot.x + shot.w / 2, shot.y + shot.h / 2);
      bctx.rotate(Math.atan2(shot.vx, -shot.vy));
      bctx.fillStyle = spread ? "rgba(120, 240, 255, 0.4)" : "rgba(255, 236, 140, 0.35)";
      bctx.fillRect(-shot.w / 2 - 2, -shot.h / 2 - 1, shot.w + 4, shot.h + 2);
      bctx.fillStyle = spread ? "#d9fbff" : "#fffef2";
      bctx.fillRect(-shot.w / 2, -shot.h / 2, shot.w, shot.h);
      bctx.fillStyle = spread ? "#3ad0ff" : "#ffe566";
      bctx.fillRect(-1, -shot.h / 2 + 2, 2, Math.max(4, shot.h - 4));
      bctx.restore();
    }

    function drawTorpedo(t) {
      var trail = t.trail || [];
      for (var i = 0; i < trail.length; i++) {
        bctx.globalAlpha = ((i + 1) / trail.length) * 0.75;
        bctx.fillStyle = i % 2 ? "#7af0ff" : "#ffb03a";
        bctx.fillRect(trail[i].x - 2, trail[i].y, 4, 3);
      }
      bctx.globalAlpha = 1;
      bctx.fillStyle = "#ff8a2a";
      bctx.fillRect(t.x - 3, t.y, 6, 11);
      bctx.fillStyle = "#fff3c4";
      bctx.fillRect(t.x - 1, t.y + 2, 2, 5);
      bctx.fillStyle = "#7af0ff";
      bctx.fillRect(t.x - 2, t.y + 10, 4, 4);
    }

    function drawBlast(blast) {
      var k = 1 - blast.life / blast.max;
      bctx.globalAlpha = blast.life / blast.max;
      bctx.strokeStyle = "#fff6c8";
      bctx.lineWidth = 2;
      bctx.beginPath();
      bctx.arc(blast.x, blast.y, 8 + blast.r * k, 0, Math.PI * 2);
      bctx.stroke();
      bctx.fillStyle = "#7af0ff";
      bctx.beginPath();
      bctx.arc(blast.x, blast.y, 6 + blast.r * k * 0.45, 0, Math.PI * 2);
      bctx.fill();
      bctx.globalAlpha = 1;
    }

    function drawGoop(shot, n) {
      var wob = Math.sin(clock * 9 + n * 2.1) * 1.3;
      var cx = shot.x + shot.w / 2 + wob;
      var cy = shot.y + 4;
      bctx.fillStyle = "#ff4d78";
      bctx.beginPath();
      bctx.arc(cx, cy, 3.4, 0, Math.PI * 2);
      bctx.fill();
      bctx.fillStyle = "#ffd0dc";
      bctx.fillRect(cx - 1, cy - 2, 2, 2);
      bctx.fillStyle = "#ff4d78";
      bctx.fillRect(cx - 1, shot.y + 6, 2, 6);
    }

    function drawSpark(x, y, color) {
      bctx.fillStyle = color;
      bctx.fillRect(x - 2, y, 5, 1);
      bctx.fillRect(x, y - 2, 1, 5);
    }

    function drawWorld() {
      drawBackdrop(false);
      drawCity();
      drawShields();
      var alive = countAlive();
      for (var i = 0; i < aliens.length; i++) {
        var a = aliens[i];
        if (!a.alive) continue;
        var p = cellPos(a);
        var kind = ROW_KIND[a.r];
        var jitter = alive > 0 && alive < 12 ? (Math.sin(clock * 24 + i) > 0 ? 1 : -1) : 0;
        var bounce = anim ? 1 : 0;
        drawSprite(SPRITES[kind][anim], p.x + jitter, p.y + bounce, PALETTES[kind]);
      }
      for (var shotI = 0; shotI < bolts.length; shotI++) drawBolt(bolts[shotI]);
      for (var torpI = 0; torpI < torpedoes.length; torpI++) drawTorpedo(torpedoes[torpI]);
      for (var blastI = 0; blastI < blasts.length; blastI++) drawBlast(blasts[blastI]);
      for (var b = 0; b < alienShots.length; b++) drawGoop(alienShots[b], b);
      var showShip = lives > 0 && (invuln <= 0 || Math.floor(clock * 12) % 2 === 0);
      if (showShip) drawShip(Math.round(playerX), PLAYER_Y, false);
      for (var i2 = particles.length - 1; i2 >= 0; i2--) {
        var part = particles[i2];
        bctx.save();
        bctx.globalAlpha = Math.max(0, part.life / part.max);
        bctx.translate(part.x, part.y);
        bctx.rotate(part.rot || 0);
        bctx.fillStyle = part.color;
        if (part.kind === 0) {
          bctx.fillRect(-3, -1, 6, 2);
          bctx.fillRect(-1, -3, 2, 6);
        } else if (part.kind === 1) {
          bctx.fillRect(-2, -2, 4, 4);
        } else {
          bctx.fillRect(-1, -3, 2, 6);
        }
        bctx.restore();
      }
      bctx.globalAlpha = 1;
      for (var f = 0; f < floaters.length; f++) {
        var flo = floaters[f];
        bctx.globalAlpha = Math.max(0, flo.life / flo.max);
        text(flo.x, flo.y, flo.text, 14, flo.color, "center");
      }
      bctx.globalAlpha = 1;
    }

    function drawHud() {
      bctx.fillStyle = "rgba(8, 6, 20, 0.72)";
      bctx.fillRect(0, 0, VIEW_W, 34);
      bctx.fillStyle = "#ffd23a";
      bctx.fillRect(0, 34, VIEW_W, 2);
      text(16, 10, "SCORE " + String(score).padStart(4, "0"), 16, "#fff6c8", "left");
      text(VIEW_W / 2, 10, "WAVE " + wave, 16, "#d6ff4a", "center");
      for (var i = 0; i < lives; i++) {
        bctx.save();
        bctx.translate(VIEW_W - 26 - i * 22, 8);
        bctx.scale(0.5, 0.5);
        drawShip(0, 0, true);
        bctx.restore();
      }
      text(VIEW_W / 2, 616, "MOVE  SPACE BOLT  B TORPEDO  N SPREAD  P PAUSE  R  ESC", 11, "#b7c6da", "center");
    }

    function drawCard(x, y, w, h, border) {
      bctx.fillStyle = "rgba(10, 8, 24, 0.9)";
      bctx.fillRect(x, y, w, h);
      bctx.fillStyle = border;
      bctx.fillRect(x, y, w, 3);
      bctx.fillRect(x, y + h - 3, w, 3);
      bctx.fillRect(x, y, 3, h);
      bctx.fillRect(x + w - 3, y, 3, h);
      var on = Math.floor(clock * 3) % 2 === 0;
      bctx.fillStyle = on ? "#fff6c2" : border;
      bctx.fillRect(x + 8, y + 8, 3, 3);
      bctx.fillRect(x + w - 11, y + 8, 3, 3);
    }

    function drawOverlay() {
      if (state === "paused") {
        drawCard(78, 250, VIEW_W - 156, 200, "#ffd23a");
        text(VIEW_W / 2, 278, "PAUSED", 36, "#fff6c8", "center");
        text(VIEW_W / 2, 334, "P  RESUME", 16, "#d5e4f2", "center");
        text(VIEW_W / 2, 364, "R  RESTART", 16, "#d5e4f2", "center");
        text(VIEW_W / 2, 394, "ESC  QUIT", 16, "#d5e4f2", "center");
      } else if (state === "waveClear") {
        drawSpark(108, 258, "#ffe566");
        drawSpark(VIEW_W - 108, 258, "#ff6d90");
        drawSpark(96, 390, "#6eb6ff");
        drawSpark(VIEW_W - 96, 390, "#3ee0a2");
        drawCard(78, 268, VIEW_W - 156, 140, "#d6ff4a");
        text(VIEW_W / 2, 292, "WAVE " + wave + " CLEAR", 28, "#d6ff4a", "center");
        text(VIEW_W / 2, 348, "NEXT WAVE " + (wave + 1), 16, "#e7ffe8", "center");
      } else if (state === "gameover") {
        drawCard(48, 236, VIEW_W - 96, 250, "#ff6d90");
        text(VIEW_W / 2, 258, "GAME OVER", 36, "#ff9aaf", "center");
        var reason = endReason === "landed" ? "THEY REACHED THE BOTTOM" : "YOU WERE HIT";
        text(VIEW_W / 2, 312, reason, 14, "#ffd0d8", "center");
        text(VIEW_W / 2, 346, "SCORE " + score + "    WAVE " + wave, 16, "#e7ffe8", "center");
        text(VIEW_W / 2, 390, "ENTER OR R  PLAY AGAIN", 16, "#d5e4f2", "center");
        text(VIEW_W / 2, 420, "ESC  QUIT", 16, "#d5e4f2", "center");
      }
    }

    function drawTitle() {
      drawBackdrop(true);
      var frame = Math.floor(clock * 2) % 2;
      var bob = Math.sin(clock * 3) * 2;
      drawShip(28, 66 + bob, false);
      drawShip(VIEW_W - 60, 66 - bob, false);
      text(VIEW_W / 2, 46, "SPACE INVADERS", 16, "#c9b7e8", "center");
      text(VIEW_W / 2, 72, "PEW PEW PANIC", 32, "#d6ff4a", "center");
      for (var r = 0; r < ROWS; r++) {
        var y = 138 + r * 36 + Math.sin(clock * 2.2 + r) * 2;
        var kind = ROW_KIND[r];
        for (var c = 0; c < 7; c++) {
          drawSprite(SPRITES[kind][frame], 78 + c * 36, y, PALETTES[kind]);
        }
        text(372, y + 2, String(ROW_POINTS[r]), 16, ROW_COLOR[r], "left");
      }
      text(VIEW_W / 2, 328, "HIGHER ROWS SCORE MORE", 13, "#f0e2ff", "center");
      var rules = [
        "Clear every alien to win the wave.",
        "They march, step down, and shoot back.",
        "Shields crumble. You have 3 lives.",
        "If they reach the bottom, you lose."
      ];
      for (var i = 0; i < rules.length; i++) text(VIEW_W / 2, 356 + i * 22, rules[i], 14, "#e4f2ea", "center");
      text(VIEW_W / 2, 456, "ENTER  START", 15, "#fff6c8", "center");
      text(VIEW_W / 2, 478, "LEFT / RIGHT  OR  A / D  MOVE", 15, "#fff6c8", "center");
      text(VIEW_W / 2, 502, "HOLD SPACE  RAPID BOLT", 15, "#fff6c8", "center");
      text(VIEW_W / 2, 526, "B  TORPEDO     N  SPREAD", 15, "#fff6c8", "center");
      text(VIEW_W / 2, 550, "P  PAUSE     R  RESTART     ESC  QUIT", 15, "#fff6c8", "center");
      if (Math.floor(clock * 2) % 2 === 0) text(VIEW_W / 2, 572, "PRESS ENTER", 18, "#d6ff4a", "center");
      if (lastScore !== null) text(VIEW_W / 2, 604, "LAST SCORE " + lastScore, 13, "#b7c6da", "center");
    }

    function sync() {
      wrap.dataset.state = state;
      wrap.dataset.score = String(score);
      wrap.dataset.lives = String(lives);
      wrap.dataset.wave = String(wave);
      var boltCount = 0;
      var spreadCount = 0;
      for (var shotN = 0; shotN < bolts.length; shotN++) {
        if (bolts[shotN].kind === "spread") spreadCount++;
        else boltCount++;
      }
      wrap.dataset.shot = (boltCount + spreadCount + torpedoes.length) ? "1" : "0";
      wrap.dataset.bolts = String(boltCount);
      wrap.dataset.spread = String(spreadCount);
      wrap.dataset.torpedoes = String(torpedoes.length);
      wrap.dataset.aliens = String(countAlive());
      wrap.dataset.reason = endReason;
      var msg = state;
      if (state === "playing") msg = "playing score " + score;
      else if (state === "gameover") msg = "game over " + endReason + " score " + score;
      else if (state === "waveClear") msg = "wave " + wave + " clear";
      if (msg !== liveText) {
        liveText = msg;
        live.textContent = msg;
      }
    }

    function draw() {
      layout();
      bctx.setTransform(1, 0, 0, 1, 0, 0);
      bctx.fillStyle = "#070b16";
      bctx.fillRect(0, 0, VIEW_W, VIEW_H);
      bctx.save();
      if (shake > 0 && state !== "stopped") {
        bctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      }
      if (state === "stopped") drawTitle();
      else {
        drawWorld();
        drawHud();
        drawOverlay();
      }
      bctx.restore();
      var w = canvas.width;
      var h = canvas.height;
      var scale = Math.min(w / VIEW_W, h / VIEW_H);
      var dw = Math.floor(VIEW_W * scale);
      var dh = Math.floor(VIEW_H * scale);
      var ox = Math.floor((w - dw) / 2);
      var oy = Math.floor((h - dh) / 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#04060c";
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(buffer, ox, oy, dw, dh);
      sync();
    }

    function token(e) {
      return e.code || e.key || "";
    }

    function isLeft(e) {
      return e.code === "ArrowLeft" || e.code === "KeyA" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A";
    }

    function isRight(e) {
      return e.code === "ArrowRight" || e.code === "KeyD" || e.key === "ArrowRight" || e.key === "d" || e.key === "D";
    }

    function onKeyDown(e) {
      if (dead || e.metaKey || e.ctrlKey || e.altKey) return;
      var left = isLeft(e);
      var right = isRight(e);
      var space = e.code === "Space" || e.key === " ";
      var bomb = e.code === "KeyB" || e.key === "b" || e.key === "B";
      var spread = e.code === "KeyN" || e.key === "n" || e.key === "N";
      var enter = e.code === "Enter" || e.key === "Enter";
      var pause = e.code === "KeyP" || e.key === "p" || e.key === "P";
      var restart = e.code === "KeyR" || e.key === "r" || e.key === "R";
      var esc = e.code === "Escape" || e.key === "Escape";
      if (!left && !right && !space && !bomb && !spread && !enter && !pause && !restart && !esc) return;
      e.preventDefault();
      if (left) heldLeft.add(token(e));
      if (right) heldRight.add(token(e));
      if (space) heldSpace = true;
      if (bomb) heldBomb = true;
      if (spread) heldSpread = true;
      if (!e.repeat) {
        if (space) tryBolt();
        if (bomb) tryTorpedo();
        if (spread) trySpread();
        if (enter && (state === "stopped" || state === "gameover")) {
          ensureAudio();
          newGame();
        }
        if (pause) {
          if (state === "playing") state = "paused";
          else if (state === "paused") state = "playing";
        }
        if (restart) {
          ensureAudio();
          newGame();
        }
        if (esc && state !== "stopped") {
          lastScore = score;
          state = "stopped";
          aliens = [];
          clearWeapons();
          alienShots = [];
          particles = [];
          floaters = [];
          stun = 0;
          invuln = 0;
          shake = 0;
        }
      }
      sync();
    }

    function onKeyUp(e) {
      var t = token(e);
      heldLeft.delete(t);
      heldRight.delete(t);
      if (e.key) {
        heldLeft.delete(e.key);
        heldRight.delete(e.key);
      }
      if (e.code === "Space" || e.key === " ") heldSpace = false;
      if (e.code === "KeyB" || e.key === "b" || e.key === "B") heldBomb = false;
      if (e.code === "KeyN" || e.key === "n" || e.key === "N") heldSpread = false;
    }

    function frame(now) {
      if (dead) return;
      var dt = 0;
      if (lastNow) dt = (now - lastNow) / 1000;
      lastNow = now;
      if (dt < 0) dt = 0;
      if (dt > 0.05) dt = 0.05;
      clock += dt;
      if (state === "playing") update(dt);
      else if (state === "waveClear") {
        waveTimer -= dt;
        if (waveTimer <= 0) {
          startWave(wave + 1);
          state = "playing";
        }
      }
      if (state !== "stopped" && state !== "paused") updateFx(dt);
      if (shake > 0 && state !== "stopped" && state !== "paused") shake = Math.max(0, shake - dt * 30);
      draw();
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener("keydown", onKeyDown, opt);
    window.addEventListener("keyup", onKeyUp, opt);
    window.addEventListener("blur", function () {
      heldLeft.clear();
      heldRight.clear();
      heldSpace = false;
      heldBomb = false;
      heldSpread = false;
    }, opt);
    wrap.addEventListener("pointerdown", function () { wrap.focus(); }, opt);

    wrap.dataset.state = "stopped";
    wrap.dataset.score = "0";
    wrap.dataset.lives = "3";
    wrap.dataset.wave = "1";
    wrap.dataset.shot = "0";
    wrap.dataset.bolts = "0";
    wrap.dataset.spread = "0";
    wrap.dataset.torpedoes = "0";
    wrap.dataset.aliens = "0";
    wrap.dataset.reason = "";
    layout();
    try { wrap.focus(); } catch (err) { /* focus is optional */ }
    raf = requestAnimationFrame(frame);

    function destroy() {
      if (dead) return;
      dead = true;
      ac.abort();
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.remove();
      if (actx && actx.state !== "closed") actx.close().catch(function () {});
    }

    return { destroy: destroy };
  }

  globalThis.DESKTOP_GAMES = globalThis.DESKTOP_GAMES || {};
  globalThis.DESKTOP_GAMES["pew-pew-panic"] = {
    id: "pew-pew-panic",
    title: "Space Invaders: Pew Pew Panic",
    mount: mount
  };

  function bootPlayer() {
    if (typeof document === "undefined" || !document.body) return;
    if (!document.body.hasAttribute("data-game-player")) return;
    var root = document.createElement("div");
    root.dataset.gameRoot = "pew-pew-panic";
    root.style.cssText = "position:fixed;inset:0;overflow:hidden;background:#04060c;";
    document.documentElement.style.height = "100%";
    document.documentElement.style.background = "#04060c";
    document.body.style.margin = "0";
    document.body.style.height = "100%";
    document.body.style.overflow = "hidden";
    document.body.style.background = "#04060c";
    document.body.appendChild(root);
    mount(root);
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootPlayer);
    else bootPlayer();
  }
})();

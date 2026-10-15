/* Qualitäts-Workshop: Spiellogik. */
(function () {
  'use strict';
  var Q = window.QW;
  var ATTRS = Q.ATTRS, STAGE_W = 960;
  var NS = 'http://www.w3.org/2000/svg';
  var R = 112;                       // Radius des Diagramms in SVG-Einheiten
  var UNIT = R / 10;

  function $(s) { return document.querySelector(s); }
  function el(tag, attrs, parent, text) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function svg(tag, attrs, parent, text) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ---------- Zustand ---------- */
  var S = {
    phase: 'title',        // title | interview | result
    scenario: null,
    level: 'easy',
    values: [], touched: [],
    heard: {},             // personId -> { idx: true }
    last: {},              // personId -> zuletzt gesprochener Index
    typing: null,
    zoom: false
  };

  var stage = $('#stage'), wrap = $('#stageWrap');
  var radar = $('#radar');
  var peopleEl = $('#people'), platesEl = $('#plates'), bubblesEl = $('#bubbles');
  var titleEl = $('#title');
  var personEls = {};         // id -> { btn, canvas, person }

  /* ---------- Skalierung der Bühne ---------- */
  function fit() {
    var s = wrap.clientWidth / STAGE_W;
    stage.style.transform = 'scale(' + s + ')';
  }
  window.addEventListener('resize', fit);
  fit();

  /* ---------- Highscores ---------- */
  function loadBest() { try { return JSON.parse(localStorage.getItem('qw-best') || '{}'); } catch (e) { return {}; } }
  function saveBest(id, pct) {
    try { var b = loadBest(); if (!(b[id] >= pct)) { b[id] = pct; localStorage.setItem('qw-best', JSON.stringify(b)); } } catch (e) { /* egal */ }
  }

  /* ---------- Tischdeko ---------- */
  Q.drawAscii($('#mug'), [
    '..........',
    '.1111111..',
    '.1222221.1',
    '.1222221.1',
    '.1222221.1',
    '.1222221..',
    '.1111111..',
    '..........'
  ].map(function (r) { return r.replace(/\./g, '0'); }), { 1: '#f4f4f4', 2: '#5a3318' });
  Q.drawAscii($('#pad'), [
    '000000000000',
    '011111111110',
    '012222222210',
    '011111111110',
    '012222222210',
    '011111111110',
    '012222221110',
    '011111111113',
    '000000000033'
  ], { 1: '#f6f1d4', 2: '#7aa0d8', 3: '#1a1a1a' });
  $('#mug').style.height = '48px'; $('#pad').style.height = '72px';

  /* ---------- Radar-Poster ---------- */
  var seg = {};          // "i:v" -> path
  var gPoly, gNodes, gVals, truthPoly, hoverMark, labelEls = [];

  function ang(i) { return (-90 + 45 * i) * Math.PI / 180; }
  function pt(i, r) { return [r * Math.cos(ang(i)), r * Math.sin(ang(i))]; }
  function polyPoints(vals) {
    return vals.map(function (v, i) { var p = pt(i, v * UNIT); return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
  }

  // Grenzen der Trefferzonen je Wert: 0 | 1 ... 10 (Nullzone etwas größer)
  function zoneInner(v) { return v === 0 ? 0 : (v === 1 ? 0.8 : v - 0.5) * UNIT; }
  function zoneOuter(v) { return v === 10 ? R + 26 : (v === 0 ? 0.8 : v + 0.5) * UNIT; }

  function sectorPath(i, v) {
    var a0 = ang(i) - Math.PI / 8, a1 = ang(i) + Math.PI / 8;
    var r0 = zoneInner(v), r1 = zoneOuter(v);
    function P(a, r) { return (r * Math.cos(a)).toFixed(2) + ' ' + (r * Math.sin(a)).toFixed(2); }
    if (r0 === 0) return 'M0 0 L' + P(a0, r1) + ' A' + r1 + ' ' + r1 + ' 0 0 1 ' + P(a1, r1) + ' Z';
    return 'M' + P(a0, r0) + ' L' + P(a0, r1) + ' A' + r1 + ' ' + r1 + ' 0 0 1 ' + P(a1, r1) +
           ' L' + P(a1, r0) + ' A' + r0 + ' ' + r0 + ' 0 0 0 ' + P(a0, r0) + ' Z';
  }

  function buildRadar() {
    // Papier: Achteck
    var paper = [];
    for (var k = 0; k < 8; k++) {
      var a = (-90 + 22.5 + 45 * k) * Math.PI / 180;
      paper.push((252 * Math.cos(a)).toFixed(1) + ',' + (252 * Math.sin(a)).toFixed(1));
    }
    svg('polygon', { points: paper.join(' '), fill: '#f1e3bd', stroke: '#3a2a18', 'stroke-width': 4 }, radar);
    var inner = [];
    for (k = 0; k < 8; k++) {
      a = (-90 + 22.5 + 45 * k) * Math.PI / 180;
      inner.push((240 * Math.cos(a)).toFixed(1) + ',' + (240 * Math.sin(a)).toFixed(1));
    }
    svg('polygon', { points: inner.join(' '), fill: 'none', stroke: '#b89c68', 'stroke-width': 1.5 }, radar);
    // Klebestreifen
    svg('rect', { x: -34, y: -250, width: 68, height: 18, fill: 'rgba(255,255,255,.55)', stroke: 'rgba(0,0,0,.15)', transform: 'rotate(-3)' }, radar);

    svg('text', { x: 0, y: -222, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 'bold', fill: '#7a5a30', 'letter-spacing': 2 }, radar, 'ISO/IEC 25010');
    svg('text', { x: 0, y: 232, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 'bold', fill: '#7a5a30', 'letter-spacing': 2 }, radar, 'PRODUKTQUALITÄT');

    // Ringe
    for (var r = 1; r <= 10; r++) {
      var rp = [];
      for (var i = 0; i < 8; i++) { var p = pt(i, r * UNIT); rp.push(p[0].toFixed(1) + ',' + p[1].toFixed(1)); }
      svg('polygon', { points: rp.join(' '), fill: r === 10 ? 'rgba(255,255,255,.35)' : 'none', stroke: r % 5 === 0 ? '#6a5a40' : '#c9b78e', 'stroke-width': r % 5 === 0 ? 1.6 : 1 }, radar);
    }
    // Achsen
    for (i = 0; i < 8; i++) { var q = pt(i, R); svg('line', { x1: 0, y1: 0, x2: q[0], y2: q[1], stroke: '#9a8660', 'stroke-width': 1 }, radar); }
    // Zahlen an der oberen Achse
    [2, 4, 6, 8, 10].forEach(function (n) {
      svg('text', { x: 4, y: -n * UNIT + 4, 'font-size': 9, fill: '#6a5a40' }, radar, String(n));
    });

    // Beschriftungen
    ATTRS.forEach(function (at, i) {
      var c = pt(i, i === 2 || i === 6 ? 170 : 176);
      var t = svg('text', { x: c[0], y: c[1] - (at.lines.length - 1) * 6.5 + 4, 'text-anchor': 'middle', 'class': 'axis-label untouched' }, radar);
      at.lines.forEach(function (ln, j) {
        svg('tspan', { x: c[0], dy: j === 0 ? 0 : 13 }, t, ln);
      });
      labelEls.push(t);
    });

    truthPoly = svg('polygon', { fill: 'rgba(30,160,80,.22)', stroke: '#16883e', 'stroke-width': 3, 'stroke-dasharray': '7 5', visibility: 'hidden', 'pointer-events': 'none' }, radar);
    gPoly = svg('polygon', { fill: 'rgba(40,110,255,.32)', stroke: '#1f4fd8', 'stroke-width': 3, 'stroke-linejoin': 'round', 'pointer-events': 'none' }, radar);
    gNodes = svg('g', { 'pointer-events': 'none' }, radar);
    gVals = svg('g', { 'pointer-events': 'none' }, radar);
    hoverMark = svg('circle', { r: 7, fill: 'none', stroke: '#0a3fc0', 'stroke-width': 2.5, visibility: 'hidden', 'pointer-events': 'none' }, radar);

    // Trefferzonen (unsichtbar, funktionieren auch unter der 3D-Neigung)
    var gSeg = svg('g', null, radar);
    for (i = 0; i < 8; i++) for (var v = 0; v <= 10; v++) {
      var path = svg('path', { d: sectorPath(i, v), 'class': 'seg', 'data-i': i, 'data-v': v }, gSeg);
      seg[i + ':' + v] = path;
    }
  }

  function renderRadar() {
    gPoly.setAttribute('points', polyPoints(S.values));
    gNodes.textContent = ''; gVals.textContent = '';
    S.values.forEach(function (v, i) {
      labelEls[i].setAttribute('class', 'axis-label' + (S.touched[i] ? '' : ' untouched'));
      if (!S.touched[i]) return;
      var p = pt(i, v * UNIT);
      svg('circle', { cx: p[0], cy: p[1], r: 5.5, fill: '#fff', stroke: '#1f4fd8', 'stroke-width': 3 }, gNodes);
      var o = pt(i, v * UNIT + 14);
      var t = svg('text', { x: o[0], y: o[1] + 5, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 'bold', fill: '#0a2a8c', stroke: '#f1e3bd', 'stroke-width': 4, 'paint-order': 'stroke' }, gVals, String(v));
      t.setAttribute('stroke-linejoin', 'round');
    });
  }

  function scaleWord(v) {
    for (var k = 0; k < Q.SCALE.length; k++) if (v >= Q.SCALE[k].from && v <= Q.SCALE[k].to) return Q.SCALE[k].label;
    return '';
  }
  function showReadout(i, v, hover) {
    var r = $('#readout');
    if (i == null) { r.textContent = 'Fahre mit der Maus über das Poster und klicke (oder ziehe), um Punkte zu vergeben.'; return; }
    r.innerHTML = '';
    el('b', null, r, ATTRS[i].name);
    r.appendChild(document.createTextNode(': ' + v + ' von 10 – ' + scaleWord(v) + (hover ? '' : '')));
    var rows = document.querySelectorAll('#scale tr');
    for (var k = 0; k < rows.length; k++) rows[k].classList.toggle('on', Q.SCALE[k].from <= v && v <= Q.SCALE[k].to);
  }

  function setValue(i, v) {
    if (S.phase !== 'interview') return;
    if (S.values[i] === v && S.touched[i]) return;
    S.values[i] = v; S.touched[i] = true;
    renderRadar(); showReadout(i, v);
    setStatus('');
  }

  var dragging = false;
  function segAt(e) {
    var t = document.elementFromPoint(e.clientX, e.clientY);
    return t && t.classList && t.classList.contains('seg') ? t : null;
  }
  function hover(s) {
    labelEls.forEach(function (l) { l.classList.remove('hot'); });
    if (!s) { hoverMark.setAttribute('visibility', 'hidden'); return; }
    var i = +s.getAttribute('data-i'), v = +s.getAttribute('data-v');
    var p = pt(i, v * UNIT);
    hoverMark.setAttribute('cx', p[0]); hoverMark.setAttribute('cy', p[1]); hoverMark.setAttribute('visibility', 'visible');
    labelEls[i].classList.add('hot');
    if (!dragging) showReadout(i, v, true);
  }
  radar.addEventListener('pointerdown', function (e) {
    if (S.phase !== 'interview') return;
    dragging = true;
    try { radar.setPointerCapture(e.pointerId); } catch (x) { /* egal */ }
    var s = segAt(e); if (s) setValue(+s.getAttribute('data-i'), +s.getAttribute('data-v'));
    e.preventDefault();
  });
  radar.addEventListener('pointermove', function (e) {
    var s = segAt(e);
    if (S.phase === 'interview') hover(s); else hover(null);
    if (dragging && s) setValue(+s.getAttribute('data-i'), +s.getAttribute('data-v'));
  });
  function endDrag() { dragging = false; }
  radar.addEventListener('pointerup', endDrag);
  radar.addEventListener('pointercancel', endDrag);
  radar.addEventListener('pointerleave', function () { if (!dragging) hover(null); });

  /* ---------- Sprechblasen ---------- */
  function clearBubbles() { bubblesEl.textContent = ''; }

  function makeBubble(person, cx, text, small, instant) {
    var b = el('div', { 'class': 'bubble' + (small ? ' small' : '') });
    b.style.setProperty('--c', person.color);
    el('div', { 'class': 'who' }, b, person.name);
    el('br', null, b);
    var t = el('span', { 'class': 'txt' }, b);
    var tail = el('i', { 'class': 'tail' }, b);
    bubblesEl.appendChild(b);
    // Platz reservieren: Volltext messen
    t.textContent = text;
    var w = b.offsetWidth, h = b.offsetHeight;
    t.textContent = '';
    var left = Math.max(8, Math.min(STAGE_W - 8 - w, cx - w / 2));
    b.style.left = left + 'px';
    b.style.top = (126 - h) + 'px';
    b.style.width = w + 'px';
    tail.style.left = Math.max(22, Math.min(w - 22, cx - left)) + 'px';
    return { node: b, txt: t, full: text };
  }

  function stopTyping() {
    if (!S.typing) return;
    clearInterval(S.typing.timer);
    var ty = S.typing; S.typing = null;
    ty.bub.txt.textContent = ty.bub.full;
    setMood(ty.person.id, 'neutral');
  }

  function speak(person) {
    if (S.phase !== 'interview') return;
    if (S.typing) { var same = S.typing.person.id === person.id; stopTyping(); if (same) return; }
    clearBubbles();
    var n = person.statements.length, heard = S.heard[person.id] || (S.heard[person.id] = {});
    var idx = -1;
    for (var k = 0; k < n; k++) if (!heard[k]) { idx = k; break; }
    if (idx < 0) idx = ((S.last[person.id] == null ? -1 : S.last[person.id]) + 1) % n;
    S.last[person.id] = idx; heard[idx] = true;
    var text = person.statements[idx].text;
    var cx = personEls[person.id].cx;
    var bub = makeBubble(person, cx, '„' + text + '“', false);
    var pos = 0, flap = false;
    S.typing = { person: person, bub: bub, timer: setInterval(function () {
      pos += 2;
      bub.txt.textContent = bub.full.slice(0, pos);
      flap = !flap;
      setMood(person.id, flap ? 'talk' : 'neutral');
      if (pos >= bub.full.length) stopTyping();
    }, 28) };
    updatePeopleBadges(); renderNotes();
  }

  /* ---------- Personen ---------- */
  function setMood(id, mood) {
    var p = personEls[id]; if (!p) return;
    Q.drawPerson(p.canvas, p.person.look, mood);
  }

  function updatePeopleBadges() {
    S.scenario.people.forEach(function (p) {
      var h = Object.keys(S.heard[p.id] || {}).length, n = p.statements.length;
      var e = personEls[p.id];
      e.badge.textContent = h + '/' + n;
      e.btn.classList.toggle('done', h >= n);
    });
  }

  function buildPeople() {
    peopleEl.textContent = ''; platesEl.textContent = ''; personEls = {};
    var ps = S.scenario.people, n = ps.length;
    ps.forEach(function (p, i) {
      var cx = STAGE_W * (i + 1) / (n + 1);
      var btn = el('button', { 'class': 'person', type: 'button', 'aria-label': 'Mit ' + p.name + ' sprechen' }, peopleEl);
      btn.style.left = (cx - 72) + 'px';
      btn.style.animationDelay = (-i * 0.9) + 's';
      var canvas = el('canvas', null, btn);
      var badge = el('span', { 'class': 'badge' }, btn);
      personEls[p.id] = { btn: btn, canvas: canvas, badge: badge, person: p, cx: cx };
      Q.drawPerson(canvas, p.look, 'neutral');
      btn.addEventListener('click', function () { speak(p); });
      var plate = el('div', { 'class': 'plate' }, platesEl);
      plate.style.left = (cx - 78) + 'px';
      plate.textContent = p.name;
      el('small', null, plate, p.role);
    });
  }

  /* ---------- Notizbuch ---------- */
  function renderNotes() {
    var box = $('#notes'); box.textContent = '';
    var total = 0, heardAll = 0;
    S.scenario.people.forEach(function (p) {
      var h = S.heard[p.id] || {};
      var head = el('h4', null, box);
      var sw = el('i', null, head); sw.style.background = p.color;
      head.appendChild(document.createTextNode(p.name + ' (' + p.role + ')'));
      var any = false;
      p.statements.forEach(function (st, k) {
        total++;
        if (h[k]) { heardAll++; any = true; el('p', null, box, '„' + st.text + '“'); }
      });
      if (!any) el('p', { 'class': 'unheard' }, box, 'Noch nichts gehört. Klick auf ' + p.name + '.');
    });
    $('#notesCount').textContent = heardAll + '/' + total;
    S.heardAll = heardAll; S.totalStatements = total;
  }

  function setStatus(msg) { $('#status').textContent = msg; }

  /* ---------- Auswertung ---------- */
  function evaluate() {
    var sc = S.scenario, missingHeard = S.totalStatements - S.heardAll;
    var missingAxes = S.touched.filter(function (t) { return !t; }).length;
    if (missingHeard > 0) { setStatus('Du hast noch ' + missingHeard + ' Aussage' + (missingHeard > 1 ? 'n' : '') + ' nicht gehört. Klick auf die Personen am Tisch.'); return; }
    if (missingAxes > 0) { setStatus('Auf dem Poster fehlen noch Punkte bei ' + missingAxes + ' Merkmal' + (missingAxes > 1 ? 'en' : '') + ' (rot beschriftet).'); return; }
    stopTyping(); clearBubbles();
    S.phase = 'result';
    document.querySelectorAll('#radar .seg').forEach(function (s) { s.classList.add('locked'); });
    hover(null);

    var diffs = {};
    ATTRS.forEach(function (a, i) { diffs[a.id] = Math.abs(S.values[i] - sc.truth[a.id]); });
    var pct = Math.round(ATTRS.reduce(function (sum, a) { return sum + Q.JUDGE.attrPoints(diffs[a.id]); }, 0) / ATTRS.length);
    saveBest(sc.id, pct);

    truthPoly.setAttribute('points', polyPoints(ATTRS.map(function (a) { return sc.truth[a.id]; })));
    truthPoly.setAttribute('visibility', 'visible');

    // Ergebnisfenster
    var body = $('#resultBody'); body.textContent = '';
    var rank = Q.RANKS.filter(function (r) { return pct >= r.min; })[0].title;
    var scoreBox = el('div', { 'class': 'res-score' }, body);
    el('div', { 'class': 'big' }, scoreBox, pct + ' %');
    el('div', { 'class': 'rank' }, scoreBox, 'Rang: ' + rank);
    var lg = el('div', { 'class': 'res-legend' }, body);
    var a1 = el('i', null, lg); a1.style.borderColor = '#1f4fd8'; lg.appendChild(document.createTextNode('deine Punkte'));
    var a2 = el('i', null, lg); a2.style.borderColor = '#16883e'; a2.style.borderTopStyle = 'dashed'; lg.appendChild(document.createTextNode('gemeint'));

    sc.people.forEach(function (p, pi) {
      var ds = p.statements.map(function (st) { return diffs[st.attr]; });
      var mean = ds.reduce(function (a, b) { return a + b; }, 0) / ds.length;
      var mood = Q.JUDGE.mood(mean);
      var box = el('div', { 'class': 'res-person' }, body);
      var head = el('div', { 'class': 'res-head' }, box);
      var cv = el('canvas', null, head); Q.drawPerson(cv, p.look, mood);
      var nm = el('div', null, head); el('b', null, nm, p.name);
      nm.appendChild(document.createTextNode(mood === 'happy' ? 'zufrieden' : mood === 'meh' ? 'nicht ganz überzeugt' : 'verärgert'));
      p.statements.forEach(function (st, k) {
        var ai = ATTRS.findIndex(function (a) { return a.id === st.attr; });
        var d = ds[k], cls = d <= 1 ? 'ok' : d <= 3 ? 'mid' : 'bad';
        var row = el('div', { 'class': 'res-row' }, box);
        el('span', { 'class': 'nums ' + cls }, row, (d <= 1 ? '✔ ' : '✘ ') + ATTRS[ai].name + ': du ' + S.values[ai] + ', gemeint ' + sc.truth[st.attr]);
        el('q', null, row, '„' + st.text + '“');
      });
      // Reaktion auf der Bühne, gestaffelt
      setTimeout(function () {
        if (S.phase !== 'result' || S.scenario !== sc) return;
        setMood(p.id, mood);
        var e = personEls[p.id];
        e.btn.classList.remove('hop', 'shake');
        void e.btn.offsetWidth;
        if (mood === 'happy') e.btn.classList.add('hop'); else if (mood === 'angry') e.btn.classList.add('shake');
        var line = pick(Q.REACTIONS[mood]);
        var b = makeBubble(p, e.cx, line, true);
        b.txt.textContent = line;
      }, 500 + pi * 700);
    });

    var act = el('div', { 'class': 'res-actions' }, body);
    var again = el('button', { 'class': 'btn', type: 'button' }, act, 'Nochmal');
    var next = el('button', { 'class': 'btn primary', type: 'button' }, act, 'Nächster Fall');
    var menu = el('button', { 'class': 'btn', type: 'button' }, act, 'Fallauswahl');
    again.addEventListener('click', function () { startScenario(sc.id); });
    next.addEventListener('click', function () {
      var list = Q.SCENARIOS.filter(function (s) { return s.level === S.level; });
      var k = list.indexOf(sc); startScenario(list[(k + 1) % list.length].id);
    });
    menu.addEventListener('click', showTitle);

    $('#resultWin').hidden = false;
    $('#actionWin').hidden = true;
    $('#resultWin').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /* ---------- Ablauf ---------- */
  function setZoom(on) {
    S.zoom = on;
    stage.classList.toggle('zoomed', on);
    $('#zoomBtn').setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function startScenario(id) {
    var sc = Q.SCENARIOS.filter(function (s) { return s.id === id; })[0];
    stopTyping(); clearBubbles();
    S.scenario = sc; S.phase = 'interview'; S.heard = {}; S.last = {};
    S.values = ATTRS.map(function () { return 0; });
    S.touched = ATTRS.map(function () { return false; });
    truthPoly.setAttribute('visibility', 'hidden');
    document.querySelectorAll('#radar .seg').forEach(function (s) { s.classList.remove('locked'); });
    setZoom(false);
    buildPeople(); renderRadar(); renderNotes(); updatePeopleBadges(); showReadout(null);
    setStatus('');
    $('#orderText').innerHTML = '';
    el('b', null, $('#orderText'), sc.title + ' – ' + sc.subtitle);
    el('br', null, $('#orderText'));
    $('#orderText').appendChild(document.createTextNode(sc.intro));
    $('#resultWin').hidden = true; $('#actionWin').hidden = false;
    titleEl.classList.remove('on');
    // kurzer Einstieg: erste Person begrüßt
    var first = sc.people[0];
    var cx = personEls[first.id].cx;
    var line = 'Schön, dass du da bist. Fragt uns einfach der Reihe nach.';
    var b = makeBubble(first, cx, line, false); b.txt.textContent = line;
  }

  function showTitle() {
    stopTyping(); clearBubbles();
    S.phase = 'title';
    var best = loadBest();
    titleEl.textContent = '';
    el('h2', { 'class': 't-title' }, titleEl, 'ARCHITEKTUR-\nWORKSHOP').style.whiteSpace = 'pre';
    el('p', { 'class': 't-sub' }, titleEl, 'Quality Attributes nach ISO/IEC 25010');
    el('p', { 'class': 't-how' }, titleEl, 'Du bist die Architektin oder der Architekt und sitzt am Tisch. Klick die Leute an und hör zu. Dann vergib auf dem Poster 0 bis 10 Punkte pro Qualitätsmerkmal. Wer sich verstanden fühlt, lächelt. Wer nicht, wird sauer.');
    var lv = el('div', { 'class': 't-levels' }, titleEl);
    Q.LEVELS.forEach(function (l) {
      var b = el('button', { 'class': 'pxbtn' + (l.id === S.level ? ' sel' : ''), type: 'button' }, lv, l.name);
      if (!l.available) { b.disabled = true; el('small', null, b, l.people + ' · bald'); }
      else { el('small', null, b, l.people + ' · ' + l.blurb); b.addEventListener('click', function () { S.level = l.id; showTitle(); }); }
    });
    var list = el('div', { 'class': 't-cases' }, titleEl);
    Q.SCENARIOS.filter(function (s) { return s.level === S.level; }).forEach(function (s, k) {
      var b = el('button', { 'class': 'pxbtn', type: 'button' }, list);
      var left = el('span', null, b, 'Fall ' + (k + 1) + ': ' + s.title);
      el('small', null, left, s.subtitle);
      el('span', { 'class': 't-best' }, b, best[s.id] != null ? 'Best: ' + best[s.id] + ' %' : 'neu');
      b.addEventListener('click', function () { startScenario(s.id); });
    });
    titleEl.classList.add('on');
  }

  /* ---------- Verdrahtung ---------- */
  $('#submitBtn').addEventListener('click', evaluate);
  $('#zoomBtn').addEventListener('click', function () { setZoom(!S.zoom); });

  var scaleTable = $('#scale');
  Q.SCALE.forEach(function (s) {
    var tr = el('tr', null, scaleTable);
    el('td', null, tr, s.from === s.to ? String(s.from) : s.from + '–' + s.to);
    el('td', null, tr, s.label);
  });

  buildRadar();
  S.scenario = Q.SCENARIOS[0];
  buildPeople(); renderRadar(); renderNotes();
  showTitle();

  // Für Tests
  Q._state = S; Q._setValue = setValue; Q._evaluate = evaluate; Q._speak = function (id) { speak(personEls[id].person); };
})();

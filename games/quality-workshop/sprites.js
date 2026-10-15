/* Prozedurale Pixelfiguren (24x30) im Stil der 90er-Adventures. Stimmungen: neutral, talk, happy, meh, angry. */
window.QW = window.QW || {};

(function () {
  var W = 24, H = 30, OUTLINE = '#1b1420';

  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.max(0, Math.min(255, (n >> 16) + amt));
    var g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
    var b = Math.max(0, Math.min(255, (n & 255) + amt));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function makeGrid() {
    var g = [];
    for (var y = 0; y < H; y++) { g.push(new Array(W).fill(null)); }
    return g;
  }

  function rect(g, x, y, w, h, c) {
    for (var j = y; j < y + h; j++) for (var i = x; i < x + w; i++) {
      if (i >= 0 && i < W && j >= 0 && j < H) g[j][i] = c;
    }
  }
  function px(g, x, y, c) { rect(g, x, y, 1, 1, c); }

  function outline(g) {
    var o = makeGrid();
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      if (g[y][x]) continue;
      var n = (y > 0 && g[y - 1][x]) || (y < H - 1 && g[y + 1][x]) || (x > 0 && g[y][x - 1]) || (x < W - 1 && g[y][x + 1]);
      if (n) o[y][x] = OUTLINE;
    }
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (o[y][x]) g[y][x] = o[y][x];
  }

  function drawHair(g, style, c, front) {
    var d = shade(c, -28);
    if (!front) {
      // Haare hinter dem Kopf / hinter den Schultern
      if (style === 'long') { rect(g, 6, 5, 12, 14, c); }
      if (style === 'curly') { rect(g, 5, 3, 14, 9, c); }
      return;
    }
    if (style === 'bald') {
      rect(g, 6, 8, 1, 3, c); rect(g, 17, 8, 1, 3, c);
      px(g, 10, 4, shade('#f0c8a0', 30));
      return;
    }
    rect(g, 8, 3, 8, 1, c);
    rect(g, 7, 4, 10, 2, c);
    rect(g, 7, 6, 1, 2, c); rect(g, 16, 6, 1, 2, c);
    px(g, 9, 6, c); px(g, 10, 6, c); px(g, 14, 6, c); // Pony
    rect(g, 8, 4, 3, 1, shade(c, 22));
    if (style === 'long') {
      rect(g, 5, 8, 2, 11, c); rect(g, 17, 8, 2, 11, c);
      rect(g, 6, 12, 1, 6, d); rect(g, 17, 12, 1, 6, d);
    }
    if (style === 'bun') { rect(g, 10, 0, 4, 3, c); px(g, 11, 0, shade(c, 22)); }
    if (style === 'curly') {
      rect(g, 6, 2, 12, 3, c); rect(g, 5, 4, 14, 4, c);
      px(g, 8, 1, c); px(g, 12, 1, c); px(g, 15, 1, c);
      rect(g, 6, 8, 1, 3, c); rect(g, 17, 8, 1, 3, c);
    }
  }

  function drawFace(g, look, mood) {
    var skin = mood === 'angry' ? shade('#e8806a', 0) : look.skin;
    var beard = look.extras.indexOf('beard') >= 0;
    var mouth = beard ? '#f2b0a8' : OUTLINE;
    // Gesicht und Hals
    rect(g, 8, 4, 8, 1, skin);
    rect(g, 7, 5, 10, 10, skin);
    rect(g, 8, 15, 8, 1, skin);
    rect(g, 10, 16, 4, 3, shade(look.skin, -22));
    rect(g, 6, 9, 1, 3, skin); rect(g, 17, 9, 1, 3, skin); // Ohren
    px(g, 6, 10, shade(look.skin, -22)); px(g, 17, 10, shade(look.skin, -22));

    drawHair(g, look.hairStyle, look.hair, true);

    if (beard) {
      rect(g, 7, 11, 10, 5, look.hair);
      rect(g, 9, 11, 6, 1, skin); // Wangenlücke
      px(g, 8, 11, look.hair); px(g, 15, 11, look.hair);
    }

    // Augen
    var ey = 8;
    if (mood === 'happy') {
      // Lachaugen: kleine Bögen
      px(g, 9, 9, OUTLINE); px(g, 10, 8, OUTLINE); px(g, 13, 8, OUTLINE); px(g, 14, 9, OUTLINE);
    } else if (mood === 'angry') {
      rect(g, 9, 8, 2, 2, '#ffffff'); rect(g, 13, 8, 2, 2, '#ffffff');
      px(g, 10, 9, OUTLINE); px(g, 13, 9, OUTLINE);
    } else {
      rect(g, 9, ey, 2, 2, '#ffffff'); rect(g, 13, ey, 2, 2, '#ffffff');
      px(g, 10, ey + 1, OUTLINE); px(g, 13, ey + 1, OUTLINE);
      if (mood === 'meh') { rect(g, 9, ey, 2, 1, shade(skin, -40)); rect(g, 13, ey, 2, 1, shade(skin, -40)); }
    }

    // Brauen
    var brow = shade(look.hair === '#8a8a8a' ? '#5a5a5a' : look.hair, -30);
    if (mood === 'angry') {
      px(g, 8, 6, brow); px(g, 9, 7, brow); px(g, 10, 7, brow);
      px(g, 15, 6, brow); px(g, 14, 7, brow); px(g, 13, 7, brow);
    } else if (mood === 'happy') {
      rect(g, 9, 6, 2, 1, brow); rect(g, 13, 6, 2, 1, brow);
    } else if (mood === 'meh') {
      rect(g, 9, 7, 2, 1, brow); px(g, 13, 6, brow); px(g, 14, 7, brow); px(g, 15, 7, brow);
    } else {
      rect(g, 9, 7, 2, 1, brow); rect(g, 13, 7, 2, 1, brow);
    }

    // Brille
    if (look.extras.indexOf('glasses') >= 0) {
      var f = '#2a2030';
      rect(g, 8, 7, 4, 1, f); rect(g, 12, 7, 4, 1, f);
      rect(g, 8, 10, 4, 1, f); rect(g, 12, 10, 4, 1, f);
      px(g, 8, 8, f); px(g, 8, 9, f); px(g, 11, 8, f); px(g, 11, 9, f);
      px(g, 12, 8, f); px(g, 12, 9, f); px(g, 15, 8, f); px(g, 15, 9, f);
      px(g, 10, 7, f);
    }

    // Wangen
    if (mood === 'happy') { px(g, 8, 11, '#f2908a'); px(g, 15, 11, '#f2908a'); }

    // Mund
    if (mood === 'happy') {
      px(g, 10, 12, mouth); px(g, 13, 12, mouth);
      rect(g, 11, 13, 2, 1, mouth);
    } else if (mood === 'talk') {
      rect(g, 11, 12, 2, 2, '#7a1f2a'); rect(g, 10, 12, 1, 2, mouth); rect(g, 13, 12, 1, 2, mouth);
      rect(g, 11, 11, 2, 1, mouth); rect(g, 11, 14, 2, 1, mouth);
    } else if (mood === 'angry') {
      rect(g, 11, 12, 2, 1, mouth); px(g, 10, 13, mouth); px(g, 13, 13, mouth);
    } else if (mood === 'meh') {
      rect(g, 10, 13, 4, 1, mouth); px(g, 14, 12, mouth);
    } else {
      rect(g, 10, 13, 4, 1, mouth);
    }

    if (look.extras.indexOf('mustache') >= 0 && !beard) rect(g, 9, 11, 6, 1, look.hair);
  }

  function drawBody(g, look, mood) {
    var c = look.shirt, d = shade(c, -34), l = shade(c, 24);
    // Schultern und Oberkörper
    rect(g, 7, 17, 10, 1, c);
    rect(g, 4, 18, 16, 1, c);
    rect(g, 3, 19, 18, 11, c);
    rect(g, 3, 19, 2, 11, d); rect(g, 19, 19, 2, 11, d);
    rect(g, 6, 19, 3, 1, l);
    // Kragen-V
    px(g, 11, 18, look.skin); px(g, 12, 18, look.skin);
    rect(g, 10, 17, 4, 1, shade(look.skin, -22));
    px(g, 11, 19, shade(look.skin, -22)); px(g, 12, 19, shade(look.skin, -22));
    px(g, 10, 18, '#ffffff'); px(g, 13, 18, '#ffffff'); px(g, 9, 19, '#ffffff'); px(g, 14, 19, '#ffffff');
    // Krawatte
    if (look.extras.indexOf('tie') >= 0) {
      rect(g, 11, 19, 2, 1, '#c0392b'); rect(g, 11, 20, 2, 8, '#c0392b'); rect(g, 12, 21, 1, 7, '#8e2a20');
    }
    // Arme auf dem Tisch
    rect(g, 3, 25, 4, 5, shade(c, -12));
    rect(g, 17, 25, 4, 5, shade(c, -12));
    if (mood === 'angry') rect(g, 3, 28, 4, 2, look.skin), rect(g, 17, 28, 4, 2, look.skin);
  }

  /* Zeichnet eine Figur in ein Canvas. */
  QW.drawPerson = function (canvas, look, mood) {
    var g = makeGrid();
    canvas.width = W; canvas.height = H;
    drawHair(g, look.hairStyle, look.hair, false);
    drawBody(g, look, mood);
    drawFace(g, look, mood);
    if (look.hairStyle === 'long') {
      // lange Haare fallen vorne über die Schultern
      rect(g, 5, 14, 2, 8, look.hair); rect(g, 17, 14, 2, 8, look.hair);
    }
    outline(g);
    if (mood === 'angry') {
      // Zornesader
      var r = '#e02828';
      px(g, 18, 3, r); px(g, 19, 3, r); px(g, 18, 4, r); px(g, 20, 4, r); px(g, 19, 5, r); px(g, 21, 5, r); px(g, 20, 2, r);
    }
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      if (g[y][x]) { ctx.fillStyle = g[y][x]; ctx.fillRect(x, y, 1, 1); }
    }
  };

  /* Kleine ASCII-Sprites für Tischdeko. */
  QW.drawAscii = function (canvas, rows, palette) {
    canvas.width = rows[0].length; canvas.height = rows.length;
    var ctx = canvas.getContext('2d');
    for (var y = 0; y < rows.length; y++) for (var x = 0; x < rows[y].length; x++) {
      var ch = rows[y][x];
      if (palette[ch]) { ctx.fillStyle = palette[ch]; ctx.fillRect(x, y, 1, 1); }
    }
  };

  QW.SPRITE_W = W; QW.SPRITE_H = H;
})();

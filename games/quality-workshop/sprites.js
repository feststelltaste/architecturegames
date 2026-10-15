/*
 * Prozedurale Pixelfiguren (72x90) im Stil der Graphic Adventures der 90er (Monkey Island, Day of the Tentacle,
 * Sierra VGA): VGA-Farbverläufe mit Dithering, farbige Konturen, karikierte Köpfe, ausdrucksstarke Gesichter.
 * Stimmungen: neutral, talk, happy, meh, angry, blink.
 */
window.QW = window.QW || {};

(function () {
  var W = 72, H = 90;
  var SH = '#2a1038', HI = '#fff0c8', INK = '#10061a';

  /* ---------- Farben ---------- */
  function rgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function hex(a) {
    return '#' + a.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join('');
  }
  function mix(a, b, k) {
    var A = rgb(a), B = rgb(b);
    return hex([A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k]);
  }
  function ramp(c, dark) {
    dark = dark == null ? 0.6 : dark;
    return [mix(c, SH, dark), mix(c, SH, dark * 0.5), c, mix(c, HI, 0.2), mix(c, HI, 0.42)];
  }
  var B4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  function bayer(x, y) { return (B4[y & 3][x & 3] + 0.5) / 16; }
  function tone(r, t, x, y) {
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    var f = t * (r.length - 1), lo = Math.floor(f);
    if (lo >= r.length - 1) return r[r.length - 1];
    return (f - lo) > bayer(x, y) ? r[lo + 1] : r[lo];
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- Raster ---------- */
  function newGrid() {
    var g = [];
    for (var y = 0; y < H; y++) g.push(new Array(W).fill(null));
    return g;
  }
  function put(g, x, y, c) { if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = c; }
  function get(g, x, y) { return x >= 0 && x < W && y >= 0 && y < H ? g[y][x] : null; }

  // Füllt alle Pixel, für die inside(px, py) gilt (px/py sind Pixelmitten). edge: Farbe für Randpixel.
  function layer(g, inside, color, edge) {
    var m = [], x, y;
    for (y = 0; y < H; y++) { var row = []; for (x = 0; x < W; x++) row.push(!!inside(x + 0.5, y + 0.5)); m.push(row); }
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      if (!m[y][x]) continue;
      var e = edge && (!(x > 0 && m[y][x - 1]) || !(x < W - 1 && m[y][x + 1]) || !(y > 0 && m[y - 1][x]) || !(y < H - 1 && m[y + 1][x]));
      g[y][x] = e ? edge : color(x, y);
    }
  }
  function ell(cx, cy, rx, ry) { return function (x, y) { var dx = (x - cx) / rx, dy = (y - cy) / ry; return dx * dx + dy * dy <= 1; }; }
  function tri(a, b, c) {
    return function (x, y) {
      var d1 = (x - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (y - b[1]);
      var d2 = (x - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (y - c[1]);
      var d3 = (x - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (y - a[1]);
      return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
    };
  }
  function line(g, x0, y0, x1, y1, c) {
    var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (var i = 0; i <= n; i++) put(g, Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), c);
  }
  function and(a, b) { return function (x, y) { return a(x, y) && b(x, y); }; }
  function not(a) { return function (x, y) { return !a(x, y); }; }
  function or(a, b) { return function (x, y) { return a(x, y) || b(x, y); }; }

  /* ---------- Geometrie ---------- */
  var HCX = 36, HCY = 33, HRX = 23.5, HRY = 26;
  var EY = 34, EX1 = 26, EX2 = 46, MY = 51;
  var FX = 0;   // seitliche Verschiebung der Gesichtszüge (Blickrichtung zum Tisch)
  function inHead(x, y) {
    var X = x - HCX, Y = y - HCY;
    var rx = HRX * (1 - 0.1 * clamp((y - 36) / 22, 0, 1));
    return (X / rx) * (X / rx) + (Y / HRY) * (Y / HRY) <= 1;
  }
  function faceT(x, y) {
    var nx = (x - HCX) / HRX, ny = (y - HCY) / HRY;
    var nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    return 0.28 + 0.7 * (-0.5 * nx - 0.55 * ny + 0.7 * nz);
  }
  function hairline(x, style) {
    var dx = Math.abs(x - HCX);
    var y = 16 + Math.max(0, dx - 12) * 1.9;
    if (style === 'short') { y += (x < 31 ? 5 : 0) + 1.5 * Math.sin(x * 0.7); }
    if (style === 'long' && dx < 2) y += 4;
    return y;
  }
  function torsoHalf(y) { return 14 + 15 * (1 - Math.exp(-(y - 60) / 4)); }

  /* Drei Farbtöne, harte Kanten, nur an den Übergängen ein Dither-Streifen (Cel-Look). */
  function ramp3(c, dark) {
    dark = dark == null ? 0.42 : dark;
    return [mix(c, SH, dark), c, mix(c, HI, 0.32)];
  }
  function cel(r, t, x, y) {
    var a = 0.36, b = 0.74, w = 0.05, chk = (x + y) & 1;
    if (t < a - w) return r[0];
    if (t < a + w) return chk ? r[1] : r[0];
    if (t < b - w) return r[1];
    if (t < b + w) return chk ? r[2] : r[1];
    return r[2];
  }

  /* ---------- Einzelteile ---------- */
  function drawHairBack(g, look) {
    if (look.hairStyle !== 'long') return;
    var r = ramp3(look.hair, 0.55);
    layer(g, ell(36, 46, 27, 36), function (x, y) { return cel(r, 0.3 + 0.06 * Math.sin(x * 0.5), x, y); }, r[0]);
  }

  function hairColorFn(r) {
    return function (x, y) {
      var t = 0.5 - 0.02 * (x - 36) - 0.012 * (Math.min(y, 44) - 10) + 0.12 * Math.sin(x * 0.45 + y * 0.3);
      if ((x * 2 + y) % 7 === 0) t -= 0.28;
      if (y >= 9 && y <= 13 && x > 22 && x < 44) t += 0.3;
      return cel(r, t, x, y);
    };
  }

  function drawHairFront(g, look) {
    var st = look.hairStyle, r = ramp3(look.hair, 0.55), col = hairColorFn(r);
    if (st === 'bald') return;
    function sideburn(x, y) { return Math.abs(x - 36) > 20.2 && y > 26 && y < 42 && inHead(x, y); }
    var big;
    if (st === 'curly') {
      big = function (x, y) {
        var X = x - 36, Y = y - 26, a = Math.atan2(Y, X);
        var k = 1 + 0.07 * Math.sin(a * 9);
        return (X / 31) * (X / 31) + (Y / 30) * (Y / 30) <= k * k && y < 46;
      };
    } else if (st === 'bun') {
      big = or(and(ell(36, 33, 25.8, 28.4), function (x, y) { return y < 42; }), ell(36, 6.5, 8, 6));
    } else {
      big = and(ell(36, 33, 25.8, 28.4), function (x, y) { return y < 44; });
    }
    layer(g, function (x, y) {
      if (!big(x, y)) return false;
      if (!inHead(x, y)) return true;
      return y < hairline(x, st) || sideburn(x, y);
    }, col, r[0]);
    if (st === 'bun') layer(g, ell(36, 14.5, 7, 1.6), function () { return look.shirt; }, null);
    if (st === 'long') {
      layer(g, function (x, y) {
        var dx = Math.abs(x - 36);
        return dx >= 21 && dx <= 27 && y >= 36 && y <= 78 - (dx - 21) * 2.5 && !inHead(x, y);
      }, col, r[0]);
    }
  }

  function skinBase(look, mood) { return mood === 'angry' ? mix(look.skin, '#e04030', 0.4) : look.skin; }

  function drawNeck(g, look, mood) {
    var r = ramp3(skinBase(look, mood), 0.5);
    layer(g, function (x, y) { return x > 29 && x < 43 && y > 52 && y < 66; }, function (x, y) {
      return y < 62 ? r[0] : cel(r, 0.45 - (x - 36) * 0.02, x, y);
    }, null);
  }

  function drawTorso(g, look) {
    var outfit = look.outfit || (look.extras.indexOf('tie') >= 0 ? 'suit' : 'shirt');
    var r = ramp3(look.shirt, 0.5);
    var hole = null;
    if (outfit === 'shirt') hole = tri([29, 58], [43, 58], [36, 72]);
    if (outfit === 'tshirt') hole = ell(36, 60, 9.5, 6.5);
    if (outfit === 'suit') hole = tri([30, 58], [42, 58], [36, 70]);
    if (outfit === 'coat') hole = tri([26, 58], [46, 58], [36, 80]);
    var inTorso = function (x, y) { return y >= 58 && Math.abs(x - 36) <= torsoHalf(y); };
    layer(g, hole ? and(inTorso, not(hole)) : inTorso, function (x, y) {
      var X = x - 36, ax = Math.abs(X);
      var t = 0.6 - 0.32 * (X / 30) + 0.05 * Math.sin(X * 0.45 + y * 0.2);
      if (ax > 21 && y > 66) t -= 0.35;
      var seam = Math.abs(ax - (19 + (y - 62) * 0.15));
      if (y > 62 && seam < 0.8) t -= 0.35;
      return cel(r, t, x, y);
    }, r[0]);

    var white = ramp3('#f4f4f8', 0.3);
    if (outfit === 'shirt') {
      var cc = ramp3(mix(look.shirt, '#ffffff', 0.6), 0.35);
      var cf = function (x, y) { return cel(cc, 0.62 - (x - 36) * 0.02, x, y); };
      layer(g, tri([30, 55], [24, 64], [36, 74]), cf, cc[0]);
      layer(g, tri([42, 55], [48, 64], [36, 74]), function (x, y) { return cel(cc, 0.4, x, y); }, cc[0]);
      layer(g, ell(36, 79, 1.5, 1.5), function () { return r[2]; }, r[0]);
    } else if (outfit === 'suit') {
      layer(g, tri([31, 58], [41, 58], [36, 84]), function (x, y) { return cel(white, 0.7 - (x - 36) * 0.03, x, y); }, white[0]);
      var tc = ramp3('#c8283a', 0.45);
      layer(g, tri([33.5, 65], [38.5, 65], [36, 86]), function (x, y) { return cel(tc, 0.62 - (x - 36) * 0.12, x, y); }, tc[0]);
      layer(g, ell(36, 63, 3.2, 3), function (x, y) { return cel(tc, 0.7 - (x - 36) * 0.1, x, y); }, tc[0]);
      layer(g, tri([22, 63], [30, 57], [35, 84]), function (x, y) { return cel(r, 0.68, x, y); }, r[0]);
      layer(g, tri([50, 63], [42, 57], [37, 84]), function (x, y) { return cel(r, 0.45, x, y); }, r[0]);
    } else if (outfit === 'coat') {
      var under = ramp3('#3a8a9a', 0.45);
      layer(g, tri([28, 59], [44, 59], [36, 78]), function (x, y) { return cel(under, 0.5, x, y); }, under[0]);
      var lc = ramp3(look.shirt, 0.35);
      layer(g, tri([19, 63], [27, 57], [36, 79]), function (x, y) { return cel(lc, 0.8, x, y); }, lc[0]);
      layer(g, tri([53, 63], [45, 57], [36, 79]), function (x, y) { return cel(lc, 0.55, x, y); }, lc[0]);
      layer(g, function (x, y) { return x > 10 && x < 22 && y > 77 && y < 90; }, function (x, y) { return cel(lc, 0.6, x, y); }, lc[0]);
      for (var k = 0; k < 4; k++) { put(g, 14, 74 + k, '#2a56c0'); put(g, 15, 74 + k, '#c0392b'); }
    } else if (outfit === 'tshirt') {
      layer(g, and(function (x, y) { return y >= 55; }, and(ell(36, 60, 11, 8.2), not(ell(36, 60, 9.5, 6.6)))), function (x, y) { return r[0]; }, null);
      layer(g, function (x, y) { return y > 74 && y < 82 && Math.abs(x - 36) < 12; }, function (x, y) { return y < 77 ? '#ffe36b' : '#e8b020'; }, r[0]);
    }
  }

  function drawEars(g, look, mood) {
    var r = ramp3(skinBase(look, mood), 0.5);
    [12.5, 59.5].forEach(function (cx, i) {
      layer(g, ell(cx, 36, 3.6, 5.6), function (x, y) { return i ? r[0] : r[1]; }, r[0]);
      put(g, Math.floor(cx + (i ? -1 : 1)), 35, r[0]); put(g, Math.floor(cx + (i ? -1 : 1)), 37, r[0]);
    });
  }

  function drawHead(g, look, mood) {
    var r = ramp3(skinBase(look, mood), 0.5);
    layer(g, inHead, function (x, y) { return cel(r, faceT(x + 0.5, y + 0.5), x, y); }, null);
    return r;
  }

  function drawNose(g, r) {
    var cx = 36 + FX, nose = ell(cx, 43, 4.6, 3.8), ring = ell(cx, 43, 5.6, 4.8);
    layer(g, nose, function (x, y) { return cel(r, 0.62 - (x - cx) * 0.09 - (y - 43) * 0.05, x, y); }, null);
    for (var x = cx - 5; x <= cx + 5; x++) for (var y = 38; y <= 47; y++) {
      if (get(g, x, y) && !nose(x + 0.5, y + 0.5) && ring(x + 0.5, y + 0.5) && y > 43) put(g, x, y, r[0]);
    }
    put(g, cx - 2, 44, r[0]); put(g, cx + 1, 44, r[0]); put(g, cx - 1, 44, r[0]); put(g, cx + 2, 44, r[0]);
    for (var yy = 36; yy <= 40; yy++) put(g, cx - 1, yy, r[2]);
  }

  function drawEye(g, ex, ey, mood, side, look, r) {
    var inner = -side;
    var iris = ramp3(look.iris || '#5a3a20', 0.5);
    var skinDark = r[0];
    function arc(dx, k) { return Math.round(k * (1 - (dx * dx) / 30)); }
    var dx, x, y;
    if (mood === 'happy') {
      for (dx = -5; dx <= 5; dx++) {
        var yy = Math.round(ey + 1.5 - arc(dx, 3.4));
        put(g, Math.round(ex + dx - 0.5), yy, INK); put(g, Math.round(ex + dx - 0.5), yy + 1, INK);
      }
      return;
    }
    if (mood === 'blink') {
      for (dx = -5; dx <= 5; dx++) { put(g, Math.round(ex + dx - 0.5), Math.round(ey + arc(dx, 1.6)), INK); put(g, Math.round(ex + dx - 0.5), Math.round(ey + arc(dx, 1.6)) + 1, '#4a2030'); }
      return;
    }
    var inEye = ell(ex, ey, 5.6, 4.6);
    layer(g, inEye, function (x, y) { return y + 0.5 < ey - 1 ? '#d2d6ea' : '#ffffff'; }, null);
    var ir = mood === 'angry' ? 2.8 : 3.3;
    var icx = ex + inner * 0.7, icy = ey + (mood === 'meh' ? 0.4 : 0.8);
    layer(g, and(ell(icx, icy, ir, ir), inEye), function (x, y) { return y + 0.5 > icy + 1 ? iris[2] : iris[1]; }, iris[0]);
    layer(g, ell(icx, icy, 1.6, 1.9), function () { return '#0c0a14'; }, null);
    put(g, Math.floor(icx - 1.6), Math.floor(icy - 2), '#ffffff'); put(g, Math.floor(icx - 0.6), Math.floor(icy - 2), '#ffffff');
    put(g, Math.floor(icx - 1.6), Math.floor(icy - 1), '#ffffff');
    var lidY = null;
    if (mood === 'meh') lidY = function () { return ey - 0.9; };
    if (mood === 'angry') lidY = function (px) { var s = clamp(((px - ex) * inner + 5.6) / 11.2, 0, 1); return ey - 4.2 + 4.8 * s; };
    for (x = Math.floor(ex - 7); x <= Math.ceil(ex + 7); x++) for (y = Math.floor(ey - 6); y <= Math.ceil(ey + 6); y++) {
      if (!inEye(x + 0.5, y + 0.5)) {
        if (inEye(x + 0.5, y + 1.5) && y + 0.5 < ey) put(g, x, y, INK);
        continue;
      }
      if (lidY) {
        var ly = lidY(x + 0.5);
        if (y + 0.5 < ly) put(g, x, y, skinDark);
        else if (y + 0.5 < ly + 1.2) put(g, x, y, INK);
      }
    }
  }

  function drawBrow(g, ex, ey, mood, side, look) {
    var browC = look.hair === '#8a8a8a' ? '#5a5a5a' : mix(look.hair, '#000000', 0.3);
    var inner = -side, thick = mood === 'angry' ? 4 : 3;
    for (var dx = -6; dx <= 5; dx++) {
      var px = ex + dx + 0.5, s = clamp(((px - ex) * inner + 6) / 12, 0, 1);
      var a = Math.round(1.6 * (1 - Math.pow((px - ex) / 6, 2)));
      var off;
      if (mood === 'angry') off = -11.5 + 5.5 * s;
      else if (mood === 'happy') off = -11.5 - a;
      else if (mood === 'meh') off = side > 0 ? -11 - 3 * s - a : -9 - 0.5 * s;
      else off = -9 - a;
      var y0 = Math.round(ey + off), x0 = Math.floor(px);
      for (var k = 0; k < thick; k++) put(g, x0, y0 + k, k === 0 ? mix(browC, HI, 0.18) : browC);
    }
  }

  function drawMouth(g, look, mood, beard) {
    var mx = 36 + FX, my = MY;
    var lip = beard ? '#e09088' : mix(look.skin, '#b03040', 0.5);
    var dark = '#3a1018', inside = '#7a1a28';
    var dx, y, xx;
    if (mood === 'happy') {
      for (dx = -9; dx <= 9; dx++) {
        var uy = my - Math.round(3 * dx * dx / 81);
        var ly = uy + Math.round(6.4 * (1 - dx * dx / 81));
        xx = Math.round(mx + dx - 0.5);
        put(g, xx, uy - 1, dark);
        for (y = uy; y <= ly; y++) put(g, xx, y, (y - uy < 3) ? '#fafaff' : inside);
        put(g, xx, ly + 1, dark);
        if (ly - uy >= 5 && Math.abs(dx) < 4) { put(g, xx, ly, '#e05a6a'); put(g, xx, ly - 1, '#e05a6a'); }
      }
      return;
    }
    if (mood === 'talk') {
      layer(g, ell(mx, my + 2, 6.4, 4.8), function (x, y) {
        if (y + 0.5 < my - 0.5) return '#fafaff';
        if (y + 0.5 > my + 4) return '#e05a6a';
        return inside;
      }, dark);
      return;
    }
    if (mood === 'angry') {
      layer(g, function (x, y) { return Math.abs(x - mx) < 8 && y > my - 3 && y < my + 3.5; }, function (x, y) { return (x % 3 === 0) ? '#b8b8cc' : '#fafaff'; }, dark);
      for (dx = -8; dx <= 7; dx++) put(g, Math.round(mx + dx), my, dark);
      put(g, mx - 9, my + 3, dark); put(g, mx + 8, my + 3, dark); put(g, mx - 9, my + 2, dark); put(g, mx + 8, my + 2, dark);
      return;
    }
    if (mood === 'meh') {
      for (dx = -7; dx <= 7; dx++) { xx = Math.round(mx + dx - 0.5); put(g, xx, Math.round(my + 1 - dx * 0.25), dark); put(g, xx, Math.round(my + 2 - dx * 0.25), dark); }
      for (dx = -4; dx <= 4; dx++) put(g, Math.round(mx + dx - 0.5), Math.round(my + 3 - dx * 0.25), lip);
      return;
    }
    for (dx = -7; dx <= 7; dx++) { xx = Math.round(mx + dx - 0.5); put(g, xx, my, dark); put(g, xx, my + 1, dark); }
    for (dx = -5; dx <= 5; dx++) { put(g, Math.round(mx + dx - 0.5), my + 2, lip); put(g, Math.round(mx + dx - 0.5), my + 3, lip); }
    for (dx = -4; dx <= 4; dx++) put(g, Math.round(mx + dx - 0.5), my - 1, mix(lip, SH, 0.15));
    put(g, mx - 8, my - 1, dark); put(g, mx + 7, my - 1, dark);
  }

  function drawBeard(g, look) {
    var r = ramp3(look.hair === '#8a8a8a' ? '#9a9a9a' : look.hair, 0.5);
    var big = ell(36, 33, 24.4, 26.4);
    layer(g, function (x, y) {
      if (!big(x, y)) return false;
      var dx = Math.abs(x - 36);
      if (dx < 11) return y >= 46;
      return y > 42;
    }, function (x, y) {
      var t = 0.5 - 0.02 * (x - 36) + 0.14 * Math.sin(x * 0.8 + y * 0.5);
      if ((x + y * 2) % 6 === 0) t -= 0.3;
      return cel(r, t, x, y);
    }, null);
  }

  function drawGlasses(g, look, ex1, ex2, ey) {
    var f = '#241a30', fl = '#6a5a80';
    [ex1, ex2].forEach(function (ex) {
      var x0 = Math.floor(ex - 7), x1 = Math.floor(ex + 7), y0 = Math.floor(ey - 6), y1 = Math.floor(ey + 6);
      for (var x = x0; x <= x1; x++) for (var y = y0; y <= y1; y++) {
        var corner = (x <= x0 + 1 && (y === y0 || y === y1) && x === x0) || (x === x1 && (y === y0 || y === y1));
        if (corner) continue;
        var edge = x === x0 || x === x1 || y === y0 || y === y1;
        if (edge) { put(g, x, y, (y === y0 && x < ex) ? fl : f); if (y === y0 || y === y1) { /* dicker Rahmen oben */ } }
        else {
          var c = get(g, x, y);
          if (c) put(g, x, y, mix(c, '#a8d4ff', 0.18));
        }
      }
      for (x = x0 + 1; x <= x1 - 1; x++) put(g, x, y0 + 1, f);
      put(g, x0 + 2, y0 + 3, '#ffffff'); put(g, x0 + 3, y0 + 4, '#ffffff'); put(g, x0 + 2, y0 + 4, '#e8f4ff');
    });
    for (var x = Math.floor(ex1 + 7); x <= Math.floor(ex2 - 7); x++) { put(g, x, Math.floor(ey - 2), f); put(g, x, Math.floor(ey - 1), f); }
    line(g, Math.floor(ex1 - 7), Math.floor(ey - 3), 14, Math.floor(ey - 2), f);
    line(g, Math.floor(ex2 + 7), Math.floor(ey - 3), 58, Math.floor(ey - 2), f);
  }

  function outlineAll(g) {
    var add = [], x, y;
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      if (g[y][x]) continue;
      var n = (y > 0 && g[y - 1][x]) || (y < H - 1 && g[y + 1][x]) || (x > 0 && g[y][x - 1]) || (x < W - 1 && g[y][x + 1]);
      if (n) add.push([x, y, mix(n, INK, 0.8)]);
    }
    add.forEach(function (a) { g[a[1]][a[0]] = a[2]; });
  }

  /* ---------- Zusammenbau ---------- */
  var cache = {};
  function render(look, mood, turn) {
    FX = turn || 0;
    var key = JSON.stringify(look) + '|' + mood + '|' + FX;
    if (cache[key]) return cache[key];
    var g = newGrid();
    var beard = look.extras.indexOf('beard') >= 0;
    drawHairBack(g, look);
    drawNeck(g, look, mood);
    drawTorso(g, look);
    drawEars(g, look, mood);
    var r = drawHead(g, look, mood);
    if (mood === 'happy') {
      var pink = mix(look.skin, '#ff5a6a', 0.5);
      [[22.5 + FX, 45], [49.5 + FX, 45]].forEach(function (c) {
        layer(g, ell(c[0], c[1], 4.4, 2.8), function (x, y) { return pink; }, null);
      });
    }
    drawNose(g, r);
    var ey = EY, ex1 = EX1 + FX, ex2 = EX2 + FX;
    drawEye(g, ex1, ey, mood, -1, look, r);
    drawEye(g, ex2, ey, mood, 1, look, r);
    drawBrow(g, ex1, ey, mood, -1, look);
    drawBrow(g, ex2, ey, mood, 1, look);
    if (beard) drawBeard(g, look);
    drawMouth(g, look, mood, beard);
    drawHairFront(g, look);
    if (look.extras.indexOf('glasses') >= 0) drawGlasses(g, look, ex1, ex2, ey);
    outlineAll(g);
    if (mood === 'angry') {
      var rc = '#e02828', rd = '#8a1010';
      [[0, 0], [1, 0], [0, 1], [3, 0], [3, 1], [4, 1], [1, 2], [2, 2], [4, 2], [0, 3], [1, 3], [3, 3], [4, 3], [2, 4]].forEach(function (p) {
        put(g, 58 + p[0], 4 + p[1], p[0] % 2 ? rd : rc);
      });
    }
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      if (g[y][x]) { ctx.fillStyle = g[y][x]; ctx.fillRect(x, y, 1, 1); }
    }
    cache[key] = c;
    return c;
  }

  /* Zeichnet eine Figur in ein Canvas. */
  QW.drawPerson = function (canvas, look, mood, turn) {
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(render(look, mood, turn), 0, 0);
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

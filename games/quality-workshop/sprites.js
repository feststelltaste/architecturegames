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
  var HCX = 36, HCY = 29, HRX = 15.5, HRY = 18.5;
  function inHead(x, y) {
    var X = x - HCX, Y = y - HCY;
    var rx = HRX * (1 - 0.1 * clamp((y - 30) / 16, 0, 1));
    return (X / rx) * (X / rx) + (Y / HRY) * (Y / HRY) <= 1;
  }
  function faceT(x, y) {
    var nx = (x - HCX) / HRX, ny = (y - HCY) / HRY;
    var nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    return 0.3 + 0.62 * (-0.45 * nx - 0.5 * ny + 0.75 * nz);
  }
  function hairline(x, style) {
    var dx = Math.abs(x - HCX);
    var y = 16 + Math.max(0, dx - 8) * 2.4;
    if (style === 'short' && x < 33) y += 4;
    if (style === 'long' && dx < 1.6) y += 3;
    return y;
  }
  function torsoHalf(y) { return 12 + 16 * (1 - Math.exp(-(y - 54) / 5)); }

  /* ---------- Einzelteile ---------- */
  function drawHairBack(g, look) {
    if (look.hairStyle !== 'long') return;
    var r = ramp(look.hair, 0.7);
    layer(g, ell(36, 42, 21.5, 31), function (x, y) { return tone(r, 0.3 + 0.1 * Math.sin(x * 0.6 + y * 0.2), x, y); }, r[0]);
  }

  function hairColorFn(r) {
    return function (x, y) {
      var t = 0.58 - 0.012 * (x - 36) - 0.008 * (Math.min(y, 44) - 10) + 0.14 * Math.sin(x * 0.5 + y * 0.28);
      if ((x * 2 + y) % 6 === 0) t -= 0.2;
      if (y >= 11 && y <= 13 && x > 26 && x < 46) t += 0.25;
      return tone(r, t, x, y);
    };
  }

  function drawHairFront(g, look) {
    var st = look.hairStyle, r = ramp(look.hair, 0.65), col = hairColorFn(r);
    function sideburn(x, y) { return Math.abs(x - 36) > 13.6 && y > 22 && y < 36 && inHead(x, y); }
    if (st === 'bald') return;
    var big;
    if (st === 'curly') {
      big = function (x, y) {
        var X = x - 36, Y = y - 24, a = Math.atan2(Y, X);
        var k = 1 + 0.08 * Math.sin(a * 9);
        return (X / 22) * (X / 22) + (Y / 23) * (Y / 23) <= k * k && y < 40;
      };
    } else if (st === 'bun') {
      big = or(and(ell(36, 29, 17.8, 20.8), function (x, y) { return y < 36; }), ell(36, 6.5, 7, 6));
    } else {
      big = and(ell(36, 29, 17.8, 20.8), function (x, y) { return y < 37; });
    }
    layer(g, function (x, y) {
      if (!big(x, y)) return false;
      if (!inHead(x, y)) return true;
      return y < hairline(x, st) || sideburn(x, y);
    }, col, r[0]);
    if (st === 'bun') {
      // Haargummi
      layer(g, ell(36, 12.5, 5.2, 1.4), function () { return look.shirt; }, null);
    }
    if (st === 'long') {
      layer(g, function (x, y) {
        var dx = Math.abs(x - 36);
        return dx >= 14 && dx <= 19 && y >= 30 && y <= 64 - (dx - 14) * 2 && !inHead(x, y);
      }, col, r[0]);
    }
  }

  function drawNeck(g, look, mood) {
    var r = ramp(mood === 'angry' ? mix(look.skin, '#e04030', 0.4) : look.skin, 0.62);
    layer(g, function (x, y) { return x > 30 && x < 42 && y > 42 && y < 62; }, function (x, y) {
      var t = 0.42 - (x - 36) * 0.012 + (y - 44) * 0.002;
      if (y < 52) t -= 0.2;   // Kinnschatten
      return tone(r, t, x, y);
    }, null);
  }

  function drawTorso(g, look) {
    var outfit = look.outfit || (look.extras.indexOf('tie') >= 0 ? 'suit' : 'shirt');
    var r = ramp(look.shirt, 0.55);
    var hole = null;
    if (outfit === 'shirt') hole = tri([29.5, 52], [42.5, 52], [36, 67]);
    if (outfit === 'tshirt') hole = ell(36, 53.5, 8.4, 6.2);
    if (outfit === 'suit') hole = tri([30, 52], [42, 52], [36, 66]);
    if (outfit === 'coat') hole = tri([27, 52], [45, 52], [36, 77]);
    var inTorso = function (x, y) { return y >= 53 && Math.abs(x - 36) <= torsoHalf(y); };
    layer(g, hole ? and(inTorso, not(hole)) : inTorso, function (x, y) {
      var X = x - 36;
      var t = 0.58 - 0.28 * (X / 33) - 0.1 * ((y - 54) / 30) + 0.07 * Math.sin(X * 0.5 + y * 0.13) + 0.06 * Math.sin(y * 0.45 - X * 0.2);
      var ax = Math.abs(X);
      if (ax > 21 && y > 62) t -= 0.35 * ((ax - 21) / 7);
      var seam = Math.abs(ax - (19 + (y - 58) * 0.1));
      if (y > 58 && seam < 0.7) t -= 0.3;
      return tone(r, t, x, y);
    }, r[0]);

    var white = ramp('#f4f4f8', 0.35);
    if (outfit === 'shirt') {
      var cc = ramp(mix(look.shirt, '#ffffff', 0.6), 0.4);
      var cf = function (x, y) { return tone(cc, 0.62 - (y - 52) * 0.01 - (x - 36) * 0.006, x, y); };
      layer(g, tri([30, 51], [25.5, 58.5], [36, 68.5]), cf, cc[0]);
      layer(g, tri([42, 51], [46.5, 58.5], [36, 68.5]), cf, cc[0]);
      for (var k = 0; k < 3; k++) {
        layer(g, ell(36, 73 + k * 7, 1.4, 1.4), function (x) { return x < 36 ? r[4] : r[1]; }, null);
      }
    } else if (outfit === 'suit') {
      layer(g, tri([31, 52], [41, 52], [36, 79]), function (x, y) { return tone(white, 0.7 - (x - 36) * 0.02, x, y); }, white[0]);
      var tc = ramp('#c8283a', 0.5);
      layer(g, tri([34, 61], [38, 61], [36, 81]), function (x, y) { return tone(tc, 0.55 - (x - 36) * 0.1 - (y - 61) * 0.004, x, y); }, tc[0]);
      layer(g, ell(36, 59, 2.8, 2.4), function (x, y) { return tone(tc, 0.7 - (x - 36) * 0.08, x, y); }, tc[0]);
      var lf = function (x, y) { return tone(r, 0.66 - (y - 54) * 0.008, x, y); };
      layer(g, tri([25, 56], [31, 52], [36, 80]), function (x, y) { return x > 33 ? r[1] : lf(x, y); }, r[0]);
      layer(g, tri([47, 56], [41, 52], [36, 80]), function (x, y) { return x < 39 ? r[1] : r[2]; }, r[0]);
    } else if (outfit === 'coat') {
      var under = ramp('#3a8a9a', 0.5);
      layer(g, tri([28, 53], [44, 53], [36, 76]), function (x, y) { return tone(under, 0.5 - (x - 36) * 0.01, x, y); }, under[0]);
      var lc = ramp(look.shirt, 0.4);
      layer(g, tri([22, 57], [29, 52], [36, 77]), function (x, y) { return tone(lc, 0.75 - (y - 54) * 0.01, x, y); }, lc[0]);
      layer(g, tri([50, 57], [43, 52], [36, 77]), function (x, y) { return tone(lc, 0.6 - (y - 54) * 0.01, x, y); }, lc[0]);
      layer(g, function (x, y) { return x > 12 && x < 24 && y > 74 && y < 86; }, function (x, y) { return tone(lc, 0.5, x, y); }, lc[0]);
      put(g, 15, 72, '#2a56c0'); put(g, 15, 73, '#2a56c0'); put(g, 15, 74, '#2a56c0');
      put(g, 16, 72, '#c0392b'); put(g, 16, 73, '#c0392b'); put(g, 16, 74, '#c0392b');
    } else if (outfit === 'tshirt') {
      layer(g, and(function (x, y) { return y >= 50; }, and(ell(36, 53.5, 10, 7.6), not(ell(36, 53.5, 8.4, 6.2)))), function (x, y) { return tone(r, 0.3, x, y); }, null);
      // Brustaufdruck
      layer(g, function (x, y) { return y > 70 && y < 78 && Math.abs(x - 36) < 11; }, function (x, y) { return (x + y) % 2 ? '#ffe36b' : '#f4c430'; }, r[0]);
    }
  }

  function drawEars(g, look, mood) {
    var r = ramp(mood === 'angry' ? mix(look.skin, '#e04030', 0.4) : look.skin, 0.6);
    [20.5, 51.5].forEach(function (cx, i) {
      layer(g, ell(cx, 30.5, 3, 4.6), function (x, y) { return tone(r, 0.45 + (i ? -0.08 : 0.08), x, y); }, r[0]);
      put(g, Math.floor(cx + (i ? -1 : 1)), 30, r[1]); put(g, Math.floor(cx + (i ? -1 : 1)), 31, r[1]);
    });
  }

  function drawHead(g, look, mood) {
    var base = mood === 'angry' ? mix(look.skin, '#e04030', 0.4) : look.skin;
    var r = ramp(base, 0.55);
    layer(g, inHead, function (x, y) { return tone(r, faceT(x + 0.5, y + 0.5), x, y); }, null);
    return r;
  }

  function drawNose(g, r) {
    // Nasenrücken hell (Licht von links oben), rechts Schatten, Spitze und Unterseite dunkel
    for (var y = 29; y <= 34; y++) { put(g, 35, y, r[4]); put(g, 38, y, r[1]); }
    put(g, 35, 35, r[4]); put(g, 36, 35, r[3]); put(g, 37, 35, r[2]);
    layer(g, ell(36, 36.6, 3.6, 1.6), function (x, y) { return tone(r, 0.22, x, y); }, null);
    put(g, 34, 36, r[0]); put(g, 37, 36, r[0]);
  }

  function drawEye(g, ex, ey, mood, side, look, r) {
    var inner = -side;
    var iris = ramp(look.iris || '#5a3a20', 0.6);
    var skinDark = r[1];
    function arc(dx, k) { return Math.round(k * (1 - (dx * dx) / 17.6)); }
    var dx, x, y;
    if (mood === 'happy') {
      for (dx = -4; dx <= 4; dx++) {
        var yy = Math.round(ey + 1 - arc(dx, 2.6));
        put(g, Math.round(ex + dx - 0.5), yy, INK); put(g, Math.round(ex + dx - 0.5), yy + 1, '#4a1a1a');
      }
      return;
    }
    if (mood === 'blink') {
      for (dx = -4; dx <= 4; dx++) { put(g, Math.round(ex + dx - 0.5), Math.round(ey + arc(dx, 1.2)), INK); }
      return;
    }
    var inEye = ell(ex, ey, 4.3, 3.3);
    layer(g, inEye, function (x, y) { return y + 0.5 < ey ? '#d6d8e8' : '#fbfbff'; }, null);
    // Iris und Pupille
    var ir = mood === 'angry' ? 1.9 : 2.4;
    var icx = ex + inner * 0.4, icy = ey + (mood === 'meh' ? 0.2 : 0.4);
    layer(g, ell(icx, icy, ir, ir), function (x, y) { return tone(iris, 0.3 + (y - (icy - ir)) * 0.14, x, y); }, null);
    layer(g, ell(icx, icy, 1, 1.2), function () { return '#0c0a14'; }, null);
    put(g, Math.floor(icx - 1), Math.floor(icy - 1.4), '#ffffff');
    // Lid
    var lidY = null;
    if (mood === 'meh') lidY = function () { return ey - 0.6; };
    if (mood === 'angry') lidY = function (px) { var s = clamp(((px - ex) * inner + 4.3) / 8.6, 0, 1); return ey - 3.2 + 3.6 * s; };
    for (x = Math.floor(ex - 5); x <= Math.ceil(ex + 5); x++) for (y = Math.floor(ey - 4); y <= Math.ceil(ey + 4); y++) {
      if (!inEye(x + 0.5, y + 0.5)) {
        // Wimpernlinie oben um das Auge
        if (inEye(x + 0.5, y + 1.5) && y + 0.5 < ey) put(g, x, y, '#3a1a28');
        continue;
      }
      if (lidY) {
        var ly = lidY(x + 0.5);
        if (y + 0.5 < ly) put(g, x, y, skinDark);
        else if (y + 0.5 < ly + 1) put(g, x, y, '#2a1020');
      }
    }
  }

  function drawBrow(g, ex, ey, mood, side, look) {
    var browC = look.hair === '#8a8a8a' ? '#5a5a5a' : mix(look.hair, '#000000', 0.25);
    var inner = -side, thick = mood === 'angry' ? 3 : 2;
    for (var dx = -5; dx <= 4; dx++) {
      var px = ex + dx + 0.5, s = clamp(((px - ex) * inner + 4.8) / 9.6, 0, 1);
      var a = Math.round(1.2 * (1 - Math.pow((px - ex) / 4.8, 2)));
      var off;
      if (mood === 'angry') off = -9.4 + 4.6 * s;
      else if (mood === 'happy') off = -9.5 - a;
      else if (mood === 'meh') off = side > 0 ? -9 - 2 * s - a : -7.2 - 0.4 * s;
      else off = -7.4 - a;
      var y0 = Math.round(ey + off), x0 = Math.floor(px);
      for (var k = 0; k < thick; k++) put(g, x0, y0 + k, k === 0 && mood !== 'angry' ? mix(browC, HI, 0.15) : browC);
    }
  }

  function drawMouth(g, look, mood, beard, skinR) {
    var mx = 36, my = 42;
    var lip = beard ? '#d89088' : mix(look.skin, '#b03040', 0.45);
    var dark = '#4a1a22', inside = '#7a1a28';
    var dx, x, y;
    if (mood === 'happy') {
      for (dx = -7; dx <= 7; dx++) {
        var uy = my - Math.round(2.2 * dx * dx / 49);
        var ly = uy + Math.round(4.4 * (1 - dx * dx / 49));
        x = mx + dx - (dx >= 0 ? 0 : 0);
        var xx = dx < 0 ? mx + dx : mx + dx - 1 + 1;
        xx = Math.round(mx + dx - 0.5);
        put(g, xx, uy - 1, dark);
        for (y = uy; y <= ly; y++) put(g, xx, y, (y - uy < 2) ? '#fafaff' : inside);
        put(g, xx, ly + 1, dark);
        if (ly - uy >= 3 && Math.abs(dx) < 3) put(g, xx, ly, '#d05060');
      }
      return;
    }
    if (mood === 'talk') {
      layer(g, ell(mx, my + 1.5, 4.6, 3.6), function (x, y) {
        if (y + 0.5 < my - 0.5) return '#fafaff';
        if (y + 0.5 > my + 3) return '#d05060';
        return inside;
      }, dark);
      return;
    }
    if (mood === 'angry') {
      // zusammengebissene Zähne
      layer(g, function (x, y) { return Math.abs(x - mx) < 6 && y > my - 2.5 && y < my + 2.5; }, function (x, y) { return (x % 2) ? '#fafaff' : '#c8c8d8'; }, dark);
      for (dx = -6; dx <= 5; dx++) put(g, Math.round(mx + dx), my, dark);
      put(g, mx - 7, my + 2, dark); put(g, mx + 6, my + 2, dark);
      return;
    }
    if (mood === 'meh') {
      for (dx = -5; dx <= 5; dx++) put(g, Math.round(mx + dx - 0.5), Math.round(my + 1 - dx * 0.25), dark);
      for (dx = -3; dx <= 3; dx++) put(g, Math.round(mx + dx - 0.5), Math.round(my + 2 - dx * 0.25), lip);
      return;
    }
    // neutral / blink
    for (dx = -5; dx <= 5; dx++) put(g, Math.round(mx + dx - 0.5), my, dark);
    for (dx = -3; dx <= 3; dx++) { put(g, Math.round(mx + dx - 0.5), my + 1, lip); put(g, Math.round(mx + dx - 0.5), my - 1, mix(lip, SH, 0.1)); }
    put(g, mx - 6, my - 1, dark); put(g, mx + 5, my - 1, dark);
  }

  function drawBeard(g, look) {
    var r = ramp(look.hair === '#8a8a8a' ? '#9a9a9a' : look.hair, 0.6);
    var big = ell(36, 29, 16.4, 19.4);
    layer(g, function (x, y) {
      if (!big(x, y)) return false;
      var dx = Math.abs(x - 36);
      if (dx < 8 && y >= 37) return !(y < 40 && dx < 2.5 && false);
      return y > 34 + clamp(8 - dx, 0, 8) * 0.45 && dx >= 8;
    }, function (x, y) {
      var t = 0.5 - 0.01 * (x - 36) + 0.12 * Math.sin(x * 0.9 + y * 0.5);
      if ((x + y * 2) % 5 === 0) t -= 0.18;
      return tone(r, t, x, y);
    }, null);
  }

  function drawGlasses(g, look, ex1, ex2, ey) {
    var f = '#241a30', fl = '#5a4a70';
    [ex1, ex2].forEach(function (ex) {
      var x0 = Math.floor(ex - 5.5), x1 = Math.floor(ex + 5.5), y0 = Math.floor(ey - 4.5), y1 = Math.floor(ey + 4.5);
      for (var x = x0; x <= x1; x++) for (var y = y0; y <= y1; y++) {
        var corner = (x === x0 || x === x1) && (y === y0 || y === y1);
        if (corner) continue;
        var edge = x === x0 || x === x1 || y === y0 || y === y1;
        if (edge) put(g, x, y, (y === y0 && x < ex) ? fl : f);
        else {
          var c = get(g, x, y);
          if (c) put(g, x, y, mix(c, '#a8d4ff', 0.2));
        }
      }
      put(g, x0 + 2, y0 + 2, '#ffffff'); put(g, x0 + 3, y0 + 3, '#ffffff'); put(g, x0 + 2, y0 + 3, '#e8f4ff');
    });
    var b0 = Math.floor(ex1 + 5.5), b1 = Math.floor(ex2 - 5.5);
    for (var x = b0; x <= b1; x++) put(g, x, Math.floor(ey - 1.5), f);
    line(g, Math.floor(ex1 - 5.5), Math.floor(ey - 2), 22, Math.floor(ey - 1), f);
    line(g, Math.floor(ex2 + 5.5), Math.floor(ey - 2), 50, Math.floor(ey - 1), f);
  }

  function outlineAll(g) {
    var add = [], x, y;
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      if (g[y][x]) continue;
      var n = (y > 0 && g[y - 1][x]) || (y < H - 1 && g[y + 1][x]) || (x > 0 && g[y][x - 1]) || (x < W - 1 && g[y][x + 1]);
      if (n) add.push([x, y, mix(n, INK, 0.75)]);
    }
    add.forEach(function (a) { g[a[1]][a[0]] = a[2]; });
  }

  /* ---------- Zusammenbau ---------- */
  var cache = {};
  function render(look, mood) {
    var key = JSON.stringify(look) + '|' + mood;
    if (cache[key]) return cache[key];
    var g = newGrid();
    var beard = look.extras.indexOf('beard') >= 0;
    drawHairBack(g, look);
    drawNeck(g, look, mood);
    drawTorso(g, look);
    drawEars(g, look, mood);
    var r = drawHead(g, look, mood);
    if (mood === 'happy') {
      var pink = mix(look.skin, '#ff5a6a', 0.45);
      [[25.5, 37], [46.5, 37]].forEach(function (c) {
        layer(g, ell(c[0], c[1], 3.6, 2.2), function (x, y) { return (x + y) % 2 === 0 ? pink : get(g, x, y); }, null);
      });
    }
    drawNose(g, r);
    var ey = 29, ex1 = 28.5, ex2 = 43.5;
    drawEye(g, ex1, ey, mood, -1, look, r);
    drawEye(g, ex2, ey, mood, 1, look, r);
    drawBrow(g, ex1, ey, mood, -1, look);
    drawBrow(g, ex2, ey, mood, 1, look);
    if (beard) drawBeard(g, look);
    drawMouth(g, look, mood, beard, r);
    drawHairFront(g, look);
    if (look.extras.indexOf('glasses') >= 0) drawGlasses(g, look, ex1, ex2, ey);
    outlineAll(g);
    if (mood === 'angry') {
      var rc = '#e02828', rd = '#8a1010';
      [[0, 0], [1, 0], [0, 1], [3, 0], [3, 1], [4, 1], [1, 2], [2, 2], [4, 2], [0, 3], [1, 3], [3, 3], [4, 3], [2, 4]].forEach(function (p) {
        put(g, 52 + p[0], 8 + p[1], p[0] % 2 ? rd : rc);
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
  QW.drawPerson = function (canvas, look, mood) {
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(render(look, mood), 0, 0);
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

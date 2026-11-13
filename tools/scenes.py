"""Procedural cinematic scene renderer for the Creacy demo portfolio.

Unsplash is unreachable from the build environment, so every photograph on the
site is rendered here as an original, photo-styled placeholder. Swap the files
in site/img (same names) for real photography and nothing else needs to change.
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter, map_coordinates, zoom

OUT = os.path.join(os.path.dirname(__file__), "..", "site", "img")
AA = 3  # supersampling factor for polygon masks


def hx(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], np.float32)


def smooth(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def catmull(pts, n=12):
    pts = np.asarray(pts, np.float64)
    pts = np.vstack([pts[0], pts, pts[-1]])
    out = []
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[i + 1], pts[i + 2]
        for t in np.linspace(0, 1, n, endpoint=False):
            t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    out.append(pts[-2])
    return [tuple(p) for p in out]


class Scene:
    def __init__(self, w, h, seed):
        self.w, self.h = w, h
        self.rng = np.random.default_rng(seed)
        self.img = np.zeros((h, w, 3), np.float32)
        self.Y, self.X = np.mgrid[0:h, 0:w].astype(np.float32)

    # ---------- noise ----------
    def fbm1(self, base=4, octaves=5, pers=0.5, ridged=False):
        n = self.w
        out = np.zeros(n, np.float32)
        amp, tot, f = 1.0, 0.0, base
        for _ in range(octaves):
            pts = self.rng.random(f + 4)
            xs = np.linspace(0, f, n) + self.rng.random()
            i = np.floor(xs).astype(int)
            t = smooth(xs - i)
            v = pts[i] * (1 - t) + pts[i + 1] * t
            if ridged:
                v = 1 - np.abs(v * 2 - 1)
            out += amp * v
            tot += amp
            amp *= pers
            f *= 2
        return out / tot

    def noise2(self, ch, cw):
        g = self.rng.random((ch + 3, cw + 3)).astype(np.float32)
        z = zoom(g, (self.h / ch, self.w / cw), order=3, mode="reflect")
        oy = int(self.h / ch)
        ox = int(self.w / cw)
        return z[oy:oy + self.h, ox:ox + self.w]

    def fbm2(self, ch=3, cw=4, octaves=5, pers=0.5):
        out = np.zeros((self.h, self.w), np.float32)
        amp, tot = 1.0, 0.0
        for _ in range(octaves):
            out += amp * self.noise2(ch, cw)
            tot += amp
            amp *= pers
            ch, cw = ch * 2, cw * 2
        return out / tot

    # ---------- painting ----------
    def blend(self, a, col):
        a = np.clip(a, 0, 1)[..., None]
        col = np.asarray(col, np.float32)
        self.img = self.img * (1 - a) + col * a

    def add(self, a, col):
        self.img = self.img + np.clip(a, 0, None)[..., None] * np.asarray(col, np.float32)

    def grad(self, stops):
        t = self.Y / (self.h - 1)
        ps = [p for p, _ in stops]
        cols = [hx(c) for _, c in stops]
        out = np.zeros_like(self.img)
        for k in range(3):
            out[..., k] = np.interp(t, ps, [c[k] for c in cols])
        self.img = out

    def glow(self, cx, cy, r, col, s=1.0, sx=1.0):
        d2 = ((self.X - cx * self.w) / sx) ** 2 + (self.Y - cy * self.h) ** 2
        self.add(s * np.exp(-d2 / (r * self.w) ** 2), hx(col))

    def clouds(self, col, cover=0.5, top=0.0, bottom=0.6, soft=0.18, s=0.7, ch=2, cw=4):
        n = self.fbm2(ch, cw, 6)
        a = smooth((n - cover) / soft) * s
        y = self.Y / self.h
        a *= smooth((y - top) / 0.08) * smooth((bottom - y) / 0.15)
        self.blend(a, hx(col))

    def poly_mask(self, polys, blur=0):
        im = Image.new("L", (self.w * AA, self.h * AA), 0)
        d = ImageDraw.Draw(im)
        for p in polys:
            d.polygon([(x * AA, y * AA) for x, y in p], fill=255)
        im = im.resize((self.w, self.h), Image.BOX)
        m = np.asarray(im, np.float32) / 255
        return gaussian_filter(m, blur) if blur else m

    def ellipse_mask(self, ells, blur=0):
        im = Image.new("L", (self.w * AA, self.h * AA), 0)
        d = ImageDraw.Draw(im)
        for cx, cy, rx, ry in ells:
            d.ellipse([(cx - rx) * AA, (cy - ry) * AA, (cx + rx) * AA, (cy + ry) * AA], fill=255)
        im = im.resize((self.w, self.h), Image.BOX)
        m = np.asarray(im, np.float32) / 255
        return gaussian_filter(m, blur) if blur else m

    def ridge(self, y, amp, col, haze_col=None, haze=0.0, base=3, octaves=6, ridged=False, tex=0.18,
              snow=None, valley_fog=0.0, light=0.0, curve=None, depth=0.35, xstretch=None, ymax=None):
        if curve is None:
            n = self.fbm1(base, octaves, 0.5, ridged)
            curve = (y - amp * n) * self.h
        a = np.clip(self.Y - curve[None, :] + 0.5, 0, 1)
        if ymax is not None:
            a = a * np.clip(ymax - self.Y + 0.5, 0, 1)
        t = self.fbm2(2, 30, 4)
        below = np.clip((self.Y - curve[None, :]) / (depth * self.h), 0, 1)
        near = np.clip((self.Y - curve[None, :]) / (0.1 * self.h), 0, 1)
        tt = 0.5 + (t - 0.5) * (1 - 0.75 * near) + 0.15 * (self.fbm2(6, 8, 3) - 0.5)
        c = hx(col)[None, None, :] * (1 - tex / 2 + tex * tt[..., None])
        if light:
            slope = np.gradient(gaussian_filter(curve, 3))
            lit = np.tanh(-slope * light * 0.6)[None, :] * (1 - near) ** 2
            c = c * (1 + 0.35 * lit[..., None])
        c = c * (1 - 0.18 * below[..., None])
        if snow is not None:
            depth_px, scol = snow
            peak = curve.min()
            sline = peak + depth_px * self.h * 2.6 * (0.6 + 0.8 * self.fbm1(6, 4))
            gully = 0.55 * self.fbm2(3, 50, 3) + 0.45 * self.fbm2(6, 9, 3)
            sm = smooth((sline[None, :] - self.Y) / 10) * smooth((gully - 0.36) * 2.4) * smooth((self.Y - curve[None, :]) / 3)
            c = c * (1 - sm[..., None]) + hx(scol) * sm[..., None] * (0.85 + 0.3 * t[..., None])
        if haze_col is not None:
            hz = np.clip(haze + valley_fog * below, 0, 1)[..., None]
            c = c * (1 - hz) + hx(haze_col) * hz
        self.img = self.img * (1 - a[..., None]) + c * a[..., None]
        return curve

    def fog(self, y, height, col, s=0.6, streak=True):
        n = self.fbm2(3, 10 if streak else 4, 5)
        band = np.exp(-((self.Y / self.h - y) / height) ** 2)
        self.blend(band * s * (0.55 + 0.7 * n), hx(col))

    def trees(self, curve, col, hmin, hmax, spacing=5, jitter=0.0, alpha=1.0, offset=0.0, xr=(0, 1)):
        polys = []
        x = xr[0] * self.w - 10
        while x < xr[1] * self.w + 10:
            xi = int(np.clip(x, 0, self.w - 1))
            base = curve[xi] + offset * self.h + self.rng.normal(0, jitter * self.h)
            th = self.rng.uniform(hmin, hmax) * self.h
            tw = th * self.rng.uniform(0.28, 0.38)
            tiers = 6
            pts_l, pts_r = [], []
            for k in range(tiers + 1):
                f = k / tiers
                yy = base - th * f
                ww = tw * (1 - f) ** 1.1 * 0.5
                jag = 0.55 if k % 2 else 1.0
                pts_l.append((x - ww * jag, yy))
                pts_r.append((x + ww * jag, yy))
            polys.append(pts_l + [(x, base - th * 1.04)] + pts_r[::-1])
            x += spacing * self.rng.uniform(0.6, 1.5)
        m = self.poly_mask(polys)
        self.blend(m * alpha, hx(col))
        return m

    def grass(self, y0, y1, n, cols, length=(0.08, 0.2), width=(1, 3), lean=0.25, blur=0, alpha=1.0, xr=(0, 1)):
        layer = Image.new("RGBA", (self.w * 2, self.h * 2), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        cl = [tuple(int(v * 255) for v in hx(c)) for c in cols]
        for _ in range(n):
            x = self.rng.uniform(xr[0], xr[1]) * self.w
            base = self.rng.uniform(y0, y1) * self.h
            L = self.rng.uniform(*length) * self.h
            le = self.rng.normal(0, lean) * L
            c = cl[self.rng.integers(len(cl))]
            v = self.rng.uniform(0.7, 1.15)
            c = tuple(int(min(255, ch * v)) for ch in c) + (255,)
            wdt = int(self.rng.uniform(*width) * 2)
            pts = []
            for t in np.linspace(0, 1, 6):
                pts.append(((x + le * t * t) * 2, (base - L * t) * 2))
            d.line(pts, fill=c, width=max(1, wdt), joint="curve")
            if self.rng.random() < 0.25:  # seed head
                ex, ey = pts[-1]
                d.ellipse([ex - wdt * 1.4, ey - wdt * 4, ex + wdt * 1.4, ey + wdt * 1.5], fill=c)
        layer = layer.resize((self.w, self.h), Image.BOX)
        arr = np.asarray(layer, np.float32) / 255
        rgb, a = arr[..., :3], arr[..., 3]
        if blur:
            a = gaussian_filter(a, blur)
            rgb = np.stack([gaussian_filter(rgb[..., k] * arr[..., 3], blur) for k in range(3)], -1) / np.maximum(a, 1e-4)[..., None]
        a = a * alpha
        self.img = self.img * (1 - a[..., None]) + rgb * a[..., None]

    def water(self, y0, tint, dark=0.65, ripple=2.5, fade=0.25):
        y0p = y0 * self.h
        Y, X = self.Y, self.X
        m = Y >= y0p
        dist = (Y - y0p)
        src_y = y0p - dist * 1.0 - 1
        src_x = X + np.sin(Y * 0.9 + self.fbm2(40, 3, 2) * 12) * ripple * (0.3 + dist / self.h * 3)
        src_y = np.clip(src_y, 0, self.h - 1)
        refl = np.stack([map_coordinates(self.img[..., k], [src_y, src_x], order=1, mode="nearest") for k in range(3)], -1)
        streak = self.fbm2(60, 2, 3)
        refl = refl * (dark + 0.12 * streak[..., None])
        t = np.clip(dist / self.h / fade, 0, 1)[..., None]
        refl = refl * (1 - 0.35 * t) + hx(tint) * 0.35 * t
        self.img = np.where(m[..., None], refl, self.img)

    def finish(self, contrast=0.35, lift="#0e0e10", lift_amt=0.06, vignette=0.45, grain=0.022, sat=0.92, gamma=1.0, warm=0.0):
        im = np.clip(self.img, 0, 1.4)
        im = np.where(im > 0.8, 0.8 + 0.2 * np.tanh((im - 0.8) / 0.2), im)  # soft highlight shoulder
        im = np.clip(im, 0, 1) ** gamma
        im = im * (1 - contrast) + smooth(im) * contrast
        lum = im.mean(-1, keepdims=True)
        im = lum + (im - lum) * sat
        if warm:
            im = im * np.array([1 + warm, 1, 1 - warm], np.float32)
        im = hx(lift) * lift_amt + im * (1 - lift_amt)
        r2 = ((self.X / self.w - 0.5) ** 2 * 1.2 + (self.Y / self.h - 0.5) ** 2)
        im = im * (1 - vignette * r2[..., None] * 1.3)
        im = im + self.rng.normal(0, grain, (self.h, self.w, 1)).astype(np.float32) * (1.2 - lum)
        self.img = np.clip(im, 0, 1)


# ====================================================================== scenes

def mountains(s, P):
    s.grad(P["sky"])
    if P.get("sun"):
        cx, cy, col = P["sun"]
        s.glow(cx, cy, 0.35, col, 0.55, 1.4)
        s.glow(cx, cy, 0.05, "#fff4dc", 0.6)
    if P.get("clouds"):
        s.clouds(P["clouds"], cover=P.get("cover", 0.5), bottom=0.55)
    layers = P["layers"]
    curve = None
    for i, L in enumerate(layers):
        curve = s.ridge(L["y"], L["amp"], L["col"], P["haze"], L.get("haze", 0), base=L.get("base", 3),
                        ridged=L.get("ridged", False), snow=L.get("snow"), valley_fog=L.get("vf", 0.4),
                        light=min(L.get("light", 1.0), 1.2), tex=min(L.get("tex", 0.2), 0.16))
        if L.get("trees"):
            s.trees(curve, L["trees"], L.get("th", (0.02, 0.05))[0], L.get("th", (0.02, 0.05))[1], spacing=L.get("sp", 4), offset=0.004)
        if L.get("fog"):
            s.fog(L["y"] - L["amp"] * 0.1, 0.06, P["haze"], L["fog"])
    if P.get("birds"):
        birds(s, P["birds"], (0.2, 0.18, 0.8, 0.45), (0.005, 0.012), "#2a2f2f", 0.9)
    if P.get("lake"):
        s.water(P["lake"], P.get("tint", "#20262c"))
    if P.get("fg"):
        s.ridge(P["fg"][0], P["fg"][1], P["fg"][2], base=6, tex=0.3, light=0.5)
    s.finish(**P.get("fin", {}))


def forest(s, P):
    s.grad(P["sky"])
    if P.get("sun"):
        s.glow(*P["sun"][:2], 0.4, P["sun"][2], 0.5, 1.5)
    for i, (y, amp, col, th, sp, fog) in enumerate(P["layers"]):
        c = s.ridge(y, amp, col, base=2, octaves=3, tex=0.05, light=0)
        s.trees(c, col, th[0], th[1], spacing=sp, jitter=0.004)
        if fog:
            s.fog(y + 0.02, 0.09, P["fog"], fog)
    s.finish(**P.get("fin", {}))


def coast(s, P):
    s.grad(P["sky"])
    y0 = P["horizon"]
    if P.get("sun"):
        s.glow(P["sun"][0], P["sun"][1], 0.3, P["sun"][2], 0.6, 1.6)
    if P.get("clouds"):
        s.clouds(P["clouds"], cover=0.52, bottom=y0)
    sea = (s.Y / s.h >= y0)
    t = np.clip((s.Y / s.h - y0) / (1 - y0), 0, 1)
    col = hx(P["sea"][0]) * (1 - t[..., None]) + hx(P["sea"][1]) * t[..., None]
    waves = s.fbm2(80, 4, 4)
    col = col * (0.8 + 0.4 * waves[..., None] ** 2)
    if P.get("sun"):
        cx = P["sun"][0] * s.w
        beam = np.exp(-((s.X - cx) / (s.w * (0.02 + 0.12 * t))) ** 2) * (waves > 0.5) * (1 - t) * 0.8
        col = col + beam[..., None] * hx(P["sun"][2])
    s.img = np.where(sea[..., None], col, s.img)
    # headland on one side
    side = P.get("side", 1)
    xs = s.X[0] / s.w
    shape = 1 / (1 + np.exp(-(xs - P.get("xc", 0.62)) * 14 * side))
    n = s.fbm1(4, 6)
    curve = (y0 - (P["cliff"] * shape) * (0.75 + 0.35 * n)) * s.h + 1
    s.ridge(0, 0, P["rock"], P["haze"], 0.15, curve=curve, tex=0.3, light=1.2, depth=0.2, ymax=y0 * s.h + 2)
    foam = np.exp(-((s.Y - y0 * s.h - 3) / 3) ** 2) * shape[None, :] * (s.fbm2(2, 40, 3) > 0.5)
    s.add(foam * 0.5, hx("#d8dcdc"))
    s.finish(**P.get("fin", {}))


def dunes(s, P):
    s.grad(P["sky"])
    s.glow(P["sun"][0], P["sun"][1], 0.3, P["sun"][2], 0.5, 1.6)
    for y, amp, lit, shade in P["layers"]:
        n = s.fbm1(2, 3)
        curve = (y - amp * n) * s.h
        a = np.clip(s.Y - curve[None, :] + 0.5, 0, 1)
        slope = np.gradient(gaussian_filter(curve, 6))
        side = smooth(0.5 + slope[None, :] * 4 * P.get("dir", 1))
        below = np.clip((s.Y - curve[None, :]) / (0.25 * s.h), 0, 1)
        side = side * (1 - below) + 0.5 * below
        rip = 0.94 + 0.06 * np.sin((s.Y * 0.9 + s.fbm2(3, 3, 3) * 120))
        c = hx(lit) * side[..., None] + hx(shade) * (1 - side[..., None])
        c = c * rip[..., None]
        s.img = s.img * (1 - a[..., None]) + c * a[..., None]
    s.finish(**P.get("fin", {}))


def cabin(s, P):
    W, H = s.w, s.h
    s.grad(P["sky"])
    s.clouds(P.get("cloud", "#c9ccc9"), cover=0.45, soft=0.3, bottom=0.62, s=0.5, ch=2, cw=3)
    if P.get("sun"):
        s.glow(P["sun"][0], P["sun"][1], 0.3, P["sun"][2], 0.5, 1.5)
    tl = s.ridge(0.64, 0.05, P["treeline"], P["haze"], 0.3, base=10, octaves=5, tex=0.2, light=0)
    s.trees(tl, P["treeline"], 0.015, 0.04, spacing=6, alpha=0.9, offset=0.01)
    s.ridge(0.70, 0.01, P["field"], base=2, octaves=2, tex=0.25, light=0)
    ox, sc = P.get("x", 0.0), P.get("scale", 1.0)

    def p(x, y):
        return ((0.6 + (x - 0.6) * sc + ox) * W, (0.72 + (y - 0.72) * sc) * H)

    gable = [p(0.36, 0.735), p(0.47, 0.755), p(0.47, 0.50), p(0.415, 0.395), p(0.36, 0.47)]
    side = [p(0.47, 0.755), p(0.88, 0.715), p(0.88, 0.535), p(0.47, 0.50)]
    roof = [p(0.415, 0.395), p(0.88, 0.43), p(0.88, 0.535), p(0.47, 0.50)]
    wood = s.fbm2(1, 300, 2)
    stripes = 0.86 + 0.14 * np.sin(s.X * (2.4 / sc)) ** 8
    for poly, col, k in ((gable, P["wall"], 0.75), (side, P["wall"], 1.0), (roof, P["roof"], 1.0)):
        m = s.poly_mask([poly])
        c = hx(col) * k * (stripes * (0.85 + 0.3 * wood))[..., None]
        s.blend(m, c)
    # ridge highlight
    edge = s.poly_mask([[p(0.415, 0.393), p(0.88, 0.428), p(0.88, 0.434), p(0.415, 0.399)]])
    s.add(edge * 0.25, hx("#d9dcd8"))
    # glazing on long side
    glass = [p(0.56, 0.735), p(0.79, 0.722), p(0.79, 0.565), p(0.56, 0.56)]
    gm = s.poly_mask([glass])
    refl = hx("#8d969a") * (1 - (s.Y / H - 0.56) * 3)[..., None]
    s.blend(gm, np.clip(refl * 0.55 + hx("#121417") * 0.6, 0, 1))
    mull = s.poly_mask([[p(x, 0.735 - (x - 0.56) * 0.06), p(x + 0.004, 0.735), p(x + 0.004, 0.56), p(x, 0.56)] for x in np.linspace(0.6, 0.76, 4)])
    s.blend(mull * gm, hx("#1a1b1d"))
    slot = s.poly_mask([[p(0.40, 0.72), p(0.425, 0.725), p(0.425, 0.53), p(0.40, 0.52)]])
    s.blend(slot, hx("#0d0f11"))
    if P.get("lit"):
        s.add(gm * 0.35 * (0.6 + 0.4 * s.fbm2(2, 6, 2)), hx(P["lit"]))
    s.fog(0.71, 0.03, P["haze"], 0.25)
    gy = P.get("grass_y", 0.72)
    s.grass(gy, gy + 0.06, 2600, P["grass"], (0.015, 0.05), (1, 2), 0.3)
    s.grass(gy + 0.05, 0.95, 3200, P["grass"], (0.04, 0.11), (1.2, 2.6), 0.35)
    s.grass(0.9, 1.08, 2600, P["grass"], (0.07, 0.16), (2, 4), 0.35)
    s.grass(0.97, 1.12, 90, P["grass_fg"], (0.12, 0.26), (6, 11), 0.4, blur=4, alpha=0.9)
    s.finish(**P.get("fin", {}))


def box(s, x, y, w, h, d, cols, tex):
    # oblique box: front face at (x,y,w,h); depth goes up-right
    dx, dy = d * 0.7, -d * 0.45
    front = [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]
    top = [(x, y), (x + dx, y + dy), (x + w + dx, y + dy), (x + w, y)]
    side = [(x + w, y), (x + w + dx, y + dy), (x + w + dx, y + h + dy), (x + w, y + h)]
    for poly, col in ((side, cols[1]), (top, cols[2]), (front, cols[0])):
        m = s.poly_mask([poly])
        s.blend(m, hx(col) * tex[..., None])
    return front


def brutalist(s, P):
    s.grad(P["sky"])
    s.clouds("#e8ebec", cover=0.6, s=0.35, bottom=0.8)
    tex = (0.9 + 0.18 * s.fbm2(20, 20, 3)) * (0.97 + 0.03 * np.sin(s.Y * 0.35))
    W, H = s.w, s.h
    g = s.ridge(0.86, 0.0, P["ground"], tex=0.2, light=0, base=2, octaves=2)
    for bx in P["boxes"]:
        x, y, w, h, d = bx
        front = box(s, x * W, y * H, w * W, h * H, d * W, P["cols"], tex)
        rows = max(1, int(h * 18))
        slits = []
        for r in range(rows):
            yy = y * H + (r + 0.35) * h * H / rows
            slits.append([(x * W + w * W * 0.08, yy), (x * W + w * W * 0.92, yy), (x * W + w * W * 0.92, yy + h * H / rows * 0.3), (x * W + w * W * 0.08, yy + h * H / rows * 0.3)])
        s.blend(s.poly_mask(slits) * 0.85, hx("#141414"))
        # cast shadow under each box
        sh = s.poly_mask([[(x * W, (y + h) * H), ((x + w) * W, (y + h) * H), ((x + w) * W + 30, (y + h) * H + 26), (x * W + 30, (y + h) * H + 26)]], blur=6)
        s.img *= (1 - 0.35 * sh)[..., None]
    s.finish(**P.get("fin", {}))


def facade(s, P):
    s.grad(P["sky"])
    W, H = s.w, s.h
    for q, nx, ny, frame in P["quads"]:
        (ax, ay), (bx, by), (cx, cy), (dx, dy) = q  # bottom-left, bottom-right, top-right, top-left

        def pt(u, v):
            bl = np.array([ax, ay]) * (1 - u) + np.array([bx, by]) * u
            tl = np.array([dx, dy]) * (1 - u) + np.array([cx, cy]) * u
            r = bl * (1 - v) + tl * v
            return (r[0] * W, r[1] * H)

        s.blend(s.poly_mask([[pt(0, 0), pt(1, 0), pt(1, 1), pt(0, 1)]]), hx(frame))
        wins_a, wins_b = [], []
        for i in range(nx):
            for j in range(ny):
                u0, u1 = (i + 0.12) / nx, (i + 0.88) / nx
                v0, v1 = (j + 0.1) / ny, (j + 0.82) / ny
                poly = [pt(u0, v0), pt(u1, v0), pt(u1, v1), pt(u0, v1)]
                (wins_a if s.rng.random() < 0.7 else wins_b).append(poly)
        ma, mb = s.poly_mask(wins_a), s.poly_mask(wins_b)
        sky_ref = np.flipud(s.img) * 0.6 + hx(P["glass"]) * 0.4
        s.blend(ma, sky_ref * (0.75 + 0.25 * s.fbm2(3, 3, 2))[..., None])
        s.blend(mb, hx(P["glass_dark"]))
    s.finish(**P.get("fin", {}))


def pagoda(s, P):
    W, H = s.w, s.h
    s.grad(P["sky"])
    s.glow(P["sun"][0], P["sun"][1], 0.45, P["sun"][2], 0.6, 1.3)
    s.clouds(P.get("cloud", "#e7b9a0"), cover=0.62, s=0.3, bottom=0.45, ch=1, cw=3)
    hills = s.ridge(0.78, 0.08, P["far"], P["haze"], 0.35, base=3, tex=0.1, light=0)
    s.trees(hills, P["far"], 0.02, 0.04, spacing=5, alpha=0.8)
    s.fog(0.8, 0.07, P["haze"], 0.5)
    cx, base = P["cx"] * W, P["base"] * H
    sc = P.get("scale", 1.0) * H
    polys = []
    y = base
    tiers = 5
    for i in range(tiers):
        bw = (0.17 - i * 0.022) * sc
        bh = (0.075 - i * 0.004) * sc
        polys.append([(cx - bw / 2, y), (cx + bw / 2, y), (cx + bw / 2, y - bh), (cx - bw / 2, y - bh)])
        y -= bh
        R = bw * 1.05 + 0.03 * sc
        up, thick, rise = 0.026 * sc, 0.008 * sc, 0.03 * sc
        xs = np.linspace(-1, 1, 41)
        bottom = [(cx + R * u, y - up * abs(u) ** 4) for u in xs]
        top = [(cx + R * u, y - thick - rise * (1 - abs(u)) - up * 0.9 * abs(u) ** 4) for u in xs[::-1]]
        polys.append(bottom + top)
        y -= thick + rise * 0.7
    polys.append([(cx - 0.004 * sc, y), (cx + 0.004 * sc, y), (cx + 0.002 * sc, y - 0.13 * sc), (cx - 0.002 * sc, y - 0.13 * sc)])
    rings = [(cx, y - 0.02 * sc - k * 0.016 * sc, 0.011 * sc * (1 - k * 0.1), 0.0035 * sc) for k in range(6)]
    m = np.maximum(s.poly_mask(polys), s.ellipse_mask(rings))
    s.blend(m, hx(P["build"]))
    # warm windows
    lights = []
    yy = base
    for i in range(tiers):
        bw = (0.17 - i * 0.022) * sc
        bh = (0.075 - i * 0.004) * sc
        for k in (-1, 0, 1):
            lx = cx + k * bw * 0.28
            lights.append([(lx - bw * 0.06, yy - bh * 0.2), (lx + bw * 0.06, yy - bh * 0.2), (lx + bw * 0.06, yy - bh * 0.75), (lx - bw * 0.06, yy - bh * 0.75)])
        yy -= bh + 0.008 * sc + 0.03 * sc * 0.7
    lm = s.poly_mask(lights)
    if P.get("lamp"):
        s.blend(lm * 0.7, hx(P["lamp"]))
        s.add(gaussian_filter(lm, 14) * 1.6, hx(P["lamp"]))
    near = s.ridge(0.9, 0.04, P["near"], base=4, tex=0.1, light=0)
    s.trees(near, P["near"], 0.06, 0.16, spacing=12, xr=(0, 0.28))
    s.trees(near, P["near"], 0.05, 0.14, spacing=12, xr=(0.74, 1))
    s.fog(0.95, 0.06, P["haze"], 0.3)
    s.finish(**P.get("fin", {}))


def giraffe(x, y, sz, flip=1):
    f = lambda px, py: (x + px * sz * flip, y + py * sz)
    body = [f(-0.5, -1.05), f(0.35, -1.25), f(0.55, -1.15), f(0.5, -0.85), f(-0.45, -0.75), f(-0.6, -0.9)]
    neck = [f(0.3, -1.2), f(0.55, -1.25), f(0.95, -2.35), f(0.82, -2.4)]
    head = [f(0.8, -2.3), f(1.0, -2.45), f(1.25, -2.32), f(1.22, -2.22), f(0.95, -2.2)]
    legs = []
    for lx in (-0.45, -0.32, 0.3, 0.45):
        legs.append([f(lx - 0.035, -0.85), f(lx + 0.035, -0.85), f(lx + 0.03 + 0.02 * np.sign(lx), 0), f(lx - 0.02 + 0.02 * np.sign(lx), 0)])
    horns = [[f(0.93, -2.4), f(0.96, -2.4), f(0.96, -2.55), f(0.93, -2.55)]]
    tail = [[f(-0.58, -1.0), f(-0.55, -1.0), f(-0.7, -0.6), f(-0.73, -0.6)]]
    return [body, neck, head] + legs + horns + tail


def acacia(s, x, y, h, col):
    W = s.w
    polys = [[(x - 0.006 * W, y), (x + 0.008 * W, y), (x + 0.004 * W, y - h * 0.55), (x - 0.002 * W, y - h * 0.55)]]
    for bx, by in ((-0.07, -0.85), (0.06, -0.92), (0.0, -0.95), (-0.03, -0.8), (0.09, -0.8)):
        polys.append([(x - 0.002 * W, y - h * 0.5), (x + 0.004 * W, y - h * 0.5), (x + bx * W + 0.002 * W, y + by * h), (x + bx * W - 0.002 * W, y + by * h)])
    ells = []
    for _ in range(140):
        u = s.rng.uniform(-1, 1)
        ells.append((x + u * 0.16 * W + 0.01 * W, y - h * (0.9 + 0.07 * (1 - u * u)) + s.rng.normal(0, h * 0.025), s.rng.uniform(0.015, 0.04) * W, s.rng.uniform(0.008, 0.02) * W))
    m = np.maximum(s.poly_mask(polys), s.ellipse_mask(ells))
    s.blend(m, hx(col))


def birds(s, n, region, size, col, alpha=1.0):
    im = Image.new("L", (s.w * AA, s.h * AA), 0)
    d = ImageDraw.Draw(im)
    x0, y0, x1, y1 = region
    for _ in range(n):
        x = s.rng.uniform(x0, x1) * s.w * AA
        y = s.rng.uniform(y0, y1) * s.h * AA
        sz = s.rng.uniform(*size) * s.w * AA
        flap = s.rng.uniform(-0.4, 0.5)
        d.line([(x - sz, y - sz * flap), (x - sz * 0.4, y - sz * 0.15), (x, y), (x + sz * 0.4, y - sz * 0.15), (x + sz, y - sz * flap)], fill=255, width=max(2, int(sz * 0.18)), joint="curve")
    m = np.asarray(im.resize((s.w, s.h), Image.BOX), np.float32) / 255
    s.blend(m * alpha, hx(col))


def savanna(s, P):
    W, H = s.w, s.h
    s.grad(P["sky"])
    s.glow(P["sun"][0], P["sun"][1], 0.45, P["sun"][2], 0.4, 1.6)
    if P.get("disc"):
        s.blend(s.ellipse_mask([(P["sun"][0] * W, P["sun"][1] * H, P["disc"] * W, P["disc"] * W)], blur=1.5) * 0.9, hx("#ffe3b0"))
    s.clouds(P.get("cloud", "#d99a6a"), cover=0.6, s=0.35, bottom=0.55)
    far = s.ridge(0.72, 0.04, P["far"], P["haze"], 0.4, base=3, tex=0.1, light=0)
    s.ridge(0.76, 0.01, P["ground"], P["haze"], 0.15, base=2, tex=0.2, light=0)
    for (tx, th) in P.get("trees", []):
        acacia(s, tx * W, 0.765 * H, th * H, P["sil"])
    polys = []
    for gx, gs, fl in P.get("giraffes", []):
        polys += giraffe(gx * W, 0.775 * H, gs * H, fl)
    if polys:
        s.blend(s.poly_mask(polys), hx(P["sil"]))
    if P.get("birds"):
        birds(s, P["birds"], (0.15, 0.15, 0.6, 0.4), (0.004, 0.009), P["sil"], 0.85)
    s.fog(0.76, 0.03, P["haze"], 0.35)
    s.grass(0.775, 0.9, 3000, P["grass"], (0.01, 0.04), (1, 2), 0.3)
    s.grass(0.86, 1.05, 3000, P["grass"], (0.04, 0.1), (1.5, 3), 0.3)
    s.grass(0.98, 1.12, 70, P["grass"], (0.1, 0.2), (5, 9), 0.35, blur=4)
    s.finish(**P.get("fin", {}))


def city(s, P):
    W, H = s.w, s.h
    s.grad(P["sky"])
    s.glow(0.5, P["horizon"], 0.6, P["glow"], 0.35, 2.0)
    stars = (s.rng.random((H, W)) > 0.9993) * (s.Y < H * 0.45)
    s.add(gaussian_filter(stars.astype(np.float32), 0.7) * 2.5, hx("#ffffff"))
    hy = P["horizon"] * H
    x = -10
    buildings, wins_w, wins_c = [], [], []
    layers = [(0.32, 0.12, P["far"]), (0.22, 0.05, P["near"])]
    for li, (hmax, hmin, col) in enumerate(layers):
        x = -10
        polys = []
        while x < W + 10:
            bw = s.rng.uniform(0.03, 0.08) * W
            bh = s.rng.uniform(hmin, hmax) * H * (1.2 if abs(x / W - 0.55) < 0.15 else 1)
            polys.append([(x, hy), (x + bw, hy), (x + bw, hy - bh), (x, hy - bh)])
            if s.rng.random() < 0.3:
                polys.append([(x + bw * 0.45, hy - bh), (x + bw * 0.55, hy - bh), (x + bw * 0.5, hy - bh - 0.05 * H)])
            cols_n, rows_n = int(bw / 9), int(bh / 12)
            for i in range(cols_n):
                for j in range(rows_n):
                    if s.rng.random() < P.get("lit", 0.35):
                        wx = x + 4 + i * (bw - 8) / max(cols_n, 1)
                        wy = hy - bh + 6 + j * (bh - 8) / max(rows_n, 1)
                        poly = [(wx, wy), (wx + 4, wy), (wx + 4, wy + 6), (wx, wy + 6)]
                        (wins_w if s.rng.random() < 0.75 else wins_c).append(poly)
            x += bw + s.rng.uniform(0, 6)
        m = s.poly_mask(polys)
        s.blend(m, hx(col))
        buildings.append(m)
    mw, mc = s.poly_mask(wins_w), s.poly_mask(wins_c)
    s.add(mw * 0.85, hx(P["warm"]))
    s.add(mc * 0.7, hx(P["cool"]))
    s.add(gaussian_filter(mw, 8) * 1.2, hx(P["warm"]))
    s.add(gaussian_filter(mc, 10) * 1.0, hx(P["cool"]))
    for nx, ny, nc in P.get("neon", []):
        s.glow(nx, ny, 0.07, nc, 0.45)
        s.glow(nx, ny, 0.01, "#ffffff", 0.25)
    s.water(P["horizon"], P.get("tint", "#0b0f18"), dark=0.8, ripple=4, fade=0.4)
    if P.get("rain"):
        im = Image.new("L", (W, H), 0)
        d = ImageDraw.Draw(im)
        for _ in range(1600):
            rx, ry = s.rng.uniform(0, W), s.rng.uniform(0, H)
            L = s.rng.uniform(10, 30)
            d.line([(rx, ry), (rx - L * 0.15, ry + L)], fill=int(s.rng.uniform(40, 110)), width=1)
        s.add(np.asarray(im, np.float32) / 255 * 0.35, hx("#c8d4ff"))
    bok = [(s.rng.uniform(0, W), s.rng.uniform(0.82, 1.0) * H, r, r) for r in s.rng.uniform(8, 30, 18)]
    s.add(s.ellipse_mask(bok, blur=3) * 0.18, hx(P["warm"]))
    s.finish(**P.get("fin", {}))


PROFILE = [(0.02, 1.02), (0.08, 0.84), (0.27, 0.755), (0.37, 0.64), (0.335, 0.5), (0.34, 0.37), (0.4, 0.27),
           (0.5, 0.225), (0.6, 0.255), (0.655, 0.32), (0.665, 0.375), (0.66, 0.405), (0.705, 0.455),
           (0.672, 0.478), (0.678, 0.502), (0.664, 0.516), (0.674, 0.532), (0.66, 0.562), (0.63, 0.588),
           (0.575, 0.6), (0.58, 0.66), (0.6, 0.72), (0.74, 0.795), (0.92, 0.85), (1.02, 1.02)]


def portrait(s, P):
    W, H = s.w, s.h
    s.grad(P["bg"])
    s.blend(s.fbm2(2, 2, 5) * 0.35, hx(P["bg"][-1][1]))
    s.glow(P.get("bgx", 0.75), 0.4, 0.45, P["bg_glow"], 0.3)
    ang = np.deg2rad(P.get("tilt", 0))
    pts = []
    for x, y in PROFILE:
        if y < 0.7:  # rotate head about neck
            dx, dy = x - 0.5, y - 0.66
            x, y = 0.5 + dx * np.cos(ang) - dy * np.sin(ang), 0.66 + dx * np.sin(ang) + dy * np.cos(ang)
        pts.append((x, y))
    curve = catmull(pts, 10)
    flip = P.get("flip", False)
    ox = P.get("x", 0.0)
    poly = [(((1 - x) if flip else x) * W * 0.95 + ox * W, y * H) for x, y in curve]
    m = s.poly_mask([poly])
    dx = int(W * 0.012) * (-1 if not flip else 1)
    shifted = np.roll(m, dx, axis=1)
    rim = np.clip(m - shifted, 0, 1)
    spill = gaussian_filter(rim, W * 0.022)
    spill = spill / (spill.max() + 1e-6)
    skin = hx(P["dark"]) + hx(P["skin"]) * (spill ** 0.8)[..., None] * 1.1
    tex = s.fbm2(30, 30, 3)
    skin = skin * (0.94 + 0.12 * tex[..., None])
    # hair: soft ellipse over the back and crown of the head
    hxc = 0.43 if not flip else 0.57
    hc = ((hxc * W * 0.95 + ox * W), 0.355 * H)
    e = ((s.X - hc[0]) / (0.15 * W)) ** 2 + ((s.Y - hc[1]) / (0.13 * H)) ** 2
    hair = m * smooth((1 - e) * 4) * smooth((0.47 * H - s.Y) / (0.03 * H))
    strands = 0.9 + 0.2 * s.fbm2(3, 40, 2)
    skin = skin * (1 - hair[..., None] * 0.85) + hx(P["dark"]) * strands[..., None] * hair[..., None] * 0.85
    s.blend(m, skin)
    s.add(gaussian_filter(rim, 1.2) * 0.9, hx(P["rim"]))
    # clothing darker below neck
    cloth = m * smooth((s.Y / H - 0.72) / 0.04)
    s.blend(cloth * 0.85, hx(P["cloth"]) * (0.85 + 0.3 * s.fbm2(6, 6, 3))[..., None])
    s.finish(**P.get("fin", {}))


# ====================================================================== catalogue

L, PT = (1600, 1067), (1067, 1400)

CATALOG = {
    # ---- landscape
    "alpine-valley": (L, mountains, dict(sky=[(0, "#6f8396"), (0.45, "#b9c3c8"), (1, "#c9cdc8")], haze="#b7c0c3",
        clouds="#e7e9e6", layers=[
            dict(y=0.42, amp=0.28, col="#8a959d", haze=0.25, ridged=True, snow=(0.03, "#e9ecec"), light=2),
            dict(y=0.62, amp=0.34, col="#5f6a6c", haze=0.05, ridged=True, light=2.5, tex=0.35, vf=0.5),
            dict(y=0.82, amp=0.12, col="#2c3a2c", trees="#1f2b20", th=(0.03, 0.07), sp=5, fog=0.25),
            dict(y=1.0, amp=0.14, col="#1b241b", trees="#151d15", th=(0.06, 0.12), sp=8)],
        fin=dict(contrast=0.4))),
    "mirror-lake": (L, mountains, dict(sky=[(0, "#3e5468"), (0.5, "#d6b79a"), (0.62, "#e8c8a6")], haze="#c9b39f",
        sun=(0.62, 0.5, "#ffbf86"), clouds="#e9c6aa", cover=0.55, layers=[
            dict(y=0.36, amp=0.2, col="#6c6f80", haze=0.35, ridged=True, snow=(0.025, "#f1ddd0"), light=2),
            dict(y=0.5, amp=0.12, col="#3a4150", haze=0.15, light=1.5),
            dict(y=0.6, amp=0.04, col="#1d2526", trees="#161d1e", th=(0.02, 0.05), sp=4)],
        lake=0.6, tint="#2a3038", fin=dict(contrast=0.3, warm=0.02))),
    "storm-ridge": (L, mountains, dict(sky=[(0, "#2c3238"), (0.5, "#6d767b"), (1, "#a5aaa6")], haze="#8e9493",
        clouds="#b9bdba", cover=0.42, layers=[
            dict(y=0.5, amp=0.3, col="#4a5254", haze=0.3, ridged=True, light=2, snow=(0.02, "#c9ced0")),
            dict(y=0.72, amp=0.22, col="#2d3532", haze=0.08, light=2, vf=0.6, fog=0.4),
            dict(y=0.95, amp=0.1, col="#1c211c", trees="#141814", th=(0.04, 0.1), sp=6)],
        fin=dict(contrast=0.45, sat=0.8))),
    "blue-hour-peaks": (L, mountains, dict(sky=[(0, "#141d33"), (0.55, "#3f5476"), (0.75, "#8796ae")], haze="#6d7d98",
        layers=[
            dict(y=0.5, amp=0.35, col="#526181", haze=0.2, ridged=True, snow=(0.06, "#c6d3ea"), light=3),
            dict(y=0.7, amp=0.2, col="#27324a", haze=0.1, ridged=True, light=2),
            dict(y=0.9, amp=0.08, col="#121827", trees="#0d121d", th=(0.03, 0.08), sp=5)],
        fin=dict(contrast=0.35))),
    "golden-ridges": (L, mountains, dict(sky=[(0, "#4b4d57"), (0.45, "#d79d66"), (0.6, "#f0c48c")], haze="#d7a175",
        sun=(0.3, 0.46, "#ffb26b"), layers=[
            dict(y=0.48, amp=0.1, col="#9c7a6a", haze=0.5, base=2),
            dict(y=0.58, amp=0.12, col="#6c5550", haze=0.35, base=2),
            dict(y=0.7, amp=0.12, col="#3e3434", haze=0.18, base=3, fog=0.3),
            dict(y=0.85, amp=0.12, col="#1f1b1b", haze=0.0, base=3)],
        fin=dict(contrast=0.3, warm=0.02))),
    # ---- forest / coast / desert
    "fog-pines": (L, forest, dict(sky=[(0, "#9aa59e"), (1, "#d3d7d0")], fog="#cfd4cd", layers=[
        (0.55, 0.05, "#8a968e", (0.05, 0.1), 7, 0.7), (0.68, 0.05, "#5d6b62", (0.08, 0.16), 9, 0.6),
        (0.82, 0.05, "#34413a", (0.12, 0.24), 12, 0.5), (1.02, 0.05, "#18201b", (0.25, 0.45), 26, 0)],
        fin=dict(contrast=0.3, sat=0.85))),
    "dusk-forest": (L, forest, dict(sky=[(0, "#2a2735"), (0.6, "#b5735a"), (0.75, "#e3a271")], fog="#b78471",
        sun=(0.7, 0.62, "#ff9b5e"), layers=[
        (0.62, 0.04, "#6e4f50", (0.04, 0.09), 6, 0.6), (0.74, 0.05, "#3e2f35", (0.08, 0.15), 9, 0.45),
        (0.9, 0.05, "#1b1619", (0.15, 0.3), 16, 0.2)], fin=dict(contrast=0.35))),
    "silver-coast": (L, coast, dict(sky=[(0, "#7c8790"), (0.5, "#c3c7c6")], horizon=0.52, sea=("#9aa3a6", "#3c474c"),
        clouds="#dfe1de", rock="#3a3f40", haze="#a6adae", cliff=0.28, sun=(0.35, 0.38, "#f5efe0"), fin=dict(contrast=0.35, sat=0.75))),
    "sunset-coast": (L, coast, dict(sky=[(0, "#2d3446"), (0.42, "#d58a62"), (0.55, "#f2b27b")], horizon=0.56,
        sea=("#c08066", "#1f2430"), rock="#251f22", haze="#9a6f63", cliff=0.3, side=-1, xc=0.32, sun=(0.62, 0.5, "#ffb072"),
        fin=dict(contrast=0.35))),
    "golden-dunes": (L, dunes, dict(sky=[(0, "#6c88a6"), (0.5, "#e8c8a0")], sun=(0.8, 0.35, "#fff0d0"), layers=[
        (0.5, 0.08, "#d9a06a", "#9a6248"), (0.64, 0.12, "#e0a46b", "#8b5340"), (0.84, 0.18, "#e9b07a", "#7a4636")],
        fin=dict(contrast=0.35, warm=0.02))),
    "blue-dunes": (L, dunes, dict(sky=[(0, "#1f2a44"), (0.55, "#8a8fb0"), (0.62, "#d9a9a0")], sun=(0.2, 0.55, "#ffb7a0"), dir=-1, layers=[
        (0.56, 0.06, "#a58b9d", "#4d4766"), (0.7, 0.12, "#9b8098", "#3b3653"), (0.88, 0.16, "#8f7590", "#2b2742")],
        fin=dict(contrast=0.3))),
    # ---- architecture
    "meadow-house": ((1920, 1200), cabin, dict(sky=[(0, "#7d878d"), (0.6, "#c4c8c4")], haze="#aeb4b0",
        treeline="#4b5547", field="#6f7553", wall="#2a2a2b", roof="#46484a", grass=["#6c7a3e", "#8c9450", "#5b6b33", "#a9a265"],
        grass_fg=["#4f5c2a", "#6a7537"], fin=dict(contrast=0.35, sat=0.88))),
    "countryside-barn": (L, cabin, dict(sky=[(0, "#4d5e72"), (0.5, "#d6a578"), (0.66, "#efc596")], haze="#c7a283",
        sun=(0.18, 0.6, "#ffb46e"), treeline="#3f3a33", field="#8a7446", wall="#2b2522", roof="#3a312c",
        grass=["#b08d4f", "#c9a462", "#8e7038"], grass_fg=["#6e5a2f"], scale=0.55, x=0.05, lit="#ffbe7a",
        grass_y=0.71, fin=dict(contrast=0.3, warm=0.02))),
    "night-cabin": (L, cabin, dict(sky=[(0, "#0f1522"), (0.6, "#33415a")], haze="#3b4760", cloud="#4b5670",
        treeline="#141a22", field="#1d2420", wall="#1a1b1e", roof="#222326", grass=["#2c3a2a", "#3b4733"],
        grass_fg=["#1a2219"], scale=0.8, x=-0.05, lit="#ffc27d", fin=dict(contrast=0.3))),
    "concrete-cantilever": (L, brutalist, dict(sky=[(0, "#6f8fae"), (1, "#c9d4da")], ground="#5b5b55",
        cols=("#a7a49c", "#6f6d68", "#c9c6bd"), boxes=[(0.22, 0.52, 0.42, 0.34, 0.1), (0.38, 0.3, 0.38, 0.22, 0.1), (0.3, 0.14, 0.3, 0.16, 0.1)],
        fin=dict(contrast=0.4, sat=0.8))),
    "warm-brutalism": (L, brutalist, dict(sky=[(0, "#d1a37c"), (1, "#efd9c0")], ground="#6b5a4c",
        cols=("#b09a86", "#7b6a5c", "#d4c0aa"), boxes=[(0.08, 0.4, 0.3, 0.46, 0.08), (0.42, 0.56, 0.5, 0.3, 0.12), (0.5, 0.3, 0.22, 0.26, 0.08)],
        fin=dict(contrast=0.35, warm=0.02))),
    "facade-grid": (PT, facade, dict(sky=[(0, "#5f86b0"), (1, "#c8d8e6")], glass="#7d9cbc", glass_dark="#1c2a38", quads=[
        (((-0.15, 1.02), (0.62, 1.02), (0.52, 0.0), (0.12, 0.08)), 7, 22, "#e6e4df"),
        (((0.55, 1.02), (1.2, 1.02), (0.92, 0.12), (0.62, 0.02)), 5, 18, "#cfccc4")], fin=dict(contrast=0.35, sat=0.85))),
    "facade-dusk": (PT, facade, dict(sky=[(0, "#2a3150"), (1, "#d48f6f")], glass="#c58a6e", glass_dark="#1a1b26", quads=[
        (((-0.2, 1.02), (0.8, 1.02), (0.62, 0.06), (0.2, 0.0)), 9, 26, "#3a3c44")], fin=dict(contrast=0.3))),
    # ---- travel / culture
    "pagoda-dusk": (PT, pagoda, dict(sky=[(0, "#1b2340"), (0.45, "#7a5a78"), (0.72, "#e69a74"), (1, "#f2b989")],
        sun=(0.5, 0.75, "#ff9f6a"), far="#4a3a4c", near="#151218", haze="#c48a7a", build="#17131a", cx=0.5, base=0.9,
        lamp="#ffb36b", fin=dict(contrast=0.3))),
    "pagoda-mist": (PT, pagoda, dict(sky=[(0, "#8e9a9e"), (1, "#dfe0d8")], sun=(0.3, 0.3, "#fff6e0"), cloud="#ffffff",
        far="#7d8a86", near="#2b332f", haze="#d9ddd6", build="#3a3534", cx=0.56, base=0.88, scale=0.95, fin=dict(contrast=0.3, sat=0.75))),
    # ---- wildlife
    "savanna-giraffes": (L, savanna, dict(sky=[(0, "#3d3a4c"), (0.5, "#d88a55"), (0.72, "#f6c27e")], sun=(0.64, 0.66, "#ffad5c"),
        disc=0.035, far="#7e5243", ground="#6d4c33", haze="#e09a68", sil="#1a1210", grass=["#7a5a2c", "#9b7537", "#5e4421"],
        trees=[(0.26, 0.24)], giraffes=[(0.52, 0.06, 1), (0.6, 0.05, -1), (0.75, 0.035, 1)], birds=14, fin=dict(contrast=0.35))),
    "savanna-morning": (L, savanna, dict(sky=[(0, "#8a9aa4"), (0.6, "#e5d3b4")], sun=(0.2, 0.55, "#fff1d0"),
        far="#a0947a", ground="#9b8a62", haze="#e2d5bc", sil="#3a3226", grass=["#b49b5e", "#c9b277", "#8f7a45"],
        trees=[(0.7, 0.3), (0.9, 0.16)], giraffes=[(0.36, 0.045, 1)], cloud="#f3ece0", fin=dict(contrast=0.3, sat=0.8))),
    "birds-lake": (L, mountains, dict(sky=[(0, "#9fb0b7"), (0.6, "#e4e2d8")], haze="#d6d8d0", layers=[
        dict(y=0.58, amp=0.06, col="#9aa39e", haze=0.4, base=2),
        dict(y=0.62, amp=0.03, col="#5d6b63", trees="#4f5c55", th=(0.02, 0.04), sp=4)], lake=0.62, tint="#a9b3b2", birds=22,
        fin=dict(contrast=0.25, sat=0.7))),
    # ---- street
    "city-blue": (L, city, dict(sky=[(0, "#060a16"), (0.6, "#1c2848"), (0.7, "#3b3f60")], horizon=0.68, glow="#5c5f8c",
        far="#121a2d", near="#0a0f1b", warm="#ffbf73", cool="#9cc8ff", lit=0.2, fin=dict(contrast=0.3, vignette=0.6))),
    "city-amber": (L, city, dict(sky=[(0, "#0f0d14"), (0.6, "#3a2a2c"), (0.72, "#7a4d3a")], horizon=0.7, glow="#a7623d",
        far="#1d1718", near="#0f0c0e", warm="#ffb35c", cool="#ffd9a0", lit=0.22, tint="#1a1210", fin=dict(contrast=0.3, vignette=0.6))),
    "neon-rain": (L, city, dict(sky=[(0, "#090613"), (0.6, "#241640"), (0.72, "#46205a")], horizon=0.66, glow="#a03c8c",
        far="#170f26", near="#0c0816", warm="#ffb0d8", cool="#7fe6ff", lit=0.16, rain=True, tint="#120a1e",
        neon=[(0.22, 0.52, "#c2337f"), (0.71, 0.5, "#2aa7c4")], fin=dict(contrast=0.3, vignette=0.6, sat=0.75))),
    # ---- portraits
    "portrait-amber": (PT, portrait, dict(bg=[(0, "#2a211c"), (1, "#14100e")], bg_glow="#6b4a32", dark="#120e0c",
        skin="#d08d62", rim="#ffc58f", cloth="#1b1715", fin=dict(contrast=0.3))),
    "portrait-sage": (PT, portrait, dict(bg=[(0, "#5b6656"), (1, "#2c3329")], bg_glow="#8b9879", dark="#1a1c18",
        skin="#b98a6c", rim="#f2dcc0", cloth="#22261f", flip=True, tilt=-8, bgx=0.3, fin=dict(contrast=0.3, sat=0.85))),
    "portrait-sky": (PT, portrait, dict(bg=[(0, "#6f8ea6"), (1, "#c5d1d6")], bg_glow="#e8eef0", dark="#1d1b1b",
        skin="#a0705a", rim="#ffffff", cloth="#262423", tilt=-14, x=-0.03, fin=dict(contrast=0.35, sat=0.85))),
    "portrait-noir": (PT, portrait, dict(bg=[(0, "#1c1c1f"), (1, "#0b0b0c")], bg_glow="#3a3a40", dark="#0b0b0c",
        skin="#9a9a9a", rim="#f3f3f3", cloth="#0d0d0e", flip=True, fin=dict(contrast=0.45, sat=0.0))),
    "portrait-clay": (PT, portrait, dict(bg=[(0, "#9b6e55"), (1, "#5a3a2c")], bg_glow="#d9a07c", dark="#24140f",
        skin="#c98a66", rim="#ffd7b5", cloth="#2e1d17", tilt=6, fin=dict(contrast=0.3))),
}


def render(name):
    (w, h), fn, params = CATALOG[name]
    seed = abs(hash(name)) % (2 ** 31)
    seed = sum(ord(c) * (i + 1) for i, c in enumerate(name))
    s = Scene(w, h, seed)
    fn(s, params)
    arr = (s.img * 255 + 0.5).astype(np.uint8)
    im = Image.fromarray(arr)
    im.save(os.path.join(OUT, f"{name}.jpg"), quality=84, optimize=True, progressive=True)
    sm = im.resize((w // 2, h // 2), Image.LANCZOS)
    sm.save(os.path.join(OUT, f"{name}-sm.jpg"), quality=80, optimize=True, progressive=True)
    tiny = im.resize((1, 1), Image.BOX).getpixel((0, 0))
    return {"w": w, "h": h, "c": "#%02x%02x%02x" % tiny}


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    names = sys.argv[1:] or list(CATALOG)
    man_path = os.path.join(OUT, "manifest.json")
    man = json.load(open(man_path)) if os.path.exists(man_path) else {}
    for n in names:
        man[n] = render(n)
        print("rendered", n, man[n], flush=True)
    json.dump(man, open(man_path, "w"), indent=1)

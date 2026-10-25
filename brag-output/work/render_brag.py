#!/usr/bin/env python3
"""Compose habit+ usage-demo video from captured UI screenshots."""

from __future__ import annotations

import math
import subprocess
import wave
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent
W, H = 1080, 1920  # 9:16 vertical
FPS = 30
PHONE_W, PHONE_H = 390, 844
PHONE_SCALE = 1.82  # leave room for caption ↔ phone gap

BG = (12, 12, 14)
ACCENT = (255, 140, 40)
FG = (245, 245, 245)
MUTED = (160, 160, 165)


def expand_glob(pattern: str) -> list[str]:
    files = sorted(ROOT.glob(pattern))
    if not files:
        raise SystemExit(f"no files for {pattern}")
    return [f.name for f in files]


BEATS: list[tuple[str | list[str], float, str]] = [
    ("01-empty-home.png", 2.6, "habit+"),
    ("02-form-empty.png", 1.3, "Создай привычку"),
    (expand_glob("type-name-*.png"), 1.5, "Создай привычку"),
    (expand_glob("type-desc-*.png"), 2.0, "Создай привычку"),
    ("05-form-color.png", 1.8, "Имя · описание · цвет"),
    ("06-home-one-habit.png", 1.8, "Готово"),
    ("07-list-view.png", 1.5, "Отметь дни"),
    ("08-day-one.png", 1.2, "Отметь дни"),
    ("09-day-two.png", 1.2, "Отметь дни"),
    ("10-days-filled.png", 1.8, "Серия растёт"),
    ("11-add-again.png", 1.5, "Или из шаблона"),
    ("12-templates-open.png", 2.8, "Готовые привычки"),
    ("13-template-filled.png", 1.8, "Прогулка с семьей"),
    ("15-template-days.png", 2.0, "Ещё пара дней"),
    ("16-view-grid.png", 2.2, "Карточки"),
    ("17-view-list.png", 2.2, "Список"),
    ("18-view-cols.png", 2.4, "Колонки"),
    ("19-outro.png", 3.5, "habit+"),
]


def flatten_beats() -> list[tuple[str, float, str]]:
    out: list[tuple[str, float, str]] = []
    for shot, dur, caption in BEATS:
        if isinstance(shot, list):
            each = dur / len(shot)
            for s in shot:
                out.append((s, each, caption))
        else:
            out.append((shot, dur, caption))
    return out


SCENES = flatten_beats()


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def rounded_phone(shot: Image.Image, scale: float, radius: int = 40) -> Image.Image:
    phone = shot.convert("RGBA").resize(
        (max(2, int(PHONE_W * scale)), max(2, int(PHONE_H * scale))),
        Image.Resampling.LANCZOS,
    )
    pw, ph = phone.size
    mask = Image.new("L", (pw, ph), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, pw - 1, ph - 1), radius=radius, fill=255)
    phone.putalpha(mask)

    bezel = Image.new("RGBA", (pw + 16, ph + 16), (0, 0, 0, 0))
    bd = ImageDraw.Draw(bezel)
    bd.rounded_rectangle((0, 0, pw + 15, ph + 15), radius=radius + 6, fill=(28, 28, 30, 255))
    bezel.paste(phone, (8, 8), phone)
    return bezel


def make_background() -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for i, alpha in enumerate((30, 18, 10, 5)):
        pad = 60 + i * 100
        gd.ellipse(
            (W // 2 - 320 - pad, H // 2 - 520 - pad, W // 2 + 320 + pad, H // 2 + 520 + pad),
            fill=(255, 120, 40, alpha),
        )
    glow = glow.filter(ImageFilter.GaussianBlur(70))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    rng = np.random.default_rng(7)
    noise = rng.integers(0, 18, (H, W, 1), dtype=np.uint8)
    base = np.array(img, dtype=np.int16)
    base = np.clip(base + noise - 9, 0, 255).astype(np.uint8)
    return Image.fromarray(base, "RGB")


def compose_frame(
    bg: Image.Image,
    shot: Image.Image,
    caption: str,
    total_beats: int,
    beat_i: int,
) -> Image.Image:
    """Static frame: phone + caption + dots (no Ken Burns / fade)."""
    phone = rounded_phone(shot, scale=PHONE_SCALE, radius=52)
    pw, ph = phone.size

    ox = W // 2 - pw // 2
    oy = 230  # slightly higher phone, still clear of caption
    max_oy = H - 90 - ph
    if oy > max_oy:
        oy = max(180, max_oy)

    frame = bg.copy().convert("RGBA")
    shadow = Image.new("RGBA", (pw + 48, ph + 48), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((22, 28, pw + 22, ph + 32), radius=58, fill=(0, 0, 0, 150))
    shadow = shadow.filter(ImageFilter.GaussianBlur(24))
    frame.paste(shadow, (ox - 22, oy - 14), shadow)
    frame.paste(phone, (ox, oy), phone)

    draw = ImageDraw.Draw(frame)
    title_font = load_font(64, bold=True)
    small_font = load_font(28, bold=False)

    if caption == "habit+":
        brand = "habit"
        tw = draw.textlength(brand, font=title_font)
        plus_w = draw.textlength("+", font=title_font)
        cx = (W - tw - plus_w) / 2
        cy = 56
        draw.text((cx, cy), brand, font=title_font, fill=FG)
        draw.text((cx + tw, cy), "+", font=title_font, fill=ACCENT)
        sub = "привычки без лишнего"
        sw = draw.textlength(sub, font=small_font)
        draw.text(((W - sw) / 2, cy + 72), sub, font=small_font, fill=MUTED)
    else:
        tw = draw.textlength(caption, font=title_font)
        draw.text(((W - tw) / 2, 64), caption, font=title_font, fill=FG)

    dot_y = H - 64
    gap = 20
    start_x = W // 2 - (total_beats * gap) // 2
    for i in range(total_beats):
        r = 5
        x = start_x + i * gap
        fill = ACCENT if i == beat_i else (60, 60, 64)
        draw.ellipse((x - r, dot_y - r, x + r, dot_y + r), fill=fill)

    return frame.convert("RGB")


# ---------- music ----------

def midi_to_hz(m: float) -> float:
    return 440.0 * (2.0 ** ((m - 69.0) / 12.0))


def adsr(n: int, sr: int, a: float, d: float, s: float, r: float) -> np.ndarray:
    env = np.zeros(n, dtype=np.float64)
    na, nd, nr = int(a * sr), int(d * sr), int(r * sr)
    ns = max(0, n - na - nd - nr)
    i = 0
    if na:
        env[i : i + na] = np.linspace(0, 1, na, endpoint=False)
        i += na
    if nd:
        env[i : i + nd] = np.linspace(1, s, nd, endpoint=False)
        i += nd
    if ns:
        env[i : i + ns] = s
        i += ns
    if nr and i < n:
        end = min(n, i + nr)
        env[i:end] = np.linspace(env[i - 1] if i else s, 0, end - i)
    return env


def tone(freq: float, length: int, sr: int, wave: str = "sine") -> np.ndarray:
    t = np.arange(length) / sr
    if wave == "sine":
        return np.sin(2 * np.pi * freq * t)
    if wave == "triangle":
        return 2 * np.abs(2 * ((t * freq) % 1) - 1) - 1
    if wave == "square":
        return np.sign(np.sin(2 * np.pi * freq * t))
    # soft saw
    return 2 * ((t * freq) % 1) - 1


def place(buf: np.ndarray, start: int, signal: np.ndarray, gain: float = 1.0) -> None:
    if start >= len(buf) or start < 0:
        return
    end = min(len(buf), start + len(signal))
    buf[start:end] += gain * signal[: end - start]


def write_wav(path: Path, duration: float, type_clicks: list[float]) -> None:
    """Sectional score: intro pad → groove → lift → resolve. Not a flat loop."""
    sr = 44100
    n = int(sr * duration)
    audio = np.zeros(n, dtype=np.float64)
    rng = np.random.default_rng(42)

    bpm = 98.0
    beat = 60.0 / bpm
    bar = beat * 4

    # chord palette (MIDI): Am, F, C, G, Dm, Em — arranged in evolving progression
    # sections use different sequences
    chords = {
        "Am": [57, 60, 64],  # A3 C4 E4
        "F": [53, 57, 60],  # F3 A3 C4
        "C": [48, 52, 55, 60],  # C3 E3 G3 C4
        "G": [55, 59, 62],  # G3 B3 D4
        "Dm": [50, 53, 57],  # D3 F3 A3
        "Em": [52, 55, 59],  # E3 G3 B3
    }

    # time → section
    # 0–22%: ambient intro
    # 22–55%: groove + melody
    # 55–82%: lift (busier)
    # 82–100%: resolve / outro
    def section_at(t: float) -> str:
        p = t / max(duration, 0.01)
        if p < 0.22:
            return "intro"
        if p < 0.55:
            return "groove"
        if p < 0.82:
            return "lift"
        return "outro"

    progressions = {
        "intro": ["Am", "F", "Am", "F"],
        "groove": ["Am", "F", "C", "G"],
        "lift": ["Dm", "Am", "F", "G", "Am", "F", "C", "G"],
        "outro": ["F", "C", "G", "Am"],
    }

    # melody motifs (MIDI relative to chord root-ish free phrases)
    motifs = {
        "intro": [72, 74, 76, None, 74, 72, None, None],
        "groove": [76, 79, 77, 76, 74, 72, 74, 76, None, 79, 77, 76, 72, None, 74, None],
        "lift": [79, 81, 79, 77, 76, 74, 76, 79, 81, None, 79, 76, 74, 72, 74, 76],
        "outro": [76, 74, 72, None, 71, 72, None, None, 69, 72, 76, None, 74, 72, None, None],
    }

    # pads + bass per bar
    t = 0.0
    bar_i = 0
    while t < duration:
        sec = section_at(t)
        prog = progressions[sec]
        chord_name = prog[bar_i % len(prog)]
        notes = chords[chord_name]
        start = int(t * sr)
        bar_len = int(bar * sr)
        # pad: soft triangles with slow attack
        pad_env = adsr(bar_len, sr, 0.35, 0.2, 0.55, 0.45)
        for ni, m in enumerate(notes):
            freq = midi_to_hz(m)
            sig = tone(freq, bar_len, sr, "triangle")
            # slight detune layer
            sig2 = tone(freq * 1.003, bar_len, sr, "sine")
            gain = 0.045 if sec == "intro" else (0.055 if sec != "lift" else 0.065)
            place(audio, start, (sig * 0.7 + sig2 * 0.3) * pad_env, gain)

        # bass root movement
        root = notes[0] - 12
        bass_env = adsr(bar_len, sr, 0.02, 0.1, 0.7, 0.25)
        bass = tone(midi_to_hz(root), bar_len, sr, "sine")
        # add sub pulse on groove/lift
        bass_g = {"intro": 0.08, "groove": 0.14, "lift": 0.16, "outro": 0.1}[sec]
        place(audio, start, bass * bass_env, bass_g)

        # walking bass offbeats in lift
        if sec == "lift":
            for k, step in enumerate([0, 2, 3, 5]):
                bs = start + int((k + 0.5) * beat * sr)
                bl = int(0.22 * sr)
                env = adsr(bl, sr, 0.005, 0.05, 0.4, 0.1)
                place(audio, bs, tone(midi_to_hz(root + step), bl, sr, "sine") * env, 0.07)

        t += bar
        bar_i += 1

    # drums — pattern changes by section
    beat_i = 0
    while beat_i * beat < duration:
        t0 = beat_i * beat
        sec = section_at(t0)
        start = int(t0 * sr)
        pos_in_bar = beat_i % 4

        do_kick = False
        if sec == "intro":
            do_kick = pos_in_bar == 0 and (beat_i // 4) % 2 == 0
        elif sec == "groove":
            do_kick = pos_in_bar in (0, 2) or (pos_in_bar == 3 and beat_i % 8 == 7)
        elif sec == "lift":
            do_kick = pos_in_bar in (0, 2) or beat_i % 8 == 3
            # syncopated pickup into next bar
            if beat_i % 8 == 5:
                place(
                    audio,
                    start + int(0.5 * beat * sr),
                    np.sin(2 * np.pi * (110 * np.exp(-np.arange(int(0.1 * sr)) / sr * 22)) * (np.arange(int(0.1 * sr)) / sr))
                    * np.exp(-np.arange(int(0.1 * sr)) / sr * 28),
                    0.35,
                )
        else:
            do_kick = pos_in_bar == 0

        if do_kick:
            kl = int(0.14 * sr)
            kt = np.arange(kl) / sr
            kick = np.sin(2 * np.pi * (95 * np.exp(-kt * 20)) * kt) * np.exp(-kt * 26)
            place(audio, start, kick, 0.55 if sec != "intro" else 0.35)

        # snare / clap on 2 and 4 in groove/lift
        if sec in ("groove", "lift") and pos_in_bar in (1, 3):
            sl = int(0.08 * sr)
            st = np.arange(sl) / sr
            noise = rng.uniform(-1, 1, sl)
            snare = noise * np.exp(-st * 55)
            snare += 0.3 * np.sin(2 * np.pi * 180 * st) * np.exp(-st * 40)
            place(audio, start, snare, 0.18 if sec == "groove" else 0.24)

        # hats: 8ths in groove, 16ths in lift, sparse in intro
        if sec == "intro" and pos_in_bar % 2 == 0:
            hl = int(0.025 * sr)
            ht = np.arange(hl) / sr
            place(audio, start, rng.uniform(-1, 1, hl) * np.exp(-ht * 90), 0.04)
        elif sec == "groove":
            for off in (0.0, 0.5):
                hs = start + int(off * beat * sr)
                hl = int(0.02 * sr)
                ht = np.arange(hl) / sr
                place(audio, hs, rng.uniform(-1, 1, hl) * np.exp(-ht * 100), 0.055 if off == 0 else 0.03)
        elif sec == "lift":
            for off in (0.0, 0.25, 0.5, 0.75):
                hs = start + int(off * beat * sr)
                hl = int(0.015 * sr)
                ht = np.arange(hl) / sr
                g = 0.06 if off in (0.0, 0.5) else 0.035
                place(audio, hs, rng.uniform(-1, 1, hl) * np.exp(-ht * 120), g)
        else:
            if pos_in_bar in (0, 2):
                hl = int(0.02 * sr)
                ht = np.arange(hl) / sr
                place(audio, start, rng.uniform(-1, 1, hl) * np.exp(-ht * 100), 0.035)

        beat_i += 1

    # melodic lead — different motif per section, with rests
    step = beat / 2  # 8th notes
    step_i = 0
    while step_i * step < duration:
        t0 = step_i * step
        sec = section_at(t0)
        motif = motifs[sec]
        note = motif[step_i % len(motif)]
        if note is not None:
            start = int(t0 * sr)
            length = int(0.28 * sr) if sec != "lift" else int(0.2 * sr)
            env = adsr(length, sr, 0.01, 0.06, 0.45, 0.14)
            # soft square + sine = soft pluck
            sig = 0.55 * tone(midi_to_hz(note), length, sr, "sine")
            sig += 0.25 * tone(midi_to_hz(note), length, sr, "triangle")
            # octave sparkle occasionally
            if sec == "lift" and step_i % 7 == 0:
                sig += 0.12 * tone(midi_to_hz(note + 12), length, sr, "sine")
            g = {"intro": 0.07, "groove": 0.11, "lift": 0.13, "outro": 0.09}[sec]
            place(audio, start, sig * env, g)
        step_i += 1

    # rising filter-ish noise riser into lift
    lift_t = duration * 0.55
    rs = int((lift_t - 1.2) * sr)
    if rs > 0:
        rl = int(1.2 * sr)
        rt = np.arange(rl) / sr
        riser = rng.uniform(-1, 1, rl) * (rt / 1.2) ** 2
        # band-ish by multiplying sine sweep
        riser *= np.sin(2 * np.pi * (200 + 1200 * (rt / 1.2)) * rt)
        place(audio, rs, riser * np.linspace(0.2, 1, rl), 0.06)

    # typing clicks
    for j, te in enumerate(type_clicks):
        idx = int(te * sr)
        if idx < 0 or idx >= n - 400:
            continue
        clen = int(0.014 * sr)
        end = min(n, idx + clen)
        ct = np.arange(end - idx) / sr
        click = rng.uniform(-1, 1, end - idx)
        audio[idx:end] += 0.05 * np.exp(-ct * 180) * click
        audio[idx:end] += 0.03 * np.exp(-ct * 140) * np.sin(2 * np.pi * 2100 * ct)

    # scene whooshes at beat boundaries
    cum = 0.0
    for _, dur, _ in BEATS:
        idx = int(cum * sr)
        if 0 < idx < n - 1500:
            wl = 700
            ww = np.linspace(0, 1, wl)
            whoosh = ww * np.sin(2 * np.pi * np.linspace(480, 160, wl) * np.arange(wl) / sr)
            place(audio, idx, whoosh, 0.055)
        cum += dur

    # master: soft compression-ish + fade
    fade_in = int(0.4 * sr)
    fade_out = int(1.6 * sr)
    audio[:fade_in] *= np.linspace(0, 1, fade_in)
    audio[-fade_out:] *= np.linspace(1, 0, fade_out)
    # gentle limiter
    peak = np.max(np.abs(audio)) + 1e-9
    audio = audio / peak * 0.92
    # tame highs: mix with moving average
    k = 9
    ker = np.ones(k) / k
    lp = np.convolve(audio, ker, mode="same")
    audio = 0.78 * audio + 0.22 * lp
    audio = np.clip(audio, -0.98, 0.98)
    pcm = (audio * 32767).astype(np.int16)

    with wave.open(str(path), "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(pcm.tobytes())


def main() -> None:
    frames_dir = ROOT / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    for old in frames_dir.glob("*.jpg"):
        old.unlink()

    bg = make_background()
    total_beats = len(BEATS)
    scenes = SCENES

    beat_for_scene: list[int] = []
    bi = 0
    for shot, _, _ in BEATS:
        n = len(shot) if isinstance(shot, list) else 1
        beat_for_scene.extend([bi] * n)
        bi += 1

    # group consecutive same-shot holds into animated spans
    # rebuild as list of (name, dur, caption, beat_i) already in scenes

    type_clicks: list[float] = []
    t_cursor = 0.0
    poster_path: Path | None = None
    frame_i = 0

    shot_cache: dict[str, Image.Image] = {}
    composed_cache: dict[str, Image.Image] = {}

    for si, (name, dur, caption) in enumerate(scenes):
        src = ROOT / name
        if not src.exists():
            raise SystemExit(f"missing: {src}")
        if name not in shot_cache:
            shot_cache[name] = Image.open(src).convert("RGB")

        beat_i = beat_for_scene[si]
        is_typing = name.startswith("type-")
        if is_typing:
            type_clicks.append(t_cursor)

        cache_key = f"{name}|{caption}|{beat_i}"
        if cache_key not in composed_cache:
            composed_cache[cache_key] = compose_frame(
                bg=bg,
                shot=shot_cache[name],
                caption=caption,
                total_beats=total_beats,
                beat_i=beat_i,
            )
        frame = composed_cache[cache_key]

        n_frames = max(1, int(round(dur * FPS)))
        if is_typing:
            n_frames = max(n_frames, 3)
        span = n_frames / FPS

        for f in range(n_frames):
            out_path = frames_dir / f"frame_{frame_i:05d}.jpg"
            frame.save(out_path, quality=90, optimize=True)
            if name == "16-view-grid.png" and f == n_frames // 2:
                poster_path = out_path
            frame_i += 1

        t_cursor += span
        if si % 8 == 0:
            print(f"… {si}/{len(scenes)} {name}")

    actual_dur = frame_i / FPS
    print(f"frames={frame_i} dur={actual_dur:.1f}s (silent)")

    raw_mp4 = ROOT / "brag_raw.mp4"
    final_mp4 = OUT / "brag.mp4"
    poster = OUT / "brag.jpg"

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-framerate",
            str(FPS),
            "-i",
            str(frames_dir / "frame_%05d.jpg"),
            "-an",
            "-vf",
            "format=yuv420p",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "18",
            "-movflags",
            "+faststart",
            str(raw_mp4),
        ],
        check=True,
    )

    if poster_path and poster_path.exists():
        Image.open(poster_path).save(poster, quality=93)
    else:
        Image.open(frames_dir / f"frame_{frame_i - 1:05d}.jpg").save(poster, quality=93)

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(raw_mp4),
            "-i",
            str(poster),
            "-filter_complex",
            f"[1:v]scale={W}:{H},format=yuv420p[p];"
            f"[0:v][p]overlay=eof_action=pass:enable='eq(n,0)'[v]",
            "-map",
            "[v]",
            "-an",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "18",
            "-movflags",
            "+faststart",
            str(final_mp4),
        ],
        check=True,
    )

    (OUT / "share-copy.txt").write_text(
        "habit+ — привычки без лишнего.\n"
        "Создай вручную или из шаблона, отметь дни, переключай виды: карточки, список, колонки.\n",
        encoding="utf-8",
    )
    print(f"done: {final_mp4}")


if __name__ == "__main__":
    main()

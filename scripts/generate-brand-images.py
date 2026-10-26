# OG görseli (public/og.jpg) ve favicon setini (src/app/favicon.ico, icon.png,
# apple-icon.png) üretir. Renkler src/app/globals.css içindeki tokenlardan
# okunur; palet değişirse betik yeniden çalıştırılır:
#
#   python3 scripts/generate-brand-images.py
#
# Gereksinim: Pillow ve macOS Georgia yazı tipi.
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
CSS = (ROOT / "src/app/globals.css").read_text(encoding="utf-8")
FONT = "/System/Library/Fonts/Supplemental/Georgia.ttf"
SCALE = 4  # Küçük boyutlar büyük çizilip küçültülür (kenar yumuşatma).


def token(name: str) -> str:
    match = re.search(rf"--{name}:\s*(#[0-9A-Fa-f]{{6}})", CSS)
    if not match:
        raise SystemExit(f"--{name} globals.css içinde bulunamadı")
    return match.group(1)


PRIMARY = token("color-primary")
CREAM = token("color-on-dark")
GOLD = token("color-accent")


def font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT, size)


def og_image() -> None:
    w, h = 1200, 630
    img = Image.new("RGB", (w * 2, h * 2), PRIMARY)
    draw = ImageDraw.Draw(img)
    cx = w  # 2x tuval ortası

    title = font(240)
    sub = font(76)
    tb = draw.textbbox((0, 0), "Ozon Merkezi", font=title, anchor="ls")
    sb = draw.textbbox((0, 0), "Prof. Dr. Muharrem Kıskaç", font=sub, anchor="ls")
    title_h = tb[3] - tb[1]
    gap_line = 70
    block = title_h + gap_line * 2 + (sb[3] - sb[1])
    top = (h * 2 - block) // 2

    baseline = top - tb[1]
    draw.text((cx, baseline), "Ozon Merkezi", font=title, fill=CREAM, anchor="ms")
    line_y = baseline + tb[3] + gap_line
    draw.line([(cx - 120, line_y), (cx + 120, line_y)], fill=GOLD, width=4)
    sub_base = line_y + gap_line - sb[1]
    draw.text(
        (cx, sub_base),
        "Prof. Dr. Muharrem Kıskaç",
        font=sub,
        fill=CREAM,
        anchor="ms",
    )
    img = img.resize((w, h), Image.LANCZOS)
    img.save(ROOT / "public/og.jpg", "JPEG", quality=88, optimize=True, progressive=True)


def monogram(size: int, rounded: bool) -> Image.Image:
    s = size * SCALE
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    if rounded:
        draw.rounded_rectangle([0, 0, s - 1, s - 1], radius=round(s * 0.22), fill=PRIMARY)
    else:
        draw.rectangle([0, 0, s, s], fill=PRIMARY)

    # Küçük boyutlarda harf daha büyük ve çizgi daha kalın olur (okunurluk).
    small = size <= 32
    letter = font(round(s * (0.66 if small else 0.58)))
    bbox = draw.textbbox((0, 0), "O", font=letter)
    lw, lh = bbox[2] - bbox[0], bbox[3] - bbox[1]
    line_h = max(round(s * (0.05 if small else 0.028)), SCALE)
    gap = round(s * (0.06 if small else 0.07))
    total = lh + gap + line_h
    x = (s - lw) / 2 - bbox[0]
    y = (s - total) / 2 - bbox[1]
    draw.text((x, y), "O", font=letter, fill=CREAM)
    line_w = round(lw * (0.9 if small else 0.7))
    ly = (s - total) / 2 + lh + gap
    draw.rectangle([(s - line_w) / 2, ly, (s + line_w) / 2, ly + line_h], fill=GOLD)
    return img.resize((size, size), Image.LANCZOS)


def icons() -> None:
    app = ROOT / "src/app"
    monogram(192, rounded=True).save(app / "icon.png", optimize=True)
    apple = monogram(180, rounded=False).convert("RGB")
    apple.save(app / "apple-icon.png", optimize=True)
    sizes = [16, 32, 48]
    frames = [monogram(n, rounded=True) for n in sizes]
    frames[-1].save(
        app / "favicon.ico",
        format="ICO",
        sizes=[(n, n) for n in sizes],
        append_images=frames[:-1],
    )


if __name__ == "__main__":
    og_image()
    icons()
    print("og.jpg, favicon.ico, icon.png, apple-icon.png üretildi")

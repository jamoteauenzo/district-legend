# Convertit les portraits PNG (x2) de la DA en WebP pour le jeu.
# Usage : python3 scripts/build-portraits.py
from pathlib import Path
from PIL import Image

src = Path('DA/assets/png/portraits/x2')
dst = Path('public/assets/portraits')
dst.mkdir(parents=True, exist_ok=True)
total = 0
for f in sorted(src.glob('*.png')):
    out = dst / (f.stem + '.webp')
    Image.open(f).save(out, 'WEBP', quality=82, method=6)
    total += out.stat().st_size
print(f'{len(list(src.glob("*.png")))} portraits, {total / 1e6:.1f} Mo')

"""Regenerate Tauri desktop icons from the new brand mark (logo512.png).

Platform rules from #7646:
- Windows: full-bleed ICO
- macOS: 824/1024 Apple icon grid (body ~80.5% of canvas)
- Linux: ~10% margin (~80% body); 16/32 use 87.5% (KDE small-size exception)
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "frontend/editor/src/core/assets/brand/modern-logo/logo512.png"
ICONS = ROOT / "frontend/editor/src-tauri/icons"
MODERN = ROOT / "frontend/editor/src/core/assets/brand/modern-logo"


def inset(source: Image.Image, canvas: int, body: int) -> Image.Image:
    """Center body×body artwork on a transparent canvas×canvas square."""
    out = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    scaled = source.resize((body, body), Image.Resampling.LANCZOS)
    offset = (canvas - body) // 2
    out.paste(scaled, (offset, offset), scaled)
    return out


def save_png(path: Path, im: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    # Force RGBA / colour type 6 — tauri rejects indexed palettes (#6990)
    im.convert("RGBA").save(path, format="PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)} ({path.stat().st_size} bytes) {im.size}")


def main() -> None:
    src = Image.open(SOURCE).convert("RGBA")
    assert src.size[0] == src.size[1], src.size

    # Windows: full-bleed multi-resolution ICO (sizes= from the largest frame)
    win_path = ICONS / "windows" / "app.ico"
    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    src.resize((256, 256), Image.Resampling.LANCZOS).save(
        win_path, format="ICO", sizes=ico_sizes
    )
    print(f"wrote {win_path.relative_to(ROOT)} ({win_path.stat().st_size} bytes)")

    # macOS: Apple 824/1024 grid
    mac_512 = inset(src, 512, 410)
    save_png(ICONS / "macos" / "app-512.png", mac_512)

    icns_sizes = [16, 32, 64, 128, 256, 512, 1024]
    icns_images = []
    for size in icns_sizes:
        body = round(size * 824 / 1024)
        if body % 2 != size % 2:
            body += 1
        icns_images.append(inset(src, size, body))

    icns_path = ICONS / "macos" / "app.icns"
    icns_images[-1].save(icns_path, format="ICNS", append_images=icns_images[:-1])
    print(f"wrote {icns_path.relative_to(ROOT)} ({icns_path.stat().st_size} bytes)")

    # Linux: ~10% margin; small sizes slightly fuller
    linux_specs = {
        512: 410,
        192: 154,
        128: 102,
        64: 52,
        32: 28,
        16: 14,
    }
    for size, body in linux_specs.items():
        save_png(ICONS / "linux" / f"app-{size}.png", inset(src, size, body))

    # Web favicon: multi-size ICO
    fav_path = MODERN / "favicon.ico"
    fav_sizes = [(16, 16), (32, 32), (48, 48)]
    src.resize((48, 48), Image.Resampling.LANCZOS).save(
        fav_path, format="ICO", sizes=fav_sizes
    )
    print(f"wrote {fav_path.relative_to(ROOT)} ({fav_path.stat().st_size} bytes)")

    for p in [
        ICONS / "macos" / "app-512.png",
        ICONS / "linux" / "app-512.png",
        ICONS / "linux" / "app-16.png",
    ]:
        im = Image.open(p)
        print(f"verify {p.name}: size={im.size} mode={im.mode}")

    print("done")


if __name__ == "__main__":
    main()

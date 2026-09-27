#!/usr/bin/env python3
import json
import re
import shutil
from datetime import datetime
from pathlib import Path


PROJECT = Path(__file__).resolve().parents[2]
ROOT = PROJECT / "public" / "landing" / "cocoverde"  # the served landing page
ACTUALS = ROOT / "Actuals"
PENDING = PROJECT / "landing-media" / "pending"    # drop new photos here (not published)
PROCESSED = ACTUALS / "processed"
DATA_FILE = ROOT / "assets" / "js" / "gallery-data.js"
METADATA_FILE = ACTUALS / "metadata.json"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
VILLA_NAMES = {
    1: "Villa Verde Luna",
    2: "Villa Verde Sol",
    3: "Villa Verde Brisa",
    4: "Villa Verde Mar",
}


def rel(path):
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:  # e.g. photos still in landing-media/pending
        return path.relative_to(PROJECT).as_posix()


def title_from_name(path):
    stem = path.stem
    stem = re.sub(r"[-_]+", " ", stem)
    stem = re.sub(r"\s+", " ", stem).strip()
    return stem


def infer_villa(path):
    text = path.as_posix()
    patterns = [
        r"Villa[-_ ]?([1-4])",
        r"/V([1-4])(?:\s|_|-|/)",
        r"\bV([1-4])\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1))
    return None


def infer_date(path):
    text = path.name
    match = re.search(r"(20\d{2})[-_](\d{2})[-_](\d{2})", text)
    if match:
        return f"{match.group(1)}-{match.group(2)}-{match.group(3)}"
    return datetime.fromtimestamp(path.stat().st_mtime).strftime("%Y-%m-%d")


def load_metadata():
    if not METADATA_FILE.exists():
        return {}
    return json.loads(METADATA_FILE.read_text(encoding="utf-8"))


def unique_destination(dest):
    if not dest.exists():
        return dest
    base = dest.stem
    suffix = dest.suffix
    parent = dest.parent
    counter = 2
    while True:
        candidate = parent / f"{base}-{counter}{suffix}"
        if not candidate.exists():
            return candidate
        counter += 1


def image_files_under(path):
    if not path.exists():
        return []
    return sorted(
        file
        for file in path.rglob("*")
        if file.is_file() and file.suffix.lower() in IMAGE_EXTENSIONS
    )


def legacy_actual_files():
    files = []
    if not ACTUALS.exists():
        return files
    for file in image_files_under(ACTUALS):
        parts = file.relative_to(ACTUALS).parts
        if parts and parts[0] in {"pending", "processed"}:
            continue
        files.append(file)
    return files


def process_pending():
    PENDING.mkdir(parents=True, exist_ok=True)
    PROCESSED.mkdir(parents=True, exist_ok=True)
    moved = []

    for source in image_files_under(PENDING) + legacy_actual_files():
        villa = infer_villa(source)
        if villa is None:
            print(f"Skipping {rel(source)}: could not infer villa number")
            continue

        taken_date = infer_date(source)
        month = taken_date[:7]
        dest_dir = PROCESSED / f"Villa-{villa}" / month
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = unique_destination(dest_dir / source.name)
        shutil.move(str(source), str(dest))
        moved.append((source, dest))

    return moved


def build_actuals():
    actuals = []
    metadata = load_metadata()
    date_overrides = metadata.get("dateOverrides", {})
    for file in image_files_under(PROCESSED):
        villa = infer_villa(file)
        if villa is None:
            continue
        source = rel(file)
        taken_date = date_overrides.get(source, infer_date(file))
        actuals.append({
            "villa": villa,
            "villaName": VILLA_NAMES.get(villa, f"Villa {villa}"),
            "month": taken_date[:7],
            "dateTaken": taken_date,
            "title": title_from_name(file),
            "src": source,
        })
    return sorted(actuals, key=lambda item: (item["villa"], item["month"], item["dateTaken"], item["title"]))


def build_renders():
    renders = []
    for villa in range(1, 5):
        cover = ROOT / "assets" / "img" / "villas" / f"villa-{villa}.webp"
        if cover.exists():
            renders.append({
                "villa": villa,
                "villaName": VILLA_NAMES[villa],
                "title": f"{VILLA_NAMES[villa]} exterior",
                "src": rel(cover),
            })

        folder = ROOT / "assets" / "img" / f"Villa-{villa}"
        for file in image_files_under(folder):
            if "-small" in file.stem.lower():
                continue
            renders.append({
                "villa": villa,
                "villaName": VILLA_NAMES[villa],
                "title": title_from_name(file),
                "src": rel(file),
            })
    return renders


def write_manifest():
    data = {
        "actuals": build_actuals(),
        "renders": build_renders(),
    }
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(
        "window.CocoVerdeGalleryData = "
        + json.dumps(data, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    return data


def main():
    moved = process_pending()
    data = write_manifest()
    print(f"Moved {len(moved)} actual image(s) into {rel(PROCESSED)}")
    print(f"Wrote {rel(DATA_FILE)}")
    print(f"Actuals: {len(data['actuals'])}; renders: {len(data['renders'])}")


if __name__ == "__main__":
    main()

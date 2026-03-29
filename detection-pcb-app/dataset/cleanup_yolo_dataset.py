import argparse
import os
import shutil
from pathlib import Path

YOLO_SUBDIRS = ["train", "val", "test"]
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}


def ensure_structure(root: Path):
    if not root.exists():
        raise FileNotFoundError(f"Dataset root not found: {root}")

    for split in YOLO_SUBDIRS:
        split_path = root / split
        (split_path / "images").mkdir(parents=True, exist_ok=True)
        (split_path / "labels").mkdir(parents=True, exist_ok=True)


def cleanup_directory(path: Path):
    removed_files = 0
    for file in path.rglob("*"):
        if file.is_file():
            # Remove extra files from export that YOLO doesn't need
            if file.suffix.lower() in {".cache", ".txt.tmp", ".json", ".yaml", ".md", ".zip"} and file.name not in {"data.yaml"}:
                file.unlink()
                removed_files += 1
            # Keep only image and label files in data splits
            if "images" in file.parts and file.suffix.lower() not in IMAGE_EXTENSIONS:
                file.unlink(); removed_files += 1
            if "labels" in file.parts and file.suffix.lower() != ".txt":
                file.unlink(); removed_files += 1

    return removed_files


def move_misplaced_files(root: Path):
    moved = 0
    for f in root.glob("*.*"):
        if f.suffix.lower() in IMAGE_EXTENSIONS:
            dest = root / "train" / "images" / f.name
            shutil.move(str(f), str(dest)); moved += 1
        elif f.suffix.lower() == ".txt":
            dest = root / "train" / "labels" / f.name
            shutil.move(str(f), str(dest)); moved += 1
    return moved


def main():
    parser = argparse.ArgumentParser(description="Cleanup and validate YOLOv8 PCB dataset structure")
    parser.add_argument("--dataset", default=".", help="Root dataset folder: contains train/val/test")
    args = parser.parse_args()

    root = Path(args.dataset).resolve()
    print("Dataset root:", root)

    ensure_structure(root)
    print("Ensured train/val/test images/labels structure")

    moved = move_misplaced_files(root)
    print(f"Moved misplaced raw images/labels into train split: {moved}")

    removed = cleanup_directory(root)
    print(f"Removed extra files: {removed}")

    print("DONE. Verify data.yaml points to this dataset path")


if __name__ == '__main__':
    main()

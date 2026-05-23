"""
Kaggle Dataset Download Script
Downloads required datasets for CapstoneX ML training.
Requires: KAGGLE_USERNAME and KAGGLE_KEY environment variables, or ~/.kaggle/kaggle.json
"""
import os
import subprocess
import sys

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

DATASETS = [
    "spscientist/students-performance-in-exams",
    "aljarah/xAPI-Edu-Data",
]


def download_datasets():
    """Download all required Kaggle datasets."""
    os.makedirs(DATA_DIR, exist_ok=True)

    for dataset in DATASETS:
        dataset_name = dataset.split("/")[-1]
        target_dir = os.path.join(DATA_DIR, dataset_name)

        if os.path.exists(target_dir) and os.listdir(target_dir):
            print(f"✅ Dataset already exists: {dataset_name}")
            continue

        print(f"📥 Downloading: {dataset}...")
        try:
            subprocess.run(
                ["kaggle", "datasets", "download", "-d", dataset, "-p", DATA_DIR, "--unzip"],
                check=True,
                capture_output=True,
                text=True,
            )
            print(f"✅ Downloaded: {dataset_name}")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to download {dataset}: {e.stderr}")
        except FileNotFoundError:
            print("❌ kaggle CLI not found. Install with: pip install kaggle")
            print("   Then configure: export KAGGLE_USERNAME=your_username KAGGLE_KEY=your_key")
            sys.exit(1)


if __name__ == "__main__":
    download_datasets()

#!/usr/bin/env python3
"""
Resume YOLOv8 Training from Checkpoint
Run with: python resume_training.py
"""

import os
import torch
from pathlib import Path
from ultralytics import YOLO

def find_latest_checkpoint():
    """Find the most recent training checkpoint"""
    runs_dir = Path('runs/detect')

    if not runs_dir.exists():
        return None

    # Find training runs (look for improved_training or train directories)
    training_runs = []
    for run_dir in runs_dir.iterdir():
        if run_dir.is_dir() and (run_dir.name.startswith('improved_training') or run_dir.name.startswith('train')):
            weights_dir = run_dir / 'weights'
            if weights_dir.exists():
                # Check for last.pt (preferred for resuming)
                last_pt = weights_dir / 'last.pt'
                if last_pt.exists():
                    training_runs.append((run_dir, last_pt))
                # Or best.pt as fallback
                elif (weights_dir / 'best.pt').exists():
                    training_runs.append((run_dir, weights_dir / 'best.pt'))

    if not training_runs:
        return None

    # Return the most recent run
    training_runs.sort(key=lambda x: x[1].stat().st_mtime, reverse=True)
    return training_runs[0]

def main():
    print("🔍 Looking for training checkpoint to resume...")

    checkpoint_info = find_latest_checkpoint()

    if not checkpoint_info:
        print("❌ No checkpoint found to resume from.")
        print("💡 Make sure you've run training at least once with: python train_improved.py")
        return

    run_dir, checkpoint_path = checkpoint_info
    print(f"✅ Found checkpoint: {checkpoint_path}")
    print(f"📁 From run: {run_dir.name}")

    # Check for GPU
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"🖥️  Using device: {device}")

    # Load model from checkpoint
    print("⏳ Loading model from checkpoint...")
    model = YOLO(str(checkpoint_path))

    # Resume training with same parameters
    print("🚀 Resuming training...")
    results = model.train(
        data='data.yaml',
        epochs=100,  # Additional epochs (will be added to previous total)
        resume=True,  # This is the key parameter for resuming!

        # Keep same settings as original training
        batch=16,
        imgsz=640,
        device=device,

        # Data augmentation
        augment=True,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        degrees=10.0,
        translate=0.1,
        scale=0.5,
        fliplr=0.5,
        mosaic=1.0,

        # Training optimization
        optimizer='AdamW',
        lr0=0.001,
        lrf=0.01,
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3.0,

        # Loss weights
        box=7.5,
        cls=0.5,
        dfl=1.5,

        # Other settings
        patience=50,
        verbose=True,
        plots=True,
        save=True,
        save_period=10,
        val=True,
    )

    print("✅ Resume training completed!")
    print(f"📊 Best model saved at: {results.save_dir}/weights/best.pt")

    # Copy best model to production
    print("📋 Copying best model to production directory...")
    os.system("python copy_best_model.py")

if __name__ == "__main__":
    main()
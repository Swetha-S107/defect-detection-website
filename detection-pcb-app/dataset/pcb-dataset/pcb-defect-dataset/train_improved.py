#!/usr/bin/env python3
"""
Improved YOLOv8 Training Script for PCB Defect Detection
Run with: python train_improved.py
"""

import os
import torch
from ultralytics import YOLO

def main():
    # Check for GPU
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"Using device: {device}")

    # Model configuration
    model_name = 'yolov8n.pt'  # Start with nano for faster training
    data_yaml = 'data.yaml'
    project_name = 'improved_training'
    epochs = 100  # Increased from 50
    batch_size = 16  # Increased from 8 for better gradient estimates
    img_size = 640

    # Verify data.yaml exists
    if not os.path.exists(data_yaml):
        print(f"❌ {data_yaml} not found!")
        return

    # Load model
    print("Loading model...")
    model = YOLO(model_name)

    # Training with improved hyperparameters
    print("Starting training...")
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        batch=batch_size,
        imgsz=img_size,
        device=device,
        project=project_name,
        name='pcb_defect_v1',

        # Data augmentation (improved)
        augment=True,
        hsv_h=0.015,  # Hue augmentation
        hsv_s=0.7,    # Saturation augmentation
        hsv_v=0.4,    # Value augmentation
        degrees=10.0, # Rotation
        translate=0.1, # Translation
        scale=0.5,    # Scale
        shear=0.0,    # Shear
        perspective=0.0, # Perspective
        flipud=0.0,   # Vertical flip
        fliplr=0.5,   # Horizontal flip
        mosaic=1.0,   # Mosaic augmentation
        mixup=0.0,    # Mixup augmentation

        # Training optimization
        optimizer='AdamW',  # Better than default SGD
        lr0=0.001,          # Initial learning rate
        lrf=0.01,           # Final learning rate fraction
        momentum=0.937,     # Momentum
        weight_decay=0.0005, # Weight decay
        warmup_epochs=3.0,   # Warmup epochs
        warmup_momentum=0.8, # Warmup momentum
        warmup_bias_lr=0.1,  # Warmup bias learning rate

        # Loss weights
        box=7.5,   # Box loss weight
        cls=0.5,   # Classification loss weight
        dfl=1.5,   # Distribution focal loss weight

        # Validation and saving
        val=True,
        save=True,
        save_period=10,  # Save every 10 epochs
        cache=False,     # Set to True if you have enough RAM

        # Other settings
        patience=50,     # Early stopping patience
        verbose=True,
        plots=True,
        seed=42,        # For reproducibility
    )

    print("Training completed!")
    print(f"Best model saved at: {results.save_dir}/weights/best.pt")

    # Validate the best model
    print("Validating best model...")
    model = YOLO(f"{results.save_dir}/weights/best.pt")
    metrics = model.val(data=data_yaml, split='test')
    print(f"Test mAP50: {metrics.box.map50:.4f}")
    print(f"Test mAP50-95: {metrics.box.map:.4f}")

if __name__ == "__main__":
    main()
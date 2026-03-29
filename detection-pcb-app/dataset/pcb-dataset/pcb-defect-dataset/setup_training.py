import os
import yaml
from pathlib import Path

def create_improved_data_yaml():
    """Create improved data.yaml with better configuration"""
    data = {
        'path': '../pcb-defect-dataset',
        'train': 'train',
        'val': 'val',
        'test': 'test',
        'names': {
            0: 'mouse_bite',
            1: 'spur',
            2: 'missing_hole',
            3: 'short',
            4: 'open_circuit',
            5: 'spurious_copper'
        },
        # Add nc (number of classes) for clarity
        'nc': 6
    }

    with open('data.yaml', 'w') as f:
        yaml.dump(data, f, default_flow_style=False, sort_keys=False)

    print("✅ Updated data.yaml with nc parameter")

def create_training_script():
    """Create improved training script with best practices"""
    script_content = '''#!/usr/bin/env python3
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
'''

    with open('train_improved.py', 'w') as f:
        f.write(script_content)

    print("✅ Created improved training script: train_improved.py")

def create_hyperparameter_tuning_script():
    """Create hyperparameter tuning script"""
    script_content = '''#!/usr/bin/env python3
"""
Hyperparameter Tuning Script for PCB Defect Detection
Run with: python tune_hyperparams.py
"""

import os
from ultralytics import YOLO

def main():
    # Load a pretrained model
    model = YOLO('yolov8n.pt')

    # Run hyperparameter tuning
    # This will train multiple models with different hyperparameters
    results = model.tune(
        data='data.yaml',
        epochs=50,  # Shorter for tuning
        iterations=50,  # Number of tuning iterations
        optimizer='AdamW',
        plots=False,
        save=False,
        val=False,
    )

    print("Hyperparameter tuning completed!")
    print(f"Best results: {results}")

if __name__ == "__main__":
    main()
'''

    with open('tune_hyperparams.py', 'w') as f:
        f.write(script_content)

    print("✅ Created hyperparameter tuning script: tune_hyperparams.py")

def create_resume_training_script():
    """Create script to resume training from checkpoint"""
    script_content = '''#!/usr/bin/env python3
"""
Resume Training Script
Run with: python resume_training.py
"""

import os
from ultralytics import YOLO

def main():
    # Find the latest checkpoint
    checkpoint_path = None

    # Check for existing training runs
    if os.path.exists('runs/detect'):
        runs = [d for d in os.listdir('runs/detect') if d.startswith('improved_training')]
        if runs:
            latest_run = max(runs)
            weights_dir = f'runs/detect/{latest_run}/weights'
            if os.path.exists(weights_dir):
                # Try last.pt first, then best.pt
                for weight_file in ['last.pt', 'best.pt']:
                    path = os.path.join(weights_dir, weight_file)
                    if os.path.exists(path):
                        checkpoint_path = path
                        break

    if checkpoint_path:
        print(f"Resuming from: {checkpoint_path}")
        model = YOLO(checkpoint_path)

        # Resume training with same parameters
        results = model.train(
            data='data.yaml',
            epochs=100,  # Additional epochs
            resume=True,  # This is key for resuming
            batch=16,
            imgsz=640,
            device='cuda' if torch.cuda.is_available() else 'cpu',
        )
        print("Resume training completed!")
    else:
        print("No checkpoint found to resume from.")

if __name__ == "__main__":
    main()
'''

    with open('resume_training.py', 'w') as f:
        f.write(script_content)

    print("✅ Created resume training script: resume_training.py")

if __name__ == "__main__":
    print("🚀 Setting up improved YOLOv8 training configuration...")

    # Update data.yaml
    create_improved_data_yaml()

    # Create training scripts
    create_training_script()
    create_hyperparameter_tuning_script()
    create_resume_training_script()

    print("\\n📋 Next steps:")
    print("1. Run: python train_improved.py")
    print("2. Monitor training with TensorBoard: tensorboard --logdir runs/detect")
    print("3. After training, copy best.pt to ../models/pcb_defect_model.pt")
    print("4. Test with: python -m ultralytics detect model=models/pcb_defect_model.pt source=test/images")
'''

    with open('setup_improved_training.py', 'w') as f:
        f.write(script_content)

    print("✅ Created setup script: setup_improved_training.py")

if __name__ == "__main__":
    create_setup_script()
    create_improved_data_yaml()
    create_training_script()
    create_hyperparameter_tuning_script()
    create_resume_training_script()
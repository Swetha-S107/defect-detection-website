#!/usr/bin/env python3
"""
Validate Model Performance
Run with: python validate_model.py
"""

import os
from ultralytics import YOLO

def main():
    # Check for model
    model_paths = [
        '../models/pcb_defect_model.pt',
        'runs/detect/improved_training_pcb_defect_v1/weights/best.pt',
        'runs/detect/train2/weights/best.pt'
    ]

    model_path = None
    for path in model_paths:
        if os.path.exists(path):
            model_path = path
            break

    if not model_path:
        print("❌ No model found to validate")
        return

    print(f"Validating model: {model_path}")

    # Load model
    model = YOLO(model_path)

    # Validate on test set
    print("Running validation on test set...")
    metrics = model.val(data='data.yaml', split='test')

    print("\\n📊 Validation Results:")
    print(".4f"    print(".4f"    print(".4f"    print(".4f"
    # Class-wise metrics
    if hasattr(metrics, 'box') and hasattr(metrics.box, 'ap_class_index'):
        print("\\n📈 Per-Class Performance:")
        class_names = ['mouse_bite', 'spur', 'missing_hole', 'short', 'open_circuit', 'spurious_copper']
        for i, class_name in enumerate(class_names):
            if i < len(metrics.box.ap50):
                ap50 = metrics.box.ap50[i]
                print("20")

    # Test inference on a few images
    print("\\n🧪 Testing inference on sample images...")
    test_images = []
    if os.path.exists('test/images'):
        test_images = [f for f in os.listdir('test/images') if f.endswith(('.jpg', '.png'))][:3]

    if test_images:
        for img in test_images:
            img_path = f'test/images/{img}'
            print(f"Testing: {img}")
            results = model(img_path, conf=0.25, iou=0.45)
            if results and len(results) > 0:
                result = results[0]
                if hasattr(result, 'boxes') and len(result.boxes) > 0:
                    print(f"  Found {len(result.boxes)} defects")
                else:
                    print("  No defects detected"
    else:
        print("No test images found")

if __name__ == "__main__":
    main()
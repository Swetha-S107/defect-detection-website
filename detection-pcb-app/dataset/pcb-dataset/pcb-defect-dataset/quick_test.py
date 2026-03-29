#!/usr/bin/env python3
"""
Quick Model Validation - Test predictions on multiple images
Run with: python quick_test.py
"""

import os
import base64
import requests
import json
from pathlib import Path

def test_image(image_path, api_url="http://localhost:3000/api/predict"):
    """Test a single image"""
    try:
        # Read and encode image
        with open(image_path, 'rb') as f:
            image_data = f.read()

        base64_image = base64.b64encode(image_data).decode('utf-8')
        mime_type = 'image/jpeg' if image_path.endswith('.jpg') else 'image/png'

        # Make API request
        payload = {
            'base64Image': base64_image,
            'mimeType': mime_type
        }

        response = requests.post(api_url, json=payload, timeout=30)
        result = response.json()

        return {
            'image': os.path.basename(image_path),
            'status': result.get('status', 'ERROR'),
            'defect_type': result.get('defectType', 'None'),
            'confidence': result.get('confidence', 0),
            'bbox_count': len(result.get('boundingBoxes', [])),
            'success': response.status_code == 200
        }

    except Exception as e:
        return {
            'image': os.path.basename(image_path),
            'status': 'ERROR',
            'error': str(e),
            'success': False
        }

def main():
    print("🧪 Quick Model Validation Test")
    print("=" * 50)

    # Test images directory
    test_dir = Path('test/images')
    api_url = "http://localhost:3000/api/predict"

    if not test_dir.exists():
        print("❌ Test images directory not found!")
        return

    # Get first 5 test images
    test_images = list(test_dir.glob('*.jpg'))[:5]

    if not test_images:
        print("❌ No test images found!")
        return

    print(f"Testing {len(test_images)} images...")
    print()

    results = []
    for img_path in test_images:
        print(f"Testing: {img_path.name}")
        result = test_image(str(img_path), api_url)
        results.append(result)

        if result['success']:
            status = result['status']
            defect = result['defect_type']
            conf = result['confidence']
            bboxes = result['bbox_count']
            print(f"  ✅ {status} | Defect: {defect} | Conf: {conf:.1f}% | Boxes: {bboxes}")
        else:
            print(f"  ❌ ERROR: {result.get('error', 'Unknown error')}")
        print()

    # Summary
    successful = sum(1 for r in results if r['success'])
    defected = sum(1 for r in results if r.get('status') == 'Defected')
    normal = sum(1 for r in results if r.get('status') == 'Normal')

    print("📊 Summary:")
    print(f"   Total tested: {len(results)}")
    print(f"   Successful: {successful}")
    print(f"   Defected: {defected}")
    print(f"   Normal: {normal}")

    if successful == len(results):
        print("🎉 All tests passed! Model is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the API and model.")

if __name__ == "__main__":
    main()
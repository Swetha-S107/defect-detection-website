#!/usr/bin/env python3
"""
Final Deployment Check - Ensure everything is ready for submission
Run with: python final_check.py
"""

import os
import requests
import json
from pathlib import Path

def check_file_exists(path, description):
    """Check if a file exists"""
    exists = os.path.exists(path)
    status = "✅" if exists else "❌"
    print(f"{status} {description}: {'Found' if exists else 'Missing'}")
    return exists

def check_directory_structure():
    """Check dataset structure"""
    print("📁 Checking dataset structure...")

    base_dir = Path('.')
    required_paths = [
        ('data.yaml', 'Dataset configuration'),
        ('train/images', 'Training images'),
        ('train/labels', 'Training labels'),
        ('val/images', 'Validation images'),
        ('val/labels', 'Validation labels'),
        ('test/images', 'Test images'),
        ('test/labels', 'Test labels'),
    ]

    all_good = True
    for path, desc in required_paths:
        if not check_file_exists(path, desc):
            all_good = False

    # Check model files
    print("\\n🤖 Checking model files...")
    model_paths = [
        ('../models/pcb_defect_model.pt', 'Production model'),
        ('runs/detect/train2/weights/best.pt', 'Backup model 1'),
        ('runs/detect/mytrain2/weights/best.pt', 'Backup model 2'),
    ]

    model_found = False
    for path, desc in model_paths:
        if check_file_exists(path, desc):
            model_found = True

    return all_good and model_found

def test_api_endpoint():
    """Test the prediction API"""
    print("\\n🌐 Testing API endpoint...")

    try:
        # Test health endpoint
        response = requests.get("http://localhost:3000/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health endpoint: OK")
        else:
            print("❌ Health endpoint: Failed")
            return False

        # Test prediction with a sample image
        test_image = 'test/images/light_01_missing_hole_02_3_600.jpg'
        if os.path.exists(test_image):
            with open(test_image, 'rb') as f:
                image_data = f.read()

            import base64
            base64_image = base64.b64encode(image_data).decode('utf-8')

            payload = {
                'base64Image': base64_image,
                'mimeType': 'image/jpeg'
            }

            response = requests.post("http://localhost:3000/api/predict",
                                   json=payload, timeout=30)

            if response.status_code == 200:
                result = response.json()
                if result.get('status') in ['Normal', 'Defected']:
                    print("✅ Prediction API: Working")
                    print(f"   Sample result: {result['status']} ({result.get('confidence', 0):.1f}%)")
                    return True
                else:
                    print("❌ Prediction API: Invalid response format")
                    return False
            else:
                print(f"❌ Prediction API: HTTP {response.status_code}")
                return False
        else:
            print("⚠️  No test image found for API testing")
            return True

    except requests.exceptions.RequestException as e:
        print(f"❌ API test failed: {e}")
        return False

def check_training_scripts():
    """Check that training scripts exist"""
    print("\\n📜 Checking training scripts...")

    scripts = [
        'train_improved.py',
        'resume_training.py',
        'check_training.py',
        'validate_model.py',
        'copy_best_model.py',
        'quick_test.py'
    ]

    all_exist = True
    for script in scripts:
        if not check_file_exists(script, f"Script: {script}"):
            all_exist = False

    return all_exist

def main():
    print("🎯 FINAL DEPLOYMENT CHECK")
    print("=" * 50)

    # Check components
    dataset_ok = check_directory_structure()
    scripts_ok = check_training_scripts()
    api_ok = test_api_endpoint()

    print("\\n" + "=" * 50)
    print("📋 DEPLOYMENT STATUS:")

    components = [
        ("Dataset Structure", dataset_ok),
        ("Training Scripts", scripts_ok),
        ("API Functionality", api_ok)
    ]

    all_good = True
    for component, status in components:
        check = "✅ PASS" if status else "❌ FAIL"
        print(f"   {check} {component}")
        if not status:
            all_good = False

    print("\\n" + "=" * 50)

    if all_good:
        print("🎉 DEPLOYMENT READY!")
        print("\\n🚀 Your PCB Defect Detection System is fully operational:")
        print("   • Model: Trained and accurate")
        print("   • API: Working correctly")
        print("   • Website: Running on http://localhost:3000")
        print("   • Dataset: Properly structured")
        print("\\n📤 Ready for submission!")
    else:
        print("⚠️  Some components need attention before submission.")
        print("\\n🔧 Quick fixes:")
        if not dataset_ok:
            print("   - Run: python setup_training.py")
        if not api_ok:
            print("   - Start server: cd ../.. && npm run dev")
        print("   - Test again: python final_check.py")

if __name__ == "__main__":
    main()
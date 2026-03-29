import argparse
import base64
import json
import os
import sys
import tempfile
from ultralytics import YOLO

parser = argparse.ArgumentParser(description="YOLO PCB defect predictor")
parser.add_argument("--model", required=True, help="Path to the YOLO weight file")
args = parser.parse_args()

model_path = args.model
if not os.path.exists(model_path):
    print(json.dumps({"success": False, "message": f"Model file not found: {model_path}"}))
    sys.exit(1)

try:
    payload = json.loads(sys.stdin.read() or "{}")
except json.JSONDecodeError:
    print(json.dumps({"success": False, "message": "Invalid JSON input"}))
    sys.exit(1)

base64_image = payload.get("base64Image")
if not base64_image:
    print(json.dumps({"success": False, "message": "No base64Image in request"}))
    sys.exit(1)

try:
    image_bytes = base64.b64decode(base64_image)
except Exception as e:
    print(json.dumps({"success": False, "message": f"Base64 decoding failed: {str(e)}"}))
    sys.exit(1)

with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
    tmp_file.write(image_bytes)
    tmp_path = tmp_file.name

try:
    model = YOLO(model_path)
    results = model(tmp_path, imgsz=640, conf=0.15, iou=0.45)

    boxes = []
    defect_type = None
    best_conf = 0.0

    result = results[0] if len(results) > 0 else None
    if result and hasattr(result, 'boxes') and len(result.boxes) > 0:
        img_width, img_height = result.orig_shape[1], result.orig_shape[0]
        for i, box in enumerate(result.boxes):
            cls_id = int(box.cls.cpu().numpy()[0]) if hasattr(box.cls, 'cpu') else int(box.cls)
            conf = float(box.conf.cpu().numpy()[0]) if hasattr(box.conf, 'cpu') else float(box.conf)
            coords = box.xyxy.cpu().numpy()[0] if hasattr(box.xyxy, 'cpu') else box.xyxy
            xmin, ymin, xmax, ymax = coords

            if conf > best_conf:
                best_conf = conf
                defect_type = model.names.get(cls_id, "unknown")

            boxes.append({
                "xmin": int((xmin / img_width) * 1000),
                "ymin": int((ymin / img_height) * 1000),
                "xmax": int((xmax / img_width) * 1000),
                "ymax": int((ymax / img_height) * 1000),
                "label": model.names.get(cls_id, "defect"),
                "confidence": round(conf * 100, 2)
            })

    if boxes:
        status = "Defected"
        confidence = round(best_conf * 100, 2)
        normal_percentage = max(0, 100 - confidence)
        defected_percentage = min(100, confidence)
        severity = "High" if confidence >= 80 else "Medium" if confidence >= 50 else "Low"
        explanation = f"Detected {defect_type} with confidence {confidence:.2f}%"
        suggested_solution = "Inspect and repair the PCB area highlighted in red."
    else:
        status = "Normal"
        confidence = 99.0
        normal_percentage = 99.0
        defected_percentage = 1.0
        defect_type = None
        severity = None
        explanation = "No defect detected"
        suggested_solution = "PCB is good to proceed."

    output = {
        "success": True,
        "status": status,
        "defectType": defect_type,
        "defect_type": defect_type,
        "confidence": confidence,
        "normalPercentage": normal_percentage,
        "defectedPercentage": defected_percentage,
        "pcbType": "Unknown",
        "severity": severity,
        "explanation": explanation,
        "suggestedSolution": suggested_solution,
        "boundingBoxes": boxes,
    }

    print(json.dumps(output))

finally:
    if os.path.exists(tmp_path):
        os.remove(tmp_path)

#!/usr/bin/env python3
"""
Copy Best Model to Production Directory
Run with: python copy_best_model.py
"""

import os
import shutil
from pathlib import Path

def main():
    # Find the best model from the latest training run
    runs_dir = Path('runs/detect')
    models_dir = Path('../models')

    # Create models directory if it doesn't exist
    models_dir.mkdir(exist_ok=True)

    best_model_path = None
    best_score = 0

    if runs_dir.exists():
        # Find all training runs
        for run_dir in runs_dir.iterdir():
            if run_dir.is_dir() and (run_dir.name.startswith('improved_training') or run_dir.name.startswith('train')):
                weights_dir = run_dir / 'weights'
                results_csv = run_dir / 'results.csv'

                if weights_dir.exists() and (weights_dir / 'best.pt').exists():
                    # Check if this model has better results
                    if results_csv.exists():
                        try:
                            with open(results_csv, 'r') as f:
                                lines = f.readlines()
                                if len(lines) > 1:
                                    # Get last line (final results)
                                    last_line = lines[-1].strip().split(',')
                                    if len(last_line) >= 8:
                                        map50 = float(last_line[7])  # mAP50
                                        if map50 > best_score:
                                            best_score = map50
                                            best_model_path = weights_dir / 'best.pt'
                        except:
                            pass
                    else:
                        # If no results.csv, use this as fallback
                        if best_model_path is None:
                            best_model_path = weights_dir / 'best.pt'

    if best_model_path and best_model_path.exists():
        target_path = models_dir / 'pcb_defect_model.pt'
        shutil.copy2(best_model_path, target_path)
        print(f"✅ Copied best model to: {target_path}")
        print(f"   Best score: {best_score:.4f}")
    else:
        print("❌ No trained model found in runs/detect/")

        # Check if there's already a model in models directory
        existing_model = models_dir / 'pcb_defect_model.pt'
        if existing_model.exists():
            print(f"ℹ️  Using existing model: {existing_model}")
        else:
            print("❌ No model available for deployment")

if __name__ == "__main__":
    main()
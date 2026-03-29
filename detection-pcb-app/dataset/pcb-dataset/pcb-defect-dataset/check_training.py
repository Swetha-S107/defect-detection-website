#!/usr/bin/env python3
"""
Check Training Status and Safely Stop Training
Run with: python check_training.py
"""

import os
import signal
import psutil
from pathlib import Path

def find_running_training():
    """Find if there's a YOLO training process running"""
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            if proc.info['name'] == 'python.exe' or proc.info['name'] == 'python':
                cmdline = proc.info['cmdline']
                if cmdline and any('train' in arg for arg in cmdline):
                    return proc.info['pid']
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return None

def check_training_status():
    """Check the status of the latest training run"""
    runs_dir = Path('runs/detect')

    if not runs_dir.exists():
        print("❌ No training runs found")
        return

    # Find the most recent training run
    training_runs = []
    for run_dir in runs_dir.iterdir():
        if run_dir.is_dir() and (run_dir.name.startswith('improved_training') or run_dir.name.startswith('train')):
            results_csv = run_dir / 'results.csv'
            if results_csv.exists():
                training_runs.append((run_dir, results_csv.stat().st_mtime))

    if not training_runs:
        print("❌ No completed training runs found")
        return

    # Get the latest run
    training_runs.sort(key=lambda x: x[1], reverse=True)
    latest_run, _ = training_runs[0]

    print(f"📁 Latest training run: {latest_run.name}")

    # Check results
    results_csv = latest_run / 'results.csv'
    if results_csv.exists():
        with open(results_csv, 'r') as f:
            lines = f.readlines()

        if len(lines) > 1:
            header = lines[0].strip().split(',')
            last_line = lines[-1].strip().split(',')

            epoch = int(last_line[0])
            map50 = float(last_line[7]) if len(last_line) > 7 else 0
            map95 = float(last_line[8]) if len(last_line) > 8 else 0

            print(f"📊 Current status:")
            print(f"   Epoch: {epoch}")
            print(f"   mAP50: {map50:.4f}")
            print(f"   mAP50-95: {map95:.4f}")
            # Check weights
            weights_dir = latest_run / 'weights'
            if weights_dir.exists():
                best_pt = weights_dir / 'best.pt'
                last_pt = weights_dir / 'last.pt'

                if best_pt.exists():
                    print(f"   ✅ Best model: {best_pt}")
                if last_pt.exists():
                    print(f"   ✅ Last checkpoint: {last_pt}")
            else:
                print("   ⚠️  No weights saved yet")
    # Check if training is currently running
    running_pid = find_running_training()
    if running_pid:
        print(f"\\n🚀 Training is currently RUNNING (PID: {running_pid})")
        print("💡 To stop training safely:")
        print("   1. Press Ctrl+C in the training terminal")
        print("   2. Or run: python stop_training.py")
        print("   3. Then resume later with: python resume_training.py")
    else:
        print("\\n⏹️  No training process currently running")
        if (latest_run / 'weights' / 'last.pt').exists():
            print("💡 You can resume training with: python resume_training.py")

def main():
    print("🔍 Checking training status...")
    check_training_status()

if __name__ == "__main__":
    main()
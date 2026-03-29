#!/usr/bin/env python3
"""
Safely Stop YOLO Training
Run with: python stop_training.py
"""

import os
import signal
import psutil
import time

def find_running_training():
    """Find YOLO training processes"""
    training_processes = []

    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            if proc.info['name'] == 'python.exe' or proc.info['name'] == 'python':
                cmdline = proc.info['cmdline']
                if cmdline and any('train' in arg.lower() for arg in cmdline):
                    training_processes.append(proc)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    return training_processes

def stop_training_safely():
    """Safely stop training by sending SIGTERM"""
    processes = find_running_training()

    if not processes:
        print("❌ No training processes found to stop")
        return False

    print(f"🛑 Found {len(processes)} training process(es):")

    for proc in processes:
        pid = proc.pid
        print(f"   PID {pid}: {' '.join(proc.cmdline()[:3])}...")

        try:
            # Send SIGTERM for graceful shutdown
            proc.terminate()
            print(f"   ✅ Sent termination signal to PID {pid}")
        except Exception as e:
            print(f"   ❌ Failed to terminate PID {pid}: {e}")

    # Wait for processes to finish
    print("⏳ Waiting for processes to shutdown gracefully...")
    time.sleep(5)

    # Check if they actually stopped
    still_running = []
    for proc in processes:
        if proc.is_running():
            still_running.append(proc)

    if still_running:
        print(f"⚠️  {len(still_running)} process(es) still running, forcing shutdown...")
        for proc in still_running:
            try:
                proc.kill()  # Force kill
                print(f"   💀 Force killed PID {proc.pid}")
            except:
                print(f"   ❌ Could not kill PID {proc.pid}")

    print("✅ Training stopped successfully")
    print("💡 You can resume later with: python resume_training.py")
    return True

def main():
    print("🛑 Stopping YOLO training safely...")
    success = stop_training_safely()

    if success:
        print("\\n📋 Next steps:")
        print("1. Check status: python check_training.py")
        print("2. Resume training: python resume_training.py")
        print("3. Copy best model: python copy_best_model.py")

if __name__ == "__main__":
    main()
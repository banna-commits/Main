#!/usr/bin/env python3
"""Debug version of the scoring script"""

import json
import os
from pathlib import Path
from datetime import datetime, timedelta

MEMORY_DIR = Path("memory")
DAYS_TO_PROCESS = 7

def find_memory_files():
    """Find all daily memory files from the last 7 days."""
    memory_files = []
    today = datetime.now()
    
    for i in range(DAYS_TO_PROCESS):
        target_date = today - timedelta(days=i)
        date_pattern = target_date.strftime("%Y-%m-%d")
        
        for file_path in MEMORY_DIR.glob(f"{date_pattern}*.md"):
            if file_path.name.startswith(date_pattern):
                memory_files.append(file_path)
    
    return sorted(memory_files)

def main():
    print("=== DEBUG: Memory Scoring System ===")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Memory directory exists: {MEMORY_DIR.exists()}")
    
    # Find memory files
    memory_files = find_memory_files()
    print(f"Found {len(memory_files)} memory files:")
    
    for f in memory_files:
        print(f"  - {f.name}")
    
    print("Done!")

if __name__ == "__main__":
    main()
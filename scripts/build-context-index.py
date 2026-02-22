#!/usr/bin/env python3
"""
Build context index for OpenClaw workspace memory files.
Extracts topics, names, tickers, and project names from markdown files.
"""

import os
import re
import json
import glob
from datetime import datetime
from collections import defaultdict, Counter


def extract_headings(content, file_path, start_line=0):
    """Extract H2/H3 headings with line numbers."""
    results = []
    lines = content.split('\n')
    
    for i, line in enumerate(lines):
        line_num = start_line + i + 1
        # Match H2 (##) or H3 (###) headings
        match = re.match(r'^(#{2,3})\s+(.+)', line.strip())
        if match:
            level = len(match.group(1))
            heading = match.group(2).strip()
            
            # Find section end (next heading of same or higher level, or end of file)
            end_line = len(lines) + start_line
            for j in range(i + 1, len(lines)):
                next_match = re.match(r'^(#{1,3})\s+', lines[j].strip())
                if next_match and len(next_match.group(1)) <= level:
                    end_line = start_line + j
                    break
            
            # Get first ~50 chars of section content for summary
            section_content = '\n'.join(lines[i+1:j if 'j' in locals() else len(lines)])
            summary = re.sub(r'\s+', ' ', section_content.strip())[:50]
            if len(summary) == 50:
                summary += "..."
            
            if summary and len(summary.strip()) > 0:
                results.append({
                    "topic": heading.lower(),
                    "path": file_path,
                    "startLine": line_num,
                    "endLine": end_line,
                    "summary": summary
                })
    
    return results


def extract_names(content):
    """Extract capitalized names that appear multiple times."""
    # Find all capitalized words (2+ chars)
    words = re.findall(r'\b[A-Z][a-z]{1,}\b', content)
    
    # Count occurrences
    word_counts = Counter(words)
    
    # Return names that appear 2+ times
    return [word.lower() for word, count in word_counts.items() if count >= 2]


def extract_stock_tickers(content):
    """Extract stock tickers (WORD.XX format)."""
    tickers = re.findall(r'\b[A-Z]{2,}\.[A-Z]{2,3}\b', content)
    return [ticker.lower() for ticker in tickers]


def extract_project_names(content):
    """Extract likely project names from content."""
    projects = []
    
    # Look for quoted project names
    quoted = re.findall(r'"([^"]{3,30})"', content)
    projects.extend(quoted)
    
    # Look for project-like patterns (words with hyphens, spaces)
    project_patterns = re.findall(r'\b[A-Z][a-zA-Z\s\-]{2,20}\b(?=\s(?:project|dashboard|app|system|tool))', content)
    projects.extend(project_patterns)
    
    return [proj.lower().strip() for proj in projects if len(proj.strip()) > 2]


def process_file(file_path):
    """Process a single markdown file and extract topics."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except (UnicodeDecodeError, FileNotFoundError):
        return []
    
    if not content.strip():
        return []
    
    results = []
    
    # Extract headings with line numbers
    heading_results = extract_headings(content, file_path)
    results.extend(heading_results)
    
    # Extract names, tickers, projects for the whole file
    names = extract_names(content)
    tickers = extract_stock_tickers(content)
    projects = extract_project_names(content)
    
    # Add these as additional topics if not already covered by headings
    existing_topics = {r["topic"] for r in results}
    
    summary = re.sub(r'\s+', ' ', content.strip())[:50]
    if len(summary) == 50:
        summary += "..."
    
    # Add names, tickers, projects as topics if not already present
    all_additional = set(names + tickers + projects)
    for topic in all_additional:
        if topic not in existing_topics and len(topic) > 2:
            results.append({
                "topic": topic,
                "path": file_path,
                "startLine": 1,
                "endLine": len(content.split('\n')),
                "summary": summary
            })
    
    return results


def build_context_index():
    """Build the context index from memory files."""
    index = {
        "topics": defaultdict(list),
        "updatedAt": datetime.now().isoformat() + "Z"
    }
    
    # Files to scan
    scan_patterns = [
        "memory/*.md",
        "memory/people.md",
        "memory/projects.md", 
        "memory/infra.md",
        "memory/lessons.md",
        "memory/preferences.md",
        "memory/patterns/*.md"
    ]
    
    processed_files = set()
    
    for pattern in scan_patterns:
        files = glob.glob(pattern)
        for file_path in files:
            # Skip archive files and duplicates
            if '/archive/' in file_path or file_path in processed_files:
                continue
                
            processed_files.add(file_path)
            results = process_file(file_path)
            
            for result in results:
                topic = result["topic"]
                entry = {
                    "path": result["path"],
                    "startLine": result["startLine"], 
                    "endLine": result["endLine"],
                    "summary": result["summary"]
                }
                index["topics"][topic].append(entry)
    
    # Convert defaultdict to regular dict and deduplicate
    final_topics = {}
    for topic, entries in index["topics"].items():
        # Deduplicate entries with same path and similar line ranges
        unique_entries = []
        for entry in entries:
            is_duplicate = False
            for existing in unique_entries:
                if (existing["path"] == entry["path"] and 
                    abs(existing["startLine"] - entry["startLine"]) < 5):
                    is_duplicate = True
                    break
            if not is_duplicate:
                unique_entries.append(entry)
        
        if unique_entries:  # Only include topics with entries
            final_topics[topic] = unique_entries
    
    index["topics"] = final_topics
    return index


def main():
    """Main function."""
    print("Building context index...")
    
    # Build the index
    index = build_context_index()
    
    # Ensure memory directory exists
    os.makedirs("memory", exist_ok=True)
    
    # Write to file
    output_path = "memory/context-index.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    
    print(f"Context index written to {output_path}")
    print(f"Found {len(index['topics'])} topics")
    
    # Show topic summary
    for topic in sorted(index['topics'].keys())[:20]:  # Show first 20 topics
        count = len(index['topics'][topic])
        print(f"  {topic}: {count} reference{'s' if count != 1 else ''}")
    
    if len(index['topics']) > 20:
        print(f"  ... and {len(index['topics']) - 20} more topics")


if __name__ == "__main__":
    main()
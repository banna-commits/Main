#!/usr/bin/env python3
"""
Build relationship graph for the OpenClaw memory system.
Scans memory files and extracts entities and their relationships.
"""

import json
import re
from datetime import datetime
from pathlib import Path

def load_file_content(file_path):
    """Load and return file content, handling errors gracefully."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except (FileNotFoundError, UnicodeDecodeError) as e:
        print(f"Warning: Could not read {file_path}: {e}")
        return ""

def extract_people(content):
    """Extract people from people.md content."""
    people = {}
    
    # Parse structured entries
    lines = content.split('\n')
    current_person = None
    
    for line in lines:
        # Main headers (## Name)
        if line.startswith('## '):
            name = line[3:].strip()
            # Clean up name (remove parenthetical descriptions)
            if '(' in name:
                name = name.split('(')[0].strip()
            current_person = name.lower().replace(' ', '-')
            people[current_person] = {
                "type": "person",
                "display_name": name,
                "aliases": []
            }
        
        # Extract email addresses as aliases
        elif current_person and '@' in line:
            email_match = re.search(r'(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)', line)
            if email_match:
                email = email_match.group(1)
                if email not in people[current_person]["aliases"]:
                    people[current_person]["aliases"].append(email)
    
    return people

def extract_projects(content):
    """Extract projects from projects.md content."""
    projects = {}
    
    # Find project headers (## Project Name)
    for line in content.split('\n'):
        if line.startswith('## ') and ('#project' in line or line.endswith('#project')):
            name = line[3:].strip()
            # Remove #project tag
            name = re.sub(r'\s*#project\s*$', '', name)
            # Extract just the main name (before parenthetical)
            if '(' in name:
                name = name.split('(')[0].strip()
            
            project_key = name.lower().replace(' ', '-')
            projects[project_key] = {
                "type": "project",
                "display_name": name,
                "aliases": []
            }
    
    return projects

def extract_infra(content):
    """Extract tools and services from infra.md content."""
    infra = {}
    
    # Find main infrastructure headers
    for line in content.split('\n'):
        if line.startswith('## '):
            name = line[3:].strip()
            # Clean up common patterns
            if '(' in name:
                name = name.split('(')[0].strip()
            
            infra_key = name.lower().replace(' ', '-')
            infra[infra_key] = {
                "type": "tool",
                "display_name": name,
                "aliases": []
            }
    
    return infra

def extract_stocks_from_context(content):
    """Extract stock tickers from context-index.json topics."""
    stocks = {}
    
    try:
        data = json.loads(content)
        topics = data.get('topics', {})
        
        # Look through topic keys for known stock mentions
        # We'll be more conservative and only include explicit stock references
        known_stock_names = ['sampo', 'novo', 'protector', 'bravida', 'coor', 'securitas', 'wwi']
        
        for topic_name in topics.keys():
            topic_lower = topic_name.lower()
            for stock_name in known_stock_names:
                if stock_name in topic_lower:
                    # Don't add duplicates
                    if stock_name not in stocks:
                        stocks[stock_name] = {
                            "type": "stock",
                            "display_name": stock_name.title(),
                            "aliases": []
                        }
        
        # Add some known stocks that might not be explicitly formatted
        known_stocks = {
            'sampo': {'ticker': 'SAMPO.HE'},
            'novo': {'ticker': 'NOVO-B.CO'},
            'protector': {'ticker': 'PROT.OL'},
            'bravida': {'ticker': 'BRAV.ST'},
            'coor': {'ticker': 'COOR.ST'},
            'wwi': {'ticker': 'WWI.OL'},
            'peg': {'ticker': 'PEG.CO'}
        }
        
        for stock_name, info in known_stocks.items():
            if any(stock_name in topic_name.lower() for topic_name in topics.keys()):
                stock_key = stock_name
                stocks[stock_key] = {
                    "type": "stock",
                    "ticker": info['ticker'],
                    "aliases": []
                }
    
    except json.JSONDecodeError as e:
        print(f"Warning: Could not parse context-index.json: {e}")
    
    return stocks

def build_relationships(entities, people_content, projects_content, infra_content):
    """Build relationships between entities."""
    edges = []
    
    # Explicit relationships from people.md
    if 'knut' in entities and 'melissa' in entities:
        edges.append({"from": "knut", "to": "melissa", "relation": "partner"})
    
    # Project ownership relationships
    if 'knut' in entities:
        project_owners = {
            'taksthjem': 'co-founder',
            'investment-research': 'owner',
            'mission-control': 'owner'
        }
        
        for project, relation in project_owners.items():
            if project in entities:
                edges.append({"from": "knut", "to": project, "relation": relation})
    
    # Co-founder relationships for TakstHjem
    if 'taksthjem' in entities:
        co_founders = ['knut', 'andre-gilje', 'dag-meltveit']
        for founder in co_founders:
            if founder in entities and founder != 'knut':  # Avoid duplicate
                edges.append({"from": founder, "to": "taksthjem", "relation": "co-founder"})
    
    # Martin's project
    if 'martin-knutsen-tran' in entities and 'into-the-body' in entities:
        edges.append({"from": "martin-knutsen-tran", "to": "into-the-body", "relation": "creator"})
    
    # Andre's project
    if 'andre-gilje' in entities and 'boretunet' in entities:
        edges.append({"from": "andre-gilje", "to": "boretunet", "relation": "owner"})
    
    # Technology relationships from infra.md
    tech_relationships = {
        'mission-control': ['next.js', 'google-workspace'],
        'google-workspace': ['gmail', 'calendar'],
    }
    
    for project, techs in tech_relationships.items():
        if project in entities:
            for tech in techs:
                if tech in entities:
                    edges.append({"from": project, "to": tech, "relation": "uses"})
    
    # Investment relationships (Knut interested in specific stocks)
    investment_stocks = ['sampo', 'novo', 'protector', 'bravida', 'coor']
    if 'knut' in entities:
        for stock in investment_stocks:
            if stock in entities:
                edges.append({"from": "knut", "to": stock, "relation": "interested_in"})
    
    return edges

def main():
    """Main function to build the relationship graph."""
    workspace_path = Path('/Users/knut/.openclaw/workspace')
    memory_path = workspace_path / 'memory'
    
    print("Building relationship graph for OpenClaw memory system...")
    
    # Load source files
    people_content = load_file_content(memory_path / 'people.md')
    projects_content = load_file_content(memory_path / 'projects.md')
    infra_content = load_file_content(memory_path / 'infra.md')
    context_content = load_file_content(memory_path / 'context-index.json')
    
    # Extract entities
    entities = {}
    
    # Extract from each source
    entities.update(extract_people(people_content))
    entities.update(extract_projects(projects_content))
    entities.update(extract_infra(infra_content))
    entities.update(extract_stocks_from_context(context_content))
    
    print(f"Found {len(entities)} entities:")
    for entity_type in ['person', 'project', 'tool', 'stock']:
        count = sum(1 for e in entities.values() if e['type'] == entity_type)
        print(f"  - {count} {entity_type}{'s' if count != 1 else ''}")
    
    # Build relationships
    edges = build_relationships(entities, people_content, projects_content, infra_content)
    
    print(f"Built {len(edges)} relationships")
    
    # Create the graph
    graph = {
        "entities": entities,
        "edges": edges,
        "updatedAt": datetime.now().isoformat(),
        "stats": {
            "entity_count": len(entities),
            "edge_count": len(edges),
            "entity_types": {
                entity_type: sum(1 for e in entities.values() if e['type'] == entity_type)
                for entity_type in ['person', 'project', 'tool', 'stock']
            }
        }
    }
    
    # Save to file
    output_path = memory_path / 'relations.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(graph, f, indent=2, ensure_ascii=False)
    
    print(f"\nRelationship graph saved to: {output_path}")
    print(f"Total entities: {graph['stats']['entity_count']}")
    print(f"Total edges: {graph['stats']['edge_count']}")
    
    # Show sample relationships
    print("\nSample relationships:")
    for i, edge in enumerate(edges[:10]):  # Show first 10 edges
        from_entity = entities.get(edge['from'], {}).get('display_name', edge['from'])
        to_entity = entities.get(edge['to'], {}).get('display_name', edge['to'])
        print(f"  {from_entity} --[{edge['relation']}]--> {to_entity}")
    
    if len(edges) > 10:
        print(f"  ... and {len(edges) - 10} more")

if __name__ == '__main__':
    main()
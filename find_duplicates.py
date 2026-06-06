import os
import re
from collections import defaultdict

data_dir = 'app/src/data'
files = [f for f in os.listdir(data_dir) if f.startswith('questions-') and f.endswith('.ts')]

id_map = defaultdict(list)

for file in files:
    with open(os.path.join(data_dir, file), 'r') as f:
        content = f.read()
        
        matches = re.finditer(r'id:\s*(\d+),\s*category:\s*[\'"]([^\'"]+)[\'"]', content)
        for match in matches:
            qid = int(match.group(1))
            cat = match.group(2)
            id_map[qid].append((file, cat))

duplicates = {k: v for k, v in id_map.items() if len(v) > 1}

print(f"Found {len(duplicates)} duplicate IDs")
for qid, usages in sorted(duplicates.items()):
    print(f"ID {qid}:")
    for usage in usages:
        print(f"  - {usage[0]} ({usage[1]})")

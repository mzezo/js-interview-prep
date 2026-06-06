import os
import re

data_dir = 'app/src/data'
files = sorted([f for f in os.listdir(data_dir) if f.startswith('questions-') and f.endswith('.ts')])

for file in files:
    with open(os.path.join(data_dir, file), 'r') as f:
        content = f.read()
        
        print(f"--- {file} ---")
        matches = re.finditer(r'id:\s*(\d+)', content)
        ids = [int(m.group(1)) for m in matches]
        print(ids)

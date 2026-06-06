import os
import re

data_dir = 'app/src/data'
files = ['questions-1.ts', 'questions-5.ts']

for file in files:
    with open(os.path.join(data_dir, file), 'r') as f:
        content = f.read()
        
        # Regex to find id, category, and title
        matches = re.finditer(r'id:\s*(\d+),\s*category:\s*[\'"]([^\'"]+)[\'"],\s*title:\s*[\'"`]([^\'"`\n]+)[\'"`]', content)
        for match in matches:
            qid = match.group(1)
            cat = match.group(2)
            title = match.group(3)
            if cat == 'fundamentals':
                print(f"File: {file} | ID: {qid} | Title: {title}")

import os
import re

data_dir = 'app/src/data'
files = [
    'questions-1.ts',
    'questions-2.ts',
    'questions-3.ts',
    'questions-4.ts',
    'questions-5.ts',
    'questions-6.ts'
]

current_id = 1

for file in files:
    filepath = os.path.join(data_dir, file)
    with open(filepath, 'r') as f:
        content = f.read()

    # The regex carefully matches 'id:' followed by digits, only if it's the id property of an object
    # e.g., looks for \n    id: 123,
    
    def replacer(match):
        global current_id
        new_id = current_id
        current_id += 1
        return f"{match.group(1)}id: {new_id},"

    # Match whitespace + id: + number + comma
    new_content = re.sub(r'(\s+)id:\s*\d+,', replacer, content)

    with open(filepath, 'w') as f:
        f.write(new_content)

print(f"Successfully reassigned IDs up to {current_id - 1}")

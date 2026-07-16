import sqlite3
import json

DB_PATH = 'C:/Users/maste/.local/share/mimocode/mimocode.db'
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Get user messages from all sessions (to understand what was requested)
print("\n--- User Messages (recent sessions) ---")
cursor.execute("""
    SELECT m.id, m.session_id, m.time_created,
           json_extract(m.data, '$.role') as role,
           json_extract(m.data, '$.content') as content
    FROM message m
    WHERE json_extract(m.data, '$.role') = 'user'
    ORDER BY m.time_created DESC
    LIMIT 20
""")
for r in cursor.fetchall():
    content = r[4] if r[4] else "(no content)"
    if len(content) > 200:
        content = content[:200] + "..."
    print(f"  Session {r[1]} ({r[2]}): {content}")

# Get assistant messages to see what was done
print("\n\n--- Assistant Messages (recent sessions) ---")
cursor.execute("""
    SELECT m.id, m.session_id, m.time_created,
           json_extract(m.data, '$.role') as role,
           json_extract(m.data, '$.content') as content
    FROM message m
    WHERE json_extract(m.data, '$.role') = 'assistant'
    ORDER BY m.time_created DESC
    LIMIT 15
""")
for r in cursor.fetchall():
    content = r[4] if r[4] else "(no content)"
    if len(content) > 200:
        content = content[:200] + "..."
    print(f"  Session {r[1]} ({r[2]}): {content}")

# Get parts with tool calls to see what workflows were executed
print("\n\n--- Tool Call Details (recent) ---")
cursor.execute("""
    SELECT p.id, p.session_id, p.time_created,
           json_extract(p.data, '$.tool') as tool,
           json_extract(p.data, '$.state.input') as input_data
    FROM part p
    WHERE json_extract(p.data, '$.type') = 'tool'
    ORDER BY p.time_created DESC
    LIMIT 30
""")
for r in cursor.fetchall():
    input_data = r[4] if r[4] else "(no input)"
    if len(input_data) > 150:
        input_data = input_data[:150] + "..."
    print(f"  Session {r[1]} | Tool: {r[3]} | {input_data}")

# Check session titles and summaries
print("\n\n--- Session Details ---")
cursor.execute("""
    SELECT id, title, 
           json_extract(context_from, '$.title') as context_title,
           summary_additions, summary_deletions, summary_files
    FROM session
    ORDER BY time_created DESC
""")
for r in cursor.fetchall():
    print(f"  {r[0]}: {r[1]} | adds={r[3]} dels={r[4]} files={r[5]}")

conn.close()

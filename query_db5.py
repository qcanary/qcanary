import sqlite3
import json

DB_PATH = 'C:/Users/maste/.local/share/mimocode/mimocode.db'
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Get all sessions with their titles and summaries
print("\n--- All Sessions ---")
cursor.execute("""
    SELECT id, title, time_created,
           summary_additions, summary_deletions, summary_files
    FROM session
    ORDER BY time_created DESC
""")
for r in cursor.fetchall():
    print(f"  {r[0]}: {r[1]} | +{r[3]} -{r[4]} {r[5]} files")

# Check for repeated user requests across sessions
print("\n\n--- User Messages Across All Sessions ---")
cursor.execute("""
    SELECT m.session_id, m.time_created,
           json_extract(m.data, '$.content') as content
    FROM message m
    WHERE json_extract(m.data, '$.role') = 'user'
    ORDER BY m.time_created
""")
for r in cursor.fetchall():
    content = r[2] if r[2] else "(no content)"
    if len(content) > 100:
        content = content[:100] + "..."
    print(f"  Session {r[0]}: {content}")

# Check for any workflow_run data
print("\n\n--- Workflow Runs ---")
cursor.execute("SELECT * FROM workflow_run LIMIT 10")
cols = [desc[0] for desc in cursor.description]
for r in cursor.fetchall():
    print(f"  {dict(zip(cols, r))}")

# Check for any repeated file access patterns
print("\n\n--- Repeated File Access ---")
cursor.execute("""
    SELECT json_extract(p.data, '$.state.input') as input_data,
           count(*) as n
    FROM part p
    WHERE json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') = 'read'
    GROUP BY input_data
    HAVING n >= 2
    ORDER BY n DESC
    LIMIT 10
""")
for r in cursor.fetchall():
    input_data = r[0] if r[0] else "(no input)"
    if len(input_data) > 100:
        input_data = input_data[:100] + "..."
    print(f"  n={r[1]}: {input_data}")

conn.close()

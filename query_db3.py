import sqlite3
import json

DB_PATH = 'C:/Users/maste/.local/share/mimocode/mimocode.db'
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Get session diffs to see what files were changed
print("\n--- Session Diffs (what files changed) ---")
cursor.execute("""
    SELECT id, title, summary_diffs
    FROM session
    WHERE summary_diffs IS NOT NULL
    ORDER BY time_created DESC
""")
for r in cursor.fetchall():
    print(f"\nSession {r[0]}: {r[1]}")
    if r[2]:
        try:
            diffs = json.loads(r[2])
            for diff in diffs:
                if isinstance(diff, dict):
                    print(f"  File: {diff.get('file', 'unknown')}")
                else:
                    print(f"  {diff}")
        except:
            print(f"  Raw: {r[2][:200]}")

# Get the actual text content of messages (not just the metadata)
print("\n\n--- Full Message Text (recent) ---")
cursor.execute("""
    SELECT m.id, m.session_id, m.time_created,
           json_extract(m.data, '$.role') as role
    FROM message m
    WHERE json_extract(m.data, '$.role') IN ('user', 'assistant')
    ORDER BY m.time_created DESC
    LIMIT 10
""")
messages = cursor.fetchall()
for msg in messages:
    msg_id = msg[0]
    role = msg[3]
    print(f"\n--- {role} message {msg_id} ---")
    
    # Get all parts for this message
    cursor.execute("""
        SELECT data FROM part 
        WHERE message_id = ?
        ORDER BY time_created
    """, (msg_id,))
    parts = cursor.fetchall()
    for part_data in parts:
        try:
            part = json.loads(part_data[0])
            ptype = part.get('type', '')
            if ptype == 'text':
                text = part.get('text', '')
                if text:
                    print(f"  TEXT: {text[:300]}...")
            elif ptype == 'tool':
                tool = part.get('tool', '')
                state = part.get('state', {})
                output = state.get('output', '')
                if output:
                    print(f"  TOOL {tool}: {str(output)[:300]}...")
        except:
            pass

# Get workflow_run data
print("\n\n--- Workflow Runs ---")
cursor.execute("""
    SELECT id, session_id, name, status, current_phase, 
           succeeded, failed, error
    FROM workflow_run
    ORDER BY time_created DESC
    LIMIT 10
""")
for r in cursor.fetchall():
    print(f"  Workflow {r[0]}: {r[2]} [{r[3]}] phase={r[4]} ok={r[5]} fail={r[6]}")

conn.close()

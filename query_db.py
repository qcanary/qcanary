import sqlite3
import json

DB_PATH = 'C:/Users/maste/.local/share/mimocode/mimocode.db'
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Get recent sessions (last 30 days)
print("\n--- Recent Sessions ---")
cursor.execute("""
    SELECT id, time_created, title
    FROM session 
    ORDER BY time_created DESC 
    LIMIT 30
""")
sessions = cursor.fetchall()
for s in sessions:
    print(f"Session {s[0]}: {s[2]} (created: {s[1]})")

# Get message counts per session
print("\n\n--- Message Counts per Session ---")
cursor.execute("""
    SELECT session_id, count(*) as msg_count
    FROM message
    GROUP BY session_id
    ORDER BY msg_count DESC
    LIMIT 20
""")
for r in cursor.fetchall():
    print(f"Session {r[0]}: {r[1]} messages")

# Get tool usage patterns
print("\n\n--- Tool Usage Patterns ---")
cursor.execute("""
    SELECT json_extract(p.data, '$.tool') as tool,
           count(*) as n
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
    GROUP BY tool
    ORDER BY n DESC
    LIMIT 30
""")
for r in cursor.fetchall():
    print(f"{r[0]}: {r[1]} calls")

# Get repeated tool input patterns (top combos)
print("\n\n--- Repeated Tool Input Patterns ---")
cursor.execute("""
    SELECT json_extract(p.data, '$.tool') as tool,
           substr(json_extract(p.data, '$.state.input'), 1, 120) as input_preview,
           count(*) as n
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
    GROUP BY tool, input_preview
    HAVING n >= 2
    ORDER BY n DESC
    LIMIT 30
""")
for r in cursor.fetchall():
    print(f"  {r[0]} | n={r[2]} | {r[1]}")

# Get project info
print("\n\n--- Project Info ---")
cursor.execute("SELECT id, name, time_created FROM project")
for r in cursor.fetchall():
    print(f"  Project {r[0]}: {r[1]} (created: {r[2]})")

# Get tasks
print("\n\n--- Tasks ---")
cursor.execute("""
    SELECT t.id, t.session_id, t.status, t.summary, t.owner
    FROM task t
    ORDER BY t.created_at DESC
    LIMIT 20
""")
for r in cursor.fetchall():
    print(f"  Task {r[0]}: [{r[2]}] {r[3]} (owner: {r[4]}, session: {r[1]})")

conn.close()

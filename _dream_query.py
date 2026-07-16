import sqlite3, json, sys

DB = r"C:\Users\maste\.local\share\mimocode\mimocode.db"
conn = sqlite3.connect(DB)
cur = conn.cursor()

# 1. List tables
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cur.fetchall()]
print("=== TABLES ===")
print(tables)

# 2. List sessions for this project
print("\n=== SESSIONS (newest first) ===")
cur.execute("""
    SELECT id, project_id, title, time_created, directory
    FROM session
    ORDER BY time_created DESC
    LIMIT 20
""")
for row in cur.fetchall():
    sid, pid, title, t, d = row
    print(f"  {sid} | proj={pid} | t={t} | title={title} | dir={d}")

# 3. Session count and message count per session
print("\n=== MESSAGE COUNTS PER SESSION ===")
cur.execute("""
    SELECT session_id, COUNT(*) as msg_count
    FROM message
    GROUP BY session_id
    ORDER BY msg_count DESC
""")
for row in cur.fetchall():
    print(f"  {row[0]}: {row[1]} messages")

# 4. Check part types available
print("\n=== PART TYPES ===")
cur.execute("""
    SELECT json_extract(data, '$.type') as pt, COUNT(*) as cnt
    FROM part
    GROUP BY pt
    ORDER BY cnt DESC
""")
for row in cur.fetchall():
    print(f"  {row[0]}: {row[1]}")

conn.close()

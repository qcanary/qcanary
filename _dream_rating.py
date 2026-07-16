import sqlite3, json

DB = r"C:\Users\maste\.local\share\mimocode\mimocode.db"
conn = sqlite3.connect(DB)
cur = conn.cursor()

SID = "ses_094004ad6ffeeg1Ak4mFT7XoGD"

# Get ALL parts from the last 2 messages
print("=== LAST 2 MESSAGES OF BRUTAL RATING SESSION ===")
cur.execute("""
    SELECT m.id, m.time_created
    FROM message m
    WHERE m.session_id = ? AND json_extract(m.data, '$.role') = 'assistant'
    ORDER BY m.time_created DESC
    LIMIT 2
""", (SID,))
last_msgs = cur.fetchall()
for msg_id, t in last_msgs:
    print(f"\n--- MSG {msg_id} (t={t}) ---")
    cur.execute("""
        SELECT id, json_extract(data, '$.type') as pt, json_extract(data, '$.tool') as tool,
               json_extract(data, '$.text') as text,
               json_extract(data, '$.state.output') as output
        FROM part
        WHERE message_id = ?
        ORDER BY time_created
    """, (msg_id,))
    for pid, pt, tool, text, output in cur.fetchall():
        print(f"  Part {pid}: type={pt}, tool={tool}")
        if text:
            print(f"    TEXT: {text[:2000]}")
        if output:
            out_str = str(output)[:2000]
            print(f"    OUTPUT: {out_str}")

# Also get the full reasoning from the last few messages
print("\n=== FULL REASONING FROM LAST 3 MESSAGES ===")
cur.execute("""
    SELECT m.id, p.id as pid, json_extract(p.data, '$.text') as text
    FROM part p
    JOIN message m ON p.message_id = m.id
    WHERE m.session_id = ? AND json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'reasoning'
    ORDER BY m.time_created DESC
    LIMIT 3
""", (SID,))
for msg_id, pid, text in cur.fetchall():
    print(f"\n--- MSG {msg_id} reasoning ---")
    if text:
        print(text[:3000])

conn.close()

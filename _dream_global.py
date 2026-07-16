import sqlite3, json

DB = r"C:\Users\maste\.local\share\mimocode\mimocode.db"
conn = sqlite3.connect(DB)
cur = conn.cursor()

# Check global sessions for user statements
for sid, title in [
    ("ses_09453866cffemVLIbTlx7Cciwl", "Hi (global)"),
    ("ses_09453859bffe40M32vc7KGXgps", "Hi (global)"),
    ("ses_0945385edffeMmIlapo5ovBqqm", "Will you be my girlfriend"),
]:
    print(f"\n=== {title} ({sid}) ===")
    cur.execute("""
        SELECT m.id, json_extract(m.data, '$.role') as role, json_extract(m.data, '$.content') as content
        FROM message m
        WHERE m.session_id = ?
        ORDER BY m.time_created
    """, (sid,))
    for msg_id, role, content in cur.fetchall():
        content_str = str(content)[:500] if content else "(none)"
        print(f"  MSG {msg_id} | role={role} | content={content_str}")

    cur.execute("""
        SELECT json_extract(p.data, '$.type') as pt, json_extract(p.data, '$.text') as text
        FROM part p
        JOIN message m ON p.message_id = m.id
        WHERE m.session_id = ? AND json_extract(p.data, '$.type') = 'text'
        ORDER BY m.time_created
    """, (sid,))
    for pt, text in cur.fetchall():
        if text:
            print(f"  TEXT: {text[:500]}")

conn.close()

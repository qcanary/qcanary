import sqlite3, json

DB = r"C:\Users\maste\.local\share\mimocode\mimocode.db"
conn = sqlite3.connect(DB)
cur = conn.cursor()

# Get all text parts from all project sessions
for sid_label, sid in [
    ("AUTO DREAM", "ses_094004926ffeCyfVCzk9G9jymy"),
    ("AUTO DISTILL", "ses_094004910ffeeLhBebBAvlxo3O"),
    ("CHECKPOINT WRITER", "ses_093ffa272ffeb9hreM1jZGb5u6"),
]:
    print(f"\n{'='*60}")
    print(f"=== {sid_label} ({sid}) ===")
    print(f"{'='*60}")
    cur.execute("""
        SELECT m.id, json_extract(m.data, '$.role') as role,
               json_extract(p.data, '$.type') as pt,
               json_extract(p.data, '$.text') as text,
               json_extract(p.data, '$.tool') as tool,
               json_extract(p.data, '$.state.output') as output
        FROM part p
        JOIN message m ON p.message_id = m.id
        WHERE m.session_id = ?
        ORDER BY m.time_created, p.time_created
    """, (sid,))
    for msg_id, role, pt, text, tool, output in cur.fetchall():
        if pt == 'text' and text:
            print(f"\n--- TEXT (msg={msg_id}, role={role}) ---")
            print(text[:2000])
        elif pt == 'tool' and tool:
            out_str = str(output)[:500] if output else ""
            print(f"\n--- TOOL:{tool} (msg={msg_id}, role={role}) ---")
            print(f"  output preview: {out_str}")

conn.close()

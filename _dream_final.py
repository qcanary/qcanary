import sqlite3, json

DB = r"C:\Users\maste\.local\share\mimocode\mimocode.db"
conn = sqlite3.connect(DB)
cur = conn.cursor()

# Get the final text from the Brutal rating session
SID = "ses_094004ad6ffeeg1Ak4mFT7XoGD"
print("=== FINAL TEXT OUTPUT FROM BRUTAL RATING SESSION ===")
cur.execute("""
    SELECT p.id, json_extract(p.data, '$.type') as pt, json_extract(p.data, '$.text') as text
    FROM part p
    JOIN message m ON p.message_id = m.id
    WHERE m.session_id = ? AND json_extract(p.data, '$.type') = 'text'
    ORDER BY m.time_created, p.time_created
""", (SID,))
for pid, pt, text in cur.fetchall():
    if text:
        print(f"\n--- TEXT PART {pid} ---")
        print(text)

# Also check the reasoning for context
print("\n=== REASONING FROM BRUTAL RATING SESSION ===")
cur.execute("""
    SELECT p.id, json_extract(p.data, '$.text') as text
    FROM part p
    JOIN message m ON p.message_id = m.id
    WHERE m.session_id = ? AND json_extract(p.data, '$.type') = 'reasoning'
    ORDER BY m.time_created, p.time_created
""", (SID,))
for pid, text in cur.fetchall():
    if text:
        print(f"\n--- REASONING PART {pid} ---")
        print(text[:1000])

# Now check the Auto Distill session
print("\n\n=== AUTO DISTILL SESSION (ses_094004910ffeeLhBebBAvlxo3O) ===")
cur.execute("""
    SELECT m.id, json_extract(m.data, '$.role') as role, m.time_created
    FROM message m
    WHERE m.session_id = 'ses_094004910ffeeLhBebBAvlxo3O'
    ORDER BY m.time_created
""")
for row in cur.fetchall():
    print(f"  MSG {row[0]} | role={row[1]} | t={row[2]}")

# Check Auto Dream session (this session)
print("\n=== AUTO DREAM SESSION (ses_094004926ffeCyfVCzk9G9jymy) - current ===")
cur.execute("""
    SELECT m.id, json_extract(m.data, '$.role') as role, m.time_created
    FROM message m
    WHERE m.session_id = 'ses_094004926ffeCyfVCzk9G9jymy'
    ORDER BY m.time_created
""")
for row in cur.fetchall():
    print(f"  MSG {row[0]} | role={row[1]} | t={row[2]}")

# Check checkpoint-writer session
print("\n=== CHECKPOINT WRITER SESSION (ses_093ffa272ffeb9hreM1jZGb5u6) ===")
cur.execute("""
    SELECT m.id, json_extract(m.data, '$.role') as role, m.time_created
    FROM message m
    WHERE m.session_id = 'ses_093ffa272ffeb9hreM1jZGb5u6'
    ORDER BY m.time_created
""")
for row in cur.fetchall():
    print(f"  MSG {row[0]} | role={row[1]} | t={row[2]}")

conn.close()

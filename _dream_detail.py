import sqlite3, json

DB = r"C:\Users\maste\.local\share\mimocode\mimocode.db"
conn = sqlite3.connect(DB)
cur = conn.cursor()

# Get the "Brutal rating" session details
SID = "ses_094004ad6ffeeg1Ak4mFT7XoGD"

print(f"=== MESSAGES AND PARTS FOR {SID} ===")
cur.execute("""
    SELECT m.id, json_extract(m.data, '$.role') as role, m.agent_id, m.time_created,
           json_extract(m.data, '$.content') as content_preview
    FROM message m
    WHERE m.session_id = ?
    ORDER BY m.time_created
""", (SID,))
messages = cur.fetchall()
for msg_id, role, agent_id, t, content in messages:
    content_str = str(content)[:500] if content else "(none)"
    print(f"\n--- MSG {msg_id} | role={role} | agent={agent_id} | t={t} ---")
    print(f"  content: {content_str}")

    # Get parts for this message
    cur.execute("""
        SELECT id, json_extract(data, '$.type') as pt, json_extract(data, '$.tool') as tool,
               json_extract(data, '$.text') as text,
               json_extract(data, '$.state.input') as input_preview,
               json_extract(data, '$.state.output') as output_preview
        FROM part
        WHERE message_id = ?
        ORDER BY time_created
    """, (msg_id,))
    parts = cur.fetchall()
    for pid, pt, tool, text, inp, out in parts:
        if pt == 'text' and text:
            print(f"  [text] {str(text)[:600]}")
        elif pt == 'tool' and tool:
            inp_str = str(inp)[:400] if inp else ""
            out_str = str(out)[:400] if out else ""
            print(f"  [tool:{tool}] input={inp_str}")
            print(f"           output={out_str}")
        elif pt == 'reasoning':
            print(f"  [reasoning] {str(text)[:400] if text else '(no text)'}")
        elif pt == 'step-start':
            print(f"  [step-start]")
        elif pt == 'step-finish':
            print(f"  [step-finish]")
        elif pt == 'patch':
            print(f"  [patch] {str(text)[:400] if text else ''}")

conn.close()

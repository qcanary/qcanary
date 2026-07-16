import sqlite3
import json

DB_PATH = 'C:/Users/maste/.local/share/mimocode/mimocode.db'
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Get the "Brutal rating" session content to understand what was done
print("\n--- Brutal Rating Session (ses_094004ad6ffeeg1Ak4mFT7XoGD) ---")
cursor.execute("""
    SELECT m.id, m.time_created,
           json_extract(m.data, '$.role') as role
    FROM message m
    WHERE m.session_id = 'ses_094004ad6ffeeg1Ak4mFT7XoGD'
    ORDER BY m.time_created
""")
messages = cursor.fetchall()
for msg in messages:
    msg_id = msg[0]
    role = msg[2]
    
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
                if text and len(text) > 10:
                    print(f"\n--- {role} TEXT ---")
                    print(text[:500])
            elif ptype == 'tool':
                tool = part.get('tool', '')
                state = part.get('state', {})
                output = state.get('output', '')
                if output and len(str(output)) > 10:
                    print(f"\n--- {role} TOOL: {tool} ---")
                    print(str(output)[:300])
        except:
            pass

# Also check what files were in the project
print("\n\n--- Project Files (from glob results) ---")
cursor.execute("""
    SELECT data FROM part 
    WHERE session_id = 'ses_094004ad6ffeeg1Ak4mFT7XoGD'
      AND json_extract(data, '$.tool') = 'glob'
    ORDER BY time_created
""")
for part_data in cursor.fetchall():
    try:
        part = json.loads(part_data[0])
        state = part.get('state', {})
        output = state.get('output', '')
        if output:
            print(f"Glob result: {str(output)[:500]}")
    except:
        pass

conn.close()

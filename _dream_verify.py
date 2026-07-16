import sqlite3, json

DB = r"C:\Users\maste\.local\share\mimocode\mimocode.db"
conn = sqlite3.connect(DB)
cur = conn.cursor()

# Verify: agent package is MIT licensed
print("=== Verify: @qcanary/agent MIT license ===")
cur.execute("""
    SELECT json_extract(p.data, '$.text') as text
    FROM part p
    JOIN message m ON p.message_id = m.id
    WHERE m.session_id = 'ses_094004ad6ffeeg1Ak4mFT7XoGD'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') = 'read'
    ORDER BY m.time_created
""")
for (text,) in cur.fetchall():
    if text and 'mit' in str(text).lower():
        print(f"  Found MIT reference: {str(text)[:300]}")

# Verify: plan tiers from test file
print("\n=== Verify: plan tiers ===")
cur.execute("""
    SELECT json_extract(p.data, '$.state.output') as output
    FROM part p
    JOIN message m ON p.message_id = m.id
    WHERE m.session_id = 'ses_094004ad6ffeeg1Ak4mFT7XoGD'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') = 'read'
    ORDER BY m.time_created
""")
for (output,) in cur.fetchall():
    if output and 'plan-limits' in str(output):
        print(f"  Found plan-limits test: {str(output)[:500]}")

# Verify: SSRF protection in alertDelivery
print("\n=== Verify: SSRF protection ===")
cur.execute("""
    SELECT json_extract(p.data, '$.state.output') as output
    FROM part p
    JOIN message m ON p.message_id = m.id
    WHERE m.session_id = 'ses_094004ad6ffeeg1Ak4mFT7XoGD'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') = 'read'
    ORDER BY m.time_created
""")
for (output,) in cur.fetchall():
    if output and 'ssrf' in str(output).lower():
        print(f"  Found SSRF protection: {str(output)[:300]}")

# Verify: anomaly baselines migration
print("\n=== Verify: anomaly baselines ===")
cur.execute("""
    SELECT json_extract(p.data, '$.state.output') as output
    FROM part p
    JOIN message m ON p.message_id = m.id
    WHERE m.session_id = 'ses_094004ad6ffeeg1Ak4mFT7XoGD'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') = 'read'
    ORDER BY m.time_created
""")
for (output,) in cur.fetchall():
    if output and 'anomaly' in str(output).lower():
        print(f"  Found anomaly baselines: {str(output)[:300]}")

conn.close()

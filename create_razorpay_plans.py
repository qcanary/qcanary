#!/usr/bin/env python3
"""Create Razorpay plans for Qcanary using the API."""
import urllib.request
import urllib.error
import json
import base64
import sys

KEY_ID = "rzp_test_SmbAK3N0roeIQx"
KEY_SECRET = "7hUADWmFTOAAOYOxLGSaKn1J"
AUTH = f"Basic {base64.b64encode(f'{KEY_ID}:{KEY_SECRET}'.encode()).decode()}"

def api_call(method, path, data=None):
    url = f"https://api.razorpay.com{path}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header("Authorization", AUTH)
    req.add_header("Content-Type", "application/json")
    try:
        resp = urllib.request.urlopen(req)
        return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        err_text = e.read().decode()
        print(f"ERROR {e.code} on {method} {path}: {err_text[:300]}")
        sys.exit(1)

def create_plan(name, amount_usd, description):
    payload = {
        "period": "monthly",
        "interval": 1,
        "item": {
            "name": name,
            "amount": amount_usd * 100,
            "currency": "USD",
            "description": description,
        },
    }
    result = api_call("POST", "/v1/plans", payload)
    return result["id"]

# Test connectivity first
print("Testing API connectivity...")
try:
    api_call("GET", "/v1/payments?count=1")
    print("  GET /v1/payments: OK")
except:
    print("  GET /v1/payments: FAILED")
    sys.exit(1)

print("\nCreating plans...")
starter_id = create_plan("Qcanary Starter", 9, "3 projects, 10 queues, 30-day history, Slack/email alerts")
print(f"  Starter: {starter_id}")

pro_id = create_plan("Qcanary Pro", 24, "Unlimited projects/queues, 90-day history, webhook alerts")
print(f"  Pro: {pro_id}")

print("\n=== PLAN IDS ===")
print(f"RAZORPAY_STARTER_PLAN_ID={starter_id}")
print(f"RAZORPAY_PRO_PLAN_ID={pro_id}")
print("=== DONE ===")

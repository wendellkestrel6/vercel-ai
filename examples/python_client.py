"""Minimal Argolink client example; credentials stay in the environment."""
import os
import requests

BASE = os.getenv("ARGOLINK_BASE_URL", "https://api.argolink.io")
KEY = os.environ["ARGOLINK_API_KEY"]
response = requests.post(
    f"{BASE}/v1/videos/generations",
    headers={"Authorization": f"Bearer {KEY}"},
    json={"model": "seedance-2.5", "prompt": "A paper lantern rises at dusk", "duration": 6},
    timeout=60,
)
response.raise_for_status()
print(response.json()["request_id"])

import json
import re
import sys

data = json.load(sys.stdin)
text = data.get("prompt", "")

if re.search(r"acme_live_[A-Za-z0-9]{24}", text):
    print(json.dumps({
        "decision": "block",
        "reason": "Blocked: this prompt contains an ACME API key. Remove the key and send it again."
    }))

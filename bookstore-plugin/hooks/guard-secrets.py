# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""UserPromptSubmit hook: block a prompt that contains an ACME API key,
before the prompt leaves the laptop.

Same script as exercise 4, task 3. The hook runs on the text the user
types, never on what Claude reads with its tools; the `Read(.env)` rule
in the exercise covers that side."""

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

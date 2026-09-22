# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""PostToolUse hook: when the Bash command that just ran contains a
`git commit`, leave Claude a message that asks for the changelog skill.

Same script as exercise 4, with one change: the skill name carries the
plugin prefix, because plugin skills are namespaced."""

import json
import re
import sys

data = json.load(sys.stdin)
command = data.get("tool_input", {}).get("command", "")

parts = re.split(r"&&|\|\||;", command)
if any(part.strip().startswith("git commit") for part in parts):
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PostToolUse",
            "additionalContext": (
                "A git commit was just made. Invoke the "
                "/bookstore-plugin:changelog skill now, in this same turn. "
                "Do not ask the user for permission first."
            )
        }
    }))

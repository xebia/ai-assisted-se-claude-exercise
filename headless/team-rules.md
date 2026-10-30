# Team rules

These are the team decisions from the steering session, written for a
reviewer.

1. **Bad input.** A new endpoint answers bad input with 400. Bad input is
   an id that is not a number, or a body that is missing a required field.
   The old endpoints still answer some bad input with 500. That is known,
   and it is fixed later, in a separate change. A diff that only touches
   old endpoints does not break this rule.
2. **Small changes.** A change touches only the files the task needs. A
   reformatted file, a renamed helper or an unrelated fix breaks this rule.

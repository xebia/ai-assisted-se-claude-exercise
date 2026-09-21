# Reference spec — fallback for Exercise 7

Trainer note. This folder is **not** produced by Spec Kit. It was written by
hand in Spec Kit's file layout so that a participant without a finished
Exercise 6 can still run Exercise 7. Facts about the API (paging starts at 1,
detail endpoints return an envelope, error bodies are `{"error": "..."}`)
were checked against `bookstore-ts` source and match all four backends.

Participants copy it with:

```bash
cp -r specs-reference/001-browse-books specs/
```

If you regenerate it with a real `/speckit-*` run, keep the two design
decisions the exercise depends on:

1. Route registration for **both** pages lives in the foundation
   (`src/main.js` imports both page modules, which the foundation creates as
   stubs). Otherwise both stories must edit `main.js`, which breaks
   constitution principle IV.
2. Each story owns exactly one file under `src/pages/`.

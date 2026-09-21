export function writeJSON(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function writeError(status: number, msg: string): Response {
  return writeJSON(status, { error: msg });
}

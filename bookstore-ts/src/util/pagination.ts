// paginate returns [limit, offset] for the given page and size.
export function paginate(page: number, size: number): [number, number] {
  const p = Math.max(page, 1);
  return [size, (p - 1) * size];
}

// paginate returns [limit, offset] for the given page and size.
export function paginate(page: number, size: number): [number, number] {
  return [size, (page - 1) * size];
}

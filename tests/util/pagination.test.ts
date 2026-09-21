import { expect, test, describe } from "bun:test";
import { paginate } from "../../src/util/pagination";

describe("paginate", () => {
  const cases: { name: string; page: number; size: number; wantLimit: number; wantOffset: number }[] = [
    { name: "first page", page: 1, size: 10, wantLimit: 10, wantOffset: 0 },
    { name: "second page", page: 2, size: 10, wantLimit: 10, wantOffset: 10 },
    { name: "third page custom size", page: 3, size: 5, wantLimit: 5, wantOffset: 10 },
    { name: "large page", page: 100, size: 20, wantLimit: 20, wantOffset: 1980 },
  ];
  for (const tt of cases) {
    test(tt.name, () => {
      const [limit, offset] = paginate(tt.page, tt.size);
      expect(limit).toBe(tt.wantLimit);
      expect(offset).toBe(tt.wantOffset);
    });
  }
});

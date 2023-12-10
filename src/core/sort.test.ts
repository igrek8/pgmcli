import { test, expect, describe } from "vitest";
import { sort } from "./sort.js";
import { Migration } from "./migration.interface.js";

describe("sort", () => {
  test("sort with id", () => {
    const m1: Migration = { id: "a", created_at: 1 };
    const m2: Migration = { id: "b", created_at: 1 };
    const m3: Migration = { id: "c", created_at: 1 };
    expect([m3, m2, m1].sort(sort)).toEqual([m1, m2, m3]);
  });

  test("sort with timestamp", () => {
    const m1: Migration = { id: "a", created_at: 1 };
    const m2: Migration = { id: "a", created_at: 2 };
    const m3: Migration = { id: "a", created_at: 3 };
    expect([m3, m2, m1].sort(sort)).toEqual([m1, m2, m3]);
  });
});

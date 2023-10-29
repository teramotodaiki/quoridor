import { describe, expect, test } from "vitest";

import { getSelectables, stageFromValues } from "./stage";

// テストしやすいフォーマットに加工する
function tuple(positions: { X: number; Y: number }[]) {
  const sorted = [...positions].sort((a, b) => a.Y - b.Y + 0.01 * (a.X - b.Y));
  const tuples = sorted.map((v) => [v.X, v.Y]);
  return tuples;
}

describe("getSelectables", () => {
  test("initialized", () => {
    const stage = stageFromValues({
      players: [
        [4, 0],
        [4, 8],
      ],
      walls: [],
    });
    const player = stage.players[0];
    const selectables = getSelectables(player, stage);
    expect(tuple(selectables)).toStrictEqual([
      [3, 0],
      [5, 0],
      [4, 1],
    ]);
  });
});

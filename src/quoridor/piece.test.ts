import { describe, expect, test } from "vitest";

import { getSelectables, stageFromValues } from "./stage";

// テストしやすいフォーマットに加工する
function tuple(positions: { X: number; Y: number }[]) {
  const sorted = [...positions].sort((a, b) => a.Y - b.Y + 0.01 * (a.X - b.X));
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

  test("a horizontal wall is below of white", () => {
    const stage = stageFromValues({
      players: [
        [4, 0],
        [4, 8],
      ],
      walls: [[4, 1, "horizontal"]],
    });
    const white = stage.players[0];
    const black = stage.players[1];

    expect(tuple(getSelectables(white, stage))).toStrictEqual([
      [3, 0],
      [5, 0],
    ]);

    // ひとつ右のマスにおいても結果は同じ
    stage.walls[0].X = 5;
    expect(tuple(getSelectables(white, stage))).toStrictEqual([
      [3, 0],
      [5, 0],
    ]);

    // もう一方のプレイヤーは自由に動ける
    expect(tuple(getSelectables(black, stage))).toStrictEqual([
      [4, 7],
      [3, 8],
      [5, 8],
    ]);
  });
});

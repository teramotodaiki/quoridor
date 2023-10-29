import { describe, expect, test } from "vitest";

import { getSelectables, stageFromValues } from "./stage";

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
    expect(selectables).toStrictEqual([
      { X: 4, Y: 1 },
      { X: 3, Y: 0 },
      { X: 5, Y: 0 },
    ]);
  });
});

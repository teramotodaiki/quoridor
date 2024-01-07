import { expect, test } from "vitest";
import { GameManager } from "./game-manager";
import { Piece } from "./piece";

test("new Piece", () => {
  const player = new Piece(1, 2);
  expect(player.X).toBe(1);
  expect(player.Y).toBe(2);
});

test("showSelectableTiles", () => {
  const stage = GameManager.singleton;
  const white = new Piece(4, 4);
  const black = new Piece(4, 5);
  stage.players = [white, black];
  black.showSelectableTiles();
  expect(stage.selectableTilesContainer.children.length).toBe(4);
  expect(stage.selectableTilesContainer.children[0]).toContain({ X: 4, Y: 3 });
  expect(stage.selectableTilesContainer.children[1]).toContain({ X: 4, Y: 6 });
  expect(stage.selectableTilesContainer.children[2]).toContain({ X: 3, Y: 5 });
  expect(stage.selectableTilesContainer.children[3]).toContain({ X: 5, Y: 5 });
});

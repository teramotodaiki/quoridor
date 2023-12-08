import { useEffect, useReducer, useRef } from "react";
import "./App.css";
import { GameManager } from "./quoridor/game-manager";
import { init } from "./quoridor/init"; // Dynamic importしてもいい

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameManagerRef = useRef<GameManager | undefined>(undefined);
  const forceUpdate = useReducer((i) => i + 1, 0)[1];

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    init({ canvas: canvasRef.current }).then((gameManager) => {
      gameManagerRef.current = gameManager;
      gameManagerRef.current.subscribe(forceUpdate);
      forceUpdate();
    });
  }, []);

  const handleRevert = () => {
    gameManagerRef.current?.revert();
  };

  const remainWallNums = gameManagerRef.current?.remainWallNums ?? [0, 0];

  return (
    <>
      {/* {<h1>Quoridor</h1>} */}
      <div className="player player-white">
        <span>White: {remainWallNums[0]}</span>
      </div>
      <canvas id="game" ref={canvasRef}></canvas>
      <div className="player player-black">
        <span>Black: {remainWallNums[1]}</span>
      </div>
      <div className="fixed-menu">
        <button className="revert-button" onClick={handleRevert}>
          もどす
        </button>
      </div>
    </>
  );
}

export default App;

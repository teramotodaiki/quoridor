import { useEffect, useReducer, useRef } from "react";
import "./App.css";
import { Mode } from "./Root";
import { init } from "./quoridor/init"; // Dynamic importしてもいい

type GameManager = ReturnType<typeof init>;

interface AppProps {
  mode: Mode;
}

function App(props: AppProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initRef = useRef(false);
  const gameManagerRef = useRef<GameManager | undefined>(undefined);
  const forceUpdate = useReducer((i) => i + 1, 0)[1];

  useEffect(() => {
    if (!canvasRef.current || initRef.current) {
      return;
    }
    const gameManager = init({
      canvas: canvasRef.current,
      online: props.mode.online,
    });
    gameManagerRef.current = gameManager;
    gameManagerRef.current.subscribe(forceUpdate);
    forceUpdate();
    initRef.current = true;
  }, []);

  const handleRevert = () => {
    gameManagerRef.current?.revert();
  };

  const remainWallNums = gameManagerRef.current?.remainWallNums ?? [0, 0];
  const onSelect = gameManagerRef.current?.onSelect;
  const canRevert = gameManagerRef.current?.operations.length ?? 0 > 0;

  return (
    <>
      <div className="player player-white">
        <span>White: {remainWallNums[0]}</span>
      </div>
      <canvas id="game" ref={canvasRef}></canvas>
      <div className="player player-black">
        <span>Black: {remainWallNums[1]}</span>
      </div>
      <div className="fixed-menu">
        <a href="https://www.google.com/search?q=quoridor" target="blank">
          Quoridorとは？
        </a>
        <button
          className="revert-button"
          onClick={handleRevert}
          disabled={!canRevert}
        >
          もどす
        </button>
        <button
          className="select-button"
          onClick={onSelect}
          disabled={!onSelect}
        >
          決定
        </button>
      </div>
    </>
  );
}

export default App;

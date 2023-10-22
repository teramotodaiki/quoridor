import { useEffect, useRef } from "react";
import "./App.css";
import { init } from "./quoridor/init"; // Dynamic importしてもいい

function App() {
  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) {
      console.log("Already initialized.");
      return;
    }
    initRef.current = true;
    init().catch(console.error);
  }, []);

  return (
    <>
      <h1>Quoridor</h1>
    </>
  );
}

export default App;

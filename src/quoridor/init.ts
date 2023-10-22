import { Application, Sprite, Assets } from "pixi.js";

export async function init() {
  // The application will create a renderer using WebGL, if possible,
  // with a fallback to a canvas render. It will also setup the ticker
  // and the root stage PIXI.Container
  const app = new Application();

  // The application will create a canvas element for you that you
  // can then insert into the DOM
  const root = document.querySelector("#root");
  root?.appendChild(app.view);

  // load the texture we need
  const texture = await Assets.load("assets/sample.png");

  // This creates a texture from a 'bunny.png' image
  const bunny = new Sprite(texture);
  console.log(bunny);

  // Setup the position of the bunny
  bunny.x = app.renderer.width / 2;
  bunny.y = app.renderer.height / 2;

  // Rotate around the center
  bunny.anchor.x = 0.5;
  bunny.anchor.y = 0.5;

  // Add the bunny to the scene we are building
  app.stage.addChild(bunny);

  // // Listen for frame updates
  // app.ticker.add(() => {
  //   // each frame we spin the bunny around a bit
  //   bunny.rotation += 0.01;
  // });
  // Add a variable to count up the seconds our demo has been running
  let elapsed = 0.0;
  // Tell our application's ticker to run a new callback every frame, passing
  // in the amount of time that has passed since the last tick
  app.ticker.add((delta) => {
    // Add the time to our total elapsed time
    elapsed += delta;
    // Update the sprite's X position based on the cosine of our elapsed time.  We divide
    // by 50 to slow the animation down a bit...
    bunny.x = 100.0 + Math.cos(elapsed / 50.0) * 100.0;
  });
}

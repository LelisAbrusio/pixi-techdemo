import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

const Game: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create a new PIXI Application
    const app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x1099bb,
    });

    // Append the canvas to the container
    if (gameContainerRef.current) {
      gameContainerRef.current.appendChild(app.view as HTMLCanvasElement);
    }

    // Example: Create a simple rotating square
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xde3249);
    graphics.drawRect(-50, -50, 100, 100);
    graphics.endFill();
    graphics.x = app.renderer.width / 2;
    graphics.y = app.renderer.height / 2;
    app.stage.addChild(graphics);

    // Rotate the square on each frame
    app.ticker.add(() => {
      graphics.rotation += 0.01;
    });

    // Cleanup function: Destroy PIXI app when component unmounts
    return () => {
      app.destroy(true, { children: true });
    };
  }, []);

  return <div ref={gameContainerRef} />;
};

export default Game;

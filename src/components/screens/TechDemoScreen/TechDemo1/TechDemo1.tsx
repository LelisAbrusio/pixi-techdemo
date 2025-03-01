// TechDemo1.tsx
import React, { useRef, useEffect } from 'react';
import * as PIXI from 'pixi.js';

interface Animation {
  sprite: PIXI.Sprite;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startTime: number;
  duration: number;
  toContainer: PIXI.Container;
}

const TechDemo1: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const animations = useRef<Animation[]>([]);
  // Direction ref: "toRight" moves cards from leftStack to rightStack; "toLeft" does the opposite.
  const directionRef = useRef<"toRight" | "toLeft">("toRight");

  // Card and stack configuration.
  const cardWidth = 100;
  const cardHeight = 140;
  const cardOffset = 0.2; // Vertical offset between cards

  // Base positions for the two stacks.
  const leftStackPos = { x: 100, y: 100 };
  const rightStackPos = { x: 500, y: 100 };

  useEffect(() => {
    // Create PIXI application.
    const app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x000000,
      //resizeTo: window, // Uncomment if you want auto-resizing
    });
    appRef.current = app;
    containerRef.current?.appendChild(app.view as HTMLCanvasElement);

    // --- FPS Counter Setup ---
    const fpsText = new PIXI.Text("FPS: 0", {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0xffffff,
    });
    // Position FPS in top right.
    fpsText.x = 10;
    fpsText.y = 10;
    app.stage.addChild(fpsText);
    let frames = 0;
    let lastTime = performance.now();
    app.ticker.add(() => {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        fpsText.text = `FPS: ${frames}`;
        frames = 0;
        lastTime = now;
      }
    });
    // --- End FPS Counter Setup ---

    // Create left and right stack containers.
    const leftStack = new PIXI.Container();
    leftStack.position.set(leftStackPos.x, leftStackPos.y);
    
    const rightStack = new PIXI.Container();
    rightStack.position.set(rightStackPos.x, rightStackPos.y);
    
    app.stage.addChild(leftStack, rightStack);

    // Create 144 card sprites in the left stack.
    for (let i = 0; i < 144; i++) {
      const sprite = PIXI.Sprite.from(PIXI.Texture.WHITE);
      sprite.width = cardWidth;
      sprite.height = cardHeight;
      sprite.tint = Math.floor(Math.random() * 0xffffff);
      sprite.position.set(0, i * cardOffset);
      leftStack.addChild(sprite);
    }
    
    // Helper function to move a card from one container to another.
    const moveCard = (from: PIXI.Container, to: PIXI.Container) => {
      if (from.children.length > 0) {
        // Remove the top card.
        const sprite = from.children[from.children.length - 1] as PIXI.Sprite;
        from.removeChild(sprite);
        
        // Get its global position and reparent it to the stage.
        const globalPos = from.toGlobal(sprite.position, new PIXI.Point());
        app.stage.addChild(sprite);
        sprite.position.set(globalPos.x, globalPos.y);
        
        // Determine the destination based on the target container's current children.
        const destLocal = new PIXI.Point(0, to.children.length * cardOffset);
        const destGlobal = to.toGlobal(destLocal, new PIXI.Point());
        
        // Create and push the animation record.
        animations.current.push({
          sprite,
          startX: globalPos.x,
          startY: globalPos.y,
          endX: destGlobal.x,
          endY: destGlobal.y,
          startTime: app.ticker.lastTime,
          duration: 2000, // 2 seconds animation.
          toContainer: to,
        });
      }
    };

    // Every 1 second, move one card based on the current direction.
    const moveInterval = setInterval(() => {
      if (directionRef.current === "toRight") {
        if (leftStack.children.length > 0) {
          moveCard(leftStack, rightStack);
        } else {
          // When leftStack is empty, reverse direction.
          directionRef.current = "toLeft";
        }
      } else {
        if (rightStack.children.length > 0) {
          moveCard(rightStack, leftStack);
        } else {
          // When rightStack is empty, reverse direction.
          directionRef.current = "toRight";
        }
      }
    }, 1000);
    
    // Use PIXI's ticker to update animations.
    app.ticker.add(() => {
      const now = app.ticker.lastTime;
      animations.current = animations.current.filter((anim) => {
        const t = (now - anim.startTime) / anim.duration;
        if (t >= 1) {
          // Animation complete: snap to final position.
          anim.sprite.position.set(anim.endX, anim.endY);
          // Convert the global position to local coordinates of the destination container.
          const localPos = anim.toContainer.toLocal(new PIXI.Point(anim.endX, anim.endY));
          anim.toContainer.addChild(anim.sprite);
          anim.sprite.position.set(localPos.x, localPos.y);
          return false; // Remove the finished animation.
        } else {
          // Ease-in quadratic interpolation.
          const easeInT = t * t;
          const newX = anim.startX + (anim.endX - anim.startX) * easeInT;
          const newY = anim.startY + (anim.endY - anim.startY) * easeInT;
          anim.sprite.position.set(newX, newY);
          return true;
        }
      });
    });
    
    // Cleanup on component unmount.
    return () => {
      clearInterval(moveInterval);
      app.destroy(true, { children: true });
    };
  }, []);

  return <div ref={containerRef} />;
};

export default TechDemo1;

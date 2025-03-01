// TechDemo3.tsx
import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

interface SwirlParticle {
  sprite: PIXI.Sprite;
  life: number;
  maxLife: number;
  angle: number;       // current angle in radians
  radius: number;      // current distance from center
  angleSpeed: number;  // how quickly angle changes
  radiusSpeed: number; // how quickly radius grows
}

const TechDemo3: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Limit to 10 swirl particles at a time.
  const MAX_PARTICLES = 10;

  // Create a radial gradient for a golden swirl effect.
  const createGoldenTexture = (): PIXI.Texture => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return PIXI.Texture.WHITE;

    // A radial gradient from bright gold to transparent.
    const grad = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    grad.addColorStop(0, 'rgba(255, 215, 0, 1)');     // gold center
    grad.addColorStop(0.4, 'rgba(255, 165, 0, 0.9)'); // orange
    grad.addColorStop(1, 'rgba(255, 140, 0, 0)');     // transparent outer edge

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    return PIXI.Texture.from(canvas);
  };

  useEffect(() => {
    // Create the PIXI application.
    const app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x000000,
      // Optionally, enable resizeTo: window if desired.
      // resizeTo: window,
    });
    containerRef.current?.appendChild(app.view as HTMLCanvasElement);

    // Create an FPS display.
    const fpsText = new PIXI.Text('FPS: 0', {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0xffffff,
    });
    fpsText.x = 10;
    fpsText.y = 10;
    app.stage.addChild(fpsText);

    let frames = 0;
    let lastTime = performance.now();

    // Update FPS text on each ticker update.
    app.ticker.add(() => {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        fpsText.text = `FPS: ${frames}`;
        frames = 0;
        lastTime = now;
      }
    });

    // Container to hold swirl particles.
    const swirlContainer = new PIXI.Container();
    app.stage.addChild(swirlContainer);

    // Create the golden swirl texture.
    const swirlTexture = createGoldenTexture();

    // Array to track active swirl particles.
    const particles: SwirlParticle[] = [];

    // Center of the swirl (in stage coordinates).
    const centerX = 400;
    const centerY = 300;

    // Create a new swirl particle.
    const createParticle = () => {
      if (particles.length >= MAX_PARTICLES) return;

      const sprite = new PIXI.Sprite(swirlTexture);
      sprite.anchor.set(0.5);
      sprite.blendMode = PIXI.BLEND_MODES.ADD;

      // Random initial angle, small initial radius.
      const angle = Math.random() * Math.PI * 2;
      const radius = 0;

      // Spiral speeds.
      const angleSpeed = 0.001 + Math.random() * 0.0005;
      const radiusSpeed = 0.05 + Math.random() * 0.05;

      // Scale and lifespan.
      const scale = 0.4 + Math.random() * 1.2;
      sprite.scale.set(scale);
      const maxLife = 1000 + Math.random() * 1000;

      // Set the sprite's initial position before adding it to the container.
      sprite.x = centerX + radius * Math.cos(angle);
      sprite.y = centerY + radius * Math.sin(angle);

      sprite.alpha = 1;
      swirlContainer.addChild(sprite);

      particles.push({
        sprite,
        life: 0,
        maxLife,
        angle,
        radius,
        angleSpeed,
        radiusSpeed,
      });
    };

    // Main update loop.
    app.ticker.add(() => {
      const dt = app.ticker.deltaMS; // elapsed time in ms
      // Update each swirl particle.
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;

        // Update angle & radius for swirl motion.
        p.angle += p.angleSpeed * dt;
        p.radius += p.radiusSpeed * dt;

        // Convert polar swirl coords to XY.
        p.sprite.x = centerX + p.radius * Math.cos(p.angle);
        p.sprite.y = centerY + p.radius * Math.sin(p.angle);

        // Optionally, add random rotation jitter for more variety.
        p.sprite.rotation += (Math.random() - 0.5) * 0.02 * dt;

        // Fade out over time.
        p.sprite.alpha = Math.max(0, 1 - p.life / p.maxLife);

        // Remove the particle if its life is exceeded.
        if (p.life >= p.maxLife) {
          swirlContainer.removeChild(p.sprite);
          particles.splice(i, 1);
        }
      }

      // Maintain up to MAX_PARTICLES swirl particles.
      if (particles.length < MAX_PARTICLES) {
        createParticle();
      }
    });

    // Cleanup on component unmount.
    return () => {
      app.destroy(true, { children: true });
    };
  }, []);

  return <div ref={containerRef} />;
};

export default TechDemo3;

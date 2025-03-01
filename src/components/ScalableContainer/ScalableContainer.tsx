import React, { useEffect, useRef, useState } from 'react';

const ScalableContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  // Virtual dimensions for your PIXI design.
  const targetWidth = 800;
  const targetHeight = 600;

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const scaleX = clientWidth / targetWidth;
        const scaleY = clientHeight / targetHeight;
        // Use the smaller scale so that the entire content fits.
        setScale(Math.min(scaleX, scaleY));
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: targetWidth,
          height: targetHeight,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ScalableContainer;

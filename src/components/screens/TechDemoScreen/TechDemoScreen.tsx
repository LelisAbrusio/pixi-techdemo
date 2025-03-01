import React from 'react';

interface TechDemoScreenProps {
  onReturn: () => void;
  children: React.ReactNode;
}

const TechDemoScreen: React.FC<TechDemoScreenProps> = ({ onReturn, children }) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
      <button
        onClick={onReturn}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
        }}
      >
        Return to Menu
      </button>
    </div>
  );
};

export default TechDemoScreen;

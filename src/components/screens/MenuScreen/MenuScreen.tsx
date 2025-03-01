import React from 'react';
import { Screen } from '../../../App'; // Adjust the import based on your file structure

interface MenuScreenProps {
  onSelectDemo: (demo: Screen) => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ onSelectDemo }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '70px', marginBottom: '40px' }}>Tech Demo Assignment</h1>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          alignItems: 'center',
        }}
      >
        <button
          style={{ width: '300px', padding: '10px', fontSize: '16px' }}
          onClick={() => onSelectDemo('techdemo1')}
        >
          Tech Demo 1
        </button>
        <button
          style={{ width: '300px', padding: '10px', fontSize: '16px' }}
          onClick={() => onSelectDemo('techdemo2')}
        >
          Tech Demo 2
        </button>
        <button
          style={{ width: '300px', padding: '10px', fontSize: '16px' }}
          onClick={() => onSelectDemo('techdemo3')}
        >
          Tech Demo 3
        </button>
      </div>
    </div>
  );
};

export default MenuScreen;

// App.tsx
import React, { useState } from 'react';
import ScalableContainer from './components/ScalableContainer/ScalableContainer';
import SplashScreen from './components/screens/SplashScreen/SplashScreen';
import MenuScreen from './components/screens/MenuScreen/MenuScreen';
import TechDemoScreen from './components/screens/TechDemoScreen/TechDemoScreen';
import TechDemo1 from './components/screens/TechDemoScreen/TechDemo1/TechDemo1';
import TechDemo2 from './components/screens/TechDemoScreen/TechDemo2/TechDemo2';
import TechDemo3 from './components/screens/TechDemoScreen/TechDemo3/TechDemo3';

export type Screen = 'splash' | 'menu' | 'techdemo1' | 'techdemo2' | 'techdemo3';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');

  // Navigate to Menu after the splash screen is done.
  const handleSplashComplete = () => setCurrentScreen('menu');

  // Render the appropriate screen based on the state.
  return (
    <ScalableContainer>
      {currentScreen === 'splash' && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      {currentScreen === 'menu' && (
        <MenuScreen onSelectDemo={(demo) => setCurrentScreen(demo)} />
      )}
      {currentScreen === 'techdemo1' && (
        <TechDemoScreen onReturn={() => setCurrentScreen('menu')}>
          <TechDemo1 />
        </TechDemoScreen>
      )}
      {currentScreen === 'techdemo2' && (
        <TechDemoScreen onReturn={() => setCurrentScreen('menu')}>
          <TechDemo2 />
        </TechDemoScreen>
      )}
      {currentScreen === 'techdemo3' && (
        <TechDemoScreen onReturn={() => setCurrentScreen('menu')}>
          <TechDemo3 />
        </TechDemoScreen>
      )}
    </ScalableContainer>
  );
};

export default App;

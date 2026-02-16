import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider, useSession } from './src/context/SessionContext';
import HomeScreen from './src/screens/HomeScreen';
import SettleInScreen from './src/screens/SettleInScreen';
import BodyScanScreen from './src/screens/BodyScanScreen';
import LocateSensationScreen from './src/screens/LocateSensationScreen';
import DescribeSensationScreen from './src/screens/DescribeSensationScreen';
import StayWithItScreen from './src/screens/StayWithItScreen';
import LabelEmotionScreen from './src/screens/LabelEmotionScreen';
import CloseScreen from './src/screens/CloseScreen';

function AppContent() {
  const { currentStep, setStep, reset } = useSession();

  const startSession = () => setStep(1);
  const finishSession = () => {
    reset();
    setStep(0);
  };

  switch (currentStep) {
    case 0:
      return <HomeScreen onBegin={startSession} />;
    case 1:
      return <SettleInScreen />;
    case 2:
      return <BodyScanScreen />;
    case 3:
      return <LocateSensationScreen />;
    case 4:
      return <DescribeSensationScreen />;
    case 5:
      return <StayWithItScreen />;
    case 6:
      return <LabelEmotionScreen />;
    case 7:
      return <CloseScreen onFinish={finishSession} />;
    default:
      return <HomeScreen onBegin={startSession} />;
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <SessionProvider>
        <AppContent />
      </SessionProvider>
    </SafeAreaProvider>
  );
}

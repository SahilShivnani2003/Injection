import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import BasicDetailsScreen from './src/screens/BasicDetailsScreen';
import RequirementsScreen from './src/screens/RequirementsScreen';
import ChargesScreen from './src/screens/ChargesScreen';
import ComplimentaryScreen from './src/screens/ComplimentaryScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  BasicDetails: undefined;
  Requirements: undefined;
  Charges: { selectedServices: number[] };
  Complimentary: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="BasicDetails" component={BasicDetailsScreen} />
        <Stack.Screen name="Requirements" component={RequirementsScreen} />
        <Stack.Screen name="Charges" component={ChargesScreen} />
        <Stack.Screen name="Complimentary" component={ComplimentaryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

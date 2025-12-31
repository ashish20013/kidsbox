import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import MemoryMatchScreen from '../game/MemoryMatch/MemoryMatchScreen';
import TapTheColorScreen from '../game/TapTheColor/TapTheColorScreen';
import MathGameHub from '../game/MathGame/MathGameHub';
import MathPuzzleScreen from '../game/MathGame/MathPuzzleScreen';
import MathFactsMaster from '../game/MathGame/MathFactsMaster';
import MathMazeScreen from '../game/MathGame/MathMazeScreen';
import NumberPuzzleScreen from '../game/MathGame/NumberPuzzleScreen';
import MoneyCounterScreen from '../game/MoneyCounter/MoneyCounterScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TapTheColor" component={TapTheColorScreen} />
        <Stack.Screen name="MemoryMatch" component={MemoryMatchScreen} />
        <Stack.Screen name="MathGameHub" component={MathGameHub} />
        <Stack.Screen name="MathPuzzleScreen" component={MathPuzzleScreen} />
        <Stack.Screen name="MathFactsMaster" component={MathFactsMaster} />
        <Stack.Screen name="MathMazeScreen" component={MathMazeScreen} />
        <Stack.Screen
          name="NumberPuzzleScreen"
          component={NumberPuzzleScreen}
        />
        <Stack.Screen name="MoneyCounter" component={MoneyCounterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

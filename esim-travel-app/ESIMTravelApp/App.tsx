import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ESIMScreen from './src/screens/ESIMScreen';
import TravelScreen from './src/screens/TravelScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ESIMDetailScreen from './src/screens/ESIMDetailScreen';
import { RootStackParamList, TabParamList } from './src/types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function ESIMStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ESIMList" 
        component={ESIMScreen}
        options={{ title: 'Available eSIMs' }}
      />
      <Stack.Screen 
        name="ESIMDetail" 
        component={ESIMDetailScreen}
        options={{ title: 'eSIM Details' }}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'eSIM') {
            iconName = focused ? 'cellular' : 'cellular-outline';
          } else if (route.name === 'Travel') {
            iconName = focused ? 'airplane' : 'airplane-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Travel eSIM' }}
      />
      <Tab.Screen 
        name="eSIM" 
        component={ESIMStack}
        options={{ title: 'eSIM Plans', headerShown: false }}
      />
      <Tab.Screen 
        name="Travel" 
        component={TravelScreen}
        options={{ title: 'My Trips' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

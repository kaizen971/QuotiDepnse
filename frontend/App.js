import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import StatsScreen from './src/screens/StatsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" options={{ title: 'Connexion' }}>
              {props => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Register" options={{ title: 'Inscription' }}>
              {props => <RegisterScreen {...props} onRegister={handleLogin} />}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              options={{
                title: 'Mes Dépenses',
                headerStyle: { backgroundColor: '#667eea' },
                headerTintColor: 'white',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            >
              {props => <HomeScreen {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen
              name="AddExpense"
              options={({ route }) => ({
                title: route.params?.expense ? 'Modifier Dépense' : 'Nouvelle Dépense',
                headerStyle: { backgroundColor: '#667eea' },
                headerTintColor: 'white',
                headerTitleStyle: { fontWeight: 'bold' },
              })}
              component={AddExpenseScreen}
            />
            <Stack.Screen
              name="Stats"
              options={{
                title: 'Statistiques',
                headerStyle: { backgroundColor: '#667eea' },
                headerTintColor: 'white',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
              component={StatsScreen}
            />
            <Stack.Screen
              name="Profile"
              options={{
                title: 'Mon Profil',
                headerStyle: { backgroundColor: '#667eea' },
                headerTintColor: 'white',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
              component={ProfileScreen}
            />
            <Stack.Screen
              name="Feedback"
              options={{
                title: 'Envoyer un Feedback',
                headerStyle: { backgroundColor: '#667eea' },
                headerTintColor: 'white',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
              component={FeedbackScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

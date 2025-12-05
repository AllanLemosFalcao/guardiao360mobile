import React from 'react';
import { View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// --- IMPORTS DAS TELAS ---
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import NovaOcorrenciaScreen from './src/screens/NovaOcorrenciaScreen';
import OcorrenciasScreen from './src/screens/OcorrenciasScreen';
import NotificacoesScreen from './src/screens/NotificacoesScreen';
import ConfiguracoesScreen from './src/screens/ConfiguracoesScreen';
import MapaScreen from './src/screens/MapaScreen';

// --- TIPAGEM ---
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined; // O grupo de abas
  NovaOcorrencia: undefined; // Modal (fora das abas)
  Ocorrencias: undefined; // Lista (acessada pela Home)
};

// Stack Principal (Navegação vertical/modais)
const Stack = createNativeStackNavigator<RootStackParamList>();

// Tab Principal (Barra inferior)
const Tab = createBottomTabNavigator();

// --- COMPONENTE DA BARRA INFERIOR ---
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#B71C1C', // Vermelho ativo
        tabBarInactiveTintColor: '#999',  // Cinza inativo
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#eee',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      })}
    >
      {/* 1. MAPA (Esquerda) */}
      <Tab.Screen 
        name="Mapa" 
        component={MapaScreen} 
        options={{
          tabBarLabel: 'Mapa',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="google-maps" size={size} color={color} />
          ),
        }}
      />

      {/* 2. NOTIFICAÇÕES */}
      <Tab.Screen 
        name="NotificacoesTab" 
        component={NotificacoesScreen} 
        options={{
          tabBarLabel: 'Avisos',
          tabBarIcon: ({ color, size }) => (
            <Feather name="bell" size={size} color={color} />
          ),
          tabBarBadge: 3, // Exemplo de bolinha vermelha com número
        }}
      />

      {/* 3. HOME (Centro) */}
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant" size={32} color={color} />
          ),
        }}
      />

      {/* 4. NOVA OCORRÊNCIA (Botão de Ação) */}
      <Tab.Screen 
        name="NovaOcorrenciaTab" 
        component={View} // Componente vazio, pois vamos interceptar o clique
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Previne a abertura da aba vazia e abre o Modal
            e.preventDefault();
            navigation.navigate('NovaOcorrencia');
          },
        })}
        options={{
          tabBarLabel: 'Nova',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-circle-outline" size={32} color={color} />
          ),
        }}
      />

      {/* 5. CONFIGURAÇÕES (Direita) */}
      <Tab.Screen 
        name="ConfiguracoesTab" 
        component={ConfiguracoesScreen} 
        options={{
          tabBarLabel: 'Ajustes',
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// --- APP PRINCIPAL ---
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        {/* Tela de Login (Fora das abas) */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Telas Principais (Com abas) */}
        <Stack.Screen name="MainTabs" component={AppTabs} />
        
        {/* Modais e outras telas (Sobrepõem as abas) */}
        <Stack.Screen 
          name="NovaOcorrencia" 
          component={NovaOcorrenciaScreen} 
          options={{ presentation: 'modal' }}
        />
        
        {/* Tela de Lista de Ocorrências (Mantive fora das abas para ter tela cheia se quiser) */}
        <Stack.Screen name="Ocorrencias" component={OcorrenciasScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
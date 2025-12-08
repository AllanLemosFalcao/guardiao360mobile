import React, { useEffect, useState } from 'react';
import { View, Platform, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { sincronizarDados } from './src/services/syncService';
import { AuthService } from './src/services/auth'; // <--- IMPORTANTE

// --- IMPORTS DAS TELAS ---
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import NovaOcorrenciaScreen from './src/screens/NovaOcorrenciaScreen';
import OcorrenciasScreen from './src/screens/OcorrenciasScreen';
import NotificacoesScreen from './src/screens/NotificacoesScreen';
import ConfiguracoesScreen from './src/screens/ConfiguracoesScreen';
import MapaScreen from './src/screens/MapaScreen';
import DetalhesOcorrenciaScreen from './src/screens/DetalhesOcorrenciaScreen';
import ChegadaCenaScreen from './src/screens/ChegadaCenaScreen';
import RelatorioFinalScreen from './src/screens/RelatorioFinalScreen';
import TimelineScreen from './src/screens/TimelineScreen';
import QRCodeScannerScreen from './src/screens/QRCodeScannerScreen';

// Banco offiline (SQLite)
import { initDB } from './src/services/db';

// --- TIPAGEM ---
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined; 
  NovaOcorrencia: { modoEditar?: boolean; dbId?: number; dadosAntigos?: any };
  Ocorrencias: undefined;
  QRCodeScanner: undefined;
  DetalhesOcorrencia: { idOcorrencia: string; dadosIniciais?: any; dbId?: number };
  ChegadaCena: { idOcorrencia: string; dbId?: number };
  RelatorioFinal: { idOcorrencia: string; dbId?: number };
  Timeline: { idOcorrencia: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// --- COMPONENTE DA BARRA INFERIOR ---
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#B71C1C',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#eee',
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      })}
    >
      <Tab.Screen 
        name="Mapa" component={MapaScreen} 
        options={{
          tabBarLabel: 'Mapa',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="google-maps" size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="NotificacoesTab" component={NotificacoesScreen} 
        options={{
          tabBarLabel: 'Avisos',
          tabBarIcon: ({ color, size }) => <Feather name="bell" size={size} color={color} />,
          tabBarBadge: 3, 
        }}
      />
      <Tab.Screen 
        name="HomeTab" component={HomeScreen} 
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home-variant" size={32} color={color} />,
        }}
      />
      <Tab.Screen 
        name="NovaOcorrenciaTab" component={View} 
        listeners={({ navigation }) => ({
          tabPress: (e) => { e.preventDefault(); navigation.navigate('NovaOcorrencia'); },
        })}
        options={{
          tabBarLabel: 'Nova',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="plus-circle-outline" size={32} color={color} />,
        }}
      />
      <Tab.Screen 
        name="ConfiguracoesTab" component={ConfiguracoesScreen} 
        options={{
          tabBarLabel: 'Ajustes',
          tabBarIcon: ({ color, size }) => <Feather name="settings" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// --- APP PRINCIPAL BLINDADO ---
export default function App() {
  // Estado para controlar o carregamento inicial (Splash Screen)
  const [isReady, setReady] = useState(false);
  // Estado para decidir qual tela abrir primeiro (Login ou Home)
  const [initialRoute, setInitialRoute] = useState<'Login' | 'MainTabs'>('Login');

  // 1. EFEITO DE INICIALIZAÇÃO (Sequencial e Seguro)
  useEffect(() => {
    const prepararApp = async () => {
      try {
        // A. Inicia o Banco de Dados
        await initDB();
        console.log('✅ Banco de Dados Inicializado!');

        // B. Verifica se já existe usuário logado (Auto-Login)
        const token = await AuthService.getToken();
        if (token) {
          console.log("🔓 Token encontrado! Login automático.");
          setInitialRoute('MainTabs');
        } else {
          console.log("🔒 Nenhum token. Indo para Login.");
        }

      } catch (e) {
        console.warn(e);
      } finally {
        // C. Libera o App para renderizar
        setReady(true);
      }
    };

    prepararApp();
  }, []);

  // 2. MONITOR DE REDE (Só liga DEPOIS que o app estiver pronto)
  useEffect(() => {
    if (!isReady) return; // Se ainda tá carregando, não liga o ouvido

    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        console.log("📶 Conexão detectada! Verificando pendências...");
        // Pequeno delay para garantir estabilidade
        setTimeout(() => sincronizarDados(true), 1000);
      }
    });

    return () => unsubscribe();
  }, [isReady]);

  // --- TELA DE CARREGAMENTO (SPLASH) ---
  // Enquanto o banco e o login não checam, mostra isso:
  if (!isReady) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'}}>
        <ActivityIndicator size="large" color="#B71C1C" />
        <Text style={{marginTop: 20, color: '#555'}}>Iniciando Guardião 360...</Text>
      </View>
    );
  }

  // --- NAVEGAÇÃO PRINCIPAL ---
  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      
      <Stack.Navigator 
        initialRouteName={initialRoute} // <--- Define dinamicamente onde começar
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={AppTabs} />
        
        <Stack.Screen name="NovaOcorrencia" component={NovaOcorrenciaScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Ocorrencias" component={OcorrenciasScreen} />
        <Stack.Screen name="DetalhesOcorrencia" component={DetalhesOcorrenciaScreen} options={{ headerShown: true, title: 'Atendimento', headerBackVisible: false }} />
        <Stack.Screen name="ChegadaCena" component={ChegadaCenaScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RelatorioFinal" component={RelatorioFinalScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Timeline" component={TimelineScreen} />
        <Stack.Screen name="QRCodeScanner" component={QRCodeScannerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
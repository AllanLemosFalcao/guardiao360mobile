import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  Switch, 
  ActivityIndicator
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // <--- IMPORTANTE: useFocusEffect
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { RootStackParamList } from '../../App';
import { styles } from './HomeScreen.styles';

// Importa os serviços
import { AuthService } from '../services/auth';
import { sincronizarDados } from '../services/syncService'; // <--- Importe a função

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  const [emServico, setEmServico] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // EFEITO: Carrega usuário e Sincroniza ao focar na tela
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const carregarTudo = async () => {
        // 1. Carrega dados do Usuário (Nome, Patente)
        const user = await AuthService.getUsuarioLogado();
        if (isActive && user) setUsuario(user);

        // 2. Dispara Sincronização (Download e Upload) em segundo plano
        // Não bloqueamos a tela, apenas rodamos.
        setIsSyncing(true);
        await sincronizarDados(true); // true = modo silencioso (sem muitos alertas)
        if (isActive) setIsSyncing(false);
      };

      carregarTudo();

      return () => { isActive = false; };
    }, [])
  );

  const toggleSwitch = () => setEmServico(previousState => !previousState);

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. Cabeçalho de Boas Vindas */}
      <View style={styles.headerCard}>
        <TouchableOpacity>
          <MaterialCommunityIcons name="menu" size={30} color="#B71C1C" />
        </TouchableOpacity>
        
        <View>
            <Text style={styles.welcomeText}>
              Bem vindo!, {usuario ? usuario.patente : 'Bombeiro'}
            </Text>
            <Text style={{fontSize: 14, color: '#666'}}>
              {usuario ? usuario.nome : 'Carregando...'}
            </Text>
        </View>
        
        <Image 
          source={{ uri: 'https://github.com/github.png' }} 
          style={styles.avatar}
        />
      </View>

      {/* 2. Card de Status (Em Serviço) */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>
            Status: <Text style={{color: emServico ? '#B71C1C' : '#666'}}>
              {emServico ? 'Em Serviço' : 'Indisponível'}
            </Text>
          </Text>
          {isSyncing && (
             <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
                <ActivityIndicator size="small" color="#B71C1C" />
                <Text style={{fontSize: 10, color: '#B71C1C', marginLeft: 5}}>Sincronizando...</Text>
             </View>
          )}
        </View>

        <View style={styles.statusRow}>
          <Switch
            trackColor={{ false: "#767577", true: "#B71C1C" }}
            thumbColor={emServico ? "#f4f3f4" : "#f4f3f4"}
            onValueChange={toggleSwitch}
            value={emServico}
            style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
          />
          
          <View style={styles.locationTag}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#B71C1C" />
            <Text style={styles.locationText}>Batalhão 01</Text>
          </View>
        </View>
      </View>

      {/* 3. Menu Principal (Grid) */}
      <View style={styles.gridContainer}>
        
        <TouchableOpacity 
          style={styles.gridButton} 
          onPress={() => navigation.navigate('Ocorrencias' as any)}
        >
          <MaterialCommunityIcons name="shield-alert" size={50} color="#B71C1C" />
          <Text style={styles.gridLabel}>Ocorrências</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.gridButton} 
          onPress={() => navigation.navigate('NovaOcorrencia' as any)}
        >
          <MaterialCommunityIcons name="file-document-plus-outline" size={50} color="#B71C1C" />
          <Text style={styles.gridLabel}>Nova Ocorrência</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.gridButton} 
          onPress={() => navigation.navigate('Mapa' as any)}
        >
          <MaterialCommunityIcons name="google-maps" size={50} color="#B71C1C" />
          <Text style={styles.gridLabel}>Mapa de Ocorrências</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.gridButton} 
          onPress={() => navigation.navigate('QRCodeScanner' as any)}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={50} color="#B71C1C" />
          <Text style={styles.gridLabel}>Leitor QR Code</Text>
        </TouchableOpacity>

      </View>
      
    </SafeAreaView>
  );
}
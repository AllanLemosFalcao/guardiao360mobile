import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  Switch, 
  Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { RootStackParamList } from '../../App';

// IMPORTAÇÃO DOS ESTILOS
import { styles } from './HomeScreen.styles';

// Tipagem da navegação
type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  // Estado do botão "Em Serviço"
  const [emServico, setEmServico] = useState(true);

  const toggleSwitch = () => setEmServico(previousState => !previousState);

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. Cabeçalho de Boas Vindas */}
      <View style={styles.headerCard}>
        <TouchableOpacity>
          <MaterialCommunityIcons name="menu" size={30} color="#B71C1C" />
        </TouchableOpacity>
        
        <Text style={styles.welcomeText}>Bem vindo!, Capitão</Text>
        
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
          <Text style={styles.statusSubTitle}>(CAPT-05)</Text>
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
        
        {/* Botão 1: Ocorrências (Lista) */}
        <TouchableOpacity 
          style={styles.gridButton} 
          onPress={() => navigation.navigate('Ocorrencias' as any)}
        >
          <MaterialCommunityIcons name="shield-alert" size={50} color="#B71C1C" />
          <Text style={styles.gridLabel}>Ocorrências</Text>
        </TouchableOpacity>

        {/* Botão 2: Nova Ocorrência */}
        <TouchableOpacity 
          style={styles.gridButton} 
          onPress={() => navigation.navigate('NovaOcorrencia' as any)}
        >
          <MaterialCommunityIcons name="file-document-plus-outline" size={50} color="#B71C1C" />
          <Text style={styles.gridLabel}>Nova Ocorrência</Text>
        </TouchableOpacity>

        {/* Botão 3: Mapa */}
        <TouchableOpacity 
          style={styles.gridButton} 
          onPress={() => navigation.navigate('Mapa' as any)}
        >
          <MaterialCommunityIcons name="google-maps" size={50} color="#B71C1C" />
          <Text style={styles.gridLabel}>Mapa de Ocorrências</Text>
        </TouchableOpacity>

        {/* Botão 4: Leitor QR Code */}
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
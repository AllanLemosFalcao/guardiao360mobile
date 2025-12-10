import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, Text, Alert, ActivityIndicator, TouchableOpacity, Modal, TouchableWithoutFeedback
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { executeSql } from '../services/db';
import { styles } from './MapaScreen.styles';

export default function MapaScreen() {
  const navigation = useNavigation<any>();
  
  const [region, setRegion] = useState<any>(null);
  const [marcadores, setMarcadores] = useState<any[]>([]);
  
  // Filtros
  const [filtroTempo, setFiltroTempo] = useState<'HOJE' | '7D' | '30D' | 'TODOS'>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'EM_ANDAMENTO' | 'FINALIZADO'>('TODOS');

  const [modalTempoVisivel, setModalTempoVisivel] = useState(false);
  const [modalStatusVisivel, setModalStatusVisivel] = useState(false);

  // --- 1. LOCALIZAÇÃO ---
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'O mapa precisa de acesso ao GPS.');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  // --- 2. CARREGAR DADOS ---
  const carregarOcorrenciasMap = async () => {
    try {
      const resultado = await executeSql(
        `SELECT id, numero_ocorrencia, tipo_viatura, numero_viatura, status, 
                latitude_chegada, longitude_chegada, natureza_final, data_acionamento 
         FROM ocorrencias 
         WHERE latitude_chegada IS NOT NULL 
           AND longitude_chegada IS NOT NULL 
           AND latitude_chegada != '' 
           AND longitude_chegada != '';`
      );
      setMarcadores(resultado.rows._array);
    } catch (error) {
      console.error("Erro mapa:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarOcorrenciasMap();
    }, [])
  );

  // --- HELPER: DATA ---
  const parseData = (dataStr: string) => {
    if (!dataStr) return null;
    try {
      if (dataStr.includes('-')) {
        const [ano, mes, dia] = dataStr.split('-').map(Number);
        return new Date(ano, mes - 1, dia);
      }
      const partes = dataStr.split('/'); 
      if (partes.length === 3) {
        return new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
      }
      return null;
    } catch (e) { return null; }
  };

  // --- 3. LÓGICA DE FILTRAGEM (AJUSTADA) ---
  const getMarcadoresFiltrados = () => {
    return marcadores.filter(item => {
      const statusRaw = item.status || ''; 
      const s = statusRaw.toString().toUpperCase().trim();
      
      // Definição: Finalizado é quem já acabou ou já foi enviado
      const isFinalizado = s === 'FINALIZADO' || s === 'ENVIADO';
      
      // Definição Implícita: "Em Andamento" é tudo que NÃO é finalizado 
      // (Isso inclui EM_DESLOCAMENTO, EM_CENA, PENDENTE, etc.)

      // 1. Filtro de STATUS
      if (filtroStatus === 'EM_ANDAMENTO') {
         // Se quero ver as ativas, escondo as finalizadas
         if (isFinalizado) return false;
      }
      
      if (filtroStatus === 'FINALIZADO') {
         // Se quero ver as finalizadas, escondo as ativas
         if (!isFinalizado) return false;
      }

      // 2. Filtro de TEMPO
      if (filtroTempo !== 'TODOS') {
        const dataItem = parseData(item.data_acionamento);
        if (dataItem) {
           const hoje = new Date();
           hoje.setHours(0,0,0,0);
           dataItem.setHours(0,0,0,0);
           const diffTime = hoje.getTime() - dataItem.getTime();
           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

           if (filtroTempo === 'HOJE' && diffDays !== 0) return false;
           if (filtroTempo === '7D' && (diffDays < 0 || diffDays > 7)) return false;
           if (filtroTempo === '30D' && (diffDays < 0 || diffDays > 30)) return false;
        }
      }

      return true;
    });
  };

  const marcadoresVisiveis = getMarcadoresFiltrados();

  // LABELS
  const getLabelTempo = () => {
    switch(filtroTempo) {
      case 'HOJE': return 'Hoje';
      case '7D': return '7 Dias';
      case '30D': return '1 Mês';
      default: return 'Todas Datas';
    }
  };

  const getLabelStatus = () => {
    switch(filtroStatus) {
      case 'EM_ANDAMENTO': return 'Em Andamento'; // Cobre Deslocamento + Cena
      case 'FINALIZADO': return 'Finalizadas';
      default: return 'Todos Status';
    }
  };

  const irParaDetalhes = (ocorrencia: any) => {
    navigation.navigate('DetalhesOcorrencia', { 
      idOcorrencia: ocorrencia.numero_ocorrencia || `ID-${ocorrencia.id}`,
      dbId: ocorrencia.id,
      dadosIniciais: {
        viatura: `${ocorrencia.tipo_viatura}-${ocorrencia.numero_viatura}`,
        status: ocorrencia.status
      }
    });
  };

  if (!region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* BARRA DE FILTROS */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity style={styles.dropdownButton} onPress={() => setModalTempoVisivel(true)}>
          <View style={{flexDirection:'row', alignItems:'center'}}>
            <MaterialCommunityIcons name="calendar-range" size={18} color="#555" style={{marginRight:8}} />
            <Text style={styles.dropdownText}>{getLabelTempo()}</Text>
          </View>
          <Feather name="chevron-down" size={18} color="#777" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.dropdownButton} onPress={() => setModalStatusVisivel(true)}>
          <View style={{flexDirection:'row', alignItems:'center'}}>
            <MaterialCommunityIcons name="filter-variant" size={18} color="#555" style={{marginRight:8}} />
            <Text style={styles.dropdownText}>{getLabelStatus()}</Text>
          </View>
          <Feather name="chevron-down" size={18} color="#777" />
        </TouchableOpacity>
      </View>

      {/* MAPA */}
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {marcadoresVisiveis.map((item, index) => {
          const lat = parseFloat(item.latitude_chegada);
          const long = parseFloat(item.longitude_chegada);
          
          const s = (item.status || '').toString().toUpperCase().trim();
          const isFinalizado = s === 'FINALIZADO' || s === 'ENVIADO';
          
          return (
            <Marker
              key={`${item.id}_${filtroStatus}`}
              coordinate={{ latitude: lat, longitude: long }}
              pinColor={isFinalizado ? 'green' : 'red'} // Verde = Finalizado, Vermelho = Ativo
              zIndex={isFinalizado ? 1 : 10}
            >
              <Callout tooltip onPress={() => irParaDetalhes(item)}>
                <View style={styles.calloutContainer}>
                  <View style={[styles.calloutHeader, { backgroundColor: isFinalizado ? '#2E7D32' : '#D32F2F' }]}>
                    <Text style={styles.calloutTitle}>{item.tipo_viatura} {item.numero_viatura}</Text>
                  </View>
                  <View style={styles.calloutContent}>
                    <Text style={styles.calloutLabel}>Natureza: <Text style={{fontWeight:'bold'}}>{item.natureza_final || '---'}</Text></Text>
                    <Text style={styles.calloutLabel}>Data: {item.data_acionamento}</Text>
                    <View style={styles.btnDetalhes}>
                      <Text style={styles.btnText}>Abrir</Text>
                      <Feather name="chevron-right" size={14} color="#1976D2" />
                    </View>
                  </View>
                  <View style={styles.arrowBorder} /><View style={styles.arrow} />
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* LEGENDA ATUALIZADA */}
      <View style={styles.legendContainer}>
        <Text style={{fontSize:10, color:'#999', marginBottom:4}}>
          Exibindo {marcadoresVisiveis.length} de {marcadores.length}
        </Text>
        <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: 'red' }]} /><Text style={styles.legendText}>Em Andamento</Text></View>
        <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: 'green' }]} /><Text style={styles.legendText}>Finalizada</Text></View>
      </View>

      {/* MODAL 1: TEMPO */}
      <Modal visible={modalTempoVisivel} transparent animationType="fade" onRequestClose={() => setModalTempoVisivel(false)}>
        <TouchableWithoutFeedback onPress={() => setModalTempoVisivel(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filtrar Período</Text>
              {['TODOS', 'HOJE', '7D', '30D'].map((opt: any) => (
                <TouchableOpacity key={opt} style={styles.modalItem} onPress={() => { setFiltroTempo(opt); setModalTempoVisivel(false); }}>
                  <Text style={[styles.modalItemText, filtroTempo === opt && styles.modalItemTextSelected]}>
                     {opt === 'TODOS' ? 'Todo o Histórico' : opt === 'HOJE' ? 'Hoje' : opt === '7D' ? 'Últimos 7 dias' : 'Último mês'}
                  </Text>
                  {filtroTempo === opt && <Feather name="check" size={18} color="#1976D2" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL 2: STATUS */}
      <Modal visible={modalStatusVisivel} transparent animationType="fade" onRequestClose={() => setModalStatusVisivel(false)}>
        <TouchableWithoutFeedback onPress={() => setModalStatusVisivel(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filtrar Status</Text>
              {['TODOS', 'EM_ANDAMENTO', 'FINALIZADO'].map((opt: any) => (
                <TouchableOpacity key={opt} style={styles.modalItem} onPress={() => { setFiltroStatus(opt); setModalStatusVisivel(false); }}>
                  <Text style={[styles.modalItemText, filtroStatus === opt && styles.modalItemTextSelected]}>
                    {opt === 'TODOS' ? 'Todos' : opt === 'EM_ANDAMENTO' ? 'Em Andamento' : 'Finalizadas'}
                  </Text>
                  {filtroStatus === opt && <Feather name="check" size={18} color="#1976D2" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  );
}
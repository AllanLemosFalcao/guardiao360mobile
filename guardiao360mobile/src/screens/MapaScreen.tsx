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
  
  const [filtroTempo, setFiltroTempo] = useState<'HOJE' | '7D' | '30D' | 'TODOS'>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'EM ANDAMENTO' | 'FINALIZADOS'>('TODOS');

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

  // --- HELPER: DATA (CORRIGIDO PARA ISO + BR) ---
  const parseData = (dataStr: string) => {
    if (!dataStr) return null;
    try {
      // Formato ISO: YYYY-MM-DD
      if (dataStr.includes('-')) {
        const [ano, mes, dia] = dataStr.split('-').map(Number);
        return new Date(ano, mes - 1, dia);
      }
      // Formato BR: DD/MM/YYYY
      const partes = dataStr.split('/'); 
      if (partes.length === 3) {
        return new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
      }
      return null;
    } catch (e) { return null; }
  };

  // --- 3. LÓGICA DE FILTRAGEM CORRIGIDA ---
  const getMarcadoresFiltrados = () => {
    return marcadores.filter(item => {
      const statusRaw = item.status || ''; 
      const statusNormalizado = statusRaw.toString().toUpperCase().trim();
      
      // CORREÇÃO AQUI: "Finalizado" inclui quem já foi "Enviado"
      const isFinalizado = statusNormalizado === 'FINALIZADO' || statusNormalizado === 'ENVIADO';

      // Filtro A: Status
      if (filtroStatus === 'EM ANDAMENTO' && isFinalizado) return false;
      if (filtroStatus === 'FINALIZADOS' && !isFinalizado) return false;

      // Filtro B: Tempo
      if (filtroTempo === 'TODOS') return true;

      const dataItem = parseData(item.data_acionamento);
      if (!dataItem) return true; 

      const hoje = new Date();
      hoje.setHours(0,0,0,0);
      dataItem.setHours(0,0,0,0);

      const diffTime = hoje.getTime() - dataItem.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (filtroTempo === 'HOJE' && diffDays !== 0) return false;
      if (filtroTempo === '7D' && (diffDays < 0 || diffDays > 7)) return false;
      if (filtroTempo === '30D' && (diffDays < 0 || diffDays > 30)) return false;

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
      case 'EM ANDAMENTO': return 'EM ANDAMENTO';
      case 'FINALIZADOS': return 'Finalizadas';
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
          
          const statusRaw = item.status || ''; 
          const s = statusRaw.toString().toUpperCase().trim();
          // CORREÇÃO DA COR DO PIN TAMBÉM
          const isFinalizado = s === 'FINALIZADO' || s === 'ENVIADO';
          
          return (
            <Marker
              key={index}
              coordinate={{ latitude: lat, longitude: long }}
              pinColor={isFinalizado ? 'green' : 'red'}
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

      {/* LEGENDA */}
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
              <TouchableOpacity style={styles.modalItem} onPress={() => { setFiltroTempo('HOJE'); setModalTempoVisivel(false); }}>
                <Text style={[styles.modalItemText, filtroTempo === 'HOJE' && styles.modalItemTextSelected]}>Hoje (Plantão)</Text>
                {filtroTempo === 'HOJE' && <Feather name="check" size={18} color="#1976D2" />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalItem} onPress={() => { setFiltroTempo('7D'); setModalTempoVisivel(false); }}>
                <Text style={[styles.modalItemText, filtroTempo === '7D' && styles.modalItemTextSelected]}>Últimos 7 dias</Text>
                {filtroTempo === '7D' && <Feather name="check" size={18} color="#1976D2" />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalItem} onPress={() => { setFiltroTempo('30D'); setModalTempoVisivel(false); }}>
                <Text style={[styles.modalItemText, filtroTempo === '30D' && styles.modalItemTextSelected]}>Último Mês</Text>
                {filtroTempo === '30D' && <Feather name="check" size={18} color="#1976D2" />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalItem} onPress={() => { setFiltroTempo('TODOS'); setModalTempoVisivel(false); }}>
                <Text style={[styles.modalItemText, filtroTempo === 'TODOS' && styles.modalItemTextSelected]}>Todo o Histórico</Text>
                {filtroTempo === 'TODOS' && <Feather name="check" size={18} color="#1976D2" />}
              </TouchableOpacity>
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
              <TouchableOpacity style={styles.modalItem} onPress={() => { setFiltroStatus('TODOS'); setModalStatusVisivel(false); }}>
                <Text style={[styles.modalItemText, filtroStatus === 'TODOS' && styles.modalItemTextSelected]}>Todos</Text>
                {filtroStatus === 'TODOS' && <Feather name="check" size={18} color="#1976D2" />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalItem} onPress={() => { setFiltroStatus('EM ANDAMENTO'); setModalStatusVisivel(false); }}>
                <Text style={[styles.modalItemText, filtroStatus === 'EM ANDAMENTO' && styles.modalItemTextSelected]}>Em andamento</Text>
                {filtroStatus === 'EM ANDAMENTO' && <Feather name="check" size={18} color="#1976D2" />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalItem} onPress={() => { setFiltroStatus('FINALIZADOS'); setModalStatusVisivel(false); }}>
                <Text style={[styles.modalItemText, filtroStatus === 'FINALIZADOS' && styles.modalItemTextSelected]}>Finalizadas</Text>
                {filtroStatus === 'FINALIZADOS' && <Feather name="check" size={18} color="#1976D2" />}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  );
}
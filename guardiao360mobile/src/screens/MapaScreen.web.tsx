import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, Text, ActivityIndicator, TouchableOpacity, Modal, TouchableWithoutFeedback
} from 'react-native';
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

  // --- 1. LOCALIZAÇÃO (Com fallback para não travar na Web) ---
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          // Fallback se negar GPS
          setRegion({
            latitude: -8.047562,
            longitude: -34.877002,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
          return;
        }
        let location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch(e) {
         setRegion({
          latitude: -8.047562, 
          longitude: -34.877002, 
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    })();
  }, []);

  // --- 2. CARREGAR DADOS (Mostrando TODOS na Web) ---
  const carregarOcorrenciasMap = async () => {
    try {
      const resultado = await executeSql(
        `SELECT id, numero_ocorrencia, tipo_viatura, numero_viatura, status, 
                latitude_chegada, longitude_chegada, natureza_final, data_acionamento 
         FROM ocorrencias 
         ORDER BY id DESC;`
      );
      const linhas = resultado?.rows?._array || resultado || []; 
      setMarcadores(linhas);
    } catch (error) {
      console.error("Erro mapa web:", error);
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

  // --- 3. LÓGICA DE FILTRAGEM ---
  const getMarcadoresFiltrados = () => {
    return marcadores.filter(item => {
      const statusRaw = item.status || ''; 
      const s = statusRaw.toString().toUpperCase().trim();
      const isFinalizado = s === 'FINALIZADO' || s === 'ENVIADO';

      if (filtroStatus === 'EM_ANDAMENTO' && isFinalizado) return false;
      if (filtroStatus === 'FINALIZADO' && !isFinalizado) return false;

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
      case 'EM_ANDAMENTO': return 'Em Andamento';
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

      {/* SUBSTITUTO DO MAPA PARA A WEB (LISTA COM AVISO) */}
      <View style={{flex: 1, padding: 10, backgroundColor: '#f0f0f0', paddingTop: 80}}>
        
        {/* BANNER DE AVISO MOBILE-ONLY */}
        <View style={{ 
          backgroundColor: '#FFE0B2', 
          padding: 15, 
          borderRadius: 8, 
          marginBottom: 15, 
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#FFB74D'
        }}>
          <MaterialCommunityIcons name="map-marker-off" size={32} color="#E65100" />
          <Text style={{ fontWeight: 'bold', color: '#E65100', marginTop: 5, textAlign: 'center' }}>
            Mapa Interativo Indisponível na Web
          </Text>
          <Text style={{ color: '#E65100', textAlign: 'center', fontSize: 13, marginTop: 5 }}>
            A visualização geográfica exige componentes nativos e está disponível apenas no aplicativo Mobile (Android/iOS). Utilize a lista abaixo para consultar os registros.
          </Text>
        </View>

        <Text style={{fontWeight: 'bold', fontSize: 16, marginBottom: 10, textAlign: 'center'}}>
          {marcadoresVisiveis.length} Ocorrência(s) Encontrada(s)
        </Text>
        
        {marcadoresVisiveis.length === 0 ? (
          <Text style={{textAlign: 'center', marginTop: 20}}>Nenhuma ocorrência encontrada para os filtros atuais.</Text>
        ) : (
          marcadoresVisiveis.map((item, index) => {
            const s = (item.status || '').toString().toUpperCase().trim();
            const isFinalizado = s === 'FINALIZADO' || s === 'ENVIADO';
            
            return (
              <TouchableOpacity 
                key={`${item.id}_${filtroStatus}`} 
                style={{
                  backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10,
                  borderLeftWidth: 5, borderLeftColor: isFinalizado ? '#2E7D32' : '#D32F2F',
                  elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2
                }}
                onPress={() => irParaDetalhes(item)}
              >
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5}}>
                  <Text style={{fontWeight: 'bold', fontSize: 16}}>{item.tipo_viatura} {item.numero_viatura}</Text>
                  <Text style={{color: '#666', fontSize: 12}}>ID: {item.id}</Text>
                </View>
                <Text style={{marginBottom: 5}}>Natureza: <Text style={{fontWeight: 'bold'}}>{item.natureza_final || '---'}</Text></Text>
                <Text style={{color: '#555', marginBottom: 10}}>Data: {item.data_acionamento}</Text>
                
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <Text style={{fontSize: 12, color: isFinalizado ? '#2E7D32' : '#D32F2F', fontWeight: 'bold'}}>
                    {isFinalizado ? 'FINALIZADA' : 'EM ANDAMENTO'}
                  </Text>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{color: '#1976D2', fontWeight: 'bold', marginRight: 5}}>Abrir</Text>
                    <Feather name="chevron-right" size={16} color="#1976D2" />
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        )}
      </View>

      {/* MODAIS DE FILTROS */}
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
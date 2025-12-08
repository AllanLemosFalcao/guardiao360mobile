import React, { useState, useCallback } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, SafeAreaView, Alert,
  ListRenderItem, Modal, TouchableWithoutFeedback
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; 
import { styles } from './OcorrenciasScreen.styles'; 
import { executeSql } from '../services/db';
import { AuthService } from '../services/auth'; // <--- Importe do Auth

type OcorrenciasScreenProp = NativeStackNavigationProp<RootStackParamList, 'Ocorrencias'>;

type OcorrenciaBD = {
  id: number;
  numero_ocorrencia: string;
  data_acionamento: string;
  hora_acionamento: string;
  tipo_viatura: string;
  numero_viatura: string;
  natureza_final: string;
  status: string;
};

export default function OcorrenciasScreen() {
  const navigation = useNavigation<OcorrenciasScreenProp>();
  
  const [listaOcorrencias, setListaOcorrencias] = useState<OcorrenciaBD[]>([]);
  const [carregando, setCarregando] = useState(false);

  // --- NOVOS ESTADOS DE FILTRO ---
  const [filtroData, setFiltroData] = useState<'HOJE' | '7D' | '30D' | 'TODOS'>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'EM_ANDAMENTO' | 'FINALIZADO'>('TODOS');

  // Modais
  const [modalDataVisible, setModalDataVisible] = useState(false);
  const [modalStatusVisible, setModalStatusVisible] = useState(false);

  // --- FUNÇÃO DE CARREGAR DADOS (CORRIGIDA) ---
  const carregarDados = async () => { // <--- AQUI ESTAVA FALTANDO
    setCarregando(true);
    try {
      // 1. Descobre quem sou eu
      const user = await AuthService.getUsuarioLogado();
      
      if (user && user.id) {
        // 2. Filtra pelo meu ID no SQLite
        const resultado = await executeSql(
          `SELECT * FROM ocorrencias WHERE usuario_id = ? ORDER BY id DESC;`, 
          [user.id]
        );
        setListaOcorrencias(resultado.rows._array);
      }
    } catch (error) {
      console.error("Erro ao buscar ocorrências:", error);
    } finally {
      setCarregando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  // --- HELPER: DATAS ---
  const parseData = (dataStr: string) => {
    if (!dataStr) return null;
    try {
      const partes = dataStr.split('/'); // DD/MM/YYYY
      if (partes.length !== 3) return null;
      return new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
    } catch (e) { return null; }
  };

  // --- LÓGICA DE FILTRAGEM ---
  const dadosFiltrados = listaOcorrencias.filter(item => {
    const statusNorm = item.status ? item.status.toUpperCase().trim() : '';
    const isFinalizado = statusNorm === 'FINALIZADO';

    // 1. Filtro de Status
    if (filtroStatus === 'FINALIZADO' && !isFinalizado) return false;
    if (filtroStatus === 'EM_ANDAMENTO' && isFinalizado) return false; 

    // 2. Filtro de Data
    if (filtroData === 'TODOS') return true;

    const dataItem = parseData(item.data_acionamento);
    if (!dataItem) return true; 

    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    dataItem.setHours(0,0,0,0);

    const diffTime = hoje.getTime() - dataItem.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (filtroData === 'HOJE' && diffDays !== 0) return false;
    if (filtroData === '7D' && (diffDays < 0 || diffDays > 7)) return false;
    if (filtroData === '30D' && (diffDays < 0 || diffDays > 30)) return false;

    return true;
  });

  const getLabelData = () => {
    switch(filtroData) {
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

  // --- RENDER ITEM ---
  const renderHistoryItem: ListRenderItem<OcorrenciaBD> = ({ item }) => {
    const statusText = item.status?.replace(/_/g, ' ') || 'PENDENTE';
    
    const getStatusColor = (statusRaw: string) => {
        const s = statusRaw ? statusRaw.toUpperCase() : '';
        if (s.includes('CENA')) return '#1565C0';
        if (s.includes('DESLOCAMENTO')) return '#B71C1C';
        if (s === 'FINALIZADO') return '#2E7D32';
        return '#757575';
    };

    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('DetalhesOcorrencia', { 
          idOcorrencia: item.numero_ocorrencia || `ID-${item.id}`,
          dbId: item.id,
          dadosIniciais: {
            viatura: `${item.tipo_viatura}-${item.numero_viatura}`,
            horaDespacho: `${item.data_acionamento || ''} ${item.hora_acionamento || ''}`,
            status: item.status
          }
        })}
      >
        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
           <Text style={styles.cardTitle}>{item.numero_ocorrencia || `ID: ${item.id}`}</Text>
        </View>
        
        <View style={{marginVertical: 4}}>
          <Text style={styles.cardLabel}>Data: <Text style={styles.cardValue}>{item.data_acionamento}</Text></Text>
          <Text style={styles.cardLabel}>Vtr: <Text style={styles.cardValue}>{item.tipo_viatura}-{item.numero_viatura}</Text></Text>
        </View>

        <Text style={[styles.statusText, { color: statusColor }]}>
          {statusText}
        </Text>
      </TouchableOpacity>
    );
  };

  // --- HEADER COM DROPDOWNS ---
  const HeaderComponent = () => (
    <View style={styles.filtersContainer}>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setModalDataVisible(true)}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <MaterialCommunityIcons name="calendar-range" size={18} color="#555" style={{marginRight:8}} />
          <Text style={styles.dropdownText}>{getLabelData()}</Text>
        </View>
        <Feather name="chevron-down" size={18} color="#777" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.dropdownButton} onPress={() => setModalStatusVisible(true)}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <MaterialCommunityIcons name="filter-variant" size={18} color="#555" style={{marginRight:8}} />
          <Text style={styles.dropdownText}>{getLabelStatus()}</Text>
        </View>
        <Feather name="chevron-down" size={18} color="#777" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico Real</Text>
        <View style={{ width: 32 }} /> 
      </View>

      <FlatList
        data={dadosFiltrados}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderHistoryItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={HeaderComponent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{padding: 20, alignItems: 'center'}}>
            <Text style={{color: '#999', textAlign: 'center'}}>
              {carregando ? 'Carregando dados...' : 'Nenhuma ocorrência encontrada com esses filtros.'}
            </Text>
          </View>
        }
      />

      {/* MODAL DATA */}
      <Modal visible={modalDataVisible} transparent animationType="fade" onRequestClose={() => setModalDataVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalDataVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filtrar Data</Text>
              <TouchableOpacity style={styles.modalItem} onPress={() => { setFiltroData('HOJE'); setModalDataVisible(false); }}>
                <Text style={[styles.modalItemText, filtroData === 'HOJE' && styles.modalItemTextSelected]}>Hoje</Text>
                {filtroData === 'HOJE' && <Feather name="check" size={18} color="#1976D2" />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalItem} onPress={() => { setFiltroData('7D'); setModalDataVisible(false); }}>
                <Text style={[styles.modalItemText, filtroData === '7D' && styles.modalItemTextSelected]}>Últimos 7 dias</Text>
                {filtroData === '7D' && <Feather name="check" size={18} color="#1976D2" />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalItem} onPress={() => { setFiltroData('30D'); setModalDataVisible(false); }}>
                <Text style={[styles.modalItemText, filtroData === '30D' && styles.modalItemTextSelected]}>Último Mês</Text>
                {filtroData === '30D' && <Feather name="check" size={18} color="#1976D2" />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalItem} onPress={() => { setFiltroData('TODOS'); setModalDataVisible(false); }}>
                <Text style={[styles.modalItemText, filtroData === 'TODOS' && styles.modalItemTextSelected]}>Todas as Datas</Text>
                {filtroData === 'TODOS' && <Feather name="check" size={18} color="#1976D2" />}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL STATUS */}
      <Modal visible={modalStatusVisible} transparent animationType="fade" onRequestClose={() => setModalStatusVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalStatusVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filtrar Status</Text>
              <TouchableOpacity style={styles.modalItem} onPress={() => { setFiltroStatus('TODOS'); setModalStatusVisible(false); }}>
                <Text style={[styles.modalItemText, filtroStatus === 'TODOS' && styles.modalItemTextSelected]}>Todos</Text>
                {filtroStatus === 'TODOS' && <Feather name="check" size={18} color="#1976D2" />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalItem} onPress={() => { setFiltroStatus('EM_ANDAMENTO'); setModalStatusVisible(false); }}>
                <Text style={[styles.modalItemText, filtroStatus === 'EM_ANDAMENTO' && styles.modalItemTextSelected]}>Em Andamento</Text>
                {filtroStatus === 'EM_ANDAMENTO' && <Feather name="check" size={18} color="#1976D2" />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalItem} onPress={() => { setFiltroStatus('FINALIZADO'); setModalStatusVisible(false); }}>
                <Text style={[styles.modalItemText, filtroStatus === 'FINALIZADO' && styles.modalItemTextSelected]}>Finalizadas</Text>
                {filtroStatus === 'FINALIZADO' && <Feather name="check" size={18} color="#1976D2" />}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </SafeAreaView>
  );
}
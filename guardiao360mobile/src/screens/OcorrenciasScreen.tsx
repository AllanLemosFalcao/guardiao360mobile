import React, { useState, useCallback } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, SafeAreaView, Alert,
  ListRenderItem, Modal, TouchableWithoutFeedback, RefreshControl // <--- 1. Importar RefreshControl
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; 
import { styles } from './OcorrenciasScreen.styles'; 
import { executeSql } from '../services/db';
import { AuthService } from '../services/auth';
import { sincronizarDados } from '../services/syncService'; // <--- 2. Importar o Sync

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
  const [refreshing, setRefreshing] = useState(false); // <--- 3. Estado do Refresh

  // Filtros
  const [filtroData, setFiltroData] = useState<'HOJE' | '7D' | '30D' | 'TODOS'>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'EM_ANDAMENTO' | 'FINALIZADO'>('TODOS');
  const [modalDataVisible, setModalDataVisible] = useState(false);
  const [modalStatusVisible, setModalStatusVisible] = useState(false);

  // --- FUNÇÃO DE CARREGAR DADOS DO SQLITE ---
  const carregarDadosLocais = async () => {
    setCarregando(true);
    try {
      const user = await AuthService.getUsuarioLogado();
      if (user && user.id) {
        // Busca apenas as ocorrências deste usuário
        const resultado = await executeSql(
          `SELECT * FROM ocorrencias 
          WHERE usuario_id = ? 
          ORDER BY data_acionamento DESC, hora_acionamento DESC, id DESC;`, 
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

  // --- FUNÇÃO DO PULL-TO-REFRESH ---
  const onRefresh = async () => {
    setRefreshing(true);
    // 1. Vai na nuvem buscar novidades (e enviar pendências)
    await sincronizarDados(true); 
    // 2. Recarrega a lista local com o que acabou de baixar
    await carregarDadosLocais();
    setRefreshing(false);
  };

  // --- EFEITO AO FOCAR NA TELA ---
  useFocusEffect(
    useCallback(() => {
      // Carrega localmente primeiro (rápido)
      carregarDadosLocais();
      
      // Tenta sincronizar em segundo plano (silencioso) para garantir dados frescos
      sincronizarDados(true).then(() => {
        // Se baixou algo novo, recarrega a lista
        carregarDadosLocais();
      });
    }, [])
  );

  // --- HELPER: DATAS ---
  const parseData = (dataStr: string) => {
    if (!dataStr) return null;
    try {
      // Tenta formato ISO YYYY-MM-DD
      if (dataStr.includes('-')) {
        const [ano, mes, dia] = dataStr.split('-').map(Number);
        return new Date(ano, mes - 1, dia);
      }
      // Tenta formato BR DD/MM/YYYY
      const partes = dataStr.split('/');
      if (partes.length === 3) {
        return new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
      }
      return null;
    } catch (e) { return null; }
  };

  // --- LÓGICA DE FILTRAGEM ---
  const dadosFiltrados = listaOcorrencias.filter(item => {
    const statusNorm = item.status ? item.status.toUpperCase().trim() : '';
    const isFinalizado = statusNorm === 'FINALIZADO' || statusNorm === 'ENVIADO'; // Enviado também é finalizado

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

  // Labels dos Filtros
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

  // Render Item
  const renderHistoryItem: ListRenderItem<OcorrenciaBD> = ({ item }) => {
    // Normaliza o status para maiúsculo e sem espaços extras
    const statusRaw = item.status ? item.status.toUpperCase().trim() : 'PENDENTE';
    
    // Variáveis de Estilo
    let labelTexto = statusRaw.replace(/_/g, ' '); // Padrão: remove underline
    let corTexto = '#757575'; // Cinza (Padrão)
    let corBolinha = null;    // Se não for null, desenha a bolinha

    // LÓGICA DE CORES E TEXTOS
    if (statusRaw === 'ENVIADO') {
        labelTexto = 'FINALIZADO'; // Usuário vê "Finalizado"
        corTexto = '#2E7D32';      // Texto Verde
        corBolinha = '#2E7D32';    // Bolinha Verde (Já subiu pra nuvem)
    } 
    else if (statusRaw === 'FINALIZADO') {
        labelTexto = 'FINALIZADO'; // Usuário vê "Finalizado"
        corTexto = '#2E7D32';      // Texto Verde
        corBolinha = '#FF9800';    // Bolinha Laranja (Ainda no celular)
    }
    else if (statusRaw.includes('DESLOCAMENTO')) {
        corTexto = '#B71C1C'; // Vermelho
    } 
    else if (statusRaw.includes('CENA')) {
        corTexto = '#1565C0'; // Azul
    }

    // Função de Deletar Rápido (Mantida)
    const confirmarExclusaoRapida = (id: number, numero: string) => {
       Alert.alert("Excluir", `Apagar ${numero}?`, [
         { text: "Não", style: "cancel" },
         { text: "Sim", onPress: async () => {
             await executeSql(`DELETE FROM midias WHERE ocorrencia_id = ?`, [id]);
             await executeSql(`DELETE FROM vitimas WHERE ocorrencia_id = ?`, [id]);
             await executeSql(`DELETE FROM ocorrencias WHERE id = ?`, [id]);
             carregarDadosLocais();
         }}
       ]);
    };

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
        onLongPress={() => confirmarExclusaoRapida(item.id, item.numero_ocorrencia)}
      >
        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
           <Text style={styles.cardTitle}>{item.numero_ocorrencia || `ID: ${item.id}`}</Text>
        </View>
        
        <View style={{marginVertical: 4}}>
          <Text style={styles.cardLabel}>Data: <Text style={styles.cardValue}>{item.data_acionamento}</Text></Text>
          <Text style={styles.cardLabel}>Vtr: <Text style={styles.cardValue}>{item.tipo_viatura}-{item.numero_viatura}</Text></Text>
        </View>

        {/* --- ÁREA DO STATUS COM BOLINHA --- */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Text style={[styles.statusText, { color: corTexto, marginTop: 0 }]}>
              {labelTexto}
            </Text>
            
            {/* Renderiza a bolinha apenas se corBolinha estiver definida */}
            {corBolinha && (
                <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: corBolinha,
                    marginLeft: 6, // Espaço entre o texto e a bolinha
                    elevation: 1   // Sombra leve para destacar
                }} />
            )}
        </View>

      </TouchableOpacity>
    );
  };

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
        // --- 4. CONFIGURAÇÃO DO REFRESH ---
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#B71C1C']} // Cor do loading no Android
            tintColor="#B71C1C"  // Cor do loading no iOS
          />
        }
        ListEmptyComponent={
          <View style={{padding: 20, alignItems: 'center'}}>
            <Text style={{color: '#999', textAlign: 'center'}}>
              {carregando ? 'Carregando dados...' : 'Nenhuma ocorrência encontrada.\n(Puxe para atualizar)'}
            </Text>
          </View>
        }
      />

      {/* MODAL DATA (Mantido igual) */}
      <Modal visible={modalDataVisible} transparent animationType="fade" onRequestClose={() => setModalDataVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalDataVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filtrar Data</Text>
              {['HOJE', '7D', '30D', 'TODOS'].map((opt: any) => (
                  <TouchableOpacity key={opt} style={styles.modalItem} onPress={() => { setFiltroData(opt); setModalDataVisible(false); }}>
                    <Text style={[styles.modalItemText, filtroData === opt && styles.modalItemTextSelected]}>
                        {opt === 'TODOS' ? 'Todas as Datas' : opt === 'HOJE' ? 'Hoje' : opt}
                    </Text>
                    {filtroData === opt && <Feather name="check" size={18} color="#1976D2" />}
                  </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL STATUS (Mantido igual) */}
      <Modal visible={modalStatusVisible} transparent animationType="fade" onRequestClose={() => setModalStatusVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalStatusVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filtrar Status</Text>
              {['TODOS', 'EM_ANDAMENTO', 'FINALIZADO'].map((opt: any) => (
                  <TouchableOpacity key={opt} style={styles.modalItem} onPress={() => { setFiltroStatus(opt); setModalStatusVisible(false); }}>
                    <Text style={[styles.modalItemText, filtroStatus === opt && styles.modalItemTextSelected]}>
                         {opt === 'TODOS' ? 'Todos' : opt.replace('_', ' ')}
                    </Text>
                    {filtroStatus === opt && <Feather name="check" size={18} color="#1976D2" />}
                  </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
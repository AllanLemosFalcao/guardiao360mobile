import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  ListRenderItem,
  Alert
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; 
import { styles } from './OcorrenciasScreen.styles'; // Certifique-se que o nome do arquivo style está correto

// Importa a função do Banco
import { executeSql } from '../services/db';

type OcorrenciasScreenProp = NativeStackNavigationProp<RootStackParamList, 'Ocorrencias'>;

// Tipagem baseada no Banco de Dados
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
  
  // Estado para armazenar os dados REAIS do banco
  const [listaOcorrencias, setListaOcorrencias] = useState<OcorrenciaBD[]>([]);
  const [filtroSelecionado, setFiltroSelecionado] = useState<'Todos' | 'Rascunho' | 'Finalizado'>('Todos');
  const [carregando, setCarregando] = useState(false);

  // --- FUNÇÃO PARA BUSCAR DADOS DO SQLITE ---
  const carregarDados = async () => {
    setCarregando(true);
    try {
      // O comando SELECT busca tudo o que foi salvo
      // ORDER BY id DESC faz aparecer as mais recentes no topo
      const resultado = await executeSql(
        `SELECT * FROM ocorrencias ORDER BY id DESC;`
      );

      // O executeSql adaptado retorna { rows: { _array: [] } }
      const dados = resultado.rows._array; 
      
      console.log("Dados carregados do SQLite:", dados); // OLHE NO SEU TERMINAL/LOG
      setListaOcorrencias(dados);

    } catch (error) {
      console.error("Erro ao buscar ocorrências:", error);
      Alert.alert("Erro", "Falha ao carregar histórico.");
    } finally {
      setCarregando(false);
    }
  };

  // --- USE FOCUS EFFECT ---
  // Isso faz a lista recarregar toda vez que você entra nessa tela
  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  // Lógica de Filtragem (Visual)
  const dadosFiltrados = listaOcorrencias.filter(item => {
    if (filtroSelecionado === 'Todos') return true;
    if (filtroSelecionado === 'Rascunho') return item.status === 'EM_DESLOCAMENTO' || item.status === 'RASCUNHO';
    if (filtroSelecionado === 'Finalizado') return item.status === 'FINALIZADO';
    return true;
  });

  // --- Render Item: Ocorrência (Grid Vertical) ---
  const renderHistoryItem: ListRenderItem<OcorrenciaBD> = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('DetalhesOcorrencia', { 
        idOcorrencia: item.numero_ocorrencia || `ID-${item.id}`,
        dbId: item.id, // Passa o ID real para permitir edição
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

      <Text style={[
        styles.statusText, 
        item.status === 'FINALIZADO' ? { color: '#2E7D32' } : { color: '#F57C00' }
      ]}>
        {item.status?.replace('_', ' ')}
      </Text>
    </TouchableOpacity>
  );

  // --- Componente de Cabeçalho ---
  const HeaderComponent = () => (
    <View>
      {/* Filtros */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <TouchableOpacity 
            style={[styles.filterChip, filtroSelecionado === 'Todos' && styles.filterChipSelected]}
            onPress={() => setFiltroSelecionado('Todos')}
          >
             <Text style={[styles.filterText, filtroSelecionado === 'Todos' && styles.filterTextSelected]}>Todas</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, filtroSelecionado === 'Rascunho' && styles.filterChipSelected]}
            onPress={() => setFiltroSelecionado('Rascunho')}
          >
            <Text style={[styles.filterText, filtroSelecionado === 'Rascunho' && styles.filterTextSelected]}>Em Andamento</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, filtroSelecionado === 'Finalizado' && styles.filterChipSelected]}
            onPress={() => setFiltroSelecionado('Finalizado')}
          >
            <Text style={[styles.filterText, filtroSelecionado === 'Finalizado' && styles.filterTextSelected]}>Finalizadas</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico Real (SQLite)</Text>
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
              {carregando ? 'Carregando dados...' : 'Nenhuma ocorrência salva no celular.'}
            </Text>
            {!carregando && (
              <Text style={{fontSize: 12, color: '#bbb', marginTop: 10}}>
                Crie uma nova ocorrência para testar o banco de dados.
              </Text>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}
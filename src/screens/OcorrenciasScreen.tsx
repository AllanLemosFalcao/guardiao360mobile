import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  ListRenderItem 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho conforme sua estrutura

// Importação do estilo separado
import { styles } from './OcorrenciasScreen.styles';

// Tipagem para navegação
type OcorrenciasScreenProp = NativeStackNavigationProp<RootStackParamList, 'Ocorrencias'>;

// Tipagem dos dados
type Ocorrencia = {
  id: string;
  codigo: string;
  dataHora: string;
  viatura: string;
  natureza: string;
  status: 'Ativa' | 'Analise' | 'Concluida' | 'Pendente';
};

// DADOS MOCKADOS (Simulação do Banco de Dados)
const ATIVAS_MOCK: Ocorrencia[] = [
  { id: '1', codigo: 'OCO-2025-01', dataHora: 'Hoje 14:30', viatura: 'ABT-12', natureza: 'Incêndio', status: 'Ativa' },
  { id: '2', codigo: 'OCO-2025-02', dataHora: 'Hoje 10:00', viatura: 'ABS-04', natureza: 'Vistoria', status: 'Analise' },
];

const HISTORICO_MOCK: Ocorrencia[] = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 10),
  codigo: `OCO-2023-${30 + i}`,
  dataHora: '15/05/2023 10:30',
  viatura: 'UR-05',
  natureza: i % 2 === 0 ? 'APH' : 'Salvamento',
  status: i % 3 === 0 ? 'Pendente' : 'Concluida',
}));

export default function OcorrenciasScreen() {
  const navigation = useNavigation<OcorrenciasScreenProp>();
  
  // Estado para os Filtros
  const [filtroSelecionado, setFiltroSelecionado] = useState<'Todos' | 'Pendente' | 'Concluida'>('Todos');

  // Lógica de Filtragem
  const dadosFiltrados = HISTORICO_MOCK.filter(item => {
    if (filtroSelecionado === 'Todos') return true;
    return item.status === filtroSelecionado;
  });

  // --- Render Item: Ocorrência ATIVA (Horizontal) ---
  // Ao clicar aqui, também leva para detalhes, pois é uma ocorrência em andamento
  const renderActiveItem: ListRenderItem<Ocorrencia> = ({ item }) => (
    <TouchableOpacity 
      style={styles.activeCard} 
      activeOpacity={0.8}
      onPress={() => navigation.navigate('DetalhesOcorrencia', { 
        idOcorrencia: item.codigo,
        dadosIniciais: {
          natureza: item.natureza,
          horaDespacho: item.dataHora,
          status: item.status,
          viatura: item.viatura
        }
      })}
    >
      <View style={styles.activeCardHeader}>
        <Text style={{fontWeight: 'bold', fontSize: 16}}>{item.codigo}</Text>
        <Text style={[
          styles.activeLabel, 
          item.status === 'Analise' && { color: '#1976D2', backgroundColor: '#E3F2FD' }
        ]}>
          {item.status === 'Ativa' ? 'EM ANDAMENTO' : 'EM ANÁLISE'}
        </Text>
      </View>
      <Text style={styles.cardLabel}>Natureza: <Text style={styles.cardValue}>{item.natureza}</Text></Text>
      <Text style={styles.cardLabel}>Viatura: <Text style={styles.cardValue}>{item.viatura}</Text></Text>
      <Text style={styles.cardLabel}>Horário: <Text style={styles.cardValue}>{item.dataHora}</Text></Text>
    </TouchableOpacity>
  );

  // --- Render Item: Ocorrência HISTÓRICO (Grid Vertical) ---
  const renderHistoryItem: ListRenderItem<Ocorrencia> = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.7}
      // NAVEGAÇÃO AO CLICAR NO CARD DO HISTÓRICO
      onPress={() => navigation.navigate('DetalhesOcorrencia', { 
        idOcorrencia: item.codigo,
        dadosIniciais: {
          natureza: item.natureza,
          horaDespacho: item.dataHora,
          status: item.status,
          viatura: item.viatura
        }
      })}
    >
      <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
         <Text style={styles.cardTitle}>{item.codigo}</Text>
      </View>
      
      <View style={{marginVertical: 4}}>
        <Text style={styles.cardLabel}>Data/hora: <Text style={styles.cardValue}>{item.dataHora}</Text></Text>
        <Text style={styles.cardLabel}>Viatura: <Text style={styles.cardValue}>{item.viatura}</Text></Text>
      </View>

      <Text style={[
        styles.statusText, 
        item.status === 'Pendente' ? { color: '#F57C00' } : { color: '#2E7D32' }
      ]}>
        Status: {item.status}
      </Text>
    </TouchableOpacity>
  );

  // --- Componente de Cabeçalho (Filtros + Lista Horizontal) ---
  // Isso rola junto com a lista principal
  const HeaderComponent = () => (
    <View>
      {/* 1. Área de Filtros (Scroll Horizontal) */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <TouchableOpacity 
            style={[styles.filterChip, filtroSelecionado === 'Todos' && styles.filterChipSelected]}
            onPress={() => setFiltroSelecionado('Todos')}
          >
            <View style={[styles.radioCircle, filtroSelecionado === 'Todos' && { borderColor: '#B71C1C' }]}>
               {filtroSelecionado === 'Todos' && <View style={styles.radioInnerCircle} />}
            </View>
            <Text style={[styles.filterText, filtroSelecionado === 'Todos' && styles.filterTextSelected]}>Todas</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, filtroSelecionado === 'Pendente' && styles.filterChipSelected]}
            onPress={() => setFiltroSelecionado('Pendente')}
          >
            <View style={[styles.radioCircle, filtroSelecionado === 'Pendente' && { borderColor: '#B71C1C' }]}>
               {filtroSelecionado === 'Pendente' && <View style={styles.radioInnerCircle} />}
            </View>
            <Text style={[styles.filterText, filtroSelecionado === 'Pendente' && styles.filterTextSelected]}>Não Lidas</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, filtroSelecionado === 'Concluidas' && styles.filterChipSelected]}
            onPress={() => setFiltroSelecionado('Concluidas')} // Ajuste conforme seu tipo
          >
             <View style={[styles.radioCircle, filtroSelecionado === 'Concluidas' && { borderColor: '#B71C1C' }]}>
               {filtroSelecionado === 'Concluidas' && <View style={styles.radioInnerCircle} />}
            </View>
            <Text style={[styles.filterText, filtroSelecionado === 'Concluidas' && styles.filterTextSelected]}>Tarefas</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 2. Seção: Em Andamento / Ativas */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>⚠️ Em Andamento</Text>
        <FlatList 
          data={ATIVAS_MOCK}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderActiveItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 10, paddingRight: 16 }}
        />
      </View>

      {/* 3. Título do Histórico */}
      <View style={styles.historyHeader}>
         {/* Espaço opcional para outro título se desejar */}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Fixo (Título da Pagina) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ocorrências</Text>
        <View style={{ width: 32 }} /> 
      </View>

      {/* Lista Principal (Histórico) */}
      <FlatList
        data={dadosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={HeaderComponent} // Renderiza os filtros e a lista horizontal antes
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={{textAlign: 'center', marginTop: 20, color: '#999'}}>
            Nenhuma ocorrência encontrada.
          </Text>
        }
      />
    </SafeAreaView>
  );
}
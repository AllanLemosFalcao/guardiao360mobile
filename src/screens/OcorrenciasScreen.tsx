import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { styles } from './OcorrenciasScreen.styles';

// Tipagem
type Ocorrencia = {
  id: string;
  codigo: string;
  dataHora: string;
  viatura: string;
  natureza: string;
  status: 'Ativa' | 'Analise' | 'Concluida';
};

// DADOS MOCKADOS (Simulando o Banco de Dados)
const ATIVAS_MOCK: Ocorrencia[] = [
  { id: '1', codigo: 'OCO-2025-01', dataHora: 'Hoje 14:30', viatura: 'ABT-12', natureza: 'Incêndio', status: 'Ativa' },
  { id: '2', codigo: 'OCO-2025-02', dataHora: 'Hoje 10:00', viatura: 'ABS-04', natureza: 'Vistoria', status: 'Analise' },
];

const HISTORICO_MOCK: Ocorrencia[] = Array.from({ length: 8 }).map((_, i) => ({
  id: String(i + 10),
  codigo: `OCO-2023-${30 + i}`,
  dataHora: '15/05/2023',
  viatura: 'UR-05',
  natureza: 'APH',
  status: 'Concluida',
}));

export default function OcorrenciasScreen() {
  const navigation = useNavigation();
  
  // Estado para os Filtros
  const [filtroTipo, setFiltroTipo] = useState<'Todos' | 'Status' | 'Natureza' | 'Data'>('Todos');

  // --- Renderiza um Card de Ocorrência ATIVA (Horizontal) ---
  const renderActiveItem = ({ item }: { item: Ocorrencia }) => (
    <TouchableOpacity style={styles.activeCard}>
      <View style={styles.activeCardHeader}>
        <Text style={{fontWeight: 'bold', fontSize: 16}}>{item.codigo}</Text>
        <Text style={[styles.activeLabel, item.status === 'Analise' && { color: '#1976D2', backgroundColor: '#E3F2FD' }]}>
          {item.status === 'Ativa' ? 'EM ANDAMENTO' : 'EM ANÁLISE'}
        </Text>
      </View>
      <Text style={styles.cardLabel}>Natureza: <Text style={styles.cardValue}>{item.natureza}</Text></Text>
      <Text style={styles.cardLabel}>Viatura: <Text style={styles.cardValue}>{item.viatura}</Text></Text>
      <Text style={styles.cardLabel}>Horário: <Text style={styles.cardValue}>{item.dataHora}</Text></Text>
    </TouchableOpacity>
  );

  // --- Renderiza um Card de HISTÓRICO (Grid Vertical) ---
  const renderHistoryItem = ({ item }: { item: Ocorrencia }) => (
    <View style={styles.card}>
      <View style={{flexDirection:'row', justifyContent:'space-between'}}>
         <MaterialCommunityIcons name="file-document-check-outline" size={20} color="#666" />
         <Text style={styles.cardTitle}>{item.codigo}</Text>
      </View>
      
      <View style={{marginVertical: 4}}>
        <Text style={styles.cardLabel}>{item.natureza}</Text>
        <Text style={styles.cardValue}>{item.dataHora}</Text>
      </View>

      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>CONCLUÍDA</Text>
      </View>
    </View>
  );

  // --- Componente de Cabeçalho (Parte de Cima da Tela) ---
  const HeaderComponent = () => (
    <View>
      {/* 1. Área de Filtros (Scroll Horizontal) */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <TouchableOpacity 
            style={[styles.filterChip, filtroTipo === 'Todos' && styles.filterChipSelected]}
            onPress={() => setFiltroTipo('Todos')}
          >
            <Text style={[styles.filterText, filtroTipo === 'Todos' && styles.filterTextSelected]}>Tudo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterChip} onPress={() => alert('Abrir Modal de Status')}>
            <Text style={styles.filterText}>Status ▼</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterChip} onPress={() => alert('Abrir Modal de Natureza')}>
            <Text style={styles.filterText}>Natureza ▼</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterChip} onPress={() => alert('Abrir Calendário')}>
            <Text style={styles.filterText}>Data 📅</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 2. Seção: Em Andamento / Ativas */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>⚠️ Em Andamento / Pendentes</Text>
        <FlatList 
          data={ATIVAS_MOCK}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderActiveItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 10 }} // Sombra não cortar
        />
      </View>

      {/* 3. Título do Histórico */}
      <View style={styles.historyHeader}>
         <Text style={styles.sectionTitle}>📂 Histórico Completo</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Fixo (Título da Pagina) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Ocorrências</Text>
        <TouchableOpacity>
           <Feather name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Lista Principal (Controla o Scroll da página toda) */}
      <FlatList
        data={HISTORICO_MOCK}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        
        // A Mágica acontece aqui: Colocamos tudo que vem antes do histórico no Header
        ListHeaderComponent={HeaderComponent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
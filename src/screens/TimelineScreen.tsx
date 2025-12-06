import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  FlatList 
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './TimelineScreen.styles';
import { RootStackParamList } from '../../App'; // Ajuste o caminho se necessário

// Tipagem dos dados da Timeline
type TimelineEvent = {
  id: string;
  type: 'criacao' | 'deslocamento' | 'chegada' | 'foto' | 'status' | 'finalizacao';
  title: string;
  description: string;
  time: string;
  author: string;
};

// DADOS MOCKADOS (Simulando o histórico vindo do banco)
const TIMELINE_DATA: TimelineEvent[] = [
  {
    id: '6',
    type: 'finalizacao',
    title: 'Ocorrência Finalizada',
    description: 'Relatório preenchido e guarnição retornando à base.',
    time: '11:45',
    author: 'Cap. João Silva'
  },
  {
    id: '5',
    type: 'status',
    title: 'Incêndio Controlado',
    description: 'Fogo extinto, iniciando fase de rescaldo.',
    time: '11:15',
    author: 'Cap. João Silva'
  },
  {
    id: '4',
    type: 'foto',
    title: 'Registro Visual',
    description: 'Foto adicionada da fachada da edificação.',
    time: '10:40',
    author: 'Sd. Rocha'
  },
  {
    id: '3',
    type: 'chegada',
    title: 'Chegada no Local (QTA)',
    description: 'Viatura ABT-12 no local. Hodômetro: 15430.',
    time: '10:35',
    author: 'Cap. João Silva'
  },
  {
    id: '2',
    type: 'deslocamento',
    title: 'Em Deslocamento',
    description: 'Viatura ABT-12 iniciou o deslocamento para o sinistro.',
    time: '10:30',
    author: 'Cap. João Silva'
  },
  {
    id: '1',
    type: 'criacao',
    title: 'Ocorrência Criada',
    description: 'Incêndio em edificação comercial recebido via CIODS.',
    time: '10:28',
    author: 'Central (CIODS)'
  },
];

type TimelineRouteProp = RouteProp<RootStackParamList, 'Timeline'>;

export default function TimelineScreen() {
  const navigation = useNavigation();
  const route = useRoute<TimelineRouteProp>();
  const { idOcorrencia } = route.params || { idOcorrencia: '---' };

  // Função para escolher ícone e cor baseado no tipo
  const getEventStyle = (type: string) => {
    switch (type) {
      case 'criacao':
        return { icon: 'file-plus', color: '#1976D2', lib: Feather };
      case 'deslocamento':
        return { icon: 'truck-fast', color: '#F57C00', lib: MaterialCommunityIcons };
      case 'chegada':
        return { icon: 'map-marker-check', color: '#2E7D32', lib: MaterialCommunityIcons };
      case 'foto':
        return { icon: 'camera', color: '#7B1FA2', lib: Feather };
      case 'finalizacao':
        return { icon: 'flag-checkered', color: '#388E3C', lib: MaterialCommunityIcons };
      default:
        return { icon: 'info', color: '#666', lib: Feather };
    }
  };

  const renderItem = ({ item, index }: { item: TimelineEvent, index: number }) => {
    const style = getEventStyle(item.type);
    const IconLib = style.lib;
    const isLast = index === TIMELINE_DATA.length - 1;

    return (
      <View style={styles.itemContainer}>
        {/* Hora */}
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>

        {/* Linha e Bolinha */}
        <View style={styles.indicatorColumn}>
          <View style={[styles.iconCircle, { backgroundColor: style.color }]}>
            <IconLib name={style.icon as any} size={14} color="#fff" />
          </View>
          {/* Só desenha a linha se não for o último item */}
          {!isLast && <View style={styles.line} />}
        </View>

        {/* Card de Conteúdo */}
        <View style={styles.cardColumn}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
            
            <View style={styles.authorContainer}>
              <Feather name="user" size={10} color="#888" />
              <Text style={styles.authorText}>{item.author}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Timeline {idOcorrencia}</Text>
      </View>

      <FlatList
        data={TIMELINE_DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
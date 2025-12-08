import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  FlatList, 
  Image 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { styles } from './NotificacoesScreen.styles';

// Tipo de Dado Mockado
type Notificacao = {
  id: string;
  nome: string;
  mensagem: string;
  tempo: string;
  avatar: string;
};

const DADOS_NOTIFICACOES: Notificacao[] = [
  { id: '1', nome: 'Cabo Cesar', mensagem: '“As ocorrências foram finalizadas”', tempo: '20 min', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: '2', nome: 'Cabo Cesar', mensagem: '“Irei te enviar reforços”', tempo: '40 min', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: '3', nome: 'Sargento Carol', mensagem: '“A reunião Breve Acontecerá”', tempo: '50 min', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: '4', nome: 'Comandante Julio', mensagem: '“Atualizado o levantamento de ocorrências”', tempo: '2h', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: '5', nome: 'Soldado Rocha', mensagem: '“Verifica as Ocorrências pendentes”', tempo: '3h', avatar: 'https://i.pravatar.cc/150?img=8' },
];

export default function NotificacoesScreen() {
  const navigation = useNavigation();
  const [filtroAtivo, setFiltroAtivo] = useState<'Recebidas' | 'NaoLidas' | 'Enviadas'>('Recebidas');

  const renderItem = ({ item }: { item: Notificacao }) => (
    <View style={styles.notificationItem}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.senderName}>{item.nome}</Text>
          <Text style={styles.timeText}>{item.tempo}</Text>
        </View>
        <Text style={styles.messageText}>{item.mensagem}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <TouchableOpacity>
           <Feather name="search" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Abas de Filtro */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, filtroAtivo === 'Recebidas' && styles.tabButtonActive]}
          onPress={() => setFiltroAtivo('Recebidas')}
        >
          <Text style={[styles.tabText, filtroAtivo === 'Recebidas' && styles.tabTextActive]}>Recebidas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, filtroAtivo === 'NaoLidas' && styles.tabButtonActive]}
          onPress={() => setFiltroAtivo('NaoLidas')}
        >
          <Text style={[styles.tabText, filtroAtivo === 'NaoLidas' && styles.tabTextActive]}>Não lidas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, filtroAtivo === 'Enviadas' && styles.tabButtonActive]}
          onPress={() => setFiltroAtivo('Enviadas')}
        >
          <Text style={[styles.tabText, filtroAtivo === 'Enviadas' && styles.tabTextActive]}>Enviadas</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={DADOS_NOTIFICACOES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}
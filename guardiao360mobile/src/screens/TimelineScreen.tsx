import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  FlatList, 
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './TimelineScreen.styles';
import { RootStackParamList } from '../../App';
import { executeSql } from '../services/db';

type TimelineEvent = {
  id: string;
  type: 'criacao' | 'chegada' | 'foto' | 'finalizacao' | 'info';
  title: string;
  description: string;
  time: string; // Exibição visual (HH:MM)
  fullDate: Date; // Para ordenação
  author: string;
};

type TimelineRouteProp = RouteProp<RootStackParamList, 'Timeline'>;

export default function TimelineScreen() {
  const navigation = useNavigation();
  const route = useRoute<TimelineRouteProp>();
  const { idOcorrencia } = route.params || { idOcorrencia: '---' };
  
  const [timelineData, setTimelineData] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // --- HELPER 1: Extrair HH:MM para exibição visual ---
  const extrairHoraVisual = (str: string) => {
    if (!str) return '--:--';
    // ISO Date
    if (str.includes('T') && str.includes('Z')) {
      return new Date(str).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    // "07/12/2025 14:30"
    if (str.includes(' ') && str.includes(':')) {
      return str.split(' ')[1].substring(0, 5);
    }
    // "14:30"
    return str.substring(0, 5);
  };

  // --- HELPER 2: Parser Inteligente para Ordenação ---
  // dateStr: O valor do campo (pode ser hora, data completa ou ISO)
  // anchorDateStr: A data base da ocorrência ("DD/MM/YYYY") para quando temos só hora
  const parseDataOrdenacao = (dateStr: string, anchorDateStr: string) => {
    try {
      if (!dateStr) return new Date(0); // Data muito antiga para ir pro topo/fundo se der erro

      // 1. É ISO (Ex: Fotos)?
      if (dateStr.includes('T') && strEndsWithZ(dateStr)) { 
        return new Date(dateStr);
      }

      // 2. É Data Completa "DD/MM/YYYY HH:MM"? (Ex: Chegada)
      if (dateStr.includes('/') && dateStr.includes(':') && dateStr.length > 10) {
        const [d, h] = dateStr.split(' ');
        const [dia, mes, ano] = d.split('/').map(Number);
        const [hora, min] = h.split(':').map(Number);
        return new Date(ano, mes - 1, dia, hora, min);
      }

      // 3. É Apenas Hora "HH:MM"? (Ex: Saída) -> Usa a Data Âncora
      if (dateStr.includes(':') && !dateStr.includes('/')) {
        const [hora, min] = dateStr.split(':').map(Number);
        
        // Se temos data âncora, usa ela
        if (anchorDateStr && anchorDateStr.includes('/')) {
          const [dia, mes, ano] = anchorDateStr.split('/').map(Number);
          return new Date(ano, mes - 1, dia, hora, min);
        }
        
        // Se não tem âncora, assume hoje (fallback)
        const hoje = new Date();
        hoje.setHours(hora, min, 0, 0);
        return hoje;
      }

      return new Date();
    } catch (e) {
      return new Date();
    }
  };

  const strEndsWithZ = (s: string) => s.endsWith('Z') || s.includes('+');

  const carregarTimeline = async () => {
    setLoading(true);
    try {
      // Busca dados da ocorrência
      const resultOco = await executeSql(
        `SELECT * FROM ocorrencias WHERE numero_ocorrencia = ? OR id = ? LIMIT 1;`,
        [idOcorrencia, idOcorrencia]
      );

      if (resultOco.rows.length === 0) {
        setLoading(false);
        return;
      }

      const oco = resultOco.rows.item(0);
      const dbId = oco.id;
      
      // DATA ÂNCORA (Data do acionamento)
      // Essencial para ordenar eventos que só têm hora gravada
      const dataBase = oco.data_acionamento || new Date().toLocaleDateString('pt-BR'); 

      const listaEventos: TimelineEvent[] = [];

      // --- 1. EVENTO: INÍCIO (PARTIDA) ---
      // Usa data_acionamento + hora_acionamento
      const horaPartida = oco.hora_acionamento || '';
      if (horaPartida) {
        const gpsPartida = (oco.latitude_partida) ? `\n📍 Partida: ${parseFloat(oco.latitude_partida).toFixed(4)}, ${parseFloat(oco.longitude_partida).toFixed(4)}` : '';
        
        listaEventos.push({
          id: 'evt_criacao',
          type: 'criacao',
          title: 'Deslocamento Iniciado',
          description: `Viatura ${oco.tipo_viatura}-${oco.numero_viatura} em rota.${gpsPartida}`,
          time: extrairHoraVisual(horaPartida),
          // Combina Data Base + Hora Partida para ordenar
          fullDate: parseDataOrdenacao(horaPartida, dataBase),
          author: 'Sistema'
        });
      }

      // --- 2. EVENTO: CHEGADA (CENA) ---
      // Esse campo agora já é completo "DD/MM/YYYY HH:MM"
      const dataHoraChegada = oco.data_hora_chegada_local || '';
      if (dataHoraChegada) {
        const gpsChegada = (oco.latitude_chegada) ? `\n📍 Cena: ${parseFloat(oco.latitude_chegada).toFixed(4)}, ${parseFloat(oco.longitude_chegada).toFixed(4)}` : '';

        listaEventos.push({
          id: 'evt_chegada',
          type: 'chegada',
          title: 'Chegada no Local (QTA)',
          description: `Guarnição na cena.${gpsChegada}`,
          time: extrairHoraVisual(dataHoraChegada),
          // Passa a string completa, o parser vai detectar que tem data e ignorar a âncora
          fullDate: parseDataOrdenacao(dataHoraChegada, dataBase),
          author: oco.chefe_guarnicao || 'Guarnição'
        });
      }

      // --- 3. EVENTO: MÍDIAS (FOTOS) ---
      const resultMidias = await executeSql(`SELECT * FROM midias WHERE ocorrencia_id = ?`, [dbId]);
      const midias = resultMidias.rows._array;
      
      midias.forEach((m: any) => {
        // Data ISO "2025-12-07T10:00:00.000Z"
        listaEventos.push({
          id: `evt_midia_${m.id}`,
          type: 'foto',
          title: 'Foto Anexada',
          description: 'Registro visual.',
          time: extrairHoraVisual(m.data_captura),
          fullDate: parseDataOrdenacao(m.data_captura, dataBase),
          author: 'Guarnição'
        });
      });

      // --- 4. EVENTO: FINALIZAÇÃO ---
      // Geralmente só tem hora "HH:MM", precisa da âncora
      const horaFim = oco.hora_saida_local || '';
      if (oco.status === 'FINALIZADO' || horaFim) {
        listaEventos.push({
          id: 'evt_fim',
          type: 'finalizacao',
          title: 'Finalização / Saída',
          description: `Natureza: ${oco.natureza_final || '---'}\nRelatório concluído.`,
          time: extrairHoraVisual(horaFim || '--:--'),
          // Se horaFim estiver vazia mas status finalizado, joga pro final (now)
          fullDate: horaFim ? parseDataOrdenacao(horaFim, dataBase) : new Date(),
          author: oco.chefe_guarnicao || 'Chefe'
        });
      }

      // --- ORDENAÇÃO ROBUSTA ---
      listaEventos.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
      
      setTimelineData(listaEventos);

    } catch (error) {
      console.error("Erro timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarTimeline();
    }, [idOcorrencia])
  );

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'criacao': return { icon: 'truck-fast', color: '#1976D2', lib: MaterialCommunityIcons };
      case 'chegada': return { icon: 'map-marker-check', color: '#F57C00', lib: MaterialCommunityIcons };
      case 'foto': return { icon: 'camera', color: '#7B1FA2', lib: Feather };
      case 'finalizacao': return { icon: 'flag-checkered', color: '#2E7D32', lib: MaterialCommunityIcons };
      default: return { icon: 'info', color: '#666', lib: Feather };
    }
  };

  const renderItem = ({ item, index }: { item: TimelineEvent, index: number }) => {
    const style = getEventStyle(item.type);
    const IconLib = style.lib;
    const isLast = index === timelineData.length - 1;

    return (
      <View style={styles.itemContainer}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <View style={styles.indicatorColumn}>
          <View style={[styles.iconCircle, { backgroundColor: style.color }]}>
            <IconLib name={style.icon as any} size={14} color="#fff" />
          </View>
          {!isLast && <View style={styles.line} />}
        </View>
        <View style={styles.cardColumn}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
            {item.author && (
              <View style={styles.authorContainer}>
                <Feather name="user" size={10} color="#888" />
                <Text style={styles.authorText}>{item.author}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Timeline #{idOcorrencia}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1976D2" style={{marginTop: 50}} />
      ) : timelineData.length === 0 ? (
        <View style={{padding: 20, alignItems: 'center'}}>
           <Text style={{color:'#666'}}>Nenhum evento registrado ainda.</Text>
        </View>
      ) : (
        <FlatList
          data={timelineData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Image,
  Alert 
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { RootStackParamList } from '../../App'; 
import { styles } from './DetalhesOcorrencia.styles';

type DetalhesScreenRouteProp = RouteProp<RootStackParamList, 'DetalhesOcorrencia'>;

export default function DetalhesOcorrenciaScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<DetalhesScreenRouteProp>();
  
  // Recebe dados da Home ou da Nova Ocorrência
  // Agora incluímos o 'dbId' (ID do SQLite)
  const { idOcorrencia, dadosIniciais, dbId } = route.params || { 
    idOcorrencia: 'OCO-2023-05', 
    dadosIniciais: {},
    dbId: undefined 
  };

  const ocorrencia = {
    codigo: idOcorrencia,
    status: dadosIniciais?.status || 'Pendente',
    tipo: dadosIniciais?.viatura || 'Viatura Indefinida', // Ajustei para mostrar Viatura
    dataHora: dadosIniciais?.horaDespacho || '---',
    reclamante: dadosIniciais?.solicitante || '---',
    localizacao: dadosIniciais?.grupamento || '---',
    descricao: 'Ocorrência em andamento. Preencha as etapas abaixo para atualizar.'
  };

  // --- AÇÃO: BOTÃO 1 (Etapa 2 e 3) ---
  const handleEtapa2_3 = () => {
    // Passamos o dbId para a tela de Chegada saber ONDE salvar
    navigation.navigate('ChegadaCena', { 
      idOcorrencia: idOcorrencia,
      dbId: dbId 
    });
  };

  // --- AÇÃO: BOTÃO 2 (Etapa 4) ---
  const handleEtapa4 = () => {
    navigation.navigate('RelatorioFinal', { 
      idOcorrencia: idOcorrencia,
      dbId: dbId 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Registro</Text>
      </View>

      {/* 2. BARRA DE AÇÃO (BOTÕES TOPO) */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={[styles.stageButton, styles.btnEtapa23]} 
          onPress={handleEtapa2_3}
        >
          <MaterialCommunityIcons name="map-marker-check" size={18} color="#fff" />
          <Text style={styles.stageButtonText}>CHEGADA / CENA</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.stageButton, styles.btnEtapa4]} 
          onPress={handleEtapa4}
        >
          <MaterialCommunityIcons name="file-document-edit" size={18} color="#fff" />
          <Text style={styles.stageButtonText}>RELATÓRIO FINAL</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* 3. Dados Principais */}
        <Text style={styles.ocorrenciaTitle}>Ocorrência {ocorrencia.codigo}</Text>
        {/* Debug visual para sabermos se o ID do banco chegou (pode remover depois) */}
        {dbId && <Text style={{fontSize:10, color:'#aaa', marginBottom:10}}>ID Interno: {dbId}</Text>}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          <View style={[styles.statusBadge, ocorrencia.status === 'Finalizado' && {backgroundColor: '#4CAF50'}]}>
            <Text style={styles.statusText}>{ocorrencia.status}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Viatura</Text>
          <Text style={styles.detailValue}>{ocorrencia.tipo}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Data/Hora</Text>
          <Text style={styles.detailValue}>{ocorrencia.dataHora}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Grupamento</Text>
          <Text style={styles.detailValue}>{ocorrencia.localizacao}</Text>
        </View>

        {/* 4. Mídias e Descrição */}
        <Text style={styles.sectionHeader}>Resumo</Text>
        <Text style={styles.descriptionText}>
          {ocorrencia.descricao}
        </Text>

        {/* 5. Botão Timeline */}
        <TouchableOpacity 
          style={styles.grayButton}
          onPress={() => navigation.navigate('Timeline', { idOcorrencia: ocorrencia.codigo })}
        >
          <MaterialCommunityIcons name="timeline-clock" size={24} color="#333" />
          <Text style={styles.grayButtonText}>Timeline da ocorrência</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
}
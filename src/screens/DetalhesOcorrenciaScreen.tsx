import React, { useState } from 'react';
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
  const navigation = useNavigation();
  const route = useRoute<DetalhesScreenRouteProp>();
  
  // Recebe dados da Home (clique no card) ou da Nova Ocorrência (Deslocamento)
  const { idOcorrencia, dadosIniciais } = route.params || { 
    idOcorrencia: 'OCO-2023-05', 
    dadosIniciais: {} 
  };

  // Preenche com dados recebidos OU dados mockados (para visualização se vier vazio)
  const ocorrencia = {
    codigo: idOcorrencia,
    status: dadosIniciais?.status || 'Pendente',
    tipo: dadosIniciais?.natureza || 'Viatura Abandonada',
    dataHora: dadosIniciais?.horaDespacho || '15/05/2023 10:30',
    reclamante: dadosIniciais?.solicitante || 'José Paulo',
    localizacao: dadosIniciais?.endereco || 'Lat: -8.0578, Long: -34.88',
    descricao: 'Veículo encontrado na rua das Flores em estado de abandono, sem ocupantes e com sinais de vandalismo.'
  };

  // --- AÇÃO: BOTÃO 1 (Etapa 2 e 3) ---
const handleEtapa2_3 = () => {
  navigation.navigate('ChegadaCena', { idOcorrencia: idOcorrencia });
};

  // --- AÇÃO: BOTÃO 2 (Etapa 4) ---
  const handleEtapa4 = () => {
        navigation.navigate('RelatorioFinal', { idOcorrencia: idOcorrencia });
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. Header (Voltar + Título) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Registro</Text>
      </View>

      {/* 2. BARRA DE AÇÃO (BOTÕES TOPO) - SOLICITADO */}
      <View style={styles.actionButtonsContainer}>
        {/* Botão para Etapa 2 e 3 */}
        <TouchableOpacity 
          style={[styles.stageButton, styles.btnEtapa23]} 
          onPress={handleEtapa2_3}
        >
          <MaterialCommunityIcons name="map-marker-check" size={18} color="#fff" />
          <Text style={styles.stageButtonText}>CHEGADA / CENA</Text>
        </TouchableOpacity>

        {/* Botão para Etapa 4 */}
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

        {/* Linha Status */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          <View style={[styles.statusBadge, ocorrencia.status === 'Finalizado' && {backgroundColor: '#4CAF50'}]}>
            <Text style={styles.statusText}>{ocorrencia.status}</Text>
          </View>
        </View>

        {/* Linha Tipo */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tipo</Text>
          <Text style={styles.detailValue}>{ocorrencia.tipo}</Text>
        </View>

        {/* Linha Data/Hora */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Data/Hora</Text>
          <Text style={styles.detailValue}>{ocorrencia.dataHora}</Text>
        </View>

        {/* Linha Reclamante */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Reclamante</Text>
          <Text style={styles.detailValue}>{ocorrencia.reclamante}</Text>
        </View>

        {/* Linha GPS */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Localização GPS</Text>
          <Text style={styles.detailValue}>{ocorrencia.localizacao}</Text>
        </View>

        {/* 4. Mídias e Descrição */}
        <Text style={styles.sectionHeader}>Mídias</Text>
        
        <View style={styles.mediaRow}>
          {/* Exemplo de imagem de carro queimado (Placeholder) */}
          <View style={styles.mediaItem}>
             <Image 
               source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png' }} 
               style={styles.mediaImage} 
               resizeMode="cover"
             />
          </View>
          {/* Ícone de prancheta */}
          <View style={[styles.mediaItem, { backgroundColor: '#fff', borderColor: '#ccc' }]}>
             <FontAwesome5 name="clipboard-list" size={40} color="#888" />
          </View>
        </View>

        <Text style={styles.descriptionText}>
          {ocorrencia.descricao}
        </Text>

        {/* 5. Botões de Mídia (Cinza) */}
        <TouchableOpacity style={styles.grayButton}>
          <FontAwesome5 name="video" size={20} color="#333" />
          <Text style={styles.grayButtonText}>Adicionar vídeo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.grayButton}>
          <MaterialCommunityIcons name="timeline-clock" size={24} color="#333" />
          <Text style={styles.grayButtonText}>Timeline da ocorrência</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
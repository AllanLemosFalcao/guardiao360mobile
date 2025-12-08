import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert 
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App'; 
import { styles } from './DetalhesOcorrenciaScreen.styles';
import { executeSql } from '../services/db';

type DetalhesScreenRouteProp = RouteProp<RootStackParamList, 'DetalhesOcorrencia'>;

export default function DetalhesOcorrenciaScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<DetalhesScreenRouteProp>();
  
  const { idOcorrencia, dadosIniciais, dbId } = route.params || { 
    idOcorrencia: '---', 
    dadosIniciais: {},
    dbId: 0 
  };

  // Estado para armazenar TODOS os dados (Ocorrência + Vítima)
  const [dadosCompletos, setDadosCompletos] = useState<any>(null);
  const [vitima, setVitima] = useState<any>(null);

  // --- BUSCAR DADOS COMPLETOS ---
  useFocusEffect(
    useCallback(() => {
      const fetchDados = async () => {
        if(!dbId) return;
        try {
          // 1. Busca Ocorrência
          const resultOco = await executeSql(`SELECT * FROM ocorrencias WHERE id = ?`, [dbId]);
          if(resultOco.rows.length > 0) {
            setDadosCompletos(resultOco.rows.item(0));
          }

          // 2. Busca Vítima (se houver)
          const resultVit = await executeSql(`SELECT * FROM vitimas WHERE ocorrencia_id = ?`, [dbId]);
          if(resultVit.rows.length > 0) {
            setVitima(resultVit.rows.item(0));
          } else {
            setVitima(null);
          }

        } catch(e) { console.log(e); }
      };
      fetchDados();
    }, [dbId])
  );

  // --- LÓGICA DE CORES DOS STATUS (MANTENDO SUAS CORES) ---
  const getStatusStyle = (status: string) => {
    const s = status?.toUpperCase() || '';
    if (s === 'FINALIZADO') return { color: '#2E7D32', label: 'FINALIZADO' }; // Verde
    if (s === 'EM_CENA') return { color: '#1565C0', label: 'EM CENA' };       // Azul
    return { color: '#B71C1C', label: 'EM DESLOCAMENTO' };                    // Vermelho (Sua cor personalizada)
  };
  
  const statusInfo = getStatusStyle(dadosCompletos?.status);

  // Componente Auxiliar para Linhas de Dados (Para limpar o código visual)
  const InfoRow = ({ label, value }: { label: string, value: any }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '---'}</Text>
    </View>
  );

  // --- AÇÕES ---
  const handleBotaoInicio = async () => {
    if (!dbId) return;
    navigation.navigate('NovaOcorrencia', {
      modoEditar: true,
      dbId: dbId,
      dadosAntigos: dadosCompletos
    });
  };

  const handleBotaoCena = () => navigation.navigate('ChegadaCena', { idOcorrencia, dbId });
  const handleBotaoFinal = () => navigation.navigate('RelatorioFinal', { idOcorrencia, dbId });

  const handleExcluir = () => {
    if (!dbId) return;
    Alert.alert("Excluir", "Tem certeza? Isso apagará tudo desta ocorrência.", [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "EXCLUIR", style: "destructive",
        onPress: async () => {
          try {
            await executeSql(`DELETE FROM midias WHERE ocorrencia_id = ?`, [dbId]);
            await executeSql(`DELETE FROM vitimas WHERE ocorrencia_id = ?`, [dbId]);
            await executeSql(`DELETE FROM ocorrencias WHERE id = ?`, [dbId]);
            navigation.goBack();
          } catch (e) { Alert.alert("Erro", "Falha ao excluir."); }
        }
      }
    ]);
  };

  if (!dadosCompletos) return null; // Carregando...

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <TouchableOpacity onPress={handleExcluir} style={{ padding: 8 }}>
          <Feather name="trash-2" size={22} color="#D32F2F" />
        </TouchableOpacity>
      </View>

      {/* BOTÕES DE NAVEGAÇÃO (CORES PRESERVADAS) */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10, justifyContent: 'space-between' }}>
        <TouchableOpacity style={[styles.stageButton, { flex: 1, marginRight: 5, backgroundColor: '#B71C1C' }]} onPress={handleBotaoInicio}>
          <MaterialCommunityIcons name="car-info" size={20} color="#fff" style={{marginBottom: 4}} />
          <Text style={styles.stageButtonText}>INÍCIO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.stageButton, { flex: 1, marginHorizontal: 5, backgroundColor: '#1565C0' }]} onPress={handleBotaoCena}>
          <MaterialCommunityIcons name="map-marker-radius" size={20} color="#fff" style={{marginBottom: 4}} />
          <Text style={styles.stageButtonText}>CENA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.stageButton, { flex: 1, marginLeft: 5, backgroundColor: '#388E3C' }]} onPress={handleBotaoFinal}>
          <MaterialCommunityIcons name="flag-checkered" size={20} color="#fff" style={{marginBottom: 4}} />
          <Text style={styles.stageButtonText}>FINAL</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.ocorrenciaTitle}>Ocorrência {dadosCompletos.numero_ocorrencia}</Text>
        
        {/* Badge de Status */}
        <View style={[styles.statusBadge, {backgroundColor: statusInfo.color, alignSelf:'flex-start', marginBottom: 20}]}>
          <Text style={styles.statusText}>{statusInfo.label}</Text>
        </View>

        {/* --- SEÇÃO 1: DADOS DO ACIONAMENTO (Etapa 1) --- */}
        <Text style={styles.sectionHeader}>1. Dados do Acionamento</Text>
        <View style={{backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, marginBottom: 15, borderWidth: 1, borderColor:'#EEE'}}>
          <InfoRow label="Viatura" value={`${dadosCompletos.tipo_viatura} - ${dadosCompletos.numero_viatura}`} />
          <InfoRow label="Grupamento" value={dadosCompletos.grupamento} />
          <InfoRow label="Ponto Base" value={dadosCompletos.ponto_base} />
          <InfoRow label="Despacho" value={`${dadosCompletos.data_acionamento} ${dadosCompletos.hora_acionamento}`} />
          <InfoRow label="GPS Partida" value={dadosCompletos.latitude_partida ? `${parseFloat(dadosCompletos.latitude_partida).toFixed(5)}, ${parseFloat(dadosCompletos.longitude_partida).toFixed(5)}` : 'Não registrado'} />
        </View>

        {/* --- SEÇÃO 2: LOCALIZAÇÃO E CENA (Etapa 2) --- */}
        <Text style={styles.sectionHeader}>2. Localização e Cena</Text>
        <View style={{backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, marginBottom: 15, borderWidth: 1, borderColor:'#EEE'}}>
          <InfoRow label="Chegada (QTA)" value={dadosCompletos.data_hora_chegada_local} />
          <InfoRow label="GPS Cena" value={dadosCompletos.latitude_chegada ? `${parseFloat(dadosCompletos.latitude_chegada).toFixed(5)}, ${parseFloat(dadosCompletos.longitude_chegada).toFixed(5)}` : 'Não registrado'} />
          <InfoRow label="Município" value={dadosCompletos.municipio} />
          <InfoRow label="Endereço" value={`${dadosCompletos.tipo_logradouro || ''} ${dadosCompletos.logradouro || ''}, ${dadosCompletos.numero_km || ''}`} />
          <InfoRow label="Bairro" value={dadosCompletos.bairro} />
          <InfoRow label="Ref." value={dadosCompletos.ponto_referencia} />
        </View>

        {/* --- SEÇÃO 3: RELATÓRIO OPERACIONAL (Etapa 4) --- */}
        <Text style={styles.sectionHeader}>3. Relatório Operacional</Text>
        <View style={{backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, marginBottom: 15, borderWidth: 1, borderColor:'#EEE'}}>
          <InfoRow label="Natureza" value={dadosCompletos.natureza_final} />
          <InfoRow label="Grupo/Sub" value={dadosCompletos.grupo ? `${dadosCompletos.grupo} / ${dadosCompletos.subgrupo}` : '---'} />
          <InfoRow label="Situação" value={dadosCompletos.situacao_ocorrencia} />
          <InfoRow label="Chefe" value={dadosCompletos.chefe_guarnicao} />
          <InfoRow label="Saída (QTR)" value={dadosCompletos.hora_saida_local} />
          
          <View style={{paddingVertical: 10, borderTopWidth: 1, borderColor: '#eee', marginTop: 5}}>
            <Text style={{fontSize: 12, color: '#777', marginBottom: 4, fontWeight:'bold'}}>HISTÓRICO:</Text>
            <Text style={{fontSize: 14, color: '#333', fontStyle: 'italic'}}>{dadosCompletos.historico_final || 'Nenhum histórico preenchido.'}</Text>
          </View>
        </View>

        {/* --- SEÇÃO 4: VÍTIMA (Condicional) --- */}
        {vitima ? (
          <>
            <Text style={styles.sectionHeader}>4. Dados da Vítima</Text>
            <View style={{backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#E91E63'}}>
              <InfoRow label="Nome" value={vitima.nome} />
              <InfoRow label="Perfil" value={`${vitima.idade} anos / ${vitima.sexo}`} />
              <InfoRow label="Classificação" value={vitima.classificacao} />
              <InfoRow label="Destino" value={vitima.destino} />
              <InfoRow label="Assinatura" value={vitima.status_assinatura} />
            </View>
          </>
        ) : (
          <Text style={{textAlign: 'center', color: '#999', marginVertical: 10}}>Nenhuma vítima registrada nesta ocorrência.</Text>
        )}

        {/* --- BOTÃO TIMELINE --- */}
        <TouchableOpacity 
          style={styles.grayButton}
          onPress={() => navigation.navigate('Timeline', { idOcorrencia: dadosCompletos.numero_ocorrencia })}
        >
          <MaterialCommunityIcons name="timeline-clock" size={24} color="#333" />
          <Text style={styles.grayButtonText}>Ver Linha do Tempo</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert 
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './ChegadaCenaScreen.styles';
import { RootStackParamList } from '../../App';

// Importando função de banco
import { executeSql } from '../services/db';

type ChegadaCenaRouteProp = RouteProp<RootStackParamList, 'ChegadaCena'>;

// --- LISTAS DE OPÇÕES ---
const LISTA_REGIOES = ['RMR', 'SERTÃO', 'ZONA DA MATA'];

const LISTA_MUNICIPIOS = [
  'Abreu e Lima', 'Araçoiaba', 'Cabo de Santo Agostinho', 'Camaragibe', 'Carpina', 
  'Fernando de Noronha', 'Igarassu', 'Ilha de Itamaracá', 'Ipojuca', 'Itapissuma', 
  'Jaboatão dos Guararapes', 'Moreno', 'Olinda', 'Paulista', 'Petrolina', 'Recife', 
  'São Lourenço da Mata'
];

const LISTA_TIPO_LOGRADOURO = [
  'Alameda', 'Av', 'BR', 'Pe', 'Praça', 'Rua', 'Travessa', 'Outro'
];

// --- COMPONENTE: INPUT COM SUGESTÃO ---
const InputComSugestao = ({ label, value, setValue, listaOpcoes, placeholder, zIndexVal = 1 }: any) => {
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  
  const sugestoesFiltradas = listaOpcoes.filter((item: string) => 
    item.toUpperCase().includes(value.toUpperCase())
  );

  return (
    <View style={[styles.inputGroup, { zIndex: mostrarSugestoes ? 100 : zIndexVal }]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput 
        style={styles.input}
        value={value}
        onChangeText={(text) => {
          setValue(text);
          setMostrarSugestoes(true);
        }}
        onFocus={() => setMostrarSugestoes(true)}
        onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
        placeholder={placeholder}
      />
      {mostrarSugestoes && sugestoesFiltradas.length > 0 && (
        <View style={styles.suggestionsBox}>
          {sugestoesFiltradas.slice(0, 50).map((item: string, index: number) => (
            <TouchableOpacity 
              key={index} 
              style={styles.suggestionItem}
              onPress={() => {
                setValue(item);
                setMostrarSugestoes(false);
              }}
            >
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default function ChegadaCenaScreen() {
  const navigation = useNavigation();
  const route = useRoute<ChegadaCenaRouteProp>();

  // Recebe o ID do Banco (dbId) vindo da tela anterior
  const { idOcorrencia, dbId } = route.params || { idOcorrencia: '---', dbId: 0 };
  
  // --- ESTADOS DE DADOS ---
  const [chegadaRegistrada, setChegadaRegistrada] = useState(false);
  const [horarioChegada, setHorarioChegada] = useState('');
  const [coordenadas, setCoordenadas] = useState({ lat: '', long: '' });

  // Campos do Formulário
  const [regiao, setRegiao] = useState('');
  const [ais, setAis] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [bairro, setBairro] = useState('');
  
  const [tipoLogradouro, setTipoLogradouro] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numeroKm, setNumeroKm] = useState('');
  const [complemento, setComplemento] = useState(''); 
  const [referencia, setReferencia] = useState('');

  // Estados de Carregamento
  const [salvandoQTA, setSalvandoQTA] = useState(false);
  const [salvandoTudo, setSalvandoTudo] = useState(false);

  // --- FUNÇÃO 1: CAPTURAR QTA (GPS + HORA) E SALVAR ---
  const handleCapturarQTA = async () => {
    if (!dbId) {
      Alert.alert("Erro", "Ocorrência não identificada no banco de dados.");
      return;
    }

    setSalvandoQTA(true);
    
    // Simulação de Dados (Depois substituiremos por GPS Real)
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const latSimulada = '-8.051706'; 
    const longSimulada = '-34.890344';

    try {
      // ATUALIZAÇÃO NO BANCO (UPDATE)
      await executeSql(
        `UPDATE ocorrencias SET 
          data_hora_chegada_local = ?,
          latitude_chegada = ?,
          longitude_chegada = ?
         WHERE id = ?;`,
        [horaAtual, latSimulada, longSimulada, dbId]
      );

      // Atualiza a tela visualmente
      setHorarioChegada(horaAtual);
      setCoordenadas({ lat: latSimulada, long: longSimulada });
      setChegadaRegistrada(true);
      
      Alert.alert("Sucesso", "Horário e Local de Chegada salvos no banco!");

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao salvar QTA no banco local.");
    } finally {
      setSalvandoQTA(false);
    }
  };

  // --- FUNÇÃO 2: CÂMERA (Placeholder) ---
  const handleCamera = (tipo: 'foto' | 'video') => {
    Alert.alert("Câmera", `Abrindo câmera para capturar ${tipo}... (Implementação na próxima etapa)`);
  };

  // --- FUNÇÃO 3: SALVAR DADOS DO FORMULÁRIO ---
  const handleSalvar = async () => {
    if (!chegadaRegistrada) {
      Alert.alert("Atenção", "Registre a chegada (botão verde) antes de salvar.");
      return;
    }

    if (!dbId) return;

    setSalvandoTudo(true);

    try {
      // UPDATE COM O RESTANTE DOS DADOS
      await executeSql(
        `UPDATE ocorrencias SET 
          regiao = ?,
          ais = ?,
          municipio = ?,
          bairro = ?,
          tipo_logradouro = ?,
          logradouro = ?,
          numero_km = ?,
          complemento = ?,
          ponto_referencia = ?
         WHERE id = ?;`,
        [
          regiao,
          ais,
          municipio,
          bairro,
          tipoLogradouro,
          logradouro,
          numeroKm,
          complemento,
          referencia,
          dbId
        ]
      );

      Alert.alert("Salvo", "Dados da Etapa 2 atualizados com sucesso.");
      navigation.goBack(); // Volta para Detalhes

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao salvar endereço no banco.");
    } finally {
      setSalvandoTudo(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Etapa 2: Localização e Cena</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        {/* Debug ID (opcional) */}
        {/* <Text style={{fontSize:10, color:'#ccc'}}>DB ID: {dbId}</Text> */}

        {/* --- BOTÃO DE CHEGADA (TOPO) --- */}
        <View style={styles.qtaCard}>
          <Text style={styles.qtaTitle}>Registro de Chegada (QTA)</Text>
          {!chegadaRegistrada ? (
            <TouchableOpacity 
              style={[styles.btnCaptura, salvandoQTA && { opacity: 0.7 }]} 
              onPress={handleCapturarQTA}
              disabled={salvandoQTA}
            >
              <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#fff" />
              <Text style={styles.btnCapturaText}>
                {salvandoQTA ? 'SALVANDO...' : 'REGISTRAR HORA E GPS'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.dataContainer}>
              <View style={{flexDirection:'row', alignItems:'center', marginBottom:5}}>
                 <Feather name="clock" size={18} color="#1B5E20" style={{marginRight:8}} />
                 <Text style={styles.dataText}>Horário: {horarioChegada}</Text>
              </View>
              <View style={{flexDirection:'row', alignItems:'center'}}>
                 <Feather name="map-pin" size={18} color="#1B5E20" style={{marginRight:8}} />
                 <Text style={styles.dataText}>GPS: {coordenadas.lat}, {coordenadas.long}</Text>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Dados da Localização</Text>

        {/* Região e AIS */}
        <View style={[styles.row, {zIndex: 20}]}>
          <View style={styles.halfInput}>
            <InputComSugestao 
              label="Região" 
              value={regiao} setValue={setRegiao} 
              listaOpcoes={LISTA_REGIOES} placeholder="Selecione"
              zIndexVal={20}
            />
          </View>
          <View style={styles.halfInput}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>AIS (Número)</Text>
              <TextInput 
                style={styles.input} 
                value={ais} onChangeText={setAis} 
                keyboardType="numeric" placeholder="Ex: 01"
              />
            </View>
          </View>
        </View>

        {/* Município */}
        <InputComSugestao 
          label="Município" 
          value={municipio} setValue={setMunicipio} 
          listaOpcoes={LISTA_MUNICIPIOS} placeholder="Digite a cidade"
          zIndexVal={15}
        />

        {/* Bairro */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bairro</Text>
          <TextInput 
            style={styles.input} 
            value={bairro} onChangeText={setBairro} 
            placeholder="Ex: Boa Viagem"
          />
        </View>

        <Text style={styles.sectionTitle}>Endereço Detalhado</Text>

        {/* Tipo e Logradouro */}
        <View style={[styles.row, {zIndex: 10}]}>
          <View style={styles.halfInput}>
            <InputComSugestao 
              label="Tipo Logradouro" 
              value={tipoLogradouro} setValue={setTipoLogradouro} 
              listaOpcoes={LISTA_TIPO_LOGRADOURO} placeholder="Rua, Av..."
              zIndexVal={10}
            />
          </View>
          <View style={styles.halfInput}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número / KM</Text>
              <TextInput 
                style={styles.input} 
                value={numeroKm} onChangeText={setNumeroKm} 
                placeholder="Nº ou KM"
              />
            </View>
          </View>
        </View>

        {/* Nome da Rua (Logradouro) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome do Logradouro</Text>
          <TextInput 
            style={styles.input} 
            value={logradouro} onChangeText={setLogradouro} 
            placeholder="Ex: Av. Agamenon Magalhães"
          />
        </View>

        {/* Complemento (Apto/Sala) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome Apto / Sala</Text>
          <TextInput 
            style={styles.input} 
            value={complemento} onChangeText={setComplemento} 
            placeholder="Ex: Edf. Solar, Apt 102"
          />
        </View>

        {/* Referência */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ponto de Referência</Text>
          <TextInput 
            style={styles.input} 
            value={referencia} onChangeText={setReferencia} 
            placeholder="Ex: Próximo ao Shopping..."
            multiline
          />
        </View>

        <Text style={styles.sectionTitle}>Registro Visual da Cena</Text>
        
        {/* Botões de Mídia */}
        <View style={styles.mediaContainer}>
          <TouchableOpacity style={styles.mediaButton} onPress={() => handleCamera('foto')}>
            <Feather name="camera" size={32} color="#555" />
            <Text style={styles.mediaText}>Tirar Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mediaButton} onPress={() => handleCamera('video')}>
            <Feather name="video" size={32} color="#555" />
            <Text style={styles.mediaText}>Gravar Vídeo</Text>
          </TouchableOpacity>
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity 
          style={[styles.saveButton, salvandoTudo && { opacity: 0.7 }]} 
          onPress={handleSalvar}
          disabled={salvandoTudo}
        >
          <Text style={styles.saveButtonText}>
            {salvandoTudo ? 'ATUALIZANDO...' : 'SALVAR DADOS'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
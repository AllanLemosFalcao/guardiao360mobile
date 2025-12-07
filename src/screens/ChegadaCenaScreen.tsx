import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert,
  Image
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './ChegadaCenaScreen.styles';
import { RootStackParamList } from '../../App';

// --- BIBLIOTECAS DE HARDWARE ---
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

// Importando função de banco
import { executeSql } from '../services/db';

type ChegadaCenaRouteProp = RouteProp<RootStackParamList, 'ChegadaCena'>;

// --- LISTAS DE OPÇÕES ---
const LISTA_REGIOES = ['RMR', 'SERTÃO', 'ZONA DA MATA'];
const LISTA_MUNICIPIOS = ['Abreu e Lima', 'Araçoiaba', 'Cabo de Santo Agostinho', 'Camaragibe', 'Carpina', 'Fernando de Noronha', 'Igarassu', 'Ilha de Itamaracá', 'Ipojuca', 'Itapissuma', 'Jaboatão dos Guararapes', 'Moreno', 'Olinda', 'Paulista', 'Petrolina', 'Recife', 'São Lourenço da Mata'];
const LISTA_TIPO_LOGRADOURO = ['Alameda', 'Av', 'BR', 'Pe', 'Praça', 'Rua', 'Travessa', 'Outro'];

// --- COMPONENTE: INPUT COM SUGESTÃO ---
const InputComSugestao = ({ label, value, setValue, listaOpcoes, placeholder, zIndexVal = 1 }: any) => {
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const sugestoesFiltradas = listaOpcoes.filter((item: string) => item.toUpperCase().includes(value.toUpperCase()));

  return (
    <View style={[styles.inputGroup, { zIndex: mostrarSugestoes ? 100 : zIndexVal }]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput 
        style={styles.input}
        value={value}
        onChangeText={(text) => { setValue(text); setMostrarSugestoes(true); }}
        onFocus={() => setMostrarSugestoes(true)}
        onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
        placeholder={placeholder}
      />
      {mostrarSugestoes && sugestoesFiltradas.length > 0 && (
        <View style={styles.suggestionsBox}>
          {sugestoesFiltradas.slice(0, 50).map((item: string, index: number) => (
            <TouchableOpacity 
              key={index} style={styles.suggestionItem}
              onPress={() => { setValue(item); setMostrarSugestoes(false); }}
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

  // Recebe o ID do Banco
  const { dbId } = route.params || { dbId: 0 };
  
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

  // Contador de mídias
  const [fotosQtd, setFotosQtd] = useState(0);

  // Estados de Carregamento
  const [salvandoQTA, setSalvandoQTA] = useState(false);
  const [salvandoTudo, setSalvandoTudo] = useState(false);

  // Carregar dados iniciais se já tiver salvo antes (opcional, bom para edição)
  useEffect(() => {
    if(dbId) {
      // Aqui poderíamos fazer um SELECT para preencher os campos se o usuário voltar na tela
      // Por simplicidade, vamos focar no salvamento primeiro.
    }
  }, [dbId]);

  // --- FUNÇÃO 1: GPS REAL (F-04) ---
  const handleCapturarQTA = async () => {
    if (!dbId) {
      Alert.alert("Erro", "Ocorrência não identificada no banco.");
      return;
    }

    setSalvandoQTA(true);

    try {
      // 1. Pedir Permissão
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permissão negada", "Precisamos do GPS para registrar o local da ocorrência.");
        setSalvandoQTA(false);
        return;
      }

      // 2. Pegar Posição Atual (Pode demorar uns segundos)
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      
      const latReal = location.coords.latitude.toString();
      const longReal = location.coords.longitude.toString();
      const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      // 3. Salvar no SQLite
      await executeSql(
        `UPDATE ocorrencias SET 
          data_hora_chegada_local = ?,
          latitude_chegada = ?,
          longitude_chegada = ?
         WHERE id = ?;`,
        [horaAtual, latReal, longReal, dbId]
      );

      // 4. Atualizar UI
      setHorarioChegada(horaAtual);
      setCoordenadas({ lat: latReal, long: longReal });
      setChegadaRegistrada(true);
      
      Alert.alert("Sucesso", "Localização exata capturada via satélite!");

    } catch (error) {
      console.error(error);
      Alert.alert("Erro no GPS", "Verifique se o GPS está ativado.");
    } finally {
      setSalvandoQTA(false);
    }
  };

  // --- FUNÇÃO 2: CÂMERA REAL (F-05) ---
  const handleCamera = async (tipo: 'foto' | 'video') => {
    if (!dbId) return;

    if (tipo === 'video') {
      Alert.alert("Aviso", "Captura de vídeo será implementada no próximo ciclo (M2).");
      return;
    }

    try {
      // 1. Pedir Permissão
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permissão negada", "Precisamos da câmera para registrar a cena.");
        return;
      }

      // 2. Abrir Câmera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Bombeiro precisa da foto crua/rápida
        quality: 0.7, // Comprimir um pouco para não pesar o banco (Requisito F-05)
      });

      if (!result.canceled) {
        const fotoUri = result.assets[0].uri;
        const dataCaptura = new Date().toISOString();

        // 3. Salvar na Tabela MIDIAS
        await executeSql(
          `INSERT INTO midias (ocorrencia_id, caminho_arquivo, tipo, data_captura) VALUES (?, ?, 'FOTO', ?);`,
          [dbId, fotoUri, dataCaptura]
        );

        setFotosQtd(prev => prev + 1);
        Alert.alert("Foto Salva", "A imagem foi anexada à ocorrência.");
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao abrir câmera.");
    }
  };

  // --- FUNÇÃO 3: SALVAR ENDEREÇO ---
  const handleSalvar = async () => {
    if (!chegadaRegistrada) {
      Alert.alert("Atenção", "Registre a chegada (GPS) antes de salvar.");
      return;
    }
    if (!dbId) return;

    setSalvandoTudo(true);

    try {
      await executeSql(
        `UPDATE ocorrencias SET 
          regiao = ?, ais = ?, municipio = ?, bairro = ?,
          tipo_logradouro = ?, logradouro = ?, numero_km = ?,
          complemento = ?, ponto_referencia = ?
         WHERE id = ?;`,
        [regiao, ais, municipio, bairro, tipoLogradouro, logradouro, numeroKm, complemento, referencia, dbId]
      );

      Alert.alert("Salvo", "Dados atualizados com sucesso.");
      navigation.goBack(); 

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao salvar dados.");
    } finally {
      setSalvandoTudo(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Etapa 2: Localização e Cena</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        {/* --- BOTÃO DE CHEGADA (GPS REAL) --- */}
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
                {salvandoQTA ? 'BUSCANDO SATÉLITES...' : 'REGISTRAR HORA E GPS'}
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
                 {/* Mostra coordenadas com 5 casas decimais para ficar limpo */}
                 <Text style={styles.dataText}>
                   GPS: {parseFloat(coordenadas.lat).toFixed(5)}, {parseFloat(coordenadas.long).toFixed(5)}
                 </Text>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Dados da Localização</Text>

        <View style={[styles.row, {zIndex: 20}]}>
          <View style={styles.halfInput}>
            <InputComSugestao label="Região" value={regiao} setValue={setRegiao} listaOpcoes={LISTA_REGIOES} placeholder="Selecione" zIndexVal={20} />
          </View>
          <View style={styles.halfInput}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>AIS (Número)</Text>
              <TextInput style={styles.input} value={ais} onChangeText={setAis} keyboardType="numeric" placeholder="Ex: 01" />
            </View>
          </View>
        </View>

        <InputComSugestao label="Município" value={municipio} setValue={setMunicipio} listaOpcoes={LISTA_MUNICIPIOS} placeholder="Digite a cidade" zIndexVal={15} />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bairro</Text>
          <TextInput style={styles.input} value={bairro} onChangeText={setBairro} placeholder="Ex: Boa Viagem" />
        </View>

        <Text style={styles.sectionTitle}>Endereço Detalhado</Text>

        <View style={[styles.row, {zIndex: 10}]}>
          <View style={styles.halfInput}>
            <InputComSugestao label="Tipo Logradouro" value={tipoLogradouro} setValue={setTipoLogradouro} listaOpcoes={LISTA_TIPO_LOGRADOURO} placeholder="Rua, Av..." zIndexVal={10} />
          </View>
          <View style={styles.halfInput}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número / KM</Text>
              <TextInput style={styles.input} value={numeroKm} onChangeText={setNumeroKm} placeholder="Nº ou KM" />
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome do Logradouro</Text>
          <TextInput style={styles.input} value={logradouro} onChangeText={setLogradouro} placeholder="Ex: Av. Agamenon Magalhães" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome Apto / Sala</Text>
          <TextInput style={styles.input} value={complemento} onChangeText={setComplemento} placeholder="Ex: Edf. Solar, Apt 102" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ponto de Referência</Text>
          <TextInput style={styles.input} value={referencia} onChangeText={setReferencia} placeholder="Ex: Próximo ao Shopping..." multiline />
        </View>

        <Text style={styles.sectionTitle}>Registro Visual da Cena</Text>
        
        {/* --- CONTADOR DE FOTOS --- */}
        {fotosQtd > 0 && (
          <View style={{flexDirection:'row', alignItems:'center', marginBottom:10}}>
            <Feather name="image" size={16} color="#1976D2" />
            <Text style={{marginLeft:8, color:'#1976D2', fontWeight:'bold'}}>
              {fotosQtd} foto(s) anexada(s)
            </Text>
          </View>
        )}

        {/* --- BOTÕES DE MÍDIA --- */}
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
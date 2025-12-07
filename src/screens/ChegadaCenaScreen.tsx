import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './ChegadaCenaScreen.styles';
import { RootStackParamList } from '../../App';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { executeSql } from '../services/db';

type ChegadaCenaRouteProp = RouteProp<RootStackParamList, 'ChegadaCena'>;

// LISTAS
const LISTA_REGIOES = ['RMR', 'SERTÃO', 'ZONA DA MATA'];
const LISTA_MUNICIPIOS = ['Abreu e Lima', 'Araçoiaba', 'Cabo de Santo Agostinho', 'Camaragibe', 'Carpina', 'Fernando de Noronha', 'Igarassu', 'Ilha de Itamaracá', 'Ipojuca', 'Itapissuma', 'Jaboatão dos Guararapes', 'Moreno', 'Olinda', 'Paulista', 'Petrolina', 'Recife', 'São Lourenço da Mata'];
const LISTA_TIPO_LOGRADOURO = ['Alameda', 'Av', 'BR', 'Pe', 'Praça', 'Rua', 'Travessa', 'Outro'];

// COMPONENTE INPUT
const InputComSugestao = ({ label, value, setValue, listaOpcoes, placeholder, zIndexVal = 1 }: any) => {
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const sugestoesFiltradas = listaOpcoes.filter((item: string) => item.toUpperCase().includes(value.toUpperCase()));
  return (
    <View style={[styles.inputGroup, { zIndex: mostrarSugestoes ? 100 : zIndexVal }]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={(t) => {setValue(t); setMostrarSugestoes(true)}} onFocus={() => setMostrarSugestoes(true)} onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)} placeholder={placeholder} />
      {mostrarSugestoes && sugestoesFiltradas.length > 0 && (
        <View style={styles.suggestionsBox}>
          {sugestoesFiltradas.slice(0, 50).map((item, index) => (
            <TouchableOpacity key={index} style={styles.suggestionItem} onPress={() => {setValue(item); setMostrarSugestoes(false)}}>
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
  const { dbId } = route.params || { dbId: 0 };
  
  // ESTADOS
  const [chegadaRegistrada, setChegadaRegistrada] = useState(false);
  const [horarioChegada, setHorarioChegada] = useState('');
  const [coordenadas, setCoordenadas] = useState({ lat: '', long: '' });
  
  const [regiao, setRegiao] = useState('');
  const [ais, setAis] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [bairro, setBairro] = useState('');
  const [tipoLogradouro, setTipoLogradouro] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numeroKm, setNumeroKm] = useState('');
  const [complemento, setComplemento] = useState(''); 
  const [referencia, setReferencia] = useState('');
  const [fotosQtd, setFotosQtd] = useState(0);
  
  const [salvandoQTA, setSalvandoQTA] = useState(false);
  const [salvandoTudo, setSalvandoTudo] = useState(false);

  // --- CARREGAR DADOS AO ABRIR ---
  useEffect(() => {
    const carregarDadosExistentes = async () => {
      if (!dbId) return;
      try {
        const result = await executeSql(`SELECT * FROM ocorrencias WHERE id = ?`, [dbId]);
        if (result.rows.length > 0) {
          const item = result.rows.item(0);
          
          if (item.data_hora_chegada_local) {
            setHorarioChegada(item.data_hora_chegada_local);
            setCoordenadas({ lat: item.latitude_chegada, long: item.longitude_chegada });
            setChegadaRegistrada(true);
          }

          setRegiao(item.regiao || '');
          setAis(item.ais || '');
          setMunicipio(item.municipio || '');
          setBairro(item.bairro || '');
          setTipoLogradouro(item.tipo_logradouro || '');
          setLogradouro(item.logradouro || '');
          setNumeroKm(item.numero_km || '');
          setComplemento(item.complemento || '');
          setReferencia(item.ponto_referencia || '');
        }

        const resultFotos = await executeSql(`SELECT count(*) as qtd FROM midias WHERE ocorrencia_id = ?`, [dbId]);
        if (resultFotos.rows.length > 0) {
          setFotosQtd(resultFotos.rows.item(0).qtd);
        }

      } catch (error) {
        console.log("Erro ao carregar dados para edição:", error);
      }
    };
    
    carregarDadosExistentes();
  }, [dbId]);

  // --- FUNÇÃO AJUSTADA: GPS + STATUS 'EM_CENA' ---
  const handleCapturarQTA = async () => {
    if (!dbId) { Alert.alert("Erro", "Ocorrência não identificada."); return; }
    setSalvandoQTA(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert("Permissão negada", "GPS necessário."); setSalvandoQTA(false); return; }
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      
      const latReal = location.coords.latitude.toString();
      const longReal = location.coords.longitude.toString();
        //  Data E Hora
      const agora = new Date();
      // Formato: "07/12/2025 14:30"
      const dataHoraCompleta = agora.toLocaleString('pt-BR', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit' 
      });      

await executeSql(
        `UPDATE ocorrencias SET 
          data_hora_chegada_local = ?, 
          latitude_chegada = ?, 
          longitude_chegada = ?,
          status = 'EM_CENA' 
         WHERE id = ?;`, 
        [dataHoraCompleta, latReal, longReal, dbId]
      );
      
      setHorarioChegada(dataHoraCompleta); // Atualiza a tela com a data também
      setCoordenadas({ lat: latReal, long: longReal });
      setChegadaRegistrada(true);
      
      Alert.alert("Sucesso", "Chegada registrada com Data, Hora e GPS!");
      
    } catch (error) { 
      Alert.alert("Erro GPS", "Verifique o GPS."); 
    } finally { 
      setSalvandoQTA(false); 
    }
  };
  
  const handleCamera = async (tipo: 'foto' | 'video') => {
    if (!dbId) { Alert.alert("Erro", "ID não encontrado."); return; }
    if (tipo === 'video') { Alert.alert("Em breve", "Vídeo no próximo ciclo."); return; }
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) { Alert.alert("Permissão", "Necessário acesso à câmera."); return; }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5 });
      if (!result.canceled) {
        await executeSql(`INSERT INTO midias (ocorrencia_id, caminho_arquivo, tipo, data_captura) VALUES (?, ?, 'FOTO', ?);`, [dbId, result.assets[0].uri, new Date().toISOString()]);
        setFotosQtd(prev => prev + 1);
        Alert.alert("Foto Salva", "Anexada com sucesso.");
      }
    } catch (error) { Alert.alert("Erro", "Falha na câmera."); }
  };

  const handleSalvar = async () => {
    if (!chegadaRegistrada) { Alert.alert("Atenção", "Registre a chegada (GPS) primeiro."); return; }
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
      Alert.alert("Salvo", "Dados de localização atualizados.");
      navigation.goBack(); 
    } catch (error) { Alert.alert("Erro", "Falha ao salvar."); } finally { setSalvandoTudo(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Feather name="arrow-left" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Localização e Cena</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.qtaCard}>
          <Text style={styles.qtaTitle}>Registro de Chegada (QTA)</Text>
          {!chegadaRegistrada ? (
            <TouchableOpacity style={[styles.btnCaptura, salvandoQTA && { opacity: 0.7 }]} onPress={handleCapturarQTA} disabled={salvandoQTA}>
              <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#fff" />
              <Text style={styles.btnCapturaText}>{salvandoQTA ? 'BUSCANDO...' : 'REGISTRAR HORA E GPS'}</Text>
            </TouchableOpacity>
          ) : (
            <View>
              <View style={styles.dataContainer}>
                <View style={{flexDirection:'row', alignItems:'center', marginBottom:5}}>
                   <Feather name="clock" size={18} color="#1B5E20" style={{marginRight:8}} />
                   <Text style={styles.dataText}>Horário: {horarioChegada}</Text>
                </View>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                   <Feather name="map-pin" size={18} color="#1B5E20" style={{marginRight:8}} />
                   <Text style={styles.dataText}>GPS: {parseFloat(coordenadas.lat || '0').toFixed(5)}, {parseFloat(coordenadas.long || '0').toFixed(5)}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleCapturarQTA} style={{marginTop: 10, alignItems: 'center'}}>
                 <Text style={{color: '#1976D2', fontSize: 12, textDecorationLine: 'underline'}}>Atualizar Localização</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Dados da Localização</Text>
        <View style={[styles.row, {zIndex: 20}]}>
          <View style={styles.halfInput}><InputComSugestao label="Região" value={regiao} setValue={setRegiao} listaOpcoes={LISTA_REGIOES} placeholder="Selecione" zIndexVal={20} /></View>
          <View style={styles.halfInput}><View style={styles.inputGroup}><Text style={styles.label}>AIS</Text><TextInput style={styles.input} value={ais} onChangeText={setAis} keyboardType="numeric" /></View></View>
        </View>
        <InputComSugestao label="Município" value={municipio} setValue={setMunicipio} listaOpcoes={LISTA_MUNICIPIOS} placeholder="Cidade" zIndexVal={15} />
        <View style={styles.inputGroup}><Text style={styles.label}>Bairro</Text><TextInput style={styles.input} value={bairro} onChangeText={setBairro} /></View>

        <Text style={styles.sectionTitle}>Endereço Detalhado</Text>
        <View style={[styles.row, {zIndex: 10}]}>
          <View style={styles.halfInput}><InputComSugestao label="Tipo" value={tipoLogradouro} setValue={setTipoLogradouro} listaOpcoes={LISTA_TIPO_LOGRADOURO} placeholder="Rua..." zIndexVal={10} /></View>
          <View style={styles.halfInput}><View style={styles.inputGroup}><Text style={styles.label}>Nº / KM</Text><TextInput style={styles.input} value={numeroKm} onChangeText={setNumeroKm} /></View></View>
        </View>
        <View style={styles.inputGroup}><Text style={styles.label}>Logradouro</Text><TextInput style={styles.input} value={logradouro} onChangeText={setLogradouro} /></View>
        <View style={styles.inputGroup}><Text style={styles.label}>Complemento</Text><TextInput style={styles.input} value={complemento} onChangeText={setComplemento} /></View>
        <View style={styles.inputGroup}><Text style={styles.label}>Referência</Text><TextInput style={styles.input} value={referencia} onChangeText={setReferencia} multiline /></View>

        <Text style={styles.sectionTitle}>Mídias da Cena</Text>
        {fotosQtd > 0 && <Text style={{marginBottom:10, color:'#1976D2', fontWeight:'bold'}}>{fotosQtd} foto(s) anexada(s)</Text>}
        <View style={styles.mediaContainer}>
          <TouchableOpacity style={styles.mediaButton} onPress={() => handleCamera('foto')}><Feather name="camera" size={32} color="#555" /><Text style={styles.mediaText}>+ Foto</Text></TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton} onPress={() => handleCamera('video')}><Feather name="video" size={32} color="#555" /><Text style={styles.mediaText}>+ Vídeo</Text></TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.saveButton, salvandoTudo && { opacity: 0.7 }]} onPress={handleSalvar} disabled={salvandoTudo}>
          <Text style={styles.saveButtonText}>{salvandoTudo ? 'SALVANDO...' : 'SALVAR E VOLTAR'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
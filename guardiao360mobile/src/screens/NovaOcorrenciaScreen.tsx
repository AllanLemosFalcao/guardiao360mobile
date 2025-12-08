import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location'; 
import { RootStackParamList } from '../../App';
import { styles } from './NovaOcorrenciaScreen.styles';
import { executeSql } from '../services/db';
import { AuthService } from '../services/auth';

type NovaOcorrenciaProp = NativeStackNavigationProp<RootStackParamList, 'NovaOcorrencia'>;
type NovaOcorrenciaRouteProp = RouteProp<RootStackParamList, 'NovaOcorrencia'>;

// --- LISTAS ---
const LISTA_VIATURAS = ['ABSL', 'ABSM', 'ABT', 'ACO', 'AP', 'AR', 'ASV', 'AT / 1', 'ATP/1', 'BIS', 'EQUIPE DE GUARDA VIDAS', 'MR', 'MSA', 'OUTRO'];
const LISTA_GRUPAMENTOS = ['GBI', 'GBAPH', 'GBS', 'GBMAR'];
const LISTA_PONTOS_BASE = ['Ceasa', 'CMan - 2ª SBMAR', 'GBI - 1ª SBI', 'GBS - 1ª SBS', 'IGARASSU - 2ª SBAPH', 'QCG - 2ª SBI', 'São Lourenço da Mata - 3ª SBAPH', 'SBFN', 'SUAPE - 3ª SBI', 'Outro'];
const LISTA_FORMA_ACIONAMENTO = ['CIODS', 'CO DO GRUPAMENTO', 'PESSOALMENTE', 'OUTRO'];
const LISTA_LOCAL_ACIONAMENTO = ['Ponto zero', 'Retornando ao ponto zero', 'Imediatamente após finalizar a ocorrência anterior', 'Outro'];

const InputComSugestao = ({ label, value, setValue, listaOpcoes, placeholder }: any) => {
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const sugestoesFiltradas = listaOpcoes.filter((item: string) => item.toUpperCase().includes(value.toUpperCase()));
  return (
    <View style={[styles.inputGroup, { zIndex: mostrarSugestoes ? 10 : 1 }]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput 
        style={styles.input} value={value} onChangeText={(text) => { setValue(text); setMostrarSugestoes(true); }}
        onFocus={() => setMostrarSugestoes(true)} onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)} placeholder={placeholder}
      />
      {mostrarSugestoes && sugestoesFiltradas.length > 0 && (
        <View style={styles.suggestionsBox}>
          {sugestoesFiltradas.slice(0, 50).map((item: string, index: number) => (
            <TouchableOpacity key={index} style={styles.suggestionItem} onPress={() => { setValue(item); setMostrarSugestoes(false); }}>
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const SeletorChips = ({ label, opcoes, selecionado, setSelecionado }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.radioContainer}>
      {opcoes.map((op: string) => (
        <TouchableOpacity key={op} style={[styles.radioButton, selecionado === op && styles.radioButtonSelected]} onPress={() => setSelecionado(op)}>
          <Text style={[styles.radioText, selecionado === op && styles.radioTextSelected]}>{op}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default function NovaOcorrenciaScreen() {
  const navigation = useNavigation<NovaOcorrenciaProp>();
  const route = useRoute<NovaOcorrenciaRouteProp>(); 

  const params = route.params as any || {}; 
  const isEdicao = !!params.modoEditar;
  const dbId = params.dbId;
  const dadosAntigos = params.dadosAntigos;

  // --- ESTADOS GERAIS ---
  const [tipoViatura, setTipoViatura] = useState('');
  const [numeroViatura, setNumeroViatura] = useState('');
  const [codLocal, setCodLocal] = useState('');
  const [grupamento, setGrupamento] = useState('');
  const [pontoBase, setPontoBase] = useState('');
  const [formaAcionamento, setFormaAcionamento] = useState('');
  const [localAcionamento, setLocalAcionamento] = useState('');
  
  // --- ESTADOS DE SAÍDA (DATA/HORA/GPS) ---
  const [saidaRegistrada, setSaidaRegistrada] = useState(false);
  const [dataSaida, setDataSaida] = useState('');
  const [horaSaida, setHoraSaida] = useState('');
  const [gpsSaida, setGpsSaida] = useState({ lat: '', long: '' });
  const [capturando, setCapturando] = useState(false);
  
  const [salvando, setSalvando] = useState(false);

  // --- PREENCHER SE FOR EDIÇÃO ---
  useEffect(() => {
    if (isEdicao && dadosAntigos) {
      setTipoViatura(dadosAntigos.tipo_viatura || '');
      setNumeroViatura(dadosAntigos.numero_viatura || '');
      setGrupamento(dadosAntigos.grupamento || '');
      setPontoBase(dadosAntigos.ponto_base || '');
      setCodLocal(dadosAntigos.cod_local_ocorrencia || '');
      setFormaAcionamento(dadosAntigos.forma_acionamento || '');
      setLocalAcionamento(dadosAntigos.local_vtr_acionamento || '');
      
      // Preenche os dados de saída se existirem
      if (dadosAntigos.data_acionamento && dadosAntigos.hora_acionamento) {
        setSaidaRegistrada(true);
        setDataSaida(dadosAntigos.data_acionamento);
        setHoraSaida(dadosAntigos.hora_acionamento);
        setGpsSaida({
          lat: dadosAntigos.latitude_partida || '',
          long: dadosAntigos.longitude_partida || ''
        });
      }
    }
  }, [isEdicao, dadosAntigos]);

  // --- FUNÇÃO 1: CAPTURAR DADOS (BOTÃO GRANDE) ---
  const handleRegistrarSaida = async () => {
    setCapturando(true);
    try {
      // 1. Data e Hora
      const agora = new Date();
      const d = agora.toLocaleDateString('pt-BR');
      const h = agora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
      
      // 2. GPS
      let lat = ''; 
      let long = '';
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Aviso", "Sem permissão de GPS. Registrando apenas horário.");
      } else {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = location.coords.latitude.toString();
        long = location.coords.longitude.toString();
      }

      // 3. Atualiza Estado
      setDataSaida(d);
      setHoraSaida(h);
      setGpsSaida({ lat, long });
      setSaidaRegistrada(true);

    } catch (error) {
      Alert.alert("Erro", "Falha ao capturar dados.");
    } finally {
      setCapturando(false);
    }
  };

  // --- FUNÇÃO 2: SALVAR NO BANCO (BOTÃO FINAL) ---
  const handleFinalizar = async () => {
    const handleFinalizar = async () => {
    if (!tipoViatura || !numeroViatura || !grupamento) {
      Alert.alert("Campos Obrigatórios", "Preencha a Viatura, Número e Grupamento.");
      return;
    }
    if (!saidaRegistrada) {
      Alert.alert("Atenção", "Registre o Local e Horário de Saída antes de continuar.");
      return;
    }

    setSalvando(true);

    try {
      // 1. Pega o usuário logado do cofre
      const userLogado = await AuthService.getUsuarioLogado();
      const meuId = userLogado ? userLogado.id : null;
      if (isEdicao) {
        // UPDATE
        await executeSql(
          `UPDATE ocorrencias SET 
            tipo_viatura=?, numero_viatura=?, grupamento=?, ponto_base=?, 
            cod_local_ocorrencia=?, forma_acionamento=?, local_vtr_acionamento=?,
            data_acionamento=?, hora_acionamento=?, latitude_partida=?, longitude_partida=?
           WHERE id=?;`,
          [
            tipoViatura, numeroViatura, grupamento, pontoBase, codLocal, 
            formaAcionamento, localAcionamento,
            dataSaida, horaSaida, gpsSaida.lat, gpsSaida.long,
            dbId
          ]
        );
        Alert.alert("Atualizado", "Dados corrigidos com sucesso!");
        navigation.goBack(); 

} else {
        // INSERT COM O ID DO DONO
        const numeroOcorrencia = `B-2025-${Math.floor(Math.random() * 10000)}`;
        const uuidLocal = Date.now().toString() + Math.floor(Math.random() * 1000).toString();

        const result = await executeSql(
          `INSERT INTO ocorrencias (
            usuario_id, uuid_local, numero_ocorrencia, tipo_viatura, numero_viatura, grupamento,
            ponto_base, cod_local_ocorrencia, forma_acionamento, local_vtr_acionamento, status,
            data_acionamento, hora_acionamento, latitude_partida, longitude_partida
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            meuId, // <--- ADICIONADO AQUI
            uuidLocal, numeroOcorrencia, tipoViatura, numeroViatura, grupamento,
            pontoBase, codLocal, formaAcionamento, localAcionamento, 'EM_DESLOCAMENTO',
            dataSaida, horaSaida, gpsSaida.lat, gpsSaida.long
          ]
        );
        
        if (result.insertId) {
          navigation.replace('DetalhesOcorrencia', {
            idOcorrencia: numeroOcorrencia,
            dbId: result.insertId,
            dadosIniciais: {
              viatura: `${tipoViatura}-${numeroViatura}`,
              horaDespacho: `${dataSaida} ${horaSaida}`,
              status: 'EM_DESLOCAMENTO'
            }
          });
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao salvar dados.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isEdicao ? 'Editar Dados Iniciais' : 'Nova Ocorrência'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        {isEdicao && (
          <View style={{backgroundColor: '#FFF3E0', padding: 10, borderRadius: 8, marginBottom: 15}}>
            <Text style={{color: '#E65100', fontSize: 12}}>⚠️ Editando registro existente.</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Dados da Viatura</Text>
        <View style={[styles.row, {zIndex: 20}]}>
          <View style={styles.halfInput}>
            <InputComSugestao label="Viatura" value={tipoViatura} setValue={setTipoViatura} listaOpcoes={LISTA_VIATURAS} placeholder="Ex: ABT" />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Número</Text>
            <TextInput style={styles.input} value={numeroViatura} onChangeText={setNumeroViatura} keyboardType="numeric" placeholder="Ex: 12" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Localização e Origem</Text>
        <InputComSugestao label="Grupamento (OME)" value={grupamento} setValue={setGrupamento} listaOpcoes={LISTA_GRUPAMENTOS} placeholder="Ex: GBI" />
        <InputComSugestao label="Ponto Base" value={pontoBase} setValue={setPontoBase} listaOpcoes={LISTA_PONTOS_BASE} placeholder="Selecione..." />
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Código Local</Text>
          <TextInput style={styles.input} value={codLocal} onChangeText={setCodLocal} placeholder="Ex: 1234" keyboardType="numeric" />
        </View>

        {/* --- CARD DE REGISTRO DE SAÍDA (IGUAL À ETAPA 2) --- */}
        <Text style={styles.sectionTitle}>Momento do Deslocamento</Text>
        
        <View style={{
          backgroundColor: '#F5F5F5', 
          borderRadius: 10, 
          padding: 15, 
          borderWidth: 1, 
          borderColor: '#E0E0E0', 
          marginBottom: 15
        }}>
          {!saidaRegistrada ? (
            <TouchableOpacity 
              style={{
                backgroundColor: '#B71C1C', // vermelho
                paddingVertical: 15,
                borderRadius: 8,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 2
              }} 
              onPress={handleRegistrarSaida}
              disabled={capturando}
            >
              {capturando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#fff" style={{marginRight: 10}}/>
                  <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>REGISTRAR SAÍDA (QTR)</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5}}>
                <Text style={{fontWeight: 'bold', color: '#555'}}>Data:</Text>
                <Text style={{color: '#333'}}>{dataSaida}</Text>
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5}}>
                <Text style={{fontWeight: 'bold', color: '#555'}}>Hora:</Text>
                <Text style={{color: '#333', fontWeight:'bold', fontSize: 16}}>{horaSaida}</Text>
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{fontWeight: 'bold', color: '#555'}}>GPS:</Text>
                <Text style={{color: '#333'}}>{gpsSaida.lat ? `${parseFloat(gpsSaida.lat).toFixed(5)}, ${parseFloat(gpsSaida.long).toFixed(5)}` : 'Não capturado'}</Text>
              </View>
              
              <TouchableOpacity onPress={handleRegistrarSaida} style={{marginTop: 15, alignSelf: 'center'}}>
                <Text style={{color: '#1976D2', fontSize: 12, textDecorationLine: 'underline'}}>Atualizar Local/Horário</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <SeletorChips label="Forma do Acionamento" opcoes={LISTA_FORMA_ACIONAMENTO} selecionado={formaAcionamento} setSelecionado={setFormaAcionamento} />
        <SeletorChips label="Local da VTR" opcoes={LISTA_LOCAL_ACIONAMENTO} selecionado={localAcionamento} setSelecionado={setLocalAcionamento} />

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.button, 
            salvando && { opacity: 0.7 }, 
            isEdicao && { backgroundColor: '#FFA000' }
          ]} 
          onPress={handleFinalizar}
          disabled={salvando}
        >
          <MaterialCommunityIcons 
            name={salvando ? "loading" : (isEdicao ? "content-save-edit" : "check-bold")} 
            size={24} 
            color="#fff" 
          />
          <Text style={styles.buttonText}>
            {salvando ? 'PROCESSANDO...' : isEdicao ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR E INICIAR'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto'; // Se der erro, use Date.now().toString()
import { RootStackParamList } from '../../App';
import { styles } from './NovaOcorrenciaScreen.styles';

// Importa a função de banco de dados
import { executeSql } from '../services/db';

type NovaOcorrenciaProp = NativeStackNavigationProp<RootStackParamList, 'NovaOcorrencia'>;

// --- LISTAS DE OPÇÕES ---
const LISTA_VIATURAS = [
  'ABSL', 'ABSM', 'ABT', 'ACO', 'AP', 'AR', 'ASV', 'AT / 1', 'ATP/1', 'BIS', 'EQUIPE DE GUARDA VIDAS', 'MR', 'MSA', 'OUTRO'
];

const LISTA_GRUPAMENTOS = ['GBI', 'GBAPH', 'GBS', 'GBMAR'];

const LISTA_PONTOS_BASE = [
  'Ceasa', 'CMan - 2ª SBMAR', 'GBI - 1ª SBI', 'GBS - 1ª SBS', 'IGARASSU - 2ª SBAPH', 
  'QCG - 2ª SBI', 'São Lourenço da Mata - 3ª SBAPH', 'SBFN', 'SUAPE - 3ª SBI', 'Outro'
];

const LISTA_FORMA_ACIONAMENTO = ['CIODS', 'CO DO GRUPAMENTO', 'PESSOALMENTE', 'OUTRO'];

const LISTA_LOCAL_ACIONAMENTO = [
  'Ponto zero', 'Retornando ao ponto zero', 'Imediatamente após finalizar a ocorrência anterior', 'Outro'
];

// --- COMPONENTE 1: INPUT COM SUGESTÃO ---
const InputComSugestao = ({ label, value, setValue, listaOpcoes, placeholder }: any) => {
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  
  const sugestoesFiltradas = listaOpcoes.filter((item: string) => 
    item.toUpperCase().includes(value.toUpperCase())
  );

  return (
    <View style={[styles.inputGroup, { zIndex: mostrarSugestoes ? 10 : 1 }]}>
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

// --- COMPONENTE 2: SELETOR DE CHIPS ---
const SeletorChips = ({ label, opcoes, selecionado, setSelecionado }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.radioContainer}>
      {opcoes.map((op: string) => (
        <TouchableOpacity
          key={op}
          style={[styles.radioButton, selecionado === op && styles.radioButtonSelected]}
          onPress={() => setSelecionado(op)}
        >
          <Text style={[styles.radioText, selecionado === op && styles.radioTextSelected]}>
            {op}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// --- TELA PRINCIPAL ---
export default function NovaOcorrenciaScreen() {
  const navigation = useNavigation<NovaOcorrenciaProp>();

  // --- ESTADOS DOS CAMPOS ---
  const [tipoViatura, setTipoViatura] = useState('');
  const [numeroViatura, setNumeroViatura] = useState('');
  const [codLocal, setCodLocal] = useState('');
  const [grupamento, setGrupamento] = useState('');
  const [pontoBase, setPontoBase] = useState('');
  
  // Data e Hora
  const [dataAcionamento, setDataAcionamento] = useState(new Date().toLocaleDateString('pt-BR'));
  const [horaAcionamento, setHoraAcionamento] = useState(new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}));
  
  const [formaAcionamento, setFormaAcionamento] = useState('');
  const [localAcionamento, setLocalAcionamento] = useState('');
  const [salvando, setSalvando] = useState(false); // Estado de loading para o botão

  // --- FUNÇÃO DE INICIAR (Agora Salva no SQLite) ---
  const iniciarDeslocamento = async () => {
    // 1. Validação
    if (!tipoViatura || !numeroViatura || !grupamento) {
      Alert.alert("Campos Obrigatórios", "Preencha a Viatura, Número e Grupamento.");
      return;
    }

    setSalvando(true);

    // 2. Preparar Dados
    const numeroOcorrencia = `B-2025-${Math.floor(Math.random() * 10000)}`; // Simulação de numeração visual
    const uuidLocal = Crypto.randomUUID(); // Identificador único para sync

    try {
      // 3. Executar INSERT no SQLite Local
      const result = await executeSql(
        `INSERT INTO ocorrencias (
          uuid_local,
          numero_ocorrencia,
          tipo_viatura, 
          numero_viatura, 
          grupamento,
          ponto_base, 
          cod_local_ocorrencia, 
          data_acionamento, 
          hora_acionamento, 
          forma_acionamento, 
          local_vtr_acionamento,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          uuidLocal,
          numeroOcorrencia,
          tipoViatura,
          numeroViatura,
          grupamento,
          pontoBase,
          codLocal,
          dataAcionamento,
          horaAcionamento,
          formaAcionamento,
          localAcionamento,
          'EM_DESLOCAMENTO'
        ]
      );

      // 4. Verificar Sucesso
      if (result.rowsAffected > 0) {
        console.log(`Ocorrência Criada! ID Local: ${result.insertId}`);
        
        // 5. Navegar passando o ID REAL do Banco
        navigation.navigate('DetalhesOcorrencia', {
          idOcorrencia: numeroOcorrencia, // Apenas para mostrar no título
          // Importante: passamos o dbId para a próxima tela saber qual linha atualizar
          dbId: result.insertId, 
          
          dadosIniciais: {
            viatura: `${tipoViatura}-${numeroViatura}`,
            grupamento,
            horaDespacho: `${dataAcionamento} ${horaAcionamento}`,
            status: 'Em Deslocamento'
          }
        });
      } else {
        Alert.alert("Erro", "Não foi possível criar o registro no banco local.");
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Erro Crítico", "Falha ao salvar dados offline.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nova Ocorrência</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        <Text style={styles.sectionTitle}>Dados da Viatura</Text>
        
        <View style={[styles.row, {zIndex: 20}]}>
          <View style={styles.halfInput}>
            <InputComSugestao 
              label="Viatura Empregada"
              value={tipoViatura}
              setValue={setTipoViatura}
              listaOpcoes={LISTA_VIATURAS}
              placeholder="Ex: ABT"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Número</Text>
            <TextInput 
              style={styles.input} 
              value={numeroViatura} 
              onChangeText={setNumeroViatura}
              keyboardType="numeric"
              placeholder="Ex: 12"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Localização e Origem</Text>

        <InputComSugestao 
          label="Grupamento (OME)"
          value={grupamento}
          setValue={setGrupamento}
          listaOpcoes={LISTA_GRUPAMENTOS}
          placeholder="Ex: GBI"
        />

        <InputComSugestao 
          label="Ponto Base"
          value={pontoBase}
          setValue={setPontoBase}
          listaOpcoes={LISTA_PONTOS_BASE}
          placeholder="Selecione o local de saída"
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Código do Local da Ocorrência</Text>
          <TextInput 
            style={styles.input} 
            value={codLocal} 
            onChangeText={setCodLocal}
            placeholder="Ex: 1234"
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.sectionTitle}>Dados do Acionamento</Text>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Data</Text>
            <TextInput style={styles.input} value={dataAcionamento} onChangeText={setDataAcionamento} />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Hora</Text>
            <TextInput style={styles.input} value={horaAcionamento} onChangeText={setHoraAcionamento} />
          </View>
        </View>

        <SeletorChips 
          label="Forma do Acionamento" 
          opcoes={LISTA_FORMA_ACIONAMENTO} 
          selecionado={formaAcionamento}
          setSelecionado={setFormaAcionamento}
        />

        <SeletorChips 
          label="Local da VTR no Acionamento" 
          opcoes={LISTA_LOCAL_ACIONAMENTO} 
          selecionado={localAcionamento}
          setSelecionado={setLocalAcionamento}
        />

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, salvando && { opacity: 0.7 }]} 
          onPress={iniciarDeslocamento}
          disabled={salvando}
        >
          <MaterialCommunityIcons name="car-emergency" size={24} color="#fff" />
          <Text style={styles.buttonText}>
            {salvando ? 'SALVANDO...' : 'INICIAR DESLOCAMENTO'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
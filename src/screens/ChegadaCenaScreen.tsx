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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './ChegadaCenaScreen.styles';

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

// --- COMPONENTE: INPUT COM SUGESTÃO (Fora da função principal) ---
const InputComSugestao = ({ label, value, setValue, listaOpcoes, placeholder, zIndexVal = 1 }: any) => {
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  
  // 1. Filtra a lista. Se o valor for vazio "", o includes retorna true para todos, 
  // mostrando a lista completa ao clicar.
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
        // Ao clicar no campo (Foco), mostramos a lista imediatamente
        onFocus={() => setMostrarSugestoes(true)}
        
        // Pequeno delay ao sair para dar tempo de clicar na opção
        onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
        placeholder={placeholder}
      />
      
      {/* ALTERAÇÃO AQUI: 
         Removemos a checagem "value.length > 0". 
         Agora só verificamos se "mostrarSugestoes" é true e se a lista tem itens.
      */}
      {mostrarSugestoes && sugestoesFiltradas.length > 0 && (
        <View style={styles.suggestionsBox}>
          {/* Aumentei o slice para 50 para mostrar todas as opções se não digitar nada */}
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
  const [complemento, setComplemento] = useState(''); // Apto/Sala
  const [referencia, setReferencia] = useState('');

  // --- FUNÇÃO 1: CAPTURAR QTA (GPS + HORA) ---
  const handleCapturarQTA = () => {
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const latSimulada = '-8.051706'; 
    const longSimulada = '-34.890344';

    setHorarioChegada(horaAtual);
    setCoordenadas({ lat: latSimulada, long: longSimulada });
    setChegadaRegistrada(true);
    Alert.alert("Sucesso", "QTA registrado com sucesso!");
  };

  // --- FUNÇÃO 2: CÂMERA ---
  const handleCamera = (tipo: 'foto' | 'video') => {
    Alert.alert("Câmera", `Abrindo câmera para capturar ${tipo}...`);
    // Aqui integraria com 'expo-image-picker' ou 'expo-camera'
  };

  // --- FUNÇÃO 3: SALVAR ---
  const handleSalvar = () => {
    if (!chegadaRegistrada) {
      Alert.alert("Atenção", "Registre a chegada (botão verde) antes de salvar.");
      return;
    }
    // Salvar no estado global ou banco
    Alert.alert("Salvo", "Dados de localização salvos com sucesso.");
    navigation.goBack();
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
        
        {/* --- BOTÃO DE CHEGADA (TOPO) --- */}
        <View style={styles.qtaCard}>
          <Text style={styles.qtaTitle}>Registro de Chegada (QTA)</Text>
          {!chegadaRegistrada ? (
            <TouchableOpacity style={styles.btnCaptura} onPress={handleCapturarQTA}>
              <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#fff" />
              <Text style={styles.btnCapturaText}>REGISTRAR HORA E GPS</Text>
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
        <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
          <Text style={styles.saveButtonText}>SALVAR DADOS</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert,
  Modal,
  Image
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { styles } from './RelatorioFinalScreen.styles';
import { RootStackParamList } from '../../App';
import SignatureScreen from 'react-native-signature-canvas';
import { executeSql } from '../services/db';

type RelatorioFinalRouteProp = RouteProp<RootStackParamList, 'RelatorioFinal'>;

// --- LISTAS DE DADOS ---
const LISTA_NATUREZA = ['APH', 'Atividade Comunitária', 'Incêndio', 'Prevenção', 'Produtos Perigosos', 'Salvamento'];
const LISTA_GRUPO = ['Acidente de Trânsito', 'APH Diversos', 'Incêndio em edificação', 'Salvamento diverso', 'Outros', 'Evento com Animal', 'Explosão', 'Vazamento', 'Queda', 'Trauma'];
const LISTA_SUBGRUPO = ['Colisão', 'Capotamento', 'Mal súbito', 'Queda de nível', 'Ferimento por arma', 'Queimadura', 'Afogamento', 'Outros'];
const LISTA_SITUACAO = ['Atendida', 'Não Atendida'];
const LISTA_NAO_ATENDIDA = ['Cancelada', 'Sem atuação/Motivo', 'Trote'];
const LISTA_SEM_ATUACAO = ['Não se aplica', 'Recusou atendimento', 'Situação já solucionada', 'Vítima socorrida pelo SAMU', 'Vítima socorrida por populares', 'Outro'];
const LISTA_DESTINO = ['Encaminhada ao suporte avançado', 'Encaminhado ao suporte básico', 'Entregue ao Hospital', 'Recusou atendimento', 'Permaneceu no local'];
const LISTA_HOSPITAIS = ['Hospital da Restauração', 'Hospital Getúlio Vargas', 'UPA', 'Outro'];

const LISTA_STATUS_ASSINATURA = [
  'Assinatura Coletada', 
  'Vítima Recusou-se a Assinar', 
  'Vítima Impossibilitada (Inconsciente/Trauma)', 
  'Vítima Evadiu-se do Local'
];

// --- COMPONENTES AUXILIARES ---
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

const RadioGroup = ({ label, opcoes, selecionado, setSelecionado }: any) => (
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

export default function RelatorioFinalScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RelatorioFinalRouteProp>();
  const { dbId } = route.params || { dbId: 0 };
  
  // Estados Gerais
  const [natureza, setNatureza] = useState('');
  const [grupo, setGrupo] = useState('');
  const [subgrupo, setSubgrupo] = useState('');
  const [situacao, setSituacao] = useState('Atendida');
  const [motivoNaoAtendida, setMotivoNaoAtendida] = useState('');
  const [detalheSemAtuacao, setDetalheSemAtuacao] = useState('');
  const [historico, setHistorico] = useState('');
  const [horaSaidaLocal, setHoraSaidaLocal] = useState(new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}));
  const [chefeGuarnicao, setChefeGuarnicao] = useState('');

  // Estados Vítima
  const [vitimaEnvolvida, setVitimaEnvolvida] = useState('Não');
  const [nomeVitima, setNomeVitima] = useState('');
  const [sexoVitima, setSexoVitima] = useState('');
  const [idadeVitima, setIdadeVitima] = useState('');
  const [classificacaoVitima, setClassificacaoVitima] = useState('');
  const [destinoVitima, setDestinoVitima] = useState('');
  const [tipoHospital, setTipoHospital] = useState('');
  const [hospitalPublico, setHospitalPublico] = useState('');
  const [sofreuAcidente, setSofreuAcidente] = useState('Não');
  const [segurancaVitima, setSegurancaVitima] = useState('');
  const [etnia, setEtnia] = useState('');
  const [lgbt, setLgbt] = useState('');

  // Estado Assinatura
  const [statusAssinatura, setStatusAssinatura] = useState('Assinatura Coletada');
  const [assinaturaBase64, setAssinaturaBase64] = useState<string | null>(null);
  const [modalAssinaturaVisivel, setModalAssinaturaVisivel] = useState(false);
  const refAssinatura = useRef<any>(null);
  const [salvando, setSalvando] = useState(false);

  const handleSignatureOK = (signature: string) => {
    setAssinaturaBase64(signature);
    setModalAssinaturaVisivel(false);
  };
  const handleSignatureEmpty = () => Alert.alert('Atenção', 'Assine antes de confirmar.');
  const handleClearSignature = () => refAssinatura.current.clearSignature();

  // --- CORREÇÃO DA FUNÇÃO HANDLEFINALIZAR ---
  const handleFinalizar = async () => {
    // Validações básicas
    if (!dbId) { Alert.alert("Erro", "Ocorrência não encontrada."); return; }
    if (!natureza || !grupo || !chefeGuarnicao) { Alert.alert("Campos Obrigatórios", "Preencha Natureza, Grupo e Chefe."); return; }

    // O Alert.alert deve ficar fora de qualquer IF para funcionar sempre
    Alert.alert("Confirmar Envio", "Confirma o fechamento desta ocorrência?", [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "FINALIZAR", 
        onPress: async () => {
          setSalvando(true);
          try {
            // Lógica do histórico (adiciona recusa se necessário)
            let historicoFinal = historico;
            if (vitimaEnvolvida === 'Sim' && statusAssinatura !== 'Assinatura Coletada') {
              historicoFinal += `\n[OBS: ${statusAssinatura.toUpperCase()}]`;
            }

            // 1. Atualiza a Ocorrência
            await executeSql(
              `UPDATE ocorrencias SET 
                natureza_final = ?, grupo = ?, subgrupo = ?, situacao_ocorrencia = ?,
                motivo_nao_atendida = ?, detalhe_sem_atuacao = ?, historico_final = ?,
                chefe_guarnicao = ?, hora_saida_local = ?, status = 'FINALIZADO'
               WHERE id = ?;`,
              [natureza, grupo, subgrupo, situacao, motivoNaoAtendida, detalheSemAtuacao, historicoFinal, chefeGuarnicao, horaSaidaLocal, dbId]
            );

            // 2. Insere a Vítima (apenas se houver)
            if (vitimaEnvolvida === 'Sim') {
              // Prepara a assinatura (só salva se foi coletada)
              const assinaturaParaSalvar = (statusAssinatura === 'Assinatura Coletada') ? assinaturaBase64 : null;
              
              await executeSql(
                `INSERT INTO vitimas (
                  ocorrencia_id, nome, sexo, idade, classificacao, 
                  etnia, lgbt, destino, tipo_hospital, nome_hospital, 
                  sofreu_acidente_transito, condicao_seguranca, assinatura_path, status_assinatura
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                [
                  dbId, nomeVitima, sexoVitima, idadeVitima, classificacaoVitima,
                  etnia, lgbt, destinoVitima, tipoHospital, hospitalPublico,
                  sofreuAcidente, segurancaVitima, assinaturaParaSalvar, statusAssinatura
                ]
              );
            }
            Alert.alert("Sucesso", "Ocorrência finalizada!");
            navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
          } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Falha ao salvar.");
          } finally {
            setSalvando(false);
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Feather name="arrow-left" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Relatório Final</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        {/* SEÇÕES 1, 2, 3 */}
        <View style={[styles.sectionCard, { zIndex: 30 }]}>
          <Text style={styles.sectionTitle}>1. Classificação</Text>
          <InputComSugestao label="Natureza" value={natureza} setValue={setNatureza} listaOpcoes={LISTA_NATUREZA} placeholder="Selecione..." zIndexVal={30} />
          <InputComSugestao label="Grupo" value={grupo} setValue={setGrupo} listaOpcoes={LISTA_GRUPO} placeholder="Selecione..." zIndexVal={29} />
          <InputComSugestao label="Subgrupo" value={subgrupo} setValue={setSubgrupo} listaOpcoes={LISTA_SUBGRUPO} placeholder="Selecione..." zIndexVal={28} />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>2. Histórico</Text>
          <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} multiline numberOfLines={4} value={historico} onChangeText={setHistorico} placeholder="Descreva o ocorrido..." />
        </View>

        <View style={[styles.sectionCard, { zIndex: 20 }]}>
          <Text style={styles.sectionTitle}>3. Situação</Text>
          <RadioGroup label="Situação" opcoes={LISTA_SITUACAO} selecionado={situacao} setSelecionado={setSituacao} />
          {situacao === 'Não Atendida' && <RadioGroup label="Motivo" opcoes={LISTA_NAO_ATENDIDA} selecionado={motivoNaoAtendida} setSelecionado={setMotivoNaoAtendida} />}
          {motivoNaoAtendida === 'Sem atuação/Motivo' && <InputComSugestao label="Detalhe" value={detalheSemAtuacao} setValue={setDetalheSemAtuacao} listaOpcoes={LISTA_SEM_ATUACAO} placeholder="Selecione..." zIndexVal={20} />}
          <View style={styles.inputGroup}><Text style={styles.label}>Saída do Local</Text><TextInput style={styles.input} value={horaSaidaLocal} onChangeText={setHoraSaidaLocal} /></View>
        </View>

        {/* SEÇÃO 4: VÍTIMA E ASSINATURA */}
        <View style={[styles.sectionCard, { zIndex: 10 }]}>
          <Text style={styles.sectionTitle}>4. Dados da Vítima</Text>
          <RadioGroup label="Vítima Envolvida?" opcoes={['Sim', 'Não']} selecionado={vitimaEnvolvida} setSelecionado={setVitimaEnvolvida} />

          {vitimaEnvolvida === 'Sim' && (
            <>
              <View style={styles.inputGroup}><Text style={styles.label}>Nome</Text><TextInput style={styles.input} value={nomeVitima} onChangeText={setNomeVitima} /></View>
              <RadioGroup label="Sexo" opcoes={['M', 'F']} selecionado={sexoVitima} setSelecionado={setSexoVitima} />
              <View style={styles.inputGroup}><Text style={styles.label}>Idade</Text><TextInput style={styles.input} value={idadeVitima} onChangeText={setIdadeVitima} keyboardType="numeric" /></View>
              <InputComSugestao label="Destino" value={destinoVitima} setValue={setDestinoVitima} listaOpcoes={LISTA_DESTINO} placeholder="Selecione..." zIndexVal={15} />

              {destinoVitima === 'Entregue ao Hospital' && (
                <>
                  <RadioGroup label="Tipo de Hospital" opcoes={['Hospital particular', 'Hospital público estadual', 'UPA', 'UPAE']} selecionado={tipoHospital} setSelecionado={setTipoHospital} />
                  {['Hospital público estadual', 'UPA', 'UPAE'].includes(tipoHospital) && <InputComSugestao label="Nome Hospital" value={hospitalPublico} setValue={setHospitalPublico} listaOpcoes={LISTA_HOSPITAIS} placeholder="Selecione..." zIndexVal={14} />}
                </>
              )}

              {/* ÁREA DE ASSINATURA */}
              <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }}>
                <Text style={styles.sectionTitle}>Validação da Vítima</Text>
                
                <InputComSugestao 
                  label="Situação da Assinatura" 
                  value={statusAssinatura} 
                  setValue={setStatusAssinatura} 
                  listaOpcoes={LISTA_STATUS_ASSINATURA} 
                  placeholder="Selecione..." 
                  zIndexVal={12}
                />

                {statusAssinatura === 'Assinatura Coletada' && (
                  <View style={{marginTop: 10}}>
                    {assinaturaBase64 ? (
                      <View style={{ alignItems: 'center', marginBottom: 10 }}>
                        <Image source={{ uri: assinaturaBase64 }} style={{ width: '100%', height: 150, resizeMode: 'contain', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc' }} />
                        <TouchableOpacity onPress={() => setAssinaturaBase64(null)} style={{ marginTop: 10 }}>
                          <Text style={{ color: 'red', fontWeight: 'bold' }}>Remover Assinatura</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={{ backgroundColor: '#1976D2', padding: 12, borderRadius: 8, alignItems: 'center' }}
                        onPress={() => setModalAssinaturaVisivel(true)}
                      >
                        <Feather name="pen-tool" size={20} color="#fff" />
                        <Text style={{ color: '#fff', fontWeight: 'bold', marginTop: 5 }}>COLETAR ASSINATURA</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </>
          )}
        </View>

        {/* SEÇÃO 5: RESPONSÁVEL */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>5. Responsável</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chefe da Guarnição</Text>
            <TextInput style={styles.input} value={chefeGuarnicao} onChangeText={setChefeGuarnicao} placeholder="Nome do Responsável" />
          </View>
        </View>

        <TouchableOpacity style={[styles.submitButton, salvando && { opacity: 0.7 }]} onPress={handleFinalizar} disabled={salvando}>
          <Text style={styles.submitButtonText}>{salvando ? 'ENVIANDO...' : 'ENVIAR RELATÓRIO FINAL'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL DE ASSINATURA */}
      <Modal visible={modalAssinaturaVisivel} animationType="slide" onRequestClose={() => setModalAssinaturaVisivel(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Assinar na Tela</Text>
            <TouchableOpacity onPress={() => setModalAssinaturaVisivel(false)}><Feather name="x" size={24} color="#333" /></TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <SignatureScreen ref={refAssinatura} onOK={handleSignatureOK} onEmpty={handleSignatureEmpty} descriptionText="Assine acima" clearText="Limpar" confirmText="Confirmar" webStyle={`.m-signature-pad--footer {display: none; margin: 0px;}`} />
          </View>
          <View style={{ flexDirection: 'row', padding: 20, justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={handleClearSignature} style={{ padding: 15, backgroundColor: '#eee', borderRadius: 8, flex: 1, marginRight: 10, alignItems: 'center' }}><Text style={{ fontWeight: 'bold' }}>Limpar</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => refAssinatura.current.readSignature()} style={{ padding: 15, backgroundColor: '#2E7D32', borderRadius: 8, flex: 1, marginLeft: 10, alignItems: 'center' }}><Text style={{ color: '#fff', fontWeight: 'bold' }}>CONFIRMAR</Text></TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
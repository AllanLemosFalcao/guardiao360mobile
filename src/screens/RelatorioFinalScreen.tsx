import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { styles } from './RelatorioFinalScreen.styles';

// --- LISTAS DE DADOS (Extraídos do seu pedido) ---
const LISTA_NATUREZA = ['APH', 'Atividade Comunitária', 'Incêndio', 'Prevenção', 'Produtos Perigosos', 'Salvamento'];

const LISTA_GRUPO = [
  'Acidente de Trânsito Atropelamento', 'Acidente de Transito Capotamento', 'Acidente de Transito Choque', 
  'Acidente de transito colisão abalroamento', 'Acidentes diversos', 'APH Diversos', 'Apoio em operações', 
  'Apoio social', 'Atividade comunitária diversa', 'Derramamento', 'Diversos', 'Emergência cardíaca', 
  'Emergencia clinicas diversas', 'Evento com Animal', 'Evento com Árvore', 'Evento com meio de transporte', 
  'Evento com pessoa', 'Evento esportivo', 'Evento festivo', 'Explosão', 'Incendio', 'Incendio em área de descarte', 
  'Incendio em edificação comercial', 'Incendio em edificação concentração de publico', 'Incendio em edificação depósito', 
  'Incêndio em edificação escolar', 'Inciencio em edificação especial', 'Incêndio em edificação hospitalar', 
  'Incêndio em edificação industrial', 'Incêndio em edificação outros', 'Incendio em edificação residencial', 
  'Incêndio em edificação transitória', 'Incendio em meio de transporte terrestre', 'Incêndio em vegetação', 
  'Incêndio em via publica', 'Incêndios diversos', 'Interação educativa', 'Prevenção aquática', 'Prevenção diversos', 
  'Queda', 'Queimadura elétrica/choque', 'Salvamento diverso', 'Trauma por objeto contundente', 
  'Trauma por objeto perfuro cortante', 'Trem de socorro', 'Vazamento', 'Vítima de agressão'
];

const LISTA_SUBGRUPO = [
  'Abastecimento de Água', 'Açougue, Frigorífico, Matadouro ou Similar', 'Afogamento', 'Agência Bancária', 
  'Agência de Câmbio ou Similar', 'Aglomerado Subnormal Favela', 'Alimentícia', 'Apoio à Instituição', 
  'Arborização Pública', 'Arma de Fogo', 'Armazém, Galpão ou Similar', 'Ativa e Reativa (Orientação ao Banhista)', 
  'Ativação de Posto com Embarcação', 'Ativação de Posto com Viatura', 'Auto Passeio', 'Auto Passeio x Auto Passeio', 
  'Auto Passeio x Bicicleta', 'Auto Passeio x Motocicleta', 'Banho de Neblina', 'Bar, Lanchonete ou Similar', 
  'Barbearia, Salão de Beleza ou Similar', 'Bicicleta', 'Borracha, Pneu ou Similar', 'Caatinga', 'Caminhão', 
  'Canino Cão', 'Canteiro de Obras', 'Carnavalesco', 'Carroça', 'Cinema', 'Coletivo Pensionato', 
  'Composição de Comboios de Veículos', 'Convulsão', 'Copiadora, Reprografia ou Similar', 'Creche', 
  'Crise Hipertensiva', 'Desfile Cívico-Militar', 'Desmaio /Síncope', 'Destilaria, Refinaria ou Similar', 
  'Diverso', 'Diversos', 'Eletrodoméstico ou Similar', 'Engasgo', 'Ensino Fundamental ou Médio', 'Ensino Superior', 
  'Equino', 'Escritório', 'Estação de Tratamento ou Distribuição de Água', 'Estação ou Subestação de Distribuição de Energia Elétrica', 
  'Estacionamento, Garagem ou Similar', 'Estádio de Futebol', 'Exercício Simulado', 'Exposição', 
  'Fábrica ou Revenda de Fogos de Artifício ou Artefato Explosivo', 'Farmácia, Perfumaria ou Similar', 'Felino Gato', 
  'Fiação Elétrica de Poste', 'Fios Energizados de Postes', 'Galeria', 'Gás Liquefeito de Petróleo', 
  'Gás Natural / Gás Natural Veicular', 'Gases', 'Hospital', 'Hotel ou Apart Hotel', 'Igreja, Templo ou Similar', 
  'Inseto Abelha', 'Jardim', 'Junino', 'Laboratório', 'Lavagem de Pista', 'Líquidos Inflamáveis', 'Líquidos não Inflamáveis', 
  'Lixão', 'Local Especial para Tratamento e Reciclagem', 'Loja de Departamentos', 'Madeira, Móveis ou Similar', 
  'Madeireira', 'Mangue', 'Máquina Agrícola', 'Mata ou Floresta Nativa', 'Mato', 'Mercado', 'Metal Qualquer', 
  'Metalúrgica', 'Metrô', 'Monturo', 'Moto', 'Motocicleta', 'Motocicleta x Motocicleta', 
  'Motocicleta x Ônibus ou Micro-Ônibus', 'Motocicleta x Veículo de Carga Perigosa', 'Multifamiliar Casas Conjugadas', 
  'Multifamiliar Edificação Elevada', 'Não Identificado', 'Oficina', 'Ônibus ou Micro-Ônibus', 'Outro', 'Outros Gases', 
  'Padaria ou Similar', 'Palestra', 'Papel, Livros ou Similar', 'Parada Cardiorrespiratória', 
  'Pessoa em Local de Difícil Acesso (Trilha/Montanha/Caverna)', 'Plástico ou Similar', 'Policlínica, Clínica ou Similar', 
  'Pousada', 'Pouso e Decolagem', 'Prédio Público', 'Prevenção em Instrução', 'Prevenção em Orla Marítima', 
  'Problemas Cardíacos', 'Protesto', 'Quartel Da Polícia, Bombeiro, Forças Armadas ou Afim', 'Queda', 
  'Queda da Própria Altura', 'Queda de Árvore em Via Pública', 'Queda de Árvore sobre Imóveis', 'Queda de Moto', 
  'Queda de Nível Abaixo de 2M', 'Queda de Nível Acima de 2M', 'Química', 'Resgate Aquático', 'Restaurante', 
  'Retirada de Anel ou Similar', 'Reunião de Público', 'Semana Santa', 'Substâncias Explosivas', 'Substâncias Tóxicas', 
  'Supermercado', 'Táxi', 'Tentativa de Suicídio', 'Terreno Baldio, Lote Vago ou Similar', 'Têxtil', 
  'Transporte de bem ou Produto', 'Transporte de Vítima', 'Unifamiliar Casa Residência', 'Van ou Similar', 
  'Veículo de Carga Não Perigosa', 'Veículo de Carga Perigosa'
];

const LISTA_SITUACAO = ['Atendida', 'Não Atendida'];
const LISTA_NAO_ATENDIDA = ['Cancelada', 'Sem atuação/Motivo', 'Trote'];
const LISTA_SEM_ATUACAO = [
  'Não se aplica', 'Recusou atendimento', 'Situação já solucionada', 
  'Vítima socorrida pelo SAMU', 'Vítima socorrida por populares', 'Outro'
];

const LISTA_DESTINO = [
  'Encaminhada ao suporte avançado', 'Encaminhado ao suporte aeromédico', 
  'Encaminhado ao suporte básico', 'Entregue ao Hospital', 
  'Permaneceu no local após atendimento', 'Recusou atendimento'
];

const LISTA_HOSPITAIS = [
  'Hospital da restauração', 'Hospital Hapvida', 'Hospital Metropolitano Sul - Dom Helder Câmara', 
  'Hospital Real Português', 'Hospital São Lucas', 'UPA Barra de Jangada - Senador Wilson Campos', 
  'UPA Ibura - Pediatra Zilda Arns', 'UPA Imbiribeira - Maria Esther Souto Carvalho', 'Outro'
];

// --- COMPONENTE: INPUT COM SUGESTÃO (AUTOCOMPLETE) ---
const InputComSugestao = ({ label, value, setValue, listaOpcoes, placeholder, zIndexVal = 1 }: any) => {
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  
  // Filtra. Se vazio, mostra todos.
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
        // Delay para permitir o clique
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

// --- COMPONENTE: RADIO BUTTON GROUP ---
const RadioGroup = ({ label, opcoes, selecionado, setSelecionado }: any) => (
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

export default function RelatorioFinalScreen() {
  const navigation = useNavigation();
  
  // --- ESTADOS: CLASSIFICAÇÃO ---
  const [natureza, setNatureza] = useState('');
  const [grupo, setGrupo] = useState('');
  const [subgrupo, setSubgrupo] = useState('');
  
  const [situacao, setSituacao] = useState('Atendida'); // Atendida ou Não
  const [motivoNaoAtendida, setMotivoNaoAtendida] = useState('');
  const [detalheSemAtuacao, setDetalheSemAtuacao] = useState('');
  
  const [horaSaidaLocal, setHoraSaidaLocal] = useState(new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}));

  // --- ESTADOS: VÍTIMA ---
  const [vitimaEnvolvida, setVitimaEnvolvida] = useState('Não');
  const [nomeVitima, setNomeVitima] = useState('');
  const [sexoVitima, setSexoVitima] = useState('');
  const [idadeVitima, setIdadeVitima] = useState('');
  const [classificacaoVitima, setClassificacaoVitima] = useState(''); // Fatal, Ferida...
  const [destinoVitima, setDestinoVitima] = useState('');
  const [tipoHospital, setTipoHospital] = useState('');
  const [hospitalPublico, setHospitalPublico] = useState('');
  
  const [sofreuAcidente, setSofreuAcidente] = useState('Não');
  const [segurancaVitima, setSegurancaVitima] = useState('');
  const [etnia, setEtnia] = useState('');
  const [lgbt, setLgbt] = useState('');

  // --- ESTADOS: CHEFIA ---
  const [chefeGuarnicao, setChefeGuarnicao] = useState('');

  // --- FUNÇÃO FINALIZAR ---
  const handleFinalizar = () => {
    // Validação básica
    if (!natureza || !grupo || !chefeGuarnicao) {
      Alert.alert("Campos Obrigatórios", "Preencha Natureza, Grupo e Chefe da Guarnição.");
      return;
    }

    Alert.alert(
      "Confirmar Envio",
      "Confirma o fechamento desta ocorrência? Os dados não poderão ser editados depois.",
      [
        { text: "Revisar", style: "cancel" },
        { 
          text: "ENVIAR RELATÓRIO", 
          onPress: () => {
            Alert.alert("Sucesso", "Ocorrência finalizada e enviada ao sistema!");
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' as never }],
            });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatório Final (Etapa 4)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        {/* === SEÇÃO 1: CLASSIFICAÇÃO === */}
        <View style={[styles.sectionCard, { zIndex: 30 }]}>
          <Text style={styles.sectionTitle}>1. Classificação da Ocorrência</Text>
          
          <InputComSugestao 
            label="Natureza" value={natureza} setValue={setNatureza} 
            listaOpcoes={LISTA_NATUREZA} placeholder="Selecione..." zIndexVal={30}
          />
          <InputComSugestao 
            label="Grupo" value={grupo} setValue={setGrupo} 
            listaOpcoes={LISTA_GRUPO} placeholder="Selecione..." zIndexVal={29}
          />
          <InputComSugestao 
            label="Subgrupo" value={subgrupo} setValue={setSubgrupo} 
            listaOpcoes={LISTA_SUBGRUPO} placeholder="Selecione..." zIndexVal={28}
          />
        </View>

        {/* === SEÇÃO 2: SITUAÇÃO === */}
        <View style={[styles.sectionCard, { zIndex: 20 }]}>
          <Text style={styles.sectionTitle}>2. Situação do Atendimento</Text>
          
          <RadioGroup 
            label="Situação da Ocorrência" 
            opcoes={LISTA_SITUACAO} 
            selecionado={situacao} setSelecionado={setSituacao} 
          />

          {/* Condicional: Se NÃO ATENDIDA */}
          {situacao === 'Não Atendida' && (
            <RadioGroup 
              label="Motivo Não Atendida" 
              opcoes={LISTA_NAO_ATENDIDA} 
              selecionado={motivoNaoAtendida} setSelecionado={setMotivoNaoAtendida} 
            />
          )}

          {/* Condicional: Se SEM ATUAÇÃO */}
          {motivoNaoAtendida === 'Sem atuação/Motivo' && (
            <InputComSugestao 
              label="Detalhe Sem Atuação" value={detalheSemAtuacao} setValue={setDetalheSemAtuacao} 
              listaOpcoes={LISTA_SEM_ATUACAO} placeholder="Selecione..." zIndexVal={20}
            />
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Horário de Saída do Local</Text>
            <TextInput 
              style={styles.input} 
              value={horaSaidaLocal} 
              onChangeText={setHoraSaidaLocal}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>

        {/* === SEÇÃO 3: VÍTIMA (Condicional) === */}
        <View style={[styles.sectionCard, { zIndex: 10 }]}>
          <Text style={styles.sectionTitle}>3. Dados da Vítima</Text>
          
          <RadioGroup 
            label="Vítima Envolvida?" 
            opcoes={['Sim', 'Não']} 
            selecionado={vitimaEnvolvida} setSelecionado={setVitimaEnvolvida} 
          />

          {vitimaEnvolvida === 'Sim' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome da Vítima</Text>
                <TextInput style={styles.input} value={nomeVitima} onChangeText={setNomeVitima} />
              </View>

              <RadioGroup label="Sexo" opcoes={['M', 'F', 'Não identificado']} selecionado={sexoVitima} setSelecionado={setSexoVitima} />
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Idade</Text>
                <TextInput style={styles.input} value={idadeVitima} onChangeText={setIdadeVitima} keyboardType="numeric" />
              </View>

              <RadioGroup label="Classificação" opcoes={['Fatal', 'Ferida', 'Ilesa']} selecionado={classificacaoVitima} setSelecionado={setClassificacaoVitima} />
              <RadioGroup label="Etnia" opcoes={['Branca', 'Negra', 'Parda']} selecionado={etnia} setSelecionado={setEtnia} />
              <RadioGroup label="Identifica-se LGBTQIA+?" opcoes={['Sim', 'Não', 'Prefere não responder']} selecionado={lgbt} setSelecionado={setLgbt} />

              <InputComSugestao 
                label="Destino da Vítima" value={destinoVitima} setValue={setDestinoVitima} 
                listaOpcoes={LISTA_DESTINO} placeholder="Selecione..." zIndexVal={15}
              />

              {/* Se foi para Hospital */}
              {destinoVitima === 'Entregue ao Hospital' && (
                <>
                  <RadioGroup label="Tipo de Hospital" opcoes={['Hospital particular', 'Hospital público estadual', 'UPA', 'UPAE']} selecionado={tipoHospital} setSelecionado={setTipoHospital} />
                  
                  {(tipoHospital === 'Hospital público estadual' || tipoHospital === 'UPA' || tipoHospital === 'UPAE') && (
                    <InputComSugestao 
                      label="Nome do Hospital Público" value={hospitalPublico} setValue={setHospitalPublico} 
                      listaOpcoes={LISTA_HOSPITAIS} placeholder="Selecione..." zIndexVal={14}
                    />
                  )}
                </>
              )}

              <RadioGroup label="Sofreu acidente de trânsito?" opcoes={['Sim', 'Não']} selecionado={sofreuAcidente} setSelecionado={setSofreuAcidente} />
              
              {sofreuAcidente === 'Sim' && (
                <RadioGroup 
                  label="Condição de Segurança" 
                  opcoes={['Com airbag', 'Com capacete', 'Com cinto de segurança', 'Sem capacete', 'Não se aplica', 'Outro']} 
                  selecionado={segurancaVitima} setSelecionado={setSegurancaVitima} 
                />
              )}
            </>
          )}
        </View>

        {/* === SEÇÃO 4: RESPONSÁVEL === */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>4. Responsável</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chefe da Guarnição (Nome/Matrícula)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Digite o nome"
              value={chefeGuarnicao}
              onChangeText={setChefeGuarnicao}
            />
          </View>
        </View>

        {/* --- BOTÃO FINAL --- */}
        <TouchableOpacity style={styles.submitButton} onPress={handleFinalizar}>
          <Text style={styles.submitButtonText}>ENVIAR RELATÓRIO FINAL</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
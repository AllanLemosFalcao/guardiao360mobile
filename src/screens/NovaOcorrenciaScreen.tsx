import React, { useState, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, SafeAreaView, FlatList, Modal, Platform 
} from 'react-native'; // Removido StyleSheet daqui
import { useNavigation } from '@react-navigation/native';
import { naturezasCBMPE } from '../data/naturezas'; 

// IMPORTAÇÃO DOS ESTILOS SEPARADOS
import { styles } from './NovaOcorrenciaScreen.styles';

// --- Carregamento Condicional da Assinatura ---
let SignatureScreen: any = null;
if (Platform.OS !== 'web') {
  try {
    SignatureScreen = require('react-native-signature-canvas').default;
  } catch (err) {
    console.warn("Erro ao carregar biblioteca de assinatura:", err);
  }
}

type OcorrenciaFormData = {
  pontoBase: string; ome: string; viatura: string; numeroAviso: string;
  dataRecebimento: string; horaRecebimento: string; formaAcionamento: string;
  situacao: string; endereco: string; municipio: string; bairro: string; latitude: string; longitude: string;
  natureza: string; codigoNatureza: string; descricaoInicial: string;
  assinaturaBase64: string | null;
};

export default function NovaOcorrenciaScreen() {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(1);
  const [showNaturezaList, setShowNaturezaList] = useState(false);
  const [filtroNatureza, setFiltroNatureza] = useState('');
  const signatureRef = useRef<any>(null);

  const [formData, setFormData] = useState<OcorrenciaFormData>({
    pontoBase: '', ome: '', viatura: '', numeroAviso: '',
    dataRecebimento: new Date().toLocaleDateString('pt-BR'),
    horaRecebimento: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'}),
    formaAcionamento: '193', situacao: 'Despachada', 
    endereco: '', municipio: 'Recife', bairro: '', latitude: '', longitude: '',
    natureza: '', codigoNatureza: '', descricaoInicial: '', assinaturaBase64: null
  });

  const updateField = (field: keyof OcorrenciaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selecionarNatureza = (item: typeof naturezasCBMPE[0]) => {
    updateField('natureza', item.descricao);
    updateField('codigoNatureza', item.codigo);
    setShowNaturezaList(false);
    setFiltroNatureza('');
  };

  const handleSignatureOK = (signature: string) => {
    updateField('assinaturaBase64', signature);
    Alert.alert("Sucesso", "Assinatura capturada!");
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigation.goBack();
  };

  const handleSubmit = () => {
    if (!formData.assinaturaBase64 && SignatureScreen) {
      Alert.alert("Atenção", "A assinatura é obrigatória.");
      return;
    }
    console.log("DADOS FINAIS:", formData);
    Alert.alert("Sucesso", "Ocorrência salva!");
    navigation.navigate('Home');
  };

  const listaFiltrada = naturezasCBMPE.filter(item => 
    item.descricao.toLowerCase().includes(filtroNatureza.toLowerCase()) || item.codigo.includes(filtroNatureza)
  );

  const renderStep1 = () => (
    <View>
      <Text style={styles.sectionTitle}>1. Dados do Acionamento</Text>
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.label}>Ponto Base / OME</Text>
          <TextInput style={styles.input} placeholder="Ex: GBI" value={formData.pontoBase} onChangeText={t => updateField('pontoBase', t)} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Nº Aviso</Text>
          <TextInput style={styles.input} placeholder="000123" keyboardType="numeric" value={formData.numeroAviso} onChangeText={t => updateField('numeroAviso', t)} />
        </View>
      </View>
      <Text style={styles.label}>Viatura Responsável</Text>
      <TextInput style={styles.input} placeholder="Ex: ABT-34" value={formData.viatura} onChangeText={t => updateField('viatura', t)} />
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.sectionTitle}>2. Localização</Text>
      <Text style={styles.label}>Endereço Completo</Text>
      <TextInput style={styles.input} placeholder="Rua, Número..." value={formData.endereco} onChangeText={t => updateField('endereco', t)} />
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.label}>Bairro</Text>
          <TextInput style={styles.input} value={formData.bairro} onChangeText={t => updateField('bairro', t)} />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.sectionTitle}>3. Classificação</Text>
      <Text style={styles.label}>Natureza</Text>
      <TouchableOpacity style={styles.inputSelect} onPress={() => setShowNaturezaList(true)}>
        <Text style={{ color: formData.natureza ? '#000' : '#999' }}>{formData.natureza || 'Toque para pesquisar...'}</Text>
      </TouchableOpacity>
      
      <Modal visible={showNaturezaList} animationType="slide">
        <SafeAreaView style={{flex: 1}}>
          <View style={styles.modalHeader}>
            <TextInput style={styles.searchInput} placeholder="Buscar..." value={filtroNatureza} onChangeText={setFiltroNatureza} autoFocus />
            <TouchableOpacity onPress={() => setShowNaturezaList(false)}><Text style={{color: 'red'}}>Fechar</Text></TouchableOpacity>
          </View>
          <FlatList 
            data={listaFiltrada} 
            keyExtractor={item => item.codigo} 
            renderItem={({item}) => (
              <TouchableOpacity style={styles.itemLista} onPress={() => selecionarNatureza(item)}>
                <Text style={{fontWeight: 'bold'}}>{item.tipo}</Text>
                <Text>{item.descricao}</Text>
              </TouchableOpacity>
            )} 
          />
        </SafeAreaView>
      </Modal>
    </View>
  );

  const renderStep4 = () => (
    <View style={{flex: 1}}>
      <Text style={styles.sectionTitle}>4. Assinatura</Text>
      
      <View style={styles.signatureBox}>
        {SignatureScreen ? (
          <SignatureScreen
            ref={signatureRef}
            onOK={handleSignatureOK}
            webStyle={`.m-signature-pad--footer {display: none; margin: 0px;}`} 
          />
        ) : (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{textAlign: 'center', color: '#666'}}>
              {Platform.OS === 'web' ? 'Assinatura não suportada no Navegador (Web).' : 'Biblioteca de assinatura não carregada.'}
            </Text>
            
            <TouchableOpacity 
                style={{marginTop: 20, padding: 10, backgroundColor: '#eee', borderRadius: 5}}
                onPress={() => updateField('assinaturaBase64', 'assinatura_fake_web')}
            >
                <Text>Simular Assinatura (Teste Web)</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {SignatureScreen && (
        <View style={styles.signatureButtons}>
            <TouchableOpacity style={styles.smallBtn} onPress={() => signatureRef.current?.clearSignature()}><Text>Limpar</Text></TouchableOpacity>
            <TouchableOpacity style={styles.smallBtnConfirm} onPress={() => signatureRef.current?.readSignature()}><Text style={{color: '#fff'}}>Confirmar</Text></TouchableOpacity>
        </View>
      )}

      {formData.assinaturaBase64 && <Text style={{color: 'green', textAlign: 'center', marginTop: 10}}>✅ Assinada</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Novo Registro</Text></View>
      <ScrollView contentContainerStyle={styles.content}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnSecondary} onPress={handleBack}><Text>Voltar</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleNext}><Text style={{color: '#fff'}}>Continuar</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
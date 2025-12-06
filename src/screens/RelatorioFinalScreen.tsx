import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert,
  Switch
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './RelatorioFinalScreen.styles';

export default function RelatorioFinalScreen() {
  const navigation = useNavigation();
  
  // --- ESTADOS DO FORMULÁRIO ---
  // Campo 14: Natureza Final (Manual Pág 26)
  const [naturezaFinal, setNaturezaFinal] = useState(''); 
  const [codCGO, setCodCGO] = useState(''); // Código Geral da Ocorrência

  // Campo 11: Histórico (Manual Pág 26)
  const [historico, setHistorico] = useState('');

  // Campo 16: Vítimas (Manual Pág 26)
  const [vitimasIlesas, setVitimasIlesas] = useState('0');
  const [vitimasFeridas, setVitimasFeridas] = useState('0');
  const [vitimasFatais, setVitimasFatais] = useState('0');

  // Campo 15: Formulários Específicos (Manual Pág 26)
  // Isso define se o app vai exigir mais dados depois
  const [houveIncendio, setHouveIncendio] = useState(false);
  const [houveAPH, setHouveAPH] = useState(false);
  const [houveSalvamento, setHouveSalvamento] = useState(false);

  // --- FUNÇÃO DE ENVIO ---
  const handleFinalizar = () => {
    // 1. Validação do Histórico (Obrigatório segundo manual)
    if (historico.length < 10) {
      Alert.alert("Erro", "O histórico da ocorrência é obrigatório e deve ser detalhado.");
      return;
    }

    // 2. Lógica de Encerramento
    Alert.alert(
      "Confirmar Envio",
      "Deseja encerrar o relatório e sincronizar os dados?",
      [
        { text: "Revisar", style: "cancel" },
        { 
          text: "ENVIAR RELATÓRIO", 
          onPress: () => {
            // Aqui enviaria para o Back-end
            console.log("Dados Salvos:", { naturezaFinal, historico, vitimas: { vitimasIlesas, vitimasFeridas, vitimasFatais } });
            
            Alert.alert("Sucesso", "Ocorrência finalizada e arquivada com sucesso!");
            
            // Retorna para a tela de Ocorrências (Home) resetando a pilha
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
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatório Final (Etapa 4)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* --- SEÇÃO 1: CLASSIFICAÇÃO (Campo 14 Manual) --- */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Classificação Final</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Natureza do Atendimento (Real)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: Incêndio em Edificação Comercial"
              value={naturezaFinal}
              onChangeText={setNaturezaFinal}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Código CGO (Opcional)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: 2.3.1"
              value={codCGO}
              onChangeText={setCodCGO}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* --- SEÇÃO 2: HISTÓRICO (Campo 11 Manual) --- */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>2. Histórico da Ocorrência</Text>
          <Text style={{fontSize:12, color:'#666', marginBottom:8}}>
            Descreva detalhadamente as ações realizadas, meios empregados e situação final.
          </Text>
          
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Relate aqui o histórico..."
            value={historico}
            onChangeText={setHistorico}
            multiline={true}
            numberOfLines={6}
          />
        </View>

        {/* --- SEÇÃO 3: ESTATÍSTICAS (Campo 16 Manual) --- */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>3. Dados de Vítimas</Text>
          <View style={styles.row}>
            <View style={styles.counterContainer}>
              <Text style={styles.label}>Ilesas</Text>
              <TextInput 
                style={styles.counterInput} 
                value={vitimasIlesas} 
                onChangeText={setVitimasIlesas}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.counterContainer}>
              <Text style={[styles.label, {color: '#F57C00'}]}>Feridas</Text>
              <TextInput 
                style={[styles.counterInput, {borderColor: '#F57C00'}]} 
                value={vitimasFeridas} 
                onChangeText={setVitimasFeridas}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.counterContainer}>
              <Text style={[styles.label, {color: '#D32F2F'}]}>Fatais</Text>
              <TextInput 
                style={[styles.counterInput, {borderColor: '#D32F2F'}]} 
                value={vitimasFatais} 
                onChangeText={setVitimasFatais}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* --- SEÇÃO 4: FORMULÁRIOS ESPECÍFICOS (Campo 15 Manual) --- */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>4. Formulários Adicionais</Text>
          <Text style={{fontSize:12, color:'#666', marginBottom:12}}>
            Selecione quais atividades foram desempenhadas para anexar os formulários específicos.
          </Text>

          {/* Toggle Incêndio */}
          <TouchableOpacity 
            style={[styles.checkboxContainer, houveIncendio && styles.checkboxActive]}
            onPress={() => setHouveIncendio(!houveIncendio)}
          >
            <MaterialCommunityIcons 
              name={houveIncendio ? "checkbox-marked" : "checkbox-blank-outline"} 
              size={24} 
              color={houveIncendio ? "#1976D2" : "#666"} 
            />
            <Text style={styles.checkboxLabel}>Houve Combate a Incêndio?</Text>
          </TouchableOpacity>

          {/* Toggle APH */}
          <TouchableOpacity 
            style={[styles.checkboxContainer, houveAPH && styles.checkboxActive]}
            onPress={() => setHouveAPH(!houveAPH)}
          >
            <MaterialCommunityIcons 
              name={houveAPH ? "checkbox-marked" : "checkbox-blank-outline"} 
              size={24} 
              color={houveAPH ? "#1976D2" : "#666"} 
            />
            <Text style={styles.checkboxLabel}>Houve APH (Vítimas)?</Text>
          </TouchableOpacity>

          {/* Toggle Salvamento */}
          <TouchableOpacity 
            style={[styles.checkboxContainer, houveSalvamento && styles.checkboxActive]}
            onPress={() => setHouveSalvamento(!houveSalvamento)}
          >
            <MaterialCommunityIcons 
              name={houveSalvamento ? "checkbox-marked" : "checkbox-blank-outline"} 
              size={24} 
              color={houveSalvamento ? "#1976D2" : "#666"} 
            />
            <Text style={styles.checkboxLabel}>Houve Salvamento/Busca?</Text>
          </TouchableOpacity>
        </View>

        {/* --- BOTÃO DE AÇÃO --- */}
        <TouchableOpacity style={styles.submitButton} onPress={handleFinalizar}>
          <Text style={styles.submitButtonText}>ENVIAR E FINALIZAR</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, Alert 
} from 'react-native'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

// IMPORTAÇÃO DOS ESTILOS
import { styles } from './LoginScreen.styles'; 

type LoginScreenProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenProp>();
  
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');

  const handleLogin = () => {
    if (email && senha) {
      // --- CORREÇÃO DE NAVEGAÇÃO ---
      // Agora navegamos para o "MainTabs" (o container das abas).
      // Usamos essa estrutura para passar dados para a tela específica dentro das abas.
      navigation.replace('MainTabs', {
        screen: 'HomeTab', 
        params: { userId: 1, perfil: 'Admin' }
      } as any); 
      // O "as any" evita erros chatos de tipagem aninhada do TypeScript por enquanto
      
    } else {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos para entrar.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
           <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        
        <Image 
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Bras%C3%A3o_do_Corpo_de_Bombeiros_Militar_de_Pernambuco.png' }} 
          style={styles.logo} 
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Entrar na conta</Text>

        <Text style={styles.label}>CPF ou Email</Text>
        <TextInput
          style={styles.input}
          placeholder="000.000.000-00"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Insira sua senha"
          placeholderTextColor="#999"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotButton}>
          <Text style={styles.forgotText}>Esqueci a senha</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
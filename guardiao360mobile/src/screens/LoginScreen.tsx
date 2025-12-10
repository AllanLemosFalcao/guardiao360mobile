import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, Alert, ActivityIndicator 
} from 'react-native'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
// REMOVIDO: import AsyncStorage... (O AuthService cuida disso agora)

import { RootStackParamList } from '../../App';
import { styles } from './LoginScreen.styles'; 
import { AuthService } from '../services/auth'; 

type LoginScreenProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenProp>();
  
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha email e senha.');
      return;
    }

    setCarregando(true);

    try {
      // O AuthService já salva o token internamente agora
      const dadosLogin = await AuthService.login(email, senha);
      
      console.log("✅ Login Sucesso:", dadosLogin.user.nome);

      navigation.replace('MainTabs', {
        screen: 'HomeTab', 
        params: { userId: dadosLogin.user.id, perfil: dadosLogin.user.perfil }
      } as any);

    } catch (error: any) {
      const msg = error.error || 'Falha ao conectar. Verifique o IP na api.ts';
      Alert.alert('Erro', msg);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{width:24}}/>
        <Image 
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Bras%C3%A3o_do_Corpo_de_Bombeiros_Militar_de_Pernambuco.png' }} 
          style={styles.logo} resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Entrar na conta</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput 
            style={styles.input} 
            placeholder="Email" 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none" 
            keyboardType="email-address"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput 
            style={styles.input} 
            placeholder="Senha" 
            value={senha} 
            onChangeText={setSenha} 
            secureTextEntry
        />

        <TouchableOpacity style={[styles.button, carregando && {opacity:0.7}]} onPress={handleLogin} disabled={carregando}>
          {carregando ? <ActivityIndicator color="#FFF"/> : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>
        
        <Text style={{textAlign:'center', marginTop:20, color:'#ccc', fontSize:10}}>
          Dica: admin@bombeiros.pe.gov.br / 123
        </Text>
      </View>
    </SafeAreaView>
  );
}